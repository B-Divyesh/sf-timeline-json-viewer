const VERSION = 'field-atlas-v1.0.2';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/atlas.svg',
  '/icons/atlas-192.png',
  '/icons/atlas-512.png',
  '/icons/atlas-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(PRECACHE);
    const response = await fetch('/index.html');
    const html = await response.clone().text();
    await cache.put('/index.html', response);
    const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
    await cache.addAll(builtAssets);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL, RUNTIME].includes(key)).map((key) => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/online-check.txt') {
    event.respondWith(fetch(event.request).catch(() => new Response('offline', {
      headers: { 'Content-Type': 'text/plain', 'X-Field-Atlas-Connection': 'offline' }
    })));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(caches.match('/index.html').then((cached) => cached || fetch(event.request).catch(() => caches.match('/offline.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(RUNTIME).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
