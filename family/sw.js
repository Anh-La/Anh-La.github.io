/* Finance & Family — service worker
   Strategy:
   - HTML pages (navigations): network-first, falling back to cache, falling back to index.html.
   - Same-origin static assets (icons, manifest): cache-first.
   - Cross-origin assets (Google Fonts, etc.): stale-while-revalidate.
   Bump CACHE_VERSION whenever the precached app-shell files change, so old
   caches are cleaned up and users pick up the new version automatically. */

const CACHE_VERSION = 'v1';
const APP_SHELL_CACHE = `ff-app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ff-runtime-${CACHE_VERSION}`;

const APP_SHELL_FILES = [
  './',
  './index.html',
  './en.html',
  './vi.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // 1) Page navigations — network-first, cache fallback, offline shell fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match('./index.html')
          )
        )
    );
    return;
  }

  // 2) Same-origin static assets — cache-first, network fallback + fill cache.
  if (isSameOrigin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  // 3) Cross-origin (Google Fonts, etc.) — stale-while-revalidate.
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    )
  );
});
