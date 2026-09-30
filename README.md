# MarioUNAM.github.io — Portafolio personal

Sitio web de presentación profesional de **Mario Huarte Nolasco** — MDM Consultant, Java Developer, Data Analyst.

**Live:** [https://mariounam.github.io](https://mariounam.github.io)

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Estructura | HTML5 semántico |
| Estilos | Tailwind CSS (CDN, `darkMode:"class"`) + `assets/css/main.css` |
| Iconos | Material Symbols Outlined (Google) |
| Fuentes | Manrope · Inter · Space Grotesk (Google Fonts) |
| Scripts | Vanilla JS — sin frameworks |
| i18n | Motor propio (`assets/js/i18n.js`) — ES / EN |
| Tema | Dual dark/light (`assets/js/theme-toggle.js`) |
| Animaciones | `assets/js/animations.js` — 6 módulos |
| Hosting | GitHub Pages (rama `main`) |

---

## Dónde editar cada sección

### Textos / traducciones — `assets/js/i18n.js`

Todos los textos del sitio están centralizados aquí en dos bloques: `en: { ... }` y `es: { ... }`.  
Busca la clave correspondiente y cambia el valor en **ambos idiomas**.

| Sección | Claves en i18n.js |
|---------|------------------|
| Hero — nombre, rol, botones | `hero.name.first`, `hero.name.last`, `hero.role`, `hero.cta.work`, `hero.resume` |
| About — bio y estadísticas | `about.bio`, `about.stat.years/projects/sectors/degree/university` |
| Filosofía — título y principios | `philosophy.headline`, `philosophy.paragraph`, `philosophy.p1/p2/p3.*` |
| Skills — títulos de columnas | `skills.heading`, `skills.ecosystem.title`, `skills.governance.title` |
| Experiencia — fechas y bullets (3 roles, igual al CV) | `exp.r1.*` (MDM Consultant), `exp.r2.*` (Intern), `exp.r3.*` (PROTECO) |
| Casos de estudio — disclaimer y badge | `caseStudies.disclaimer`, `caseStudies.badge`, `caseStudies.cta` |
| Casos de estudio — títulos y descripciones | `works.modal.rpa/analytics/mdm/cleansing.*` |
| Certificaciones | tarjetas en `index.html`, bloque `<!-- CERTIFICATIONS -->` (nombre, emisor, año y enlace de verificación); etiquetas `cert.*` en i18n.js |
| Journey (timeline de vida) | `journey.m1` … `journey.m5.*` |
| Hobbies | `hobbies.h1/h2/h3.*` |
| Testimonios | `testimonials.items.N.*` — **hoy no existen** (se retiraron los ficticios); mientras no haya `testimonials.items.0.quote` la sección se oculta sola |
| Contacto | `contact.heading`, `contact.cta.email/linkedin/intro` |
| Nav y footer | `nav.*` |

### Estructura HTML — `index.html`

Cada sección empieza con un comentario de bloque `<!-- ══════ NOMBRE ══════ -->` (HERO, ABOUT, PHILOSOPHY, SKILLS, EXPERIENCE, CASE STUDIES, CERTIFICATIONS, JOURNEY, HOBBIES, TESTIMONIALS, CONTACT, FOOTER). Búscalo con Ctrl+F; no se documentan números de línea porque cambian en cada commit.

### Estilos / colores — `assets/css/main.css`

Los tokens de color están al inicio del archivo como variables CSS:

```css
/* Tema oscuro (default) */
:root {
  --surface: #071325;
  --primary: #4cd6fb;
  --on-surface: #e8f4f8;
  /* … */
}

/* Tema claro */
:root:not(.dark) {
  --surface: #f6f1e7;
  --primary: #0099c2;
  --on-surface: #0d1b2a;
  /* … */
}
```

Componentes específicos que puedes tocar (busca la clase en `main.css`): `.btn-primary`, `.btn-outline`, `.skill-pill`, `.skill-pill-secondary`, `.cert-card`, `.hobby-card-v2`, `.testimonial-card`, `.journey-track` / `.journey-item`, `.principle-card`, `.availability-badge`, `.badge-synthetic` / `.badge-real`.

### Foto de perfil — `assets/img/me.jpg`

Reemplaza el archivo manteniendo el mismo nombre. Dimensión recomendada: **800×1000 px**, relación 4:5.

### CV descargable — `assets/docs/Mario_Huarte_CV.pdf` (+ `.docx`)

Fuentes del CV en `scripts/`: `cv.html` (→ PDF con Chromium/Playwright, tamaño carta) y `build_cv.py` (→ DOCX con python-docx). Edita ambos con el mismo contenido y regenera:

```bash
cd scripts && python3 build_cv.py            # genera Mario_Huarte_CV.docx
node -e "require('playwright').chromium.launch().then(async b=>{const p=await b.newPage();await p.goto('file://'+process.cwd()+'/cv.html');await p.pdf({path:'Mario_Huarte_CV.pdf',format:'Letter',printBackground:true,preferCSSPageSize:true});await b.close();})"
mv Mario_Huarte_CV.* ../assets/docs/
```

### Animaciones — `assets/js/animations.js`

6 módulos independientes, todos respetan `prefers-reduced-motion`:

| Módulo | Función | Selector |
|--------|---------|----------|
| MagneticCTA | Botones se mueven hacia el cursor | `[data-magnetic]` |
| ParallaxHero | Fondo del hero se mueve con scroll | `[data-parallax]` |
| CounterAnim | Contadores animados | `[data-counter]` |
| CardTilt | Cards se inclinan con el pointer | `[data-tilt]` |
| SmoothScroll | Scroll suave con offset del nav | `a[href^="#"]` |
| FadeThrough | Secciones aparecen con fade | `[data-fade-section]` |

---

## Testimonios

Para agregar testimonios reales, edita las claves `testimonials.items.N.*` en `i18n.js`:

```js
'testimonials.items.0.quote': '"Texto del testimonio."',
'testimonials.items.0.name':  'Nombre Apellido',
'testimonials.items.0.role':  'Cargo, Empresa',
'testimonials.items.0.initials': 'NA',
```

Si no hay ninguna clave `testimonials.items.0.quote`, la sección se oculta automáticamente.

> Solo agregar testimonios **reales** con consentimiento escrito de la persona para mostrar su nombre y rol actual. Las tarjetas se construyen con `textContent` (sin `innerHTML`), así que las comillas o `<` del texto no rompen el HTML.

---

## Casos de estudio (proyectos)

Las páginas detalladas están en `projects/`:

```
projects/
├── rpa-invoice-automation.html
├── data-analytics-dashboard.html
├── ebx-mdm-hub.html
└── telecom-customer-cleansing.html   # caso REAL anonimizado (telecom, Match & Merge)
```

Cada página usa el **Tailwind compilado** + `assets/css/main.css`. El diccionario ES/EN va inline en `window.I18N`; la lógica (idioma, tema, storage seguro) es compartida en `assets/js/subpage.js`. Las páginas de contacto y `404.html` usan el mismo script.

> **Nota:** `projects/beca_industrial.html` se movió a `studio/lab/industrial/index.html` como demo navegable del **Mahuno Studio Laboratorio**.

---

## Mahuno Studio — `studio/`

Sub-dominio dentro del repo para la práctica comercial de rebranding para PyMEs mexicanas. Identidad visual propia (papel cálido + cyan profundo) inspirada en Linear/Vercel/Posthog, separada del portfolio principal pero enlazada desde el nav y un banner destacado en `index.html`.

```
studio/
├── index.html              # Landing — hero, qué es, método 5 pasos, lab teaser, casos teaser, contacto
├── lab/
│   ├── index.html          # Catálogo con 4 mockups visuales (servicio local · restaurante · retail · profesional)
│   └── industrial/
│       └── index.html      # Demo navegable industrial (antes projects/beca_industrial.html)
└── casos/
    ├── index.html          # Listado de casos
    └── don-peter/
        └── index.html      # Caso 01 — placeholder realista de rebranding completo
```

El demo industrial (`studio/lab/industrial/`) es un demo conceptual extendido: 7 sub-páginas SPA, Leaflet (mapa de cobertura), Chart.js (KPIs), tabla comparativa de materiales, calculadora de costos, simulador de tolerancias ISO 286, glosario, búsqueda Ctrl+K, modo presentación e impresión.

---

## Formulario de contacto

GitHub Pages es estático puro (no procesa POST). El form usa **Formspree** como backend gratuito (50 envíos/mes).

**Para activarlo**:

1. Regístrate en [formspree.io](https://formspree.io/) con `mario_huarte@outlook.com`.
2. Crea un nuevo form, copia el endpoint (`https://formspree.io/f/xxxxxxxx`).
3. Edita `index.html` línea ~1206 (atributo `data-endpoint` del `<form id="contact-form">`):

   ```html
   <form id="contact-form"
         data-endpoint="https://formspree.io/f/xxxxxxxx"
         method="POST" ...>
   ```

Mientras el endpoint sea el placeholder, el form hace **fallback a `mailto:`** con el contenido pre-rellenado, así que sigue siendo funcional.

Las páginas de feedback son `contact-success.html` y `contact-error.html` (Tailwind, bilingües, `noindex`).

Alternativas a Formspree: Web3Forms (gratis sin límite mensual), EmailJS, Netlify Forms (requiere migrar de hosting).

---

## Despliegue

El sitio es estático. Cualquier push a `main` se despliega automáticamente via GitHub Pages.

```bash
git add .
git commit -m "descripción del cambio"
git push origin main
```


---

## Ejecución local

```bash
python -m http.server 8080
# Abrir http://localhost:8080
```


---

## Pruebas

```bash
node scripts/i18n-check.js     # claves i18n coherentes
node scripts/check-links.js    # enlaces internos
npx html-validate@11 index.html 404.html contact-*.html projects/*.html "studio/**/*.html"
```

Para Lighthouse local: Chrome DevTools → Lighthouse → run en mobile + desktop.

## Librerías de terceros

Chart.js 4.4.1 y Leaflet 1.9.4 se sirven desde `assets/vendor/` (copiadas del paquete npm), sin CDN. Cada página lleva una `Content-Security-Policy` por `<meta>` que solo permite su propio origen (y Google Fonts / Formspree donde aplica).

## CI

`.github/workflows/ci.yml` corre en cada push y PR:

| Paso | Script |
|------|--------|
| Claves i18n coherentes (usadas vs definidas, EN vs ES) | `node scripts/i18n-check.js` |
| Enlaces internos válidos (href/src apuntan a archivos existentes) | `node scripts/check-links.js` |
| HTML válido | `npx html-validate@11` con `.htmlvalidate.json` |
| CSS de Tailwind compilado sin cambios pendientes | `npm run build:css:all` + `git diff --exit-code` |

Corre los tres primeros en local antes de subir; si cambias clases de Tailwind, recompila y sube el CSS.

## Backlog

`BACKLOG.md` contiene la auditoría (seguridad, bugs, SEO/a11y, features) priorizada y las decisiones pendientes.

## Archivos no rastreados

`IMPROVEMENTS.md`, `NOTES.md`, `TODO.md` están en `.gitignore` — son notas internas locales, no se publican.
