export function initAudio({ observer }) {
  const unsubscribeOnAnimationEnd = observer.subscribe(
    observer.lifecycle.ANIMATION_END,
    () => {
      // Base hook for audio logic.
    },
  );

  observer.registerCleanup(unsubscribeOnAnimationEnd);
}
