/* Visual lessons: dot array → skip counting → table trick → ready. */
(function () {
  const { $, $$, h, go, route, esc, confetti, burstAt, arrayHTML } = K.ui;
  const I = () => K.art.icons;
  const A = (n, v) => K.audio.play(n, v);

  const hand = (col = '#ffcfa3', lit = false) => `<svg class="hand" viewBox="0 0 60 70" aria-hidden="true"><g fill="${col}" stroke="#e8a77a" stroke-width="1.600"><rect x="6" y="22" width="9" height="26" rx="4.500"/><rect x="16" y="10" width="9" height="36" rx="4.500"/><rect x="26" y="5" width="9" height="42" rx="4.500"/><rect x="36" y="10" width="9" height="36" rx="4.500"/><path d="M46 38l8-8a4.500 4.500 0 0 1 7 5l-8 14z" transform="translate(-4 4)"/><rect x="6" y="38" width="42" height="26" rx="12"/></g></svg>`;

  /* generic number picker 1..10 */
  function picker(stage, onPick, start = 3) {
    const el = h(`<div class="picker" role="group" aria-label="בחירת מספר">${Array.from({ length: 10 }, (_, i) => `<button class="pick" data-n="${i + 1}" aria-label="${i + 1}">${i + 1}</button>`).join('')}</div>`);
    stage.appendChild(el);
    const set = n => { $$('.pick', el).forEach(b => b.classList.toggle('on', Number(b.dataset.n) === n)); onPick(n); };
    $$('.pick', el).forEach(b => b.onclick = () => { A('tap'); set(Number(b.dataset.n)); });
    set(start);
  }

  const stepArray = t => ({
    title: 'קבוצות שוות', say: `בכל שורה יש ${t} עיגולים. לחצי על + כדי להוסיף עוד שורה ולראות מה קורה.`,
    render(stage) {
      let m = 1;
      stage.innerHTML = `<div class="arr-wrap" id="aw"></div><div class="eq-line" id="eq"></div><div class="sum-line" id="sum" dir="ltr"></div>
        <div class="ctrl pm"><button class="btn btn-round" id="minus" aria-label="פחות שורה">−</button><span class="ctrl-n" id="cnt" aria-live="polite"></span><button class="btn btn-primary btn-round pulse" id="plus" aria-label="עוד שורה">+</button></div>`;
      const aw = $('#aw', stage);
      function draw(isNew) {
        aw.innerHTML = arrayHTML(m, t, { animate: false });
        if (isNew) { const rows = $$('.arr-row', aw); const last = rows[rows.length - 1]; last.classList.add('new'); $$('.dot', last).forEach((d, i) => d.style.setProperty('--dd', i * 40 + 'ms')); }
        $('#eq', stage).innerHTML = K.ui.eqHTML(m, t, m * t, 'big');
        $('#sum', stage).textContent = Array(m).fill(t).join(' + ') + (m > 1 ? ' = ' + m * t : '');
        $('#cnt', stage).textContent = `${m} ${m === 1 ? 'שורה' : 'שורות'} של ${t}`;
        $('#minus', stage).disabled = m <= 1; $('#plus', stage).disabled = m >= 10;
      }
      draw();
      $('#plus', stage).onclick = () => { if (m >= 10) return; m++; $('#plus', stage).classList.remove('pulse'); A('dot', m); draw(true); if (m === 10) { A('star'); burstAt($('#aw', stage), { count: 40 }); } };
      $('#minus', stage).onclick = () => { if (m <= 1) return; m--; A('tap'); draw(); };
    }
  });

  const stepSkip = (t, charId) => ({
    title: 'ספירה בקפיצות', say: `${K.CHARACTERS[charId].name} קופץ מאבן לאבן. בכל קפיצה מוסיפים ${t}!`,
    render(stage) {
      let k = 0, timer = null;
      stage.innerHTML = `<div class="hop" dir="ltr" style="--n:11"><div class="hopper" id="hp" style="--k:0">${K.ui.avatar(charId)}</div>
        <div class="stones">${Array.from({ length: 11 }, (_, i) => `<div class="stone" data-i="${i}"><span>?</span></div>`).join('')}</div></div>
        <div class="sum-line" id="sum" dir="ltr">0</div><div class="eq-line" id="eq"></div>
        <div class="ctrl"><button class="btn btn-primary btn-lg pulse" id="jump">קפיצה! +${t}</button><button class="btn btn-ghost" id="auto">הפעלה אוטומטית</button></div>`;
      const stones = $$('.stone', stage), hp = $('#hp', stage);
      stones[0].classList.add('got'); stones[0].firstElementChild.textContent = '0';
      function jump() {
        if (k >= 10) { k = 0; stones.forEach((s, i) => { s.classList.toggle('got', i === 0); s.firstElementChild.textContent = i ? '?' : '0'; }); hp.style.setProperty('--k', 0); updateText(); return; }
        k++; $('#jump', stage).classList.remove('pulse');
        hp.style.setProperty('--k', k); hp.classList.remove('hop-anim'); void hp.offsetWidth; hp.classList.add('hop-anim');
        const s = stones[k]; s.classList.add('got', 'land'); s.firstElementChild.textContent = k * t; A('dot', k); updateText();
        if (k === 10) { A('star'); burstAt(s, { count: 30 }); }
      }
      function updateText() {
        $('#sum', stage).textContent = k ? Array.from({ length: k }, (_, i) => (i + 1) * t).join(', ') : '0';
        $('#eq', stage).innerHTML = k ? K.ui.eqHTML(k, t, k * t, 'big') : `<p class="muted">לחצי על הכפתור כדי לקפוץ</p>`;
        $('#jump', stage).textContent = k >= 10 ? 'מההתחלה ↺' : `קפיצה! +${t}`;
      }
      updateText();
      $('#jump', stage).onclick = () => { if (timer) clearInterval(timer), timer = null; jump(); };
      $('#auto', stage).onclick = () => { if (timer) { clearInterval(timer); timer = null; return; } if (k >= 10) jump(); timer = setInterval(() => { if (k >= 10) { clearInterval(timer); timer = null; return; } jump(); }, 650); };
      return () => timer && clearInterval(timer);
    }
  });

  const TRICKS = {
    hand5: t => ({
      title: 'שיטת היד', say: K.TABLES[5].tip + ' כל יד היא 5.',
      render(stage) {
        stage.innerHTML = `<div class="hands" role="group" aria-label="ידיים לספירה">${Array.from({ length: 10 }, (_, i) => `<button class="hand-btn" data-i="${i + 1}" aria-label="${i + 1} פעמים 5">${hand()}<span>${(i + 1) * 5}</span></button>`).join('')}</div>
          <div class="eq-line" id="eq"></div><p class="trick-note" id="note"></p>`;
        const btns = $$('.hand-btn', stage);
        const set = n => {
          btns.forEach((b, i) => b.classList.toggle('lit', i < n));
          $('#eq', stage).innerHTML = K.ui.eqHTML(n, 5, n * 5, 'big');
          $('#note', stage).innerHTML = `מחזיקים יד עם 5 אצבעות וסופרים ${n} פעמים: <b dir="ltr">${Array.from({ length: n }, (_, i) => (i + 1) * 5).join(', ')}</b><br>שימי לב: כל התוצאות מסתיימות ב-0 או ב-5!`;
        };
        btns.forEach(b => b.onclick = () => { const n = Number(b.dataset.i); A('dot', n); set(n); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
        set(3);
      }
    }),
    tenzero: () => ({
      title: 'כפל ב-10', say: K.TABLES[10].tip + ' בואי נראה איך זה עובד.',
      render(stage) {
        stage.innerHTML = `<div class="tz-digits" dir="ltr" id="dg"></div><div class="arr-wrap" id="aw"></div><div class="eq-line" id="eq"></div><p class="trick-note" id="note"></p>`;
        picker(stage, n => {
          $('#dg', stage).innerHTML = `<span class="tz-n">${n}</span><span class="tz-x">×</span><span class="tz-n ten">10</span><span class="tz-x">=</span><span class="tz-n">${n}</span><span class="tz-n zero">0</span>`;
          $('#aw', stage).innerHTML = arrayHTML(n, 10, { cls: 'arr-sm' });
          $('#eq', stage).innerHTML = K.ui.eqHTML(n, 10, n * 10, 'big');
          $('#note', stage).innerHTML = `${n} שורות של 10, כלומר ${n} עשרות: <b>${n * 10}</b>.<br>פשוט כותבים ${n} ומוסיפים 0 בסוף. ${K.TABLES[10].pattern}`;
          A('dot', n);
        }, 4);
      }
    }),
    double2: () => ({
      title: 'כפל ב-2 זה להכפיל', say: K.TABLES[2].tip,
      render(stage) {
        stage.innerHTML = `<div class="dbl" id="dbl"></div><div class="eq-line" id="eq"></div><div class="evens" dir="ltr" id="ev"></div><p class="trick-note" id="note"></p>`;
        picker(stage, n => {
          $('#dbl', stage).innerHTML = `<div class="dbl-g">${Array.from({ length: n }, (_, i) => `<i class="dot c0" style="--dd:${i * 30}ms"></i>`).join('')}</div><span class="dbl-plus">+</span><div class="dbl-g">${Array.from({ length: n }, (_, i) => `<i class="dot c2" style="--dd:${i * 30 + 150}ms"></i>`).join('')}</div>`;
          $('#eq', stage).innerHTML = `<div class="eq big" dir="ltr"><span>${n}</span><span>+</span><span>${n}</span><span>=</span><b>${2 * n}</b></div><div class="eq big" dir="ltr"><span>2</span><span>×</span><span>${n}</span><span>=</span><b>${2 * n}</b></div>`;
          $('#ev', stage).innerHTML = Array.from({ length: 10 }, (_, i) => `<span class="${i + 1 === n ? 'on' : ''}">${(i + 1) * 2}</span>`).join('');
          $('#note', stage).textContent = K.TABLES[2].pattern;
          A('dot', n);
        }, 4);
      }
    }),
    split: t => ({
      title: 'מפרקים לטבלאות שאני מכירה', say: K.TABLES[t].tip,
      render(stage) {
        const p = K.TABLES[t].split;
        stage.innerHTML = `<div class="arr-wrap" id="aw"></div><div class="eq-line" id="eq"></div><p class="trick-note" id="note"></p>`;
        picker(stage, m => {
          $('#aw', stage).innerHTML = arrayHTML(t, m, { split: p, animate: true, cls: 'arr-sm' });
          $('#eq', stage).innerHTML = `<div class="eq" dir="ltr"><span class="ca">${t}×${m}</span><span>=</span><span class="ca">${p}×${m}</span><span>+</span><span class="cb">${t - p}×${m}</span><span>=</span><b>${t * m}</b></div>`;
          $('#note', stage).textContent = `${p * m} ועוד ${(t - p) * m} זה ${t * m}`;
          A('dot', m);
        }, 4);
      }
    }),
    fingers9: () => ({
      title: 'טריק האצבעות של ה-9', say: 'מקפלים את האצבע שמספרה כמו המספר שמכפילים ב-9. משמאל: העשרות, מימין: האחדות.',
      render(stage) {
        // fingers 1..10 left→right; thumbs in the middle
        const lens = [48, 60, 68, 60, 44, 44, 60, 68, 60, 48];
        stage.innerHTML = `<div class="f9" dir="ltr" id="f9"><svg viewBox="0 0 400 190" role="group" aria-label="עשר אצבעות">
          <path d="M20 190V135Q20 112 60 108H170Q192 112 192 135V190z" fill="#ffd9b8" stroke="#e8a77a" stroke-width="2"/><path d="M208 190V135Q208 112 230 108H340Q380 112 380 135V190z" fill="#ffd9b8" stroke="#e8a77a" stroke-width="2"/>
          ${lens.map((L, i) => { const x = 22 + i * 36 + (i > 4 ? 12 : 0), top = 118 - L; return `<g class="fg" data-i="${i + 1}" tabindex="0" role="button" aria-label="אצבע ${i + 1}"><rect class="fg-body" x="${x}" y="${top}" width="30" height="${L + 8}" rx="15" fill="#ffd9b8" stroke="#e8a77a" stroke-width="2" style="--fold:${L - 18}px"/><circle cx="${x + 15}" cy="${top + 16}" r="3.500" fill="#fff" opacity=".5" class="fg-nail"/><text x="${x + 15}" y="172" text-anchor="middle" font-size="16" font-weight="700" fill="#5b34d6" font-family="Rubik">${i + 1}</text></g>`; }).join('')}
        </svg></div>
        <div class="f9-out" dir="ltr" id="out"></div><p class="trick-note" id="note"></p>`;
        const fgs = $$('.fg', stage);
        const set = n => {
          fgs.forEach(g => g.classList.toggle('fold', Number(g.dataset.i) === n));
          const tens = n - 1, ones = 10 - n;
          $('#out', stage).innerHTML = `<div class="eq big"><span>${n}</span><span>×</span><span>9</span><span>=</span><b>${n * 9}</b></div><div class="f9-parts"><span class="tens">${tens}</span><small>אצבעות לפני = עשרות</small></div><div class="f9-parts"><span class="ones">${ones}</span><small>אצבעות אחרי = אחדות</small></div>`;
          $('#note', stage).textContent = `מקפלים את אצבע ${n}: משמאל ${tens}, מימין ${ones}, ביחד ${n * 9}! ${K.TABLES[9].pattern}`;
        };
        fgs.forEach(g => { const f = () => { const n = Number(g.dataset.i); A('dot', n); set(n); }; g.onclick = f; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } }; });
        set(3);
      }
    })
  };

  function stepsFor(t, charId) {
    const T = K.TABLES[t];
    return [stepArray(t), stepSkip(t, charId), TRICKS[T.trick](t), {
      title: 'מוכנה?', ready: true, say: `יופי! עכשיו את מכירה את טבלת ה-${t}. בואי נתרגל קצת.`,
      render(stage) {
        stage.innerHTML = `<div class="ready"><ul class="recap">
          <li><span>1</span> ${t} × מספר זה מספר שורות של ${t} עיגולים.</li>
          <li><span>2</span> אפשר לספור בקפיצות של ${t}.</li>
          <li><span>3</span> ${T.tip}</li>
          ${T.pattern ? `<li><span>★</span> ${T.pattern}</li>` : ''}</ul></div>`;
      }
    }];
  }

  route('lesson', { chrome: 'flow', render(root, tArg) {
    const t = Number(tArg), T = K.TABLES[t]; if (!T || !T.ready) return go('map', true);
    const st = K.store.state, c = K.CHARACTERS[st.char] || K.CHARACTERS.bear;
    const steps = stepsFor(t, c.id); let i = 0, stageCleanup = null;
    root.style.setProperty('--tc', T.color);
    root.innerHTML = `<div class="flow lesson">
      <header class="flow-bar"><button class="icon-btn" id="x" aria-label="יציאה לממלכה">${I().close}</button><div class="step-dots" id="sd"></div><span class="flow-title">טבלת ה-${t}</span></header>
      <div class="lesson-body"><div class="coach"><div class="coach-char" id="cc"></div><div id="cb"></div></div><h2 class="step-title" id="tt"></h2><div class="stage" id="stage"></div></div>
      <footer class="flow-foot"><button class="btn btn-secondary" id="prev">הקודם</button><button class="btn btn-primary btn-lg" id="next">הבא</button></footer></div>`;
    const stage = $('#stage', root);
    function show(dir = 1) {
      if (stageCleanup) { stageCleanup(); stageCleanup = null; }
      const s = steps[i];
      $('#sd', root).innerHTML = steps.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'done' : ''}"></i>`).join('');
      $('#cc', root).innerHTML = K.art.char(c.id, s.ready ? 'cheer' : 'happy');
      $('#cb', root).innerHTML = K.ui.bubble(s.say);
      $('#tt', root).textContent = s.title;
      stage.className = 'stage ' + (dir > 0 ? 'in-next' : 'in-prev'); stage.innerHTML = '';
      void stage.offsetWidth; stage.classList.add('go');
      const r = s.render(stage); if (typeof r === 'function') stageCleanup = r;
      $('#prev', root).style.visibility = i === 0 ? 'hidden' : 'visible';
      const nx = $('#next', root);
      nx.textContent = s.ready ? 'לתרגול! 🎯' : 'הבא';
      if (s.ready) { K.store.tstate(t).lesson = true; K.store.save(); A('fanfare'); setTimeout(() => confetti({ y: innerHeight * .4, count: 50, stars: true }), 200); }
    }
    $('#next', root).onclick = () => { if (steps[i].ready) return go('practice/' + t); i++; A('whoosh'); show(1); };
    $('#prev', root).onclick = () => { if (i > 0) { i--; A('tap'); show(-1); } };
    $('#x', root).onclick = () => go('map');
    show();
    return () => stageCleanup && stageCleanup();
  } });
})();
