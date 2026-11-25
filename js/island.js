/* Illustrated 2.5D island home hub. Coordinates are in 720×1280 image space. */
K.island = (function () {
  const IW = 720, IH = 1280;
  const NODES = {
    en: { x: 30.8, y: 75.8 }, en1: { x: 34.6, y: 76.0 }, idle: { x: 39.2, y: 76.2 },
    low1: { x: 41.0, y: 71.8 }, mid1: { x: 39.4, y: 67.0 }, mid2: { x: 38.2, y: 63.0 },
    jTent: { x: 39.6, y: 59.0 }, mid3: { x: 41.0, y: 54.6 }, fork: { x: 42.4, y: 51.0 },
    c1: { x: 42.0, y: 46.8 }, c2: { x: 40.2, y: 43.0 }, c3: { x: 37.2, y: 39.6 }, castle: { x: 34.6, y: 36.6 },
    g1: { x: 47.2, y: 51.0 }, g2: { x: 53.2, y: 49.0 }, g3: { x: 59.0, y: 46.2 }, garden: { x: 64.0, y: 43.5 },
    t1: { x: 45.2, y: 58.4 }, t2: { x: 52.0, y: 57.8 }, t3: { x: 57.5, y: 59.2 }, tent: { x: 61.5, y: 61.8 }
  };
  const START = NODES.idle;
  const DEST = { kefel: 'castle', shapes: 'garden', exam: 'tent', english: 'en' };
  const EDGES = [
    ['en','en1'],['en1','idle'],['idle','low1'],['low1','mid1'],['mid1','mid2'],
    ['mid2','jTent'],['jTent','mid3'],['mid3','fork'],
    ['fork','c1'],['c1','c2'],['c2','c3'],['c3','castle'],
    ['fork','g1'],['g1','g2'],['g2','g3'],['g3','garden'],
    ['jTent','t1'],['t1','t2'],['t2','t3'],['t3','tent']
  ];
  const ADJ = {};
  Object.keys(NODES).forEach(k => { ADJ[k] = []; });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  EDGES.forEach(([a, b]) => {
    const d = dist(NODES[a], NODES[b]);
    ADJ[a].push({ to: b, d }); ADJ[b].push({ to: a, d });
  });
  function pathLen(ids) {
    let s = 0;
    for (let i = 1; i < ids.length; i++) s += dist(NODES[ids[i - 1]], NODES[ids[i]]);
    return s;
  }
  function shortest(from, to) {
    if (from === to) return [from];
    const distM = {}, prev = {};
    Object.keys(NODES).forEach(k => { distM[k] = Infinity; });
    distM[from] = 0;
    const q = Object.keys(NODES);
    while (q.length) {
      q.sort((a, b) => distM[a] - distM[b]);
      const u = q.shift();
      if (u === to) break;
      (ADJ[u] || []).forEach(({ to: v, d }) => {
        const nd = distM[u] + d;
        if (nd < distM[v]) { distM[v] = nd; prev[v] = u; }
      });
    }
    const path = [to];
    while (path[0] !== from) {
      if (!prev[path[0]]) return [from, to];
      path.unshift(prev[path[0]]);
    }
    return path;
  }
  function closestEdge(p) {
    let best = { d: Infinity, a: null, b: null, t: 0, pt: p };
    EDGES.forEach(([ia, ib]) => {
      const A = NODES[ia], B = NODES[ib];
      const dx = B.x - A.x, dy = B.y - A.y, len2 = dx * dx + dy * dy;
      const t = len2 ? Math.max(0, Math.min(1, ((p.x - A.x) * dx + (p.y - A.y) * dy) / len2)) : 0;
      const q = { x: A.x + dx * t, y: A.y + dy * t };
      const d = dist(p, q);
      if (d < best.d) best = { d, a: ia, b: ib, t, pt: q };
    });
    return best;
  }
  function routeTo(destName, here) {
    const dest = DEST[destName];
    if (!dest) return [here];
    const c = closestEdge(here);
    const pathA = shortest(c.a, dest), pathB = shortest(c.b, dest);
    const costA = dist(here, NODES[c.a]) + pathLen(pathA);
    const costB = dist(here, NODES[c.b]) + pathLen(pathB);
    const nodes = costA <= costB ? pathA : pathB;
    const pts = [here];
    if (dist(here, c.pt) > 0.15) pts.push(c.pt);
    nodes.forEach(id => {
      const p = NODES[id];
      if (dist(pts[pts.length - 1], p) > 0.2) pts.push({ x: p.x, y: p.y });
    });
    return pts;
  }
  /* Constant mid-speed, ease in/out over the first and last 15% of time. */
  function easeEnds(t, a) {
    if (a == null) a = 0.15;
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const vmax = 1 / (1 - a);
    if (t < a) { const u = t / a; return vmax * a * u * u / 2; }
    if (t > 1 - a) {
      const u = (t - (1 - a)) / a;
      return vmax * a / 2 + vmax * (1 - 2 * a) + vmax * a * (u - u * u / 2);
    }
    return vmax * a / 2 + vmax * (t - a);
  }
  const reduced = () => K.ui.reduced();
  const depthScale = y => 0.58 + 0.42 * Math.max(0, Math.min(1, (y - 40) / (76.2 - 40)));

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
        <div class="hub-girl idle" id="hubGirl" aria-hidden="true"><div class="shadow"></div><img class="girl-idle" src="assets/hub/girl.webp" alt="" draggable="false"><div class="girl-walk" aria-hidden="true"></div></div>
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
      const dest = DEST[name];
      const end = dest ? NODES[dest] : START;
      const pts = routeTo(name, START);
      const prev = pts.length > 1 ? pts[pts.length - 2] : START;
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
      if (!DEST[name]) return;
      if (reduced()) { snapTo(name); return; }
      hideBubble();
      going = name;
      walking = true;
      girl.classList.remove('idle');
      girl.classList.add('walk');
      const pts = routeTo(name, pos);
      const segs = [];
      for (let i = 1; i < pts.length; i++) {
        const d = dist(pts[i - 1], pts[i]);
        if (d > 0.2) segs.push({ a: pts[i - 1], b: pts[i], d });
      }
      if (!segs.length) { walking = false; girl.classList.remove('walk'); girl.classList.add('idle'); showBubble(name); return; }
      const total = segs.reduce((s, g) => s + g.d, 0);
      const dur = Math.max(500, Math.min(3200, (total / 15) * 1000));
      const dx0 = segs[0].b.x - segs[0].a.x;
      if (Math.abs(dx0) > 0.4) flip = dx0 < 0 ? 1 : -1;
      placeGirl();
      const t0 = performance.now();
      if (raf) cancelAnimationFrame(raf);
      function step(now) {
        const u = easeEnds(Math.min(1, (now - t0) / dur));
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

    window.__hubIsland = { ready: true, walkTo, snapTo, enter, get arrived() { return arrived; }, get pos() { return { x: pos.x, y: pos.y }; }, get walking() { return walking; }, nodes: NODES, edges: EDGES, dest: DEST };

    return function cleanup() {
      if (raf) cancelAnimationFrame(raf);
      removeEventListener('resize', onResize);
      if (window.visualViewport) visualViewport.removeEventListener('resize', onResize);
      try { if (window.__hubIsland) delete window.__hubIsland; } catch (e) { /* ignore */ }
    };
  }

  return { mount };
})();
