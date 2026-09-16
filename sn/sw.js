/*
 * Caches the shell — the wrapper page and its icons — so the app opens
 * instantly and shows its own splash even on a poor connection.
 *
 * The Apps Script app inside the frame is always fetched live. It has to be:
 * attendance and payments must never come from a stale cache.
 */
const SHELL = 'sn-int-shell-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== SHELL; })
                             .map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);

  // Anything not on this site — the Apps Script app included — goes straight
  // to the network, never the cache.
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request);
    })
  );
});
