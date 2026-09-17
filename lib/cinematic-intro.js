import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

/** Mount the approved canvas sequence and return complete React/Strict Mode cleanup.
 * @param {HTMLElement} root
 */
export function mountCinematicIntro(root) {
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
  const picture = section.querySelector('.cc-intro-picture');
  const grain = $('film-grain');
  const grainContext = grain.getContext('2d', { alpha: false });
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
  const cache = new Map();
  const previews = new Map();
  const pending = new Set();
  const failures = new Map();
  const posters = [];
  const state = { frame: 0 };
  // The last tenth of the scroll holds the final aerial view for the booking handoff.
  const filmEnd = 0.9;
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
    direction = 1,
    active = 0,
    queue = [];
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
  let grainRunning = false,
    grainTick = -1;
  const grainPatterns = [];
  try {
    userReduced = sessionStorage.getItem('cc-reduced-motion') === 'true';
  } catch {}

  const sceneOf = (frame) => (frame < meta.cut ? 0 : 1);
  const chapterFrame = (index) =>
    index === 0 ? 0 : Math.min(meta.frames - 1, meta.transition.end + 1);
  const isNearScene = (frame) => sceneOf(frame) === sceneOf(desired);

  function reportScene(index) {
    if (lastScene === index) return;
    lastScene = index;
    const car = cars[index];
    $('category').textContent = `0${index + 1} / ${car.make.toUpperCase()}`;
    $('model').replaceChildren(document.createTextNode(car.make + ' '));
    const name = document.createElement('strong');
    name.textContent = car.name;
    $('model').append(name);
    $('tagline').textContent = car.tag;
    canvas.setAttribute(
      'aria-label',
      `Persecución aérea de ${car.make} ${car.name}, escena ${index + 1} de 2`,
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

  function draw() {
    if (disposed) return;
    const scene = reduced ? manualScene : sceneOf(desired);
    let image = reduced ? posters[scene] : cache.get(desired);
    let frame = reduced ? -1 - scene : desired;
    let quality = reduced ? 'poster' : 'full';
    if (!image && !reduced) {
      let distance = Infinity;
      for (const [f, candidate] of cache) {
        if (isNearScene(f) && Math.abs(f - desired) < distance) {
          distance = Math.abs(f - desired);
          image = candidate;
          frame = f;
        }
      }
      for (const [f, candidate] of previews) {
        if (isNearScene(f) && Math.abs(f - desired) < distance) {
          distance = Math.abs(f - desired);
          image = candidate;
          frame = f;
          quality = 'preview';
        }
      }
      if (!image) {
        image = posters[scene];
        frame = -1 - scene;
        quality = 'poster';
      }
    }
    const key = `${quality}:${frame}`;
    if (image && lastDraw !== key) {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      lastDraw = key;
      canvas.dataset.frame = String(frame);
      canvas.dataset.quality = quality;
      canvas.dataset.scene = cars[scene].id;
    }
    frameComposition(frame);
    canvas.dataset.requestedFrame = String(desired);
    $('load-status').textContent = image ? '' : 'Preparando recorrido…';
  }

  function trimCache() {
    const limit = compact ? 32 : 64;
    if (cache.size <= limit) return;
    const farthest = [...cache.keys()].sort(
      (a, b) => Math.abs(b - desired) - Math.abs(a - desired),
    );
    while (cache.size > limit) cache.delete(farthest.shift());
  }

  function pump() {
    if (disposed || reduced) return;
    while (active < (compact ? 4 : 6) && queue.length) {
      const frame = queue.shift();
      if (
        cache.has(frame) ||
        pending.has(frame) ||
        (failures.get(frame) || 0) > performance.now()
      )
        continue;
      pending.add(frame);
      active++;
      const image = createImage();
      image.decoding = 'async';
      image.onload = async () => {
        try {
          await image.decode();
        } catch {}
        if (disposed) return;
        images.delete(image);
        pending.delete(frame);
        active--;
        cache.set(frame, image);
        failures.delete(frame);
        trimCache();
        draw();
        pump();
      };
      image.onerror = () => {
        if (disposed) return;
        images.delete(image);
        pending.delete(frame);
        active--;
        failures.set(frame, performance.now() + 15000);
        draw();
        pump();
      };
      image.src = `/cinema/frames/${String(frame + 1).padStart(4, '0')}.webp`;
    }
  }

  function prefetch() {
    if (reduced) return;
    const list = [desired];
    for (let offset = 1; offset <= (compact ? 22 : 34); offset++) {
      list.push(desired + direction * offset);
      if (offset <= 10) list.push(desired - direction * offset);
    }
    queue = list.filter(
      (f) => f >= 0 && f < meta.frames && !cache.has(f) && !pending.has(f),
    );
    pump();
  }

  function render() {
    const previous = desired;
    desired = reduced
      ? chapterFrame(manualScene)
      : Math.min(meta.frames - 1, Math.max(0, Math.round(state.frame)));
    if (desired !== previous) direction = desired > previous ? 1 : -1;
    reportScene(reduced ? manualScene : sceneOf(desired));
    $('percentage').textContent =
      `${Math.round((desired / (meta.frames - 1)) * 100)}%`;
    if (desired !== previous || !cache.has(desired)) prefetch();
    draw();
  }

  // Small predecoded previews keep fast seeks near their target while full frames arrive.
  function loadPreviews() {
    for (let i = 0; i < Math.ceil(meta.frames / meta.fps); i++) {
      const image = createImage();
      image.decoding = 'async';
      image.onload = () => {
        if (disposed) return;
        images.delete(image);
        previews.set(i * meta.fps, image);
        draw();
      };
      image.src = `/cinema/previews/${String(i + 1).padStart(4, '0')}.webp`;
    }
  }

  function buildGrain() {
    if (grainPatterns.length) return;
    for (let i = 0; i < 8; i++) {
      const tile = document.createElement('canvas');
      tile.width = tile.height = 128;
      const ctx = tile.getContext('2d');
      const pixels = ctx.createImageData(128, 128);
      for (let p = 0; p < pixels.data.length; p += 4) {
        const value = Math.round((Math.random() + Math.random()) * 127.5);
        pixels.data[p] = pixels.data[p + 1] = pixels.data[p + 2] = value;
        pixels.data[p + 3] = 255;
      }
      ctx.putImageData(pixels, 0, 0);
      grainPatterns.push(grainContext.createPattern(tile, 'repeat'));
    }
    sizeGrain();
  }

  function sizeGrain() {
    stageWidth = stage.clientWidth;
    stageHeight = stage.clientHeight;
    const rect = grain.getBoundingClientRect();
    grain.width = Math.max(1, Math.min(1600, Math.round(rect.width)));
    grain.height = Math.max(
      1,
      Math.round((rect.height * grain.width) / Math.max(1, rect.width)),
    );
    grainTick = -1;
    frameComposition(Number(canvas.dataset.frame || 0));
  }

  function paintGrain(time) {
    const frame = Math.floor(time * (compact ? 10 : 12));
    if (frame === grainTick) return;
    grainTick = frame;
    grainContext.setTransform(
      1,
      0,
      0,
      1,
      (frame * 37) % 128,
      (frame * 53) % 128,
    );
    grainContext.fillStyle = grainPatterns[frame % grainPatterns.length];
    grainContext.fillRect(-128, -128, grain.width + 256, grain.height + 256);
    grain.dataset.tick = String(frame);
  }

  function syncGrain() {
    if (!available) return;
    const run =
      !disposed && !reduced && inView && !document.hidden && !dialog.open;
    if (run === grainRunning) return;
    grainRunning = run;
    if (run) {
      buildGrain();
      gsap.ticker.add(paintGrain);
    } else gsap.ticker.remove(paintGrain);
    grain.dataset.running = String(run);
  }

  function stopScroll() {
    scrollTween?.kill();
    scrollTween = null;
    auto = false;
    $('play-icon').textContent = '↻';
    $('play-label').textContent = 'Recorrer de nuevo';
    $('play').setAttribute(
      'aria-label',
      'Reproducir recorrido automáticamente',
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
    sizeGrain();
    if (reduced) return;
    // A restored scroll position can refresh before GSAP dispatches an update.
    // Explicitly align the frame, including when reloading halfway through a scene.
    state.frame = clamp(self.progress / filmEnd) * (meta.frames - 1);
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
        $('motion-toggle').textContent = match.conditions.reduce
          ? 'Movimiento reducido'
          : reduced
            ? 'Activar movimiento'
            : 'Reducir movimiento';
        $('motion-toggle').setAttribute('aria-pressed', String(reduced));
        if (reduced) {
          master = trigger = null;
          queue = [];
          gsap.set([picture, '.cc-intro-headline'], {
            clearProps: 'transform,filter,opacity,visibility',
          });
          render();
          syncGrain();
          return () => {
            stopScroll();
          };
        }

        state.frame = 0;
        const cut = (meta.cut / (meta.frames - 1)) * filmEnd;
        master = gsap.timeline({
          defaults: { ease: 'none' },
          onUpdate: render,
          scrollTrigger: {
            id: 'cc-drone',
            trigger: section,
            start: 'top top',
            end: () =>
              `+=${Math.max(1, section.offsetHeight - stage.offsetHeight)}`,
            scrub: compact ? 0.2 : 0.38,
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
              duration: filmEnd,
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
            grain,
            { opacity: 0.065 },
            { opacity: 0.12, duration: 0.026, ease: 'sine.in' },
            cut - 0.032,
          )
          .to(
            grain,
            { opacity: 0.065, duration: 0.042, ease: 'sine.out' },
            cut - 0.006,
          )
          .fromTo(
            picture,
            { scale: 1, filter: 'blur(0px)' },
            {
              scale: compact ? 1.012 : 1.022,
              filter: 'blur(1px)',
              duration: 0.027,
              ease: 'power2.in',
            },
            cut - 0.033,
          )
          .to(
            picture,
            {
              scale: 1,
              filter: 'blur(0px)',
              duration: 0.043,
              ease: 'power2.out',
            },
            cut - 0.006,
          )
          .fromTo(
            '.cc-intro-sky-transition',
            { opacity: 0 },
            { opacity: 0.12, duration: 0.025, ease: 'sine.in' },
            cut - 0.028,
          )
          .to(
            '.cc-intro-sky-transition',
            { opacity: 0, duration: 0.038, ease: 'sine.out' },
            cut - 0.003,
          )
          .fromTo(
            '.cc-intro-end-veil',
            { opacity: 0 },
            { opacity: 1, duration: 0.17, ease: 'sine.inOut' },
            0.79,
          )
          .fromTo(
            '.cc-intro-story-close',
            { autoAlpha: 0, y: 50 },
            { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power2.out' },
            0.86,
          )
          .to(
            [
              '.cc-intro-chapter-nav',
              '.cc-intro-scene-location',
              '.cc-intro-journey-cue',
            ],
            { autoAlpha: 0, duration: 0.06 },
            0.87,
          );

        // Each car shares the frame timeline with its own editorial text and light falloff.
        for (const [selector, shade, enter, leave, x] of [
          ['.cc-intro-story-cruze', '.cc-intro-shade-left', 0.17, 0.37, -35],
          ['.cc-intro-story-explorer', '.cc-intro-shade-right', 0.55, 0.75, 35],
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
            )
            .fromTo(
              shade,
              { opacity: 0 },
              { opacity: 1, duration: 0.045 },
              enter,
            )
            .to(shade, { opacity: 0, duration: 0.055 }, leave);
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
        trimCache();
        prefetch();
        syncGrain();
        return () => {
          stopScroll();
          gsap.ticker.remove(paintGrain);
          grainRunning = false;
          grain.dataset.running = 'false';
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
    $('play-label').textContent = 'Pausar';
    $('play-icon').textContent = 'Ⅱ';
    $('play').setAttribute('aria-label', 'Pausar recorrido');
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
    manualScene = sceneOf(desired);
    userReduced = !userReduced;
    try {
      sessionStorage.setItem('cc-reduced-motion', String(userReduced));
    } catch {}
    makeMotion();
  });
  listen($('watch-film'), 'click', () => {
    stopScroll();
    dialog.showModal();
    syncGrain();
    movie.play().catch(() => {});
  });
  listen($('close-movie'), 'click', () => dialog.close());
  listen(dialog, 'close', () => {
    movie.pause();
    syncGrain();
  });
  listen(document, 'visibilitychange', () => {
    if (document.hidden) stopScroll();
    syncGrain();
  });
  listen(window, 'resize', sizeGrain, { passive: true });
  listen(window, 'pageshow', () => {
    if (ready && available) {
      ScrollTrigger.refresh();
      syncGrain();
    }
  });
  listen(window, 'pagehide', () => {
    stopScroll();
    if (available) gsap.ticker.remove(paintGrain);
    grainRunning = false;
  });

  cars.forEach((car, i) => {
    const image = createImage();
    image.onload = () => {
      if (disposed) return;
      images.delete(image);
      posters[i] = image;
      draw();
    };
    image.src = `/cinema/${car.id}-aerial.jpg`;
  });
  if (available) gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const grainObserver = new IntersectionObserver(
    (entries) => {
      inView = entries[0].isIntersecting;
      syncGrain();
    },
    { threshold: 0 },
  );
  grainObserver.observe(stage);
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
      makeMotion();
      loadPreviews();
    });
  draw();
  root.dataset.mounted = 'true';
  return () => {
    disposed = true;
    lifecycle.abort();
    stopScroll();
    mediaContext?.revert();
    grainObserver?.disconnect();
    gsap.ticker.remove(paintGrain);
    grainRunning = false;
    grain.dataset.running = 'false';
    movie.pause();
    if (dialog.open) dialog.close();
    for (const image of images) {
      image.onload = null;
      image.onerror = null;
    }
    images.clear();
    cache.clear();
    previews.clear();
    pending.clear();
    failures.clear();
    posters.length = 0;
    grainPatterns.length = 0;
    queue = [];
    root.classList.remove('cc-intro-is-reduced-motion');
    root.dataset.mounted = 'false';
  };
}
