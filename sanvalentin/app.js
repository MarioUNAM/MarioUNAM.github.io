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

window.addEventListener("resize", () => {
  buildCanopyHearts(getCanopyHeartCount());
});
