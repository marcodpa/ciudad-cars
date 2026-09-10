# Fleet turnaround concept sheets — visual QA

Generated with exactly five built-in ImageGen calls, one per vehicle, in one parallel batch. No alternatives, retries, website changes or image post-processing were performed. Exact prompts and input-image paths are in prompts.json.

## Common findings

- All five outputs are PNG RGB images, 1672 × 941 pixels, approximately 16:9. The generator returned this native size despite the prompt requesting approximately 2560 × 1440. They were not upscaled.
- Every board contains the eight requested view categories in a 4-column × 2-row layout: front, front-left quarter, left profile, rear-left quarter, rear, rear-right quarter, right profile, front-right quarter. Opposite side cells are side profiles, not repeated frontal angles.
- Heading and Spanish labels are readable. Vehicles fit inside the frame, on a neutral white studio background with subtle contact shadows. No UI, prices, cards, skyline, checkerboard, silhouettes or detached brand logos.
- Main paint, vehicle generation and body family are consistent with the supplied references.
- Exact physical scale is not locked between cells: frontal/rear views are visually enlarged relative to side profiles. Lighting warmth is restrained and usable for reference; it is not a fixed calibrated lighting rig.
- All unseen rear/opposite-side details are inferred concept imagery, not verified photographs of the real units. These are reference sheets for planning, not exact 360 scans, continuity-locked source renders or animation-ready frames.
- Before any continuous rotation sequence, establish fixed geometry, correct side-specific details, freeze trim/wheels/exhaust and render or generate separately controlled frames.

## Per-vehicle observations

### Mitsubishi Lancer
File: lancer-eight-views.png
- Correct older rounded Lancer body, narrow split conventional grille, muted taupe metallic paint, modest stock bodywork, dark glass. No modern shark-nose/Evo replacement.
- Eight angle categories present.
- The fuel door is depicted on both side profiles and both rear-quarter sides, an inferred symmetry error that requires correction before continuity work.
- Stock-style wheels remain visually similar but fine spoke design is not perfectly locked. Rear lamp/trunk geometry is inferred.

### Chevrolet Cruze
File: cruze-eight-views.png
- Black first-generation stock Cruze with split front grille and stock five-spoke wheel appearance preserved.
- Eight angle categories present, with distinct front and rear quarters.
- Rear lamp design, exhaust and antenna are inferred. The source's thin roof antenna is rendered as a shark-fin-like piece in several views; fine wheel/grille details vary slightly.

### Toyota Camry
File: camry-eight-views.png
- Burgundy stock Camry body and referenced front fascia preserved.
- Eight angle categories present.
- Rear-left quarter shows two exhaust outlets while other rear views show one, so rear trim continuity is not locked.
- Fuel door appears in both side profiles. Rear lamps, trunk trim and other unseen details are inferred.

### Jeep Cherokee
File: cherokee-eight-views.png
- Silver current-reference Cherokee body, unified narrow headlamps, seven-slot grille, roof rails and dark cladding preserved.
- Eight angle categories present.
- Fuel door appears in both side profiles. Rear badges are enlarged/partly invented and small lettering is imperfect. Rear trim/exhaust are inferred.
- No substitution with Grand Cherokee or a vintage boxy model.

### Ford Explorer
File: explorer-eight-views.png
- Silver older reference Explorer body, broad three-bar grille, amber headlamp sections, rails and dark trim preserved.
- Eight angle categories present.
- Fuel-door treatment differs between rear-quarter/profile views and is not reliably side-specific.
- Rear lamps, badges and exhaust are inferred. Body scale and fine wheel design vary between cells.

## Delivery

Original generation outputs were saved outside the Site checkout in:
C:/Users/home/.codex/generated_images/work/fleet-turnaround-2026-09-10/

The Site owner copied all five PNGs, prompts and this review into `design-proposals/scroll-animation/`. These are concept references only; no live website images or interaction were replaced.
