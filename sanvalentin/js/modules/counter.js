import { qs, setAttr, setText } from '../utils/dom.js';

export function initCounter({ observer, stateMachine }) {
  const appRoot = qs('.app');
  const stateLabel = qs('[data-role="state-label"]', appRoot);

  const unsubscribeOnStateChanged = observer.subscribe(
    observer.lifecycle.STATE_CHANGED,
    ({ to }) => {
      // Base hook for counter logic.
      stateMachine.getState();
      setAttr(appRoot, 'data-state', to);
      setText(stateLabel, to);
    },
  );

  observer.registerCleanup(unsubscribeOnStateChanged);
}
