/* Onboarding, kingdom map, castle home. */
(function () {
  const { $, $$, h, go, route, sheet, toast, esc, confetti, burstAt } = K.ui;
  const I = () => K.art.icons;
  const S = () => K.store.state;
  const A = (n, v) => K.audio.play(n, v);
  const nm = () => S().name ? esc(S().name) : '';
  const chr = () => K.CHARACTERS[S().char] || K.CHARACTERS.bear;

  /* ---------------- onboarding ---------------- */
  route('welcome', { chrome: 'none', render(root) {
    root.innerHTML = `<div class="welcome">
      <div class="sparkles" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--y:${(i * 53) % 100}%;--d:${(i % 5) * .5}s"></i>`).join('')}</div>
      <div class="welcome-chars">${['bear', 'princess', 'puppy'].map((c, i) => `<div class="wc wc${i}">${K.art.char(c, i === 1 ? 'cheer' : 'happy')}</div>`).join('')}</div>
      <p class="greet">שלום ${esc(S().name || 'עומר')}!</p>
      <h1 class="logo logo-omer"><span>עומר</span> והממלכה הקסומה</h1>
      <p class="lead">הרפתקה קסומה שבה לומדים את לוח הכפל, משחקים ומקבלים פרסים!</p>
      <button class="btn btn-primary btn-xl" id="go">בואו נתחיל <span class="btn-ic">${I().back}</span></button>
    </div>`;
    $('#go').onclick = () => { K.audio.unlock(); A('pop'); go('choose'); };
  } });

  route('choose', { chrome: 'none', render(root) {
    let sel = S().char || null, name = S().name || 'עומר';
    root.innerHTML = `<div class="choose">
      <h2 class="h-big">בחרי חבר למסע</h2>
      <p class="sub">הוא יהיה איתך בכל הרפתקה בממלכה</p>
      <div class="char-cards" role="radiogroup" aria-label="בחירת דמות">
        ${Object.values(K.CHARACTERS).map(c => `<button class="char-card" role="radio" aria-checked="false" data-c="${c.id}"><div class="cc-art">${K.art.char(c.id, 'happy')}</div><b>${c.name}</b><small>${c.blurb}</small></button>`).join('')}
      </div>
      <label class="name-field"><span>איך קוראים לך? <small>(אפשר לשנות)</small></span><input id="nm" type="text" maxlength="14" autocomplete="off" placeholder="השם שלך" value="${esc(name)}"></label>
      <button class="btn btn-primary btn-xl" id="next" disabled>המשך <span class="btn-ic">${I().back}</span></button>
    </div>`;
    const cards = $$('.char-card', root), btn = $('#next');
    function mark() { cards.forEach(c => { const on = c.dataset.c === sel; c.classList.toggle('on', on); c.setAttribute('aria-checked', on); const mood = on ? 'cheer' : 'happy'; const a = $('.cc-art', c); if (a.dataset.mood !== mood) { a.dataset.mood = mood; a.innerHTML = K.art.char(c.dataset.c, mood); } }); btn.disabled = !sel; }
    cards.forEach(c => c.onclick = () => { K.audio.unlock(); sel = c.dataset.c; A('pop'); mark(); });
    if (sel) mark();
    btn.onclick = () => { S().char = sel; S().name = $('#nm').value.trim() || 'עומר'; K.store.save(); A('whoosh'); go('story'); };
  } });

  route('story', { chrome: 'none', render(root) {
    const c = chr(), n = nm();
    const slides = [
      { mood: 'happy', art: `<div class="st-groups">${[3, 4, 5].map((k, g) => `<div class="st-g" style="--g:${g}">${Array.from({ length: k }, (_, i) => `<i class="dot c${g}" style="--i:${i}"></i>`).join('')}</div>`).join('')}</div>`,
        text: `פעם, בממלכה קסומה, כל המספרים התחברו יחד בקבוצות צבעוניות ורקדו מסביב לכוכבים.` },
      { mood: 'oops', art: `<div class="st-dark"><span class="st-star off">★</span><span class="st-star off s2">★</span><span class="st-star off s3">★</span></div>`,
        text: `יום אחד האורות של הכפל כבו, והממלכה הפכה לאפורה ועצובה.` },
      { mood: 'cheer', art: `<div class="st-light"><span class="st-star on">★</span></div>`,
        text: `${n ? n + ', ' : ''}רק מי שיודעת כפל יכולה להחזיר את האור! ${c.name} יהיה איתך בכל צעד. מוכנה?` }
    ];
    let i = 0;
    function draw() {
      const s = slides[i];
      root.innerHTML = `<div class="story">
        <div class="story-art">${s.art}</div>
        <div class="story-row"><div class="story-char">${K.art.char(c.id, s.mood)}</div>${K.ui.bubble(s.text, 'bubble-lg')}</div>
        <div class="dots-nav" aria-hidden="true">${slides.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
        <div class="story-actions">${i < slides.length - 1
          ? `<button class="btn btn-primary btn-xl" id="nx">הלאה <span class="btn-ic">${I().back}</span></button>`
          : `<button class="btn btn-primary btn-lg" id="start" style="width:min(100%,420px)">המשימה הראשונה: מה זה כפל?</button><button class="btn btn-ghost" id="skip">אני כבר מכירה, ישר למפה</button>`}</div>
      </div>`;
      if (i === 2) setTimeout(() => confetti({ y: innerHeight * .35, count: 40, stars: true }), 300);
      const nx = $('#nx'); if (nx) nx.onclick = () => { A('pop'); i++; draw(); };
      const st = $('#start'); if (st) st.onclick = () => { S().onboarded = true; K.store.save(); A('fanfare'); go('intro'); };
      const sk = $('#skip'); if (sk) sk.onclick = () => { S().onboarded = true; S().introDone = true; K.store.save(); go('map'); };
    }
    draw();
  } });

  /* ---------------- mission recommendation ---------------- */
  function nextMission() {
    const st = S();
    if (!st.introDone) return { kind: 'intro', title: 'המשימה הראשונה: מה זה כפל?', cta: 'יוצאים לדרך', msg: `בואי נתחיל בשער הממלכה ונבין מה זה כפל.`, node: 'gate' };
    const ready = K.readyTables();
    const open = ready.map(t => ({ t, ts: K.store.tstate(t), m: K.store.tableMastery(t) }));
    const noLesson = open.find(x => !x.ts.lesson);
    if (noLesson) return { kind: 'lesson', t: noLesson.t, title: `שיעור קצר: טבלת ה-${noLesson.t}`, cta: 'לשיעור', msg: `מוכנה לגלות את הסודות של טבלת ה-${noLesson.t}?`, node: noLesson.t };
    open.sort((a, b) => a.ts.stars - b.ts.stars || a.m - b.m);
    const x = open[0];
    const weak = weakFacts(x.t)[0];
    return { kind: 'practice', t: x.t, title: `תרגול: טבלת ה-${x.t}`, cta: 'מתרגלים', msg: weak ? `כדאי לחזק את ${weak.t} × ${weak.m}. הוא יופיע בתרגול.` : `עוד סבב קצר בטבלת ה-${x.t} ויש עוד כוכב!`, node: x.t };
  }
  function weakFacts(t) {
    const out = [];
    for (let m = 1; m <= 10; m++) { const f = K.store.fact(t, m); if (f.seen && f.bad && f.box < 3) out.push({ t, m, bad: f.bad }); }
    return out.sort((a, b) => b.bad - a.bad);
  }
  function startMission(m) { if (m.kind === 'intro') go('intro'); else if (m.kind === 'lesson') go('lesson/' + m.t); else go('practice/' + m.t); }

  /* ---------------- map ---------------- */
  route('map', { chrome: 'tabs', render(root) {
    const st = S(), c = chr(), mission = nextMission(), P = K.art.NODES;
    const pct = ([x, y]) => `left:${(x / 400 * 100).toFixed(2)}%;top:${(y / 900 * 100).toFixed(2)}%`;
    const nodeFor = t => {
      const T = K.TABLES[t], ts = K.store.tstate(t), locked = !T.ready, rec = mission.node === t;
      return `<button class="node ${locked ? 'locked' : 'open'}${rec ? ' rec' : ''}" style="${pct(P[t])};--nc:${T.color}" data-t="${t}" aria-label="${locked ? `טבלת ה-${t}, בקרוב` : `טבלת ה-${t}, ${ts.stars} כוכבים מתוך 3`}">
        <span class="node-num">${t}</span>${locked ? `<span class="node-lock">${I().lock}</span>` : `<span class="node-stars">${K.ui.starsRow(ts.stars, 3, 'sm')}</span>`}
        ${rec ? `<span class="guide ${P[t][0] < 200 ? 'gr' : 'gl'}">${K.ui.avatar(c.id)}<em>${mission.kind === 'practice' ? 'כאן!' : 'התחילי כאן!'}</em></span>` : ''}</button>`;
    };
    root.innerHTML = `<div class="map-layout">
      <aside class="map-side">
        <div class="mission card">
          <div class="mission-top"><div class="mission-char">${K.art.char(c.id, 'happy')}</div>${K.ui.bubble(mission.msg)}</div>
          <button class="btn btn-primary btn-lg" id="mission">${mission.cta}</button>
          <small class="mission-title">${mission.title}</small>
        </div>
        <div class="week card">${weekStrip()}</div>
        <div class="legend card">
          <h3>הכוכבים שלך</h3>
          <ul><li>${K.ui.starsRow(1, 1)}<span>סבב תרגול טוב (60% ומעלה)</span></li><li>${K.ui.starsRow(2, 2)}<span>סבב מצוין (80% ומעלה)</span></li><li>${K.ui.starsRow(3, 3)}<span>כל הטבלה שלך!</span></li></ul>
        </div>
      </aside>
      <section class="map-wrap" aria-label="מפת הממלכה"><div class="map">
        ${K.art.mapScene()}
        ${K.AREAS.filter(a => a.tables.every(t => !K.TABLES[t].ready)).map(a => `<div class="fog fog-${a.id}"></div>`).join('')}
        <button class="node gate open${mission.node === 'gate' ? ' rec' : ''}" style="${pct(P.gate)}" data-t="gate" aria-label="שער הממלכה: מה זה כפל?">
          <span class="node-num">${I().book}</span><span class="node-label">${st.introDone ? 'מה זה כפל? ✓' : 'מה זה כפל?'}</span>
          ${mission.node === 'gate' ? `<span class="guide">${K.ui.avatar(c.id)}<em>התחילי כאן!</em></span>` : ''}</button>
        ${K.TABLE_LIST.map(nodeFor).join('')}
      </div></section>
    </div>`;
    $('#mission').onclick = () => { A('pop'); startMission(mission); };
    $$('.node', root).forEach(n => n.onclick = () => {
      A('pop');
      const t = n.dataset.t;
      if (t === 'gate') return go('intro');
      tableSheet(Number(t));
    });
    // scroll the recommended node into view (map is tall on phones)
    setTimeout(() => { const r = $('.node.rec', root) || $('.node.open', root); if (r) r.scrollIntoView({ block: 'center', behavior: 'auto' }); }, 60);
  } });

  function weekStrip() {
    const days = new Set(S().days), out = [], names = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      out.push(`<div class="wd${days.has(k) ? ' on' : ''}${i === 0 ? ' today' : ''}"><span>${days.has(k) ? I().flame : ''}</span><small>${names[d.getDay()]}</small></div>`);
    }
    return `<h3>השבוע שלי</h3><div class="week-row">${out.join('')}</div><p class="week-note">${K.store.streakNow() ? `רצף של ${K.store.streakNow()} ימים, כל הכבוד!` : 'תרגול אחד היום מתחיל רצף חדש!'}</p>`;
  }

  function masteryChips(t) {
    return `<div class="mchips" role="img" aria-label="מפת שליטה בעובדות הכפל של הטבלה">${Array.from({ length: 10 }, (_, i) => {
      const f = K.store.fact(t, i + 1), lvl = !f.seen ? 'new' : f.box <= 1 ? 'weak' : f.box <= 3 ? 'mid' : 'good';
      return `<span class="mchip ${lvl}" title="${t} × ${i + 1}">${i + 1}</span>`; }).join('')}</div>
      <div class="mlegend"><span><i class="mchip new"></i>חדש</span><span><i class="mchip weak"></i>לחזק</span><span><i class="mchip mid"></i>כמעט</span><span><i class="mchip good"></i>שולטת</span></div>`;
  }

  function tableSheet(t) {
    const T = K.TABLES[t], ts = K.store.tstate(t);
    if (!T.ready) {
      const s = sheet(`<div class="tsheet"><div class="tbadge locked" style="--nc:${T.color}">${t}</div><h2>טבלת ה-${t}</h2><p class="muted">האזור הזה עוד מכוסה בערפל קסום. הוא ייפתח בקרוב!</p><p class="muted">בינתיים אפשר להסתכל על טבלת ה-${t} בלוח הכפל.</p><button class="btn btn-secondary btn-lg" id="seeGrid">לוח הכפל</button></div>`);
      $('#seeGrid', s.el).onclick = () => { s.close(); K.explorerFocus = t; go('explorer'); };
      return;
    }
    const lessonFirst = !ts.lesson, area = K.AREAS.find(a => a.id === T.area);
    const s = sheet(`<div class="tsheet">
      <div class="tbadge" style="--nc:${T.color}">${t}</div>
      <h2>טבלת ה-${t}</h2><p class="muted">${area.emoji} ${area.name}</p>
      <div class="stars-big">${K.ui.starsRow(ts.stars, 3)}</div>
      <p class="tip">${T.tip}</p>
      ${masteryChips(t)}
      <div class="tsheet-actions">
        <button class="btn ${lessonFirst ? 'btn-primary' : 'btn-secondary'} btn-lg" id="les">${I().book} ${lessonFirst ? 'שיעור קצר (מומלץ)' : 'חוזרים על השיעור'}</button>
        <button class="btn ${lessonFirst ? 'btn-secondary' : 'btn-primary'} btn-lg" id="prac">🎯 תרגול</button>
      </div></div>`);
    $('#les', s.el).onclick = () => { s.close(); go('lesson/' + t); };
    $('#prac', s.el).onclick = () => { s.close(); go('practice/' + t); };
  }

  /* ---------------- castle home ---------------- */
  let newest = null;
  route('home', { chrome: 'tabs', render(root) {
    const st = S(), c = chr();
    function draw() {
      const own = st.owned.length;
      root.innerHTML = `<div class="home">
        <div class="home-stage"><div class="home-scene">${K.art.homeScene(c.id, st.owned, newest)}<div class="home-char">${K.art.char(c.id, 'happy')}</div></div></div>
        <div class="home-head"><div><h2 class="h-big">הבית שלי</h2><p class="sub">${own ? `קישטת ${own} דברים מתוך ${K.SHOP.length}` : 'אספי מטבעות בתרגול וקשטי את הטירה!'}</p></div>
          <div class="coin-pill">${I().coin}<b id="coinBal">${st.coins}</b></div></div>
        <div class="shop" role="list">${K.SHOP.map(it => {
          const has = st.owned.includes(it.id), can = st.coins >= it.price;
          return `<button class="shop-item${has ? ' owned' : ''}${!has && !can ? ' cant' : ''}" data-id="${it.id}" role="listitem" ${has ? 'disabled' : ''} aria-label="${it.name}, ${has ? 'כבר בבית' : it.price + ' מטבעות'}">
            <span class="si-emoji">${it.emoji}</span><b>${it.name}</b>
            <span class="si-price">${has ? `<span class="si-own">${I().check} בבית</span>` : `${I().coin}<em>${it.price}</em>`}</span></button>`; }).join('')}</div>
        <div class="home-actions"><button class="btn btn-secondary" id="chg">החלפת דמות</button></div></div>`;
      $$('.shop-item', root).forEach(b => b.onclick = () => {
        const it = K.SHOP.find(x => x.id === b.dataset.id);
        if (K.store.buy(it.id)) {
          A('buy'); newest = it.id; K.ui.updateHud(); draw();
          setTimeout(() => { const el = $('.home-scene .pop-in') || $('.home-scene'); burstAt(el, { count: 50, stars: true }); }, 60);
          toast(`${it.name} נוסף לבית!`);
        } else { A('wrong'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 500); toast(`חסרים עוד ${it.price - st.coins} מטבעות. תרגול קצר יעזור!`); }
      });
      $('#chg').onclick = () => {
        const s = sheet(`<h2 class="center">מי יהיה איתך במסע?</h2><div class="char-cards compact">${Object.values(K.CHARACTERS).map(x => `<button class="char-card${x.id === st.char ? ' on' : ''}" data-c="${x.id}"><div class="cc-art">${K.art.char(x.id, 'happy')}</div><b>${x.name}</b></button>`).join('')}</div>`);
        $$('.char-card', s.el).forEach(b => b.onclick = () => { st.char = b.dataset.c; K.store.save(); A('pop'); s.close(); K.ui.updateHud(); K.ui.render(); });
      };
    }
    draw();
    return () => { newest = null; };
  } });
})();
