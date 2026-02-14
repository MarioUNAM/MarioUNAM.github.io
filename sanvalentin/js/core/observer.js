/**
 * Contrato de eventos del observador:
 * - `state:changed`: payload { from, to, payload } emitido por stateMachine.
 * - `app:reset`: payload opcional con estado inicial o sin payload en reset global.
 * - `animation:start`: payload libre del módulo de animaciones.
 * - `animation:end`: payload libre del módulo de animaciones.
 */
export const LIFECYCLE_EVENTS = Object.freeze({
  STATE_CHANGED: 'state:changed',
  APP_RESET: 'app:reset',
  ANIMATION_START: 'animation:start',
  ANIMATION_END: 'animation:end',
});

/**
 * @typedef {(payload?: unknown) => void} EventHandler
 * @typedef {() => void} CleanupHandler
 */

/**
 * Crea un bus de eventos simple con manejo de cleanup.
 */
export function createObserver() {
  /** @type {Map<string, Set<EventHandler>>} */
  const listenersByEvent = new Map();
  /** @type {Set<CleanupHandler>} */
  const cleanupHandlers = new Set();

  /** @param {string} eventName */
  function ensureEventListeners(eventName) {
    if (!listenersByEvent.has(eventName)) {
      listenersByEvent.set(eventName, new Set());
    }

    return listenersByEvent.get(eventName);
  }

  /** @param {string} eventName @param {EventHandler} handler */
  function unsubscribe(eventName, handler) {
    const eventListeners = listenersByEvent.get(eventName);
    if (!eventListeners) {
      return false;
    }

    const wasRemoved = eventListeners.delete(handler);

    if (eventListeners.size === 0) {
      listenersByEvent.delete(eventName);
    }

    return wasRemoved;
  }

  /** @param {string} eventName @param {EventHandler} handler */
  function subscribe(eventName, handler) {
    ensureEventListeners(eventName).add(handler);
    return () => unsubscribe(eventName, handler);
  }

  /** @param {string} eventName @param {unknown} payload */
  function emit(eventName, payload) {
    const eventListeners = listenersByEvent.get(eventName);
    if (!eventListeners) {
      return 0;
    }

    [...eventListeners].forEach((handler) => {
      handler(payload);
    });

    return eventListeners.size;
  }

  /** @param {CleanupHandler} cleanupHandler */
  function registerCleanup(cleanupHandler) {
    cleanupHandlers.add(cleanupHandler);
    return () => cleanupHandlers.delete(cleanupHandler);
  }

  function flushCleanups() {
    [...cleanupHandlers].forEach((cleanupHandler) => cleanupHandler());
    cleanupHandlers.clear();
  }

  function clearListeners() {
    listenersByEvent.clear();
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
