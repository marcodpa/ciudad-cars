import sharp from 'sharp';
import { copyFile, mkdir } from 'node:fs/promises';
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/prepare-images.mjs <directory containing scene-*-v3.png>');
await mkdir('public/images', { recursive: true });
await Promise.all(['lancer','cruze','camry','cherokee','explorer'].map(async name => {
  const input = source + '/scene-' + name + '-v3.png';
  const full = await sharp(input).resize({width:1860,withoutEnlargement:true}).webp({quality:86}).toFile('public/images/' + name + '-scene.webp');
  const crop = {left:540,top:220,width:1300,height:626};
  const mobile = await sharp(input).extract(crop).resize({width:1080}).webp({quality:84}).toFile('public/images/' + name + '-mobile.webp');
  const thumb = await sharp(input).extract(crop).resize({width:480}).webp({quality:80}).toFile('public/images/' + name + '-thumb.webp');
  console.log(name, {full:full.size,mobile:mobile.size,thumb:thumb.size});
}));
await copyFile(source + '/vehicle-scene-prompts-v3.json', 'VEHICLE-IMAGE-PROMPTS.json');
await copyFile(source + '/vehicle-scene-verification-v3.json', 'VEHICLE-IMAGE-VERIFICATION.json');
