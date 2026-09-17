# Ciudad Cars

Sitio responsive con Home, catálogo de vehículos, servicios, quiénes somos y contacto. La portada integra la intro aérea aprobada de Ciudad Cars: Cruze y Explorer, fotogramas ligados al scroll, textos y transiciones con GSAP. Después continúa el sitio existente y su catálogo de cinco vehículos. El carrusel del catálogo sigue siendo manual, con flechas, miniaturas y gestos horizontales.

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

- `/`: intro en `/#recorrido`, Home y carrusel en `/#flota`.
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

Trece pruebas cubren inventario, límites de selección, filtros, consultas, recuperación de rutas, recortes de vehículos y la integridad de los 397 recursos originales de la intro. El lint cubre el código creado; los componentes del scaffold se conservan sin editar.

## Estructura

- `app/layout.tsx`: tipografías, navegación y footer compartidos.
- `app/page.tsx`: intro, motivos de viaje, fotos reales de Maracaibo y cierre.
- `components/cinematic-intro.tsx`, `lib/cinematic-intro.js`, `app/cinema.css`: intro aprobada adaptada a React, con estilos aislados y limpieza de eventos y animaciones al desmontarse.
- `public/cinema/`: fotogramas, miniaturas, imágenes y película originales, sin regeneración ni recodificación.
- `docs/cinematic-intro.md`: procedencia, integración, carga de recursos y validación de la intro.
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
- `components/city-discovery.tsx`, `app/city.css`: galería de cinco fotografías reales de Maracaibo, con vistas grandes de la ciudad y El Milagro, ampliación de fotos y entradas suaves con GSAP.
- `app/catalog.css`: propuesta C del catálogo, encabezado claro, fichas horizontales y adaptación móvil.
- `CITY-PHOTOS.json`: procedencia de las cinco fotos aportadas por el usuario, usadas en Home, Quiénes somos y Contacto.
- `app/pages.css`: componentes y páginas interiores.
- `DESIGN.md`: sistema visual, fuentes y animación detallada.

## Alcance

Las reservas generales enlazan al centro real de Ciudad Cars. Las consultas por modelo y contacto preparan un mensaje al WhatsApp oficial, que el visitante decide enviar. El sitio no confirma disponibilidad, cobros o reservas por sí solo.

Fuentes de historia, contacto y servicios: páginas oficiales enlazadas en DESIGN.md. Modelos o similares; las imágenes del hero y catálogo son ilustrativas.

El entorno local usa Node; el runtime Workers del scaffold no se necesita. Se conserva la estructura Sites sin registrar ni publicar un sitio remoto.

Los archivos bajo `sources/` del proyecto ChatGPT son referencias de solo lectura y no se modificaron.
