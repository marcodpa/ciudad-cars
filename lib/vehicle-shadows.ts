/** Ground contact coordinates on the original 1859 × 846 vehicle canvas. */
export const vehicleShadows: Record<
  string,
  {
    body: [number, number, number, number, number];
    tires: [number, number, number, number][];
  }
> = {
  lancer: {
    body: [950, 706, 450, 64, -5],
    tires: [
      [978, 758, 69, 16],
      [1324, 665, 49, 12],
      [559, 706, 61, 13],
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
    body: [929, 718, 437, 65, -4],
    tires: [
      [912, 758, 74, 16],
      [1281, 691, 58, 13],
      [592, 711, 70, 13],
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
