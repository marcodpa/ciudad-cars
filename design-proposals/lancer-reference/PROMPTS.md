# Corrected older Lancer asset prompts

Mode: built-in image_gen; exactly two calls, one per asset.

## Asset A: showroom foreground

Use case: background-extraction
Asset type: transparent car foreground for an existing cinematic dealership website showroom.
Input image 1 is the STRICT VEHICLE IDENTITY reference: use this exact older rounded Mitsubishi Lancer sedan body. Input image 2 is ONLY the pose, scale, framing and lighting reference; its newer-model vehicle must not be copied.
Primary request: create one high-resolution photorealistic full-color cutout of the older Lancer from image 1, with a genuinely transparent alpha background. Deliver a PNG with real transparency, never a checkerboard pattern, opaque white, black, or a photographed background.
Subject identity: modest stock early-2000s rounded Lancer sedan, warm gray/taupe metallic paint, small conventional narrow dark grille split in the middle by the Mitsubishi badge and its slim vertical surround, broad horizontal rectangular headlight assemblies with softly rounded corners, rounded hood and fenders, low understated factory bumper, small stock alloy wheels like image 1, very dark tinted side windows and windshield. This is NOT the newer angular shark-nose Lancer in image 2 and is NOT an Evolution. Closely preserve the older identity reference's real front fascia, roofline, body proportions and restrained stock appearance.
Composition/framing: use the exact wide 1859 by 846 pixel canvas, approximately 2.2:1. Match the car camera angle and position of image 2: front three-quarter view, nose points toward image-left, right passenger flank visible, entire car occupies approximately x=25%-74% and y=37%-89% of the canvas. Keep all car edges and both visible tires entirely inside the canvas with ample transparent margin. Do not enlarge to fill frame.
Lighting/style: premium cinematic photoreal automotive advertising, consistent with image 2: warm sunset highlights from the right, gentle cool blue environmental reflections on the left, rich realistic taupe metallic paint, crisp restrained detail. Only reflections remain on the car. No real environment may be visible outside the vehicle.
Constraints: remove all scene/backdrop, ground, bridge, pavement, palm trees, sky and detached shadow. Omit ground/contact shadows outside the car because the website will supply them. Preserve opaque full-color car paint and tires, with clean antialiased cutout edges and genuine zero-alpha pixels around the vehicle. No text, no UI, no new logos beyond standard Mitsubishi badge, no sporty bodykit, no large modern grille, no angular modern headlights, no large wheels. Generate exactly one image.

## Asset B: hero replacement

Use case: precise-object-edit
Asset type: existing dealership website panoramic hero photograph.
Input image 1 is the EDIT TARGET panorama. Input image 2 is the STRICT VEHICLE IDENTITY reference for the replacement.
Primary request: edit image 1 by replacing ONLY its newer Mitsubishi Lancer with the exact older rounded Lancer sedan body shown in image 2. Preserve the panorama, bridge, palms, skyline, sky, sunset, wet pavement, water, railings, lights, camera, crop and framing from input image 1.
Subject identity: older early-2000s rounded Mitsubishi Lancer sedan with warm gray/taupe metallic paint, narrow conventional dark grille split by the Mitsubishi center badge and slim vertical surround, wide horizontal/rectangular headlight assemblies with rounded corners, rounded hood and fenders, modest low stock bumper, small original-style alloy wheels like image 2 and dark tinted glass. The reference identity is the top priority. Do NOT use the newer angular shark-nose frontend from target image 1. No Evolution styling, no large modern grille, no sporty bodykit.
Composition: keep the 1859 by 846 pixel panoramic canvas (approximately 2.2:1). Replacement car has exactly the same size, right-side placement, ground position, front three-quarter camera view and perspective as the car in image 1. Its nose points image-right as in image 1, showing the opposite flank from the identity photograph. Preserve all the left-side negative space for web copy. Maintain the original landscape camera and location.
Lighting/style: match existing photoreal premium cinematic scene, warm golden sunset from the right with cool blue ambient light from the left. Show believable warm/cool environmental reflections on the taupe car, realistic tire contact shadows and subtle corresponding wet-pavement reflection, matching its exact contact points.
Invariants: only replace the automobile and locally reconcile its contact shadow/reflection; all other scene elements stay unchanged. No new text, no logos beyond the standard Mitsubishi vehicle badge, no watermark, no UI. Generate exactly one image.
