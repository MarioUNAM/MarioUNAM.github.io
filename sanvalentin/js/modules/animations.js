import { qs } from '../utils/dom.js';

const DEFAULT_DURATIONS = Object.freeze({
  HEART_TO_SEED: 800,
  SEED_FALL: 700,
  HORIZONTAL_TO_LETTER: 650,
});

const PHASE_CLASS_PREFIX = 'phase-';
const PHASE_BY_STATE = Object.freeze({
  INIT: 'init',
  HEART_TO_SEED: 'heart-to-seed',
  SEED_FALL: 'seed-fall',
  TREE_GROW: 'tree-grow',
  LETTER_VIEW: 'letter-view',
});

const clamp01 = (value) => Math.min(1, Math.max(0, value));

function setPhaseClass(appRoot, phase) {
  if (!appRoot) {
    return;
  }

  Object.values(PHASE_BY_STATE).forEach((phaseName) => {
    appRoot.classList.remove(`${PHASE_CLASS_PREFIX}${phaseName}`);
  });

  appRoot.classList.add(`${PHASE_CLASS_PREFIX}${phase}`);
}

function createProceduralTimeline(rafRegistry) {
  let activeAnimation = null;
  const completionCallbacks = new Set();

  function cancelAll() {
    if (!activeAnimation) {
      return false;
    }

    activeAnimation.cancelled = true;
    rafRegistry.cancel(activeAnimation.frameId);
    activeAnimation = null;
    return true;
  }

  function onComplete(callback) {
    if (typeof callback !== 'function') {
      return () => {};
    }

    completionCallbacks.add(callback);

    return () => completionCallbacks.delete(callback);
  }

  function play(sequence = []) {
    if (!Array.isArray(sequence) || sequence.length === 0) {
      return Promise.resolve(false);
    }

    cancelAll();

    return new Promise((resolve) => {
      const runtime = {
        frameId: 0,
        cancelled: false,
        index: 0,
        elapsedInStep: 0,
        lastTs: 0,
        startedStepIndex: -1,
      };

      activeAnimation = runtime;

      const tick = (timestamp) => {
        if (runtime.cancelled) {
          resolve(false);
          return;
        }

        const deltaTime = runtime.lastTs === 0 ? 0 : timestamp - runtime.lastTs;
        runtime.lastTs = timestamp;

        const step = sequence[runtime.index];
        if (!step) {
          activeAnimation = null;
          completionCallbacks.forEach((callback) => callback());
          resolve(true);
          return;
        }

        if (runtime.startedStepIndex !== runtime.index) {
          runtime.startedStepIndex = runtime.index;
          step.onStart?.();
        }

        runtime.elapsedInStep += deltaTime;
        const progress = clamp01(runtime.elapsedInStep / Math.max(1, step.duration));

        step.update?.({
          progress,
          deltaTime,
          elapsed: runtime.elapsedInStep,
        });

        if (progress >= 1) {
          step.onComplete?.();
          runtime.index += 1;
          runtime.elapsedInStep = 0;
        }

        runtime.frameId = rafRegistry.request(tick);
      };

      runtime.frameId = rafRegistry.request(tick);
    });
  }

  return {
    play,
    cancelAll,
    onComplete,
  };
}

function createTypewriter({ target, text, typingMs = 36, punctuationPauseMs = 140 }) {
  let timerId = 0;
  let runToken = 0;

  const clearTimer = () => {
    if (!timerId) {
      return;
    }

    clearTimeout(timerId);
    timerId = 0;
  };

  const cancel = () => {
    runToken += 1;
    clearTimer();
  };

  const reset = () => {
    cancel();
    if (target) {
      target.textContent = '';
    }
  };

  const nextDelay = (character) => {
    if (/[,:;.!?…]/.test(character)) {
      return punctuationPauseMs;
    }

    return character === ' ' ? Math.max(typingMs * 0.55, 14) : typingMs;
  };

  const play = () => {
    if (!target) {
      return Promise.resolve(false);
    }

    reset();

    if (!text) {
      return Promise.resolve(true);
    }

    const activeToken = runToken;
    let index = 0;

    return new Promise((resolve) => {
      const step = () => {
        if (activeToken !== runToken) {
          resolve(false);
          return;
        }

        if (index >= text.length) {
          timerId = 0;
          resolve(true);
          return;
        }

        index += 1;
        target.textContent = text.slice(0, index);
        timerId = window.setTimeout(step, nextDelay(text[index - 1]));
      };

      step();
    });
  };

  return {
    play,
    cancel,
    reset,
  };
}

export function initAnimations({ observer, stateMachine, states, domListeners, rafRegistry, animationContext }) {
  const introRoot = qs('.app');
  const seedEl = qs('[data-role="seed"]', introRoot);
  const sceneEl = qs('.scene', introRoot);
  const typewriterEl = qs('[data-role="typewriter"]', introRoot);
  const groundLineEl = qs('[data-role="ground-line"]', introRoot);
  const treeEl = qs('[data-role="tree"]', introRoot);
  const heartEl = qs('[data-role="heart"]', introRoot);
  const reviveButton = qs('[data-action="revive-animation"]', introRoot);

  const letterMessage =
    typewriterEl?.dataset.typewriterText?.trim() ||
    'Me haces feliz incluso en los días más difíciles, y contigo todo se siente posible. Gracias por tanto amor. ❤️';

  const timeline = createProceduralTimeline(rafRegistry);
  const typewriter = createTypewriter({
    target: typewriterEl,
    text: letterMessage,
  });

  const context = animationContext || { seedImpact: null };

  const cacheSeedImpact = () => {
    if (!seedEl || !sceneEl || context.seedImpact) {
      return;
    }

    const seedRect = seedEl.getBoundingClientRect();
    const impactX = seedRect.left + seedRect.width / 2;
    const groundY = seedRect.top + seedRect.height;

    context.seedImpact = { impactX, groundY };

    if (groundLineEl) {
      const lineParentRect = groundLineEl.parentElement?.getBoundingClientRect();
      if (lineParentRect) {
        const deltaX = impactX - (lineParentRect.left + lineParentRect.width / 2);
        const deltaY = groundY - lineParentRect.top;
        groundLineEl.style.setProperty('--ground-line-offset-x', `${deltaX}px`);
        groundLineEl.style.setProperty('--ground-line-offset-y', `${deltaY}px`);
      }
    }

    if (treeEl) {
      treeEl.dataset.seedImpactX = String(impactX);
      treeEl.dataset.seedGroundY = String(groundY);
    }
  };

  const setPhaseByState = (state) => {
    const phase = PHASE_BY_STATE[state];
    if (!phase) {
      return;
    }

    setPhaseClass(introRoot, phase);
  };

  const resetVisuals = () => {
    setPhaseByState(states.INIT);
  };

  const buildIntroSequence = () => [
    {
      key: 'heart-to-seed',
      duration: DEFAULT_DURATIONS.HEART_TO_SEED,
      onStart: () => {
        stateMachine.transition(states.HEART_TO_SEED, { source: 'timeline' });
      },
    },
    {
      key: 'seed-fall',
      duration: DEFAULT_DURATIONS.SEED_FALL,
      onStart: () => {
        stateMachine.transition(states.SEED_FALL, { source: 'timeline' });
      },
      onComplete: () => {
        cacheSeedImpact();
      },
    },
    {
      key: 'tree-grow',
      duration: DEFAULT_DURATIONS.HORIZONTAL_TO_LETTER,
      onStart: () => {
        stateMachine.transition(states.TREE_GROW, { source: 'timeline' });
      },
    },
    {
      key: 'horizontal-transition-letter',
      duration: DEFAULT_DURATIONS.HORIZONTAL_TO_LETTER,
      onStart: () => {
        stateMachine.transition(states.LETTER_VIEW, { source: 'timeline' });
      },
    },
  ];

  const runIntroSequence = (source = 'timeline') => {
    if (stateMachine.getState() !== states.INIT) {
      return Promise.resolve(false);
    }

    observer.emit(observer.lifecycle.ANIMATION_START, {
      scope: 'intro',
      state: states.INIT,
      source,
    });

    return timeline.play(buildIntroSequence()).finally(() => {
      observer.emit(observer.lifecycle.ANIMATION_END, {
        scope: 'intro',
        state: stateMachine.getState(),
        source,
      });
    });
  };

  const handleIntroInteraction = () => {
    if (stateMachine.getState() !== states.INIT) {
      return;
    }

    runIntroSequence('heart-click');
  };

  const handleReviveAnimation = (event) => {
    event.preventDefault();
    event.stopPropagation();

    clearRuntimeBindings();
    rafRegistry.cancelAll();
    timeline.cancelAll();
    typewriter.reset();
    resetVisuals();

    context.seedImpact = null;
    if (groundLineEl) {
      groundLineEl.style.removeProperty('--ground-line-offset-x');
      groundLineEl.style.removeProperty('--ground-line-offset-y');
    }
    if (treeEl) {
      delete treeEl.dataset.seedImpactX;
      delete treeEl.dataset.seedGroundY;
    }

    stateMachine.reset();

    subscribeRuntimeBindings();
    runIntroSequence('revive-animation');
  };

  let runtimeUnsubscribers = [];

  const clearRuntimeBindings = () => {
    runtimeUnsubscribers.forEach((unsubscribe) => unsubscribe());
    runtimeUnsubscribers = [];
  };

  const subscribeRuntimeBindings = () => {
    clearRuntimeBindings();

    const unsubscribeOnState = observer.subscribe(
      observer.lifecycle.STATE_CHANGED,
      ({ to }) => {
        setPhaseByState(to);

        if (to === states.LETTER_VIEW) {
          typewriter.play();
        }

        observer.emit(observer.lifecycle.ANIMATION_START, {
          scope: 'animations',
          state: to,
        });

        rafRegistry.request(() => {
          observer.emit(observer.lifecycle.ANIMATION_END, {
            scope: 'animations',
            state: to,
          });
        });
      },
    );

    const unsubscribeIntroClick = domListeners.on(heartEl, 'click', handleIntroInteraction);
    const unsubscribeReviveClick = domListeners.on(
      reviveButton,
      'click',
      handleReviveAnimation,
    );

    runtimeUnsubscribers = [
      unsubscribeOnState,
      unsubscribeIntroClick,
      unsubscribeReviveClick,
    ];
  };

  resetVisuals();
  subscribeRuntimeBindings();

  const unsubscribeReset = observer.subscribe(observer.lifecycle.APP_RESET, () => {
    timeline.cancelAll();
    typewriter.reset();
    resetVisuals();
  });

  const reset = () => {
    timeline.cancelAll();
    typewriter.reset();
    resetVisuals();
  };

  const destroy = () => {
    reset();
    clearRuntimeBindings();
    unsubscribeReset();
  };

  observer.registerCleanup(destroy);

  return {
    introReady: true,
    play: timeline.play,
    cancelAll: timeline.cancelAll,
    onComplete: timeline.onComplete,
    reset,
    destroy,
  };
}
