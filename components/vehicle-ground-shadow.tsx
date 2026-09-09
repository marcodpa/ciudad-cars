import { vehicleShadows } from '@/lib/vehicle-shadows';

export function VehicleGroundShadow({
  vehicleId,
  instance,
}: {
  vehicleId: string;
  instance: 'scene' | 'thumb' | 'catalog';
}) {
  const shadow = vehicleShadows[vehicleId];
  if (!shadow) return null;
  const key = 'ground-' + instance + '-' + vehicleId;
  const [cx, cy, rx, ry, angle] = shadow.body;
  return (
    <svg
      className="drive-ground-shadow"
      viewBox="0 0 1859 846"
      width="1859"
      height="846"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={key + '-ambient'}>
          <stop offset="0" stopColor="#07141d" stopOpacity="0.62" />
          <stop offset="0.5" stopColor="#07141d" stopOpacity="0.38" />
          <stop offset="1" stopColor="#07141d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={key + '-contact'}>
          <stop offset="0" stopColor="#050e14" stopOpacity="0.94" />
          <stop offset="0.38" stopColor="#050e14" stopOpacity="0.76" />
          <stop offset="1" stopColor="#050e14" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        transform={'rotate(' + angle + ' ' + cx + ' ' + cy + ')'}
        fill={'url(#' + key + '-ambient)'}
      />
      {shadow.tires.map(([x, y, width, height], index) => (
        <ellipse
          key={index}
          cx={x}
          cy={y}
          rx={width}
          ry={height}
          fill={'url(#' + key + '-contact)'}
        />
      ))}
    </svg>
  );
}
