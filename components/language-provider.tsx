'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { translate, type Language } from '@/lib/language';
import { pageCopy } from '@/lib/page-copy';
import { company } from '@/lib/company';
import {
  createSeoMetadata,
  createStructuredData,
  localizedHref,
  resolveLanguageRoute,
  serializeJsonLd,
} from '@/lib/seo';

type LanguageContextValue = {
  language: Language;
  toggleLanguage: () => void;
  t: (text: string) => string;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  const [language, setLanguage] = useState(initialLanguage);
  const pathname = usePathname();
  const value = useMemo(
    () => ({
      language,
      t: (text: string) => translate(text, language),
      toggleLanguage: () => {
        const next = language === 'es' ? 'en' : 'es';
        // Both languages have crawlable URLs. Replace the URL without remounting
        // the film or clearing forms; a reload renders the same language on the server.
        const href = location.pathname + location.search + location.hash;
        window.history.replaceState(
          window.history.state,
          '',
          localizedHref(href, next),
        );
        setLanguage(next);
      },
    }),
    [language],
  );

  useEffect(() => {
    const onPopState = () =>
      setLanguage(resolveLanguageRoute(location.pathname)?.language || 'es');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    if (['/ingresar', '/dashboard', '/reservar'].includes(pathname || '')) return;
    const path = resolveLanguageRoute(pathname || '/')?.path || '/';
    const copy = pageCopy[path];
    const metadata = createSeoMetadata(path, language, copy);
    document.title = metadata.title;
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', metadata.alternates.canonical);
    for (const [selector, content] of [
      ['meta[name="description"]', metadata.description],
      ['meta[property="og:title"]', metadata.title],
      ['meta[property="og:description"]', metadata.description],
      ['meta[property="og:url"]', metadata.openGraph.url],
      ['meta[property="og:locale"]', metadata.openGraph.locale],
      [
        'meta[property="og:locale:alternate"]',
        metadata.openGraph.alternateLocale[0],
      ],
      ['meta[property="og:image:alt"]', metadata.openGraph.images[0].alt],
      ['meta[name="twitter:title"]', metadata.title],
      ['meta[name="twitter:description"]', metadata.description],
      ['meta[name="twitter:image:alt"]', metadata.twitter.images[0].alt],
    ])
      document.querySelector(selector)?.setAttribute('content', content);
    const structuredData = document.getElementById(
      'ciudad-cars-structured-data',
    );
    if (structuredData)
      structuredData.textContent = serializeJsonLd(
        createStructuredData(path, language, copy, company),
      );
  }, [language, pathname]);

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage requires LanguageProvider');
  return value;
}
