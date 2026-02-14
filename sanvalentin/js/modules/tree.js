export function initTree({ observer, stateMachine }) {
  const unsubscribeOnReset = observer.subscribe(observer.lifecycle.APP_RESET, () => {
    // Base hook for tree module reset logic.
    if (stateMachine.getState() === 'INIT') {
      return;
    }
  });

  observer.registerCleanup(unsubscribeOnReset);
}
