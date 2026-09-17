/* Complete cinematic photographs share their lighting with the surroundings. */
/* eslint-disable next/no-img-element */
'use client';
import { useLanguage } from '@/components/language-provider';

import { useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  CarFront,
  RotateCcw,
  Settings2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { VehicleDetails } from '@/components/vehicle-details';
import { fleet, type Vehicle } from '@/lib/fleet';
import { defaultFilters, filterFleet } from '@/lib/catalog';
import { useReservation } from '@/components/reservation-provider';

export function VehicleCatalog() {
  const { t } = useLanguage();
  const reserve = useReservation();
  const [filters, setFilters] = useState(defaultFilters);
  const [details, setDetails] = useState<Vehicle | null>(null);
  const cars = filterFleet(fleet, filters);

  return (
    <section
      className="vehicles-catalog"
      aria-label={t('Catálogo de vehículos')}
    >
      <div className="vehicles-filter-bar">
        <div className="page-width vehicles-filters">
          <label className="vehicles-filter-field" htmlFor="catalog-category">
            <span>{t('Categoría')}</span>
            <NativeSelect
              id="catalog-category"
              value={filters.category}
              onChange={(event) =>
                setFilters({ ...filters, category: event.target.value })
              }
            >
              <NativeSelectOption value="all">
                {t('Todas las categorías')}
              </NativeSelectOption>
              {fleet.map((car) => (
                <NativeSelectOption key={car.id} value={car.category}>
                  {t(car.category)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label className="vehicles-filter-field" htmlFor="catalog-passengers">
            <span>{t('Capacidad')}</span>
            <NativeSelect
              id="catalog-passengers"
              value={filters.passengers}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  passengers: Number(event.target.value),
                })
              }
            >
              <NativeSelectOption value="0">{t('Todos')}</NativeSelectOption>
              <NativeSelectOption value="5">
                {t('5 pasajeros o más')}
              </NativeSelectOption>
              <NativeSelectOption value="7">
                {t('7 pasajeros')}
              </NativeSelectOption>
            </NativeSelect>
          </label>
          <label className="vehicles-filter-field" htmlFor="catalog-sort">
            <span>{t('Ordenar por')}</span>
            <NativeSelect
              id="catalog-sort"
              value={filters.sort}
              onChange={(event) =>
                setFilters({ ...filters, sort: event.target.value })
              }
            >
              <NativeSelectOption value="price-asc">
                {t('Precio: menor a mayor')}
              </NativeSelectOption>
              <NativeSelectOption value="price-desc">
                {t('Precio: mayor a menor')}
              </NativeSelectOption>
            </NativeSelect>
          </label>
          <output
            className="vehicles-result-count"
            aria-live="polite"
            aria-atomic="true"
          >
            {cars.length} {cars.length === 1 ? t('vehículo') : t('vehículos')}
          </output>
        </div>
      </div>

      <div className="page-width vehicles-list-content">
        {cars.length ? (
          <div className="vehicle-list">
            {cars.map((car) => (
              <article
                className="vehicle-list-row"
                key={car.id}
                aria-labelledby={'catalog-model-' + car.id}
              >
                <div className="vehicle-list-photo">
                  <img
                    src={car.mobileImage}
                    srcSet={`${car.mobileImage} 1008w, ${car.image} 2016w`}
                    sizes="(max-width: 700px) 90vw, (max-width: 1000px) 42vw, 480px"
                    alt={
                      car.make +
                      ' ' +
                      car.model +
                      t(', o similar, en una escena ilustrativa de Maracaibo')
                    }
                    width="2016"
                    height="1140"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="vehicle-list-description">
                  <span className="vehicle-list-category">
                    {t(car.category)}
                  </span>
                  <h2 id={'catalog-model-' + car.id}>
                    {car.make} {car.model}
                  </h2>
                  <p className="vehicle-list-similar">{t('o similar')}</p>
                  <dl className="vehicle-list-specs">
                    <div>
                      <dt>
                        <Settings2 aria-hidden="true" />
                        <span className="sr-only">{t('Transmisión')}</span>
                      </dt>
                      <dd>{t('Automático')}</dd>
                    </div>
                    <div>
                      <dt>
                        <Users aria-hidden="true" />
                        <span className="sr-only">{t('Capacidad')}</span>
                      </dt>
                      <dd>
                        {car.passengers}
                        {t(' pasajeros')}
                      </dd>
                    </div>
                    <div>
                      <dt>
                        <BriefcaseBusiness aria-hidden="true" />
                        <span className="sr-only">{t('Equipaje')}</span>
                      </dt>
                      <dd>
                        {car.bags}
                        {t(' maletas')}
                      </dd>
                    </div>
                    <div>
                      <dt>
                        <CarFront aria-hidden="true" />
                        <span className="sr-only">{t('Puertas')}</span>
                      </dt>
                      <dd>
                        {car.doors}
                        {t(' puertas')}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="vehicle-list-booking">
                  <div className="vehicle-list-price">
                    <span>{t('Desde')}</span>
                    <strong>
                      <span>${car.price}</span>
                      <small>{t('/día')}</small>
                    </strong>
                  </div>
                  <div className="vehicle-list-actions">
                    <button
                      type="button"
                      onClick={() => reserve(car.id)}
                      className="cta vehicle-list-reserve"
                      aria-label={
                        t('Consultar reserva de ') + car.make + ' ' + car.model
                      }
                    >
                      {t('Reservar ahora')}
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                    <Button
                      variant="link"
                      className="vehicle-list-details"
                      onClick={() => setDetails(car)}
                      aria-label={
                        t('Ver detalles de ') + car.make + ' ' + car.model
                      }
                    >
                      {t('Ver detalles ')}
                      <ArrowRight size={18} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="vehicles-empty">
            <CarFront size={44} aria-hidden="true" />
            <h2>{t('Probemos con otro plan')}</h2>
            <p>
              {t(
                'No hay modelos que combinen esa categoría y capacidad. Puedes ver de nuevo toda la flota.',
              )}
            </p>
            <Button className="cta" onClick={() => setFilters(defaultFilters)}>
              <RotateCcw size={17} aria-hidden="true" />
              {t('Restablecer filtros')}
            </Button>
          </div>
        )}
        <div className="vehicles-list-summary">
          <p>
            {t('Todos automáticos ')}
            <span aria-hidden="true">·</span>
            {t(' Tarifas en USD / día')}
          </p>
        </div>
        <p className="vehicles-list-note">
          {t(
            'Las imágenes son referenciales. Modelos o similares; disponibilidad y tarifa final sujetas a confirmación para las fechas de tu viaje.',
          )}
        </p>
      </div>
      <VehicleDetails car={details} onClose={() => setDetails(null)} />
    </section>
  );
}
