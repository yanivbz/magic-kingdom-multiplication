/* Persistent state + mastery engine (per-fact spaced repetition). */
K.store = (function () {
  const KEY = 'kefel.v1';
  const DAY = 86400000;
  const defaults = () => ({
    v: 2, onboarded: false, name: '', char: null, coins: 0, owned: [], introDone: false,
    tables: {},            // t -> {level, lesson, sessions, stars, best}
    facts: {},             // "t×m" -> {box, seen, ok, bad, hint, last, due, run}
    streak: { count: 0, last: null, best: 0 },
    days: [],              // YYYY-MM-DD of practice days (last 60)
    history: [],           // [{ts, t, ok, n}] last 40 sessions
    settings: { sound: true, haptics: true, autoRead: false },
    medals: {},            // areaId -> 'bronze' | 'silver' | 'gold' (best)
    daily: { last: null, count: 0, best: 0 },
    games: {},             // kind -> {plays, best}
    home: { place: {}, view: 'yard' },   // itemId -> slot index (slot-based items)
    friends: [],           // area ids whose friend was met
    lastWorld: 'kefel',    // 'kefel' | 'garden' — last world map for the מפה tab
    geo: { units: {}, facts: {}, medals: {}, friends: [], history: [] }  // גן הצורות (separate from kefel crown)
  });
  let state = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = Object.assign(defaults(), JSON.parse(raw));
    state.settings = Object.assign({ sound: true, haptics: true, autoRead: false }, state.settings);
    migrate();
  } catch (e) {}
  /* v1 → v2: new keys get defaults (Object.assign above); place items bought in v1 where they used to stand. */
  function migrate() {
    const d = defaults();
    ['medals', 'daily', 'games', 'home', 'friends'].forEach(k => { if (!state[k] || typeof state[k] !== 'object') state[k] = d[k]; });
    if (state.lastWorld !== 'garden') state.lastWorld = 'kefel';
    if (!state.home.place) state.home.place = {};
    if (!state.home.xy || typeof state.home.xy !== 'object') state.home.xy = {};
    if (!state.home.rewards || typeof state.home.rewards !== 'object') state.home.rewards = { done: 0, pending: null, sparkle: [] };
    if (typeof state.home.rewards.done !== 'number') state.home.rewards.done = 0;
    if (!Array.isArray(state.home.rewards.sparkle)) state.home.rewards.sparkle = [];
    if (!Array.isArray(state.owned)) state.owned = [];
    /* geometry region: always ensure a complete state.geo without touching kefel medals/crown */
    const gd = { units: {}, facts: {}, medals: {}, friends: [], history: [] };
    if (!state.geo || typeof state.geo !== 'object' || Array.isArray(state.geo)) state.geo = gd;
    else {
      ['units', 'facts', 'medals'].forEach(k => { if (!state.geo[k] || typeof state.geo[k] !== 'object' || Array.isArray(state.geo[k])) state.geo[k] = {}; });
      if (!Array.isArray(state.geo.friends)) state.geo.friends = [];
      if (!Array.isArray(state.geo.history)) state.geo.history = [];
    }
    const legacy = { tree: 0, fountain: 1, swing: 2, doghouse: 3, unicorn: 4 };
    state.owned.forEach(id => { if (legacy[id] != null && state.home.place[id] == null) state.home.place[id] = legacy[id]; });
    state.v = 2;
  }

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  save(); /* persist additive keys from migrate */
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
  /* ---- champion medals & crown ---- */
  const medalCount = () => Object.keys(state.medals).length;
  const hasGold = () => Object.values(state.medals).includes('gold');
  const crownPieces = () => K.AREAS.filter(a => state.medals[a.id]).length;
  function setMedal(area, acc) {
    const m = ['gold', 'silver', 'bronze'].find(k => acc >= K.MEDALS[k].min) || null;
    const prev = state.medals[area] || null;
    const better = m && (!prev || K.MEDALS[m].rank > K.MEDALS[prev].rank);
    if (better) state.medals[area] = m;
    save();
    return { medal: m, prev, better, newPiece: !!(m && !prev) };
  }
  /* ---- shop ---- */
  function unlocked(it) {
    const n = it.need; if (!n) return true;
    if (n.medals && medalCount() < n.medals) return false;
    if (n.gold && !hasGold()) return false;
    if (n.crown && crownPieces() < K.AREAS.length) return false;
    return true;
  }
  const needText = it => { const n = it.need || {}; return n.crown ? 'משלימים את הכתר' : n.gold ? 'צריך מדליית זהב' : n.medals ? (n.medals > 1 ? `צריך ${n.medals} מדליות` : 'צריך מדליה') : ''; };
  function slotsOf(zone) { return (K.room && K.room.slotsFor ? K.room.slotsFor(zone) : K.SLOTS[zone]) || []; }
  function freeSlot(zone) { const used = new Set(K.SHOP.filter(x => x.zone === zone && state.home.place[x.id] != null && state.owned.includes(x.id)).map(x => state.home.place[x.id])); return slotsOf(zone).findIndex((_, i) => !used.has(i)); }
  function place(id, slot) {
    const it = K.SHOP.find(x => x.id === id); if (!it || !slotsOf(it.zone).length) return;
    const other = K.SHOP.find(x => x.zone === it.zone && x.id !== id && state.home.place[x.id] === slot && state.owned.includes(x.id));
    if (other) { if (state.home.place[id] != null) state.home.place[other.id] = state.home.place[id]; else delete state.home.place[other.id]; }
    if (!state.home.xy) state.home.xy = {};
    if (slot == null) { delete state.home.place[id]; delete state.home.xy[id]; }
    else state.home.place[id] = slot;
    save();
  }
  function buy(id) {
    const it = K.SHOP.find(x => x.id === id);
    if (!it || state.owned.includes(id) || state.coins < it.price || !unlocked(it)) return false;
    state.coins -= it.price; state.owned.push(id);
    if (slotsOf(it.zone).length) { const f = freeSlot(it.zone); if (f >= 0) state.home.place[id] = f; }
    save(); return true;
  }
  /* ---- adaptive fact pools (daily practice, mini-games, champion) ---- */
  function weakness(t, m) {
    const f = fact(t, m), now = Date.now();
    if (!f.seen) return (state.tables[t] && state.tables[t].lesson ? 2.6 : 1.4) * (m === 1 || t === 1 ? .5 : 1);
    let w = Math.pow(6 - f.box, 1.6);
    if (f.due <= now && f.box >= 2) w += 2;
    if (f.bad > 0 && f.run < 2) w += 3 * Math.min(f.bad, 3);
    if (f.box >= 4 && f.due > now) w *= .4;
    return w;
  }
  /* weighted sample without replacement of n facts from tables; opts.uniqueAns keeps answers distinct */
  function pickFacts(tables, n, opts = {}) {
    let pool = [];
    tables.forEach(t => { for (let m = 1; m <= 10; m++) pool.push({ t, m, w: weakness(t, m) * (opts.noOnes && (m === 1 || t === 1) ? .25 : 1) }); });
    if (opts.weakest) { pool.sort((a, b) => b.w - a.w); pool = pool.slice(0, Math.max(n * 2, 12)); }
    const out = [], ans = new Set();
    while (out.length < n && pool.length) {
      const sum = pool.reduce((s, x) => s + x.w, 0); let r = Math.random() * sum, i = 0;
      for (; i < pool.length - 1; i++) { r -= pool[i].w; if (r <= 0) break; }
      const x = pool.splice(i, 1)[0];
      if (opts.uniqueAns && ans.has(x.t * x.m)) continue;
      ans.add(x.t * x.m); out.push({ t: x.t, m: x.m });
    }
    return out;
  }
  /* tables the child has met (lesson or answers); falls back to the first recommended ones */
  function activeTables() {
    const a = K.ORDER.filter(t => (state.tables[t] && state.tables[t].lesson) || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].some(m => fact(t, m).seen));
    return a.length >= 2 ? a : K.ORDER.slice(0, 3);
  }
  /* ---- daily practice ---- */
  const dailyDone = () => state.daily.last === today();
  function dailyNow() { const d = state.daily; if (!d.last) return 0; return dayDiff(d.last, today()) <= 1 ? d.count : 0; }
  function finishDaily() {
    const d = state.daily, td = today();
    if (d.last !== td) { d.count = d.last && dayDiff(d.last, td) === 1 ? d.count + 1 : 1; d.last = td; d.best = Math.max(d.best || 0, d.count); }
    const streak = touchStreak(); save();
    return { daily: d.count, streak };
  }
  function gameResult(kind, score) {
    const g = state.games[kind] || (state.games[kind] = { plays: 0, best: 0 });
    g.plays++; const rec = score > (g.best || 0); if (rec) g.best = score; save(); return rec;
  }
  function reset() { state = defaults(); save(); }

  return {
    get state() { return state; }, set state(v) { state = v; },
    save, today, fact, fkey, recordAnswer, tstate, mastery, tableMastery, tableMastered, totalStars,
    finishSession, addCoins, buy, reset, streakNow, touchStreak,
    medalCount, hasGold, crownPieces, setMedal, unlocked, needText, place, freeSlot, weakness, pickFacts, activeTables,
    dailyDone, dailyNow, finishDaily, gameResult
  };
})();
