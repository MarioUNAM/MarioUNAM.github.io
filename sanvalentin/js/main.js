import { createStateMachine, STATES } from './core/stateMachine.js';
import { createObserver } from './core/observer.js';
import { initAnimations } from './modules/animations.js';
import { initTree } from './modules/tree.js';
import { initParticles } from './modules/particles.js';
import { initCounter } from './modules/counter.js';
import { initAudio } from './modules/audio.js';
import { createOrchestrator } from './core/orchestrator.js';
import { createLiveResourceRegistry } from './utils/liveResources.js';

function bootstrapApp() {
  const observer = createObserver();
  const stateMachine = createStateMachine(STATES.INIT, observer);
  const resources = createLiveResourceRegistry();
  const subscribe = observer.subscribe.bind(observer);
  observer.subscribe = (...args) => resources.trackSubscription(subscribe(...args));
  observer.on = observer.subscribe;
  const domListeners = {
    on: resources.trackListener,
    cleanupAll: resources.cleanupAll,
  };
  const rafRegistry = {
    request: resources.requestAnimationFrame,
    cancel: resources.cancelAnimationFrame,
    cancelAll: resources.cleanupRaf,
  };
  const orchestrator = createOrchestrator({ observer, resources });

  const appRoot = document.querySelector('.app');
  if (appRoot) {
    appRoot.setAttribute('data-state', STATES.INIT);
  }

  const sharedDependencies = {
    observer,
    stateMachine,
    states: STATES,
    domListeners,
    rafRegistry,
    resources,
    orchestrator,
  };

  const animations = initAnimations(sharedDependencies);
  const tree = initTree(sharedDependencies);
  const particles = initParticles(sharedDependencies);
  const counter = initCounter(sharedDependencies);
  const audio = initAudio(sharedDependencies);

  orchestrator.registerModule('animations', animations);
  orchestrator.registerModule('tree', tree);
  orchestrator.registerModule('particles', particles);
  orchestrator.registerModule('counter', counter);
  orchestrator.registerModule('audio', audio);

  domListeners.on(window, 'beforeunload', () => {
    orchestrator.destroyAll();
  });

}

bootstrapApp();
