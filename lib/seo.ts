import { translate, type Language } from './language.js';

// Confirmed production domain. Previews never become canonical search results.
export const siteOrigin = 'https://ciudadcars.com';
export const socialImage = '/cinema/cruze-aerial.jpg';
export const localizedRoutes = [
  { path: '/', en: '/en', label: 'Inicio' },
  { path: '/vehiculos', en: '/en/vehicles', label: 'Vehículos' },
  { path: '/servicios', en: '/en/services', label: 'Servicios' },
  { path: '/quienes-somos', en: '/en/about-us', label: 'Quiénes somos' },
  { path: '/contacto', en: '/en/contact', label: 'Contacto' },
] as const;

export function resolveLanguageRoute(pathname: string) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  const route = localizedRoutes.find(
    (item) => item.path === normalized || item.en === normalized,
  );
  if (!route) return null;
  return {
    path: route.path,
    language: (normalized === route.en ? 'en' : 'es') as Language,
  };
}

/** Only local page links change; assets, fragments and external destinations do not. */
export function localizedHref(href: string, language: Language) {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const [, pathname, suffix] = href.match(/^([^?#]*)(.*)$/)!;
  const route = localizedRoutes.find(
    (item) => item.path === pathname || item.en === pathname,
  );
  return route ? (language === 'en' ? route.en : route.path) + suffix : href;
}

export function pageUrl(path: string, language: Language) {
  return new URL(localizedHref(path, language), siteOrigin).href;
}

type PageCopy = { title: string; description: string };

export function createSeoMetadata(
  path: string,
  language: Language,
  copy: PageCopy,
) {
  const title = translate(copy.title, language);
  const description = translate(copy.description, language);
  const url = pageUrl(path, language);
  const image = {
    url: new URL(socialImage, siteOrigin).href,
    width: 1280,
    height: 720,
    alt:
      language === 'en'
        ? 'Ciudad Cars — Chevrolet Cruze in an illustrative aerial scene of Maracaibo'
        : 'Ciudad Cars — Chevrolet Cruze en una escena aérea ilustrativa de Maracaibo',
  };
  return {
    metadataBase: new URL(siteOrigin),
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        es: pageUrl(path, 'es'),
        en: pageUrl(path, 'en'),
        'x-default': pageUrl(path, 'es'),
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large' as const,
      },
    },
    openGraph: {
      type: 'website' as const,
      siteName: 'Ciudad Cars',
      title,
      description,
      url,
      locale: language === 'en' ? 'en_US' : 'es_VE',
      alternateLocale: [language === 'en' ? 'es_VE' : 'en_US'],
      images: [image],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: [image],
    },
  };
}

export function createStructuredData(
  path: string,
  language: Language,
  copy: PageCopy,
  company: { phone: string; email: string; directions: string },
) {
  const url = pageUrl(path, language);
  const name = translate(copy.title, language);
  const businessId = siteOrigin + '/#business';
  const websiteId = siteOrigin + '/#website';
  const route = localizedRoutes.find((item) => item.path === path);
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: translate('Inicio', language),
      item: pageUrl('/', language),
    },
    ...(path !== '/' && route
      ? [
          {
            '@type': 'ListItem',
            position: 2,
            name: translate(route.label, language),
            item: url,
          },
        ]
      : []),
  ];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AutoRental',
        '@id': businessId,
        name: 'Ciudad Cars',
        url: siteOrigin + '/',
        logo: siteOrigin + '/images/logo.png',
        image: siteOrigin + socialImage,
        telephone: company.phone,
        email: company.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Calle 70 entre Av. 4 y Av. 8, Bella Vista',
          addressLocality: 'Maracaibo',
          addressRegion: 'Zulia',
          addressCountry: 'VE',
        },
        hasMap: company.directions,
        areaServed: { '@type': 'City', name: 'Maracaibo' },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '18:00',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Saturday',
            opens: '08:00',
            closes: '12:00',
          },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: 'Ciudad Cars',
        url: siteOrigin + '/',
        inLanguage: ['es', 'en'],
        publisher: { '@id': businessId },
      },
      {
        '@type':
          path === '/contacto'
            ? 'ContactPage'
            : path === '/quienes-somos'
              ? 'AboutPage'
              : path === '/vehiculos'
                ? 'CollectionPage'
                : 'WebPage',
        '@id': url + '#webpage',
        url,
        name,
        description: translate(copy.description, language),
        inLanguage: language,
        isPartOf: { '@id': websiteId },
        about: { '@id': businessId },
        ...(path === '/' ? {} : { breadcrumb: { '@id': url + '#breadcrumb' } }),
      },
      ...(path === '/'
        ? []
        : [
            {
              '@type': 'BreadcrumbList',
              '@id': url + '#breadcrumb',
              itemListElement: breadcrumbs,
            },
          ]),
    ],
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
