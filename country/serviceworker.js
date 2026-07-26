/* Service worker for the Financial Programming Framework PWA.
   -------------------------------------------------------------
   Scope note: this file may sit in a directory alongside OTHER,
   unrelated self-contained apps (e.g. family.html, wealth-builder.html).
   To guarantee this never interferes with them, the fetch handler
   below only ever intercepts requests for THIS app's own known
   assets (the app shell) or its two approved CDN origins (Google
   Fonts, jsDelivr for Chart.js). Everything else is left completely
   untouched and simply falls through to a normal network request. */

const CACHE_NAME = 'fpf-shell-v1';

// This app's own files, resolved relative to this script's own location.
const APP_SHELL = [
  './nation-state.html',
  './nation-state-manifest.json',
  './nation-state-icons/icon-192.png',
  './nation-state-icons/icon-512.png',
  './nation-state-icons/icon-maskable-512.png',
  './nation-state-icons/apple-touch-icon.png',
  './nation-state-icons/favicon-32.png',
  './nation-state-icons/favicon-16.png',
];

// Exact CDN URLs the page depends on — precached individually (not with
// addAll) so a transient failure fetching one of them can't abort install.
const RUNTIME_PRECACHE = [
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Manrope:wght@300;400;500;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js',
];

// Any request to one of these origins gets stale-while-revalidate caching;
// anything else cross-origin is left alone entirely.
const RUNTIME_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.jsdelivr.net',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL); // same-origin — should always succeed
    await Promise.all(RUNTIME_PRECACHE.map(url =>
      fetch(url, { mode: 'cors' }).then(res => cache.put(url, res)).catch(() => {})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

function isAppShellRequest(pathname) {
  return APP_SHELL.some(p => pathname.endsWith(p.replace('./', '/')));
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return; // never intercept writes

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isRuntimeCdn = RUNTIME_ORIGINS.includes(url.origin);

  // Not one of ours — leave it completely alone (no caching, no response
  // override) so sibling apps and any other resource load normally.
  if (!sameOrigin && !isRuntimeCdn) return;
  if (sameOrigin && !isAppShellRequest(url.pathname)) return;

  if (sameOrigin) {
    // App shell: cache-first, refresh cache in the background from network.
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const network = fetch(req).then(res => {
        caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })());
  } else {
    // Approved CDN assets (fonts, Chart.js): stale-while-revalidate.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const network = fetch(req).then(res => {
        cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    })());
  }
});
