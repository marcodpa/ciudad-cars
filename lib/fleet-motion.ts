/** Bounds for manual carousel selection. Positions 0..4 represent the vehicles. */
export function clampPosition(position: number, count: number) {
  return Math.max(
    0,
    Math.min(count - 1, Number.isFinite(position) ? position : 0),
  );
}
