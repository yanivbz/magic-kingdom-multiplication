/* Geometry practice + results + garden champion test. */
(function () {
  const { $, $$, go, route, confetti, burstAt } = K.ui;
  const I = () => K.art.icons;
  const A = (n, v) => K.audio.play(n, v);
  const pickMsg = arr => arr[Math.floor(Math.random() * arr.length)];
  const he = id => K.GEO.ANGLE.types[id] && K.GEO.ANGLE.types[id].full;
  const heShort = id => K.GEO.ANGLE.types[id] && K.GEO.ANGLE.types[id].he;

  route('geo-practice', { chrome: 'flow', render(root, tArg) {
    const mode = String(tArg || '') === 'champ' || String(tArg || '').startsWith('champ') ? 'champ' : 'unit';
    if (mode !== 'champ' && tArg && tArg !== 'angles') return go('garden', true);
    const st = K.store.state, c = K.CHARACTERS[st.char] || K.CHARACTERS.bear;
    const levelBefore = K.geoStore.ustate('angles').level, starsBefore = K.geoStore.ustate('angles').stars;
    const sess = mode === 'champ'
      ? new K.geoEngine.Session(10, { noRetry: true, noHint: true, level: 3 })
      : new K.geoEngine.Session(8, {});
    const noHint = mode === 'champ';
    let q = null, hinted = false, locked = false, selected = [], dial = null;
    root.style.setProperty('--tc', mode === 'champ' ? '#ffb81f' : '#ff6fae');
    root.innerHTML = `<div class="flow practice geo-practice">
      <header class="flow-bar"><button class="icon-btn" id="x" aria-label="יציאה">${I().close}</button>
        <div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="התקדמות בסבב"><i id="pf"></i></div>
        <span class="streak-chip" id="sc" aria-label="רצף תשובות נכונות">${I().flame}<b>0</b></span>
        ${mode === 'champ' ? '<span class="mode-chip">🏆 אתגר האלופה</span>' : ''}</header>
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

    function destroyDial() { if (dial) { try { dial.destroy(); } catch (e) {} dial = null; } }

    function drawQuestion() {
      destroyDial();
      q = sess.next(); hinted = false; locked = false; selected = [];
      setProgress();
      const firstLine = mode === 'champ'
        ? 'אתגר האלופה של גן הצורות! בלי רמזים הפעם, אבל בלי שעון. את יכולה!'
        : 'אין שעון ואין לחץ. תחשבי בנחת, ואפשר לבקש רמז עם פינת דף.';
      coach(q.retry ? 'think' : 'happy', q.retry ? K.GEO.MSG.retry : (sess.results.length === 0 ? firstLine : q.ask));
      let body = '';
      if (q.type === 'classify') {
        body = `<div class="geo-fig">${K.geoArt.angleSVG({ deg: q.deg, rot: q.rot, size: 260, names: false })}</div>`;
      } else if (q.type === 'find-right') {
        body = `<div class="geo-fig" id="sh">${K.geoArt.shapeSVG(q.shape, { selected })}</div>`;
      } else if (q.type === 'compare') {
        body = `<div class="geo-compare">
          <button class="geo-cmp" data-v="L" aria-label="זווית ימין? זווית א">
            <span class="geo-samp-l">א</span>
            ${K.geoArt.angleSVG({ deg: q.left.deg, rot: q.left.rot, size: 200, names: false })}
          </button>
          <button class="geo-cmp" data-v="R" aria-label="זווית ב">
            <span class="geo-samp-l">ב</span>
            ${K.geoArt.angleSVG({ deg: q.right.deg, rot: q.right.rot, size: 200, names: false })}
          </button>
        </div>`;
      } else if (q.type === 'make') {
        body = `<div class="geo-stage" id="gs"></div>`;
      } else if (q.type === 'world') {
        body = `<div class="geo-fig world">${q.world.svg(280)}</div>`;
      }
      $q.className = 'qcard enter roomy';
      $q.innerHTML = `<p class="q-ask">${q.ask}</p>${body}<div id="hintbox"></div>
        ${noHint ? '' : `<button class="hint-btn" id="hint">${I().bulb} רמז</button>`}`;
      if (!noHint) $('#hint', root).onclick = showHint;

      if (q.type === 'classify' || q.type === 'world') {
        $ans.className = 'answers choices geo-kinds';
        $ans.innerHTML = q.choices.map(k => {
          const t = K.GEO.ANGLE.types[k];
          return `<button class="choice kind-${k}" data-v="${k}" style="--kc:${t.color}"><b>${t.he}</b><small>${t.full}</small></button>`;
        }).join('');
        $$('.choice', $ans).forEach(b => b.onclick = () => { if (locked) return; A('tap'); submit(b.dataset.v, b); });
      } else if (q.type === 'compare') {
        $ans.innerHTML = ''; $ans.className = 'answers';
        $$('.geo-cmp', $q).forEach(b => b.onclick = () => { if (locked) return; A('tap'); submit(b.dataset.v, b); });
      } else if (q.type === 'find-right') {
        $ans.className = 'answers';
        $ans.innerHTML = `<button class="btn btn-primary btn-lg" id="doneS">סיימתי</button>`;
        bindShape();
        $('#doneS', $ans).onclick = () => { if (locked) return; submit(selected.slice().sort((a, b) => a - b).join(','), $('#doneS', $ans)); };
      } else if (q.type === 'make') {
        $ans.className = 'answers';
        $ans.innerHTML = `<button class="btn btn-primary btn-lg" id="chk">בדיקה</button>`;
        dial = K.geoArt.mountDial($('#gs', $q), { deg: q.startDeg, rot: q.rot, size: 300, showName: false });
        $('#chk', $ans).onclick = () => {
          if (locked) return;
          const d = dial.getDeg();
          const ok = K.GEO.ANGLE.inBand(d, q.kind);
          submit(ok ? q.kind : typNow(d), $('#chk', $ans), { deg: d, ok });
        };
      }
    }

    function typNow(d) { return K.GEO.ANGLE.typeOf(d); }

    function bindShape() {
      const wrap = $('#sh', $q);
      const redraw = () => {
        wrap.innerHTML = K.geoArt.shapeSVG(q.shape, { selected });
        $$('.geo-hot', wrap).forEach(g => {
          const act = ev => { if (locked) return; ev.preventDefault(); const i = Number(g.dataset.i); A('tap');
            const ix = selected.indexOf(i); if (ix >= 0) selected.splice(ix, 1); else selected.push(i); redraw(); };
          g.addEventListener('click', act);
          g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') act(ev); });
        });
      };
      redraw();
    }

    function paperHint(deg, rot, kind) {
      const t = K.GEO.ANGLE.types[kind || typNow(deg)];
      return `<div class="hint-box geo-hint">${K.geoArt.withPaper(deg, rot, 220)}<p>${t.tip}</p></div>`;
    }

    function showHint() {
      if (locked) return;
      const box = $('#hintbox', $q); if (box.innerHTML) return;
      hinted = true; A('pop');
      if (q.type === 'classify' || q.type === 'world') {
        const deg = q.deg, rot = q.rot ?? 0;
        box.innerHTML = paperHint(deg, rot, q.kind);
      } else if (q.type === 'compare') {
        box.innerHTML = `<div class="hint-box geo-hint"><p>הצמידי בדמיון פינת דף לכל זווית, או השווי איזו פתיחה גדולה יותר.</p>
          <div class="geo-compare mini">${K.geoArt.angleSVG({ deg: q.left.deg, rot: q.left.rot, size: 140, paper: true })}
            ${K.geoArt.angleSVG({ deg: q.right.deg, rot: q.right.rot, size: 140, paper: true })}</div></div>`;
      } else if (q.type === 'find-right') {
        box.innerHTML = `<div class="hint-box"><p>חפשי פינות שנראות כמו פינת דף — לא חדות מדי ולא פתוחות מדי. בריבוע ובמלבן כל הפינות ישרות, גם אם הצורה מסובבת!</p></div>`;
      } else if (q.type === 'make') {
        const t = K.GEO.ANGLE.types[q.kind];
        box.innerHTML = `<div class="hint-box"><p>${t.tip}</p><p>אפשר להצמיד את הקרן עד שהפתיחה מתאימה לפינת דף${q.kind === 'right' ? ' בדיוק' : q.kind === 'acute' ? ', ואז לסגור עוד קצת' : q.kind === 'obtuse' ? ', ואז לפתוח עוד קצת' : ', ואז לפתוח עד קו ישר'}.</p></div>`;
      }
      $('#hint', root).disabled = true;
    }

    function isCorrect(value, extra) {
      if (q.type === 'make') return !!(extra && extra.ok);
      if (q.type === 'find-right') return String(value) === String(q.answer);
      return String(value) === String(q.answer);
    }

    function explain() {
      if (q.type === 'classify' || q.type === 'world') {
        const t = K.GEO.ANGLE.types[q.kind];
        return `<div class="explain geo-explain">${K.geoArt.withPaper(q.deg, q.rot ?? 0, 220)}<p class="explain-t"><b style="color:${t.color}">${t.full}.</b> ${t.tip}</p></div>`;
      }
      if (q.type === 'compare') {
        const lab = q.answer === 'L' ? 'א' : 'ב';
        return `<div class="explain geo-explain"><p class="explain-t">התשובה היא זווית <b>${lab}</b>.</p>
          <div class="geo-compare mini">${K.geoArt.angleSVG({ deg: q.left.deg, rot: q.left.rot, size: 150, paper: true, names: true })}
            ${K.geoArt.angleSVG({ deg: q.right.deg, rot: q.right.rot, size: 150, paper: true, names: true })}</div></div>`;
      }
      if (q.type === 'find-right') {
        return `<div class="explain geo-explain"><div class="geo-fig">${K.geoArt.shapeSVG(q.shape, { selected: q.shape.rights, showAll: true })}</div>
          <p class="explain-t">הזוויות הישרות מסומנות בירוק. הן נראות כמו פינת דף, גם אם הצורה מסובבת.</p></div>`;
      }
      if (q.type === 'make') {
        const t = K.GEO.ANGLE.types[q.kind];
        return `<div class="explain geo-explain">${K.geoArt.angleSVG({ deg: K.geoEngine.degFor(q.kind), rot: q.rot, size: 200, paper: true, names: true })}
          <p class="explain-t"><b style="color:${t.color}">${t.full}.</b> ${t.tip}</p></div>`;
      }
      return '';
    }

    function submit(value, btn, extra) {
      locked = true;
      const correct = isCorrect(value, extra);
      sess.report(q, { correct, hinted });
      setStreak(); setProgress();
      if (btn) btn.classList.add(correct ? 'right' : 'miss');
      $$('.choice', $ans).forEach(b => { b.disabled = true; if (String(b.dataset.v) === String(q.answer)) b.classList.add('right'); });
      $$('.geo-cmp', $q).forEach(b => { b.disabled = true; if (String(b.dataset.v) === String(q.answer)) b.classList.add('right'); else if (!correct) b.classList.add('miss-soft'); });
      if (q.type === 'find-right') {
        const wrap = $('#sh', $q);
        if (wrap) wrap.innerHTML = K.geoArt.shapeSVG(q.shape, { selected, showAll: true });
      }
      if ($('#hint', root)) $('#hint', root).disabled = true;
      if ($('#chk', $ans)) $('#chk', $ans).disabled = true;
      if ($('#doneS', $ans)) $('#doneS', $ans).disabled = true;
      if (correct) {
        A('right'); burstAt(btn || $q, { count: 34 });
        const streakMsg = sess.run >= 3 ? K.MSG.streak(sess.run) : '';
        const msg = hinted ? pickMsg(K.GEO.MSG.rightHint) : pickMsg(K.GEO.MSG.right);
        coach('cheer', streakMsg || msg);
        feedback(true, msg, streakMsg || (q.kind ? he(q.kind) : 'נכון!'));
      } else {
        A('wrong'); $q.classList.add('shake');
        const msg = pickMsg(K.GEO.MSG.wrong);
        coach('oops', msg);
        feedback(false, msg, '');
      }
    }

    function feedback(ok, title, sub) {
      const last = sess.done;
      let inner;
      if (ok) inner = `<div class="fb-head"><span class="fb-ic">${I().check}</span><div><h3>${title}</h3><p>${sub || ''}</p></div></div>`;
      else inner = `<div class="fb-head"><span class="fb-ic oops">?</span><div><h3>${title}</h3></div></div>${explain()}`;
      $fb.className = 'feedback show ' + (ok ? 'ok' : 'oops');
      $fb.innerHTML = `<div class="fb-in">${inner}<button class="btn ${ok ? 'btn-good' : 'btn-primary'} btn-lg" id="cont">${last ? 'לסיום וקבלת הפרס' : (ok ? 'המשך' : 'הבנתי, ממשיכים')}</button></div>`;
      $('#cont', root).onclick = next; $('#cont', root).focus({ preventScroll: true });
      K.ui.say(ok ? title : title + ' ' + (q.kind ? he(q.kind) : ''));
    }

    function next() {
      A('whoosh');
      $fb.className = 'feedback';
      $q.classList.remove('shake');
      if (sess.done) return finish();
      drawQuestion();
    }

    function finish() {
      destroyDial();
      const s = sess.summary(), acc = s.n ? s.ok / s.n : 0, perfect = s.ok === s.n;
      if (mode === 'unit') {
        const res = K.geoStore.finishSession('angles', s.ok, s.n);
        const coins = 5 + s.ok * 2 + (perfect ? 5 : 0) + res.newStars * 5 + (res.streak.isNew ? 2 : 0);
        K.store.addCoins(coins);
        K.lastGeoResult = { mode, unit: 'angles', ok: s.ok, n: s.n, coins, hard: s.hard, stars: res.stars, newStars: res.newStars, starsBefore, streak: res.streak, levelUp: res.level > levelBefore, levelDown: res.level < levelBefore, level: res.level };
      } else {
        const res = K.geoStore.setMedal(acc), streak = K.store.touchStreak();
        const coins = 5 + s.ok * 2 + (res.better ? ({ bronze: 10, silver: 20, gold: 30 })[res.medal] : 0);
        K.store.addCoins(coins);
        K.lastGeoResult = { mode, ok: s.ok, n: s.n, coins, hard: s.hard, streak, medal: res.medal, better: res.better, first: res.first };
      }
      if (K.chest) K.chest.queue(coins);
      go('geo-result');
    }

    $('#x', root).onclick = () => { if (sess.results.length === 0 || confirm('לצאת מהתרגול? מה שענית עד עכשיו נשמר.')) go('garden'); };
    K._geoQ = () => q;
    K._geoSess = () => sess;
    drawQuestion();
    return () => destroyDial();
  } });

  route('geo-result', { chrome: 'flow', render(root) {
    const r = K.lastGeoResult; if (!r) return go('garden', true);
    const st = K.store.state, c = K.CHARACTERS[st.char] || K.CHARACTERS.bear;
    const mode = r.mode || 'unit';
    const color = mode === 'champ' ? '#ffb81f' : '#ff6fae';
    const acc = r.n ? r.ok / r.n : 0;
    const line = [...K.GEO.MSG.sessionEnd].reverse().find(([th]) => acc >= th)[1];
    const mood = acc >= 0.5 ? 'cheer' : 'happy';
    const R = 54, C = 2 * Math.PI * R, M = r.medal ? K.MEDALS[r.medal] : null;
    let mid;
    if (mode === 'unit') mid = `<div class="res-card"><span class="rc-stars">${K.ui.starsRow(r.stars, 3)}</span><b>זוויות</b><small>${r.newStars ? 'כוכב חדש!' : r.stars >= 3 ? 'שלושה כוכבים!' : 'כוכבים ביחידה'}</small></div>`;
    else mid = `<div class="res-card"><span class="rc-ic big-e">${M ? M.emoji : '🏆'}</span><b>${M ? 'מדליית ' + M.name : 'עוד ניסיון'}</b><small>גן הצורות</small></div>`;
    const title = mode === 'champ' ? (M ? (r.medal === 'gold' ? 'אלופה אמיתית!' : 'כל הכבוד, אלופה!') : 'כמעט מדליה!') : acc === 1 ? 'מושלם!' : acc >= .5 ? 'כל הכבוד!' : 'עבודה יפה!';
    const sub = mode === 'champ'
      ? (M ? `זכית במדליית ${M.name} באתגר של גן הצורות!${r.first ? ' קיבלת את שרביט הצורות!' : ''}` : `צריך ${Math.ceil(K.MEDALS.bronze.min * r.n)} תשובות נכונות למדליה. בואי נחזק קצת ונחזור לאתגר!`)
      : line;
    const hard = (r.hard || []).slice(0, 6);
    const hardLabel = h => h.kind ? he(h.kind) : (h.type === 'find-right' ? 'זוויות ישרות בצורות' : h.type === 'compare' ? 'השוואת זוויות' : 'תרגול זוויות');
    root.style.setProperty('--tc', color);
    root.innerHTML = `<div class="result">
      <div class="res-char">${K.art.char(c.id, mood)}</div>
      <h2 class="h-big">${title}</h2>
      <p class="sub">${sub}</p>
      ${mode === 'champ' && M ? `<div class="medal-big ${r.medal}" aria-hidden="true">${M.emoji}</div>` : `<div class="res-ring"><svg viewBox="0 0 130 130"><circle cx="65" cy="65" r="${R}" class="rr-bg"/><circle cx="65" cy="65" r="${R}" class="rr-fg" id="rr" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><div class="rr-txt"><b>${r.ok}</b><small>מתוך ${r.n}</small><em>נכון בניסיון ראשון</em></div></div>`}
      ${mode === 'champ' && r.first ? `<p class="res-note up">🌸 השרביט של גן הצורות בידיים שלך! (זה לא חלק מכתר הממלכה של הכפל.)</p>` : ''}
      <div class="res-cards">
        <div class="res-card"><span class="rc-ic">${I().coin}</span><b dir="ltr">+<span id="cc">0</span></b><small>מטבעות לבית</small></div>
        ${mid}
        <div class="res-card"><span class="rc-ic">${I().flame}</span><b>${r.streak.count}</b><small>${r.streak.isNew ? (r.streak.count > 1 ? 'ימים ברצף!' : 'התחלת רצף חדש!') : 'ימים ברצף'}</small></div>
      </div>
      ${r.levelUp ? `<p class="res-note up">⬆️ עלית רמה בזוויות! מעכשיו יהיו שאלות קצת יותר מאתגרות.</p>` : ''}
      ${r.levelDown ? `<p class="res-note">נאט קצת: בסבב הבא יהיו עוד רמזים ותמונות שיעזרו.</p>` : ''}
      ${hard.length ? `<div class="res-weak"><b>כדאי לחזק:</b> ${hard.map(h => `<span class="fact-chip">${hardLabel(h)}</span>`).join('')}<small>הם יחזרו בתרגול הבא, כמה שצריך.</small></div>` : ''}
      <div class="res-actions">
        <button class="btn btn-primary btn-xl" id="again">${mode === 'champ' ? 'עוד ניסיון באתגר' : 'עוד סבב'}</button>
        <button class="btn btn-secondary btn-lg" id="garden">חזרה לגן הצורות</button>
        <button class="btn btn-ghost" id="map">חזרה למפת הממלכה</button>
      </div></div>`;
    $('#again', root).onclick = () => go(mode === 'champ' ? 'geo-practice/champ' : 'geo-practice/angles');
    $('#garden', root).onclick = () => go('garden');
    $('#map', root).onclick = () => go('map');
    const rr = $('#rr', root); if (rr) setTimeout(() => { rr.style.strokeDashoffset = C * (1 - acc); }, 100);
    K.ui.countUp($('#cc', root), r.coins, 1000);
    if (acc >= .5) setTimeout(() => confetti({ y: innerHeight * .3, count: acc === 1 || r.medal === 'gold' ? 120 : 70, power: 1.2, stars: true }), 250);
    A(r.newStars || r.better ? 'fanfare' : acc >= .5 ? 'star' : 'right');
  } });
})();
