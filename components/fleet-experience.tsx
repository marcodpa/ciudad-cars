/* A stationary city plate sits behind independently animated vehicle layers. */
/* eslint-disable next/no-img-element */
'use client';

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
import { vehicleReservation } from '@/lib/company';
import { clampPosition } from '@/lib/fleet-motion';
import { registerFleetReadTool } from '@/lib/webmcp';

export function FleetExperience() {
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
        const copyParts = panels.flatMap((panel) => Array.from(panel.children));
        let transition: gsap.core.Timeline | null = null;
        let revision = 0;
        const settle = (selected: number) => {
          images.forEach((image, index) => {
            gsap.set(image, {
              autoAlpha: index === selected ? 1 : 0,
              xPercent: 0,
              scale: 1,
              filter: 'blur(0px)',
            });
            image.dataset.moving = 'false';
            gsap.set(panels[index], {
              autoAlpha: index === selected ? 1 : 0,
              y: 0,
            });
          });
          gsap.set(copyParts, { autoAlpha: 1, y: 0 });
          root.dataset.transitioning = 'false';
        };
        settle(activeRef.current);
        root.style.setProperty(
          '--drive-progress',
          ((activeRef.current + 1) / fleet.length) * 100 + '%',
        );
        controlsRef.current = (index) => {
          const next = Math.round(clampPosition(index, fleet.length));
          if (next === activeRef.current) return;
          const direction = next > activeRef.current ? 1 : -1;
          const request = ++revision;
          activeRef.current = next;
          setActive(next);
          const animate = () => {
            if (request !== revision) return;
            // Kill the entire previous sequence, including scheduled text entrances.
            transition?.kill();
            gsap.killTweensOf([...layers, ...copyParts, root]);
            if (reduced) {
              settle(next);
              gsap.set(root, {
                '--drive-progress': ((next + 1) / fleet.length) * 100 + '%',
              });
              return;
            }
            // Retarget from the most visible layer during rapid/reversed selections.
            const outgoing = images.reduce(
              (best, image, candidate) =>
                Number(gsap.getProperty(image, 'opacity')) >
                Number(gsap.getProperty(images[best], 'opacity'))
                  ? candidate
                  : best,
              0,
            );
            images.forEach((image, carIndex) => {
              image.dataset.moving = String(
                carIndex === outgoing || carIndex === next,
              );
              if (carIndex !== outgoing) gsap.set(image, { autoAlpha: 0 });
            });
            root.dataset.transitioning = 'true';
            transition = gsap.timeline({ onComplete: () => settle(next) });
            if (outgoing === next) {
              transition.to(
                images[next],
                {
                  autoAlpha: 1,
                  xPercent: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                  duration: 0.5,
                  ease: 'power3.out',
                },
                0,
              );
            } else {
              transition.to(
                images[outgoing],
                {
                  autoAlpha: 0,
                  xPercent: -direction * 16,
                  scale: 0.985,
                  filter: 'blur(5px)',
                  duration: 0.28,
                  ease: 'power2.in',
                },
                0,
              );
              transition.fromTo(
                images[next],
                {
                  autoAlpha: 0,
                  xPercent: direction * 19,
                  scale: 0.985,
                  filter: 'blur(6px)',
                },
                {
                  autoAlpha: 1,
                  xPercent: 0,
                  scale: 1,
                  filter: 'blur(0px)',
                  duration: 0.76,
                  ease: 'power3.out',
                  immediateRender: false,
                },
                0.3,
              );
            }
            transition.to(
              panels,
              { autoAlpha: 0, y: -8, duration: 0.16, ease: 'power2.in' },
              0,
            );
            transition.set(panels[next], { autoAlpha: 1, y: 0 }, 0.22);
            transition.fromTo(
              Array.from(panels[next].children),
              { autoAlpha: 0, y: 14 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.44,
                stagger: 0.06,
                ease: 'power3.out',
                immediateRender: false,
              },
              0.22,
            );
            transition.to(
              root,
              {
                '--drive-progress': ((next + 1) / fleet.length) * 100 + '%',
                duration: 0.85,
                ease: 'power3.inOut',
              },
              0,
            );
          };
          // Keep the current car visible until the next transparent image is decoded.
          const photo = images[next].querySelector('img');
          if (photo && !photo.complete)
            void photo.decode().then(animate, animate);
          else animate();
        };
        return () => {
          revision++;
          controlsRef.current = null;
          transition?.kill();
          gsap.killTweensOf([...layers, ...copyParts, root]);
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
              <img
                src="/images/logo-transparent.png"
                width="427"
                height="74"
                alt="Ciudad Cars"
                loading="lazy"
              />
              <span>
                MARACAIBO <i aria-hidden="true" /> VENEZUELA
              </span>
            </div>
            <div className="drive-heading">
              <h2 id="fleet-title">
                Elige tu <span>viaje perfecto</span>
              </h2>
              <p>
                Cinco formas de moverte.
                <br />
                <span>Encuentra la tuya.</span>
              </p>
            </div>
            <section
              className="drive-configurator"
              aria-roledescription="carrusel"
              aria-label="Vehículos de Ciudad Cars"
            >
              <section
                className="drive-showroom"
                aria-label="Vista del vehículo en Maracaibo"
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
                  <img
                    className="drive-backdrop"
                    src="/images/fleet-stage-background.webp"
                    srcSet="/images/fleet-stage-background-mobile.webp 1008w, /images/fleet-stage-background.webp 2016w"
                    sizes="(max-width: 900px) 94vw, (max-width: 1600px) 64vw, 1020px"
                    alt=""
                    width="2016"
                    height="1140"
                    loading="lazy"
                  />
                  {fleet.map((car, index) => (
                    <div
                      className={'drive-car drive-car-' + car.id}
                      key={car.id}
                      aria-hidden={active !== index}
                    >
                      <img
                        src={`/images/fleet-stage-${car.id}.webp`}
                        srcSet={`/images/fleet-stage-${car.id}-mobile.webp 1008w, /images/fleet-stage-${car.id}.webp 2016w`}
                        sizes="(max-width: 900px) 94vw, (max-width: 1600px) 64vw, 1020px"
                        alt={car.make + ' ' + car.model + ', o similar'}
                        width="2016"
                        height="1140"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
              </section>
              <div className="drive-navigation">
                <div className="drive-controls">
                  <Button
                    variant="outline"
                    className="drive-arrow"
                    aria-label="Vehículo anterior"
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
                    aria-label="Vehículo siguiente"
                    disabled={active === fleet.length - 1}
                    onClick={() => select(activeRef.current + 1)}
                  >
                    <ArrowRight />
                  </Button>
                </div>
                <Progress
                  className="drive-progress"
                  value={((active + 1) / fleet.length) * 100}
                  aria-label="Recorrido por los vehículos"
                />
                <Link href="/vehiculos">
                  Ver catálogo <ArrowRight size={18} />
                </Link>
              </div>
              <fieldset
                className="drive-thumbnails"
                aria-label="Elegir vehículo"
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
                      ', desde ' +
                      car.price +
                      ' dólares al día'
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
                    </span>
                    <span className="drive-thumb-name">{car.model}</span>
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
                        <span className="eyebrow">{car.category}</span>
                        <h3>
                          <span>{car.make}</span>
                          <strong>{car.model}</strong>
                        </h3>
                        <span className="drive-similar">o similar</span>
                      </div>
                      <div className="drive-price">
                        <span>Desde</span>
                        <div className="drive-rate">
                          <strong>${car.price}</strong>
                          <span>
                            USD<small>/día</small>
                          </span>
                        </div>
                      </div>
                      <dl className="drive-specs">
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
                            <span className="sr-only">Acceso</span>
                          </dt>
                          <dd>{car.doors} puertas</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
                <div className="drive-actions">
                  <a
                    className="cta"
                    href={vehicleReservation(fleet[active])}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reservar este carro
                    <ArrowRight size={17} />
                  </a>
                  <Button
                    className="drive-details-link"
                    variant="link"
                    onClick={() => setDetails(active)}
                  >
                    Ver detalles <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            </section>
            <output className="sr-only" aria-live="polite" aria-atomic="true">
              {active + 1} de {fleet.length}. {fleet[active].make}{' '}
              {fleet[active].model}, {fleet[active].category}, o similar. Desde{' '}
              {fleet[active].price} dólares por día. {fleet[active].passengers}{' '}
              pasajeros, {fleet[active].bags} maletas.
            </output>
            <noscript>
              <p className="drive-no-script">
                Puedes conocer los cinco carros en{' '}
                <Link href="/vehiculos">nuestro catálogo de vehículos</Link>.
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
