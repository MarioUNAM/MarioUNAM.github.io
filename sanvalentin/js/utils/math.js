export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Número aleatorio dentro de un rango.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const randomRange = (min, max) => Math.random() * (max - min) + min;

/**
 * Lerp lineal entre a y b.
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Suavizado cúbico (ease-in-out).
 * @param {number} t
 * @returns {number}
 */
export const smoothstep = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/**
 * Ease-in cúbica.
 * @param {number} t
 * @returns {number}
 */
export const easeInCubic = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * x;
};

/**
 * Ease-out cúbica.
 * @param {number} t
 * @returns {number}
 */
export const easeOutCubic = (t) => {
  const x = clamp(t, 0, 1);
  const y = 1 - x;
  return 1 - y * y * y;
};

/**
 * Ease-in-out cúbica.
 * @param {number} t
 * @returns {number}
 */
export const easeInOutCubic = (t) => {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/**
 * Crea un vector 2D mutable.
 * Preferir reusar instancias en loops críticos.
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @returns {{x:number,y:number}}
 */
export const vec2 = (x = 0, y = 0) => ({ x, y });

/** @param {{x:number,y:number}} out @param {number} x @param {number} y */
export const vec2Set = (out, x, y) => {
  out.x = x;
  out.y = y;
  return out;
};

/** @param {{x:number,y:number}} out @param {{x:number,y:number}} a @param {{x:number,y:number}} b */
export const vec2Add = (out, a, b) => {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  return out;
};

/** @param {{x:number,y:number}} out @param {{x:number,y:number}} a @param {{x:number,y:number}} b */
export const vec2Sub = (out, a, b) => {
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  return out;
};

/** @param {{x:number,y:number}} out @param {{x:number,y:number}} v @param {number} scalar */
export const vec2Scale = (out, v, scalar) => {
  out.x = v.x * scalar;
  out.y = v.y * scalar;
  return out;
};

/** @param {{x:number,y:number}} a @param {{x:number,y:number}} b */
export const vec2Dot = (a, b) => a.x * b.x + a.y * b.y;

/** @param {{x:number,y:number}} v */
export const vec2Length = (v) => Math.hypot(v.x, v.y);

/** @param {{x:number,y:number}} out @param {{x:number,y:number}} v */
export const vec2Normalize = (out, v) => {
  const len = Math.hypot(v.x, v.y);
  if (len === 0) {
    out.x = 0;
    out.y = 0;
    return out;
  }

  const inv = 1 / len;
  out.x = v.x * inv;
  out.y = v.y * inv;
  return out;
};

/**
 * Integra gravedad simple para partículas/hojas en una simulación Euler.
 * Muta posición y velocidad in-place para evitar asignaciones por frame.
 * @param {{x:number,y:number}} position
 * @param {{x:number,y:number}} velocity
 * @param {{x:number,y:number}} [gravity]
 * @param {number} [deltaTime=1]
 * @param {number} [drag=0]
 */
export const applySimpleGravity = (
  position,
  velocity,
  gravity = DEFAULT_GRAVITY,
  deltaTime = 1,
  drag = 0
) => {
  const dt = Math.max(0, deltaTime);
  const damping = drag > 0 ? Math.max(0, 1 - drag * dt) : 1;

  velocity.x = (velocity.x + gravity.x * dt) * damping;
  velocity.y = (velocity.y + gravity.y * dt) * damping;

  position.x += velocity.x * dt;
  position.y += velocity.y * dt;

  return position;
};

export const DEFAULT_GRAVITY = Object.freeze({ x: 0, y: 9.8 });
