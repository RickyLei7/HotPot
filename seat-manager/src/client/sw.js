const CACHE='hotpot-seat-shell-v1';
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
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
  );
});

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==location.origin||url.pathname.startsWith('/api/')||url.pathname==='/ws')return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
