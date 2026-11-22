/* Subjects registry: one entry per learning world.
   ---------------------------------------------------------------------------------------------
   SECTION CONTRACT (for anyone adding a world or a section)
   Every subject may declare `sections`, keyed by the fixed ids in K.SECTIONS:
       learn 📖 לומדים · practice ✏️ מתרגלים · games 🎮 משחקים · exam 📝 מבחן
   Each section is  { route: 'hash/path', status: 'ready' | 'soon' }.
     - A missing section is hidden from the world tab bar.
     - status 'soon' (or no route) shows a "בקרוב" tab that opens #/sec/<subject>/<section>.
     - The world tab bar is added automatically (K.worldBar, called from K.ui.render) on any
       screen whose hash equals a section route (or whose route name equals a one-word route,
       e.g. 'games' also matches #/games/all). So a new screen just registers its route with
       K.ui.route(name, { chrome: 'tabs', ... }) and lists it here — nothing else to wire.
     - Session/flow screens (chrome: 'flow') get no bar; their exit buttons should go back
       to the section route.
   Other fields: id, name, short (hub tile), emoji, cls (colour class), color, blurb,
   status ('ready'|'soon' for the whole world), world ('kefel'|'garden' for K.mission),
   progress() → {pct 0..1, label} | null  (READ-ONLY: never write/migrate kefel.v1),
   practiceItems() → [{emoji, title, sub, route}] used by the generic #/train/<subject> screen,
   examPrep: { status, blurb, title?, date?: 'YYYY-MM-DD' }  (date → countdown on the hub).
   Read-aloud: use K.speakBtn(text, 'he'|'en') next to instructions; never speak on load.
   --------------------------------------------------------------------------------------------- */
(function () {
  const S = () => K.store.state;
  const clamp = x => Math.max(0, Math.min(1, x || 0));

  K.SECTIONS = [
    { id: 'learn', emoji: '📖', name: 'לומדים' },
    { id: 'practice', emoji: '✏️', name: 'מתרגלים' },
    { id: 'games', emoji: '🎮', name: 'משחקים' },
    { id: 'exam', emoji: '📝', name: 'מבחן' }
  ];

  K.SUBJECTS = [
    {
      id: 'kefel', name: 'ממלכת הכפל', short: 'כפל', emoji: '🔢', cls: 'kefel', color: '#7a4dff',
      blurb: 'לוח הכפל, משחקים ומדליות', status: 'ready', world: 'kefel',
      sections: {
        learn: { route: 'map', status: 'ready' },
        practice: { route: 'train/kefel', status: 'ready' },
        games: { route: 'games', status: 'ready' },
        exam: { route: 'mathexam', status: 'ready' }
      },
      examPrep: { status: 'ready', route: 'mathexam', exam: 'math-geo-2026-12-20', title: 'מבחן בחשבון וגיאומטריה', date: '2026-12-20', blurb: 'דף התרגול של המורה, תרגול לפי נושאים ומבחן דמה' },
      progress() {
        const tl = K.readyTables ? K.readyTables() : K.TABLE_LIST;
        if (!tl || !tl.length) return null;
        const stars = tl.reduce((s, t) => s + ((S().tables[t] && S().tables[t].stars) || 0), 0);
        const pieces = K.store.crownPieces();
        return { pct: clamp(stars / (tl.length * 3)), label: `${stars}/${tl.length * 3} ⭐ · כתר ${pieces}/${K.AREAS.length}` };
      },
      practiceItems() {
        const out = [];
        if (S().introDone) out.push({ emoji: '☀️', title: 'תרגול יומי', sub: 'חמש דקות על מה שהכי כדאי לחזק', route: 'practice/daily', big: true });
        const rec = K.mission.recTable();
        out.push({ emoji: '⭐', title: `מומלץ: טבלת ה-${rec}`, sub: 'סבב קצר בטבלה שהכי כדאי עכשיו', route: 'practice/' + rec, big: true });
        (K.readyTables ? K.readyTables() : K.TABLE_LIST).forEach(t => {
          const st = (S().tables[t] && S().tables[t].stars) || 0;
          out.push({ emoji: String(t), title: `טבלת ה-${t}`, sub: '⭐'.repeat(st) || 'עוד אין כוכבים', route: 'practice/' + t, color: K.TABLES[t].color });
        });
        return out;
      }
    },
    {
      id: 'geo', name: 'גן הצורות', short: 'צורות', emoji: '📐', cls: 'geo', color: '#ff5fa2',
      blurb: 'זוויות וצורות עם קשתית', status: 'ready', world: 'garden',
      sections: {
        learn: { route: 'garden', status: 'ready' },
        practice: { route: 'train/geo', status: 'ready' },
        games: { status: 'soon' },
        exam: { route: 'mathexam', status: 'ready' }   // same exam as ממלכת הכפל (חשבון וגיאומטריה, 20.12)
      },
      examPrep: { status: 'ready', route: 'mathexam', exam: 'math-geo-2026-12-20', title: 'מבחן בחשבון וגיאומטריה', blurb: 'אותו מבחן כמו בממלכת הכפל (20.12)' },
      progress() {
        const g = S().geo; if (!g || !K.GEO) return null;
        const ready = K.GEO.UNITS.filter(u => u.ready);
        if (!ready.length) return null;
        const stars = ready.reduce((s, u) => s + ((g.units[u.id] && g.units[u.id].stars) || 0), 0);
        const medal = g.medals && g.medals.garden ? K.MEDALS[g.medals.garden] : null;
        return { pct: clamp(stars / (ready.length * 3)), label: `${stars}/${ready.length * 3} ⭐${medal ? ' · ' + medal.emoji : ''}` };
      },
      practiceItems() {
        const g = S().geo || { units: {} };
        const out = K.GEO.UNITS.filter(u => u.ready).map(u => {
          const st = (g.units[u.id] && g.units[u.id].stars) || 0;
          return { emoji: u.emoji, title: `תרגול: ${u.name}`, sub: '⭐'.repeat(st) || 'עוד אין כוכבים', route: 'geo-practice/' + u.id, big: true };
        });
        out.push({ emoji: '🏆', title: 'אתגר האלופה של הגן', sub: 'מבחן מעורב, אפשר לזכות במדליה', route: 'geo-practice/champ', big: true });
        return out;
      }
    },
    {
      id: 'english', name: 'English Land', short: 'English', emoji: '🔤', cls: 'english', color: '#1fae7a', ltr: true,
      blurb: 'אותיות, מילים ומשפטים באנגלית', status: 'ready',
      /* screens live in js/english.js; exam content is data-driven: data/exams/english-2026-11-30.json */
      sections: {
        learn: { route: 'english', status: 'ready' },
        practice: { route: 'train/english', status: 'ready' },
        games: { status: 'soon' },
        exam: { route: 'en-exam/english-2026-11-30', status: 'ready' }
      },
      examPrep: { status: 'ready', date: '2026-11-30', title: 'מבדק באנגלית', route: 'en-exam/english-2026-11-30', blurb: '10 אותיות, מילים, אות חסרה ומשפטים' },
      progress() {
        const e = S().english, x = S().exams && S().exams['english-2026-11-30'];
        const n = e && Array.isArray(e.learnedLetters) ? e.learnedLetters.length : (K.EN_DEFAULT_LEARNED || []).length;
        const best = x && x.best ? x.best : 0;
        return { pct: clamp(best ? best / 100 : n / 26), label: `${n} אותיות${best ? ' · מבדק דמה ' + best + '%' : ''}` };
      },
      practiceItems() {
        const x = S().exams && S().exams['english-2026-11-30'], p = (x && x.practice) || {};
        const st = id => { const b = p[id] && p[id].best; return b >= 90 ? '⭐⭐⭐' : b >= 70 ? '⭐⭐' : b >= 40 ? '⭐' : 'עוד אין כוכבים'; };
        const base = 'en-quiz/practice/english-2026-11-30/';
        return [
          { emoji: '🎯', title: 'משחק אותיות', sub: 'האותיות שלמדנו: גדולות, קטנות וצלילים', route: 'en-quiz/letters', big: true },
          { emoji: '🔤', title: 'אותיות (למבדק)', sub: st('letters'), route: base + 'letters', big: true },
          { emoji: '🖼️', title: 'מילים', sub: st('words'), route: base + 'words', big: true },
          { emoji: '🧩', title: 'אות חסרה', sub: st('missing'), route: base + 'missing', big: true },
          { emoji: '💬', title: 'משפט ותמונה', sub: st('sentences'), route: base + 'sentences', big: true }
        ];
      }
    }
  ];
  K.subject = id => K.SUBJECTS.find(s => s.id === id);

  /* route of a section (placeholder route when it is 'soon' without its own screen) */
  K.sectionRoute = (sub, secId) => {
    const sec = sub.sections && sub.sections[secId];
    if (!sec) return null;
    return sec.route || `sec/${sub.id}/${secId}`;
  };
  /* first section to open when a world is picked on the hub */
  K.subjectEntry = sub => {
    for (const s of K.SECTIONS) { const r = K.sectionRoute(sub, s.id); if (r) return r; }
    return 'world/' + sub.id;
  };
  /* which subject/section does the current screen belong to? */
  K.sectionOf = (name, args) => {
    const path = [name, ...(args || [])].join('/');
    for (const sub of K.SUBJECTS) {
      for (const s of K.SECTIONS) {
        const r = K.sectionRoute(sub, s.id);
        if (!r) continue;
        if (r === path || (!r.includes('/') && r === name)) return { sub, sec: s.id };
      }
    }
    return null;
  };
})();
