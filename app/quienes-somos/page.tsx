/* Preoptimized local assets retain their reserved dimensions and transparent pixels. */
/* eslint-disable next/no-img-element */
import Link from '@/components/site-link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  HeartHandshake,
  MapPin,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { PageIntro } from '@/components/page-intro';
import { JourneyCta } from '@/components/journey-cta';

export const metadata: Metadata = {
  title: 'Quiénes somos | Ciudad Cars, desde 1984',
  description:
    'Nacimos en Maracaibo en 1984. Conoce la historia de Ciudad Cars y nuestra manera cercana de acompañarte en cada viaje.',
};
export default function AboutPage() {
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
            alt="Edificios y avenidas de Maracaibo, nuestra ciudad de origen"
            width="736"
            height="552"
            loading="lazy"
          />
          <div className="story-stamp">
            <span>Desde</span>
            <strong>1984</strong>
            <span>MARACAIBO, VENEZUELA</span>
          </div>
        </div>
        <div className="section-copy">
          <p className="eyebrow">NUESTRA HISTORIA</p>
          <h2>
            Una ciudad.
            <br />
            Muchos caminos.
          </h2>
          <span className="lime-stroke" />
          <p>
            Ciudad Cars nació en Maracaibo el 10 de agosto de 1984, como un
            showroom dedicado a la compra y venta de vehículos nuevos y usados.
          </p>
          <p>
            Con el tiempo, el camino nos llevó al arrendamiento y al alquiler de
            carros. Hoy seguimos aquí, ayudándote a moverte por la ciudad con
            atención local y opciones para cada viaje.
          </p>
          <Link className="text-link" href="/vehiculos">
            Conoce nuestros vehículos
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="brand-values">
        <div className="page-width">
          <div className="section-heading">
            <p className="eyebrow">NUESTRA FORMA DE ACOMPAÑARTE</p>
            <h2>
              La confianza también
              <br />
              hace parte del viaje.
            </h2>
          </div>
          <div className="values-grid">
            <article>
              <MapPin />
              <span>01</span>
              <h3>Somos de aquí</h3>
              <p>
                Maracaibo es nuestro punto de partida. Te atiende un equipo que
                comparte tu ciudad y entiende tus planes.
              </p>
            </article>
            <article>
              <HeartHandshake />
              <span>02</span>
              <h3>Hablemos de tu plan</h3>
              <p>
                Nos cuentas qué necesitas y te orientamos para elegir la
                categoría, las fechas y los detalles de tu alquiler.
              </p>
            </article>
            <article>
              <ShieldCheck />
              <span>03</span>
              <h3>Seguimos contigo</h3>
              <p>
                Vehículos con mantenimiento y asistencia de emergencia durante
                tu alquiler para acompañarte en el camino.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="history-strip page-width section-space">
        <div className="section-copy">
          <p className="eyebrow">EL CAMINO RECORRIDO</p>
          <h2>
            Siempre en
            <br />
            movimiento.
          </h2>
        </div>
        <div className="history-steps">
          <article>
            <span>1984</span>
            <h3>Abrimos las puertas</h3>
            <p>Compra y venta de vehículos en Maracaibo.</p>
          </article>
          <article>
            <span>Un nuevo rumbo</span>
            <h3>Más formas de moverte</h3>
            <p>Sumamos el arrendamiento y el alquiler de carros.</p>
          </article>
          <article>
            <span>Hoy</span>
            <h3>Tu próximo destino</h3>
            <p>Cinco categorías y un equipo dispuesto a ayudarte.</p>
          </article>
        </div>
        <Route className="history-icon" aria-hidden="true" />
      </section>
      <JourneyCta />
    </main>
  );
}
