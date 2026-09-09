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
        <nav className="breadcrumbs" aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link>
          <ArrowRight size={12} />
          <span aria-current="page">{label}</span>
        </nav>
        <p className="eyebrow">CIUDAD CARS · MARACAIBO</p>
        <h1>
          {title}
          <br />
          <span>{accent}</span>
        </h1>
        <p className="page-intro-description">{description}</p>
      </div>
    </section>
  );
}
