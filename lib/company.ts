import type { Vehicle } from './fleet';

export const company = {
  phone: '+58 414 651-1446',
  tel: 'tel:+584146511446',
  email: 'info@ciudadcars.net',
  address:
    'Calle 70 entre Av. 4 y Av. 8, Bella Vista, Maracaibo, Estado Zulia.',
  reservation: 'https://www.ciudadcars.com/date-reservation/',
  directions:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(
      'Ciudad Cars, Calle 70 entre Av. 4 y Av. 8, Bella Vista, Maracaibo, Venezuela',
    ),
};

export function whatsappUrl(message: string) {
  return 'https://wa.me/584146511446?text=' + encodeURIComponent(message);
}

export function vehicleReservation(car: Vehicle) {
  return whatsappUrl(
    `Hola, Ciudad Cars. Me interesa un ${car.make} ${car.model} o similar, categoría ${car.category}, desde $${car.price}/día. Quisiera confirmar disponibilidad y tarifa para mi viaje.`,
  );
}
