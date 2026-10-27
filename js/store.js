/* Persistent state + mastery engine (per-fact spaced repetition). */
K.store = (function () {
  const KEY = 'kefel.v1';
  const DAY = 86400000;
  const defaults = () => ({
    v: 1, onboarded: false, name: '', char: null, coins: 0, owned: [], introDone: false,
    tables: {},            // t -> {level, lesson, sessions, stars, best}
    facts: {},             // "t×m" -> {box, seen, ok, bad, hint, last, due, run}
    streak: { count: 0, last: null, best: 0 },
    days: [],              // YYYY-MM-DD of practice days (last 60)
    history: [],           // [{ts, t, ok, n}] last 40 sessions
    settings: { sound: true, haptics: true }
  });
  let state = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = Object.assign(defaults(), JSON.parse(raw));
    state.settings = Object.assign({ sound: true, haptics: true }, state.settings);
  } catch (e) {}

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / DAY);
  const fkey = (t, m) => t + '×' + m;

  // Leitner boxes: 0 new/weak … 5 mastered.  Intervals before a fact is "due" again.
  const INTERVALS = [0, 0, DAY, 2 * DAY, 4 * DAY, 7 * DAY];

  function fact(t, m) {
    const k = fkey(t, m);
    return state.facts[k] || { box: 0, seen: 0, ok: 0, bad: 0, hint: 0, last: 0, due: 0, run: 0 };
  }
  function recordAnswer(t, m, { correct, hinted }) {
    const k = fkey(t, m), f = fact(t, m), now = Date.now();
    f.seen++; f.last = now;
    if (correct) {
      f.ok++; f.run++;
      if (hinted) { f.hint++; /* helped, but not yet knowledge */ f.box = Math.max(f.box, 1); }
      else f.box = Math.min(5, f.box + (f.run >= 2 && f.box < 3 ? 2 : 1));
    } else {
      f.bad++; f.run = 0; f.box = Math.max(0, f.box - 2);
    }
    f.due = now + INTERVALS[f.box];
    state.facts[k] = f; save();
    return f;
  }
  const tstate = t => state.tables[t] || (state.tables[t] = { level: 1, lesson: false, sessions: 0, stars: 0, best: 0 });

  /* mastery score 0..1 of one fact */
  const mastery = (t, m) => { const f = fact(t, m); return f.seen === 0 ? 0 : f.box / 5; };
  const tableMastery = t => { let s = 0; for (let m = 1; m <= 10; m++) s += mastery(t, m); return s / 10; };
  const tableMastered = t => { for (let m = 1; m <= 10; m++) if (fact(t, m).box < 3) return false; return true; };
  const totalStars = () => K.TABLE_LIST.reduce((s, t) => s + (state.tables[t] ? state.tables[t].stars : 0), 0);

  function touchStreak() {
    const td = today(), s = state.streak;
    if (s.last === td) return { count: s.count, isNew: false };
    if (s.last && dayDiff(s.last, td) === 1) s.count++;
    else s.count = 1;
    s.last = td; s.best = Math.max(s.best || 0, s.count);
    state.days.push(td); state.days = state.days.slice(-60);
    save();
    return { count: s.count, isNew: true };
  }
  /* current streak as shown (broken streaks show 0 once a full day was missed) */
  function streakNow() {
    const s = state.streak; if (!s.last) return 0;
    const d = dayDiff(s.last, today());
    return d <= 1 ? s.count : 0;
  }

  function finishSession(t, ok, n) {
    const ts = tstate(t), acc = n ? ok / n : 0;
    ts.sessions++; ts.best = Math.max(ts.best || 0, acc);
    // adaptive level of the table: up on >=85%, down on <50%
    if (acc >= 0.85 && ts.level < 3) ts.level++;
    else if (acc < 0.5 && ts.level > 1) ts.level--;
    // stars (monotonic): 1 = session >=60%, 2 = session >=80%, 3 = whole table mastered
    const before = ts.stars; let stars = ts.stars;
    if (acc >= 0.6) stars = Math.max(stars, 1);
    if (acc >= 0.8) stars = Math.max(stars, 2);
    if (tableMastered(t)) stars = 3;
    ts.stars = stars;
    state.history.push({ ts: Date.now(), t, ok, n }); state.history = state.history.slice(-40);
    const streak = touchStreak();
    save();
    return { newStars: stars - before, stars, streak, level: ts.level };
  }
  function addCoins(n) { state.coins += n; save(); }
  function buy(id) {
    const it = K.SHOP.find(x => x.id === id);
    if (!it || state.owned.includes(id) || state.coins < it.price) return false;
    state.coins -= it.price; state.owned.push(id); save(); return true;
  }
  function reset() { state = defaults(); save(); K.store.state = state; }

  return {
    get state() { return state; }, set state(v) { state = v; },
    save, today, fact, fkey, recordAnswer, tstate, mastery, tableMastery, tableMastered, totalStars,
    finishSession, addCoins, buy, reset, streakNow
  };
})();
