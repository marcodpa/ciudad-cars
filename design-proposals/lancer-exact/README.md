# Lancer corregido a partir de la fotografía real

La foto [vehicle-reference.png](vehicle-reference.png) define el frente: faros delgados e inclinados, parrilla baja, capó redondeado, rines pequeños de fábrica y pintura gris cálida. Esta corrección sustituye la interpretación de faros más altos que el usuario rechazó.

Se usa una sola restauración generada a partir de la foto para la portada y el recorte del catálogo, evitando versiones diferentes del mismo carro. Se conserva el ángulo hacia la izquierda. Los archivos anteriores quedan como historial; la flota activa usa lancer-exact-*.

## Entregables

- [Escena del carrusel](../../public/images/lancer-exact-showroom.webp).
- [Portada](../../public/images/lancer-exact-scene.webp).
- [Recorte PNG con transparencia](../../public/images/lancer-exact-cutout.png).
- [Ocho ángulos corregidos](../scroll-animation/lancer-eight-views.png).
- [Prompts y revisión del carro](PROMPTS.md).
- [Prompt de ocho ángulos](lancer-eight-views-prompt.md) y [corrección puntual](lancer-eight-views-fuel-door-fix-prompt.md).
- [Verificación de la exportación](EXPORT-VERIFICATION.json).

Generado con ImageGen integrado. La exportación aplica la máscara generada a los píxeles a color y ajusta tamaño, márgenes y sombras al fondo existente. La silueta de aislamiento nunca se muestra como imagen del carro. Las vistas traseras son interpretaciones; la foto real y el nuevo frente corregido tienen prioridad sobre detalles inferidos de las hojas.
