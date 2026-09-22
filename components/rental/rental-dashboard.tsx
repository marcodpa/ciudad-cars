/* Optimized local WebP images. Native navigation deliberately resets account-bound state. */
/* eslint-disable next/no-img-element, next/no-html-link-for-pages */
'use client';
import { lazy, Suspense, useRef, useState, type SubmitEvent } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  Plus,
  RefreshCw,
  Search,
  Wrench,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRental } from './rental-provider';
import { RentalLoading, RentalLogin } from './rental-login';
import { RentalShell, rentalViews } from './rental-shell';
import {
  addDays,
  availableUnits,
  blocksUnit,
  money,
  paidTotal,
  rentalDays,
  rentalToday,
  shortDate,
  statusLabels,
  orderMessage,
  type OrderStatus,
  type RentalOrder,
  type OrderAction,
  type RentalUnit,
} from '@/lib/rental-domain';
import { rentalError } from '@/lib/rental-client';
import { useBrowserSearch } from './use-browser-search';
import { formText } from '@/lib/rental-domain';
import { orderTotal } from '@/lib/rental-domain';
import { refundableAmount } from '@/lib/billing-domain';
import { whatsappUrl } from '@/lib/company';

const BillingPanel = lazy(() =>
  import('./billing-panel').then((m) => ({ default: m.BillingPanel })),
);
function Status({ status }: { status: OrderStatus }) {
  return (
    <span className={'rental-status ' + status}>
      <i />
      {statusLabels[status]}
    </span>
  );
}
function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rental-empty">
      <CarFront size={32} />
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
export function RentalDashboard() {
  const rental = useRental();
  const {
    loading,
    user,
    demo,
    data,
    href,
    error: connectionError,
    refresh,
  } = rental;
  const search = useBrowserSearch(),
    params = new URLSearchParams(search),
    view = params.get('view') || 'overview';
  const [selected, setSelected] = useState<string | null | undefined>(
      undefined,
    ),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState('all'),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [unitEdit, setUnitEdit] = useState<RentalUnit | 'new' | null>(null),
    [calendarStart, setCalendarStart] = useState(rentalToday);

  if (loading) return <RentalLoading />;
  if (!user) return <RentalLogin />;
  const admin = user.role === 'admin',
    safeView = admin
      ? view
      : ['overview', 'orders', 'billing'].includes(view)
        ? view
        : 'overview';
  const orders = (
    admin ? data.orders : data.orders.filter((o) => o.customer_id === user.id)
  ).toSorted((a, b) => b.created_at.localeCompare(a.created_at));
  const selectedOrder = orders.find(
    (o) =>
      o.id ===
      (selected === undefined
        ? view === 'billing'
          ? null
          : params.get('order')
        : selected),
  );
  const today = rentalToday(),
    pending = orders.filter((o) => o.status === 'pending'),
    active = orders.filter((o) => o.status === 'active');
  const availableToday = data.models.reduce(
    (sum, m) =>
      sum + availableUnits(data, m.id, today, addDays(today, 1)).length,
    0,
  );
  const visibleOrders = orders.filter(
    (o) =>
      (status === 'all' || o.status === status) &&
      `${o.code} ${o.full_name} ${o.email} ${data.models.find((m) => m.id === o.model_id)?.model}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const collected = data.payments
    .filter((p) => orders.some((o) => o.id === p.order_id))
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const title =
    safeView === 'overview'
      ? admin
        ? 'Todo listo para el próximo viaje.'
        : `Hola, ${user.full_name.split(' ')[0] || 'bienvenido'}.`
      : rentalViews.find((v) => v.id === safeView)?.label || 'Mis órdenes';
  async function reload() {
    setBusy(true);
    try {
      await refresh();
      setNotice('Información actualizada.');
    } catch (e) {
      setNotice(rentalError(e));
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const rows = [
      [
        'Orden',
        'Cliente',
        'Modelo',
        'Retiro',
        'Devolución',
        'Estado',
        'Total USD',
        'Pagado USD',
      ],
      ...visibleOrders.map((o) => [
        o.code,
        o.full_name,
        o.model_id,
        o.pickup,
        o.dropoff,
        statusLabels[o.status],
        orderTotal(o),
        paidTotal(data, o.id),
      ]),
    ];
    const safe = (value: unknown) => {
      let s = String(value);
      if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replaceAll('"', '""') + '"';
    };
    const blob = new Blob(
      ['\uFEFF' + rows.map((r) => r.map(safe).join(',')).join('\r\n')],
      { type: 'text/csv;charset=utf-8' },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = `ciudad-cars-ordenes-${today}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <RentalShell view={safeView}>
      <div className="rental-page-heading">
        <div>
          <span className="rental-eyebrow">
            {new Intl.DateTimeFormat('es-VE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              timeZone: 'America/Caracas',
            }).format(new Date())}
          </span>
          <h1>{title}</h1>
          <p>
            {safeView === 'overview'
              ? 'Cada carro, cada reserva y cada detalle, bajo control.'
              : safeView === 'orders'
                ? 'De la primera solicitud a la devolución del vehículo.'
                : safeView === 'calendar'
                  ? 'Las órdenes confirmadas ocupan unidades; las pendientes todavía no.'
                  : safeView === 'fleet'
                    ? 'Gestiona las unidades físicas de cada modelo.'
                    : safeView === 'customers'
                      ? 'La información de tus clientes, organizada por sus solicitudes.'
                      : safeView === 'payments'
                        ? 'Pagos verificados y reembolsos registrados por tu equipo.'
                        : safeView === 'billing'
                          ? 'Facturas, notas y saldos de cada alquiler.'
                          : 'Tarifas y reglas de operación.'}
          </p>
        </div>
        <button
          className="rental-button secondary compact"
          onClick={() => void reload()}
          disabled={busy}
        >
          <RefreshCw size={16} />
          {busy ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>
      {connectionError && (
        <p className="rental-error" role="alert">
          {connectionError}
        </p>
      )}
      {notice && <output className="rental-notice">{notice}</output>}
      {safeView === 'overview' && (
        <>
          <div className="rental-stats">
            <Stat
              icon={<Clock3 />}
              value={pending.length}
              label="Órdenes por aprobar"
              hint="Revisar pago y disponibilidad"
            />
            <Stat
              icon={<CarFront />}
              value={
                admin
                  ? availableToday
                  : orders.filter((o) => o.status === 'approved').length
              }
              label={admin ? 'Vehículos libres hoy' : 'Próximos alquileres'}
              hint={
                admin
                  ? `${data.units.length} unidades en la flota`
                  : 'Órdenes confirmadas'
              }
            />
            <Stat
              icon={<CalendarDays />}
              value={active.length}
              label="En alquiler"
              hint="Vehículos entregados"
            />
            <Stat
              icon={<CreditCard />}
              value={money(collected)}
              label={admin ? 'Cobrado neto' : 'Pagos registrados'}
              hint="Todos los períodos · menos reembolsos"
            />
          </div>
          <div className="rental-overview-grid">
            <section className="rental-card">
              <div className="rental-card-heading">
                <div>
                  <span className="rental-eyebrow">SIGUIENTE PASO</span>
                  <h2>
                    {admin ? 'Tu operación, al día' : 'Un viaje a tu medida'}
                  </h2>
                </div>
                <span className="rental-icon-box">
                  <CarFront size={24} />
                </span>
              </div>
              <p>
                {admin
                  ? `${pending.length} solicitudes esperan revisión. Confirma el pago y asigna una unidad para asegurar las fechas del cliente.`
                  : 'Crea tu solicitud, coordina el pago por WhatsApp y consulta aquí cuando tu reserva esté confirmada.'}
              </p>
              <a
                className="rental-button"
                href={href(admin ? '/dashboard?view=orders' : '/reservar')}
              >
                {admin ? 'Revisar solicitudes' : 'Elegir mi próximo carro'}
                <ArrowRight size={18} />
              </a>
              <div className="rental-operation-strip">
                <span>
                  <i /> Solicitud
                </span>
                <ArrowRight size={14} />
                <span>Pago</span>
                <ArrowRight size={14} />
                <span>Confirmación</span>
              </div>
            </section>
            <section className="rental-card rental-feature-car">
              <img
                src="/images/fleet-photo-explorer-mobile.webp"
                alt="Ford Explorer"
                width="1008"
                height="567"
              />
              <div>
                <span>LISTOS PARA EL CAMINO</span>
                <h2>
                  Más espacio.
                  <br />
                  Más posibilidades.
                </h2>
                <a
                  href={href('/reservar?modelo=explorer')}
                  aria-label="Solicitar Ford Explorer"
                >
                  <ArrowUpRight size={24} />
                </a>
              </div>
            </section>
          </div>
          <section className="rental-card rental-flush">
            <div className="rental-card-heading padded">
              <div>
                <h2>Órdenes recientes</h2>
                <p>Lo último en tu {admin ? 'operación' : 'cuenta'}.</p>
              </div>
              <a
                className="rental-text-button"
                href={href('/dashboard?view=orders')}
              >
                Ver todas <ArrowRight size={16} />
              </a>
            </div>
            <OrdersTable
              data={data}
              setSelected={setSelected}
              items={orders.slice(0, 5)}
            />
          </section>
          {admin && (
            <section className="rental-card">
              <div className="rental-card-heading">
                <h2>Entregas y devoluciones de hoy</h2>
                <CalendarDays size={22} />
              </div>
              <div className="rental-agenda">
                {orders
                  .filter(
                    (o) =>
                      (o.status === 'approved' && o.pickup === today) ||
                      (o.status === 'active' && o.dropoff <= today),
                  )
                  .map((o) => (
                    <button key={o.id} onClick={() => setSelected(o.id)}>
                      <span className="rental-icon-box">
                        {o.status === 'active' ? (
                          <CheckCircle2 />
                        ) : (
                          <CarFront />
                        )}
                      </span>
                      <span>
                        <strong>
                          {o.status === 'active'
                            ? o.dropoff < today
                              ? 'Devolución atrasada'
                              : 'Recibir vehículo'
                            : 'Entregar vehículo'}
                        </strong>
                        <small>
                          {o.code} · {o.full_name}
                        </small>
                      </span>
                      <ArrowUpRight size={18} />
                    </button>
                  ))}
                {!orders.some(
                  (o) =>
                    (o.status === 'approved' && o.pickup === today) ||
                    (o.status === 'active' && o.dropoff <= today),
                ) && (
                  <p>No tienes entregas ni devoluciones pendientes para hoy.</p>
                )}
              </div>
            </section>
          )}
        </>
      )}
      {safeView === 'orders' && (
        <section className="rental-card rental-flush">
          <div className="rental-filters">
            <label className="rental-search">
              <Search size={18} />
              <input
                aria-label="Buscar órdenes"
                placeholder="Buscar orden, cliente o carro…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label>
              <span className="sr-only">Estado</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                {Object.entries(statusLabels).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="rental-button secondary compact"
              onClick={download}
            >
              <Download size={16} /> Exportar
            </button>
          </div>
          <OrdersTable
            data={data}
            setSelected={setSelected}
            items={visibleOrders}
          />
        </section>
      )}
      {safeView === 'calendar' && (
        <section className="rental-card">
          <div className="rental-card-heading">
            <div>
              <h2>Calendario de flota</h2>
              <p>Desliza para ver los próximos 14 días.</p>
            </div>
            <div className="rental-inline">
              <button
                className="rental-icon-button"
                aria-label="14 días anteriores"
                onClick={() => setCalendarStart(addDays(calendarStart, -14))}
              >
                <ChevronLeft />
              </button>
              <label>
                <span className="sr-only">Inicio del calendario</span>
                <input
                  type="date"
                  value={calendarStart}
                  onChange={(e) =>
                    e.target.value && setCalendarStart(e.target.value)
                  }
                />
              </label>
              <button
                className="rental-icon-button"
                aria-label="14 días siguientes"
                onClick={() => setCalendarStart(addDays(calendarStart, 14))}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
          <section
            className="rental-table-wrap"
            aria-label="Calendario de disponibilidad por vehículo"
          >
            <table className="rental-calendar">
              <thead>
                <tr>
                  <th>Unidad</th>
                  {Array.from({ length: 14 }, (_, i) =>
                    addDays(calendarStart, i),
                  ).map((day) => (
                    <th key={day} className={day === today ? 'today' : ''}>
                      {shortDate(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.units.map((u) => (
                  <tr key={u.id}>
                    <th>
                      {u.label}
                      <small>{u.plate}</small>
                    </th>
                    {Array.from({ length: 14 }, (_, i) =>
                      addDays(calendarStart, i),
                    ).map((day) => {
                      const o = orders.find(
                        (o) =>
                          o.unit_id === u.id &&
                          blocksUnit(o, day, addDays(day, 1)),
                      );
                      return (
                        <td key={day}>
                          {o ? (
                            <button
                              className={'rental-calendar-booking ' + o.status}
                              onClick={() => setSelected(o.id)}
                              title={`${o.code}: ${o.full_name}`}
                              aria-label={`${u.label}, ${day}, ${statusLabels[o.status]}, ${o.code}`}
                            >
                              {o.status === 'active' ? 'Alquiler' : 'Reserva'}
                            </button>
                          ) : (
                            <span
                              className={'rental-calendar-free ' + u.status}
                            >
                              {u.status === 'available'
                                ? 'Libre'
                                : u.status === 'maintenance'
                                  ? 'Taller'
                                  : 'Inactivo'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {!data.units.length && (
            <Empty
              title="Registra tus vehículos"
              body="Añade las unidades reales de tu flota para empezar a contar disponibilidad."
            />
          )}
          <p className="rental-small">
            El día de devolución puede usarse para un nuevo retiro. Una
            devolución atrasada mantiene la unidad ocupada hasta registrar su
            regreso.
          </p>
        </section>
      )}
      {safeView === 'fleet' && (
        <>
          <div className="rental-section-actions">
            <span>{data.units.length} unidades registradas</span>
            <button
              className="rental-button"
              onClick={() => setUnitEdit('new')}
            >
              <Plus size={18} /> Añadir unidad
            </button>
          </div>
          <div className="rental-fleet-grid">
            {data.models.map((model) => (
              <section className="rental-card rental-fleet-card" key={model.id}>
                <img
                  src={model.image}
                  width="1008"
                  height="567"
                  alt={model.make + ' ' + model.model}
                  loading="lazy"
                />
                <div>
                  <span className="rental-eyebrow">
                    {model.category} · {model.seats} puestos
                  </span>
                  <h2>
                    {model.make} {model.model}
                  </h2>
                  <p>
                    {money(model.daily_rate)} <small>/ día</small>
                  </p>
                  <div className="rental-unit-list">
                    {data.units
                      .filter((u) => u.model_id === model.id)
                      .map((u) => (
                        <button key={u.id} onClick={() => setUnitEdit(u)}>
                          <span>
                            <strong>{u.label}</strong>
                            <small>{u.plate}</small>
                          </span>
                          <span
                            className={
                              'rental-status ' +
                              (u.status === 'available'
                                ? 'approved'
                                : 'pending')
                            }
                          >
                            {u.status === 'available'
                              ? 'Operativo'
                              : u.status === 'maintenance'
                                ? 'Taller'
                                : 'Inactivo'}
                          </span>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                  </div>
                  {!data.units.some((u) => u.model_id === model.id) && (
                    <p className="rental-small">Sin unidades registradas.</p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
      {safeView === 'customers' && (
        <section className="rental-card rental-flush">
          <div className="rental-filters">
            <label className="rental-search">
              <Search size={18} />
              <input
                aria-label="Buscar clientes"
                placeholder="Buscar por nombre o correo…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          <div className="rental-customer-grid">
            {data.profiles
              .filter(
                (p) =>
                  p.role === 'customer' &&
                  `${p.full_name} ${p.email}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              )
              .map((p) => {
                const own = orders.filter((o) => o.customer_id === p.id);
                return (
                  <article key={p.id}>
                    <span className="rental-avatar">
                      {p.full_name.slice(0, 1) || 'C'}
                    </span>
                    <h3>{p.full_name || 'Nuevo cliente'}</h3>
                    <p>
                      {p.email}
                      <br />
                      {p.phone || 'Sin teléfono registrado'}
                    </p>
                    <span>
                      {own.length} órdenes ·{' '}
                      {own.filter((o) => o.status === 'completed').length}{' '}
                      viajes completados
                    </span>
                    {own[0] && (
                      <button
                        className="rental-text-button"
                        onClick={() => setSelected(own[0].id)}
                      >
                        Ver última orden <ArrowRight size={16} />
                      </button>
                    )}
                  </article>
                );
              })}
          </div>
        </section>
      )}
      {safeView === 'payments' && (
        <>
          <div className="rental-stats">
            <Stat
              icon={<CreditCard />}
              value={money(collected)}
              label="Cobrado neto"
              hint="Pagos menos reembolsos"
            />
            <Stat
              icon={<Clock3 />}
              value={money(
                orders
                  .filter((o) =>
                    ['pending', 'approved', 'active', 'completed'].includes(
                      o.status,
                    ),
                  )
                  .reduce(
                    (s, o) =>
                      s + Math.max(0, orderTotal(o) - paidTotal(data, o.id)),
                    0,
                  ),
              )}
              label="Por cobrar"
              hint="Solicitudes y alquileres abiertos"
            />
            <Stat
              icon={<RefreshCw />}
              value={money(
                orders.reduce((s, o) => s + refundableAmount(data, o), 0),
              )}
              label="Por reembolsar"
              hint="Cancelaciones y saldos a favor"
            />
          </div>
          <section className="rental-card rental-flush">
            <div className="rental-card-heading padded">
              <h2>Movimientos registrados</h2>
            </div>
            <div className="rental-table-wrap">
              <table className="rental-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th>Referencia</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments
                    .toSorted((a, b) =>
                      b.created_at.localeCompare(a.created_at),
                    )
                    .map((p) => (
                      <tr key={p.id}>
                        <td>
                          <button
                            className="rental-order-link"
                            onClick={() => setSelected(p.order_id)}
                          >
                            {orders.find((o) => o.id === p.order_id)?.code}
                          </button>
                        </td>
                        <td>{shortDate(p.created_at.slice(0, 10))}</td>
                        <td>{p.method}</td>
                        <td>{p.reference}</td>
                        <td>
                          <strong>{money(p.amount)}</strong>
                          <small>
                            {p.amount < 0 ? 'Reembolso' : 'Pago verificado'}
                          </small>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!data.payments.length && (
              <Empty
                title="Aún no hay pagos"
                body="Abre una orden para registrar un pago que ya verificaste."
              />
            )}
          </section>
        </>
      )}
      {safeView === 'billing' && (
        <Suspense fallback={<p>Cargando facturación…</p>}>
          <BillingPanel orderId={params.get('order')} />
        </Suspense>
      )}
      {safeView === 'settings' && (
        <div className="rental-settings-grid">
          <section className="rental-card">
            <h2>Tarifas de alquiler</h2>
            <p>
              Los cambios se aplican a nuevas solicitudes. Las órdenes
              existentes conservan su tarifa.
            </p>
            {data.models.map((m) => (
              <RateForm key={m.id} model={m} />
            ))}
          </section>
          <section className="rental-card">
            <h2>Así funciona tu operación</h2>
            <ol className="rental-rules">
              <li>El cliente completa sus datos y crea una orden.</li>
              <li>Coordina el pago por WhatsApp con el número de orden.</li>
              <li>Tu equipo verifica y registra el pago completo.</li>
              <li>Apruebas y asignas una unidad libre para esas fechas.</li>
              <li>Registras entrega y devolución con el estado del carro.</li>
            </ol>
            <p className="rental-small">
              Moneda: USD · Zona horaria: Caracas · Alquileres diarios de 1 a 90
              días. Los cambios de fechas se gestionan cancelando la orden y
              creando una nueva.
            </p>
            {demo && (
              <button
                className="rental-button secondary"
                onClick={() => rental.resetDemo()}
              >
                Reiniciar datos de demostración
              </button>
            )}
          </section>
        </div>
      )}
      {selectedOrder && (
        <OrderDetail order={selectedOrder} onClose={() => setSelected(null)} />
      )}{' '}
      {unitEdit && (
        <UnitForm unit={unitEdit} onClose={() => setUnitEdit(null)} />
      )}
    </RentalShell>
  );
}
function Stat({
  icon,
  value,
  label,
  hint,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <article className="rental-stat">
      <div>
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}
function RateForm({
  model,
}: {
  model: { id: string; model: string; daily_rate: number };
}) {
  const { setRate } = useRental();
  const [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="rental-rate-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const amount = Number(new FormData(e.currentTarget).get('rate'));
        setBusy(true);
        try {
          await setRate(model.id, amount);
          setMessage('Guardado.');
        } catch (err) {
          setMessage(rentalError(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        {model.model}
        <input
          name="rate"
          type="number"
          min="0.01"
          max="10000"
          step="0.01"
          required
          defaultValue={model.daily_rate}
        />
      </label>
      <button className="rental-button secondary compact" disabled={busy}>
        {busy ? 'Guardando…' : 'Guardar'}
      </button>
      {message && <output>{message}</output>}
    </form>
  );
}

function OrderDetail({
  order: o,
  onClose,
}: {
  order: RentalOrder;
  onClose: () => void;
}) {
  const { data, user, demo, action, href } = useRental(),
    admin = user?.role === 'admin',
    model = data.models.find((m) => m.id === o.model_id);
  const [operation, setOperation] = useState<OrderAction | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState('');
  const requests = useRef(new Map<string, string>());
  const paid = paidTotal(data, o.id),
    units = availableUnits(data, o.model_id, o.pickup, o.dropoff, o.id);
  const operations: { id: OrderAction; label: string }[] = admin
    ? [
        ...(['pending', 'approved', 'active', 'completed'].includes(o.status) &&
        paid < orderTotal(o)
          ? [{ id: 'payment' as const, label: 'Registrar pago' }]
          : []),
        ...(o.status === 'pending'
          ? [
              { id: 'approve' as const, label: 'Aprobar orden' },
              { id: 'reject' as const, label: 'Rechazar' },
            ]
          : []),
        ...(o.status === 'approved'
          ? [{ id: 'start' as const, label: 'Entregar carro' }]
          : []),
        ...(o.status === 'active'
          ? [{ id: 'complete' as const, label: 'Registrar devolución' }]
          : []),
        ...(['pending', 'approved'].includes(o.status)
          ? [{ id: 'cancel' as const, label: 'Cancelar orden' }]
          : []),
        ...(refundableAmount(data, o) > 0
          ? [{ id: 'refund' as const, label: 'Registrar reembolso' }]
          : []),
      ]
    : o.status === 'pending'
      ? [{ id: 'cancel', label: 'Cancelar solicitud' }]
      : [];
  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!operation) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    setSuccess('');
    const payload = {
      action: operation,
      order_id: o.id,
      unit_id: formText(f, 'unit_id'),
      amount: Number(f.get('amount') || 0),
      method: formText(f, 'method'),
      reference: formText(f, 'reference'),
      note: formText(f, 'note'),
    };
    const key = JSON.stringify(payload);
    if (!requests.current.has(key))
      requests.current.set(key, crypto.randomUUID());
    try {
      await action({ ...payload, request_id: requests.current.get(key)! });
      setOperation(null);
      setSuccess('Orden actualizada.');
    } catch (err) {
      setError(rentalError(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent className="rental-app rental-detail">
        <DialogTitle>
          <span className="rental-eyebrow">DETALLE DE ORDEN</span>
          <span className="rental-detail-title">{o.code}</span>
        </DialogTitle>
        <DialogDescription>
          {o.full_name} · {model?.make} {model?.model}
        </DialogDescription>
        <Status status={o.status} />
        <div className="rental-detail-car">
          <img
            src={model?.image}
            alt={model?.model}
            width="1008"
            height="567"
          />
          <div>
            <h3>
              {model?.make} {model?.model}
            </h3>
            <p>
              {shortDate(o.pickup)} — {shortDate(o.dropoff)}
              <br />
              {rentalDays(o.pickup, o.dropoff)} días · {money(o.daily_rate)}/día
            </p>
          </div>
        </div>
        <div className="rental-detail-totals">
          <span>
            Total<strong>{money(orderTotal(o))}</strong>
          </span>
          <span>
            Pagado neto<strong>{money(paid)}</strong>
          </span>
          <span>
            {refundableAmount(data, o) > 0 ? 'Saldo a favor' : 'Saldo'}
            <strong>
              {money(
                refundableAmount(data, o) > 0
                  ? refundableAmount(data, o)
                  : Math.max(0, orderTotal(o) - paid),
              )}
            </strong>
          </span>
        </div>
        <a
          className="rental-button secondary"
          href={href('/dashboard?view=billing&order=' + o.id)}
        >
          Facturación de esta orden <ArrowUpRight size={16} />
        </a>
        <details className="rental-order-info">
          <summary>Datos del conductor y del viaje</summary>
          <dl>
            <dt>Conductor</dt>
            <dd>{o.full_name}</dd>
            <dt>Correo</dt>
            <dd>{o.email}</dd>
            <dt>Teléfono</dt>
            <dd>{o.phone}</dd>
            <dt>Documento</dt>
            <dd>{o.document}</dd>
            <dt>Licencia</dt>
            <dd>
              {o.license} · vence {o.license_expiry}
            </dd>
            <dt>Retiro</dt>
            <dd>
              {o.pickup} · {o.pickup_location}
            </dd>
            <dt>Devolución</dt>
            <dd>
              {o.dropoff} · {o.return_location}
            </dd>
            {admin && (
              <>
                <dt>Unidad</dt>
                <dd>
                  {data.units.find((u) => u.id === o.unit_id)?.label ||
                    'Pendiente de asignar'}
                </dd>
              </>
            )}
            <dt>Notas</dt>
            <dd>{o.notes || 'Sin notas'}</dd>
          </dl>
        </details>
        {!admin && o.status === 'pending' && !demo && (
          <a
            className="rental-button"
            href={whatsappUrl(orderMessage(o, model))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Coordinar pago por WhatsApp <ArrowUpRight size={18} />
          </a>
        )}
        {demo && (
          <p className="rental-notice">
            Orden de demostración. El envío por WhatsApp está desactivado.
          </p>
        )}
        {success && <output className="rental-success">{success}</output>}
        <div className="rental-order-actions">
          {operations.map((op) => (
            <button
              key={op.id}
              disabled={busy}
              className={
                'rental-button ' +
                (op.id === 'payment' ||
                op.id === 'approve' ||
                op.id === 'complete'
                  ? ''
                  : 'secondary')
              }
              onClick={() => {
                setOperation(op.id);
                setError('');
                setSuccess('');
              }}
            >
              {op.label}
            </button>
          ))}
        </div>
        {operation && (
          <form className="rental-form rental-action-form" onSubmit={submit}>
            <h3>{operations.find((op) => op.id === operation)?.label}</h3>
            {['payment', 'refund'].includes(operation) && (
              <>
                <p>
                  {operation === 'refund'
                    ? 'Registra únicamente un reembolso que ya realizaste.'
                    : 'Registra únicamente un pago recibido y verificado. Este botón no cobra dinero.'}
                </p>
                <label>
                  Importe (USD)
                  <input
                    name="amount"
                    type="number"
                    min="0.01"
                    max={
                      operation === 'refund'
                        ? refundableAmount(data, o)
                        : orderTotal(o) - paid
                    }
                    step="0.01"
                    defaultValue={
                      operation === 'refund'
                        ? refundableAmount(data, o)
                        : orderTotal(o) - paid
                    }
                    required
                  />
                </label>
                <label>
                  Método
                  <select name="method">
                    <option>Transferencia</option>
                    <option>Pago móvil</option>
                    <option>Zelle</option>
                    <option>Efectivo</option>
                    <option>Otro</option>
                  </select>
                </label>
                <label>
                  Referencia del pago
                  <input
                    name="reference"
                    required
                    minLength={3}
                    maxLength={120}
                  />
                </label>
              </>
            )}
            {operation === 'approve' && (
              <>
                <p>
                  Se confirmará el alquiler y se bloqueará la unidad para estas
                  fechas.
                </p>
                {paid < orderTotal(o) && (
                  <p className="rental-error">
                    Primero registra el pago completo. Saldo:{' '}
                    {money(orderTotal(o) - paid)}.
                  </p>
                )}
                <label>
                  Unidad que se entregará
                  <select name="unit_id" required defaultValue="">
                    <option value="" disabled>
                      Selecciona una unidad libre
                    </option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label} · {u.plate}
                      </option>
                    ))}
                  </select>
                </label>
                {!units.length && (
                  <p className="rental-error">
                    No hay unidades libres para estas fechas.
                  </p>
                )}
              </>
            )}
            {['start', 'complete', 'cancel', 'reject'].includes(operation) && (
              <label>
                {operation === 'start' || operation === 'complete'
                  ? 'Kilometraje, combustible y estado del vehículo'
                  : 'Motivo'}
                <textarea
                  name="note"
                  required
                  minLength={5}
                  maxLength={1000}
                  rows={3}
                />
              </label>
            )}
            {['cancel', 'reject'].includes(operation) && (
              <p>
                La orden se cerrará
                {paid > 0
                  ? `. Quedarán ${money(paid)} pendientes de reembolso`
                  : ''}
                .
              </p>
            )}
            {error && (
              <p className="rental-error" role="alert">
                {error}
              </p>
            )}
            <div className="rental-inline">
              <button
                className="rental-button"
                disabled={
                  busy ||
                  (operation === 'approve' &&
                    (paid < orderTotal(o) || !units.length))
                }
              >
                {busy ? 'Guardando…' : 'Confirmar operación'}
              </button>
              <button
                className="rental-button secondary"
                type="button"
                disabled={busy}
                onClick={() => setOperation(null)}
              >
                Volver
              </button>
            </div>
          </form>
        )}
        <section className="rental-history">
          <h3>Historial de la orden</h3>
          {data.events
            .filter((e) => e.order_id === o.id)
            .toSorted((a, b) => b.created_at.localeCompare(a.created_at))
            .map((e) => (
              <div key={e.id}>
                <i />
                <p>
                  {e.message}
                  <small>
                    {new Intl.DateTimeFormat('es-VE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'America/Caracas',
                    }).format(new Date(e.created_at))}
                  </small>
                </p>
              </div>
            ))}
        </section>
        <button
          className="rental-button secondary"
          onClick={onClose}
          disabled={busy}
        >
          Cerrar detalle
        </button>
      </DialogContent>
    </Dialog>
  );
}
function UnitForm({
  unit,
  onClose,
}: {
  unit: RentalUnit | 'new';
  onClose: () => void;
}) {
  const { data, saveUnit } = useRental();
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const u = unit === 'new' ? undefined : unit;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent className="rental-app rental-unit-dialog">
        <DialogTitle>
          {u ? 'Editar unidad' : 'Añadir vehículo a la flota'}
        </DialogTitle>
        <DialogDescription>
          Una unidad representa un carro físico. Su matrícula debe ser única.
        </DialogDescription>
        <form
          className="rental-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setBusy(true);
            setError('');
            try {
              await saveUnit({
                id: u?.id,
                model_id: formText(f, 'model_id'),
                label: formText(f, 'label').trim(),
                plate: formText(f, 'plate').trim(),
                status: formText(f, 'status') as RentalUnit['status'],
              });
              onClose();
            } catch (err) {
              setError(rentalError(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Modelo
            <select name="model_id" defaultValue={u?.model_id}>
              {data.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.make} {m.model}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nombre interno
            <input
              name="label"
              required
              minLength={2}
              maxLength={80}
              defaultValue={u?.label}
              placeholder="Ej. Lancer 01"
            />
          </label>
          <label>
            Matrícula
            <input
              name="plate"
              required
              minLength={3}
              maxLength={20}
              defaultValue={u?.plate}
            />
          </label>
          <label>
            Estado
            <select name="status" defaultValue={u?.status || 'available'}>
              <option value="available">Operativo</option>
              <option value="maintenance">En mantenimiento</option>
              <option value="inactive">Inactivo</option>
            </select>
          </label>
          {error && (
            <p className="rental-error" role="alert">
              {error}
            </p>
          )}
          <button className="rental-button" disabled={busy}>
            <Wrench size={18} />
            {busy ? 'Guardando…' : 'Guardar unidad'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrdersTable({
  items,
  data,
  setSelected,
}: {
  items: RentalOrder[];
  data: import('@/lib/rental-domain').RentalData;
  setSelected: (id: string) => void;
}) {
  return items.length ? (
    <div className="rental-table-wrap">
      <table className="rental-table rental-order-table">
        <thead>
          <tr>
            <th>Orden / cliente</th>
            <th>Vehículo</th>
            <th>Fechas</th>
            <th>Estado</th>
            <th>Total</th>
            <th aria-label="Abrir orden">
              <span className="sr-only">Abrir orden</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => {
            const model = data.models.find((m) => m.id === o.model_id);
            return (
              <tr key={o.id}>
                <td>
                  <button
                    className="rental-order-link"
                    onClick={() => setSelected(o.id)}
                  >
                    {o.code}
                  </button>
                  <small>{o.full_name}</small>
                </td>
                <td
                  aria-label={
                    (model?.make || '') + ' ' + (model?.model || o.model_id)
                  }
                >
                  <div className="rental-table-car">
                    <img
                      src={model?.image}
                      alt=""
                      width="68"
                      height="44"
                      loading="lazy"
                    />
                    <span>
                      {model?.model}
                      <small>{model?.category}</small>
                    </span>
                  </div>
                </td>
                <td>
                  {shortDate(o.pickup)} — {shortDate(o.dropoff)}
                  <small>{rentalDays(o.pickup, o.dropoff)} días</small>
                </td>
                <td>
                  <Status status={o.status} />
                </td>
                <td>
                  <strong>{money(orderTotal(o))}</strong>
                  <small>
                    {paidTotal(data, o.id) >= orderTotal(o)
                      ? 'Pago completo'
                      : `Pagado ${money(paidTotal(data, o.id))}`}
                  </small>
                </td>
                <td>
                  <button
                    className="rental-icon-button"
                    aria-label={'Ver orden ' + o.code}
                    onClick={() => setSelected(o.id)}
                  >
                    <ArrowUpRight size={19} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      title="No hay órdenes para mostrar"
      body="Las nuevas solicitudes aparecerán aquí para darles seguimiento."
    />
  );
}
