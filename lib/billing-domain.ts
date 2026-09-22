import type { RentalData, RentalOrder } from './rental-domain';
export type InvoiceKind = 'invoice' | 'credit' | 'debit';
export type BillingParty = {
  name: string;
  tax_id: string;
  address: string;
  email: string;
  phone: string;
};
export type BillingSettings = BillingParty & {
  id: number;
  prefix: string;
  terms: string;
  tax_label: string;
  tax_bps: number;
  next_invoice: number;
  next_credit: number;
  next_debit: number;
};
export type BillingLine = {
  description: string;
  quantity: number;
  unit_cents: number;
  discount_cents: number;
  tax_bps: number;
};
export type BillingTotals = {
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
};
export type BillingDocument = BillingTotals & {
  id: string;
  order_id: string;
  customer_id: string;
  kind: InvoiceKind;
  parent_id: string | null;
  status: 'draft' | 'issued' | 'void';
  number: string | null;
  version: number;
  lines: BillingLine[];
  customer: BillingParty;
  issuer: BillingParty;
  due_date: string;
  issued_at: string | null;
  created_at: string;
  notes: string;
  reason: string;
  terms: string;
  tax_label: string;
  fx_rate: number | null;
  currency: 'USD';
};
export type BillingData = {
  settings: BillingSettings[];
  documents: BillingDocument[];
};
export type BillingInput = {
  action: 'save' | 'issue' | 'void';
  id?: string;
  order_id: string;
  kind: InvoiceKind;
  parent_id?: string | null;
  version?: number;
  lines: BillingLine[];
  customer: BillingParty;
  due_date: string;
  notes: string;
  reason: string;
  fx_rate: number | null;
  request_id: string;
};
export const documentLabels: Record<InvoiceKind, string> = {
  invoice: 'Factura',
  credit: 'Nota de crédito',
  debit: 'Nota de débito',
};
export const emptyParty: BillingParty = {
  name: '',
  tax_id: '',
  address: '',
  email: '',
  phone: '',
};
export const defaultBillingSettings: BillingSettings = {
  ...emptyParty,
  id: 1,
  prefix: 'CC',
  terms: 'Pago coordinado con Ciudad Cars.',
  tax_label: 'Impuesto',
  tax_bps: 0,
  next_invoice: 1,
  next_credit: 1,
  next_debit: 1,
};
// Quantities have 3 decimals. Monetary values and percentages are integers (cents / basis points).
// BigInt gives the same positive round-half-up result as PostgreSQL numeric.
export function calculateInvoice(lines: BillingLine[]): BillingTotals {
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > 50)
    throw new Error('Añade entre 1 y 50 conceptos.');
  let subtotal = 0,
    discount = 0,
    tax = 0;
  for (const line of lines) {
    if (!line.description?.trim() || line.description.length > 300)
      throw new Error(
        'Cada concepto necesita una descripción de hasta 300 caracteres.',
      );
    const q = Math.round(line.quantity * 1000);
    if (
      !Number.isFinite(line.quantity) ||
      line.quantity <= 0 ||
      line.quantity > 10000 ||
      Math.abs(line.quantity * 1000 - q) > 0.000001
    )
      throw new Error(
        'La cantidad debe ser positiva y tener hasta 3 decimales.',
      );
    if (
      !Number.isInteger(line.unit_cents) ||
      line.unit_cents < 0 ||
      line.unit_cents > 100000000
    )
      throw new Error('Revisa el precio del concepto.');
    if (
      !Number.isInteger(line.tax_bps) ||
      line.tax_bps < 0 ||
      line.tax_bps > 10000
    )
      throw new Error('El impuesto debe estar entre 0 y 100%.');
    const gross = Number(
      (BigInt(q) * BigInt(line.unit_cents) + BigInt(500)) / BigInt(1000),
    );
    if (
      !Number.isInteger(line.discount_cents) ||
      line.discount_cents < 0 ||
      line.discount_cents > gross
    )
      throw new Error('El descuento no puede superar el importe del concepto.');
    subtotal += gross;
    discount += line.discount_cents;
    tax += Number(
      (BigInt(gross - line.discount_cents) * BigInt(line.tax_bps) +
        BigInt(5000)) /
        BigInt(10000),
    );
  }
  const total = subtotal - discount + tax;
  if (total <= 0 || total > 1000000000)
    throw new Error('El total debe ser positivo y no superar 10.000.000 USD.');
  return {
    subtotal_cents: subtotal,
    discount_cents: discount,
    tax_cents: tax,
    total_cents: total,
  };
}
export function validateParty(p: BillingParty) {
  if (
    !p ||
    p.name.trim().length < 3 ||
    p.name.length > 160 ||
    p.tax_id.trim().length < 4 ||
    p.tax_id.length > 40 ||
    p.address.trim().length < 5 ||
    p.address.length > 500
  )
    throw new Error(
      'Completa nombre o razón social, identificación fiscal y dirección.',
    );
  if (
    p.email.length > 254 ||
    (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) ||
    p.phone.length > 40
  )
    throw new Error('Revisa el correo y teléfono de facturación.');
}
export function validateBillingInput(input: BillingInput) {
  const totals = calculateInvoice(input.lines);
  validateParty(input.customer);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.due_date) ||
    !Number.isFinite(Date.parse(input.due_date)) ||
    new Date(input.due_date).toISOString().slice(0, 10) !== input.due_date
  )
    throw new Error('Selecciona una fecha de vencimiento válida.');
  if (input.notes.length > 2000 || input.reason.length > 500)
    throw new Error('Reduce las notas o el motivo del documento.');
  if (input.kind !== 'invoice' && input.reason.trim().length < 5)
    throw new Error('Escribe el motivo de la nota.');
  if (
    input.fx_rate !== null &&
    (!Number.isFinite(input.fx_rate) ||
      input.fx_rate <= 0 ||
      input.fx_rate > 1000000)
  )
    throw new Error('La tasa de cambio debe ser positiva.');
  return totals;
}
export function orderInvoiceBalance(data: RentalData, order: RentalOrder) {
  const docs = (data.billing?.documents || []).filter(
    (d) => d.order_id === order.id && d.status === 'issued',
  );
  const billed = docs.reduce(
    (n, d) => n + (d.kind === 'credit' ? -1 : 1) * d.total_cents,
    0,
  );
  const paid = data.payments
    .filter((p) => p.order_id === order.id)
    .reduce((n, p) => n + Math.round(Number(p.amount) * 100), 0);
  return {
    billed,
    paid,
    due: Math.max(0, billed - paid),
    credit: Math.max(0, paid - billed),
    hasInvoice: docs.some((d) => d.kind === 'invoice'),
  };
}
export function documentState(
  doc: BillingDocument,
  data: RentalData,
  today: string,
) {
  if (doc.status === 'draft') return 'Borrador';
  if (doc.status === 'void') return 'Anulado';
  if (doc.kind !== 'invoice') return 'Emitida';
  const order = data.orders.find((o) => o.id === doc.order_id);
  if (!order) return 'Emitida';
  const balance = orderInvoiceBalance(data, order);
  if (balance.billed === 0) return 'Acreditada';
  if (balance.due === 0) return 'Pagada';
  if (doc.due_date < today) return 'Vencida';
  if (balance.paid > 0) return 'Pago parcial';
  return 'Por cobrar';
}
export function moneyCents(cents: number) {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
export function billingDate(timestamp: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}
export function billingCsv(rows: (string | number)[][]) {
  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((value) => {
            const cell =
              typeof value === 'number'
                ? String(value)
                : value.replace(/^[\s]*[=+@\-\t\r\n]/, "'$&");
            return '"' + cell.replaceAll('"', '""') + '"';
          })
          .join(','),
      )
      .join('\r\n')
  );
}
export function refundableAmount(data: RentalData, order: RentalOrder) {
  const paid = data.payments
    .filter((p) => p.order_id === order.id)
    .reduce((s, p) => s + Number(p.amount), 0);
  return ['cancelled', 'rejected'].includes(order.status)
    ? paid
    : Math.max(0, paid - (order.billing_total ?? order.total));
}
