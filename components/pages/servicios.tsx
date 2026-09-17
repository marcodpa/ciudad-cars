'use client';
import { useLanguage } from '@/components/language-provider';
import Link from '@/components/site-link';
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
  const { t } = useLanguage();
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
          <p className="eyebrow">{t('ALQUILER DE VEHÍCULOS')}</p>
          <h2>
            {t('Elige el plan.')}
            <br />
            {t('Nosotros, el carro.')}
          </h2>
          <span className="lime-stroke" />
          <p>
            {t(
              'Para una visita, un viaje de trabajo o unos días en familia. Encuentra un automático de 5 o 7 pasajeros y consulta las fechas que necesitas.',
            )}
          </p>
          <Link className="cta" href="/vehiculos">
            {t('Explorar la flota')}
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="service-benefits">
          <article>
            <CarFront />
            <div>
              <h3>{t('Cinco categorías')}</h3>
              <p>
                {t(
                  'Desde un económico para la ciudad hasta una SUV de siete puestos.',
                )}
              </p>
            </div>
          </article>
          <article>
            <Headset />
            <div>
              <h3>{t('Asistencia de emergencia 24 h')}</h3>
              <p>
                {t(
                  'Durante tu alquiler, nuestro equipo te orienta cuando lo necesitas.',
                )}
              </p>
            </div>
          </article>
          <article>
            <Settings2 />
            <div>
              <h3>{t('Listos para el camino')}</h3>
              <p>
                {t(
                  'Vehículos automáticos con mantenimiento periódico y entrega con tanque lleno.',
                )}
              </p>
            </div>
          </article>
        </div>
      </section>
      <section className="extras-section section-space">
        <div className="page-width">
          <div className="section-heading">
            <p className="eyebrow">{t('A TU MEDIDA')}</p>
            <h2>
              {t('Pequeños detalles.')}
              <br />
              {t('Un mejor viaje.')}
            </h2>
            <p>
              {t(
                'Complementa tu alquiler. Consulta disponibilidad y costo al reservar.',
              )}
            </p>
          </div>
          <div className="extras-grid">
            {extras.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon />
                <h3>{t(title)}</h3>
                <p>{t(text)}</p>
              </article>
            ))}
          </div>
          <a
            className="text-link"
            href={whatsappUrl(
              t(
                'Hola, Ciudad Cars. Quisiera consultar los complementos disponibles para mi alquiler.',
              ),
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Consultar complementos')}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="workshop-section page-width section-space">
        <div className="workshop-intro">
          <Wrench size={38} />
          <p className="eyebrow">{t('TALLER MULTIMARCA')}</p>
          <h2>
            {t('Tu carro también')}
            <br />
            {t('está en casa.')}
          </h2>
          <p>
            {t(
              '¿Tu propio vehículo necesita atención? Nuestro taller ofrece mantenimiento preventivo, diagnóstico y servicios de mecánica.',
            )}
          </p>
          <a
            className="cta"
            href={whatsappUrl(
              t(
                'Hola, Ciudad Cars. Quisiera consultar una cita en el taller. Mi vehículo necesita: ',
              ),
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Consultar cita de taller')}
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="workshop-list">
          <h3>{t('Cuidamos lo que te mueve')}</h3>
          {[
            t('Aceite, filtros y mantenimiento preventivo'),
            t('Revisión y servicio de frenos'),
            t('Aire acondicionado y sistema de enfriamiento'),
            t('Diagnóstico con escáner'),
            t('Motores, transmisiones y repuestos'),
          ].map((text) => (
            <p key={text}>
              <Check size={18} />
              {t(text)}
            </p>
          ))}
          <div className="workshop-note">
            <CarFront size={24} />
            <p>
              {t(
                'Mientras tu carro está en el taller, consulta la opción de alquilar un vehículo de reemplazo.',
              )}
            </p>
          </div>
        </div>
      </section>
      <JourneyCta />
    </main>
  );
}
