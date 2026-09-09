/* Preoptimized local assets retain their reserved dimensions and transparent pixels. */
/* eslint-disable next/no-img-element */
'use client';

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
import { vehicleReservation } from '@/lib/company';

export function VehicleDetails({
  car,
  onClose,
}: {
  car: Vehicle | null;
  onClose: () => void;
}) {
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
            <DialogClose className="dialog-close" aria-label="Cerrar detalles">
              <X />
            </DialogClose>
            <span className="eyebrow">{car.category}</span>
            <DialogTitle className="dialog-title">
              {car.make} {car.model}
            </DialogTitle>
            <DialogDescription>o similar · {car.description}</DialogDescription>
            <img
              src={car.mobileImage}
              alt={car.make + ' ' + car.model + ' o similar'}
              width="1080"
              height="520"
            />
            <div className="dialog-specs">
              <span>
                <Settings2 />
                Automático
              </span>
              <span>
                <Users />
                {car.passengers} pasajeros
              </span>
              <span>
                <BriefcaseBusiness />
                {car.bags} maletas
              </span>
              <span>
                <CarFront />
                {car.doors} puertas
              </span>
            </div>
            <p className="dialog-price">
              Desde <strong>${car.price} / día</strong>
            </p>
            <p className="dialog-note">
              Modelo o similar. La disponibilidad y la tarifa final se confirman
              para las fechas de tu viaje. Tarifas en USD.
            </p>
            <a
              className="cta"
              href={vehicleReservation(car)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar este vehículo
              <ArrowUpRight size={18} />
            </a>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
