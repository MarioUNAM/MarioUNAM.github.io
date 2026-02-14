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

function createProceduralTimeline() {
  let activeAnimation = null;
  const completionCallbacks = new Set();

  function cancelAll() {
    if (!activeAnimation) {
      return false;
    }

    activeAnimation.cancelled = true;
    cancelAnimationFrame(activeAnimation.frameId);
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

        runtime.frameId = requestAnimationFrame(tick);
      };

      runtime.frameId = requestAnimationFrame(tick);
    });
  }

  return {
    play,
    cancelAll,
    onComplete,
  };
}

export function initAnimations({ observer, stateMachine, states, domListeners }) {
  const introRoot = qs('.app');
  const heartEl = qs('[data-role="heart"]', introRoot);
  const seedEl = qs('[data-role="seed"]', introRoot);
  const letterEl = qs('[data-role="letter"]', introRoot);
  const treeEl = qs('[data-role="tree"]', introRoot);

  const timeline = createProceduralTimeline();

  const resetVisuals = () => {
    [heartEl, seedEl, letterEl, treeEl].forEach((node) => {
      applyVisual(node, { transform: '', opacity: '' });
    });
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
      key: 'horizontal-transition-letter',
      duration: DEFAULT_DURATIONS.HORIZONTAL_TO_LETTER,
      onStart: () => {
        stateMachine.transition(states.TREE_GROW, { source: 'timeline' });
      },
      update: ({ progress }) => {
        applyVisual(seedEl, {
          transform: `translate3d(${lerp(0, 160, progress)}px, 140px, 0) scale(${lerp(1, 0.7, progress)})`,
          opacity: 1 - progress,
        });

        applyVisual(letterEl, {
          transform: `translate3d(${lerp(32, 0, progress)}px, 0, 0) scale(1)`,
          opacity: progress,
        });
      },
    },
    {
      key: 'tree-scale-shift',
      duration: DEFAULT_DURATIONS.TREE_SCALE_SHIFT,
      update: ({ progress }) => {
        applyVisual(treeEl, {
          transform: `translate3d(0, ${lerp(36, 0, progress)}px, 0) scale(${lerp(0.75, 1, progress)})`,
          opacity: progress,
        });
      },
      onComplete: () => {
        stateMachine.transition(states.TREE_FULL, { source: 'timeline' });
        stateMachine.transition(states.LETTER_VIEW, { source: 'timeline' });
      },
    },
  ];

  const handleIntroInteraction = () => {
    if (stateMachine.getState() !== states.HEART_IDLE) {
      return;
    }

    observer.emit(observer.lifecycle.ANIMATION_START, {
      scope: 'intro',
      state: states.HEART_IDLE,
    });

    timeline
      .play(buildIntroSequence())
      .finally(() => {
        observer.emit(observer.lifecycle.ANIMATION_END, {
          scope: 'intro',
          state: stateMachine.getState(),
        });
      });
  };

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

  const unsubscribeIntroClick = domListeners.on(introRoot, 'click', handleIntroInteraction);

  const unsubscribeReset = observer.subscribe(observer.lifecycle.APP_RESET, () => {
    timeline.cancelAll();
    resetVisuals();
  });

  observer.registerCleanup(() => {
    timeline.cancelAll();
  });
  observer.registerCleanup(unsubscribeReset);
  observer.registerCleanup(unsubscribeIntroClick);
  observer.registerCleanup(unsubscribeOnState);

  return {
    introReady: true,
    play: timeline.play,
    cancelAll: timeline.cancelAll,
    onComplete: timeline.onComplete,
  };
}
