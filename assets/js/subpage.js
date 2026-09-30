/**
 * subpage.js — Lógica compartida de las subpáginas (projects/*, contact-*, 404).
 *
 * Resumen:
 *  - Lee el diccionario de la página desde window.I18N = { en:{...}, es:{...} }.
 *  - applyI18n(lang): aplica textos a [data-i18n] (title, meta content o textContent)
 *    y sincroniza el botón de idioma (#lang-label o #lang-toggle).
 *  - toggleLang() / toggleTheme(): expuestas en window para los onclick del HTML.
 *  - Acceso a localStorage siempre con try/catch (Safari privado lanza SecurityError).
 * Antes cada página llevaba una copia de estas 4 funciones.
 */
(function (global) {
  'use strict';
  // Helpers de storage tolerantes a fallos
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function applyI18n(lang) {
    var I18N = global.I18N || {};
    var dict = I18N[lang] || I18N.en || {};
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] == null) return;
      if (el.tagName === 'TITLE') document.title = dict[key];
      else if (el.tagName === 'META') el.setAttribute('content', dict[key]);
      else el.textContent = dict[key];
    });
    // Botón de idioma: muestra el idioma al que se cambiará
    var lbl = document.getElementById('lang-label');
    if (lbl) lbl.textContent = lang === 'es' ? 'EN' : 'ES';
    var tgl = document.getElementById('lang-toggle');
    if (tgl) tgl.textContent = lang === 'es' ? 'English' : 'Español';
  }

  function toggleLang() {
    var cur = document.documentElement.getAttribute('data-lang') || 'en';
    var next = cur === 'es' ? 'en' : 'es';
    lsSet('lang', next);
    document.documentElement.setAttribute('lang', next);
    document.documentElement.setAttribute('data-lang', next);
    applyI18n(next);
  }

  function syncThemeIcons() {
    var dark = document.documentElement.classList.contains('dark');
    var moon = document.getElementById('theme-ic-moon'), sun = document.getElementById('theme-ic-sun');
    if (moon) moon.classList.toggle('hidden', !dark);
    if (sun) sun.classList.toggle('hidden', dark);
  }

  function toggleTheme() {
    var next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(next);
    lsSet('theme', next);
    syncThemeIcons();
  }

  global.applyI18n = applyI18n;
  global.toggleLang = toggleLang;
  global.toggleTheme = toggleTheme;

  applyI18n(document.documentElement.getAttribute('data-lang') || 'en');
  syncThemeIcons();
})(window);
