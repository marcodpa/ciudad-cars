/* Original footage, integrated into the homepage's scroll narrative. */
/* eslint-disable next/no-img-element */
/* Media-file and fragment links must remain native anchors. */
/* eslint-disable next/no-html-link-for-pages */
/* Canvas supplies scroll-driven imagery; an img cannot render those frames. */
/* eslint-disable jsx-a11y/prefer-tag-over-role */
'use client';
import { useLanguage } from '@/components/language-provider';
import { useEffect, useRef } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  Palmtree,
  Users,
} from 'lucide-react';
import { mountCinematicIntro } from '@/lib/cinematic-intro';

export function CinematicIntro() {
  const { t, language } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (root) return mountCinematicIntro(root);
  }, []);
  useEffect(() => {
    rootRef.current?.dispatchEvent(new Event('languagechange'));
  }, [language]);
  return (
    <div
      className="cc-cinema"
      id="inicio"
      ref={rootRef}
      data-language={language}
    >
      <a className="cc-intro-skip" href="#flota">
        {t('Saltar a los vehículos')}
      </a>
      <section
        className="cc-intro-journey"
        id="recorrido"
        aria-label={t('Recorrido aéreo de Ciudad Cars')}
      >
        <span id="viaje" className="cc-intro-plans-anchor" aria-hidden="true" />
        <div className="cc-intro-stage">
          <div className="cc-intro-picture">
            {/* A canvas is required for scroll-driven frames; expose its description as an image. */}
            <canvas
              id="cc-intro-film"
              width="1280"
              height="720"
              role="img"
              aria-label={t(
                'Persecución aérea del Chevrolet Cruze y la Ford Explorer',
              )}
            ></canvas>
          </div>
          <div className="cc-intro-headline">
            <p className="cc-intro-eyebrow">MARACAIBO, VENEZUELA</p>
            <h1>
              <span className="cc-intro-headline-line">{t('Tu viaje')}</span>
              <span className="cc-intro-headline-line">
                {t('comienza ')}
                <em>{t('aquí.')}</em>
              </span>
            </h1>
            <p className="cc-intro-intro">
              {t('Alquila tu carro. Descubre la ciudad.')}
              <br />
              {t('Un camino que empieza contigo.')}
            </p>
            <a className="cc-intro-text-link" href="#flota">
              {t('Encuentra tu vehículo')}{' '}
              <ArrowUpRight size={18} aria-hidden="true" />
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
              {t('La ciudad.')}
              <br />
              {t('A tu ritmo.')}
            </p>
            <p className="cc-intro-story-spec cc-intro-story-piece">
              {t('5 pasajeros ')}
              <span>·</span>
              {t(' 2 maletas')}
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
              {t('Más espacio.')}
              <br />
              {t('Más historias juntos.')}
            </p>
            <p className="cc-intro-story-spec cc-intro-story-piece">
              {t('7 pasajeros ')}
              <span>·</span>
              {t(' 4 maletas')}
            </p>
          </section>
          <section
            className="cc-intro-story-close"
            aria-labelledby="cc-intro-plans-title"
          >
            <p className="cc-intro-eyebrow">{t('TÚ ELIGES EL DESTINO.')}</p>
            <h2 id="cc-intro-plans-title">
              {t('Un carro')}
              <br />
              {t('para cada plan.')}
            </h2>
            <div className="cc-intro-plans">
              <a href="#flota">
                <Palmtree aria-hidden="true" />
                <span>
                  <strong>{t('Turismo')}</strong>
                  <small>{t('Descubre Maracaibo.')}</small>
                </span>
              </a>
              <a href="#flota">
                <BriefcaseBusiness aria-hidden="true" />
                <span>
                  <strong>{t('Negocios')}</strong>
                  <small>{t('Muévete a tu ritmo.')}</small>
                </span>
              </a>
              <a href="#flota">
                <Users aria-hidden="true" />
                <span>
                  <strong>{t('Familia')}</strong>
                  <small>{t('Más espacio para compartir.')}</small>
                </span>
              </a>
            </div>
            <a href="#flota" className="cc-intro-text-link">
              {t('Conoce nuestros vehículos')}{' '}
              <ArrowDown size={18} aria-hidden="true" />
            </a>
          </section>
          <div className="cc-intro-static-vehicle">
            <span id="cc-intro-category" className="cc-intro-eyebrow">
              01 / CHEVROLET
            </span>
            <h2 id="cc-intro-model">
              Chevrolet <strong>Cruze</strong>
            </h2>
            <p id="cc-intro-tagline">{t('Una nueva perspectiva.')}</p>
          </div>
          <output id="cc-intro-load-status">
            {t('Preparando recorrido…')}
          </output>
          <div className="cc-intro-journey-cue">
            <span className="cc-intro-cue-line" aria-hidden="true"></span>
            <span>{t('DESLIZA Y DESCUBRE')}</span>
            <span aria-hidden="true">↓</span>
          </div>
          <nav
            className="cc-intro-chapter-nav"
            aria-label={t('Vehículos del recorrido')}
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
          <div className="cc-intro-scroll-progress" aria-hidden="true">
            <span />
          </div>
          <a className="cc-intro-skip-tour" href="#flota" data-skip-tour>
            {t('Saltar recorrido')}
            <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
      <noscript>
        <p className="cc-intro-noscript">
          {t('Puedes')}{' '}
          <a href="/cinema/ciudad-cars-drone.mp4">
            {t('ver la película completa')}
          </a>
          {t(' o')} <a href="#flota">{t('consultar los vehículos')}</a>.
        </p>
      </noscript>
    </div>
  );
}
