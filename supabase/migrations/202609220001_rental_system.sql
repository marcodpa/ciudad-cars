-- Ciudad Cars rental operations. Run once on a new Supabase project.
begin;
create extension if not exists btree_gist;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.rental_profiles (
  id uuid primary key references auth.users(id),
  full_name text not null default '', email text not null, phone text not null default '',
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);
create function private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists(select 1 from public.rental_profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
create function private.new_rental_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.rental_profiles(id,email,full_name) values(new.id, coalesce(new.email,''), left(coalesce(new.raw_user_meta_data->>'full_name',''),120));
  return new;
end; $$;
revoke all on function private.new_rental_profile() from public, anon, authenticated;
create trigger rental_profile_created after insert on auth.users for each row execute function private.new_rental_profile();
insert into public.rental_profiles(id,email,full_name) select id,coalesce(email,''),left(coalesce(raw_user_meta_data->>'full_name',''),120) from auth.users on conflict do nothing;

create table public.rental_models (
 id text primary key, make text not null, model text not null, category text not null,
 daily_rate numeric(10,2) not null check (daily_rate > 0 and daily_rate <= 10000),
 seats integer not null check(seats between 1 and 20), image text not null
);
create table public.rental_units (
 id uuid primary key default gen_random_uuid(), model_id text not null references public.rental_models(id),
 label text not null check(length(label) between 2 and 80), plate text not null unique check(length(plate) between 3 and 20),
 status text not null default 'available' check(status in ('available','maintenance','inactive'))
);
create index rental_units_model_idx on public.rental_units(model_id,status);
create sequence public.rental_order_code_seq start 1001;
create table public.rental_orders (
 id uuid primary key default gen_random_uuid(), code text not null unique default ('CC-' || nextval('public.rental_order_code_seq')),
 request_id uuid not null, customer_id uuid not null references public.rental_profiles(id), model_id text not null references public.rental_models(id),
 unit_id uuid references public.rental_units(id), status text not null default 'pending' check(status in ('pending','approved','active','completed','cancelled','rejected')),
 pickup date not null, dropoff date not null, daily_rate numeric(10,2) not null check(daily_rate>0), total numeric(12,2) not null check(total>0),
 full_name text not null check(length(full_name) between 3 and 120), phone text not null check(phone ~ '^\+?[0-9 ()-]{7,25}$'),
 email text not null check(length(email)<=254 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
 document text not null check(length(document) between 4 and 40), license text not null check(length(license) between 4 and 40), license_expiry date not null,
 pickup_location text not null check(length(pickup_location) between 1 and 160), return_location text not null check(length(return_location) between 1 and 160),
 notes text not null default '' check(length(notes)<=1000), consent boolean not null check(consent),
 created_at timestamptz not null default now(),
 unique(customer_id,request_id), check(dropoff>pickup and dropoff-pickup<=90), check(license_expiry>=dropoff),
 check(status not in ('approved','active','completed') or unit_id is not null),
 constraint rental_no_overlap exclude using gist (unit_id with =, daterange(pickup,dropoff,'[)') with &&) where(status in ('approved','active'))
);
create index rental_orders_customer_idx on public.rental_orders(customer_id,created_at desc);
create index rental_orders_model_dates_idx on public.rental_orders(model_id,pickup,dropoff) where status in ('approved','active');
create table public.rental_payments (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.rental_orders(id), request_id uuid not null unique,
 amount numeric(12,2) not null check(amount<>0), method text not null check(length(method) between 2 and 50),
 reference text not null check(length(reference) between 3 and 120), actor_id uuid not null references public.rental_profiles(id), created_at timestamptz not null default now(),
 unique(order_id,reference)
);
create index rental_payments_order_idx on public.rental_payments(order_id);
create table public.rental_events (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.rental_orders(id), actor_id uuid not null references public.rental_profiles(id),
 request_id uuid unique, message text not null, created_at timestamptz not null default now()
);
create index rental_events_order_idx on public.rental_events(order_id,created_at desc);

alter table public.rental_profiles enable row level security;
alter table public.rental_models enable row level security;
alter table public.rental_units enable row level security;
alter table public.rental_orders enable row level security;
alter table public.rental_payments enable row level security;
alter table public.rental_events enable row level security;
revoke all on public.rental_profiles,public.rental_models,public.rental_units,public.rental_orders,public.rental_payments,public.rental_events from anon,authenticated;
grant select on public.rental_models to anon,authenticated;
grant select on public.rental_profiles,public.rental_units,public.rental_orders,public.rental_payments,public.rental_events to authenticated;
create policy rental_models_read on public.rental_models for select to anon,authenticated using(true);
create policy rental_profiles_read on public.rental_profiles for select to authenticated using(id=(select auth.uid()) or (select private.is_admin()));
create policy rental_units_read on public.rental_units for select to authenticated using((select private.is_admin()));
create policy rental_orders_read on public.rental_orders for select to authenticated using(customer_id=(select auth.uid()) or (select private.is_admin()));
create policy rental_payments_read on public.rental_payments for select to authenticated using(exists(select 1 from public.rental_orders o where o.id=order_id));
create policy rental_events_read on public.rental_events for select to authenticated using(exists(select 1 from public.rental_orders o where o.id=order_id));

-- Returns aggregate counts only, never plates, driver information or other bookings.
create function public.rental_availability(p_pickup date,p_dropoff date)
returns table(model_id text,available bigint) language sql stable security definer set search_path='' as $$
 select m.id, count(u.id) from public.rental_models m left join public.rental_units u on u.model_id=m.id and u.status='available'
 and not exists(select 1 from public.rental_orders o where o.unit_id=u.id and o.status in ('approved','active') and
   (daterange(o.pickup,o.dropoff,'[)') && daterange(p_pickup,p_dropoff,'[)') or (o.status='active' and o.dropoff <= (now() at time zone 'America/Caracas')::date)))
 where p_dropoff>p_pickup and p_dropoff-p_pickup<=90 group by m.id;
$$;
revoke all on function public.rental_availability(date,date) from public;
grant execute on function public.rental_availability(date,date) to anon,authenticated;

create function public.rental_create_order(p_input jsonb,p_request_id uuid) returns public.rental_orders
language plpgsql security definer set search_path='' as $$
declare result public.rental_orders; rate numeric; start_date date; end_date date;
begin
 if auth.uid() is null then raise exception 'Inicia sesión para crear la orden.'; end if;
 -- Serialize retries from the same account. All amounts come from the database.
 perform 1 from public.rental_profiles where id=auth.uid() for update;
 select * into result from public.rental_orders where customer_id=auth.uid() and request_id=p_request_id;
 if found then return result; end if;
 start_date:=(p_input->>'pickup')::date; end_date:=(p_input->>'dropoff')::date;
 if start_date is null or end_date is null or start_date<(now() at time zone 'America/Caracas')::date or end_date<=start_date or end_date-start_date>90 then raise exception 'Revisa las fechas del alquiler (1 a 90 días).'; end if;
 if (select count(*) from public.rental_orders where customer_id=auth.uid() and status='pending')>=5 then raise exception 'Ya tienes cinco solicitudes pendientes. Revisa tus órdenes antes de crear otra.'; end if;
 select daily_rate into rate from public.rental_models where id=p_input->>'model_id';
 if rate is null then raise exception 'Vehículo desconocido.'; end if;
 if not exists(select 1 from public.rental_availability(start_date,end_date) a where a.model_id=p_input->>'model_id' and a.available>0) then raise exception 'No hay unidades disponibles para estas fechas.'; end if;
 insert into public.rental_orders(request_id,customer_id,model_id,pickup,dropoff,daily_rate,total,full_name,phone,email,document,license,license_expiry,pickup_location,return_location,notes,consent)
 values(p_request_id,auth.uid(),p_input->>'model_id',start_date,end_date,rate,rate*(end_date-start_date),trim(p_input->>'full_name'),trim(p_input->>'phone'),trim(p_input->>'email'),trim(p_input->>'document'),trim(p_input->>'license'),(p_input->>'license_expiry')::date,trim(p_input->>'pickup_location'),trim(p_input->>'return_location'),coalesce(p_input->>'notes',''),coalesce((p_input->>'consent')::boolean,false)) returning * into result;
 update public.rental_profiles set full_name=result.full_name,phone=result.phone where id=auth.uid();
 insert into public.rental_events(order_id,actor_id,message) values(result.id,auth.uid(),'Solicitud creada. Pendiente de pago y aprobación.');
 return result;
end; $$;

create function public.rental_order_action(p_input jsonb) returns public.rental_orders
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
   if a='payment' and (o.status not in ('pending','approved','active') or paid+amount>o.total) then raise exception 'El pago supera el saldo o la orden está cerrada.'; end if;
   if a='refund' and (o.status not in ('cancelled','rejected') or amount>paid) then raise exception 'Solo puedes reembolsar el saldo de una orden cancelada o rechazada.'; end if;
   insert into public.rental_payments(order_id,request_id,amount,method,reference,actor_id) values(o.id,request,case when a='refund' then -amount else amount end,trim(p_input->>'method'),trim(p_input->>'reference'),auth.uid());
   message:=case when a='refund' then 'Reembolso registrado: USD ' else 'Pago verificado: USD ' end||amount::text;
 elsif a='approve' then
   if o.status<>'pending' or paid<o.total then raise exception 'Para aprobar, verifica primero el pago completo de una orden pendiente.'; end if;
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

create function public.rental_save_unit(p_input jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.is_admin() then raise exception 'Solo administradores.'; end if;
 if nullif(p_input->>'id','') is null then
   insert into public.rental_units(model_id,label,plate,status) values(p_input->>'model_id',trim(p_input->>'label'),upper(trim(p_input->>'plate')),p_input->>'status');
 else
   perform 1 from public.rental_units where id=(p_input->>'id')::uuid for update;
   if not found then raise exception 'Unidad no encontrada.'; end if;
   if exists(select 1 from public.rental_orders where unit_id=(p_input->>'id')::uuid and status in ('approved','active')) then raise exception 'La unidad tiene alquileres confirmados. Resuelve esas órdenes antes de modificarla.'; end if;
   update public.rental_units set model_id=p_input->>'model_id',label=trim(p_input->>'label'),plate=upper(trim(p_input->>'plate')),status=p_input->>'status' where id=(p_input->>'id')::uuid;
 end if;
end; $$;
create function public.rental_set_rate(p_model_id text,p_rate numeric) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.is_admin() then raise exception 'Solo administradores.'; end if;
 update public.rental_models set daily_rate=p_rate where id=p_model_id;
 if not found then raise exception 'Modelo desconocido.'; end if;
end; $$;
revoke all on function public.rental_create_order(jsonb,uuid),public.rental_order_action(jsonb),public.rental_save_unit(jsonb),public.rental_set_rate(text,numeric) from public,anon;
grant execute on function public.rental_create_order(jsonb,uuid),public.rental_order_action(jsonb),public.rental_save_unit(jsonb),public.rental_set_rate(text,numeric) to authenticated;

-- Catalog only. Register actual physical vehicles in the admin panel before accepting orders.
insert into public.rental_models(id,make,model,category,daily_rate,seats,image) values
 ('lancer','Mitsubishi','Lancer','Económico',75,5,'/images/fleet-photo-lancer-mobile.webp'),
 ('cruze','Chevrolet','Cruze','Premium',85,5,'/images/fleet-photo-cruze-mobile.webp'),
 ('camry','Toyota','Camry','Luxury',110,5,'/images/fleet-photo-camry-mobile.webp'),
 ('cherokee','Jeep','Cherokee','SUV',130,5,'/images/fleet-photo-cherokee-mobile.webp'),
 ('explorer','Ford','Explorer','SUV Luxury',160,7,'/images/fleet-photo-explorer-mobile.webp');
commit;
