import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { createFrameBuffer, selectReadyFrame } from './cinematic-frames';
import { parseLanguage, translate } from './language';

/** Bind the original film and homepage content to one reversible scroll timeline.
 * @param {HTMLElement} root
 */
export function mountCinematicIntro(root) {
  const t = (text) => translate(text, parseLanguage(root.dataset.language));
  let disposed = false;
  const lifecycle = new AbortController();
  const images = new Set();
  function createImage() {
    const image = new Image();
    images.add(image);
    return image;
  }
  function listen(target, event, callback, options = {}) {
    target.addEventListener(event, callback, {
      ...options,
      signal: lifecycle.signal,
    });
  }

  const $ = (id) =>
    root.querySelector('#' + (id === 'recorrido' ? id : 'cc-intro-' + id));
  const section = $('recorrido');
  const stage = section.querySelector('.cc-intro-stage');
  const canvas = $('film');
  const context = canvas.getContext('2d', { alpha: false });
  const loadStatus = $('load-status');
  const percentage = $('percentage');
  const dialog = $('movie-dialog');
  const movie = $('movie');
  // The canvas also reports data-scene after mounting; only bind chapter buttons.
  const buttons = [...section.querySelectorAll('button[data-scene]')];
  const cars = [
    {
      id: 'cruze',
      make: 'Chevrolet',
      name: 'Cruze',
      tag: 'Una nueva perspectiva.',
    },
    {
      id: 'explorer',
      make: 'Ford',
      name: 'Explorer',
      tag: 'Más espacio para tu próximo viaje.',
    },
  ];
  const clamp = (value) => Math.min(1, Math.max(0, value));
  let frames;
  let paintRequest = 0;
  const posters = [];
  const state = { frame: 0 };
  // Focal points measured from the existing footage; portrait crops follow the cars.
  const focalPoints = [
    [0, 0.49],
    [24, 0.49],
    [48, 0.5],
    [72, 0.59],
    [96, 0.73],
    [120, 0.7],
    [144, 0.55],
    [168, 0.5],
    [184, 0.51],
    [196, 0.51],
    [216, 0.52],
    [240, 0.49],
    [264, 0.38],
    [288, 0.3],
    [312, 0.52],
    [336, 0.51],
    [375, 0.5],
  ];
  let stageWidth = innerWidth,
    stageHeight = innerHeight;
  const available = !!(gsap && ScrollTrigger && ScrollToPlugin);
  let meta = {
    frames: 376,
    fps: 24,
    cut: 188,
    duration: 376 / 24,
    transition: { start: 184, end: 192 },
  };
  let desired = 0,
    lastDraw = '',
    lastScene = -1,
    direction = 1;
  let reduced = true,
    manualScene = 0,
    compact = innerWidth <= 760,
    inView = true;
  let master,
    trigger,
    mediaContext,
    scrollTween,
    auto = false,
    ready = false,
    userReduced = false;
  try {
    userReduced = sessionStorage.getItem('cc-reduced-motion') === 'true';
  } catch {}

  const sceneOf = (frame) => (frame < meta.cut ? 0 : 1);
  const chapterFrame = (index) =>
    index === 0 ? 0 : Math.min(meta.frames - 1, meta.transition.end + 1);

  function reportScene(index) {
    if (lastScene === index) return;
    lastScene = index;
    const car = cars[index];
    $('category').textContent = `0${index + 1} / ${car.make.toUpperCase()}`;
    $('model').replaceChildren(document.createTextNode(car.make + ' '));
    const name = document.createElement('strong');
    name.textContent = car.name;
    $('model').append(name);
    $('tagline').textContent = t(car.tag);
    canvas.setAttribute(
      'aria-label',
      root.dataset.language === 'en'
        ? `Aerial tracking shot of ${car.make} ${car.name}, scene ${index + 1} of 2`
        : `Persecución aérea de ${car.make} ${car.name}, escena ${index + 1} de 2`,
    );
    buttons.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }

  function frameComposition(frame) {
    if (!compact || stageWidth / stageHeight >= 16 / 9) {
      canvas.style.objectPosition = '50% 50%';
      return;
    }
    const sourceFrame = frame < 0 ? (frame === -1 ? 0 : 196) : frame;
    let segment = focalPoints.findIndex((point) => point[0] >= sourceFrame);
    if (segment < 0) segment = focalPoints.length - 1;
    const a = focalPoints[Math.max(0, segment - 1)],
      b = focalPoints[segment];
    const t = a[0] === b[0] ? 0 : clamp((sourceFrame - a[0]) / (b[0] - a[0]));
    const smooth = t * t * (3 - 2 * t);
    const focal = a[1] + (b[1] - a[1]) * smooth;
    const scaledWidth = (stageHeight * 16) / 9;
    const position = clamp(
      (focal * scaledWidth - stageWidth * 0.5) / (scaledWidth - stageWidth),
    );
    canvas.style.objectPosition = `${(position * 100).toFixed(3)}% 50%`;
    canvas.dataset.focalX = focal.toFixed(3);
  }

  function requestDraw() {
    if (disposed || paintRequest || document.hidden || !inView) return;
    paintRequest = requestAnimationFrame(() => {
      paintRequest = 0;
      draw();
    });
  }

  function draw() {
    if (disposed) return;
    const scene = reduced ? manualScene : sceneOf(desired);
    const previous = Number(canvas.dataset.frame ?? -1);
    const frame = reduced
      ? null
      : selectReadyFrame(
          frames?.decoded || new Map(),
          desired,
          previous,
          direction,
          meta.cut,
        );
    const image =
      frame === null
        ? reduced || !lastDraw
          ? posters[scene]
          : null
        : frames.decoded.get(frame);
    const displayed = frame ?? -1 - scene;
    const quality = frame === null ? 'poster' : 'full';
    const key = `${quality}:${displayed}`;
    if (image && lastDraw !== key) {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      lastDraw = key;
      canvas.dataset.frame = String(displayed);
      canvas.dataset.quality = quality;
      canvas.dataset.scene = cars[scene].id;
      frameComposition(displayed);
    }
    canvas.dataset.requestedFrame = String(desired);
    const status = lastDraw ? '' : t('Preparando recorrido…');
    if (loadStatus.textContent !== status) loadStatus.textContent = status;
  }

  function prefetch() {
    if (!reduced) frames?.request(desired, direction, compact ? 32 : 64);
  }

  function render() {
    const previous = desired;
    desired = reduced
      ? chapterFrame(manualScene)
      : Math.min(meta.frames - 1, Math.max(0, Math.round(state.frame)));
    if (desired !== previous) direction = desired > previous ? 1 : -1;
    reportScene(reduced ? manualScene : sceneOf(desired));
    if (desired !== previous) {
      percentage.textContent = `${Math.round((desired / (meta.frames - 1)) * 100)}%`;
      section.style.setProperty(
        '--film-progress',
        String(desired / (meta.frames - 1)),
      );
    }
    if (desired !== previous || !frames?.decoded.has(desired)) prefetch();
    requestDraw();
  }

  function sizeStage() {
    stageWidth = stage.clientWidth;
    stageHeight = stage.clientHeight;
    frameComposition(Number(canvas.dataset.frame || 0));
  }

  function syncLoading() {
    frames?.setActive(
      !disposed && !reduced && inView && !document.hidden && !dialog.open,
    );
    requestDraw();
  }

  function stopScroll() {
    if (!scrollTween && !auto) return;
    scrollTween?.kill();
    scrollTween = null;
    auto = false;
    $('play-icon').textContent = '↻';
    $('play-label').textContent = t('Recorrer de nuevo');
    $('play').setAttribute(
      'aria-label',
      t('Reproducir recorrido automáticamente'),
    );
  }

  function seek(progress, duration = 1.05) {
    if (!trigger) return;
    stopScroll();
    scrollTween = gsap.to(window, {
      scrollTo: {
        y: trigger.start + progress * (trigger.end - trigger.start),
        autoKill: true,
        onAutoKill: stopScroll,
      },
      duration,
      ease: 'power3.inOut',
      onComplete: () => {
        scrollTween = null;
      },
    });
  }

  function refreshFrame(self) {
    sizeStage();
    if (reduced) return;
    // A restored scroll position can refresh before GSAP dispatches an update.
    // Explicitly align the frame, including when reloading halfway through a scene.
    state.frame = clamp(self.progress) * (meta.frames - 1);
    render();
  }

  function makeMotion() {
    if (disposed) return;
    if (!available) {
      reduced = true;
      root.classList.add('cc-intro-is-reduced-motion');
      $('motion-toggle').hidden = true;
      render();
      return;
    }
    stopScroll();
    mediaContext?.revert();
    mediaContext = gsap.matchMedia(root);
    mediaContext.add(
      {
        compact: '(max-width: 760px)',
        reduce: '(prefers-reduced-motion: reduce)',
        all: '(min-width: 0px)',
      },
      (match) => {
        compact = match.conditions.compact;
        reduced = match.conditions.reduce || userReduced;
        root.classList.toggle('cc-intro-is-reduced-motion', reduced);
        root.dataset.motion = reduced ? 'reduced' : 'full';
        canvas.dataset.driver = 'GSAP 3.14.2 / ScrollTrigger';
        $('motion-toggle').disabled = match.conditions.reduce;
        $('motion-toggle').textContent = t(
          match.conditions.reduce
            ? 'Movimiento reducido'
            : reduced
              ? 'Activar movimiento'
              : 'Reducir movimiento',
        );
        $('motion-toggle').setAttribute('aria-pressed', String(reduced));
        if (reduced) {
          master = trigger = null;
          gsap.set('.cc-intro-headline', {
            clearProps: 'transform,opacity,visibility',
          });
          render();
          syncLoading();
          ScrollTrigger.refresh();
          return () => {
            stopScroll();
          };
        }

        state.frame = 0;
        master = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: render,
          scrollTrigger: {
            id: 'cc-drone',
            trigger: section,
            start: 'top top',
            // Keep playing after the sticky stage releases. At the last frame,
            // the following section already fills 65% of the viewport.
            end: () =>
              `+=${Math.max(1, section.offsetHeight - stage.offsetHeight + Math.min(stage.offsetHeight, innerHeight) * 0.65)}`,
            scrub: compact ? 0.55 : 1,
            invalidateOnRefresh: true,
            onRefresh: refreshFrame,
          },
        });
        trigger = master.scrollTrigger;
        master
          .fromTo(
            state,
            { frame: 0 },
            {
              frame: meta.frames - 1,
              duration: 1,
              immediateRender: false,
            },
            0,
          )
          .to({}, { duration: 1 }, 0)
          .fromTo(
            '.cc-intro-headline',
            { autoAlpha: 1, y: 0 },
            { autoAlpha: 0, y: -48, duration: 0.09, ease: 'power1.inOut' },
            0.055,
          )
          .fromTo(
            '.cc-intro-story-close',
            { autoAlpha: 0, y: 50 },
            { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power2.out' },
            0.77,
          )
          .to(
            ['.cc-intro-chapter-nav', '.cc-intro-journey-cue'],
            { autoAlpha: 0, duration: 0.06 },
            0.77,
          );

        // Text and full-resolution footage share one smoothed timeline.
        for (const [selector, enter, leave, x] of [
          ['.cc-intro-story-cruze', 0.18, 0.37, -35],
          ['.cc-intro-story-explorer', 0.56, 0.7, 35],
        ]) {
          master
            .fromTo(
              selector,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.025 },
              enter,
            )
            .fromTo(
              `${selector} .cc-intro-story-piece`,
              { x: compact ? 0 : x, y: compact ? 25 : 0, opacity: 0 },
              {
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.055,
                stagger: 0.012,
                ease: 'power2.out',
              },
              enter,
            )
            .to(
              selector,
              { autoAlpha: 0, y: -24, duration: 0.055, ease: 'power1.in' },
              leave,
            );
        }

        if (scrollY < 20) {
          gsap.from('.cc-intro-headline-line', {
            y: 24,
            opacity: 0,
            duration: 0.9,
            stagger: 0.09,
            ease: 'power3.out',
          });
        }
        ScrollTrigger.refresh();
        master.progress(trigger.progress);
        refreshFrame(trigger);
        prefetch();
        syncLoading();
        return () => {
          stopScroll();
          frames?.setActive(false);
        };
      },
    );
  }

  listen($('play'), 'click', () => {
    if (!ready || reduced || !trigger) return;
    if (auto) {
      stopScroll();
      trigger.getTween()?.progress(1);
      return;
    }
    stopScroll();
    let start = clamp(
      (scrollY - trigger.start) / (trigger.end - trigger.start),
    );
    if (start > 0.98) {
      gsap.set(window, { scrollTo: { y: trigger.start, autoKill: false } });
      ScrollTrigger.update();
      trigger.getTween()?.progress(1);
      start = 0;
    }
    auto = true;
    $('play-label').textContent = t('Pausar');
    $('play-icon').textContent = 'Ⅱ';
    $('play').setAttribute('aria-label', t('Pausar recorrido'));
    scrollTween = gsap.to(window, {
      scrollTo: { y: trigger.end, autoKill: true, onAutoKill: stopScroll },
      duration: (1 - start) * meta.duration,
      ease: 'none',
      onComplete: stopScroll,
    });
  });

  for (const event of ['wheel', 'touchstart', 'pointerdown']) {
    listen(
      window,
      event,
      (e) => {
        if (!e.target.closest?.('#cc-intro-play')) stopScroll();
      },
      { passive: true },
    );
  }
  listen(window, 'keydown', (e) => {
    if (
      [
        'ArrowDown',
        'ArrowUp',
        'PageDown',
        'PageUp',
        'Home',
        'End',
        ' ',
      ].includes(e.key)
    )
      stopScroll();
  });
  buttons.forEach((button, i) =>
    listen(button, 'click', () => {
      manualScene = i;
      if (reduced) {
        render();
        return;
      }
      seek(i === 0 ? 0.27 : 0.65);
    }),
  );
  root.querySelectorAll('a[href^="#"]').forEach((link) =>
    listen(link, 'click', (e) => {
      if (reduced || !available) return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      e.preventDefault();
      stopScroll();
      scrollTween = gsap.to(window, {
        scrollTo: {
          y: target,
          offsetY:
            link.hash === '#flota'
              ? document.querySelector('.site-header')?.offsetHeight || 0
              : 0,
          autoKill: true,
          onAutoKill: stopScroll,
        },
        duration: 1.15,
        ease: 'power3.inOut',
        onComplete: () => {
          scrollTween = null;
          if (link.classList.contains('cc-intro-skip')) {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }
        },
      });
    }),
  );
  listen($('motion-toggle'), 'click', () => {
    const control = $('motion-toggle');
    const previousTop = control.getBoundingClientRect().top;
    manualScene = sceneOf(desired);
    userReduced = !userReduced;
    try {
      sessionStorage.setItem('cc-reduced-motion', String(userReduced));
    } catch {}
    makeMotion();
    // Collapsing the long film must not leave the visitor far down the page.
    // Keep the focused control in place and refresh the following sections.
    window.scrollTo({
      top: Math.max(
        0,
        scrollY + control.getBoundingClientRect().top - previousTop,
      ),
      behavior: 'instant',
    });
    ScrollTrigger.refresh();
  });
  listen($('watch-film'), 'click', () => {
    stopScroll();
    dialog.showModal();
    syncLoading();
    movie.play().catch(() => {});
  });
  listen($('close-movie'), 'click', () => dialog.close());
  listen(dialog, 'close', () => {
    movie.pause();
    syncLoading();
  });
  listen(document, 'visibilitychange', () => {
    if (document.hidden) stopScroll();
    syncLoading();
  });
  listen(window, 'resize', sizeStage, { passive: true });
  // Updating copy must preserve the scroll position, timeline and decoded frames.
  listen(root, 'languagechange', () => {
    lastScene = -1;
    reportScene(reduced ? manualScene : sceneOf(desired));
    $('play-label').textContent = t(auto ? 'Pausar' : 'Recorrer de nuevo');
    $('play').setAttribute(
      'aria-label',
      t(auto ? 'Pausar recorrido' : 'Reproducir recorrido automáticamente'),
    );
    $('motion-toggle').textContent = t(
      matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'Movimiento reducido'
        : reduced
          ? 'Activar movimiento'
          : 'Reducir movimiento',
    );
    requestDraw();
  });
  listen(window, 'pageshow', () => {
    if (ready && available) {
      ScrollTrigger.refresh();
      syncLoading();
    }
  });
  listen(window, 'pagehide', () => {
    stopScroll();
    frames?.setActive(false);
  });

  cars.forEach((car, i) => {
    const image = createImage();
    image.onload = () => {
      if (disposed) return;
      images.delete(image);
      posters[i] = image;
      requestDraw();
    };
    image.src = `/cinema/${car.id}-aerial.jpg`;
  });
  if (available) gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const stageObserver = new IntersectionObserver(
    (entries) => {
      inView = entries[0].isIntersecting;
      syncLoading();
    },
    { threshold: 0 },
  );
  stageObserver.observe(stage);
  fetch('/cinema/film.json', { signal: lifecycle.signal })
    .then((response) => {
      if (!response.ok) throw Error('Film metadata');
      return response.json();
    })
    .then((value) => {
      if (value.frames > 1 && value.fps > 0 && value.cut < value.frames)
        meta = value;
    })
    .catch(() => {})
    .finally(() => {
      if (disposed) return;
      ready = true;
      frames = createFrameBuffer({
        count: meta.frames,
        capacity: compact ? 32 : 64,
        onReady: requestDraw,
        warm: !navigator.connection?.saveData,
      });
      makeMotion();
    });
  draw();
  root.dataset.mounted = 'true';
  return () => {
    disposed = true;
    lifecycle.abort();
    stopScroll();
    mediaContext?.revert();
    stageObserver?.disconnect();
    cancelAnimationFrame(paintRequest);
    frames?.dispose();
    movie.pause();
    if (dialog.open) dialog.close();
    for (const image of images) {
      image.onload = null;
      image.onerror = null;
    }
    images.clear();

    posters.length = 0;
    root.classList.remove('cc-intro-is-reduced-motion');
    root.dataset.mounted = 'false';
  };
}
