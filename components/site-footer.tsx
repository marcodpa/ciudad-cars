'use client';
import { useLanguage } from '@/components/language-provider';
import { usePathname } from 'next/navigation';
/* Preoptimized local assets retain their reserved dimensions and transparent pixels. */
/* eslint-disable next/no-img-element */
import Link from '@/components/site-link';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { company, whatsappUrl } from '@/lib/company';

export function SiteFooter() {
  const { t } = useLanguage();
  const pathname = usePathname();
  if (['/ingresar', '/dashboard', '/reservar'].includes(pathname || '')) return null;
  return (
    <footer className="site-footer" id="contacto">
      <div className="page-width footer-grid">
        <div className="footer-brand">
          <Link href="/" aria-label={t('Ciudad Cars, inicio')}>
            <img
              src="/images/logo-transparent.png"
              width="427"
              height="74"
              alt="Ciudad Cars"
            />
          </Link>
          <p>
            {t('Tu destino. Nuestra ruta.')}
            <br />
            {t('Contigo en Maracaibo desde 1984.')}
          </p>
        </div>
        <div>
          <h2>{t('Explora Ciudad Cars')}</h2>
          <Link href="/vehiculos">{t('Nuestros vehículos')}</Link>
          <Link href="/servicios">{t('Servicios')}</Link>
          <Link href="/quienes-somos">{t('Quiénes somos')}</Link>
          <Link href="/contacto">{t('Contacto')}</Link>
        </div>
        <div>
          <h2>{t('Hablemos de tu viaje')}</h2>
          <a href={company.tel}>
            <Phone size={16} />
            {company.phone}
          </a>
          <a href={'mailto:' + company.email}>
            <Mail size={16} />
            {company.email}
          </a>
          <a
            href={company.directions}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin size={17} />
            <span>
              Calle 70, Bella Vista
              <br />
              Maracaibo, Venezuela
            </span>
          </a>
        </div>
        <div className="footer-invitation">
          <span className="handwritten">
            Maracaibo
            <br />
            {t('nos mueve.')}
          </span>
          <a
            className="footer-whatsapp"
            href={whatsappUrl(
              t(
                'Hola, Ciudad Cars. Quisiera información para mi próximo viaje.',
              ),
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Conversemos ')}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
      <div className="footer-legal page-width">
        <span>© {new Date().getFullYear()} Ciudad Cars</span>
        <span>{t('Hecho para moverte con libertad.')}</span>
      </div>
    </footer>
  );
}
