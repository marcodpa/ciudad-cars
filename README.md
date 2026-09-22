# Ciudad Cars

## Sistema de alquileres

Esta rama incorpora ingreso, panel de cliente/administración y órdenes con pago coordinado por WhatsApp. Consulta [la guía del sistema](docs/rental-system.md) para conectar Supabase y registrar la flota real. Sin esa conexión, `/ingresar` ofrece una demostración explícita; no guarda reservas reales. Prueba `/dashboard?demo=1&role=admin` o `/dashboard?demo=1&role=customer`.

Sitio responsive con Home, catálogo de vehículos, servicios, quiénes somos y contacto. La portada integra la película aérea de Ciudad Cars: Cruze y Explorer, fotogramas ligados al scroll, textos y planes de viaje sincronizados con GSAP. Una sola navegación acompaña el recorrido hasta el catálogo de cinco vehículos, con un botón para saltar directamente a la flota. El carrusel es manual, con flechas y gestos horizontales; en móvil se ocultan las miniaturas y se agrupan la foto, el nombre, el precio y las características. En escritorio se mantienen las miniaturas y la ficha lateral.

## Ejecutar localmente

Requisitos: Node.js 22.13 o superior y npm.

```sh
npm ci
npm run dev
```

Abrir http://localhost:3000.

## Producción local

```sh
npm run build:local
npm start
```

`npm run build` prepara la versión para Vercel con Nitro y genera `.vercel/output`. El modo local conserva el servidor Node para las auditorías y las pruebas sin conexión a servicios de alojamiento. `npm run build:sites` mantiene disponible la compilación anterior para Sites.

## Rutas

- `/`: intro en `/#recorrido`, Home y carrusel en `/#flota`.
- `/vehiculos`: catálogo C con fichas horizontales, fotografías completas, filtros y detalles.
- `/servicios`: alquiler, complementos y taller.
- `/quienes-somos`: historia y empresa.
- `/contacto`: datos reales, horario y consulta por WhatsApp.

## Comprobaciones

```sh
npm run lint
npx tsc --noEmit
npm test
```

Las pruebas cubren inventario, límites de selección, filtros, consultas, recuperación de rutas, recortes de vehículos, carga y avance de fotogramas y la integridad de los 397 recursos originales de la intro. El lint cubre el código creado; los componentes del scaffold se conservan sin editar.

## Estructura

- `app/layout.tsx`: tipografías, navegación y footer compartidos.
- `app/page.tsx`: intro, motivos de viaje, fotos reales de Maracaibo y cierre.
- `components/cinematic-intro.tsx`, `lib/cinematic-intro.js`, `app/cinema.css`: intro aprobada adaptada a React, con estilos aislados y limpieza de eventos y animaciones al desmontarse.
- `lib/cinematic-frames.js`: precarga comprimida y ventana de imágenes decodificadas, con selección que evita saltos hacia atrás cuando las descargas llegan fuera de orden.
- `public/cinema/`: fotogramas, miniaturas, imágenes y película originales, sin regeneración ni recodificación.
- `docs/cinematic-intro.md`: procedencia, integración, carga de recursos y validación de la intro.
- `app/{vehiculos,servicios,quienes-somos,contacto}/page.tsx`: páginas interiores.
- `components/pages/`: contenido traducible de las páginas interiores; las rutas conservan los metadatos del servidor.
- `components/language-provider.tsx`, `lib/language.js`, `app/language.css`: selector ES/EN del header y traducciones. El idioma queda en la URL para conservarlo al navegar o recargar y permitir que los buscadores descubran ambas versiones.
- `lib/seo.ts`, `lib/page-metadata.ts`, `app/robots.ts`, `app/sitemap.ts`: metadatos estáticos, canonical/hreflang, datos estructurados y rastreo para `https://ciudadcars.com`. Las rutas `/en/*` comparten los componentes existentes. Comprobación y auditoría reproducibles en [docs/seo.md](docs/seo.md).
- `components/fleet-experience.tsx`: ficha lateral y escenas fotográficas completas, fundidos con GSAP, controles y gestos.
- `docs/fleet-photography.json`: procedencia y versiones adaptables de las cinco imágenes creadas previamente con Higgsfield para la intro. El selector, las miniaturas y las fichas comparten estos recursos; no superponen recortes ni sombras artificiales.
- `components/vehicle-ground-shadow.tsx`, `lib/vehicle-shadows.ts`: recursos conservados del diseño anterior, sin uso en las vistas actuales de la flota.
- `components/vehicle-catalog.tsx`, `vehicle-details.tsx`: catálogo C y diálogo de detalles compartido.
- `components/contact-form.tsx`: preparación de consultas.
- `components/reservation-provider.tsx`: dirige las reservas de cabecera, flota y catálogo al nuevo formulario `/reservar`, conservando el modelo elegido. El diálogo anterior se conserva como código de referencia.
- `lib/reservation.ts`: fechas de Maracaibo, validación del intervalo y composición de solicitudes, comprobadas en `tests/reservation.test.mjs`.
- `lib/fleet.ts`: modelos, precios, capacidades y recursos.
- `lib/fleet-motion.ts`, `catalog.ts`, `contact.ts`: lógica comprobable.
- `lib/company.ts`: datos oficiales y destinos de contacto.
- `lib/navigation.ts`, `components/site-link.tsx`, `proxy.ts`: enlaces nativos y recuperación de direcciones anteriores del menú.
- `app/globals.css`: identidad y homepage aprobada.
- `app/showroom.css`: escenario del carrusel.
- `components/city-discovery.tsx`, `app/city.css`: galería de tres fotografías reales de Maracaibo (puente, Basílica y monumento a la Chinita), ampliación de fotos y entradas suaves con GSAP.
- `app/catalog.css`: propuesta C del catálogo, encabezado claro, fichas horizontales y adaptación móvil.
- `CITY-PHOTOS.json`: procedencia de las cinco fotos aportadas por el usuario, usadas en Home, Quiénes somos y Contacto.
- `app/pages.css`: componentes y páginas interiores.
- `DESIGN.md`: sistema visual, fuentes y animación detallada.

## Alcance

El botón ES/EN cambia el idioma de las páginas, la animación, los filtros, los detalles y los formularios sin reiniciar la posición del recorrido. El idioma se conserva al navegar o recargar. El contenido que escribe el visitante no se traduce ni se borra.

Los botones de reserva abren el nuevo formulario de órdenes. El cliente ingresa, selecciona fechas y vehículo, completa sus datos y guarda la solicitud antes de coordinar el pago por WhatsApp. La aprobación y la disponibilidad se gestionan desde el panel de administración cuando Supabase esté conectado. Sin conexión, solo se ofrece la demostración. Consulta `docs/rental-system.md` para las reglas y configuración.

Fuentes de historia, contacto y servicios: páginas oficiales enlazadas en DESIGN.md. Modelos o similares; las imágenes del hero y catálogo son ilustrativas.

El entorno local usa Node; el runtime Workers del scaffold no se necesita. Se conserva la estructura Sites sin registrar ni publicar un sitio remoto.

Los archivos bajo `sources/` del proyecto ChatGPT son referencias de solo lectura y no se modificaron.

El dashboard incluye facturación comercial por orden, borradores, numeración, impuestos, descuentos, notas de crédito/débito, saldos, reembolsos y PDF. Configuración y límites en [docs/billing-system.md](docs/billing-system.md).
