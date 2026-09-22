/* Native navigation returns visitors to the public website. */
/* eslint-disable next/no-html-link-for-pages */
'use client';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { RentalBrand } from './rental-login';
import { useRental } from './rental-provider';
export function PublicBookingShell({ children }: { children: ReactNode }) {
  const { demo } = useRental();
  return (
    <div className="rental-app public-booking">
      <header className="public-booking-header">
        <RentalBrand />
        <a href="/">
          <ArrowLeft size={16} /> Volver a la web
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
