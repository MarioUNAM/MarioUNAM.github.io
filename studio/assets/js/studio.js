/* ══════════════════════════════════════════════════════════════
   Mahuno Studio — JS compartido por las páginas "papel cálido"
   (studio/, lab/, casos/, casos/don-peter/): botón de tema,
   año del footer y menú móvil. El script anti-FOUC que aplica el
   tema antes de pintar sigue inline en el <head> de cada página.
══════════════════════════════════════════════════════════════ */
(function () {
  // Helpers de localStorage tolerantes (modo privado / storage bloqueado).
  // Normalmente ya los define el script anti-FOUC; aquí hay respaldo.
  var lsSet = window.lsSet || function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };

  // ── Tema claro/oscuro ──────────────────────────────────────
  var icon = document.getElementById('theme-icon');
  function syncThemeIcon() {
    var t = document.documentElement.getAttribute('data-theme');
    if (icon) icon.textContent = (t === 'dark') ? 'dark_mode' : 'light_mode';
  }
  syncThemeIcon();
  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    var next = (cur === 'dark') ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    lsSet('studio.theme', next);
    syncThemeIcon();
  });

  // ── Año en el footer ───────────────────────────────────────
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // ── Menú móvil ─────────────────────────────────────────────
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    if (hamburger) {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileMenu);
    });
    // Escape cierra el menú
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu();
    });
  }
})();
