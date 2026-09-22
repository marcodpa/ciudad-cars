import type { RentalOrder, RentalUnit } from './rental-domain';

export type CalendarMode = 'month' | 'week';
export type UnitDayState = 'free' | 'busy' | 'offline';
export function shiftDate(day: string, offset: number) {
  return new Date(Date.parse(day + 'T12:00:00Z') + offset * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function calendarDays(anchor: string, mode: CalendarMode) {
  const first = mode === 'month' ? anchor.slice(0, 7) + '-01' : anchor;
  const weekday = (new Date(first + 'T12:00:00Z').getUTCDay() + 6) % 7;
  return Array.from({ length: mode === 'month' ? 42 : 7 }, (_, i) =>
    shiftDate(first, i - weekday),
  );
}
export function moveCalendar(
  anchor: string,
  mode: CalendarMode,
  direction: number,
) {
  if (mode === 'week') return shiftDate(anchor, direction * 7);
  const date = new Date(anchor.slice(0, 7) + '-01T12:00:00Z');
  date.setUTCMonth(date.getUTCMonth() + direction);
  return date.toISOString().slice(0, 10);
}
export function indexCalendarOrders(orders: RentalOrder[]) {
  const index = new Map<string, RentalOrder[]>();
  for (const order of orders) {
    if (!order.unit_id || !['approved', 'active'].includes(order.status))
      continue;
    const list = index.get(order.unit_id) || [];
    list.push(order);
    index.set(order.unit_id, list);
  }
  return index;
}
export function overdueOrder(order: RentalOrder, today: string) {
  return order.status === 'active' && order.dropoff <= today;
}
export function unitOnDay(
  unit: RentalUnit,
  orders: RentalOrder[],
  day: string,
  today: string,
) {
  const bookings = orders.filter(
    (o) =>
      (o.pickup <= day && o.dropoff > day) ||
      (day >= today && overdueOrder(o, today)),
  );
  // An overdue rental takes precedence over a later reservation for the same unit.
  const order =
    bookings.find((o) => overdueOrder(o, today)) ||
    bookings.find((o) => o.status === 'active') ||
    bookings[0];
  const state: UnitDayState = order
    ? 'busy'
    : unit.status === 'available'
      ? 'free'
      : 'offline';
  return {
    unit,
    state,
    order,
    overdue: !!order && day >= today && overdueOrder(order, today),
    conflict: bookings.length > 1,
  };
}
export type CalendarSummary = {
  day: string;
  total: number;
  free: number;
  busy: number;
  offline: number;
  overdue: number;
  pickups: number;
  returns: number;
  pending: number;
};
export function summarizeCalendar(
  units: RentalUnit[],
  orders: RentalOrder[],
  days: string[],
  today: string,
  index = indexCalendarOrders(orders),
) {
  const summaries = new Map<string, CalendarSummary>(
    days.map((day) => [
      day,
      {
        day,
        total: units.length,
        free: 0,
        busy: 0,
        offline: 0,
        overdue: 0,
        pickups: 0,
        returns: 0,
        pending: 0,
      },
    ]),
  );
  for (const unit of units) {
    const bookings = index.get(unit.id) || [];
    for (const day of days) {
      const state = unitOnDay(unit, bookings, day, today),
        summary = summaries.get(day)!;
      summary[state.state]++;
      if (state.overdue) summary.overdue++;
    }
  }
  for (const order of orders) {
    if (['approved', 'active'].includes(order.status)) {
      const pickup = summaries.get(order.pickup),
        dropoff = summaries.get(order.dropoff);
      if (pickup) pickup.pickups++;
      if (dropoff) dropoff.returns++;
    } else if (order.status === 'pending') {
      const day = summaries.get(order.pickup);
      if (day) day.pending++;
    }
  }
  return summaries;
}
export function calendarSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
