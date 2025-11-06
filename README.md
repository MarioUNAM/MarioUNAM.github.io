# Portafolio de Mario Huarte Nolasco

Este repositorio aloja el código fuente del sitio web personal de Mario Huarte Nolasco. El objetivo es mostrar proyectos de automatización, análisis de datos y business intelligence en un portafolio que pueda consultarse públicamente mediante GitHub Pages.

## Tecnologías utilizadas

La página principal (`index.html`) está construida con HTML5, CSS3 y JavaScript, apoyándose en las siguientes librerías y recursos estáticos:

- [Bootstrap](https://getbootstrap.com/) para la estructura responsiva y componentes base (`assets/css/bootstrap.min.css`, `assets/js/bootstrap.min.js`).
- [jQuery](https://jquery.com/) como dependencia de Bootstrap y scripts personalizados (`assets/js/jquery.min.js`).
- [Font Awesome](https://fontawesome.com/) para iconografía (`assets/css/font-awesome.min.css`).
- Plugins adicionales como `slick`, `bootstrap-progressbar`, `jquery.shuffle`, `jquery.countTo`, `jquery.easing` y `touchSwipe` para animaciones, carruseles y efectos interactivos (`assets/js/`).
- Fuentes web servidas desde Google Fonts (`Open Sans`, `Varela`).

Las carpetas `template1/`, `template2/` y `template3/` conservan variaciones o plantillas de referencia que también hacen uso de Bootstrap, jQuery y recursos específicos documentados en cada subdirectorio.

## Estructura del proyecto

```text
.
├── index.html            # Página principal del portafolio
├── assets/               # Recursos compartidos por la página principal
│   ├── css/              # Hojas de estilo (Bootstrap, Font Awesome, estilos personalizados)
│   ├── js/               # Bibliotecas y scripts personalizados
│   ├── img/              # Imágenes utilizadas en secciones y modales
│   ├── fonts/            # Tipografías locales utilizadas por los estilos
│   └── audio/            # Recursos de audio (si se requieren en el futuro)
├── CartaMama/            # Proyecto individual con su propia página estática
├── pythoncodes/          # Scripts auxiliares en Python
├── template1/            # Plantilla de referencia con sus assets propios
├── template2/            # Segunda plantilla de referencia
└── template3/            # Tercera plantilla de referencia
```

### Personalización de contenidos

- **Secciones principales:** Edita `index.html` para actualizar textos, secciones de experiencia y enlaces. Cada bloque está etiquetado con comentarios HTML descriptivos.
- **Llamado a la acción principal:** Dentro del bloque `.hero-content` de `index.html` puedes personalizar el botón con clase `btn btn-inverted` para apuntar a tu CV en PDF, LinkedIn u otro perfil profesional.
- **Currículum descargable:** Coloca tu CV en PDF dentro de `assets/docs/` (el repositorio incluye `assets/docs/Mario-Huarte-CV.pdf` como ejemplo) y ajusta el texto o enlace del botón secundario “Download résumé” en `.hero-content` si cambias el nombre del archivo.
- **Bloque de highlights:** La sección `#highlights` agrega tarjetas con métricas, certificaciones y reconocimientos. Ajusta títulos y textos en `index.html` y, si necesitas modificar espaciados o colores, utiliza las clases `.section-highlights` y `.highlight-card` definidas en `assets/css/style.css`.
- **Datos de contacto:** Dentro de la sección `#contact` de `index.html` encontrarás tres tarjetas con correo, redes profesionales y ubicación. Edita los textos y enlaces (`mailto`, LinkedIn, WhatsApp y Google Maps) según tus necesidades y, si requieres cambios visuales, ajusta las clases `.contact-card*` en `assets/css/style.css`.
- **Galería y modales:** Las tarjetas del portafolio se definen alrededor de la línea 360 de `index.html` y se enlazan con modales `#portfolioItem1` a `#portfolioItem4` definidos al final del archivo. Para añadir un nuevo proyecto, duplica una tarjeta, crea un modal con un identificador único y actualiza el contenido (título, descripción, imágenes y enlaces).
- **Imágenes y multimedia:** Coloca imágenes en `assets/img/` y actualiza las rutas dentro de `index.html` o los modales correspondientes. Para mantener el desempeño, optimiza las imágenes antes de subirlas.
- **Dimensiones sugeridas de imágenes:**

  | Uso | Selector / Clase | Dimensiones recomendadas | Relación de aspecto | Notas |
  | --- | --- | --- | --- | --- |
  | Avatar de perfil | `.big-rectangle` | 230 × 230 px | 1:1 | Se recorta centrado gracias a `object-fit: cover`; prepara el archivo cuadrado para evitar deformaciones. |
  | Logo de cronología | `.timeline-body-thumb` | 100 × 100 px | 1:1 | Mantén fondos transparentes cuando sea posible para integrarse con la línea de tiempo. |
  | Miniatura de portafolio | `.portfolio-item-thumb` | ≥ 300 × 250 px | ~6:5 | Ajusta la composición pensando en el recorte centrado por `object-fit: cover`. |
  | Miniatura de insights | `.insight-thumb-image` | 480 × 320 px (SVG recomendado) | 3:2 | Exporta ilustraciones o capturas en SVG optimizado (<100 KB) para asegurar nitidez y carga rápida en la cuadrícula de insights. |
  | Imagen de cabecera en modal | (imagen principal del modal) | ≥ 1200 × 400 px | ≥ 3:1 | Asegura una altura efectiva de 400 px para evitar pixelado y aprovecha el recorte central. |

- **Buenas prácticas para imágenes:**
  - Comprueba que el peso del archivo sea razonable: <200 KB para miniaturas y logotipos, y <400 KB para imágenes de modales o cabeceras amplias.
  - Prioriza formatos óptimos según el contenido: PNG para gráficos con transparencia, JPEG para fotografías y WebP cuando sea soportado para reducir peso.
  - Sigue una convención clara de nombres en `assets/img/`, por ejemplo `seccion-descriptivo-tipo.ext` (`portfolio-analitica-thumb.jpg`, `timeline-empresa-logo.png`) para facilitar el mantenimiento.
  - Después de reemplazar imágenes, revisa el sitio tanto en vista de escritorio como en dispositivos móviles para confirmar que el recorte centrado se muestra correctamente.
- **Estilos personalizados:** Ajusta los estilos en `assets/css/style.css` (u otras hojas dentro de `assets/css/`). Si la modificación requiere JavaScript, utiliza `assets/js/script.js` para mantener la lógica centralizada.
- **Plantillas alternativas:** Las carpetas `template1/`, `template2/` y `template3/` contienen versiones completas de plantillas descargadas. Consulta los archivos `README.txt`, `READ-ME.txt` o `LICENSE.txt` en cada una para respetar sus términos antes de reutilizar elementos en la página principal.

## Ejecución local

El sitio es completamente estático. Puedes revisarlo localmente de dos maneras:

1. **Abrir directamente el archivo:** haz doble clic en `index.html` o ábrelo con tu navegador preferido.
2. **Servirlo con un servidor simple:** desde la raíz del repositorio ejecuta
   ```bash
   python3 -m http.server 8000
   ```
   Luego visita <http://localhost:8000> en tu navegador.

## Publicación con GitHub Pages

1. Asegúrate de que los cambios estén confirmados y enviados al repositorio `MarioUNAM/MarioUNAM.github.io` en la rama `main`.
2. En la configuración del repositorio en GitHub, activa GitHub Pages apuntando a la rama `main` (carpeta `/`).
3. Tras cada push, GitHub Pages desplegará automáticamente la versión más reciente. El sitio quedará disponible en `https://mariounam.github.io/`.

## Actualizaciones y mantenimiento

- **Agregar nuevos proyectos:** duplica las secciones correspondientes en `index.html` y actualiza las imágenes en `assets/img/`.
- **Actualizar dependencias:** si deseas cambiar versiones de Bootstrap, jQuery u otros plugins, reemplaza los archivos dentro de `assets/` y prueba el sitio localmente.
- **Scripts adicionales:** coloca nuevos scripts en `assets/js/` y enlázalos en la sección `<head>` o antes del cierre de `</body>` de `index.html`.
- **Contenido de plantillas:** para mantener historial y créditos, conserva los archivos `LICENSE.txt` y `README` incluidos en las carpetas de plantillas.

## Recomendaciones de accesibilidad

- **Navegación por teclado mejorada:** incorporar un enlace de “Saltar al contenido”, revisar el orden de tabulación en modales y asegurar que todos los controles visibles reciben un estilo `:focus-visible` coherente para usuarios que navegan sin ratón.
- **Modo de alto contraste:** ofrecer un selector de contraste independiente (o integrado con el cambio de idioma) que incremente la relación de contraste de textos y elementos interactivos, además de documentar los colores alternativos en `assets/css/style.css` para futuros mantenimientos.

## Créditos y licencias

- Los recursos de terceros (Bootstrap, jQuery, Font Awesome, Slick, etc.) mantienen sus respectivas licencias. Consulta la documentación oficial de cada proyecto para detalles de uso.
- Las carpetas `template1/`, `template2/` y `template3/` incluyen licencias o notas (`LICENSE.txt`, `README.txt`) provenientes de los autores originales. Revísalas antes de redistribuir o modificar sus activos.
- El contenido propio (textos, imágenes personalizadas y proyectos) está sujeto a los derechos de Mario Huarte Nolasco.

## Buenas prácticas de edición

- Verifica los resultados en un navegador y en dispositivos móviles después de cada cambio.
- Usa commits descriptivos y revisa que el archivo `README.md` se visualice correctamente en GitHub (encabezados con `#`, listas con `-` o numeradas, y bloques de código con triple acento grave).
- Para reportar issues o proponer mejoras, utiliza el sistema de issues de GitHub.

