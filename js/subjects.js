/* Subjects registry: one entry per learning world on the hub.
   To add a world: push an object here (and a route for it). Progress readers only read
   existing state (kefel.v1 / state.geo) — they never write or migrate anything.
   examPrep: optional per-subject exam-prep area; status 'soon' shows a placeholder. */
(function () {
  const S = () => K.store.state;
  const clamp = x => Math.max(0, Math.min(1, x || 0));

  K.SUBJECTS = [
    {
      id: 'kefel', name: 'ממלכת הכפל', emoji: '🔢', cls: 'kefel', color: '#7a4dff',
      blurb: 'לוח הכפל, משחקים ומדליות', status: 'ready', route: 'map', world: 'kefel',
      examPrep: { status: 'soon', blurb: 'תרגול ומבחן דמה בחשבון' },
      progress() {
        const tl = K.readyTables ? K.readyTables() : K.TABLE_LIST;
        if (!tl || !tl.length) return null;
        const stars = tl.reduce((s, t) => s + ((S().tables[t] && S().tables[t].stars) || 0), 0);
        const pieces = K.store.crownPieces();
        return { pct: clamp(stars / (tl.length * 3)), label: `${stars}/${tl.length * 3} ⭐ · כתר ${pieces}/${K.AREAS.length}` };
      }
    },
    {
      id: 'geo', name: 'גן הצורות', emoji: '📐', cls: 'geo', color: '#ff5fa2',
      blurb: 'זוויות וצורות עם קשתית', status: 'ready', route: 'garden', world: 'garden',
      examPrep: { status: 'soon', blurb: 'תרגול ומבחן דמה בגאומטריה' },
      progress() {
        const g = S().geo; if (!g || !K.GEO) return null;
        const ready = K.GEO.UNITS.filter(u => u.ready);
        if (!ready.length) return null;
        const stars = ready.reduce((s, u) => s + ((g.units[u.id] && g.units[u.id].stars) || 0), 0);
        const medal = g.medals && g.medals.garden ? K.MEDALS[g.medals.garden] : null;
        return { pct: clamp(stars / (ready.length * 3)), label: `${stars}/${ready.length * 3} ⭐${medal ? ' · ' + medal.emoji : ''}` };
      }
    },
    {
      id: 'english', name: 'English Land', emoji: '🔤', cls: 'english', color: '#1fae7a', ltr: true,
      blurb: 'אותיות, מילים ומשפטים באנגלית', status: 'soon', route: 'world/english',
      examPrep: { status: 'soon', blurb: 'תרגול ומבחן דמה באנגלית' },
      progress() { return null; }
    }
  ];
  K.subject = id => K.SUBJECTS.find(s => s.id === id);
})();
