const CACHE='hotpot-seat-shell-v2';
const SHELL=[
  '/',
  '/client/styles.css',
  '/client/app.js',
  '/client/auth.js',
  '/client/realtime.js',
  '/client/workflows.js',
  '/data/remote-repository.js',
  '/domain/scheduler.js',
  '/domain/tables.js',
  '/domain/commands.js',
  '/shared/contracts.js',
  '/manifest.webmanifest',
  '/icon.svg'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==location.origin||url.pathname.startsWith('/api/')||url.pathname==='/ws')return;
  event.respondWith(
    fetch(event.request)
      .then(async response=>{
        if(response.ok){
          const cache=await caches.open(CACHE);
          await cache.put(event.request,response.clone());
        }
        return response;
      })
      .catch(async error=>{
        const cached=await caches.match(event.request);
        if(cached)return cached;
        throw error;
      })
  );
});
