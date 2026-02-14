export function initCounter({ observer, stateMachine }) {
  const unsubscribeOnStateChanged = observer.subscribe(
    observer.lifecycle.STATE_CHANGED,
    () => {
      // Base hook for counter logic.
      stateMachine.getState();
    },
  );

  observer.registerCleanup(unsubscribeOnStateChanged);
}
