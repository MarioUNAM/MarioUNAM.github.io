/* ============================================================
   Service Worker · Tracker PWA
   ------------------------------------------------------------
   Estrategia: cache-first para los assets propios,
   network-first con fallback a cache para el resto.
   Sube CACHE_VERSION cuando publiques cambios para invalidar.
   ============================================================ */
const CACHE_VERSION = "tracker-v8";

// Permite al cliente forzar la activación del SW nuevo cuando
// el usuario aprueba el prompt "Recargar" del tracker.
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Respuesta offline genérica para cuando ni la red ni el cache responden.
// Para HTML devolvemos una página mínima; para otros recursos un 504.
const OFFLINE_HTML = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<title>Sin conexión · Tracker</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,sans-serif;background:#0b0c0f;color:#e8eaed;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center}h1{font-size:24px;margin:0 0 12px}p{color:#8b909a;line-height:1.5;max-width:400px}a{color:#10b981;text-decoration:none;border-bottom:1px solid #10b981;padding-bottom:2px}</style>
</head><body><div><h1>Sin conexión</h1><p>No hay red ni copia en caché de esta página. Tus datos locales (localStorage) están seguros.</p><p><a href="./tracker.html">Reintentar</a></p></div></body></html>`;
const CORE_ASSETS = [
  "./tracker.html",
  "./manifest.json",
  "./assets/img/tracker-icon.svg",
  "./assets/fonts/inter-variable.woff2",
  "./assets/fonts/jetbrains-mono-variable.woff2",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c =>
      // addAll falla por completo si una URL falla — usamos add() individuales
      Promise.all(CORE_ASSETS.map(url => c.add(url).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  // Navegación: network-first → cache de tracker.html → página offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() =>
        caches.match("./tracker.html").then(hit =>
          hit || new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })
        )
      )
    );
    return;
  }

  // Recursos: cache-first → network → cachear → fallback explícito.
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        // Sólo cacheamos respuestas básicas/cors válidas
        if (res && res.status === 200 && (res.type === "basic" || res.type === "cors")) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => {
        // Sin red Y sin cache: respuesta vacía controlada para no romper.
        // Para imágenes devolvemos un SVG transparente 1x1; para otros, 504.
        const accept = req.headers.get("accept") || "";
        if (accept.includes("image")) {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
            { headers: { "Content-Type": "image/svg+xml" } }
          );
        }
        return new Response("Offline · resource unavailable", {
          status: 504, headers: { "Content-Type": "text/plain" }
        });
      });
    })
  );
});
