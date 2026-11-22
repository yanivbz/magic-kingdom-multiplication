/* Parent corner: gate + overview. */
K.parent = (function () {
  const { $, $$, go, route, sheet, esc, toast } = K.ui;
  const I = () => K.art.icons;
  let okUntil = 0;
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function gate(next) {
    const a = rnd(12, 19), b = rnd(6, 9);
    const s = sheet(`<div class="gate"><div class="gate-ic">${I().lock}</div><h2>פינת ההורים</h2><p class="muted">כדי להיכנס, פתרו תרגיל למבוגרים:</p>
      <div class="eq big" dir="ltr"><span>${a}</span><span>×</span><span>${b}</span><span>=</span><b>?</b></div>
      <input id="gans" class="gate-in" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" dir="ltr" aria-label="תשובה">
      <button class="btn btn-primary btn-lg" id="gok">כניסה</button><p class="muted gate-err" id="gerr" aria-live="polite"></p></div>`, { cls: 'sheet-small' });
    const inp = $('#gans', s.el); inp.focus();
    const check = () => {
      if (Number(inp.value) === a * b) { okUntil = Date.now() + 30 * 60000; s.close(); go(next || 'parent'); }
      else { K.audio.play('wrong'); $('#gerr', s.el).textContent = 'לא נכון, נסו שוב.'; inp.value = ''; inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 400); }
    };
    $('#gok', s.el).onclick = check; inp.onkeydown = e => { if (e.key === 'Enter') check(); };
  }

  const lv = f => !f.seen ? 'new' : f.box <= 1 ? 'weak' : f.box <= 3 ? 'mid' : 'good';
  const boxTxt = f => (f.seen && f.box === 0) ? 'לחזק' : ['חדש', 'לחזק', 'מתחיל להיות מוכר', 'כמעט', 'טוב', 'שולטת'][f.box] || '';

  let tab = 'kefel';
  const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '–';
  function geoPanel() {
    const g = K.store.state.geo || { units: {}, medals: {}, history: [] };
    const M = g.medals && g.medals.garden ? K.MEDALS[g.medals.garden] : null;
    const units = K.GEO.UNITS.map(u => { const s = g.units[u.id]; return `<li class="p-row"><span class="pr-e" aria-hidden="true">${u.emoji}</span><b>${u.name}</b>${!u.ready ? '<small class="muted">בקרוב</small>' : s && s.sessions ? `<span>${K.ui.starsRow(s.stars, 3, 'sm')}</span><small>${s.sessions} סבבים · שיא ${Math.round((s.best || 0) * 100)}% · רמה ${s.level}</small>` : '<small class="muted">עוד לא תורגל</small>'}</li>`; }).join('');
    const hist = (g.history || []).slice(-6).reverse();
    return `<section class="p-sec"><h3>📐 גן הצורות</h3>
        <p>${M ? `מדליית ${M.name} ${M.emoji} באתגר האלופה.` : 'עוד אין מדליה באתגר האלופה של הגן.'}</p>
        <ul class="p-rows">${units}</ul></section>
      <section class="p-sec"><h3>סבבים אחרונים</h3>${hist.length ? `<ul class="hist">${hist.map(h => `<li><span>${new Date(h.ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}</span><b>${(K.GEO.UNITS.find(u => u.id === h.unit) || { name: h.unit }).name}</b><span>${h.ok}/${h.n}</span></li>`).join('')}</ul>` : '<p class="muted empty">עוד לא היו סבבים.</p>'}</section>`;
  }
  const EN_SECS = [['letters', 'אותיות'], ['words', 'מילים'], ['missing', 'אות חסרה'], ['sentences', 'משפטים']];
  function enPanel() {
    const st = K.store.state, e = st.english || {}, lp = e.practice || {};
    const ex = Object.entries(st.exams || {}).filter(([id]) => id.startsWith('english'));
    return `<section class="p-sec"><h3>משחק האותיות</h3><p>${lp.plays ? `${lp.plays} משחקים · שיא ${lp.best || 0}` : 'עוד לא שיחקה.'}</p></section>
      ${ex.map(([id, x]) => `<section class="p-sec"><h3>תרגול לפי חלקים</h3><ul class="p-rows">${EN_SECS.map(([k, n]) => { const p = (x.practice || {})[k]; return `<li class="p-row"><b>${n}</b>${p && p.plays ? `<small>${p.plays} סבבים · שיא ${p.best}% · אחרון ${p.last}%</small>` : '<small class="muted">עוד לא תורגל</small>'}</li>`; }).join('')}</ul>
        <p>${(x.mocks || []).length ? `מבדקי דמה: ${(x.mocks || []).length} · שיא ${x.best}% · אחרון ${(x.mocks[x.mocks.length - 1] || {}).pct}%` : 'עוד לא עשתה מבדק דמה.'}</p></section>`).join('')}`;
  }
  async function examsPanel(root) {
    const box = $('#pExams', root); if (!box) return;
    const list = K.en ? await K.en.loadExams() : [];
    if (!box.isConnected) return;
    const st = K.store.state;
    const others = K.SUBJECTS.filter(x => x.examPrep && !list.some(e => e.subject === x.id));
    box.innerHTML = list.map(x => {
      const xs = (st.exams || {})[x.id] || {}, mocks = xs.mocks || [], last = mocks[mocks.length - 1];
      const weak = last && last.bySec ? EN_SECS.filter(([k]) => last.bySec[k] && last.bySec[k][1] && last.bySec[k][0] / last.bySec[k][1] < .7).map(([, n]) => n) : [];
      const d = K.en.daysLeft(x.date);
      return `<section class="p-sec"><h3>📝 ${esc(x.title)}</h3>
        <p>${K.en.heDate(x.date)} · ${d > 0 ? `עוד ${d} ימים` : d === 0 ? 'היום' : 'עבר'}</p>
        <p>${mocks.length ? `שיא במבדק דמה: <b>${xs.best}%</b> · אחרון ${last.pct}% (${mocks.length} מבדקים)` : 'עוד לא עשתה מבדק דמה.'}</p>
        ${last ? `<p>${weak.length ? `כדאי לחזק: <b>${weak.join(', ')}</b>` : 'אין חלק חלש במבדק האחרון 👍'}</p>` : ''}
      </section>`;
    }).join('') + others.map(x => `<section class="p-sec"><h3>${x.emoji} ${x.name}</h3><p class="muted">אזור ההכנה למבחן עוד בבנייה.</p></section>`).join('');
  }

  route('parent', { chrome: 'flow', render(root) {
    if (Date.now() > okUntil) { go('hub', true); setTimeout(gate, 50); return; }
    const st = K.store.state;
    const allFacts = [];
    K.readyTables().forEach(t => { for (let m = 1; m <= 10; m++) { const f = K.store.fact(t, m); if (f.seen) allFacts.push({ t, m, f }); } });
    const answered = allFacts.reduce((s, x) => s + x.f.seen, 0), right = allFacts.reduce((s, x) => s + x.f.ok, 0);
    const struggling = allFacts.filter(x => x.f.bad > 0).map(x => ({ ...x, rate: x.f.bad / x.f.seen })).sort((a, b) => (b.rate * Math.min(b.f.seen, 4)) - (a.rate * Math.min(a.f.seen, 4)) || (a.f.box - b.f.box)).slice(0, 10);
    const fmtDate = ts => new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
    root.innerHTML = `<div class="flow parent"><header class="flow-bar"><button class="icon-btn" id="x" aria-label="חזרה">${I().close}</button><h2 class="flow-title2">פינת ההורים</h2><span></span></header>
      <div class="parent-body">
        <div class="ptabs" role="tablist">${[['kefel','🔢','כפל'],['geo','📐','צורות'],['english','🔤','English'],['exams','📝','מבחנים'],['general','⚙️','כללי']].map(([id, e, n]) => `<button class="ptab${id === tab ? ' on' : ''}" role="tab" aria-selected="${id === tab}" data-ptab="${id}" type="button"><span aria-hidden="true">${e}</span>${n}</button>`).join('')}</div>
        <div class="ppanel" data-panel="kefel">
        <div class="p-cards">
          <div class="p-card"><b>${st.history.length}</b><small>סבבי תרגול</small></div>
          <div class="p-card"><b>${answered ? Math.round(right / answered * 100) + '%' : '–'}</b><small>תשובות נכונות</small></div>
          <div class="p-card"><b>${K.store.streakNow()}</b><small>ימים ברצף (שיא ${st.streak.best || 0})</small></div>
          <div class="p-card"><b>${K.store.totalStars()}</b><small>כוכבים</small></div>
        </div>
        <section class="p-sec"><h3>עובדות שקשות לה</h3>
          ${struggling.length ? `<p class="muted">מסודר לפי שיעור הטעויות. הן יופיעו בתרגול בתדירות גבוהה יותר עד שהיא תשלוט בהן.</p><ul class="struggle">${struggling.map(x => `<li><span class="fact-chip" dir="ltr">${x.t} × ${x.m}</span><div class="sbar"><i style="width:${Math.max(8, Math.round(x.rate * 100))}%"></i></div><small>${x.f.bad} טעויות מתוך ${x.f.seen} · ${boxTxt(x.f)}</small></li>`).join('')}</ul>`
            : `<p class="muted empty">עוד אין מספיק נתונים. אחרי כמה סבבי תרגול כאן יופיעו העובדות שהיא מתקשה בהן.</p>`}
        </section>
        <section class="p-sec"><h3>שליטה בכל טבלה</h3>
          ${K.readyTables().map(t => { const ts = K.store.tstate(t); return `<div class="p-table"><div class="pt-head"><b>טבלת ה-${t}</b><span>${K.ui.starsRow(ts.stars, 3, 'sm')}</span><small>רמה ${ts.level} מתוך 3 · ${ts.sessions} סבבים</small></div>
            <div class="mchips">${Array.from({ length: 10 }, (_, i) => { const f = K.store.fact(t, i + 1); return `<span class="mchip ${lv(f)}" title="${t} × ${i + 1}: ${f.ok} נכון, ${f.bad} טעויות"><small>${t}×${i + 1}</small>${f.seen ? Math.round(f.ok / f.seen * 100) + '%' : '–'}</span>`; }).join('')}</div></div>`; }).join('')}
          <div class="mlegend"><span><i class="mchip new"></i>עוד לא תורגל</span><span><i class="mchip weak"></i>לחזק</span><span><i class="mchip mid"></i>כמעט</span><span><i class="mchip good"></i>שולטת</span></div>
        </section>
        <section class="p-sec"><h3>סבבים אחרונים</h3>
          ${st.history.length ? `<ul class="hist">${st.history.slice(-8).reverse().map(h => `<li><span>${fmtDate(h.ts)}</span><b>טבלת ה-${h.t}</b><span>${h.ok}/${h.n}</span></li>`).join('')}</ul>` : '<p class="muted empty">עוד לא היו סבבים.</p>'}
        </section>
        <section class="p-sec"><h3>איך המשחק מתאים את עצמו</h3>
          <ul class="how"><li>כל תרגיל נמדד בנפרד, והטעויות נשמרות במכשיר בלבד.</li><li>תרגילים שהיא מתקשה בהם חוזרים לעיתים קרובות יותר, ובסבב עצמו גם חוזרים אחרי טעות.</li><li>כשתרגיל מוכר, הוא מוצג בצורה קשה יותר (הקלדה, מספר חסר, בעיה מילולית) ורק אחרי כמה ימים הוא חוזר.</li><li>אין שעון ואין לחץ. מומלץ 5 דקות ביום, כל יום.</li></ul>
        </section>
        </div>
        <div class="ppanel" data-panel="geo">${geoPanel()}</div>
        <div class="ppanel" data-panel="english">${K.en ? K.en.parentSection() : ''}${enPanel()}</div>
        <div class="ppanel" data-panel="exams"><div id="pExams"><p class="muted">טוען…</p></div></div>
        <div class="ppanel" data-panel="general">
        <section class="p-sec"><h3>הגדרות</h3>
          <label class="switch"><input type="checkbox" id="sSound" ${st.settings.sound ? 'checked' : ''}><span>צלילים</span></label>
          <p class="muted">🔊 הקראה: לוחצים על הרמקול ליד כל טקסט. אין הקראה אוטומטית בכניסה למסך.</p>
          <p class="muted tiny" id="voiceNote"></p>
          <label class="switch"><input type="checkbox" id="sHap" ${st.settings.haptics ? 'checked' : ''}><span>רטט (במכשירים שתומכים)</span></label>
          <label class="name-field inline"><span>שם הילדה</span><input id="sName" type="text" maxlength="14" value="${esc(st.name)}"></label>
          <div class="p-actions"><button class="btn btn-secondary" id="exp">ייצוא נתונים</button><button class="btn btn-danger" id="reset">איפוס כל ההתקדמות</button></div>
        </section>
        </div>
      </div></div>`;
    $('#x', root).onclick = () => go('hub');
    const show = id => { tab = id; $$('.ptab', root).forEach(b => { const on = b.dataset.ptab === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }); $$('.ppanel', root).forEach(p => { p.hidden = p.dataset.panel !== id; }); };
    $$('.ptab', root).forEach(b => b.onclick = () => { K.audio.play('tap'); show(b.dataset.ptab); });
    show(tab);
    examsPanel(root);
    if (K.en) K.en.bindParent(root);
    $('#sSound', root).onchange = e => { st.settings.sound = e.target.checked; K.store.save(); };
    (function voiceNote() {
      const sp = K.speech, el = $('#voiceNote', root); if (!sp || !el) return;
      el.textContent = sp.voiceName() ? `קול ההקראה: ${sp.voiceName()} (קול של המכשיר)` : 'במכשיר הזה אין קול עברי, ולכן כפתורי ההקראה מוסתרים. אפשר להתקין קול עברי בהגדרות המכשיר.';
    })();
    $('#sHap', root).onchange = e => { st.settings.haptics = e.target.checked; K.store.save(); };
    $('#sName', root).onchange = e => { st.name = e.target.value.trim(); K.store.save(); toast('השם נשמר'); };
    $('#exp', root).onclick = () => {
      const blob = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kefel-progress.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    $('#reset', root).onclick = () => { if (confirm('למחוק את כל ההתקדמות, המטבעות והבית? אי אפשר לבטל.')) { K.store.reset(); go('welcome'); } };
  } });

  return { gate, ok: () => Date.now() <= okUntil };
})();
