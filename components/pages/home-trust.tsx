'use client';

import { ArrowUpRight, Plus, Star } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import Link from '@/components/site-link';
import { googleReviews, homeFaq } from '@/lib/home-content.js';
import { whatsappUrl } from '@/lib/company';

export function HomeTrust() {
  const { language } = useLanguage();
  const en = language === 'en';
  return (
    <>
      <section
        id="opiniones"
        className="home-reviews"
        aria-labelledby="reviews-title"
      >
        <div className="page-width">
          <div className="trust-heading">
            <div>
              <p className="eyebrow">
                {en ? 'REVIEWS ON GOOGLE' : 'RESEÑAS EN GOOGLE'}
              </p>
              <h2 id="reviews-title">
                {en
                  ? 'They have already taken the wheel.'
                  : 'Ellos ya tomaron el volante.'}
              </h2>
              <p>
                {en
                  ? 'A few words from those who travelled with Ciudad Cars.'
                  : 'Unas palabras de quienes viajaron con Ciudad Cars.'}
              </p>
            </div>
            <a
              className="google-score"
              href={googleReviews.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>
                <strong>{en ? '4.8' : '4,8'}</strong>
                <span> / 5</span>
                <Star aria-hidden="true" fill="currentColor" />
              </span>
              <span>
                {googleReviews.count}{' '}
                {en ? 'reviews on Google' : 'opiniones en Google'}{' '}
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </a>
          </div>
          <div className="review-grid">
            {googleReviews.reviews.map((review) => (
              <article className="review-card" key={review.url}>
                <div className="review-person">
                  <span className="review-avatar" aria-hidden="true">
                    {review.initials}
                  </span>
                  <h3>{review.author}</h3>
                </div>
                <div className="review-stars">
                  <span className="review-rating-label">
                    {en ? '5 out of 5 stars' : '5 de 5 estrellas'}
                  </span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote lang="es">“{review.excerpt}”</blockquote>
                <a
                  href={review.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${en ? 'Read the full review by' : 'Leer reseña completa de'} ${review.author}`}
                >
                  {en ? 'Read the full review' : 'Leer reseña completa'}{' '}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
          <p className="reviews-source">
            {en
              ? 'Selected excerpts in their original language. Rating and review count checked on Google Maps on '
              : 'Selección de fragmentos originales. Puntuación y número de opiniones consultados en Google Maps el '}
            <time dateTime={googleReviews.checkedAt}>
              {en ? '23 September 2026' : '23 de septiembre de 2026'}
            </time>
            .{' '}
            {en ? 'These figures may change.' : 'Estas cifras pueden cambiar.'}
          </p>
        </div>
      </section>
      <section
        id="preguntas-frecuentes"
        className="home-faq"
        aria-labelledby="faq-title"
      >
        <div className="page-width faq-layout">
          <div className="faq-intro">
            <p className="eyebrow">
              {en ? 'BEFORE YOUR TRIP' : 'ANTES DE TU VIAJE'}
            </p>
            <h2 id="faq-title">
              {en ? 'Frequently asked questions.' : 'Preguntas frecuentes.'}
            </h2>
            <p>
              {en
                ? 'Everything you need to request a car rental in Maracaibo, in one place.'
                : 'Lo que necesitas para solicitar tu alquiler de carros en Maracaibo, en un solo lugar.'}
            </p>
            <Link className="trust-link" href="/vehiculos">
              {en ? 'Explore vehicles' : 'Ver vehículos'}{' '}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <a
              className="trust-link"
              href={whatsappUrl(
                en
                  ? 'Hello, Ciudad Cars. I have a question about renting a car.'
                  : 'Hola, Ciudad Cars. Tengo una pregunta sobre el alquiler de un carro.',
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {en ? 'Ask us on WhatsApp' : 'Pregúntanos por WhatsApp'}{' '}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="faq-list">
            {homeFaq[language].map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <Plus size={20} aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
