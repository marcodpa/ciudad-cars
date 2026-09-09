/** Ground contact coordinates on the original 1859 × 846 vehicle canvas. */
export const vehicleShadows: Record<
  string,
  {
    body: [number, number, number, number, number];
    tires: [number, number, number, number][];
  }
> = {
  lancer: {
    body: [900, 718, 443, 64, -4],
    tires: [
      [923, 763, 68, 16],
      [1249, 679, 52, 12],
      [593, 724, 62, 13],
    ],
  },
  cruze: {
    body: [877, 700, 457, 67, -3],
    tires: [
      [904, 737, 73, 15],
      [1264, 691, 55, 12],
      [544, 707, 65, 12],
    ],
  },
  camry: {
    body: [907, 715, 460, 67, -3],
    tires: [
      [887, 755, 73, 16],
      [1270, 703, 57, 13],
      [568, 722, 70, 13],
    ],
  },
  cherokee: {
    body: [868, 704, 445, 67, -4],
    tires: [
      [909, 744, 75, 18],
      [1210, 687, 54, 13],
      [550, 711, 70, 13],
    ],
  },
  explorer: {
    body: [865, 702, 445, 67, -3],
    tires: [
      [885, 744, 82, 18],
      [1226, 685, 60, 13],
      [550, 710, 75, 13],
    ],
  },
};
