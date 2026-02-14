import { qs, setAttr, setText } from '../utils/dom.js';

const DEFAULT_INITIAL_DATE = '2016-09-09T00:00:00';
const UPDATE_INTERVAL_MS = 60_000;

function toDate(value) {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  const parsedDate = new Date(value ?? DEFAULT_INITIAL_DATE);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date(DEFAULT_INITIAL_DATE);
  }

  return parsedDate;
}

function addYears(date, years) {
  const nextDate = new Date(date.getTime());
  nextDate.setFullYear(nextDate.getFullYear() + years);
  return nextDate;
}

function addMonths(date, months) {
  const nextDate = new Date(date.getTime());
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

export function calculateCalendarDiff(startValue, endValue = new Date()) {
  let startDate = toDate(startValue);
  let endDate = toDate(endValue);
  let isNegative = false;

  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
    isNegative = true;
  }

  let cursor = new Date(startDate.getTime());
  let years = endDate.getFullYear() - cursor.getFullYear();
  let candidateDate = addYears(cursor, years);

  if (candidateDate > endDate) {
    years -= 1;
    candidateDate = addYears(cursor, years);
  }

  cursor = candidateDate;

  let months =
    (endDate.getFullYear() - cursor.getFullYear()) * 12 +
    (endDate.getMonth() - cursor.getMonth());
  candidateDate = addMonths(cursor, months);

  if (candidateDate > endDate) {
    months -= 1;
    candidateDate = addMonths(cursor, months);
  }

  cursor = candidateDate;

  const remainingMs = endDate.getTime() - cursor.getTime();
  const days = Math.floor(remainingMs / 86_400_000);
  const hours = Math.floor((remainingMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);

  return {
    years,
    months,
    days,
    hours,
    minutes,
    isNegative,
  };
}

function formatCounter(diff) {
  const sign = diff.isNegative ? '-' : '';

  return {
    years: `${sign}${diff.years}`,
    months: `${sign}${diff.months}`,
    days: `${sign}${diff.days}`,
    hours: `${sign}${diff.hours}`,
    minutes: `${sign}${diff.minutes}`,
  };
}

function ensureCounterCard(appRoot) {
  let counterCard = qs('[data-role="counter-card"]', appRoot);

  if (counterCard) {
    return counterCard;
  }

  counterCard = document.createElement('section');
  setAttr(counterCard, 'data-role', 'counter-card');
  setAttr(counterCard, 'aria-live', 'polite');

  const title = document.createElement('h2');
  setText(title, 'Desde 2016-09-09');

  const value = document.createElement('dl');
  setAttr(value, 'data-role', 'counter-value');
  value.className = 'counter-grid';

  const units = [
    ['Años', '--'],
    ['Meses', '--'],
    ['Días', '--'],
    ['Horas', '--'],
    ['Minutos', '--'],
  ];

  units.forEach(([label, placeholder], index) => {
    const item = document.createElement('div');
    item.className = 'counter-item';

    const term = document.createElement('dt');
    setText(term, label);

    const description = document.createElement('dd');
    setText(description, placeholder);
    setAttr(description, 'data-counter-unit', String(index));

    item.append(term, description);
    value.append(item);
  });

  counterCard.append(title, value);
  appRoot?.append(counterCard);

  return counterCard;
}

export function renderCounter(target, diff) {
  if (!target) {
    return false;
  }

  const formatted = formatCounter(diff);
  const values = [
    formatted.years,
    formatted.months,
    formatted.days,
    formatted.hours,
    formatted.minutes,
  ];

  const units = target.querySelectorAll('dd');
  if (!units.length) {
    return setText(
      target,
      `${formatted.years} años, ${formatted.months} meses, ${formatted.days} días, ${formatted.hours} horas y ${formatted.minutes} minutos`,
    );
  }

  units.forEach((unit, index) => {
    setText(unit, values[index] ?? '--');
  });

  return true;
}

export function initCounter({ observer, stateMachine, states, initialDate = DEFAULT_INITIAL_DATE }) {
  const appRoot = qs('.app');
  const stateLabel = qs('[data-role="state-label"]', appRoot);
  const counterCard = ensureCounterCard(appRoot);
  const counterValue = qs('[data-role="counter-value"]', counterCard);

  let timerId = null;
  const startDate = toDate(initialDate);

  function updateCounter() {
    const diff = calculateCalendarDiff(startDate);
    renderCounter(counterValue, diff);
  }

  function scheduleNextTick() {
    const now = Date.now();
    const delay = UPDATE_INTERVAL_MS - (now % UPDATE_INTERVAL_MS) || UPDATE_INTERVAL_MS;

    timerId = window.setTimeout(() => {
      updateCounter();
      scheduleNextTick();
    }, delay);
  }

  function start() {
    if (timerId != null) {
      return;
    }

    updateCounter();
    scheduleNextTick();
  }

  function stop() {
    if (timerId == null) {
      return;
    }

    window.clearTimeout(timerId);
    timerId = null;
  }

  function resetVisual() {
    if (!counterValue) {
      return;
    }

    const units = counterValue.querySelectorAll('dd');
    if (!units.length) {
      setText(counterValue, '-- años, -- meses, -- días, -- horas y -- minutos');
      return;
    }

    units.forEach((unit) => setText(unit, '--'));
  }

  const unsubscribeOnStateChanged = observer.subscribe(
    observer.lifecycle.STATE_CHANGED,
    ({ to }) => {
      stateMachine.getState();
      setAttr(appRoot, 'data-state', to);
      setText(stateLabel, to);

      if (to === states.LETTER_VIEW) {
        start();
        return;
      }

      stop();
      resetVisual();
    },
  );

  const unsubscribeOnReset = observer.subscribe(observer.lifecycle.APP_RESET, () => {
    stop();
    resetVisual();
  });

  const reset = () => {
    stop();
    resetVisual();
  };

  const destroy = () => {
    reset();
    unsubscribeOnStateChanged();
    unsubscribeOnReset();
  };

  observer.registerCleanup(destroy);

  return {
    start,
    stop,
    resetVisual,
    reset,
    destroy,
  };
}
