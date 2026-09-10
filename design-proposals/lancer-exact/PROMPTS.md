# Lancer exact reference restoration

Mode: built-in image_gen edit. Actual 318 x 163 photo is sole identity target; rejected car never provided to generation.

## Prompt 1 — restoration

Use case: identity-preserve / background-extraction.
Asset type: isolated restored photograph of this EXACT car for a premium automotive webpage.
Input image 1 is the sole photo edit target and sole source of car identity. Restore/upscale THIS photograph. Do not substitute any generic Mitsubishi Lancer. The photographed car faces LEFT, viewed front three-quarter with its front at the LOWER LEFT and passenger side extending toward the RIGHT. Do not mirror, rotate, reorient, or change the camera viewpoint.
Change ONLY: remove garage/background, improve photographic resolution and gentle lighting. Preserve the actual photographed vehicle geometry as precisely as possible: original body proportions, front fascia, narrow slim slightly swept horizontal clear headlights with rounded low outer tips, low slim chrome upper grille continuing at the headlight line, Mitsubishi badge, low rounded hood with its original crease contours, actual black lower bumper openings, front and rear bumper shapes, fender outlines, original small stock alloy wheel spoke design, tire size, ride height, windows, dark tint, door handles, mirrors. Do not redesign headlights into tall square units. No sporty wheels, no modifications, no modernizing to a different year. Faithfully preserve every silhouette and panel boundary.
Paint remains muted warm neutral taupe gray / gray brown metallic matching the input, with restrained warm sunset key from image right and cool fill, subtle realistic reflections. No vivid orange gloss. Windows are dark tinted with physically believable glass reflections, NEVER checkerboard glass.
Output a full-color photoreal high-resolution restoration of the entire original photographed car, crisp natural detail without inventing a different model.
Background: genuinely transparent alpha, PNG cutout, not a picture of a checkerboard. No ground, no garage, no floor, no scenery, no contact shadow or cast shadow. Keep only complete vehicle. Entire front bumper, rear bumper and all visible tires intact.
Composition: wide approximately 1859 x 846 canvas, 2.2:1 aspect ratio, whole car fills about 70 percent canvas width with generous transparent margins, centered. Preserve the source car's LEFT-facing original perspective exactly. No text or watermark.

## Prompt 2 — framing only

Use case: precise-object-edit / background-extraction.
The attached image is the exact edit target. Make ONE change only: extend its canvas to create generous empty margin surrounding the entire car, including reconstructing only the tiny missing bottom edge of the front tire so the complete tire and vehicle fit within the image. Keep every existing car pixel visually identical in geometry, color, identity, viewpoint, lighting, headlights, grille, body, glass, wheels, tires. Do not redesign or regenerate the car. Keep this exact LEFT-facing view.
Car must fit at approximately 80 percent image width, with at least 8 percent clear padding left, right, above and below the entire car; complete front tire with empty space below it is essential.
Deliver a wide 2.2:1 PNG with actual transparent alpha in all exterior empty background areas. No checkerboard drawing, no scenery, no road, no shadow. All glass remains exactly as input: fully dark opaque tinted reflective glass without any background pattern inside. No text.

## Prompt 3 — aligned matte

Use case: precise-object-edit.
Input image is a technical segmentation target. Output ONLY a strictly aligned black-and-white alpha matte for this exact attached image, same 1859 x 846 resolution, identical layout and geometry with absolutely no scaling, translation or cropping.
White (#FFFFFF) means every pixel belonging to the complete car: painted body, glass, mirror, grille, headlights, badge, wheels, ALL dark tires, handles, license plate and all opaque vehicle surfaces. All tinted glass is solid white in this matte. Grille and wheels remain solid white; do not punch out dark objects or spokes.
Black (#000000) means all exterior background, including every checkerboard pixel outside the vehicle and the empty spaces below bumpers and between the tires. No ground or shadow should be included. Trace the real car silhouette accurately, with subtle edge antialiasing only along the silhouette.
This is NOT a new car drawing. It is a flat solid white silhouette perfectly registered to the input car, against pure solid black background. No inner details, no checker pattern, no text, no shadows.

## Identity QA

- Left-facing front three-quarter view preserved from actual photograph.
- Slim swept clear headlights and slim chrome-edged grille much closer to actual photo than rejected broad upright light design.
- Muted taupe-gray paint, dark tinted glass, small stock-style alloys preserved.
- Final color image: 1859 x 846, whole tires and bumpers visible with margins.
- No checkerboard visible inside glass.
- Transparency request returned RGB baked checkerboard; supplied generated same-canvas white-car / black-background matte for parent integration.
- Matte visually tracks complete car silhouette and excludes road/shadow; inspect composited perimeter before publishing. Image generation can introduce small shape differences and does not constitute pixel-exact archival restoration.

