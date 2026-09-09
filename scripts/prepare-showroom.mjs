import fs from 'node:fs/promises';
import sharp from 'sharp';

const manifest = JSON.parse(await fs.readFile(new URL('../SHOWROOM-ASSETS.json', import.meta.url), 'utf8'));
const root = new URL('../', import.meta.url);
const { width, height } = manifest.canvas;
// Only format/size optimization. Scene edits and masks come from imagegen.
await sharp(manifest.background.source).resize(width, height, { fit: 'fill' }).webp({ quality: 90 }).toFile(new URL(manifest.background.output, root).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
for (const scene of manifest.scenes) {
  const before = await sharp(scene.source).metadata();
  const matte = await sharp(scene.maskSource).metadata();
  await sharp(scene.source).resize(width, height, { fit: 'fill' }).webp({ quality: 90 }).toFile(new URL(scene.output, root).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  await sharp(scene.maskSource).resize(width, height, { fit: 'fill' }).webp({ lossless: true }).toFile(new URL(scene.maskOutput, root).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  console.log(`${scene.id}: source ${before.width}×${before.height}; matte ${matte.width}×${matte.height}; common frame ${width}×${height}`);
}
