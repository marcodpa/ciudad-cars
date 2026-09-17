/* Original user-supplied photographs, with their natural colors preserved. */
/* eslint-disable next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Maximize2,
  X,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

const places = [
  {
    image: 'maracaibo-ciudad',
    width: 736,
    height: 552,
    name: 'La ciudad',
    title: 'Una ciudad con vida propia.',
    detail: 'Calles, encuentros y nuevos destinos.',
    alt: 'Vista de los edificios, avenidas y vida cotidiana de Maracaibo',
    credit: '',
  },
  {
    image: 'maracaibo-el-milagro',
    width: 482,
    height: 700,
    name: 'Avenida El Milagro',
    title: 'Siempre cerca del lago.',
    detail: 'La ciudad se encuentra con el horizonte.',
    alt: 'Vista elevada de la avenida El Milagro entre edificios con el lago al fondo',
    credit: '',
  },
  {
    image: 'maracaibo-puente-atardecer',
    width: 720,
    height: 689,
    name: 'Puente Rafael Urdaneta',
    title: 'Un atardecer para volver.',
    detail: 'Lago de Maracaibo',
    alt: 'Sol al atardecer junto al puente General Rafael Urdaneta sobre el lago de Maracaibo',
    credit: '',
  },
  {
    image: 'maracaibo-basilica',
    width: 595,
    height: 596,
    name: 'Basílica de Chiquinquirá',
    title: 'Nuestras raíces, presentes.',
    detail: 'Basílica de Nuestra Señora de Chiquinquirá',
    alt: 'Fachada y torres de la Basílica de Nuestra Señora de Chiquinquirá',
    credit: '@jaimejavier777',
  },
  {
    image: 'maracaibo-chinita',
    width: 736,
    height: 552,
    name: 'Monumento a la Chinita',
    title: 'Lo que siempre nos reúne.',
    detail: 'Monumento a Nuestra Señora de Chiquinquirá',
    alt: 'Monumento a la Chinita rodeado de arcos iluminados al anochecer',
    credit: '',
  },
];

export function CityDiscovery() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const photo = active === null ? null : places[active];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia(root);
    media.add('(prefers-reduced-motion: no-preference)', () => {
      for (const row of root.current?.querySelectorAll('.city-reveal') ?? []) {
        gsap.from(row, {
          y: 32,
          opacity: 0,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: { trigger: row, start: 'top 94%', once: true },
        });
      }
    });
    return () => media.revert();
  }, []);

  function movePhoto(direction: number) {
    setActive((current) =>
      current === null
        ? null
        : (current + direction + places.length) % places.length,
    );
  }

  function renderPlace(index: number) {
    const place = places[index];
    return (
      <figure className={`city-place city-place-${index}`} key={place.image}>
        <button
          className="city-photo-button"
          type="button"
          aria-label={`Ampliar foto: ${place.name}`}
          onClick={(event) => {
            lastTrigger.current = event.currentTarget;
            setActive(index);
          }}
        >
          <img
            src={`/images/${place.image}.webp`}
            alt={place.alt}
            width={place.width}
            height={place.height}
            loading="lazy"
            decoding="async"
          />
          <span className="city-photo-location" aria-hidden="true">
            <MapPin size={13} />
            {place.name}
          </span>
          <span className="city-expand" aria-hidden="true">
            <Maximize2 size={16} />
          </span>
        </button>
        <figcaption>
          <span className="city-place-number">0{index + 1}</span>
          <div>
            <h3>{place.title}</h3>
            <p>{place.detail}</p>
          </div>
          {place.credit && <small>Foto: {place.credit}</small>}
        </figcaption>
      </figure>
    );
  }

  return (
    <section
      className="city-discovery"
      id="maracaibo"
      aria-labelledby="city-title"
      ref={root}
    >
      <div className="city-discovery-inner">
        <div className="city-local-label">
          <span>
            <i aria-hidden="true" /> ZULIA, VENEZUELA
          </span>
          <span>LA CIUDAD QUE NOS MUEVE</span>
        </div>
        <div className="city-discovery-heading city-reveal">
          <h2 id="city-title">
            Maracaibo<span>te espera.</span>
          </h2>
          <div className="city-introduction">
            <p>Hay mucho más por descubrir.</p>
            <span>
              Del lago a nuestras calles. De un atardecer a un nuevo recuerdo.
              Sal a vivir la ciudad; nosotros te acompañamos en el camino.
            </span>
            <a href="#city-views">
              Conoce nuestros lugares <ArrowRight size={17} />
            </a>
          </div>
        </div>
        <div className="city-main-views city-reveal" id="city-views">
          {renderPlace(0)}
          {renderPlace(1)}
        </div>
        <div className="city-landmarks-heading">
          <span>ESOS LUGARES QUE SE QUEDAN CONTIGO</span>
          <span>Un pedacito de lo nuestro.</span>
        </div>
        <div className="city-landmarks city-reveal">
          {renderPlace(2)}
          {renderPlace(3)}
          {renderPlace(4)}
        </div>
        <div className="city-discovery-footer">
          <div>
            <span>TU DESTINO. NUESTRA RUTA.</span>
            <p>La próxima parada la eliges tú.</p>
          </div>
          <a href="#flota">
            Recorre Maracaibo <ArrowUpRight size={22} />
          </a>
        </div>
      </div>
      <Dialog
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent
          className="city-lightbox"
          showCloseButton={false}
          finalFocus={lastTrigger}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              movePhoto(1);
            }
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              movePhoto(-1);
            }
          }}
        >
          {photo && (
            <>
              <div className="city-lightbox-top">
                <span>
                  MARACAIBO /{' '}
                  <span aria-live="polite">0{(active ?? 0) + 1} — 05</span>
                </span>
                <DialogClose aria-label="Cerrar galería">
                  <X size={22} />
                </DialogClose>
              </div>
              <img
                src={`/images/${photo.image}.webp`}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
              />
              <div className="city-lightbox-bottom">
                <div>
                  <DialogTitle>{photo.name}</DialogTitle>
                  <DialogDescription>
                    {photo.detail}
                    {photo.credit && ` · Foto: ${photo.credit}`}
                  </DialogDescription>
                </div>
                <div className="city-gallery-controls">
                  <button
                    type="button"
                    aria-label="Foto anterior"
                    onClick={() => movePhoto(-1)}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label="Foto siguiente"
                    onClick={() => movePhoto(1)}
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
