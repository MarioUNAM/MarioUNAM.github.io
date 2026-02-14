export function createRafRegistry() {
  const activeFrameIds = new Set();

  function request(callback) {
    const frameId = window.requestAnimationFrame((timestamp) => {
      activeFrameIds.delete(frameId);
      callback(timestamp);
    });

    activeFrameIds.add(frameId);
    return frameId;
  }

  function cancel(frameId) {
    if (!activeFrameIds.has(frameId)) {
      return false;
    }

    window.cancelAnimationFrame(frameId);
    activeFrameIds.delete(frameId);
    return true;
  }

  function cancelAll() {
    [...activeFrameIds].forEach((frameId) => {
      window.cancelAnimationFrame(frameId);
    });

    activeFrameIds.clear();
  }

  return {
    request,
    cancel,
    cancelAll,
    size() {
      return activeFrameIds.size;
    },
  };
}
