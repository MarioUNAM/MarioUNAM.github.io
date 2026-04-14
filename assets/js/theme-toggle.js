/**
 * theme-toggle.js
 * Dual light/dark theme system.
 *
 * Boot script (inline in <head>):
 *   1. Reads localStorage.theme
 *   2. Falls back to prefers-color-scheme
 *   3. Applies class to <html> before first paint → no FOUC
 *
 * Runtime toggle:
 *   - Exported via window.ThemeToggle
 *   - Buttons: [data-theme-toggle] — updates aria-pressed, swaps icon
 *   - Fires CustomEvent 'theme:change' on document
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'theme';
  const DARK        = 'dark';
  const LIGHT       = 'light';

  /* ── 1. Resolve initial theme (runs at parse time via inline boot) ── */
  function resolveTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === DARK || stored === LIGHT) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? LIGHT : DARK;
  }

  /* ── 2. Apply theme class to <html> ────────────────────────────── */
  function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.remove(DARK, LIGHT);
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /* ── 3. Update all toggle buttons' state ──────────────────────── */
  function syncButtons(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const isDark = theme === DARK;
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');

      const iconEl = btn.querySelector('.theme-icon');
      if (iconEl) iconEl.textContent = isDark ? 'light_mode' : 'dark_mode';
    });
  }

  /* ── 4. Toggle handler ─────────────────────────────────────────── */
  function toggle() {
    const current = document.documentElement.classList.contains(DARK) ? DARK : LIGHT;
    const next    = current === DARK ? LIGHT : DARK;
    applyTheme(next);
    syncButtons(next);
    document.dispatchEvent(new CustomEvent('theme:change', { detail: { theme: next } }));
  }

  /* ── 5. Boot: apply theme immediately (called inline in <head>) ── */
  function boot() {
    applyTheme(resolveTheme());
  }

  /* ── 6. Init: wire buttons after DOM is available ──────────────── */
  function init() {
    const current = resolveTheme();
    syncButtons(current);

    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', toggle);
    });

    /* React to OS preference changes if user never set a manual pref */
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? LIGHT : DARK);
        syncButtons(e.matches ? LIGHT : DARK);
      }
    });
  }

  /* ── Public API ────────────────────────────────────────────────── */
  window.ThemeToggle = { boot, init, toggle, applyTheme, resolveTheme };

  /* Run boot immediately so it executes even when loaded in <head> */
  boot();
})();
