export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected';
export type RentalModel = {
  id: string;
  make: string;
  model: string;
  category: string;
  daily_rate: number;
  seats: number;
  image: string;
};
export type RentalUnit = {
  id: string;
  model_id: string;
  label: string;
  plate: string;
  status: 'available' | 'maintenance' | 'inactive';
};
export type RentalProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
};
export type BookingInput = {
  model_id: string;
  pickup: string;
  dropoff: string;
  full_name: string;
  phone: string;
  email: string;
  document: string;
  license: string;
  license_expiry: string;
  pickup_location: string;
  return_location: string;
  notes: string;
  consent: boolean;
};
export type RentalOrder = BookingInput & {
  id: string;
  code: string;
  customer_id: string;
  unit_id: string | null;
  status: OrderStatus;
  daily_rate: number;
  total: number;
  created_at: string;
};
export type RentalPayment = {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  reference: string;
  created_at: string;
};
export type RentalEvent = {
  id: string;
  order_id: string;
  message: string;
  created_at: string;
};
export type RentalData = {
  models: RentalModel[];
  units: RentalUnit[];
  orders: RentalOrder[];
  profiles: RentalProfile[];
  payments: RentalPayment[];
  events: RentalEvent[];
};
export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Por aprobar',
  approved: 'Confirmada',
  active: 'En alquiler',
  completed: 'Completada',
  cancelled: 'Cancelada',
  rejected: 'Rechazada',
};
export function rentalToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function addDays(date: string, days: number) {
  return new Date(Date.parse(date + 'T12:00:00Z') + days * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function rentalDays(start: string, end: string) {
  const valid = (v: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    Number.isFinite(Date.parse(v)) &&
    new Date(v).toISOString().slice(0, 10) === v;
  return valid(start) && valid(end)
    ? (Date.parse(end) - Date.parse(start)) / 86400000
    : NaN;
}
export function validateBooking(input: BookingInput, today = rentalToday()) {
  const days = rentalDays(input.pickup, input.dropoff);
  if (!Number.isInteger(days) || days < 1 || days > 90 || input.pickup < today)
    throw new Error(
      'Elige un retiro desde hoy y una devolución posterior, hasta 90 días.',
    );
  if (input.full_name.trim().length < 3 || input.full_name.length > 120)
    throw new Error('Escribe el nombre completo del conductor.');
  if (!/^\+?[\d ()-]{7,25}$/.test(input.phone))
    throw new Error('Revisa el teléfono e incluye el código de país.');
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
    input.email.length > 254
  )
    throw new Error('Escribe un correo válido.');
  if (
    input.document.trim().length < 4 ||
    input.license.trim().length < 4 ||
    input.document.length > 40 ||
    input.license.length > 40
  )
    throw new Error('Completa el documento y la licencia del conductor.');
  if (
    !Number.isFinite(rentalDays(input.dropoff, input.license_expiry)) ||
    input.license_expiry < input.dropoff
  )
    throw new Error('La licencia debe estar vigente hasta la devolución.');
  if (
    !input.pickup_location.trim() ||
    !input.return_location.trim() ||
    input.pickup_location.length > 160 ||
    input.return_location.length > 160
  )
    throw new Error('Completa los lugares de retiro y devolución.');
  if (input.notes.length > 1000)
    throw new Error('Las notas pueden tener hasta 1.000 caracteres.');
  if (!input.consent)
    throw new Error('Acepta el uso de tus datos para gestionar la solicitud.');
  return days;
}
// Daily rentals use [pickup, return): the return date can be the next pickup.
export function blocksUnit(
  order: RentalOrder,
  pickup: string,
  dropoff: string,
  today = rentalToday(),
) {
  if (order.status !== 'approved' && order.status !== 'active') return false;
  if (order.status === 'active' && order.dropoff <= today) return true;
  return order.pickup < dropoff && order.dropoff > pickup;
}
export function availableUnits(
  data: RentalData,
  model: string,
  pickup: string,
  dropoff: string,
  except?: string,
) {
  if (!(rentalDays(pickup, dropoff) > 0)) return [];
  return data.units.filter(
    (unit) =>
      unit.model_id === model &&
      unit.status === 'available' &&
      !data.orders.some(
        (order) =>
          order.id !== except &&
          order.unit_id === unit.id &&
          blocksUnit(order, pickup, dropoff),
      ),
  );
}
export function paidTotal(data: RentalData, orderId: string) {
  return (
    Math.round(
      data.payments
        .filter((p) => p.order_id === orderId)
        .reduce((sum, p) => sum + Number(p.amount), 0) * 100,
    ) / 100
  );
}
export function money(value: number) {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}
export function shortDate(value: string) {
  return new Intl.DateTimeFormat('es-VE', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(value + 'T12:00:00Z'));
}
export function orderMessage(order: RentalOrder, model?: RentalModel) {
  return `Hola, Ciudad Cars. Ya completé mi solicitud ${order.code}.\n\nConductor: ${order.full_name}\nVehículo: ${model ? model.make + ' ' + model.model : order.model_id}\nRetiro: ${order.pickup} · ${order.pickup_location}\nDevolución: ${order.dropoff} · ${order.return_location}\nDuración: ${rentalDays(order.pickup, order.dropoff)} días\nTotal de alquiler: ${money(order.total)}\n\nQuisiera coordinar el pago y la aprobación de esta orden. Entiendo que aún no está confirmada.`;
}
export type OrderAction =
  | 'payment'
  | 'refund'
  | 'approve'
  | 'start'
  | 'complete'
  | 'cancel'
  | 'reject';
export type ActionInput = {
  action: OrderAction;
  order_id: string;
  unit_id?: string;
  amount?: number;
  method?: string;
  reference?: string;
  note?: string;
  request_id: string;
};
export function formText(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === 'string' ? value : '';
}
