import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calendarDays,moveCalendar,indexCalendarOrders,summarizeCalendar,unitOnDay} from '../lib/fleet-calendar.ts';
const today='2026-09-22';
test('calendar starts on Monday and crosses months, leap days and years',()=>{
 const days=calendarDays('2024-02-29','month');assert.equal(days.length,42);assert.equal(days[0],'2024-01-29');assert.ok(days.includes('2024-02-29'));
 assert.equal(moveCalendar('2026-01-31','month',1),'2026-02-01');assert.equal(moveCalendar('2026-12-20','month',1),'2027-01-01');assert.equal(calendarDays(today,'week')[0],'2026-09-21');
});
test('calendar counts each vehicle once, keeps pending requests separate, and allows return-day reuse',()=>{
 const units=[{id:'a',status:'available'},{id:'b',status:'available'},{id:'c',status:'maintenance'},{id:'d',status:'inactive'}];
 const orders=[{id:'1',unit_id:'a',status:'active',pickup:'2026-09-18',dropoff:'2026-09-21'},{id:'2',unit_id:'a',status:'approved',pickup:today,dropoff:'2026-09-24'},{id:'3',unit_id:'b',status:'approved',pickup:'2026-09-20',dropoff:today},{id:'4',unit_id:null,status:'pending',pickup:today,dropoff:'2026-09-23'}];
 const s=summarizeCalendar(units,orders,[today],today).get(today);assert.deepEqual(s,{day:today,total:4,free:1,busy:1,offline:2,overdue:1,pickups:1,returns:1,pending:1});
 const detail=unitOnDay(units[0],indexCalendarOrders(orders).get('a'),today,today);assert.equal(detail.order.id,'1');assert.equal(detail.conflict,true);
 assert.equal(unitOnDay(units[0],[orders[0]],'2026-08-01',today).state,'free');
});
test('calendar aggregates 2000 vehicles without building a per-vehicle month table',()=>{
 const units=Array.from({length:2000},(_,i)=>({id:String(i),status:i<200?'maintenance':'available'}));
 const orders=units.slice(200,700).map(u=>({unit_id:u.id,status:'approved',pickup:'2026-09-22',dropoff:'2026-09-25'}));
 const result=summarizeCalendar(units,orders,calendarDays(today,'month'),today);assert.equal(result.size,42);assert.equal(result.get(today).free,1300);assert.equal(result.get(today).busy,500);assert.equal(result.get('2026-09-25').free,1800);
});
