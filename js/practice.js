/* Practice session (adaptive) + results screen. */
(function () {
  const { $, $$, h, go, route, esc, confetti, burstAt, arrayHTML, explainHTML } = K.ui;
  const I = () => K.art.icons;
  const A = (n, v) => K.audio.play(n, v);
  const pickMsg = arr => arr[Math.floor(Math.random() * arr.length)];

  route('practice', { chrome: 'flow', render(root, tArg) {
    /* modes: a table number · 'daily' (weakest facts, ~5 min) · 'champ-<area>' (mixed test → medal) */
    const mode = tArg === 'daily' ? 'daily' : String(tArg || '').startsWith('champ-') ? 'champ' : 'table';
    const area = mode === 'champ' ? K.AREAS.find(a => a.id === tArg.slice(6)) : null;
    if (mode === 'champ' && !area) return go('map', true);
    const t = mode === 'table' ? Number(tArg) : 0, T = mode === 'table' ? K.TABLES[t] : { color: mode === 'daily' ? '#2fc79a' : '#ffb81f' };
    if (mode === 'table' && (!K.TABLES[t] || !T.ready)) return go('map', true);
    const st = K.store.state, c = K.CHARACTERS[st.char] || K.CHARACTERS.bear;
    const levelBefore = t ? K.store.tstate(t).level : 0, starsBefore = t ? K.store.tstate(t).stars : 0;
    let sess;
    if (mode === 'table') sess = new K.engine.Session(t, 6);
    else if (mode === 'daily') sess = new K.engine.Session(null, 10, { pool: K.store.pickFacts(K.store.activeTables(), 8, { weakest: true, noOnes: true }) });
    else sess = new K.engine.Session(null, area.tables.length > 1 ? 10 : 8, { pool: area.tables.flatMap(x => Array.from({ length: 10 }, (_, i) => ({ t: x, m: i + 1 }))), noRetry: true, level: 3 });
    const noHint = mode === 'champ';
    let q = null, hinted = false, locked = false, typed = '', sel = null, counted = 0, qn = 0;
    root.style.setProperty('--tc', T.color);
    root.innerHTML = `<div class="flow practice">
      <header class="flow-bar"><button class="icon-btn" id="x" aria-label="יציאה">${I().close}</button>
        <div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="התקדמות בסבב"><i id="pf"></i></div>
        <span class="streak-chip" id="sc" aria-label="רצף תשובות נכונות">${I().flame}<b>0</b></span></header>
      <div class="p-body">
        <div class="coach small"><div class="coach-char" id="pc"></div><div id="pb"></div></div>
        <div class="qcard" id="q"></div>
        <div class="answers" id="ans"></div>
      </div>
      <div class="feedback" id="fb" aria-live="assertive"></div></div>`;
    const $q = $('#q', root), $ans = $('#ans', root), $fb = $('#fb', root);

    const coach = (mood, text) => { $('#pc', root).innerHTML = K.art.char(c.id, mood); $('#pb', root).innerHTML = K.ui.bubble(text); };
    const setProgress = () => { const p = Math.round(sess.progress * 100); $('#pf', root).style.width = Math.max(4, p) + '%'; $('.pbar', root).setAttribute('aria-valuenow', p); };
    const setStreak = () => { const el = $('#sc', root); $('b', el).textContent = sess.run; el.classList.toggle('on', sess.run >= 2); el.classList.remove('pop'); void el.offsetWidth; if (sess.run) el.classList.add('pop'); };

    function prompts(q) {
      const ask = {
        choice: 'מה התוצאה?', array: 'כמה עיגולים יש בסך הכול? לחצי על כל שורה כדי לספור.', missing: 'איזה מספר חסר?',
        eq: 'כמה שורות וכמה עיגולים בכל שורה? בחרי את התרגיל שמתאים לתמונה.', story: 'קראי ופתרי.', numpad: 'כתבי את התוצאה.'
      };
      return ask[q.type];
    }
    const blank = txt => `<span class="blank" id="blank">${txt}</span>`;

    function drawQuestion() {
      q = sess.next(); hinted = false; locked = false; typed = ''; sel = null; counted = 0; qn++;
      setProgress();
      const moods = ['happy', 'think'];
      const firstLine = mode === 'champ' ? `אתגר האלופה של ${area.name}! בלי רמזים הפעם, אבל בלי שעון. את יכולה!` : mode === 'daily' ? 'התרגול היומי שלך: התרגילים שהכי כדאי לחזק. תחשבי בנחת, ואפשר לבקש רמז.' : 'אין שעון ואין לחץ. תחשבי בנחת, ואפשר לבקש רמז.';
      coach(q.retry ? 'think' : (qn === 1 ? 'happy' : pickMsgMood()), q.retry ? K.MSG.retry : (qn === 1 ? firstLine : prompts(q)));
      let body = '';
      const op = (a, b, r) => `<div class="eq q" dir="ltr"><span>${a}</span><span>×</span><span>${b}</span><span>=</span>${r}</div>`;
      if (q.type === 'choice') body = op(q.a, q.b, '<b class="qm">?</b>');
      else if (q.type === 'numpad') body = op(q.a, q.b, blank('?'));
      else if (q.type === 'missing') {
        const bl = q.input === 'numpad' ? blank('?') : '<b class="qm">?</b>';
        body = op(q.unknown === 'a' ? bl : q.a, q.unknown === 'b' ? bl : q.b, q.ans);
      } else if (q.type === 'array') body = `<div class="arr-count"><span>סופרים:</span><b id="cn">0</b></div><div class="arr-wrap">${arrayHTML(q.a, q.b, { interactive: true, cls: 'arr-q' })}</div><p class="arr-hint">${q.a} שורות, ובכל שורה ${q.b} עיגולים</p>`;
      else if (q.type === 'eq') body = `<div class="arr-wrap">${arrayHTML(q.a, q.b, { cls: 'arr-q' })}</div>`;
      else if (q.type === 'story') body = `<div class="story-card"><span class="story-emoji" aria-hidden="true">${q.story.emoji}</span><p>${q.story.text(q.a, q.b)}</p>${q.input === 'numpad' ? `<div class="eq q" dir="ltr">${blank('?')}</div>` : ''}</div>`;
      const small = q.type === 'array' || q.type === 'eq' || q.type === 'story';
      $q.className = 'qcard enter' + (small ? ' roomy' : '');
      $q.innerHTML = `<p class="q-ask">${prompts(q)}</p>${body}<div id="hintbox"></div>
        ${noHint ? '' : `<button class="hint-btn" id="hint">${I().bulb} רמז</button>`}`;
      if (!noHint) $('#hint', root).onclick = showHint;
      // interactive rows count
      if (q.type === 'array') $$('.arr-row', $q).forEach(r => r.onclick = () => {
        if (locked) return; const i = Number(r.dataset.r) + 1; counted = i;
        $$('.arr-row', $q).forEach((x, k) => x.classList.toggle('counted', k < i)); $('#cn', $q).textContent = i * q.b; A('dot', i);
      });
      // answers
      if (q.input === 'choice') {
        $ans.className = 'answers choices' + (q.type === 'eq' ? ' eqs' : '');
        $ans.innerHTML = q.choices.map((v, i) => `<button class="choice" data-i="${i}" data-v="${v}"><span dir="ltr">${v}</span></button>`).join('');
        $$('.choice', $ans).forEach(b => b.onclick = () => { if (locked) return; A('tap'); submit(q.type === 'eq' ? b.dataset.v : Number(b.dataset.v), b); });
      } else {
        $ans.className = 'answers';
        $ans.innerHTML = `<div class="numpad" dir="ltr">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" data-k="${n}">${n}</button>`).join('')}
          <button class="key key-del" data-k="del" aria-label="מחיקה">${I().del}</button><button class="key" data-k="0">0</button><button class="key key-ok" data-k="ok" aria-label="בדיקה" disabled>${I().check}</button></div>`;
        $$('.key', $ans).forEach(b => b.onclick = () => key(b.dataset.k));
      }
      $q.classList.remove('shake');
    }
    const pickMsgMood = () => (sess.run >= 2 ? 'cheer' : 'happy');

    function key(k) {
      if (locked) return;
      if (k === 'del') typed = typed.slice(0, -1);
      else if (k === 'ok') { if (typed) submit(Number(typed)); return; }
      else if (typed.length < 3) typed += k;
      A('tap');
      const bl = $('#blank', $q); if (bl) { bl.textContent = typed || '?'; bl.classList.toggle('filled', !!typed); }
      const ok = $('.key-ok', $ans); if (ok) ok.disabled = !typed;
    }

    function showHint() {
      if (locked) return;
      const box = $('#hintbox', $q); if (box.innerHTML) return;
      hinted = true; A('pop');
      if (q.type === 'missing') {
        const known = q.unknown === 'a' ? q.b : q.a, n = q.ans / known;
        const chips = Array.from({ length: Math.min(10, Math.max(n, 1)) }, (_, i) => `<span class="chip-n" style="--i:${i}">${(i + 1) * known}</span>`).join('<span class="chip-sep">‹</span>');
        box.innerHTML = `<div class="hint-box"><p>סופרים בקפיצות של ${known} עד ${q.ans}:</p><div class="skip" dir="ltr">${chips}</div><p>כמה קפיצות היו?</p></div>`;
      } else if (q.type === 'array') {
        box.innerHTML = `<div class="hint-box"><div class="skip" dir="ltr">${Array.from({ length: q.a }, (_, i) => `<span class="chip-n" style="--i:${i}">${(i + 1) * q.b}</span>`).join('<span class="chip-sep">‹</span>')}</div></div>`;
      } else if (q.type === 'eq') {
        box.innerHTML = `<div class="hint-box"><p>סופרים שורות: <b>${q.a}</b>. עיגולים בכל שורה: <b>${q.b}</b>.</p></div>`;
      } else {
        box.innerHTML = `<div class="hint-box">${explainHTML(q.a, q.b, { showAnswer: false })}</div>`;
        K.ui.tickExplain(box);
      }
      $('#hint', root).disabled = true;
    }

    function submit(value, btn) {
      locked = true;
      const correct = String(value) === String(q.answer);
      sess.report(q, { correct, hinted });
      setStreak(); setProgress();
      if (btn) btn.classList.add(correct ? 'right' : 'miss');
      $$('.choice', $ans).forEach(b => { b.disabled = true; if (String(b.dataset.v) === String(q.answer)) b.classList.add('right'); });
      $$('.key', $ans).forEach(b => b.disabled = true);
      const bl = $('#blank', $q); if (bl) { bl.classList.add(correct ? 'right' : 'miss'); if (!correct) setTimeout(() => { bl.textContent = q.answer; bl.classList.add('reveal'); }, 400); }
      const qm = $('.qm', $q); if (qm) { qm.textContent = q.answer; qm.classList.add(correct ? 'right' : 'reveal'); }
      if ($('#hint', root)) $('#hint', root).disabled = true;
      if (correct) {
        A('right'); burstAt(btn || bl || $q, { count: 34 });
        const streakMsg = sess.run >= 3 ? K.MSG.streak(sess.run) : '';
        const msg = hinted ? pickMsg(K.MSG.rightHint) : pickMsg(K.MSG.right);
        coach('cheer', streakMsg || msg);
        feedback(true, msg, streakMsg || `${q.a} × ${q.b} = ${q.ans}`);
      } else {
        A('wrong'); $q.classList.add('shake');
        const msg = pickMsg(K.MSG.wrong);
        coach('oops', msg);
        feedback(false, msg, '');
      }
    }

    function tipFor(q) {
      const o = q.a === q.t ? q.b : q.a, tip = x => `<p class="fb-tip">${I().bulb} ${x}</p>`;
      if (q.t === 5) return tip(`שיטת היד: סופרים יד אחת, ${o} פעמים: <b dir="ltr">${Array.from({ length: o }, (_, i) => (i + 1) * 5).join(', ')}</b>`);
      if (q.t === 10) return tip('כפל ב-10: כותבים את המספר ומוסיפים 0 בסוף.');
      if (q.t === 2) return tip(`כפל ב-2 זה להכפיל: ${o} + ${o}.`);
      if (q.t === 1) return tip('כפל ב-1: המספר נשאר אותו מספר.');
      if (q.t === 4) return tip(`מכפילים ומכפילים שוב: <b dir="ltr">${o} → ${2 * o} → ${4 * o}</b>`);
      if (q.t === 9) return tip(`טריק האצבעות: מקפלים את אצבע ${o}. לפניה ${o - 1} (עשרות), אחריה ${10 - o} (אחדות): <b dir="ltr">${o * 9}</b>`);
      if (K.TABLES[q.t] && K.TABLES[q.t].split) { const p = K.TABLES[q.t].split; return tip(`מפרקים: <b dir="ltr">${p}×${o} + ${q.t - p}×${o} = ${p * o} + ${(q.t - p) * o} = ${q.t * o}</b>`); }
      return '';
    }

    function feedback(ok, title, sub) {
      const last = sess.done;
      let inner;
      if (ok) inner = `<div class="fb-head"><span class="fb-ic">${I().check}</span><div><h3>${title}</h3><p>${sub}</p></div></div>`;
      else inner = `<div class="fb-head"><span class="fb-ic oops">?</span><div><h3>${title}</h3></div></div>${explainHTML(q.a, q.b)}${tipFor(q)}`;
      $fb.className = 'feedback show ' + (ok ? 'ok' : 'oops');
      $fb.innerHTML = `<div class="fb-in">${inner}<button class="btn ${ok ? 'btn-good' : 'btn-primary'} btn-lg" id="cont">${last ? 'לסיום וקבלת הפרס' : (ok ? 'המשך' : 'הבנתי, ממשיכים')}</button></div>`;
      $('#cont', root).onclick = next; $('#cont', root).focus({ preventScroll: true });
      if (!ok) K.ui.tickExplain($fb);
      K.ui.say(ok ? title : title + ' ' + q.a + ' כפול ' + q.b + ' שווה ' + q.ans);
    }

    function next() {
      A('whoosh');
      $fb.className = 'feedback';
      if (sess.done) return finish();
      drawQuestion();
    }

    function finish() {
      const s = sess.summary(), acc = s.n ? s.ok / s.n : 0, perfect = s.ok === s.n;
      const bonusGame = Math.random() < (mode === 'daily' ? 1 : .45);
      if (mode === 'table') {
        const res = K.store.finishSession(t, s.ok, s.n);
        const coins = 5 + s.ok * 2 + (perfect ? 5 : 0) + res.newStars * 5 + (res.streak.isNew ? 2 : 0);
        K.store.addCoins(coins);
        K.lastResult = { mode, t, ok: s.ok, n: s.n, coins, hardFacts: s.hardFacts, hardPairs: s.hardPairs, stars: res.stars, newStars: res.newStars, starsBefore, streak: res.streak, levelUp: res.level > levelBefore, levelDown: res.level < levelBefore, level: res.level, bonusGame };
      } else if (mode === 'daily') {
        const res = K.store.finishDaily();
        const coins = 10 + s.ok * 2 + (perfect ? 5 : 0);
        K.store.addCoins(coins);
        K.lastResult = { mode, ok: s.ok, n: s.n, coins, hardPairs: s.hardPairs, streak: res.streak, daily: res.daily, bonusGame };
      } else {
        const res = K.store.setMedal(area.id, acc), streak = K.store.touchStreak();
        const coins = 5 + s.ok * 2 + (res.better ? ({ bronze: 10, silver: 20, gold: 30 })[res.medal] : 0);
        K.store.addCoins(coins);
        K.lastResult = { mode, area: area.id, ok: s.ok, n: s.n, coins, hardPairs: s.hardPairs, streak, medal: res.medal, better: res.better, newPiece: res.newPiece, bonusGame: false };
      }
      go('result');
    }

    // keyboard support
    const onKey = e => {
      if ($fb.classList.contains('show')) { if (e.key === 'Enter') { e.preventDefault(); next(); } return; }
      if (locked || !q) return;
      if (q.input === 'numpad') { if (/^[0-9]$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('del'); else if (e.key === 'Enter') key('ok'); }
      else if (/^[1-4]$/.test(e.key)) { const b = $$('.choice', $ans)[Number(e.key) - 1]; if (b) b.click(); }
    };
    document.addEventListener('keydown', onKey);
    $('#x', root).onclick = () => { if (sess.results.length === 0 || confirm('לצאת מהתרגול? מה שענית עד עכשיו נשמר.')) go('map'); };
    if (mode !== 'table') $('.flow-bar', root).insertAdjacentHTML('beforeend', `<span class="mode-chip">${mode === 'daily' ? '📅 תרגול יומי' : '🏆 אתגר האלופה'}</span>`);
    K._q = () => q;
    drawQuestion();
    return () => document.removeEventListener('keydown', onKey);
  } });

  route('result', { chrome: 'flow', render(root) {
    const r = K.lastResult; if (!r) return go('map', true);
    const st = K.store.state, c = K.CHARACTERS[st.char] || K.CHARACTERS.bear;
    const mode = r.mode || 'table', area = r.area ? K.AREAS.find(a => a.id === r.area) : null;
    const color = mode === 'table' ? K.TABLES[r.t].color : mode === 'daily' ? '#2fc79a' : '#ffb81f';
    const acc = r.n ? r.ok / r.n : 0;
    const line = [...K.MSG.sessionEnd].reverse().find(([th]) => acc >= th)[1];
    const mood = acc >= 0.5 ? 'cheer' : 'happy';
    const cheapest = Math.min(...K.SHOP.filter(i => !st.owned.includes(i.id) && K.store.unlocked(i)).map(i => i.price), Infinity);
    const R = 54, C = 2 * Math.PI * R, M = r.medal ? K.MEDALS[r.medal] : null;
    let mid;
    if (mode === 'table') mid = `<div class="res-card"><span class="rc-stars">${K.ui.starsRow(r.stars, 3)}</span><b>טבלת ה-${r.t}</b><small>${r.newStars ? 'כוכב חדש!' : r.stars >= 3 ? 'שלושה כוכבים!' : 'כוכבים בטבלה'}</small></div>`;
    else if (mode === 'daily') mid = `<div class="res-card"><span class="rc-ic big-e">📅</span><b>${r.daily}</b><small>${r.daily > 1 ? 'ימי תרגול יומי ברצף' : 'תרגול יומי ראשון ברצף'}</small></div>`;
    else mid = `<div class="res-card"><span class="rc-ic big-e">${M ? M.emoji : '🏆'}</span><b>${M ? 'מדליית ' + M.name : 'עוד ניסיון'}</b><small>${area.name}</small></div>`;
    const title = mode === 'champ' ? (M ? (r.medal === 'gold' ? 'אלופה אמיתית!' : 'כל הכבוד, אלופה!') : 'כמעט מדליה!') : acc === 1 ? 'מושלם!' : acc >= .5 ? 'כל הכבוד!' : 'עבודה יפה!';
    const sub = mode === 'champ'
      ? (M ? `זכית במדליית ${M.name} באתגר של ${area.name}!${r.newPiece ? ` קיבלת חלק חדש לכתר: ${area.piece.name}!` : ''}` : `צריך ${Math.ceil(K.MEDALS.bronze.min * r.n)} תשובות נכונות למדליה. בואי נחזק קצת ונחזור לאתגר!`)
      : mode === 'daily' ? `סיימת את התרגול היומי! ${line}` : line;
    const pairs = (r.hardPairs || []).slice(0, 6);
    const bonus = r.bonusGame ? (mode === 'daily' ? 'memory' : K.engine.pick(['balloon', 'memory', 'race'])) : null;
    const scope = mode === 'table' ? String(r.t) : mode === 'champ' ? 'area-' + r.area : 'all';
    const G = bonus ? K.GAMES[bonus] : null;
    root.style.setProperty('--tc', color);
    root.innerHTML = `<div class="result">
      <div class="res-char">${K.art.char(c.id, mood)}</div>
      <h2 class="h-big">${title}</h2>
      <p class="sub">${sub}</p>
      ${mode === 'champ' && M ? `<div class="medal-big ${r.medal}" aria-hidden="true">${M.emoji}</div>` : `<div class="res-ring"><svg viewBox="0 0 130 130"><circle cx="65" cy="65" r="${R}" class="rr-bg"/><circle cx="65" cy="65" r="${R}" class="rr-fg" id="rr" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><div class="rr-txt"><b>${r.ok}</b><small>מתוך ${r.n}</small><em>נכון בניסיון ראשון</em></div></div>`}
      ${mode === 'champ' && r.newPiece ? `<div class="res-crown">${K.art.crown(K.store.crownPieces(), r.area)}<small>${K.store.crownPieces()} מתוך ${K.AREAS.length} חלקי הכתר</small></div>` : ''}
      <div class="res-cards">
        <div class="res-card"><span class="rc-ic">${I().coin}</span><b dir="ltr">+<span id="cc">0</span></b><small>מטבעות לבית</small></div>
        ${mid}
        <div class="res-card"><span class="rc-ic">${I().flame}</span><b>${r.streak.count}</b><small>${r.streak.isNew ? (r.streak.count > 1 ? 'ימים ברצף!' : 'התחלת רצף חדש!') : 'ימים ברצף'}</small></div>
      </div>
      ${r.levelUp ? `<p class="res-note up">⬆️ עלית רמה בטבלת ה-${r.t}! מעכשיו יהיו שאלות קצת יותר מאתגרות.</p>` : ''}
      ${r.levelDown ? `<p class="res-note">נאט קצת: בסבב הבא יהיו עוד רמזים ותמונות שיעזרו.</p>` : ''}
      ${pairs.length ? `<div class="res-weak"><b>כדאי לחזק:</b> ${pairs.map(p => `<span class="fact-chip" dir="ltr">${p.t} × ${p.m}</span>`).join('')}<small>הם יחזרו בתרגול הבא, כמה שצריך.</small></div>` : ''}
      ${G ? `<button class="bonus-card" id="bonus"><span class="bc-emoji" aria-hidden="true">${G.emoji}</span><span><b>משחק בונוס: ${G.name}</b><small>${G.blurb}</small></span><span class="btn-ic">${I().back}</span></button>` : ''}
      <div class="res-actions">
        <button class="btn btn-primary btn-xl" id="again">${mode === 'champ' ? 'עוד ניסיון באתגר' : mode === 'daily' ? 'חזרה למפה' : 'עוד סבב'}</button>
        ${st.coins >= cheapest ? `<button class="btn btn-secondary btn-lg" id="shop">🛍️ לקשט את הבית</button>` : ''}
        ${mode === 'daily' ? '' : `<button class="btn btn-ghost" id="map">חזרה למפה</button>`}
      </div></div>`;
    $('#again', root).onclick = () => go(mode === 'table' ? 'practice/' + r.t : mode === 'champ' ? 'practice/champ-' + r.area : 'map');
    const sh = $('#shop', root); if (sh) sh.onclick = () => go('home');
    const mp = $('#map', root); if (mp) mp.onclick = () => go('map');
    const bn = $('#bonus', root); if (bn) bn.onclick = () => go(`game/${bonus}/${scope}`);
    const rr = $('#rr', root); if (rr) setTimeout(() => { rr.style.strokeDashoffset = C * (1 - acc); }, 100);
    K.ui.countUp($('#cc', root), r.coins, 1000);
    if (acc >= .5) setTimeout(() => confetti({ y: innerHeight * .3, count: acc === 1 || r.medal === 'gold' ? 120 : 70, power: 1.2, stars: true }), 250);
    A(r.newStars || r.better ? 'fanfare' : acc >= .5 ? 'star' : 'right');
    if (r.newStars || r.newPiece) setTimeout(() => { A('star'); }, 900);
    K.store.save();
  } });
})();
