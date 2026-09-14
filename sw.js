var C = 'tohir-finance-v2';
var SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(function(c){
    return Promise.all(SHELL.map(function(u){
      return c.add(new Request(u, {cache: 'reload'})).catch(function(){});
    }));
  }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ return k === C ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

function isDoc(req){
  if(req.mode === 'navigate') return true;
  var a = req.headers.get('accept') || '';
  return a.indexOf('text/html') >= 0;
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;

  if(isDoc(req)){
    e.respondWith(
      fetch(req).then(function(res){
        var cp = res.clone();
        caches.open(C).then(function(c){ c.put(req, cp); });
        return res;
      }).catch(function(){
        return caches.match(req).then(function(r){
          if(r) return r;
          return caches.match('./index.html').then(function(r2){
            return r2 || caches.match('./');
          });
        });
      })
    );
    return;
  }

  e.respondWith(caches.match(req).then(function(r){
    return r || fetch(req).then(function(res){
      var cp = res.clone();
      caches.open(C).then(function(c){ c.put(req, cp); });
      return res;
    }).catch(function(){ return caches.match('./'); });
  }));
});
