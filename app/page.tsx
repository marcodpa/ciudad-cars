/* Local images are preoptimized and dimensioned; no remote image server is needed. */
/* eslint-disable next/no-img-element */
import {
  ArrowRight,
  ArrowDown,
  MapPin,
  CalendarDays,
  CarFront,
  ShieldCheck,
  Headset,
  ThumbsUp,
  Palmtree,
  BriefcaseBusiness,
  Users,
  MessageCircle,
  KeyRound,
} from 'lucide-react';
import { FleetExperience } from '@/components/fleet-experience';
import { HeroMotion } from '@/components/hero-motion';
import { fleet } from '@/lib/fleet';

const reservationUrl = 'https://www.ciudadcars.com/date-reservation/';
export default function Home() {
  return (
    <>
      <main id="contenido">
        <HeroMotion />
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <picture>
            <source
              media="(max-width: 760px)"
              srcSet="/images/maracaibo-dusk.webp"
            />
            <img
              className="hero-backdrop"
              src={fleet[0].image}
              width="1859"
              height="846"
              alt="Mitsubishi Lancer en un escenario ilustrativo de Maracaibo al atardecer"
              fetchPriority="high"
            />
          </picture>
          <div className="hero-shade" />
          <div className="hero-content page-width">
            <p className="eyebrow">LIBERTAD PARA LLEGAR MÁS LEJOS</p>
            <h1 id="hero-title">
              Alquila tu carro
              <br />
              en <span>Maracaibo</span>
            </h1>
            <p>
              Vehículos automáticos, confiables y a tu alcance.
              <br className="desktop-break" /> Reserva fácil, con atención local
              <br className="desktop-break" /> y asistencia en todo momento.
            </p>
            <div className="hero-actions">
              <a className="cta" href={reservationUrl}>
                <CalendarDays size={21} /> Reservar ahora{' '}
                <ArrowRight size={19} />
              </a>
              <a className="cta outline-cta" href="#flota">
                <CarFront size={23} /> Ver vehículos
              </a>
            </div>
            <div className="hero-benefits">
              <span>
                <ShieldCheck /> Seguro y confiable
              </span>
              <span>
                <Headset /> Asistencia en ruta
              </span>
              <span>
                <ThumbsUp /> Atención cercana
              </span>
            </div>
          </div>
          <span className="handwritten hero-note">
            Maracaibo
            <br />
            <span>nos mueve</span>
          </span>
          <div className="hero-vehicle">
            <img
              src={fleet[0].mobileImage}
              alt="Mitsubishi Lancer, o similar"
              width="1080"
              height="520"
              loading="lazy"
            />
          </div>
          <div className="hero-bottom page-width">
            <a href="#viaje" className="scroll-cue">
              <ArrowDown size={16} /> Descubre tu próximo viaje
            </a>
            <span className="hero-location">
              <MapPin size={21} />
              <span>
                Inspirado en Maracaibo
                <small>Nuestra ciudad. Nuestro punto de partida.</small>
              </span>
            </span>
          </div>
        </section>

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
        <section
          className="city-discover page-width section-space"
          id="maracaibo"
          aria-labelledby="city-title"
        >
          <div className="city-discover-heading">
            <div>
              <p className="eyebrow">
                TANTAS GANAS DE VOLVER. TANTO POR CONOCER.
              </p>
              <h2 id="city-title">
                Maracaibo
                <br />
                <span>te espera.</span>
              </h2>
            </div>
            <p>
              Un atardecer frente al lago, nuestras calles y la tradición de
              siempre. Tú eliges el plan; nosotros te acompañamos en el camino.
            </p>
          </div>
          <div className="city-photo-grid">
            <figure className="city-photo city-photo-lake">
              <img
                src="/images/maracaibo-puente-atardecer.webp"
                alt="Atardecer sobre el Lago de Maracaibo junto al puente General Rafael Urdaneta"
                width="720"
                height="689"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span className="eyebrow">NUESTRO LAGO</span>
                <h3>Un atardecer que se queda contigo.</h3>
                <p>Puente General Rafael Urdaneta</p>
              </figcaption>
            </figure>
            <figure className="city-photo city-photo-basilica">
              <img
                src="/images/maracaibo-basilica.webp"
                alt="Fachada de la Basílica de Nuestra Señora de Chiquinquirá en Maracaibo"
                width="595"
                height="596"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span className="eyebrow">NUESTRAS RAÍCES</span>
                <h3>La tradición nos reúne.</h3>
                <p>Basílica de Nuestra Señora de Chiquinquirá</p>
              </figcaption>
            </figure>
            <figure className="city-photo city-photo-chinita">
              <img
                src="/images/maracaibo-chinita.webp"
                alt="Monumento a Nuestra Señora de Chiquinquirá iluminado al anochecer"
                width="736"
                height="552"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span className="eyebrow">NUESTRA GENTE</span>
                <h3>Siempre hay un motivo para volver.</h3>
                <p>Monumento a la Chinita</p>
              </figcaption>
            </figure>
          </div>
          <div className="city-discover-footer">
            <span className="handwritten">Tu destino. Nuestra ruta.</span>
            <a className="text-link" href="#flota">
              Encuentra el carro para tu plan <ArrowRight size={18} />
            </a>
          </div>
        </section>
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
