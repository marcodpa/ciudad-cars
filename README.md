# Ciudad Cars

Sitio responsive con Home, catálogo de vehículos, servicios, quiénes somos y contacto. El Home conserva un único escenario de Maracaibo mientras cambian el vehículo y su información con flechas, miniaturas o gestos horizontales. El carrusel es manual: la sección no se fija y el scroll vertical no cambia el vehículo.

## Ejecutar localmente

Requisitos: Node.js 22.13 o superior y npm.

```sh
npm ci
npm run dev
```

Abrir http://localhost:3000.

## Producción local

```sh
npm run build
npm start
```

## Rutas

- `/`: Home y carrusel en `/#flota`.
- `/vehiculos`: catálogo C con fichas horizontales, filtros, sombras y detalles.
- `/servicios`: alquiler, complementos y taller.
- `/quienes-somos`: historia y empresa.
- `/contacto`: datos reales, horario y consulta por WhatsApp.

## Comprobaciones

```sh
npm run lint
npx tsc --noEmit
npm test
```

Once pruebas cubren inventario, límites de selección, filtros, consultas, recuperación de rutas y recortes de vehículos con alfa real y canvas común. El lint cubre el código creado; los componentes del scaffold se conservan sin editar.

## Estructura

- `app/layout.tsx`: tipografías, navegación y footer compartidos.
- `app/page.tsx`: hero, motivos de viaje, fotos reales de Maracaibo y cierre.
- `app/{vehiculos,servicios,quienes-somos,contacto}/page.tsx`: páginas interiores.
- `components/fleet-experience.tsx`: propuesta B con ficha lateral, escena única, GSAP, controles y gestos.
- `components/vehicle-ground-shadow.tsx`, `lib/vehicle-shadows.ts`: sombras de contacto alineadas con las ruedas de cada vehículo.
- `components/vehicle-catalog.tsx`, `vehicle-details.tsx`: catálogo C y diálogo de detalles compartido.
- `components/contact-form.tsx`: preparación de consultas.
- `lib/fleet.ts`: modelos, precios, capacidades y recursos.
- `lib/fleet-motion.ts`, `catalog.ts`, `contact.ts`: lógica comprobable.
- `lib/company.ts`: datos oficiales y destinos de contacto.
- `lib/navigation.ts`, `components/site-link.tsx`, `proxy.ts`: enlaces nativos y recuperación de direcciones anteriores del menú.
- `app/globals.css`: identidad y homepage aprobada.
- `app/showroom.css`: escenario del carrusel.
- `app/city.css`: galería de fotografías reales del Home.
- `app/catalog.css`: propuesta C del catálogo, encabezado claro, fichas horizontales y adaptación móvil.
- `CITY-PHOTOS.json`: procedencia de las cinco fotos aportadas por el usuario, usadas en Home, Quiénes somos y Contacto.
- `app/pages.css`: componentes y páginas interiores.
- `DESIGN.md`: sistema visual, fuentes y animación detallada.

## Alcance

Las reservas generales enlazan al centro real de Ciudad Cars. Las consultas por modelo y contacto preparan un mensaje al WhatsApp oficial, que el visitante decide enviar. El sitio no confirma disponibilidad, cobros o reservas por sí solo.

Fuentes de historia, contacto y servicios: páginas oficiales enlazadas en DESIGN.md. Modelos o similares; las imágenes del hero y catálogo son ilustrativas.

El entorno local usa Node; el runtime Workers del scaffold no se necesita. Se conserva la estructura Sites sin registrar ni publicar un sitio remoto.

Los archivos bajo `sources/` del proyecto ChatGPT son referencias de solo lectura y no se modificaron.
