const introView = document.querySelector("#intro-view");
const scene = document.querySelector("#scene");
const messageView = document.querySelector("#message-view");
const heartButton = document.querySelector("#heart-button");
const heart = document.querySelector(".heart");
const ground = document.querySelector("#ground");
const loveTree = document.querySelector("#love-tree");
const elapsedYears = document.querySelector("#elapsed-years");
const elapsedMonths = document.querySelector("#elapsed-months");
const elapsedDays = document.querySelector("#elapsed-days");
const elapsedHours = document.querySelector("#elapsed-hours");
const elapsedMinutes = document.querySelector("#elapsed-minutes");
const counterMessage = document.querySelector("#counter-message");
const treeCanopy = loveTree?.querySelector(".tree-canopy") ?? document.querySelector("#tree-canopy");
const poemTitle = document.querySelector("#poem-title");
const poemContainer = document.querySelector("#poem");
const finalDedication = document.querySelector("#final-dedication");
const fallingHeartsLayer = document.querySelector("#falling-hearts-layer");
const particlesCanvas = document.querySelector("#particles-layer");
const backgroundMusic = document.querySelector("#bg-music");
const musicToggleButton = document.querySelector("#music-toggle");
const restartButton = document.querySelector("#restart-button");
const microIntro = document.querySelector("#micro-intro");
const microIntroSkipButton = document.querySelector("#micro-intro-skip");
const microIntroHideNextCheckbox = document.querySelector("#micro-intro-hide-next");
const loveHeading = document.querySelector("#love-heading");
const reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const POEM_TITLE = "Nuestro árbol de amor";
const START_DATE = "2016-09-09T00:00:00";
const startDate = new Date(START_DATE);
const MUSIC_STORAGE_KEY = "musicOn";
const MICRO_INTRO_STORAGE_KEY = "skipMicroIntro";
const DEFAULT_MUSIC_VOLUME = 0.2;
const MICRO_INTRO_DURATION_MS = 2000;

const STATES = { INTRO: "intro", MORPH: "morph", FALLING: "falling", TREE: "tree", REVEAL_MESSAGE: "revealMessage" };
const PHASE_TIMEOUTS_MS = { morph: 760, falling: 1240, tree: 1320 };
const PHASE_DELAYS_MS = { afterMorph: 60, afterFalling: 70, afterTree: 60 };
const VALID_TRANSITIONS = {
  [STATES.INTRO]: [STATES.MORPH],
  [STATES.MORPH]: [STATES.FALLING],
  [STATES.FALLING]: [STATES.TREE],
  [STATES.TREE]: [STATES.REVEAL_MESSAGE],
  [STATES.REVEAL_MESSAGE]: [],
};

let currentState = STATES.INTRO;
const poemLines = ["Eres luz en mis mañanas,", "calma dulce en tempestad,", "cada latido me recuerda", "que contigo es hogar."];
const typewriterConfig = { letterDelayMs: 45, lineDelayMs: 350 };

let poemHasStarted = false;
let elapsedCounterIntervalId = null;
let heartShowerHasStarted = false;
let heartShowerResizeTimeoutId = null;
let parallaxRafId = null;
let latestPointerEvent = null;
let musicShouldBeOn = false;
let hasUserInteractedForMusic = false;
let activeRunToken = 0;
let prefersReducedMotion = reducedMotionMediaQuery.matches;
let shouldSkipMicroIntro = false;
let microIntroTimeoutId = null;
let microIntroHasFinished = false;
let hasTreeReachedFinalState = false;
let introMachineInFlight = false;
let canopyHeartNodes = [];
const FALLING_LAYOUT_CACHE_TTL_MS = 180;
let fallingLayoutCache = null;
let fallingLayoutCacheAt = 0;

function getActiveTreeCanopy() {
  const messageCanopy = document.querySelector("#tree-panel .tree-canopy");
  if (currentState === STATES.REVEAL_MESSAGE && messageCanopy) return messageCanopy;
  return treeCanopy ?? messageCanopy ?? null;
}

function isTreeFull() {
  if (!loveTree) return false;
  const canopyHearts = treeCanopy?.querySelectorAll(".canopy-heart").length ?? 0;
  const targetHearts = Math.max(1, Math.round(getCanopyHeartCount() * 0.9));
  const treeVisible = loveTree.classList.contains("is-visible");
  return hasTreeReachedFinalState || (treeVisible && canopyHearts >= targetHearts);
}


function keepLoveHeadingPersistent() {
  if (!loveHeading) return;
  loveHeading.removeAttribute("hidden");
  loveHeading.setAttribute("aria-hidden", "false");
  loveHeading.style.display = "block";
  loveHeading.style.visibility = "visible";
}

function syncScenePhase(phase) {
  if (!scene) return;
  scene.dataset.phase = phase;
  keepLoveHeadingPersistent();
}

const fallingHeartPool = [];
let activeFallingHeartCount = 0;
let fallingHeartEmitterRafId = null;
let lastFallingHeartEmitAt = 0;
let nextFallingHeartIndex = 0;
let fallingHeartEmitterEnabled = false;
const HEART_PALETTE_CLASSES = ["is-blush", "is-petal", "is-fuchsia-soft", "is-coral-soft", "is-rose", "is-red-soft"];
const HEART_PALETTE_VARS = ["var(--heart-1)", "var(--heart-2)", "var(--heart-3)", "var(--heart-4)", "var(--heart-5)", "var(--heart-6)"];
const CANOPY_HEART_DENSITY = 88;
const FALLING_HEART_EMIT_INTERVAL_MS = 110;
const BASE_PARTICLE_POOL_SIZE = 140;
const PARTICLE_ANCHOR_REFRESH_MS = 1200;
const PARTICLE_FALL_INTERVAL_RANGE_MS = [2600, 5200];
const PARTICLE_REGROW_DELAY_RANGE_MS = [800, 2200];
const PARTICLE_MIN_RESTING_RATIO = 0.58;
const PARTICLE_TARGET_RESTING_RATIO = 0.7;
let particlePalette = ["rgba(248, 185, 207, 0.72)", "rgba(244, 155, 192, 0.7)", "rgba(222, 93, 152, 0.68)", "rgba(238, 125, 131, 0.64)"];

let particleContext = null;
let particleAnimationFrameId = null;
const particles = [];
let particleCanvasWidth = 0;
let particleCanvasHeight = 0;
let particleAnchorCache = [];
let particleAnchorCacheAt = 0;

const pickHeartPaletteItem = (palette) => palette[Math.floor(Math.random() * palette.length)];
const beepAudio = new Audio("data:audio/wav;base64,UklGRjgAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRQAAAAAABw9XL+fbj0NAAAAAA==");
beepAudio.volume = 0.15;

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const treeRenderer = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const TREE_SEED = 94721;
  const BRANCH_LEVELS = 6;

  function createSeededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function branchPath(segment) {
    const dx = segment.to.x - segment.from.x;
    const dy = segment.to.y - segment.from.y;
    const c1x = segment.from.x + dx * 0.24 + segment.curve * 0.62;
    const c1y = segment.from.y + dy * 0.34;
    const c2x = segment.from.x + dx * 0.76 + segment.curve;
    const c2y = segment.from.y + dy * 0.76;
    return `M ${segment.from.x.toFixed(2)} ${segment.from.y.toFixed(2)} C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${segment.to.x.toFixed(2)} ${segment.to.y.toFixed(2)}`;
  }

  function createGeometry() {
    const rand = createSeededRandom(TREE_SEED);
    const segments = [];
    const branchTips = [];
    const branchSubPoints = [];

    function grow(node, length, angle, depth, thickness, curveBias) {
      if (depth > BRANCH_LEVELS || length < 14) {
        branchTips.push({ x: node.x, y: node.y, depth });
        return;
      }

      const jitter = (rand() - 0.5) * 0.18;
      const theta = angle + jitter;
      const to = {
        x: node.x + Math.cos(theta) * length,
        y: node.y + Math.sin(theta) * length,
      };

      const curve = curveBias * (0.85 + rand() * 0.5) + (rand() - 0.5) * 10;
      segments.push({ from: node, to, thickness, curve, depth });

      const subSamples = 1 + Math.floor(rand() * 2);
      for (let i = 0; i < subSamples; i += 1) {
        const t = 0.45 + rand() * 0.4;
        branchSubPoints.push({
          x: node.x + (to.x - node.x) * t + curve * 0.08,
          y: node.y + (to.y - node.y) * t,
          depth,
        });
      }

      const childCount = depth < 2 ? 2 : rand() > 0.26 ? 3 : 2;
      const spread = 0.46 - depth * 0.034;
      for (let i = 0; i < childCount; i += 1) {
        const offset = childCount === 2
          ? (i === 0 ? -spread : spread)
          : -spread + (i * spread * 2) / (childCount - 1);
        grow(to, length * (0.73 + rand() * 0.08), theta + offset + (rand() - 0.5) * 0.1, depth + 1, thickness * 0.74, curve * 0.5 + offset * 9);
      }
    }

    grow({ x: 160, y: 252 }, 72, -Math.PI / 2, 0, 20, 0);
    return { segments, branchTips, branchSubPoints };
  }

  function render(container, heartCount) {
    if (!container) return;
    container.innerHTML = "";
    container.classList.add("tree-canopy--rendered");

    const geometry = createGeometry();
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 320 265");
    svg.setAttribute("class", "tree-branches");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("aria-hidden", "true");

    geometry.segments.forEach((segment, index) => {
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", branchPath(segment));
      path.setAttribute("class", "tree-branch");
      path.style.strokeWidth = `${Math.max(1.4, segment.thickness)}px`;
      const branchLength = Math.hypot(segment.to.x - segment.from.x, segment.to.y - segment.from.y);
      path.style.setProperty("--branch-length", branchLength.toFixed(2));
      path.style.animationDelay = `${(segment.depth * 70 + index * 5).toFixed(0)}ms`;
      svg.append(path);
    });

    container.append(svg);

    const points = [...geometry.branchTips, ...geometry.branchSubPoints]
      .sort((a, b) => b.depth - a.depth)
      .slice(0, heartCount);
    points.forEach((point, index) => {
      const heartNode = document.createElement("span");
      heartNode.className = `canopy-heart ${HEART_PALETTE_CLASSES[index % HEART_PALETTE_CLASSES.length]}`;
      const jitterX = randomBetween(-8, 8);
      const jitterY = randomBetween(-5, 6);
      heartNode.style.left = `${((point.x + jitterX) / 320 * 100).toFixed(2)}%`;
      heartNode.style.top = `${((point.y + jitterY) / 265 * 100).toFixed(2)}%`;
      heartNode.style.setProperty("--heart-scale", randomBetween(0.62, 1.14).toFixed(2));
      heartNode.style.animationDelay = `${randomBetween(0, 1.4).toFixed(2)}s`;
      container.append(heartNode);
    });
  }

  return { render };
})();

if (poemTitle) poemTitle.textContent = POEM_TITLE;

function getParticlePaletteFromTheme() {
  const rootStyles = getComputedStyle(document.documentElement);
  const palette = [
    rootStyles.getPropertyValue("--particle-1").trim(),
    rootStyles.getPropertyValue("--particle-2").trim(),
    rootStyles.getPropertyValue("--particle-3").trim(),
    rootStyles.getPropertyValue("--particle-4").trim(),
  ].filter(Boolean);
  return palette.length > 0 ? palette : particlePalette;
}

function syncThemePalettes() {
  particlePalette = getParticlePaletteFromTheme();
}

function getEffectivePixelRatio() {
  return Math.min(3, Math.max(1, window.devicePixelRatio || 1));
}

function transitionTo(nextState) {
  const allowedStates = VALID_TRANSITIONS[currentState] ?? [];
  if (!allowedStates.includes(nextState)) return false;
  currentState = nextState;
  syncScenePhase(nextState);
  return true;
}

function waitForMotionEnd({ element, eventName, timeoutMs, filter = () => true }) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      element.removeEventListener(eventName, onMotionEnd);
      resolve();
    };
    const onMotionEnd = (event) => {
      if (event.target !== element || !filter(event)) return;
      finish();
    };
    element.addEventListener(eventName, onMotionEnd);
    window.setTimeout(finish, timeoutMs);
  });
}


const waitForPhaseDelay = (delayMs) => new Promise((resolve) => window.setTimeout(resolve, delayMs));

function updateMusicToggleUI() {
  if (!musicToggleButton) return;
  const isPlaying = musicShouldBeOn && hasUserInteractedForMusic;
  musicToggleButton.classList.toggle("is-active", isPlaying);
  musicToggleButton.setAttribute("aria-pressed", String(isPlaying));
  musicToggleButton.setAttribute("aria-label", isPlaying ? "Pausar música de fondo" : "Reproducir música de fondo");
  musicToggleButton.textContent = isPlaying ? "Pausar música" : "Reproducir música";
}

function setMusicPreference(nextValue) {
  musicShouldBeOn = Boolean(nextValue);
  localStorage.setItem(MUSIC_STORAGE_KEY, String(musicShouldBeOn));
  updateMusicToggleUI();
}

async function syncMusicWithPreference() {
  if (!backgroundMusic || !hasUserInteractedForMusic) {
    updateMusicToggleUI();
    return;
  }
  if (musicShouldBeOn) {
    try {
      backgroundMusic.volume = DEFAULT_MUSIC_VOLUME;
      await backgroundMusic.play();
    } catch (_error) {
      setMusicPreference(false);
    }
    updateMusicToggleUI();
    return;
  }
  backgroundMusic.pause();
  updateMusicToggleUI();
}


function ensureBackgroundMusicSource() {
  if (!backgroundMusic || backgroundMusic.dataset.sourceReady === "true") return;
  const musicSource = backgroundMusic.dataset.src;
  if (!musicSource) return;
  backgroundMusic.src = musicSource;
  backgroundMusic.dataset.sourceReady = "true";
  backgroundMusic.load();
}

function registerMusicGesture() {
  if (hasUserInteractedForMusic) return;
  hasUserInteractedForMusic = true;
  ensureBackgroundMusicSource();
  syncMusicWithPreference();
  updateMusicToggleUI();
}

function updateReducedMotionPreference(event) {
  prefersReducedMotion = event.matches;
  if (prefersReducedMotion) {
    resetParallax();
    if (particleAnimationFrameId) cancelAnimationFrame(particleAnimationFrameId);
    particleAnimationFrameId = null;
    if (particleContext) particleContext.clearRect(0, 0, particleCanvasWidth, particleCanvasHeight);
    return;
  }
  initializeParticles();
}

function playTreeBell() {
  beepAudio.currentTime = 0;
  beepAudio.play().catch(() => {});
}

function isLowPowerViewport() {
  return window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
}

function getCanopyHeartCount() {
  const viewportFactor = Math.min(window.innerWidth, 1200) / 1200;
  const minHearts = Math.round(CANOPY_HEART_DENSITY * 0.64);
  return Math.round(minHearts + (CANOPY_HEART_DENSITY - minHearts) * viewportFactor);
}

function buildCanopyHearts(count) {
  if (!treeCanopy || hasTreeReachedFinalState) return;
  treeRenderer.render(treeCanopy, count);
  canopyHeartNodes = Array.from(treeCanopy.querySelectorAll(".canopy-heart"));

  const messageCanopy = document.querySelector("#tree-panel .tree-canopy");
  if (messageCanopy) treeRenderer.render(messageCanopy, Math.round(count * 0.88));
  fallingLayoutCache = null;
}

function getFallingHeartPoolSize() {
  const area = window.innerWidth * window.innerHeight;
  const areaRatio = Math.min(area, 1920 * 1080) / (1920 * 1080);
  const dprPenalty = 1 / getEffectivePixelRatio();
  const baseCount = Math.round(10 + (42 - 10) * areaRatio * dprPenalty);
  if (isLowPowerViewport()) return Math.max(8, Math.min(24, Math.round(baseCount * 0.6)));
  return baseCount;
}

function isMessagePhaseVisible() {
  return Boolean(messageView?.classList.contains("is-active") && messageView?.getAttribute("aria-hidden") !== "true");
}

function getFallingHeartPoolNode(index) {
  if (!fallingHeartPool.length) return null;
  return fallingHeartPool[index % fallingHeartPool.length] ?? null;
}

function getFallingLayoutSnapshot() {
  const now = performance.now();
  if (fallingLayoutCache && now - fallingLayoutCacheAt < FALLING_LAYOUT_CACHE_TTL_MS) return fallingLayoutCache;
  if (!fallingHeartsLayer) return null;
  const layerRect = fallingHeartsLayer.getBoundingClientRect();
  const activeCanopy = getActiveTreeCanopy();
  const canopyRect = activeCanopy?.getBoundingClientRect();
  fallingLayoutCache = {
    width: layerRect.width,
    height: layerRect.height,
    canopySpawnXMin: canopyRect ? canopyRect.left - layerRect.left : layerRect.width * 0.32,
    canopySpawnXMax: canopyRect ? canopyRect.right - layerRect.left : layerRect.width * 0.68,
    canopySpawnYMin: canopyRect ? canopyRect.top - layerRect.top : layerRect.height * 0.08,
    canopySpawnYMax: canopyRect ? canopyRect.bottom - layerRect.top : layerRect.height * 0.32,
  };
  fallingLayoutCacheAt = now;
  return fallingLayoutCache;
}

function configureAndLaunchFallingHeart(heartNode) {
  if (!fallingHeartsLayer || !heartNode || !heartShowerHasStarted || !fallingHeartEmitterEnabled || !isMessagePhaseVisible()) return;
  const heartIndex = Number(heartNode.dataset.poolIndex || -1);
  if (heartIndex >= activeFallingHeartCount) {
    heartNode.classList.remove("is-active");
    return;
  }
  const layoutSnapshot = getFallingLayoutSnapshot();
  if (!layoutSnapshot) return;
  const x = randomBetween(layoutSnapshot.canopySpawnXMin, layoutSnapshot.canopySpawnXMax);
  const y = Math.max(0, randomBetween(layoutSnapshot.canopySpawnYMin, layoutSnapshot.canopySpawnYMax));
  const durationMs = randomBetween(4200, 7600);
  heartNode.classList.remove("is-active");
  heartNode.style.setProperty("--spawn-x", `${x.toFixed(1)}px`);
  heartNode.style.setProperty("--spawn-y", `${y.toFixed(1)}px`);
  heartNode.style.setProperty("--heart-size", `${randomBetween(10, 14).toFixed(1)}px`);
  heartNode.style.setProperty("--heart-color", pickHeartPaletteItem(HEART_PALETTE_VARS));
  heartNode.style.setProperty("--heart-scale", randomBetween(0.9, 1.08).toFixed(2));
  heartNode.style.setProperty("--fall-distance", `${randomBetween(layoutSnapshot.height * 0.58, layoutSnapshot.height * 0.98).toFixed(1)}px`);
  heartNode.style.setProperty("--fall-duration", `${(durationMs / 1000).toFixed(2)}s`);
  heartNode.style.setProperty("--drift-x", `${randomBetween(-68, -22).toFixed(1)}px`);
  heartNode.style.setProperty("--drift-y", `${randomBetween(-18, 22).toFixed(1)}px`);
  heartNode.style.setProperty("--spin-deg", `${randomBetween(-16, 16).toFixed(1)}deg`);
  heartNode.classList.remove("is-active");
  requestAnimationFrame(() => {
    if (!heartShowerHasStarted || !fallingHeartEmitterEnabled || !isMessagePhaseVisible()) return;
    heartNode.classList.add("is-active");
  });
}

function onFallingHeartIteration(event) {
  if (!(event.currentTarget instanceof HTMLElement)) return;
  configureAndLaunchFallingHeart(event.currentTarget);
}

function emitFallingHeartFromPool() {
  for (let i = 0; i < activeFallingHeartCount; i += 1) {
    const poolIndex = (nextFallingHeartIndex + i) % Math.max(1, activeFallingHeartCount);
    const heartNode = getFallingHeartPoolNode(poolIndex);
    if (!heartNode || !heartNode.classList.contains("is-enabled")) continue;
    nextFallingHeartIndex = (poolIndex + 1) % Math.max(1, activeFallingHeartCount);
    if (!heartNode.classList.contains("is-active")) configureAndLaunchFallingHeart(heartNode);
    break;
  }
}

function tickFallingHeartEmitter(timestamp) {
  if (!heartShowerHasStarted || !fallingHeartEmitterEnabled) {
    fallingHeartEmitterRafId = null;
    return;
  }
  if (isMessagePhaseVisible() && timestamp - lastFallingHeartEmitAt >= FALLING_HEART_EMIT_INTERVAL_MS) {
    emitFallingHeartFromPool();
    lastFallingHeartEmitAt = timestamp;
  }
  fallingHeartEmitterRafId = requestAnimationFrame(tickFallingHeartEmitter);
}

function startFallingHeartEmitter() {
  if (!heartShowerHasStarted || fallingHeartEmitterEnabled) return;
  fallingHeartEmitterEnabled = true;
  lastFallingHeartEmitAt = 0;
  if (!fallingHeartEmitterRafId) fallingHeartEmitterRafId = requestAnimationFrame(tickFallingHeartEmitter);
}

function pauseFallingHeartEmitter() {
  fallingHeartEmitterEnabled = false;
  if (fallingHeartEmitterRafId) cancelAnimationFrame(fallingHeartEmitterRafId);
  fallingHeartEmitterRafId = null;
}

function teardownFallingHeartEmitter() {
  pauseFallingHeartEmitter();
  heartShowerHasStarted = false;
  fallingHeartPool.forEach((heartNode) => heartNode.classList.remove("is-active"));
}

function syncFallingHeartsActivity() {
  fallingHeartPool.forEach((heartNode, index) => {
    const isActiveNode = index < activeFallingHeartCount;
    heartNode.classList.toggle("is-enabled", isActiveNode);
    if (!isActiveNode) {
      heartNode.classList.remove("is-active");
      return;
    }
    if (heartShowerHasStarted && fallingHeartEmitterEnabled && !heartNode.classList.contains("is-active") && isMessagePhaseVisible()) configureAndLaunchFallingHeart(heartNode);
  });
}

function buildFallingHeartPool() {
  if (!fallingHeartsLayer) return;
  activeFallingHeartCount = getFallingHeartPoolSize();
  const poolCapacity = Math.max(52, activeFallingHeartCount);
  while (fallingHeartPool.length < poolCapacity) {
    const n = document.createElement("span");
    n.className = "falling-heart";
    n.setAttribute("aria-hidden", "true");
    n.dataset.poolIndex = String(fallingHeartPool.length);
    n.addEventListener("animationiteration", onFallingHeartIteration);
    fallingHeartsLayer.append(n);
    fallingHeartPool.push(n);
  }
  syncFallingHeartsActivity();
}

function startFallingHeartShower() {
  if (prefersReducedMotion || heartShowerHasStarted || !fallingHeartsLayer) return;
  heartShowerHasStarted = true;
  if (fallingHeartPool.length === 0) buildFallingHeartPool();
  startFallingHeartEmitter();
  syncFallingHeartsActivity();
}

function flushParallax() {
  parallaxRafId = null;
  if (!latestPointerEvent || prefersReducedMotion) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const hearts = canopyHeartNodes;
  const xRatio = (latestPointerEvent.clientX / window.innerWidth - 0.5) * 2;
  const yRatio = (latestPointerEvent.clientY / window.innerHeight - 0.5) * 2;
  hearts.forEach((node, i) => {
    const depth = 2 + (i % 5) * 0.8;
    node.style.setProperty("--parallax-x", `${(-xRatio * depth).toFixed(2)}px`);
    node.style.setProperty("--parallax-y", `${(-yRatio * depth).toFixed(2)}px`);
  });
}

function updateParallax(event) {
  latestPointerEvent = event;
  if (parallaxRafId || prefersReducedMotion) return;
  parallaxRafId = requestAnimationFrame(flushParallax);
}

function resetParallax() {
  const hearts = canopyHeartNodes;
  hearts.forEach((node) => {
    node.style.setProperty("--parallax-x", "0px");
    node.style.setProperty("--parallax-y", "0px");
  });
}

function getParticleAnchorPoints() {
  const now = performance.now();
  if (particleAnchorCache.length > 0 && now - particleAnchorCacheAt < PARTICLE_ANCHOR_REFRESH_MS) return particleAnchorCache;
  const selected = canopyHeartNodes;
  if (selected.length > 0) {
    const stride = Math.max(1, Math.floor(selected.length / 24));
    particleAnchorCache = selected.filter((_, index) => index % stride === 0).map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.5,
      };
    });
  } else {
    const activeCanopy = getActiveTreeCanopy();
    const canopyRect = activeCanopy?.getBoundingClientRect();
    if (canopyRect) {
      particleAnchorCache = [{ x: canopyRect.left + canopyRect.width * 0.5, y: canopyRect.top + canopyRect.height * 0.45 }];
    } else {
      particleAnchorCache = [{ x: window.innerWidth * 0.5, y: Math.max(24, window.innerHeight * 0.2) }];
    }
  }
  particleAnchorCacheAt = now;
  return particleAnchorCache;
}

function seedParticleAtBranch(particle) {
  const anchors = getParticleAnchorPoints();
  const anchor = anchors[Math.floor(Math.random() * anchors.length)] ?? { x: window.innerWidth * 0.5, y: window.innerHeight * 0.2 };
  particle.anchorX = anchor.x + randomBetween(-14, 14);
  particle.anchorY = anchor.y + randomBetween(-8, 10);
  particle.x = particle.anchorX;
  particle.y = particle.anchorY;
  particle.baseSize = randomBetween(1.6, 4.9);
  particle.size = particle.baseSize;
  particle.rotation = randomBetween(0, Math.PI * 2);
  particle.spin = randomBetween(-0.02, 0.02);
  particle.color = pickHeartPaletteItem(particlePalette);
  particle.verticalSpeed = randomBetween(28, 82);
  particle.horizontalDrift = randomBetween(-25, 25);
  particle.wobbleFrequency = randomBetween(0.8, 2.6);
  particle.wobbleAmplitude = randomBetween(6, 22);
  particle.fallDistance = randomBetween(window.innerHeight * 0.5, window.innerHeight * 0.9);
  particle.fallInterval = randomBetween(PARTICLE_FALL_INTERVAL_RANGE_MS[0], PARTICLE_FALL_INTERVAL_RANGE_MS[1]);
  particle.nextFallAt = performance.now() + randomBetween(150, particle.fallInterval);
  particle.fallProgress = 0;
  particle.opacity = randomBetween(0.46, 0.92);
  particle.phase = "resting";
}

function startParticleFall(particle, timestamp) {
  particle.phase = "falling";
  particle.fallProgress = 0;
  particle.fallStartX = particle.anchorX;
  particle.fallStartY = particle.anchorY;
  particle.fallTravelX = particle.horizontalDrift * randomBetween(1.25, 2.3);
  particle.fallTravelY = particle.fallDistance;
  particle.fallAlphaStart = particle.opacity;
  particle.nextRegrowAt = timestamp + randomBetween(PARTICLE_REGROW_DELAY_RANGE_MS[0], PARTICLE_REGROW_DELAY_RANGE_MS[1]);
}

function regrowParticle(particle) {
  seedParticleAtBranch(particle);
  particle.nextFallAt = performance.now() + randomBetween(PARTICLE_FALL_INTERVAL_RANGE_MS[0], PARTICLE_FALL_INTERVAL_RANGE_MS[1]);
}

function resizeParticlesCanvas() {
  if (!particlesCanvas || !particleContext) return;
  const ratio = getEffectivePixelRatio();
  particleCanvasWidth = Math.max(1, Math.floor(window.innerWidth));
  particleCanvasHeight = Math.max(1, Math.floor(window.innerHeight));
  particlesCanvas.width = Math.floor(particleCanvasWidth * ratio);
  particlesCanvas.height = Math.floor(particleCanvasHeight * ratio);
  particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  particleAnchorCache = [];
}

function drawParticleShape(particle) {
  if (!particleContext) return;
  particleContext.save();
  particleContext.translate(particle.x, particle.y);
  particleContext.rotate(particle.rotation);
  particleContext.scale(1, 0.92);
  particleContext.fillStyle = particle.color;
  particleContext.globalAlpha = particle.opacity;
  particleContext.beginPath();
  particleContext.arc(-particle.size * 0.25, -particle.size * 0.1, particle.size * 0.55, 0, Math.PI * 2);
  particleContext.arc(particle.size * 0.25, -particle.size * 0.1, particle.size * 0.55, 0, Math.PI * 2);
  particleContext.moveTo(-particle.size * 0.86, particle.size * 0.12);
  particleContext.lineTo(0, particle.size * 1.05);
  particleContext.lineTo(particle.size * 0.86, particle.size * 0.12);
  particleContext.closePath();
  particleContext.fill();
  particleContext.restore();
}

function enforceParticleBalance(timestamp) {
  const restingCount = particles.reduce((count, particle) => count + (particle.phase === "resting" ? 1 : 0), 0);
  const restingRatio = particles.length > 0 ? restingCount / particles.length : 0;
  if (restingRatio < PARTICLE_MIN_RESTING_RATIO) {
    const fallingParticles = particles.filter((particle) => particle.phase !== "resting");
    const needed = Math.ceil(particles.length * PARTICLE_TARGET_RESTING_RATIO) - restingCount;
    for (let i = 0; i < Math.min(needed, fallingParticles.length); i += 1) {
      regrowParticle(fallingParticles[i]);
      fallingParticles[i].nextFallAt = timestamp + randomBetween(PARTICLE_FALL_INTERVAL_RANGE_MS[0], PARTICLE_FALL_INTERVAL_RANGE_MS[1]);
    }
  }
}

function tickParticles(timestamp) {
  if (!particleContext || prefersReducedMotion) return;
  const lastTimestamp = tickParticles.lastTimestamp ?? timestamp;
  const deltaSeconds = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
  tickParticles.lastTimestamp = timestamp;

  particleContext.clearRect(0, 0, particleCanvasWidth, particleCanvasHeight);

  particles.forEach((particle) => {
    particle.rotation += particle.spin;

    if (particle.phase === "resting") {
      particle.size = particle.baseSize * (0.92 + Math.sin(timestamp * 0.0016 + particle.anchorX * 0.01) * 0.1);
      particle.opacity = Math.max(0.38, 0.7 + Math.sin(timestamp * 0.0012 + particle.anchorY * 0.01) * 0.2);
      particle.x = particle.anchorX + Math.sin(timestamp * 0.001 + particle.anchorY * 0.02) * 1.6;
      particle.y = particle.anchorY + Math.cos(timestamp * 0.0012 + particle.anchorX * 0.018) * 1.2;
      if (timestamp >= particle.nextFallAt) startParticleFall(particle, timestamp);
      drawParticleShape(particle);
      return;
    }

    if (particle.phase === "regrowing") {
      if (timestamp >= particle.nextRegrowAt) regrowParticle(particle);
      return;
    }

    particle.fallProgress = Math.min(1, particle.fallProgress + deltaSeconds / (particle.fallInterval / 1000));
    const eased = particle.fallProgress * particle.fallProgress;
    particle.x = particle.fallStartX + particle.fallTravelX * eased + Math.sin((timestamp * 0.001 + particle.anchorX) * particle.wobbleFrequency) * particle.wobbleAmplitude * deltaSeconds;
    particle.y = particle.fallStartY + particle.fallTravelY * eased;
    particle.opacity = Math.max(0.04, particle.fallAlphaStart * (1 - particle.fallProgress * 0.9));
    particle.size = particle.baseSize * (0.85 + Math.sin(particle.fallProgress * Math.PI * 2) * 0.12);
    drawParticleShape(particle);

    if (particle.fallProgress >= 1 || particle.y > particleCanvasHeight + 32 || particle.x < -40 || particle.x > particleCanvasWidth + 40) {
      particle.phase = "regrowing";
    }
  });

  enforceParticleBalance(timestamp);
  particleAnimationFrameId = requestAnimationFrame(tickParticles);
}

function getParticlePoolSize() {
  const dprPenalty = 1 / getEffectivePixelRatio();
  const tunedBase = Math.round(BASE_PARTICLE_POOL_SIZE * (isLowPowerViewport() ? 0.52 : 1) * dprPenalty);
  return Math.max(36, Math.min(BASE_PARTICLE_POOL_SIZE, tunedBase));
}

function initializeParticles() {
  if (!particlesCanvas || prefersReducedMotion) return;
  particleContext = particlesCanvas.getContext("2d", { alpha: true });
  if (!particleContext) return;
  resizeParticlesCanvas();
  fallingLayoutCache = null;
  particles.length = 0;
  const particlePoolSize = getParticlePoolSize();
  for (let i = 0; i < particlePoolSize; i += 1) {
    const particle = { phase: "resting" };
    seedParticleAtBranch(particle);
    if (Math.random() > PARTICLE_TARGET_RESTING_RATIO) startParticleFall(particle, performance.now());
    particles.push(particle);
  }
  if (particleAnimationFrameId) cancelAnimationFrame(particleAnimationFrameId);
  tickParticles.lastTimestamp = undefined;
  particleAnimationFrameId = requestAnimationFrame(tickParticles);
}

function setTextContentIfChanged(node, nextValue) {
  if (!node) return;
  const normalizedValue = String(nextValue);
  if (node.textContent !== normalizedValue) node.textContent = normalizedValue;
}

function getCalendarElapsedParts(fromDate, toDate = new Date()) {
  if (Number.isNaN(fromDate.getTime()) || toDate.getTime() < fromDate.getTime()) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, isFuture: true };
  const c = new Date(fromDate.getTime());
  const e = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, isFuture: false };
  e.years = toDate.getFullYear() - c.getFullYear(); c.setFullYear(c.getFullYear() + e.years); if (c > toDate) { e.years -= 1; c.setFullYear(c.getFullYear() - 1); }
  e.months = toDate.getMonth() - c.getMonth(); if (e.months < 0) e.months += 12; c.setMonth(c.getMonth() + e.months); if (c > toDate) { e.months -= 1; c.setMonth(c.getMonth() - 1); }
  while (new Date(c.getTime() + 86400000) <= toDate) { e.days += 1; c.setDate(c.getDate() + 1); }
  while (new Date(c.getTime() + 3600000) <= toDate) { e.hours += 1; c.setHours(c.getHours() + 1); }
  while (new Date(c.getTime() + 60000) <= toDate) { e.minutes += 1; c.setMinutes(c.getMinutes() + 1); }
  return e;
}

function updateElapsedCounter() {
  if (!elapsedYears || !elapsedMonths || !elapsedDays || !elapsedHours || !elapsedMinutes) return;
  const elapsed = getCalendarElapsedParts(startDate);
  setTextContentIfChanged(elapsedYears, elapsed.years);
  setTextContentIfChanged(elapsedMonths, elapsed.months);
  setTextContentIfChanged(elapsedDays, elapsed.days);
  setTextContentIfChanged(elapsedHours, elapsed.hours);
  setTextContentIfChanged(elapsedMinutes, elapsed.minutes);
  setTextContentIfChanged(counterMessage, elapsed.isFuture ? "La fecha aún no llega 💖" : "");
}

function setMicroIntroPreference(nextValue) {
  shouldSkipMicroIntro = Boolean(nextValue);
  localStorage.setItem(MICRO_INTRO_STORAGE_KEY, String(shouldSkipMicroIntro));
  if (microIntroHideNextCheckbox) microIntroHideNextCheckbox.checked = shouldSkipMicroIntro;
}

function hideMicroIntroOverlay() {
  if (!microIntro) return;
  microIntro.classList.remove("is-active");
  microIntro.classList.add("is-hidden");
  microIntro.setAttribute("aria-hidden", "true");
}

function finishMicroIntro() {
  if (microIntroHasFinished) return;
  microIntroHasFinished = true;
  if (microIntroTimeoutId) {
    clearTimeout(microIntroTimeoutId);
    microIntroTimeoutId = null;
  }
  hideMicroIntroOverlay();
  if (currentState === STATES.INTRO) {
    startIntroStateMachine();
  }
}

function startMicroIntro() {
  if (!microIntro) {
    finishMicroIntro();
    return;
  }
  microIntroHasFinished = false;
  hasTreeReachedFinalState = false;
  microIntro.classList.remove("is-hidden");
  microIntro.classList.add("is-active");
  microIntro.setAttribute("aria-hidden", "false");
  microIntroTimeoutId = setTimeout(finishMicroIntro, MICRO_INTRO_DURATION_MS);
}

function normalizeTreeTransform() {
  if (!loveTree) return;
  loveTree.style.transform = "translateY(0) rotate(0deg) scaleX(1) scaleY(1)";
}

function showTree() {
  normalizeTreeTransform();
  heartButton.classList.add("is-hidden");
  loveTree.classList.add("is-visible", "is-growing");
  playTreeBell();
}

function hasSeedTouchedGround() {
  if (!heart || !ground) return false;
  const seedRect = heart.getBoundingClientRect();
  const groundRect = ground.getBoundingClientRect();
  const horizontalOverlap = seedRect.right >= groundRect.left && seedRect.left <= groundRect.right;
  const verticalTouch = seedRect.bottom >= groundRect.top;
  return horizontalOverlap && verticalTouch;
}

function waitForSeedLanding() {
  return new Promise((resolve) => {
    let finished = false;
    let rafId = 0;
    const finish = () => {
      if (finished) return;
      finished = true;
      heartButton.removeEventListener("animationend", onAnimationEnd);
      if (rafId) cancelAnimationFrame(rafId);
      heartButton.classList.add("is-landed");
      resolve();
    };

    const tickCollision = () => {
      if (finished) return;
      if (hasSeedTouchedGround()) {
        finish();
        return;
      }
      rafId = requestAnimationFrame(tickCollision);
    };

    const onAnimationEnd = (event) => {
      if (event.target !== heartButton || event.animationName !== "heart-fall") return;
      finish();
    };

    heartButton.addEventListener("animationend", onAnimationEnd);
    rafId = requestAnimationFrame(tickCollision);
    window.setTimeout(finish, PHASE_TIMEOUTS_MS.falling);
  });
}

function lockTreeAsFinalState() {
  if (!loveTree || hasTreeReachedFinalState) return;
  hasTreeReachedFinalState = true;
  loveTree.classList.add("tree--final");
}

function typePoem(lines, config = typewriterConfig, runToken) {
  if (!poemContainer || poemHasStarted) return;
  poemHasStarted = true;
  poemContainer.textContent = "";
  if (finalDedication) { finalDedication.textContent = ""; finalDedication.classList.remove("is-visible"); }
  if (prefersReducedMotion) {
    poemContainer.textContent = lines.join("\n");
    if (finalDedication) {
      finalDedication.textContent = "Eres mi lugar favorito en el mundo. 💘";
      finalDedication.classList.add("is-visible");
    }
    return;
  }
  let lineIndex = 0; let charIndex = 0;
  const typeNextCharacter = () => {
    if (runToken !== activeRunToken) return;
    if (lineIndex >= lines.length) {
      if (finalDedication) {
        finalDedication.textContent = "Eres mi lugar favorito en el mundo. 💘";
        finalDedication.classList.add("is-visible");
      }
      return;
    }
    const currentLine = lines[lineIndex];
    if (charIndex < currentLine.length) {
      poemContainer.textContent += currentLine[charIndex++];
      setTimeout(typeNextCharacter, config.letterDelayMs);
      return;
    }
    lineIndex += 1; charIndex = 0;
    if (lineIndex < lines.length) { poemContainer.textContent += "\n"; setTimeout(typeNextCharacter, config.lineDelayMs); }
    else { setTimeout(typeNextCharacter, config.lineDelayMs); }
  };
  typeNextCharacter();
}

function showMessageView() {
  keepLoveHeadingPersistent();
  lockTreeAsFinalState();
  syncScenePhase(STATES.REVEAL_MESSAGE);
  introView.classList.add("is-active"); introView.setAttribute("aria-hidden", "false");
  messageView.classList.add("is-active"); messageView.setAttribute("aria-hidden", "false");
  updateElapsedCounter();
  if (!elapsedCounterIntervalId) elapsedCounterIntervalId = setInterval(updateElapsedCounter, 60000);
  typePoem(poemLines, typewriterConfig, activeRunToken);
  startFallingHeartShower();
  startFallingHeartEmitter();
}

const INTRO_FLOW_SEQUENCE = [STATES.MORPH, STATES.FALLING, STATES.TREE, STATES.REVEAL_MESSAGE];

const INTRO_FLOW_MACHINE = {
  [STATES.MORPH]: {
    enter: () => {
      heartButton.disabled = true;
      heart.classList.add("is-morphing", "is-seed");
      ground.classList.add("is-visible");
    },
    wait: () => {
      if (prefersReducedMotion) return Promise.resolve();
      return Promise.all([
        waitForMotionEnd({ element: heart, eventName: "transitionend", timeoutMs: PHASE_TIMEOUTS_MS.morph, filter: (e) => e.propertyName === "transform" }),
        waitForMotionEnd({ element: ground, eventName: "transitionend", timeoutMs: PHASE_TIMEOUTS_MS.morph, filter: (e) => e.propertyName === "transform" }),
      ]);
    },
    delayMs: PHASE_DELAYS_MS.afterMorph,
  },
  [STATES.FALLING]: {
    enter: () => {
      heartButton.classList.add("is-falling");
      if (prefersReducedMotion) heartButton.classList.add("is-landed");
    },
    wait: () => (prefersReducedMotion ? Promise.resolve() : waitForSeedLanding()),
    delayMs: PHASE_DELAYS_MS.afterFalling,
  },
  [STATES.TREE]: {
    enter: () => {
      showTree();
    },
    wait: async () => {
      if (!prefersReducedMotion) {
        await waitForMotionEnd({ element: loveTree, eventName: "animationend", timeoutMs: PHASE_TIMEOUTS_MS.tree, filter: (e) => e.animationName === "tree-grow" });
      }
      if (!isTreeFull()) await waitForPhaseDelay(PHASE_DELAYS_MS.afterTree);
    },
  },
  [STATES.REVEAL_MESSAGE]: {
    enter: () => {
      showMessageView();
    },
    wait: () => Promise.resolve(),
  },
};

async function runIntroStateMachine(runToken) {
  for (const phaseState of INTRO_FLOW_SEQUENCE) {
    if (runToken !== activeRunToken) return;
    if (!transitionTo(phaseState)) return;
    const phase = INTRO_FLOW_MACHINE[phaseState];
    phase?.enter?.();
    await phase?.wait?.();
    if (runToken !== activeRunToken) return;
    if (phase?.delayMs) await waitForPhaseDelay(phase.delayMs);
  }
}

function startIntroStateMachine() {
  if (currentState !== STATES.INTRO || introMachineInFlight) return;
  const runToken = ++activeRunToken;
  introMachineInFlight = true;
  runIntroStateMachine(runToken).finally(() => {
    if (runToken === activeRunToken) introMachineInFlight = false;
  });
}

function resetExperience() {
  keepLoveHeadingPersistent();
  activeRunToken += 1;
  currentState = STATES.INTRO;
  syncScenePhase(STATES.INTRO);
  poemHasStarted = false;
  introMachineInFlight = false;
  pauseFallingHeartEmitter();
  heartButton.disabled = false;
  heartButton.classList.remove("is-hidden", "is-falling", "is-landed");
  heart.classList.remove("is-morphing", "is-seed");
  ground.classList.remove("is-visible");
  loveTree.classList.remove("is-visible", "is-growing", "tree--final");
  introView.classList.add("is-active");
  introView.setAttribute("aria-hidden", "false");
  messageView.classList.remove("is-active");
  messageView.setAttribute("aria-hidden", "true");
  if (poemContainer) poemContainer.textContent = "";
  if (finalDedication) { finalDedication.textContent = ""; finalDedication.classList.remove("is-visible"); }
  fallingHeartPool.forEach((h) => { h.classList.remove("is-active"); });
  fallingLayoutCache = null;
  microIntroHasFinished = false;
  hasTreeReachedFinalState = false;
  hideMicroIntroOverlay();
}

microIntroSkipButton?.addEventListener("click", finishMicroIntro);
microIntroHideNextCheckbox?.addEventListener("change", (event) => {
  setMicroIntroPreference(event.currentTarget.checked);
});

heartButton?.addEventListener("click", () => {
  if (currentState !== STATES.INTRO) return;
  startIntroStateMachine();
});
musicToggleButton?.addEventListener("click", () => {
  ensureBackgroundMusicSource();
  registerMusicGesture();
  setMusicPreference(!musicShouldBeOn);
  syncMusicWithPreference();
});
musicToggleButton?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " " && event.key !== "Space") return;
  event.preventDefault();
  musicToggleButton.click();
});
restartButton?.addEventListener("click", resetExperience);
window.addEventListener("pointermove", updateParallax, { passive: true });
window.addEventListener("pointerleave", resetParallax);

window.addEventListener("pointerdown", registerMusicGesture, { passive: true, once: true });
window.addEventListener("touchstart", registerMusicGesture, { passive: true, once: true });
window.addEventListener("keydown", registerMusicGesture, { once: true });
window.addEventListener("pagehide", teardownFallingHeartEmitter);

if (backgroundMusic) backgroundMusic.volume = DEFAULT_MUSIC_VOLUME;
if (backgroundMusic) backgroundMusic.pause();
musicShouldBeOn = localStorage.getItem(MUSIC_STORAGE_KEY) === "true";
shouldSkipMicroIntro = localStorage.getItem(MICRO_INTRO_STORAGE_KEY) === "true";
if (microIntroHideNextCheckbox) microIntroHideNextCheckbox.checked = shouldSkipMicroIntro;
updateMusicToggleUI();
syncThemePalettes();
keepLoveHeadingPersistent();
syncScenePhase(currentState);
initializeParticles();
buildCanopyHearts(getCanopyHeartCount());
buildFallingHeartPool();
fallingLayoutCache = null;

if (shouldSkipMicroIntro) {
  finishMicroIntro();
} else {
  startMicroIntro();
}

window.addEventListener("resize", () => {
  resizeParticlesCanvas();
  fallingLayoutCache = null;
  if (!hasTreeReachedFinalState) buildCanopyHearts(getCanopyHeartCount());
  if (heartShowerResizeTimeoutId) clearTimeout(heartShowerResizeTimeoutId);
  heartShowerResizeTimeoutId = setTimeout(buildFallingHeartPool, 180);
});

if (typeof reducedMotionMediaQuery.addEventListener === "function") {
  reducedMotionMediaQuery.addEventListener("change", updateReducedMotionPreference);
} else if (typeof reducedMotionMediaQuery.addListener === "function") {
  reducedMotionMediaQuery.addListener(updateReducedMotionPreference);
}
