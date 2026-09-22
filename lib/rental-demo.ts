import { fleet } from './fleet';
import {
  addDays,
  availableUnits,
  paidTotal,
  rentalToday,
  validateBooking,
  type RentalData,
  type RentalProfile,
  type BookingInput,
  type ActionInput,
  type RentalUnit,
} from './rental-domain';

export const demoAdmin: RentalProfile = {
  id: 'demo-admin',
  full_name: 'Equipo Ciudad Cars',
  email: 'equipo@example.com',
  phone: '',
  role: 'admin',
};
export const demoCustomer: RentalProfile = {
  id: 'demo-customer',
  full_name: 'Andrea Demo',
  email: 'andrea@example.com',
  phone: '+58 412 0000000',
  role: 'customer',
};
export function demoBooking(): BookingInput {
  const today = rentalToday();
  return {
    model_id: 'lancer',
    pickup: addDays(today, 1),
    dropoff: addDays(today, 4),
    full_name: demoCustomer.full_name,
    email: demoCustomer.email,
    phone: demoCustomer.phone,
    document: 'DEMO-0001',
    license: 'DEMO-0001',
    license_expiry: addDays(today, 365),
    pickup_location: 'Oficina Bella Vista',
    return_location: 'Oficina Bella Vista',
    notes: '',
    consent: false,
  };
}
export function createDemoData(): RentalData {
  const today = rentalToday();
  const models = fleet.map((car) => ({
    id: car.id,
    make: car.make,
    model: car.model,
    category: car.category,
    daily_rate: car.price,
    seats: car.passengers,
    image: car.mobileImage,
  }));
  const units: RentalUnit[] = models.flatMap((model, i) =>
    Array.from({ length: i < 2 ? 2 : 1 }, (_, k) => ({
      id: `${model.id}-${k + 1}`,
      model_id: model.id,
      label: `${model.model} ${String(k + 1).padStart(2, '0')}`,
      plate: `DEMO-${i + 1}${k + 1}`,
      status: 'available' as const,
    })),
  );
  const input = demoBooking();
  const orders: RentalData['orders'] = [
    {
      ...input,
      consent: true,
      id: 'demo-order-1',
      code: 'DEMO-1001',
      customer_id: demoCustomer.id,
      unit_id: null,
      status: 'pending',
      daily_rate: 75,
      total: 225,
      created_at: new Date().toISOString(),
    },
    {
      ...input,
      consent: true,
      id: 'demo-order-2',
      code: 'DEMO-1002',
      customer_id: 'demo-customer-2',
      full_name: 'Carlos Ejemplo',
      email: 'carlos@example.com',
      model_id: 'cruze',
      unit_id: 'cruze-1',
      status: 'active',
      pickup: today,
      dropoff: addDays(today, 3),
      daily_rate: 85,
      total: 255,
      created_at: new Date().toISOString(),
    },
    {
      ...input,
      consent: true,
      id: 'demo-order-3',
      code: 'DEMO-1003',
      customer_id: demoCustomer.id,
      model_id: 'explorer',
      unit_id: 'explorer-1',
      status: 'approved',
      pickup: addDays(today, 5),
      dropoff: addDays(today, 9),
      daily_rate: 160,
      total: 640,
      created_at: new Date().toISOString(),
    },
  ];
  return {
    models,
    units,
    orders,
    profiles: [
      demoAdmin,
      demoCustomer,
      {
        ...demoCustomer,
        id: 'demo-customer-2',
        full_name: 'Carlos Ejemplo',
        email: 'carlos@example.com',
      },
    ],
    payments: orders
      .filter((o) => o.status !== 'pending')
      .map((o) => ({
        id: crypto.randomUUID(),
        order_id: o.id,
        amount: o.total,
        method: 'Transferencia',
        reference: `DEMO-${o.code}`,
        created_at: new Date().toISOString(),
      })),
    events: orders.map((o) => ({
      id: crypto.randomUUID(),
      order_id: o.id,
      message: 'Orden de ejemplo. No representa un alquiler real.',
      created_at: new Date().toISOString(),
    })),
  };
}
export function demoCreateOrder(
  data: RentalData,
  input: BookingInput,
  customer: RentalProfile,
  request: string,
) {
  const prior = data.orders.find((o) => o.id === request);
  if (prior) return prior;
  const days = validateBooking(input);
  if (
    data.orders.filter(
      (o) => o.customer_id === customer.id && o.status === 'pending',
    ).length >= 5
  )
    throw new Error('Ya tienes cinco solicitudes pendientes.');
  const model = data.models.find((m) => m.id === input.model_id);
  if (
    !model ||
    !availableUnits(data, model.id, input.pickup, input.dropoff).length
  )
    throw new Error('No hay unidades disponibles para estas fechas.');
  const order = {
    ...input,
    id: request,
    code: `DEMO-${1001 + data.orders.length}`,
    customer_id: customer.id,
    unit_id: null,
    status: 'pending' as const,
    daily_rate: model.daily_rate,
    total: model.daily_rate * days,
    created_at: new Date().toISOString(),
  };
  data.orders.unshift(order);
  data.events.unshift({
    id: crypto.randomUUID(),
    order_id: order.id,
    message: 'Solicitud creada. Pendiente de pago y aprobación.',
    created_at: new Date().toISOString(),
  });
  return order;
}
export function demoAction(
  data: RentalData,
  input: ActionInput,
  actor: RentalProfile,
) {
  const o = data.orders.find((o) => o.id === input.order_id);
  if (!o || (actor.role !== 'admin' && o.customer_id !== actor.id))
    throw new Error('Orden no disponible.');
  if (data.events.some((e) => e.id === input.request_id)) return o;
  if (
    actor.role !== 'admin' &&
    !(input.action === 'cancel' && o.status === 'pending')
  )
    throw new Error('Solo un administrador puede realizar esta operación.');
  const paid = paidTotal(data, o.id);
  let message = '';
  switch (input.action) {
    case 'payment':
    case 'refund': {
      const amount = input.amount || 0;
      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001
      )
        throw new Error('Escribe un importe positivo con hasta dos decimales.');
      if (
        !input.reference ||
        input.reference.trim().length < 3 ||
        !input.method
      )
        throw new Error('Completa el método y la referencia.');
      if (
        data.payments.some(
          (p) => p.order_id === o.id && p.reference === input.reference,
        )
      )
        throw new Error('Esta referencia ya está registrada en la orden.');
      if (
        input.action === 'payment' &&
        (!['pending', 'approved', 'active'].includes(o.status) ||
          paid + amount > o.total)
      )
        throw new Error('El pago supera el saldo o la orden está cerrada.');
      if (
        input.action === 'refund' &&
        (!['cancelled', 'rejected'].includes(o.status) || amount > paid)
      )
        throw new Error(
          'El reembolso supera el saldo o la orden no está cancelada.',
        );
      data.payments.unshift({
        id: input.request_id,
        order_id: o.id,
        amount: input.action === 'refund' ? -amount : amount,
        method: input.method,
        reference: input.reference,
        created_at: new Date().toISOString(),
      });
      message = `${input.action === 'refund' ? 'Reembolso registrado' : 'Pago verificado'}: USD ${amount}`;
      break;
    }
    case 'approve':
      if (o.status !== 'pending' || paid < o.total)
        throw new Error(
          'Verifica primero el pago completo de una orden pendiente.',
        );
      if (o.pickup < rentalToday())
        throw new Error('La fecha de retiro ya pasó.');
      if (
        !availableUnits(data, o.model_id, o.pickup, o.dropoff, o.id).some(
          (u) => u.id === input.unit_id,
        )
      )
        throw new Error('La unidad ya está ocupada. Selecciona otra.');
      o.unit_id = input.unit_id!;
      o.status = 'approved';
      message = 'Orden aprobada. Unidad asignada y fechas bloqueadas.';
      break;
    case 'start':
      if (
        o.status !== 'approved' ||
        o.pickup > rentalToday() ||
        o.dropoff <= rentalToday()
      )
        throw new Error(
          'La entrega debe estar dentro de las fechas del alquiler.',
        );
      if (
        !data.units.some(
          (u) => u.id === o.unit_id && u.status === 'available',
        ) ||
        data.orders.some(
          (other) =>
            other.id !== o.id &&
            other.unit_id === o.unit_id &&
            other.status === 'active',
        )
      )
        throw new Error('La unidad aún no está lista para entregar.');
      if ((input.note?.trim().length || 0) < 5)
        throw new Error(
          'Registra kilometraje, combustible y estado de entrega.',
        );
      o.status = 'active';
      message = `Vehículo entregado. ${input.note}`;
      break;
    case 'complete':
      if (o.status !== 'active' || (input.note?.trim().length || 0) < 5)
        throw new Error(
          'Registra el estado de devolución de un vehículo en alquiler.',
        );
      o.status = 'completed';
      message = `Vehículo devuelto. ${input.note}`;
      break;
    case 'cancel':
      if (!['pending', 'approved'].includes(o.status))
        throw new Error('Esta orden ya no puede cancelarse.');
      o.status = 'cancelled';
      message = `Orden cancelada. ${input.note || ''}`;
      break;
    case 'reject':
      if (o.status !== 'pending')
        throw new Error('Solo puedes rechazar solicitudes pendientes.');
      o.status = 'rejected';
      message = `Solicitud rechazada. ${input.note || ''}`;
      break;
    default:
      throw new Error('Operación desconocida.');
  }
  data.events.unshift({
    id: input.request_id,
    order_id: o.id,
    message,
    created_at: new Date().toISOString(),
  });
  return o;
}
