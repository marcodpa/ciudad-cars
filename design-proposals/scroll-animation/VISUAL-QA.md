# Fleet turnaround concept sheets — visual QA

Initially generated with five built-in ImageGen calls. The Cherokee sheet was replaced on 2026-09-10 after the user supplied its correct body reference. Exact current prompts and input-image paths are in PROMPTS.json.

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
- Replaced after the user rejected the previous headlight and grille shape. Actual photograph and new restoration define the narrower swept lamps and lower grille.
- All eight views show the corrected taupe body. A targeted edit removed the duplicated fuel door from the right rear quarter.
- Rear details remain inferred. Scale and fine wheel details vary between angles; reference only, not locked animation frames.

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
- Corrected 2026-09-10 to the user’s dark, older boxy Cherokee reference: upright rectangular headlamps, chrome seven-slot grille, factory five-spoke silver wheels and roof rails.
- All eight requested angle categories present. Black/dark navy paint and boxy body family remain consistent.
- Fuel door appears on the left rear quarter; the right profile does not duplicate it.
- Unseen rear surfaces, trim and badges are inferred. Frontal/rear views are still larger relative to profiles, so this remains a concept sheet rather than continuity-locked animation frames.

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

Cherokee correction sources: design-proposals/cherokee-reference/. The website now uses a separate corrected foreground; the eight-angle sheet remains a planning artifact.
