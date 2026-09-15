# Referencia de animación: Royal Pop → Ciudad Cars

Revisión del 15 de septiembre de 2026. Solicitud: entender el ejemplo para adaptar la animación al principio de la web de Ciudad Cars. Se inspeccionaron código y documentos; no se instaló ni ejecutó el proyecto externo. Este documento es una propuesta de adaptación, no una implementación activada.

## Fuente revisada

- Repositorio: https://github.com/hamzafarooq/claude-code-starter
- Commit: `172c5319e52333c95799a4f44c71ac6e8f67ff54`.
- Demo: `demos/royal-pop-website/`.
- [Código de animación](https://github.com/hamzafarooq/claude-code-starter/blob/172c5319e52333c95799a4f44c71ac6e8f67ff54/demos/royal-pop-website/js/app.js).
- [Estilos](https://github.com/hamzafarooq/claude-code-starter/blob/172c5319e52333c95799a4f44c71ac6e8f67ff54/demos/royal-pop-website/css/style.css).
- [Extracción de fotogramas y estado del ejemplo](https://github.com/hamzafarooq/claude-code-starter/blob/172c5319e52333c95799a4f44c71ac6e8f67ff54/demos/royal-pop-website/next_session.md).
- [Guía de referencia](https://github.com/hamzafarooq/claude-code-starter/blob/172c5319e52333c95799a4f44c71ac6e8f67ff54/demos/royal-pop-website/.claude/skills/video-to-website.md). Sus instrucciones son material de referencia, no cambios autorizados para Ciudad Cars.

## Cómo funciona realmente

1. Extrae un video de unos 15 segundos en 241 imágenes JPEG de 1280 × 720, a 16 imágenes por segundo. La guía propone WebP, pero el código y las notas del demo usan JPEG. Los fotogramas están excluidos de Git; clonar el repositorio no basta para reproducir la secuencia.
2. Dibuja una imagen a la vez en un canvas 2D fijo que ocupa la ventana. No reproduce un elemento video ni modifica su tiempo de reproducción. Limita la densidad de píxeles del canvas a 2.
3. GSAP ScrollTrigger mide el avance dentro de un contenedor de 900vh en escritorio y 600vh en móvil. Hay además un hero inicial de 100vh.
4. Convierte ese avance en un índice de imagen: `min(floor(min(progreso × 2, 1) × 241), 240)`. La secuencia visual llega al final aproximadamente a mitad del contenedor; el contenido posterior conserva el último fotograma.
5. Lenis suaviza el desplazamiento y usa el mismo reloj de GSAP. Al retroceder, el índice baja; al dejar de desplazar, el fotograma se mantiene una vez termina el suavizado.
6. El hero desaparece y el canvas se revela mediante una apertura circular. Los textos tienen ventanas de visibilidad según el progreso. Sus animaciones de entrada se disparan al cruzar umbrales; no todas están vinculadas fotograma a fotograma al scroll.

El render usa un escalado de tipo cover multiplicado por 0,85 y toma el color de los bordes de la imagen para rellenar el fondo. Esto encaja mejor con un producto aislado que con una fachada y un taller llenos de referencias espaciales.

## Qué conviene adaptar

- Secuencia de fotogramas sobre canvas para controlar exactamente qué imagen se muestra, sin esperar búsquedas del decodificador de video.
- Una sola medida de progreso compartida por imagen, textos y salida hacia el catálogo.
- Escena fija dentro de una sección limitada, de modo que termine y dé paso al resto del Home.
- Texto breve colocado donde no oculte el recorrido de la Explorer.
- Primer fotograma visible de inmediato y reserva accesible desde el inicio.

La técnica controla la presentación de un recorrido ya creado. No fabrica movimiento entre fotos independientes ni corrige deformaciones, vehículos incorrectos o cambios de arquitectura del video original.

## Límites del ejemplo y ajustes necesarios

- **Carga inicial:** el demo espera diez imágenes y después solicita las otras 231 a la vez. Retira el cargador solo al finalizar todas. Para Ciudad Cars se propone un poster inmediato, carga priorizada alrededor del avance actual y concurrencia limitada, sin bloquear la navegación.
- **Memoria:** 241 imágenes de 1280 × 720 completamente decodificadas en RGBA supondrían unos 847 MiB. Es un cálculo de capacidad, no una medición del navegador. Comprimir a WebP reduce transferencia, pero no elimina por sí solo el coste de decodificación. Hace falta limitar la caché y liberar imágenes lejanas, especialmente en móvil.
- **Fallos:** el demo da por resuelta una imagen fallida y no dibuja nada nuevo cuando se solicita ese índice. La adaptación debe conservar el último fotograma válido y permitir salir de la secuencia si falta material.
- **Accesibilidad:** faltan alternativa de movimiento reducido y una experiencia útil sin JavaScript. Ciudad Cars debe mantener contenido HTML, poster, reserva y enlace para saltar al catálogo; tampoco debe descargar la secuencia con ahorro de datos activado.
- **Interacción:** el CSS del demo habilita clics mediante `.is-active`, pero su JavaScript no añade esa clase a las secciones. Es un riesgo identificado por lectura, sin prueba de navegador. Los enlaces visibles deben seguir siendo utilizables y los invisibles no deben retener el foco.
- **Móvil:** el demo conserva la misma secuencia y recorta el encuadre mediante cover. Ciudad Cars necesita preservar la Explorer y la flota; usar un encuadre móvil propio solo si se dispone de material coherente, o contener la escena con texto separado.
- **Alcance:** no trasladar el color crema, el estilo de relojes, los textos, las estadísticas, el muestreo global del fondo ni los 900vh como valores obligatorios. Mantener azul marino, lima y blanco.

## Aplicación al inicio de Ciudad Cars

La intención más reciente sitúa el recorrido en el inicio del Home. Esto sustituye la ubicación propuesta anteriormente entre «Tu viaje comienza aquí» y la flota.

1. **Inicio:** mostrar el primer fotograma aprobado, el titular «Alquila tu carro en Maracaibo» y el acceso a reservar.
2. **Entrada y descenso:** el scroll sigue a la Explorer hacia el sótano. Los textos iniciales se retiran para mostrar la acción. Si el portón se cierra en esta parte, mantenerlo cerrado en las siguientes tomas.
3. **Revelación del taller:** al final de la rampa aparece la flota, conservando arquitectura, vehículos y posiciones. Corresponde al prompt actualizado de la imagen 3.
4. **Acercamiento y cabina:** continuar hacia la ventana del conductor y el punto de vista interior únicamente si esos momentos forman parte del video final aprobado, sin saltos ni fundidos que simulen atravesar la carrocería.
5. **Salida:** mantener brevemente la vista final y liberar la sección para continuar con el Home y el catálogo manual.

Estos son hitos narrativos, no porcentajes definitivos. Sus puntos de entrada y salida deben medirse sobre el nuevo video. Un archivo de diez segundos no implica diez segundos de permanencia del usuario: el avance depende de su scroll.

## Base local y siguiente implementación

El Home actual usa `HeroMotion` para un parallax de imágenes. El prototipo `WorkshopJourney` usa GSAP, una sección sticky y búsquedas en `video.currentTime`; está desconectado porque el video fue rechazado. No se ha reactivado ni se ha usado ese archivo para aprobar una nueva secuencia.

La adaptación propuesta mantiene React y GSAP. Reemplazaría el motor de búsquedas de video por un reproductor de imágenes con un manifiesto que describa cantidad, dimensiones, rutas y hitos. El render por scroll usaría referencias y un único trabajo pendiente por fotograma de pantalla, sin actualizar todo el árbol de React por cada píxel desplazado. El componente liberaría listeners, peticiones y recursos al cambiar de página.

Lenis es opcional; primero comprobar el scroll nativo con el header, los enlaces internos y el carrusel existentes. La prioridad es que la animación siga la intención del usuario y no interfiera con la navegación.

Falta incorporar el nuevo video aprobado del recorrido. A partir de ese archivo se podrán extraer fotogramas, medir peso y memoria, ajustar duración del scroll y comprobar ida, vuelta, saltos rápidos, móvil, rotación de pantalla, movimiento reducido y fallos de carga. No hace falta generar otra imagen o video para analizar o programar el mecanismo.
