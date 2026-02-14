const resolveScope = (scope) => scope ?? document;

export function qs(selector, scope = document) {
  if (typeof selector !== 'string' || selector.length === 0) {
    return null;
  }

  try {
    return resolveScope(scope)?.querySelector(selector) ?? null;
  } catch {
    return null;
  }
}

export function qsa(selector, scope = document) {
  if (typeof selector !== 'string' || selector.length === 0) {
    return [];
  }

  try {
    return Array.from(resolveScope(scope)?.querySelectorAll(selector) ?? []);
  } catch {
    return [];
  }
}

export function setText(node, nextText = '') {
  if (!node) {
    return false;
  }

  const normalizedText = String(nextText);
  if (node.textContent === normalizedText) {
    return false;
  }

  node.textContent = normalizedText;
  return true;
}

export function setAttr(node, name, value) {
  if (!node || typeof name !== 'string' || name.length === 0) {
    return false;
  }

  if (value == null) {
    if (!node.hasAttribute(name)) {
      return false;
    }

    node.removeAttribute(name);
    return true;
  }

  const normalizedValue = String(value);
  if (node.getAttribute(name) === normalizedValue) {
    return false;
  }

  node.setAttribute(name, normalizedValue);
  return true;
}

export function setAttrs(node, attributes = {}) {
  return Object.entries(attributes).reduce((didMutate, [name, value]) => {
    return setAttr(node, name, value) || didMutate;
  }, false);
}

export function createListenerRegistry() {
  const listenerCleanups = new Set();

  function on(target, eventName, handler, options) {
    if (!target?.addEventListener || typeof handler !== 'function') {
      return () => {};
    }

    target.addEventListener(eventName, handler, options);

    const cleanup = () => {
      target.removeEventListener(eventName, handler, options);
      listenerCleanups.delete(cleanup);
    };

    listenerCleanups.add(cleanup);
    return cleanup;
  }

  function cleanupAll() {
    [...listenerCleanups].forEach((cleanup) => cleanup());
  }

  return {
    on,
    cleanupAll,
    size() {
      return listenerCleanups.size;
    },
  };
}

export const $ = qs;
export const $$ = qsa;
