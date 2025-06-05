const CACHE_NAME = 'avvoca-v1';
const urlsToCache = [
  '/',
  '/style.css',
  '/script.js',
  '/assets/logo-avvoca.jpeg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});