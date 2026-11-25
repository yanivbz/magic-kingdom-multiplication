/* Illustrated "החדר שלי" + one treasure chest per completed lesson. */
K.ROOM_SLOTS = {
  floor: [
    [36, 66], [46, 69], [62, 69], [74, 63], [54, 64], [54, 59],
    [42, 63], [66, 63], [46, 59]
  ],
  wall: [
    [30, 42], [78, 40], [48, 40],
    [33, 47.2], [42, 47.2], [70, 54]
  ]
};
K.REWARD_EVERY = 3;
K.room = (function () {
  const IW = 720, IH = 1280;
  const CHEST = [32, 57];
  const CHAR = [72, 66];
  const FLOOR = { x0: 24, x1: 82, y0: 56, y1: 72 };
  const WALL = { x0: 22, x1: 84, y0: 34, y1: 56 };
  const isShelf = i => i === 3 || i === 4 || i === 5;
  const reduced = () => !!(K.ui && K.ui.reduced && K.ui.reduced());
  const SAY = ['איזה יופי!', 'כאן זה מושלם', 'כל הכבוד!', 'אוהבת את זה'];
  function cheerOmer(ch, line) {
    if (!ch) return;
    const bub = ch.querySelector('.omer-say') || (() => { const b = document.createElement('div'); b.className = 'omer-say'; ch.appendChild(b); return b; })();
    bub.hidden = false;
    bub.textContent = line || SAY[Math.floor(Math.random() * SAY.length)];
    ch.classList.remove('idle', 'hop');
    void ch.offsetWidth;
    ch.classList.add('hop');
    bub.classList.add('show');
    if (K.audio) K.audio.play('pop');
    return setTimeout(() => {
      ch.classList.remove('hop');
      ch.classList.add('idle');
      bub.classList.remove('show');
      bub.hidden = true;
    }, 1600);
  }
  const slotsFor = zone => zone === 'yard' ? K.SLOTS.yard : (K.ROOM_SLOTS[zone] || K.SLOTS[zone] || []);
  const zoneBox = zone => zone === 'wall' ? WALL : FLOOR;

  function layout(stage, world) {
    const rw = stage.clientWidth, rh = stage.clientHeight;
    if (!rw || !rh) return 1;
    const s = Math.max(rw / IW, rh / IH);
    world.style.width = IW * s + 'px';
    world.style.height = IH * s + 'px';
    world.style.left = (rw - IW * s) / 2 + 'px';
    world.style.top = (rh - IH * s) / 2 + 'px';
    return s;
  }

  function nearest(zone, x, y) {
    const slots = slotsFor(zone);
    let best = -1, d0 = Infinity;
    slots.forEach((p, i) => {
      const d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y);
      if (d < d0) { d0 = d; best = i; }
    });
    return { i: best, d: Math.sqrt(d0) };
  }

  function inBox(box, x, y) { return x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1; }

  function itemPos(st, it) {
    const xy = st.home.xy && st.home.xy[it.id];
    if (xy && Number.isFinite(xy.x) && Number.isFinite(xy.y)) return { x: xy.x, y: xy.y, slot: st.home.place[it.id] };
    const slot = st.home.place[it.id];
    if (slot == null) return null;
    const p = slotsFor(it.zone)[slot];
    return p ? { x: p[0], y: p[1], slot } : null;
  }

  function mount(stage, opts) {
    const st = K.store.state, placing = opts.placing || null, newest = opts.newest || null;
    const onPlace = opts.onPlace || (() => {});
    const pIt = placing ? K.SHOP.find(x => x.id === placing) : null;
    stage.classList.add('room-scene');
    const world = document.createElement('div');
    world.className = 'room-world';
    world.setAttribute('role', 'img');
    world.setAttribute('aria-label', 'החדר של עומר');
    const spark = (st.home.rewards && st.home.rewards.sparkle) || [];

    const placed = K.SHOP.filter(it => st.owned.includes(it.id) && (it.zone === 'floor' || it.zone === 'wall') && itemPos(st, it));
    placed.forEach(it => {
      const pos = itemPos(st, it);
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'room-item' + (it.zone === 'wall' ? ' wall' : '') + (it.zone === 'wall' && isShelf(pos.slot) ? ' shelf' : '') + (it.id === newest ? ' pop' : '') + (spark.includes(it.id) ? ' sparkle' : '');
      el.style.left = pos.x + '%';
      el.style.top = pos.y + '%';
      el.style.zIndex = String(10 + Math.round(pos.y));
      el.dataset.id = it.id;
      el.setAttribute('aria-label', it.name);
      el.innerHTML = `<span class="ri-emoji">${it.emoji}</span>`;
      world.appendChild(el);
    });

    const ch = document.createElement('div');
    ch.className = 'room-char idle';
    ch.style.left = CHAR[0] + '%';
    ch.style.top = CHAR[1] + '%';
    ch.setAttribute('aria-hidden', 'true');
    ch.innerHTML = '<div class="omer-say" hidden></div><div class="shadow"></div><img class="girl-idle" src="assets/hub/girl.webp" alt="" draggable="false">';
    world.appendChild(ch);

    if (st.home.rewards && st.home.rewards.pending) {
      const hot = document.createElement('button');
      hot.type = 'button';
      hot.className = 'chest-hot';
      hot.style.left = CHEST[0] + '%';
      hot.style.top = CHEST[1] + '%';
      hot.setAttribute('aria-label', 'יש אוצר שמחכה!');
      hot.innerHTML = '<span class="chest-badge">!</span>';
      hot.onclick = ev => { ev.stopPropagation(); K.audio.play('pop'); if (K.chest) K.chest.maybeShow({ delay: 0 }); };
      world.appendChild(hot);
    }

    if (pIt && (pIt.zone === 'floor' || pIt.zone === 'wall')) {
      slotsFor(pIt.zone).forEach((p, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'room-slot' + (pIt.zone === 'wall' ? ' wall' : '');
        b.style.left = p[0] + '%';
        b.style.top = p[1] + '%';
        b.dataset.slot = i;
        b.setAttribute('aria-label', 'מקום ' + (i + 1));
        b.onclick = ev => { ev.stopPropagation(); onPlace(pIt.id, i); };
        world.appendChild(b);
      });
    }

    stage.innerHTML = '';
    stage.appendChild(world);
    const fit = () => layout(stage, world);
    fit();
    const ro = window.ResizeObserver ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(stage);
    window.addEventListener('resize', fit);

    /* tap = a little bounce; drag starts only after a short move */
    let drag = null, cheerT = 0;
    const toPct = ev => {
      const r = world.getBoundingClientRect();
      return { x: (ev.clientX - r.left) / r.width * 100, y: (ev.clientY - r.top) / r.height * 100 };
    };
    function moveDrag(ev) {
      if (!drag) return;
      if (!drag.moved) {
        const dx = ev.clientX - drag.sx, dy = ev.clientY - drag.sy;
        if (dx * dx + dy * dy < 64) return;
        drag.moved = true;
        drag.el.classList.add('dragging');
      }
      const p = toPct(ev);
      drag.x = p.x; drag.y = p.y;
      drag.el.style.left = p.x + '%';
      drag.el.style.top = p.y + '%';
    }
    function endDrag() {
      if (!drag) return;
      const d = drag;
      drag = null;
      d.el.classList.remove('dragging');
      if (!d.moved) {
        d.el.classList.remove('tap-fun');
        void d.el.offsetWidth;
        d.el.classList.add('tap-fun');
        if (K.audio) K.audio.play('pop');
        return;
      }
      const { it, x, y } = d;
      const n = nearest(it.zone, x, y);
      const box = zoneBox(it.zone);
      if (n.d <= 8) {
        if (st.home.xy) delete st.home.xy[it.id];
        onPlace(it.id, n.i);
      } else if (inBox(box, x, y)) {
        if (!st.home.xy) st.home.xy = {};
        st.home.xy[it.id] = { x: +x.toFixed(2), y: +y.toFixed(2) };
        K.store.place(it.id, n.i >= 0 ? n.i : (st.home.place[it.id] != null ? st.home.place[it.id] : 0));
        onPlace(it.id, 'xy');
      } else {
        onPlace(it.id, 'refresh');
      }
    }
    world.querySelectorAll('.room-item').forEach(el => {
      const it = K.SHOP.find(x => x.id === el.dataset.id);
      el.addEventListener('pointerdown', ev => {
        if (ev.button && ev.button !== 0) return;
        ev.preventDefault();
        const p = toPct(ev);
        drag = { el, it, x: p.x, y: p.y, sx: ev.clientX, sy: ev.clientY, moved: false };
        try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      });
    });
    world.addEventListener('pointermove', moveDrag);
    world.addEventListener('pointerup', endDrag);
    world.addEventListener('pointercancel', endDrag);

    if (opts.cheer) {
      const line = SAY[(opts.newest || 'x').length % SAY.length];
      cheerT = setTimeout(() => cheerOmer(ch, line), 80);
    }

    return () => {
      clearTimeout(cheerT);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }

  return { mount, layout, slotsFor, itemPos };
})();

K.chest = (function () {
  const PRAISE = ['כל הכבוד! מצאת אוצר', 'איזה יופי! יש הפתעה', 'וואו, האוצר שלך מחכה', 'יפה מאוד! הרווחת משהו מיוחד'];
  let el = null, showT = null;

  function ensureRewards() {
    const h = K.store.state.home;
    if (!h.rewards || typeof h.rewards !== 'object') h.rewards = { done: 0, pending: null, sparkle: [] };
    if (typeof h.rewards.done !== 'number') h.rewards.done = 0;
    if (!Array.isArray(h.rewards.sparkle)) h.rewards.sparkle = [];
    if (!h.xy || typeof h.xy !== 'object') h.xy = {};
    return h.rewards;
  }

  function pickGift() {
    const st = K.store.state;
    const pool = K.SHOP.filter(it => (it.zone === 'floor' || it.zone === 'wall') && !st.owned.includes(it.id) && K.store.unlocked(it))
      .sort((a, b) => a.price - b.price);
    return pool[0] || null;
  }

  function gift(id) {
    const st = K.store.state, r = ensureRewards();
    if (!st.owned.includes(id)) st.owned.push(id);
    if (!r.sparkle.includes(id)) r.sparkle.push(id);
  }

  function progress() {
    const r = ensureRewards(), ev = K.REWARD_EVERY, into = r.done % ev;
    const filled = into; /* 0 after a grant or at start */
    const left = into === 0 ? ev : ev - into;
    return { filled, left, every: ev, done: r.done };
  }

  function barHTML(p) {
    const lab = p.left === 1 ? '🎁 עוד שיעור אחד לפריט חדש' : `🎁 עוד ${p.left} שיעורים לפריט חדש`;
    return `<div class="reward-bar"><span class="rb-label">${lab}</span><span class="rb-track" aria-hidden="true">${[0, 1, 2].map(i => `<i class="${i < p.filled ? 'on' : ''}"></i>`).join('')}</span></div>`;
  }

  function tabHasPending() { const r = K.store.state.home && K.store.state.home.rewards; return !!(r && r.pending); }

  function close() {
    if (!el) return;
    const n = el; el = null;
    n.classList.remove('show');
    setTimeout(() => n.remove(), 280);
  }

  function flyToHouse() {
    const from = el && el.querySelector('.chest-coins');
    const to = document.getElementById('hudCoins') || document.querySelector('a[href="#/home"]');
    if (!from || !to) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      const c = document.createElement('span');
      c.className = 'fly-coin';
      c.textContent = '🪙';
      c.style.left = (a.left + a.width / 2 + (i - 2) * 8) + 'px';
      c.style.top = (a.top + a.height / 2) + 'px';
      document.body.appendChild(c);
      requestAnimationFrame(() => { c.style.left = (b.left + b.width / 2) + 'px'; c.style.top = (b.top + b.height / 2) + 'px'; c.style.opacity = '0'; });
      setTimeout(() => c.remove(), 800);
    }
    to.classList.add('bump');
    setTimeout(() => to.classList.remove('bump'), 600);
  }

  function collect() {
    const r = ensureRewards(), p = r.pending;
    if (!p) { close(); return; }
    r.pending = null;
    K.store.save();
    if (K.ui && K.ui.updateHud) K.ui.updateHud();
    K.audio.play('coin');
    flyToHouse();
    if (p.item) {
      const card = el && el.querySelector('.chest-card');
      if (card) {
        card.innerHTML = `<h2>קיבלת ${p.itemEmoji} ${p.itemName}!</h2>
          <p style="font-weight:700;color:#4a2278;margin:.2rem 0 .8rem">בואי נשים אותו בחדר</p>
          <button class="btn btn-primary btn-xl" id="chestGo" type="button">לשים בחדר</button>
          <button class="btn btn-secondary btn-lg" id="chestOk" type="button" style="width:100%;margin-top:.45rem;min-height:48px">יופי, תודה</button>`;
        const go = () => { K.store.state.home.view = 'room'; K.store.save(); close(); K.audio.play('pop'); if (K.ui.go) K.ui.go('home'); };
        card.querySelector('#chestGo').onclick = go;
        card.querySelector('#chestOk').onclick = () => { close(); };
        return;
      }
    }
    setTimeout(close, 500);
  }

  function build() {
    const r = ensureRewards(), p = r.pending;
    if (!p) return;
    close();
    const wrap = document.createElement('div');
    wrap.className = 'chest-ov';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'chestTitle');
    const pg = progress();
    const itemLine = p.item ? `<div class="chest-item"><span class="ci-e">${p.itemEmoji}</span>${p.itemName}</div>` : '';
    wrap.innerHTML = `<div class="chest-card">
      <div class="chest-box" id="chestBox"><div class="chest-glow"></div><div class="chest-lid"></div><div class="chest-body"></div></div>
      <h2 id="chestTitle">${p.msg || PRAISE[0]}</h2>
      <div class="chest-loot">
        <div class="chest-coins"><span class="cc-ico">🪙</span><b dir="ltr">+<span id="chestCoins">0</span></b></div>
        ${itemLine}
      </div>
      ${p.item ? `<p style="font-weight:700;margin:0 0 .5rem;color:#5a3a12">פריט חדש לחדר!</p>` : barHTML(pg)}
      <button class="btn btn-primary btn-xl" id="chestTake" type="button">לחצי כאן ✨</button>
    </div>`;
    document.body.appendChild(wrap);
    el = wrap;
    requestAnimationFrame(() => wrap.classList.add('show'));
    const box = wrap.querySelector('#chestBox');
    const take = wrap.querySelector('#chestTake');
    const open = () => {
      box.classList.remove('shake');
      box.classList.add('open');
      if (K.ui && K.ui.countUp) K.ui.countUp(wrap.querySelector('#chestCoins'), p.coins || 0, 900);
      else wrap.querySelector('#chestCoins').textContent = String(p.coins || 0);
      if (K.ui && K.ui.confetti) setTimeout(() => K.ui.confetti({ y: innerHeight * .38, count: 70, stars: true }), 80);
      K.audio.play('chest');
    };
    if (K.ui && K.ui.reduced && K.ui.reduced()) { open(); }
    else {
      setTimeout(() => box.classList.add('shake'), 200);
      setTimeout(open, 800);
    }
    take.onclick = collect;
    box.addEventListener('click', () => { if (box.classList.contains('open')) collect(); });
    K.ui.say && K.ui.say(p.msg || PRAISE[0]);
  }

  function maybeShow(opts) {
    const delay = opts && opts.delay != null ? opts.delay : 280;
    const r = K.store.state.home && K.store.state.home.rewards;
    if (!r || !r.pending) return;
    if (el) return;
    clearTimeout(showT);
    showT = setTimeout(build, delay);
  }

  function queue(coins) {
    coins = Math.max(0, coins | 0);
    if (!coins) return;
    const r = ensureRewards();
    r.done += 1;
    let item = null;
    if (r.done % K.REWARD_EVERY === 0) {
      item = pickGift();
      if (item) gift(item.id);
    }
    const prev = r.pending;
    const shop = item || (prev && prev.item && K.SHOP.find(x => x.id === prev.item));
    r.pending = {
      coins: (prev && prev.coins || 0) + coins,
      item: (item && item.id) || (prev && prev.item) || null,
      itemName: shop ? shop.name : (prev && prev.itemName) || '',
      itemEmoji: shop ? shop.emoji : (prev && prev.itemEmoji) || '',
      msg: PRAISE[r.done % PRAISE.length]
    };
    K.store.save();
    maybeShow({ delay: 280 });
  }

  function hint(placing) {
    const st = K.store.state;
    if (placing) {
      const it = K.SHOP.find(x => x.id === placing);
      return it ? `לחצי על מקום בחדר ל${it.name}, או גררי אותו` : 'לחצי על מקום בחדר, או גררי את הפריט';
    }
    const unplaced = st.owned.some(id => {
      const it = K.SHOP.find(x => x.id === id);
      return it && (it.zone === 'floor' || it.zone === 'wall') && !K.room.itemPos(st, it);
    });
    const spark = ((st.home.rewards && st.home.rewards.sparkle) || []).some(id => st.owned.includes(id));
    if (unplaced || spark) return 'יש לך פריט חדש! לחצי עליו ואז בחרי מקום בחדר';
    return 'אפשר לשים פריט על המדף, ליד החלון או על השטיח';
  }

  function clearSparkle(id) {
    const r = ensureRewards();
    r.sparkle = r.sparkle.filter(x => x !== id);
    K.store.save();
  }

  return { queue, maybeShow, progress, barHTML, hint, tabHasPending, clearSparkle, ensureRewards, close };
})();
