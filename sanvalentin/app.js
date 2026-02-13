const introView = document.querySelector("#intro-view");
const scene = document.querySelector("#scene");
const messageView = document.querySelector("#message-view");
const heartButton = document.querySelector("#heart-button");
const heart = document.querySelector(".heart");
const ground = document.querySelector("#ground");
const loveTree = document.querySelector("#love-tree");
const counter = document.querySelector("#counter");
const treeCanopy = document.querySelector(".tree-canopy");

const anniversaryDate = new Date("2024-02-14T00:00:00");

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

function formatElapsedTime(fromDate) {
  const now = new Date();
  const diffMs = now - fromDate;

  if (diffMs < 0) {
    return "Aún no llega la fecha 💖";
  }

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
  const totalMinutes = Math.floor(diffMs / (1000 * 60)) % 60;

  return `${totalDays} días, ${totalHours} horas y ${totalMinutes} minutos`;
}

function showTree() {
  heartButton.classList.add("is-hidden");
  loveTree.classList.add("is-visible");
}

function showMessageView() {
  introView.classList.remove("is-active");
  introView.setAttribute("aria-hidden", "true");
  messageView.classList.add("is-active");
  messageView.setAttribute("aria-hidden", "false");

  scene.classList.add("show-message");
  counter.textContent = formatElapsedTime(anniversaryDate);
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
