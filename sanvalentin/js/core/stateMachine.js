/**
 * Contrato de estados y eventos:
 * - Estados válidos: INIT -> HEART_TO_SEED -> SEED_FALL -> TREE_GROW -> LETTER_VIEW.
 * - `state:changed`: payload { from, to, payload } en transiciones válidas.
 * - `app:reset`: payload { state: 'INIT' } al reiniciar.
 */
export const STATES = Object.freeze({
  INIT: 'INIT',
  HEART_TO_SEED: 'HEART_TO_SEED',
  SEED_FALL: 'SEED_FALL',
  TREE_GROW: 'TREE_GROW',
  LETTER_VIEW: 'LETTER_VIEW',
});

const VALID_TRANSITIONS = Object.freeze({
  [STATES.INIT]: [STATES.HEART_TO_SEED],
  [STATES.HEART_TO_SEED]: [STATES.SEED_FALL],
  [STATES.SEED_FALL]: [STATES.TREE_GROW],
  [STATES.TREE_GROW]: [STATES.LETTER_VIEW],
  [STATES.LETTER_VIEW]: [],
});

const STATE_VALUES = Object.freeze(Object.values(STATES));

/**
 * @typedef {{ type: string, message: string, details: { from: string, to?: string } }} StateMachineError
 * @typedef {{ ok: true, state: string, payload: unknown } | { ok: false, error: StateMachineError }} TransitionResult
 */

const isValidState = (state) => STATE_VALUES.includes(state);

const buildStateError = (type, details) => ({
  type,
  message: `[StateMachine] ${type}`,
  details,
});

/**
 * @param {string} [initialState=STATES.INIT]
 * @param {{ emit?: Function, lifecycle?: { STATE_CHANGED: string, APP_RESET: string } }} [observer]
 */
export function createStateMachine(initialState = STATES.INIT, observer) {
  let currentState = isValidState(initialState) ? initialState : STATES.INIT;
  let lastPayload;

  const canTransition = (from, to) => {
    if (!VALID_TRANSITIONS[from] || !isValidState(to)) {
      return false;
    }

    return VALID_TRANSITIONS[from].includes(to);
  };

  /** @param {string} to @param {unknown} payload @returns {TransitionResult} */
  const transition = (to, payload) => {
    if (!isValidState(to)) {
      return {
        ok: false,
        error: buildStateError('INVALID_TARGET_STATE', { from: currentState, to }),
      };
    }

    if (!canTransition(currentState, to)) {
      return {
        ok: false,
        error: buildStateError('ILLEGAL_TRANSITION', { from: currentState, to }),
      };
    }

    const previousState = currentState;
    currentState = to;
    lastPayload = payload;

    observer?.emit?.(observer.lifecycle.STATE_CHANGED, {
      from: previousState,
      to: currentState,
      payload: lastPayload,
    });

    return { ok: true, state: currentState, payload: lastPayload };
  };

  const reset = () => {
    currentState = STATES.INIT;
    lastPayload = undefined;
    observer?.emit?.(observer.lifecycle.APP_RESET, { state: currentState });
    return currentState;
  };

  return {
    getState() {
      return currentState;
    },
    canTransition,
    transition,
    reset,
  };
}

export const transitions = VALID_TRANSITIONS;
