# Opción elegida: B — Ficha lateral

El usuario eligió `b-ficha-lateral.png` y pidió añadir sombras a los vehículos para integrarlos mejor en el pavimento.

Implementación: `components/fleet-experience.tsx`, `app/showroom.css`, `components/vehicle-ground-shadow.tsx` y `lib/vehicle-shadows.ts`.

Se conservan el fondo completo, los cinco carros confirmados y el carrusel manual. Las sombras se dibujan como una capa independiente por vehículo, sin regenerar ni sustituir la escena.
