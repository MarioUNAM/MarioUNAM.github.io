/**
 * Tailwind config del demo industrial (BECA). Extiende la de Mahuno Studio
 * (mismo theme.extend con los tokens BECA y el plugin forms) pero compila
 * SOLO este HTML y sin las capas base/components de "papel cálido", que
 * chocan con el sistema BECA (--c-accent, #mobile-menu, html/body).
 *
 * Salida: studio/assets/css/industrial.css
 * Build:  npm run build:css:industrial
 */
const base = require('../../tailwind.config.js');
module.exports = {
  ...base,
  content: ['./studio/lab/industrial/index.html'],
};
