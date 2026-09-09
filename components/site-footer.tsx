/* Preoptimized local assets retain their reserved dimensions and transparent pixels. */
/* eslint-disable next/no-img-element */
import Link from '@/components/site-link';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { company, whatsappUrl } from '@/lib/company';

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contacto">
      <div className="page-width footer-grid">
        <div className="footer-brand">
          <Link href="/" aria-label="Ciudad Cars, inicio">
            <img
              src="/images/logo-transparent.png"
              width="427"
              height="74"
              alt="Ciudad Cars"
            />
          </Link>
          <p>
            Tu destino. Nuestra ruta.
            <br />
            Contigo en Maracaibo desde 1984.
          </p>
        </div>
        <div>
          <h2>Explora Ciudad Cars</h2>
          <Link href="/vehiculos">Nuestros vehículos</Link>
          <Link href="/servicios">Servicios</Link>
          <Link href="/quienes-somos">Quiénes somos</Link>
          <Link href="/contacto">Contacto</Link>
        </div>
        <div>
          <h2>Hablemos de tu viaje</h2>
          <a href={company.tel}>
            <Phone size={16} />
            {company.phone}
          </a>
          <a href={'mailto:' + company.email}>
            <Mail size={16} />
            {company.email}
          </a>
          <a
            href={company.directions}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin size={17} />
            <span>
              Calle 70, Bella Vista
              <br />
              Maracaibo, Venezuela
            </span>
          </a>
        </div>
        <div className="footer-invitation">
          <span className="handwritten">
            Maracaibo
            <br />
            nos mueve.
          </span>
          <a
            className="footer-whatsapp"
            href={whatsappUrl(
              'Hola, Ciudad Cars. Quisiera información para mi próximo viaje.',
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Conversemos <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
      <div className="footer-legal page-width">
        <span>© {new Date().getFullYear()} Ciudad Cars</span>
        <span>Hecho para moverte con libertad.</span>
      </div>
    </footer>
  );
}
