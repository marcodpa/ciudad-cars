/* Preoptimized local assets retain their reserved dimensions and transparent pixels. */
/* eslint-disable next/no-img-element */
'use client';

import Link from '@/components/site-link';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CalendarDays, Menu, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { company } from '@/lib/company';
import { siteNavigation } from '@/lib/navigation';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
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
  return (
    <>
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <header className="site-header">
        <Link href="/" aria-label="Ciudad Cars, inicio" className="brand">
          <img
            src="/images/logo.png"
            width="427"
            height="74"
            alt="Ciudad Cars · Car Rentals"
          />
        </Link>
        <nav
          id="main-navigation"
          aria-label="Navegación principal"
          className={open ? 'main-nav is-open' : 'main-nav'}
        >
          {siteNavigation.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-phone" href={company.tel}>
            <Phone size={15} />
            {company.phone}
          </a>
          <a href={company.reservation} className="cta header-cta">
            <CalendarDays size={17} />
            Reservar ahora
          </a>
          <Button
            ref={menuRef}
            className="menu-toggle"
            variant="ghost"
            aria-controls="main-navigation"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
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
