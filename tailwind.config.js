/**
 * Tailwind config para el portfolio principal.
 * Compila en: assets/css/tailwind.css
 *
 * Cubre: index.html, contact-success.html, contact-error.html,
 * y projects/{data-analytics-dashboard, rpa-invoice-automation,
 *              ebx-mdm-hub, data-quality-observability}.html.
 *
 * NO cubre: studio/** (todo el Mahuno Studio usa tokens --c-* propios
 * con Tailwind CDN, incluyendo el demo industrial movido a
 * studio/lab/industrial/index.html, antes projects/beca_industrial.html).
 *
 * Build: npm run build:css
 */
module.exports = {
  content: [
    './index.html',
    './contact-success.html',
    './contact-error.html',
    './projects/data-analytics-dashboard.html',
    './projects/rpa-invoice-automation.html',
    './projects/ebx-mdm-hub.html',
    './projects/data-quality-observability.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'surface':                   'var(--surface)',
        'surface-dim':               'var(--surface-dim)',
        'surface-container-lowest':  'var(--surface-container-lowest)',
        'surface-container-low':     'var(--surface-container-low)',
        'surface-container':         'var(--surface-container)',
        'surface-container-high':    'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-container-highest)',
        'surface-bright':            'var(--surface-bright)',
        'surface-variant':           'var(--surface-variant)',
        'on-surface':                'var(--on-surface)',
        'on-surface-variant':        'var(--on-surface-variant)',
        'primary':                   'var(--primary)',
        'primary-container':         'var(--primary-container)',
        'on-primary':                'var(--on-primary)',
        'secondary':                 'var(--secondary)',
        'tertiary':                  'var(--tertiary)',
        'outline':                   'var(--outline)',
        'outline-variant':           'var(--outline-variant)',
        'error':                     'var(--error)',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body:     ['Inter', 'sans-serif'],
        label:    ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
