import { qs } from '../utils/dom.js';

const PARTICLE_POOL_SIZE = 48;
const SPAWN_RATE_PER_SECOND = 14;
const GRAVITY = 980;
const MAX_FALL_SPEED = 280;

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function createParticleNode() {
  const node = document.createElement('span');
  node.className = 'particle-leaf';
  node.style.opacity = '0';
  node.style.transform = 'translate3d(-9999px, -9999px, 0)';
  return node;
}

function shouldRunForState(state, states) {
  return state === states.LETTER_VIEW;
}

export function initParticles({ observer, stateMachine, states, rafRegistry }) {
  const appRoot = qs('.app');
  if (!appRoot) {
    return null;
  }

  appRoot.classList.add('app--with-particles');

  const layer = document.createElement('div');
  layer.className = 'particle-layer';
  layer.setAttribute('aria-hidden', 'true');
  appRoot.appendChild(layer);

  const pool = Array.from({ length: PARTICLE_POOL_SIZE }, () => {
    const node = createParticleNode();
    layer.appendChild(node);

    return {
      node,
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      driftPhase: 0,
      driftAmp: 0,
      rotation: 0,
      spin: 0,
      size: 1,
    };
  });

  let bounds = { width: appRoot.clientWidth, height: appRoot.clientHeight };
  let isRunning = false;
  let frameId = 0;
  let lastTimestamp = 0;
  let spawnAccumulator = 0;
  let spawnCursor = 0;

  const activateParticle = (particle) => {
    particle.active = true;
    particle.x = randomInRange(0, bounds.width);
    particle.y = randomInRange(-bounds.height * 0.6, -20);
    particle.vx = randomInRange(-24, 24);
    particle.vy = randomInRange(36, 82);
    particle.driftPhase = randomInRange(0, Math.PI * 2);
    particle.driftAmp = randomInRange(8, 22);
    particle.rotation = randomInRange(0, 360);
    particle.spin = randomInRange(-50, 50);
    particle.size = randomInRange(0.68, 1.2);
    particle.node.style.opacity = randomInRange(0.4, 0.95).toFixed(2);
  };

  const deactivateParticle = (particle) => {
    particle.active = false;
    particle.node.style.opacity = '0';
    particle.node.style.transform = 'translate3d(-9999px, -9999px, 0) rotate(0deg) scale(1)';
  };

  const renderParticle = (particle) => {
    particle.node.style.transform = `translate3d(${particle.x.toFixed(2)}px, ${particle.y.toFixed(2)}px, 0) rotate(${particle.rotation.toFixed(2)}deg) scale(${particle.size.toFixed(2)})`;
  };

  const updateParticle = (particle, dt) => {
    const drift = Math.sin(particle.driftPhase) * particle.driftAmp;
    particle.vx += drift * dt * 0.6;
    particle.vy = Math.min(MAX_FALL_SPEED, particle.vy + GRAVITY * dt);
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.rotation += particle.spin * dt;
    particle.driftPhase += dt * randomInRange(0.9, 1.8);

    if (
      particle.y > bounds.height + 24 ||
      particle.x < -32 ||
      particle.x > bounds.width + 32
    ) {
      deactivateParticle(particle);
      return;
    }

    renderParticle(particle);
  };

  const spawnParticle = () => {
    for (let i = 0; i < pool.length; i += 1) {
      const index = (spawnCursor + i) % pool.length;
      const particle = pool[index];
      if (particle.active) {
        continue;
      }

      activateParticle(particle);
      renderParticle(particle);
      spawnCursor = (index + 1) % pool.length;
      return;
    }
  };

  const tick = (timestamp) => {
    if (!isRunning) {
      return;
    }

    const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000 || 0);
    lastTimestamp = timestamp;

    spawnAccumulator += dt * SPAWN_RATE_PER_SECOND;
    while (spawnAccumulator >= 1) {
      spawnParticle();
      spawnAccumulator -= 1;
    }

    pool.forEach((particle) => {
      if (!particle.active) {
        return;
      }

      updateParticle(particle, dt);
    });

    frameId = rafRegistry.request(tick);
  };

  const resize = () => {
    bounds = {
      width: appRoot.clientWidth,
      height: appRoot.clientHeight,
    };
  };

  const start = () => {
    if (isRunning) {
      return false;
    }

    resize();
    isRunning = true;
    lastTimestamp = performance.now();
    frameId = rafRegistry.request(tick);
    return true;
  };

  const stop = () => {
    if (!isRunning) {
      return false;
    }

    isRunning = false;
    rafRegistry.cancel(frameId);
    frameId = 0;
    return true;
  };

  const reset = () => {
    stop();
    spawnAccumulator = 0;
    pool.forEach((particle) => deactivateParticle(particle));
  };

  const handleResize = () => {
    resize();
  };

  resize();

  const unsubscribeOnState = observer.subscribe(observer.lifecycle.STATE_CHANGED, ({ to }) => {
    if (shouldRunForState(to, states)) {
      start();
      return;
    }

    stop();
  });

  const unsubscribeOnReset = observer.subscribe(observer.lifecycle.APP_RESET, () => {
    reset();
  });

  window.addEventListener('resize', handleResize);

  const cleanup = () => {
    reset();
    window.removeEventListener('resize', handleResize);
    unsubscribeOnState();
    unsubscribeOnReset();
    layer.remove();
  };

  observer.registerCleanup(cleanup);

  return {
    start,
    stop,
    reset,
    resize,
    cleanup,
  };
}
