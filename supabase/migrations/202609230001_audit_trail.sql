-- Operational timestamps and an append-only, staff-readable audit trail.
-- Apply after 202609220003_guest_reservations.sql. Existing rows cannot be
-- given their original creation time if the earlier schema did not store it.
begin;

alter table public.rental_models
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now();
alter table public.rental_units
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now();
alter table public.rental_billing_settings
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now();
alter table public.rental_profiles add column updated_at timestamptz;
update public.rental_profiles set updated_at = created_at;
alter table public.rental_profiles
  alter column updated_at set default now(),
  alter column updated_at set not null;
alter table public.rental_orders add column updated_at timestamptz;
update public.rental_orders set updated_at = created_at;
alter table public.rental_orders
  alter column updated_at set default now(),
  alter column updated_at set not null;
alter table public.rental_billing_documents add column updated_at timestamptz;
update public.rental_billing_documents
  set updated_at = coalesce(issued_at, created_at);
alter table public.rental_billing_documents
  alter column updated_at set default now(),
  alter column updated_at set not null;
alter table private.guest_contacts
  add column created_at timestamptz not null default now();
alter table private.billing_requests
  add column created_at timestamptz not null default now();

-- Index referencing columns that did not yet have a suitable leading index.
create index rental_orders_unit_idx on public.rental_orders (unit_id)
  where unit_id is not null;
create index rental_payments_actor_idx on public.rental_payments (actor_id);
create index rental_events_actor_idx on public.rental_events (actor_id);
create index guest_submissions_order_idx on private.guest_submissions (order_id);
create index billing_requests_document_idx on private.billing_requests (document_id);

create function private.rental_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function private.rental_touch_updated_at() from public, anon, authenticated;

create trigger rental_models_touch before update on public.rental_models
  for each row execute function private.rental_touch_updated_at();
create trigger rental_units_touch before update on public.rental_units
  for each row execute function private.rental_touch_updated_at();
create trigger rental_profiles_touch before update on public.rental_profiles
  for each row execute function private.rental_touch_updated_at();
create trigger rental_orders_touch before update on public.rental_orders
  for each row execute function private.rental_touch_updated_at();
create trigger rental_billing_settings_touch before update on public.rental_billing_settings
  for each row execute function private.rental_touch_updated_at();
create trigger rental_billing_documents_touch before update on public.rental_billing_documents
  for each row execute function private.rental_touch_updated_at();

create table public.rental_audit_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default clock_timestamp(),
  transaction_id bigint not null default txid_current(),
  entity_table text not null check (entity_table in (
    'rental_profiles', 'rental_models', 'rental_units', 'rental_orders',
    'rental_payments', 'rental_events', 'rental_billing_settings',
    'rental_billing_documents'
  )),
  record_id text not null,
  order_id uuid,
  request_id uuid,
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id uuid,
  actor_source text not null,
  changed_fields text[] not null,
  before_state jsonb,
  after_state jsonb
);
create index rental_audit_time_idx
  on public.rental_audit_log (occurred_at desc, id desc);
create index rental_audit_entity_time_idx
  on public.rental_audit_log (entity_table, record_id, occurred_at desc, id desc);
create index rental_audit_order_time_idx
  on public.rental_audit_log (order_id, occurred_at desc, id desc)
  where order_id is not null;
create index rental_audit_actor_time_idx
  on public.rental_audit_log (actor_id, occurred_at desc, id desc)
  where actor_id is not null;

alter table public.rental_audit_log enable row level security;
revoke all on public.rental_audit_log from public, anon, authenticated, service_role;
revoke all on sequence public.rental_audit_log_id_seq from public, anon, authenticated, service_role;
grant select on public.rental_audit_log to authenticated;
create policy rental_audit_admin_read on public.rental_audit_log
  for select to authenticated using ((select private.is_admin()));

-- Allowlist snapshots: never duplicate names, contact details, ID/license
-- numbers, home addresses, card/payment references, invoice parties or notes.
-- changed_fields still records that a protected column changed, not its value.
create function private.rental_audit_snapshot(p_table text, p_row jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare allowed text[];
begin
  if p_row is null then return null; end if;
  case p_table
    when 'rental_profiles' then allowed := array['id','auth_user_id','role','created_at','updated_at'];
    when 'rental_models' then allowed := array['id','make','model','category','daily_rate','seats','image','created_at','updated_at'];
    when 'rental_units' then allowed := array['id','model_id','label','plate','status','created_at','updated_at'];
    when 'rental_orders' then allowed := array['id','code','request_id','customer_id','model_id','unit_id','status','pickup','dropoff','daily_rate','total','billing_total','consent','created_at','updated_at'];
    when 'rental_payments' then allowed := array['id','order_id','request_id','amount','method','actor_id','created_at'];
    when 'rental_events' then allowed := array['id','order_id','request_id','actor_id','created_at'];
    when 'rental_billing_settings' then allowed := array['id','prefix','tax_label','tax_bps','next_invoice','next_credit','next_debit','created_at','updated_at'];
    when 'rental_billing_documents' then allowed := array['id','order_id','customer_id','kind','parent_id','status','number','version','currency','due_date','issued_at','created_at','updated_at','fx_rate','subtotal_cents','discount_cents','tax_cents','total_cents'];
    else raise exception 'Audit table is not configured: %', p_table;
  end case;
  return coalesce((
    select jsonb_object_agg(key, p_row -> key)
    from unnest(allowed) as keys(key)
    where p_row ? key
  ), '{}'::jsonb);
end;
$$;
revoke all on function private.rental_audit_snapshot(text, jsonb)
  from public, anon, authenticated, service_role;

create function private.rental_audit_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare old_row jsonb; new_row jsonb; changed text[]; row_data jsonb;
begin
  if tg_op <> 'INSERT' then old_row := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then new_row := to_jsonb(new); end if;
  row_data := coalesce(new_row, old_row);
  select coalesce(array_agg(key order by key), array[]::text[])
    into changed
    from jsonb_object_keys(coalesce(old_row, '{}'::jsonb) || coalesce(new_row, '{}'::jsonb)) as fields(key)
    where old_row -> key is distinct from new_row -> key
      and key <> 'updated_at';
  if tg_op = 'UPDATE' and cardinality(changed) = 0 then return new; end if;
  insert into public.rental_audit_log (
    entity_table, record_id, order_id, request_id, operation,
    actor_id, actor_source, changed_fields, before_state, after_state
  ) values (
    tg_table_name, row_data ->> 'id',
    case when tg_table_name = 'rental_orders' then (row_data ->> 'id')::uuid
         else nullif(row_data ->> 'order_id', '')::uuid end,
    nullif(row_data ->> 'request_id', '')::uuid,
    tg_op, auth.uid(),
    case when auth.uid() is not null then 'authenticated'
         when current_setting('request.jwt.claim.role', true) = 'service_role' then 'public_booking'
         else 'database' end,
    changed,
    private.rental_audit_snapshot(tg_table_name, old_row),
    private.rental_audit_snapshot(tg_table_name, new_row)
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.rental_audit_change()
  from public, anon, authenticated, service_role;

create trigger rental_profiles_audit after insert or update or delete on public.rental_profiles
  for each row execute function private.rental_audit_change();
create trigger rental_models_audit after insert or update or delete on public.rental_models
  for each row execute function private.rental_audit_change();
create trigger rental_units_audit after insert or update or delete on public.rental_units
  for each row execute function private.rental_audit_change();
create trigger rental_orders_audit after insert or update or delete on public.rental_orders
  for each row execute function private.rental_audit_change();
create trigger rental_payments_audit after insert or update or delete on public.rental_payments
  for each row execute function private.rental_audit_change();
create trigger rental_events_audit after insert or update or delete on public.rental_events
  for each row execute function private.rental_audit_change();
create trigger rental_billing_settings_audit after insert or update or delete on public.rental_billing_settings
  for each row execute function private.rental_audit_change();
create trigger rental_billing_documents_audit after insert or update or delete on public.rental_billing_documents
  for each row execute function private.rental_audit_change();

create function private.rental_audit_immutable() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'El historial de cambios no puede editarse ni borrarse.';
end;
$$;
revoke all on function private.rental_audit_immutable()
  from public, anon, authenticated, service_role;
create trigger rental_audit_immutable before update or delete on public.rental_audit_log
  for each row execute function private.rental_audit_immutable();

commit;
