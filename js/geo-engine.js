/* Geometry progress + adaptive session. Uses state.geo only (does not touch kefel facts/engine). */
K.geoStore = (function () {
  const DAY = 86400000;
  const INTERVALS = [0, 0, DAY, 2 * DAY, 4 * DAY, 7 * DAY];
  const geo = () => K.store.state.geo;
  const save = () => K.store.save();

  function ustate(id) {
    const u = geo().units;
    return u[id] || (u[id] = { level: 1, lesson: false, sessions: 0, stars: 0, best: 0 });
  }
  function fact(key) {
    return geo().facts[key] || { box: 0, seen: 0, ok: 0, bad: 0, hint: 0, last: 0, due: 0, run: 0 };
  }
  function recordAnswer(key, { correct, hinted }) {
    const f = fact(key), now = Date.now();
    f.seen++; f.last = now;
    if (correct) {
      f.ok++; f.run++;
      if (hinted) { f.hint++; f.box = Math.max(f.box, 1); }
      else f.box = Math.min(5, f.box + (f.run >= 2 && f.box < 3 ? 2 : 1));
    } else {
      f.bad++; f.run = 0; f.box = Math.max(0, f.box - 2);
    }
    f.due = now + INTERVALS[f.box];
    geo().facts[key] = f; save();
    return f;
  }
  const mastery = key => { const f = fact(key); return f.seen === 0 ? 0 : f.box / 5; };
  function unitFacts() {
    return K.geoEngine.FACT_KEYS;
  }
  function unitMastered() {
    return unitFacts().every(k => fact(k).box >= 3);
  }
  function unitMastery() {
    const keys = unitFacts();
    return keys.reduce((s, k) => s + mastery(k), 0) / keys.length;
  }
  function finishSession(unitId, ok, n) {
    const ts = ustate(unitId), acc = n ? ok / n : 0;
    ts.sessions++; ts.best = Math.max(ts.best || 0, acc);
    if (acc >= 0.85 && ts.level < 3) ts.level++;
    else if (acc < 0.5 && ts.level > 1) ts.level--;
    const before = ts.stars; let stars = ts.stars;
    if (acc >= 0.6) stars = Math.max(stars, 1);
    if (acc >= 0.8) stars = Math.max(stars, 2);
    if (unitMastered()) stars = 3;
    ts.stars = stars;
    geo().history.push({ ts: Date.now(), unit: unitId, ok, n });
    geo().history = geo().history.slice(-40);
    const streak = K.store.touchStreak();
    save();
    return { newStars: stars - before, stars, streak, level: ts.level };
  }
  function setMedal(acc) {
    const m = ['gold', 'silver', 'bronze'].find(k => acc >= K.MEDALS[k].min) || null;
    const prev = geo().medals.garden || null;
    const better = m && (!prev || K.MEDALS[m].rank > K.MEDALS[prev].rank);
    if (better) geo().medals.garden = m;
    save();
    return { medal: m, prev, better, first: !!(m && !prev) };
  }
  function meet() {
    if (!geo().friends.includes('garden')) { geo().friends.push('garden'); save(); return true; }
    return false;
  }
  function weakness(key) {
    const f = fact(key), now = Date.now();
    const extra = /classify:|make:/.test(key) && !/straight/.test(key) ? 1.25 : 1;
    if (!f.seen) return (ustate('angles').lesson ? 2.6 : 1.4) * extra;
    let w = Math.pow(6 - f.box, 1.6);
    if (f.due <= now && f.box >= 2) w += 2;
    if (f.bad > 0 && f.run < 2) w += 3 * Math.min(f.bad, 3);
    if (f.box >= 4 && f.due > now) w *= .4;
    return w * extra;
  }
  return { geo, ustate, fact, recordAnswer, mastery, unitMastered, unitMastery, finishSession, setMedal, meet, weakness };
})();

K.geoEngine = (function () {
  const rnd = n => Math.floor(Math.random() * n);
  const pick = arr => arr[rnd(arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const randRot = () => rnd(360);
  const degFor = kind => {
    if (kind === 'right') return 90;
    if (kind === 'straight') return 180;
    if (kind === 'acute') return pick([20, 25, 30, 35, 40, 45, 50, 55, 60, 70]);
    if (kind === 'obtuse') return pick([110, 120, 125, 130, 140, 150, 155, 160]);
    return 60;
  };
  const KINDS3 = ['acute', 'right', 'obtuse'];
  const KINDS4 = ['acute', 'right', 'obtuse', 'straight'];

  const FACTS = [
    { key: 'classify:acute',    type: 'classify', kind: 'acute',    w: 1.3 },
    { key: 'classify:right',    type: 'classify', kind: 'right',    w: 1.35 },
    { key: 'classify:obtuse',   type: 'classify', kind: 'obtuse',   w: 1.3 },
    { key: 'classify:straight', type: 'classify', kind: 'straight', w: 0.7 },
    { key: 'find-right',        type: 'find-right',                w: 1.15 },
    { key: 'compare',           type: 'compare',                   w: 1.05 },
    { key: 'make:acute',        type: 'make', kind: 'acute',        w: 1.2 },
    { key: 'make:right',        type: 'make', kind: 'right',        w: 1.25 },
    { key: 'make:obtuse',       type: 'make', kind: 'obtuse',       w: 1.2 },
    { key: 'make:straight',     type: 'make', kind: 'straight',     w: 0.6 },
    { key: 'world:acute',       type: 'world', kind: 'acute',       w: 1.05 },
    { key: 'world:right',       type: 'world', kind: 'right',       w: 1.1 },
    { key: 'world:obtuse',      type: 'world', kind: 'obtuse',      w: 1.05 }
  ];
  const FACT_KEYS = FACTS.map(f => f.key);
  const byKey = Object.fromEntries(FACTS.map(f => [f.key, f]));

  function choicesFor(kind, includeStraight) {
    const pool = includeStraight ? KINDS4 : KINDS3;
    const list = pool.slice();
    if (!list.includes(kind)) list.push(kind);
    return shuffle(list);
  }

  class Session {
    constructor(total = 8, opts = {}) {
      this.total = total; this.noRetry = !!opts.noRetry; this.noHint = !!opts.noHint;
      this.fixedLevel = opts.level || 0;
      this.asked = 0; this.retryQ = []; this.run = 0; this.justWrong = false;
      this.recent = []; this.lastType = null; this.results = []; this.askedKeys = {};
      this.level = this.fixedLevel || K.geoStore.ustate('angles').level;
      this.unitId = 'angles';
    }
    get done() { return this.asked >= this.total && this.retryQ.length === 0; }
    get progress() { return Math.min(1, this.results.length / (this.total + this.extra())); }
    extra() { return this.results.filter(r => r.retry).length + this.retryQ.length; }

    allowedFacts() {
      const lesson = K.geoStore.ustate('angles').lesson;
      return FACTS.filter(f => {
        if (!lesson && f.type === 'make') return false;
        if (this.level === 1 && (f.type === 'make' || f.type === 'find-right' || f.kind === 'straight')) return this.asked >= 3 && f.type !== 'make';
        return true;
      });
    }

    pickFact() {
      const now = Date.now();
      const cands = this.allowedFacts();
      const ws = cands.map(f => {
        const key = f.key;
        let w = K.geoStore.weakness(key) * (f.w || 1);
        if (this.recent.slice(-2).includes(key)) w *= 0.15;
        if (this.askedKeys[key]) w *= 0.35;
        return { f, key, w: Math.max(0.05, w) };
      });
      const sum = ws.reduce((s, x) => s + x.w, 0); let r = Math.random() * sum;
      for (const x of ws) { r -= x.w; if (r <= 0) return x.f; }
      return ws[ws.length - 1].f;
    }

    next() {
      let meta, retry = false;
      const due = this.retryQ.findIndex(r => r.at <= this.asked);
      if (due >= 0 || (this.asked >= this.total && this.retryQ.length)) {
        const idx = due >= 0 ? due : 0;
        meta = this.retryQ.splice(idx, 1)[0].meta; retry = true;
      } else { meta = this.pickFact(); this.asked++; }
      this.askedKeys[meta.key] = (this.askedKeys[meta.key] || 0) + 1;
      this.recent.push(meta.key);
      const q = this.make(meta, retry);
      this.lastType = q.type;
      return q;
    }

    make(meta, retry) {
      const type = meta.type;
      const kind = meta.kind;
      const includeS = this.level >= 2 || meta.kind === 'straight' || type === 'classify' && this.asked > 4;
      const q = { type, kind, key: meta.key, retry, unit: 'angles', includeS };
      if (type === 'classify') {
        q.deg = degFor(kind); q.rot = randRot();
        q.answer = kind;
        q.choices = choicesFor(kind, includeS || kind === 'straight');
        q.ask = 'איזה סוג זווית זאת?';
      } else if (type === 'find-right') {
        q.shape = pick(K.geoArt.SHAPES);
        q.answer = q.shape.rights.slice().sort((a, b) => a - b).join(',');
        q.ask = 'לחצי על כל הזוויות הישרות בצורות, ואז על סיימתי.';
      } else if (type === 'compare') {
        const mode = pick(['bigger', 'right', 'sharper']);
        q.mode = mode;
        if (mode === 'right') {
          const other = pick(['acute', 'obtuse']);
          const sides = shuffle([
            { kind: 'right', deg: 90, rot: randRot() },
            { kind: other, deg: degFor(other), rot: randRot() }
          ]);
          q.left = sides[0]; q.right = sides[1];
          q.answer = sides[0].kind === 'right' ? 'L' : 'R';
          q.ask = 'באיזו תמונה יש זווית ישרה?';
        } else if (mode === 'sharper') {
          const a = pick([25, 30, 40, 50]), b = pick([60, 70, 80, 110, 130]);
          const sides = shuffle([{ deg: a, rot: randRot() }, { deg: b, rot: randRot() }]);
          q.left = sides[0]; q.right = sides[1];
          q.answer = sides[0].deg < sides[1].deg ? 'L' : 'R';
          q.ask = 'איזו זווית חדה יותר (קטנה יותר)?';
        } else {
          let a = degFor(pick(KINDS3)), b = degFor(pick(KINDS3));
          if (a === b) b = a === 90 ? 60 : 90;
          const sides = shuffle([{ deg: a, rot: randRot() }, { deg: b, rot: randRot() }]);
          q.left = sides[0]; q.right = sides[1];
          q.answer = sides[0].deg > sides[1].deg ? 'L' : 'R';
          q.ask = 'איזו זווית גדולה יותר?';
        }
        q.choices = ['L', 'R'];
      } else if (type === 'make') {
        q.answer = kind;
        q.rot = pick([10, 15, 20, 25, 200, 330, 0, 40]);
        /* start far from the target */
        q.startDeg = kind === 'right' ? pick([35, 50, 130, 150]) : kind === 'acute' ? pick([90, 110, 140]) : kind === 'obtuse' ? pick([35, 50, 90]) : pick([60, 90, 120]);
        q.ask = `צרי ${K.GEO.ANGLE.types[kind].full}. גררי את הנקודה הוורודה, ואז לחצי על בדיקה.`;
      } else if (type === 'world') {
        q.world = K.geoArt.pickWorld(kind);
        q.deg = q.world.deg; q.rot = q.world.rot;
        q.answer = kind;
        q.choices = choicesFor(kind, false);
        q.ask = q.world.ask;
      }
      return q;
    }

    report(q, { correct, hinted }) {
      K.geoStore.recordAnswer(q.key, { correct, hinted });
      this.results.push({ key: q.key, type: q.type, kind: q.kind, correct, hinted, retry: q.retry });
      if (correct) { this.run++; this.justWrong = false; }
      else {
        this.run = 0; this.justWrong = true;
        if (!q.retry && !this.noRetry) this.retryQ.push({ meta: byKey[q.key] || { key: q.key, type: q.type, kind: q.kind }, at: this.asked + 2 });
      }
    }
    summary() {
      const first = this.results.filter(r => !r.retry);
      const ok = first.filter(r => r.correct).length;
      const hard = [...new Map(this.results.filter(r => !r.correct).map(r => [r.key, r])).values()];
      return { ok, n: first.length, hard, run: this.results };
    }
  }
  return { Session, FACTS, FACT_KEYS, shuffle, pick, rnd, degFor };
})();
