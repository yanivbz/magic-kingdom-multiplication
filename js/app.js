/* Boot: first route, service worker, install prompt. */
(function () {
  const st = K.store.state;
  // App launch ALWAYS opens the home hub (never a restored kefel page — iOS/Android may relaunch
  // with the last or installed URL hash). Deep links/reloads inside the same session keep their route.
  let warm = false;
  try { warm = sessionStorage.getItem('kefel.session') === '1'; sessionStorage.setItem('kefel.session', '1'); } catch (e) { /* private mode: treat as cold */ }
  if (!warm || !location.hash || location.hash === '#') location.replace(st.onboarded ? '#/hub' : '#/welcome');
  K.ui.render();
  document.addEventListener('pointerdown', () => K.audio.unlock(), { once: true });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    // robust update: always check for a new sw on load and when the app comes back to the foreground;
    // the new sw skips waiting + claims clients, and we reload ONCE on controllerchange (progress lives in
    // localStorage and is never touched by the cache swap).
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return;              // first install: nothing stale to replace
      let last = 0; try { last = +sessionStorage.getItem('kefel.swReload') || 0; } catch (e) { /* ignore */ }
      if (Date.now() - last < 15000) return;               // loop guard
      reloaded = true;
      try { sessionStorage.setItem('kefel.swReload', String(Date.now())); } catch (e) { /* ignore */ }
      location.reload();
    });
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
      const check = () => reg.update().catch(() => {});
      check();
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
      if (reg.waiting) reg.waiting.postMessage('skipWaiting');
      reg.addEventListener('updatefound', () => { const w = reg.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) w.postMessage('skipWaiting'); }); });
    }).catch(e => console.warn('SW', e)));
  }

  // install pill (Chrome/Edge/Android); iOS/Safari users get a hint in the parent corner text
  let deferred = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferred = e;
    if (standalone() || sessionStorage.getItem('kefel.noinstall')) return;
    const pill = K.ui.h(`<div class="install-pill"><button class="btn btn-secondary" id="inst">📲 התקנת המשחק</button><button class="icon-btn" aria-label="סגירה" id="instx">${K.art.icons.close}</button></div>`);
    document.body.appendChild(pill);
    K.ui.$('#inst', pill).onclick = async () => { pill.remove(); deferred.prompt(); await deferred.userChoice; deferred = null; };
    K.ui.$('#instx', pill).onclick = () => { pill.remove(); sessionStorage.setItem('kefel.noinstall', '1'); };
  });
  window.addEventListener('appinstalled', () => { const p = K.ui.$('.install-pill'); if (p) p.remove(); });
})();
