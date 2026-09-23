/* Native navigation returns visitors to the public website. */
/* eslint-disable next/no-html-link-for-pages */
'use client';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { RentalBrand } from './rental-login';
import { useRental } from './rental-provider';
import { useLanguage } from '../language-provider';
import { localizedHref } from '@/lib/seo';
export function PublicBookingShell({ children }: { children: ReactNode }) {
  const { demo } = useRental();
  const { language } = useLanguage();
  return (
    <div className="rental-app public-booking">
      <header className="public-booking-header">
        <RentalBrand />
        <a href={localizedHref('/vehiculos', language)}>
          <ArrowLeft size={16} /> Volver a vehículos
        </a>
      </header>
      {demo && (
        <div className="public-booking-demo">
          <strong>Demostración de la reserva.</strong> Usa solo los datos de
          ejemplo. No se crean reservas reales ni se envían mensajes.
        </div>
      )}
      <main id="contenido" className="public-booking-content">
        {children}
      </main>
    </div>
  );
}
