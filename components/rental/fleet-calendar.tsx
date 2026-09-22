'use client';
import { useDeferredValue, useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useRental } from './rental-provider';
import { rentalToday, shortDate } from '@/lib/rental-domain';
import {
  calendarDays,
  calendarSearch,
  indexCalendarOrders,
  moveCalendar,
  overdueOrder,
  summarizeCalendar,
  unitOnDay,
  type CalendarMode,
  type UnitDayState,
} from '@/lib/fleet-calendar';

const pageSize = 20;
const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const dateLabel = (day: string) =>
  new Intl.DateTimeFormat('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(day + 'T12:00:00Z'));
type DetailView = 'units' | 'movements' | 'pending' | 'overdue';
export function FleetCalendar({ onOrder }: { onOrder: (id: string) => void }) {
  const { data } = useRental(),
    today = rentalToday();
  const [anchor, setAnchor] = useState(today),
    [selected, setSelected] = useState(today),
    [mode, setMode] = useState<CalendarMode>('month');
  const [model, setModel] = useState('all'),
    [query, setQuery] = useState(''),
    [view, setView] = useState<DetailView>('units'),
    [state, setState] = useState<UnitDayState | 'all'>('all'),
    [page, setPage] = useState(0);
  const search = calendarSearch(useDeferredValue(query));
  const models = useMemo(
    () => new Map(data.models.map((m) => [m.id, m])),
    [data.models],
  );
  const units = useMemo(
    () =>
      data.units
        .filter(
          (u) =>
            (model === 'all' || u.model_id === model) &&
            calendarSearch(
              `${u.label} ${u.plate} ${models.get(u.model_id)?.make || ''} ${models.get(u.model_id)?.model || ''}`,
            ).includes(search),
        )
        .toSorted(
          (a, b) =>
            a.model_id.localeCompare(b.model_id) ||
            a.label.localeCompare(b.label, undefined, { numeric: true }),
        ),
    [data.units, model, models, search],
  );
  const orders = useMemo(() => {
    const ids = new Set(units.map((u) => u.id));
    return data.orders.filter((o) =>
      o.unit_id
        ? ids.has(o.unit_id)
        : !search && (model === 'all' || o.model_id === model),
    );
  }, [data.orders, units, model, search]);
  const index = useMemo(() => indexCalendarOrders(orders), [orders]);
  const days = useMemo(() => calendarDays(anchor, mode), [anchor, mode]);
  const summaries = useMemo(
    () => summarizeCalendar(units, orders, days, today, index),
    [units, orders, days, today, index],
  );
  const summary = summaries.get(selected)!;
  const details = useMemo(
    () =>
      units.map((u) => unitOnDay(u, index.get(u.id) || [], selected, today)),
    [units, index, selected, today],
  );
  const unitRows = details.filter(
    (row) => state === 'all' || row.state === state,
  );
  const movements = orders
    .filter(
      (o) =>
        ['approved', 'active'].includes(o.status) &&
        (o.pickup === selected || o.dropoff === selected),
    )
    .toSorted(
      (a, b) =>
        a.dropoff.localeCompare(b.dropoff) || a.code.localeCompare(b.code),
    );
  const pending = orders.filter(
    (o) => o.status === 'pending' && o.pickup === selected,
  );
  const overdue = orders.filter((o) => overdueOrder(o, today));
  const orderRows =
    view === 'movements' ? movements : view === 'pending' ? pending : overdue;
  const totalRows = view === 'units' ? unitRows.length : orderRows.length,
    pages = Math.max(1, Math.ceil(totalRows / pageSize)),
    currentPage = Math.min(page, pages - 1);
  const byModel = useMemo(() => {
    const groups = new Map<
      string,
      { name: string; total: number; free: number }
    >();
    for (const row of details) {
      const m = models.get(row.unit.model_id),
        group = groups.get(row.unit.model_id) || {
          name: m ? `${m.make} ${m.model}` : row.unit.model_id,
          total: 0,
          free: 0,
        };
      group.total++;
      if (row.state === 'free') group.free++;
      groups.set(row.unit.model_id, group);
    }
    return [...groups.entries()];
  }, [details, models]);
  function selectDay(day: string) {
    setSelected(day);
    setPage(0);
    if (!days.includes(day)) setAnchor(day);
  }
  function navigate(direction: number) {
    const next = moveCalendar(anchor, mode, direction);
    setAnchor(next);
    setSelected(next);
    setPage(0);
  }
  function changeView(next: DetailView) {
    setView(next);
    setPage(0);
  }
  const monthTitle = new Intl.DateTimeFormat('es-VE', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(anchor + 'T12:00:00Z'));
  return (
    <div className="fleet-calendar">
      <section
        className="rental-card fc-controls"
        aria-label="Filtros de disponibilidad"
      >
        <div>
          <span className="rental-eyebrow">TU FLOTA, DE UN VISTAZO</span>
          <h2>Disponibilidad sin perderte entre carros</h2>
          <p>Elige un día para ver unidades, entregas y devoluciones.</p>
        </div>
        <div className="fc-filters">
          <label>
            Modelo
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">Todos los modelos</option>
              {data.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.make} {m.model}
                </option>
              ))}
            </select>
          </label>
          <label>
            Buscar vehículo
            <div className="fc-search">
              <Search size={16} aria-hidden="true" />
              <input
                placeholder="Matrícula, nombre o modelo"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
              />
            </div>
          </label>
          {(query || model !== 'all') && (
            <button
              className="rental-button secondary compact"
              onClick={() => {
                setQuery('');
                setModel('all');
                setPage(0);
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </section>
      {overdue.length > 0 && (
        <div className="fc-warning">
          <div>
            <strong>
              {overdue.length}{' '}
              {overdue.length === 1
                ? 'devolución atrasada'
                : 'devoluciones atrasadas'}{' '}
              ahora
            </strong>
            <p>Esas unidades siguen ocupadas hasta registrar su regreso.</p>
          </div>
          <button
            onClick={() => {
              selectDay(today);
              changeView('overdue');
            }}
            className="rental-button secondary compact"
          >
            Revisar atrasos <ArrowUpRight size={16} />
          </button>
        </div>
      )}
      <section
        className="rental-card fc-month"
        aria-label="Resumen de disponibilidad"
      >
        <div className="fc-month-heading">
          <div>
            <h2>
              {mode === 'month'
                ? monthTitle
                : `${shortDate(days[0])} — ${shortDate(days[6])}`}
            </h2>
            <p>
              {units.length} vehículos{' '}
              {query || model !== 'all' ? 'en el filtro' : 'en la flota'} · los
              números indican carros libres
            </p>
          </div>
          <div className="fc-navigation">
            <div className="fc-segment" aria-label="Vista del calendario">
              <button
                aria-pressed={mode === 'month'}
                onClick={() => {
                  setMode('month');
                  setAnchor(selected);
                }}
              >
                Mes
              </button>
              <button
                aria-pressed={mode === 'week'}
                onClick={() => {
                  setMode('week');
                  setAnchor(selected);
                }}
              >
                Semana
              </button>
            </div>
            <button
              className="rental-button secondary compact"
              onClick={() => {
                setAnchor(today);
                selectDay(today);
              }}
            >
              Hoy
            </button>
            <div className="fc-period-nav">
              <button
                className="rental-icon-button"
                aria-label={
                  mode === 'month' ? 'Mes anterior' : 'Semana anterior'
                }
                onClick={() => navigate(-1)}
              >
                <ChevronLeft size={19} />
              </button>
              <label className="fc-jump">
                <span className="sr-only">Ir a una fecha</span>
                <input
                  aria-label="Ir a una fecha"
                  type="date"
                  value={selected}
                  onChange={(e) => {
                    if (e.target.value) {
                      setAnchor(e.target.value);
                      selectDay(e.target.value);
                    }
                  }}
                />
              </label>
              <button
                className="rental-icon-button"
                aria-label={
                  mode === 'month' ? 'Mes siguiente' : 'Semana siguiente'
                }
                onClick={() => navigate(1)}
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
        </div>
        <div className="fc-grid" aria-label="Días del calendario">
          {weekdays.map((d) => (
            <span className="fc-weekday" key={d}>
              {d}
            </span>
          ))}
          {days.map((day) => {
            const s = summaries.get(day)!,
              outside =
                mode === 'month' && day.slice(0, 7) !== anchor.slice(0, 7);
            return (
              <button
                key={day}
                className={`fc-day ${outside ? 'outside' : ''} ${s.total && s.free === 0 ? 'sold-out' : ''}`}
                aria-pressed={day === selected}
                aria-current={day === today ? 'date' : undefined}
                aria-label={`${dateLabel(day)}: ${s.free} libres de ${s.total}, ${s.busy} ocupados, ${s.offline} fuera de servicio, ${s.pickups} entregas, ${s.returns} devoluciones, ${s.pending} solicitudes pendientes`}
                onClick={() => selectDay(day)}
              >
                <span className="fc-day-number">
                  {Number(day.slice(-2))}
                  {day === today && <i aria-hidden="true" />}
                </span>
                <strong>{s.total ? s.free : '—'}</strong>
                <small>{s.total ? 'libres' : 'sin flota'}</small>
                <span className="fc-occupancy" aria-hidden="true">
                  <i
                    style={{
                      width: `${s.total ? (s.busy / s.total) * 100 : 0}%`,
                    }}
                  />
                  <em
                    style={{
                      width: `${s.total ? (s.offline / s.total) * 100 : 0}%`,
                    }}
                  />
                </span>
                <span className="fc-day-movements" aria-hidden="true">
                  {s.pickups + s.returns > 0
                    ? `${s.pickups} sal. · ${s.returns} dev.`
                    : 'Sin movimientos'}
                </span>
              </button>
            );
          })}
        </div>
        <div className="fc-legend">
          <span>
            <i className="free" />
            Libres
          </span>
          <span>
            <i className="busy" />
            Ocupados / reservados
          </span>
          <span>
            <i className="offline" />
            Taller / inactivos
          </span>
          <span className="fc-legend-note">
            Toca una fecha para consultar el detalle ↓
          </span>
        </div>
      </section>
      <section
        className="rental-card fc-detail"
        aria-label="Detalle del día seleccionado"
      >
        <div className="fc-detail-heading">
          <div>
            <span className="rental-eyebrow">DETALLE DEL DÍA</span>
            <h2>{dateLabel(selected)}</h2>
            <p>
              Resumen de los vehículos{' '}
              {query || model !== 'all' ? 'filtrados' : 'de la flota'}.
            </p>
          </div>
          <CalendarDays size={26} aria-hidden="true" />
        </div>
        <div className="fc-stats" aria-live="polite">
          <div>
            <strong>{summary.free}</strong>
            <span>Libres</span>
          </div>
          <div>
            <strong>{summary.busy}</strong>
            <span>Ocupados</span>
          </div>
          <div>
            <strong>{summary.offline}</strong>
            <span>Fuera de servicio</span>
          </div>
          <div>
            <strong>
              {summary.pickups} / {summary.returns}
            </strong>
            <span>Entregas / devoluciones</span>
          </div>
        </div>
        {model === 'all' && byModel.length > 0 && (
          <details className="fc-models">
            <summary>
              Disponibilidad por modelo <span>{byModel.length} modelos</span>
            </summary>
            <div>
              {byModel.map(([id, g]) => (
                <button
                  key={id}
                  onClick={() => {
                    setModel(id);
                    setPage(0);
                  }}
                >
                  <span>{g.name}</span>
                  <strong>
                    {g.free} <small>libres / {g.total}</small>
                  </strong>
                  <ArrowUpRight size={15} />
                </button>
              ))}
            </div>
          </details>
        )}
        <div className="fc-detail-tabs" aria-label="Tipo de detalle">
          {(
            [
              { id: 'units', label: 'Vehículos', count: units.length },
              {
                id: 'movements',
                label: 'Movimientos',
                count: movements.length,
              },
              { id: 'pending', label: 'Solicitudes', count: pending.length },
              {
                id: 'overdue',
                label: 'Atrasos actuales',
                count: overdue.length,
              },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              aria-pressed={view === v.id}
              onClick={() => changeView(v.id)}
            >
              {v.label}
              <span>{v.count}</span>
            </button>
          ))}
        </div>
        {view === 'units' && (
          <div className="fc-unit-filter">
            <label>
              Mostrar unidades
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value as typeof state);
                  setPage(0);
                }}
              >
                <option value="all">Todas las unidades</option>
                <option value="free">Solo libres</option>
                <option value="busy">Ocupadas / reservadas</option>
                <option value="offline">Fuera de servicio</option>
              </select>
            </label>
            <span>
              {unitRows.length} resultados · máximo {pageSize} por página
            </span>
          </div>
        )}
        {view === 'pending' && (
          <p className="fc-note">
            Solicitudes con retiro el {shortDate(selected)}. Todavía no bloquean
            vehículos: requieren pago verificado y aprobación.
          </p>
        )}
        {view === 'movements' && (
          <p className="fc-note">
            Entregas y devoluciones programadas para esta fecha. Abre una orden
            para registrar la operación.
          </p>
        )}
        {view === 'overdue' && (
          <p className="fc-note">
            Devoluciones vencidas al día de hoy ({shortDate(today)}), aunque
            estés consultando otra fecha.
          </p>
        )}
        <div className="fc-rows">
          {view === 'units'
            ? unitRows
                .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                .map((row) => {
                  const m = models.get(row.unit.model_id),
                    label = row.overdue
                      ? 'Devolución atrasada'
                      : row.state === 'busy'
                        ? row.order?.status === 'active'
                          ? 'En alquiler'
                          : 'Reservado'
                        : row.state === 'free'
                          ? 'Libre'
                          : row.unit.status === 'maintenance'
                            ? 'En taller'
                            : 'Inactivo';
                  return (
                    <div className="fc-unit-row" key={row.unit.id}>
                      <div>
                        <strong>{row.unit.label}</strong>
                        <small>
                          {row.unit.plate} · {m?.make} {m?.model}
                        </small>
                      </div>
                      <span
                        className={`fc-state ${row.overdue ? 'late' : row.state}`}
                      >
                        {label}
                      </span>
                      {row.order ? (
                        <button
                          className="fc-order-link"
                          onClick={() => onOrder(row.order!.id)}
                        >
                          {row.order.code} <ArrowUpRight size={15} />
                          <small>
                            {row.order.full_name}
                            {row.conflict
                              ? ' · Revisar asignación'
                              : ` · Hasta ${shortDate(row.order.dropoff)}`}
                          </small>
                        </button>
                      ) : (
                        <span className="fc-unit-hint">
                          {row.state === 'free'
                            ? 'Disponible este día'
                            : 'No disponible para reservas'}
                        </span>
                      )}
                    </div>
                  );
                })
            : orderRows
                .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                .map((o) => (
                  <button
                    key={o.id}
                    className="fc-movement-row"
                    onClick={() => onOrder(o.id)}
                  >
                    {view === 'movements' ? (
                      o.pickup === selected ? (
                        <ArrowUpRight aria-hidden="true" />
                      ) : (
                        <ArrowDownLeft aria-hidden="true" />
                      )
                    ) : (
                      <CalendarDays aria-hidden="true" />
                    )}
                    <span>
                      <strong>
                        {view === 'movements'
                          ? o.pickup === selected
                            ? 'Entrega'
                            : 'Devolución'
                          : view === 'pending'
                            ? 'Solicitud por aprobar'
                            : 'Devolución atrasada'}{' '}
                        · {o.code}
                      </strong>
                      <small>
                        {o.full_name} · {models.get(o.model_id)?.model} ·{' '}
                        {o.pickup} → {o.dropoff}
                      </small>
                    </span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </button>
                ))}
        </div>
        {!totalRows && (
          <div className="rental-empty">
            <CalendarDays size={28} />
            <h3>
              {units.length
                ? 'No hay resultados en esta vista'
                : 'No hay vehículos en este filtro'}
            </h3>
            <p>
              {units.length
                ? 'Prueba otra fecha o cambia el filtro.'
                : 'Cambia la búsqueda o registra tus unidades en Flota.'}
            </p>
          </div>
        )}
        {totalRows > 0 && (
          <nav className="fc-pagination" aria-label="Páginas del detalle">
            <span>
              {currentPage * pageSize + 1}–
              {Math.min((currentPage + 1) * pageSize, totalRows)} de {totalRows}
            </span>
            <div>
              <button
                className="rental-icon-button"
                aria-label="Página anterior de resultados"
                disabled={!currentPage}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                Página {currentPage + 1} de {pages}
              </span>
              <button
                className="rental-icon-button"
                aria-label="Página siguiente de resultados"
                disabled={currentPage >= pages - 1}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </nav>
        )}
      </section>
      <p className="fc-footnote">
        Disponibilidad calculada con los estados actuales; no es un historial de
        ocupación pasada. El día de devolución puede iniciar otro alquiler. Los
        atrasos mantienen bloqueada la unidad y las solicitudes pendientes no la
        reservan.
      </p>
    </div>
  );
}
