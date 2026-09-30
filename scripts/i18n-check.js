#!/usr/bin/env node
/**
 * i18n-check.js — Verifica la coherencia entre index.html y assets/js/i18n.js.
 * Falla (exit 1) si hay claves usadas en el HTML sin definir, definidas sin usar,
 * o presentes en un idioma y no en el otro. Uso: node scripts/i18n-check.js
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
global.window = {};
require(path.join(root, 'assets/js/i18n.js'));
const T = global.window.TRANSLATIONS;

// Claves referenciadas en el HTML: data-i18n, data-i18n-attrs (attr:clave), data-tooltip-i18n, t('clave')
const used = new Set();
for (const m of html.matchAll(/data-i18n="([^"]+)"/g)) used.add(m[1]);
for (const m of html.matchAll(/data-i18n-attrs="([^"]+)"/g)) m[1].split(',').forEach(p => used.add(p.split(':')[1].trim()));
for (const m of html.matchAll(/data-tooltip-i18n="([^"]+)"/g)) used.add(m[1]);
for (const m of html.matchAll(/(?<![A-Za-z0-9_.])t\('([a-zA-Z0-9_.]+)'\)/g)) used.add(m[1]);
// Claves construidas dinámicamente en el script inline
['nav.theme.announce.dark', 'nav.theme.announce.light', 'nav.theme.light'].forEach(k => used.add(k));

const en = Object.keys(T.en), es = Object.keys(T.es);
const undefinedKeys = [...used].filter(k => !(k in T.en) && !k.startsWith('testimonials.items.'));
const unused = en.filter(k => !used.has(k) && !k.startsWith('testimonials.items.'));
const missingEs = en.filter(k => !(k in T.es)), missingEn = es.filter(k => !(k in T.en));

let fail = false;
const report = (label, arr) => { if (arr.length) { fail = true; console.error(`✗ ${label}: ${arr.join(', ')}`); } };
report('usadas sin definir', undefinedKeys);
report('definidas sin usar', unused);
report('faltan en es', missingEs);
report('faltan en en', missingEn);
if (!fail) console.log(`✓ i18n coherente: ${en.length} claves en 2 idiomas`);
process.exit(fail ? 1 : 0);
