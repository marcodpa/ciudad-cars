'use client';
import { useLanguage } from '@/components/language-provider';
/* Preoptimized local assets retain their reserved dimensions and transparent pixels. */
/* eslint-disable next/no-img-element */
import Link from '@/components/site-link';
import { ArrowRight } from 'lucide-react';

export function PageIntro({
  label,
  title,
  accent,
  description,
  image = '/images/maracaibo-dusk.webp',
  compact = false,
}: {
  label: string;
  title: string;
  accent: string;
  description: string;
  image?: string;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <section className={'page-intro' + (compact ? ' page-intro-compact' : '')}>
      <img
        className="page-intro-backdrop"
        src={image}
        width="1860"
        height="846"
        alt=""
        fetchPriority="high"
      />
      <div className="page-width page-intro-content">
        <nav className="breadcrumbs" aria-label={t('Ruta de navegación')}>
          <Link href="/">{t('Inicio')}</Link>
          <ArrowRight size={12} />
          <span aria-current="page">{t(label)}</span>
        </nav>
        <p className="eyebrow">CIUDAD CARS · MARACAIBO</p>
        <h1>
          {t(title)}
          <br />
          <span>{t(accent)}</span>
        </h1>
        <p className="page-intro-description">{t(description)}</p>
      </div>
    </section>
  );
}
