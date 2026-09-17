'use client';
import { useLanguage } from '@/components/language-provider';

import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

const ReservationDialog = lazy(() => import('./reservation-dialog'));
const ReservationContext = createContext<(vehicleId?: string) => void>(
  () => {},
);

export function useReservation() {
  return useContext(ReservationContext);
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const sequence = useRef(0);
  const [request, setRequest] = useState<{
    key: number;
    vehicleId?: string;
    opener: HTMLElement | null;
    open: boolean;
  } | null>(null);
  const openReservation = useCallback((vehicleId?: string) => {
    setRequest({
      key: ++sequence.current,
      vehicleId,
      open: true,
      opener:
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
    });
  }, []);
  const close = useCallback(
    () => setRequest((value) => value && { ...value, open: false }),
    [],
  );

  return (
    <ReservationContext value={openReservation}>
      {children}
      {request && (
        <Suspense
          fallback={
            <Dialog
              open={request.open}
              onOpenChange={(open) => {
                if (!open) close();
              }}
            >
              <DialogContent className="reservation-loading">
                <DialogTitle>{t('Elige las fechas de tu viaje')}</DialogTitle>
                <DialogDescription>
                  {t('Abriendo calendario…')}
                </DialogDescription>
              </DialogContent>
            </Dialog>
          }
        >
          <ReservationDialog
            key={request.key}
            open={request.open}
            vehicleId={request.vehicleId}
            opener={request.opener}
            onClose={close}
          />
        </Suspense>
      )}
    </ReservationContext>
  );
}
