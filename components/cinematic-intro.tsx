/* The approved standalone intro, adapted to the existing React page. */
/* eslint-disable next/no-img-element */
/* Media-file and fragment links must remain native anchors. */
/* eslint-disable next/no-html-link-for-pages */
/* Canvas supplies scroll-driven imagery; an img cannot render those frames. */
/* eslint-disable jsx-a11y/prefer-tag-over-role */
'use client';
import { useEffect, useRef } from 'react';
import { mountCinematicIntro } from '@/lib/cinematic-intro';

export function CinematicIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (root) return mountCinematicIntro(root);
  }, []);
  return (
    <div className="cc-cinema" id="inicio" ref={rootRef}>
      <a className="cc-intro-skip" href="#flota">
        Saltar a los vehículos
      </a>
      <section
        className="cc-intro-journey"
        id="recorrido"
        aria-label="Recorrido aéreo de Ciudad Cars"
      >
        <div className="cc-intro-stage">
          <div className="cc-intro-picture">
            {/* A canvas is required for scroll-driven frames; expose its description as an image. */}
            <canvas
              id="cc-intro-film"
              width="1280"
              height="720"
              role="img"
              aria-label="Persecución aérea del Chevrolet Cruze y la Ford Explorer"
            ></canvas>
            <div className="cc-intro-film-vignette" aria-hidden="true"></div>
            <canvas id="cc-intro-film-grain" aria-hidden="true"></canvas>
            <div className="cc-intro-sky-transition" aria-hidden="true"></div>
          </div>
          <div className="cc-intro-shade" aria-hidden="true"></div>
          <div
            className="cc-intro-story-shade cc-intro-shade-left"
            aria-hidden="true"
          ></div>
          <div
            className="cc-intro-story-shade cc-intro-shade-right"
            aria-hidden="true"
          ></div>
          <div className="cc-intro-end-veil" aria-hidden="true"></div>
          <header className="cc-intro-header">
            <a
              className="cc-intro-brand"
              href="#recorrido"
              aria-label="Ciudad Cars, inicio"
            >
              <img
                src="/cinema/logo.png"
                width="427"
                height="74"
                alt="Ciudad Cars · Car Rentals"
              />
            </a>
            <span className="cc-intro-place">
              <i></i> MARACAIBO, VENEZUELA
            </span>
            <a
              className="cc-intro-reservation"
              href="https://www.ciudadcars.com/date-reservation/"
              target="_blank"
              rel="noopener"
            >
              Reserva tu viaje <span>↗</span>
            </a>
          </header>
          <div className="cc-intro-headline">
            <p className="cc-intro-eyebrow">LA LIBERTAD DE MOVERTE.</p>
            <h1>
              <span className="cc-intro-headline-line">Tu viaje</span>
              <span className="cc-intro-headline-line">
                comienza <em>aquí.</em>
              </span>
            </h1>
            <p className="cc-intro-intro">
              Una ciudad por descubrir.
              <br />
              Un camino que empieza contigo.
            </p>
            <a className="cc-intro-text-link" href="#flota">
              Encuentra tu vehículo <span>↗</span>
            </a>
          </div>
          <section
            className="cc-intro-story-panel cc-intro-story-cruze"
            aria-labelledby="cc-intro-cruze-title"
          >
            <p className="cc-intro-eyebrow cc-intro-story-piece">
              <span>01</span> CHEVROLET
            </p>
            <h2 id="cc-intro-cruze-title" className="cc-intro-story-piece">
              Cruze.
            </h2>
            <p className="cc-intro-story-copy cc-intro-story-piece">
              La ciudad.
              <br />A tu ritmo.
            </p>
            <p className="cc-intro-story-spec cc-intro-story-piece">
              5 pasajeros <span>·</span> 2 maletas
            </p>
          </section>
          <section
            className="cc-intro-story-panel cc-intro-story-explorer"
            aria-labelledby="cc-intro-explorer-title"
          >
            <p className="cc-intro-eyebrow cc-intro-story-piece">
              <span>02</span> FORD
            </p>
            <h2 id="cc-intro-explorer-title" className="cc-intro-story-piece">
              Explorer.
            </h2>
            <p className="cc-intro-story-copy cc-intro-story-piece">
              Más espacio.
              <br />
              Más historias juntos.
            </p>
            <p className="cc-intro-story-spec cc-intro-story-piece">
              7 pasajeros <span>·</span> 4 maletas
            </p>
          </section>
          <div className="cc-intro-story-close">
            <p className="cc-intro-eyebrow">EL CAMINO SIGUE.</p>
            <h2>
              El siguiente destino
              <br />
              <em>es tuyo.</em>
            </h2>
            <a href="#flota" className="cc-intro-text-link">
              Elige cómo llegar <span>↓</span>
            </a>
          </div>
          <div className="cc-intro-static-vehicle">
            <span id="cc-intro-category" className="cc-intro-eyebrow">
              01 / CHEVROLET
            </span>
            <h2 id="cc-intro-model">
              Chevrolet <strong>Cruze</strong>
            </h2>
            <p id="cc-intro-tagline">Una nueva perspectiva.</p>
          </div>
          <div className="cc-intro-scene-location">
            ZULIA <span>—</span> VENEZUELA
          </div>
          <output id="cc-intro-load-status">Preparando recorrido…</output>
          <div className="cc-intro-journey-cue">
            <span className="cc-intro-cue-line" aria-hidden="true"></span>
            <span>DESLIZA Y DESCUBRE</span>
            <span aria-hidden="true">↓</span>
          </div>
          <nav
            className="cc-intro-chapter-nav"
            aria-label="Vehículos del recorrido"
          >
            <button type="button" data-scene="0" aria-current="step">
              <span className="cc-intro-chapter-dot" aria-hidden="true"></span>
              <span>
                01 <b>Cruze</b>
              </span>
            </button>
            <button type="button" data-scene="1">
              <span className="cc-intro-chapter-dot" aria-hidden="true"></span>
              <span>
                02 <b>Explorer</b>
              </span>
            </button>
          </nav>
          <span
            id="cc-intro-percentage"
            className="cc-intro-sr-only"
            aria-hidden="true"
          >
            0%
          </span>
        </div>
      </section>

      <div className="cc-intro-utilities">
        <div className="cc-intro-end-actions">
          <button
            id="cc-intro-play"
            type="button"
            aria-label="Reproducir recorrido automáticamente"
          >
            <span id="cc-intro-play-icon">↻</span>{' '}
            <span id="cc-intro-play-label">Recorrer de nuevo</span>
          </button>
          <button id="cc-intro-watch-film" type="button">
            Ver película <span>↗</span>
          </button>
          <button
            id="cc-intro-motion-toggle"
            type="button"
            aria-pressed="false"
          >
            Reducir movimiento
          </button>
          <a href="#recorrido">Volver arriba ↑</a>
        </div>
        <p className="cc-intro-disclosure">
          Escenas recreadas con IA a partir de los vehículos de CC y referencias
          de Maracaibo.
        </p>
      </div>
      <dialog id="cc-intro-movie-dialog" aria-label="Película de Ciudad Cars">
        <button
          id="cc-intro-close-movie"
          type="button"
          aria-label="Cerrar película"
        >
          ✕
        </button>
        <video
          id="cc-intro-movie"
          controls
          muted
          playsInline
          preload="none"
          poster="/cinema/cruze-aerial.jpg"
        >
          <source src="/cinema/ciudad-cars-drone.mp4" type="video/mp4" />
        </video>
      </dialog>
      <noscript>
        <p className="cc-intro-noscript">
          Puedes{' '}
          <a href="/cinema/ciudad-cars-drone.mp4">ver la película completa</a> o{' '}
          <a href="#flota">consultar los vehículos</a>.
        </p>
      </noscript>
    </div>
  );
}
