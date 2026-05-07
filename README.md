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
| Experiencia — fechas y bullets | `exp.r1.*`, `exp.r2.*` |
| Casos de estudio — disclaimer y badge | `caseStudies.disclaimer`, `caseStudies.badge`, `caseStudies.cta` |
| Casos de estudio — títulos y descripciones | `works.modal.rpa/analytics/mdm/observability.*` |
| Certificaciones | hardcodeadas en `index.html` (líneas ~601–636) |
| Journey (timeline de vida) | `journey.m1` … `journey.m5.*` |
| Hobbies | `hobbies.h1/h2/h3.*` |
| Testimonios | `testimonials.items.0/1/2.*` — si el array está vacío, la sección se oculta sola |
| Contacto | `contact.heading`, `contact.cta.email/linkedin/intro` |
| Nav y footer | `nav.*` |

### Estructura HTML — `index.html`

Cada sección tiene un comentario de bloque:

```
<!-- ══════ HERO ══════ -->        línea ~175
<!-- ══════ ABOUT ══════ -->       línea ~234
<!-- ══════ PHILOSOPHY ══════ -->  línea ~326
<!-- ══════ SKILLS ══════ -->      línea ~361
<!-- ══════ EXPERIENCE ══════ --> línea ~425
<!-- ══════ CASE STUDIES ══════ -->línea ~489
<!-- ══════ CERTIFICATIONS ══════ -->línea ~591
<!-- ══════ JOURNEY ══════ -->     línea ~647
<!-- ══════ HOBBIES ══════ -->     línea ~714
<!-- ══════ TESTIMONIALS ══════ -->línea ~755
<!-- ══════ CONTACT ══════ -->     línea ~774
<!-- ══════ FOOTER ══════ -->      línea ~895
```

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

Componentes específicos que puedes tocar:

| Componente | Clase CSS | Línea aprox. |
|-----------|-----------|-------------|
| Botón primario | `.btn-primary` | ~301 |
| Botón outline | `.btn-outline` | ~323 |
| Skill pills | `.skill-pill`, `.skill-pill-secondary` | ~345 |
| Cert cards | `.cert-card` | ~407 |
| Hobby cards | `.hobby-card-v2` | ~808 |
| Testimonial card | `.testimonial-card` | ~610 |
| Journey timeline | `.journey-track`, `.journey-item` | ~677 |
| Principios | `.principle-card` | ~862 |
| Disponibilidad | `.availability-badge` | ~908 |

### Foto de perfil — `assets/img/me.jpeg`

Reemplaza el archivo manteniendo el mismo nombre. Dimensión recomendada: **800×1000 px**, relación 4:5.

### CV descargable — `assets/docs/Mario_Huarte_CV.pdf`

Reemplaza el archivo. El enlace en el hero ya apunta a `assets/docs/Mario_Huarte_CV.pdf`.

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

---

## Casos de estudio (proyectos)

Las páginas detalladas están en `projects/`:

```
projects/
├── rpa-invoice-automation.html
├── data-analytics-dashboard.html
├── ebx-mdm-hub.html
├── data-quality-observability.html
└── beca_industrial.html       # SPA bilingüe con mapa, materiales y herramientas
```

Cada página usa **Tailwind (CDN)** + `assets/css/main.css` con i18n inline ES/EN, dark/light toggle y FOUC prevention.

`beca_industrial.html` es un demo conceptual extendido: 7 sub-páginas SPA, Leaflet (mapa de cobertura), Chart.js (KPIs), tabla comparativa de materiales, calculadora de costos, simulador de tolerancias ISO 286, glosario, búsqueda Ctrl+K, modo presentación e impresión.

---

## Tracker personal — `tracker.html`

PWA standalone sin tracking ni servidor. Datos solo en `localStorage`.

- Schema v3 con migración suave desde v2.
- Cálculo de calorías diarias (Mifflin-St Jeor 1990) con perfil ampliado (sexo, altura, edad, actividad, objetivo).
- Asistente IA: genera prompt con contexto + valida/aplica análisis JSON devuelto por LLM externo.
- Charts theme-aware (Chart.js) que reaccionan al toggle dark/light.
- SW (`sw.js`) con update prompt y offline fallback explícito.
- Atajos teclado: `Ctrl+S` export, `1-5` cambiar tab, `Esc` cancelar edit, `/` focus search.

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

Después de subir cambios al `tracker.html` o `sw.js`, sube `CACHE_VERSION` en `sw.js` para que el prompt de "Nueva versión" aparezca en sesiones abiertas.

---

## Ejecución local

```bash
python -m http.server 8080
# Abrir http://localhost:8080
```

> El tracker usa `crypto.randomUUID()` que requiere HTTPS o localhost. Servir con `python -m http.server` funciona; abrir `tracker.html` directo desde el filesystem (`file://`) usará el fallback casero de `uid()`.

---

## Pruebas

```bash
# Smoke test de sintaxis JS inline (no rompe nada)
node -e "const fs=require('fs');const html=fs.readFileSync('tracker.html','utf8');const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,ok=0;while((m=re.exec(html))){new Function(m[1]);ok++;}console.log('inline scripts ok:',ok);"
```

Para Lighthouse local: Chrome DevTools → Lighthouse → run en mobile + desktop.

---

## Archivos no rastreados

`IMPROVEMENTS.md`, `NOTES.md`, `TODO.md` están en `.gitignore` — son notas internas locales, no se publican.
