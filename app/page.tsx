/* Local images are preoptimized and dimensioned; no remote image server is needed. */
/* eslint-disable next/no-img-element */
import {
  ArrowRight,
  CarFront,
  Palmtree,
  BriefcaseBusiness,
  Users,
  MessageCircle,
  KeyRound,
} from 'lucide-react';
import { FleetExperience } from '@/components/fleet-experience';
import { CinematicIntro } from '@/components/cinematic-intro';
import { SiteHeader } from '@/components/site-header';
import { CityDiscovery } from '@/components/city-discovery';

export default function Home() {
  return (
    <>
      <main id="contenido">
        <CinematicIntro />
        <SiteHeader afterIntro />

        <section className="journey page-width" id="viaje">
          <div className="journey-copy">
            <p className="eyebrow">MÁS QUE UN ALQUILER</p>
            <h2>
              Tu viaje
              <br />
              comienza aquí
            </h2>
            <span className="lime-stroke" />
            <p>
              Ya sea por turismo, negocios o en familia, en Ciudad Cars tienes
              la libertad de moverte por Maracaibo y sus alrededores con un
              carro para cada plan.
            </p>
          </div>
          <div className="journey-options">
            <a href="#flota" className="journey-card">
              <Palmtree />
              <h3>Turismo</h3>
              <p>Descubre Maracaibo, sus paisajes y su gente.</p>
            </a>
            <a href="#flota" className="journey-card">
              <BriefcaseBusiness />
              <h3>Negocios</h3>
              <p>Muévete con libertad y a tu ritmo.</p>
            </a>
            <a href="#flota" className="journey-card">
              <Users />
              <h3>Familia</h3>
              <p>Más espacio para lo que realmente importa.</p>
            </a>
          </div>
          <span className="handwritten journey-note">
            La ciudad
            <br />
            te espera
          </span>
        </section>

        <FleetExperience />

        <section id="nosotros" className="how-it-works">
          <div className="page-width how-inner">
            <div className="how-heading">
              <p className="eyebrow">CONTIGO DESDE 1984</p>
              <h2>
                Más fácil.
                <br />
                Más cerca.
              </h2>
              <p>Tu viaje empieza con nosotros.</p>
            </div>
            <div className="how-step">
              <CarFront />
              <h3>Elige tu carro</h3>
              <p>Cinco categorías para encontrar la que va contigo.</p>
            </div>
            <ArrowRight className="step-arrow" />
            <div className="how-step">
              <MessageCircle />
              <h3>Cuéntanos tu plan</h3>
              <p>Confirmamos las fechas y los detalles de tu reserva.</p>
            </div>
            <ArrowRight className="step-arrow" />
            <div className="how-step">
              <KeyRound />
              <h3>Arranca tu viaje</h3>
              <p>Recibe tu carro y disfruta de Maracaibo.</p>
            </div>
          </div>
        </section>
        <CityDiscovery />
        <section className="city-banner" aria-label="Maracaibo nos mueve">
          <span className="handwritten">
            Gente real.
            <br />
            Destinos reales.
          </span>
          <div>
            <img
              src="/images/logo-transparent.png"
              alt="Ciudad Cars"
              width="427"
              height="74"
            />
            <p>MARACAIBO NOS MUEVE</p>
            <span className="lime-stroke" />
          </div>
        </section>
      </main>
    </>
  );
}
