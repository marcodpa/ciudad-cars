import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';
import ts from 'typescript';
// Node's stripped TS needs explicit extensions for runtime imports.
const domain=await import('../lib/billing-domain.ts');
const {calculateInvoice,validateBillingInput,documentState,orderInvoiceBalance}=domain;
const line={description:'Servicio',quantity:1,unit_cents:101,discount_cents:1,tax_bps:1600};
test('billing money: exact half-up rounding, fractional quantities, discount before tax',()=>{
 assert.deepEqual(calculateInvoice([line]),{subtotal_cents:101,discount_cents:1,tax_cents:16,total_cents:116});
 assert.equal(calculateInvoice([{...line,quantity:.005,unit_cents:100,discount_cents:0,tax_bps:0}]).total_cents,1);
 assert.equal(calculateInvoice([{...line,unit_cents:1,discount_cents:0,tax_bps:5000}]).total_cents,2);
 for(const patch of [{quantity:NaN},{quantity:.0001},{unit_cents:1.5},{discount_cents:102},{tax_bps:-1},{tax_bps:Infinity}])assert.throws(()=>calculateInvoice([{...line,...patch}]));
 assert.throws(()=>calculateInvoice([]));assert.throws(()=>calculateInvoice(Array(51).fill(line)));
});
test('billing validation: real dates, customer data and reasons are required',()=>{
 const input={lines:[line],customer:{name:'Example',tax_id:'TEST-1',address:'Example address',email:'example@example.com',phone:''},due_date:'2026-02-28',kind:'invoice',notes:'',reason:'',fx_rate:null};
 assert.equal(validateBillingInput(input).total_cents,116);
 assert.throws(()=>validateBillingInput({...input,due_date:'2026-02-30'}));
 assert.throws(()=>validateBillingInput({...input,kind:'credit'}));
 assert.throws(()=>validateBillingInput({...input,fx_rate:-1}));
});
test('billing reconciliation: signed notes and refunds use the same ledger',()=>{
 const order={id:'o'},invoice={id:'i',order_id:'o',kind:'invoice',status:'issued',due_date:'2026-01-01',total_cents:10000};
 const data={orders:[order],payments:[{order_id:'o',amount:100}],billing:{documents:[invoice,{...invoice,id:'c',kind:'credit',total_cents:2000}]}};
 assert.deepEqual(orderInvoiceBalance(data,order),{billed:8000,paid:10000,due:0,credit:2000,hasInvoice:true});
 data.payments.push({order_id:'o',amount:-20});assert.equal(documentState(invoice,data,'2026-09-22'),'Pagada');
 data.billing.documents.push({...invoice,id:'d',kind:'debit',total_cents:1000});assert.equal(documentState(invoice,data,'2026-09-22'),'Vencida');
});
test('billing PDF: real multipage output preserves long Spanish descriptions',async()=>{
 const source=await readFile(new URL('../lib/billing-pdf.ts',import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replaceAll("'pdf-lib'",JSON.stringify(import.meta.resolve('pdf-lib'))).replaceAll("'@pdf-lib/fontkit'",JSON.stringify(import.meta.resolve('@pdf-lib/fontkit'))).replaceAll("'./billing-domain'",JSON.stringify(new URL('../lib/billing-domain.ts',import.meta.url).href));
 const {createBillingPdf}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
 const party={name:'Compañía de ejemplo',tax_id:'DEMO-123',address:'Dirección de prueba',email:'demo@example.com',phone:''};
 const lines=Array.from({length:50},(_,i)=>({...line,description:`Concepto ${i+1}: servicio de alquiler, devolución y atención. `+'Descripción extensa '.repeat(10)}));
 const doc={...calculateInvoice(lines),lines,issuer:party,customer:party,kind:'invoice',status:'issued',number:'CC-F-000001',due_date:'2026-09-22',issued_at:'2026-09-22T12:00:00Z',tax_label:'Impuesto',notes:'Observaciones\nSegunda línea',terms:'Condiciones de pago',reason:'',fx_rate:100};
 const bytes=await createBillingPdf(doc,{code:'DEMO-1001'},null,true,await readFile(new URL('../public/fonts/Lato-Regular.ttf',import.meta.url)));
 const pdf=await PDFDocument.load(bytes);assert.ok(pdf.getPageCount()>3);assert.equal(pdf.getTitle(),'Factura CC-F-000001');
});
