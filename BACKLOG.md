# BACKLOG — mariounam.github.io

Auditoría del 2026-09-30 sobre `main` (commit `1a0fb20`). Ítems marcados ✅ se corrigieron el mismo día en la rama `claude/compassionate-einstein-5xjhk8`. Contrastada contra el CV vigente
(MDM Consultant | TIBCO EBX Developer, Alldatum, Aug 2023–Presente).

Prioridad: **P0** = corregir ya (credibilidad / seguridad) · **P1** = próximo sprint · **P2** = mejora · **P3** = idea.
Esfuerzo: S (< 1 h) · M (1–4 h) · L (> 4 h).

---

## 1. Mapa del proyecto

| Área | Qué es | Stack | Estado |
|---|---|---|---|
| `/` (`index.html`, `assets/`) | Portafolio principal ES/EN, dark/light | HTML + Tailwind compilado + vanilla JS (`i18n.js`, `theme-toggle.js`, `animations.js`) | Producción |
| `/projects/*.html` (4) | Casos de estudio marcados SYNTHETIC | Mismo stack, i18n inline por página | Producción |
| `/studio/` (5 páginas) | Mahuno Studio: rebranding para PyMEs (negocio paralelo) | Tailwind compilado propio + `main.css` raíz; `lab/industrial` usa Tailwind CDN + Leaflet + Chart.js | Placeholder (casos ficticios) |
| ~~`/tracker/`~~ | Eliminado 2026-09-30 (vive en otro repo) | — | — |
| `contact-*.html` | Páginas post-formulario (Formspree) | Tailwind compilado | Producción |
| Infra | GitHub Pages desde `main`, sin CI, sin 404, sin CSP | `package.json` solo compila Tailwind | — |

---

## 2. P0 — Credibilidad frente al CV (decisión tuya en varios)

| # | Hallazgo | Dónde | Esf. | ¿Decisión? |
|---|---|---|---|---|
| ~~2.1~~ ✅ | **Testimonios ficticios visibles en producción** (Ana García/RetailCo, Li Wei, Sofía Ramírez/FinNova). El README asume que la sección se oculta, pero las claves existen y se renderizan. | `assets/js/i18n.js:37-54, 424-441`; render en `index.html:1102-1131` | S | **Sí**: borrar claves (sección se oculta sola) o sustituir por testimonios reales con permiso. **HECHO** (testimonios ficticios retirados; render sin innerHTML) |
| ~~2.2~~ ✅ | **Experiencia no coincide con el CV.** Sitio: un solo rol "Data Consultant Jr." Dic 2021–Presente. CV: "MDM Consultant \| TIBCO EBX Developer" Ago 2023–Presente + "Intern – Data and MDM Consultant" Dic 2021–Ago 2023. | `index.html:437-484`; `i18n.js` claves `exp.r1.*`, `exp.r2.*` | M | No. Alinear al CV. **HECHO** (3 roles con fechas y bullets del CV) |
| ~~2.3~~ ✅ | **PROTECO con fechas erróneas.** Sitio: Ene 2020–Dic 2021. CV: Feb 2021–Feb 2022. Journey `m2` dice 2020. | `index.html:461-463, 686-692` | S | No. **HECHO** (Feb 2021 – Feb 2022) |
| ~~2.4~~ ✅ (datos reales 2026-09-30: 5 años, 5 implementaciones, 5 sectores, 200M registros, PROTECO 10+ cursos de 20–30 alumnos) | **Claims que el CV no respalda** en texto visible: "Fluent in English" (CV: B2), bio ES "especializándome en gobierno de datos para IA", meta description "AI data governance", "6 Enterprise Deliveries", "mentoring 40 junior engineers". | `i18n.js:326, 780, 316, 757`; `index.html:22, 292` | S | **Sí**: confirmar si hay 6 entregas y 40+ alumnos; si no, ajustar. **HECHO** (B2 en bio, sin IA, stat "4 Certifications", sin "40+") |
| ~~2.5~~ ✅ | **150 claves legacy con contenido inventado** en el JS público (Azure ML/MLflow, "$2.5M portfolio", "18% SLA", artículos en Medium, charla DataGov LATAM, repo `ebx-quality-toolkit`, PDF `leadership-automation-guide.pdf` inexistente). No se muestran, pero cualquier reclutador que abra el archivo las ve. 294 claves sin uso en total. | `i18n.js:11-306` y `418-720` | M | No. Purgar bloque v1 completo. **HECHO** (i18n.js purgado: 138 claves, todas usadas) |
| ~~2.6~~ ✅ | **Certificaciones verificadas y enlazadas**: AZ-900 (Certiport, 2020), Google DA (Coursera, 2023), SnapLogic Integrator (Skilljar, ago 2023), Diplomado Desarrollo de Habilidades Directivas (DECDFI-FING UNAM, folio 4283, 2024). Pendiente: agregarlas al CV PDF: Google Data Analytics 2023, SnapLogic Integrator 2022, Diplomado Liderazgo 240 h 2024. El CV solo lista AZ-900. | `index.html:600-636` | S | **Sí**: confirmar cuáles son reales y agregar enlace de verificación (Credly / Coursera). |
| ~~2.7~~ ✅ | **Skills no alineadas.** Sitio agrega Databricks y Spring Boot (no en CV). Faltan del CV: Data Modeling, EBX Workflows, Data Spaces, Datasets, Match & Merge, Data Cleansing, Reference Data Management, Enterprise Data Management. | `index.html:383-421` | S | **Sí** sobre Databricks/Spring Boot. **HECHO** (skills = Key Competencies del CV) |
| ~~2.8~~ ✅ | Caso Observability retirado (no era real). Sustituido por caso **REAL anonimizado**: limpieza y Match & Merge de clientes telecom en 2 países centroamericanos. | `projects/telecom-customer-cleansing.html` | M | Hecho |
| ~~2.9~~ ✅ | Studio: titulares cambiados a "Casos ilustrativos. Método real.", métricas +38%/★4.8 y "tres clientes al mes" retirados. Teléfono se mantiene por decisión de Mario. | `studio/index.html`, `studio/casos/index.html` | S | Hecho |
| ~~2.10~~ ✅ | Journey `m5`: claves definidas dos veces; la versión "2024 AI Enablement" queda muerta. `m4.desc` igual. | `i18n.js:344-352` vs `397-400` | S | No. **HECHO** (duplicados eliminados) |

---

## 3. P0/P1 — Seguridad

| # | Hallazgo | Dónde | Prio | Esf. |
|---|---|---|---|---|
| ~~3.1~~ ✂️ | **XSS almacenado en tracker vía import JSON**: `doImport` no valida esquema; campos (`tipo`, `intensidad`, `reps`, `kg`, `id`, `momento`, `peso`…) van a `innerHTML` sin escapar. | `tracker/index.html:4250-4316`, sinks `2982-3190` | P0 | M |
| ~~3.2~~ ✂️ | **XSS almacenado vía análisis IA pegado**: `focos` y `proximaMedicion.fechaSugerida` se insertan sin escapar y `validateIAResponse` no los revisa. | `tracker/index.html:4097, 4149` | P0 | S |
| ~~3.3~~ ✂️ | **Pérdida de datos**: import sin `version` correcta → en la siguiente carga `loadState` reseedea y borra todo. `replace` no rellena `meta/perfil/objetivos`. | `tracker/index.html:1990, 4344` | P0 | S |
| ~~3.4~~ ✅ | Chart.js desde CDN **sin SRI** ni `crossorigin`, y el SW lo precachea (un CDN comprometido queda persistido). | `tracker/index.html:24`, `tracker/sw.js:29`, `studio/lab/industrial/index.html:48` | P1 | S **HECHO** (Chart.js y Leaflet self-hosted en assets/vendor (sin CDN)) |
| ~~3.5~~ ✅ | Tailwind CDN en producción (no admite SRI, desaconsejado por Tailwind). | `studio/lab/industrial/index.html:25` | P1 | M **HECHO** (industrial compilado con Tailwind (bundle propio industrial.css + @tailwindcss/forms)) |
| ~~3.6~~ ✅ | Sin CSP. GitHub Pages no permite headers, pero sí `<meta http-equiv="Content-Security-Policy">`. | Todos los HTML | P1 | M **HECHO** (CSP por meta en todas las páginas de raíz/projects/404) |
| ~~3.7~~ ✂️ | SW hace `skipWaiting()` en `install`: anula el prompt "Nueva versión" y fuerza recarga. Cache-first ilimitado para cualquier GET incluidos terceros. | `tracker/sw.js:37, 66-75` | P1 | S |
| ~~3.8~~ ✂️ | CSV export sin protección contra inyección de fórmulas (`=`, `+`, `-`, `@`). | `tracker/index.html:4206-4209` | P2 | S |
| ~~3.9~~ ⏸ | Teléfono personal y WhatsApp en claro (`wa.me/525562293691`) — recolectable por bots. El correo ya está en el CV, el teléfono no está en el portafolio principal. | `studio/index.html:596-599` | P1 | **Decisión**: mantener, ofuscar (JS), o solo correo. **DECIDIDO** (Mario mantiene el teléfono público) |
| ~~3.10~~ ✅ | `localStorage.getItem/setItem` sin `try/catch` en todos los scripts de tema: `SecurityError` si el storage está bloqueado (Safari privado, iframes). | `index.html:7`, `studio/*:12`, `industrial:2992` | P2 | S **HECHO** (helpers lsGet/lsSet con try/catch en raíz, theme-toggle.js y subpage.js) |
| ~~3.11~~ ⏸ | Formspree sin CAPTCHA (solo honeypot). 50 envíos/mes: el spam puede agotar la cuota. | `index.html:863` | P2 | S **DESCARTADO** (decisión de Mario 2026-09-30: se queda solo con honeypot) |
| ~~3.12~~ ✅ | Formulario de contacto de la demo industrial simula envío exitoso sin enviar nada; teléfonos/correos inventados pueden pertenecer a terceros reales. | `studio/lab/industrial/index.html:1544-1570, 2038-2066` | P2 | S **HECHO** (aviso "formulario de demostración", toast sin envío, contactos claramente ficticios) |

---

## 4. P1 — Bugs funcionales

| # | Hallazgo | Dónde | Esf. |
|---|---|---|---|
| ~~4.1~~ ✅ | Nav "UI Lab" apunta a `#ui-showcases`, sección que no existe (desktop y móvil). | `index.html:102, 147` | S **HECHO** (enlace UI Lab retirado) |
| ~~4.2~~ ✅ | `<title data-i18n="meta.title">` se sobreescribe a "MAHUNO" al cargar JS; se pierde el título SEO "MAHUNO — Mario Huarte Nolasco". `<meta name="description" data-i18n>` recibe `textContent`, no `content` (sin efecto). | `index.html:19-21`, `i18n.js:4`, `applyI18n` en `index.html:1009` | S **HECHO** (title fijo, meta content) |
| ~~4.3~~ ✅ | Colisiones de claves legacy que cambian el texto visible: `nav.history` → "History" (debería ser "Experience"), `contact.networks.heading` → "Professional networks" (encima de la card LinkedIn), `contact.form.description` reemplaza el copy de contacto, `skills.technical.title` → "Technical Skills" (HTML dice "Core Engineering"). | `index.html:432, 815, 785, 378` | S **HECHO** (claves legacy purgadas) |
| ~~4.4~~ ✅ | `index.html` no autodetecta idioma del navegador (default `en`); las páginas de proyecto sí. Un reclutador mexicano ve inglés. | `index.html:12` vs `projects/*:11` | S **HECHO** (autodetección navigator.language + ?lang= en index) |
| ~~4.5~~ ✅ | Textos sin i18n: "Hire Me", "Skip to main content", frases del typing, "CDMX / Remote", "System Status". | `index.html:124, 76, 1063` | S **HECHO** (hero.status, about.location, hero.typing por idioma) |
| ~~4.6~~ ✅ | Footer "© 2024" en index vs "© 2026" en proyectos. | `index.html:930`, `projects/*` | S **HECHO** (© 2026) |
| ~~4.7~~ ✅ | `<style></style>` vacío en head. | `index.html:83` | S |
| ~~4.8~~ ✅ | Studio: `inset-x: 0` no es CSS válido (es clase Tailwind); el menú móvil no se estira. | `studio/index.html:98`, `lab:65`, `casos:65` | S **HECHO** (`left:0;right:0` vía @layer components; menú ocupa 390/390 px) |
| ~~4.9~~ ✅ | Studio lab: `querySelector(location.hash)` sin try/catch; un hash inválido rompe el script del menú. | `studio/lab/index.html:434-436` | S **HECHO** (try/catch en hash y TOC) |
| ~~4.10~~ ✅ | Industrial: calculadora dice USD pero aplica IVA 16 %; no valida longitud negativa; fórmula ISO 286 aproximada sin aclararlo en UI; tiles OSM con `{s}.` desaconsejado. | `industrial:1730, 2235, 2253, 2663` | M **HECHO** (MXN coherente con IVA, sin negativos, nota ISO 286 didáctica, tiles OSM sin {s}) |
| ~~4.11~~ ✂️ | Tracker: sin guarda `typeof Chart` si falla el CDN → Dashboard roto. `apple-touch-icon` en SVG (iOS no lo soporta, existe el PNG 180). | `tracker/index.html:17, 3460` | S |
| ~~4.12~~ ✂️ | `TRACKER_RECORDS.md` desactualizado (clave, versión, campos, líneas). | `tracker/TRACKER_RECORDS.md` | S |

---

## 5. P1/P2 — Accesibilidad, SEO, rendimiento

| # | Hallazgo | Dónde | Prio | Esf. |
|---|---|---|---|---|
| ~~5.1~~ ✅ | `maximum-scale=1, user-scalable=no` bloquea zoom (WCAG 1.4.4). | `index.html:18`, todas las de `studio/` | P1 | S **HECHO** (zoom permitido) |
| ~~5.2~~ ✅ | Sin `hreflang` ni URL por idioma: Google indexa solo el inglés. Opciones: `?lang=es` + hreflang, o `/es/` estático generado. | `index.html` | P2 | M **HECHO** (hreflang en/es/x-default con ?lang=es) |
| ~~5.3~~ ✅ | JSON-LD Person sin `hasCredential`, `knowsAbout`, `hasOccupation`. Studio sin JSON-LD (Organization/Service) ni `twitter:card`; industrial sin OG ni favicon. | `index.html:52`, `studio/*` | P2 | S **HECHO** (hasOccupation en JSON-LD (Studio: JSON-LD Organization, twitter:card, og y favicon en industrial, webmanifest corregido)) |
| ~~5.4~~ ✅ | Sin `404.html` personalizado. | raíz | P2 | S **HECHO** (404.html bilingüe) |
| ~~5.5~~ ✅ | `sitemap.xml` sin `lastmod`. | `sitemap.xml` | P2 | S **HECHO** (lastmod 2026-09-30) |
| ~~5.6~~ ⏸ | Material Symbols desde Google Fonts (se mantiene: el subset local no cubre los iconos nuevos y self-hostear la fuente completa pesa ~3 MB; decisión: seguir con Google Fonts) en 6 páginas (tercero, sin SRI) aunque existe `assets/fonts/material-symbols-outlined.woff2`. | `index.html:74`, `studio/*` | P2 | M |
| ~~5.7~~ ✅ | `assets/audio/senora.mp3` (712 KB, 5 % del repo) sin ninguna referencia. | `assets/audio/` | P2 | S **HECHO** (senora.mp3 eliminado) |
| ~~5.8~~ ✅ | Contraste límite en Studio: `--c-muted #7a7a72` sobre `#fafaf7` ≈ 4.1:1 en texto de 10–12 px. | `studio/index.html:52-60` | P2 | S **HECHO** (`--c-muted #666660` (5.5:1)) |
| ~~5.9~~ ✅ | Industrial: `<label>` sin `for`, modal sin `role="dialog"`, sin `<main>`, 55 `onclick` inline. | `studio/lab/industrial/index.html:1232, 1453-1498` | P2 | M **HECHO** (labels con for, dialog aria-modal, <main>; los onclick inline se mantienen (55, sin riesgo con CSP)) |
| ~~5.10~~ ✅ | Subpáginas de Studio sin botón de tema; don-peter sin menú móvil. | `studio/lab`, `casos`, `don-peter` | P3 | S **HECHO** (tema en lab/casos/don-peter, hamburguesa en don-peter) |

---

## 6. P2 — Nuevas funcionalidades alineadas al CV

| # | Propuesta | Por qué encaja con el CV | Esf. |
|---|---|---|---|
| ~~6.1~~ ⏸ | **Caso de estudio "Extensiones Java sobre EBX"**: reglas de negocio, validaciones custom, servicio REST, automatización de stewardship. Con fragmentos de código genéricos (sin datos de cliente). | Es el bullet 3 del CV y hoy no hay ningún caso que lo muestre. | M **DESCARTADO** (decisión de Mario: no se preparan páginas de contenido adicionales) |
| ~~6.2~~ ✅ | **Caso "Data Quality en EBX: Match & Merge + Cleansing"** (hecho con el caso real de telecom): reglas de validación, constraints, correcciones, KPIs en Power BI/SQL. | Bullets 2 y 5 del CV. Puede sustituir al caso de Airflow (2.8). | M |
| ~~6.3~~ ⏸ | **Sección "Cómo trabajo un proyecto MDM"** (discovery → modelo → Data Spaces/Datasets → workflows → integración SnapLogic → KPIs). Diagrama SVG inline. | Convierte competencias del CV en narrativa verificable. | M **DESCARTADO** (decisión de Mario) |
| ~~6.4~~ ⏸ | **Demo interactiva "EBX Data Model Explorer"** en JS puro: un modelo multi-dominio de ejemplo (cliente/producto/proveedor) navegable, con reglas de validación en vivo. | Muestra dominio técnico sin exponer NDA. Sustituye al "UI Lab" roto (4.1). | L **DESCARTADO** (decisión de Mario) |
| ~~6.5~~ ✅ | `hasCredential` en JSON-LD + enlaces de verificación en las 4 tarjetas. | Único certificado explícito en el CV. | S |
| ~~6.6~~ ✅ | Sección sectores (ya listados en bio y bullets; falta bloque visual): Retail · Manufactura · Servicios financieros, con 1 línea de qué tipo de dominio maestro se gobernó en cada uno. | Bullet 6 del CV. | S **HECHO** (bloque "Sectores atendidos" en Skills) |
| ~~6.7~~ ✅ | Descarga de CV con versión ES y EN, y `lastUpdated` visible. PDF actualizado 2026-09-30 (solo EN). | Coherencia con el sitio bilingüe. | S **HECHO** (CV ES (PDF+DOCX); el botón del hero elige según idioma) |
| ~~6.8~~ ⏸ | Blog técnico mínimo (Markdown → HTML con GitHub Actions o Jekyll nativo de Pages): notas sobre EBX, SnapLogic, MDM. | Sustituye a los "insights" ficticios con contenido real. **Decisión**: ¿tienes tiempo de escribir? | L **DESCARTADO** (decisión de Mario: no habrá blog) |
| ~~6.9~~ ✂️ | Tracker: mostrar aviso "el prompt envía datos de salud a un LLM externo" y permitir excluir la nota libre. | Higiene de privacidad. | S |

---

## 7. P2/P3 — Deuda técnica e infraestructura

| # | Propuesta | Esf. |
|---|---|---|
| ~~7.1~~ ✅ | **CI en GitHub Actions**: `html-validate`, `lychee` (enlaces rotos), Lighthouse CI (a11y ≥ 90), `npm run build:css:all` y fallo si `tailwind.css` compilado difiere del commit. | M **HECHO** (ci.yml: i18n-check, check-links, html-validate, build CSS sin diff) |
| ~~7.2~~ ✅ | Purgar `i18n.js`: dejar solo claves usadas; script `node scripts/i18n-check.js` que falle en CI si hay claves usadas sin definir o definidas sin usar. | M **HECHO** (scripts/i18n-check.js en CI) |
| ~~7.3~~ ✂️ | Tracker: separar `index.html` en `app.css` + módulos JS (`storage`, `render`, `ia`, `import`); tests con Vitest + jsdom para `calcBodyFat`, `calcCalorias`, `validateIAResponse`, `doImport`, migraciones. | L |
| ~~7.4~~ ✅ | Studio: mover tokens `--c-*`, botones, cards y nav a `tailwind-input.css` con `@layer components`; un solo `menu.js` compartido. Migrar industrial al CSS compilado. | M **HECHO** (tokens y componentes en tailwind-input.css @layer, studio.js compartido; Studio ya no carga main.css de la raíz (corrige .btn-primary azul)) |
| ~~7.5~~ ✅ | Unificar el motor i18n de `projects/*.html` (4 copias inline) con `assets/js/i18n.js`. | M **HECHO** (assets/js/subpage.js compartido por projects/*, contact-* ) |
| ~~7.6~~ ✅ | README: quitar referencias a números de línea (se desactualizan en cada commit) y documentar `BACKLOG.md`. | S **HECHO** (README sin números de línea; documenta CI, vendor y subpage.js) |
| ~~7.7~~ ✅ | `security.txt` (`/.well-known/security.txt`) con contacto. | S **HECHO** (.well-known/security.txt) |
| ~~7.8~~ ✅ | Dependabot para `tailwindcss` en `package.json`. | S **HECHO** (.github/dependabot.yml) |

---

## 8. Decisiones que necesito de ti (resumen)

1. ~~Testimonios (2.1)~~ Retirados. Pendiente: recabar reales con consentimiento.
2. ~~Certificaciones (2.6)~~ Confirmadas reales. Pendiente: agregarlas al CV PDF y enlaces de verificación (Credly/Coursera).
3. ~~Números (2.4)~~ Sustituidos por datos del CV (stat "4 Certifications", sin "40+").
4. ~~Skills (2.7)~~ Databricks y Spring Boot retirados; skills = Key Competencies del CV.
5. ~~Caso Observability (2.8)~~ Reemplazado por caso real de telecom (6.2 cubierto).
6. ~~Studio (2.9, 3.9)~~ Se mantiene enlazado, casos etiquetados como ilustrativos, teléfono público se conserva (decisión de Mario).
7. ~~Tracker~~ Eliminado del repo el 2026-09-30 por decisión de Mario (lo mantiene mejor construido en otro lugar). Los ítems ✂️ dejan de aplicar.
8. ~~Blog (6.8)~~ Descartado.
9. ~~CV PDF~~ ✅ Regenerado el 2026-09-30 (PDF + DOCX en `assets/docs/`, fuentes en `scripts/`). Detalle histórico: Actualizar: años de experiencia (dice 4, sitio 5), educación 2017–2024 (título y cédula 2024), sección Certifications (4), sectores (agregar farmacéutico y telecomunicaciones), dominios (cliente, empleado, ubicaciones), integraciones (Oracle, PostgreSQL, SQL Server, AWS), volumen 200M. Subir PDF nuevo a `assets/docs/`.

---

## 9. Estado final (2026-09-30)

Todo lo aplicable está hecho (✅), descartado por decisión (⏸) o fuera de alcance por la eliminación del tracker (✂️). No quedan ítems abiertos.

## 9b. Orden que se siguió

1. Sprint 1 (P0, ~1 día): 2.1, 2.2, 2.3, 2.4, 2.5, 2.10, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1.
2. Sprint 2 (P1, ~1 día): 3.4–3.7, 4.4–4.9, 7.1, 7.2.
3. Sprint 3 (nuevo contenido): 6.1, 6.2, 6.3, 6.5, 6.6, 6.7.
4. Después: 6.4, 7.3, 7.4, 5.2.
