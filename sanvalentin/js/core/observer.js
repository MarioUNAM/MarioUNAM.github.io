export const LIFECYCLE_EVENTS = Object.freeze({
  STATE_CHANGED: 'state:changed',
  APP_RESET: 'app:reset',
  ANIMATION_START: 'animation:start',
  ANIMATION_END: 'animation:end',
});

export function createObserver() {
  const listeners = new Map();
  const cleanups = new Set();

  function getEventListeners(eventName) {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set());
    }

    return listeners.get(eventName);
  }

  function unsubscribe(eventName, handler) {
    const eventListeners = listeners.get(eventName);
    if (!eventListeners) {
      return false;
    }

    const didDelete = eventListeners.delete(handler);

    if (eventListeners.size === 0) {
      listeners.delete(eventName);
    }

    return didDelete;
  }

  function subscribe(eventName, handler) {
    getEventListeners(eventName).add(handler);

    return () => unsubscribe(eventName, handler);
  }

  function emit(eventName, payload) {
    const eventListeners = listeners.get(eventName);
    if (!eventListeners) {
      return 0;
    }

    [...eventListeners].forEach((handler) => {
      handler(payload);
    });

    return eventListeners.size;
  }

  function registerCleanup(cleanupHandler) {
    cleanups.add(cleanupHandler);

    return () => cleanups.delete(cleanupHandler);
  }

  function flushCleanups() {
    [...cleanups].forEach((cleanupHandler) => cleanupHandler());
    cleanups.clear();
  }

  function clearListeners() {
    listeners.clear();
  }

  return {
    subscribe,
    unsubscribe,
    emit,
    on: subscribe,
    off: unsubscribe,
    registerCleanup,
    flushCleanups,
    clearListeners,
    reset() {
      emit(LIFECYCLE_EVENTS.APP_RESET);
      flushCleanups();
      clearListeners();
    },
    lifecycle: LIFECYCLE_EVENTS,
  };
}
