import { qs, setAttrs, setText } from '../utils/dom.js';

const STORAGE_KEY = 'sanvalentin:audio:playing';
const DEFAULTS = {
  audioSelector: '#bg-music',
  buttonSelector: '[data-audio-toggle]',
  baseVolume: 0.35,
  persistPreference: false,
  storageKey: STORAGE_KEY,
  labels: {
    play: 'Reproducir música',
    pause: 'Pausar música',
  },
};

function readPersistedPreference(persistPreference, storageKey) {
  if (!persistPreference) {
    return null;
  }

  try {
    return localStorage.getItem(storageKey) === 'true';
  } catch {
    return null;
  }
}

function persistPreference(persistPreferenceEnabled, storageKey, isPlaying) {
  if (!persistPreferenceEnabled) {
    return;
  }

  try {
    localStorage.setItem(storageKey, String(Boolean(isPlaying)));
  } catch {
    // Silently ignore storage errors (private mode, blocked storage, etc).
  }
}

export function init(options = {}) {
  const config = {
    ...DEFAULTS,
    ...options,
    labels: {
      ...DEFAULTS.labels,
      ...(options.labels ?? {}),
    },
  };

  const audio = qs(config.audioSelector);
  const button = qs(config.buttonSelector);
  let hasUserInteracted = false;

  const resolvedPersistPreference =
    typeof options.persistPreference === 'boolean'
      ? options.persistPreference
      : button?.dataset.persistAudioPreference === 'true' ||
          audio?.dataset.persistAudioPreference === 'true';

  function updateButtonState() {
    if (!button) {
      return;
    }

    const isPlaying = Boolean(audio && !audio.paused);
    const nextLabel = isPlaying ? config.labels.pause : config.labels.play;

    setAttrs(button, {
      'aria-pressed': String(isPlaying),
      'aria-label': nextLabel,
      title: nextLabel,
    });

    const explicitLabelNode = button.querySelector('[data-audio-toggle-label]');
    if (explicitLabelNode) {
      setText(explicitLabelNode, nextLabel);
    }
  }

  async function safePlay() {
    if (!audio) {
      return false;
    }

    hasUserInteracted = true;

    try {
      await audio.play();
      persistPreference(resolvedPersistPreference, config.storageKey, true);
      updateButtonState();
      return true;
    } catch {
      updateButtonState();
      return false;
    }
  }

  function stop() {
    if (!audio) {
      return;
    }

    audio.pause();
    persistPreference(resolvedPersistPreference, config.storageKey, false);
    updateButtonState();
  }

  async function toggle() {
    if (!audio) {
      return false;
    }

    if (audio.paused) {
      return safePlay();
    }

    stop();
    return true;
  }

  function reset() {
    if (!audio) {
      return;
    }

    stop();
    audio.currentTime = 0;
  }

  function initElementState() {
    if (audio) {
      audio.autoplay = false;
      audio.preload = audio.preload || 'metadata';
      audio.volume = Math.min(Math.max(config.baseVolume, 0), 1);

      const prefersPlaying = readPersistedPreference(
        resolvedPersistPreference,
        config.storageKey,
      );

      if (!prefersPlaying) {
        audio.pause();
      }
    }

    updateButtonState();
  }

  function bindEvents() {
    const cleanups = [];

    if (button) {
      const onButtonClick = (event) => {
        event.preventDefault();
        toggle();
      };

      button.addEventListener('click', onButtonClick);
      cleanups.push(() => button.removeEventListener('click', onButtonClick));
    }

    if (audio) {
      const onPlaybackUpdate = () => updateButtonState();
      audio.addEventListener('play', onPlaybackUpdate);
      audio.addEventListener('pause', onPlaybackUpdate);
      cleanups.push(() => audio.removeEventListener('play', onPlaybackUpdate));
      cleanups.push(() => audio.removeEventListener('pause', onPlaybackUpdate));
    }

    const onFirstInteraction = () => {
      if (hasUserInteracted) {
        return;
      }

      const prefersPlaying = readPersistedPreference(
        resolvedPersistPreference,
        config.storageKey,
      );

      if (prefersPlaying) {
        safePlay();
      }

      hasUserInteracted = true;
    };

    document.addEventListener('pointerdown', onFirstInteraction, { once: true });
    document.addEventListener('keydown', onFirstInteraction, { once: true });

    cleanups.push(() =>
      document.removeEventListener('pointerdown', onFirstInteraction),
    );
    cleanups.push(() =>
      document.removeEventListener('keydown', onFirstInteraction),
    );

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }

  initElementState();
  const cleanup = bindEvents();

  return {
    audio,
    button,
    toggle,
    stop,
    reset,
    cleanup,
  };
}

export function initAudio({ observer } = {}) {
  const controller = init();

  if (observer?.registerCleanup) {
    observer.registerCleanup(() => {
      controller.stop();
      controller.cleanup();
    });
  }

  return controller;
}
