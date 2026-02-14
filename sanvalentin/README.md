# Checklist de pulido

- [ ] Balance visual entre texto y árbol.
- [ ] Consistencia de colores en todos los corazones.
- [ ] Fluidez sin tirones en móvil gama media.
- [ ] Legibilidad del contador en pantallas pequeñas.
- [ ] Música no invasiva y fácil de pausar.
- [ ] Contraste y foco accesible.
- [ ] Carga rápida (assets optimizados).

## Pruebas manuales de continuidad visual

1. Abrir `sanvalentin/index.html` y pulsar el corazón para iniciar la secuencia.
2. Verificar que al pasar de árbol a carta ocurre un desplazamiento horizontal del contenedor principal (`translateX`), sin parpadeos ni desmontaje de elementos previos.
3. Confirmar que durante el reveal se mantiene el mismo contexto visual: fondo degradado, suelo y árbol visibles/consistentes.
4. Confirmar continuidad del árbol: misma forma, proporción y posición relativa durante transición y estado final.
5. Confirmar continuidad de lluvia de hojas/corazones: no se reinicia abruptamente y sigue saliendo del área del árbol al enfocarse la carta.
6. Pulsar “↺ Repetir animación” y validar que la continuidad se repite correctamente en un segundo ciclo.

## Cambiar canción romántica

- **Archivo de audio recomendado:** coloca tu pista en `sanvalentin/assets/audio/cancion-romantica.mp3` (o `.ogg` como alternativa).
- **Dónde se define la fuente en JS:** el reproductor se toma con `const backgroundMusic = document.querySelector("#bg-music");` en `sanvalentin/app.js` y luego carga la ruta desde `backgroundMusic.dataset.src` dentro de `ensureBackgroundMusicSource()`.
- **Formatos y volumen sugeridos:** usa `.mp3` para compatibilidad principal y agrega versión `.ogg` como respaldo cuando sea posible. Mantén un volumen base cercano a `0.2` (constante `DEFAULT_MUSIC_VOLUME`) para que la música acompañe sin tapar efectos/lectura.
- **Reemplazo sin romper autoplay por interacción:**
  1. Cambia el `data-src` del `<audio id="bg-music">` en `sanvalentin/index.html` para apuntar a tu archivo (por ejemplo `./assets/audio/cancion-romantica.mp3`).
  2. Conserva `preload="none"` y la inicialización por gesto (`registerMusicGesture()`), así la reproducción sigue iniciando sólo después de interacción del usuario y evita bloqueos del navegador.

## Máquina de estados (secuencia obligatoria)

La animación principal usa esta secuencia exacta:

`idle` → `heart_to_seed_fast` → `seed_fall` → `fractal_grow_slow` → `canopy_fill_fast` → `tree_scaleup_fast` → `tree_move_right_normal` → `leaves_fall_slow` → `letter_visible`.

### Orden de ejecución y duración objetivo

| Estado | Duración objetivo | Disparador de transición |
| --- | --- | --- |
| `heart_to_seed_fast` | ~760ms | `transitionend` de `transform` en `.heart` y `#ground`. |
| `seed_fall` | ~1240ms | `animationend` de `heart-fall` en `#heart-button`. |
| `fractal_grow_slow` | ~1320ms | `animationend` de `tree-grow` en `#love-tree`. |
| `canopy_fill_fast` | ~220–520ms | `animationend` de `canopy-heart-rise` en cada `.canopy-heart`. |
| `tree_scaleup_fast` | ~220ms | Promesa de timeline Web Animations API (`animation.finished`). |
| `tree_move_right_normal` | ~760ms | `transitionend` de `transform` en `.scene-track`. |
| `leaves_fall_slow` | ~1320ms | Promesa de timeline Web Animations API (`animation.finished`). |
| `letter_visible` | inmediato | Estado final (sin transición saliente). |

### Notas de ajuste rápido

- Duraciones JS: `PHASE_TIMEOUTS_MS` y `TIMELINE_DURATIONS_MS` en `sanvalentin/app.js`.
- Duraciones CSS: `--t-phase-morph`, `--t-phase-fall`, `--t-phase-tree`, `--t-fast`, `--t-medium` en `sanvalentin/styles.css`.
- Para mantener consistencia, cualquier cambio de duración debe ajustar **estilo + espera de evento/promesa** en la misma fase.
