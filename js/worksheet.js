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
    ],
    3: [
      ['a1', 'p3a1', 0, 436, 466, 538, 517], ['a2', 'p3a1', 1, 791, 466, 892, 517], ['a3', 'p3a1', 2, 1263, 466, 1365, 517],
      ['c5', 'p3c5', 0, 456, 1828, 627, 1900], ['c3', 'p3c3', 0, 877, 1828, 1048, 1900], ['c1', 'p3c1', 0, 1304, 1828, 1476, 1900],
      ['c6', 'p3c6', 0, 454, 1926, 627, 1998], ['c4', 'p3c4', 0, 897, 1926, 1068, 1998], ['c2', 'p3c2', 0, 1338, 1926, 1509, 1998]
    ],
    4: [
      ['a1o0', 'p4a1', 0, 953, 784, 1087, 853, 'mark1'], ['a1o1', 'p4a1', 1, 1145, 784, 1279, 853, 'mark1'], ['a1o2', 'p4a1', 2, 1337, 784, 1471, 853, 'mark1'],
      ['a2o0', 'p4a2', 0, 950, 874, 1089, 943, 'mark1'], ['a2o1', 'p4a2', 1, 1142, 874, 1281, 943, 'mark1'], ['a2o2', 'p4a2', 2, 1335, 874, 1473, 943, 'mark1'],
      ['b1', 'p4b1', 0, 558, 1782, 729, 1854], ['b2', 'p4b2', 0, 1301, 1782, 1472, 1854],
      ['b3', 'p4b3', 0, 636, 1901, 807, 1973], ['b4', 'p4b4', 0, 1261, 1901, 1433, 1973]
    ],
    5: [].concat(
      ...[['a1', 'p5a1', 348], ['a2', 'p5a2', 787], ['a3', 'p5a3', 1226]].map(([id, it, x]) => [0, 1, 2, 3].map(i => [id + 'd' + i, it, i, x + i * 64.25 + 3, 957, x + (i + 1) * 64.25 - 3, 1018])),
      [['b1x', 'p5b1', 'ex', 946, 1550, 1376, 1617, 'pick'], ['b1', 'p5b1', 0, 303, 1550, 733, 1617],
       ['c1x', 'p5c1', 'ex', 946, 1900, 1376, 1967, 'pick'], ['c1', 'p5c1', 0, 303, 1900, 733, 1967]]),
    6: [
      ['a0', 'p6a1', 0, 245, 790, 412, 952, 'mark'], ['a1', 'p6a1', 1, 494, 790, 672, 952, 'mark'], ['a2', 'p6a1', 2, 754, 790, 929, 952, 'mark'],
      ['a3', 'p6a1', 3, 1012, 790, 1188, 952, 'mark'], ['a4', 'p6a1', 4, 1271, 790, 1456, 952, 'mark'],
      ['b1', 'p6b1', 0, 207, 1222, 496, 1295, 'pick'], ['b2', 'p6b2', 0, 540, 1222, 829, 1295, 'pick'], ['b3', 'p6b3', 0, 872, 1222, 1160, 1295, 'pick'], ['b4', 'p6b4', 0, 1205, 1222, 1493, 1295, 'pick'],
      ['c3', 'p6c3', 0, 227, 1818, 596, 1891, 'pick'], ['c2', 'p6c2', 0, 666, 1818, 1035, 1891, 'pick'], ['c1', 'p6c1', 0, 1105, 1818, 1474, 1891, 'pick']
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
    if (it.kind === 'nlfill') return it.ans[part];
    if (it.kind === 'vertical') return +String(it.ans).padStart(4, '0')[part];
    if (it.kind === 'word' && part === 'ex') return exOpts(it)[0];
    if (it.kind === 'polygons') return it.shapes[part].ok;
    if (it.kind === 'estimate') return it.options[part] === it.ans;
    return it.ans;
  }
  const F$ = n => K.MX.fmt(n);
  /* word problem "תרגיל": the correct exercise first (as the key), then the other operation */
  const exOpts = it => it.op === '+' ? [`${F$(it.a)} + ${F$(it.b)}`, `${F$(it.a)} − ${F$(it.b)}`] : [`${F$(it.a)} − ${F$(it.b)}`, `${F$(it.a)} + ${F$(it.b)}`];
  const optsOf = (f, it) => f[7] === 'words' ? WORD_OPTS : it.kind === 'word' ? exOpts(it) : it.options;
  const num = v => { const s = String(v).replace(/[,\s]/g, ''); return /^\d+$/.test(s) ? +s : NaN; };
  function correct(f, it, v) {
    const k = keyOf(it, f[2]);
    if (f[7] === 'cmp' || f[7] === 'pick') return v === k;
    if (f[7] === 'mark' || f[7] === 'mark1') return (v === '1') === k;
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
  /* 2,530: the correct words + distractors (2,350 · 5,230 · 2,503); checked by K.MX.fromWords, never by position */
  const WORD_OPTS = ['אלפיים חמש מאות ושלושים', 'אלפיים שלוש מאות וחמישים', 'חמשת אלפים מאתיים ושלושים', 'אלפיים חמש מאות ושלוש'];
  const CYCLE = ['', '<', '>', '='];

  route('mathws', { chrome: 'none', render(root, arg) {
    const n = PAGES[+arg] ? +arg : 1, F = PAGES[n], ws = wsState(), saved = ws['p' + n] || (ws['p' + n] = {});
    root.innerHTML = `<div class="ws"><header class="flow-bar ws-bar"><button class="icon-btn" id="wsX" type="button" aria-label="חזרה">${K.art.icons.close}</button>
        <b class="ws-t">📄 דף המורה – עמוד ${n}</b><button class="btn btn-secondary ws-zoom" id="wsZoom" type="button" aria-pressed="false">🔍 הגדלה</button></header>
      <div class="ws-scroll" id="wsScroll"><div class="ws-page" id="wsPage"><img src="${IMG(n)}" alt="דף התרגול של המורה, עמוד ${n}" width="${PW}" height="${PH}" draggable="false">
        ${F.map(f => { const st = `left:${f[3] / PW * 100}%;top:${f[4] / PH * 100}%;width:${(f[5] - f[3]) / PW * 100}%;height:${(f[6] - f[4]) / PH * 100}%`;
          if (f[7] === 'words' || f[7] === 'pick') return `<button type="button" class="ws-f ws-pick${f[7] === 'words' ? ' ws-words' : ''}" data-f="${f[0]}" data-t="${f[7]}" style="${st}" aria-label="בחירת תשובה"${f[2] === 'ex' ? ' dir="ltr"' : ''}></button>`;
          if (f[7] === 'mark' || f[7] === 'mark1') return `<button type="button" class="ws-f ws-mark" data-f="${f[0]}" data-g="${f[1]}" data-t="${f[7]}" style="${st}" aria-label="סימון" aria-pressed="false"></button>`;
          return f[7] === 'cmp' ? `<button type="button" class="ws-f ws-cmp" dir="ltr" data-f="${f[0]}" style="${st}" aria-label="סימן השוואה"></button>`
            : `<input class="ws-f${f[6] - f[4] < 60 ? ' ws-sm' : ''}" data-f="${f[0]}" style="${st}" ${f[7] === 'words' ? 'dir="rtl" type="text"' : 'dir="ltr" type="text" inputmode="numeric" pattern="[0-9,]*"'} autocomplete="off" aria-label="תשובה">`; }).join('')}
      </div></div>
      <div class="ws-foot"><span id="wsMsg" aria-live="polite"></span><button class="btn btn-primary btn-lg" id="wsCheck" type="button">✓ בדיקה</button>
        ${K.WS_PAGES.filter(p => p !== n).map(p => `<button class="btn btn-secondary" data-p="${p}" type="button">לעמוד ${p}</button>`).join('')}</div></div>`;
    const page = $('#wsPage', root), sc = $('#wsScroll', root);
    const fit = () => { page.style.fontSize = (page.clientWidth * 0.026) + 'px'; };
    const ro = window.ResizeObserver ? new ResizeObserver(fit) : null; if (ro) ro.observe(page); fit();
    $$('.ws-f', root).forEach(el => {
      const id = el.dataset.f;
      if (el.classList.contains('ws-pick')) { el.textContent = saved[id] || ''; el.onclick = () => pick(el, id); }
      else if (el.classList.contains('ws-mark')) { const set = v => { el.classList.toggle('on', v); el.setAttribute('aria-pressed', v); saved[el.dataset.f] = v ? '1' : ''; };
        set(saved[id] === '1');
        el.onclick = () => { const v = !el.classList.contains('on');
          if (el.dataset.t === 'mark1') $$(`.ws-mark[data-g="${el.dataset.g}"]`, root).forEach(o => { if (o !== el) { o.classList.remove('on', 'ok', 'try'); o.setAttribute('aria-pressed', false); saved[o.dataset.f] = ''; } });
          set(v); el.classList.remove('ok', 'try'); K.store.save(); }; }
      else if (el.tagName === 'BUTTON') { el.textContent = saved[id] || ''; el.onclick = () => { const v = CYCLE[(CYCLE.indexOf(el.textContent) + 1) % CYCLE.length]; el.textContent = v; saved[id] = v; el.classList.remove('ok', 'try'); K.store.save(); }; }
      else { el.value = saved[id] || ''; el.oninput = () => { saved[id] = el.value; el.classList.remove('ok', 'try'); K.store.save(); }; }
    });
    /* choices instead of typing (number in words, angle / triangle names, the exercise of a word problem) */
    function pick(el, id) { load().then(d => {
      const f = F.find(x => x[0] === id), opts = K.MX.shuffle(optsOf(f, items(d)[f[1]]).slice());
      const sh = K.ui.sheet(`<div class="ws-pick-sh"><h2>${f[7] === 'words' ? 'בחרי את המספר במילים' : 'בחרי את התשובה'}</h2><div class="mx-chips ws-chips">${opts.map(o => `<button type="button" class="mx-chip${o === el.textContent ? ' on' : ''}"${f[2] === 'ex' ? ' dir="ltr"' : ''}>${o}</button>`).join('')}</div></div>`);
      $$('.mx-chip', sh.el).forEach(b => b.onclick = () => { el.textContent = b.textContent; saved[id] = b.textContent; el.classList.remove('ok', 'try'); K.store.save(); sh.close(); });
    }); }
    $('#wsZoom', root).onclick = e => { const on = page.classList.toggle('zoom'); e.currentTarget.setAttribute('aria-pressed', on); e.currentTarget.textContent = on ? '🔍 דף שלם' : '🔍 הגדלה'; fit(); };
    $$('[data-p]', root).forEach(b => b.onclick = () => go('mathws/' + b.dataset.p, true));
    $('#wsX', root).onclick = () => go('mathexam');
    $('#wsCheck', root).onclick = () => load().then(d => {
      const M = items(d); let ok = 0, filled = 0;
      F.forEach(f => {
        const el = $(`[data-f="${f[0]}"]`, root), mk = el.classList.contains('ws-mark'), v = mk ? (el.classList.contains('on') ? '1' : '') : el.tagName === 'BUTTON' ? el.textContent : el.value.trim();
        el.classList.remove('ok', 'try');
        /* marks: an unmarked spot is an answer too; only marked spots get colored, so nothing is revealed */
        if (mk) { filled++; const good = correct(f, M[f[1]], v); if (good) ok++; if (v) el.classList.add(good ? 'ok' : 'try'); return; }
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
