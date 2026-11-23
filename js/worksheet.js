/* Interactive original worksheet: the teacher's exact page image with answer fields over the blanks.
   Coordinates are pixels on the 1700×2200 page render (200 dpi), turned into percentages so they scale.
   Answer keys come from the verified exam data (data/exams/math-geo-2026-12-20.json), never shown before checking. */
(function () {
  const { $, $$, go, route } = K.ui;
  const ID = 'math-geo-2026-12-20', SRC = 'data/exams/' + ID + '.json', IMG = n => `data/exams/math-2026-12-20/ws/page-${n}.webp`;
  const PW = 1700, PH = 2200;
  /* [fieldId, itemId, key-part, x1, y1, x2, y2, type] — type: num (default) | words | cmp */
  const PAGES = {
    1: [
      ['a1', 'p1a1', 0, 470, 1168, 645, 1240], ['a2', 'p1a2', 0, 1128, 1168, 1303, 1240],
      ['b1', 'p1b1', 0, 523, 1332, 760, 1404], ['b2', 'p1b2', 0, 824, 1414, 1064, 1486],
      ['c1', 'p1c1', 0, 342, 1578, 1286, 1653, 'words'],
      ['d1p', 'p1d1', 'prev', 1013, 1850, 1313, 1914], ['d1n', 'p1d1', 'next', 388, 1850, 688, 1914],
      ['d2p', 'p1d2', 'prev', 1013, 1926, 1313, 1991], ['d2n', 'p1d2', 'next', 388, 1926, 688, 1991]
    ],
    2: [
      ['a1', 'p2a1', 0, 880, 890, 1100, 963],
      ['b1', 'p2b1', 0, 775, 1130, 948, 1203], ['b2', 'p2b2', 0, 1398, 1130, 1578, 1203],
      ['c11', 'p2c1', 0, 477, 1305, 639, 1378], ['c12', 'p2c1', 1, 693, 1305, 852, 1378], ['c13', 'p2c1', 2, 907, 1305, 1068, 1378], ['c14', 'p2c1', 3, 1122, 1305, 1282, 1378],
      ['c21', 'p2c2', 0, 479, 1418, 639, 1491], ['c22', 'p2c2', 1, 693, 1418, 854, 1491], ['c23', 'p2c2', 2, 909, 1418, 1068, 1491],
      ['d1', 'p2d1', 0, 448, 1797, 532, 1881, 'cmp'], ['d2', 'p2d2', 0, 1099, 1797, 1183, 1881, 'cmp'],
      ['d3', 'p2d3', 0, 564, 1906, 648, 1990, 'cmp'], ['d4', 'p2d4', 0, 1106, 1906, 1190, 1990, 'cmp']
    ]
  };
  K.WS_PAGES = Object.keys(PAGES).map(Number);
  let DATA = null;
  const load = () => DATA ? Promise.resolve(DATA) : fetch(SRC).then(r => r.json()).then(d => (DATA = d));
  const items = d => { const m = {}; d.teacherSheet.pages.forEach(p => p.sections.forEach(s => s.items.forEach(i => { m[i.id] = i; }))); return m; };
  /* the expected answer for one field, from the verified item */
  function keyOf(it, part) {
    if (it.kind === 'eq') return +[...it.text.matchAll(/\[(\d+)\]/g)][part][1];
    if (it.kind === 'prevnext') return it[part];
    if (it.kind === 'toWords') return it.n;
    return it.ans;
  }
  const num = v => { const s = String(v).replace(/[,\s]/g, ''); return /^\d+$/.test(s) ? +s : NaN; };
  function correct(f, it, v) {
    const k = keyOf(it, f[2]);
    if (f[7] === 'cmp') return v === k;
    if (f[7] === 'words') return !!v && K.MX.fromWords(v) === k;
    return num(v) === k;
  }
  function wsState() {
    const st = K.store.state;
    if (!st.exams || typeof st.exams !== 'object') st.exams = {};
    const e = st.exams[ID] || (st.exams[ID] = {});
    if (!e.ws || typeof e.ws !== 'object') e.ws = {};
    return e.ws;
  }
  const CYCLE = ['', '<', '>', '='];

  route('mathws', { chrome: 'none', render(root, arg) {
    const n = PAGES[+arg] ? +arg : 1, F = PAGES[n], ws = wsState(), saved = ws['p' + n] || (ws['p' + n] = {});
    root.innerHTML = `<div class="ws"><header class="flow-bar ws-bar"><button class="icon-btn" id="wsX" type="button" aria-label="חזרה">${K.art.icons.close}</button>
        <b class="ws-t">📄 דף המורה – עמוד ${n}</b><button class="btn btn-secondary ws-zoom" id="wsZoom" type="button" aria-pressed="false">🔍 הגדלה</button></header>
      <div class="ws-scroll" id="wsScroll"><div class="ws-page" id="wsPage"><img src="${IMG(n)}" alt="דף התרגול של המורה, עמוד ${n}" width="${PW}" height="${PH}" draggable="false">
        ${F.map(f => { const st = `left:${f[3] / PW * 100}%;top:${f[4] / PH * 100}%;width:${(f[5] - f[3]) / PW * 100}%;height:${(f[6] - f[4]) / PH * 100}%`;
          return f[7] === 'cmp' ? `<button type="button" class="ws-f ws-cmp" dir="ltr" data-f="${f[0]}" style="${st}" aria-label="סימן השוואה"></button>`
            : `<input class="ws-f${f[7] === 'words' ? ' ws-words' : ''}" data-f="${f[0]}" style="${st}" ${f[7] === 'words' ? 'dir="rtl" type="text"' : 'dir="ltr" type="text" inputmode="numeric" pattern="[0-9,]*"'} autocomplete="off" aria-label="תשובה">`; }).join('')}
      </div></div>
      <div class="ws-foot"><span id="wsMsg" aria-live="polite"></span><button class="btn btn-primary btn-lg" id="wsCheck" type="button">✓ בדיקה</button>
        ${K.WS_PAGES.filter(p => p !== n).map(p => `<button class="btn btn-secondary" data-p="${p}" type="button">לעמוד ${p}</button>`).join('')}</div></div>`;
    const page = $('#wsPage', root), sc = $('#wsScroll', root);
    const fit = () => { page.style.fontSize = (page.clientWidth * 0.026) + 'px'; };
    const ro = window.ResizeObserver ? new ResizeObserver(fit) : null; if (ro) ro.observe(page); fit();
    $$('.ws-f', root).forEach(el => {
      const id = el.dataset.f;
      if (el.tagName === 'BUTTON') { el.textContent = saved[id] || ''; el.onclick = () => { const v = CYCLE[(CYCLE.indexOf(el.textContent) + 1) % CYCLE.length]; el.textContent = v; saved[id] = v; el.classList.remove('ok', 'try'); K.store.save(); }; }
      else { el.value = saved[id] || ''; el.oninput = () => { saved[id] = el.value; el.classList.remove('ok', 'try'); K.store.save(); }; }
    });
    $('#wsZoom', root).onclick = e => { const on = page.classList.toggle('zoom'); e.currentTarget.setAttribute('aria-pressed', on); e.currentTarget.textContent = on ? '🔍 דף שלם' : '🔍 הגדלה'; fit(); };
    $$('[data-p]', root).forEach(b => b.onclick = () => go('mathws/' + b.dataset.p, true));
    $('#wsX', root).onclick = () => go('mathexam');
    $('#wsCheck', root).onclick = () => load().then(d => {
      const M = items(d); let ok = 0, filled = 0;
      F.forEach(f => {
        const el = $(`[data-f="${f[0]}"]`, root), v = el.tagName === 'BUTTON' ? el.textContent : el.value.trim();
        el.classList.remove('ok', 'try');
        if (!v) return;
        filled++;
        if (correct(f, M[f[1]], v)) { ok++; el.classList.add('ok'); } else el.classList.add('try');
      });
      ws['done' + n] = ok === F.length ? 1 : (ws['done' + n] || 0); K.store.save();
      $('#wsMsg', root).textContent = ok === F.length ? 'כל הכבוד! הכל נכון 🎉' : filled < F.length ? `נכון ${ok} מתוך ${F.length}. יש עוד מקומות למלא.` : `נכון ${ok} מתוך ${F.length}. נסי לתקן את הכתומים.`;
      if (ok === F.length && K.ui.confetti) K.ui.confetti({ count: 60 });
    }).catch(() => { $('#wsMsg', root).textContent = 'אין חיבור. נסי שוב.'; });
    return () => { if (ro) ro.disconnect(); };
  } });
})();
