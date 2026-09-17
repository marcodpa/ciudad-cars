/* Complete cinematic photographs retain their original framing and lighting. */
/* eslint-disable next/no-img-element */
'use client';
import { useLanguage } from '@/components/language-provider';

import Link from '@/components/site-link';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CarFront,
  Settings2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { VehicleDetails } from '@/components/vehicle-details';
import { fleet } from '@/lib/fleet';
import { useReservation } from '@/components/reservation-provider';
import { clampPosition } from '@/lib/fleet-motion';
import { registerFleetReadTool } from '@/lib/webmcp';

export function FleetExperience() {
  const { t } = useLanguage();
  const reserve = useReservation();
  const rootRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<((index: number) => void) | null>(null);
  const activeRef = useRef(0);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(0);
  const [details, setDetails] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const images = Array.from(root.querySelectorAll<HTMLElement>('.drive-car'));
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('.drive-copy'),
    );
    const media = gsap.matchMedia();
    const unregister = registerFleetReadTool(() => activeRef.current);
    media.add(
      {
        reduced: '(prefers-reduced-motion: reduce)',
        standard: '(min-width: 0px)',
      },
      (context) => {
        const { reduced } = context.conditions!;
        const layers = [...images, ...panels];
        images.forEach((image, index) => {
          gsap.set(image, {
            autoAlpha: index === activeRef.current ? 1 : 0,
            x: 0,
            scale: 1,
            filter: 'none',
          });
          gsap.set(panels[index], {
            autoAlpha: index === activeRef.current ? 1 : 0,
            y: 0,
          });
        });
        root.style.setProperty(
          '--drive-progress',
          ((activeRef.current + 1) / fleet.length) * 100 + '%',
        );
        controlsRef.current = (index) => {
          const next = Math.round(clampPosition(index, fleet.length));
          if (next === activeRef.current) return;
          // Retarget the current layers, so rapid clicks never queue intermediate cars.
          gsap.killTweensOf([...layers, root]);
          if (Number(gsap.getProperty(images[next], 'opacity')) === 0) {
            gsap.set(images[next], {
              x: 0,
              scale: reduced ? 1 : 1.018,
              filter: 'none',
            });
            gsap.set(panels[next], { y: reduced ? 0 : 8 });
          }
          activeRef.current = next;
          setActive(next);
          images.forEach((image, carIndex) => {
            const selected = carIndex === next;
            image.dataset.moving = String(!reduced);
            gsap.to(image, {
              autoAlpha: selected ? 1 : 0,
              x: 0,
              scale: 1,
              filter: 'none',
              duration: reduced ? 0 : 0.55,
              ease: 'power2.inOut',
              onComplete: () => {
                image.dataset.moving = 'false';
              },
            });
            gsap.to(panels[carIndex], {
              autoAlpha: selected ? 1 : 0,
              y: reduced || selected ? 0 : -8,
              duration: reduced ? 0 : 0.55,
              ease: 'power2.inOut',
            });
          });
          gsap.to(root, {
            '--drive-progress': ((next + 1) / fleet.length) * 100 + '%',
            duration: reduced ? 0 : 0.55,
            ease: 'power2.inOut',
          });
        };
        return () => {
          controlsRef.current = null;
          gsap.killTweensOf([...layers, root]);
        };
      },
    );
    return () => {
      unregister();
      media.revert();
    };
  }, []);

  function select(index: number) {
    controlsRef.current?.(index);
  }

  return (
    <>
      <section
        className="drive-section"
        id="flota"
        ref={rootRef}
        aria-labelledby="fleet-title"
      >
        <div className="drive-stage">
          <div className="drive-shell">
            <div className="drive-overline">
              <span>
                MARACAIBO <i aria-hidden="true" /> VENEZUELA
              </span>
            </div>
            <div className="drive-heading">
              <h2 id="fleet-title">
                {t('Elige tu ')}
                <span>{t('viaje perfecto')}</span>
              </h2>
              <p>
                {t('Cinco formas de moverte.')}
                <br />
                <span>{t('Encuentra la tuya.')}</span>
              </p>
            </div>
            <section
              className="drive-configurator"
              aria-roledescription={t('carrusel')}
              aria-label={t('Vehículos de Ciudad Cars')}
            >
              <section
                className="drive-showroom"
                aria-label={t('Vista del vehículo en Maracaibo')}
                onTouchStart={(event) => {
                  if (event.touches.length !== 1) {
                    touchRef.current = null;
                    return;
                  }
                  const touch = event.touches[0];
                  touchRef.current = { x: touch.clientX, y: touch.clientY };
                }}
                onTouchEnd={(event) => {
                  const start = touchRef.current;
                  touchRef.current = null;
                  if (!start) return;
                  const touch = event.changedTouches[0];
                  const dx = touch.clientX - start.x;
                  const dy = touch.clientY - start.y;
                  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
                    select(activeRef.current + (dx < 0 ? 1 : -1));
                }}
                onTouchCancel={() => {
                  touchRef.current = null;
                }}
              >
                <div className="drive-frame">
                  {fleet.map((car, index) => (
                    <div
                      className={'drive-car drive-car-' + car.id}
                      key={car.id}
                      aria-hidden={active !== index}
                    >
                      <img
                        src={car.image}
                        srcSet={`${car.mobileImage} 1008w, ${car.image} 2016w`}
                        sizes="(max-width: 900px) 94vw, (max-width: 1600px) 64vw, 1020px"
                        alt={car.make + ' ' + car.model + t(', o similar')}
                        width="2016"
                        height="1140"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="drive-photo-name" aria-hidden="true">
                        {car.make} <strong>{car.model}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <div className="drive-navigation">
                <div className="drive-controls">
                  <Button
                    variant="outline"
                    className="drive-arrow"
                    aria-label={t('Vehículo anterior')}
                    disabled={active === 0}
                    onClick={() => select(activeRef.current - 1)}
                  >
                    <ArrowLeft />
                  </Button>
                  <span className="drive-count">
                    <b>0{active + 1}</b>
                    <span>/ 0{fleet.length}</span>
                  </span>
                  <Button
                    variant="outline"
                    className="drive-arrow"
                    aria-label={t('Vehículo siguiente')}
                    disabled={active === fleet.length - 1}
                    onClick={() => select(activeRef.current + 1)}
                  >
                    <ArrowRight />
                  </Button>
                </div>
                <Progress
                  className="drive-progress"
                  value={((active + 1) / fleet.length) * 100}
                  aria-label={t('Recorrido por los vehículos')}
                />
                <Link href="/vehiculos">
                  {t('Ver catálogo ')}
                  <ArrowRight size={18} />
                </Link>
              </div>
              <fieldset
                className="drive-thumbnails"
                aria-label={t('Elegir vehículo')}
              >
                {fleet.map((car, index) => (
                  <button
                    key={car.id}
                    className={
                      'drive-thumb' + (active === index ? ' is-active' : '')
                    }
                    aria-label={
                      car.make +
                      ' ' +
                      car.model +
                      t(', desde ') +
                      car.price +
                      t(' dólares al día')
                    }
                    aria-pressed={active === index}
                    onClick={() => select(index)}
                  >
                    <span className="drive-thumb-visual" aria-hidden="true">
                      <img
                        src={car.thumbnail}
                        alt=""
                        width="336"
                        height="190"
                        loading="lazy"
                      />
                      <span className="drive-thumb-name">{car.model}</span>
                    </span>
                  </button>
                ))}
              </fieldset>
              <div className="drive-sidebar">
                <div className="drive-details-stack">
                  {fleet.map((car, index) => (
                    <div
                      className="drive-copy"
                      key={car.id}
                      aria-hidden={active !== index}
                      inert={active !== index}
                    >
                      <div className="drive-model">
                        <span className="eyebrow">{t(car.category)}</span>
                        <h3>
                          <span>{car.make}</span>
                          <strong>{car.model}</strong>
                        </h3>
                        <span className="drive-similar">{t('o similar')}</span>
                      </div>
                      <div className="drive-price">
                        <span>{t('Desde')}</span>
                        <div className="drive-rate">
                          <strong>${car.price}</strong>
                          <span>
                            USD<small>{t('/día')}</small>
                          </span>
                        </div>
                      </div>
                      <dl className="drive-specs">
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
                            <span className="sr-only">{t('Acceso')}</span>
                          </dt>
                          <dd>
                            {car.doors}
                            {t(' puertas')}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
                <div className="drive-actions">
                  <button
                    type="button"
                    className="cta"
                    onClick={() => reserve(fleet[active].id)}
                  >
                    {t('Reservar este carro')}
                    <ArrowRight size={17} />
                  </button>
                  <Button
                    className="drive-details-link"
                    variant="link"
                    onClick={() => setDetails(active)}
                  >
                    {t('Ver detalles ')}
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            </section>
            <output className="sr-only" aria-live="polite" aria-atomic="true">
              {active + 1}
              {t(' de ')}
              {fleet.length}. {fleet[active].make} {fleet[active].model},{' '}
              {t(fleet[active].category)}
              {t(', o similar. Desde')} {fleet[active].price}
              {t(' dólares por día. ')}
              {fleet[active].passengers} {t('pasajeros, ')}
              {fleet[active].bags}
              {t(' maletas.')}
            </output>
            <noscript>
              <p className="drive-no-script">
                {t('Puedes conocer los cinco carros en')}{' '}
                <Link href="/vehiculos">
                  {t('nuestro catálogo de vehículos')}
                </Link>
                .
              </p>
            </noscript>
          </div>
        </div>
      </section>
      <VehicleDetails
        car={details === null ? null : fleet[details]}
        onClose={() => setDetails(null)}
      />
    </>
  );
}
