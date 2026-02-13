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

function getCanopyHeartCount() {
  const minHearts = 30;
  const maxHearts = 80;
  const viewportFactor = Math.min(window.innerWidth, 1200) / 1200;

  return Math.round(minHearts + (maxHearts - minHearts) * viewportFactor);
}

function buildCanopyHearts(count) {
  if (!treeCanopy) {
    return;
  }

  treeCanopy.innerHTML = "";

  const colors = ["is-red", "is-pink", "is-coral"];

  for (let index = 0; index < count; index += 1) {
    const heartNode = document.createElement("span");
    const angle = randomBetween(0, Math.PI * 2);
    const radius = Math.sqrt(Math.random());

    // Distribución orgánica dentro de una elipse (más llena al centro).
    const x = 50 + Math.cos(angle) * radius * randomBetween(26, 47);
    const y = 56 + Math.sin(angle) * radius * randomBetween(22, 44);
    const size = randomBetween(0.82, 1.18);

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

  const size = randomBetween(8, 16);
  const distance = randomBetween(layerRect.height * 0.58, layerRect.height * 0.98);
  const durationMs = randomBetween(4200, 7600);
  const drift = randomBetween(-26, 26);
  const colors = ["#e11d74", "#ec4899", "#fb7185", "#f43f5e"];

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
      setTimeout(typeNextCharacter, config.letterDelayMs);
      return;
    }

    lineIndex += 1;
    charIndex = 0;

    if (lineIndex < lines.length) {
      poemContainer.textContent += "\n";
      setTimeout(typeNextCharacter, config.lineDelayMs);
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

let isAnimating = false;

heartButton.addEventListener("click", () => {
  if (isAnimating) {
    return;
  }

  isAnimating = true;
  heartButton.disabled = true;

  heart.classList.add("is-morphing");
  heartButton.classList.add("is-falling");
  ground.classList.add("is-visible");

  heartButton.addEventListener(
    "animationend",
    () => {
      showTree();

      setTimeout(() => {
        showMessageView();
      }, 1050);
    },
    { once: true },
  );
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
