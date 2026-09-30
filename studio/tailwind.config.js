/**
 * Tailwind config para Mahuno Studio.
 * Compila en: studio/assets/css/tailwind.css
 *
 * Cubre las 4 páginas "papel cálido":
 *   studio/index.html, studio/lab/index.html,
 *   studio/casos/index.html, studio/casos/don-peter/index.html
 * El demo industrial (studio/lab/industrial/index.html) antes cargaba
 * Tailwind por CDN con un `tailwind.config` inline. Sus tokens BECA
 * (colores primary/surface/…, radio sm, fuentes headline/label) se portan
 * aquí en `theme.extend` (no chocan con los nombres de "papel cálido"),
 * pero se compila aparte con studio/lab/industrial/tailwind.config.js
 * (extiende esta config) → studio/assets/css/industrial.css, porque las
 * capas base/components de tailwind-input.css (tokens --c-*, #mobile-menu,
 * html/body) no deben filtrarse en el sistema BECA.
 *
 * Build: npm run build:css:studio  (y npm run build:css:industrial)
 */
module.exports = {
  content: [
    './studio/index.html',
    './studio/lab/index.html',
    './studio/casos/index.html',
    './studio/casos/don-peter/index.html',
    './studio/assets/js/studio.js',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        /* ── Papel cálido (studio) ── */
        ink:    'var(--c-ink)',
        paper:  'var(--c-paper)',
        dim:    'var(--c-dim)',
        muted:  'var(--c-muted)',
        line:   'var(--c-line)',
        surf:   'var(--c-surf)',
        surf2:  'var(--c-surf2)',
        accent: 'var(--c-accent)',
        warm:   'var(--c-warm)',
        /* ── BECA industrial (studio/lab/industrial) ── */
        'primary':                   'var(--c-primary)',
        'primary-container':         'var(--c-primary-container)',
        'on-primary':                'var(--c-on-primary)',
        'on-primary-container':      'var(--c-on-primary-container)',
        'secondary':                 'var(--c-secondary)',
        'secondary-container':       'var(--c-secondary-container)',
        'on-secondary':              'var(--c-on-secondary)',
        'on-secondary-container':    'var(--c-on-secondary-container)',
        'tertiary-container':        'var(--c-tertiary-container)',
        'on-tertiary-container':     'var(--c-on-tertiary-container)',
        'tertiary-fixed':            'var(--c-tertiary-fixed)',
        'on-tertiary-fixed':         'var(--c-on-tertiary-fixed)',
        'on-tertiary-fixed-variant': 'var(--c-on-tertiary-fixed-variant)',
        'surface':                   'var(--c-surface)',
        'surface-dim':               'var(--c-surface-dim)',
        'surface-variant':           'var(--c-surface-variant)',
        'surface-container-lowest':  'var(--c-surface-container-lowest)',
        'surface-container-low':     'var(--c-surface-container-low)',
        'surface-container':         'var(--c-surface-container)',
        'surface-container-high':    'var(--c-surface-container-high)',
        'surface-container-highest': 'var(--c-surface-container-highest)',
        'on-surface':                'var(--c-on-surface)',
        'on-surface-variant':        'var(--c-on-surface-variant)',
        'on-background':             'var(--c-on-background)',
        'inverse-primary':           'var(--c-inverse-primary)',
        'secondary-fixed-dim':       'var(--c-secondary-fixed-dim)',
        'outline':                   'var(--c-outline)',
        'outline-variant':           'var(--c-outline-variant)',
        'error':                     'var(--c-error)',
      },
      fontFamily: {
        display:  ['Manrope', 'Inter', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
        /* industrial */
        headline: ['Inter', 'sans-serif'],
        label:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        /* studio usa rounded / md / lg / xl / full;
           industrial solo usa rounded-sm (0.125rem, como su config CDN). */
        DEFAULT: '4px',
        sm:      '0.125rem',
        md:      '6px',
        lg:      '10px',
        xl:      '16px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // industrial: inputs/selects del formulario y herramientas
  ],
};
