import { createStateMachine } from './core/stateMachine.js';
import { createObserver } from './core/observer.js';
import { initAnimations } from './modules/animations.js';
import { initTree } from './modules/tree.js';
import { initParticles } from './modules/particles.js';
import { initCounter } from './modules/counter.js';
import { initAudio } from './modules/audio.js';

const observer = createObserver();
const machine = createStateMachine('idle');

initAnimations({ observer, machine });
initTree({ observer, machine });
initParticles({ observer, machine });
initCounter({ observer, machine });
initAudio({ observer, machine });
