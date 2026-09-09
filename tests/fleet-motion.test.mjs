import test from 'node:test';
import assert from 'node:assert/strict';
import { clampPosition } from '../lib/fleet-motion.ts';
import { fleet } from '../lib/fleet.ts';

test('the confirmed fleet replaces all four earlier example vehicles and prices', () => {
  assert.deepEqual(
    fleet.map((c) => [c.make, c.model, c.price, c.passengers, c.bags, c.doors]),
    [
      ['Mitsubishi', 'Lancer', 75, 5, 2, 4],
      ['Chevrolet', 'Cruze', 85, 5, 2, 4],
      ['Toyota', 'Camry', 110, 5, 3, 4],
      ['Jeep', 'Cherokee', 130, 5, 3, 4],
      ['Ford', 'Explorer', 160, 7, 4, 4],
    ],
  );
});

test('direct selection is clamped at fleet boundaries', () => {
  assert.equal(clampPosition(-1, 5), 0);
  assert.equal(clampPosition(5, 5), 4);
  assert.equal(clampPosition(NaN, 5), 0);
});
