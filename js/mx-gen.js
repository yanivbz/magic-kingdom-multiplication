/* Math+geometry exam prep: number words, generated practice items, and answer checks.
   Pure functions only (no DOM) so the same code is verified in node (tools/verify-math-exam.js).
   Every generated item carries the data its answer is computed from; MX.verify(item) recomputes it. */
(function (root) {
  const K = root.K || (root.K = {});
  const MX = K.MX = K.MX || {};

  /* ---------- numbers in Hebrew words (counting form, as written in school: אלפיים חמש מאות ושלושים) ---------- */
  const U = ['', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע'];
  const TEEN = ['עשר', 'אחת עשרה', 'שתים עשרה', 'שלוש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה'];
  const TENS = ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים'];
  const HUND = ['', 'מאה', 'מאתיים', 'שלוש מאות', 'ארבע מאות', 'חמש מאות', 'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות'];
  const THOU = ['', 'אלף', 'אלפיים', 'שלושת אלפים', 'ארבעת אלפים', 'חמשת אלפים', 'ששת אלפים', 'שבעת אלפים', 'שמונת אלפים', 'תשעת אלפים', 'עשרת אלפים'];
  /* word parts of n (1..10000); the last part gets the connecting ו when there is more than one part */
  function wordParts(n) {
    if (!(n >= 1 && n <= 10000) || n % 1) throw new Error('wordParts range ' + n);
    const p = [];
    const th = Math.floor(n / 1000), h = Math.floor(n / 100) % 10, r = n % 100;
    if (th) p.push(THOU[th]);
    if (h) p.push(HUND[h]);
    if (r >= 10 && r < 20) p.push(TEEN[r - 10]);
    else { if (r >= 20) p.push(TENS[Math.floor(r / 10)]); if (r % 10) p.push(U[r % 10]); }
    if (p.length > 1) p[p.length - 1] = 'ו' + p[p.length - 1];
    return p;
  }
  const toWords = n => wordParts(n).join(' ');
  /* parse Hebrew number words back to a number (independent path, used to double-check) */
  const norm = s => s.replace(/שלש/g, 'שלוש').replace(/שתיים עשרה/g, 'שתים עשרה').replace(/\s+/g, ' ').trim();
  function fromWords(s) {
    let rest = ' ' + norm(s) + ' ';
    const dict = [];
    THOU.forEach((w, i) => w && dict.push([w, i * 1000]));
    HUND.forEach((w, i) => w && dict.push([w, i * 100]));
    TEEN.forEach((w, i) => dict.push([w, 10 + i]));
    TENS.forEach((w, i) => w && dict.push([w, i * 10]));
    U.forEach((w, i) => w && dict.push([w, i]));
    dict.sort((a, b) => b[0].length - a[0].length);
    let total = 0; rest = rest.trim();
    while (rest) {
      rest = rest.replace(/^ו/, '');                 // no number word starts with ו, so a leading ו is the connector
      const hit = dict.find(([w]) => rest.startsWith(w) && (rest.length === w.length || rest[w.length] === ' '));
      if (!hit) return NaN;
      total += hit[1]; rest = rest.slice(hit[0].length).trim();
    }
    return total;
  }

  /* ---------- helpers ---------- */
  const fmt = n => (n >= 1000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : String(n));
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  /* rounding exactly as the teacher wrote: look at the digit after the place; 0-4 down, 5 and up — up */
  function roundTo(n, unit) {
    const below = Math.floor(n / (unit / 10)) % 10;        // the digit right after the rounding place
    const base = Math.floor(n / unit) * unit;
    return below >= 5 ? base + unit : base;
  }
  const UNIT_NAME = { 10: 'לעשרות שלמות', 100: 'למאות שלמות', 1000: 'לאלפים שלמים' };
  const PLACE = ['יחידות', 'עשרות', 'מאות', 'אלפים'];
  const evalExpr = s => s.replace(/,/g, '').split(/\s*([+−-])\s*/).reduce((acc, tok, i, arr) => {
    if (i === 0) return Number(tok);
    if (i % 2) return acc; return arr[i - 1] === '+' ? acc + Number(tok) : acc - Number(tok);
  }, 0);
  const cmpSign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');
  const triKind = ([a, b, c]) => (a === b && b === c ? 'שווה צלעות' : (a === b || b === c || a === c) ? 'שווה שוקיים' : 'שונה צלעות');
  const angKind = d => (d === 90 ? 'ישרה' : d < 90 ? 'חדה' : 'קהה');
  const isTri = ([a, b, c]) => a + b > c && a + c > b && b + c > a;

  /* ---------- verify: recompute the answer of any item from its data ---------- */
  function verify(it) {
    switch (it.kind) {
      case 'place': { const s = String(it.n); const d = +s[it.idx]; return d * Math.pow(10, s.length - 1 - it.idx) === it.ans && d !== 0 && (it.mode !== 'name' || it.placeName === PLACE[s.length - 1 - it.idx]); }
      case 'toDigits': return fromWords(it.words) === it.ans && toWords(it.ans) === norm(it.words);
      case 'toWords': return toWords(it.n) === norm(it.ans.join(' ')) && fromWords(it.ans.join(' ')) === it.n;
      case 'prevnext': return it.prev === it.n - 1 && it.next === it.n + 1;
      case 'blocks': return it.th * 1000 + it.h * 100 + it.t * 10 + it.u === it.ans;
      case 'eq': { // every [x] blank filled with its answer must make the two sides equal
        const filled = it.text.replace(/\[([\d,]+)\]/g, '$1');
        const [l, r] = filled.split('=');
        return evalExpr(l) === evalExpr(r);
      }
      case 'cmp': return cmpSign(evalExpr(it.a), evalExpr(it.b)) === it.ans;
      case 'nlfill': return it.labels.every((v, i) => (v == null ? it.ans[it.blanks.indexOf(i)] === it.start + i * it.step : v === it.start + i * it.step)) && it.blanks.every(i => it.labels[i] == null);
      case 'nlplace': return it.nums.every(x => x > it.from && x < it.to && (x - it.from) % it.step === 0);
      case 'round': return roundTo(it.n, it.unit) === it.ans && Math.abs(it.ans - it.n) <= it.unit / 2;
      case 'estimate': { const ex = evalExpr(it.expr); const best = it.options.slice().sort((p, q) => Math.abs(p - ex) - Math.abs(q - ex)); return best[0] === it.ans && Math.abs(best[0] - ex) < Math.abs(best[1] - ex); }
      case 'vertical': return it.a + it.b === it.ans && String(it.a).split('').reverse().some((d, i) => +d + (+(String(it.b).split('').reverse()[i] || 0)) >= 10);
      case 'word': return (it.op === '+' ? it.a + it.b : it.a - it.b) === it.ans && it.ans >= 0;
      case 'polygons': return it.shapes.every(s => (s.kind in POLY) && POLY[s.kind] === s.ok);
      case 'angle': return angKind(it.deg) === it.ans && (it.deg === 90 || Math.abs(it.deg - 90) >= 20);
      case 'triangle': return isTri(it.sides) && triKind(it.sides) === it.ans;
      case 'mark': return (it.target === 'vertex' ? 'קודקוד' : 'צלע') === it.ans;
      case 'count': return it.sides === it.ans && it.sides >= 3;
      case 'line': return it.options[it.correct] === 'straight';
      default: return false;
    }
  }
  const POLY = { triangle: true, rect: true, trapezoid: true, pentagon: true, hexagon: true, square: true, semicircle: false, ellipse: false, circle: false, open: false, curvy: false };

  /* ---------- generators: one per bullet of the teacher's topic list ---------- */
  const G = {};
  const n4 = () => ri(1001, 9999);
  G.write = () => {
    if (Math.random() < .5) { const n = pick([ri(1000, 9999), ri(1000, 9999), ri(1, 9) * 1000 + ri(0, 9) * 10 + ri(0, 9), ri(1, 9) * 1000 + ri(1, 9) * 100]); return { kind: 'toDigits', prompt: 'כתבי בספרות:', words: toWords(n), ans: n }; }
    const n = pick([n4(), ri(1, 9) * 1000 + ri(1, 9) * 10, ri(1, 9) * 1000 + ri(1, 9) * 100 + ri(11, 19)]);
    const ans = wordParts(n);
    // distractor tiles: parts of a number with the same digits in other places, not already in the answer
    let pool = [];
    for (let k = 0; k < 12 && pool.length < 2; k++) {
      const s = String(n).split(''); const i = ri(0, s.length - 1), j = ri(0, s.length - 1);[s[i], s[j]] = [s[j], s[i]];
      const m = +s.join(''); if (m >= 1000 && m !== n) wordParts(m).forEach(w => { if (!ans.includes(w) && !pool.includes(w) && pool.length < 2) pool.push(w); });
    }
    if (pool.length < 2) [HUND[ri(1, 9)], 'ו' + U[ri(1, 9)], THOU[ri(1, 9)]].forEach(w => { if (!ans.includes(w) && !pool.includes(w) && pool.length < 2) pool.push(w); });
    return { kind: 'toWords', prompt: 'כתבי במילים: בחרי את המילים לפי הסדר.', n, ans, tiles: shuffle(ans.concat(pool)) };
  };
  G.place = () => {
    let n, idx;
    do { n = n4(); idx = ri(0, 3); } while (String(n)[idx] === '0' || String(n).split('').filter(d => d === String(n)[idx]).length > 1);
    const s = String(n), d = +s[idx], ans = d * Math.pow(10, 3 - idx);
    if (Math.random() < .5) return { kind: 'place', mode: 'name', prompt: 'מהו הערך של הספרה שמתחתיה קו?', n, idx, ans, placeName: PLACE[3 - idx] }; // answered by place name
    return { kind: 'place', mode: 'name', prompt: `באיזה מקום נמצאת הספרה שמתחתיה קו?`, n, idx, ans, placeName: PLACE[3 - idx] };
  };
  G.decomp = () => {
    const n = n4(), s = String(n).split('').map(Number);
    const parts = s.map((d, i) => d * Math.pow(10, 3 - i)).filter(Boolean);
    const r = Math.random();
    if (r < .34) return { kind: 'eq', prompt: 'פרקי לפי המבנה העשרוני:', text: `${fmt(n)} = ` + parts.map(p => `[${p}]`).join(' + ') };
    if (r < .67) return { kind: 'eq', prompt: 'השלימי:', text: parts.map(fmt).join(' + ') + ` = [${n}]` };
    return { kind: 'blocks', prompt: 'מהו המספר בציור?', th: s[0], h: s[1], t: s[2], u: s[3], ans: n, small: true };
  };
  G.blocksOK = it => it.th <= 9 && it.h <= 9 && it.t <= 9 && it.u <= 9;
  G.compare = () => {
    if (Math.random() < .25) { // sum vs number (equal or near) — like "5,000 + 300 ○ 5,300"
      const a = ri(1, 8) * 1000, b = ri(1, 9) * 100, eq = Math.random() < .6, x = a + b + (eq ? 0 : pick([-100, 100, 10, -10]));
      return { kind: 'cmp', prompt: 'כתבי בעיגול <, >, =', a: `${fmt(a)} + ${fmt(b)}`, b: fmt(x), ans: cmpSign(a + b, x) };
    }
    const a = n4(); const s = String(a).split(''); const i = ri(1, 3), j = Math.min(3, i + 1);
    let b; if (Math.random() < .5 && s[i] !== s[j]) { [s[i], s[j]] = [s[j], s[i]]; b = +s.join(''); } else b = a + pick([-1, 1, -10, 10, -100, 100, -1000, 1000, -90, 90]);
    if (b < 1000 || b > 9999 || b === a) b = a + 10;
    return { kind: 'cmp', prompt: 'כתבי בעיגול <, >, =', a: fmt(a), b: fmt(b), ans: cmpSign(a, b) };
  };
  G.numline = () => {
    const big = Math.random() < .5, step = big ? 100 : 10, start = big ? ri(0, 9) * 1000 : ri(10, 99) * 100;
    if (Math.random() < .5) {
      const blanks = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).sort((p, q) => p - q);
      const labels = []; for (let i = 0; i <= 10; i++) labels.push(blanks.includes(i) ? null : start + i * step);
      return { kind: 'nlfill', prompt: 'כתבי במלבנים את המספרים החסרים:', start, step, labels, blanks, ans: blanks.map(i => start + i * step) };
    }
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).map(k => start + k * step);
    return { kind: 'nlplace', prompt: 'גררי כל מספר אל המקום שלו על הישר:', from: start, to: start + 10 * step, step, nums };
  };
  G.round = () => {
    const unit = pick([10, 100, 1000]); let n;
    do { n = unit === 1000 ? ri(1000, 9499) : ri(100, 9989); } while (n % unit === 0);
    return { kind: 'round', prompt: `עגלי ${UNIT_NAME[unit]}:`, n, unit, ans: roundTo(n, unit) };
  };
  G.estimate = () => {
    for (;;) {
      const unit = pick([100, 1000]);
      const op = pick(['+', '−']);
      const ra = (unit === 100 ? ri(2, 60) : ri(2, 8)) * unit, rb = (unit === 100 ? ri(1, 30) : ri(1, 4)) * unit;
      if (op === '+' && ra + rb > 9000) continue; if (op === '−' && ra <= rb) continue;
      const a = ra + ri(-unit / 10 * 2, unit / 10 * 2) + (unit === 100 ? 0 : ri(-9, 9)), b = rb + ri(-unit / 10 * 2, unit / 10 * 2);
      const expr = `${fmt(a)} ${op} ${fmt(b)}`, ex = evalExpr(expr), est = op === '+' ? ra + rb : ra - rb;
      const options = shuffle([est, est + unit * pick([1, 2]), Math.max(unit, est - unit * pick([1, 2]))]);
      if (new Set(options).size < 3 || options.some(o => o > 10000) || ex > 10000 || ex <= 0) continue;
      const it = { kind: 'estimate', prompt: 'בחרי את התשובה הקרובה ביותר:', expr, options, ans: est };
      if (verify(it) && Math.abs(est - ex) < unit / 2) return it;
    }
  };
  G.horiz = () => {
    for (;;) {
      const op = pick(['+', '−']), kind = ri(0, 2);
      let a, b;
      if (kind === 0) { a = ri(1, 8) * 1000 + ri(0, 9) * 100; b = ri(1, 4) * 1000 + ri(0, 9) * 100; }
      else if (kind === 1) { a = ri(10, 90) * 10 + ri(1, 8) * 1000; b = ri(10, 90) * 10; }
      else { a = n4(); b = ri(100, 4000); }
      const ans = op === '+' ? a + b : a - b;
      if (ans <= 0 || ans > 10000) continue;
      return { kind: 'eq', prompt: 'פתרי:', text: `${fmt(a)} ${op} ${fmt(b)} = [${ans}]` };
    }
  };
  G.vertical = () => {
    for (;;) {
      const a = ri(Math.random() < .3 ? 100 : 1000, 6999), b = ri(100, 4999), it = { kind: 'vertical', prompt: 'פתרי במאונך:', a, b, ans: a + b };
      if (a + b <= 9999 && verify(it)) return it;
    }
  };
  const WORDS = [
    { op: '+', t: (a, b) => `בספרייה יש ${fmt(a)} ספרים. הספרייה קנתה עוד ${fmt(b)} ספרים. כמה ספרים יש עכשיו בספרייה?` },
    { op: '−', t: (a, b) => `באולם יש ${fmt(a)} כיסאות. ${fmt(b)} כיסאות תפוסים. כמה כיסאות פנויים?` },
    { op: '+', t: (a, b) => `ביום ראשון ביקרו בגן החיות ${fmt(a)} ילדים, וביום שני ביקרו ${fmt(b)} ילדים. כמה ילדים ביקרו בשני הימים יחד?` },
    { op: '−', t: (a, b) => `בחנות היו ${fmt(a)} מחברות. נמכרו ${fmt(b)} מחברות. כמה מחברות נשארו בחנות?` },
    { op: '+', t: (a, b) => `בחווה קטפו בבוקר ${fmt(a)} תפוזים, ואחר הצהריים קטפו עוד ${fmt(b)} תפוזים. כמה תפוזים קטפו בסך הכול?` },
    { op: '−', t: (a, b) => `במשחק נועה צברה ${fmt(a)} נקודות, ויובל צבר ${fmt(b)} נקודות. בכמה נקודות צברה נועה יותר מיובל?` }
  ];
  G.word = () => {
    for (;;) {
      const w = pick(WORDS), a = ri(12, 89) * 10 + ri(1, 8) * 1000 * (Math.random() < .8 ? 1 : 0) + ri(0, 9), b = ri(10, 60) * 10 + (Math.random() < .5 ? ri(1, 3) * 1000 : 0);
      const ans = w.op === '+' ? a + b : a - b;
      if (ans <= 0 || ans > 10000 || a <= b) continue;
      return { kind: 'word', prompt: 'קראי ופתרי:', text: w.t(a, b), op: w.op === '+' ? '+' : '−', a, b, ans };
    }
  };
  G.concepts = () => {
    const r = ri(0, 3), sides = ri(3, 6);
    if (r === 0) { const target = pick(['vertex', 'side']); return { kind: 'mark', prompt: 'מה מסומן בצבע במצולע?', sides, target, ans: target === 'vertex' ? 'קודקוד' : 'צלע', options: ['קודקוד', 'צלע'] }; }
    if (r === 1) { const what = pick(['צלעות', 'קודקודים']); return { kind: 'count', prompt: `כמה ${what} יש למצולע?`, sides, ans: sides, options: [3, 4, 5, 6] }; }
    if (r === 2) {
      const yes = pick(['triangle', 'rect', 'trapezoid', 'pentagon', 'hexagon', 'square']);
      const no = shuffle(['semicircle', 'ellipse', 'circle', 'open', 'curvy']).slice(0, 2);
      const yes2 = pick(['triangle', 'rect', 'trapezoid', 'pentagon', 'hexagon', 'square'].filter(x => x !== yes));
      return { kind: 'polygons', prompt: 'סמני את הצורות שהן מצולעים:', shapes: shuffle([yes, yes2, ...no]).map(k => ({ kind: k, ok: POLY[k] })) };
    }
    return { kind: 'line', prompt: 'איזה קו הוא קו ישר?', options: shuffle(['straight', 'curve', 'broken']), get correct() { return this.options.indexOf('straight'); } };
  };
  G.triangles = () => {
    for (;;) {
      const t = pick(['eq', 'iso', 'sca']); let s;
      if (t === 'eq') { const a = ri(2, 8); s = [a, a, a]; }
      else if (t === 'iso') { const a = ri(3, 8), b = ri(2, 9); if (a === b) continue; s = shuffle([a, a, b]); }
      else s = shuffle([ri(2, 9), ri(2, 9), ri(2, 9)]);
      if (!isTri(s)) continue;
      if (t === 'sca' && new Set(s).size < 3) continue;
      const it = { kind: 'triangle', prompt: 'איזה משולש זה?', sides: s, ans: triKind(s), options: ['שווה צלעות', 'שווה שוקיים', 'שונה צלעות'] };
      if (verify(it)) return it;
    }
  };
  G.angles = () => {
    const k = pick(['ישרה', 'חדה', 'קהה']);
    const deg = k === 'ישרה' ? 90 : k === 'חדה' ? ri(25, 65) : ri(115, 160);
    return { kind: 'angle', prompt: 'איזו זווית זו?', deg, rot: ri(-30, 30), ans: angKind(deg), options: ['חדה', 'ישרה', 'קהה'] };
  };

  MX.toWords = toWords; MX.wordParts = wordParts; MX.fromWords = fromWords; MX.norm = norm;
  MX.fmt = fmt; MX.roundTo = roundTo; MX.evalExpr = evalExpr; MX.verify = verify; MX.G = G;
  MX.triKind = triKind; MX.angKind = angKind; MX.isTri = isTri; MX.POLY = POLY; MX.shuffle = shuffle;
  MX.gen = id => { for (let k = 0; k < 50; k++) { const it = G[id](); if (verify(it)) return it; } throw new Error('gen failed ' + id); };
  if (typeof module !== 'undefined') module.exports = MX;
})(typeof window !== 'undefined' ? window : globalThis);
