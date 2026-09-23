'use client';
import '@/app/rental.css';
import '@/app/public-booking.css';
import '@/app/booking-modal.css';
import { X } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { RentalProvider } from './rental-provider';
import { RentalBooking } from './rental-booking';

export default function BookingModal({
  vehicleId,
  opener,
  onClose,
}: {
  vehicleId?: string;
  opener: HTMLElement | null;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="rental-app public-booking-modal"
        showCloseButton={false}
        finalFocus={() =>
          opener?.isConnected
            ? opener
            : document.querySelector<HTMLElement>('[data-reservation-trigger]')
        }
      >
        <DialogTitle className="sr-only">
          {language === 'en'
            ? 'Request a car rental'
            : 'Solicita el alquiler de un carro'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {language === 'en'
            ? 'Choose dates and complete the request in four steps.'
            : 'Elige las fechas y completa la solicitud en cuatro pasos.'}
        </DialogDescription>
        <button
          type="button"
          className="booking-modal-close"
          aria-label={language === 'en' ? 'Close booking' : 'Cerrar reserva'}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <RentalProvider publicBooking>
          <RentalBooking embedded initialVehicleId={vehicleId} />
        </RentalProvider>
      </DialogContent>
    </Dialog>
  );
}
