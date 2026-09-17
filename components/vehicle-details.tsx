/* Reuse the same complete cinematic photograph shown in the vehicle selector. */
/* eslint-disable next/no-img-element */
'use client';
import { useLanguage } from '@/components/language-provider';

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CarFront,
  Settings2,
  Users,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import type { Vehicle } from '@/lib/fleet';
import { useReservation } from '@/components/reservation-provider';

export function VehicleDetails({
  car,
  onClose,
}: {
  car: Vehicle | null;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const reserve = useReservation();
  return (
    <Dialog
      open={car !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="car-dialog" showCloseButton={false}>
        {car && (
          <>
            <DialogClose
              className="dialog-close"
              aria-label={t('Cerrar detalles')}
            >
              <X />
            </DialogClose>
            <span className="eyebrow">{t(car.category)}</span>
            <DialogTitle className="dialog-title">
              {car.make} {car.model}
            </DialogTitle>
            <DialogDescription>
              {t('o similar · ')}
              {t(car.description)}
            </DialogDescription>
            <img
              src={car.mobileImage}
              srcSet={`${car.mobileImage} 1008w, ${car.image} 2016w`}
              sizes="(max-width: 600px) 90vw, 560px"
              alt={car.make + ' ' + car.model + t(' o similar')}
              width="2016"
              height="1140"
            />
            <div className="dialog-specs">
              <span>
                <Settings2 />
                {t('Automático')}
              </span>
              <span>
                <Users />
                {car.passengers}
                {t(' pasajeros')}
              </span>
              <span>
                <BriefcaseBusiness />
                {car.bags}
                {t(' maletas')}
              </span>
              <span>
                <CarFront />
                {car.doors}
                {t(' puertas')}
              </span>
            </div>
            <p className="dialog-price">
              {t('Desde ')}
              <strong>
                ${car.price}
                {t(' / día')}
              </strong>
            </p>
            <p className="dialog-note">
              {t(
                'Modelo o similar. La disponibilidad y la tarifa final se confirman para las fechas de tu viaje. Tarifas en USD.',
              )}
            </p>
            <button
              type="button"
              className="cta"
              onClick={() => {
                onClose();
                reserve(car.id);
              }}
            >
              {t('Consultar este vehículo')}
              <ArrowUpRight size={18} />
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
