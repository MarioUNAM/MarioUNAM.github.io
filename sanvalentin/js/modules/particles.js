export function initParticles({ observer }) {
  const unsubscribeOnAnimationStart = observer.subscribe(
    observer.lifecycle.ANIMATION_START,
    () => {
      // Base hook for particle system logic.
    },
  );

  observer.registerCleanup(unsubscribeOnAnimationStart);
}
