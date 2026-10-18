const V='aura-v1';
const F=['./','index.html','app.js','aura-demolition.js','manifest.webmanifest','icon-192.png','icon-512.png',
'fonts/black-ops-one.woff2','fonts/rajdhani.woff2','vendor/three.min.js','vendor/CopyShader.js',
'vendor/LuminosityHighPassShader.js','vendor/EffectComposer.js','vendor/RenderPass.js','vendor/ShaderPass.js','vendor/UnrealBloomPass.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
