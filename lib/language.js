/** @typedef {'es' | 'en'} Language */

export const languageCookie = 'ciudad-cars-language';

/** @param {string | undefined} value @returns {Language} */
export function parseLanguage(value) {
  return value === 'en' ? 'en' : 'es';
}

/** Spanish is the source copy; proper names and model names stay unchanged.
 * @param {string} text
 * @param {Language} language
 */
export function translate(text, language) {
  if (language === 'es') return text;
  const key = text.trim();
  const value = english[key];
  if (value === undefined) return text;
  return (
    text.slice(0, text.indexOf(key)) +
    value +
    text.slice(text.indexOf(key) + key.length)
  );
}

/** @type {Record<string, string>} */
export const english = {
  Inicio: 'Home',
  Vehículos: 'Vehicles',
  Servicios: 'Services',
  'Quiénes somos': 'About us',
  Contacto: 'Contact',
  'Ir al contenido': 'Skip to content',
  'Ciudad Cars, inicio': 'Ciudad Cars, home',
  'Navegación principal': 'Main navigation',
  'Reservar ahora': 'Book now',
  Reservar: 'Book',
  'Abrir menú': 'Open menu',
  'Cerrar menú': 'Close menu',
  'Ruta de navegación': 'Breadcrumbs',
  'Tu destino. Nuestra ruta.': 'Your destination. Our route.',
  'Contigo en Maracaibo desde 1984.': 'With you in Maracaibo since 1984.',
  'Explora Ciudad Cars': 'Explore Ciudad Cars',
  'Nuestros vehículos': 'Our vehicles',
  'Hablemos de tu viaje': 'Let’s talk about your trip',
  'nos mueve.': 'moves us.',
  Conversemos: 'Let’s talk',
  'Hecho para moverte con libertad.': 'Made for the freedom to move.',
  'Hola, Ciudad Cars. Quisiera información para mi próximo viaje.':
    'Hello, Ciudad Cars. I’d like some information for my next trip.',
  'EL SIGUIENTE PASO ES TUYO': 'YOUR NEXT CHAPTER STARTS HERE',
  '¿A dónde vamos?': 'Where are we going?',
  'Cuéntanos tu plan. Te ayudamos a encontrar tu carro.':
    'Tell us your plans. We’ll help you find your car.',
  'Ver vehículos': 'View vehicles',
  'Hablemos por WhatsApp': 'Let’s talk on WhatsApp',
  'Hola, Ciudad Cars. Quisiera ayuda para elegir un carro para mi viaje.':
    'Hello, Ciudad Cars. I’d like help choosing a car for my trip.',
  'CONTIGO DESDE 1984': 'WITH YOU SINCE 1984',
  'Más fácil.': 'Easier.',
  'Más cerca.': 'Closer.',
  'Tu viaje empieza con nosotros.': 'Your journey starts with us.',
  'Elige tu carro': 'Choose your car',
  'Cinco categorías para encontrar la que va contigo.':
    'Five categories to find your perfect fit.',
  'Cuéntanos tu plan': 'Tell us your plans',
  'Confirmamos las fechas y los detalles de tu reserva.':
    'We’ll confirm your dates and booking details.',
  'Arranca tu viaje': 'Start your journey',
  'Recibe tu carro y disfruta de Maracaibo.':
    'Pick up your car and enjoy Maracaibo.',
  'Maracaibo nos mueve': 'Maracaibo moves us',
  'Gente real.': 'Real people.',
  'Destinos reales.': 'Real destinations.',
  'MARACAIBO NOS MUEVE': 'MARACAIBO MOVES US',
  'siempre en movimiento.': 'always on the move.',
  'Un carro para cada plan.': 'A car for every plan.',
  'Elige el espacio y la comodidad que van contigo.':
    'Choose the space and comfort that suit you.',
  'Nuestra flota': 'Our fleet',
  Todos: 'All',
  automáticos: 'automatic',
  'De 5 a 7': '5 to 7',
  pasajeros: 'passengers',
  'Atención local': 'Local service',
  'en Maracaibo': 'in Maracaibo',
  'Catálogo de vehículos': 'Vehicle catalog',
  Categoría: 'Category',
  'Todas las categorías': 'All categories',
  Capacidad: 'Seating',
  '5 pasajeros o más': '5 or more passengers',
  '7 pasajeros': '7 passengers',
  '5 pasajeros': '5 passengers',
  'Ordenar por': 'Sort by',
  'Precio: menor a mayor': 'Price: low to high',
  'Precio: mayor a menor': 'Price: high to low',
  vehículo: 'vehicle',
  vehículos: 'vehicles',
  ', o similar, en una escena ilustrativa de Maracaibo':
    ', or similar, in an illustrative scene of Maracaibo',
  ', o similar': ', or similar',
  'o similar': 'or similar',
  'o similar ·': 'or similar ·',
  Transmisión: 'Transmission',
  Automático: 'Automatic',
  Equipaje: 'Luggage',
  maletas: 'bags',
  Puertas: 'Doors',
  puertas: 'doors',
  Desde: 'From',
  '/día': '/day',
  '/ día': '/ day',
  'Consultar reserva de': 'Request a booking for',
  'Ver detalles de': 'View details for',
  'Ver detalles': 'View details',
  'Probemos con otro plan': 'Let’s try another option',
  'No hay modelos que combinen esa categoría y capacidad. Puedes ver de nuevo toda la flota.':
    'No models match that category and seating capacity. You can view the full fleet again.',
  'Restablecer filtros': 'Reset filters',
  'Todos automáticos': 'All automatic',
  'Tarifas en USD / día': 'Rates in USD / day',
  'Las imágenes son referenciales. Modelos o similares; disponibilidad y tarifa final sujetas a confirmación para las fechas de tu viaje.':
    'Images are illustrative. Models or similar; availability and final rates are subject to confirmation for your travel dates.',
  'Cerrar detalles': 'Close details',
  'Modelo o similar. La disponibilidad y la tarifa final se confirman para las fechas de tu viaje. Tarifas en USD.':
    'Model or similar. Availability and final rates will be confirmed for your travel dates. Rates in USD.',
  'Consultar este vehículo': 'Enquire about this vehicle',
  'Elige tu': 'Choose your',
  'viaje perfecto': 'perfect ride',
  'Cinco formas de moverte.': 'Five ways to get moving.',
  'Encuentra la tuya.': 'Find yours.',
  carrusel: 'carousel',
  'Vehículos de Ciudad Cars': 'Ciudad Cars vehicles',
  'Vista del vehículo en Maracaibo': 'View of the vehicle in Maracaibo',
  'Vehículo anterior': 'Previous vehicle',
  'Vehículo siguiente': 'Next vehicle',
  'Recorrido por los vehículos': 'Browse the vehicles',
  'Ver catálogo': 'View catalog',
  'Elegir vehículo': 'Choose a vehicle',
  ', desde': ', from',
  'dólares al día': 'dollars per day',
  Acceso: 'Access',
  'Reservar este carro': 'Book this car',
  de: 'of',
  ', o similar. Desde': ', or similar. From',
  'dólares por día.': 'dollars per day.',
  'pasajeros,': 'passengers,',
  'maletas.': 'bags.',
  'Puedes conocer los cinco carros en': 'You can see all five cars in',
  'nuestro catálogo de vehículos': 'our vehicle catalog',
  Económico: 'Economy',
  'Para moverte a tu ritmo. Práctico, cómodo y listo para la ciudad.':
    'Move at your own pace. Practical, comfortable and ready for the city.',
  'Haz espacio para disfrutar. Comodidad para tus días en Maracaibo.':
    'Make room to enjoy the journey. Comfort for your days in Maracaibo.',
  'Un poco más de espacio. Un viaje cómodo, de principio a fin.':
    'A little more space. A comfortable journey from start to finish.',
  'Para los planes que piden más. Tú decides hasta dónde llegar.':
    'For plans that call for more. You decide how far to go.',
  'Que no se quede nadie. Siete puestos para compartir el camino.':
    'Bring everyone along. Seven seats to share the journey.',
  'Elige las fechas de tu viaje': 'Choose your travel dates',
  'Abriendo calendario…': 'Opening calendar…',
  'Cerrar reserva': 'Close booking',
  'TU PRÓXIMO VIAJE': 'YOUR NEXT TRIP',
  '¿Cuándo necesitas tu carro?': 'When do you need your car?',
  'Elige retiro y devolución. Tu solicitud se prepara al instante.':
    'Choose your pickup and return dates. Your request is prepared instantly.',
  'Fechas del alquiler': 'Rental dates',
  Retiro: 'Pickup',
  Devolución: 'Return',
  'Marca el día de retiro y luego el de devolución.':
    'Select your pickup date, then your return date.',
  'Ahora elige el día de devolución.': 'Now choose your return date.',
  'día seleccionado': 'day selected',
  'días seleccionados': 'days selected',
  'Puedes cambiar las fechas.': 'You can change the dates.',
  'Revisa las fechas seleccionadas.': 'Check your selected dates.',
  'Mes siguiente': 'Next month',
  'Mes anterior': 'Previous month',
  'Hoy,': 'Today,',
  ', seleccionado': ', selected',
  'Borrar fechas': 'Clear dates',
  'Tu solicitud de reserva': 'Your booking request',
  'Tu vehículo': 'Your vehicle',
  'Ayúdame a elegir': 'Help me choose',
  'pasajeros · Desde': 'passengers · From',
  'Tu mensaje': 'Your message',
  'Selecciona tus fechas para preparar el mensaje de WhatsApp.':
    'Select your dates to prepare your WhatsApp message.',
  'Continuar por WhatsApp': 'Continue on WhatsApp',
  'Ciudad Cars confirmará disponibilidad y tarifa por WhatsApp. La reserva queda sujeta a esa confirmación.':
    'Ciudad Cars will confirm availability and rates on WhatsApp. Your booking is subject to that confirmation.',
  'Elige las fechas de retiro y devolución.':
    'Choose your pickup and return dates.',
  'El retiro debe ser hoy o una fecha posterior.':
    'Pickup must be today or a later date.',
  'La devolución debe ser después del día de retiro.':
    'Return must be after the pickup date.',
  'Me gustaría que me ayudaran a elegir un vehículo.':
    'I’d like help choosing a vehicle.',
  'Saltar a los vehículos': 'Skip to vehicles',
  'Recorrido aéreo de Ciudad Cars': 'Ciudad Cars aerial journey',
  'Persecución aérea del Chevrolet Cruze y la Ford Explorer':
    'Aerial tracking shot of the Chevrolet Cruze and Ford Explorer',
  'Tu viaje': 'Your journey',
  comienza: 'starts',
  'aquí.': 'here.',
  'Alquila tu carro. Descubre la ciudad.': 'Rent your car. Discover the city.',
  'Un camino que empieza contigo.': 'A journey that starts with you.',
  'Encuentra tu vehículo': 'Find your vehicle',
  'La ciudad.': 'The city.',
  'A tu ritmo.': 'At your pace.',
  '2 maletas': '2 bags',
  '4 maletas': '4 bags',
  'Más espacio.': 'More space.',
  'Más historias juntos.': 'More stories together.',
  'TÚ ELIGES EL DESTINO.': 'YOU CHOOSE THE DESTINATION.',
  'Un carro': 'A car',
  'para cada plan.': 'for every plan.',
  Turismo: 'Travel',
  'Descubre Maracaibo.': 'Discover Maracaibo.',
  Negocios: 'Business',
  'Muévete a tu ritmo.': 'Move at your own pace.',
  Familia: 'Family',
  'Más espacio para compartir.': 'More room to share.',
  'Conoce nuestros vehículos': 'Explore our vehicles',
  'Una nueva perspectiva.': 'A new perspective.',
  'Más espacio para tu próximo viaje.': 'More room for your next trip.',
  'Preparando recorrido…': 'Preparing your journey…',
  'DESLIZA Y DESCUBRE': 'SCROLL TO DISCOVER',
  'Vehículos del recorrido': 'Vehicles in this journey',
  'Opciones del recorrido': 'Journey options',
  'Reproducir recorrido automáticamente': 'Play the journey automatically',
  'Recorrer de nuevo': 'Play again',
  'Ver película': 'Watch the film',
  'Reducir movimiento': 'Reduce motion',
  'Activar movimiento': 'Enable motion',
  'Movimiento reducido': 'Reduced motion',
  Pausar: 'Pause',
  'Pausar recorrido': 'Pause journey',
  'Escenas recreadas con IA a partir de los vehículos de CC y referencias de Maracaibo.':
    'AI-recreated scenes based on CC vehicles and Maracaibo references.',
  'Película de Ciudad Cars': 'Ciudad Cars film',
  'Cerrar película': 'Close film',
  Puedes: 'You can',
  'ver la película completa': 'watch the full film',
  o: 'or',
  'consultar los vehículos': 'browse the vehicles',
  'La ciudad': 'The city',
  'Una ciudad con vida propia.': 'A city with a life of its own.',
  'Calles, encuentros y nuevos destinos.':
    'Streets, encounters and new destinations.',
  'Vista de los edificios, avenidas y vida cotidiana de Maracaibo':
    'View of the buildings, avenues and daily life of Maracaibo',
  'Siempre cerca del lago.': 'Always close to the lake.',
  'La ciudad se encuentra con el horizonte.':
    'Where the city meets the horizon.',
  'Vista elevada de la avenida El Milagro entre edificios con el lago al fondo':
    'Elevated view of El Milagro Avenue between buildings with the lake beyond',
  'Puente Rafael Urdaneta': 'Rafael Urdaneta Bridge',
  'Un atardecer para volver.': 'A sunset worth coming back for.',
  'Lago de Maracaibo': 'Lake Maracaibo',
  'Sol al atardecer junto al puente General Rafael Urdaneta sobre el lago de Maracaibo':
    'Sunset beside the General Rafael Urdaneta Bridge over Lake Maracaibo',
  'Basílica de Chiquinquirá': 'Chiquinquirá Basilica',
  'Nuestras raíces, presentes.': 'Our roots live on.',
  'Basílica de Nuestra Señora de Chiquinquirá':
    'Basilica of Our Lady of Chiquinquirá',
  'Fachada y torres de la Basílica de Nuestra Señora de Chiquinquirá':
    'Facade and towers of the Basilica of Our Lady of Chiquinquirá',
  'Monumento a la Chinita': 'La Chinita Monument',
  'Lo que siempre nos reúne.': 'What always brings us together.',
  'Monumento a Nuestra Señora de Chiquinquirá':
    'Monument to Our Lady of Chiquinquirá',
  'Monumento a la Chinita rodeado de arcos iluminados al anochecer':
    'La Chinita Monument surrounded by illuminated arches at dusk',
  'Ampliar foto:': 'Enlarge photo:',
  'Foto:': 'Photo:',
  'LA CIUDAD QUE NOS MUEVE': 'THE CITY THAT MOVES US',
  'te espera.': 'is waiting for you.',
  'Hay mucho más por descubrir.': 'There’s so much more to discover.',
  'Del lago a nuestras calles. De un atardecer a un nuevo recuerdo. Sal a vivir la ciudad; nosotros te acompañamos en el camino.':
    'From the lake to our streets. From a sunset to a new memory. Experience the city; we’ll be with you along the way.',
  'Conoce nuestros lugares': 'Explore our favorite places',
  'ESOS LUGARES QUE SE QUEDAN CONTIGO': 'PLACES THAT STAY WITH YOU',
  'Un pedacito de lo nuestro.': 'A little piece of our home.',
  'TU DESTINO. NUESTRA RUTA.': 'YOUR DESTINATION. OUR ROUTE.',
  'La próxima parada la eliges tú.': 'You choose the next stop.',
  'Recorre Maracaibo': 'Explore Maracaibo',
  'Cerrar galería': 'Close gallery',
  'Foto anterior': 'Previous photo',
  'Foto siguiente': 'Next photo',
  'Tu viaje, con': 'Your journey, with',
  'todo a favor.': 'everything in your favor.',
  'El carro es el comienzo. Descubre cómo podemos ayudarte antes de salir y durante el camino.':
    'The car is just the beginning. Discover how we can help before you leave and along the way.',
  'ALQUILER DE VEHÍCULOS': 'CAR RENTALS',
  'Elige el plan.': 'You make the plans.',
  'Nosotros, el carro.': 'We provide the car.',
  'Para una visita, un viaje de trabajo o unos días en familia. Encuentra un automático de 5 o 7 pasajeros y consulta las fechas que necesitas.':
    'For a visit, a business trip or a few days with family. Find an automatic car for 5 or 7 passengers and ask about your travel dates.',
  'Explorar la flota': 'Explore the fleet',
  'Cinco categorías': 'Five categories',
  'Desde un económico para la ciudad hasta una SUV de siete puestos.':
    'From an economy car for the city to a seven-seat SUV.',
  'Asistencia de emergencia 24 h': '24-hour emergency assistance',
  'Durante tu alquiler, nuestro equipo te orienta cuando lo necesitas.':
    'During your rental, our team is here to guide you when you need help.',
  'Listos para el camino': 'Ready for the road',
  'Vehículos automáticos con mantenimiento periódico y entrega con tanque lleno.':
    'Regularly maintained automatic vehicles, delivered with a full tank.',
  'A TU MEDIDA': 'TAILORED TO YOU',
  'Pequeños detalles.': 'Small details.',
  'Un mejor viaje.': 'A better trip.',
  'Complementa tu alquiler. Consulta disponibilidad y costo al reservar.':
    'Add more to your rental. Ask about availability and prices when booking.',
  'Silla para bebé': 'Child seat',
  'Cuéntanos la edad del pequeño y consulta las opciones para tu viaje.':
    'Tell us your child’s age and ask about the options for your trip.',
  'Conductor adicional': 'Additional driver',
  'Comparte el volante. Consulta cómo añadirlo a tu alquiler.':
    'Share the driving. Ask how to add another driver to your rental.',
  'Combustible prepagado': 'Prepaid fuel',
  'Consulta esta opción al organizar la entrega de tu carro.':
    'Ask about this option when arranging your car pickup.',
  'Cargador de teléfono': 'Phone charger',
  'Mantén tus planes conectados. Solicítalo al reservar.':
    'Stay connected on the road. Request one when booking.',
  'Consultar complementos': 'Ask about extras',
  'Hola, Ciudad Cars. Quisiera consultar los complementos disponibles para mi alquiler.':
    'Hello, Ciudad Cars. I’d like to ask about the extras available for my rental.',
  'TALLER MULTIMARCA': 'MULTI-BRAND WORKSHOP',
  'Tu carro también': 'Your car feels',
  'está en casa.': 'at home here too.',
  '¿Tu propio vehículo necesita atención? Nuestro taller ofrece mantenimiento preventivo, diagnóstico y servicios de mecánica.':
    'Does your own vehicle need attention? Our workshop offers preventive maintenance, diagnostics and mechanical services.',
  'Hola, Ciudad Cars. Quisiera consultar una cita en el taller. Mi vehículo necesita:':
    'Hello, Ciudad Cars. I’d like to arrange a workshop appointment. My vehicle needs:',
  'Consultar cita de taller': 'Ask about a workshop appointment',
  'Cuidamos lo que te mueve': 'We care for what moves you',
  'Aceite, filtros y mantenimiento preventivo':
    'Oil, filters and preventive maintenance',
  'Revisión y servicio de frenos': 'Brake inspection and service',
  'Aire acondicionado y sistema de enfriamiento':
    'Air conditioning and cooling systems',
  'Diagnóstico con escáner': 'Diagnostic scanning',
  'Motores, transmisiones y repuestos':
    'Engines, transmissions and spare parts',
  'Mientras tu carro está en el taller, consulta la opción de alquilar un vehículo de reemplazo.':
    'While your car is in the workshop, ask about renting a replacement vehicle.',
  'De Maracaibo.': 'From Maracaibo.',
  'Contigo en el camino.': 'With you on the road.',
  'Desde 1984 compartimos algo más que carros: las ganas de llegar a tu próximo destino.':
    'Since 1984, we’ve shared more than cars: the desire to reach your next destination.',
  'Edificios y avenidas de Maracaibo, nuestra ciudad de origen':
    'Buildings and avenues of Maracaibo, our hometown',
  'NUESTRA HISTORIA': 'OUR STORY',
  'Una ciudad.': 'One city.',
  'Muchos caminos.': 'Many roads.',
  'Ciudad Cars nació en Maracaibo el 10 de agosto de 1984, como un showroom dedicado a la compra y venta de vehículos nuevos y usados.':
    'Ciudad Cars was founded in Maracaibo on August 10, 1984, as a showroom for buying and selling new and used vehicles.',
  'Con el tiempo, el camino nos llevó al arrendamiento y al alquiler de carros. Hoy seguimos aquí, ayudándote a moverte por la ciudad con atención local y opciones para cada viaje.':
    'Over time, our path led us to vehicle leasing and rentals. Today, we’re still here, helping you get around the city with local service and options for every trip.',
  'NUESTRA FORMA DE ACOMPAÑARTE': 'HOW WE TRAVEL WITH YOU',
  'La confianza también': 'Trust is part',
  'hace parte del viaje.': 'of the journey too.',
  'Somos de aquí': 'We’re local',
  'Maracaibo es nuestro punto de partida. Te atiende un equipo que comparte tu ciudad y entiende tus planes.':
    'Maracaibo is our starting point. Our local team knows the city and understands your plans.',
  'Hablemos de tu plan': 'Let’s talk about your plans',
  'Nos cuentas qué necesitas y te orientamos para elegir la categoría, las fechas y los detalles de tu alquiler.':
    'Tell us what you need and we’ll help you choose the category, dates and details of your rental.',
  'Seguimos contigo': 'We’re here for you',
  'Vehículos con mantenimiento y asistencia de emergencia durante tu alquiler para acompañarte en el camino.':
    'Maintained vehicles and emergency assistance during your rental, to support you along the way.',
  'EL CAMINO RECORRIDO': 'OUR JOURNEY SO FAR',
  'Siempre en': 'Always on',
  'movimiento.': 'the move.',
  'Abrimos las puertas': 'We opened our doors',
  'Compra y venta de vehículos en Maracaibo.':
    'Buying and selling vehicles in Maracaibo.',
  'Un nuevo rumbo': 'A new direction',
  'Más formas de moverte': 'More ways to get moving',
  'Sumamos el arrendamiento y el alquiler de carros.':
    'We added vehicle leasing and car rentals.',
  Hoy: 'Today',
  'Tu próximo destino': 'Your next destination',
  'Cinco categorías y un equipo dispuesto a ayudarte.':
    'Five categories and a team ready to help you.',
  'Tu próximo viaje': 'Your next trip',
  'comienza hablando.': 'starts with a conversation.',
  'Estamos aquí, en Maracaibo, para ayudarte a elegir tu carro y organizar los detalles.':
    'We’re here in Maracaibo to help you choose your car and arrange the details.',
  'ESTAMOS CERCA': 'WE’RE CLOSE BY',
  Hablemos: 'Let’s talk',
  'de tu destino.': 'about your destination.',
  'Escríbenos por WhatsApp': 'Message us on WhatsApp',
  'Una llamada y arrancamos': 'One call to get started',
  'También por correo': 'Email us too',
  'Visítanos en Bella Vista': 'Visit us in Bella Vista',
  'Horario de oficina': 'Office hours',
  'Lunes a viernes': 'Monday to Friday',
  Sábados: 'Saturdays',
  Domingos: 'Sundays',
  Cerrado: 'Closed',
  '8:00 a. m. – 6:00 p. m.': '8:00 a.m. – 6:00 p.m.',
  '8:00 a. m. – 12:00 p. m.': '8:00 a.m. – 12:00 p.m.',
  'Calle 70 entre Av. 4 y Av. 8, Bella Vista, Maracaibo, Estado Zulia.':
    'Calle 70 between Av. 4 and Av. 8, Bella Vista, Maracaibo, Zulia State.',
  'La avenida El Milagro de Maracaibo y el lago al fondo':
    'El Milagro Avenue in Maracaibo with the lake beyond',
  'Así se vive Maracaibo.': 'This is life in Maracaibo.',
  'TE ESPERAMOS': 'COME VISIT US',
  'Tu punto': 'Your starting',
  'de partida.': 'point.',
  'Cómo llegar': 'Get directions',
  'CUÉNTANOS TU PLAN': 'TELL US YOUR PLANS',
  '¿Cómo podemos ayudarte?': 'How can we help you?',
  'Déjanos los detalles y continúa la conversación por WhatsApp.':
    'Share the details and continue the conversation on WhatsApp.',
  'Tu nombre': 'Your name',
  'Nombre y apellido': 'First and last name',
  Correo: 'Email',
  '(opcional)': '(optional)',
  'tu@correo.com': 'you@example.com',
  '¿Sobre qué quieres conversar?': 'What would you like to discuss?',
  'Cuéntanos tus fechas, cuántas personas viajan o qué necesitas…':
    'Tell us your dates, how many people are traveling or what you need…',
  'Los campos con * son obligatorios. No incluyas documentos ni datos de pago.':
    'Fields marked * are required. Do not include identity documents or payment details.',
  'Preparar mi consulta': 'Prepare my enquiry',
  'Podrás revisar el mensaje antes de abrir WhatsApp.':
    'You can review your message before opening WhatsApp.',
  'Tu consulta está lista': 'Your enquiry is ready',
  'El mensaje se enviará cuando tú lo confirmes en WhatsApp.':
    'Your message will be sent when you confirm it in WhatsApp.',
  'Alquiler de un vehículo': 'Renting a vehicle',
  'Una reserva existente': 'An existing booking',
  'Servicios y complementos': 'Services and extras',
  'Cita de taller': 'Workshop appointment',
  'Otra consulta': 'Other enquiry',
  'Escribe tu nombre (entre 2 y 100 caracteres).':
    'Enter your name (between 2 and 100 characters).',
  'Revisa tu correo electrónico o deja ese campo vacío.':
    'Check your email address or leave this field empty.',
  'Elige el motivo de tu consulta.': 'Choose the reason for your enquiry.',
  'Cuéntanos un poco más: tu mensaje debe tener entre 10 y 2.000 caracteres.':
    'Tell us a little more: your message must be between 10 and 2,000 characters.',
  'Ciudad Cars | Alquila tu carro en Maracaibo':
    'Ciudad Cars | Rent your car in Maracaibo',
  'Vehículos y tarifas | Ciudad Cars Maracaibo':
    'Vehicles and rates | Ciudad Cars Maracaibo',
  'Alquiler, asistencia y taller | Ciudad Cars':
    'Rentals, assistance and workshop | Ciudad Cars',
  'Quiénes somos | Ciudad Cars, desde 1984':
    'About us | Ciudad Cars, since 1984',
  'Contacto y ubicación | Ciudad Cars Maracaibo':
    'Contact and location | Ciudad Cars Maracaibo',
  'Tu carro en Maracaibo. Conoce la flota de Ciudad Cars: Mitsubishi Lancer, Chevrolet Cruze, Toyota Camry, Jeep Cherokee y Ford Explorer o similares. Desde $75 al día.':
    'Your car in Maracaibo. Explore the Ciudad Cars fleet: Mitsubishi Lancer, Chevrolet Cruze, Toyota Camry, Jeep Cherokee and Ford Explorer or similar. From $75 per day.',
  'Conoce nuestros cinco vehículos o similares: Lancer, Cruze, Camry, Cherokee y Explorer. Automáticos, de 5 a 7 pasajeros, desde $75 por día.':
    'Explore our five vehicles or similar: Lancer, Cruze, Camry, Cherokee and Explorer. Automatic, seating 5 to 7 passengers, from $75 per day.',
  'Alquiler de vehículos automáticos en Maracaibo, asistencia de emergencia, complementos para tu viaje y servicio de taller multimarca.':
    'Automatic car rentals in Maracaibo, emergency assistance, extras for your trip and multi-brand workshop services.',
  'Nacimos en Maracaibo en 1984. Conoce la historia de Ciudad Cars y nuestra manera cercana de acompañarte en cada viaje.':
    'Founded in Maracaibo in 1984. Discover the Ciudad Cars story and our personal approach to every journey.',
  'Habla con Ciudad Cars por WhatsApp al +58 414 651-1446. Visítanos en Calle 70, Bella Vista, Maracaibo. Alquiler y servicios para tu vehículo.':
    'Contact Ciudad Cars on WhatsApp at +58 414 651-1446. Visit us on Calle 70, Bella Vista, Maracaibo. Rentals and services for your vehicle.',
};
