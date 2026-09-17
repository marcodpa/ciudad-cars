# Intro aérea de Ciudad Cars

La portada de `/` reutiliza la intro aprobada del paquete `Ciudad-Cars-Drone.zip` (carpeta original `ciudad-cars-drone`). No se generaron nuevas escenas ni se gastaron créditos de Higgsfield durante esta integración.

## Contenido preservado

- Cruze negro y Explorer plateada, con las dos escenas aéreas aprobadas.
- Película de 15,667 segundos a 24 fps y secuencia de 376 fotogramas WebP a 1280 × 720.
- Cruce entre escenas en los fotogramas 184–192; corte lógico en 188.
- Cabecera, títulos, encuadres, textos, colores, grano, transición aérea y cierre de la intro original.
- GSAP 3.14.2, ScrollTrigger y ScrollToPlugin. Se usa la dependencia ya incluida en el proyecto, sin cargar otra copia desde CDN.
- Selección de capítulos, reproducción automática, película en diálogo y alternativa de movimiento reducido.

`cinematic-intro-assets.json` registra el tamaño y SHA-256 de los 397 archivos originales copiados a `public/cinema/`, además de los archivos de código de origen. Las pruebas comprueban que los recursos publicados coincidan con ese manifiesto.

## Adaptaciones al sitio

`CinematicIntro` sustituye la portada anterior. Su controlador conserva la línea de tiempo original, adaptada al ciclo de vida de React: elimina eventos, solicitudes pendientes, observadores y animaciones al desmontarse. Los selectores se limitan al componente. Los botones de capítulos se seleccionan explícitamente para evitar confundirlos con los atributos de estado del canvas tras un remontaje.

Las clases e identificadores de la intro llevan prefijo `cc-intro-`, con estilos bajo `.cc-cinema`. Se mantienen los identificadores públicos `#inicio` y `#recorrido`. La tipografía de la portada original se aísla de las fuentes y mayúsculas del resto del sitio.

La intro incluye su cabecera superpuesta original. El menú compartido aparece al terminar; las páginas interiores conservan su navegación habitual. Los enlaces de la intro conducen al catálogo existente `#flota`, compensando la altura del menú fijo.

Se conservan los cinco vehículos, tarifas, fichas, fotografías reales, páginas interiores y destinos de reserva del sitio. Las dos tarjetas de demostración del paquete original se sustituyen por el catálogo real existente. Los controles auxiliares quedan al pie de la intro.

## Carga y movimiento

- La secuencia sigue el scroll en ambos sentidos; el último 10% mantiene la vista aérea final.
- Cache de hasta 64 fotogramas en escritorio y 32 en móvil; carga concurrente de 6 o 4 imágenes, respectivamente, con 16 miniaturas de respaldo.
- Recorte móvil con puntos focales medidos en las escenas originales.
- Grano de película a 12 fps en escritorio y 10 en móvil, detenido cuando no es visible, al ocultar la página o abrir la película.
- `prefers-reduced-motion` y un control manual ofrecen imágenes estáticas y selección de vehículo.
- El MP4 utiliza `preload="none"`; solo se reproduce al abrir «Ver película».
- Los recursos suman aproximadamente 55 MB en el repositorio; no se descargan todos de entrada. El alojamiento debe servir `public/cinema/` y admitir el archivo MP4 de 28,2 MB.

Las escenas son recreaciones con IA; se mantiene su aviso visible al finalizar la intro.

## Validación

Comandos de comprobación: `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`.

Revisar visualmente `/` en escritorio y móvil: capítulos Cruze/Explorer, desplazamiento en ambos sentidos, restauración tras recarga o cambio de tamaño, enlace al catálogo, reproducción y cierre de película, movimiento reducido y regreso al modo animado. Verificar también el menú móvil, la selección de los cinco vehículos y la navegación a `/vehiculos`.

Validado localmente en escritorio (1440 px) y móvil (390 px): carga de fotogramas completos, selección y retroceso de capítulos, película, movimiento reducido/restauración, enlaces a la flota y ficha del Cruze. Las 13 pruebas automáticas, TypeScript, lint y compilación de producción pasan.

## Rediseño de la sección Maracaibo

La sección `#maracaibo` incorpora además el rediseño solicitado durante la integración: dos vistas principales de la ciudad y la avenida El Milagro, seguidas del puente, la Basílica y el monumento a la Chinita. Reutiliza las cinco fotografías originales registradas en `CITY-PHOTOS.json`, sin generar ni alterar imágenes. Incluye el crédito disponible de la Basílica.

Cada imagen abre una galería que conserva la foto completa; permite avanzar, retroceder y cerrar con Escape. La composición se adapta a una columna en móvil, sin desplazamiento horizontal. Las entradas de GSAP respetan la preferencia de movimiento reducido. La galería y su navegación se comprobaron en escritorio y móvil.
