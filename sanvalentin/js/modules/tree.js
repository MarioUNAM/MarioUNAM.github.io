export function initTree({ observer }) {
  const unsubscribeOnReset = observer.subscribe(observer.lifecycle.APP_RESET, () => {
    // Base hook for tree module reset logic.
  });

  observer.registerCleanup(unsubscribeOnReset);
}
