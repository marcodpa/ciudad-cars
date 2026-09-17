# Ciudad Cars — Cinema Studio, paso a paso
Preparado el 16 de septiembre de 2026. Esta guía no ejecuta generaciones ni gasta créditos.

## 1. Crear el proyecto
En la pantalla de la captura, pulsa Nuevo proyecto y llámalo Ciudad Cars — Recorrido. La captura más reciente muestra Video, Seedance 2.5, Referencias, 16:9, 1080p y 4 segundos. El botón muestra 36 créditos con 64 tachado; ese importe corresponde a esos ajustes, no al recorrido completo con mayor duración.

## 2. Guardar los elementos
En Mis elementos crea referencias reutilizables. Los nombres son sugeridos; utiliza el selector @ para insertar los elementos reales en el prompt. Escribir un nombre sin adjuntar o seleccionar el elemento no basta para comprobar que está asociado.

| Nombre | Tipo si lo ofrece la interfaz | Archivo de esta carpeta | Uso |
|---|---|---|---|
| explorer | Objeto / Prop | 01-explorer-identidad.png | Identidad exterior principal |
| explorer, referencia adicional | Mismo elemento | 02-explorer-angulos.png | Proporciones desde diferentes ángulos; las ocho vistas son un solo carro |
| loc_exterior | Lugar / Location | 03-exterior-completo.png | Fachada y acceso |
| loc_taller-cmpleto | Lugar / Location | 04-taller-completo.png | Distribución interior y flota |
| prop_parte-de-adntro-de-la-explorer | Objeto / referencia | 05-interior-explorer.png | Tablero y punto de vista final |

Puedes llamar a la Explorer tu protagonista, pero la categoría Objeto/Prop corresponde a un vehículo; Soul Cast/Soul ID se orienta a personas. Si la interfaz clasifica automáticamente, usa esa clasificación.
La imagen individual y la hoja de ángulos elegidas comparten espejos oscuros y rines de radios finos. No mezcles las otras versiones con espejos plateados y rines gruesos.
La referencia interior es una guía visual generada, no una comprobación del acabado exacto del vehículo real.

Descripción sugerida para explorer:
Silver Ford Explorer matching the attached vehicle reference. Preserve the same body shape, dark mirror housings, thin multispoke wheels, roof rails, grille and tail lights in every shot. All reference angles depict the same single vehicle. Blank license plate surfaces.

## 3. Utilizar las vistas completas correctamente
Las imágenes desde arriba son referencias de distribución. No deben convertirse literalmente en el primer ni último fotograma del video.
En los interiores filmados hay un techo real de concreto con luminarias: la vista sin techo solo sirve para ver la planta.
Exterior y taller son una reconstrucción conceptual de las referencias, no un levantamiento medido ni un modelo 3D.
Selecciona únicamente los elementos relevantes para cada plano cuando trabajes por planos. Para el prompt maestro se necesitan los cuatro elementos.

## 4. Preparar el aspecto
Pasa de Imagen a Video. Elige Cinema Studio / Seedance 2.5 si esa opción aparece en el selector de tu cuenta. La documentación de Cinema Studio 4.0 indica Seedance 2.5; las opciones visibles dependen de la versión.
Ajustes de producción propuestos:
- Horizontal 16:9.
- Duración suficiente para completar el recorrido a ritmo natural. Estimación de montaje: unos 20–25 segundos, sujeta a las opciones del selector y al coste mostrado.
- Una sola salida/variación.
- 1080p si su precio cabe en tu presupuesto. Evita seleccionar 4K por accidente.
- Movimiento a velocidad normal; sin aceleraciones estilizadas.
- Aspecto natural, óptica esférica de 35 mm como base y profundidad de campo moderada.
- Grano fino y discreto de 35 mm; exteriores de tarde e interior iluminado por sus lámparas.
- Género General, cuando exista el selector.
- No bloquees un movimiento global de cámara que contradiga los cuatro planos.
Estos ajustes describen el resultado; no todos son controles disponibles en todas las versiones. Si falta un ajuste, está explicado en el prompt.

## 5. Secuencia con duración natural
La duración se adapta al recorrido. Conservamos cuatro planos con cortes de continuidad y sin tiempos obligatorios para cada acción.

| Orden | Plano | Acción principal |
|---|---|---|
| 1 | Exterior a altura del carro | La Explorer, ya alineada, cruza el acceso con suavidad |
| 2 | Rampa y llegada | Baja despacio, llega al piso del sótano y se detiene completamente |
| 3 | Ventanilla del conductor | Con el carro detenido y el vidrio abierto, la cámara se aproxima |
| 4 | Vista desde el conductor | Se revela la flota y se mantiene un cierre estable para apreciar el taller |

Como estimación de montaje, calcula unos 20–25 segundos; no es una duración exacta prometida. El generador requiere seleccionar una duración disponible: el prompt no puede extenderla automáticamente. Elige una opción con tiempo suficiente y comprueba su coste actualizado. Si la versión no admite el recorrido completo, habrá que dividirlo en clips y unirlos.

Los cortes permiten omitir trayecto sin acelerar físicamente el carro. La entrada a la cabina continúa planteada mediante un corte de continuidad. Atravesar literalmente la ventanilla sin corte sería un movimiento distinto que conviene resolver por separado.
## 6. Revisar primero una imagen de encuadre
Este paso puede tener un coste adicional. Puedes usar una imagen existente si cumple las condiciones; no hace falta regenerar seis imágenes.
Con explorer y loc_exterior seleccionados, prepara un encuadre a la altura del carro. Si generas una imagen de prueba, una sola salida.

Prompt del encuadre:
Create one full-size photographic 16:9 rear three-quarter shot of @explorer already aligned with the open right-hand garage entrance of @loc_exterior. Camera at approximately tail-light height with a natural 35 mm perspective, at a comfortable following distance. Show the entire vehicle and the doorway with realistic scale and clearance. The ramp descends into the basement; the foreground approach remains clear. Use the exterior overhead image only for architecture and geography, never its aerial viewpoint. Warm natural afternoon light, real pavement wear, grounded tire shadows, fine restrained 35 mm film grain. Match the selected Explorer identity exactly. One silver hero vehicle with blank plate surfaces.

Comprobar: proporción carro/puerta, rines y espejos, acceso abierto, inclinación descendente, neumáticos apoyados y ausencia de un segundo vehículo protagonista. Si falla algo, no lo animes esperando que el video lo repare.

## 7. Crear el video
Inserta los cuatro elementos usando @, verifica que aparezcan sus miniaturas y abre 06-prompt-maestro-video.txt. Sustituye los nombres si la interfaz guarda otros.
En modo Referencias, utiliza el prompt completo para una generación con cuatro planos. Si tu versión usa casillas de plano manuales, distribuye SHOT 1–4 según el tiempo que necesite cada acción y conserva las reglas de identidad, continuidad y aspecto como instrucciones comunes.
No marques las vistas aéreas como fotogramas inicial/final. Si la interfaz pide obligatoriamente un fotograma inicial, utiliza el encuadre a altura del carro revisado en el paso anterior.

## 8. Ver el precio y generar
El coste concreto es el que muestra la configuración de Video antes de enviarla. La captura no permite conocerlo. Una promoción de Unlimited en el banner tampoco confirma que tu cuenta o ese modelo lo tengan activado.
Duración, modelo, resolución y cantidad de salidas pueden cambiar el coste. Con una sola oportunidad, revisa esos cuatro valores y las referencias adjuntas antes de pulsar Generar.

## 9. Revisión del resultado
Mira a velocidad normal y comprueba:
1. Las ruedas giran de acuerdo con el avance y mantienen contacto con el piso.
2. El carro conserva tamaño, ruedas, espejos y carrocería.
3. La llegada y la frenada tienen peso, sin deslizamiento lateral.
4. La flota estacionada y las columnas no se desplazan ni se duplican.
5. El taller tiene techo, y la rampa pertenece al mismo lugar.
6. Los cortes no deforman la Explorer para convertirla en otro encuadre.

Los elementos y el mapa espacial ayudan a especificar la continuidad; no garantizan física realista. El grano modifica el acabado visual, no corrige geometría o movimiento.

## Fuentes consultadas
- Cinema Studio: https://higgsfield.ai/creator-hub/help-center/tools/how-do-i-use-cinema-studio
- Flujo con elementos de personajes, lugares y objetos: https://higgsfield.ai/blog/seedance4k-breakdown
- Uso de esquema espacial como referencia y no como fotograma: https://higgsfield.ai/academy/courses/cinematic-ad-e2e/scenes-5-6-the-duel-and-round-one-loss

Las decisiones de encuadre, montaje y tiempos de esta guía son una propuesta específica para Ciudad Cars.
