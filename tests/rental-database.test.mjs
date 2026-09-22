import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
const db=new PGlite({extensions:{btree_gist}});
const admin='00000000-0000-4000-8000-000000000001', alice='00000000-0000-4000-8000-000000000002', bob='00000000-0000-4000-8000-000000000003';
const uuid=()=>crypto.randomUUID();
async function asUser(user,sql,params=[]) {
 await db.exec('reset role');
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user || '']);
 await db.exec(`set role ${user?'authenticated':'anon'}`);
 return db.query(sql,params);
}
async function rpc(user,fn,input,request) { return (await asUser(user,`select * from public.${fn}($1::jsonb${request?',$2::uuid':''})`,request?[JSON.stringify(input),request]:[JSON.stringify(input)])).rows[0]; }
let order,unit,booking;
before(async()=>{
 await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}'::jsonb); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
 await db.exec(await readFile(new URL('../supabase/migrations/202609220001_rental_system.sql',import.meta.url),'utf8'));
 for(const [id,email] of [[admin,'admin@example.com'],[alice,'alice@example.com'],[bob,'bob@example.com']]) await db.query('insert into auth.users(id,email) values($1,$2)',[id,email]);
 await db.query("update rental_profiles set role='admin' where id=$1",[admin]);
 const {rows:[dates]}=await db.query("select ((now() at time zone 'America/Caracas')::date+1)::text as pickup,((now() at time zone 'America/Caracas')::date+4)::text as dropoff,((now() at time zone 'America/Caracas')::date+365)::text as expiry");
 booking={model_id:'lancer',pickup:dates.pickup,dropoff:dates.dropoff,full_name:'Alice Example',phone:'+58 412 0000000',email:'alice@example.com',document:'TEST-0001',license:'TEST-0001',license_expiry:dates.expiry,pickup_location:'Oficina',return_location:'Oficina',notes:'',consent:true};
 await rpc(admin,'rental_save_unit',{model_id:'lancer',label:'Lancer 01',plate:'TEST-001',status:'available'});
 unit=(await asUser(admin,'select id from rental_units')).rows[0].id;
});
after(async()=>{await db.close();});
test('database: guest cannot read personal data or create orders',async()=>{
 await assert.rejects(()=>asUser(null,'select * from rental_orders'),/permission denied/);
 await assert.rejects(()=>rpc(null,'rental_create_order',booking,uuid()),/permission denied/);
 assert.equal((await asUser(null,'select * from rental_availability($1,$2)',[booking.pickup,booking.dropoff])).rows.find(r=>r.model_id==='lancer').available,1);
});
test('database: server fixes prices, retries are idempotent, and clients cannot promote themselves',async()=>{
 const request=uuid(); order=await rpc(alice,'rental_create_order',{...booking,total:1,daily_rate:1,status:'approved',customer_id:bob},request);
 assert.equal(Number(order.total),225); assert.equal(order.status,'pending'); assert.equal(order.customer_id,alice);
 assert.equal((await rpc(alice,'rental_create_order',booking,request)).id,order.id);
 await assert.rejects(()=>asUser(alice,"update rental_profiles set role='admin' where id=$1",[alice]),/permission denied/);
 await assert.rejects(()=>asUser(alice,"update rental_orders set status='approved'"),/permission denied/);
 assert.equal((await asUser(bob,'select * from rental_orders')).rows.length,0);
 await assert.rejects(()=>rpc(bob,'rental_order_action',{order_id:order.id,action:'cancel',request_id:uuid()}),/Orden no disponible/);
});
test('database: approval requires payment; customers cannot record it; retries do not charge twice',async()=>{
 await assert.rejects(()=>rpc(admin,'rental_order_action',{order_id:order.id,action:'approve',unit_id:unit,request_id:uuid()}),/pago completo/);
 const payment={order_id:order.id,action:'payment',amount:225,method:'Transferencia',reference:'TEST-PAY-001',request_id:uuid()};
 await assert.rejects(()=>rpc(alice,'rental_order_action',payment),/administrador/);
 await rpc(admin,'rental_order_action',payment); await rpc(admin,'rental_order_action',payment);
 assert.equal((await asUser(admin,'select * from rental_payments')).rows.length,1);
 assert.equal((await asUser(bob,'select * from rental_payments')).rows.length,0);
 const approved=await rpc(admin,'rental_order_action',{order_id:order.id,action:'approve',unit_id:unit,request_id:uuid()}); assert.equal(approved.status,'approved');
 assert.equal((await asUser(null,'select * from rental_availability($1,$2)',[booking.pickup,booking.dropoff])).rows.find(r=>r.model_id==='lancer').available,0);
});
test('database: confirmed inventory cannot be overwritten; cancellation frees dates and refunds reconcile',async()=>{
 await assert.rejects(()=>rpc(admin,'rental_save_unit',{id:unit,model_id:'lancer',label:'Changed',plate:'TEST-002',status:'maintenance'}),/alquileres confirmados/);
 await assert.rejects(()=>rpc(alice,'rental_order_action',{order_id:order.id,action:'cancel',request_id:uuid()}),/administrador/);
 await rpc(admin,'rental_order_action',{order_id:order.id,action:'cancel',request_id:uuid()});
 assert.equal((await asUser(null,'select * from rental_availability($1,$2)',[booking.pickup,booking.dropoff])).rows.find(r=>r.model_id==='lancer').available,1);
 await assert.rejects(()=>rpc(admin,'rental_order_action',{order_id:order.id,action:'refund',amount:226,method:'Transferencia',reference:'REF-1',request_id:uuid()}),/reembolsar/);
 await rpc(admin,'rental_order_action',{order_id:order.id,action:'refund',amount:225,method:'Transferencia',reference:'REF-1',request_id:uuid()});
 assert.equal(Number((await asUser(admin,'select sum(amount) as paid from rental_payments')).rows[0].paid),0);
});
test('database: pending requests can overlap but two approvals cannot',async()=>{
 const one=await rpc(alice,'rental_create_order',booking,uuid()); const two=await rpc(bob,'rental_create_order',booking,uuid());
 for(const o of [one,two]) await rpc(admin,'rental_order_action',{order_id:o.id,action:'payment',amount:225,method:'Transferencia',reference:`PAY-${o.id}`,request_id:uuid()});
 await rpc(admin,'rental_order_action',{order_id:one.id,action:'approve',unit_id:unit,request_id:uuid()});
 await assert.rejects(()=>rpc(admin,'rental_order_action',{order_id:two.id,action:'approve',unit_id:unit,request_id:uuid()}),/ocupada/);
 await db.exec('reset role');
 await assert.rejects(()=>db.query("update rental_orders set unit_id=$1,status='approved' where id=$2",[unit,two.id]),/exclusion constraint/);
});
