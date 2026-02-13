const introView = document.querySelector("#intro-view");
const scene = document.querySelector("#scene");
const messageView = document.querySelector("#message-view");
const heartButton = document.querySelector("#heart-button");
const heart = document.querySelector(".heart");
const ground = document.querySelector("#ground");
const loveTree = document.querySelector("#love-tree");
const elapsedDays = document.querySelector("#elapsed-days");
const elapsedHours = document.querySelector("#elapsed-hours");
const elapsedMinutes = document.querySelector("#elapsed-minutes");
const elapsedSeconds = document.querySelector("#elapsed-seconds");
const counterMessage = document.querySelector("#counter-message");
const treeCanopy = document.querySelector(".tree-canopy");
const poemContainer = document.querySelector("#poem");
const fallingHeartsLayer = document.querySelector("#falling-hearts-layer");

const START_DATE = "2024-02-14T00:00:00";
const startDate = new Date(START_DATE);

const STATES = {
  INTRO: "intro",
  MORPH: "morph",
  FALLING: "falling",
  TREE: "tree",
  REVEAL_MESSAGE: "revealMessage",
};

const PHASE_TIMEOUTS_MS = {
  morph: 760,
  falling: 1560,
  tree: 1200,
};

const VALID_TRANSITIONS = {
  [STATES.INTRO]: [STATES.MORPH],
  [STATES.MORPH]: [STATES.FALLING],
  [STATES.FALLING]: [STATES.TREE],
  [STATES.TREE]: [STATES.REVEAL_MESSAGE],
  [STATES.REVEAL_MESSAGE]: [],
};

let currentState = STATES.INTRO;

// Contenido configurable del poema.
const poemLines = [
  "Eres luz en mis mañanas,",
  "calma dulce en tempestad,",
  "cada latido me recuerda",
  "que contigo es hogar.",
];

const typewriterConfig = {
  letterDelayMs: 45,
  lineDelayMs: 350,
};

let poemHasStarted = false;
let elapsedCounterIntervalId = null;
let heartShowerHasStarted = false;
let heartShowerResizeTimeoutId = null;

const fallingHeartPool = [];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function transitionTo(nextState) {
  const allowedStates = VALID_TRANSITIONS[currentState] ?? [];
  if (!allowedStates.includes(nextState)) {
    return false;
  }

  currentState = nextState;
  return true;
}

function waitForMotionEnd({
  element,
  eventName,
  timeoutMs,
  filter = () => true,
}) {
  return new Promise((resolve) => {
    let isDone = false;

    const finish = () => {
      if (isDone) {
        return;
      }

      isDone = true;
      element.removeEventListener(eventName, onMotionEnd);
      window.clearTimeout(fallbackTimeoutId);
      resolve();
    };

    const onMotionEnd = (event) => {
      if (event.target !== element || !filter(event)) {
        return;
      }

      finish();
    };

    element.addEventListener(eventName, onMotionEnd);

    const fallbackTimeoutId = window.setTimeout(() => {
      finish();
    }, timeoutMs);
  });
}

function getCanopyHeartCount() {
  const minHearts = 30;
  const maxHearts = 80;
  const viewportFactor = Math.min(window.innerWidth, 1200) / 1200;

  return Math.round(minHearts + (maxHearts - minHearts) * viewportFactor);
}

function isPointInsideHeartMask(x, y) {
  const heartEquation = (x * x + y * y - 1) ** 3 - x * x * y * y * y;
  return heartEquation <= 0;
}

function getRandomPointInHeartMask() {
  const maxAttempts = 200;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const x = randomBetween(-1.2, 1.2);
    const y = randomBetween(-1.3, 1.2);

    if (isPointInsideHeartMask(x, y)) {
      return { x, y };
    }
  }

  return { x: 0, y: 0 };
}

function buildCanopyHearts(count) {
  if (!treeCanopy) {
    return;
  }

  treeCanopy.innerHTML = "";

  const colors = [
    "is-blush",
    "is-petal",
    "is-fuchsia-soft",
    "is-coral-soft",
    "is-rose",
    "is-red-soft",
  ];

  for (let index = 0; index < count; index += 1) {
    const heartNode = document.createElement("span");
    const point = getRandomPointInHeartMask();

    // Escala puntos dentro de una máscara de corazón para mantener la silueta.
    const x = 50 + point.x * 30;
    const y = 58 - point.y * 28;
    const size = randomBetween(0.92, 1.08);

    heartNode.className = `canopy-heart ${colors[index % colors.length]}`;
    heartNode.style.left = `${x.toFixed(2)}%`;
    heartNode.style.top = `${y.toFixed(2)}%`;
    heartNode.style.setProperty("--heart-scale", size.toFixed(2));
    heartNode.style.animationDelay = `${randomBetween(0, 1.4).toFixed(2)}s`;
    treeCanopy.append(heartNode);
  }
}

function getFallingHeartPoolSize() {
  const area = window.innerWidth * window.innerHeight;
  const minHearts = 14;
  const maxHearts = 54;
  const normalizedArea = Math.min(area, 1920 * 1080) / (1920 * 1080);

  return Math.round(minHearts + (maxHearts - minHearts) * normalizedArea);
}

function configureAndLaunchFallingHeart(heartNode) {
  if (!fallingHeartsLayer || !heartNode) {
    return;
  }

  const canopyRect = treeCanopy?.getBoundingClientRect();
  const layerRect = fallingHeartsLayer.getBoundingClientRect();
  const originCenterX = canopyRect
    ? canopyRect.left - layerRect.left + canopyRect.width * randomBetween(0.28, 0.72)
    : layerRect.width * randomBetween(0.32, 0.68);
  const originY = canopyRect
    ? Math.max(0, canopyRect.top - layerRect.top + canopyRect.height * randomBetween(0.08, 0.32))
    : layerRect.height * 0.2;

  const size = randomBetween(10, 14);
  const distance = randomBetween(layerRect.height * 0.58, layerRect.height * 0.98);
  const durationMs = randomBetween(4200, 7600);
  const drift = randomBetween(-26, 26);
  const colors = ["#f49bc0", "#de5d98", "#ee7d83", "#d95f7a", "#cb4e69"];

  heartNode.classList.remove("is-active");
  heartNode.style.left = `${originCenterX.toFixed(1)}px`;
  heartNode.style.top = `${originY.toFixed(1)}px`;
  heartNode.style.setProperty("--heart-size", `${size.toFixed(1)}px`);
  heartNode.style.setProperty("--heart-color", colors[Math.floor(Math.random() * colors.length)]);
  heartNode.style.setProperty("--fall-distance", `${distance.toFixed(1)}px`);
  heartNode.style.setProperty("--fall-duration", `${(durationMs / 1000).toFixed(2)}s`);
  heartNode.style.setProperty("--drift-x", `${drift.toFixed(1)}px`);

  window.requestAnimationFrame(() => {
    heartNode.classList.add("is-active");
  });

  window.setTimeout(() => {
    configureAndLaunchFallingHeart(heartNode);
  }, durationMs + randomBetween(240, 1800));
}

function buildFallingHeartPool() {
  if (!fallingHeartsLayer) {
    return;
  }

  const desiredCount = getFallingHeartPoolSize();

  while (fallingHeartPool.length < desiredCount) {
    const heartNode = document.createElement("span");
    heartNode.className = "falling-heart";
    heartNode.setAttribute("aria-hidden", "true");
    fallingHeartsLayer.append(heartNode);
    fallingHeartPool.push(heartNode);

    if (heartShowerHasStarted) {
      configureAndLaunchFallingHeart(heartNode);
    }
  }

  while (fallingHeartPool.length > desiredCount) {
    const heartNode = fallingHeartPool.pop();
    heartNode?.remove();
  }
}

function startFallingHeartShower() {
  if (heartShowerHasStarted || !fallingHeartsLayer) {
    return;
  }

  heartShowerHasStarted = true;

  if (fallingHeartPool.length === 0) {
    buildFallingHeartPool();
  }

  fallingHeartPool.forEach((heartNode, index) => {
    window.setTimeout(() => {
      configureAndLaunchFallingHeart(heartNode);
    }, index * 120);
  });
}

function getElapsedParts(fromDate) {
  const diffMs = Date.now() - fromDate.getTime();

  if (Number.isNaN(fromDate.getTime()) || diffMs < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isFuture: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isFuture: false,
  };
}

function updateElapsedCounter() {
  if (!elapsedDays || !elapsedHours || !elapsedMinutes || !elapsedSeconds) {
    return;
  }

  const elapsed = getElapsedParts(startDate);

  elapsedDays.textContent = String(elapsed.days);
  elapsedHours.textContent = String(elapsed.hours);
  elapsedMinutes.textContent = String(elapsed.minutes);
  elapsedSeconds.textContent = String(elapsed.seconds);

  if (counterMessage) {
    counterMessage.textContent = elapsed.isFuture ? "La fecha aún no llega 💖" : "";
  }
}

function showTree() {
  heartButton.classList.add("is-hidden");
  loveTree.classList.add("is-visible");
}

function typePoem(lines, config = typewriterConfig) {
  if (!poemContainer || poemHasStarted) {
    return;
  }

  poemHasStarted = true;
  poemContainer.textContent = "";

  let lineIndex = 0;
  let charIndex = 0;

  const typeNextCharacter = () => {
    if (lineIndex >= lines.length) {
      return;
    }

    const currentLine = lines[lineIndex];

    if (charIndex < currentLine.length) {
      poemContainer.textContent += currentLine[charIndex];
      charIndex += 1;
      window.setTimeout(typeNextCharacter, config.letterDelayMs);
      return;
    }

    lineIndex += 1;
    charIndex = 0;

    if (lineIndex < lines.length) {
      poemContainer.textContent += "\n";
      window.setTimeout(typeNextCharacter, config.lineDelayMs);
    }
  };

  typeNextCharacter();
}

function showMessageView() {
  introView.classList.remove("is-active");
  introView.setAttribute("aria-hidden", "true");
  messageView.classList.add("is-active");
  messageView.setAttribute("aria-hidden", "false");

  scene.classList.add("show-message");
  updateElapsedCounter();

  if (!elapsedCounterIntervalId) {
    elapsedCounterIntervalId = window.setInterval(updateElapsedCounter, 1000);
  }

  typePoem(poemLines);
  startFallingHeartShower();
}

async function runIntroSequence() {
  if (!transitionTo(STATES.MORPH)) {
    return;
  }

  heartButton.disabled = true;
  heart.classList.add("is-morphing");
  ground.classList.add("is-visible");

  await waitForMotionEnd({
    element: heart,
    eventName: "transitionend",
    timeoutMs: PHASE_TIMEOUTS_MS.morph,
    filter: (event) => event.propertyName === "transform",
  });

  if (!transitionTo(STATES.FALLING)) {
    return;
  }

  heartButton.classList.add("is-falling");

  await waitForMotionEnd({
    element: heartButton,
    eventName: "animationend",
    timeoutMs: PHASE_TIMEOUTS_MS.falling,
    filter: (event) => event.animationName === "heart-fall",
  });

  if (!transitionTo(STATES.TREE)) {
    return;
  }

  showTree();

  await waitForMotionEnd({
    element: loveTree,
    eventName: "animationend",
    timeoutMs: PHASE_TIMEOUTS_MS.tree,
    filter: (event) => event.animationName === "tree-appear",
  });

  if (!transitionTo(STATES.REVEAL_MESSAGE)) {
    return;
  }

  showMessageView();
}

heartButton.addEventListener("click", () => {
  if (currentState !== STATES.INTRO) {
    return;
  }

  runIntroSequence();
});

buildCanopyHearts(getCanopyHeartCount());
buildFallingHeartPool();

window.addEventListener("resize", () => {
  buildCanopyHearts(getCanopyHeartCount());

  if (heartShowerResizeTimeoutId) {
    window.clearTimeout(heartShowerResizeTimeoutId);
  }

  heartShowerResizeTimeoutId = window.setTimeout(() => {
    buildFallingHeartPool();
  }, 180);
});
