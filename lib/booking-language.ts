import type { Language } from './language.js';

const english: Record<string, string> = {
  'Demostración de la reserva.': 'Booking demonstration.',
  'Usa solo datos de ejemplo. No se crean reservas reales ni se envían mensajes.':
    'Use example data only. No real bookings are created or messages sent.',
  'Reserva tu próximo carro': 'Book your next car',
  'Estamos habilitando las solicitudes en línea. Por ahora, coordina tu alquiler con nuestro equipo.':
    'Online requests are being enabled. For now, arrange your rental with our team.',
  'Consultar por WhatsApp': 'Ask on WhatsApp',
  'UN NUEVO DESTINO TE ESPERA': 'YOUR NEXT DESTINATION AWAITS',
  'Organiza tu próximo viaje.': 'Plan your next trip.',
  'Reserva en cuatro pasos, sin crear una cuenta.':
    'Book in four steps, with no account.',
  'Carro y fechas': 'Car and dates',
  'Tus datos': 'Your details',
  Domicilio: 'Home address',
  Revisar: 'Review',
  '¿Cuándo comienza tu viaje?': 'When does your trip start?',
  'Marca en el calendario el día de retiro y después el de devolución.':
    'Choose your pickup date, then your return date.',
  'Fecha de retiro': 'Pickup date',
  'Fecha de devolución': 'Return date',
  'Tu carro': 'Your car',
  'Elige tu carro': 'Choose your car',
  'Elige una devolución posterior al retiro (hasta 90 días).':
    'Choose a return date after pickup (up to 90 days).',
  'Consultando disponibilidad…': 'Checking availability…',
  'Disponibilidad para tus fechas': 'Availability for your dates',
  'Selecciona fechas para consultar disponibilidad':
    'Choose dates to check availability',
  'Por coordinar con Ciudad Cars': 'To be arranged with Ciudad Cars',
  'Cambiar carro': 'Change car',
  'Consultando…': 'Checking…',
  'No disponible': 'Unavailable',
  'unidad disponible': 'car available',
  'unidades disponibles': 'cars available',
  Atrás: 'Back',
  Continuar: 'Continue',
  'Guardando tu orden…': 'Saving your request…',
  'Crear orden y continuar': 'Save request and continue',
  'Datos del conductor': 'Driver details',
  'Usaremos estos datos para gestionar tu solicitud y preparar el alquiler.':
    'We use these details to manage your request and prepare the rental.',
  'Nombre completo': 'Full name',
  'Teléfono / WhatsApp': 'Phone / WhatsApp',
  'Correo electrónico': 'Email address',
  'Cédula o pasaporte': 'National ID or passport',
  'Número de licencia': 'Driving licence number',
  'Vencimiento de la licencia': 'Licence expiry date',
  '¿Dónde vives?': 'Where do you live?',
  'Escribe tu dirección de domicilio. El punto de retiro y devolución del carro se coordina por WhatsApp.':
    'Enter your home address. Pickup and return locations are arranged on WhatsApp.',
  'Dirección de domicilio': 'Home address',
  'Notas para tu viaje': 'Trip notes',
  '(opcional)': '(optional)',
  'Todo listo para crear tu orden': 'Ready to save your request',
  'Revisa tus datos. La solicitud se guardará antes de abrir WhatsApp.':
    'Review your details. Your request will be saved before opening WhatsApp.',
  Conductor: 'Driver',
  Contacto: 'Contact',
  Retiro: 'Pickup',
  Devolución: 'Return',
  Licencia: 'Licence',
  '¿Qué pasa después?': 'What happens next?',
  'Coordinas el pago por WhatsApp. El equipo lo verifica, asigna un vehículo disponible y confirma tu orden. Hasta entonces, las fechas no están bloqueadas.':
    'Arrange payment on WhatsApp. Our team verifies it, assigns an available vehicle and confirms the order. Until then, the dates are not held.',
  'Confirmo que los datos son correctos y autorizo a Ciudad Cars a usarlos para gestionar esta solicitud y contactarme. Entiendo que la reserva requiere aprobación.':
    'I confirm these details are correct and authorize Ciudad Cars to use them to manage this request and contact me. I understand the booking requires approval.',
  'TU VIAJE': 'YOUR TRIP',
  'Tarifa diaria': 'Daily rate',
  'Total del alquiler': 'Rental total',
  'Pago coordinado por WhatsApp. La solicitud no confirma la reserva ni realiza un cobro.':
    'Payment is arranged on WhatsApp. Submitting a request does not confirm the booking or charge you.',
  'SOLICITUD DE DEMOSTRACIÓN': 'DEMO REQUEST',
  'SOLICITUD GUARDADA': 'REQUEST SAVED',
  'Tu viaje ya tiene un número de orden.': 'Your trip now has an order number.',
  'Así se verá el mensaje de WhatsApp': 'WhatsApp message preview',
  'El envío está desactivado en la demostración.':
    'Sending is disabled in the demonstration.',
  'Continuar por WhatsApp': 'Continue on WhatsApp',
  'Volver a la página principal': 'Return to the home page',
  'Selecciona fechas válidas y un modelo disponible.':
    'Choose valid dates and an available car.',
  'Completa la verificación antes de enviar.':
    'Complete the verification before submitting.',
};

export function bookingText(language: Language, spanish: string) {
  return language === 'en' ? english[spanish] || spanish : spanish;
}
