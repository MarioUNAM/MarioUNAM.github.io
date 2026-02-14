export function initCounter({ observer }) {
  const unsubscribeOnStateChanged = observer.subscribe(
    observer.lifecycle.STATE_CHANGED,
    () => {
      // Base hook for counter logic.
    },
  );

  observer.registerCleanup(unsubscribeOnStateChanged);
}
