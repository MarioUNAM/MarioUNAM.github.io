export function initAnimations({ observer }) {
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

  observer.registerCleanup(unsubscribeOnState);
}
