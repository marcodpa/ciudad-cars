# Intro aérea de Ciudad Cars

La portada de `/` reutiliza la intro aprobada del paquete `Ciudad-Cars-Drone.zip` (carpeta original `ciudad-cars-drone`). No se generaron nuevas escenas ni se gastaron créditos de Higgsfield durante esta integración.

## Contenido preservado

- Cruze negro y Explorer plateada, con las dos escenas aéreas aprobadas.
- Película de 15,667 segundos a 24 fps y secuencia de 376 fotogramas WebP a 1280 × 720.
- Cruce entre escenas en los fotogramas 184–192; corte lógico en 188.
- Encuadres, vehículos y transición aérea incorporados en la película original. Se retiraron el grano, viñeta, desenfoque y brillo añadidos. Los textos llevan ahora un degradado azul localizado desde el borde más cercano, que aparece y desaparece junto con cada mensaje; no hay una capa permanente sobre toda la película.
- GSAP 3.14.2, ScrollTrigger y ScrollToPlugin. Se usa la dependencia ya incluida en el proyecto, sin cargar otra copia desde CDN.
- Selección de capítulos, reproducción automática, película en diálogo y alternativa de movimiento reducido.

`cinematic-intro-assets.json` registra el tamaño y SHA-256 de los 397 archivos originales copiados a `public/cinema/`, además de los archivos de código de origen. Las pruebas comprueban que los recursos publicados coincidan con ese manifiesto.

## Adaptaciones al sitio

`CinematicIntro` integra el recorrido en la portada. Su controlador sincroniza fotogramas, textos y planes de viaje con una sola línea de tiempo reversible: elimina eventos, solicitudes pendientes, observadores y animaciones al desmontarse. Los selectores se limitan al componente. Los botones de capítulos se seleccionan explícitamente para evitar confundirlos con los atributos de estado del canvas tras un remontaje.

Las clases e identificadores de la intro llevan prefijo `cc-intro-`, con estilos bajo `.cc-cinema`. Se mantienen los identificadores públicos `#inicio`, `#recorrido` y `#viaje`. La portada comparte Outfit, azul profundo `#032640` y lima `#B6F331` con el sitio, conservando la escala amplia y las mayúsculas/minúsculas de sus titulares.

Un único `SiteHeader` acompaña toda la página: se superpone a la película y pasa a fondo sólido al llegar al catálogo. Un `IntersectionObserver` usa la altura real de la cabecera, incluida su variante móvil. Las páginas interiores conservan su navegación habitual. Los enlaces de la intro conducen al catálogo existente `#flota`, compensando la altura del menú fijo.

El cierre del recorrido incorpora Turismo, Negocios y Familia sobre la última vista aérea y desemboca directamente en la flota, sin otra cabecera ni una segunda bienvenida. Se conservan los cinco vehículos, tarifas, fichas, fotografías reales, páginas interiores y destinos de reserva. La película, repetición y preferencia de movimiento se encuentran en «Opciones del recorrido», dentro de la escena.

Referencia de interacción: [Royal Pop, de Hamza Farooq](https://github.com/hamzafarooq/claude-code-starter/tree/main/demos/royal-pop-website). Se adapta la continuidad entre imagen, textos y navegación a Ciudad Cars; se reutilizan todos los recursos originales del proyecto y el scroll nativo, sin añadir dependencias.

## Carga y movimiento

- La secuencia sigue el scroll en ambos sentidos. El tramo final continúa después de que el escenario deja de estar fijo: la página empieza a bajar con el video aún en movimiento y, al llegar al último fotograma, el catálogo ocupa aproximadamente el 65% de la pantalla. No hay una pausa final sobre una imagen congelada. Una línea discreta muestra el avance de la película.
- Seguimiento suavizado de 1 segundo en escritorio y 0,55 segundos en móvil. El scroll sigue siendo nativo, con una sola línea de tiempo para imágenes y texto.
- Hasta 64 fotogramas decodificados en escritorio y 32 en móvil; cuatro descargas y dos decodificaciones concurrentes. Se prioriza la ventana próxima al avance y se conserva la secuencia comprimida para volver atrás sin descargarla otra vez. Los bitmaps se liberan al salir de la ventana y al desmontar el componente.
- La imagen se pinta como máximo una vez por refresco de pantalla. Si un fotograma todavía no está listo, se mantiene el último o se avanza hasta uno completo disponible, sin retrocesos por descargas fuera de orden ni sustituciones con miniaturas de baja calidad.
- Recorte móvil con puntos focales medidos en las escenas originales.
- La carga se pausa cuando el recorrido deja de estar visible, al ocultar la página o abrir la película. El modo de ahorro de datos limita la carga a la ventana cercana. Los fondos de texto salen de la izquierda en la bienvenida y Cruze, de la derecha en Explorer y de abajo en el cierre; en móvil, los mensajes de vehículos usan el borde inferior.
- `prefers-reduced-motion` y un control manual ofrecen imágenes estáticas y selección de vehículo. Los planes permanecen en el flujo normal y el cambio de modo conserva la posición del control enfocado; se recalculan también las animaciones de las secciones siguientes.
- El MP4 utiliza `preload="none"`; solo se reproduce al abrir «Ver película».
- Los recursos suman aproximadamente 55 MB en el repositorio. Mientras el recorrido está visible, la secuencia comprimida se precarga progresivamente después de priorizar los fotogramas cercanos; el MP4 y las miniaturas no forman parte de esa precarga. El alojamiento debe servir `public/cinema/` y admitir el archivo MP4 de 28,2 MB.

Las escenas son recreaciones con IA; su aviso se incluye en las opciones del recorrido.

## Validación

Comandos de comprobación: `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`.

Revisar visualmente `/` en escritorio y móvil: capítulos Cruze/Explorer, desplazamiento en ambos sentidos, restauración tras recarga o cambio de tamaño, enlace al catálogo, reproducción y cierre de película, movimiento reducido y regreso al modo animado. Verificar también el menú móvil, la selección de los cinco vehículos y la navegación a `/vehiculos`.

La revisión anterior de la integración cubrió escritorio y móvil de 390 px: capítulos, planes, acceso a la flota, menú móvil, película y cambio de movimiento. Para el ajuste de fluidez se añaden pruebas de carga, límites de memoria, reutilización al retroceder, ahorro de datos y descarte de decodificaciones pendientes. Las pruebas de recursos mantienen la verificación de los medios originales.

La salida anticipada y los degradados localizados se comprobaron en escritorio de 1280 × 720 y móvil de 390 × 844. En los fotogramas 343–344 el escenario ya sube y se ve el comienzo del catálogo; en el fotograma final 375 este ocupa aproximadamente el 65% de ambas pantallas. No hay desbordamiento horizontal en móvil. Lint, TypeScript y compilación de producción completados correctamente.

## Rediseño de la sección Maracaibo

La sección `#maracaibo` incorpora además el rediseño solicitado durante la integración: dos vistas principales de la ciudad y la avenida El Milagro, seguidas del puente, la Basílica y el monumento a la Chinita. Reutiliza las cinco fotografías originales registradas en `CITY-PHOTOS.json`, sin generar ni alterar imágenes. Incluye el crédito disponible de la Basílica.

Cada imagen abre una galería que conserva la foto completa; permite avanzar, retroceder y cerrar con Escape. La composición se adapta a una columna en móvil, sin desplazamiento horizontal. Las entradas de GSAP respetan la preferencia de movimiento reducido. La galería y su navegación se comprobaron en escritorio y móvil.
