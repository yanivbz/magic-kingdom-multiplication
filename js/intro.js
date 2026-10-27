/* "מה זה כפל?" – introductory interactive story. */
(function () {
  const { $, $$, h, go, route, esc, confetti, burstAt, arrayHTML } = K.ui;
  const I = () => K.art.icons;
  const A = (n, v) => K.audio.play(n, v);
  const items = (e, n) => Array.from({ length: n }, (_, i) => `<span class="it" style="--i:${i}">${e}</span>`).join('');
  const groups = (g, s, e, cls = '') => Array.from({ length: g }, (_, i) => `<div class="grp ${cls}" style="--g:${i}">${items(e, s)}</div>`).join('');
  const step = (el, o) => { // +/- stepper
    return `<div class="stepper" data-k="${o.k}"><span class="stp-l">${o.label}</span><div class="stp"><button class="btn btn-round" data-d="-1" aria-label="פחות ${o.label}">−</button><b class="stp-n">${o.v}</b><button class="btn btn-primary btn-round" data-d="1" aria-label="עוד ${o.label}">+</button></div></div>`;
  };

  function steps(charId) {
    const nm = K.CHARACTERS[charId].name;
    return [
      { title: 'קבוצות שוות', say: `${nm} הכין צנצנות דבש. בכל צנצנת יש אותה כמות של כפות דבש. לחצי על כל צנצנת כדי לספור כמה כפות יש בסך הכול.`,
        render(stage, ctx) {
          let n = 0;
          stage.innerHTML = `<div class="jars">${[0, 1, 2].map(i => `<button class="jar-btn" data-i="${i}" aria-label="צנצנת ${i + 1}, 4 כפות דבש"><span class="jar-run" aria-hidden="true"></span>${K.art.jar()}<span class="drops">${Array.from({ length: 4 }, () => '<i class="dot honey"></i>').join('')}</span></button>`).join('')}</div>
            <div class="total-line">ביחד: <b id="tot">0</b></div><p class="trick-note" id="note">3 צנצנות, ובכל אחת 4 כפות. לחצי עליהן!</p>`;
          $$('.jar-btn', stage).forEach(b => b.onclick = () => {
            if (b.classList.contains('counted')) return;
            b.classList.add('counted'); n++; $('.jar-run', b).textContent = n * 4; A('dot', n);
            $('#tot', stage).textContent = n * 4;
            if (n === 3) { $('#note', stage).innerHTML = `<b>3 קבוצות שוות של 4</b>, ביחד 12 כפות דבש!<br>קבוצות שוות הן הבסיס של כפל.`; A('star'); burstAt($('.jars', stage), { count: 30 }); ctx.ready(); }
          });
        } },
      { title: 'חיבור חוזר', say: 'כשהקבוצות שוות, אפשר לחבר את אותו מספר שוב ושוב. הוסיפי קבוצות ותראי!',
        render(stage, ctx) {
          let g = 2, short = false;
          stage.innerHTML = `<div class="grp-area" id="ga"></div><div class="sum-line big" dir="ltr" id="sum"></div>${step(0, { k: 'g', label: 'קבוצות', v: g })}
            <button class="btn btn-secondary btn-lg" id="short">✍️ כתבי בקיצור</button><p class="trick-note" id="note"></p>`;
          const draw = () => {
            $('#ga', stage).innerHTML = groups(g, 3, '🥕');
            $('.stp-n', stage).textContent = g;
            $('#sum', stage).innerHTML = short
              ? `<span class="x-short"><b>${g}</b> × <b>${3}</b> = <b class="res">${g * 3}</b></span>`
              : `${Array(g).fill(3).join(' + ')} = <b class="res">${g * 3}</b>`;
            $('#note', stage).innerHTML = short ? `קוראים: <b>${g} פעמים 3</b>, כלומר ${g} קבוצות של 3 גזרים. כפל הוא דרך קצרה לכתוב חיבור של קבוצות שוות.` : `${g} קבוצות של 3 גזרים. אפשר לחבר, אבל זה ארוך...`;
            $('#short', stage).textContent = short ? '↩️ חזרה לחיבור' : '✍️ כתבי בקיצור';
          };
          $$('.stp button', stage).forEach(b => b.onclick = () => { const d = Number(b.dataset.d); g = Math.max(1, Math.min(7, g + d)); A('dot', g); draw(); });
          $('#short', stage).onclick = () => { short = !short; A('pop'); draw(); if (short) { ctx.ready(); burstAt($('#sum', stage), { count: 24 }); } };
          draw();
        } },
      { title: 'איך קוראים תרגיל כפל', say: 'בכל תרגיל כפל יש שלושה מספרים. שחקי עם הכפתורים וראי מה כל מספר אומר.',
        render(stage, ctx) {
          let g = 3, s = 4, touched = 0;
          stage.innerHTML = `<div class="grp-area" id="ga"></div>
            <div class="eq-anno" dir="ltr"><div><b id="eg">3</b><small>כמה קבוצות</small></div><span>×</span><div><b id="es">4</b><small>כמה בכל קבוצה</small></div><span>=</span><div><b class="res" id="et">12</b><small>בסך הכול</small></div></div>
            <div class="steppers">${step(0, { k: 'g', label: 'קבוצות', v: g })}${step(0, { k: 's', label: 'בכל קבוצה', v: s })}</div>`;
          const draw = () => {
            $('#ga', stage).innerHTML = groups(g, s, '🍓', 'sm');
            $('#eg', stage).textContent = g; $('#es', stage).textContent = s; $('#et', stage).textContent = g * s;
            $('[data-k=g] .stp-n', stage).textContent = g; $('[data-k=s] .stp-n', stage).textContent = s;
          };
          $$('.stepper', stage).forEach(sp => $$('button', sp).forEach(b => b.onclick = () => {
            const d = Number(b.dataset.d), k = sp.dataset.k;
            if (k === 'g') g = Math.max(1, Math.min(6, g + d)); else s = Math.max(1, Math.min(6, s + d));
            A('dot', g + s); draw(); if (++touched === 4) ctx.ready();
          }));
          draw();
        } },
      { title: 'מערך: מסדרים בשורות', say: 'אפשר לסדר קבוצות שוות בשורות ועמודות. ככה רואים את הכפל בתמונה אחת.',
        render(stage, ctx) {
          let phase = 0;
          stage.innerHTML = `<div class="arr-stage" id="as"></div><div class="eq-line" id="eq"></div><p class="trick-note" id="note"></p><div class="ctrl"><button class="btn btn-primary btn-lg pulse" id="act"></button></div>`;
          const draw = () => {
            const as = $('#as', stage), act = $('#act', stage);
            if (phase === 0) { as.innerHTML = `<div class="grp-area">${groups(3, 4, '🍓', 'sm')}</div>`; $('#eq', stage).innerHTML = ''; $('#note', stage).textContent = '3 קבוצות, ובכל אחת 4 תותים.'; act.textContent = 'סדרי בשורות'; }
            if (phase === 1) { as.innerHTML = arrayHTML(3, 4, { cls: 'arr-md' }); $('#eq', stage).innerHTML = K.ui.eqHTML(3, 4, 12, 'big'); $('#note', stage).textContent = '3 שורות, ובכל שורה 4. כל שורה היא קבוצה!'; act.textContent = '↻ סובבי את המערך'; }
            if (phase === 2) { as.innerHTML = arrayHTML(4, 3, { cls: 'arr-md' }); $('#eq', stage).innerHTML = K.ui.eqHTML(4, 3, 12, 'big'); $('#note', stage).innerHTML = 'עכשיו יש 4 שורות של 3. התוצאה לא השתנתה!<br><b>3 × 4 = 4 × 3</b>. אפשר להחליף סדר בכפל.'; act.textContent = 'מההתחלה ↺'; ctx.ready(); }
          };
          $('#act', stage).onclick = () => { $('#act', stage).classList.remove('pulse'); phase = (phase + 1) % 3; A(phase === 2 ? 'star' : 'whoosh'); draw(); if (phase === 2) burstAt($('#as', stage), { count: 26 }); };
          draw();
        } },
      { title: 'איך מחשבים?', say: 'יש כמה דרכים לפתור תרגיל כפל. בחרי כל אחת וראי איך היא עובדת. אין דרך אחת נכונה, כל דרך מתאימה לפעמים אחרות.',
        render(stage, ctx) {
          const M = [
            { id: 'skip', label: 'ספירה בקפיצות', ic: '🐾', demo: () => `<p>3 × 5: קופצים 3 פעמים, בכל פעם 5.</p><div class="skip" dir="ltr"><span class="chip-n" style="--i:0">5</span><span class="chip-sep">‹</span><span class="chip-n" style="--i:1">10</span><span class="chip-sep">‹</span><span class="chip-n" style="--i:2">15</span></div>` },
            { id: 'arr', label: 'מציירים מערך', ic: '🔵', demo: () => `<p>3 × 5: מציירים 3 שורות של 5 עיגולים וסופרים.</p>${arrayHTML(3, 5, { cls: 'arr-md' })}` },
            { id: 'known', label: 'משתמשים במה שיודעים', ic: '💡', demo: () => `<p>את כבר מכירה את שיטת היד של ה-5: מחזיקים 5 אצבעות וסופרים 3 פעמים.</p><div class="skip" dir="ltr"><span class="chip-n" style="--i:0">5</span><span class="chip-sep">‹</span><span class="chip-n" style="--i:1">10</span><span class="chip-sep">‹</span><span class="chip-n" style="--i:2">15</span></div><p>וכשמכירים תרגיל אחד, אפשר לפתור תרגיל דומה: 4 × 5 הוא 3 × 5 ועוד עוד קבוצה של 5.</p>` }
          ];
          const seen = new Set();
          stage.innerHTML = `<div class="methods" role="tablist">${M.map(m => `<button class="method" role="tab" data-id="${m.id}"><span>${m.ic}</span><b>${m.label}</b></button>`).join('')}</div><div class="method-demo" id="md"><p class="muted">לחצי על דרך כדי לראות אותה</p></div>`;
          $$('.method', stage).forEach(b => b.onclick = () => {
            const m = M.find(x => x.id === b.dataset.id); A('pop');
            $$('.method', stage).forEach(x => x.classList.toggle('on', x === b)); $('#md', stage).innerHTML = m.demo();
            $('#md', stage).classList.remove('enter'); void $('#md', stage).offsetWidth; $('#md', stage).classList.add('enter');
            seen.add(m.id); if (seen.size === 3) ctx.ready();
          });
        } },
      { title: 'בדיקה קטנה', check: true, say: 'עכשיו שלוש שאלות קטנות, רק כדי לראות שהכול ברור. אם משהו לא מסתדר, אין בעיה, נעזור לך!',
        render(stage, ctx) {
          const Q = [
            { ask: 'כמה כוכבים יש בסך הכול?', vis: `<div class="grp-area">${groups(3, 2, '⭐', 'sm')}</div>`, opts: [5, 6, 8, 9], ans: 6, hint: '3 קבוצות של 2: 2, 4, 6.', ok: 'בדיוק! 3 קבוצות של 2 הן 6.' },
            { ask: '5 + 5 + 5 + 5 הוא אותו דבר כמו איזה תרגיל כפל?', vis: '', opts: ['4 × 5', '5 + 4', '5 × 5', '4 + 5'], ans: '4 × 5', hint: 'כמה פעמים כתוב 5? ארבע פעמים.', ok: 'נכון! 4 פעמים 5.' },
            { ask: '2 שורות, ובכל שורה 5 עיגולים. כמה עיגולים יש?', vis: arrayHTML(2, 5, { cls: 'arr-md' }), opts: [7, 10, 12, 25], ans: 10, hint: 'סופרים בקפיצות של 5: 5, 10.', ok: 'מצוין! 2 × 5 = 10.' }
          ];
          let i = 0;
          const draw = () => {
            const q = Q[i];
            stage.innerHTML = `<div class="check-q"><div class="check-prog">שאלה ${i + 1} מתוך ${Q.length}</div><h3>${q.ask}</h3>${q.vis}<div class="choices" id="ch">${K.engine.shuffle(q.opts).map(o => `<button class="choice" data-v="${o}"><span dir="ltr">${o}</span></button>`).join('')}</div><div class="check-fb" id="cf" aria-live="polite"></div></div>`;
            $$('.choice', stage).forEach(b => b.onclick = () => {
              if (String(b.dataset.v) === String(q.ans)) {
                A('right'); b.classList.add('right'); $$('.choice', stage).forEach(x => x.disabled = true); burstAt(b, { count: 28 });
                $('#cf', stage).innerHTML = `<div class="fb-line ok">${q.ok}</div><button class="btn btn-good btn-lg" id="cn">${i === Q.length - 1 ? 'סיימתי!' : 'לשאלה הבאה'}</button>`;
                $('#cn', stage).onclick = () => { if (++i < Q.length) { A('whoosh'); draw(); } else finish(stage, ctx); };
              } else {
                A('wrong'); b.classList.add('miss'); b.disabled = true;
                $('#cf', stage).innerHTML = `<div class="fb-line">כמעט! ${K.ui.esc(q.hint)} נסי שוב.</div>`;
              }
            });
          };
          draw();
        } }
    ];
  }

  function finish(stage, ctx) {
    const st = K.store.state, first = !st.introDone;
    st.introDone = true; let bonus = 0;
    if (first) { bonus = 10; K.store.addCoins(bonus); }
    K.store.save(); A('fanfare'); confetti({ y: innerHeight * .35, count: 120, power: 1.2, stars: true });
    stage.innerHTML = `<div class="intro-done"><div class="big-emoji">🎉</div><h3>עכשיו את יודעת מה זה כפל!</h3>
      <p>כפל הוא דרך מהירה לספור קבוצות שוות. ${first ? `קיבלת <b>${bonus}</b> מטבעות מתנה לבית שלך.` : ''}</p>
      <div class="intro-actions"><button class="btn btn-primary btn-xl" id="t2">לטבלת ה-2</button><button class="btn btn-secondary btn-lg" id="m">למפה</button></div></div>`;
    $('#t2', stage).onclick = () => go('lesson/2'); $('#m', stage).onclick = () => go('map');
    ctx.hideNav();
  }

  route('intro', { chrome: 'flow', render(root) {
    const st = K.store.state, c = K.CHARACTERS[st.char] || K.CHARACTERS.bear;
    const S = steps(c.id); let i = 0, cleanupStage = null;
    root.innerHTML = `<div class="flow lesson intro">
      <header class="flow-bar"><button class="icon-btn" id="x" aria-label="יציאה">${I().close}</button><div class="step-dots" id="sd"></div><span class="flow-title">מה זה כפל?</span></header>
      <div class="lesson-body"><div class="coach"><div class="coach-char" id="cc"></div><div id="cb"></div></div><h2 class="step-title" id="tt"></h2><div class="stage" id="stage"></div></div>
      <footer class="flow-foot"><button class="btn btn-secondary" id="prev">הקודם</button><button class="btn btn-primary btn-lg" id="next">הבא</button></footer></div>`;
    const stage = $('#stage', root), nx = $('#next', root);
    const ctx = { ready() { nx.classList.add('pulse'); }, hideNav() { $('.flow-foot', root).style.display = 'none'; } };
    function show(dir) {
      if (cleanupStage) { cleanupStage(); cleanupStage = null; }
      const s = S[i];
      $('#sd', root).innerHTML = S.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'done' : ''}"></i>`).join('');
      $('#cc', root).innerHTML = K.art.char(c.id, s.check ? 'think' : 'happy'); $('#cb', root).innerHTML = K.ui.bubble(s.say);
      $('#tt', root).textContent = s.title; $('.flow-foot', root).style.display = s.check ? 'none' : '';
      nx.classList.remove('pulse'); $('#prev', root).style.visibility = i === 0 ? 'hidden' : 'visible';
      stage.className = 'stage ' + (dir > 0 ? 'in-next' : 'in-prev'); stage.innerHTML = ''; void stage.offsetWidth; stage.classList.add('go');
      const r = s.render(stage, ctx); if (typeof r === 'function') cleanupStage = r;
    }
    nx.onclick = () => { if (i < S.length - 1) { i++; A('whoosh'); show(1); } };
    $('#prev', root).onclick = () => { if (i > 0) { i--; A('tap'); show(-1); } };
    $('#x', root).onclick = () => go('map');
    show(1);
    return () => cleanupStage && cleanupStage();
  } });
})();
