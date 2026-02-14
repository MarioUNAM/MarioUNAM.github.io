export function createLiveResourceRegistry() {
  const listeners = new Set();
  const timeouts = new Set();
  const intervals = new Set();
  const rafIds = new Set();
  const subscriptions = new Set();

  function trackListener(target, eventName, handler, options) {
    if (!target?.addEventListener || typeof handler !== 'function') {
      return () => {};
    }

    target.addEventListener(eventName, handler, options);

    const cleanup = () => {
      target.removeEventListener(eventName, handler, options);
      listeners.delete(cleanup);
    };

    listeners.add(cleanup);
    return cleanup;
  }

  function setTrackedTimeout(callback, delay, ...args) {
    const timeoutId = window.setTimeout(() => {
      timeouts.delete(timeoutId);
      callback(...args);
    }, delay);

    timeouts.add(timeoutId);
    return timeoutId;
  }

  function clearTrackedTimeout(timeoutId) {
    if (!timeouts.has(timeoutId)) {
      return false;
    }

    window.clearTimeout(timeoutId);
    timeouts.delete(timeoutId);
    return true;
  }

  function setTrackedInterval(callback, delay, ...args) {
    const intervalId = window.setInterval(callback, delay, ...args);
    intervals.add(intervalId);
    return intervalId;
  }

  function clearTrackedInterval(intervalId) {
    if (!intervals.has(intervalId)) {
      return false;
    }

    window.clearInterval(intervalId);
    intervals.delete(intervalId);
    return true;
  }

  function requestTrackedAnimationFrame(callback) {
    const frameId = window.requestAnimationFrame((timestamp) => {
      rafIds.delete(frameId);
      callback(timestamp);
    });

    rafIds.add(frameId);
    return frameId;
  }

  function cancelTrackedAnimationFrame(frameId) {
    if (!rafIds.has(frameId)) {
      return false;
    }

    window.cancelAnimationFrame(frameId);
    rafIds.delete(frameId);
    return true;
  }

  function trackSubscription(unsubscribe) {
    if (typeof unsubscribe !== 'function') {
      return () => {};
    }

    const cleanup = () => {
      unsubscribe();
      subscriptions.delete(cleanup);
    };

    subscriptions.add(cleanup);
    return cleanup;
  }

  function cleanupListeners() {
    [...listeners].forEach((cleanup) => cleanup());
  }

  function cleanupTimeouts() {
    [...timeouts].forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    timeouts.clear();
  }

  function cleanupIntervals() {
    [...intervals].forEach((intervalId) => {
      window.clearInterval(intervalId);
    });
    intervals.clear();
  }

  function cleanupRaf() {
    [...rafIds].forEach((frameId) => {
      window.cancelAnimationFrame(frameId);
    });
    rafIds.clear();
  }

  function cleanupSubscriptions() {
    [...subscriptions].forEach((cleanup) => cleanup());
  }

  function cleanupAll() {
    cleanupListeners();
    cleanupTimeouts();
    cleanupIntervals();
    cleanupRaf();
    cleanupSubscriptions();
  }

  function getSnapshot() {
    return {
      listeners: listeners.size,
      timeouts: timeouts.size,
      intervals: intervals.size,
      rafIds: rafIds.size,
      subscriptions: subscriptions.size,
    };
  }

  return {
    trackListener,
    setTimeout: setTrackedTimeout,
    clearTimeout: clearTrackedTimeout,
    setInterval: setTrackedInterval,
    clearInterval: clearTrackedInterval,
    requestAnimationFrame: requestTrackedAnimationFrame,
    cancelAnimationFrame: cancelTrackedAnimationFrame,
    trackSubscription,
    cleanupListeners,
    cleanupTimeouts,
    cleanupIntervals,
    cleanupRaf,
    cleanupSubscriptions,
    cleanupAll,
    getSnapshot,
  };
}
