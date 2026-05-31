/**
 * Tailwind config para Mahuno Studio.
 * Compila en: studio/assets/css/tailwind.css
 *
 * Cubre los 4 archivos con sistema "papel cálido":
 *   studio/index.html, studio/lab/index.html,
 *   studio/casos/index.html, studio/casos/don-peter/index.html
 *
 * NO cubre studio/lab/industrial/index.html — ese mantiene
 * el sistema de tokens BECA original y sigue usando Tailwind CDN.
 *
 * Build: npm run build:css:studio
 */
module.exports = {
  content: [
    './studio/index.html',
    './studio/lab/index.html',
    './studio/casos/index.html',
    './studio/casos/don-peter/index.html',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink:    'var(--c-ink)',
        paper:  'var(--c-paper)',
        dim:    'var(--c-dim)',
        muted:  'var(--c-muted)',
        line:   'var(--c-line)',
        surf:   'var(--c-surf)',
        surf2:  'var(--c-surf2)',
        accent: 'var(--c-accent)',
        warm:   'var(--c-warm)',
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm:      '4px',
        md:      '6px',
        lg:      '10px',
        xl:      '16px',
      },
    },
  },
  plugins: [],
};
