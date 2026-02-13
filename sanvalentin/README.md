# Checklist manual de aceptación

Usa esta lista para validar manualmente el flujo completo de la experiencia en `sanvalentin/` antes de aprobar cambios.

## Criterios

- [ ] **Inicio muestra corazón + texto centrado.**
- [ ] **Click inicia morph, caída y suelo sin saltos.**
- [ ] **Al tocar suelo aparece árbol completo.**
- [ ] **Se revela bloque de poema con typewriter.**
- [ ] **Contador calendario (años/meses/días/horas/minutos) actualizado cada minuto desde fecha configurable.**
- [ ] **Corazones-partícula continúan en loop.**
- [ ] **Comportamiento correcto en móvil y desktop.**
- [ ] **`prefers-reduced-motion` reduce animaciones.**
- [ ] **Interacción accesible por teclado y lector de pantalla.**


## Zona horaria del contador

- El contador usa **hora local del navegador** de forma consistente.
- `START_DATE` se interpreta en local al estar definido sin sufijo `Z` (ej. `2016-09-09T00:00:00`).
- El cálculo es de calendario (años, meses, días, horas y minutos), no una aproximación por segundos totales.
