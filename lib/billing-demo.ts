import {
  defaultBillingSettings,
  validateBillingInput,
  validateParty,
  type BillingInput,
  type BillingDocument,
  type BillingSettings,
} from './billing-domain';
import type { RentalData } from './rental-domain';

export function ensureBillingData(data: RentalData) {
  data.billing ??= {
    settings: [
      {
        ...defaultBillingSettings,
        name: 'Ciudad Cars · DEMOSTRACIÓN',
        tax_id: 'DEMO-SIN-VALIDEZ',
        address: 'Dirección de ejemplo, Maracaibo',
        email: 'demo@example.com',
        phone: '',
      },
    ],
    documents: [],
  };
  return data;
}
export function demoBillingSettings(data: RentalData, input: BillingSettings) {
  validateParty(input);
  if (
    !/^[A-Z0-9-]{1,10}$/.test(input.prefix) ||
    !Number.isInteger(input.tax_bps) ||
    input.tax_bps < 0 ||
    input.tax_bps > 10000 ||
    input.terms.length > 2000 ||
    !input.tax_label.trim() ||
    input.tax_label.length > 40
  )
    throw new Error('Revisa la serie, el impuesto y las condiciones.');
  const billing = ensureBillingData(data).billing!,
    previous = billing.settings[0];
  if (
    previous.prefix !== input.prefix &&
    billing.documents.some((d) => d.status === 'issued')
  )
    throw new Error('La serie no puede cambiar después de emitir documentos.');
  billing.settings[0] = {
    ...input,
    next_invoice: previous.next_invoice,
    next_credit: previous.next_credit,
    next_debit: previous.next_debit,
  };
}
export function demoBillingAction(data: RentalData, input: BillingInput) {
  const billing = ensureBillingData(data).billing!,
    cfg = billing.settings[0];
  // The fake ledger stores request results too, so retries survive page navigation.
  const requests = ((
    billing as typeof billing & { requests?: Record<string, string> }
  ).requests ??= {});
  const previous = requests[input.request_id];
  if (previous) return billing.documents.find((d) => d.id === previous)!;
  const order = data.orders.find((o) => o.id === input.order_id);
  if (!order) throw new Error('Orden no encontrada.');
  let doc = billing.documents.find(
    (d) => d.id === input.id && d.order_id === order.id,
  );
  if (
    input.id &&
    (!doc || doc.status !== 'draft' || doc.version !== input.version)
  )
    throw new Error(
      'El documento cambió o ya fue emitido. Actualiza antes de guardar.',
    );
  if (input.action === 'save') {
    const totals = validateBillingInput(input);
    if (
      ['cancelled', 'rejected'].includes(order.status) &&
      input.kind !== 'credit'
    )
      throw new Error('Solo puedes acreditar una orden cerrada.');
    if (
      doc &&
      (doc.kind !== input.kind || doc.parent_id !== (input.parent_id || null))
    )
      throw new Error('No puedes cambiar el tipo de documento.');
    if (
      input.kind === 'invoice' &&
      billing.documents.some(
        (d) =>
          d.order_id === order.id &&
          d.kind === 'invoice' &&
          d.status !== 'void' &&
          d.id !== doc?.id,
      )
    )
      throw new Error(
        'Esta orden ya tiene una factura. Abre el documento existente.',
      );
    const parent = billing.documents.find(
      (d) =>
        d.id === input.parent_id &&
        d.order_id === order.id &&
        d.kind === 'invoice' &&
        d.status === 'issued',
    );
    if (input.kind !== 'invoice' && !parent)
      throw new Error('La nota requiere una factura emitida.');
    const value: BillingDocument = {
      ...totals,
      id: doc?.id || crypto.randomUUID(),
      order_id: order.id,
      customer_id: order.customer_id,
      kind: input.kind,
      parent_id: input.parent_id || null,
      status: 'draft',
      number: null,
      version: doc ? doc.version + 1 : 1,
      lines: structuredClone(input.lines),
      customer: structuredClone(parent?.customer || input.customer),
      issuer: structuredClone(parent?.issuer || cfg),
      due_date: input.due_date,
      created_at: doc?.created_at || new Date().toISOString(),
      issued_at: null,
      notes: input.notes,
      reason: input.reason,
      terms: parent?.terms ?? cfg.terms,
      tax_label: parent?.tax_label ?? cfg.tax_label,
      fx_rate: input.fx_rate,
      currency: 'USD',
    };
    billing.documents = [
      value,
      ...billing.documents.filter((d) => d.id !== value.id),
    ];
    doc = value;
  } else if (input.action === 'issue') {
    if (!doc) throw new Error('Primero guarda el borrador.');
    validateParty(doc.issuer);
    validateParty(doc.customer);
    if (
      ['cancelled', 'rejected'].includes(order.status) &&
      doc.kind !== 'credit'
    )
      throw new Error('Solo puedes acreditar una orden cerrada.');
    const issued = billing.documents.filter(
      (d) => d.order_id === order.id && d.status === 'issued',
    );
    if (doc.kind === 'credit')
      for (const field of ['total', 'tax', 'base'] as const) {
        const amount = (d: BillingDocument) =>
          field === 'base'
            ? d.subtotal_cents - d.discount_cents
            : d[(field + '_cents') as 'total_cents' | 'tax_cents'];
        const remaining = issued.reduce(
          (s, d) => s + (d.kind === 'credit' ? -1 : 1) * amount(d),
          0,
        );
        if (amount(doc) > remaining)
          throw new Error(
            'La nota supera el importe o impuesto pendiente de acreditar.',
          );
      }
    const net = [...issued, doc].reduce(
      (s, d) => s + (d.kind === 'credit' ? -1 : 1) * d.total_cents,
      0,
    );
    if (net < 0 || net > 1000000000)
      throw new Error('El total facturado excede los límites de la orden.');
    const key =
      doc.kind === 'invoice'
        ? 'next_invoice'
        : doc.kind === 'credit'
          ? 'next_credit'
          : 'next_debit';
    doc.number = `${cfg.prefix}-${doc.kind === 'invoice' ? 'F' : doc.kind === 'credit' ? 'NC' : 'ND'}-${String(cfg[key]++).padStart(6, '0')}`;
    doc.status = 'issued';
    doc.issued_at = new Date().toISOString();
    doc.version++;
    order.billing_total = net / 100;
  } else {
    if (!doc || input.reason.trim().length < 5)
      throw new Error('Indica el motivo para anular el borrador.');
    doc.status = 'void';
    doc.reason = input.reason;
    doc.version++;
  }
  requests[input.request_id] = doc.id;
  data.events.unshift({
    id: crypto.randomUUID(),
    order_id: order.id,
    created_at: new Date().toISOString(),
    message:
      input.action === 'issue'
        ? `Documento emitido: ${doc.number}`
        : input.action === 'void'
          ? 'Borrador de facturación anulado.'
          : 'Borrador de facturación guardado.',
  });
  return doc;
}
