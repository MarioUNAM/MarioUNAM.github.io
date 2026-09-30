#!/usr/bin/env node
/**
 * check-links.js — Verifica que todos los href/src internos de los HTML del sitio
 * apunten a archivos existentes en el repo (enlaces relativos y absolutos "/").
 * No hace peticiones de red. Uso: node scripts/check-links.js
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'scripts']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
let broken = 0, checked = 0;
for (const file of walk(root)) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/\b(?:href|src)="([^"#?]+)(?:[#?][^"]*)?"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(url)) continue;
    const target = url.startsWith('/') ? path.join(root, url) : path.resolve(path.dirname(file), url);
    checked++;
    // Un directorio vale si contiene index.html
    const ok = fs.existsSync(target) && (!fs.statSync(target).isDirectory() || fs.existsSync(path.join(target, 'index.html')));
    if (!ok) { broken++; console.error(`✗ ${path.relative(root, file)} → ${url}`); }
  }
}
console.log(broken ? `✗ ${broken} enlaces rotos de ${checked}` : `✓ ${checked} enlaces internos válidos`);
process.exit(broken ? 1 : 0);
