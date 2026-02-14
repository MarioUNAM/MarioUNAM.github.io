# San Valentín (sitio estático puro)

Este proyecto está diseñado para funcionar como **HTML/CSS/JS estático**, sin backend y sin proceso de build.

## Verificación rápida de estático puro

- **Rutas relativas:** `sanvalentin/index.html` carga `css/styles.css`, `js/main.js` y `assets/music.mp3` con rutas relativas (sin `/` absoluto ni URLs remotas).  
- **Sin backend:** no hay llamadas `fetch`, `XMLHttpRequest` ni APIs de servidor en `sanvalentin/js/**`.  
- **Sin build:** no existe `package.json` ni scripts de compilación para esta carpeta; se ejecuta directo en navegador.  
- **Sin dependencias externas obligatorias:** no usa CDN ni librerías remotas; todo vive dentro de `sanvalentin/`.

> Nota: el audio es opcional para la experiencia principal. Si `assets/music.mp3` no existe, la animación y carta siguen funcionando.

## Cómo abrir localmente

### Opción 1: doble clic (rápido)
1. Abre `sanvalentin/index.html` en tu navegador.
2. Si el navegador bloquea módulos por política local, usa la opción 2.

### Opción 2: servidor estático local (recomendado)
Desde la raíz del repo:

```bash
python3 -m http.server 8080
```

Luego abre:

```text
http://localhost:8080/sanvalentin/
```

No necesitas instalar nada adicional.

## Estructura del proyecto

```text
sanvalentin/
├── index.html                # Estructura principal (intro, escena, carta, audio)
├── css/
│   └── styles.css            # Estilos, layout y animaciones CSS
├── assets/
│   ├── cursor-heart.svg      # Cursor temático
│   └── heart-main.svg        # Recurso gráfico del corazón
├── js/
│   ├── main.js               # Bootstrap y ensamblado de módulos
│   ├── core/
│   │   ├── observer.js       # Event bus (publish/subscribe)
│   │   ├── orchestrator.js   # Registro y ciclo de vida de módulos
│   │   └── stateMachine.js   # Máquina de estados y transiciones válidas
│   ├── modules/
│   │   ├── animations.js     # Timeline principal + typewriter + controles intro
│   │   ├── tree.js           # Árbol SVG procedural
│   │   ├── particles.js      # Partículas/hojas
│   │   ├── counter.js        # Contador "tiempo juntos"
│   │   └── audio.js          # Música de fondo y botón play/pause
│   └── utils/
│       ├── dom.js            # Helpers DOM seguros
│       ├── liveResources.js  # Registro y cleanup de listeners/raf
│       ├── math.js           # Utilidades matemáticas
│       ├── raf.js            # requestAnimationFrame helpers
│       └── timing.js         # Utilidades de timing
└── README.md
```

## Mapa de estados

Estados definidos en `js/core/stateMachine.js`:

```text
INIT
  -> HEART_IDLE
      -> HEART_TO_SEED
          -> SEED_FALL
              -> TREE_GROW
                  -> TREE_FULL
                      -> LETTER_VIEW
```

- `INIT`: app recién cargada.
- `HEART_IDLE`: esperando clic en el corazón o acción de "Saltar".
- `HEART_TO_SEED`: morph visual corazón → semilla.
- `SEED_FALL`: caída de semilla.
- `TREE_GROW`: crecimiento inicial del árbol.
- `TREE_FULL`: árbol consolidado antes del reveal final.
- `LETTER_VIEW`: carta visible + contador activo.

## Eventos observer

Eventos de ciclo de vida (en `js/core/observer.js`):

- `state:changed`
  - Emitido por la state machine cuando una transición es válida.
  - Payload típico: `{ from, to, payload }`.
- `app:reset`
  - Emitido al reiniciar la app o limpiar módulos.
- `animation:start`
  - Emitido al iniciar secuencias de animación (intro o cambios de estado).
- `animation:end`
  - Emitido al terminar secuencias de animación.

Uso típico:

- `animations.js` escucha `state:changed` para activar typewriter cuando llega a `LETTER_VIEW`.
- `counter.js` escucha `state:changed` para iniciar/detener contador según estado.
- módulos registran cleanups para evitar fugas de listeners/RAF al reiniciar.

## Cómo cambiar contenido (texto, fecha, canción)

### 1) Cambiar textos principales
Archivo: `sanvalentin/index.html`

- Título de carta: `<h2>Para ti, con amor</h2>`.
- Texto typewriter: atributo `data-typewriter-text` en `<p data-role="typewriter" ...>`.
- Dedicatoria fija: `<p data-role="dedication">...</p>`.

Ejemplo:

```html
<p
  data-role="typewriter"
  data-typewriter-text="Tu nuevo mensaje romántico aquí 💖"
></p>
```

### 2) Cambiar fecha del contador

Hay dos lugares recomendados:

1. **Visual (encabezado de la tarjeta):**
   - En `sanvalentin/index.html`, cambia el `<h3>` dentro de `data-role="counter-card"`.

2. **Cálculo real del contador:**
   - En `sanvalentin/js/modules/counter.js`, modifica `DEFAULT_INITIAL_DATE`.

Ejemplo:

```js
const DEFAULT_INITIAL_DATE = '2020-02-14T00:00:00';
```

> Usa formato ISO (`YYYY-MM-DDTHH:mm:ss`) para evitar problemas de zona horaria.

### 3) Cambiar canción

Archivo: `sanvalentin/index.html`, bloque:

```html
<audio id="bg-music" preload="metadata">
  <source src="assets/music.mp3" type="audio/mpeg" />
</audio>
```

Pasos:

1. Copia tu audio dentro de `sanvalentin/assets/` (por ejemplo `mi-cancion.mp3`).
2. Cambia el `src` del `<source>`:

```html
<source src="assets/mi-cancion.mp3" type="audio/mpeg" />
```

Opcional:

- Ajusta volumen base en `sanvalentin/js/modules/audio.js` con `baseVolume` (default `0.35`).

## Definition of Done (pruebas manuales)

1. **Layout final:** carta a la izquierda + árbol a la derecha dentro de la misma tarjeta.
2. **Contador visible:** aparece abajo y dentro de la tarjeta.
3. **Sin botón “Saltar”:** no existe en la UI.
4. **Sin lista explicativa:** no existe lista de explicación en la interfaz final.
5. **Reinicio consistente:** reiniciar 5 veces con “Revivir animación” y confirmar que el árbol siempre nace en el mismo `impactX/groundY` del impacto.
6. **Sin desbordes visuales:** no hay elementos fuera de contenedores ni saltos de layout.
7. **Compatibilidad GitHub Pages:** uso de rutas relativas y ausencia total de backend.
