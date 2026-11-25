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
          : `<button class="btn btn-primary btn-lg" id="start" style="width:min(100%,420px)">המשימה הראשונה: מה זה כפל?</button><button class="btn btn-ghost" id="skip">אני כבר מכירה, ישר להתחיל</button>`}</div>
      </div>`;
      if (i === 2) setTimeout(() => confetti({ y: innerHeight * .35, count: 40, stars: true }), 300);
      const nx = $('#nx'); if (nx) nx.onclick = () => { A('pop'); i++; draw(); };
      const st = $('#start'); if (st) st.onclick = () => { S().onboarded = true; K.store.save(); A('fanfare'); go('intro'); };
      const sk = $('#skip'); if (sk) sk.onclick = () => { S().onboarded = true; S().introDone = true; K.store.save(); go('hub'); };
    }
    draw();
  } });

  /* ---------------- mission helpers (shared with hub in K.mission) ---------------- */
  const recTable = () => K.mission.recTable();
  const nextMission = () => K.mission.kefelNext();
  const startMission = m => K.mission.start(m);
  const dailyCard = () => K.mission.dailyCard();

  /* ---------------- map ---------------- */
  route('map', { chrome: 'tabs', render(root) {
    K.mission.setWorld('kefel');
    const st = S(), c = chr(), mission = nextMission(), P = K.art.NODES, CP = K.art.CHAMP;
    const pct = ([x, y]) => `left:${(x / 400 * 100).toFixed(2)}%;top:${(y / 900 * 100).toFixed(2)}%`;
    const nodeFor = t => {
      const T = K.TABLES[t], ts = K.store.tstate(t), rec = mission.node === t, ord = K.ORDER.indexOf(t) + 1;
      return `<button class="node open${rec ? ' rec' : ''}" style="${pct(P[t])};--nc:${T.color}" data-t="${t}" aria-label="טבלת ה-${t}, ${ts.stars} כוכבים מתוך 3${rec ? ', מומלץ עכשיו' : ''}">
        <span class="node-num">${t}</span><span class="node-ord" aria-hidden="true">${ord}</span><span class="node-stars">${K.ui.starsRow(ts.stars, 3, 'sm')}</span>
        ${rec ? `<span class="guide ${P[t][0] < 200 ? 'gr' : 'gl'}">${K.ui.avatar(c.id)}<em>${mission.kind === 'practice' ? 'מומלץ!' : 'הבא בתור!'}</em></span>` : ''}</button>`;
    };
    const champFor = a => { const m = st.medals[a.id]; return `<button class="node champ${m ? ' won ' + m : ''}" style="${pct(CP[a.id])}" data-area="${a.id}" aria-label="אתגר האלופה: ${a.name}${m ? ', מדליית ' + K.MEDALS[m].name : ''}"><span class="champ-f" aria-hidden="true">${a.friend.emoji}</span><span class="champ-m" aria-hidden="true">${m ? K.MEDALS[m].emoji : '🏆'}</span></button>`; };
    root.innerHTML = `<div class="map-layout">
      <aside class="map-side">
        ${K.mission.nowCard(mission, c)}
        <div class="map-tools">
          <button class="tool-btn" id="toExp" type="button">${I().grid}<span>לוח הכפל</span></button>
          <button class="tool-btn" id="toIntro" type="button">${I().book}<span>מה זה כפל?</span></button>
        </div>
      </aside>
      <section class="map-wrap" aria-label="מפת הממלכה"><div class="map">
        ${K.art.mapScene()}
        <button class="node gate open${mission.node === 'gate' ? ' rec' : ''}" style="${pct(P.gate)}" data-t="gate" aria-label="שער הממלכה: מה זה כפל?">
          <span class="node-num">${I().book}</span><span class="node-label">${st.introDone ? 'מה זה כפל? ✓' : 'מה זה כפל?'}</span>
          ${mission.node === 'gate' ? `<span class="guide">${K.ui.avatar(c.id)}<em>התחילי כאן!</em></span>` : ''}</button>
        ${K.TABLE_LIST.map(nodeFor).join('')}
        ${K.AREAS.map(champFor).join('')}
      </div></section>
    </div>`;
    $('#mission').onclick = () => { A('pop'); startMission(mission); };
    const dl = $('#daily'); if (dl) dl.onclick = () => { A('pop'); go('practice/daily'); };
    $('#toExp').onclick = () => { A('pop'); go('explorer'); };
    $('#toIntro').onclick = () => { A('pop'); go('intro'); };
    if (K.examUI) K.examUI.bindExam(root);
    $$('.node', root).forEach(n => n.onclick = () => {
      A('pop');
      if (n.dataset.area) return areaSheet(n.dataset.area);
      const t = n.dataset.t;
      if (t === 'gate') return go('intro');
      tableSheet(Number(t));
    });
    // bring the recommended node into view only when it is off-screen (keeps the daily card visible on phones)
    setTimeout(() => { const r = $('.node.rec', root); if (r) { const b = r.getBoundingClientRect(); if (b.bottom > innerHeight - 90 && innerWidth >= 900) r.scrollIntoView({ block: 'center', behavior: 'auto' }); } }, 60);
  } });

  function areaSheet(id) {
    const a = K.AREAS.find(x => x.id === id), m = S().medals[id], M = m ? K.MEDALS[m] : null;
    if (!S().friends.includes(id)) { S().friends.push(id); K.store.save(); }
    const s = sheet(`<div class="tsheet asheet">
      <div class="friend-big" aria-hidden="true">${a.friend.emoji}</div>
      <h2>${a.emoji} ${a.name}</h2>
      ${K.ui.bubble(`<b>${a.friend.name}:</b> ${a.friend.line}`)}
      <div class="a-tables">${a.tables.map(t => `<button class="oc" style="--nc:${K.TABLES[t].color}" data-t="${t}" aria-label="טבלת ה-${t}">${t}</button>`).join('')}</div>
      <div class="champ-box"><span class="champ-medal" aria-hidden="true">${M ? M.emoji : '🏆'}</span><div><b>אתגר האלופה</b><small>${M ? `יש לך מדליית ${M.name}! אפשר לנסות לשפר.` : `מבחן מעורב של ${a.tables.length > 1 ? 'טבלאות ' + a.tables.join(', ') : 'טבלת ה-' + a.tables[0]}. מדליה מוסיפה לכתר את ${a.piece.name}.`}</small><small class="muted">ארד 55% · כסף 75% · זהב 90%</small></div></div>
      <div class="tsheet-actions"><button class="btn btn-primary btn-lg" id="champ">🏆 לאתגר!</button><button class="btn btn-secondary btn-lg" id="ag">🎈 משחק באזור</button></div></div>`);
    $('#champ', s.el).onclick = () => { s.close(); go('practice/champ-' + id); };
    $('#ag', s.el).onclick = () => { s.close(); go('games/area-' + id); };
    $$('.a-tables .oc', s.el).forEach(b => b.onclick = () => { s.close(); setTimeout(() => tableSheet(Number(b.dataset.t)), 320); });
  }

  function masteryChips(t) {
    return `<div class="mchips" role="img" aria-label="מפת שליטה בעובדות הכפל של הטבלה">${Array.from({ length: 10 }, (_, i) => {
      const f = K.store.fact(t, i + 1), lvl = !f.seen ? 'new' : f.box <= 1 ? 'weak' : f.box <= 3 ? 'mid' : 'good';
      return `<span class="mchip ${lvl}" title="${t} × ${i + 1}">${i + 1}</span>`; }).join('')}</div>
      <div class="mlegend"><span><i class="mchip new"></i>חדש</span><span><i class="mchip weak"></i>לחזק</span><span><i class="mchip mid"></i>כמעט</span><span><i class="mchip good"></i>שולטת</span></div>`;
  }

  function tableSheet(t) {
    const T = K.TABLES[t], ts = K.store.tstate(t);
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
        <button class="btn btn-secondary btn-lg" id="gm">🎈 משחקים</button>
      </div></div>`);
    $('#gm', s.el).onclick = () => { s.close(); go('games/' + t); };
    $('#les', s.el).onclick = () => { s.close(); go('lesson/' + t); };
    $('#prac', s.el).onclick = () => { s.close(); go('practice/' + t); };
  }

  /* ---------------- castle home ---------------- */
  let newest = null;
  route('home', { chrome: 'tabs', render(root) {
    const st = S(), c = chr();
    let cat = (st.home.view === 'room' ? 'furniture' : 'garden'), placing = null, unmount = null, doCheer = false;
    const view = () => st.home.view === 'room' ? 'room' : 'yard';
    function draw() {
      if (unmount) { unmount(); unmount = null; }
      const own = st.owned.length, total = K.SHOP.length, pieces = K.store.crownPieces();
      const items = K.SHOP.filter(it => it.cat === cat);
      const pIt = placing ? K.SHOP.find(x => x.id === placing) : null;
      const pg = K.chest.progress();
      const hint = view() === 'room' ? K.chest.hint(placing) : (placing && pIt ? `בחרי מקום ל${pIt.name}` : '');
      const sceneInner = view() === 'room' ? '' : `${K.art.homeScene(c.id, st.owned, newest, { view: view(), placing })}<div class="home-char">${K.art.char(c.id, 'happy')}</div>`;
      root.innerHTML = `<div class="home">
        <div class="home-top">
          <div class="seg" role="tablist" aria-label="איפה בבית"><button role="tab" class="${view() === 'yard' ? 'on' : ''}" data-v="yard" aria-selected="${view() === 'yard'}">🏰 בחוץ</button><button role="tab" class="${view() === 'room' ? 'on' : ''}" data-v="room" aria-selected="${view() === 'room'}">🛋️ החדר שלי</button></div>
          <div class="coin-pill" id="homeCoins">${I().coin}<b id="coinBal">${st.coins}</b></div></div>
        ${K.chest.barHTML(pg)}
        <div class="home-stage${placing ? ' is-placing' : ''}"><div class="home-scene${view() === 'room' ? ' room-scene' : ''}" id="homeScene">${sceneInner}</div>
          ${hint ? `<p class="room-hint">${hint}</p>` : ''}
          ${placing ? `<div class="place-bar"><span>${pIt.emoji} בחרי מקום ל${pIt.name}</span><button class="btn btn-secondary btn-lg" id="store">לאחסון</button><button class="btn btn-primary btn-lg" id="donePl">סיימתי</button></div>` : ''}</div>
        <div class="home-head home-head-slim"><p class="sub">${own ? `יש לך ${own} מתוך ${total}. בחרי פריט לשים בחדר.` : 'אספי מטבעות בשיעורים וקשטי את החדר!'}</p></div>
        <div class="chip-row cats" role="tablist">${K.SHOP_CATS.map(x => `<button class="chip${x.id === cat ? ' on' : ''}" data-cat="${x.id}" role="tab" aria-selected="${x.id === cat}">${x.emoji} ${x.name}</button>`).join('')}</div>
        <div class="shop shop-tray" role="list">${items.map(it => {
          const has = st.owned.includes(it.id), can = st.coins >= it.price, open = K.store.unlocked(it), movable = has && !!K.SLOTS[it.zone];
          const placedNow = movable && (st.home.place[it.id] != null || (st.home.xy && st.home.xy[it.id]));
          const need = !has && open && !can ? it.price - st.coins : 0;
          const price = has ? `<span class="si-own">${I().check} ${movable ? (placedNow ? 'להזיז' : 'במחסן') : 'בבית'}</span>`
            : !open ? `<span class="si-need">🏅 ${K.store.needText(it)}</span>`
            : need ? `<span class="si-price short">עוד ${need} ${I().coin}</span>`
            : it.price ? `<span class="si-price ok">${I().coin}<em>${it.price}</em></span>` : '<em>מתנה</em>';
          const cls = `shop-item${has ? ' owned' : ''}${!has && (!can || !open) ? ' cant' : ''}${!has && can && open ? ' afford' : ''}${!open && !has ? ' locked' : ''}`;
          const label = has ? (movable ? 'לחיצה להזזה' : 'כבר בבית') : !open ? K.store.needText(it) : need ? `עוד ${need} מטבעות` : it.price + ' מטבעות, אפשר לקנות';
          return `<button class="${cls}" data-id="${it.id}" role="listitem" ${has && !movable ? 'disabled' : ''} aria-label="${it.name}, ${label}">
            <span class="si-emoji">${it.emoji}</span><b>${it.name}</b>
            ${has || !open ? `<span class="si-price">${price}</span>` : price}</button>`; }).join('')}</div>
        <div class="crown-row card">${K.art.crown()}<div><b>הכתר של הממלכה</b><small>${pieces === K.AREAS.length ? 'הכתר שלם! אפשר להציב אותו על הטירה (בקטגוריית הטירה).' : `${pieces} מתוך ${K.AREAS.length} חלקים. כל מדליה באתגר האלופה של אזור מוסיפה חלק.`}</small><div class="pieces">${K.AREAS.map(a => `<span class="${st.medals[a.id] ? 'on' : ''}" style="--pc:${a.piece.color}">${st.medals[a.id] ? K.MEDALS[st.medals[a.id]].emoji : '◇'} ${a.piece.name}</span>`).join('')}</div></div></div>
        <div class="home-actions"><button class="btn btn-secondary" id="chg">החלפת דמות</button></div></div>`;
      $$('.seg button', root).forEach(b => b.onclick = () => { st.home.view = b.dataset.v; placing = null; if (b.dataset.v === 'room') cat = 'furniture'; else if (cat === 'furniture') cat = 'garden'; K.store.save(); A('tap'); draw(); });
      $$('.cats .chip', root).forEach(b => b.onclick = () => { cat = b.dataset.cat; A('tap'); draw(); });
      function afterPlace(id, slot) {
        if (slot === 'refresh') { A('pop'); draw(); return; }
        if (slot === 'xy') { if (id) { newest = id; K.chest.clearSparkle(id); doCheer = true; } A('pop'); draw(); return; }
        K.store.place(id, slot);
        if (st.home.xy) delete st.home.xy[id];
        K.store.save();
        newest = id; placing = null;
        if (id) K.chest.clearSparkle(id);
        doCheer = true;
        A('pop'); draw();
      }
      $$('.home-svg .slot', root).forEach(g => g.onclick = () => { afterPlace(placing, Number(g.dataset.slot)); });
      const sto = $('#store', root); if (sto) sto.onclick = () => { K.store.place(placing, null); placing = null; A('tap'); draw(); };
      const dn = $('#donePl', root); if (dn) dn.onclick = () => { placing = null; draw(); };
      if (view() === 'room') { unmount = K.room.mount($('#homeScene', root), { placing, newest, cheer: doCheer && !placing, onPlace: afterPlace }); doCheer = false; }
      $$('.shop-item', root).forEach(b => b.onclick = () => {
        const it = K.SHOP.find(x => x.id === b.dataset.id);
        if (st.owned.includes(it.id)) {
          if (!K.SLOTS[it.zone]) return;
          const v = it.zone === 'yard' ? 'yard' : 'room';
          st.home.view = v; placing = it.id; newest = null; A('pop'); draw();
          $('.home-stage', root).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          return;
        }
        if (!K.store.unlocked(it)) { A('wrong'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 500); toast(`${it.name}: ${K.store.needText(it)} באתגר האלופה. 🏆`); return; }
        if (K.store.buy(it.id)) {
          A('buy'); newest = it.id; doCheer = true;
          if (K.SLOTS[it.zone]) st.home.view = it.zone === 'yard' ? 'yard' : 'room';
          else st.home.view = 'yard';
          K.store.save(); K.ui.updateHud(); draw();
          $('.home-stage', root).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          setTimeout(() => { const el = $('.home-scene .pop-in, .home-scene .room-item.pop') || $('.home-scene'); burstAt(el, { count: 50, stars: true }); }, 60);
          toast(K.SLOTS[it.zone] && st.home.place[it.id] == null && !(st.home.xy && st.home.xy[it.id]) ? `${it.name} במחסן: אין מקום פנוי. לחצי עליה כדי להחליף מקום.` : `${it.name} נוסף לבית! אפשר ללחוץ עליו כדי להזיז.`);
        } else { A('wrong'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 500); toast(`חסרים עוד ${it.price - st.coins} מטבעות. תרגול קצר יעזור!`); }
      });
      $('#chg').onclick = () => {
        const s = sheet(`<h2 class="center">מי יהיה איתך במסע?</h2><div class="char-cards compact">${Object.values(K.CHARACTERS).map(x => `<button class="char-card${x.id === st.char ? ' on' : ''}" data-c="${x.id}"><div class="cc-art">${K.art.char(x.id, 'happy')}</div><b>${x.name}</b></button>`).join('')}</div>`);
        $$('.char-card', s.el).forEach(b => b.onclick = () => { st.char = b.dataset.c; K.store.save(); A('pop'); s.close(); K.ui.updateHud(); K.ui.render(); });
      };
    }
    draw();
    return () => { if (unmount) unmount(); newest = null; };
  } });
})();
