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
    return `<span class="wb-prog noread"><span class="pbar"><i style="width:${Math.max(4, Math.round(p.pct * 100))}%"></i></span><em>${p.label}</em></span>`;
  };
  /* days until an ISO date (YYYY-MM-DD), local time; null if missing/past */
  function daysTo(iso) {
    if (!iso) return null;
    const d = new Date(iso + 'T12:00:00'), n = new Date(); n.setHours(12, 0, 0, 0);
    const k = Math.round((d - n) / 86400000);
    return k >= 0 ? k : null;
  }
  const daysTxt = k => k === 0 ? 'היום!' : k === 1 ? 'מחר!' : `עוד ${k} ימים`;
  /* rewards shown on the hub: stars (kefel + geo), medals (kefel areas + garden), streak */
  function rewards() {
    const st = S(), g = st.geo || {};
    const geoStars = Object.values(g.units || {}).reduce((s, u) => s + ((u && u.stars) || 0), 0);
    const stars = K.store.totalStars() + geoStars;
    const medals = K.store.medalCount() + (g.medals && g.medals.garden ? 1 : 0);
    return { stars, medals, streak: K.store.streakNow() };
  }
  function cheer(r, name) {
    if (r.streak >= 3) return `וואו, ${r.streak} ימים ברצף! את אלופה 🔥`;
    if (r.stars >= 10) return `כבר ${r.stars} כוכבים! איזו התקדמות ⭐`;
    if (r.stars > 0) return `יש לך ${r.stars} כוכבים. נאסוף עוד?`;
    return 'בואי נצא להרפתקה ונאסוף כוכבים!';
  }
  /* "📝 הכנה למבחן" entry placed inside each world */
  function examEntry(id) {
    const sub = K.subject(id);
    if (!sub || !sub.examPrep) return '';
    return `<button class="exam-entry" type="button" data-exam="${sub.id}"><span aria-hidden="true">📝</span><b>הכנה למבחן</b>${sub.examPrep.status === 'soon' ? '<small class="soon-tag noread">בקרוב</small>' : ''}</button>`;
  }
  function bindExam(root) { $$('[data-exam]', root).forEach(b => b.onclick = () => { A('pop'); go('exam/' + b.dataset.exam); }); }
  K.examUI = { examEntry, bindExam };

  function openSubject(sub) {
    if (sub.world) K.mission.setWorld(sub.world);
    go(K.subjectEntry(sub));
  }

  /* World tab bar (📖 לומדים | ✏️ מתרגלים | 🎮 משחקים | 📝 מבחן), driven by K.SUBJECTS[].sections.
     Called by K.ui.render after every screen; adds the bar only on section screens. */
  K.worldBar = function (name, args, root) {
    const hit = K.sectionOf(name, args);
    if (!hit) return;
    const { sub, sec } = hit;
    if (sub.world) K.mission.setWorld(sub.world);
    const tabs = K.SECTIONS.filter(s => sub.sections[s.id]);
    const bar = K.ui.h(`<nav class="world-bar ${sub.cls}" aria-label="${sub.name}">
      <div class="wbar-head"><a class="wbar-back" href="#/hub" aria-label="חזרה לבית">→</a><span class="wbar-e" aria-hidden="true">${sub.emoji}</span><b${sub.ltr ? ' dir="ltr"' : ''}>${sub.name}</b></div>
      <div class="wbar-tabs">${tabs.map(s => { const d = sub.sections[s.id], soon = d.status === 'soon', on = s.id === sec;
        return `<a href="#/${K.sectionRoute(sub, s.id)}" class="wbar-tab${on ? ' on' : ''}${soon ? ' soon' : ''}" ${on ? 'aria-current="page"' : ''}><span class="wt-e" aria-hidden="true">${s.emoji}</span><span>${s.name}</span>${soon ? '<small class="noread">בקרוב</small>' : ''}</a>`; }).join('')}</div>
    </nav>`);
    root.insertBefore(bar, root.firstChild);
    $$('.wbar-tab', bar).forEach(a => a.addEventListener('click', () => A('tap')));
  };

  /* small "which exam?" picker (sheet) listing every subject's exam-prep area */
  function examPicker() {
    const exams = K.SUBJECTS.filter(x => x.examPrep);
    const sh = K.ui.sheet(`<div class="exam-pick">
      <h2>📝 לאיזה מבחן מתכוננים?</h2>
      <div class="exam-pick-list">${exams.map(x => { const k = daysTo(x.examPrep.date); return `<button class="exam-cd" type="button" data-exam="${x.id}"><span class="ec-e" aria-hidden="true">${x.emoji}</span><span class="ec-t"><b${x.ltr ? ' dir="ltr"' : ''}>${x.examPrep.title || x.name}</b><small>${k != null ? daysTxt(k) : (x.examPrep.status === 'soon' ? 'בקרוב' : 'מוכנים לתרגל')}</small></span>${k != null ? `<span class="ec-d noread">${k}<small>ימים</small></span>` : ''}</button>`; }).join('')}</div>
    </div>`);
    $$('[data-exam]', sh.el).forEach(b => b.onclick = () => { A('pop'); sh.close(); go('exam/' + b.dataset.exam); });
  }

  route('hub', { chrome: 'tabs', render(root) {
    const st = S(), m = K.mission.hubNext(), r = rewards();
    const name = st.name ? esc(st.name) : 'עומר';
    return K.island.mount(root, {
      stars: r.stars,
      coins: st.coins,
      soundOn: !!(st.settings && st.settings.sound),
      nowTitle: m.title,
      avLabel: 'הפרופיל של ' + name,
      onAvatar: () => go('home'),
      onStars: () => go('progress'),
      onParent: () => K.parent.gate(),
      onNow: () => K.mission.start(m),
      onSound() {
        st.settings.sound = !st.settings.sound;
        K.store.save();
        K.audio.unlock();
        if (st.settings.sound) K.audio.play('pop');
        return st.settings.sound;
      },
      onEnter(name) {
        if (name === 'kefel') openSubject(K.subject('kefel'));
        else if (name === 'shapes') openSubject(K.subject('geo'));
        else if (name === 'english') openSubject(K.subject('english'));
        else if (name === 'exam') examPicker();
      }
    });
  } });

  /* placeholder world for subjects that are not built yet (e.g. English Land) */
  route('world', { chrome: 'tabs', render(root, id) {
    const sub = K.subject(id);
    if (!sub) return go('hub', true);
    if (sub.status === 'ready') return go(K.subjectEntry(sub), true);
    root.innerHTML = `<div class="soon-page">
      <div class="soon-hero ${sub.cls}"><span class="soon-e" aria-hidden="true">${sub.emoji}</span><h1${sub.ltr ? ' dir="ltr"' : ''}>${sub.name}</h1><p>${sub.blurb}</p></div>
      <div class="card soon-card">${K.ui.bubble(`העולם הזה נבנה ממש עכשיו! 🛠️ בקרוב נוכל לשחק כאן יחד.`)}</div>
      <button class="btn btn-primary btn-lg" id="back">🏠 חזרה הביתה</button>
    </div>`;
    $('#back').onclick = () => { A('pop'); go('hub'); };
  } });

  /* per-subject exam-prep area (placeholder for now) */
  route('exam', { chrome: 'tabs', render(root, id) {
    const sub = K.subject(id);
    if (!sub || !sub.examPrep) return go('hub', true);
    if (sub.examPrep.route) return go(sub.examPrep.route, true);   // subject has a real exam-prep area (e.g. English)
    root.innerHTML = `<div class="soon-page">
      <div class="soon-hero ${sub.cls}"><span class="soon-e" aria-hidden="true">📝</span><h1>הכנה למבחן</h1><p>${sub.emoji} <span${sub.ltr ? ' dir="ltr"' : ''}>${sub.name}</span></p></div>
      <div class="card soon-card">${K.ui.bubble('כאן נתכונן למבחנים: תרגול לפי הנושאים ומבחן דמה. האזור הזה יגיע בקרוב! ✨')}<small class="muted">${sub.examPrep.blurb || ''}</small></div>
    </div>`;
  } });

  /* generic "✏️ מתרגלים" screen: lists sub.practiceItems() */
  route('train', { chrome: 'tabs', render(root, id) {
    const sub = K.subject(id);
    if (!sub || !sub.practiceItems) return go('hub', true);
    const items = sub.practiceItems();
    const big = items.filter(x => x.big), small = items.filter(x => !x.big);
    root.innerHTML = `<div class="train">
      <div class="card train-intro">${K.ui.bubble('בחרי תרגול. כל תרגול קצר ומביא כוכבים! ⭐')}</div>
      <div class="train-big">${big.map(x => `<button class="train-card" type="button" data-go="${x.route}"><span class="tc-e" aria-hidden="true">${x.emoji}</span><span class="tc-t"><b>${x.title}</b><small>${x.sub || ''}</small></span><span class="tc-go" aria-hidden="true">▶</span></button>`).join('')}</div>
      ${small.length ? `<h2 class="hub-sec">או בחרי בעצמך</h2><div class="train-grid">${small.map(x => `<button class="train-tile" type="button" data-go="${x.route}" style="--nc:${x.color || sub.color}"><b>${x.emoji}</b><small>${x.sub || ''}</small><span class="sr">${x.title}</span></button>`).join('')}</div>` : ''}
    </div>`;
    $$('[data-go]', root).forEach(b => b.onclick = () => { A('pop'); go(b.dataset.go); });
  } });

  /* placeholder for a section that is not built yet */
  route('sec', { chrome: 'tabs', render(root, id, secId) {
    const sub = K.subject(id), S2 = K.SECTIONS.find(s => s.id === secId);
    if (!sub || !S2) return go('hub', true);
    root.innerHTML = `<div class="soon-page">
      <div class="soon-hero ${sub.cls}"><span class="soon-e" aria-hidden="true">${S2.emoji}</span><h1>${S2.name}</h1><p>${sub.emoji} <span${sub.ltr ? ' dir="ltr"' : ''}>${sub.name}</span></p></div>
      <div class="card soon-card">${K.ui.bubble('החלק הזה עוד בבנייה 🛠️ בקרוב יהיה כאן משהו כיפי!')}</div>
    </div>`;
  } });

  /* "ההתקדמות שלי": one subject at a time (chips on top), a few big visual items, one primary action */
  let progSub = null;
  function progItems(id) {
    const st = S();
    if (id === 'kefel') {
      const sub = K.subject('kefel'), tl = K.readyTables();
      const stars = tl.reduce((n, t) => n + ((st.tables[t] && st.tables[t].stars) || 0), 0);
      return [
        { e: '⭐', big: `${stars}`, small: `כוכבים מתוך ${tl.length * 3}` },
        { e: '👑', big: `${K.store.crownPieces()}/${K.AREAS.length}`, small: 'חלקי כתר', go: 'home' },
        { e: '🏅', big: `${K.store.medalCount()}`, small: 'מדליות' }
      ];
    }
    if (id === 'geo') {
      const g = st.geo || { units: {}, medals: {} }, ready = K.GEO.UNITS.filter(u => u.ready);
      const stars = ready.reduce((n, u) => n + ((g.units[u.id] && g.units[u.id].stars) || 0), 0);
      const M = g.medals && g.medals.garden ? K.MEDALS[g.medals.garden] : null;
      return [
        { e: '⭐', big: `${stars}`, small: `כוכבים מתוך ${ready.length * 3}` },
        { e: M ? M.emoji : '🪄', big: M ? M.name : '–', small: M ? 'מדליה בגן' : 'עוד אין מדליה' }
      ];
    }
    if (id === 'english') {
      const e = st.english || {}, x = st.exams && st.exams['english-2026-11-30'];
      const n = Array.isArray(e.learnedLetters) ? e.learnedLetters.length : (K.EN_DEFAULT_LEARNED || []).length;
      return [
        { e: '🔤', big: `${n}`, small: 'אותיות שלמדנו' },
        { e: '🏆', big: x && x.best ? `${x.best}%` : '–', small: 'שיא במבדק הדמה' }
      ];
    }
    return [];
  }
  route('progress', { chrome: 'tabs', render(root) {
    const subs = K.SUBJECTS.filter(x => x.status === 'ready');
    if (!progSub || !subs.find(x => x.id === progSub)) progSub = (K.mission.world() === 'garden' ? 'geo' : 'kefel');
    const draw = () => {
      const sub = K.subject(progSub), items = progItems(progSub), streak = K.store.streakNow();
      root.innerHTML = `<div class="prog2">
        <h1 class="prog-title">ההתקדמות שלי</h1>
        <div class="prog-chips" role="tablist" aria-label="מקצוע">${subs.map(x => `<button class="pchip ${x.cls}${x.id === progSub ? ' on' : ''}" role="tab" aria-selected="${x.id === progSub}" data-ps="${x.id}" type="button"><span aria-hidden="true">${x.emoji}</span> <span${x.ltr ? ' dir="ltr"' : ''}>${x.short || x.name}</span></button>`).join('')}</div>
        <div class="prog-big ${sub.cls}">${items.map(it => `<div class="pbig${it.go ? ' link' : ''}"${it.go ? ` data-go="${it.go}" role="button" tabindex="0"` : ''}><span class="pb-e" aria-hidden="true">${it.e}</span><b>${it.big}</b><small>${it.small}</small></div>`).join('')}</div>
        ${streak ? `<p class="prog-streak">🔥 ${streak} ימים ברצף</p>` : ''}
        <button class="btn btn-primary btn-lg subj-btn ${sub.cls}" id="goSub" type="button">${sub.emoji} ממשיכים ב${sub.short && !sub.ltr ? sub.short : 'עולם'} ▶</button>
      </div>`;
      $$('[data-ps]', root).forEach(b => b.onclick = () => { A('tap'); progSub = b.dataset.ps; draw(); });
      $$('[data-go]', root).forEach(b => b.onclick = () => { A('pop'); go(b.dataset.go); });
      $('#goSub', root).onclick = () => { A('pop'); openSubject(sub); };
    };
    draw();
  } });
})();
