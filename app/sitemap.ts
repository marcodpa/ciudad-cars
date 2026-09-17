import type { MetadataRoute } from 'next';
import { localizedRoutes, pageUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return localizedRoutes.flatMap(({ path }) =>
    (['es', 'en'] as const).map((language) => ({
      url: pageUrl(path, language),
      alternates: {
        languages: {
          es: pageUrl(path, 'es'),
          en: pageUrl(path, 'en'),
          'x-default': pageUrl(path, 'es'),
        },
      },
    })),
  );
}
