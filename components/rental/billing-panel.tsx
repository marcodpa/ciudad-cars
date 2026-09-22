/* Native navigation deliberately resets account-bound state. */
/* eslint-disable next/no-html-link-for-pages */
'use client';
import { useRef, useState, type SubmitEvent } from 'react';
import {
  FileText,
  Plus,
  Download,
  Settings2,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRental } from './rental-provider';
import { rentalError } from '@/lib/rental-client';
import { rentalToday, rentalDays, type RentalOrder } from '@/lib/rental-domain';
import {
  calculateInvoice,
  billingCsv,
  billingDate,
  documentLabels,
  defaultBillingSettings,
  documentState,
  moneyCents,
  orderInvoiceBalance,
  type BillingDocument,
  type BillingInput,
  type BillingLine,
  type BillingParty,
  type BillingSettings,
  type InvoiceKind,
} from '@/lib/billing-domain';

type Draft = Omit<BillingInput, 'action' | 'request_id'>;
function initialDraft(
  order: RentalOrder,
  tax: number,
  demo: boolean,
  parent?: BillingDocument,
  kind: InvoiceKind = 'invoice',
): Draft {
  return {
    order_id: order.id,
    kind,
    parent_id: parent?.id || null,
    customer: parent?.customer || {
      name: order.full_name,
      tax_id: order.document,
      address:
        order.home_address || (demo ? 'Dirección de ejemplo, Maracaibo' : ''),
      email: order.email,
      phone: order.phone,
    },
    lines: [
      {
        description:
          kind === 'invoice'
            ? `Alquiler · ${order.pickup} al ${order.dropoff}`
            : '',
        quantity:
          kind === 'invoice' ? rentalDays(order.pickup, order.dropoff) : 1,
        unit_cents: kind === 'invoice' ? Math.round(order.daily_rate * 100) : 0,
        discount_cents: 0,
        tax_bps: tax,
      },
    ],
    due_date: rentalToday(),
    notes: '',
    reason: '',
    fx_rate: parent?.fx_rate ?? null,
  };
}
export function BillingPanel({ orderId }: { orderId?: string | null }) {
  const { data, user, href, demo } = useRental(),
    admin = user?.role === 'admin';
  const [query, setQuery] = useState(''),
    [status, setStatus] = useState('all'),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [selected, setSelected] = useState<string | null>(null),
    [draft, setDraft] = useState<Draft | null>(null),
    [settings, setSettings] = useState(false),
    [newOrder, setNewOrder] = useState(orderId || '');
  const cfg = data.billing?.settings[0] || defaultBillingSettings;
  const docs = (data.billing?.documents || []).filter(
    (d) => admin || (d.customer_id === user?.id && d.status === 'issued'),
  );
  const orders = data.orders.filter((o) => admin || o.customer_id === user?.id);
  const filtered = docs
    .filter((d) => {
      const date = billingDate(d.issued_at || d.created_at);
      return (
        (!orderId || d.order_id === orderId) &&
        (!from || date >= from) &&
        (!to || date <= to) &&
        (status === 'all' ||
          documentState(d, data, rentalToday()) === status) &&
        `${d.number || 'Borrador'} ${d.customer.name} ${orders.find((o) => o.id === d.order_id)?.code || ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    })
    .toSorted((a, b) => b.created_at.localeCompare(a.created_at));
  const balances = orders
    .map((o) => orderInvoiceBalance(data, o))
    .filter((b) => b.hasInvoice);
  const sums = balances.reduce(
    (s, b) => ({
      billed: s.billed + b.billed,
      due: s.due + b.due,
      credit: s.credit + b.credit,
    }),
    { billed: 0, due: 0, credit: 0 },
  );
  const selectedDoc = docs.find((d) => d.id === selected);
  function open(doc: BillingDocument) {
    if (doc.status === 'draft' && admin) {
      setDraft({ ...doc });
      setSelected(null);
    } else setSelected(doc.id);
  }
  function create() {
    const o = orders.find((o) => o.id === newOrder);
    if (!o) return;
    const existing = docs.find(
      (d) => d.order_id === o.id && d.kind === 'invoice' && d.status !== 'void',
    );
    if (existing) open(existing);
    else setDraft(initialDraft(o, cfg.tax_bps, demo));
  }
  function csv() {
    const rows = [
      [
        'Documento',
        'Tipo',
        'Estado',
        'Orden',
        'Cliente',
        'Fecha',
        'Subtotal USD',
        'Descuento USD',
        'Impuesto USD',
        'Total USD',
      ],
      ...filtered.map((d) => [
        d.number || 'Borrador',
        documentLabels[d.kind],
        documentState(d, data, rentalToday()),
        orders.find((o) => o.id === d.order_id)?.code || '',
        d.customer.name,
        billingDate(d.issued_at || d.created_at),
        d.subtotal_cents / 100,
        d.discount_cents / 100,
        d.tax_cents / 100,
        ((d.kind === 'credit' ? -1 : 1) * d.total_cents) / 100,
      ]),
    ];
    const value = billingCsv(rows);
    downloadBlob(
      new Blob([value], { type: 'text/csv;charset=utf-8' }),
      'ciudad-cars-facturacion.csv',
    );
  }
  return (
    <div className="billing-panel">
      <div className="billing-summary">
        <div>
          <span>Facturado neto</span>
          <strong>{moneyCents(sums.billed)}</strong>
          <small>Facturas + débitos − créditos</small>
        </div>
        <div>
          <span>Por cobrar</span>
          <strong>{moneyCents(sums.due)}</strong>
          <small>Pagos registrados descontados</small>
        </div>
        <div>
          <span>Saldo a favor</span>
          <strong>{moneyCents(sums.credit)}</strong>
          <small>Disponible para reembolso</small>
        </div>
      </div>
      <div className="rental-card billing-toolbar">
        <div>
          <h2>Documentos de alquiler</h2>
          <p>Cada factura conectada con su orden y sus pagos.</p>
        </div>
        <div className="rental-inline">
          <button
            className="rental-button secondary compact"
            onClick={csv}
            disabled={!filtered.length}
          >
            <Download size={16} />
            Exportar CSV
          </button>
          {admin && (
            <button
              className="rental-button secondary compact"
              onClick={() => setSettings(true)}
            >
              <Settings2 size={16} />
              Datos de facturación
            </button>
          )}
        </div>
        {admin && (
          <div className="billing-create rental-form">
            <label htmlFor="billing-order">Orden a facturar</label>
            <div className="rental-inline">
              <select
                id="billing-order"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
              >
                <option value="">Selecciona una orden</option>
                {orders
                  .filter((o) => !['cancelled', 'rejected'].includes(o.status))
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.code} · {o.full_name}
                    </option>
                  ))}
              </select>
              <button
                className="rental-button"
                disabled={!newOrder}
                onClick={create}
              >
                <Plus size={17} />
                Crear / abrir factura
              </button>
            </div>
          </div>
        )}
      </div>
      {admin && !cfg.tax_id && (
        <p className="rental-notice">
          Completa los datos de facturación de tu empresa antes de emitir el
          primer documento.
        </p>
      )}
      <div className="rental-card">
        <div className="rental-filters rental-form">
          <label className="billing-search">
            Buscar
            <input
              placeholder="Número, cliente u orden"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            Estado
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">Todos</option>
              {[
                'Borrador',
                'Por cobrar',
                'Pago parcial',
                'Pagada',
                'Vencida',
                'Acreditada',
                'Emitida',
                'Anulado',
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Desde
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              min={from}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
        {orderId && (
          <p className="billing-filter-note">
            Mostrando documentos de esta orden.{' '}
            <a href={href('/dashboard?view=billing')}>Ver todas</a>
          </p>
        )}
        <div className="billing-list">
          {filtered.map((d) => (
            <button key={d.id} className="billing-row" onClick={() => open(d)}>
              <span className="billing-file">
                <FileText size={22} />
              </span>
              <span>
                <strong>{d.number || 'Borrador sin número'}</strong>
                <small>
                  {documentLabels[d.kind]} ·{' '}
                  {orders.find((o) => o.id === d.order_id)?.code}
                </small>
              </span>
              <span className="billing-row-customer">
                <strong>{d.customer.name}</strong>
                <small>{billingDate(d.issued_at || d.created_at)}</small>
              </span>
              <span className="billing-row-total">
                <strong>
                  {d.kind === 'credit' ? '−' : ''}
                  {moneyCents(d.total_cents)}
                </strong>
                <small className={'billing-state state-' + d.status}>
                  {documentState(d, data, rentalToday())}
                </small>
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
        {!filtered.length && (
          <div className="rental-empty">
            <FileText size={36} />
            <h3>
              {docs.length
                ? 'No hay coincidencias'
                : 'Todo listo para tu primera factura'}
            </h3>
            <p>
              {admin
                ? 'Selecciona una orden para preparar su factura.'
                : 'Aquí aparecerán las facturas emitidas de tus alquileres.'}
            </p>
          </div>
        )}
      </div>
      <p className="billing-legal">
        Documentos comerciales. La emisión fiscal autorizada debe configurarse
        por separado antes de utilizarlos como comprobantes fiscales.
      </p>
      {settings && (
        <BillingSettingsForm onClose={() => setSettings(false)} initial={cfg} />
      )}
      {draft && (
        <BillingEditor
          key={draft.id || draft.order_id + draft.kind}
          initial={draft}
          onClose={() => setDraft(null)}
          onSaved={(d) => {
            setDraft(null);
            setSelected(d.id);
          }}
        />
      )}
      {selectedDoc && (
        <BillingDocumentView
          doc={selectedDoc}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setDraft({ ...selectedDoc });
            setSelected(null);
          }}
          onNote={(kind) => {
            const o = orders.find((o) => o.id === selectedDoc.order_id)!;
            setDraft(
              initialDraft(
                o,
                selectedDoc.lines[0]?.tax_bps || 0,
                demo,
                selectedDoc,
                kind,
              ),
            );
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
function PartyFields({
  value,
  onChange,
  disabled = false,
}: {
  value: BillingParty;
  onChange: (v: BillingParty) => void;
  disabled?: boolean;
}) {
  const fields = [
    ['name', 'Nombre o razón social', 160],
    ['tax_id', 'RIF / identificación fiscal', 40],
    ['address', 'Dirección de facturación', 500],
    ['email', 'Correo', 254],
    ['phone', 'Teléfono', 40],
  ] as const;
  return (
    <div className="billing-party-fields">
      {fields.map(([key, label, max]) => (
        <label key={key} className={key === 'address' ? 'billing-wide' : ''}>
          {label}
          <input
            value={value[key]}
            type={key === 'email' ? 'email' : 'text'}
            maxLength={max}
            required={['name', 'tax_id', 'address'].includes(key)}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          />
        </label>
      ))}
    </div>
  );
}
function BillingSettingsForm({
  initial,
  onClose,
}: {
  initial: BillingSettings;
  onClose: () => void;
}) {
  const { billingSettings, data } = useRental(),
    [form, setForm] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await billingSettings(form);
      onClose();
    } catch (e) {
      setError(rentalError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o && !busy) onClose();
      }}
    >
      <DialogContent className="rental-app rental-detail billing-dialog">
        <DialogTitle>Datos de facturación</DialogTitle>
        <DialogDescription>
          Se guardan en los nuevos documentos. Los ya emitidos conservan sus
          datos originales.
        </DialogDescription>
        <form className="rental-form" onSubmit={submit}>
          <PartyFields
            value={form}
            onChange={(p) => setForm({ ...form, ...p })}
          />
          <div className="billing-party-fields">
            <label>
              Serie
              <input
                value={form.prefix}
                pattern="[A-Z0-9-]{1,10}"
                maxLength={10}
                required
                disabled={data.billing?.documents.some(
                  (d) => d.status === 'issued',
                )}
                onChange={(e) =>
                  setForm({ ...form, prefix: e.target.value.toUpperCase() })
                }
              />
            </label>
            <label>
              Nombre del impuesto
              <input
                value={form.tax_label}
                required
                maxLength={40}
                onChange={(e) =>
                  setForm({ ...form, tax_label: e.target.value })
                }
              />
            </label>
            <label>
              Impuesto predeterminado (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.tax_bps / 100}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tax_bps: Math.round(Number(e.target.value) * 100),
                  })
                }
              />
            </label>
          </div>
          <label>
            Condiciones de pago
            <textarea
              value={form.terms}
              maxLength={2000}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
            />
          </label>
          <p className="rental-notice">
            La tasa predeterminada empieza en 0%. Configúrala según la operación
            de tu empresa. La numeración es automática y no se reinicia.
          </p>
          {error && (
            <p role="alert" className="rental-error">
              {error}
            </p>
          )}
          <button className="rental-button" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar configuración'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function BillingEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: Draft;
  onClose: () => void;
  onSaved: (d: BillingDocument) => void;
}) {
  const { billingAction, data } = useRental(),
    [form, setForm] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const requests = useRef(new Map<string, string>());
  const order = data.orders.find((o) => o.id === form.order_id),
    parent = data.billing?.documents.find((d) => d.id === form.parent_id);
  let totals;
  try {
    totals = calculateInvoice(form.lines);
  } catch {
    totals = null;
  }
  function line(index: number, patch: Partial<BillingLine>) {
    setForm({
      ...form,
      lines: form.lines.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    });
  }
  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const key = JSON.stringify(form);
    if (!requests.current.has(key))
      requests.current.set(key, crypto.randomUUID());
    try {
      onSaved(
        await billingAction({
          ...form,
          action: 'save',
          request_id: requests.current.get(key)!,
        }),
      );
    } catch (e) {
      setError(rentalError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o && !busy) onClose();
      }}
    >
      <DialogContent className="rental-app rental-detail billing-dialog">
        <DialogTitle>
          {form.id ? 'Editar' : 'Preparar'}{' '}
          {documentLabels[form.kind].toLowerCase()}
        </DialogTitle>
        <DialogDescription>
          {order?.code}{' '}
          {parent
            ? `· Documento de origen: ${parent.number}`
            : '· Revisa los datos antes de emitir.'}
        </DialogDescription>
        <form className="rental-form" onSubmit={submit}>
          <fieldset disabled={busy}>
            <legend>Cliente</legend>
            <PartyFields
              value={form.customer}
              disabled={form.kind !== 'invoice'}
              onChange={(customer) => setForm({ ...form, customer })}
            />
            <h3>Conceptos</h3>
            <div className="billing-lines">
              {form.lines.map((l, i) => (
                <div className="billing-line" key={i}>
                  <label className="billing-line-description">
                    Concepto {i + 1}
                    <input
                      aria-label={`Descripción ${i + 1}`}
                      value={l.description}
                      maxLength={300}
                      required
                      onChange={(e) => line(i, { description: e.target.value })}
                    />
                  </label>
                  <label>
                    Cantidad
                    <input
                      aria-label={`Cantidad ${i + 1}`}
                      type="number"
                      min="0.001"
                      max="10000"
                      step="0.001"
                      value={l.quantity || ''}
                      required
                      onChange={(e) =>
                        line(i, { quantity: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Precio USD
                    <input
                      aria-label={`Precio ${i + 1}`}
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      value={l.unit_cents / 100}
                      required
                      onChange={(e) =>
                        line(i, {
                          unit_cents: Math.round(Number(e.target.value) * 100),
                        })
                      }
                    />
                  </label>
                  <label>
                    Descuento USD
                    <input
                      aria-label={`Descuento ${i + 1}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={l.discount_cents / 100}
                      required
                      onChange={(e) =>
                        line(i, {
                          discount_cents: Math.round(
                            Number(e.target.value) * 100,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Impuesto %
                    <input
                      aria-label={`Impuesto ${i + 1}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={l.tax_bps / 100}
                      required
                      onChange={(e) =>
                        line(i, {
                          tax_bps: Math.round(Number(e.target.value) * 100),
                        })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="rental-icon-button"
                    aria-label={`Eliminar concepto ${i + 1}`}
                    disabled={form.lines.length === 1}
                    onClick={() =>
                      setForm({
                        ...form,
                        lines: form.lines.filter((_, n) => n !== i),
                      })
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="rental-button secondary compact"
              disabled={form.lines.length >= 50}
              onClick={() =>
                setForm({
                  ...form,
                  lines: [
                    ...form.lines,
                    {
                      description: '',
                      quantity: 1,
                      unit_cents: 0,
                      discount_cents: 0,
                      tax_bps: form.lines[0].tax_bps,
                    },
                  ],
                })
              }
            >
              <Plus size={16} />
              Añadir concepto
            </button>
            <div className="billing-party-fields">
              <label>
                Vencimiento
                <input
                  type="date"
                  required
                  value={form.due_date}
                  onChange={(e) =>
                    setForm({ ...form, due_date: e.target.value })
                  }
                />
              </label>
              <label>
                Tasa VES por USD (opcional)
                <input
                  type="number"
                  min="0.000001"
                  max="1000000"
                  step="0.000001"
                  value={form.fx_rate ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fx_rate: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </label>
            </div>
            {form.kind !== 'invoice' && (
              <label>
                Motivo de la nota
                <textarea
                  required
                  minLength={5}
                  maxLength={500}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </label>
            )}
            <label>
              Observaciones
              <textarea
                maxLength={2000}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            {totals && (
              <div className="billing-total-preview">
                <span>
                  Base después de descuentos{' '}
                  {moneyCents(totals.subtotal_cents - totals.discount_cents)} ·
                  Impuestos {moneyCents(totals.tax_cents)}
                </span>
                <strong>Total {moneyCents(totals.total_cents)}</strong>
              </div>
            )}
          </fieldset>
          {error && (
            <p role="alert" className="rental-error">
              {error}
            </p>
          )}
          <p className="billing-legal">
            Guardar el borrador no cambia el saldo ni asigna un número. Podrás
            revisarlo antes de emitir.
          </p>
          <button className="rental-button" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar y revisar borrador'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function BillingDocumentView({
  doc,
  onClose,
  onEdit,
  onNote,
}: {
  doc: BillingDocument;
  onClose: () => void;
  onEdit: () => void;
  onNote: (k: InvoiceKind) => void;
}) {
  const { data, user, demo, billingAction, href } = useRental(),
    admin = user?.role === 'admin',
    order = data.orders.find((o) => o.id === doc.order_id)!,
    parent = data.billing?.documents.find((d) => d.id === doc.parent_id);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [voiding, setVoiding] = useState(false),
    [reason, setReason] = useState(''),
    [confirmIssue, setConfirmIssue] = useState(false);
  const requests = useRef(new Map<string, string>());
  const balance = orderInvoiceBalance(data, order);
  async function act(action: 'issue' | 'void') {
    setBusy(true);
    setError('');
    const key = action + doc.version + reason;
    if (!requests.current.has(key))
      requests.current.set(key, crypto.randomUUID());
    try {
      await billingAction({
        ...doc,
        action,
        reason: action === 'void' ? reason : doc.reason,
        request_id: requests.current.get(key)!,
      });
      setConfirmIssue(false);
      setVoiding(false);
    } catch (e) {
      setError(rentalError(e));
    } finally {
      setBusy(false);
    }
  }
  async function pdf() {
    setBusy(true);
    setError('');
    try {
      const { createBillingPdf } = await import('@/lib/billing-pdf');
      const response = await fetch('/fonts/Lato-Regular.ttf');
      if (!response.ok)
        throw new Error('No pudimos cargar la tipografía. Intenta nuevamente.');
      const bytes = await createBillingPdf(
        doc,
        order,
        parent?.number || null,
        demo,
        new Uint8Array(await response.arrayBuffer()),
      );
      downloadBlob(
        new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
        `${doc.number || 'borrador'}${demo ? '-DEMO' : ''}.pdf`,
      );
    } catch (e) {
      setError(rentalError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o && !busy) onClose();
      }}
    >
      <DialogContent className="rental-app rental-detail billing-dialog">
        <DialogTitle>{doc.number || 'Revisar borrador'}</DialogTitle>
        <DialogDescription>
          {documentLabels[doc.kind]} · {documentState(doc, data, rentalToday())}
        </DialogDescription>
        <article className="billing-paper">
          <header>
            <span className="billing-wordmark">
              CIUDAD<span>CARS</span>
            </span>
            <span>
              {doc.status === 'issued'
                ? 'DOCUMENTO COMERCIAL'
                : doc.status === 'void'
                  ? 'ANULADO'
                  : 'BORRADOR'}
              {demo ? ' · DEMO' : ''}
            </span>
          </header>
          <h2>
            {documentLabels[doc.kind]}{' '}
            <small>{doc.number || 'Sin emitir'}</small>
          </h2>
          <p>
            Orden {order.code} ·{' '}
            {doc.issued_at
              ? `Emisión: ${billingDate(doc.issued_at)}`
              : 'Pendiente de emisión'}{' '}
            · Vencimiento: {doc.due_date}
          </p>
          {parent && (
            <p>
              Documento de origen: <strong>{parent.number}</strong>
            </p>
          )}
          <div className="billing-parties">
            <div>
              <h3>Emisor</h3>
              <PartyView value={doc.issuer} />
            </div>
            <div>
              <h3>Cliente</h3>
              <PartyView value={doc.customer} />
            </div>
          </div>
          <div className="billing-paper-lines">
            {doc.lines.map((l, i) => {
              const gross = Number(
                  (BigInt(Math.round(l.quantity * 1000)) *
                    BigInt(l.unit_cents) +
                    BigInt(500)) /
                    BigInt(1000),
                ),
                base = gross - l.discount_cents,
                tax = Number(
                  (BigInt(base) * BigInt(l.tax_bps) + BigInt(5000)) /
                    BigInt(10000),
                );
              return (
                <div key={i}>
                  <span>
                    <strong>{l.description}</strong>
                    <small>
                      {l.quantity} × {moneyCents(l.unit_cents)} · Descuento:{' '}
                      {moneyCents(l.discount_cents)} · {doc.tax_label}:{' '}
                      {l.tax_bps / 100}% ({moneyCents(tax)})
                    </small>
                  </span>
                  <strong>{moneyCents(base + tax)}</strong>
                </div>
              );
            })}
          </div>
          <dl className="billing-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{moneyCents(doc.subtotal_cents)}</dd>
            </div>
            <div>
              <dt>Descuentos</dt>
              <dd>−{moneyCents(doc.discount_cents)}</dd>
            </div>
            <div>
              <dt>{doc.tax_label}</dt>
              <dd>{moneyCents(doc.tax_cents)}</dd>
            </div>
            <div className="billing-grand">
              <dt>Total {doc.kind === 'credit' ? 'a acreditar' : ''}</dt>
              <dd>{moneyCents(doc.total_cents)}</dd>
            </div>
          </dl>
          {doc.fx_rate && (
            <p>
              Referencia VES:{' '}
              {((doc.total_cents / 100) * doc.fx_rate).toLocaleString('es-VE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              Bs. · Tasa registrada: {doc.fx_rate} VES/USD. No es una consulta
              automática de tasa.
            </p>
          )}
          {doc.reason && (
            <p>
              <strong>Motivo:</strong> {doc.reason}
            </p>
          )}
          {doc.notes && <p>{doc.notes}</p>}
          {doc.terms && (
            <p>
              <strong>Condiciones:</strong> {doc.terms}
            </p>
          )}
          <footer>
            Documento comercial. No constituye un comprobante fiscal autorizado.
            {demo ? ' Datos de ejemplo, sin validez.' : ''}
          </footer>
        </article>
        {doc.status === 'issued' && (
          <div className="billing-balance">
            <strong>Saldo actual de la orden</strong>
            <span>
              Facturado neto: {moneyCents(balance.billed)} · Pagado neto:{' '}
              {moneyCents(balance.paid)}
            </span>
            <span>
              Por cobrar: {moneyCents(balance.due)} · A favor:{' '}
              {moneyCents(balance.credit)}
            </span>
            <small>Incluye todas las notas y pagos de esta orden.</small>
          </div>
        )}
        {error && (
          <p role="alert" className="rental-error">
            {error}
          </p>
        )}
        <div className="rental-order-actions">
          <button
            className="rental-button secondary"
            disabled={busy}
            onClick={() => void pdf()}
          >
            <Download size={17} />
            {busy ? 'Procesando…' : 'Descargar PDF'}
          </button>
          <a
            className="rental-button secondary"
            href={href('/dashboard?view=orders&order=' + order.id)}
          >
            Ver orden y pagos <ArrowUpRight size={16} />
          </a>
          {admin && doc.status === 'draft' && (
            <>
              <button
                className="rental-button secondary"
                disabled={busy}
                onClick={onEdit}
              >
                Editar borrador
              </button>
              <button
                className="rental-button"
                disabled={busy}
                onClick={() => {
                  setConfirmIssue(true);
                  setVoiding(false);
                }}
              >
                Emitir documento
              </button>
              <button
                className="rental-button secondary"
                disabled={busy}
                onClick={() => {
                  setVoiding(true);
                  setConfirmIssue(false);
                }}
              >
                Anular borrador
              </button>
            </>
          )}
          {admin && doc.kind === 'invoice' && doc.status === 'issued' && (
            <>
              <button
                className="rental-button secondary"
                disabled={busy}
                onClick={() => onNote('credit')}
              >
                Crear nota de crédito
              </button>
              {!['cancelled', 'rejected'].includes(order.status) && (
                <button
                  className="rental-button secondary"
                  disabled={busy}
                  onClick={() => onNote('debit')}
                >
                  Crear nota de débito
                </button>
              )}
            </>
          )}
        </div>
        {confirmIssue && (
          <div className="billing-confirm">
            <h3>Emitir por {moneyCents(doc.total_cents)}</h3>
            <p>
              Se asignará el número y se actualizará el saldo de la orden.
              Después de emitir, las correcciones se hacen con notas.
            </p>
            <button
              className="rental-button"
              disabled={busy}
              onClick={() => void act('issue')}
            >
              {busy ? 'Emitiendo…' : 'Confirmar emisión'}
            </button>
          </div>
        )}
        {voiding && (
          <form
            className="rental-form"
            onSubmit={(e) => {
              e.preventDefault();
              void act('void');
            }}
          >
            <label>
              Motivo de anulación
              <textarea
                required
                minLength={5}
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <button className="rental-button secondary" disabled={busy}>
              Confirmar anulación
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
function PartyView({ value }: { value: BillingParty }) {
  return (
    <address>
      <strong>{value.name || 'Configura los datos del emisor'}</strong>
      <span>{value.tax_id}</span>
      <span>{value.address}</span>
      {value.email && <span>{value.email}</span>}
      {value.phone && <span>{value.phone}</span>}
    </address>
  );
}
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
