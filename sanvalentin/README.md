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
