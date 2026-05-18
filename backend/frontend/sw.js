const CACHE = 'life-services-v4';
const ASSETS = [
  '/',
  '/assets/css/design-system.css',
  '/assets/css/components.css',
  '/assets/js/core/config.js',
  '/assets/js/core/toast.js',
  '/assets/js/core/theme.js',
  '/assets/js/core/api.js',
  '/manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS).catch(function () { /* offline parcial */ });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/auth') ||
      url.pathname.startsWith('/ordens') ||
      url.pathname.startsWith('/clientes') ||
      url.pathname.startsWith('/socket.io')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      const fetchPromise = fetch(event.request).then(function (response) {
        if (response && response.status === 200 && url.origin === location.origin) {
          const clone = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(event.request, clone); });
        }
        return response;
      }).catch(function () { return cached; });

      return cached || fetchPromise;
    })
  );
});

self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : { title: 'Life Services', body: 'Nova atualização' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Life Services', {
      body: data.body || '',
      icon: '/assets/icons/icon.svg',
      badge: '/assets/icons/icon.svg'
    })
  );
});
