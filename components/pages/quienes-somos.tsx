'use client';
import { useLanguage } from '@/components/language-provider';
/* Preoptimized local assets retain their reserved dimensions and transparent pixels. */
/* eslint-disable next/no-img-element */
import Link from '@/components/site-link';
import {
  ArrowRight,
  HeartHandshake,
  MapPin,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { PageIntro } from '@/components/page-intro';
import { JourneyCta } from '@/components/journey-cta';

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <main id="contenido">
      <PageIntro
        label="Quiénes somos"
        title="De Maracaibo."
        accent="Contigo en el camino."
        description="Desde 1984 compartimos algo más que carros: las ganas de llegar a tu próximo destino."
      />
      <section className="about-story page-width section-space">
        <div className="story-photo">
          <img
            src="/images/maracaibo-ciudad.webp"
            alt={t(
              'Edificios y avenidas de Maracaibo, nuestra ciudad de origen',
            )}
            width="736"
            height="552"
            loading="lazy"
          />
          <div className="story-stamp">
            <span>{t('Desde')}</span>
            <strong>1984</strong>
            <span>MARACAIBO, VENEZUELA</span>
          </div>
        </div>
        <div className="section-copy">
          <p className="eyebrow">{t('NUESTRA HISTORIA')}</p>
          <h2>
            {t('Una ciudad.')}
            <br />
            {t('Muchos caminos.')}
          </h2>
          <span className="lime-stroke" />
          <p>
            {t(
              'Ciudad Cars nació en Maracaibo el 10 de agosto de 1984, como un showroom dedicado a la compra y venta de vehículos nuevos y usados.',
            )}
          </p>
          <p>
            {t(
              'Con el tiempo, el camino nos llevó al arrendamiento y al alquiler de carros. Hoy seguimos aquí, ayudándote a moverte por la ciudad con atención local y opciones para cada viaje.',
            )}
          </p>
          <Link className="text-link" href="/vehiculos">
            {t('Conoce nuestros vehículos')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="brand-values">
        <div className="page-width">
          <div className="section-heading">
            <p className="eyebrow">{t('NUESTRA FORMA DE ACOMPAÑARTE')}</p>
            <h2>
              {t('La confianza también')}
              <br />
              {t('hace parte del viaje.')}
            </h2>
          </div>
          <div className="values-grid">
            <article>
              <MapPin />
              <span>01</span>
              <h3>{t('Somos de aquí')}</h3>
              <p>
                {t(
                  'Maracaibo es nuestro punto de partida. Te atiende un equipo que comparte tu ciudad y entiende tus planes.',
                )}
              </p>
            </article>
            <article>
              <HeartHandshake />
              <span>02</span>
              <h3>{t('Hablemos de tu plan')}</h3>
              <p>
                {t(
                  'Nos cuentas qué necesitas y te orientamos para elegir la categoría, las fechas y los detalles de tu alquiler.',
                )}
              </p>
            </article>
            <article>
              <ShieldCheck />
              <span>03</span>
              <h3>{t('Seguimos contigo')}</h3>
              <p>
                {t(
                  'Vehículos con mantenimiento y asistencia de emergencia durante tu alquiler para acompañarte en el camino.',
                )}
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="history-strip page-width section-space">
        <div className="section-copy">
          <p className="eyebrow">{t('EL CAMINO RECORRIDO')}</p>
          <h2>
            {t('Siempre en')}
            <br />
            {t('movimiento.')}
          </h2>
        </div>
        <div className="history-steps">
          <article>
            <span>1984</span>
            <h3>{t('Abrimos las puertas')}</h3>
            <p>{t('Compra y venta de vehículos en Maracaibo.')}</p>
          </article>
          <article>
            <span>{t('Un nuevo rumbo')}</span>
            <h3>{t('Más formas de moverte')}</h3>
            <p>{t('Sumamos el arrendamiento y el alquiler de carros.')}</p>
          </article>
          <article>
            <span>{t('Hoy')}</span>
            <h3>{t('Tu próximo destino')}</h3>
            <p>{t('Cinco categorías y un equipo dispuesto a ayudarte.')}</p>
          </article>
        </div>
        <Route className="history-icon" aria-hidden="true" />
      </section>
      <JourneyCta />
    </main>
  );
}
