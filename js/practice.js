/* Practice session (adaptive) + results screen. */
(function () {
  const { $, $$, h, go, route, esc, confetti, burstAt, arrayHTML, explainHTML } = K.ui;
  const I = () => K.art.icons;
  const A = (n, v) => K.audio.play(n, v);
  const pickMsg = arr => arr[Math.floor(Math.random() * arr.length)];

  route('practice', { chrome: 'flow', render(root, tArg) {
    const t = Number(tArg), T = K.TABLES[t]; if (!T || !T.ready) return go('map', true);
    const st = K.store.state, c = K.CHARACTERS[st.char] || K.CHARACTERS.bear;
    const levelBefore = K.store.tstate(t).level, starsBefore = K.store.tstate(t).stars;
    const sess = new K.engine.Session(t, 6);
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
      coach(q.retry ? 'think' : (qn === 1 ? 'happy' : pickMsgMood()), q.retry ? K.MSG.retry : (qn === 1 ? 'אין שעון ואין לחץ. תחשבי בנחת, ואפשר לבקש רמז.' : prompts(q)));
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
        <button class="hint-btn" id="hint">${I().bulb} רמז</button>`;
      $('#hint', root).onclick = showHint;
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
      $('#hint', root).disabled = true;
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
      if (q.t === 5) { const o = q.a === 5 ? q.b : q.a; return `<p class="fb-tip">${I().bulb} שיטת היד: סופרים יד אחת, ${o} פעמים: <b dir="ltr">${Array.from({ length: o }, (_, i) => (i + 1) * 5).join(', ')}</b></p>`; }
      if (q.t === 10) return `<p class="fb-tip">${I().bulb} כפל ב-10: כותבים את המספר ומוסיפים 0 בסוף.</p>`;
      if (q.t === 2) return `<p class="fb-tip">${I().bulb} כפל ב-2 זה להכפיל: ${q.a === 2 ? q.b : q.a} + ${q.a === 2 ? q.b : q.a}.</p>`;
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
      const s = sess.summary();
      const res = K.store.finishSession(t, s.ok, s.n);
      const perfect = s.ok === s.n;
      const coins = 5 + s.ok * 2 + (perfect ? 5 : 0) + res.newStars * 5 + (res.streak.isNew ? 2 : 0);
      K.store.addCoins(coins);
      K.lastResult = { t, ok: s.ok, n: s.n, coins, hardFacts: s.hardFacts, stars: res.stars, newStars: res.newStars, starsBefore, streak: res.streak, levelUp: res.level > levelBefore, levelDown: res.level < levelBefore, level: res.level };
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
    K._q = () => q;
    drawQuestion();
    return () => document.removeEventListener('keydown', onKey);
  } });

  route('result', { chrome: 'flow', render(root) {
    const r = K.lastResult; if (!r) return go('map', true);
    const st = K.store.state, c = K.CHARACTERS[st.char] || K.CHARACTERS.bear, T = K.TABLES[r.t];
    const acc = r.n ? r.ok / r.n : 0;
    const line = [...K.MSG.sessionEnd].reverse().find(([th]) => acc >= th)[1];
    const mood = acc >= 0.5 ? 'cheer' : 'happy';
    const cheapest = Math.min(...K.SHOP.filter(i => !st.owned.includes(i.id)).map(i => i.price), Infinity);
    const R = 54, C = 2 * Math.PI * R;
    root.style.setProperty('--tc', T.color);
    root.innerHTML = `<div class="result">
      <div class="res-char">${K.art.char(c.id, mood)}</div>
      <h2 class="h-big">${acc === 1 ? 'מושלם!' : acc >= .5 ? 'כל הכבוד!' : 'עבודה יפה!'}</h2>
      <p class="sub">${line}</p>
      <div class="res-ring"><svg viewBox="0 0 130 130"><circle cx="65" cy="65" r="${R}" class="rr-bg"/><circle cx="65" cy="65" r="${R}" class="rr-fg" id="rr" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><div class="rr-txt"><b>${r.ok}</b><small>מתוך ${r.n}</small><em>נכון בניסיון ראשון</em></div></div>
      <div class="res-cards">
        <div class="res-card"><span class="rc-ic">${I().coin}</span><b dir="ltr">+<span id="cc">0</span></b><small>מטבעות לבית</small></div>
        <div class="res-card"><span class="rc-stars">${K.ui.starsRow(r.stars, 3)}</span><b>טבלת ה-${r.t}</b><small>${r.newStars ? 'כוכב חדש!' : r.stars >= 3 ? 'שלושה כוכבים!' : 'כוכבים בטבלה'}</small></div>
        <div class="res-card"><span class="rc-ic">${I().flame}</span><b>${r.streak.count}</b><small>${r.streak.isNew ? (r.streak.count > 1 ? 'ימים ברצף!' : 'התחלת רצף חדש!') : 'ימים ברצף'}</small></div>
      </div>
      ${r.levelUp ? `<p class="res-note up">⬆️ עלית רמה בטבלת ה-${r.t}! מעכשיו יהיו שאלות קצת יותר מאתגרות.</p>` : ''}
      ${r.levelDown ? `<p class="res-note">נאט קצת: בסבב הבא יהיו עוד רמזים ותמונות שיעזרו.</p>` : ''}
      ${r.hardFacts.length ? `<div class="res-weak"><b>כדאי לחזק:</b> ${r.hardFacts.map(m => `<span class="fact-chip" dir="ltr">${r.t} × ${m}</span>`).join('')}<small>הם יחזרו בתרגול הבא, כמה שצריך.</small></div>` : ''}
      <div class="res-actions">
        <button class="btn btn-primary btn-xl" id="again">עוד סבב</button>
        ${st.coins >= cheapest ? `<button class="btn btn-secondary btn-lg" id="shop">🛍️ לקשט את הבית</button>` : ''}
        <button class="btn btn-ghost" id="map">חזרה למפה</button>
      </div></div>`;
    $('#again', root).onclick = () => go('practice/' + r.t);
    const sh = $('#shop', root); if (sh) sh.onclick = () => go('home');
    $('#map', root).onclick = () => go('map');
    setTimeout(() => { $('#rr', root).style.strokeDashoffset = C * (1 - acc); }, 100);
    K.ui.countUp($('#cc', root), r.coins, 1000);
    if (acc >= .5) setTimeout(() => confetti({ y: innerHeight * .3, count: acc === 1 ? 120 : 70, power: 1.2, stars: true }), 250);
    A(r.newStars ? 'fanfare' : acc >= .5 ? 'star' : 'right');
    if (r.newStars) setTimeout(() => { A('star'); }, 900);
    K.store.save();
  } });
})();
