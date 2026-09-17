'use client';

import type { ComponentProps } from 'react';
import { useLanguage } from './language-provider';
import { localizedHref } from '@/lib/seo';

/** Native document navigation keeps links usable without the client router. */
export default function SiteLink({
  children,
  href,
  ...props
}: ComponentProps<'a'>) {
  const { language } = useLanguage();
  return (
    <a {...props} href={href ? localizedHref(href, language) : href}>
      {children}
    </a>
  );
}
