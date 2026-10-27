/* לוח הכפל – interactive 10×10 explorer. */
(function () {
  const { $, $$, h, route, arrayHTML, esc } = K.ui;
  const I = () => K.art.icons;
  const A = (n, v) => K.audio.play(n, v);

  const PATTERNS = [
    { id: 'none',   label: 'בלי הדגשה', note: 'לחצי על משבצת כדי לראות את התרגיל כתמונה. אפשר גם לבחור הדגשה!' },
    { id: 'mirror', label: 'תאומים (שיקוף)', note: 'כל תרגיל מופיע פעמיים, משני צדי האלכסון! 3 × 7 ו-7 × 3 נותנים אותה תשובה. לחצי על משבצת וראי את התאום שלה.' },
    { id: 'five',   label: 'סיומת 0 או 5', note: 'כל התוצאות של טבלת ה-5 מסתיימות ב-0 או ב-5, וגם כל תוצאה שמסתיימת ככה שייכת לטבלת ה-5!' },
    { id: 'nine',   label: 'הסוד של ה-9', note: 'בטבלת ה-9 סכום הספרות של התוצאה הוא תמיד 9. למשל 9 × 4 = 36, ו-3 + 6 = 9.' },
    { id: 'double', label: 'כפל ב-2 (הכפלה)', note: 'השורה של ה-2 היא פשוט להכפיל: 2 × 6 זה 6 + 6. כל התוצאות זוגיות.' },
    { id: 'square', label: 'ריבועים (האלכסון)', note: 'באלכסון נמצאים המספרים שמוכפלים בעצמם: 1×1, 2×2, 3×3... התוצאות נקראות ריבועים כי אפשר לסדר אותן בריבוע!' },
    { id: 'mine',   label: 'ההתקדמות שלי', note: 'המשבצות צבועות לפי מה שאת כבר שולטת בו. אפור: חדש, כתום: לחזק, צהוב: כמעט, ירוק: שולטת. הטבלאות שעוד לא נפתחו נשארות אפורות.' }
  ];

  route('explorer', { chrome: 'tabs', render(root) {
    let sel = [3, 4], pat = 'none', filt = 0, rotated = false;
    if (K.explorerFocus) { filt = K.explorerFocus; sel = [filt, Math.min(10, filt + 1)]; if (filt === 10) sel = [10, 3]; K.explorerFocus = null; }
    const digitSum = n => String(n).split('').reduce((s, d) => s + Number(d), 0);
    const level = (r, c) => {
      const t = K.TABLES[r] && K.TABLES[r].ready ? r : (K.TABLES[c] && K.TABLES[c].ready ? c : 0); if (!t) return 'new';
      const m = t === r ? c : r, f = K.store.fact(t, m);
      return !f.seen ? 'new' : f.box <= 1 ? 'weak' : f.box <= 3 ? 'mid' : 'good';
    };
    function cellClass(r, c) {
      const p = r * c, cls = [];
      if (filt) cls.push(r === filt || c === filt ? 'hi' : 'dim');
      if (pat === 'five' && p % 5 === 0) cls.push('pat');
      if (pat === 'nine' && (r === 9 || c === 9)) cls.push('pat');
      if (pat === 'double' && (r === 2 || c === 2)) cls.push('pat');
      if (pat === 'square' && r === c) cls.push('pat');
      if (pat === 'mirror' && r !== c) { const [sr, sc] = sel; if ((r === sc && c === sr)) cls.push('mirror'); }
      if (pat === 'mine') cls.push('lv-' + level(r, c));
      if (r === sel[0] && c === sel[1]) cls.push('sel');
      return cls.join(' ');
    }
    function draw() {
      const [r, c] = sel;
      root.innerHTML = `<div class="explorer">
        <div class="ex-head"><h2 class="h-big">לוח הכפל</h2><p class="sub">לחצי על משבצת כדי לראות את התרגיל כתמונה.</p></div>
        <div class="ex-layout">
          <div class="ex-detail card" id="detail"></div>
          <div class="ex-main">
            <div class="chip-row" role="group" aria-label="הדגשת טבלה"><span class="chip-label">טבלה:</span>
              <button class="chip${!filt ? ' on' : ''}" data-f="0">הכול</button>
              ${Array.from({ length: 10 }, (_, i) => `<button class="chip${filt === i + 1 ? ' on' : ''}" data-f="${i + 1}">${i + 1}</button>`).join('')}</div>
            <div class="chip-row" role="group" aria-label="תבניות"><span class="chip-label">גלי תבניות:</span>
              ${PATTERNS.map(p => `<button class="chip pat-chip${pat === p.id ? ' on' : ''}" data-p="${p.id}">${p.label}</button>`).join('')}</div>
            <p class="pat-note" id="pnote">${PATTERNS.find(p => p.id === pat).note}</p>
            <div class="mgrid-wrap"><div class="mgrid" dir="ltr" role="grid" aria-label="לוח הכפל">
              <div class="gh corner">×</div>
              ${Array.from({ length: 10 }, (_, i) => `<div class="gh${(filt === i + 1 || sel[1] === i + 1) ? ' on' : ''}" role="columnheader">${i + 1}</div>`).join('')}
              ${Array.from({ length: 10 }, (_, ri) => `<div class="gh${(filt === ri + 1 || sel[0] === ri + 1) ? ' on' : ''}" role="rowheader">${ri + 1}</div>` +
                Array.from({ length: 10 }, (_, ci) => { const rr = ri + 1, cc = ci + 1, p = rr * cc;
                  return `<button class="gc ${cellClass(rr, cc)}" role="gridcell" data-r="${rr}" data-c="${cc}" aria-label="${rr} כפול ${cc} שווה ${p}">${p}${pat === 'nine' && (rr === 9 || cc === 9) ? `<small>${String(p).split('').join('+')}</small>` : ''}</button>`; }).join('')).join('')}
            </div></div>
          </div>
        </div></div>`;
      detail();
      $$('.chip[data-f]', root).forEach(b => b.onclick = () => { A('tap'); filt = Number(b.dataset.f); draw(); });
      $$('.chip[data-p]', root).forEach(b => b.onclick = () => { A('pop'); pat = b.dataset.p; draw(); });
      $$('.gc', root).forEach(b => b.onclick = () => { sel = [Number(b.dataset.r), Number(b.dataset.c)]; rotated = false; A('dot', sel[0]); draw(); $('.gc.sel', root).focus({ preventScroll: true }); if (window.innerWidth < 900) $('#detail', root).scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    }
    function detail() {
      const [r, c] = sel, p = r * c, d = $('#detail', root);
      const facts = [];
      if (p % 5 === 0) facts.push(`התוצאה ${p} מסתיימת ב-${p % 10}, כמו בטבלת ה-5.`);
      if (r === 9 || c === 9) facts.push(`סכום הספרות של ${p} הוא ${String(p).split('').join(' + ')} = ${digitSum(p)}. סוד ה-9!`);
      if (r === 2 || c === 2) facts.push(`זה כפל ב-2: ${Math.max(r, c)} + ${Math.max(r, c)} = ${p}.`);
      if (r === 10 || c === 10) facts.push(`כפל ב-10: כותבים ${Math.min(r, c) === 10 ? Math.max(r, c) : Math.min(r, c)} ומוסיפים 0.`);
      if (r === c) facts.push(`${r} × ${r} הוא ריבוע: אפשר לסדר ${p} עיגולים בריבוע של ${r} על ${r}.`);
      if (r === 1 || c === 1) facts.push(`כפל ב-1: המספר נשאר אותו הדבר.`);
      if (p % 2 === 0 && !(r === 2 || c === 2)) facts.push('התוצאה זוגית.');
      const R = rotated ? c : r, C = rotated ? r : c;
      d.innerHTML = `<div class="det-top"><div class="eq big" dir="ltr"><span>${R}</span><span>×</span><span>${C}</span><span>=</span><b>${p}</b></div></div>
        <div class="arr-wrap">${arrayHTML(R, C, { cls: 'arr-det', delay: 40, dotDelay: 6 })}</div>
        <p class="det-cap">${R} שורות, ובכל שורה ${C} עיגולים</p>
        ${r !== c ? `<button class="btn btn-secondary" id="rot">↻ סובבי את התמונה: ${C} × ${R}</button><p class="det-twin">התאום של התרגיל: <b dir="ltr">${c} × ${r} = ${p}</b>. אותה תשובה!</p>` : `<p class="det-twin">זה תרגיל אלכסוני, אין לו תאום אחר.</p>`}
        <ul class="det-facts">${facts.map(f => `<li>${f}</li>`).join('')}</ul>
        <div class="skip" dir="ltr">${Array.from({ length: R }, (_, i) => `<span class="chip-n" style="--i:${i}">${(i + 1) * C}</span>`).join('<span class="chip-sep">‹</span>')}</div>
        <button class="btn btn-ghost only-mobile" id="backgrid">↑ חזרה ללוח</button>`;
      const bg = $('#backgrid', root); if (bg) bg.onclick = () => $('.mgrid-wrap', root).scrollIntoView({ behavior: 'smooth', block: 'center' });
      const rot = $('#rot', root); if (rot) rot.onclick = () => { rotated = !rotated; A('whoosh'); detail(); };
    }
    draw();
  } });
})();
