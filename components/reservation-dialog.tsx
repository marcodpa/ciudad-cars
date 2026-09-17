'use client';
import { useLanguage } from '@/components/language-provider';

import { useEffect, useRef, useState } from 'react';
import type { DayButtonProps, RootProps } from 'react-day-picker';
import { CalendarDays, MessageCircle, RotateCcw, X } from 'lucide-react';
import { es, enUS } from 'react-day-picker/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { fleet } from '@/lib/fleet';
import { whatsappUrl } from '@/lib/company';
import {
  calendarDate,
  calendarValue,
  prepareReservation,
  todayInMaracaibo,
} from '@/lib/reservation';

// Stable calendar components keep keyboard focus when a date updates the preview.
function CalendarRoot({ rootRef, ...props }: RootProps) {
  return <div ref={rootRef} data-slot="calendar" {...props} />;
}
function DayButton({ day, modifiers, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus({ preventScroll: true });
  }, [modifiers.focused]);
  return (
    <Button
      ref={ref}
      variant="ghost"
      type="button"
      data-day={calendarValue(day.date)}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      {...props}
    />
  );
}
const calendarComponents = { Root: CalendarRoot, DayButton };

export default function ReservationDialog({
  open,
  vehicleId,
  opener,
  onClose,
}: {
  open: boolean;
  vehicleId?: string;
  opener: HTMLElement | null;
  onClose: () => void;
}) {
  const { t, language } = useLanguage();
  const [today] = useState(todayInMaracaibo);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [selectedCar, setSelectedCar] = useState(vehicleId || '');
  const [month, setMonth] = useState(() => calendarDate(today)!);
  const [submitError, setSubmitError] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const car = fleet.find((vehicle) => vehicle.id === selectedCar);
  const result = prepareReservation({ pickup, dropoff, car, today, language });
  const error =
    pickup && dropoff && 'error' in result ? result.error : submitError;

  function updatePickup(value: string) {
    setPickup(value);
    if (dropoff && value >= dropoff) setDropoff('');
    const date = calendarDate(value);
    if (date && value >= today) setMonth(date);
    setSubmitError('');
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        className="reservation-dialog"
        showCloseButton={false}
        initialFocus={headingRef}
        finalFocus={() =>
          opener?.isConnected
            ? opener
            : document.querySelector<HTMLElement>('[data-reservation-trigger]')
        }
      >
        <DialogClose
          className="reservation-close"
          aria-label={t('Cerrar reserva')}
        >
          <X size={22} />
        </DialogClose>
        <header className="reservation-heading">
          <p>
            <CalendarDays size={18} aria-hidden="true" />
            {t(' TU PRÓXIMO VIAJE')}
          </p>
          <DialogTitle ref={headingRef} tabIndex={-1}>
            {t('¿Cuándo necesitas tu carro?')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'Elige retiro y devolución. Tu solicitud se prepara al instante.',
            )}
          </DialogDescription>
        </header>
        <div className="reservation-layout">
          <section
            className="reservation-dates"
            aria-label={t('Fechas del alquiler')}
          >
            <div className="reservation-date-fields">
              <label htmlFor="reservation-pickup">
                {t('Retiro')}
                <Input
                  id="reservation-pickup"
                  type="date"
                  min={today}
                  value={pickup}
                  required
                  onChange={(event) => updatePickup(event.target.value)}
                  aria-describedby="reservation-hint"
                />
              </label>
              <label htmlFor="reservation-dropoff">
                {t('Devolución')}
                <Input
                  id="reservation-dropoff"
                  type="date"
                  min={pickup || today}
                  value={dropoff}
                  required
                  onChange={(event) => {
                    setDropoff(event.target.value);
                    setSubmitError('');
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    error ? 'reservation-error' : 'reservation-hint'
                  }
                />
              </label>
            </div>
            <p
              id="reservation-hint"
              className="reservation-hint"
              aria-live="polite"
            >
              {!pickup
                ? t('Marca el día de retiro y luego el de devolución.')
                : !dropoff
                  ? t('Ahora elige el día de devolución.')
                  : 'message' in result
                    ? `${result.days} ${result.days === 1 ? t('día seleccionado') : t('días seleccionados')}. ${t('Puedes cambiar las fechas.')}`
                    : t('Revisa las fechas seleccionadas.')}
            </p>
            <Calendar
              className="reservation-calendar"
              mode="range"
              locale={language === 'en' ? enUS : es}
              components={calendarComponents}
              min={1}
              excludeDisabled
              selected={{
                from: calendarDate(pickup),
                to: calendarDate(dropoff),
              }}
              onSelect={(range) => {
                setPickup(calendarValue(range?.from));
                setDropoff(calendarValue(range?.to));
                setSubmitError('');
              }}
              month={month}
              onMonthChange={setMonth}
              startMonth={calendarDate(today)}
              disabled={{ before: calendarDate(today)! }}
              showOutsideDays={false}
              fixedWeeks
              labels={{
                labelNext: () => t('Mes siguiente'),
                labelPrevious: () => t('Mes anterior'),
                labelDayButton: (date, modifiers) =>
                  `${modifiers.today ? t('Hoy, ') : ''}${date.toLocaleDateString(language === 'en' ? 'en-US' : 'es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${modifiers.selected ? t(', seleccionado') : ''}`,
              }}
            />
            <Button
              variant="ghost"
              className="reservation-reset"
              disabled={!pickup && !dropoff}
              onClick={() => {
                setPickup('');
                setDropoff('');
                setSubmitError('');
              }}
            >
              <RotateCcw size={15} aria-hidden="true" />
              {t(' Borrar fechas')}
            </Button>
          </section>
          <section
            className="reservation-summary"
            aria-label={t('Tu solicitud de reserva')}
          >
            <div className="reservation-vehicle-field">
              <label htmlFor="reservation-car">{t('Tu vehículo')}</label>
              <NativeSelect
                id="reservation-car"
                value={selectedCar}
                onChange={(event) => setSelectedCar(event.target.value)}
              >
                <NativeSelectOption value="">
                  {t('Ayúdame a elegir')}
                </NativeSelectOption>
                {fleet.map((vehicle) => (
                  <NativeSelectOption key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model}
                    {t(' o similar')}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            {car && (
              <p className="reservation-rate">
                {car.passengers}
                {t(' pasajeros · Desde')}{' '}
                <strong>
                  ${car.price}
                  {t('/día')}
                </strong>
              </p>
            )}
            <h3>
              <MessageCircle size={19} aria-hidden="true" />
              {t(' Tu mensaje')}
            </h3>
            <div
              className="reservation-message"
              aria-live="polite"
              aria-atomic="true"
            >
              {'message' in result
                ? result.message
                : t(
                    'Selecciona tus fechas para preparar el mensaje de WhatsApp.',
                  )}
            </div>
            {error && (
              <p
                id="reservation-error"
                className="reservation-error"
                role="alert"
              >
                {error}
              </p>
            )}
            <a
              className="cta reservation-send"
              href={
                'message' in result ? whatsappUrl(result.message) : undefined
              }
              aria-disabled={'error' in result}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => {
                // Recheck against Maracaibo's current day if the dialog stayed open overnight.
                const latest = prepareReservation({
                  pickup,
                  dropoff,
                  car,
                  language,
                });
                if ('error' in latest) {
                  event.preventDefault();
                  setSubmitError(latest.error);
                  return;
                }
                event.currentTarget.href = whatsappUrl(latest.message);
              }}
            >
              {t('Continuar por WhatsApp')}{' '}
              <MessageCircle size={18} aria-hidden="true" />
            </a>
            <p className="reservation-note">
              {t(
                'Ciudad Cars confirmará disponibilidad y tarifa por WhatsApp. La reserva queda sujeta a esa confirmación.',
              )}
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
