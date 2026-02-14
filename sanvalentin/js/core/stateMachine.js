export function createStateMachine(initialState = 'idle') {
  let currentState = initialState;

  return {
    getState() {
      return currentState;
    },
    transition(nextState) {
      currentState = nextState;
      return currentState;
    },
  };
}
