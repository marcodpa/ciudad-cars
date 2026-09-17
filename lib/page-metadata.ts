import { headers } from 'next/headers';
import type { Language } from './language';
import { pageCopy } from './page-copy';
import { createSeoMetadata, resolveLanguageRoute } from './seo';

export async function requestRoute() {
  const requestHeaders = await headers();
  return (
    resolveLanguageRoute(requestHeaders.get('x-ciudad-cars-path') || '/') ?? {
      path: '/',
      language: 'es' as const,
    }
  );
}

export function localizedMetadata(path: string, language: Language = 'es') {
  return createSeoMetadata(path, language, pageCopy[path]);
}
