'use client';
import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useLanguage } from './language-provider';
import { localizedHref } from '@/lib/seo';
const ReservationContext = createContext<(vehicleId?: string) => void>(
  () => {},
);
export function useReservation() {
  return useContext(ReservationContext);
}
export function ReservationProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const reserve = useCallback(
    (vehicleId?: string) => {
      window.location.assign(
        vehicleId
          ? '/reservar?modelo=' + encodeURIComponent(vehicleId)
          : localizedHref('/vehiculos', language),
      );
    },
    [language],
  );
  return <ReservationContext value={reserve}>{children}</ReservationContext>;
}
