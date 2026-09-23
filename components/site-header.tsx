/* Preoptimized local assets retain their reserved dimensions and transparent pixels. */
/* eslint-disable next/no-img-element */
'use client';
import { useLanguage } from '@/components/language-provider';

import Link from '@/components/site-link';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CalendarDays, Globe2, Menu, Phone, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { company } from '@/lib/company';
import { siteNavigation } from '@/lib/navigation';
import { localizedHref, resolveLanguageRoute } from '@/lib/seo';
import { useReservation } from '@/components/reservation-provider';

export function SiteHeader() {
  const { t, language, toggleLanguage } = useLanguage();
  const reserve = useReservation();
  const pathname = usePathname();
  const basePath = resolveLanguageRoute(pathname || '/')?.path;
  const isHome = basePath === '/';
  const [open, setOpen] = useState(false);
  const [overIntro, setOverIntro] = useState(true);
  const menuRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isHome) return;
    const intro = document.getElementById('recorrido');
    if (!intro) return;
    // Keep one navigation visible throughout the film and the vehicle catalog.
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      const height = headerRef.current?.offsetHeight || 84;
      observer = new IntersectionObserver(
        ([entry]) => setOverIntro(entry.isIntersecting),
        { rootMargin: `-${height + 1}px 0px 0px 0px` },
      );
      observer.observe(intro);
    };
    observe();
    window.addEventListener('resize', observe, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', observe);
    };
  }, [isHome]);
  useEffect(() => {
    if (!open) return;
    function close(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        menuRef.current?.focus();
      }
    }
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  if (['/ingresar', '/dashboard', '/reservar'].includes(pathname || ''))
    return null;
  return (
    <>
      <header
        ref={headerRef}
        className={`site-header${isHome ? ' site-header-home' : ''}${isHome && overIntro && !open ? ' is-over-intro' : ''}`}
      >
        <Link href="/" aria-label={t('Ciudad Cars, inicio')} className="brand">
          <img
            src="/images/logo-transparent.png"
            width="427"
            height="74"
            alt="Ciudad Cars · Car Rentals"
          />
        </Link>
        <nav
          id="main-navigation"
          aria-label={t('Navegación principal')}
          className={open ? 'main-nav is-open' : 'main-nav'}
        >
          {siteNavigation.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={basePath === href ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {t(label)}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link
            className="header-login"
            href="/ingresar"
            aria-label={
              language === 'en'
                ? 'Administration access'
                : 'Acceso de administración'
            }
          >
            <UserRound size={16} aria-hidden="true" />
            Admin
          </Link>
          <a
            className="language-toggle"
            href={localizedHref(
              pathname || '/',
              language === 'es' ? 'en' : 'es',
            )}
            hrefLang={language === 'es' ? 'en' : 'es'}
            onClick={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              toggleLanguage();
            }}
            lang={language === 'es' ? 'en' : 'es'}
            aria-label={
              language === 'es' ? 'Switch to English' : 'Cambiar a español'
            }
            title={
              language === 'es' ? 'Switch to English' : 'Cambiar a español'
            }
          >
            <Globe2 size={16} aria-hidden="true" />
            <span>{language === 'es' ? 'EN' : 'ES'}</span>
          </a>
          <a className="header-phone" href={company.tel}>
            <Phone size={15} />
            {company.phone}
          </a>
          <button
            type="button"
            className="cta header-cta"
            aria-label={t('Reservar ahora')}
            data-reservation-trigger
            onClick={() => {
              setOpen(false);
              reserve();
            }}
          >
            <CalendarDays size={17} aria-hidden="true" />
            <span className="header-cta-full">{t('Reservar ahora')}</span>
            <span className="header-cta-short" aria-hidden="true">
              {t('Reservar')}
            </span>
          </button>
          <Button
            ref={menuRef}
            className="menu-toggle"
            variant="ghost"
            aria-controls="main-navigation"
            aria-label={open ? t('Cerrar menú') : t('Abrir menú')}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </header>
    </>
  );
}
