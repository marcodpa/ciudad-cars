import type { Vehicle } from './fleet';
import { translate, type Language } from './language.js';

const dayMs = 86_400_000;

export function todayInMaracaibo(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((item) => item.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function dayNumber(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return date.getTime() / dayMs;
}

export function calendarDate(value: string) {
  if (dayNumber(value) === null) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function calendarValue(date?: Date) {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function prepareReservation({
  pickup,
  dropoff,
  car,
  today = todayInMaracaibo(),
  language = 'es',
}: {
  pickup: string;
  dropoff: string;
  car?: Vehicle;
  today?: string;
  language?: Language;
}): { error: string } | { message: string; days: number } {
  const t = (text: string) => translate(text, language);
  const start = dayNumber(pickup),
    end = dayNumber(dropoff),
    current = dayNumber(today);
  if (start === null || end === null)
    return { error: t('Elige las fechas de retiro y devolución.') };
  if (current === null || start < current)
    return { error: t('El retiro debe ser hoy o una fecha posterior.') };
  if (end <= start)
    return { error: t('La devolución debe ser después del día de retiro.') };
  const days = end - start;
  const format = (day: number) =>
    new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-VE', {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(day * dayMs));
  const vehicle = car
    ? `${car.make} ${car.model} ${t('o similar')} (${t(car.category)}), ${language === 'en' ? 'from' : 'desde'} $${car.price}${t('/día')}.`
    : t('Me gustaría que me ayudaran a elegir un vehículo.');
  return {
    days,
    message:
      language === 'en'
        ? `Hello, Ciudad Cars. I’d like to request a booking.\n\n${vehicle}\nPickup: ${format(start)}.\nReturn: ${format(end)}.\nDuration: ${days} ${days === 1 ? 'day' : 'days'}.\n\nCould you confirm availability and rates for these dates?`
        : `Hola, Ciudad Cars. Quisiera solicitar una reserva.\n\n${vehicle}\nRetiro: ${format(start)}.\nDevolución: ${format(end)}.\nDuración: ${days} ${days === 1 ? 'día' : 'días'}.\n\n¿Me confirman disponibilidad y tarifa para estas fechas?`,
  };
}
