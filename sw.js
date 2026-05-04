/* ============================================================
   Service Worker · Tracker PWA
   ------------------------------------------------------------
   Estrategia: cache-first para los assets propios,
   network-first con fallback a cache para el resto.
   Sube CACHE_VERSION cuando publiques cambios para invalidar.
   ============================================================ */
const CACHE_VERSION = "tracker-v2";
const CORE_ASSETS = [
  "./tracker.html",
  "./manifest.json",
  "./assets/img/tracker-icon.svg",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
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

  // Para navegación: network-first → cache fallback
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("./tracker.html"))
    );
    return;
  }

  // Para todo lo demás: cache-first → network → cachear
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
      }).catch(() => hit);
    })
  );
});
