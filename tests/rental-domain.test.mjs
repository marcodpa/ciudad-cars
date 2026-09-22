import test from 'node:test';
import assert from 'node:assert/strict';
import { rentalDays,rentalToday,validateBooking,blocksUnit,orderMessage } from '../lib/rental-domain.ts';
import { GET } from '../app/api/rental-config/route.ts';
const input={model_id:'lancer',pickup:'2026-09-24',dropoff:'2026-09-27',full_name:'Conductor Ejemplo',phone:'+58 412 0000000',email:'conductor@example.com',document:'TEST-123',license:'LIC-123',license_expiry:'2027-01-01',pickup_location:'Oficina',return_location:'Oficina',notes:'',consent:true};
test('rental dates reject impossible days, past pickup, invalid licenses and missing consent',()=>{
 assert.equal(validateBooking(input,'2026-09-22'),3);
 assert.ok(Number.isNaN(rentalDays('2026-02-30','2026-03-03')));
 for(const edit of [{pickup:'2026-09-21'},{dropoff:'2026-09-24'},{license_expiry:'2026-09-26'},{license_expiry:''},{consent:false},{email:'bad'},{document:'a'}])assert.throws(()=>validateBooking({...input,...edit},'2026-09-22'));
 assert.equal(rentalToday(new Date('2026-09-22T02:00:00Z')),'2026-09-21');
});
test('availability counts confirmed dates, allows adjacent rentals and holds overdue active cars',()=>{
 const order={...input,status:'approved'};
 assert.equal(blocksUnit(order,'2026-09-26','2026-09-28','2026-09-22'),true);
 assert.equal(blocksUnit(order,'2026-09-27','2026-09-29','2026-09-22'),false);
 assert.equal(blocksUnit({...order,status:'pending'},'2026-09-24','2026-09-27','2026-09-22'),false);
 assert.equal(blocksUnit({...order,status:'active'},'2026-10-02','2026-10-04','2026-09-28'),true);
 assert.equal(blocksUnit({...order,status:'completed'},'2026-10-02','2026-10-04','2026-09-28'),false);
});
test('WhatsApp summary includes saved order and total, excludes government identifiers',()=>{
 const message=orderMessage({...input,code:'CC-1234',total:225},{make:'Mitsubishi',model:'Lancer'});
 for(const value of ['CC-1234','Mitsubishi Lancer','225','2026-09-24','aún no está confirmada'])assert.ok(message.includes(value));
 assert.ok(!message.includes(input.document));assert.ok(!message.includes(input.license));
});
test('public config fails closed for a secret key and only returns a publishable key',async()=>{
 const priorUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,priorKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 try {
  process.env.NEXT_PUBLIC_SUPABASE_URL='https://example-project.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='sb_secret_TEST_ONLY';
  assert.deepEqual(await GET().json(),{configured:false,url:'',key:''});
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='sb_publishable_TEST_ONLY';
  const response=GET();assert.equal(response.headers.get('cache-control'),'no-store');assert.equal((await response.json()).configured,true);
 } finally {if(priorUrl===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=priorUrl;if(priorKey===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=priorKey;}
});
