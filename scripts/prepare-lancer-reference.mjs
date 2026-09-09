import assert from 'node:assert/strict';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { vehicleShadows } from '../lib/vehicle-shadows.ts';

// Export imagegen's color pixels and, when supplied, its generated isolation matte.
// Shape/segmentation comes entirely from imagegen; this only applies that channel.
const [foregroundSource, heroSource, matteSource] = process.argv.slice(2);
assert.ok(
  foregroundSource && heroSource,
  'Provide the generated foreground and hero paths.',
);
const width = 1859;
const height = 846;
const folder = 'design-proposals/lancer-reference';
const prefix = 'public/images/lancer-reference';

const foregroundMetadata = await sharp(foregroundSource).metadata();
let foreground;
if (matteSource) {
  const matte = await sharp(matteSource)
    .resize(width, height, { fit: 'fill' })
    .removeAlpha()
    .greyscale()
    .raw()
    .toBuffer();
  const alpha = Buffer.from(
    matte.map((value) => (value <= 2 ? 0 : value >= 253 ? 255 : value)),
  );
  const rgb = await sharp(foregroundSource)
    .resize(width, height, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();
  // Remove neutral checkerboard fringes only inside the generated matte's edge
  // band. Preserve all interior pixels and the original warm/cool vehicle colors.
  const edgeOffsets = [
    [-16, 0],
    [16, 0],
    [0, -16],
    [0, 16],
    [-12, -12],
    [12, -12],
    [-12, 12],
    [12, 12],
  ];
  for (let y = 16; y < height - 16; y++) {
    for (let x = 16; x < width - 16; x++) {
      const pixel = y * width + x;
      if (!alpha[pixel]) continue;
      const channels = [rgb[pixel * 3], rgb[pixel * 3 + 1], rgb[pixel * 3 + 2]];
      const darkest = Math.min(...channels);
      const spread = Math.max(...channels) - darkest;
      if (darkest < 140 || spread >= 20) continue;
      if (
        edgeOffsets.some(([dx, dy]) => matte[(y + dy) * width + x + dx] < 128)
      ) {
        alpha[pixel] = Math.round(
          alpha[pixel] * Math.max(0, (spread - 8) / 12),
        );
      }
    }
  }
  const isolated = await sharp(rgb, { raw: { width, height, channels: 3 } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
  // Fit the generated car into the existing showroom canvas without distortion.
  foreground = await sharp(isolated)
    .resize(1199, 546)
    .extend({
      left: 310,
      right: 350,
      top: 248,
      bottom: 52,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
} else {
  assert.ok(
    foregroundMetadata.hasAlpha,
    'The foreground must have real generated transparency.',
  );
  foreground = await sharp(foregroundSource)
    .resize(width, height, { fit: 'fill' })
    .png()
    .toBuffer();
}
const { data, info } = await sharp(foreground)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
let opaque = 0;
let minX = width;
let minY = height;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const alpha = data[(y * width + x) * info.channels + info.channels - 1];
    if (y < height / 4 || y === height - 1 || x === 0 || x === width - 1) {
      assert.equal(
        alpha,
        0,
        'Backdrop or shadow leaks into the empty margins.',
      );
    }
    if (alpha === 255) opaque++;
    if (alpha > 220) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}
assert.ok(
  opaque / (width * height) > 0.1 && opaque / (width * height) < 0.4,
  'Expected a complete vehicle with transparent margins.',
);
const catalogBounds = {
  left: 0.5 + 1.85 * (minX / width - 0.5),
  right: 0.5 + 1.85 * (maxX / width - 0.5),
  top: 0.5 + ((1.85 * 1.65) / (width / height)) * (minY / height - 0.63),
  bottom: 0.5 + ((1.85 * 1.65) / (width / height)) * (maxY / height - 0.63),
};
assert.ok(
  Object.values(catalogBounds).every((value) => value >= 0 && value <= 1),
  'Car would be cropped by the catalog frame.',
);
const heroMetadata = await sharp(heroSource).metadata();
assert.ok(
  Math.abs(heroMetadata.width / heroMetadata.height - width / height) < 0.04,
  'Hero must preserve the wide framing.',
);
const hero = await sharp(heroSource)
  .resize(width, height, { fit: 'fill' })
  .png()
  .toBuffer();

await mkdir(folder, { recursive: true });
await copyFile(foregroundSource, folder + '/generated-foreground.png');
await copyFile(heroSource, folder + '/generated-hero.png');
if (matteSource)
  await copyFile(matteSource, folder + '/generated-isolation-matte.png');
await writeFile(prefix + '-cutout.png', foreground);
await sharp(foreground)
  .webp({ lossless: true })
  .toFile(prefix + '-cutout.webp');
await sharp(foreground)
  .extractChannel('alpha')
  .png()
  .toFile(prefix + '-alpha.png');
// Save the same three layers rendered by the website: unchanged backdrop,
// existing SVG tire shadows, and the generated color foreground.
const shadow = vehicleShadows.lancer;
const [cx, cy, rx, ry, angle] = shadow.body;
const shadowSvg =
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
<radialGradient id="ambient"><stop offset="0" stop-color="#07141d" stop-opacity=".62"/><stop offset=".5" stop-color="#07141d" stop-opacity=".38"/><stop offset="1" stop-color="#07141d" stop-opacity="0"/></radialGradient>
<radialGradient id="contact"><stop offset="0" stop-color="#050e14" stop-opacity=".94"/><stop offset=".38" stop-color="#050e14" stop-opacity=".76"/><stop offset="1" stop-color="#050e14" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${angle} ${cx} ${cy})" fill="url(#ambient)"/>
${shadow.tires.map(([x, y, w, h]) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="url(#contact)"/>`).join('')}
</svg>`);
await sharp('public/images/showroom-background.webp')
  .composite([{ input: shadowSvg }, { input: foreground }])
  .webp({ quality: 90 })
  .toFile(prefix + '-showroom.webp');
await sharp(hero)
  .webp({ quality: 90 })
  .toFile(prefix + '-scene.webp');
const crop = { left: 540, top: 220, width: 1300, height: 626 };
await sharp(hero)
  .extract(crop)
  .resize(1080, 520)
  .webp({ quality: 87 })
  .toFile(prefix + '-mobile.webp');
await sharp(hero)
  .extract(crop)
  .resize(480)
  .webp({ quality: 84 })
  .toFile(prefix + '-thumb.webp');
const verification = {
  canvas: { width, height },
  realAlpha: (await sharp(foreground).metadata()).hasAlpha,
  generatedForegroundHadAlpha: foregroundMetadata.hasAlpha,
  matteSource: matteSource || null,
  exportMethod: matteSource
    ? 'Generated matte applied to original colored foreground, neutral checkerboard fringe removed in the matte edge band; resized and padded to match showroom canvas.'
    : 'Generated alpha preserved.',
  opaqueCoverage: opaque / (width * height),
  vehicleBounds: { minX, minY, maxX, maxY },
  catalogBounds,
  foregroundSource,
  heroSource,
};
await writeFile(
  folder + '/EXPORT-VERIFICATION.json',
  JSON.stringify(verification, null, 2) + '\n',
);
console.log(JSON.stringify(verification, null, 2));
