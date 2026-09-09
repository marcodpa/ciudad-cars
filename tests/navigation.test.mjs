import test from 'node:test';
import assert from 'node:assert/strict';
import {
  siteNavigation,
  legacyNavigationDestination,
} from '../lib/navigation.ts';

test('the broken label URL resolves to the actual about page', () => {
  assert.equal(
    legacyNavigationDestination('/Qui%C3%A9nes%20somos'),
    '/quienes-somos',
  );
  assert.equal(legacyNavigationDestination('/Quiénes somos'), '/quienes-somos');
  assert.equal(
    legacyNavigationDestination('/Quienes%20somos'),
    '/quienes-somos',
  );
});

test('all menu labels recover their actual page without redirecting canonical routes', () => {
  for (const { label, href } of siteNavigation) {
    assert.equal(
      legacyNavigationDestination('/' + encodeURIComponent(label)),
      href,
    );
    assert.equal(legacyNavigationDestination(href), null);
  }
});

test('navigation recovery leaves assets, unknown routes and malformed URLs alone', () => {
  for (const path of [
    '/images/logo.png',
    '/_next/static/app.js',
    '/desconocido',
    '/%invalid',
  ]) {
    assert.equal(legacyNavigationDestination(path), null);
  }
});
