import test from 'node:test';
import assert from 'node:assert/strict';
import { fleet } from '../lib/fleet.ts';
import { defaultFilters, filterFleet } from '../lib/catalog.ts';
import { contactTopics, prepareContact } from '../lib/contact.ts';
import { vehicleReservation } from '../lib/company.ts';

test('capacity and category filters combine without changing the confirmed inventory', () => {
  const originalOrder = fleet.map((car) => car.id);
  assert.deepEqual(
    filterFleet(fleet, { ...defaultFilters, passengers: 7 }).map(
      (car) => car.id,
    ),
    ['explorer'],
  );
  assert.equal(
    filterFleet(fleet, {
      ...defaultFilters,
      passengers: 7,
      category: 'Económico',
    }).length,
    0,
  );
  assert.deepEqual(
    filterFleet(fleet, { ...defaultFilters, sort: 'price-desc' }).map(
      (car) => car.price,
    ),
    [160, 130, 110, 85, 75],
  );
  assert.equal(filterFleet(fleet, defaultFilters).length, 5);
  assert.deepEqual(
    fleet.map((car) => car.id),
    originalOrder,
  );
});

test('each vehicle reservation preserves its price and model in the WhatsApp message', () => {
  for (const car of fleet) {
    const url = new URL(vehicleReservation(car));
    assert.equal(url.origin + url.pathname, 'https://wa.me/584146511446');
    assert.ok(
      url.searchParams
        .get('text')
        .includes(car.make + ' ' + car.model + ' o similar'),
    );
    assert.ok(url.searchParams.get('text').includes('$' + car.price + '/día'));
  }
});

const request = {
  name: '  María Pérez  ',
  email: '',
  topic: contactTopics[0],
  message: 'Necesito un carro para cinco personas.',
};
test('contact requests trim names and preserve accents, line breaks and visitor intent', () => {
  const result = prepareContact(request);
  assert.ok('message' in result);
  assert.ok(result.message.startsWith('Hola, Ciudad Cars. Soy María Pérez.'));
  assert.ok(result.message.endsWith(request.message));
  assert.ok(!result.message.includes('Mi correo:'));
  const withEmail = prepareContact({
    ...request,
    email: ' viajero@example.com ',
  });
  assert.ok(withEmail.message.includes('Mi correo: viajero@example.com'));
});

test('empty, invalid or oversized contact data cannot produce a ready-to-send message', () => {
  for (const invalid of [
    { name: '  ' },
    { email: 'not an email' },
    { topic: 'Unknown' },
    { message: '   ' },
    { message: 'x'.repeat(2001) },
  ]) {
    assert.ok('error' in prepareContact({ ...request, ...invalid }));
  }
});
