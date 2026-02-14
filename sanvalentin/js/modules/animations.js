export function initAnimations({ observer, stateMachine, states }) {
  const introRoot = document.querySelector('.app');

  const unsubscribeOnState = observer.subscribe(
    observer.lifecycle.STATE_CHANGED,
    ({ to }) => {
      observer.emit(observer.lifecycle.ANIMATION_START, {
        scope: 'animations',
        state: to,
      });

      requestAnimationFrame(() => {
        observer.emit(observer.lifecycle.ANIMATION_END, {
          scope: 'animations',
          state: to,
        });
      });
    },
  );

  const handleIntroInteraction = () => {
    if (stateMachine.getState() === states.HEART_IDLE) {
      observer.emit(observer.lifecycle.ANIMATION_START, {
        scope: 'intro',
        state: states.HEART_IDLE,
      });
    }
  };

  introRoot?.addEventListener('click', handleIntroInteraction);

  observer.registerCleanup(() => {
    introRoot?.removeEventListener('click', handleIntroInteraction);
  });
  observer.registerCleanup(unsubscribeOnState);

  return { introReady: true };
}
