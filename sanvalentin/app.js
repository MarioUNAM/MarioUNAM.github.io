const introView = document.querySelector("#intro-view");
const messageView = document.querySelector("#message-view");
const heartButton = document.querySelector("#heart-button");
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

function showMessageView() {
  introView.classList.remove("is-active");
  introView.hidden = true;

  messageView.hidden = false;
  messageView.classList.add("is-active");

  counter.textContent = formatElapsedTime(anniversaryDate);
}

heartButton.addEventListener("click", showMessageView);
