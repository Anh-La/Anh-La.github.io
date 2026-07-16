/* Finance & Family — service worker
   Strategy:
   - HTML pages (navigations): network-first, falling back to cache, falling back to index.html.
   - Same-origin static assets (icons, manifest): cache-first.
   - Cross-origin assets (Google Fonts, etc.): stale-while-revalidate.
   Bump CACHE_VERSION whenever the precached app-shell files change, so old
   caches are cleaned up and users pick up the new version automatically. */

const CACHE_VERSION = 'v2';
const APP_SHELL_CACHE = `ff-app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ff-runtime-${CACHE_VERSION}`;

// NOTE: do NOT include './' (the bare directory URL) here. cache.addAll()
// is atomic — if any single entry 404s, the whole install step throws and
// the service worker is discarded, meaning it never activates. Many static
// hosts don't serve a 200 for a bare folder path, so that entry was
// silently breaking installation. Only list files that are guaranteed to
// resolve directly.
const APP_SHELL_FILES = [
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
      .then((cache) =>
        // Cache each file individually (instead of addAll) so one bad
        // entry can't take down the whole install step — log and continue.
        Promise.all(
          APP_SHELL_FILES.map((url) =>
            cache.add(url).catch((err) =>
              console.warn(`[sw] failed to precache ${url}:`, err)
            )
          )
        )
      )
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

  // Only cache genuinely good, same-origin, non-redirected responses.
  // This stops a transient 404/500/redirect from ever getting stored and
  // replayed as the "cached" version of a page.
  const isCacheable = (response) =>
    response && response.ok && response.type === 'basic' && !response.redirected;

  // 1) Page navigations — network-first, cache fallback, offline shell fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isCacheable(response)) {
            const copy = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              caches.match('./index.html').then(
                (shell) =>
                  shell ||
                  new Response(
                    '<h1>Offline</h1><p>This page has not been cached yet — please reconnect once to load it.</p>',
                    { status: 503, headers: { 'Content-Type': 'text/html' } }
                  )
              )
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
          if (isCacheable(response)) {
            const copy = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
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
