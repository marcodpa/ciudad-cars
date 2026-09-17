import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { fleet } from '../lib/fleet.ts';

const localImage = (src) =>
  new URL('../public' + src, import.meta.url).pathname.replace(
    /^\/([A-Za-z]:)/,
    '$1',
  );

test('all final foregrounds have real alpha and match the complete background canvas', async () => {
  const background = await sharp(
    localImage('/images/showroom-background.webp'),
  ).metadata();
  assert.deepEqual([background.width, background.height], [1859, 846]);
  for (const car of fleet) {
    const photo = await sharp(localImage(car.showroomScene)).metadata();
    const cutout = await sharp(localImage(car.showroomCutout)).metadata();
    assert.equal(
      cutout.hasAlpha,
      true,
      car.id + ': no opaque checkerboard may replace the cutout',
    );
    assert.deepEqual(
      [photo.width, photo.height],
      [background.width, background.height],
    );
    assert.deepEqual(
      [cutout.width, cutout.height],
      [background.width, background.height],
    );
  }
});

test('cutout borders and sky remain transparent while each vehicle retains opaque pixels', async () => {
  for (const car of fleet) {
    const { data, info } = await sharp(localImage(car.showroomCutout))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let opaque = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const alpha = data[(y * info.width + x) * 4 + 3];
        if (
          y < info.height / 4 ||
          y === info.height - 1 ||
          x === 0 ||
          x === info.width - 1
        )
          assert.equal(alpha, 0, car.id + ': backdrop leak');
        if (alpha === 255) opaque++;
      }
    }
    const coverage = opaque / (info.width * info.height);
    assert.ok(
      coverage > 0.1 && coverage < 0.4,
      car.id + ': expected a full car with transparent margins',
    );
  }
});
