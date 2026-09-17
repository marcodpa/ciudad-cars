import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLanguage, translate } from '../lib/language.js';
import { prepareReservation } from '../lib/reservation.ts';
import { prepareContact } from '../lib/contact.ts';
import { fleet } from '../lib/fleet.ts';

test('language preference only accepts supported values and preserves names and inline spacing', () => {
  assert.equal(parseLanguage('en'), 'en');
  for (const value of [undefined, 'es', 'fr', 'EN'])
    assert.equal(parseLanguage(value), 'es');
  assert.equal(translate(' pasajeros ', 'en'), ' passengers ');
  assert.equal(translate('Económico', 'en'), 'Economy');
  assert.equal(translate('Jeep Cherokee', 'en'), 'Jeep Cherokee');
  assert.equal(translate('Tu viaje', 'es'), 'Tu viaje');
});

test('English booking requests keep the selected car, dates, price and rental duration', () => {
  const request = {
    pickup: '2026-09-20',
    dropoff: '2026-09-23',
    today: '2026-09-17',
    car: fleet[0],
  };
  const en = prepareReservation({ ...request, language: 'en' });
  assert.equal(en.days, 3);
  assert.match(
    en.message,
    /Mitsubishi Lancer or similar \(Economy\), from \$75\/day/,
  );
  assert.match(en.message, /Pickup: September 20, 2026/);
  assert.match(en.message, /Return: September 23, 2026/);
  assert.match(en.message, /Duration: 3 days/);
  assert.match(en.message, /confirm availability/);
  const es = prepareReservation({ ...request, language: 'es' });
  assert.match(es.message, /Retiro: 20 de septiembre de 2026/);
  assert.match(es.message, /Económico/);
  assert.equal(
    prepareReservation({ ...request, dropoff: request.pickup, language: 'en' })
      .error,
    'Return must be after the pickup date.',
  );
});

test('translated contact requests preserve user-authored text and canonical topic values', () => {
  const result = prepareContact(
    {
      name: 'María Test',
      email: '',
      topic: 'Alquiler de un vehículo',
      message: 'Quiero un carro del 20 al 23.\nDos personas.',
    },
    'en',
  );
  assert.match(result.message, /María Test/);
  assert.match(result.message, /Enquiry: Renting a vehicle/);
  assert.match(result.message, /Quiero un carro del 20 al 23.\nDos personas./);
  assert.equal(
    prepareContact({ name: '', email: '', topic: '', message: '' }, 'en').error,
    'Enter your name (between 2 and 100 characters).',
  );
});
