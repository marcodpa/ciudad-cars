/* Preoptimized local assets retain their reserved dimensions and transparent pixels. */
/* eslint-disable next/no-img-element */
'use client';

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
import { VehicleGroundShadow } from '@/components/vehicle-ground-shadow';
import { fleet, type Vehicle } from '@/lib/fleet';
import { defaultFilters, filterFleet } from '@/lib/catalog';
import { vehicleReservation } from '@/lib/company';

export function VehicleCatalog() {
  const [filters, setFilters] = useState(defaultFilters);
  const [details, setDetails] = useState<Vehicle | null>(null);
  const cars = filterFleet(fleet, filters);

  return (
    <section className="vehicles-catalog" aria-label="Catálogo de vehículos">
      <div className="vehicles-filter-bar">
        <div className="page-width vehicles-filters">
          <label className="vehicles-filter-field" htmlFor="catalog-category">
            <span>Categoría</span>
            <NativeSelect
              id="catalog-category"
              value={filters.category}
              onChange={(event) =>
                setFilters({ ...filters, category: event.target.value })
              }
            >
              <NativeSelectOption value="all">
                Todas las categorías
              </NativeSelectOption>
              {fleet.map((car) => (
                <NativeSelectOption key={car.id} value={car.category}>
                  {car.category}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label className="vehicles-filter-field" htmlFor="catalog-passengers">
            <span>Capacidad</span>
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
              <NativeSelectOption value="0">Todos</NativeSelectOption>
              <NativeSelectOption value="5">
                5 pasajeros o más
              </NativeSelectOption>
              <NativeSelectOption value="7">7 pasajeros</NativeSelectOption>
            </NativeSelect>
          </label>
          <label className="vehicles-filter-field" htmlFor="catalog-sort">
            <span>Ordenar por</span>
            <NativeSelect
              id="catalog-sort"
              value={filters.sort}
              onChange={(event) =>
                setFilters({ ...filters, sort: event.target.value })
              }
            >
              <NativeSelectOption value="price-asc">
                Precio: menor a mayor
              </NativeSelectOption>
              <NativeSelectOption value="price-desc">
                Precio: mayor a menor
              </NativeSelectOption>
            </NativeSelect>
          </label>
          <output
            className="vehicles-result-count"
            aria-live="polite"
            aria-atomic="true"
          >
            {cars.length} {cars.length === 1 ? 'vehículo' : 'vehículos'}
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
                  <VehicleGroundShadow vehicleId={car.id} instance="catalog" />
                  <img
                    src={car.showroomCutout}
                    alt={car.make + ' ' + car.model + ', vista de tres cuartos'}
                    width="1859"
                    height="846"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="vehicle-list-description">
                  <span className="vehicle-list-category">{car.category}</span>
                  <h2 id={'catalog-model-' + car.id}>
                    {car.make} {car.model}
                  </h2>
                  <p className="vehicle-list-similar">o similar</p>
                  <dl className="vehicle-list-specs">
                    <div>
                      <dt>
                        <Settings2 aria-hidden="true" />
                        <span className="sr-only">Transmisión</span>
                      </dt>
                      <dd>Automático</dd>
                    </div>
                    <div>
                      <dt>
                        <Users aria-hidden="true" />
                        <span className="sr-only">Capacidad</span>
                      </dt>
                      <dd>{car.passengers} pasajeros</dd>
                    </div>
                    <div>
                      <dt>
                        <BriefcaseBusiness aria-hidden="true" />
                        <span className="sr-only">Equipaje</span>
                      </dt>
                      <dd>{car.bags} maletas</dd>
                    </div>
                    <div>
                      <dt>
                        <CarFront aria-hidden="true" />
                        <span className="sr-only">Puertas</span>
                      </dt>
                      <dd>{car.doors} puertas</dd>
                    </div>
                  </dl>
                </div>
                <div className="vehicle-list-booking">
                  <div className="vehicle-list-price">
                    <span>Desde</span>
                    <strong>
                      <span>${car.price}</span>
                      <small>/día</small>
                    </strong>
                  </div>
                  <div className="vehicle-list-actions">
                    <a
                      href={vehicleReservation(car)}
                      className="cta vehicle-list-reserve"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        'Consultar reserva de ' + car.make + ' ' + car.model
                      }
                    >
                      Reservar ahora
                      <ArrowRight size={18} aria-hidden="true" />
                    </a>
                    <Button
                      variant="link"
                      className="vehicle-list-details"
                      onClick={() => setDetails(car)}
                      aria-label={
                        'Ver detalles de ' + car.make + ' ' + car.model
                      }
                    >
                      Ver detalles <ArrowRight size={18} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="vehicles-empty">
            <CarFront size={44} aria-hidden="true" />
            <h2>Probemos con otro plan</h2>
            <p>
              No hay modelos que combinen esa categoría y capacidad. Puedes ver
              de nuevo toda la flota.
            </p>
            <Button className="cta" onClick={() => setFilters(defaultFilters)}>
              <RotateCcw size={17} aria-hidden="true" />
              Restablecer filtros
            </Button>
          </div>
        )}
        <div className="vehicles-list-summary">
          <p>
            Todos automáticos <span aria-hidden="true">·</span> Tarifas en USD /
            día
          </p>
        </div>
        <p className="vehicles-list-note">
          Las imágenes son referenciales. Modelos o similares; disponibilidad y
          tarifa final sujetas a confirmación para las fechas de tu viaje.
        </p>
      </div>
      <VehicleDetails car={details} onClose={() => setDetails(null)} />
    </section>
  );
}
