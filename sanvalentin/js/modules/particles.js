export function initParticles({ observer, stateMachine, states }) {
  const unsubscribeOnAnimationStart = observer.subscribe(
    observer.lifecycle.ANIMATION_START,
    () => {
      // Base hook for particle system logic.
      if (stateMachine.getState() === states.HEART_IDLE) {
        return;
      }
    },
  );

  observer.registerCleanup(unsubscribeOnAnimationStart);
}
