/* Preoptimized local photograph with reserved dimensions. */
/* eslint-disable next/no-img-element */
import type { Metadata } from 'next';
import { CarFront, MapPin, Users } from 'lucide-react';
import Link from '@/components/site-link';
import { VehicleCatalog } from '@/components/vehicle-catalog';

export const metadata: Metadata = {
  title: 'Vehículos y tarifas | Ciudad Cars Maracaibo',
  description:
    'Conoce nuestros cinco vehículos o similares: Lancer, Cruze, Camry, Cherokee y Explorer. Automáticos, de 5 a 7 pasajeros, desde $75 por día.',
};
export default function VehiclesPage() {
  return (
    <main id="contenido" className="vehicles-page">
      <section className="vehicles-intro" aria-labelledby="vehicles-title">
        <div className="vehicles-intro-scene" aria-hidden="true">
          <img
            src="/images/showroom-background.webp"
            alt=""
            width="1859"
            height="846"
            fetchPriority="high"
          />
          <span>
            Maracaibo,
            <br />
            siempre en movimiento.
          </span>
        </div>
        <div className="page-width vehicles-intro-content">
          <nav className="vehicles-breadcrumbs" aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Vehículos</span>
          </nav>
          <h1 id="vehicles-title">Un carro para cada plan.</h1>
          <p className="vehicles-intro-description">
            Elige el espacio y la comodidad que van contigo.
          </p>
          <ul className="vehicles-intro-benefits" aria-label="Nuestra flota">
            <li>
              <CarFront aria-hidden="true" />
              <span>
                Todos
                <br />
                automáticos
              </span>
            </li>
            <li>
              <Users aria-hidden="true" />
              <span>
                De 5 a 7<br />
                pasajeros
              </span>
            </li>
            <li>
              <MapPin aria-hidden="true" />
              <span>
                Atención local
                <br />
                en Maracaibo
              </span>
            </li>
          </ul>
        </div>
      </section>
      <VehicleCatalog />
    </main>
  );
}
