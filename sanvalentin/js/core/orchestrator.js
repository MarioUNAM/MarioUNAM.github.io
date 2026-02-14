export function createOrchestrator({ observer, resources }) {
  const modules = new Map();
  let isResetting = false;

  function registerModule(name, controller = {}) {
    modules.set(name, controller);
    return () => modules.delete(name);
  }

  function callModuleMethod(methodName) {
    modules.forEach((controller) => {
      const method = controller?.[methodName];
      if (typeof method === 'function') {
        method();
      }
    });
  }

  function resetAll() {
    if (isResetting) {
      return;
    }

    isResetting = true;
    callModuleMethod('reset');
    isResetting = false;
  }

  function destroyAll() {
    callModuleMethod('destroy');
    resources?.cleanupAll?.();
    modules.clear();
  }

  const unsubscribeReset = observer?.subscribe?.(observer.lifecycle.APP_RESET, () => {
    resetAll();
  });

  return {
    registerModule,
    resetAll,
    destroyAll,
    cleanup() {
      unsubscribeReset?.();
      destroyAll();
    },
  };
}
