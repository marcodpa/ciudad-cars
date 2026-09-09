import Link from '@/components/site-link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  ArrowUpRight,
  Baby,
  CarFront,
  Check,
  Fuel,
  Headset,
  Settings2,
  SmartphoneCharging,
  UserRoundPlus,
  Wrench,
} from 'lucide-react';
import { PageIntro } from '@/components/page-intro';
import { JourneyCta } from '@/components/journey-cta';
import { whatsappUrl } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Alquiler, asistencia y taller | Ciudad Cars',
  description:
    'Alquiler de vehículos automáticos en Maracaibo, asistencia de emergencia, complementos para tu viaje y servicio de taller multimarca.',
};
const extras = [
  {
    icon: Baby,
    title: 'Silla para bebé',
    text: 'Cuéntanos la edad del pequeño y consulta las opciones para tu viaje.',
  },
  {
    icon: UserRoundPlus,
    title: 'Conductor adicional',
    text: 'Comparte el volante. Consulta cómo añadirlo a tu alquiler.',
  },
  {
    icon: Fuel,
    title: 'Combustible prepagado',
    text: 'Consulta esta opción al organizar la entrega de tu carro.',
  },
  {
    icon: SmartphoneCharging,
    title: 'Cargador de teléfono',
    text: 'Mantén tus planes conectados. Solicítalo al reservar.',
  },
];
export default function ServicesPage() {
  return (
    <main id="contenido">
      <PageIntro
        label="Servicios"
        title="Tu viaje, con"
        accent="todo a favor."
        description="El carro es el comienzo. Descubre cómo podemos ayudarte antes de salir y durante el camino."
        image="/images/explorer-scene.webp"
      />
      <section className="service-main page-width section-space">
        <div className="section-copy">
          <p className="eyebrow">ALQUILER DE VEHÍCULOS</p>
          <h2>
            Elige el plan.
            <br />
            Nosotros, el carro.
          </h2>
          <span className="lime-stroke" />
          <p>
            Para una visita, un viaje de trabajo o unos días en familia.
            Encuentra un automático de 5 o 7 pasajeros y consulta las fechas que
            necesitas.
          </p>
          <Link className="cta" href="/vehiculos">
            Explorar la flota
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="service-benefits">
          <article>
            <CarFront />
            <div>
              <h3>Cinco categorías</h3>
              <p>
                Desde un económico para la ciudad hasta una SUV de siete
                puestos.
              </p>
            </div>
          </article>
          <article>
            <Headset />
            <div>
              <h3>Asistencia de emergencia 24 h</h3>
              <p>
                Durante tu alquiler, nuestro equipo te orienta cuando lo
                necesitas.
              </p>
            </div>
          </article>
          <article>
            <Settings2 />
            <div>
              <h3>Listos para el camino</h3>
              <p>
                Vehículos automáticos con mantenimiento periódico y entrega con
                tanque lleno.
              </p>
            </div>
          </article>
        </div>
      </section>
      <section className="extras-section section-space">
        <div className="page-width">
          <div className="section-heading">
            <p className="eyebrow">A TU MEDIDA</p>
            <h2>
              Pequeños detalles.
              <br />
              Un mejor viaje.
            </h2>
            <p>
              Complementa tu alquiler. Consulta disponibilidad y costo al
              reservar.
            </p>
          </div>
          <div className="extras-grid">
            {extras.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <a
            className="text-link"
            href={whatsappUrl(
              'Hola, Ciudad Cars. Quisiera consultar los complementos disponibles para mi alquiler.',
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar complementos
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="workshop-section page-width section-space">
        <div className="workshop-intro">
          <Wrench size={38} />
          <p className="eyebrow">TALLER MULTIMARCA</p>
          <h2>
            Tu carro también
            <br />
            está en casa.
          </h2>
          <p>
            ¿Tu propio vehículo necesita atención? Nuestro taller ofrece
            mantenimiento preventivo, diagnóstico y servicios de mecánica.
          </p>
          <a
            className="cta"
            href={whatsappUrl(
              'Hola, Ciudad Cars. Quisiera consultar una cita en el taller. Mi vehículo necesita: ',
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar cita de taller
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="workshop-list">
          <h3>Cuidamos lo que te mueve</h3>
          {[
            'Aceite, filtros y mantenimiento preventivo',
            'Revisión y servicio de frenos',
            'Aire acondicionado y sistema de enfriamiento',
            'Diagnóstico con escáner',
            'Motores, transmisiones y repuestos',
          ].map((text) => (
            <p key={text}>
              <Check size={18} />
              {text}
            </p>
          ))}
          <div className="workshop-note">
            <CarFront size={24} />
            <p>
              Mientras tu carro está en el taller, consulta la opción de
              alquilar un vehículo de reemplazo.
            </p>
          </div>
        </div>
      </section>
      <JourneyCta />
    </main>
  );
}
