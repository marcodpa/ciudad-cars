import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSeoMetadata,
  createStructuredData,
  localizedHref,
  localizedRoutes,
  pageUrl,
  resolveLanguageRoute,
  serializeJsonLd,
  siteOrigin,
} from '../lib/seo.ts';
import { pageCopy } from '../lib/page-copy.ts';
import { company } from '../lib/company.ts';
import { legacyNavigationDestination } from '../lib/navigation.ts';

test('each language has its own stable URL and reciprocal canonical/hreflang metadata', () => {
  const urls = new Set();
  for (const { path, en } of localizedRoutes) {
    assert.deepEqual(resolveLanguageRoute(path), { path, language: 'es' });
    assert.deepEqual(resolveLanguageRoute(en), { path, language: 'en' });
    for (const language of ['es', 'en']) {
      const meta = createSeoMetadata(path, language, pageCopy[path]);
      assert.equal(meta.alternates.canonical, pageUrl(path, language));
      assert.equal(meta.alternates.languages.es, siteOrigin + path);
      assert.equal(meta.alternates.languages.en, siteOrigin + en);
      assert.equal(meta.alternates.languages['x-default'], siteOrigin + path);
      assert.equal(meta.openGraph.url, meta.alternates.canonical);
      assert.equal(meta.openGraph.title, meta.title);
      assert.equal(meta.twitter.description, meta.description);
      assert.ok(meta.title.length > 15 && meta.description.length > 70);
      assert.equal(meta.robots.index, true);
      urls.add(meta.alternates.canonical);
    }
  }
  assert.equal(urls.size, 10);
});

test('language navigation preserves fragments and query strings without changing assets or unknown routes', () => {
  assert.equal(
    localizedHref('/vehiculos?category=SUV#flota', 'en'),
    '/en/vehicles?category=SUV#flota',
  );
  assert.equal(localizedHref('/en/vehicles#flota', 'es'), '/vehiculos#flota');
  assert.equal(localizedHref('/#flota', 'en'), '/en#flota');
  for (const url of [
    '#flota',
    '/cinema/film.json',
    '/images/logo.png',
    'https://example.com/vehiculos',
    '//example.com/vehiculos',
    '/unknown',
  ])
    assert.equal(localizedHref(url, 'en'), url);
  assert.equal(resolveLanguageRoute('/unknown'), null);
});

test('business schema matches real contact data and breadcrumbs describe the current page', () => {
  const data = createStructuredData(
    '/contacto',
    'en',
    pageCopy['/contacto'],
    company,
  );
  const business = data['@graph'].find(
    (item) => item['@type'] === 'AutoRental',
  );
  assert.equal(business.telephone, company.phone);
  assert.equal(business.email, company.email);
  assert.equal(business.address.addressLocality, 'Maracaibo');
  assert.equal('aggregateRating' in business, false);
  assert.equal('geo' in business, false);
  const page = data['@graph'].find((item) => item['@type'] === 'ContactPage');
  assert.equal(page.inLanguage, 'en');
  assert.equal(page.url, 'https://ciudadcars.com/en/contact');
  const breadcrumbs = data['@graph'].find(
    (item) => item['@type'] === 'BreadcrumbList',
  );
  assert.deepEqual(
    breadcrumbs.itemListElement.map((item) => item.name),
    ['Home', 'Contact'],
  );
  assert.equal(
    JSON.parse(serializeJsonLd({ name: '</script><script>alert(1)</script>' }))
      .name,
    '</script><script>alert(1)</script>',
  );
  assert.equal(serializeJsonLd({ name: '</script>' }).includes('<'), false);
});

test('existing public page URLs retain permanent destinations in the redesign', () => {
  for (const [oldPath, newPath] of [
    ['/about-us/', '/quienes-somos'],
    ['/contact-us/', '/contacto'],
    ['/service/', '/servicios'],
    ['/date-reservation/', '/vehiculos'],
  ])
    assert.equal(legacyNavigationDestination(oldPath), newPath);
  assert.equal(legacyNavigationDestination('/en/about-us'), null);
});
