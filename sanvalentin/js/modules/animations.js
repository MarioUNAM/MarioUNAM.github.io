import { qs } from '../utils/dom.js';

const DEFAULT_DURATIONS = Object.freeze({
  HEART_TO_SEED: 800,
  SEED_FALL: 700,
  HORIZONTAL_TO_LETTER: 650,
  TREE_SCALE_SHIFT: 900,
});

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const lerp = (from, to, progress) => from + (to - from) * progress;

function applyVisual(node, { transform, opacity }) {
  if (!node) {
    return;
  }

  if (transform !== undefined) {
    node.style.transform = transform;
  }

  if (opacity !== undefined) {
    node.style.opacity = String(opacity);
  }
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

export function initAnimations({ observer, stateMachine, states, domListeners, rafRegistry }) {
  const introRoot = qs('.app');
  const heartEl = qs('[data-role="heart"]', introRoot);
  const seedEl = qs('[data-role="seed"]', introRoot);
  const letterEl = qs('[data-role="letter"]', introRoot);
  const treeEl = qs('[data-role="tree"]', introRoot);
  const typewriterEl = qs('[data-role="typewriter"]', introRoot);
  const counterCardEl = qs('[data-role="counter-card"]', introRoot);
  const skipIntroButton = qs('[data-action="skip-intro"]', introRoot);
  const reviveButton = qs('[data-action="revive-animation"]', introRoot);

  const letterMessage =
    typewriterEl?.dataset.typewriterText?.trim() ||
    'Me haces feliz incluso en los días más difíciles, y contigo todo se siente posible. Gracias por tanto amor. ❤️';

  const timeline = createProceduralTimeline(rafRegistry);
  const typewriter = createTypewriter({
    target: typewriterEl,
    text: letterMessage,
  });

  const resetVisuals = () => {
    [heartEl, seedEl, letterEl, treeEl].forEach((node) => {
      applyVisual(node, { transform: '', opacity: '' });
    });

    applyVisual(counterCardEl, { transform: '', opacity: '' });
  };

  const buildIntroSequence = () => [
    {
      key: 'heart-to-seed',
      duration: DEFAULT_DURATIONS.HEART_TO_SEED,
      onStart: () => {
        stateMachine.transition(states.HEART_TO_SEED, { source: 'timeline' });
      },
      update: ({ progress }) => {
        const inverse = 1 - progress;
        applyVisual(heartEl, {
          transform: `translate3d(0, ${lerp(0, -10, progress)}px, 0) scale(${lerp(1, 0.4, progress)})`,
          opacity: inverse,
        });

        applyVisual(seedEl, {
          transform: `translate3d(0, ${lerp(-18, 0, progress)}px, 0) scale(${lerp(0.3, 1, progress)})`,
          opacity: progress,
        });
      },
    },
    {
      key: 'seed-fall',
      duration: DEFAULT_DURATIONS.SEED_FALL,
      onStart: () => {
        stateMachine.transition(states.SEED_FALL, { source: 'timeline' });
      },
      update: ({ progress }) => {
        applyVisual(seedEl, {
          transform: `translate3d(0, ${lerp(0, 140, progress)}px, 0) scale(1)`,
          opacity: 1,
        });
      },
    },
    {
      key: 'tree-grow',
      duration: DEFAULT_DURATIONS.HORIZONTAL_TO_LETTER,
      onStart: () => {
        stateMachine.transition(states.TREE_GROW, { source: 'timeline' });
      },
      update: ({ progress }) => {
        applyVisual(seedEl, {
          transform: `translate3d(0, ${lerp(140, 112, progress)}px, 0) scale(${lerp(1, 0.7, progress)})`,
          opacity: 1 - progress,
        });

        applyVisual(treeEl, {
          transform: `translate3d(0, ${lerp(42, 0, progress)}px, 0) scale(${lerp(0.72, 1, progress)})`,
          opacity: progress,
        });
      },
    },
    {
      key: 'tree-full',
      duration: DEFAULT_DURATIONS.TREE_SCALE_SHIFT,
      onStart: () => {
        stateMachine.transition(states.TREE_FULL, { source: 'timeline' });
      },
      update: ({ progress }) => {
        applyVisual(treeEl, {
          transform: `translate3d(0, ${lerp(0, -8, progress)}px, 0) scale(${lerp(1, 1.03, progress)})`,
          opacity: 1,
        });
      },
    },
    {
      key: 'horizontal-transition-letter',
      duration: DEFAULT_DURATIONS.HORIZONTAL_TO_LETTER,
      onStart: () => {
        stateMachine.transition(states.LETTER_VIEW, { source: 'timeline' });
      },
      update: ({ progress }) => {
        applyVisual(treeEl, {
          transform: `translate3d(${lerp(0, -72, progress)}px, ${lerp(-8, -16, progress)}px, 0) scale(${lerp(1.03, 0.72, progress)})`,
          opacity: 1,
        });

        applyVisual(letterEl, {
          transform: `translate3d(${lerp(32, 0, progress)}px, 0, 0) scale(1)`,
          opacity: progress,
        });

        applyVisual(counterCardEl, {
          transform: `translate3d(${lerp(16, 0, progress)}px, 0, 0)`,
          opacity: progress,
        });
      },
      onComplete: () => {
        applyVisual(seedEl, {
          transform: 'translate3d(-9999px, -9999px, 0)',
          opacity: 0,
        });
      },
    },
  ];

  const runIntroSequence = (source = 'timeline') => {
    if (stateMachine.getState() !== states.HEART_IDLE) {
      return Promise.resolve(false);
    }

    observer.emit(observer.lifecycle.ANIMATION_START, {
      scope: 'intro',
      state: states.HEART_IDLE,
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
    if (stateMachine.getState() !== states.HEART_IDLE) {
      return;
    }

    runIntroSequence('heart-click');
  };

  const handleSkipIntro = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (stateMachine.getState() !== states.HEART_IDLE) {
      return;
    }

    runIntroSequence('skip-intro');
  };

  const handleReviveAnimation = (event) => {
    event.preventDefault();
    event.stopPropagation();

    clearRuntimeBindings();
    rafRegistry.cancelAll();
    timeline.cancelAll();
    typewriter.reset();
    resetVisuals();

    stateMachine.reset();
    stateMachine.transition(states.HEART_IDLE, {
      source: 'revive-animation',
    });

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
    const unsubscribeSkipIntroClick = domListeners.on(
      skipIntroButton,
      'click',
      handleSkipIntro,
    );
    const unsubscribeReviveClick = domListeners.on(
      reviveButton,
      'click',
      handleReviveAnimation,
    );

    runtimeUnsubscribers = [
      unsubscribeOnState,
      unsubscribeIntroClick,
      unsubscribeSkipIntroClick,
      unsubscribeReviveClick,
    ];
  };

  subscribeRuntimeBindings();

  const unsubscribeReset = observer.subscribe(observer.lifecycle.APP_RESET, () => {
    timeline.cancelAll();
    typewriter.reset();
    resetVisuals();
  });

  observer.registerCleanup(() => {
    clearRuntimeBindings();
    rafRegistry.cancelAll();
    timeline.cancelAll();
    typewriter.cancel();
  });
  observer.registerCleanup(unsubscribeReset);

  return {
    introReady: true,
    play: timeline.play,
    cancelAll: timeline.cancelAll,
    onComplete: timeline.onComplete,
  };
}
