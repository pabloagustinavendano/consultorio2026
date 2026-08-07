const C = 'roma2026-v1';
self.addEventListener('install', e => { self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html']))); });
self.addEventListener('activate', e => { e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))
    .then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if(e.request.method !== 'GET') return;
  if(u.hostname === 'api.open-meteo.com') return;      // el clima siempre a la red
  if(e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).then(r => {
      const cp = r.clone(); caches.open(C).then(c => c.put('./index.html', cp)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if(res.ok && u.origin === location.origin){
      const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp));
    }
    return res;
  }).catch(() => r)));
});
