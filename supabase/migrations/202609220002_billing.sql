-- Commercial billing. Fiscal-provider authorization is deliberately not implied by a number or PDF.
begin;
alter table public.rental_orders add column billing_total numeric(12,2) check(billing_total>=0);
create table public.rental_billing_settings (
 id integer primary key default 1 check(id=1), name text not null default '', tax_id text not null default '', address text not null default '', email text not null default '', phone text not null default '',
 prefix text not null default 'CC' check(prefix ~ '^[A-Z0-9-]{1,10}$'), terms text not null default 'Pago coordinado con Ciudad Cars.', tax_label text not null default 'Impuesto', tax_bps integer not null default 0 check(tax_bps between 0 and 10000),
 next_invoice bigint not null default 1, next_credit bigint not null default 1, next_debit bigint not null default 1
);
insert into public.rental_billing_settings(id) values(1);
create table public.rental_billing_documents (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.rental_orders(id), customer_id uuid not null references public.rental_profiles(id),
 kind text not null check(kind in ('invoice','credit','debit')), parent_id uuid references public.rental_billing_documents(id), status text not null default 'draft' check(status in ('draft','issued','void')),
 number text unique, version integer not null default 1, currency text not null default 'USD' check(currency='USD'),
 lines jsonb not null, customer jsonb not null, issuer jsonb not null default '{}'::jsonb, due_date date not null, issued_at timestamptz, created_at timestamptz not null default now(),
 notes text not null default '', reason text not null default '', terms text not null default '', tax_label text not null default 'Impuesto', fx_rate numeric(16,6) check(fx_rate>0 and fx_rate<=1000000),
 subtotal_cents bigint not null, discount_cents bigint not null, tax_cents bigint not null, total_cents bigint not null check(total_cents>0 and total_cents<=1000000000),
 check((kind='invoice' and parent_id is null) or (kind<>'invoice' and parent_id is not null)), check((status='issued')=(number is not null)), check((status='issued')=(issued_at is not null))
);
create unique index rental_billing_one_invoice on public.rental_billing_documents(order_id) where kind='invoice' and status<>'void';
create index rental_billing_customer_idx on public.rental_billing_documents(customer_id,created_at desc);
create index rental_billing_order_idx on public.rental_billing_documents(order_id,status);
create index rental_billing_parent_idx on public.rental_billing_documents(parent_id);
create table private.billing_requests(request_id uuid primary key, actor_id uuid not null, document_id uuid not null references public.rental_billing_documents(id));
revoke all on private.billing_requests from public,anon,authenticated;
alter table public.rental_billing_settings enable row level security;
alter table public.rental_billing_documents enable row level security;
revoke all on public.rental_billing_settings,public.rental_billing_documents from anon,authenticated;
grant select on public.rental_billing_settings,public.rental_billing_documents to authenticated;
create policy rental_billing_settings_read on public.rental_billing_settings for select to authenticated using((select private.is_admin()));
create policy rental_billing_documents_read on public.rental_billing_documents for select to authenticated using((select private.is_admin()) or (customer_id=(select auth.uid()) and status='issued'));

create function private.billing_totals(p_lines jsonb) returns jsonb language plpgsql set search_path='' as $$
declare l jsonb; q numeric; u numeric; d numeric; t numeric; gross bigint; subtotal bigint:=0; discounts bigint:=0; taxes bigint:=0; total bigint;
begin
 if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) not between 1 and 50 then raise exception 'Añade entre 1 y 50 conceptos.'; end if;
 for l in select value from jsonb_array_elements(p_lines) loop
  if length(trim(coalesce(l->>'description',''))) not between 1 and 300 then raise exception 'Revisa la descripción del concepto.'; end if;
  q:=(l->>'quantity')::numeric; u:=(l->>'unit_cents')::numeric; d:=(l->>'discount_cents')::numeric; t:=(l->>'tax_bps')::numeric;
  if q is null or q<=0 or q>10000 or q<>round(q,3) or u is null or u<0 or u>100000000 or u<>trunc(u) or t is null or t<0 or t>10000 or t<>trunc(t) then raise exception 'Revisa cantidades, precios e impuestos.'; end if;
  gross:=round(q*u);
  if d is null or d<0 or d>gross or d<>trunc(d) then raise exception 'El descuento supera el importe del concepto.'; end if;
  subtotal:=subtotal+gross; discounts:=discounts+d; taxes:=taxes+round((gross-d)*t/10000);
 end loop;
 total:=subtotal-discounts+taxes;
 if total<=0 or total>1000000000 then raise exception 'El total debe ser positivo y no superar 10.000.000 USD.'; end if;
 return jsonb_build_object('subtotal_cents',subtotal,'discount_cents',discounts,'tax_cents',taxes,'total_cents',total);
end; $$;
create function private.billing_validate_party(p jsonb) returns void language plpgsql set search_path='' as $$
begin
 if length(trim(coalesce(p->>'name',''))) not between 3 and 160 or length(trim(coalesce(p->>'tax_id',''))) not between 4 and 40 or length(trim(coalesce(p->>'address',''))) not between 5 and 500 then raise exception 'Completa razón social o nombre, identificación fiscal y dirección.'; end if;
 if length(coalesce(p->>'email',''))>254 or (coalesce(p->>'email','')<>'' and (p->>'email') !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$') or length(coalesce(p->>'phone',''))>40 then raise exception 'Revisa el correo y teléfono de facturación.'; end if;
end; $$;
revoke all on function private.billing_totals(jsonb),private.billing_validate_party(jsonb) from public,anon,authenticated;
create function private.billing_immutable() returns trigger language plpgsql set search_path='' as $$
begin
 if old.status<>'draft' then raise exception 'Un documento emitido o anulado no puede modificarse. Emite una nota de crédito o débito.'; end if;
 if tg_op='DELETE' then raise exception 'Los documentos no se eliminan.'; end if;
 return new;
end; $$;
revoke all on function private.billing_immutable() from public,anon,authenticated;
create trigger billing_immutable before update or delete on public.rental_billing_documents for each row execute function private.billing_immutable();

create function public.rental_billing_settings_save(p_input jsonb) returns void language plpgsql security definer set search_path='' as $$
declare cfg public.rental_billing_settings;
begin
 if auth.uid() is null or not private.is_admin() then raise exception 'Solo administradores.'; end if;
 perform private.billing_validate_party(p_input);
 select * into cfg from public.rental_billing_settings where id=1 for update;
 if p_input->>'prefix'<>cfg.prefix and exists(select 1 from public.rental_billing_documents where status='issued') then raise exception 'La serie no puede cambiar después de emitir documentos.'; end if;
 if length(coalesce(p_input->>'terms',''))>2000 or length(coalesce(p_input->>'tax_label','')) not between 1 and 40 then raise exception 'Revisa las condiciones o el nombre del impuesto.'; end if;
 update public.rental_billing_settings set name=trim(p_input->>'name'),tax_id=trim(p_input->>'tax_id'),address=trim(p_input->>'address'),email=coalesce(p_input->>'email',''),phone=coalesce(p_input->>'phone',''),prefix=p_input->>'prefix',terms=coalesce(p_input->>'terms',''),tax_label=p_input->>'tax_label',tax_bps=(p_input->>'tax_bps')::integer where id=1;
end; $$;

create function public.rental_billing_action(p_input jsonb) returns public.rental_billing_documents language plpgsql security definer set search_path='' as $$
declare doc public.rental_billing_documents; parent public.rental_billing_documents; cfg public.rental_billing_settings; o public.rental_orders; totals jsonb;
 request uuid:=(p_input->>'request_id')::uuid; doc_id uuid:=nullif(p_input->>'id','')::uuid; a text:=p_input->>'action'; original_order uuid; prev private.billing_requests;
 remaining bigint; remaining_tax bigint; remaining_base bigint; counter bigint; party jsonb; issuer_snapshot jsonb; issued_total bigint;
begin
 if auth.uid() is null or not private.is_admin() then raise exception 'Solo administradores pueden modificar la facturación.'; end if;
 if request is null then raise exception 'Falta el identificador de la operación.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(request::text,0));
 select * into prev from private.billing_requests where request_id=request;
 if found then
  if prev.actor_id<>auth.uid() then raise exception 'Operación no disponible.'; end if;
  select * into doc from public.rental_billing_documents where id=prev.document_id; return doc;
 end if;
 original_order:=(p_input->>'order_id')::uuid;
 select * into o from public.rental_orders where id=original_order for update;
 if not found then raise exception 'Orden no encontrada.'; end if;
 if doc_id is not null then
  select * into doc from public.rental_billing_documents where id=doc_id and order_id=o.id for update;
  if not found then raise exception 'Documento no encontrado.'; end if;
  if doc.status<>'draft' then raise exception 'El documento ya fue emitido o anulado.'; end if;
  if (p_input->>'version')::integer is distinct from doc.version then raise exception 'El documento cambió. Actualiza antes de guardar.'; end if;
 end if;
 if a='save' then
  if o.status in ('cancelled','rejected') and p_input->>'kind'<>'credit' then raise exception 'Solo puedes acreditar una orden cerrada.'; end if;
  if doc_id is not null and (doc.kind is distinct from p_input->>'kind' or doc.parent_id is distinct from nullif(p_input->>'parent_id','')::uuid) then raise exception 'No puedes cambiar el tipo o la factura de origen.'; end if;
  if coalesce(p_input->>'due_date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or (p_input->>'due_date')::date < date '0001-01-01' then raise exception 'Selecciona una fecha de vencimiento válida.'; end if;
  totals:=private.billing_totals(p_input->'lines');party:=p_input->'customer';perform private.billing_validate_party(party);
  if length(coalesce(p_input->>'notes',''))>2000 or length(coalesce(p_input->>'reason',''))>500 then raise exception 'Reduce las notas o el motivo.'; end if;
  select * into cfg from public.rental_billing_settings where id=1;
  if p_input->>'kind'<>'invoice' then
   select * into parent from public.rental_billing_documents where id=nullif(p_input->>'parent_id','')::uuid and order_id=o.id and kind='invoice' and status='issued';
   if not found then raise exception 'La nota requiere una factura emitida de esta orden.'; end if;
   if length(trim(coalesce(p_input->>'reason','')))<5 then raise exception 'Escribe el motivo de la nota.'; end if;
   party:=parent.customer;issuer_snapshot:=parent.issuer;
  else issuer_snapshot:=jsonb_build_object('name',cfg.name,'tax_id',cfg.tax_id,'address',cfg.address,'email',cfg.email,'phone',cfg.phone);
  end if;
  if doc_id is null then
   insert into public.rental_billing_documents(order_id,customer_id,kind,parent_id,lines,customer,issuer,due_date,notes,reason,terms,tax_label,fx_rate,subtotal_cents,discount_cents,tax_cents,total_cents)
   values(o.id,o.customer_id,p_input->>'kind',nullif(p_input->>'parent_id','')::uuid,p_input->'lines',party,issuer_snapshot,(p_input->>'due_date')::date,coalesce(p_input->>'notes',''),coalesce(p_input->>'reason',''),case when parent.id is not null then parent.terms else cfg.terms end,case when parent.id is not null then parent.tax_label else cfg.tax_label end,nullif(p_input->>'fx_rate','')::numeric,(totals->>'subtotal_cents')::bigint,(totals->>'discount_cents')::bigint,(totals->>'tax_cents')::bigint,(totals->>'total_cents')::bigint) returning * into doc;
  else
   update public.rental_billing_documents set lines=p_input->'lines',customer=party,issuer=issuer_snapshot,terms=case when parent.id is not null then parent.terms else cfg.terms end,tax_label=case when parent.id is not null then parent.tax_label else cfg.tax_label end,due_date=(p_input->>'due_date')::date,notes=coalesce(p_input->>'notes',''),reason=coalesce(p_input->>'reason',''),fx_rate=nullif(p_input->>'fx_rate','')::numeric,subtotal_cents=(totals->>'subtotal_cents')::bigint,discount_cents=(totals->>'discount_cents')::bigint,tax_cents=(totals->>'tax_cents')::bigint,total_cents=(totals->>'total_cents')::bigint,version=version+1 where id=doc.id returning * into doc;
  end if;
 elsif a='issue' then
  if doc_id is null then raise exception 'Primero guarda el borrador.'; end if;
  if o.status in ('cancelled','rejected') and doc.kind<>'credit' then raise exception 'Solo puedes acreditar una orden cerrada.'; end if;
  perform private.billing_validate_party(doc.customer);perform private.billing_validate_party(doc.issuer);
  if doc.kind='credit' then
   select coalesce(sum(case when kind='credit' then -total_cents else total_cents end),0),coalesce(sum(case when kind='credit' then -tax_cents else tax_cents end),0),coalesce(sum(case when kind='credit' then -(subtotal_cents-discount_cents) else subtotal_cents-discount_cents end),0)
   into remaining,remaining_tax,remaining_base from public.rental_billing_documents where order_id=o.id and status='issued';
   if doc.total_cents>remaining or doc.tax_cents>remaining_tax or doc.subtotal_cents-doc.discount_cents>remaining_base then raise exception 'La nota supera el importe o impuesto pendiente de acreditar.'; end if;
  end if;
  select * into cfg from public.rental_billing_settings where id=1 for update;
  counter:=case doc.kind when 'invoice' then cfg.next_invoice when 'credit' then cfg.next_credit else cfg.next_debit end;
  update public.rental_billing_settings set next_invoice=next_invoice+case when doc.kind='invoice' then 1 else 0 end,next_credit=next_credit+case when doc.kind='credit' then 1 else 0 end,next_debit=next_debit+case when doc.kind='debit' then 1 else 0 end where id=1;
  update public.rental_billing_documents set status='issued',issued_at=now(),number=cfg.prefix||'-'||case doc.kind when 'invoice' then 'F' when 'credit' then 'NC' else 'ND' end||'-'||lpad(counter::text,greatest(6,length(counter::text)),'0'),version=version+1 where id=doc.id returning * into doc;
  select sum(case when kind='credit' then -total_cents else total_cents end) into issued_total from public.rental_billing_documents where order_id=o.id and status='issued';
  if issued_total<0 or issued_total>1000000000 then raise exception 'El total facturado excede los límites de la orden.'; end if;
  update public.rental_orders set billing_total=issued_total/100.0 where id=o.id;
 elsif a='void' then
  if doc_id is null or length(trim(coalesce(p_input->>'reason','')))<5 then raise exception 'Selecciona un borrador e indica el motivo de anulación.'; end if;
  update public.rental_billing_documents set status='void',reason=left(p_input->>'reason',500),version=version+1 where id=doc.id returning * into doc;
 else raise exception 'Operación desconocida.';
 end if;
 insert into private.billing_requests(request_id,actor_id,document_id) values(request,auth.uid(),doc.id);
 insert into public.rental_events(order_id,actor_id,message) values(o.id,auth.uid(),case a when 'issue' then 'Documento emitido: '||doc.number||'. Total USD '||(doc.total_cents/100.0)::text when 'void' then 'Borrador de facturación anulado. '||doc.reason else 'Borrador de facturación guardado.' end);
 return doc;
end; $$;
revoke all on function public.rental_billing_action(jsonb),public.rental_billing_settings_save(jsonb) from public,anon;
grant execute on function public.rental_billing_action(jsonb),public.rental_billing_settings_save(jsonb) to authenticated;
create or replace function public.rental_order_action(p_input jsonb) returns public.rental_orders
language plpgsql security definer set search_path='' as $$
declare o public.rental_orders; a text:=p_input->>'action'; paid numeric; amount numeric; unit uuid; message text; admin boolean; request uuid:=(p_input->>'request_id')::uuid;
begin
 if auth.uid() is null then raise exception 'Inicia sesión.'; end if;
 admin:=private.is_admin();
 select * into o from public.rental_orders where id=(p_input->>'order_id')::uuid for update;
 if not found or (not admin and o.customer_id<>auth.uid()) then raise exception 'Orden no disponible.'; end if;
 if request is null then raise exception 'Falta el identificador de la operación.'; end if;
 if exists(select 1 from public.rental_events where request_id=request and order_id=o.id and actor_id=auth.uid()) then return o; end if;
 if not admin and not(a='cancel' and o.status='pending') then raise exception 'Solo un administrador puede realizar esta operación.'; end if;
 select coalesce(sum(p.amount),0) into paid from public.rental_payments p where p.order_id=o.id;
 if a in ('payment','refund') then
   amount:=(p_input->>'amount')::numeric;
   if amount is null or amount<=0 or amount<>round(amount,2) then raise exception 'El importe debe ser positivo y tener hasta dos decimales.'; end if;
   if a='payment' and (o.status not in ('pending','approved','active','completed') or paid+amount>coalesce(o.billing_total,o.total)) then raise exception 'El pago supera el saldo o la orden está cerrada.'; end if;
   if a='refund' and (amount>case when o.status in ('cancelled','rejected') then paid else greatest(0,paid-coalesce(o.billing_total,o.total)) end) then raise exception 'El reembolso supera el saldo a favor del cliente.'; end if;
   insert into public.rental_payments(order_id,request_id,amount,method,reference,actor_id) values(o.id,request,case when a='refund' then -amount else amount end,trim(p_input->>'method'),trim(p_input->>'reference'),auth.uid());
   message:=case when a='refund' then 'Reembolso registrado: USD ' else 'Pago verificado: USD ' end||amount::text;
 elsif a='approve' then
   if o.status<>'pending' or (coalesce(o.billing_total,o.total)<=0 or paid<coalesce(o.billing_total,o.total)) then raise exception 'Para aprobar, verifica primero el pago completo de una orden pendiente.'; end if;
   if o.pickup<(now() at time zone 'America/Caracas')::date then raise exception 'La fecha de retiro ya pasó. Crea una nueva solicitud.'; end if;
   unit:=(p_input->>'unit_id')::uuid;
   perform 1 from public.rental_units where id=unit and model_id=o.model_id and status='available' for update;
   if not found then raise exception 'Selecciona una unidad disponible de este modelo.'; end if;
   if exists(select 1 from public.rental_orders x where x.unit_id=unit and x.id<>o.id and x.status in ('approved','active') and (daterange(x.pickup,x.dropoff,'[)') && daterange(o.pickup,o.dropoff,'[)') or (x.status='active' and x.dropoff<=(now() at time zone 'America/Caracas')::date))) then raise exception 'Esta unidad ya está ocupada. Selecciona otra.'; end if;
   update public.rental_orders set status='approved',unit_id=unit where id=o.id;
   message:='Orden aprobada. Unidad asignada y fechas bloqueadas.';
 elsif a='start' then
   if o.status<>'approved' or o.pickup>(now() at time zone 'America/Caracas')::date or o.dropoff<=(now() at time zone 'America/Caracas')::date then raise exception 'La entrega debe estar dentro de las fechas de una orden confirmada.'; end if;
   perform 1 from public.rental_units where id=o.unit_id and status='available' for update;
   if not found then raise exception 'La unidad no está operativa.'; end if;
   if exists(select 1 from public.rental_orders where unit_id=o.unit_id and status='active' and id<>o.id) then raise exception 'Esta unidad todavía no ha sido devuelta.'; end if;
   if length(trim(coalesce(p_input->>'note','')))<5 then raise exception 'Registra kilometraje, combustible y estado de entrega.'; end if;
   update public.rental_orders set status='active' where id=o.id; message:='Vehículo entregado. '||left(p_input->>'note',1000);
 elsif a='complete' then
   if o.status<>'active' then raise exception 'Solo puedes devolver un vehículo en alquiler.'; end if;
   if length(trim(coalesce(p_input->>'note','')))<5 then raise exception 'Registra kilometraje, combustible y estado de devolución.'; end if;
   update public.rental_orders set status='completed' where id=o.id; message:='Vehículo devuelto. '||left(p_input->>'note',1000);
 elsif a='cancel' then
   if o.status not in ('pending','approved') then raise exception 'Esta orden ya no puede cancelarse.'; end if;
   update public.rental_orders set status='cancelled' where id=o.id; message:='Orden cancelada. '||left(coalesce(p_input->>'note',''),1000);
 elsif a='reject' then
   if o.status<>'pending' then raise exception 'Solo puedes rechazar solicitudes pendientes.'; end if;
   update public.rental_orders set status='rejected' where id=o.id; message:='Solicitud rechazada. '||left(coalesce(p_input->>'note',''),1000);
 else raise exception 'Operación desconocida.';
 end if;
 insert into public.rental_events(order_id,actor_id,request_id,message) values(o.id,auth.uid(),request,message);
 select * into o from public.rental_orders where id=o.id;
 return o;
end; $$;
commit;
