const CACHE_NAME = 'vipananam-2026-10-07-calm';
const ASSETS = ['./manifest.json','./favicon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('sw.js')) return;
  const opts = (e.request.mode === 'navigate') ? { cache: 'no-store' } : {};
  e.respondWith(
    fetch(e.request, opts).then(resp => {
      if (resp && resp.status === 200) {
        const cl = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, cl));
      }
      return resp;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
