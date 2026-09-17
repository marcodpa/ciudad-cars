import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const media = new URL('../public/cinema/', import.meta.url);
const metadata = JSON.parse(
  await readFile(new URL('film.json', media), 'utf8'),
);

test('every frame and lightweight seek preview required by the intro is shipped', async () => {
  assert.equal(metadata.frames, 376);
  assert.equal(metadata.fps, 24);
  assert.ok(metadata.transition.start < metadata.cut);
  assert.ok(metadata.cut < metadata.transition.end);
  assert.ok(metadata.transition.end < metadata.frames);
  for (const [folder, count] of [
    ['frames', metadata.frames],
    ['previews', Math.ceil(metadata.frames / metadata.fps)],
  ]) {
    const actual = (await readdir(new URL(folder + '/', media))).sort();
    const expected = Array.from(
      { length: count },
      (_, index) => `${String(index + 1).padStart(4, '0')}.webp`,
    );
    assert.deepEqual(
      actual,
      expected,
      folder + ' has no gaps or unexpected files',
    );
  }
});

test('the integrated intro uses the exact approved media bytes, without transcoding or substitute images', async () => {
  const manifest = JSON.parse(
    await readFile(
      new URL('../docs/cinematic-intro-assets.json', import.meta.url),
      'utf8',
    ),
  );
  for (const asset of manifest.assets) {
    const bytes = await readFile(new URL(asset.file, media));
    assert.equal(bytes.length, asset.bytes, asset.file + ': size');
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      asset.sha256,
      asset.file + ': content',
    );
  }
});
