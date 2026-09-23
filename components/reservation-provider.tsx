'use client';
import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { fleet } from '@/lib/fleet';
const BookingModal = lazy(() => import('./rental/booking-modal'));
const ReservationContext = createContext<(vehicleId?: string) => void>(
  () => {},
);
export function useReservation() {
  return useContext(ReservationContext);
}
export function ReservationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [selection, setSelection] = useState<{
    vehicleId?: string;
    opener: HTMLElement | null;
  } | null>(null);
  const reserve = useCallback((vehicleId?: string) => {
    setSelection({
      vehicleId,
      opener:
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
    });
  }, []);
  useEffect(() => {
    if (!['/vehiculos', '/en/vehicles'].includes(pathname || '')) return;
    const url = new URL(window.location.href);
    const requested = url.searchParams.get('reservar');
    if (!requested) return;
    url.searchParams.delete('reservar');
    window.history.replaceState(window.history.state, '', url);
    if (
      requested === '1' ||
      fleet.some((vehicle) => vehicle.id === requested)
    ) {
      const frame = requestAnimationFrame(() =>
        reserve(requested === '1' ? undefined : requested),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [pathname, reserve]);
  return (
    <ReservationContext value={reserve}>
      {children}
      {selection && (
        <Suspense fallback={null}>
          <BookingModal
            vehicleId={selection.vehicleId}
            opener={selection.opener}
            onClose={() => setSelection(null)}
          />
        </Suspense>
      )}
    </ReservationContext>
  );
}
