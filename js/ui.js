/* UI core: router, HUD/tabs, shared components, effects. */
K.ui = (function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const I = () => K.art.icons;
  const fmt = n => n.toLocaleString('he-IL');

  const screen = $('#screen'), hud = $('#hud'), tabs = $('#tabs'), overlay = $('#overlay');
  let cleanup = null, current = null;

  /* ---------- router ---------- */
  const routes = {};
  function route(name, def) { routes[name] = def; }
  function go(path, replace) {
    const target = '#/' + path;
    if (location.hash === target) { render(); return; }
    if (replace) location.replace(target); else location.hash = target;
  }
  function parse() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    return { name: parts[0] || '', args: parts.slice(1) };
  }
  function render() {
    const st = K.store.state;
    let { name, args } = parse();
    if (!st.onboarded && !['welcome', 'choose', 'story'].includes(name)) name = 'welcome';
    if (st.onboarded && !routes[name]) name = 'map';
    if (!routes[name]) name = 'welcome';
    const def = routes[name];
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    closeSheet();
    document.body.dataset.screen = name;
    document.body.dataset.chrome = def.chrome || 'none';
    hud.hidden = def.chrome !== 'tabs'; tabs.hidden = def.chrome !== 'tabs';
    screen.className = 'screen enter';
    screen.innerHTML = '';
    current = name;
    if (def.chrome === 'tabs') { updateHud(); updateTabs(name); }
    const res = def.render(screen, ...args);
    if (typeof res === 'function') cleanup = res;
    window.scrollTo(0, 0);
    screen.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', render);

  /* ---------- HUD & tabs ---------- */
  function updateHud() {
    const st = K.store.state, c = K.CHARACTERS[st.char] || K.CHARACTERS.bear, streak = K.store.streakNow();
    hud.innerHTML = `
      <button class="hud-avatar" id="hudChar" aria-label="הדמות שלי: ${c.name}">${avatar(c.id)}</button>
      <div class="hud-title"><b>${st.name ? '<span class="hi">שלום </span>' + esc(st.name) + '<span class="hi">!</span>' : 'עומר והממלכה הקסומה'}</b><small>${c.name} איתך במסע</small></div>
      <div class="hud-stats">
        <span class="stat" title="רצף ימים" aria-label="רצף של ${streak} ימים">${I().flame}<b>${streak}</b></span>
        <span class="stat" id="hudCoins" title="מטבעות" aria-label="${st.coins} מטבעות">${I().coin}<b>${fmt(st.coins)}</b></span>
        <button class="icon-btn" id="hudSound" aria-label="${st.settings.sound ? 'השתקת צלילים' : 'הפעלת צלילים'}" aria-pressed="${!st.settings.sound}">${st.settings.sound ? I().sound : I().mute}</button>
        <button class="icon-btn" id="hudParent" aria-label="פינת ההורים">${I().gear}</button>
      </div>`;
    $('#hudSound').onclick = () => { st.settings.sound = !st.settings.sound; K.store.save(); K.audio.unlock(); if (st.settings.sound) K.audio.play('pop'); updateHud(); };
    $('#hudParent').onclick = () => { K.audio.play('tap'); K.parent.gate(); };
    $('#hudChar').onclick = () => { K.audio.play('pop'); go('home'); };
  }
  function updateTabs(active) {
    const T = [['map', 'מפה', I().map], ['explorer', 'לוח הכפל', I().grid], ['intro', 'מה זה כפל?', I().book], ['home', 'הבית שלי', I().home]];
    tabs.innerHTML = T.map(([id, label, ic]) => `<a href="#/${id}" class="tab${active === id ? ' on' : ''}" ${active === id ? 'aria-current="page"' : ''}>${ic}<span>${label}</span></a>`).join('');
    $$('.tab', tabs).forEach(a => a.addEventListener('click', () => K.audio.play('tap')));
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const avatar = id => K.art.char(id, 'happy').replace('viewBox="0 0 200 230"', 'viewBox="24 4 152 152"');

  /* ---------- sheet (modal) ---------- */
  let sheetEl = null, sheetClose = null;
  function sheet(html, { onClose, cls = '' } = {}) {
    closeSheet();
    const el = h(`<div class="sheet-wrap"><div class="sheet-back"></div><div class="sheet ${cls}" role="dialog" aria-modal="true"><button class="sheet-x icon-btn" aria-label="סגירה">${I().close}</button><div class="sheet-body">${html}</div></div></div>`);
    overlay.appendChild(el); sheetEl = el; sheetClose = onClose;
    requestAnimationFrame(() => el.classList.add('show'));
    const close = () => closeSheet();
    $('.sheet-back', el).onclick = close; $('.sheet-x', el).onclick = close;
    const first = $('.sheet button.btn, .sheet input', el); if (first) first.focus({ preventScroll: true });
    return { el: $('.sheet-body', el), close };
  }
  function closeSheet() {
    if (!sheetEl) return;
    const el = sheetEl, cb = sheetClose; sheetEl = null; sheetClose = null;
    el.classList.remove('show'); setTimeout(() => el.remove(), 250);
    if (cb) cb();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  /* ---------- toast & live region ---------- */
  let toastT;
  function toast(msg) {
    let t = $('#toast'); if (!t) { t = h('<div id="toast" role="status"></div>'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }
  const say = msg => { $('#live').textContent = ''; setTimeout(() => $('#live').textContent = msg, 50); };

  /* ---------- dot arrays ---------- */
  function arrayHTML(rows, cols, o = {}) {
    const { animate = true, split = null, cls = '', interactive = false, delay = 90, dotDelay = 12 } = o;
    let out = `<div class="arr ${cls}${animate ? ' anim' : ''}" style="--rows:${rows};--cols:${cols}" role="img" aria-label="${rows} שורות, ${cols} עיגולים בכל שורה">`;
    for (let r = 0; r < rows; r++) {
      const c = split == null ? 'c' + (r % 6) : (r < split ? 'sa' : 'sb');
      out += `<${interactive ? 'button type="button"' : 'div'} class="arr-row ${c}" data-r="${r}" style="--rd:${r * delay}ms" ${interactive ? `aria-label="שורה ${r + 1}"` : ''}>`;
      for (let k = 0; k < cols; k++) out += `<i class="dot" style="--dd:${r * delay + k * dotDelay}ms"></i>`;
      out += `</${interactive ? 'button' : 'div'}>`;
    }
    return out + '</div>';
  }
  /* explanation: dot array + skip counting + equation (used on wrong answers & hints) */
  function explainHTML(a, b, { showAnswer = true } = {}) {
    const chips = Array.from({ length: a }, (_, i) => `<span class="chip-n" style="--i:${i}">${(i + 1) * b}</span>`).join('<span class="chip-sep">‹</span>');
    return `<div class="explain">
      ${arrayHTML(a, b, { cls: 'arr-sm' })}
      <div class="skip" dir="ltr" aria-label="ספירה בקפיצות של ${b}">${chips}</div>
      <p class="explain-t">${a} שורות, ובכל שורה ${b}. סופרים בקפיצות של ${b}, ${a} פעמים.</p>
      ${showAnswer ? `<div class="eq big" dir="ltr"><span>${a}</span><span>×</span><span>${b}</span><span>=</span><b>${a * b}</b></div>` : ''}
    </div>`;
  }
  function tickExplain(root) {
    // plays soft ticking sounds in sync with rows appearing
    const rows = $$('.arr-row', root);
    rows.forEach((_, i) => setTimeout(() => K.audio.play('dot', i), 90 * i + 60));
  }

  /* ---------- effects ---------- */
  const cv = $('#fx'), cx = cv.getContext('2d'); let parts = [], raf = 0;
  function sizeCv() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
  addEventListener('resize', sizeCv); sizeCv();
  const COLORS = ['#ff6fae', '#ffc41f', '#4db3ff', '#3fc8a0', '#9a6bff', '#ff8f3d'];
  function confetti({ x = innerWidth / 2, y = innerHeight / 3, count = 70, power = 1, stars = false } = {}) {
    if (reduced()) count = Math.min(count, 12);
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2, sp = (4 + Math.random() * 9) * power;
      parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 5 * power, g: .28, r: 4 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - .5) * .4, c: COLORS[i % 6], life: 70 + Math.random() * 40, star: stars && i % 3 === 0 });
    }
    if (!raf) raf = requestAnimationFrame(tickFx);
  }
  function tickFx() {
    cx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life > 0);
    for (const p of parts) {
      p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = Math.min(1, p.life / 30); cx.fillStyle = p.c;
      if (p.star) { cx.beginPath(); for (let i = 0; i < 5; i++) { cx.lineTo(Math.cos(i * 1.2566 - 1.57) * p.r * 1.6, Math.sin(i * 1.2566 - 1.57) * p.r * 1.6); cx.lineTo(Math.cos(i * 1.2566 - 1.57 + .628) * p.r * .7, Math.sin(i * 1.2566 - 1.57 + .628) * p.r * .7); } cx.fill(); }
      else cx.fillRect(-p.r / 2, -p.r / 3, p.r, p.r * .66);
      cx.restore();
    }
    raf = parts.length ? requestAnimationFrame(tickFx) : 0;
  }
  function burstAt(el, o) { const r = el.getBoundingClientRect(); confetti(Object.assign({ x: r.left + r.width / 2, y: r.top + r.height / 2, count: 36, power: .7 }, o)); }

  /* count-up number */
  function countUp(el, to, dur = 900, fmtFn = x => x) {
    if (reduced()) { el.textContent = fmtFn(to); return; }
    const t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / dur); el.textContent = fmtFn(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  const starsRow = (n, max = 3, cls = '') => Array.from({ length: max }, (_, i) => `<span class="star ${i < n ? 'on' : 'off'} ${cls}" style="--i:${i}">${i < n ? I().star : I().starOff}</span>`).join('');
  const bubble = (txt, cls = '') => `<div class="bubble ${cls}">${txt}</div>`;
  const eqHTML = (a, b, r, cls = '') => `<div class="eq ${cls}" dir="ltr"><span>${a}</span><span>×</span><span>${b}</span><span>=</span><b>${r}</b></div>`;
  const tap = (el, fn) => el.addEventListener('click', e => { K.audio.unlock(); fn(e); });

  return { $, $$, h, sleep, reduced, go, route, render, sheet, closeSheet, toast, say, arrayHTML, explainHTML, tickExplain, confetti, burstAt, countUp, starsRow, bubble, eqHTML, esc, avatar, updateHud, fmt, tap, get current() { return current; } };
})();
