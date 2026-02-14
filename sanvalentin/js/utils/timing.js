export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_BASE_FPS = 60;

/**
 * Crea un loop basado en requestAnimationFrame.
 * @param {(time: {deltaTime: number, elapsed: number, deltaMs: number, timestamp: number}) => void} onFrame
 * @param {{maxFps?: number, autoStart?: boolean, baseFps?: number}} [options]
 */
export const createRafLoop = (onFrame, options = {}) => {
  if (typeof onFrame !== "function") {
    throw new TypeError("createRafLoop requiere un callback onFrame");
  }

  const baseFps =
    Number.isFinite(options.baseFps) && options.baseFps > 0
      ? options.baseFps
      : DEFAULT_BASE_FPS;

  let maxFps =
    Number.isFinite(options.maxFps) && options.maxFps > 0
      ? options.maxFps
      : 0;

  let frameDurationMs = maxFps > 0 ? 1000 / maxFps : 0;

  let running = false;
  let rafId = null;
  let lastTimestamp = null;
  let elapsed = 0;

  const hasDocument = typeof document !== "undefined";
  const hasWindow = typeof window !== "undefined";
  const canUseRaf = hasWindow && typeof window.requestAnimationFrame === "function";

  const resetClock = () => {
    lastTimestamp = null;
    elapsed = 0;
  };

  const tick = (timestamp) => {
    if (!running) return;

    if (lastTimestamp == null) {
      lastTimestamp = timestamp;
      rafId = window.requestAnimationFrame(tick);
      return;
    }

    const deltaMs = timestamp - lastTimestamp;

    if (frameDurationMs > 0 && deltaMs < frameDurationMs) {
      rafId = window.requestAnimationFrame(tick);
      return;
    }

    lastTimestamp = timestamp;
    elapsed += deltaMs;

    onFrame({
      deltaTime: deltaMs / (1000 / baseFps),
      elapsed,
      deltaMs,
      timestamp,
    });

    rafId = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (running || !canUseRaf) return;

    running = true;
    lastTimestamp = null;
    rafId = window.requestAnimationFrame(tick);
  };

  const stop = () => {
    if (!running) return;

    running = false;

    if (rafId != null && canUseRaf) {
      window.cancelAnimationFrame(rafId);
    }

    rafId = null;
    lastTimestamp = null;
  };

  const setMaxFps = (fps = 0) => {
    if (!Number.isFinite(fps) || fps <= 0) {
      maxFps = 0;
      frameDurationMs = 0;
      return;
    }

    maxFps = fps;
    frameDurationMs = 1000 / fps;
  };

  const handleVisibilityChange = () => {
    if (!hasDocument) return;

    if (document.hidden) {
      stop();
      return;
    }

    // Reiniciamos reloj para evitar saltos de tiempo acumulados.
    lastTimestamp = null;
    if (!running) {
      start();
    }
  };

  if (hasDocument) {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  setMaxFps(maxFps);

  if (options.autoStart) {
    start();
  }

  return {
    start,
    stop,
    setMaxFps,
    resetClock,
    get isRunning() {
      return running;
    },
    dispose() {
      stop();
      if (hasDocument) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    },
  };
};
