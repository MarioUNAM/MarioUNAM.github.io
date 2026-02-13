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
const treeCanopy = document.querySelector(".tree-canopy");
const poemContainer = document.querySelector("#poem");
const finalDedication = document.querySelector("#final-dedication");
const fallingHeartsLayer = document.querySelector("#falling-hearts-layer");
const backgroundMusic = document.querySelector("#bg-music");
const musicToggleButton = document.querySelector("#music-toggle");
const themeToggleButton = document.querySelector("#theme-toggle");
const muteToggleButton = document.querySelector("#mute-toggle");
const restartButton = document.querySelector("#restart-button");
const reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const START_DATE = "2016-09-09T00:00:00";
const startDate = new Date(START_DATE);
const MUSIC_STORAGE_KEY = "musicOn";
const THEME_STORAGE_KEY = "themeMode";
const MUTE_STORAGE_KEY = "globalMute";
const DEFAULT_MUSIC_VOLUME = 0.2;

const STATES = { INTRO: "intro", MORPH: "morph", FALLING: "falling", TREE: "tree", REVEAL_MESSAGE: "revealMessage" };
const PHASE_TIMEOUTS_MS = { morph: 760, falling: 1560, tree: 1200 };
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
let isMuted = false;
let activeRunToken = 0;
let prefersReducedMotion = reducedMotionMediaQuery.matches;

const fallingHeartPool = [];
const fallingHeartTimers = new WeakMap();
let activeFallingHeartCount = 0;
const HEART_PALETTE_CLASSES = ["is-blush", "is-petal", "is-fuchsia-soft", "is-coral-soft", "is-rose", "is-red-soft"];
const HEART_PALETTE_VARS = ["var(--heart-1)", "var(--heart-2)", "var(--heart-3)", "var(--heart-4)", "var(--heart-5)", "var(--heart-6)"];
const CANOPY_HEART_DENSITY = 88;
const CANOPY_HORIZONTAL_SPREAD = 29;
const CANOPY_VERTICAL_SPREAD = 27;

const pickHeartPaletteItem = (palette) => palette[Math.floor(Math.random() * palette.length)];
const beepAudio = new Audio("data:audio/wav;base64,UklGRjgAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRQAAAAAABw9XL+fbj0NAAAAAA==");
beepAudio.volume = 0.15;

const randomBetween = (min, max) => Math.random() * (max - min) + min;


function getEffectivePixelRatio() {
  return Math.min(3, Math.max(1, window.devicePixelRatio || 1));
}

function transitionTo(nextState) {
  const allowedStates = VALID_TRANSITIONS[currentState] ?? [];
  if (!allowedStates.includes(nextState)) return false;
  currentState = nextState;
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

function updateMusicToggleUI() {
  if (!musicToggleButton) return;
  const isPlaying = musicShouldBeOn && hasUserInteractedForMusic && !isMuted;
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
  if (musicShouldBeOn && !isMuted) {
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
  if (prefersReducedMotion) resetParallax();
}

function updateMuteToggleUI() {
  if (!muteToggleButton) return;
  muteToggleButton.classList.toggle("is-active", isMuted);
  muteToggleButton.setAttribute("aria-pressed", String(isMuted));
  muteToggleButton.textContent = isMuted ? "🔇 Silenciado" : "🔔 Sonidos activos";
}

function setMutePreference(nextValue) {
  isMuted = Boolean(nextValue);
  localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
  updateMuteToggleUI();
  syncMusicWithPreference();
}

function updateThemeToggleUI() {
  const isNight = document.documentElement.dataset.theme === "night";
  if (!themeToggleButton) return;
  themeToggleButton.classList.toggle("is-active", isNight);
  themeToggleButton.setAttribute("aria-pressed", String(isNight));
  themeToggleButton.textContent = isNight ? "🌅 Modo día" : "🌙 Noche romántica";
}

function toggleTheme() {
  const isNight = document.documentElement.dataset.theme === "night";
  document.documentElement.dataset.theme = isNight ? "day" : "night";
  localStorage.setItem(THEME_STORAGE_KEY, document.documentElement.dataset.theme);
  updateThemeToggleUI();
}

function playTreeBell() {
  if (isMuted) return;
  beepAudio.currentTime = 0;
  beepAudio.play().catch(() => {});
}

function getCanopyHeartCount() {
  const viewportFactor = Math.min(window.innerWidth, 1200) / 1200;
  const minHearts = Math.round(CANOPY_HEART_DENSITY * 0.64);
  return Math.round(minHearts + (CANOPY_HEART_DENSITY - minHearts) * viewportFactor);
}

function isPointInsideHeartMask(x, y) {
  return (x * x + y * y - 1) ** 3 - x * x * y * y * y <= 0;
}

function getRandomPointInHeartMask() {
  for (let i = 0; i < 220; i += 1) {
    const x = randomBetween(-1.18, 1.18);
    const y = randomBetween(-1.28, 1.18);
    if (isPointInsideHeartMask(x, y)) {
      const yBias = y < 0 ? 1.03 : 0.97;
      return { x: x * 0.99, y: y * yBias };
    }
  }
  return { x: 0, y: 0 };
}

function buildCanopyHearts(count) {
  if (!treeCanopy) return;
  treeCanopy.innerHTML = "";
  for (let i = 0; i < count; i += 1) {
    const point = getRandomPointInHeartMask();
    const heartNode = document.createElement("span");
    heartNode.className = `canopy-heart ${HEART_PALETTE_CLASSES[i % HEART_PALETTE_CLASSES.length]}`;
    heartNode.style.left = `${(50 + point.x * CANOPY_HORIZONTAL_SPREAD).toFixed(2)}%`;
    heartNode.style.top = `${(58 - point.y * CANOPY_VERTICAL_SPREAD).toFixed(2)}%`;
    heartNode.style.setProperty("--heart-scale", randomBetween(0.92, 1.08).toFixed(2));
    heartNode.style.animationDelay = `${randomBetween(0, 1.4).toFixed(2)}s`;
    treeCanopy.append(heartNode);
  }
}

function getFallingHeartPoolSize() {
  const area = window.innerWidth * window.innerHeight;
  const areaRatio = Math.min(area, 1920 * 1080) / (1920 * 1080);
  const dprPenalty = 1 / getEffectivePixelRatio();
  return Math.round(10 + (42 - 10) * areaRatio * dprPenalty);
}

function clearFallingHeartTimer(heartNode) {
  const timerId = fallingHeartTimers.get(heartNode);
  if (!timerId) return;
  clearTimeout(timerId);
  fallingHeartTimers.delete(heartNode);
}

function scheduleFallingHeart(heartNode, delayMs = 0) {
  clearFallingHeartTimer(heartNode);
  const timerId = setTimeout(() => {
    fallingHeartTimers.delete(heartNode);
    configureAndLaunchFallingHeart(heartNode);
  }, delayMs);
  fallingHeartTimers.set(heartNode, timerId);
}

function configureAndLaunchFallingHeart(heartNode) {
  if (!fallingHeartsLayer || !heartNode || !heartShowerHasStarted) return;
  const heartIndex = Number(heartNode.dataset.poolIndex || -1);
  if (heartIndex >= activeFallingHeartCount) {
    heartNode.classList.remove("is-active");
    clearFallingHeartTimer(heartNode);
    return;
  }
  const layerRect = fallingHeartsLayer.getBoundingClientRect();
  const canopyRect = treeCanopy?.getBoundingClientRect();
  const x = canopyRect ? canopyRect.left - layerRect.left + canopyRect.width * randomBetween(0.28, 0.72) : layerRect.width * randomBetween(0.32, 0.68);
  const y = canopyRect ? Math.max(0, canopyRect.top - layerRect.top + canopyRect.height * randomBetween(0.08, 0.32)) : layerRect.height * 0.2;
  const durationMs = randomBetween(4200, 7600);
  heartNode.classList.remove("is-active");
  heartNode.style.setProperty("--spawn-x", `${x.toFixed(1)}px`);
  heartNode.style.setProperty("--spawn-y", `${y.toFixed(1)}px`);
  heartNode.style.setProperty("--heart-size", `${randomBetween(10, 14).toFixed(1)}px`);
  heartNode.style.setProperty("--heart-color", pickHeartPaletteItem(HEART_PALETTE_VARS));
  heartNode.style.setProperty("--heart-scale", randomBetween(0.9, 1.08).toFixed(2));
  heartNode.style.setProperty("--fall-distance", `${randomBetween(layerRect.height * 0.58, layerRect.height * 0.98).toFixed(1)}px`);
  heartNode.style.setProperty("--fall-duration", `${(durationMs / 1000).toFixed(2)}s`);
  heartNode.style.setProperty("--drift-x", `${randomBetween(-26, 26).toFixed(1)}px`);
  requestAnimationFrame(() => heartNode.classList.add("is-active"));
  scheduleFallingHeart(heartNode, durationMs + randomBetween(240, 1800));
}

function syncFallingHeartsActivity() {
  fallingHeartPool.forEach((heartNode, index) => {
    const isActiveNode = index < activeFallingHeartCount;
    heartNode.classList.toggle("is-enabled", isActiveNode);
    if (!isActiveNode) {
      heartNode.classList.remove("is-active");
      clearFallingHeartTimer(heartNode);
      return;
    }
    if (heartShowerHasStarted && !heartNode.classList.contains("is-active") && !fallingHeartTimers.has(heartNode)) {
      scheduleFallingHeart(heartNode, index * 85);
    }
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
    fallingHeartsLayer.append(n);
    fallingHeartPool.push(n);
  }
  syncFallingHeartsActivity();
}

function startFallingHeartShower() {
  if (prefersReducedMotion || heartShowerHasStarted || !fallingHeartsLayer) return;
  heartShowerHasStarted = true;
  if (fallingHeartPool.length === 0) buildFallingHeartPool();
  syncFallingHeartsActivity();
}

function flushParallax() {
  parallaxRafId = null;
  if (!latestPointerEvent || prefersReducedMotion) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const hearts = treeCanopy?.querySelectorAll(".canopy-heart") ?? [];
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
  const hearts = treeCanopy?.querySelectorAll(".canopy-heart") ?? [];
  hearts.forEach((node) => {
    node.style.setProperty("--parallax-x", "0px");
    node.style.setProperty("--parallax-y", "0px");
  });
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

function showTree() { heartButton.classList.add("is-hidden"); loveTree.classList.add("is-visible"); playTreeBell(); }

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
  introView.classList.remove("is-active"); introView.setAttribute("aria-hidden", "true");
  messageView.classList.add("is-active"); messageView.setAttribute("aria-hidden", "false");
  scene.classList.add("show-message"); updateElapsedCounter();
  if (!elapsedCounterIntervalId) elapsedCounterIntervalId = setInterval(updateElapsedCounter, 60000);
  typePoem(poemLines, typewriterConfig, activeRunToken);
  startFallingHeartShower();
}

async function runIntroSequence(runToken) {
  if (prefersReducedMotion) {
    if (!transitionTo(STATES.MORPH)) return;
    heartButton.disabled = true; heart.classList.add("is-morphing"); ground.classList.add("is-visible");
    if (runToken !== activeRunToken || !transitionTo(STATES.FALLING)) return;
    heartButton.classList.add("is-falling");
    if (runToken !== activeRunToken || !transitionTo(STATES.TREE)) return;
    showTree();
    if (runToken !== activeRunToken || !transitionTo(STATES.REVEAL_MESSAGE)) return;
    showMessageView();
    return;
  }
  if (!transitionTo(STATES.MORPH)) return;
  heartButton.disabled = true; heart.classList.add("is-morphing"); ground.classList.add("is-visible");
  await waitForMotionEnd({ element: heart, eventName: "transitionend", timeoutMs: PHASE_TIMEOUTS_MS.morph, filter: (e) => e.propertyName === "transform" });
  if (runToken !== activeRunToken || !transitionTo(STATES.FALLING)) return;
  heartButton.classList.add("is-falling");
  await waitForMotionEnd({ element: heartButton, eventName: "animationend", timeoutMs: PHASE_TIMEOUTS_MS.falling, filter: (e) => e.animationName === "heart-fall" });
  if (runToken !== activeRunToken || !transitionTo(STATES.TREE)) return;
  showTree();
  await waitForMotionEnd({ element: loveTree, eventName: "animationend", timeoutMs: PHASE_TIMEOUTS_MS.tree, filter: (e) => e.animationName === "tree-appear" });
  if (runToken !== activeRunToken || !transitionTo(STATES.REVEAL_MESSAGE)) return;
  showMessageView();
}

function resetExperience() {
  activeRunToken += 1;
  currentState = STATES.INTRO;
  poemHasStarted = false;
  heartShowerHasStarted = false;
  heartButton.disabled = false;
  heartButton.classList.remove("is-hidden", "is-falling");
  heart.classList.remove("is-morphing");
  ground.classList.remove("is-visible");
  loveTree.classList.remove("is-visible");
  scene.classList.remove("show-message");
  introView.classList.add("is-active");
  introView.setAttribute("aria-hidden", "false");
  messageView.classList.remove("is-active");
  messageView.setAttribute("aria-hidden", "true");
  if (poemContainer) poemContainer.textContent = "";
  if (finalDedication) { finalDedication.textContent = ""; finalDedication.classList.remove("is-visible"); }
  fallingHeartPool.forEach((h) => { h.classList.remove("is-active"); clearFallingHeartTimer(h); });
}

heartButton?.addEventListener("click", () => {
  if (currentState !== STATES.INTRO) return;
  const runToken = ++activeRunToken;
  runIntroSequence(runToken);
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
themeToggleButton?.addEventListener("click", toggleTheme);
muteToggleButton?.addEventListener("click", () => setMutePreference(!isMuted));
restartButton?.addEventListener("click", resetExperience);
window.addEventListener("pointermove", updateParallax, { passive: true });
window.addEventListener("pointerleave", resetParallax);

window.addEventListener("pointerdown", registerMusicGesture, { passive: true, once: true });
window.addEventListener("touchstart", registerMusicGesture, { passive: true, once: true });
window.addEventListener("keydown", registerMusicGesture, { once: true });

if (backgroundMusic) backgroundMusic.volume = DEFAULT_MUSIC_VOLUME;
if (backgroundMusic) backgroundMusic.pause();
musicShouldBeOn = localStorage.getItem(MUSIC_STORAGE_KEY) === "true";
isMuted = localStorage.getItem(MUTE_STORAGE_KEY) === "true";
document.documentElement.dataset.theme = localStorage.getItem(THEME_STORAGE_KEY) === "night" ? "night" : "day";
updateMusicToggleUI();
updateMuteToggleUI();
updateThemeToggleUI();
buildCanopyHearts(getCanopyHeartCount());
buildFallingHeartPool();

window.addEventListener("resize", () => {
  buildCanopyHearts(getCanopyHeartCount());
  if (heartShowerResizeTimeoutId) clearTimeout(heartShowerResizeTimeoutId);
  heartShowerResizeTimeoutId = setTimeout(buildFallingHeartPool, 180);
});

if (typeof reducedMotionMediaQuery.addEventListener === "function") {
  reducedMotionMediaQuery.addEventListener("change", updateReducedMotionPreference);
} else if (typeof reducedMotionMediaQuery.addListener === "function") {
  reducedMotionMediaQuery.addListener(updateReducedMotionPreference);
}
