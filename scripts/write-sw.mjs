import { readdir, writeFile } from 'node:fs/promises';
const files = (await readdir('dist/assets')).map((name) => `/assets/${name}`);
const precache = ['/', '/index.html', '/hero-diorama.webp', '/manifest.webmanifest', '/favicon.svg', '/icon-192.svg', '/icon-512.svg', ...files];
const source = `const C='dose-compass-v1';const P=${JSON.stringify(precache)};self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(P)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.mode==='navigate'){e.respondWith(caches.match('/index.html').then(r=>r||fetch(e.request)));return}e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const copy=x.clone();caches.open(C).then(c=>c.put(e.request,copy));return x})))})`;
await writeFile('dist/sw.js', source);
