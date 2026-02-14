export function createObserver() {
  const listeners = new Map();

  return {
    on(eventName, handler) {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }

      listeners.get(eventName).add(handler);

      return () => listeners.get(eventName)?.delete(handler);
    },
    emit(eventName, payload) {
      listeners.get(eventName)?.forEach((handler) => handler(payload));
    },
  };
}
