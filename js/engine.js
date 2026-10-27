/* Adaptive question engine.
   – facts are picked by weakness (Leitner box, recent mistakes, due-ness)
   – the *format* of a question gets harder as the fact is mastered (tiers)
   – momentum inside a session: 2 right in a row → harder, a mistake → gentler + the fact comes back
   Tier 0: visual (interactive array, multiple choice).
   Tier 1: multiple choice incl. missing factor, word problem, "which equation fits the picture".
   Tier 2: number pad (plain, missing factor, word problem). */
K.engine = (function () {
  const rnd = n => Math.floor(Math.random() * n);
  const pick = arr => arr[rnd(arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function numericDistractors(ans, a, b, lo, hi, n = 3) {
    const cand = new Set([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, a + b, ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans + a, ans - b]);
    let list = shuffle([...cand].filter(x => x !== ans && x >= lo && x <= hi && Number.isInteger(x)));
    const out = list.slice(0, n);
    let step = 1;
    while (out.length < n) { const v = ans + step * (step % 2 ? 1 : -1) * 3; if (v >= lo && v <= hi && v !== ans && !out.includes(v)) out.push(v); step++; if (step > 40) break; }
    return out;
  }

  class Session {
    constructor(t, total = 6) {
      this.t = t; this.total = total; this.asked = 0; this.retryQ = [];
      this.run = 0; this.justWrong = false; this.recent = []; this.lastType = null;
      this.results = []; this.askedKeys = {};
      this.level = K.store.tstate(t).level;
    }
    get done() { return this.asked >= this.total && this.retryQ.length === 0; }
    get progress() { return Math.min(1, this.results.length / (this.total + this.extra())); }
    extra() { return this.results.filter(r => r.retry).length + this.retryQ.length; }

    pickFact() {
      const now = Date.now(), t = this.t, ws = [];
      for (let m = 1; m <= 10; m++) {
        const key = K.store.fkey(t, m);
        if (this.recent.slice(-2).includes(key)) continue;
        const f = K.store.fact(t, m);
        let w;
        if (f.seen === 0) w = 3.2;
        else {
          w = Math.pow(6 - f.box, 1.6);
          if (f.due > now && f.box >= 3) w *= 0.4;
          if (f.due <= now && f.box >= 2) w += 2;
          if (f.bad > 0 && f.run < 2) w += 3 * Math.min(f.bad, 3);
        }
        if (m === 1 && f.box >= 1) w *= 0.3;
        if (m === 1 && f.seen === 0) w *= 0.6;
        if (this.askedKeys[key]) w *= 0.15;
        ws.push({ m, key, w });
      }
      const sum = ws.reduce((s, x) => s + x.w, 0); let r = Math.random() * sum;
      for (const x of ws) { r -= x.w; if (r <= 0) return x; }
      return ws[ws.length - 1];
    }

    next() {
      let m, retry = false;
      const due = this.retryQ.findIndex(r => r.at <= this.asked);
      if (due >= 0 || (this.asked >= this.total && this.retryQ.length)) {
        const idx = due >= 0 ? due : 0;
        m = this.retryQ.splice(idx, 1)[0].m; retry = true;
      } else { m = this.pickFact().m; this.asked++; }
      const key = K.store.fkey(this.t, m);
      this.askedKeys[key] = (this.askedKeys[key] || 0) + 1; this.recent.push(key);
      const f = K.store.fact(this.t, m);
      let tier = f.seen === 0 ? 0 : f.box <= 1 ? 0 : f.box <= 3 ? 1 : 2;
      if (this.level === 3 && f.box >= 2) tier++;
      if (this.level === 1) tier--;
      if (this.run >= 2) tier++;
      if (this.justWrong || retry) tier = Math.min(tier, 0);
      tier = Math.max(0, Math.min(2, tier));
      const q = this.make(m, tier, retry);
      this.lastType = q.type;
      return q;
    }

    make(m, tier, retry) {
      const t = this.t;
      let a = t, b = m;
      if (Math.random() < 0.5) { a = m; b = t; }
      const big = a >= 2 && b >= 2;
      let type;
      if (tier === 0) type = retry ? 'choice' : (big && Math.random() < 0.55 ? 'array' : 'choice');
      else if (tier === 1) type = pick(['choice', 'missing', big ? 'story' : 'missing', big ? 'eq' : 'choice'].filter(x => x !== this.lastType));
      else type = pick(['numpad', 'missing', big ? 'story' : 'numpad'].filter(x => x !== this.lastType));
      const input = (tier >= 2 && type !== 'eq') ? 'numpad' : 'choice';
      const ans = a * b;
      const q = { type, t, m, a, b, ans, tier, retry, input, key: K.store.fkey(t, m) };

      if (type === 'missing') {
        q.unknown = Math.random() < 0.5 ? 'a' : 'b';
        q.target = q.unknown === 'a' ? a : b;
        q.answer = q.target;
        if (input === 'choice') {
          const o = new Set([q.target]);
          [q.target + 1, q.target - 1, q.target + 2, q.target - 2, Math.round(ans / 10) || 2].forEach(x => { if (x >= 1 && x <= 12) o.add(x); });
          const others = shuffle([...o].filter(x => x !== q.target)).slice(0, 3);
          q.choices = shuffle([q.target, ...others]);
        }
      } else if (type === 'eq') {
        q.answer = `${a} × ${b}`;
        const ds = [`${a} × ${b + 1}`, `${a + 1} × ${b}`, `${a} + ${b}`, `${a - 1} × ${b}`].filter(x => x !== q.answer);
        q.choices = shuffle([q.answer, ...shuffle(ds).slice(0, 3)]);
      } else {
        q.answer = ans;
        if (type === 'story') q.story = pick(K.STORIES);
        if (input === 'choice') q.choices = shuffle([ans, ...numericDistractors(ans, a, b, 1, 110)]);
      }
      return q;
    }

    /* call after the child answered: updates mastery & momentum, queues a retry on a mistake */
    report(q, { correct, hinted }) {
      K.store.recordAnswer(q.t, q.m, { correct, hinted });
      this.results.push({ key: q.key, m: q.m, correct, hinted, retry: q.retry, a: q.a, b: q.b });
      if (correct) { this.run++; this.justWrong = false; }
      else {
        this.run = 0; this.justWrong = true;
        if (!q.retry) this.retryQ.push({ m: q.m, at: this.asked + 2 });
      }
    }
    summary() {
      const first = this.results.filter(r => !r.retry);
      const ok = first.filter(r => r.correct).length;
      const hardFacts = [...new Set(this.results.filter(r => !r.correct).map(r => r.m))];
      return { ok, n: first.length, hardFacts, run: this.results };
    }
  }
  return { Session, shuffle, pick, rnd };
})();
