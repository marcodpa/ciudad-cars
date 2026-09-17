import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFrameBuffer,
  selectReadyFrame,
} from '../lib/cinematic-frames.js';

const settle = () => new Promise((resolve) => setImmediate(resolve));
const frames = (...indices) => new Map(indices.map((frame) => [frame, {}]));

test('late frames cannot reverse playback, overshoot, or substitute the other scene', () => {
  assert.equal(selectReadyFrame(frames(39, 43, 46), 45, 42, 1, 188), 43);
  assert.equal(selectReadyFrame(frames(39, 46), 45, 42, 1, 188), null);
  assert.equal(selectReadyFrame(frames(40, 43, 47), 41, 45, -1, 188), 43);
  assert.equal(selectReadyFrame(frames(184, 202), 200, 184, 1, 188), null);
  assert.equal(selectReadyFrame(frames(189, 202), 200, 184, 1, 188), 189);
  assert.equal(selectReadyFrame(frames(180, 189), 182, 200, -1, 188), null);
});

test('reverse scrolling reuses compressed frames while decoded memory stays bounded', async () => {
  const downloads = new Map();
  const released = [];
  const buffer = createFrameBuffer({
    count: 24,
    capacity: 6,
    onReady() {},
    load: async (frame) => {
      downloads.set(frame, (downloads.get(frame) || 0) + 1);
      return frame;
    },
    decode: async (frame) => ({ close: () => released.push(frame) }),
  });
  buffer.request(0, 1);
  buffer.setActive(true);
  await settle();
  assert.equal(downloads.size, 24);
  assert.equal(buffer.decoded.size, 6);
  assert.ok(buffer.decoded.has(0));
  assert.ok(buffer.decoded.has(5));
  buffer.request(23, -1);
  await settle();
  assert.equal(buffer.decoded.size, 6);
  assert.ok(buffer.decoded.has(23));
  buffer.request(0, 1);
  await settle();
  assert.ok(buffer.decoded.has(0));
  assert.ok([...downloads.values()].every((value) => value === 1));
  assert.ok(released.includes(0));
  buffer.dispose();
  assert.equal(buffer.decoded.size, 0);
});

test('save-data loading remains local and disposal releases in-flight decodes', async () => {
  const downloads = [];
  const resolvers = [];
  let closed = 0;
  let ready = 0;
  const buffer = createFrameBuffer({
    count: 376,
    capacity: 4,
    warm: false,
    onReady: () => ready++,
    load: async (frame) => {
      downloads.push(frame);
      return frame;
    },
    decode: () => new Promise((resolve) => resolvers.push(resolve)),
  });
  buffer.request(100, 1);
  await settle();
  assert.equal(downloads.length, 0);
  buffer.setActive(true);
  await settle();
  assert.equal(downloads[0], 100);
  assert.equal(downloads.length, 4);
  assert.equal(resolvers.length, 2);
  buffer.dispose();
  resolvers.forEach((resolve) => resolve({ close: () => closed++ }));
  await settle();
  assert.equal(closed, 2);
  assert.equal(ready, 0);
  assert.equal(buffer.decoded.size, 0);
});
