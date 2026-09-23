import assert from 'node:assert/strict';
import { localizedRoutes, pageUrl, siteOrigin } from '../lib/seo.ts';
import { homeFaq, googleReviews } from '../lib/home-content.js';

const origin = process.argv[2] || 'http://127.0.0.1:3002';
const attributes = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [
      key.toLowerCase(),
      value,
    ]),
  );
const tags = (html, tag) =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((match) =>
    attributes(match[0]),
  );

for (const route of localizedRoutes)
  for (const language of ['es', 'en']) {
    const path = language === 'es' ? route.path : route.en;
    // An opposite-language cookie must never change what a canonical URL serves.
    const response = await fetch(origin + path, {
      headers: {
        Cookie: `ciudad-cars-language=${language === 'en' ? 'es' : 'en'}`,
      },
    });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.equal(tags(html, 'html')[0].lang, language, `${path}: language`);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${path}: one H1`);
    assert.match(html, /<title>[^<]+<\/title>/, path);
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/)?.[1] || '';
    const meta = tags(head, 'meta');
    assert.ok(
      meta.find((item) => item.name === 'description')?.content.length > 70,
      `${path}: description`,
    );
    assert.ok(
      !meta.some(
        (item) =>
          /robots|googlebot/.test(item.name || '') &&
          /noindex/.test(item.content),
      ),
      `${path}: indexable`,
    );
    const links = tags(head, 'link');
    const canonicals = links.filter((item) => item.rel === 'canonical');
    assert.equal(canonicals.length, 1, `${path}: one canonical`);
    assert.equal(
      new URL(canonicals[0].href).href,
      pageUrl(route.path, language),
      `${path}: canonical`,
    );
    for (const locale of ['es', 'en'])
      assert.equal(
        new URL(links.find((item) => item.hreflang === locale)?.href).href,
        pageUrl(route.path, locale),
        `${path}: ${locale} alternate`,
      );
    const data = JSON.parse(
      html.match(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
      )?.[1] || 'null',
    );
    assert.ok(
      data?.['@graph'].some((item) => item['@type'] === 'AutoRental'),
      `${path}: business data`,
    );
    const faq = data['@graph'].find((item) => item['@type'] === 'FAQPage');
    if (route.path === '/') {
      const details = [
        ...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g),
      ].map((match) => match[1]);
      assert.equal(faq.mainEntity.length, homeFaq[language].length);
      for (const item of homeFaq[language]) {
        assert.ok(
          details.some(
            (text) =>
              text.includes(item.question) && text.includes(item.answer),
          ),
          `${path}: FAQ is server-rendered and readable without JavaScript`,
        );
        assert.ok(
          faq.mainEntity.some(
            (question) =>
              question.name === item.question &&
              question.acceptedAnswer.text === item.answer,
          ),
        );
      }
      for (const review of googleReviews.reviews) {
        assert.ok(
          tags(html, 'a').some((link) => link.href === review.url),
          `${path}: original review link`,
        );
      }
    } else assert.equal(faq, undefined, `${path}: no unrelated FAQ schema`);
    assert.ok(
      !JSON.stringify(data).includes('aggregateRating'),
      `${path}: no self-serving review markup`,
    );
    assert.ok(
      data['@graph'].some(
        (item) =>
          item.url === pageUrl(route.path, language) &&
          item.inLanguage === language,
      ),
      `${path}: page data`,
    );
    assert.equal(
      new URL(meta.find((item) => item.property === 'og:url')?.content).href,
      pageUrl(route.path, language),
      `${path}: Open Graph URL`,
    );
    const languageLink = tags(html, 'a').find(
      (item) => item.hreflang === (language === 'en' ? 'es' : 'en'),
    );
    assert.equal(
      languageLink?.href,
      language === 'en' ? route.path : route.en,
      `${path}: crawlable language link`,
    );
    console.log(
      `PASS ${path}: SSR, language, canonical, hreflang, metadata, structured data`,
    );
  }
const robots = await fetch(origin + '/robots.txt');
assert.equal(robots.status, 200);
assert.match(
  await robots.text(),
  new RegExp(`Sitemap: ${siteOrigin.replaceAll('.', '\\.')}/sitemap.xml`),
);
const sitemap = await fetch(origin + '/sitemap.xml');
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
assert.equal([...xml.matchAll(/<loc>/g)].length, 10);
for (const { path } of localizedRoutes)
  for (const language of ['es', 'en'])
    assert.ok(xml.includes(`<loc>${pageUrl(path, language)}</loc>`));
assert.equal((await fetch(origin + '/page-that-does-not-exist')).status, 404);
for (const [oldPath, newPath] of [
  ['/about-us/', '/quienes-somos'],
  ['/contact-us/', '/contacto'],
  ['/service/', '/servicios'],
  ['/date-reservation/', '/vehiculos'],
]) {
  let destination = new URL(oldPath, origin);
  for (let hop = 0; hop < 3 && destination.pathname !== newPath; hop++) {
    const response = await fetch(destination, { redirect: 'manual' });
    assert.equal(response.status, 308, oldPath);
    destination = new URL(response.headers.get('location'), destination);
    assert.equal(destination.origin, origin, oldPath);
  }
  assert.equal(destination.pathname, newPath, oldPath);
}
console.log('PASS robots.txt, sitemap.xml (10 URLs), real 404 responses');
