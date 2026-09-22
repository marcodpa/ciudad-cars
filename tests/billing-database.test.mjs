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
 await db.exec(await readFile(new URL('../supabase/migrations/202609220002_billing.sql',import.meta.url),'utf8'));
 for(const [id,email] of [[admin,'admin@example.com'],[alice,'alice@example.com'],[bob,'bob@example.com']]) await db.query('insert into auth.users(id,email) values($1,$2)',[id,email]);
 await db.query("update rental_profiles set role='admin' where id=$1",[admin]);
 const {rows:[dates]}=await db.query("select ((now() at time zone 'America/Caracas')::date+1)::text as pickup,((now() at time zone 'America/Caracas')::date+4)::text as dropoff,((now() at time zone 'America/Caracas')::date+365)::text as expiry");
 booking={model_id:'lancer',pickup:dates.pickup,dropoff:dates.dropoff,full_name:'Alice Example',phone:'+58 412 0000000',email:'alice@example.com',document:'TEST-0001',license:'TEST-0001',license_expiry:dates.expiry,pickup_location:'Oficina',return_location:'Oficina',notes:'',consent:true};
 await rpc(admin,'rental_save_unit',{model_id:'lancer',label:'Lancer 01',plate:'TEST-001',status:'available'});
 unit=(await asUser(admin,'select id from rental_units')).rows[0].id;
});
after(async()=>{await db.close();});
const party={name:'Ciudad Cars Example',tax_id:'TEST-0001',address:'Dirección de pruebas, Venezuela',email:'demo@example.com',phone:''};
const line={description:'Alquiler 3 días',quantity:3,unit_cents:7500,discount_cents:500,tax_bps:1600};
let draft,issued,credit;
const bill=(input)=>rpc(admin,'rental_billing_action',{request_id:uuid(),...input});
test('billing: protected configuration and drafts; totals recomputed in SQL',async()=>{
 await assert.rejects(()=>rpc(alice,'rental_billing_settings_save',party),/administradores/);
 await rpc(admin,'rental_billing_settings_save',{...party,prefix:'CC',terms:'Condiciones de prueba',tax_label:'Impuesto',tax_bps:1600});
 order=await rpc(alice,'rental_create_order',booking,uuid());
 draft=await bill({action:'save',order_id:order.id,kind:'invoice',customer:party,lines:[line],due_date:booking.pickup,total_cents:1});
 assert.equal(Number(draft.total_cents),25520);assert.equal(draft.number,null);
 assert.equal((await asUser(alice,'select * from rental_billing_documents')).rows.length,0);
 assert.equal((await asUser(alice,'select * from rental_billing_settings')).rows.length,0);
 await assert.rejects(()=>rpc(alice,'rental_billing_action',{action:'issue',id:draft.id,order_id:order.id,version:1,request_id:uuid()}),/administradores/);
 await assert.rejects(()=>asUser(alice,'update rental_billing_documents set total_cents=1'),/permission denied/);
});
test('billing: draft edits use optimistic locking and only issuance assigns a number',async()=>{
 draft=await bill({action:'save',id:draft.id,version:draft.version,order_id:order.id,kind:'invoice',customer:party,lines:[line],due_date:booking.pickup});
 assert.equal(draft.version,2);
 await assert.rejects(()=>bill({action:'issue',id:draft.id,order_id:order.id,version:1}),/cambió/);
 const input={action:'issue',id:draft.id,order_id:order.id,version:draft.version,request_id:uuid()};
 issued=await bill(input);assert.equal(issued.number,'CC-F-000001');assert.equal((await bill(input)).number,issued.number);
 assert.equal((await asUser(alice,'select * from rental_billing_documents')).rows.length,1);
 assert.equal((await asUser(bob,'select * from rental_billing_documents')).rows.length,0);
 await db.exec('reset role');await assert.rejects(()=>db.query('update rental_billing_documents set notes=$1 where id=$2',['overwrite',issued.id]),/no puede modificarse/);
 await assert.rejects(()=>bill({action:'void',id:issued.id,version:issued.version,order_id:order.id,reason:'Cancelación'}),/emitido/);
 await assert.rejects(()=>rpc(admin,'rental_billing_settings_save',{...party,prefix:'RESET',terms:'',tax_label:'Impuesto',tax_bps:0}),/serie/);
});
test('billing: a single payment ledger follows billed total, credits authorize only the overpayment refund',async()=>{
 await rpc(admin,'rental_order_action',{order_id:order.id,action:'payment',amount:255.20,method:'Transferencia',reference:'BILL-PAY-1',request_id:uuid()});
 await assert.rejects(()=>rpc(admin,'rental_order_action',{order_id:order.id,action:'refund',amount:1,method:'Transferencia',reference:'BAD',request_id:uuid()}),/saldo a favor/);
 const input={action:'save',order_id:order.id,kind:'credit',parent_id:issued.id,customer:party,lines:[{...line,quantity:1,unit_cents:5000,discount_cents:0}],due_date:booking.pickup,reason:'Reducción de servicio'};
 credit=await bill(input);credit=await bill({action:'issue',order_id:order.id,id:credit.id,version:credit.version});
 assert.equal(credit.number,'CC-NC-000001');assert.equal(Number((await asUser(admin,'select billing_total from rental_orders where id=$1',[order.id])).rows[0].billing_total),197.20);
 await assert.rejects(()=>rpc(admin,'rental_order_action',{order_id:order.id,action:'refund',amount:58.01,method:'Transferencia',reference:'BAD2',request_id:uuid()}),/saldo a favor/);
 await rpc(admin,'rental_order_action',{order_id:order.id,action:'refund',amount:58,method:'Transferencia',reference:'REF-BILL',request_id:uuid()});
 assert.equal(Number((await asUser(admin,'select sum(amount) as paid from rental_payments')).rows[0].paid),197.20);
 const tooMuch=await bill({...input,lines:[{...line,quantity:99,discount_cents:0}]});
 await assert.rejects(()=>bill({action:'issue',order_id:order.id,id:tooMuch.id,version:tooMuch.version}),/supera/);
 const debit=await bill({...input,kind:'debit',lines:[{...line,quantity:1,unit_cents:1000,discount_cents:0}]});
 const debitIssued=await bill({action:'issue',order_id:order.id,id:debit.id,version:debit.version});assert.equal(debitIssued.number,'CC-ND-000001');
 await assert.rejects(()=>bill({...input,kind:'invoice',parent_id:null}),/unique constraint/);
});
test('billing: non-finite dates and amounts cannot enter a draft; voiding preserves history',async()=>{
 const input={action:'save',order_id:order.id,kind:'debit',parent_id:issued.id,customer:party,lines:[line],due_date:booking.pickup,reason:'Cargo adicional de ejemplo'};
 await assert.rejects(()=>bill({...input,due_date:'infinity'}),/vencimiento/);
 await assert.rejects(()=>bill({...input,lines:[{...line,quantity:'NaN'}]}),/cantidades/);
 const d=await bill(input);
 const v=await bill({action:'void',id:d.id,order_id:order.id,version:d.version,reason:'Borrador creado por error'});
 assert.equal(v.status,'void');assert.equal(v.number,null);
 await assert.rejects(()=>bill({action:'issue',id:v.id,order_id:order.id,version:v.version}),/anulado/);
});
