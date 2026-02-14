import { createStateMachine, STATES } from './core/stateMachine.js';
import { createObserver } from './core/observer.js';
import { initAnimations } from './modules/animations.js';
import { initTree } from './modules/tree.js';
import { initParticles } from './modules/particles.js';
import { initCounter } from './modules/counter.js';
import { initAudio } from './modules/audio.js';

function bootstrapApp() {
  const observer = createObserver();
  const stateMachine = createStateMachine(STATES.INIT, observer);
  const sharedDependencies = {
    observer,
    stateMachine,
    states: STATES,
  };

  const animations = initAnimations(sharedDependencies);
  initTree(sharedDependencies);
  initParticles(sharedDependencies);
  initCounter(sharedDependencies);
  initAudio(sharedDependencies);

  if (animations?.introReady) {
    stateMachine.transition(STATES.HEART_IDLE, {
      source: 'intro-listeners-ready',
    });
  }
}

bootstrapApp();
