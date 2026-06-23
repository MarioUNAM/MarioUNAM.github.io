# Tracker PWA — Sistema de Registros

Documentación técnica del sistema de registros de `tracker.html`.  
Audiencia: desarrolladores que extiendan o mantengan la app.

---

## 1. Visión general

El tracker es una **PWA offline-first** de una sola página (`tracker.html`) sin backend.
Todo el estado persiste en **`localStorage`** bajo la clave `tracker_state` como JSON.
No hay base de datos ni servidor; toda la lógica de cálculo, visualización y exportación corre en el navegador.

---

## 2. Flujo de registro

```
Usuario rellena formulario
        │
        ▼
FormData → objeto JS (buildRecord)
        │
        ▼
state.ejercicios.push(record)     ← array en memoria
        │
        ▼
saveState()                       ← JSON.stringify → localStorage['tracker_state']
        │
        ▼
renderLists()  +  renderDashboard()   ← actualiza DOM
```

Los tres formularios de captura son:

| Formulario | Sección HTML | Datos capturados |
|---|---|---|
| `#form-ejercicio` | "Registrar Ejercicio" | Tipo, nombre, dificultad, series/cardio/flex, notas, tags |
| `#form-medicion` | "Mediciones Corporales" | Peso, cuello, cintura, cadera + cálculo automático de %grasa |
| `#form-comida` | "Registro Alimentario" | Momento del día, alimentos, calorías estimadas |

---

## 3. Modelo de datos — `localStorage['tracker_state']`

### 3.1 Estructura raíz

```json
{
  "version": 2,
  "perfil": { ... },
  "objetivos": { ... },
  "ejercicios": [ ... ],
  "mediciones": [ ... ],
  "comidas": [ ... ]
}
```

### 3.2 `perfil`

```typescript
interface Perfil {
  sexo:      "hombre" | "mujer";
  altura:    number;          // cm
  edad:      number | null;
  actividad: "sedentario" | "ligero" | "moderado" | "activo" | "muy_activo";
  objetivo:  "deficit" | "mantener" | "volumen";
}
```

### 3.3 `objetivos`

```typescript
interface Objetivos {
  kcalDiarias?: number;       // override manual de calorías TDEE
}
```

### 3.4 `ejercicios[]` — el tipo central de este documento

Cada sesión de ejercicio es un objeto con los campos comunes más los específicos del tipo:

#### Campos comunes (todos los tipos)

```typescript
interface EjercicioBase {
  id:         string;         // uid() — clave primaria (timestamp + random)
  fecha:      string;         // "YYYY-MM-DD" (ISO 8601, hora local)
  tipo:       "fuerza" | "cardio" | "flexibilidad";
  nombre:     string;         // texto libre, ej. "Sentadilla con barra"
  intensidad: 1 | 2 | 3 | 4 | 5;  // Escala de DIFICULTAD (ver §4)
  notas?:     string;         // texto libre, opcional
  tags?:      string[];       // ej. ["piernas", "compuesto"]
}
```

#### Tipo "fuerza" — ejercicio con series

```typescript
interface EjercicioFuerza extends EjercicioBase {
  tipo:      "fuerza";
  series:    Array<{ reps: number; kg: number }>;  // máx. 10 series
  // Variante isométrica (plancha, etc.)
  isIsometrico?:    true;
  isometricoSegs?:  number;    // segundos por serie
  isometricoSeries?: number;   // número de series
}
```

#### Tipo "cardio"

```typescript
interface EjercicioCardio extends EjercicioBase {
  tipo:       "cardio";
  minutos:    number;           // duración total
  pendiente?: number;           // inclinación %, opcional
  velocidades?: Array<{
    kmh:  number;               // velocidad km/h
    mins: number;               // duración en minutos
  }>;
  bpm?: number;                 // frecuencia cardiaca promedio, opcional
}
```

#### Tipo "flexibilidad"

```typescript
interface EjercicioFlex extends EjercicioBase {
  tipo:        "flexibilidad";
  flexMinutos: number;          // duración de la sesión
  flexSeries:  number;          // número de bloques/series
}
```

### 3.5 `mediciones[]`

```typescript
interface Medicion {
  id:         string;         // uid()
  fecha:      string;         // "YYYY-MM-DD"
  peso:       number;         // kg
  cuello:     number;         // cm
  cintura:    number;         // cm
  cadera:     number;         // cm
  grasa:      number;         // % calculado (fórmula Navy)
  nota?:      string;
}
```

### 3.6 `comidas[]`

```typescript
interface Comida {
  id:        string;          // uid()
  fecha:     string;          // "YYYY-MM-DD"
  momento:   "desayuno" | "almuerzo" | "comida" | "cena" | "snack";
  alimentos: string;          // texto libre
  kcal?:     number;          // calorías estimadas, opcional
  notas?:    string;
}
```

---

## 4. Escala de Dificultad

El campo `intensidad` almacena un entero del **1 al 5** que representa la dificultad percibida de la sesión.

| Valor | Etiqueta | Descripción orientativa |
|:-----:|----------|------------------------|
| **1** | Muy fácil | Calentamiento, movilidad ligera, recuperación activa |
| **2** | Fácil | Sesión de bajo esfuerzo, técnica sin carga real |
| **3** | Moderado | Esfuerzo sostenible, sesión estándar de entrenamiento |
| **4** | Difícil | Esfuerzo alto, cercanía al fallo muscular o ritmo elevado |
| **5** | Muy difícil | Límite de capacidad, PR, sesión de alta intensidad |

### Dónde se usa

| Punto de uso | Archivo | Comportamiento |
|---|---|---|
| Slider de captura | `tracker.html:1487` | Rango `min=1 max=5 step=1`, muestra `n/5 · etiqueta` |
| `syncIntensidad()` | `tracker.html:2482` | Actualiza label y CSS `--val` para colorear el track |
| Badge de alerta | `tracker.html:2922` | Muestra chip `warn` cuando `intensidad === 5` |
| Metadato de tarjeta | `tracker.html:2996` | Muestra `dif n/5` en cada registro del historial |
| Gráfica de línea | `tracker.html:3522` | Eje Y de 0 a 5, una serie por sesión |
| Dashboard insight | `tracker.html:3772` | Insight positivo si la media sube respecto a la semana anterior |
| Resumen IA semanal | `tracker.html:3943` | Línea `Dificultad: n/5 ▲/▼/→` |
| Export CSV | `tracker.html:4215` | Columna `dificultad` (valor entero 1–5) |

### Retrocompatibilidad

Los registros guardados con la escala 1–10 anterior (valores > 5) seguirán siendo válidos — el badge de alerta solo se activa con `>= 5`, y las gráficas escalan de 0 a 5 (valores mayores quedarán fuera del rango visible pero no causarán errores). Para migrar datos legacy, ejecutar en consola:

```js
const s = JSON.parse(localStorage.tracker_state);
s.ejercicios.forEach(e => {
  if (e.intensidad > 5) e.intensidad = Math.round(e.intensidad / 2);
});
localStorage.tracker_state = JSON.stringify(s);
location.reload();
```

---

## 5. Persistencia y formato de clave

```
localStorage key : "tracker_state"
Serialización    : JSON.stringify(state)
Versión actual   : state.version = 2
```

`saveState()` se llama después de **cada mutación** del estado (guardar, editar, borrar).  
No hay debounce — la escritura es síncrona y atómica desde el punto de vista del hilo principal.

---

## 6. Exportación de datos

El botón "Exportar CSV" genera **tres archivos independientes**:

| Archivo | Columnas | Notas |
|---|---|---|
| `ejercicios-YYYY-MM-DD.csv` | `fecha, tipo, nombre, dificultad, detalle, notas` | `detalle` serializa series / velocidades en texto |
| `mediciones-YYYY-MM-DD.csv` | `fecha, peso_kg, cuello_cm, cintura_cm, cadera_cm, grasa_pct, masa_magra_kg, nota` | |
| `comidas-YYYY-MM-DD.csv` | `fecha, momento, alimentos, kcal, notas` | |

---

## 7. Métricas derivadas por semana (`weekMetrics`)

La función `weekMetrics(weekStart)` calcula sobre el slice semanal:

```typescript
interface WeekMetrics {
  sesionesTotales:  number;
  minutosCardio:    number;
  volumenFuerza:    number;   // kg totales (reps × kg × series)
  intensidadProm:   number;   // promedio del campo `intensidad` (1–5)
  diasEntrenados:   number;
  consistencia:     number;   // (diasEntrenados / 7) × 100
  distribucion:     { fuerza: number; cardio: number; flexibilidad: number };
  // peso / grasa / masa magra al inicio y fin de la semana
}
```

`intensidadProm` es el único campo de resumen directamente derivado del campo `intensidad` de cada ejercicio.

---

## 8. Service Worker y caché

El SW (`sw.js`) usa `CACHE_VERSION = "tracker-v7"`.  
**Incrementar** este valor cada vez que se modifique `tracker.html`, `sw.js`, o cualquier asset referenciado en la lista de precaché.

---

## 9. Comandos útiles para desarrollo

```bash
# Servidor local
python -m http.server 8080

# Smoke-test de todos los bloques <script> inline
node -e "const fs=require('fs');const html=fs.readFileSync('tracker.html','utf8');const re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;let m,ok=0;while((m=re.exec(html))){new Function(m[1]);ok++;}console.log('ok:',ok);"

# Migrar datos legacy (escala 1-10 → 1-5) desde la consola del navegador
const s = JSON.parse(localStorage.tracker_state);
s.ejercicios.forEach(e => { if (e.intensidad > 5) e.intensidad = Math.round(e.intensidad / 2); });
localStorage.tracker_state = JSON.stringify(s); location.reload();
```

---

*Última actualización: 2026-06-22 · Escala de dificultad migrada de 1–10 a 1–5.*
