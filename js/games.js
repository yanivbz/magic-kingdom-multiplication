/* Mini-games: balloon pop, memory pairs, race (timer optional). Facts come from the adaptive per-fact data. */
K.GAMES = {
  balloon: { emoji: '🎈', name: 'פיצוץ בלונים', blurb: 'פוצצי את הבלון עם התשובה הנכונה', color: '#ff6fae' },
  memory:  { emoji: '🃏', name: 'זוגות זיכרון', blurb: 'מצאי לכל תרגיל את התשובה שלו', color: '#4db3ff' },
  race:    { emoji: '🏁', name: 'מרוץ הכפל',   blurb: 'כמה תרגילים תפתרי? שעון רק אם תרצי', color: '#ffb81f' }
};
(function () {
  const { $, $$, go, route, confetti, burstAt, sheet } = K.ui;
  const I = () => K.art.icons;
  const A = (n, v) => K.audio.play(n, v);
  const { shuffle, pick } = K.engine;
  const S = () => K.store.state;

  function scopeTables(scope) {
    if (scope && /^\d+$/.test(scope)) return [Number(scope)];
    if (scope && scope.startsWith('area-')) { const a = K.AREAS.find(x => x.id === scope.slice(5)); if (a) return a.tables; }
    return K.store.activeTables();
  }
  function scopeName(scope) {
    if (scope && /^\d+$/.test(scope)) return `טבלת ה-${scope}`;
    if (scope && scope.startsWith('area-')) { const a = K.AREAS.find(x => x.id === scope.slice(5)); if (a) return a.name; }
    return 'הטבלאות שלך';
  }
  function choicesFor(a, b, n) {
    const ans = a * b, c = new Set();
    [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, ans + 1, ans - 1, ans + 2, ans + 10, ans - 10, a + b].forEach(x => { if (x > 0 && x !== ans && x <= 110) c.add(x); });
    return shuffle([ans, ...shuffle([...c]).slice(0, n - 1)]);
  }
  const orient = f => (Math.random() < .5 ? { a: f.t, b: f.m } : { a: f.m, b: f.t });

  /* ---------------- menu ---------------- */
  route('games', { chrome: 'tabs', render(root, scope) {
    const c = K.CHARACTERS[S().char] || K.CHARACTERS.bear;
    const g = S().games;
    const scopes = [['all', 'הטבלאות שלי'], ...K.AREAS.map(a => ['area-' + a.id, a.emoji + ' ' + a.name]), ...K.TABLE_LIST.map(t => [String(t), `טבלת ה-${t}`])];
    let sc = scope || 'all';
    function draw() {
      root.innerHTML = `<div class="games">
        <div class="games-head"><div class="mission-char">${K.art.char(c.id, 'cheer')}</div>${K.ui.bubble('בחרי משחק!')}</div>
        <div class="chip-row g-scope" role="tablist" aria-label="על מה משחקים">${scopes.map(([id, n]) => `<button class="chip${id === sc ? ' on' : ''}" data-s="${id}" role="tab" aria-selected="${id === sc}">${n}</button>`).join('')}</div>
        <div class="game-cards">${Object.entries(K.GAMES).map(([k, G]) => `<button class="game-card" data-g="${k}" style="--gc:${G.color}"><span class="gc-e" aria-hidden="true">${G.emoji}</span><b>${G.name}</b><small>${G.blurb}</small>${g[k] && g[k].best ? `<em>שיא: ${g[k].best}</em>` : ''}</button>`).join('')}</div>
      </div>`;
      $$('.g-scope .chip', root).forEach(b => b.onclick = () => { sc = b.dataset.s; A('tap'); draw(); });
      $$('.game-card', root).forEach(b => b.onclick = () => { A('pop'); go(`game/${b.dataset.g}/${sc}`); });
      const on = $('.g-scope .chip.on', root); if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
    draw();
  } });

  /* ---------------- shared shell ---------------- */
  route('game', { chrome: 'flow', render(root, kind, scope) {
    const G = K.GAMES[kind]; if (!G) return go('games', true);
    const tables = scopeTables(scope);
    root.style.setProperty('--tc', G.color);
    root.innerHTML = `<div class="flow game g-${kind}">
      <header class="flow-bar"><button class="icon-btn" id="x" aria-label="יציאה">${I().close}</button><span class="flow-title">${G.emoji} ${G.name}</span><span class="g-stat" id="gs"></span></header>
      <div class="g-body" id="gb"></div></div>`;
    $('#x', root).onclick = () => go('games/' + (scope || 'all'));
    const body = $('#gb', root), stat = html => { $('#gs', root).innerHTML = html; };
    let cleanup = null;
    function end(score, coins, line, recKind = kind) {
      K.store.addCoins(coins);
      if (K.chest) K.chest.queue(coins);
      const rec = K.store.gameResult(recKind, score);
      const c = K.CHARACTERS[S().char] || K.CHARACTERS.bear;
      stat('');
      body.innerHTML = `<div class="game-end">
        <div class="res-char">${K.art.char(c.id, 'cheer')}</div>
        <h2 class="h-big">${rec ? 'שיא חדש!' : 'כל הכבוד!'}</h2>
        <p class="result-msg">${line}</p>
        <div class="res-cards two"><div class="res-card"><span class="rc-ic">${I().coin}</span><b dir="ltr">+${coins}</b><small>מטבעות לבית</small></div><div class="res-card"><span class="rc-ic big-e">${G.emoji}</span><b>${score}</b><small>${rec ? 'שיא חדש!' : 'שיא: ' + S().games[recKind].best}</small></div></div>
        <div class="res-actions"><button class="btn btn-primary btn-xl" id="again">עוד פעם</button><button class="btn btn-secondary btn-lg" id="other">משחק אחר</button><button class="btn btn-ghost" id="map">חזרה למפה</button></div></div>`;
      A(rec ? 'fanfare' : 'star'); setTimeout(() => confetti({ y: innerHeight * .3, count: 80, stars: true }), 200);
      $('#again', root).onclick = () => K.ui.render();
      $('#other', root).onclick = () => go('games/' + (scope || 'all'));
      $('#map', root).onclick = () => go(K.mission.worldPath());
    }
    const ctx = { body, stat, end, tables, scope, setCleanup: f => { cleanup = f; } };
    GAMES[kind](ctx);
    return () => cleanup && cleanup();
  } });

  const GAMES = {
    /* ---- balloon pop ---- */
    balloon({ body, stat, end, tables }) {
      const facts = K.store.pickFacts(tables, 8, { noOnes: true });
      while (facts.length < 8) facts.push(pick(facts.length ? facts : [{ t: tables[0], m: 3 }]));
      let i = 0, firstOk = 0, wrongs = 0, timers = [];
      const colors = ['#ff6fae', '#4db3ff', '#ffc41f', '#2fc79a', '#9a6bff'];
      function round() {
        const f = facts[i], { a, b } = orient(f), ans = a * b, ch = choicesFor(a, b, 4);
        wrongs = 0;
        stat(`<b>${i + 1}</b>/${facts.length}`);
        body.innerHTML = `<div class="bp-q"><div class="eq q" dir="ltr"><span>${a}</span><span>×</span><span>${b}</span><span>=</span><b class="qm">?</b></div></div>
          <div class="bp-sky" id="sky">${ch.map((v, k) => `<button class="balloon" data-v="${v}" style="--bc:${colors[(k + i) % 5]};--x:${8 + k * 23}%;--d:${(k * .12).toFixed(2)}s;--y:${[16, 44, 26, 50][(k + i) % 4]}%;--s:${2.6 + (k * 37 % 3) * .5}s" aria-label="${v}"><span>${v}</span><i aria-hidden="true"></i></button>`).join('')}</div>`;
        $$('.balloon', body).forEach(bt => bt.onclick = () => {
          if (bt.classList.contains('popped') || bt.classList.contains('nope')) return;
          if (Number(bt.dataset.v) === ans) {
            bt.classList.add('popped'); A('pop'); A('right'); burstAt(bt, { count: 30 });
            const qm = $('.qm', body); qm.textContent = ans; qm.classList.add('right');
            if (!wrongs) firstOk++;
            K.store.recordAnswer(f.t, f.m, { correct: !wrongs, hinted: false });
            $$('.balloon', body).forEach(x => x.disabled = true);
            timers.push(setTimeout(() => { i++; if (i < facts.length) round(); else end(firstOk, 3 + firstOk * 2, `פוצצת ${firstOk} בלונים נכונים בניסיון הראשון מתוך ${facts.length}!`); }, 900));
          } else { wrongs++; bt.classList.add('nope'); A('wrong'); if (wrongs === 2) $$('.balloon', body).forEach(x => { if (Number(x.dataset.v) === ans) x.classList.add('glow'); }); }
        });
      }
      round();
      this.cleanup = () => timers.forEach(clearTimeout);
    },

    /* ---- memory pairs ---- */
    memory({ body, stat, end, tables }) {
      let facts = K.store.pickFacts(tables.length > 1 ? tables : tables.concat(K.store.activeTables()), 6, { uniqueAns: true, noOnes: true });
      const cards = shuffle(facts.flatMap((f, k) => { const { a, b } = orient(f); return [{ k, txt: `${a} × ${b}`, eq: true }, { k, txt: String(a * b) }]; }));
      let open = [], moves = 0, matched = 0, busy = false;
      stat(`מהלכים: <b id="mv">0</b>`);
      body.innerHTML = `<p class="mem-help">הפכי שני קלפים: תרגיל ותשובה שלו.</p><div class="mem" id="mem">${cards.map((c, i) => `<button class="mcard${c.eq ? ' is-eq' : ''}" data-i="${i}" aria-label="קלף ${i + 1}"><span class="mc-in"><span class="mc-back" aria-hidden="true">★</span><span class="mc-front" dir="ltr">${c.txt}</span></span></button>`).join('')}</div>`;
      const els = $$('.mcard', body);
      els.forEach(el => el.onclick = () => {
        const i = Number(el.dataset.i);
        if (busy || el.classList.contains('up')) return;
        el.classList.add('up'); A('tap'); open.push(i);
        if (open.length < 2) return;
        moves++; stat(`מהלכים: <b>${moves}</b>`);
        const [x, y] = open; open = [];
        if (cards[x].k === cards[y].k && cards[x].eq !== cards[y].eq) {
          matched++; A('right');
          [x, y].forEach(j => els[j].classList.add('match')); burstAt(els[y], { count: 24 });
          if (matched === facts.length) setTimeout(() => end(Math.max(1, 30 - moves), 6 + (moves <= 10 ? 6 : moves <= 14 ? 3 : 0), `מצאת את כל ${facts.length} הזוגות ב-${moves} מהלכים!`), 800);
        } else { busy = true; A('wrong'); setTimeout(() => { [x, y].forEach(j => els[j].classList.remove('up')); busy = false; }, 950); }
      });
    },

    /* ---- race (timer is the child's choice) ---- */
    race({ body, stat, end, tables, setCleanup }) {
      let timer = null;
      setCleanup(() => timer && clearInterval(timer));
      body.innerHTML = `<div class="race-start card"><span class="big-emoji" aria-hidden="true">🏁</span>
        <h2>מרוץ הכפל</h2><p class="lead">עונים מהר ככל שנוח לך. רוצה שעון?</p>
        <label class="switch"><input type="checkbox" id="tm"><span>⏱️ עם שעון (60 שניות)</span></label>
        <small class="muted">בלי שעון: 12 תרגילים, בקצב שלך.</small>
        <button class="btn btn-primary btn-xl" id="go">יוצאות לדרך!</button></div>`;
      $('#go', body).onclick = () => start($('#tm', body).checked);
      function start(timed) {
        const N = timed ? 60 : 12, facts = K.store.pickFacts(tables, Math.min(30, tables.length * 10), { noOnes: true });
        let qi = 0, ok = 0, left = 60, done = false, q;
        body.innerHTML = `${timed ? '<div class="race-time"><i id="rt"></i></div>' : ''}<div class="race-track" aria-hidden="true"><span class="racer" id="rc">${K.ui.avatar(S().char || 'bear')}</span><span class="flag">🏁</span></div>
          <div class="qcard race-q" id="rq"></div><div class="answers choices three" id="ra"></div>`;
        const show = () => {
          const f = facts[qi % facts.length], { a, b } = orient(f); q = { f, a, b, ans: a * b };
          $('#rq', body).innerHTML = `<div class="eq q" dir="ltr"><span>${a}</span><span>×</span><span>${b}</span><span>=</span><b class="qm">?</b></div>`;
          $('#ra', body).innerHTML = choicesFor(a, b, 3).map(v => `<button class="choice" data-v="${v}"><span dir="ltr">${v}</span></button>`).join('');
          $$('.choice', body).forEach(bt => bt.onclick = () => answer(bt));
          stat(timed ? `✔ <b>${ok}</b>` : `<b>${qi + 1}</b>/${N}`);
        };
        const move = () => { $('#rc', body).style.setProperty('--p', timed ? Math.min(1, ok / 20) : qi / N); };
        function answer(bt) {
          if (done) return;
          const right = Number(bt.dataset.v) === q.ans;
          K.store.recordAnswer(q.f.t, q.f.m, { correct: right, hinted: false });
          $$('.choice', body).forEach(x => { x.disabled = true; if (Number(x.dataset.v) === q.ans) x.classList.add('right'); });
          if (right) { ok++; A('right'); } else { bt.classList.add('miss'); A('wrong'); }
          qi++; move();
          setTimeout(() => { if (done) return; if (!timed && qi >= N) return finish(); show(); }, right ? 350 : 900);
        }
        function finish() {
          done = true; if (timer) clearInterval(timer), timer = null;
          end(ok, 2 + ok, timed ? `פתרת ${ok} תרגילים נכון ב-60 שניות!` : `פתרת ${ok} מתוך ${N} תרגילים נכון!`, timed ? 'race' : 'race0');
        }
        if (timed) {
          const t0 = Date.now();
          timer = setInterval(() => { left = 60 - (Date.now() - t0) / 1000; const el = $('#rt', body); if (el) el.style.width = Math.max(0, left / 60 * 100) + '%'; if (left <= 0) finish(); }, 200);
        }
        show(); move();
      }
    }
  };
  // balloon keeps its own timers
  const _b = GAMES.balloon; GAMES.balloon = ctx => { const o = {}; _b.call(o, ctx); ctx.setCleanup(() => o.cleanup && o.cleanup()); };
})();
