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
