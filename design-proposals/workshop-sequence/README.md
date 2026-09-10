# Explorer: de la calle al sótano del taller

Secuencia visual de Ciudad Cars. La fachada se basa en la fotografía real aportada por el usuario: revestimiento beige, puerta peatonal de vidrio con marco de piedra gris, dintel claro y acceso vehicular a su derecha. El usuario confirmó que el acceso al sótano es descendente.

## Orden vigente de las imágenes

1. [Desde la calle, antes de entrar](real-workshop-street.png): Explorer plateada sobre la calzada, aproximándose al acceso real.
2. [Entrada en descenso](real-workshop-entry.png): la misma Explorer avanza por el mismo acceso y comienza a bajar hacia el sótano.
3. [Llegada al taller del sótano](basement-arrival.png): ocho vehículos contando la Explorer de llegada.
4. [Vista desde el conductor](explorer-basement-driver-view.png): los siete carros estacionados se ven a través del parabrisas.

Las placas de la Explorer de la secuencia no contienen números, letras ni identificaciones visibles. Las dos primeras tomas sustituyen la fachada conceptual de garage-entry.png, que se conserva solo como historial y no debe utilizarse en la secuencia vigente.

## Continuidad del recorrido

La cámara sigue la Explorer desde la calle hacia el portón y la rampa descendente. Una vez detenida dentro del taller, baja el vidrio del conductor; la cámara atraviesa la ventana abierta y gira suavemente hacia el parabrisas. Ese movimiento entre las imágenes aún debe construirse: las imágenes son bases de dirección visual, no un video terminado.

Las siete unidades estacionadas mantienen el orden de izquierda a derecha: Lancer gris cálido, Cruze negro, Camry vinotinto, Cherokee cuadrada oscura, Explorer blanca, Lancer plateado y Lancer azul oscuro. Los colores adicionales no cambian carrocería, faros, parrilla ni rines.

## Referencias y límites

Las hojas de ángulos de ../scroll-animation/ se usan como referencias de identidad. La Explorer conserva la generación seleccionada; el Lancer utiliza la hoja corregida a partir de la foto real. La fachada real tiene prioridad sobre cualquier exterior generado antes de recibir esa foto.

El descenso fue confirmado por el usuario. La geometría interior no visible en la fotografía y el habitáculo siguen siendo interpretaciones cinematográficas. La imagen interior reserva aproximadamente45% a la cabina, permitiendo identificar los siete frentes; el encuadre móvil necesitará un ajuste propio.

## Generación y archivos

ImageGen integrado. [Prompts de fachada real, calle, descenso y placa](real-workshop-prompts.json). [Prompts de las tomas del sótano](basement-prompts.json). [Revisión del sótano](basement-visual-qa.md).

Esta carpeta prepara el recorrido visual. No modifica la interacción actual del carrusel ni presenta las imágenes como fotografías verificadas de todo el interior real.
