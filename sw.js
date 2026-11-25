/* Offline-first service worker. Bump VERSION when any asset changes. */
const VERSION = 'kefel-v2.7.1';
const ASSETS = [
  './', 'index.html', 'manifest.json',
  'css/base.css', 'css/components.css', 'css/screens.css', 'css/extra.css', 'css/geo.css', 'css/english.css', 'css/math-exam.css', 'css/calm.css',
  'js/data.js', 'js/geo-data.js', 'js/store.js', 'js/audio.js', 'js/engine.js', 'js/geo-engine.js', 'js/mission.js', 'js/art.js', 'js/geo-art.js', 'js/ui.js', 'js/screens.js', 'js/subjects.js', 'js/hub.js',
  'js/lesson.js', 'js/practice.js', 'js/games.js', 'js/explorer.js', 'js/intro.js', 'js/parent.js',
  'js/geo-screens.js', 'js/geo-lesson.js', 'js/geo-practice.js', 'js/speech.js', 'js/english-data.js', 'js/english.js', 'js/mx-gen.js', 'js/mx-art.js', 'js/math-exam.js', 'js/worksheet.js', 'js/app.js',
  'data/exams/index.json', 'data/exams/english-2026-11-30.json', 'data/exams/math-geo-2026-12-20.json', 'data/exams/math-2026-12-20/ws/page-1.webp', 'data/exams/math-2026-12-20/ws/page-2.webp', 'data/exams/math-2026-12-20/ws/page-3.webp', 'data/exams/math-2026-12-20/ws/page-4.webp', 'data/exams/math-2026-12-20/ws/page-5.webp', 'data/exams/math-2026-12-20/ws/page-6.webp',
  'fonts/rubik-hebrew-wght-normal.woff2', 'fonts/rubik-latin-wght-normal.woff2',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'
];
self.addEventListener('install', e => {
  // cache:'reload' bypasses the browser HTTP cache so a new VERSION never stores stale files
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
// network-first for the app shell + data (so a new deploy is seen right away), cache-first for versioned assets
const NETWORK_FIRST = /(\/|index\.html|sw\.js|manifest\.json|\.json)$/;
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate' || NETWORK_FIRST.test(url.pathname)) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req.mode === 'navigate' ? 'index.html' : req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => Response.error()))
  );
});
