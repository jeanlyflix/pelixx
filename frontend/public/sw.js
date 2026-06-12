/* JANLYFLIX Service Worker — minimal, safe offline caching */
const CACHE = 'jly-v1';
const CORE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Skip non-http(s), DevTools, Chrome extensions, and analytics
  if (!/^https?:$/.test(url.protocol)) return;
  if (url.hostname.includes('posthog')) return;
  if (url.hostname.includes('emergent.sh')) return;

  // Network-first for TMDB and our backend API
  if (url.hostname.includes('themoviedb.org') ||
      url.hostname.includes('tmdb.org')       ||
      url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Stale-while-revalidate for images & static
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(()=>{});
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
