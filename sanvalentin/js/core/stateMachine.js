export const STATES = Object.freeze({
  INIT: 'INIT',
  HEART_IDLE: 'HEART_IDLE',
  HEART_TO_SEED: 'HEART_TO_SEED',
  SEED_FALL: 'SEED_FALL',
  TREE_GROW: 'TREE_GROW',
  TREE_FULL: 'TREE_FULL',
  LETTER_VIEW: 'LETTER_VIEW',
});

const VALID_TRANSITIONS = Object.freeze({
  [STATES.INIT]: [STATES.HEART_IDLE],
  [STATES.HEART_IDLE]: [STATES.HEART_TO_SEED],
  [STATES.HEART_TO_SEED]: [STATES.SEED_FALL],
  [STATES.SEED_FALL]: [STATES.TREE_GROW],
  [STATES.TREE_GROW]: [STATES.TREE_FULL],
  [STATES.TREE_FULL]: [STATES.LETTER_VIEW],
  [STATES.LETTER_VIEW]: [],
});

function buildStateError(type, details) {
  return {
    type,
    message: `[StateMachine] ${type}`,
    details,
  };
}

export function createStateMachine(initialState = STATES.INIT, observer) {
  let currentState = Object.values(STATES).includes(initialState)
    ? initialState
    : STATES.INIT;
  let lastPayload;

  return {
    getState() {
      return currentState;
    },
    canTransition(from, to) {
      if (!VALID_TRANSITIONS[from] || !Object.values(STATES).includes(to)) {
        return false;
      }

      return VALID_TRANSITIONS[from].includes(to);
    },
    transition(to, payload) {
      if (!Object.values(STATES).includes(to)) {
        const error = buildStateError('INVALID_TARGET_STATE', {
          from: currentState,
          to,
        });
        console.warn(error.message, error.details);
        return { ok: false, error };
      }

      if (!this.canTransition(currentState, to)) {
        const error = buildStateError('ILLEGAL_TRANSITION', {
          from: currentState,
          to,
        });
        console.warn(error.message, error.details);
        return { ok: false, error };
      }

      const previousState = currentState;
      currentState = to;
      lastPayload = payload;

      observer?.emit(observer.lifecycle.STATE_CHANGED, {
        from: previousState,
        to: currentState,
        payload: lastPayload,
      });

      return { ok: true, state: currentState, payload: lastPayload };
    },
    reset() {
      currentState = STATES.INIT;
      lastPayload = undefined;
      observer?.emit(observer.lifecycle.APP_RESET, { state: currentState });
      return currentState;
    },
  };
}

export const transitions = VALID_TRANSITIONS;
