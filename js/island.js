/* Illustrated 2.5D island home hub. Coordinates are in 720×1280 image space. */
K.island = (function () {
  const IW = 720, IH = 1280;
  const START = { x: 39.2, y: 76.2 };
  const PATHS = {
    kefel:    [START, { x: 37.8, y: 68.0 }, { x: 37.2, y: 62.0 }, { x: 40.0, y: 53.2 }, { x: 37.8, y: 46.2 }, { x: 33.2, y: 40.6 }],
    shapes:   [START, { x: 37.8, y: 68.0 }, { x: 37.2, y: 62.0 }, { x: 41.0, y: 52.0 }, { x: 52.0, y: 46.8 }, { x: 63.0, y: 42.4 }],
    exam:     [START, { x: 37.8, y: 68.0 }, { x: 37.2, y: 62.0 }, { x: 42.2, y: 54.5 }, { x: 52.0, y: 57.0 }, { x: 61.5, y: 61.8 }],
    english:  [START, { x: 34.2, y: 75.6 }, { x: 30.8, y: 75.8 }]
  };
  const near = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < 0.8;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ease = t => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
  const reduced = () => K.ui.reduced();
  const depthScale = y => 0.58 + 0.42 * Math.max(0, Math.min(1, (y - 40) / (76.2 - 40)));

  /* Walk from the end of `from` back to a shared point, then along `to`. */
  function routePts(from, to, here) {
    const b = PATHS[to];
    if (!b) return [here];
    const a = (from && PATHS[from]) || [START];
    let path;
    if (!from || from === to) path = b.slice();
    else {
      const out = [];
      let hit = -1;
      for (let k = a.length - 1; k >= 0; k--) {
        out.push(a[k]);
        hit = b.findIndex(p => near(p, a[k]));
        if (hit >= 0) break;
      }
      path = hit >= 0 ? out.concat(b.slice(hit + 1)) : [a[a.length - 1]].concat(b);
    }
    const pts = [here];
    path.forEach(p => { if (dist(pts[pts.length - 1], p) > 0.25) pts.push(p); });
    return pts;
  }

  function mount(root, hooks) {
    const esc = K.ui.esc;
    const I = () => K.art.icons;
    const stars = hooks.stars | 0, coins = hooks.coins | 0;
    root.innerHTML = `<div class="island" id="island">
      <div class="island-world" id="islandWorld">
        <img class="island-bg" src="assets/hub/island.webp" alt="" width="720" height="1280" draggable="false">
        <div class="island-cloud c1" aria-hidden="true"></div>
        <div class="island-cloud c2" aria-hidden="true"></div>
        <div class="island-cloud c3" aria-hidden="true"></div>
        <div class="island-spark" style="left:67.2%;top:56.6%" aria-hidden="true"></div>
        <div class="island-spark s2" style="left:70.4%;top:55.4%" aria-hidden="true"></div>
        <button type="button" class="stn" data-stn="kefel" style="left:12%;top:17%;width:36%;height:26%" aria-label="ממלכת הכפל"><span class="chip">ממלכת הכפל</span></button>
        <button type="button" class="stn" data-stn="shapes" style="left:55%;top:27%;width:38%;height:20%" aria-label="גן הצורות"><span class="chip">גן הצורות</span></button>
        <button type="button" class="stn" data-stn="exam" style="left:52%;top:51%;width:38%;height:21%" aria-label="הכנה למבחן"><span class="chip">הכנה למבחן</span></button>
        <button type="button" class="stn stn-en" data-stn="english" style="left:20.8%;top:72.2%" aria-label="אנגלית"><span class="chip">אנגלית</span><img src="assets/hub/english-house.webp" alt="" width="480" height="543" draggable="false"></button>
        <div class="hub-girl idle" id="hubGirl" aria-hidden="true"><div class="shadow"></div><img src="assets/hub/girl.webp" alt="" draggable="false"></div>
        <div class="hub-bubble" id="hubBubble" role="dialog" aria-label="נכנסים?" hidden><strong>נכנסים?</strong><button type="button" class="hub-go">כן!</button></div>
      </div>
      <div class="island-ui">
        <div class="island-top">
          <div class="side">
            <button type="button" class="island-av" id="hubAv" aria-label="${esc(hooks.avLabel || 'הפרופיל שלי')}"><img src="assets/hub/avatar.webp" alt="" width="44" height="44" draggable="false"></button>
            <button type="button" class="island-pill" id="hubStars" aria-label="${stars} כוכבים"><span class="ic" aria-hidden="true">${I().star}</span><b>${stars}</b></button>
          </div>
          <div class="side">
            <span class="island-pill" aria-label="${coins} מטבעות"><span class="ic" aria-hidden="true">${I().coin}</span><b>${K.ui.fmt(coins)}</b></span>
            <button type="button" class="island-ico" id="hubSound" aria-label="${hooks.soundOn ? 'השתקת צלילים' : 'הפעלת צלילים'}" aria-pressed="${!hooks.soundOn}">${hooks.soundOn ? I().sound : I().mute}</button>
            <button type="button" class="island-ico" id="hubParent" aria-label="פינת ההורים">${I().gear}</button>
          </div>
        </div>
        <button type="button" class="now-fab" id="hubNow" aria-label="מה עכשיו? ${esc(hooks.nowTitle || '')}">מה עכשיו?</button>
      </div>
    </div>`;

    const island = root.querySelector('#island');
    const world = root.querySelector('#islandWorld');
    const girl = root.querySelector('#hubGirl');
    const bubble = root.querySelector('#hubBubble');
    const goBtn = root.querySelector('.hub-go');

    let pos = { ...START }, flip = 1, walking = false, arrived = null, going = null, raf = 0, lastTap = { name: null, t: 0 };

    function clampChips() {
      const ir = island.getBoundingClientRect(), pad = 8;
      world.querySelectorAll('.stn .chip').forEach(chip => {
        chip.style.setProperty('--cx', '0px');
        const r = chip.getBoundingClientRect();
        let dx = 0;
        if (r.left < ir.left + pad) dx = ir.left + pad - r.left;
        else if (r.right > ir.right - pad) dx = ir.right - pad - r.right;
        if (dx) chip.style.setProperty('--cx', dx + 'px');
      });
    }

    function layout() {
      const W = island.clientWidth, H = island.clientHeight;
      const scale = Math.max(W / IW, H / IH);
      const w = IW * scale, h = IH * scale;
      world.style.width = w + 'px';
      world.style.height = h + 'px';
      world.style.left = ((W - w) / 2) + 'px';
      world.style.top = ((H - h) / 2) + 'px';
      placeGirl();
      clampChips();
    }

    function placeGirl() {
      const s = depthScale(pos.y);
      const w = world.offsetWidth, h = world.offsetHeight;
      const x = pos.x / 100 * w, y = pos.y / 100 * h;
      girl.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-92%) scale(' + (flip * s) + ',' + s + ')';
      if (bubble.classList.contains('is-on')) placeBubble();
    }

    function placeBubble() {
      const s = depthScale(pos.y);
      bubble.style.left = pos.x + '%';
      bubble.style.top = (pos.y - 19 * s) + '%';
    }

    function hideBubble() {
      bubble.classList.remove('is-on');
      bubble.hidden = true;
      arrived = null;
    }

    function showBubble(name) {
      arrived = name;
      placeBubble();
      bubble.hidden = false;
      bubble.classList.add('is-on');
    }

    function snapTo(name) {
      const path = PATHS[name] || PATHS.kefel;
      const end = path[path.length - 1], prev = path[path.length - 2] || START;
      pos = { x: end.x, y: end.y };
      flip = (end.x - prev.x) < 0 ? 1 : -1;
      walking = false; going = null;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      girl.classList.remove('walk');
      girl.classList.add('idle');
      placeGirl();
      showBubble(name);
    }

    function walkTo(name) {
      if (!PATHS[name]) return;
      if (reduced()) { snapTo(name); return; }
      const from = arrived || going;
      hideBubble();
      going = name;
      walking = true;
      girl.classList.remove('idle');
      girl.classList.add('walk');
      const pts = routePts(from, name, pos);
      const segs = [];
      for (let i = 1; i < pts.length; i++) {
        const d = dist(pts[i - 1], pts[i]);
        if (d > 0.2) segs.push({ a: pts[i - 1], b: pts[i], d });
      }
      if (!segs.length) { walking = false; girl.classList.remove('walk'); girl.classList.add('idle'); showBubble(name); return; }
      const total = segs.reduce((s, g) => s + g.d, 0);
      const dur = Math.max(420, Math.min(2400, (total / 18) * 1000));
      const dx0 = segs[0].b.x - segs[0].a.x;
      if (Math.abs(dx0) > 0.4) flip = dx0 < 0 ? 1 : -1;
      placeGirl();
      const t0 = performance.now();
      if (raf) cancelAnimationFrame(raf);
      function step(now) {
        const u = ease(Math.min(1, (now - t0) / dur));
        let remain = u * total, i = 0;
        while (i < segs.length - 1 && remain > segs[i].d) { remain -= segs[i].d; i++; }
        const g = segs[i], t = g.d ? remain / g.d : 1;
        pos = { x: g.a.x + (g.b.x - g.a.x) * t, y: g.a.y + (g.b.y - g.a.y) * t };
        const dx = g.b.x - g.a.x;
        if (Math.abs(dx) > 0.4) flip = dx < 0 ? 1 : -1;
        placeGirl();
        if (u >= 1) {
          walking = false; going = null; raf = 0;
          girl.classList.remove('walk'); girl.classList.add('idle');
          showBubble(name);
          return;
        }
        raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }

    function enter(name) {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      walking = false;
      if (!hooks.onEnter) return;
      if (name === 'exam' || reduced()) { hooks.onEnter(name); return; }
      island.classList.add('leaving');
      setTimeout(() => hooks.onEnter(name), 280);
    }

    function onStation(name) {
      const now = performance.now();
      if (arrived === name) { enter(name); return; }
      if (lastTap.name === name && now - lastTap.t < 420) { enter(name); return; }
      lastTap = { name, t: now };
      if (walking && going === name) { snapTo(name); return; }
      walkTo(name);
    }

    root.querySelectorAll('.stn').forEach(b => b.addEventListener('click', () => { K.audio.play('tap'); onStation(b.dataset.stn); }));
    goBtn.addEventListener('click', e => { e.stopPropagation(); K.audio.play('pop'); if (arrived) enter(arrived); });
    bubble.addEventListener('click', () => { K.audio.play('pop'); if (arrived) enter(arrived); });
    root.querySelector('#hubAv').onclick = () => { K.audio.play('tap'); hooks.onAvatar && hooks.onAvatar(); };
    root.querySelector('#hubStars').onclick = () => { K.audio.play('tap'); hooks.onStars && hooks.onStars(); };
    root.querySelector('#hubParent').onclick = () => { K.audio.play('tap'); hooks.onParent && hooks.onParent(); };
    root.querySelector('#hubNow').onclick = () => { K.audio.play('pop'); hooks.onNow && hooks.onNow(); };
    const snd = root.querySelector('#hubSound');
    snd.onclick = () => {
      if (!hooks.onSound) return;
      const on = hooks.onSound();
      snd.innerHTML = on ? I().sound : I().mute;
      snd.setAttribute('aria-pressed', String(!on));
      snd.setAttribute('aria-label', on ? 'השתקת צלילים' : 'הפעלת צלילים');
    };

    const onResize = () => layout();
    addEventListener('resize', onResize);
    if (window.visualViewport) visualViewport.addEventListener('resize', onResize);
    layout();

    window.__hubIsland = { ready: true, walkTo, snapTo, enter, get arrived() { return arrived; } };

    return function cleanup() {
      if (raf) cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      if (window.visualViewport) visualViewport.removeEventListener('resize', onResize);
      try { if (window.__hubIsland) delete window.__hubIsland; } catch (e) { /* ignore */ }
    };
  }

  return { mount };
})();
