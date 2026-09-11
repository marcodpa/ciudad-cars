'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, MoveDown, RotateCcw } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const chapters = [
  {
    at: 0,
    name: 'Bienvenido a Ciudad Cars',
    detail: 'Maracaibo, nuestra casa.',
  },
  {
    at: 0.32,
    name: 'Ven con nosotros',
    detail: 'Un recorrido hacia tu próximo viaje.',
  },
  {
    at: 0.66,
    name: 'Cambia de perspectiva',
    detail: 'Todo empieza al subirte.',
  },
  {
    at: 0.84,
    name: 'Encuentra tu próximo carro',
    detail: 'Cinco modelos. Tu forma de moverte.',
  },
];

export function WorkshopJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const jumpRef = useRef<((progress: number) => void) | null>(null);
  const [mode, setMode] = useState<'static' | 'scroll' | 'error'>('static');
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!section || !stage || !video) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    let cleanupPlayback = () => {};

    const configure = () => {
      cleanupPlayback();
      setReady(false);
      setChapter(0);
      if (reduced.matches || connection?.saveData) {
        setMode('static');
        return;
      }

      setMode('scroll');
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const abort = new AbortController();
      let alive = true;
      let blobUrl: string | undefined;
      let started = false;
      let failed = false;
      let target = 0;
      let currentChapter = 0;
      let frame = 0;
      let trigger: ScrollTrigger | undefined;
      let priming = false;
      let primed = false;
      let width = window.innerWidth;
      let refreshTimer = 0;
      let observer: IntersectionObserver | undefined;

      const flush = () => {
        frame = 0;
        if (
          !alive ||
          failed ||
          priming ||
          video.seeking ||
          video.readyState < 2 ||
          !Number.isFinite(video.duration)
        )
          return;
        const time = target * Math.max(0, video.duration - 1 / 24);
        if (Math.abs(video.currentTime - time) > 0.018) {
          try {
            video.currentTime = time;
          } catch {
            /* Wait for the decoder's next event. */
          }
        }
      };
      const scheduleSeek = () => {
        if (!frame && alive) frame = requestAnimationFrame(flush);
      };
      const update = (progress: number) => {
        target = Math.min(1, Math.max(0, progress));
        fillRef.current?.style.setProperty('transform', `scaleX(${target})`);
        const next = chapters.reduce(
          (active, item, index) => (target >= item.at ? index : active),
          0,
        );
        if (next !== currentChapter) {
          currentChapter = next;
          setChapter(next);
        }
        scheduleSeek();
      };
      const decoded = () => {
        if (!alive || failed) return;
        setReady(true);
        scheduleSeek();
      };
      const fail = () => {
        if (!alive || abort.signal.aborted) return;
        failed = true;
        trigger?.kill();
        observer?.disconnect();
        jumpRef.current = null;
        setReady(false);
        setMode('error');
        requestAnimationFrame(() => {
          if (alive) ScrollTrigger.refresh();
        });
      };
      const load = async () => {
        if (started || !alive) return;
        started = true;
        try {
          const response = await fetch(
            mobile
              ? '/videos/workshop-drive-mobile.mp4'
              : '/videos/workshop-drive.mp4',
            { signal: abort.signal },
          );
          if (!response.ok) throw new Error('Video unavailable');
          const blob = await response.blob();
          if (!alive) return;
          blobUrl = URL.createObjectURL(blob);
          video.muted = true;
          video.defaultMuted = true;
          video.playsInline = true;
          video.src = blobUrl;
          video.load();
        } catch {
          fail();
        }
      };
      const prime = () => {
        if (primed || priming || !alive || !video.src || video.readyState < 2)
          return;
        priming = true;
        void video
          .play()
          .then(() => {
            video.pause();
            primed = true;
          })
          .catch(() => {
            /* Seeking remains available without autoplay permission. */
          })
          .finally(() => {
            priming = false;
            scheduleSeek();
          });
      };
      const headerHeight = () =>
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--header-height',
          ),
        ) || 108;
      const refresh = () => {
        if (window.innerWidth === width) return;
        width = window.innerWidth;
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => trigger?.refresh(), 150);
      };

      video.addEventListener('loadeddata', decoded);
      video.addEventListener('seeked', decoded);
      video.addEventListener('error', fail);
      section.addEventListener('pointerdown', prime, { passive: true });
      section.addEventListener('touchstart', prime, { passive: true });
      window.addEventListener('resize', refresh, { passive: true });

      // React has to apply the expanded section height before measuring its scroll range.
      const setupFrame = requestAnimationFrame(() => {
        if (!alive) return;
        trigger = ScrollTrigger.create({
          trigger: section,
          start: () => `top ${headerHeight()}px`,
          end: () =>
            `+=${Math.max(1, section.offsetHeight - stage.offsetHeight)}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => update(self.progress),
          onRefresh: (self) => update(self.progress),
        });
        jumpRef.current = (progress) => {
          if (!trigger) return;
          window.scrollTo({
            top: trigger.start + (trigger.end - trigger.start) * progress,
            behavior: 'smooth',
          });
        };
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              void load();
              observer?.disconnect();
            }
          },
          { rootMargin: '1000px 0px' },
        );
        observer.observe(section);
        void document.fonts.ready.then(() => {
          if (alive) trigger?.refresh();
        });
      });

      cleanupPlayback = () => {
        alive = false;
        abort.abort();
        cancelAnimationFrame(setupFrame);
        cancelAnimationFrame(frame);
        window.clearTimeout(refreshTimer);
        trigger?.kill();
        observer?.disconnect();
        jumpRef.current = null;
        video.removeEventListener('loadeddata', decoded);
        video.removeEventListener('seeked', decoded);
        video.removeEventListener('error', fail);
        section.removeEventListener('pointerdown', prime);
        section.removeEventListener('touchstart', prime);
        window.removeEventListener('resize', refresh);
        video.pause();
        video.removeAttribute('src');
        video.load();
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        fillRef.current?.style.setProperty('transform', 'scaleX(0)');
      };
    };
    configure();
    reduced.addEventListener('change', configure);
    return () => {
      reduced.removeEventListener('change', configure);
      cleanupPlayback();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="recorrido"
      className="workshop-journey"
      data-mode={mode}
      aria-labelledby="workshop-title"
    >
      <div ref={stageRef} className="workshop-stage">
        <header className="workshop-heading page-width">
          <div>
            <p className="workshop-kicker">CIUDAD CARS · MARACAIBO</p>
            <h2 id="workshop-title">
              Tu viaje empieza <span>en casa.</span>
            </h2>
          </div>
          <a href="#flota" className="workshop-skip">
            Ir a los vehículos <ArrowUpRight size={18} />
          </a>
        </header>

        <div className="workshop-film" data-ready={ready}>
          <picture className="workshop-poster">
            <source
              media="(max-width: 760px)"
              srcSet="/videos/workshop-drive-mobile-poster.webp"
            />
            <img
              src="/videos/workshop-drive-poster.webp"
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
              alt="Ford Explorer plateada en la entrada del taller de Ciudad Cars, al comienzo del recorrido cinematográfico."
            />
          </picture>
          <video
            ref={videoRef}
            muted
            playsInline
            preload="none"
            poster="/videos/workshop-drive-poster.webp"
            aria-hidden="true"
            tabIndex={-1}
          />
          <span className="workshop-film-label">
            NUESTRA CASA, TU PUNTO DE PARTIDA
          </span>
        </div>

        <div className="workshop-caption page-width">
          <div className="workshop-chapter">
            <span className="workshop-count">
              0{chapter + 1}
              <span> / 04</span>
            </span>
            <div>
              <h3>{chapters[chapter].name}</h3>
              <p>{chapters[chapter].detail}</p>
            </div>
          </div>
          {mode === 'scroll' ? (
            <div className="workshop-motion-cue">
              {chapter === 3 ? (
                <button type="button" onClick={() => jumpRef.current?.(0)}>
                  <RotateCcw size={17} /> Volver al inicio
                </button>
              ) : (
                <span>
                  <MoveDown size={18} /> Desliza para recorrer
                </span>
              )}
            </div>
          ) : (
            <a className="workshop-static-link" href="#flota">
              Conoce nuestra flota <ArrowDown size={18} />
            </a>
          )}
        </div>
        <div className="workshop-timeline page-width" aria-hidden="true">
          <span ref={fillRef} />
        </div>
        <p className="sr-only">
          Recorrido de la Explorer bajando al taller, seguido de una vista desde
          la cabina hacia los vehículos estacionados. Puedes saltar directamente
          al catálogo con el enlace Ir a los vehículos.
        </p>
      </div>
    </section>
  );
}
