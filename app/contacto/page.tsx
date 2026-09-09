/* Preoptimized local assets retain their reserved dimensions and transparent pixels. */
/* eslint-disable next/no-img-element */
import type { Metadata } from 'next';
import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { PageIntro } from '@/components/page-intro';
import { ContactForm } from '@/components/contact-form';
import { company, whatsappUrl } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Contacto y ubicación | Ciudad Cars Maracaibo',
  description:
    'Habla con Ciudad Cars por WhatsApp al +58 414 651-1446. Visítanos en Calle 70, Bella Vista, Maracaibo. Alquiler y servicios para tu vehículo.',
};
export default function ContactPage() {
  return (
    <main id="contenido">
      <PageIntro
        label="Contacto"
        title="Tu próximo viaje"
        accent="comienza hablando."
        description="Estamos aquí, en Maracaibo, para ayudarte a elegir tu carro y organizar los detalles."
        compact
      />
      <section className="contact-layout page-width section-space">
        <div className="contact-information">
          <p className="eyebrow">ESTAMOS CERCA</p>
          <h2>
            Hablemos
            <br />
            de tu destino.
          </h2>
          <a
            className="contact-whatsapp"
            href={whatsappUrl(
              'Hola, Ciudad Cars. Quisiera información para mi próximo viaje.',
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle />
            <div>
              <span>Escríbenos por WhatsApp</span>
              <strong>{company.phone}</strong>
            </div>
            <ArrowUpRight size={20} />
          </a>
          <div className="contact-channel">
            <Phone />
            <div>
              <h3>Una llamada y arrancamos</h3>
              <a href={company.tel}>{company.phone}</a>
            </div>
          </div>
          <div className="contact-channel">
            <Mail />
            <div>
              <h3>También por correo</h3>
              <a href={'mailto:' + company.email}>{company.email}</a>
            </div>
          </div>
          <div className="contact-channel">
            <MapPin />
            <div>
              <h3>Visítanos en Bella Vista</h3>
              <p>{company.address}</p>
            </div>
          </div>
          <div className="contact-channel">
            <Clock3 />
            <div>
              <h3>Horario de oficina</h3>
              <dl className="office-hours">
                <div>
                  <dt>Lunes a viernes</dt>
                  <dd>8:00 a. m. – 6:00 p. m.</dd>
                </div>
                <div>
                  <dt>Sábados</dt>
                  <dd>8:00 a. m. – 12:00 p. m.</dd>
                </div>
                <div>
                  <dt>Domingos</dt>
                  <dd>Cerrado</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <ContactForm />
      </section>
      <section className="contact-location page-width">
        <div className="location-photo">
          <img
            src="/images/maracaibo-el-milagro.webp"
            alt="La avenida El Milagro de Maracaibo y el lago al fondo"
            width="482"
            height="700"
            loading="lazy"
          />
          <span className="handwritten">
            El Milagro.
            <br />
            Así se vive Maracaibo.
          </span>
        </div>
        <div className="location-copy">
          <MapPin size={32} />
          <p className="eyebrow">TE ESPERAMOS</p>
          <h2>
            Tu punto
            <br />
            de partida.
          </h2>
          <p>{company.address}</p>
          <a
            className="cta"
            href={company.directions}
            target="_blank"
            rel="noopener noreferrer"
          >
            Cómo llegar
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}
