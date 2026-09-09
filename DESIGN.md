# Ciudad Cars — Sistema visual y sitio web

## Referencias aprobadas

La referencia general es `DESIGN-REFERENCE.png`, entregada por el usuario. Se mantienen el header azul, el hero de Maracaibo al atardecer, los titulares contundentes, los acentos lima y los motivos Turismo, Negocios y Familia.

La referencia de interacción más reciente es `C:/Users/home/Downloads/IMG_0404.MP4`. Se inspeccionó la secuencia “Choose Your Perfect Drive”, aproximadamente entre 7 y 9 segundos: un automóvil grande centrado, una plataforma y un fondo inmóviles; debajo, modelo, precio, especificaciones, acciones y miniaturas. Se adapta esta distribución a Ciudad Cars. El negro/dorado del video no se incorpora a la identidad.

La captura original de vehículos define modelos, categorías, precios y capacidades; no obliga a reutilizar su presentación. “Luxury” y “SUV Luxury” se conservan como nombres de categorías reales, sin aplicar una estética de lujo.

## Identidad

- Logo oficial: `public/images/logo.png`. Sin redibujar, recolorear ni deformar. El header, el cierre fotográfico y el footer usan `public/images/logo-transparent.png`, con el fondo azul eliminado y transparencia real.
- Personalidad: local, cercana, práctica. Maracaibo es el punto de partida.
- Titulares: Barlow 800–900, mayúsculas y líneas compactas.
- Texto y controles: Outfit.
- Acentos manuscritos breves: Caveat.
- Fuentes con display swap y alternativas sans-serif.

| Color | Valor | Aplicación |
|---|---|---|
| Azul corporativo | #0B3B82 | Identidad y foco sobre blanco |
| Azul de navegación | #073567 | Secciones y enlaces |
| Azul profundo | #032640 | Header, menú móvil, escenario del carrusel y footer |
| Lima brillante | #B6F331 | CTA, precios y selección activa |
| Verde corporativo | #7AC143 | Trazos y acentos |
| Blanco | #FFFFFF | Texto sobre azul y tarjetas |
| Blanco frío | #F5F9FD | Fondo de contenido |
| Azul grisáceo claro | #E6EFF7 | Superficies secundarias |

Los colores cálidos pertenecen a la iluminación de las fotos, no a botones o controles. Los CTA lima llevan texto azul oscuro.

## Páginas y componentes

| Ruta | Contenido e interacción |
|---|---|
| / | Hero aprobado, motivos de viaje, carrusel en escenario fijo, proceso de alquiler y cierre de Maracaibo |
| /vehiculos | Cinco modelos, filtros de categoría y capacidad, orden por tarifa, detalles y reserva por modelo |
| /quienes-somos | Historia desde 1984, origen en Maracaibo, valores y evolución de la empresa |
| /servicios | Alquiler, asistencia, complementos y taller multimarca |
| /contacto | WhatsApp, teléfono, correo, dirección, horarios, consulta y enlace para llegar |

Header y footer compartidos en todas las rutas. La navegación marca la página actual y ofrece Reservar ahora. En móvil/tablet se despliega el menú; Escape lo cierra y devuelve el foco.

El header ampliado mide 108 px en desktop, 94 px en tablet y 84 px en móvil. El logo alcanza 380 px de ancho, la navegación usa 16 px y el botón principal tiene 54 px de alto en desktop. En pantallas pequeñas se ajustan anchos y tamaños para conservar el menú y la reserva dentro del viewport. El desplazamiento a secciones y la posición del menú usan la misma variable de altura del header.

Los enlaces internos usan navegación nativa mediante `SiteLink`: cada destino carga su documento completo, sin depender del enrutador del cliente. `lib/navigation.ts` centraliza las rutas del header; `proxy.ts` recupera enlaces anteriores con nombres visibles, acentos o mayúsculas (por ejemplo `/Qui%C3%A9nes%20somos` → `/quienes-somos`) sin redirigir las rutas canónicas.

Cada página tiene un H1 y metadatos propios. Los encabezados fotográficos interiores reutilizan la identidad del Home. El catálogo aplica la propuesta C con encabezado blanco y fichas horizontales; las otras páginas alternan contenido blanco con secciones azules.

Componentes principales:
- `SiteHeader`, `SiteFooter`: navegación e información común.
- `PageIntro`, `JourneyCta`: composición y llamadas a la acción compartidas.
- `FleetExperience`: carrusel manual de vehículos sobre un fondo constante.
- `VehicleCatalog`: filtros y fichas horizontales de la propuesta C.
- `VehicleDetails`: diálogo compartido de especificaciones.
- `ContactForm`: validación y preparación de consulta.
- Botones, diálogo, progreso, selectores y campos: componentes instalados Shadcn / Base UI.

## Flota confirmada

| Estado | Categoría | Modelo o similar | Desde USD/día | Pasajeros | Maletas | Puertas |
|---|---|---|---:|---:|---:|---:|
| 1/5 | Económico | Mitsubishi Lancer | $75 | 5 | 2 | 4 |
| 2/5 | Premium | Chevrolet Cruze | $85 | 5 | 2 | 4 |
| 3/5 | Luxury | Toyota Camry | $110 | 5 | 3 | 4 |
| 4/5 | SUV | Jeep Cherokee | $130 | 5 | 3 | 4 |
| 5/5 | SUV Luxury | Ford Explorer | $160 | 7 | 4 | 4 |

Todos automáticos. Fuente única: `lib/fleet.ts`. Los cuatro ejemplos y tarifas anteriores quedan reemplazados. La disponibilidad y tarifa final se confirman según las fechas.

### Identidad corregida del Mitsubishi Lancer

La referencia posterior del usuario, guardada en `design-proposals/lancer-reference/vehicle-reference.png`, reemplaza el Lancer moderno inicialmente generado. El modelo representado tiene faros horizontales, parrilla estrecha dividida por el emblema y carrocería redondeada en gris cálido. No se atribuye un año exacto. Portada, carrusel, catálogo, miniaturas y detalles usan ahora la familia `lancer-reference-*`; el precio y las capacidades se mantienen.

La nueva portada conserva la composición y el atardecer originales. El nuevo recorte tiene transparencia real y está alineado al mismo canvas que el fondo fijo; sus sombras de contacto se ajustan a las ruedas. Imágenes, referencia, prompts y verificación están reunidos en `design-proposals/lancer-reference/README.md`. La portada obtiene sus archivos directamente del registro de flota para evitar divergencias futuras.

## Carrusel: composición que permanece fija

Se implementa la **propuesta B — Ficha lateral**, elegida por el usuario a partir de `design-proposals/fleet/b-ficha-lateral.png`. Encabezado con logo transparente, ubicación y título alineado a la izquierda. En desktop, una ficha azul profunda ocupa aproximadamente el 30% del ancho; la escena completa, controles y selector ocupan el 70% restante. Fondo de sección azul con acentos diagonales discretos; la fotografía conserva sus colores originales.

La ficha reúne la categoría en una cápsula lima, marca y modelo en dos líneas, cuatro características en cuadrícula 2×2, tarifa destacada, botón de reserva y enlace de detalles. A la derecha: escena → flechas y contador → cinco miniaturas con borde y subrayado lima en la selección activa.

El fondo `showroom-background.webp` se muestra completo y opaco, sin capas azules, degradados, blur ni plataforma dibujada. Cada vehículo se compuso primero en ese mismo escenario con luz y reflejos de atardecer; luego se aisló con una máscara generada. El recorte final conserva los píxeles a color de la foto y lleva alfa real. Las máscaras blancas/negras son recursos de trabajo; no aparecen como fotografías en la web.

Todos los recursos finales comparten el canvas de **1859 × 846**: fondo, foto completa y recorte. Un único marco proporcional se adapta al ancho y alto disponibles sin recortar la escena. Fondo y carro ocupan exactamente el mismo rectángulo; no se centra o escala el vehículo por separado en reposo. Los PNG de recorte se conservan como entregables y la web usa sus versiones WebP sin pérdida con alfa. Nombres: `showroom-{modelo}.webp`, `showroom-{modelo}-cutout.png` y `showroom-{modelo}-cutout.webp`. Registro y prompts: `SHOWROOM-ASSETS.json`.

Únicamente se animan las capas `.drive-car` y `.drive-copy`, junto con el progreso. La ficha reserva la altura del contenido más largo dentro de la columna lateral. La reserva siempre corresponde al vehículo seleccionado.

### Sombras de contacto

Cada recorte lleva debajo una sombra ambiental amplia y tres sombras de contacto más concentradas, colocadas según las ruedas visibles de cada modelo. Las coordenadas se registran en `lib/vehicle-shadows.ts` sobre el mismo canvas 1859×846. `VehicleGroundShadow` dibuja estos gradientes radiales sin alterar las fotografías. El pavimento permanece visible a través de la sombra, con bordes suaves. No se aplica un halo alrededor de la carrocería.

La sombra está dentro de la misma capa animada que el carro: se desplaza, escala, difumina y desaparece junto a él. Las miniaturas incluyen la misma sombra. El fondo panorámico continúa intacto y opaco.

### Transiciones manuales

La última decisión del usuario reemplaza el comportamiento ligado al scroll por un **catálogo tipo carrusel manual en todos los tamaños de pantalla**. La sección tiene altura natural: no se fija al viewport, no tiene recorrido extra, no usa ScrollTrigger ni modifica la posición de la página. El scroll vertical no cambia el modelo. No hay reproducción automática.

- Cada flecha cambia un modelo; una miniatura selecciona directamente cualquier modelo, sin recorrer los intermedios.
- GSAP anima únicamente las capas del vehículo, la ficha y la barra de progreso durante **0,55 s**, con `power2.inOut`.
- El carro entrante pasa de opacidad 0 a 1, desplazamiento horizontal de **72 px → 0**, escala **0,97 → 1** y blur **4 px → 0**. El saliente hace el recorrido inverso hacia el lado opuesto.
- En móvil, el desplazamiento se reduce a **32 px** y el blur a **2 px**.
- La ficha acompaña con fade y un desplazamiento vertical de **8 px**.
- Categoría, modelo, precio, pasajeros, maletas, miniatura activa, estado accesible y reserva corresponden a la selección más reciente.
- Si llega otro clic durante la transición, la animación continúa desde las posiciones y opacidades actuales hacia el último destino. No se acumulan cambios en una cola.
- El fondo nunca se anima ni cambia; el marco mantiene la relación **1859/846** y muestra la escena completa.

### Controles y móvil

Flechas anterior/siguiente y cinco miniaturas permiten elegir directamente. Los extremos deshabilitan la flecha que no aplica. Los controles no desplazan la página.

En la imagen central, un gesto horizontal de más de 50 px cambia de vehículo si predomina sobre el gesto vertical. El desplazamiento vertical y el zoom táctil siguen disponibles. Los botones también funcionan con teclado. Un enlace abre el catálogo completo.

La composición tiene un ancho máximo de 1480 px. El nombre alcanza 54 px y la tarifa 72 px en desktop. Características de 14 px, acciones de 16 px y categoría de 16 px. La ficha usa una lista de descripción accesible con cuatro iconos y valores en dos columnas. Se mantienen las capacidades y precios reales.

Las capas de información se superponen en la misma celda de un grid que reserva la altura del contenido más largo, en lugar de una altura fija en píxeles. A 900 px o menos la composición pasa a una columna: escena, navegación, selector y ficha. El orden del documento y del teclado acompaña esa secuencia. En tablet, las acciones quedan al lado de la ficha; en móvil, debajo.

Las cinco miniaturas tienen imágenes ampliadas sin deformarlas, nombres legibles, borde y subrayado lima para el modelo elegido. Se distribuyen en cinco columnas en desktop y tres en móvil. El botón de reserva mide al menos 56 px de alto; las flechas tienen 46 px en desktop y 44 px en móvil.

Con movimiento reducido, la selección es instantánea y no se aplica desplazamiento, escala ni blur. La altura del viewport no cambia el modo de interacción.

### Fotografías reales de Maracaibo

Las cinco fotos aportadas por el usuario se distribuyen en el sitio con sus colores originales:

| Foto | Ubicación |
|---|---|
| Puente y lago al atardecer | Home: fotografía principal de «Maracaibo te espera» |
| Basílica de Chiquinquirá | Home: nuestras raíces; procedencia registrada en CITY-PHOTOS.json |
| Monumento a la Chinita | Home: nuestra gente |
| Edificios y avenidas de Maracaibo | Quiénes somos: nuestra ciudad de origen |
| Avenida El Milagro | Contacto: vista de la ciudad junto al panel de ubicación |

La galería del Home muestra las fotos completas, con pie de foto separado, distribución escalonada en desktop y una imagen principal más dos columnas en móvil. El Milagro conserva su encuadre vertical y se identifica como vista de la ciudad, no como foto de la oficina. Estas imágenes no sustituyen el escenario constante del carrusel ni el hero aprobado. Procedencia, tamaños y crédito en `CITY-PHOTOS.json`; WebP locales sin agrandar las fuentes.

### Hero

Se conserva la imagen y composición aprobada. El parallax de salida afecta al fondo (12% y escala 1,07), con movimiento reducido respetado.

## Catálogo y contacto

### Catálogo C — Fichas horizontales

La opción elegida por el usuario es `design-proposals/vehicles/c-fichas-horizontales.png`. La ruta `/vehiculos` tiene fondo blanco y un encabezado compacto: título «Un carro para cada plan.» en Outfit, frase descriptiva, tres características verificadas de la flota y una panorámica de Maracaibo a la derecha. El degradado blanco integra únicamente esa fotografía del encabezado. El header y footer compartidos conservan la identidad del sitio.

Una franja azul clara reúne categoría, capacidad, orden por precio y contador de resultados. Debajo aparecen cinco fichas horizontales con separadores finos: recorte del carro a la izquierda, categoría y modelo con cuatro especificaciones al centro, y tarifa grande con reserva lima y detalles a la derecha. Los precios usan azul marino sobre blanco. La lista no repite fondos fotográficos dentro de cada ficha.

Las imágenes reutilizan `showroom-{modelo}-cutout.webp`, con alfa real. `VehicleGroundShadow` añade sombras de contacto alineadas con cada modelo sobre el fondo blanco. Imagen y sombra comparten posición y escala; el canvas transparente se amplía al 185% del marco para aprovechar el espacio sin deformar la carrocería. Los identificadores SVG llevan el prefijo `catalog`, independiente del carrusel del Home.

El ancho máximo es 1520 px incluyendo márgenes. En desktop, las tres columnas destinan aproximadamente 34%, 43% y 23% del espacio al carro, información y reserva. A 980 px, carro y contenido se distribuyen en dos columnas, con reserva bajo la información. A 700 px, cada ficha pasa a una columna con el vehículo completo arriba; el encabezado sitúa la foto bajo el texto y los filtros se reorganizan. En pantallas estrechas, las especificaciones pasan a dos columnas y la reserva ocupa todo el ancho. Los botones de reserva tienen al menos 50 px de alto; detalles, 44 px. Los controles mantienen etiquetas, foco visible y anuncio de resultados.

El catálogo combina categoría y capacidad mínima; permite ordenar precios en ambos sentidos sin modificar los datos base. Un resultado vacío explica cómo restablecer filtros. Los precios siempre se presentan como “desde”.

### Contacto y reservas

El contacto valida nombre, correo opcional, tema y mensaje. Prepara un texto visible y ofrece abrir WhatsApp. No muestra “enviado” ni crea una reserva: el visitante confirma el envío en WhatsApp. Los datos del formulario se mantienen únicamente en el estado de esa página; no se guardan en almacenamiento local ni se envían a un backend nuevo.

Los botones de reserva general enlazan al centro existente:
https://www.ciudadcars.com/date-reservation/

Los botones por modelo abren WhatsApp al **+58 414 651-1446** e incluyen el modelo, categoría y tarifa del registro seleccionado.

## Información de empresa y fuentes

Contenido adaptado de las páginas oficiales consultadas el 9 de septiembre de 2026:
- Historia (fundación el 10 de agosto de 1984, showroom y evolución al alquiler): https://www.ciudadcars.com/about-us/
- Dirección, teléfono, correo y horario: https://www.ciudadcars.com/contact-us/
- Asistencia y complementos de alquiler: https://www.ciudadcars.com/
- Taller multimarca y vehículo de reemplazo: https://www.ciudadcars.com/service/

Dirección: Calle 70 entre Av. 4 y Av. 8, Bella Vista, Maracaibo, Zulia.
Correo: info@ciudadcars.net.
Oficina: lunes a viernes 8:00–18:00; sábado 8:00–12:00; domingo cerrado.
El enlace de ubicación consulta la dirección en Google Maps; no se inventa un punto geográfico.

## Accesibilidad y recursos

- Foco visible; enlace para saltar al contenido.
- `aria-current` en navegación, `aria-pressed` en miniaturas y progreso accesible.
- Capas de información inactivas con `inert` y `aria-hidden`.
- Anuncio de selección con `aria-live=polite`, sin actualizaciones de lectura en cada cuadro.
- Diálogo con cierre, Escape y gestión de foco de Base UI.
- Campos con etiquetas asociadas, validación y estado de preparación real.
- Fotos con dimensiones reservadas, imágenes decorativas con alt vacío.
- Los enlaces externos de WhatsApp conservan el sitio en una pestaña; no envían mensajes automáticamente.

Las fotografías generadas del hero y el catálogo son composiciones ilustrativas. No garantizan año, color ni unidad disponible. El carrusel usa recortes nuevos extraídos de las fotos generadas en el escenario común. El primer intento de transparencia produjo un damero dibujado y se descartó. La separación final aplica las máscaras generadas y exporta PNG RGBA; se verifican sus bordes transparentes.

Procedencia y prompts: `ASSET-SOURCES.json`, `IMAGE-PROMPTS.txt`, `VEHICLE-IMAGE-PROMPTS.json`. Los recursos se conservan dentro de `public/images`.

## Ejecución y verificación

React 19 con Vinext (estructura compatible con Next App Router), CSS/Tailwind y GSAP. Ejecución local en Node. No incluye inventario en tiempo real, cobros ni un backend nuevo.

Comprobaciones: compilación de producción, TypeScript y lint; once pruebas de inventario, límites de selección, filtros, enlaces de reserva, validación de contacto, recuperación de navegación y transparencia/alineación de recursos. Se retiraron las pruebas del antiguo interpolador de scroll junto con ese código. Verificación HTTP de las cinco rutas y recursos usados.

No se realizaron pruebas visuales o interactivas en navegador. El video sí se inspeccionó mediante fotogramas locales. El WebMCP opcional de lectura de la flota se conserva; su disponibilidad depende del navegador.
