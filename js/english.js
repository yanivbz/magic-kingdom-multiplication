/* English Land: world page, "האותיות שלמדנו", letter practice, and data-driven exam prep
   (data/exams/index.json → one JSON file per exam). Progress is additive in kefel.v1:
   state.english = { learnedLetters, letterStats }, state.exams[examId] = { practice, items, mocks, best }. */
(function () {
  const { $, $$, go, route, sheet, toast, sleep } = K.ui;
  const S = () => K.store.state;
  const A = (n, v) => K.audio.play(n, v);
  const esc = K.ui.esc;
  const say = (t, o) => (K.speech && K.speech.sayEn ? K.speech.sayEn(t, o) : Promise.resolve());
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const SPK = '🔊';

  /* ------------------------------------------------------------------ state (additive) */
  function en() {
    const st = S();
    if (!st.english || typeof st.english !== 'object' || Array.isArray(st.english)) st.english = {};
    const e = st.english;
    if (!Array.isArray(e.learnedLetters)) e.learnedLetters = K.EN_DEFAULT_LEARNED.slice();
    if (!e.letterStats || typeof e.letterStats !== 'object') e.letterStats = {};
    if (!e.practice || typeof e.practice !== 'object') e.practice = { plays: 0, best: 0 };
    return e;
  }
  const learned = () => K.EN_LETTERS.filter(l => en().learnedLetters.includes(l.up));
  function exState(id) {
    const st = S();
    if (!st.exams || typeof st.exams !== 'object' || Array.isArray(st.exams)) st.exams = {};
    const x = st.exams[id] || (st.exams[id] = {});
    if (!x.practice || typeof x.practice !== 'object') x.practice = {};
    if (!x.items || typeof x.items !== 'object') x.items = {};
    if (!Array.isArray(x.mocks)) x.mocks = [];
    if (typeof x.best !== 'number') x.best = 0;
    return x;
  }

  /* ------------------------------------------------------------------ exams loader */
  let examsP = null;
  function loadExams() {
    if (!examsP) examsP = fetch('data/exams/index.json').then(r => r.json())
      .then(ix => Promise.all((ix.exams || []).map(f => fetch('data/exams/' + f).then(r => r.json()).catch(e => { console.warn('exam', f, e); return null; }))))
      .then(list => list.filter(Boolean).sort((a, b) => a.date.localeCompare(b.date)))
      .catch(e => { console.warn('exams', e); examsP = null; return []; });
    return examsP;
  }
  const dayNum = iso => { const [y, m, d] = iso.split('-').map(Number); return Math.round(new Date(y, m - 1, d, 12) / 86400000); };
  const daysLeft = iso => dayNum(iso) - dayNum(K.store.today());
  function countdown(iso) {
    const n = daysLeft(iso);
    if (n < 0) return { n, t: 'המבדק כבר עבר. כל הכבוד על ההכנה! 🌟', cls: 'past' };
    if (n === 0) return { n, t: 'המבדק היום! בהצלחה 🍀', cls: 'today' };
    if (n === 1) return { n, t: 'מחר המבדק! את מוכנה 💪', cls: 'soon' };
    if (n === 2) return { n, t: 'עוד יומיים למבדק', cls: 'soon' };
    return { n, t: `עוד ${n} ימים למבדק`, cls: n <= 4 ? 'soon' : '' };
  }
  const heDate = iso => { const [y, m, d] = iso.split('-'); return `${+d}.${+m}.${y.slice(2)}`; };
  async function upcoming(subject) {
    const all = await loadExams();
    return all.filter(x => (!subject || x.subject === subject) && daysLeft(x.date) >= -1);
  }

  /* ------------------------------------------------------------------ shared bits */
  const hearBtn = (text, label = 'הקשיבי') => `<button class="en-hear" type="button" data-say="${esc(text)}" aria-label="${label}"><span aria-hidden="true">${SPK}</span></button>`;
  function bindHear(root) { $$('[data-say]', root).forEach(b => b.onclick = e => { e.stopPropagation(); K.audio.unlock(); b.classList.add('on'); say(b.dataset.say).then(() => b.classList.remove('on')); }); }
  const letterCard = l => `<button class="en-lcard" type="button" data-up="${l.up}" aria-label="האות ${l.up}">
      <span class="en-lc-pair" dir="ltr"><b>${l.up}</b><i>${l.low}</i></span>
      <span class="en-lc-pic" aria-hidden="true">${l.pic}</span>
      <span class="en-lc-word" dir="ltr">${markLetter(l.word, l.low)}</span>
    </button>`;
  const markLetter = (w, ch) => { const i = w.indexOf(ch); return i < 0 ? w : `${w.slice(0, i)}<u>${ch}</u>${w.slice(i + 1)}`; };
  function letterSheet(l) {
    const s = sheet(`<div class="en-lsheet">
      <div class="en-ls-big" dir="ltr"><b>${l.up}</b><i>${l.low}</i></div>
      <div class="en-ls-rows">
        <div class="en-ls-row"><small>שם האות</small><b>${l.name}</b></div>
        <div class="en-ls-row"><small>הצליל</small><b>${l.sound}</b></div>
      </div>
      <div class="en-ls-ex"><span class="en-ls-pic" aria-hidden="true">${l.pic}</span><b dir="ltr">${markLetter(l.word, l.low)}</b><small>${l.he}</small></div>
      <button class="btn btn-primary btn-lg" id="lsSay">${SPK} הקשיבי</button>
    </div>`, { cls: 'en-sheet' });
    const play = () => say(`${l.up}. ${l.word}.`, { rate: 0.7 });
    $('#lsSay', s.el).onclick = () => { A('tap'); play(); };
  }

  /* ------------------------------------------------------------------ English world · 📖 לומדים (learned letters) */
  function learnPage(root) {
    const ls = learned();
    root.innerHTML = `<div class="en-world">
      <div id="enExam"></div>
      <div class="en-lhead"><h2 class="en-h2">האותיות שלמדנו</h2><span class="en-count">${ls.length}</span></div>
      <div class="en-lgrid">${ls.map(letterCard).join('')}</div>
      <button class="btn btn-primary btn-xl" id="play">🎯 משחק אותיות</button>
    </div>`;
    $('#play').onclick = () => { A('pop'); go('en-quiz/letters'); };
    $$('.en-lcard', root).forEach(b => b.onclick = () => { A('tap'); letterSheet(K.enLetter(b.dataset.up)); });
    upcoming('english').then(list => {
      const box = $('#enExam', root); if (!box || !box.isConnected) return;
      box.innerHTML = list.map(x => examBanner(x)).join('');
      $$('[data-exid]', box).forEach(b => b.onclick = () => { A('pop'); go('en-exam/' + b.dataset.exid); });
    });
  }
  route('english', { chrome: 'tabs', render: learnPage });
  route('en-letters', { chrome: 'tabs', render(root) { go('english', true); } });

  function examBanner(x) {
    const c = countdown(x.date), xs = exState(x.id);
    return `<button class="en-exam-banner ${c.cls}" type="button" data-exid="${x.id}">
      <span class="eb-cal" aria-hidden="true"><small>${heDate(x.date).split('.').slice(0, 2).join('.')}</small><b>${c.n >= 0 ? c.n : '✓'}</b></span>
      <span class="eb-t"><b>📝 ${esc(x.title)}</b><span class="eb-count">${c.t}</span>${xs.best ? `<small>שיא במבדק הדמה: ${xs.best}%</small>` : '<small>בואי נתכונן יחד!</small>'}</span>
      <span class="eb-go" aria-hidden="true">◀</span>
    </button>`;
  }
  K.enExamBanner = examBanner;

  /* ------------------------------------------------------------------ exam area */
  const SECTIONS = [
    { id: 'letters', name: 'אותיות', e: '🔤', blurb: 'גדולות, קטנות וצלילים' },
    { id: 'words', name: 'מילים', e: '🖼️', blurb: 'מילה ותמונה' },
    { id: 'missing', name: 'אות חסרה', e: '🧩', blurb: 'משלימות את המילה' },
    { id: 'sentences', name: 'משפטים', e: '💬', blurb: 'משפט ותמונה' }
  ];
  route('en-exam', { chrome: 'tabs', render(root, id) {
    const host = document.createElement('div'); host.innerHTML = '<div class="en-loading">⏳</div>';
    root.appendChild(host);   // keep the world tab bar that K.ui.render adds to root
    loadExams().then(all => {
      const x = all.find(e => e.id === id);
      if (!host.isConnected || K.ui.current !== 'en-exam') return;
      if (!x) return go('english', true);
      const c = countdown(x.date), xs = exState(x.id);
      const last = xs.mocks[xs.mocks.length - 1];
      host.innerHTML = `<div class="en-exam">
        <div class="en-page-head"><span></span><h1>${esc(x.title)}</h1><span></span></div>
        <div class="en-count-card ${c.cls}">
          <div class="ecc-days"><b>${c.n >= 0 ? c.n : '✓'}</b><small>${c.n === 1 ? 'יום' : 'ימים'}</small></div>
          <div class="ecc-t"><b class="lead">${c.t}</b><small>${heDate(x.date)}${x.note ? ' · ' + esc(x.note) : ''}</small></div>
        </div>
        <h2 class="en-h2">מתאמנות לפי חלקים</h2>
        <div class="en-secs">${SECTIONS.map((s, i) => { const p = xs.practice[s.id]; const st = p ? starsFor(p.best) : 0;
          return `<button class="en-sec s${i}" type="button" data-sec="${s.id}"><span class="es-e" aria-hidden="true">${s.e}</span><b>${s.name}</b><small>${s.blurb}</small><span class="es-stars">${K.ui.starsRow(st, 3, 'sm')}</span></button>`; }).join('')}</div>
        <div class="en-mock card">
          <span class="em-e" aria-hidden="true">🏆</span>
          <div><b>מבדק דמה</b><small>${sumMock(x)} שאלות מכל החלקים, בלי רמזים, כמו במבדק האמיתי.</small>
            ${last ? `<small class="em-last">פעם אחרונה: ${last.pct}% · שיא: ${xs.best}%</small>` : ''}</div>
          <button class="btn btn-primary btn-lg" id="mock">יוצאות לדרך!</button>
        </div>
        <details class="en-scope card"><summary>📋 מה יהיה במבדק?</summary>
          <p>${esc(x.intro || '')}</p>
          <div class="en-scope-l" dir="ltr">${x.letters.map(u => `<span>${u}${u.toLowerCase()}</span>`).join('')}</div>
          <div class="en-scope-w" dir="ltr">${x.words.map(w => `<span>${w.pic} ${w.w}</span>`).join('')}</div>
        </details>
      </div>`;
      $$('.en-sec', host).forEach(b => b.onclick = () => { A('pop'); go(`en-quiz/practice/${x.id}/${b.dataset.sec}`); });
      $('#mock').onclick = () => { A('pop'); go(`en-quiz/mock/${x.id}`); };
    });
  } });
  const sumMock = x => Object.values(x.mock || {}).reduce((s, n) => s + n, 0);
  const starsFor = pct => pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;

  /* ------------------------------------------------------------------ question builders */
  const W = (x, w) => x.words.find(o => o.w === w);
  function distinct(pool, n, avoid, keyFn = v => v) {
    const out = [], seen = new Set([keyFn(avoid)]);
    for (const v of shuffle(pool)) { const k = keyFn(v); if (seen.has(k)) continue; seen.add(k); out.push(v); if (out.length >= n) break; }
    return out;
  }
  const Q = {
    hearLetter(ctx) {
      const l = ctx.pickLetter(), low = Math.random() < .5;
      const opts = [l, ...distinct(ctx.letters, 3, l, v => v.up)];
      return { key: 'l:' + l.up, sec: 'letters', ins: 'הקשיבי ובחרי את האות', audio: l.up + '.', prompt: `<div class="enq-hear">${hearBtn(l.up + '.')}</div>`,
        opts: shuffle(opts).map(o => ({ k: o.up, html: `<span dir="ltr" class="enq-letter">${low ? o.low : o.up}</span>` })), ans: l.up,
        show: `<span dir="ltr">${l.up}${l.low}</span>`, after: `${l.up}.` };
    },
    matchCase(ctx) {
      const l = ctx.pickLetter(), up = Math.random() < .5;
      const opts = [l, ...distinct(ctx.letters, 3, l, v => v.up)];
      return { key: 'l:' + l.up, sec: 'letters', ins: up ? 'מצאי את האות הקטנה' : 'מצאי את האות הגדולה',
        prompt: `<div class="enq-big" dir="ltr">${up ? l.up : l.low}</div>`,
        opts: shuffle(opts).map(o => ({ k: o.up, html: `<span dir="ltr" class="enq-letter">${up ? o.low : o.up}</span>` })), ans: l.up,
        show: `<span dir="ltr">${l.up}${l.low}</span>`, after: `${l.up}.` };
    },
    firstLetter(ctx) {
      const it = ctx.pickStartWord(), l = K.enLetter(it.w[0].toUpperCase());
      const opts = [l, ...distinct(ctx.letters, 3, l, v => v.up)];
      return { key: 'f:' + it.w, sec: 'letters', ins: 'באיזו אות מתחילה המילה?', audio: it.w,
        prompt: `<div class="enq-pic" aria-hidden="true">${it.pic}</div>${hearBtn(it.w)}`,
        opts: shuffle(opts).map(o => ({ k: o.up, html: `<span dir="ltr" class="enq-letter">${o.low}</span>` })), ans: l.up,
        show: `<span dir="ltr"><u>${it.w[0]}</u>${it.w.slice(1)}</span>`, after: it.w };
    },
    picToWord(ctx) {
      const w = ctx.pickWord(); const opts = [w, ...distinct(ctx.x.words, 3, w, v => v.w)];
      return { key: 'w:' + w.w, sec: 'words', ins: 'מה המילה של התמונה?', prompt: `<div class="enq-pic" aria-hidden="true">${w.pic}</div>`,
        opts: shuffle(opts).map(o => ({ k: o.w, html: `<span dir="ltr" class="enq-word">${o.w}</span>` })), ans: w.w, show: `<span dir="ltr">${w.w}</span> ${w.pic}`, after: w.w, hintHe: w.he };
    },
    wordToPic(ctx) {
      const w = ctx.pickWord(); const opts = [w, ...distinct(ctx.x.words, 3, w, v => v.w)];
      return { key: 'w:' + w.w, sec: 'words', ins: 'קראי ובחרי את התמונה', prompt: `<div class="enq-word-big" dir="ltr">${w.w}</div>`, hint: w.w,
        opts: shuffle(opts).map(o => ({ k: o.w, html: `<span dir="ltr" class="enq-pic-opt" aria-label="${o.he}">${o.pic}</span>` })), ans: w.w, pics: true, show: `${w.pic} <span dir="ltr">${w.w}</span>`, after: w.w, hintHe: w.he };
    },
    hearToPic(ctx) {
      const w = ctx.pickWord(); const opts = [w, ...distinct(ctx.x.words, 3, w, v => v.w)];
      return { key: 'w:' + w.w, sec: 'words', ins: 'הקשיבי ובחרי את התמונה', audio: w.w, prompt: `<div class="enq-hear">${hearBtn(w.w)}</div>`,
        opts: shuffle(opts).map(o => ({ k: o.w, html: `<span dir="ltr" class="enq-pic-opt" aria-label="${o.he}">${o.pic}</span>` })), ans: w.w, pics: true, show: `${w.pic} <span dir="ltr">${w.w}</span>`, after: w.w };
    },
    missing(ctx) {
      const w = ctx.pickWord(), i = Math.floor(Math.random() * w.w.length), ch = w.w[i];
      const lowSet = ctx.x.letters.map(u => u.toLowerCase());
      const opts = [ch, ...distinct(lowSet, 3, ch)];
      const shown = w.w.split('').map((c, j) => j === i ? '<span class="enq-gap">?</span>' : `<span>${c}</span>`).join('');
      return { key: 'm:' + w.w, sec: 'missing', ins: 'איזו אות חסרה?', prompt: `<div class="enq-pic sm" aria-hidden="true">${w.pic}</div><div class="enq-spell" dir="ltr">${shown}</div>`, hint: w.w,
        opts: shuffle(opts).map(o => ({ k: o, html: `<span dir="ltr" class="enq-letter">${o}</span>` })), ans: ch,
        show: `<span dir="ltr">${w.w.slice(0, i)}<u>${ch}</u>${w.w.slice(i + 1)}</span> ${w.pic}`, after: w.w, hintHe: w.he };
    },
    sentToPic(ctx) {
      const s = ctx.pickSentence(); const opts = [s, ...ctx.similar(s, 3)];
      return { key: 's:' + s.s, sec: 'sentences', ins: 'קראי ובחרי את התמונה המתאימה', prompt: `<div class="enq-sent" dir="ltr">${esc(s.s)}</div>`, hint: s.s,
        opts: shuffle(opts).map(o => ({ k: o.s, html: `<span dir="ltr" class="enq-pic-opt${o.big ? ' big' : ''}">${o.pic}</span>` })), ans: s.s, pics: true, show: `<span dir="ltr">${esc(s.s)}</span>`, after: s.s };
    },
    picToSent(ctx) {
      const s = ctx.pickSentence(); const opts = [s, ...ctx.similar(s, 3)];
      return { key: 's:' + s.s, sec: 'sentences', ins: 'איזה משפט מתאים לתמונה?', prompt: `<div class="enq-pic${s.big ? ' big' : ''}" dir="ltr" aria-hidden="true">${s.pic}</div>`,
        opts: shuffle(opts).map(o => ({ k: o.s, html: `<span dir="ltr" class="enq-sopt">${esc(o.s)}</span>` })), ans: s.s, rows: true, show: `<span dir="ltr">${esc(s.s)}</span>`, after: s.s };
    }
  };
  const TYPES = {
    letters: ['hearLetter', 'matchCase', 'firstLetter', 'matchCase', 'hearLetter'],
    words: ['picToWord', 'wordToPic', 'hearToPic', 'picToWord', 'wordToPic'],
    missing: ['missing'],
    sentences: ['sentToPic', 'picToSent', 'sentToPic']
  };

  /* context: what the questions draw from, weighted toward items she missed */
  function makeCtx(x, letters, statsObj) {
    const used = new Set();
    const weight = key => { const s = statsObj[key]; return s ? 1 + Math.min(4, s.bad * 1.5) - Math.min(.7, s.ok * .1) : 1.3; };
    const wpick = (arr, keyFn) => {
      let pool = arr.filter(v => !used.has(keyFn(v))); if (!pool.length) pool = arr;
      const ws = pool.map(v => Math.max(.2, weight(keyFn(v)))), sum = ws.reduce((a, b) => a + b, 0);
      let r = Math.random() * sum, i = 0; for (; i < pool.length - 1; i++) { r -= ws[i]; if (r <= 0) break; }
      used.add(keyFn(pool[i])); return pool[i];
    };
    // exam: only the exam's own word list (teacher scope); world practice: the learned letters' example words
    const startWords = x ? x.words : letters.map(l => ({ w: l.word, pic: l.pic })).filter(w => w.w[0] === w.w[0].toLowerCase() && letters.some(l => l.low === w.w[0]));
    return {
      x, letters,
      pickLetter: () => wpick(letters, l => 'l:' + l.up),
      pickStartWord: () => wpick(startWords.filter(w => letters.some(l => l.low === w.w[0])), w => 'f:' + w.w),
      pickWord: () => wpick(x.words, w => 'w:' + w.w),
      pickSentence: () => wpick(x.sentences, s => 's:' + s.s),
      similar(s, n) {
        const ws = new Set(s.s.toLowerCase().match(/[a-z]+/g).filter(w => !['a', 'an', 'and', 'in', 'i'].includes(w)));
        const sc = o => o.s.toLowerCase().match(/[a-z]+/g).filter(w => ws.has(w)).length + Math.random() * 1.2;
        return x.sentences.filter(o => o.s !== s.s && o.pic !== s.pic).map(o => [sc(o), o]).sort((a, b) => b[0] - a[0]).slice(0, n).map(v => v[1]);
      }
    };
  }
  function build(mode, x, sec) {
    if (mode === 'letters') {
      const ls = learned(); const ctx = makeCtx(null, ls.length >= 4 ? ls : K.EN_LETTERS.slice(0, 4), en().letterStats);
      return Array.from({ length: 10 }, (_, i) => Q[['matchCase', 'hearLetter', 'firstLetter'][i % 3]](ctx));
    }
    const letters = x.letters.map(K.enLetter).filter(Boolean);
    const ctx = makeCtx(x, letters, exState(x.id).items);
    if (mode === 'practice') { const t = TYPES[sec]; return Array.from({ length: 8 }, (_, i) => Q[t[i % t.length]](ctx)); }
    const out = [];
    SECTIONS.forEach(s => { const t = TYPES[s.id], n = (x.mock && x.mock[s.id]) || 4; for (let i = 0; i < n; i++) out.push(Q[t[i % t.length]](ctx)); });
    return out;
  }

  /* ------------------------------------------------------------------ quiz runner */
  const CHEERS = ['כל הכבוד! 🌟', 'מעולה! 🎉', 'יופי! 💜', 'נהדר! ⭐', 'אלופה! 🏆', 'וואו! ✨'];
  const TRY = ['כמעט! ככה זה נכון:', 'לא נורא, לומדות! הנה התשובה:', 'עוד רגע זה יהיה קל:'];
  route('en-quiz', { chrome: 'flow', render(root, mode, id, sec) {
    root.innerHTML = '<div class="en-loading">⏳</div>';
    let alive = true;
    const need = mode === 'letters' ? Promise.resolve(null) : loadExams().then(all => all.find(e => e.id === id));
    need.then(x => {
      if (!alive) return;
      if (mode !== 'letters' && !x) return go('english', true);
      run(root, mode, x, sec, () => alive);
    });
    return () => { alive = false; if (K.speech) K.speech.stop(); };
  } });

  function run(root, mode, x, sec, alive) {
    const mock = mode === 'mock';
    const qs = build(mode, x, sec);
    const total = qs.length; let i = 0, right = 0, firstTry = 0; const log = []; const retried = new Set();
    const stats = mode === 'letters' ? en().letterStats : exState(x.id).items;
    const back = () => go(mode === 'letters' ? 'train/english' : 'en-exam/' + x.id);
    const title = mode === 'letters' ? 'משחק אותיות' : mock ? '🏆 מבדק דמה' : (SECTIONS.find(s => s.id === sec) || {}).name;
    root.innerHTML = `<div class="flow en-quiz${mock ? ' mock' : ''}">
      <header class="flow-bar"><button class="icon-btn" id="x" aria-label="יציאה">${K.art.icons.close}</button>
        <div class="en-prog" aria-hidden="true"><i id="bar"></i></div><b class="en-qn" id="qn"></b></header>
      <div class="en-qbody" id="qb"></div></div>`;
    $('#x', root).onclick = () => { A('tap'); if (i > 0 && i < total && !confirm('לצאת באמצע? ההתקדמות בסבב הזה לא תישמר.')) return; back(); };
    function rec(q, ok) { const s = stats[q.key] || (stats[q.key] = { ok: 0, bad: 0 }); ok ? s.ok++ : s.bad++; }
    function show() {
      if (!alive()) return;
      if (i >= qs.length) return finish();
      const q = qs[i];
      $('#bar', root).style.width = Math.round(i / qs.length * 100) + '%';
      $('#qn', root).textContent = `${Math.min(i + 1, qs.length)}/${qs.length}`;
      const secName = mock ? (SECTIONS.find(s => s.id === q.sec) || {}).e + ' ' + (SECTIONS.find(s => s.id === q.sec) || {}).name : '';
      const hintable = !mock && (q.hint || q.hintHe);
      $('#qb', root).innerHTML = `<div class="enq">
        ${secName ? `<small class="enq-sec">${secName}</small>` : ''}
        <p class="lead enq-ins">${q.ins}</p>
        <div class="enq-prompt">${q.prompt}</div>
        <div class="enq-opts${q.pics ? ' pics' : ''}${q.rows ? ' rows' : ''}">${q.opts.map(o => `<button class="choice enq-opt" type="button" data-k="${esc(o.k)}">${o.html}</button>`).join('')}</div>
        ${hintable ? `<button class="btn btn-ghost enq-hint" id="hint" type="button">💡 רמז</button>` : ''}
        <div class="enq-fb" id="fb" aria-live="polite"></div>
      </div>`;
      bindHear($('#qb', root));
      let hinted = false;
      if (hintable) $('#hint', root).onclick = () => {
        A('tap'); hinted = true;
        const fb = $('#fb', root);
        fb.innerHTML = `<div class="enq-hintbox">${q.hintHe ? `<b>${q.hintHe}</b>` : ''}${q.hint ? hearBtn(q.hint) : ''}</div>`;
        bindHear(fb);
      };
      $$('.enq-opt', root).forEach(b => b.onclick = () => answer(q, b, hinted));
    }
    async function answer(q, b, hinted) {
      K.audio.unlock();
      const ok = b.dataset.k === q.ans;
      $$('.enq-opt', root).forEach(o => o.disabled = true);
      const first = !retried.has(i);
      if (mock) {
        b.classList.add('picked'); A('tap');
        rec(q, ok); if (ok) right++;
        log.push({ q, ok, picked: b.textContent.trim() });
        await sleep(350); i++; return show();
      }
      if (first) rec(q, ok && !hinted);
      if (ok) {
        right++; if (first && !hinted) firstTry++;
        b.classList.add('right'); A('right'); K.ui.burstAt(b, { count: 18 });
        $('#fb', root).innerHTML = `<div class="enq-good">${pick(CHEERS)}</div>`;
        await sleep(1000); if (!alive()) return; i++; show();
      } else {
        b.classList.add('miss'); A('wrong');
        $$('.enq-opt', root).forEach(o => { if (o.dataset.k === q.ans) o.classList.add('right'); });
        const fb = $('#fb', root);
        fb.innerHTML = `<div class="enq-try"><span>${pick(TRY)}</span><b class="enq-show">${q.show}</b>${q.after ? hearBtn(q.after) : ''}<button class="btn btn-primary btn-lg" id="nx">ממשיכות ◀</button></div>`;
        bindHear(fb);
        if (first) { retried.add(qs.length); qs.push(Object.assign({}, q, { opts: shuffle(q.opts) })); }
        $('#nx', root).onclick = () => { A('tap'); i++; show(); };
      }
    }
    function finish() {
      $('#bar', root).style.width = '100%';
      const base = mock ? total : total;
      const score = mock ? right : firstTry;
      const pct = Math.round(score / base * 100);
      const stars = starsFor(pct);
      const coins = 5 + score * (mock ? 2 : 1);
      K.store.addCoins(coins); K.store.touchStreak();
      let best = false;
      if (mode === 'letters') { const p = en().practice; p.plays++; if (score > (p.best || 0)) { p.best = score; best = true; } }
      else if (mock) {
        const xs = exState(x.id), bySec = {};
        log.forEach(l => { const s = bySec[l.q.sec] || (bySec[l.q.sec] = { ok: 0, n: 0 }); s.n++; if (l.ok) s.ok++; });
        xs.mocks.push({ ts: Date.now(), score, total, pct, bySec }); xs.mocks = xs.mocks.slice(-12);
        if (pct > xs.best) { xs.best = pct; best = true; }
        var secRows = SECTIONS.map(s => { const r = bySec[s.id] || { ok: 0, n: 0 }; return `<div class="enr-sec"><span>${s.e} ${s.name}</span><span class="pbar"><i style="width:${r.n ? Math.max(4, Math.round(r.ok / r.n * 100)) : 0}%"></i></span><b>${r.ok}/${r.n}</b></div>`; }).join('');
      } else {
        const xs = exState(x.id), p = xs.practice[sec] || (xs.practice[sec] = { plays: 0, best: 0 });
        p.plays++; p.last = pct; if (pct > p.best) { p.best = pct; best = true; }
      }
      K.store.save();
      const msg = pct >= 90 ? 'אלופה אמיתית! 🏆' : pct >= 70 ? 'עבודה מצוינת! 🌟' : pct >= 40 ? 'יפה מאוד! עוד קצת אימון ותהיי מוכנה 💪' : 'התחלה טובה! כל אימון מקרב אותך 💜';
      const misses = mock ? log.filter(l => !l.ok) : [];
      $('#qb', root).innerHTML = `<div class="en-result">
        <div class="enr-stars">${K.ui.starsRow(stars, 3)}</div>
        <h1 class="result-msg">${msg}</h1>
        <div class="enr-score"><b dir="ltr">${score}/${base}</b><small>${mock ? 'תשובות נכונות' : 'נכון בניסיון הראשון'}</small></div>
        ${best ? '<div class="enr-best">🎖️ שיא חדש!</div>' : ''}
        <div class="enr-coins">+${coins} ${K.art.icons.coin}</div>
        ${mock ? `<div class="enr-secs card">${secRows}</div>` : ''}
        ${misses.length ? `<div class="enr-miss card"><b>בואי נחזור על אלה:</b>${misses.map(l => `<div class="enr-m"><span>${l.q.show}</span>${l.q.after ? hearBtn(l.q.after) : ''}</div>`).join('')}</div>` : ''}
        <div class="enr-actions"><button class="btn btn-primary btn-lg" id="again">🔁 עוד פעם</button><button class="btn btn-secondary btn-lg" id="done">סיום</button></div>
      </div>`;
      bindHear($('#qb', root));
      if (stars) { A(stars === 3 ? 'fanfare' : 'star'); K.ui.confetti({ stars: true, count: 40 + stars * 25 }); }
      $('#again', root).onclick = () => { A('pop'); run(root, mode, x, sec, alive); };
      $('#done', root).onclick = () => { A('pop'); back(); };
    }
    show();
  }

  /* ------------------------------------------------------------------ parent corner: learned letters manager */
  function parentSection() {
    const set = new Set(en().learnedLetters);
    return `<section class="p-sec en-pmgr"><h3>🔤 אנגלית: האותיות שנלמדו</h3>
      <p class="muted">סמנו אותיות חדשות כשהן נלמדות בכיתה. דף "האותיות שלמדנו" ומשחק האותיות יתעדכנו לבד.</p>
      <div class="en-pgrid" dir="ltr">${K.EN_LETTERS.map(l => `<button type="button" class="en-ptog${set.has(l.up) ? ' on' : ''}" data-up="${l.up}" aria-pressed="${set.has(l.up)}">${l.up}${l.low}</button>`).join('')}</div>
      <small class="muted" id="enPCount">${set.size} אותיות מסומנות</small>
    </section>`;
  }
  function bindParent(root) {
    $$('.en-ptog', root).forEach(b => b.onclick = () => {
      const e = en(), up = b.dataset.up, has = e.learnedLetters.includes(up);
      if (has && e.learnedLetters.length <= 1) return toast('צריך לפחות אות אחת');
      e.learnedLetters = has ? e.learnedLetters.filter(u => u !== up) : e.learnedLetters.concat(up);
      e.learnedLetters.sort();
      K.store.save();
      b.classList.toggle('on', !has); b.setAttribute('aria-pressed', String(!has));
      const c = $('#enPCount', root); if (c) c.textContent = `${e.learnedLetters.length} אותיות מסומנות`;
    });
  }

  K.en = { loadExams, upcoming, countdown, heDate, daysLeft, examBanner, learned, parentSection, bindParent, state: en, exState };
})();
