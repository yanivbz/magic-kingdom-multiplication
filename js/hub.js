/* Home hub + "ההתקדמות שלי" progress screen. */
(function () {
  const { $, $$, go, route } = K.ui;
  const S = () => K.store.state;
  const A = (n, v) => K.audio.play(n, v);
  const I = () => K.art.icons;
  const chr = () => K.CHARACTERS[S().char] || K.CHARACTERS.bear;
  const esc = K.ui.esc;

  /* small helpers shared by worlds */
  const progHTML = sub => {
    const p = sub.progress ? sub.progress() : null;
    if (!p) return '';
    return `<span class="wb-prog"><span class="pbar" style="--tc:#fff"><i style="width:${Math.max(4, Math.round(p.pct * 100))}%"></i></span><em>${p.label}</em></span>`;
  };
  /* "📝 הכנה למבחן" entry placed inside each world */
  function examEntry(id) {
    const sub = K.subject(id);
    if (!sub || !sub.examPrep) return '';
    return `<button class="exam-entry" type="button" data-exam="${sub.id}"><span aria-hidden="true">📝</span><b>הכנה למבחן</b>${sub.examPrep.status === 'soon' ? '<small class="soon-tag">בקרוב</small>' : ''}</button>`;
  }
  function bindExam(root) { $$('[data-exam]', root).forEach(b => b.onclick = () => { A('pop'); go('exam/' + b.dataset.exam); }); }
  K.examUI = { examEntry, bindExam };

  function openSubject(sub) {
    if (sub.world) K.mission.setWorld(sub.world);
    go(sub.route);
  }

  route('hub', { chrome: 'tabs', render(root) {
    const st = S(), c = chr(), m = K.mission.hubNext();
    const name = st.name ? esc(st.name) : 'עומר';
    const exams = K.SUBJECTS.filter(x => x.examPrep);
    root.innerHTML = `<div class="hub">
      <div class="hub-hello">
        <div class="hub-char">${K.art.char(c.id, 'happy')}</div>
        <div class="hub-hi">
          <h1>שלום ${name}! ✨</h1>
          <p>${c.name} איתך במסע. לאן נלך היום?</p>
        </div>
      </div>
      ${K.mission.nowCard(m, c)}
      <h2 class="hub-sec">העולמות שלי</h2>
      <div class="worlds">
        ${K.SUBJECTS.map(sub => `<button class="world-btn ${sub.cls}${sub.status === 'soon' ? ' soon' : ''}" data-sub="${sub.id}" type="button" aria-label="${sub.name}${sub.status === 'soon' ? ', בקרוב' : ''}">
          <span class="wb-e" aria-hidden="true">${sub.emoji}</span>
          <span class="wb-t"><b${sub.ltr ? ' dir="ltr"' : ''}>${sub.name}</b><small>${sub.blurb}</small>${sub.status === 'soon' ? '<small class="soon-tag">בקרוב</small>' : progHTML(sub)}</span>
        </button>`).join('')}
      </div>
      ${exams.length ? `<div class="exams-card card">
        <h2>📝 מבחנים קרובים</h2>
        <p class="muted">עוד אין מבחנים ברשימה. כשההורים יוסיפו נושאים, הם יופיעו כאן עם תרגול מיוחד.</p>
        <div class="exam-chips">${exams.map(x => `<button class="exam-chip" type="button" data-exam="${x.id}"><span aria-hidden="true">${x.emoji}</span> <span${x.ltr ? ' dir="ltr"' : ''}>${x.name}</span></button>`).join('')}</div>
      </div>` : ''}
      <button class="btn btn-secondary btn-lg" id="toProg">✨ ההתקדמות שלי</button>
    </div>`;
    $('#mission').onclick = () => { A('pop'); K.mission.start(m); };
    $$('[data-sub]', root).forEach(b => b.onclick = () => { A('pop'); openSubject(K.subject(b.dataset.sub)); });
    bindExam(root);
    $('#toProg').onclick = () => { A('pop'); go('progress'); };
  } });

  /* placeholder world for subjects that are not built yet (e.g. English Land) */
  route('world', { chrome: 'tabs', render(root, id) {
    const sub = K.subject(id);
    if (!sub) return go('hub', true);
    if (sub.status === 'ready') return go(sub.route, true);
    root.innerHTML = `<div class="soon-page">
      <div class="soon-hero ${sub.cls}"><span class="soon-e" aria-hidden="true">${sub.emoji}</span><h1${sub.ltr ? ' dir="ltr"' : ''}>${sub.name}</h1><p>${sub.blurb}</p></div>
      <div class="card soon-card">${K.ui.bubble(`העולם הזה נבנה ממש עכשיו! 🛠️ בקרוב נוכל לשחק כאן יחד.`)}</div>
      ${examEntry(sub.id)}
      <button class="btn btn-primary btn-lg" id="back">🏠 חזרה הביתה</button>
    </div>`;
    bindExam(root);
    $('#back').onclick = () => { A('pop'); go('hub'); };
  } });

  /* per-subject exam-prep area (placeholder for now) */
  route('exam', { chrome: 'tabs', render(root, id) {
    const sub = K.subject(id);
    if (!sub || !sub.examPrep) return go('hub', true);
    root.innerHTML = `<div class="soon-page">
      <div class="soon-hero ${sub.cls}"><span class="soon-e" aria-hidden="true">📝</span><h1>הכנה למבחן</h1><p>${sub.emoji} <span${sub.ltr ? ' dir="ltr"' : ''}>${sub.name}</span></p></div>
      <div class="card soon-card">${K.ui.bubble('כאן נתכונן למבחנים: תרגול לפי הנושאים ומבחן דמה. האזור הזה יגיע בקרוב! ✨')}<small class="muted">${sub.examPrep.blurb || ''}</small></div>
      <div class="soon-actions">
        <button class="btn btn-primary btn-lg" id="toWorld">${sub.emoji} חזרה לעולם</button>
        <button class="btn btn-secondary btn-lg" id="home">🏠 הביתה</button>
      </div>
    </div>`;
    $('#toWorld').onclick = () => { A('pop'); openSubject(sub); };
    $('#home').onclick = () => { A('pop'); go('hub'); };
  } });

  route('progress', { chrome: 'tabs', render(root) {
    const st = S(), fa = K.mission.friendArea();
    const pieces = K.store.crownPieces();
    const g = K.GEO && K.GEO.region;
    const geoMedal = K.geoStore ? K.geoStore.geo().medals.garden : null;
    const GM = geoMedal ? K.MEDALS[geoMedal] : null;
    const met = (st.friends || []).map(id => K.AREAS.find(a => a.id === id)).filter(Boolean);
    const kashet = g && K.geoStore && (K.geoStore.geo().friends || []).length;
    root.innerHTML = `<div class="progress-page">
      <h1 class="prog-title">ההתקדמות שלי</h1>
      <div class="subj-prog card">
        <b>ההתקדמות לפי מקצוע</b>
        ${K.SUBJECTS.map(sub => { const p = sub.progress ? sub.progress() : null; return `<div class="sp-row" style="--tc:${sub.color}"><span class="sp-e" aria-hidden="true">${sub.emoji}</span><span class="sp-n"${sub.ltr ? ' dir="ltr"' : ''}>${sub.name}</span>${p ? `<span class="pbar"><i style="width:${Math.max(4, Math.round(p.pct * 100))}%"></i></span><small>${p.label}</small>` : '<small class="soon-tag">בקרוב</small>'}</div>`; }).join('')}
      </div>
      <div class="prog-grid">
        <div class="crown-card card" id="crownCard">${K.art.crown()}<div><b>הכתר של הממלכה</b><small>${pieces} מתוך ${K.AREAS.length} חלקים · כל מדליה באתגר האלופה של אזור מוסיפה חלק</small></div></div>
        ${g ? `<div class="crown-card card geo-wand-card"><span class="wand-e" aria-hidden="true">${GM ? GM.emoji : '🪄'}</span><div><b>${g.wand.name}</b><small>${GM ? `יש לך מדליית ${GM.name} בגן הצורות.` : 'המדליה של גן הצורות נפרדת מכתר הכפל. מרוויחים אותה באתגר האלופה של הגן.'}</small></div></div>` : ''}
        <div class="week card">${K.mission.weekStrip()}</div>
        ${K.mission.orderRow()}
        <div class="friend card">
          <div class="friend-top"><span class="friend-e" aria-hidden="true">${fa.friend.emoji}</span><div><small>${fa.emoji} ${fa.name}</small><b>${fa.friend.name}</b></div></div>
          ${K.ui.bubble(fa.friend.line)}
          ${(met.length || kashet) ? `<div class="friend-met">${met.map(a => `<span class="fchip" title="${a.friend.name}">${a.friend.emoji} ${a.friend.name}</span>`).join('')}${kashet ? `<span class="fchip">${g.friend.emoji} ${g.friend.name}</span>` : ''}</div>` : ''}
        </div>
        <div class="prog-links card">
          <b>עוד בממלכה</b>
          <div class="map-tools">
            <button class="tool-btn" id="toExp" type="button">${I().grid}<span>לוח הכפל</span></button>
            <button class="tool-btn" id="toIntro" type="button">${I().book}<span>מה זה כפל?</span></button>
          </div>
        </div>
      </div>
    </div>`;
    $('#crownCard').onclick = () => { A('pop'); go('home'); };
    $('#toExp').onclick = () => { A('pop'); go('explorer'); };
    $('#toIntro').onclick = () => { A('pop'); go('intro'); };
  } });
})();
