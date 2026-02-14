export function initAudio({ observer, stateMachine, states }) {
  const unsubscribeOnAnimationEnd = observer.subscribe(
    observer.lifecycle.ANIMATION_END,
    () => {
      // Base hook for audio logic.
      if (stateMachine.getState() === states.LETTER_VIEW) {
        return;
      }
    },
  );

  observer.registerCleanup(unsubscribeOnAnimationEnd);
}
