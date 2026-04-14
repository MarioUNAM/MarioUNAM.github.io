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
└── data-quality-observability.html
```

Cada página usa Bootstrap + `assets/css/project-detail.css` y `assets/js/i18n.js`.  
Edita los textos en `i18n.js` bajo las claves `projects.rpa.*`, `projects.analytics.*`, `projects.mdm.*`, `projects.quality.*`.

---

## Proyectos personales (en desarrollo)

Repositorios en `E:/ProyectosPersonales/` que darán contenido real a los casos de estudio:

| Repo | Descripción | Integración portfolio |
|------|-------------|----------------------|
| `pumas-data-hub` | MDM hub para datos de Pumas / Liga MX con metodología EBX | Reemplazará el caso "MDM Hub" |
| `liga-mx-analytics` | Pipeline + Power BI para estadísticas Liga MX | Reemplazará el caso "Power BI Dashboard" |
| `gaming-stats-pipeline` | ETL + SQL para stats de FIFA, Rocket League, Marvel Rivals | Caso nuevo |
| `futbol-data-quality` | Observabilidad y calidad de datos deportivos con GE + Airflow | Reemplazará el caso "Data Observability" |

Para crear los repos remotos en GitHub:
```bash
# Ejecutar dentro de cada carpeta de proyecto
gh repo create MarioUNAM/<nombre-repo> --public --source=. --push
# O sin gh CLI:
# 1. Crear el repo en github.com/new
# 2. git push -u origin main
```

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
cd E:/GitHub/MarioUNAM.github.io
python -m http.server 8080
# Abrir http://localhost:8080
```
