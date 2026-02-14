import { qs } from '../utils/dom.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const TREE_EVENTS = Object.freeze({
  GROWN: 'tree:grown',
  FULL: 'tree:full',
});

let persistentTree;

function createSvgNode(tagName, attributes = {}) {
  const node = document.createElementNS(SVG_NS, tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  return node;
}

function createPersistentTree(root) {
  const wrapper = document.createElement('div');
  wrapper.dataset.role = 'tree';
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
  ].map((path) =>
    createSvgNode('path', {
      d: path,
      stroke: '#6e4634',
      'stroke-width': '6',
      'stroke-linecap': 'round',
      fill: 'none',
    }),
  );

  const canopyGroup = createSvgNode('g');

  [trunk, ...branches, canopyGroup].forEach((node) => svg.appendChild(node));
  wrapper.appendChild(svg);
  root.appendChild(wrapper);

  return { wrapper, trunk, branches, canopyGroup };
}

function getTreeNodes(root) {
  if (persistentTree && root.contains(persistentTree.wrapper)) {
    return persistentTree;
  }

  persistentTree = createPersistentTree(root);
  return persistentTree;
}

function setDrawProgress(pathNode, progress) {
  const total = pathNode.getTotalLength();
  pathNode.style.strokeDasharray = String(total);
  pathNode.style.strokeDashoffset = String(total * (1 - progress));
}

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
  ].map(({ cx, cy, r }) =>
    createSvgNode('circle', {
      cx,
      cy,
      r,
      fill: '#e95f7f',
      opacity: 0,
    }),
  );

  circles.forEach((circle) => canopyGroup.appendChild(circle));
  return circles;
}

export function initTree({ observer, stateMachine, states }) {
  const appRoot = qs('.app');
  if (!appRoot) {
    return;
  }

  const treeNodes = getTreeNodes(appRoot);
  const branchNodes = [treeNodes.trunk, ...treeNodes.branches];
  let growthFrameId = 0;
  let canopyNodes = [];

  let didEmitGrown = false;
  let didEmitFull = false;

  const cancelGrowth = () => {
    if (!growthFrameId) {
      return;
    }

    cancelAnimationFrame(growthFrameId);
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

  const growTree = () => {
    cancelGrowth();
    treeNodes.wrapper.style.opacity = '1';

    const duration = 1200;
    const start = performance.now();

    const tick = (timestamp) => {
      const progress = Math.min(1, (timestamp - start) / duration);

      branchNodes.forEach((pathNode, index) => {
        const localProgress = Math.max(0, Math.min(1, progress * 1.15 - index * 0.13));
        setDrawProgress(pathNode, localProgress);
      });

      if (progress >= 1) {
        growthFrameId = 0;
        if (!didEmitGrown) {
          didEmitGrown = true;
          observer.emit(TREE_EVENTS.GROWN, { state: stateMachine.getState() });
        }
        return;
      }

      growthFrameId = requestAnimationFrame(tick);
    };

    growthFrameId = requestAnimationFrame(tick);
  };

  const fillCanopy = () => {
    treeNodes.wrapper.style.opacity = '1';
    canopyNodes = ensureCanopy(treeNodes.canopyGroup);

    canopyNodes.forEach((leaf, index) => {
      leaf.style.transition = `opacity 320ms ease ${index * 70}ms, transform 360ms ease ${index * 70}ms`;
      leaf.style.opacity = '1';
      leaf.style.transform = 'scale(1)';
    });

    if (!didEmitFull) {
      didEmitFull = true;
      observer.emit(TREE_EVENTS.FULL, { state: stateMachine.getState() });
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
      return;
    }

  });

  const unsubscribeOnReset = observer.subscribe(observer.lifecycle.APP_RESET, resetTree);

  observer.registerCleanup(cancelGrowth);
  observer.registerCleanup(unsubscribeOnState);
  observer.registerCleanup(unsubscribeOnReset);

  return {
    events: TREE_EVENTS,
    element: treeNodes.wrapper,
  };
}
