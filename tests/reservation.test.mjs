import test from 'node:test';
import assert from 'node:assert/strict';
import { fleet } from '../lib/fleet.ts';
import { whatsappUrl } from '../lib/company.ts';
import {
  calendarDate,
  calendarValue,
  prepareReservation,
  todayInMaracaibo,
} from '../lib/reservation.ts';

const dates = {
  pickup: '2026-09-20',
  dropoff: '2026-09-23',
  today: '2026-09-17',
};

test('the WhatsApp request includes the exact car and readable dates without confirming availability', () => {
  for (const car of fleet) {
    const result = prepareReservation({ ...dates, car });
    assert.equal(result.days, 3);
    const url = new URL(whatsappUrl(result.message));
    assert.equal(url.origin + url.pathname, 'https://wa.me/584146511446');
    const message = url.searchParams.get('text');
    assert.ok(message.includes(`${car.make} ${car.model} o similar`));
    assert.ok(message.includes(`desde $${car.price}/día`));
    assert.ok(message.includes('Retiro: 20 de septiembre de 2026.'));
    assert.ok(message.includes('Devolución: 23 de septiembre de 2026.'));
    assert.ok(message.includes('¿Me confirman disponibilidad y tarifa'));
  }
});

test('dates reject missing, impossible, past, reversed and same-day ranges', () => {
  for (const override of [
    { pickup: '' },
    { dropoff: '' },
    { pickup: '2026-02-30' },
    { pickup: '2026-9-20' },
    { pickup: '2026-09-16' },
    { dropoff: dates.pickup },
    { dropoff: '2026-09-19' },
  ])
    assert.ok('error' in prepareReservation({ ...dates, ...override }));
});

test('calendar dates round-trip and rental days cross months, years and leap days', () => {
  assert.equal(calendarValue(calendarDate('2028-02-29')), '2028-02-29');
  assert.equal(calendarDate('2027-02-29'), undefined);
  assert.equal(
    prepareReservation({
      pickup: '2028-02-28',
      dropoff: '2028-03-01',
      today: dates.today,
    }).days,
    2,
  );
  const result = prepareReservation({
    pickup: '2026-12-31',
    dropoff: '2027-01-01',
    today: dates.today,
  });
  assert.equal(result.days, 1);
  assert.ok(result.message.includes('Duración: 1 día.'));
  assert.ok(result.message.includes('ayudaran a elegir un vehículo'));
});

test('the earliest booking date uses Maracaibo even around UTC midnight', () => {
  assert.equal(
    todayInMaracaibo(new Date('2026-09-18T02:00:00Z')),
    '2026-09-17',
  );
  assert.equal(
    todayInMaracaibo(new Date('2026-09-18T04:00:00Z')),
    '2026-09-18',
  );
});
