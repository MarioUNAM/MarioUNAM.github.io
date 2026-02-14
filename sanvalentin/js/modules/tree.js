import { qs } from '../utils/dom.js';

/**
 * Contrato de módulo árbol:
 * - Escucha `state:changed` para reaccionar a TREE_GROW y TREE_FULL.
 * - Escucha `app:reset` para volver al estado inicial visual.
 * - Emite `tree:grown` al finalizar el trazo de ramas.
 * - Emite `tree:full` al completar el follaje.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const TREE_EVENTS = Object.freeze({
  GROWN: 'tree:grown',
  FULL: 'tree:full',
});

let persistentTree;

const createSvgNode = (tagName, attributes = {}) => {
  const node = document.createElementNS(SVG_NS, tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  return node;
};

function createPersistentTree(host) {
  const wrapper = host;
  wrapper.style.width = '180px';
  wrapper.style.height = '220px';
  wrapper.style.margin = '0 auto';
  wrapper.style.transformOrigin = '50% 100%';
  wrapper.style.opacity = '0';

  const svg = createSvgNode('svg', {
    viewBox: '0 0 180 220',
    width: '100%',
    height: '100%',
    role: 'img',
    'aria-label': 'Árbol animado',
  });

  const trunk = createSvgNode('path', {
    d: 'M90 205 L90 125',
    stroke: '#5b3a29',
    'stroke-width': '14',
    'stroke-linecap': 'round',
    fill: 'none',
  });

  const branches = [
    'M90 145 C80 138 72 126 66 114',
    'M90 140 C100 132 109 122 116 108',
    'M90 125 C80 116 74 103 69 92',
    'M90 122 C102 114 111 102 118 90',
  ].map((path) => createSvgNode('path', {
    d: path,
    stroke: '#6e4634',
    'stroke-width': '6',
    'stroke-linecap': 'round',
    fill: 'none',
  }));

  const canopyGroup = createSvgNode('g');
  [trunk, ...branches, canopyGroup].forEach((node) => svg.appendChild(node));

  wrapper.replaceChildren(svg);

  return { wrapper, trunk, branches, canopyGroup };
}

function getTreeNodes(root) {
  if (persistentTree && root.contains(persistentTree.wrapper)) {
    return persistentTree;
  }

  persistentTree = createPersistentTree(root);
  return persistentTree;
}

const setDrawProgress = (pathNode, progress) => {
  const total = pathNode.getTotalLength();
  pathNode.style.strokeDasharray = String(total);
  pathNode.style.strokeDashoffset = String(total * (1 - progress));
};

function ensureCanopy(canopyGroup) {
  if (canopyGroup.childNodes.length > 0) {
    return [...canopyGroup.children];
  }

  const circles = [
    { cx: 90, cy: 82, r: 28 },
    { cx: 66, cy: 96, r: 20 },
    { cx: 114, cy: 98, r: 20 },
    { cx: 78, cy: 70, r: 16 },
    { cx: 102, cy: 68, r: 16 },
  ].map(({ cx, cy, r }) => createSvgNode('circle', {
    cx,
    cy,
    r,
    fill: '#e95f7f',
    opacity: 0,
  }));

  circles.forEach((circle) => canopyGroup.appendChild(circle));
  return circles;
}

/**
 * @param {{ observer: any, stateMachine: any, states: Record<string,string>, rafRegistry: any }} deps
 */
export function initTree({ observer, stateMachine, states, rafRegistry }) {
  const treeHost = qs('[data-role="tree"]');
  if (!treeHost) {
    return null;
  }

  const treeNodes = getTreeNodes(treeHost);
  const branchNodes = [treeNodes.trunk, ...treeNodes.branches];

  let growthFrameId = 0;
  let canopyNodes = [];
  let didEmitGrown = false;
  let didEmitFull = false;

  const cancelGrowth = () => {
    if (!growthFrameId) {
      return;
    }

    rafRegistry.cancel(growthFrameId);
    growthFrameId = 0;
  };

  const resetTree = () => {
    cancelGrowth();
    didEmitGrown = false;
    didEmitFull = false;

    treeNodes.wrapper.style.transition = '';
    treeNodes.wrapper.style.opacity = '0';
    treeNodes.wrapper.style.transform = '';

    branchNodes.forEach((pathNode) => setDrawProgress(pathNode, 0));

    canopyNodes = ensureCanopy(treeNodes.canopyGroup);
    canopyNodes.forEach((leaf) => {
      leaf.style.transition = '';
      leaf.style.opacity = '0';
      leaf.style.transform = 'scale(0.6)';
      leaf.style.transformOrigin = 'center';
    });
  };

  const emitTreeEvent = (eventName) => {
    observer.emit(eventName, { state: stateMachine.getState() });
  };

  const growTree = () => {
    cancelGrowth();
    treeNodes.wrapper.style.opacity = '1';

    const durationMs = 1200;
    const startTime = performance.now();

    const tickGrowth = (timestamp) => {
      const progress = Math.min(1, (timestamp - startTime) / durationMs);

      branchNodes.forEach((pathNode, index) => {
        const localProgress = Math.max(0, Math.min(1, progress * 1.15 - index * 0.13));
        setDrawProgress(pathNode, localProgress);
      });

      if (progress >= 1) {
        growthFrameId = 0;
        if (!didEmitGrown) {
          didEmitGrown = true;
          emitTreeEvent(TREE_EVENTS.GROWN);
        }
        return;
      }

      growthFrameId = rafRegistry.request(tickGrowth);
    };

    growthFrameId = rafRegistry.request(tickGrowth);
  };

  const fillCanopy = () => {
    treeNodes.wrapper.style.opacity = '1';
    canopyNodes = ensureCanopy(treeNodes.canopyGroup);

    canopyNodes.forEach((leaf, index) => {
      const delayMs = index * 70;
      leaf.style.transition = `opacity 320ms ease ${delayMs}ms, transform 360ms ease ${delayMs}ms`;
      leaf.style.opacity = '1';
      leaf.style.transform = 'scale(1)';
    });

    if (!didEmitFull) {
      didEmitFull = true;
      emitTreeEvent(TREE_EVENTS.FULL);
    }
  };

  resetTree();

  const unsubscribeOnState = observer.subscribe(observer.lifecycle.STATE_CHANGED, ({ to }) => {
    if (to === states.TREE_GROW) {
      growTree();
      return;
    }

    if (to === states.TREE_FULL) {
      fillCanopy();
    }
  });

  const unsubscribeOnReset = observer.subscribe(observer.lifecycle.APP_RESET, resetTree);

  const reset = () => resetTree();

  const destroy = () => {
    cancelGrowth();
    unsubscribeOnState();
    unsubscribeOnReset();
  };

  observer.registerCleanup(destroy);

  return {
    events: TREE_EVENTS,
    element: treeNodes.wrapper,
    reset,
    destroy,
  };
}
