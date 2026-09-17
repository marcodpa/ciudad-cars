'use client';
import { useLanguage } from '@/components/language-provider';
import Link from '@/components/site-link';
import { ArrowUpRight, CarFront } from 'lucide-react';
import { whatsappUrl } from '@/lib/company';

export function JourneyCta() {
  const { t } = useLanguage();
  return (
    <section className="journey-cta">
      <div className="page-width journey-cta-inner">
        <div>
          <p className="eyebrow">{t('EL SIGUIENTE PASO ES TUYO')}</p>
          <h2>{t('¿A dónde vamos?')}</h2>
          <p>{t('Cuéntanos tu plan. Te ayudamos a encontrar tu carro.')}</p>
        </div>
        <div className="action-row">
          <Link href="/vehiculos" className="cta">
            <CarFront size={20} />
            {t('Ver vehículos')}
          </Link>
          <a
            className="cta outline-cta"
            href={whatsappUrl(
              t(
                'Hola, Ciudad Cars. Quisiera ayuda para elegir un carro para mi viaje.',
              ),
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('Hablemos por WhatsApp')}
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
