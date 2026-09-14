var C = 'emoliya-v2';

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(function(c){
    return Promise.all(['./', './index.html', './E-MOLIYA.html', './manifest.json'].map(function(u){
      return c.add(u).catch(function(){});
    }));
  }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ return k===C ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function(r){
    return r || fetch(e.request).then(function(res){
      var cp = res.clone();
      caches.open(C).then(function(c){ c.put(e.request, cp); });
      return res;
    }).catch(function(){ return caches.match('./'); });
  }));
});
