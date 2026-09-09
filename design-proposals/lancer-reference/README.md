# Lancer corregido según la referencia del usuario

La foto `vehicle-reference.png` define la carrocería: Lancer de líneas redondeadas, faros horizontales y parrilla estrecha dividida por el emblema central, pintura gris cálida, rines de serie y vidrios oscuros. No se atribuye un año exacto ni se presenta la imagen generada como fotografía de una unidad disponible.

Se reemplaza la interpretación anterior de Lancer moderno en todos los recursos activos de `lib/fleet.ts`. El Home toma ahora sus imágenes del mismo registro que el catálogo y el diálogo de detalles.

## Imágenes generadas

- `generated-hero.png`: portada con la carrocería corregida, misma vista hacia la derecha y panorama de Maracaibo.
- `generated-foreground.png`: vehículo de tres cuartos hacia la izquierda, con luz de atardecer. La transparencia solicitada no vino en el archivo original.
- `generated-isolation-matte.png`: máscara generada independiente para aislar los píxeles a color; nunca se muestra como foto en la web.

Modo: herramienta ImageGen integrada. Prompts completos en `PROMPTS.md` y `MATTE-PROMPT.md`.

## Recursos integrados

- `public/images/lancer-reference-scene.webp`: portada desktop.
- `public/images/lancer-reference-mobile.webp`: portada móvil y detalles.
- `public/images/lancer-reference-cutout.webp` y `.png`: carrusel, miniaturas y fichas de catálogo con alfa real.
- `public/images/lancer-reference-showroom.webp`: composición de referencia del fondo existente, sombra y recorte.
- `public/images/lancer-reference-alpha.png`: canal alfa de trabajo.
- `public/images/lancer-reference-thumb.webp`: variante ligera de la foto.

El recorte conserva los colores generados y aplica la máscara como canal alfa. Se elimina el residuo neutro de damero únicamente en la banda exterior de la máscara. La exportación coloca el vehículo dentro del canvas 1859×846, con límites x=461…1331, y=341…763. No se amplía ni cambia el fondo del carrusel. Las sombras se alinean a los nuevos puntos de contacto de las ruedas en `lib/vehicle-shadows.ts`.

La escena completa del showroom es una exportación de las mismas tres capas usadas por la web. En la web el fondo sigue siendo una imagen constante y solamente cambia la capa del vehículo con su información.

Exportación reproducible: `scripts/prepare-lancer-reference.mjs`. Dimensiones, transparencia y encuadre: `EXPORT-VERIFICATION.json`. Las imágenes anteriores permanecen como historial; las rutas activas usan los nombres nuevos para evitar caché antigua.
