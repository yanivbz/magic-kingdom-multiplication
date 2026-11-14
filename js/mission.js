/* Recommended next task + shared cards for hub, maps, and progress. */
K.mission = (function () {
  const S = () => K.store.state;
  const I = () => K.art.icons;

  function setWorld(w) {
    const v = w === 'garden' ? 'garden' : 'kefel';
    if (S().lastWorld !== v) { S().lastWorld = v; K.store.save(); }
  }
  function world() { return S().lastWorld === 'garden' ? 'garden' : 'kefel'; }
  function worldPath() { return world() === 'garden' ? 'garden' : 'map'; }

  function recTable() {
    const t = K.ORDER.find(t => K.store.tstate(t).stars < 2);
    if (t) return t;
    return K.ORDER.slice().sort((a, b) => K.store.tstate(a).stars - K.store.tstate(b).stars || K.store.tableMastery(a) - K.store.tableMastery(b))[0];
  }
  function weakFacts(t) {
    const out = [];
    for (let m = 1; m <= 10; m++) { const f = K.store.fact(t, m); if (f.seen && f.bad && f.box < 3) out.push({ t, m, bad: f.bad }); }
    return out.sort((a, b) => b.bad - a.bad);
  }
  function friendArea() { return K.AREAS.find(a => a.tables.includes(recTable())) || K.AREAS[0]; }

  function kefelNext() {
    const st = S();
    if (!st.introDone) return { kind: 'intro', title: 'המשימה הראשונה: מה זה כפל?', cta: 'יוצאים לדרך', msg: 'בואי נתחיל בשער הממלכה ונבין מה זה כפל.', node: 'gate', world: 'kefel' };
    const t = recTable(), ts = K.store.tstate(t);
    if (!ts.lesson) return { kind: 'lesson', t, title: `שיעור קצר: טבלת ה-${t}`, cta: 'לשיעור', msg: `ההמלצה שלי: טבלת ה-${t}. מוכנה לגלות את הסודות שלה?`, node: t, world: 'kefel' };
    const weak = weakFacts(t)[0];
    return { kind: 'practice', t, title: `תרגול: טבלת ה-${t}`, cta: 'מתרגלים', msg: weak ? `כדאי לחזק את ${weak.t} × ${weak.m}. הוא יופיע בתרגול.` : `עוד סבב קצר בטבלת ה-${t} ויש עוד כוכב!`, node: t, world: 'kefel' };
  }

  function gardenNext() {
    const ts = K.geoStore.ustate('angles');
    const medal = K.geoStore.geo().medals.garden;
    if (!ts.lesson) return { kind: 'geo-lesson', unit: 'angles', title: 'שיעור הזוויות', cta: 'לשיעור הזוויות', msg: 'בואי נלמד זוויות עם קשתית — חדה, ישרה וקהה.', world: 'garden' };
    if (ts.stars < 2) return { kind: 'geo-practice', unit: 'angles', title: 'תרגול זוויות', cta: 'לתרגול זוויות', msg: 'עוד תרגול קצר על זוויות, ויהיו עוד כוכבים!', world: 'garden' };
    if (medal !== 'gold') return { kind: 'geo-champ', title: 'אתגר האלופה של הגן', cta: 'לאתגר!', msg: 'מוכנה לאתגר האלופה של הגן? אפשר לזכות בשרביט הצורות.', world: 'garden' };
    return { kind: 'geo-practice', unit: 'angles', title: 'תרגול זוויות', cta: 'לתרגול זוויות', msg: 'אפשר לחזור לתרגול זוויות ולשמור על הכוכבים.', world: 'garden' };
  }

  function anglesWeak() {
    if (!K.geoStore) return false;
    const ts = K.geoStore.ustate('angles');
    if (!ts.lesson || ts.stars < 2) return true;
    return K.geoStore.unitMastery() < 0.5;
  }

  function hubNext() {
    const st = S();
    if (!st.introDone) return kefelNext();
    if (!K.store.dailyDone()) {
      const n = K.store.dailyNow();
      return { kind: 'daily', title: 'תרגול יומי', cta: 'מתחילים', msg: n ? `יש תרגול יומי קצר. הרצף שלך: ${n} ימים!` : 'יש תרגול יומי קצר של חמש דקות. מוכנה?', world: 'kefel' };
    }
    if (anglesWeak()) return gardenNext();
    return kefelNext();
  }

  function start(m) {
    const go = K.ui.go;
    if (!m) return;
    if (m.kind === 'intro') go('intro');
    else if (m.kind === 'daily') go('practice/daily');
    else if (m.kind === 'lesson') go('lesson/' + m.t);
    else if (m.kind === 'practice') go('practice/' + m.t);
    else if (m.kind === 'geo-lesson') go('geo-lesson/' + (m.unit || 'angles'));
    else if (m.kind === 'geo-practice') go('geo-practice/' + (m.unit || 'angles'));
    else if (m.kind === 'geo-champ') go('geo-practice/champ');
  }

  function dailyCard() {
    const done = K.store.dailyDone(), n = K.store.dailyNow();
    return `<div class="daily card${done ? ' done' : ''}">
      <div class="daily-ic" aria-hidden="true">${done ? '✅' : '📅'}</div>
      <div class="daily-txt"><b>תרגול יומי</b><small>${done ? `סיימת להיום! ${n > 1 ? `${n} ימים ברצף 🔥` : 'מחר ממשיכים את הרצף'}` : `5 דקות על התרגילים שהכי כדאי לחזק${n ? ` · רצף ${n} 🔥` : ''}`}</small></div>
      <button class="btn ${done ? 'btn-secondary' : 'btn-good'}" id="daily">${done ? 'עוד פעם' : 'מתחילים'}</button></div>`;
  }

  function nowCard(m, c) {
    return `<div class="now-card card">
      <h2 class="now-label">מה עכשיו?</h2>
      <div class="mission-top"><div class="mission-char">${K.art.char(c.id, 'happy')}</div>${K.ui.bubble(m.msg)}</div>
      <button class="btn btn-primary btn-lg" id="mission">${m.cta}</button>
      <small class="mission-title">${m.title}</small>
    </div>`;
  }

  function weekStrip() {
    const days = new Set(S().days), out = [], names = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      out.push(`<div class="wd${days.has(k) ? ' on' : ''}${i === 0 ? ' today' : ''}"><span>${days.has(k) ? I().flame : ''}</span><small>${names[d.getDay()]}</small></div>`);
    }
    return `<h3>השבוע שלי</h3><div class="week-row">${out.join('')}</div><p class="week-note">${K.store.streakNow() ? `רצף של ${K.store.streakNow()} ימים, כל הכבוד!` : 'תרגול אחד היום מתחיל רצף חדש!'}</p>`;
  }

  function orderRow() {
    const rec = recTable();
    return `<div class="order card"><h3>הדרך המומלצת</h3><div class="order-row" dir="rtl">${K.ORDER.map(t => `<span class="oc${K.store.tstate(t).stars >= 2 ? ' done' : ''}${t === rec ? ' now' : ''}" style="--nc:${K.TABLES[t].color}">${t}</span>`).join('')}</div><small class="muted">הכול פתוח! זה רק הסדר שהכי קל ללמוד בו.</small></div>`;
  }

  return { setWorld, world, worldPath, recTable, weakFacts, friendArea, kefelNext, gardenNext, anglesWeak, hubNext, start, dailyCard, nowCard, weekStrip, orderRow };
})();
