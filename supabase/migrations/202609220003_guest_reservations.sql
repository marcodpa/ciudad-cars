-- Public reservations are submitted only by the server after anti-bot validation.
-- Contacts are business records, not customer login accounts.
begin;
alter table public.rental_profiles drop constraint rental_profiles_id_fkey;
alter table public.rental_profiles add column auth_user_id uuid unique references auth.users(id);
update public.rental_profiles set auth_user_id=id;
alter table public.rental_profiles alter column id set default gen_random_uuid();
create or replace function private.new_rental_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.rental_profiles(id,auth_user_id,email,full_name) values(new.id,new.id,coalesce(new.email,''),left(coalesce(new.raw_user_meta_data->>'full_name',''),120));
 return new;
end; $$;
alter table public.rental_orders add column home_address text not null default '' check(length(home_address)<=500);

-- Former customer accounts retain no dashboard access, including direct API requests.
drop policy rental_profiles_read on public.rental_profiles;
create policy rental_profiles_read on public.rental_profiles for select to authenticated using((select private.is_admin()));
drop policy rental_orders_read on public.rental_orders;
create policy rental_orders_read on public.rental_orders for select to authenticated using((select private.is_admin()));
drop policy rental_billing_documents_read on public.rental_billing_documents;
create policy rental_billing_documents_read on public.rental_billing_documents for select to authenticated using((select private.is_admin()));
revoke execute on function public.rental_create_order(jsonb,uuid) from public,anon,authenticated;
-- Administrators may still use operational RPCs. Old customers cannot cancel through a hidden endpoint.
create function private.require_admin_order_change() returns trigger language plpgsql set search_path='' as $$
begin
 if current_setting('role',true)='authenticated' and not private.is_admin() then raise exception 'Solo administradores.'; end if;
 return new;
end; $$;
revoke all on function private.require_admin_order_change() from public,anon,authenticated;
create trigger rental_admin_order_change before update on public.rental_orders for each row execute function private.require_admin_order_change();

create table private.guest_contacts(identity_hash text primary key check(identity_hash ~ '^[a-f0-9]{64}$'), customer_id uuid not null unique references public.rental_profiles(id));
create table private.guest_submissions(request_id uuid primary key,order_id uuid not null references public.rental_orders(id),client_hash text not null,payload_hash text not null,created_at timestamptz not null default now());
create index guest_submissions_rate_idx on private.guest_submissions(client_hash,created_at);
revoke all on private.guest_contacts,private.guest_submissions from public,anon,authenticated;

create function public.rental_submit_guest_order(p_input jsonb,p_request_id uuid,p_client_hash text,p_identity_hash text,p_payload_hash text) returns public.rental_orders
language plpgsql security definer set search_path='' as $$
declare result public.rental_orders; previous private.guest_submissions; customer uuid; rate numeric; start_date date; end_date date;
begin
 if p_request_id is null or coalesce(p_client_hash,'') !~ '^[a-f0-9]{64}$' or coalesce(p_identity_hash,'') !~ '^[a-f0-9]{64}$' or coalesce(p_payload_hash,'') !~ '^[a-f0-9]{64}$' then raise exception 'Solicitud inválida.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,1));
 select * into previous from private.guest_submissions where request_id=p_request_id;
 if found then
  if previous.payload_hash<>p_payload_hash then raise exception 'Solicitud inválida.'; end if;
  select * into result from public.rental_orders where id=previous.order_id; return result;
 end if;
 perform pg_advisory_xact_lock(hashtextextended(p_client_hash,2));
 if (select count(*) from private.guest_submissions where client_hash=p_client_hash and created_at>now()-interval '15 minutes')>=5 or (select count(*) from private.guest_submissions where client_hash=p_client_hash and created_at>now()-interval '1 day')>=20 then raise exception 'Demasiadas solicitudes. Intenta más tarde.'; end if;
 if coalesce(p_input->>'pickup','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or coalesce(p_input->>'dropoff','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'Revisa las fechas.'; end if;
 start_date:=(p_input->>'pickup')::date;end_date:=(p_input->>'dropoff')::date;
 if start_date<(now() at time zone 'America/Caracas')::date or end_date<=start_date or end_date-start_date>90 then raise exception 'Revisa las fechas del alquiler (1 a 90 días).'; end if;
 if length(trim(coalesce(p_input->>'home_address',''))) not between 8 and 500 then raise exception 'Completa la dirección de domicilio.'; end if;
 select daily_rate into rate from public.rental_models where id=p_input->>'model_id';
 if rate is null then raise exception 'Vehículo desconocido.'; end if;
 if not exists(select 1 from public.rental_availability(start_date,end_date) a where a.model_id=p_input->>'model_id' and a.available>0) then raise exception 'No hay unidades disponibles para estas fechas.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_identity_hash,3));
 select customer_id into customer from private.guest_contacts where identity_hash=p_identity_hash;
 if customer is null then
  insert into public.rental_profiles(full_name,email,phone) values(trim(p_input->>'full_name'),trim(p_input->>'email'),trim(p_input->>'phone')) returning id into customer;
  insert into private.guest_contacts(identity_hash,customer_id) values(p_identity_hash,customer);
 end if;
 if (select count(*) from public.rental_orders where customer_id=customer and status='pending')>=5 then raise exception 'Ya hay cinco solicitudes pendientes con estos datos. Contacta a Ciudad Cars.'; end if;
 insert into public.rental_orders(request_id,customer_id,model_id,pickup,dropoff,daily_rate,total,full_name,phone,email,document,license,license_expiry,pickup_location,return_location,home_address,notes,consent)
 values(p_request_id,customer,p_input->>'model_id',start_date,end_date,rate,rate*(end_date-start_date),trim(p_input->>'full_name'),trim(p_input->>'phone'),trim(p_input->>'email'),trim(p_input->>'document'),trim(p_input->>'license'),(p_input->>'license_expiry')::date,trim(p_input->>'pickup_location'),trim(p_input->>'return_location'),trim(p_input->>'home_address'),coalesce(p_input->>'notes',''),coalesce((p_input->>'consent')::boolean,false)) returning * into result;
 update public.rental_profiles set full_name=result.full_name,phone=result.phone where id=customer;
 insert into public.rental_events(order_id,actor_id,message) values(result.id,customer,'Solicitud recibida desde la web. Pendiente de pago y aprobación por WhatsApp.');
 insert into private.guest_submissions(request_id,order_id,client_hash,payload_hash) values(p_request_id,result.id,p_client_hash,p_payload_hash);
 return result;
end; $$;
revoke all on function public.rental_submit_guest_order(jsonb,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.rental_submit_guest_order(jsonb,uuid,text,text,text) to service_role;
commit;
