/* node tools/verify-math-exam.js — re-checks every answer of the teacher sheet and 3,000 generated items per topic. */
const fs = require('fs'), path = require('path');
const MX = require('../js/mx-gen.js');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/exams/math-geo-2026-12-20.json'), 'utf8'));
let bad = 0, n = 0;
const fail = (where, it) => { bad++; console.log('FAIL', where, JSON.stringify(it)); };
/* teacher sheet: each item verified by MX.verify + independent hand-written expectations */
const expect = {
  p1a1: 800, p1a2: 90, p1b1: 4621, p1b2: 8003, p2a1: 2243, p3c1: 40, p3c2: 1460, p3c3: 600, p3c4: 4700, p3c5: 3000, p3c6: 5000,
  p4a1: 800, p4a2: 2000, p5a1: 3773, p5a2: 6132, p5a3: 1834, p5b1: 1110, p5c1: 3825
};
for (const pg of data.teacherSheet.pages) for (const s of pg.sections) for (const it of s.items) {
  n++;
  if (!MX.verify(it)) fail('sheet ' + it.id, it);
  if (expect[it.id] != null && expect[it.id] !== it.ans) fail('expect ' + it.id, it);
  if (it.kind === 'toWords' && !(it.ans.every(w => it.tiles.includes(w)))) fail('tiles ' + it.id, it);
}
// worked examples printed in the sheet
const ex = [[4000 + 300 + 70 + 5, 4375], [1000 + 200 + 30 + 4, 1234], [MX.roundTo(2430, 100), 2400], [MX.roundTo(396, 100) + MX.roundTo(211, 100), 600], [3400 + 2300, 5700], [1358 + 2467, 3825], [8 + 7, 15], [5 + 6 + 1, 12], [3 + 4 + 1, 8], [1 + 2, 3]];
ex.forEach(([a, b], i) => { n++; if (a !== b) fail('example ' + i, [a, b]); });
// topic list example 4,512 = 4000 + 500 + 10 + 2
n++; if (4000 + 500 + 10 + 2 !== 4512) fail('topic example', 4512);
// number words: all 1..10000 round-trip
for (let k = 1; k <= 10000; k++) { if (MX.fromWords(MX.toWords(k)) !== k) { fail('words ' + k, MX.toWords(k)); break; } }
// rounding rule vs. string rule for every n and unit
for (let k = 0; k <= 10000; k++) for (const u of [10, 100, 1000]) {
  const s = String(k).padStart(5, '0'), pos = 5 - String(u).length; // index of digit after rounding place
  const d = +s[pos + 1], base = Math.floor(k / u) * u, exp = d >= 5 ? base + u : base;
  if (MX.roundTo(k, u) !== exp) { fail('round ' + k + '/' + u, exp); break; }
}
// generated items
const topicGens = data.topics.flatMap(t => t.groups.flatMap(g => g.items.map(i => i.gen)));
for (const g of topicGens) for (let k = 0; k < 3000; k++) {
  n++; const it = MX.gen(g);
  if (!MX.verify(it)) fail('gen ' + g, it);
  const nums = JSON.stringify(it).match(/\d{5,}/g); if (nums && nums.some(x => +x > 10000)) fail('range ' + g, it);
  if (it.kind === 'toWords' && it.tiles.filter(w => it.ans.includes(w)).length !== it.ans.length) fail('tiles ' + g, it);
  if (it.kind === 'estimate' && new Set(it.options).size !== 3) fail('opts ' + g, it);
  if (it.kind === 'cmp' && it.a === it.b) fail('cmp same', it);
}
console.log(`checked ${n} items + words 1..10000 + rounding table; failures: ${bad}`);
process.exit(bad ? 1 : 0);
