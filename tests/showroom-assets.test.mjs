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
  for (const suffix of ['', '-mobile']) {
    const background = await sharp(
      localImage(`/images/fleet-stage-background${suffix}.webp`),
    ).metadata();
    assert.deepEqual(
      [background.width, background.height],
      suffix ? [1008, 570] : [2016, 1140],
    );
    for (const car of fleet) {
      const cutout = await sharp(
        localImage(`/images/fleet-stage-${car.id}${suffix}.webp`),
      ).metadata();
      assert.equal(
        cutout.hasAlpha,
        true,
        car.id + ': no opaque checkerboard may replace the cutout',
      );
      assert.deepEqual(
        [cutout.width, cutout.height],
        [background.width, background.height],
      );
    }
  }
});

test('cutout borders and sky remain transparent while each vehicle retains opaque pixels', async () => {
  for (const car of fleet) {
    const { data, info } = await sharp(
      localImage(`/images/fleet-stage-${car.id}.webp`),
    )
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let opaque = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const alpha = data[(y * info.width + x) * 4 + 3];
        if (
          y < info.height / 10 ||
          y === info.height - 1 ||
          x === 0 ||
          x === info.width - 1
        )
          // Generated alpha has occasional one-level residuals (<0.4% opacity).
          assert.ok(alpha <= 1, car.id + ': backdrop leak');
        // Car interiors are near-opaque (typically 253), with soft edge/shadow alpha.
        if (alpha >= 250) opaque++;
      }
    }
    const coverage = opaque / (info.width * info.height);
    assert.ok(
      coverage > 0.1 && coverage < 0.6,
      car.id + ': expected a full car with transparent margins',
    );
  }
});
