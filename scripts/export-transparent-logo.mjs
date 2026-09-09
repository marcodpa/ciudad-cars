import sharp from 'sharp';

// Export the existing brand pixels with alpha; never redraw or retype the mark.
const { data, info } = await sharp('public/images/logo.png')
  .removeAlpha().raw().toBuffer({ resolveWithObject: true });
const background = [0, 51, 115];
const inks = [[255, 254, 253], [125, 176, 34]];
const rgba = Buffer.alloc(info.width * info.height * 4);
for (let pixel = 0; pixel < info.width * info.height; pixel++) {
  const color = [...data.subarray(pixel * 3, pixel * 3 + 3)];
  let best = { error: Infinity, alpha: 0, ink: inks[0] };
  for (const ink of inks) {
    const direction = ink.map((value, channel) => value - background[channel]);
    const difference = color.map((value, channel) => value - background[channel]);
    const alpha = Math.max(0, Math.min(1, difference.reduce((sum, value, channel) => sum + value * direction[channel], 0) / direction.reduce((sum, value) => sum + value * value, 0)));
    const error = difference.reduce((sum, value, channel) => sum + (value - alpha * direction[channel]) ** 2, 0);
    if (error < best.error) best = { error, alpha, ink };
  }
  const alpha = best.alpha < 0.07 ? 0 : best.alpha > 0.94 ? 1 : best.alpha;
  for (let channel = 0; channel < 3; channel++) {
    rgba[pixel * 4 + channel] = alpha === 0 ? 0 : alpha === 1 ? color[channel] : best.ink[channel];
  }
  rgba[pixel * 4 + 3] = Math.round(alpha * 255);
}
await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9 }).toFile('public/images/logo-transparent.png');
console.log('Transparent original logo exported:', info.width, '×', info.height);
