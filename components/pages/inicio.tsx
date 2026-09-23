'use client';
import { useLanguage } from '@/components/language-provider';
/* Local images are preoptimized and dimensioned; no remote image server is needed. */
/* eslint-disable next/no-img-element */
import { ArrowRight, CarFront, MessageCircle, KeyRound } from 'lucide-react';
import { FleetExperience } from '@/components/fleet-experience';
import { CinematicIntro } from '@/components/cinematic-intro';
import { CityDiscovery } from '@/components/city-discovery';
import { HomeTrust } from '@/components/pages/home-trust';

export default function Home() {
  const { t } = useLanguage();
  return (
    <>
      <main id="contenido">
        <CinematicIntro />
        <FleetExperience />

        <section id="nosotros" className="how-it-works">
          <div className="page-width how-inner">
            <div className="how-heading">
              <p className="eyebrow">{t('CONTIGO DESDE 1984')}</p>
              <h2>
                {t('Más fácil.')}
                <br />
                {t('Más cerca.')}
              </h2>
              <p>{t('Tu viaje empieza con nosotros.')}</p>
            </div>
            <div className="how-step">
              <CarFront />
              <h3>{t('Elige tu carro')}</h3>
              <p>{t('Cinco categorías para encontrar la que va contigo.')}</p>
            </div>
            <ArrowRight className="step-arrow" />
            <div className="how-step">
              <MessageCircle />
              <h3>{t('Cuéntanos tu plan')}</h3>
              <p>{t('Confirmamos las fechas y los detalles de tu reserva.')}</p>
            </div>
            <ArrowRight className="step-arrow" />
            <div className="how-step">
              <KeyRound />
              <h3>{t('Arranca tu viaje')}</h3>
              <p>{t('Recibe tu carro y disfruta de Maracaibo.')}</p>
            </div>
          </div>
        </section>
        <CityDiscovery />
        <HomeTrust />
        <section className="city-banner" aria-label={t('Maracaibo nos mueve')}>
          <span className="handwritten">
            {t('Gente real.')}
            <br />
            {t('Destinos reales.')}
          </span>
          <div>
            <img
              src="/images/logo-transparent.png"
              alt="Ciudad Cars"
              width="427"
              height="74"
            />
            <p>{t('MARACAIBO NOS MUEVE')}</p>
            <span className="lime-stroke" />
          </div>
        </section>
      </main>
    </>
  );
}
