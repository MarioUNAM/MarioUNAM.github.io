const introView = document.querySelector("#intro-view");
const messageView = document.querySelector("#message-view");
const heartButton = document.querySelector("#heart-button");
const heart = document.querySelector(".heart");
const ground = document.querySelector("#ground");
const loveTree = document.querySelector("#love-tree");
const counter = document.querySelector("#counter");

const anniversaryDate = new Date("2024-02-14T00:00:00");

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
  introView.hidden = true;

  messageView.hidden = false;
  messageView.classList.add("is-active");

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
