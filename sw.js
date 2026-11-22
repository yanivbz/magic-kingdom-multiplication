/* Offline-first service worker. Bump VERSION when any asset changes. */
const VERSION = 'kefel-v2.4.2';
const ASSETS = [
  './', 'index.html', 'manifest.json',
  'css/base.css', 'css/components.css', 'css/screens.css', 'css/extra.css', 'css/geo.css', 'css/english.css', 'css/math-exam.css',
  'js/data.js', 'js/geo-data.js', 'js/store.js', 'js/audio.js', 'js/engine.js', 'js/geo-engine.js', 'js/mission.js', 'js/art.js', 'js/geo-art.js', 'js/ui.js', 'js/screens.js', 'js/subjects.js', 'js/hub.js',
  'js/lesson.js', 'js/practice.js', 'js/games.js', 'js/explorer.js', 'js/intro.js', 'js/parent.js',
  'js/geo-screens.js', 'js/geo-lesson.js', 'js/geo-practice.js', 'js/speech.js', 'js/english-data.js', 'js/english.js', 'js/mx-gen.js', 'js/mx-art.js', 'js/math-exam.js', 'js/app.js',
  'data/exams/index.json', 'data/exams/english-2026-11-30.json', 'data/exams/math-geo-2026-12-20.json',
  'fonts/rubik-hebrew-wght-normal.woff2', 'fonts/rubik-latin-wght-normal.woff2',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
  );
});
