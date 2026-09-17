// Keep compressed frames for quick reverse scrolling; only decode a bounded window.
export function createFrameBuffer({
  count,
  capacity,
  onReady,
  warm = true,
  load = async (frame, signal) => {
    const response = await fetch(
      `/cinema/frames/${String(frame + 1).padStart(4, '0')}.webp`,
      { signal },
    );
    if (!response.ok) throw new Error('Film frame unavailable');
    return response.blob();
  },
  decode = decodeFrame,
}) {
  const lifecycle = new AbortController();
  const compressed = new Map();
  const decoded = new Map();
  const downloading = new Set();
  const decoding = new Set();
  const failures = new Map();
  let wanted = [],
    target = 0,
    direction = 1,
    active = false,
    disposed = false;

  function trim() {
    const keep = new Set(wanted);
    for (const [frame, image] of decoded) {
      if (!keep.has(frame)) {
        image.close?.();
        decoded.delete(frame);
      }
    }
  }

  function pump() {
    if (disposed || !active) return;
    const canTry = (frame) => (failures.get(frame) || 0) <= performance.now();
    // Decode at most two images at once; downloads never force a canvas repaint.
    for (const frame of wanted) {
      if (decoding.size >= 2) break;
      if (
        !compressed.has(frame) ||
        decoded.has(frame) ||
        decoding.has(frame) ||
        !canTry(frame)
      )
        continue;
      decoding.add(frame);
      Promise.resolve()
        .then(() => decode(compressed.get(frame)))
        .then((image) => {
          if (disposed || !wanted.includes(frame)) image.close?.();
          else {
            decoded.set(frame, image);
            onReady();
          }
        })
        .catch(() => {
          failures.set(frame, performance.now() + 15000);
          compressed.delete(frame);
        })
        .finally(() => {
          decoding.delete(frame);
          pump();
        });
    }

    const candidates = [...wanted];
    if (warm) {
      // Warm the remaining compressed film in the current direction, after the local window.
      for (let offset = 1; offset < count; offset++) {
        candidates.push((target + direction * offset + count) % count);
      }
    }
    for (const frame of candidates) {
      if (downloading.size >= 4) break;
      if (compressed.has(frame) || downloading.has(frame) || !canTry(frame))
        continue;
      downloading.add(frame);
      Promise.resolve()
        .then(() => load(frame, lifecycle.signal))
        .then((blob) => {
          if (!disposed) compressed.set(frame, blob);
        })
        .catch(() => {
          if (!disposed) failures.set(frame, performance.now() + 15000);
        })
        .finally(() => {
          downloading.delete(frame);
          pump();
        });
    }
  }

  return {
    decoded,
    request(frame, travelDirection, limit = capacity) {
      target = frame;
      direction = travelDirection;
      capacity = limit;
      wanted = [target];
      // Two frames ahead for each behind, with room to reverse without re-fetching.
      for (
        let offset = 1;
        wanted.length < capacity && offset < count * 2;
        offset++
      ) {
        const ahead = target + direction * offset;
        const behind = target - direction * (offset / 2);
        if (ahead >= 0 && ahead < count) wanted.push(ahead);
        if (offset % 2 === 0 && behind >= 0 && behind < count)
          wanted.push(behind);
      }
      wanted = wanted.slice(0, capacity);
      trim();
      pump();
    },
    setActive(value) {
      active = value;
      if (active) pump();
    },
    dispose() {
      disposed = true;
      lifecycle.abort();
      for (const image of decoded.values()) image.close?.();
      decoded.clear();
      compressed.clear();
    },
  };
}

async function decodeFrame(blob) {
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// A late image must never pull playback backward or jump ahead of the scroll target.
export function selectReadyFrame(decoded, desired, previous, direction, cut) {
  if (decoded.has(desired)) return desired;
  let selected = null;
  let distance = Infinity;
  const sameScene = (a, b) => a < cut === b < cut;
  for (const frame of decoded.keys()) {
    if (!sameScene(frame, desired) || direction * (desired - frame) < 0)
      continue;
    if (
      previous >= 0 &&
      sameScene(previous, desired) &&
      direction * (frame - previous) < 0
    )
      continue;
    const gap = Math.abs(desired - frame);
    if (gap < distance) {
      selected = frame;
      distance = gap;
    }
  }
  return selected;
}
