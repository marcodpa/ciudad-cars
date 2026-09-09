'use client';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function HeroMotion() {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = document.querySelector<HTMLElement>('.hero');
      if (!hero) return;
      gsap.to(hero.querySelector('.hero-backdrop'), {
        yPercent: 12,
        scale: 1.07,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
      gsap.to(hero.querySelector('.hero-vehicle'), {
        xPercent: 6,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    });
    return () => media.revert();
  }, []);
  return null;
}
