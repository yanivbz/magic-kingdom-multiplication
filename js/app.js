/* Boot: first route, service worker, install prompt. */
(function () {
  const st = K.store.state;
  if (!location.hash || location.hash === '#') location.replace(st.onboarded ? '#/map' : '#/welcome');
  K.ui.render();
  document.addEventListener('pointerdown', () => K.audio.unlock(), { once: true });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW', e)));
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
