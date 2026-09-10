# Bases visuales para la animación por scroll

## Dirección solicitada

Preparar primero imágenes de los cinco vehículos desde distintos ángulos, antes de construir la nueva animación. Se conserva la identidad azul marino, lima y blanco de Ciudad Cars y la ambientación de Maracaibo.

La interacción final está por concretar: giro de cada carro, reemplazo de modelos sobre fondo fijo o recorrido de cámara entre escenas. Las hojas de ángulos sirven como referencia para cualquiera de esas composiciones. El carrusel manual que ya funciona se mantiene durante esta preparación.

## Lo observado en el video aportado

Archivo: `C:/Users/home/Downloads/IMG_0404.MP4`, duración aproximada 21,4 s. Los tiempos se refieren a la grabación, no al recorrido final de la página.

| Tiempo aproximado | Plano observado | Aplicación posible a Ciudad Cars |
|---|---|---|
| 0–2 s | Automóvil en carretera, acercamiento de frente a tres cuartos | Presentación del Lancer y cambio de encuadre |
| 2–3 s | Vista desde el interior hacia una flota | Transición opcional; requiere una referencia del interior si se busca precisión |
| 3–5 s | Cámara se desplaza junto a distintos carros estacionados | Presentación de los cinco modelos |
| 5–7 s | Cámara se eleva y revela el conjunto junto al mar | Plano de la flota con una ambientación inspirada en Maracaibo |
| 7–10 s | Sección “Choose Your Perfect Drive”, carro central y ficha que cambia | Continuidad con el catálogo actual |

El video no demuestra por sí solo una vuelta completa de 360° de cada modelo. Separar sus planos permite definir qué vistas necesitamos sin confundir el carrusel con todo el recorrido cinematográfico.

## Primera biblioteca: cinco hojas de ángulos

Una hoja por modelo, con ocho vistas del mismo vehículo sobre fondo de estudio neutro. Se priorizan carrocería, color, rines, cristales, faros, parrilla y proporciones consistentes.

1. Frente.
2. Tres cuartos delantero izquierdo.
3. Lateral izquierdo.
4. Tres cuartos trasero izquierdo.
5. Atrás.
6. Tres cuartos trasero derecho.
7. Lateral derecho.
8. Tres cuartos delantero derecho.

| Modelo | Base visual |
|---|---|
| Mitsubishi Lancer | Carrocería anterior corregida con la foto del usuario; gris cálido, sin apariencia Evo |
| Chevrolet Cruze | Modelo negro representado actualmente en la web |
| Toyota Camry | Modelo vinotinto representado actualmente en la web |
| Jeep Cherokee | Carrocería cuadrada oscura, faros rectangulares y parrilla cromada, según la nueva foto del usuario |
| Ford Explorer | Modelo plateado representado actualmente en la web |

Las vistas no presentes en las referencias son interpretaciones generadas, pendientes de revisión de identidad. Estas hojas son referencias visuales; no constituyen todavía una secuencia continua de fotogramas ni una rotación 3D exacta.

## Recursos para definir después de los ángulos

- Fondo limpio: ya existe `public/images/showroom-background.webp`.
- Sombras de contacto: ya existen y deben ajustarse a cada orientación nueva.
- Plano conjunto de la flota: definir posiciones y dirección de la cámara.
- Vista elevada: definir cuánto se revela de la ciudad y del estacionamiento.
- Detalles opcionales: faros, rines, maletero o interior, según el recorrido elegido.

La imagen y el movimiento deben acordarse juntos: primero identidad y encuadres; después planos definitivos y continuidad entre ellos; finalmente la sincronización con el scroll.

## Entrega y procedencia

Generación mediante ImageGen integrado, con referencias actuales del proyecto. Los prompts y las observaciones de revisión se guardan junto a las hojas. Los originales del sitio y las fotos del usuario se conservan.

### Hojas generadas

- [Mitsubishi Lancer — ocho ángulos](lancer-eight-views.png)
- [Chevrolet Cruze — ocho ángulos](cruze-eight-views.png)
- [Toyota Camry — ocho ángulos](camry-eight-views.png)
- [Jeep Cherokee — ocho ángulos](cherokee-eight-views.png)
- [Ford Explorer — ocho ángulos](explorer-eight-views.png)

Los cinco PNG tienen resolución nativa 1672×941. [Prompts completos](PROMPTS.json) y [revisión visual](VISUAL-QA.md).

Estado: primeras referencias de ángulos. Se conservan las carrocerías y colores principales, pero se observaron diferencias de escala entre vistas, tapas de combustible duplicadas en ambos lados y variaciones de escape o acabado trasero. Esas inconsistencias deben corregirse en los planos definitivos antes de preparar una animación continua. Estas hojas no sustituyen ninguna imagen del sitio actual.
