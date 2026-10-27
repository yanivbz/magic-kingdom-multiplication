/* Read-aloud ("הקראה"): a speaker button next to every meaningful text block.
   Uses only the browser's Web Speech API (speechSynthesis) with the best he-IL female voice available
   (Carmit / Hila / Google עברית …), rate 0.9, pitch 1.1. No voice on the device -> no buttons are shown.
   The spoken form of a text (numbers -> Hebrew words with gender, × -> "כפול", = -> "שווה" …) is built here. */
(function () {
  const S = {};
  K.speech = S;

  /* ====================================================================== spoken form */
  const F1 = ['אפס', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר'];
  const M1 = ['אפס', 'אחד', 'שניים', 'שלושה', 'ארבעה', 'חמישה', 'שישה', 'שבעה', 'שמונה', 'תשעה', 'עשרה'];
  const FT = ['עשר', 'אחת עשרה', 'שתים עשרה', 'שלוש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה'];
  const MT = ['עשרה', 'אחד עשר', 'שנים עשר', 'שלושה עשר', 'ארבעה עשר', 'חמישה עשר', 'שישה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר'];
  const TENS = ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים'];
  const HUND = ['', 'מאה', 'מאתיים', 'שלוש מאות', 'ארבע מאות', 'חמש מאות', 'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות'];
  const CONSTRUCT = ['', '', 'שני', 'שלושת', 'ארבעת', 'חמשת', 'ששת', 'שבעת', 'שמונת', 'תשעת', 'עשרת'];
  function words(n, fem) {
    if (n <= 10) return (fem ? F1 : M1)[n];
    if (n < 20) return (fem ? FT : MT)[n - 10];
    if (n < 100) { const t = Math.floor(n / 10), u = n % 10; return TENS[t] + (u ? ' ו' + (fem ? F1 : M1)[u] : ''); }
    if (n < 1000) {
      const r = n % 100, hd = HUND[Math.floor(n / 100)];
      if (!r) return hd;
      return hd + (r >= 20 && r % 10 ? ' ' : ' ו') + words(r, fem);
    }
    return String(n).split('').map(d => F1[+d]).join(' ');
  }
  const NOUNS = { // singular nouns we use after a number ("שורה אחת"); plurals are detected by their ending
    שורה: 'f', קבוצה: 'f', צנצנת: 'f', כפית: 'f', קפיצה: 'f', שקית: 'f', עוגייה: 'f', אצבע: 'f', יד: 'f', מגש: 'm', עיגול: 'm', כוכב: 'm', חבר: 'm', בלון: 'm',
    ארנב: 'm', סל: 'm', גזר: 'm', דג: 'm', תפוח: 'm', פרח: 'm', תות: 'm', אשכול: 'm', אקווריום: 'm', מטבע: 'm', יום: 'm', פעם: 'f', מספר: 'm'
  };
  const NOT_NOUNS = new Set(['נותנים', 'מקבלים', 'יוצאים', 'מתקבלים', 'מסתיימים', 'אומרים', 'סופרים', 'מוסיפים', 'מחברים', 'שווים', 'קופצים', 'נראים', 'הולכים', 'מופיעים', 'באים', 'עושים']);
  const FEM_EXC = new Set(['פעמים', 'שנים', 'שעות', 'דקות', 'ידיים']);
  const MASC_EXC = new Set(['מגשי', 'סלי', 'מטבעות', 'ימים', 'חודשים', 'שבועות']);
  /* gender of the noun that follows a number; null = no noun → abstract number (feminine, as taught in school) */
  function nounGender(w) {
    if (!w || NOT_NOUNS.has(w)) return null;
    if (NOUNS[w]) return NOUNS[w];
    if (FEM_EXC.has(w)) return 'f';
    if (MASC_EXC.has(w)) return 'm';
    if (/ים$/.test(w) && w.length > 3) return 'm';
    if (/ות$/.test(w) && w.length > 3) return 'f';
    return null;
  }
  function numPhrase(n, rest) {
    const adjacent = /^\s*[\u05D0-\u05EA]/.test(rest);
    const nx = adjacent ? rest.match(/^\s*([\u05D0-\u05EA]+)/)[1] : null;
    const g = adjacent ? nounGender(nx) : null;
    if (n === 2 && nx === 'פעמים') return { t: 'פעמיים', eat: true };
    if (g === null) return { t: words(n, true) };
    if (n === 1) return { t: '', post: g === 'f' ? 'אחת' : 'אחד', eat: true };   // "שורה אחת"
    if (n === 2) return { t: g === 'f' ? 'שתי' : 'שני' };
    return { t: words(n, g === 'f') };
  }

  function normalize(t) {
    t = t.replace(/על\s*\+/g, 'על הפלוס');
    t = t.replace(/[\u2190-\u21FF\u2600-\u27BF\u2B00-\u2BFF★☆]/g, ' ');
    t = t.replace(/\p{Extended_Pictographic}\uFE0F?|[\u200d\uFE0F✓✔•↻↺→←⬆⬇🔥]/gu, ' ');
    t = t.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '');
    t = t.replace(/[‹›·]/g, ', ');
    t = t.replace(/×/g, ' כפול ').replace(/\s=\s|=/g, ' שווה ').replace(/\s\+\s|\+/g, ' ועוד ').replace(/[−–—]/g, ', ');
    t = t.replace(/(\d+)%/g, '$1 אחוז');
    // "ל-5 האקווריומים" → construct form  ("מ-3 האקווריומים" → "משלושת האקווריומים")
    t = t.replace(/([בלמ])-(\d+)\s+ה/g, (m, p, d) => { const n = +d; return n >= 2 && n <= 10 ? p + CONSTRUCT[n] + ' ה' : m; });
    // numbers with an optional one-letter prefix:  ה-5, ב-10, 7
    let out = '', i = 0;
    const re = /([והבלמכש]-?)?(\d+)/g; let m;
    while ((m = re.exec(t))) {
      let pre = m[1] || '';
      if (pre && !pre.endsWith('-') && m.index > 0 && /[\u05D0-\u05EA]/.test(t[m.index - 1])) pre = ''; // letter belongs to a word
      const start = m.index + (m[1] ? m[1].length - pre.length : 0);
      const rest = t.slice(m.index + m[0].length);
      const p = numPhrase(+m[2], rest);
      let rep = pre.replace('-', '') + p.t;
      let consumed = 0;
      if (p.eat) { // "1 שורה" -> "שורה אחת",  "2 פעמים" -> "פעמיים"
        const w = rest.match(/^\s*([\u05D0-\u05EA]+)/);
        rep = pre.replace('-', '') + (p.post ? w[1] + ' ' + p.post : p.t); consumed = w[0].length;
      }
      out += t.slice(i, start) + rep; i = m.index + m[0].length + consumed; re.lastIndex = i;
    }
    t = out + t.slice(i);
    t = t.replace(/(^|[\s,.:;!(])\?(?=$|[\s,.:;!)])/g, '$1כמה'); // "= ?"  →  "שווה כמה"
    return t;
  }

  /* DOM → plain text, skipping buttons / hidden / nested blocks that have their own speaker */
  const NESTED = '.recap li > span:first-child, .spk, button, .btn, svg, .sr, .noread, [aria-hidden="true"], script, style, input, .arr-count, .picker, .stepper';
  const BLOCKISH = /^(P|DIV|LI|UL|OL|H1|H2|H3|H4|TR|SECTION|HEADER|FIGCAPTION|SMALL)$/;
  function rawText(root, nestedSel) {
    let out = '';
    (function walk(n) {
      if (n.nodeType === 3) { out += n.nodeValue; return; }
      if (n.nodeType !== 1) return;
      if (n !== root && (n.matches(NESTED) || (nestedSel && n.matches(nestedSel)))) return;
      if (n.tagName === 'BR') { out += '\n'; return; }
      const blk = n !== root && BLOCKISH.test(n.tagName);
      if (blk) out += '\n';
      for (const c of n.childNodes) walk(c);
      if (blk) out += '\n';
    })(root);
    return out;
  }
  /* text → array of sentences in spoken Hebrew */
  function sentencesOf(raw) {
    const lines = raw.split(/\n+/).map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const res = [];
    for (let line of lines) {
      line = normalize(line).replace(/\s+/g, ' ').replace(/\s+([,.!?:;])/g, '$1').replace(/^[,.\s]+/, '').trim();
      if (!/[\u05D0-\u05EA]/.test(line)) continue;
      if (!/[.!?…:]$/.test(line)) line += /(?:^|\s)כמה$/.test(line) ? '?' : '.';
      line = line.replace(/,\s*([.!?])/g, '$1').replace(/:$/, '.');
      // split into sentences, keep terminal punctuation
      const parts = line.match(/[^.!?…]+(?:[.!?…]+|$)/g) || [line];
      for (let p of parts) {
        p = p.trim().replace(/^[,.\s]+/, '');
        if (/[\u05D0-\u05EA]/.test(p)) res.push(p);
      }
    }
    return res;
  }
  S.normalize = normalize; S.sentencesOf = sentencesOf; S.rawText = rawText; S.words = words;

  /* ====================================================================== which blocks get a speaker */
  // pos: 'float' (inside the block, at the end corner) · 'head' (appended to the .fb-head row) · 'solo' (own row before the block)
  const DEFS = [
    { sel: '.qcard', pos: 'corner', prio: 5 },
    { sel: '.fb-in', pos: 'head', prio: 6 },
    { sel: '.hint-box', pos: 'float', prio: 2 },
    { sel: '.check-q', pos: 'float', prio: 4 },
    { sel: '.fb-line', pos: 'float', prio: 3 },
    { sel: '.bubble', pos: 'float', prio: 1 },
    { sel: '.trick-note', pos: 'float', prio: 0 },
    { sel: '.lead', pos: 'float', prio: 0 },
    { sel: '.tsheet .tip, .tsheet .muted', pos: 'float', prio: 0 },
    { sel: '.ex-head .sub, .pat-note, .det-cap, .det-twin', pos: 'float', prio: 0 },
    { sel: '.det-facts, .recap', pos: 'solo', prio: 0 },
    { sel: '.method-demo > p', pos: 'float', prio: 0 },
    { sel: '.res-note, .result .sub', pos: 'float', prio: 0 },
    { sel: '.result-msg, .reward-msg', pos: 'float', prio: 0 }
  ];
  const ALLSEL = DEFS.map(d => d.sel).join(',');
  const ROOTS = () => [document.getElementById('screen'), document.getElementById('overlay')].filter(Boolean);
  const spokenOf = el => sentencesOf(rawText(el, ALLSEL));
  S.spokenOf = spokenOf;

  /* ====================================================================== voices */
  let voice = null, voiceReady = false;
  const synth = window.speechSynthesis;
  function pickVoice() {
    if (!synth) return null;
    const vs = (synth.getVoices() || []).filter(v => /^(he|iw)([-_]|$)/i.test(v.lang));
    if (!vs.length) return null;
    const score = v => {
      const n = v.name || '';
      let s = 0;
      if (/carmit|כרמית/i.test(n)) s += 100;          // Apple (iOS / macOS) – female
      if (/hila|הילה/i.test(n)) s += 95;               // Microsoft – female
      if (/google/i.test(n) || /עברית/.test(n)) s += 80; // Google Hebrew (Android / Chrome) – female
      if (/female|woman|אישה/i.test(n)) s += 60;
      if (/asaf|אסף|male(?!.*fe)|man\b/i.test(n)) s -= 100; // known male voices
      if (/enhanced|premium|natural|neural/i.test(n)) s += 10;
      if (/^he[-_]IL$/i.test(v.lang)) s += 5;
      return s;
    };
    return vs.sort((a, b) => score(b) - score(a))[0];
  }
  function refreshVoices() { voice = pickVoice(); voiceReady = !!voice; updateAvailability(); }
  if (synth) { refreshVoices(); try { synth.addEventListener('voiceschanged', refreshVoices); } catch (e) { synth.onvoiceschanged = refreshVoices; } }

  function updateAvailability() {
    document.documentElement.classList.toggle('spk-off', !voiceReady);
  }

  /* ====================================================================== speaking */
  let curBtn = null, token = 0;
  function setState(btn, st) {
    if (!btn) return;
    btn.classList.toggle('speaking', st === 'speaking'); btn.classList.toggle('loading', st === 'loading');
    btn.setAttribute('aria-pressed', st ? 'true' : 'false');
    btn.setAttribute('aria-label', st ? 'עצירת ההקראה' : 'הקראה בקול');
  }
  function stop() {
    token++;
    if (synth && (synth.speaking || synth.pending)) { try { synth.cancel(); } catch (e) {} }
    if (curBtn) setState(curBtn, null);
    curBtn = null;
  }
  S.stop = stop;
  S.speaking = () => !!curBtn;
  S.voiceName = () => (voice ? voice.name : null);

  function utter(text, my) {
    return new Promise(res => {
      if (!synth || !voice || my !== token) return res();
      const u = new SpeechSynthesisUtterance(text); u.voice = voice; u.lang = voice.lang || 'he-IL'; u.rate = 0.9; u.pitch = 1.1; u.volume = 1;
      let done = false; const fin = () => { if (!done) { done = true; clearInterval(iv); clearTimeout(to); res(); } };
      u.onend = fin; u.onerror = fin;
      const iv = setInterval(() => { if (my !== token) fin(); }, 150);
      const to = setTimeout(fin, 4000 + text.length * 140); // some engines never fire onend
      try { synth.speak(u); } catch (e) { fin(); }
    });
  }
  async function speakSentences(btn, sents) {
    stop(); const my = token; curBtn = btn; setState(btn, 'speaking');
    if (!voice) { stop(); updateAvailability(); return; }
    try { synth.cancel(); synth.resume && synth.resume(); } catch (e) {}
    for (let i = 0; i < sents.length; i++) {          // one utterance per sentence: natural pauses, easy to interrupt
      if (my !== token) return;
      await utter(sents[i], my);
    }
    if (my === token) { setState(btn, null); curBtn = null; }
  }
  function toggle(btn) {
    if (curBtn === btn) return stop();
    const blk = btn._blk; if (!blk) return;
    const sents = spokenOf(blk); if (!sents.length) return;
    speakSentences(btn, sents);
  }
  S.toggle = toggle;

  /* ====================================================================== button injection */
  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="sp-body" d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500z" fill="currentColor"/><path class="sp-w sp-w1" d="M15.200 9.300a3.600 3.600 0 0 1 0 5.400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="sp-w sp-w2" d="M17.800 6.700a7.300 7.300 0 0 1 0 10.600" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const seen = new WeakSet(); let newBlocks = [];
  function makeBtn(blk) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'spk'; b.innerHTML = ICON; b._blk = blk;
    b.setAttribute('aria-label', 'הקראה בקול'); b.setAttribute('aria-pressed', 'false'); b.title = 'הקראה בקול';
    b.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); toggle(b); });
    return b;
  }
  function inject(blk, def) {
    const host = def.pos === 'head' ? (blk.querySelector('.fb-head') || blk) : blk;
    let b = blk._spk;
    if (b && b.isConnected) return b;
    b = blk._spk = makeBtn(blk); b.classList.add('spk-' + def.pos);
    if (def.pos === 'solo') blk.parentNode.insertBefore(b, blk);
    else if (def.pos === 'head') host.appendChild(b);
    else host.insertBefore(b, host.firstChild);
    if (def.pos === 'float') blk.classList.add('has-spk'); else if (def.pos === 'corner') blk.classList.add('has-spk-c');
    if (!seen.has(blk)) { seen.add(blk); newBlocks.push({ blk, def }); }
    return b;
  }
  let scanT = 0;
  function scheduleScan() { clearTimeout(scanT); scanT = setTimeout(scan, 60); }
  function scan() {
    if (curBtn && !curBtn.isConnected) stop();
    for (const root of ROOTS()) {
      for (const def of DEFS) {
        root.querySelectorAll(def.sel).forEach(blk => {
          if (blk.closest('.spk-skip')) return;
          const sents = spokenOf(blk);
          const has = blk._spk && blk._spk.isConnected;
          if (!sents.length) { if (has) blk._spk.remove(); return; }
          if (!has) inject(blk, def);
        });
      }
    }
    // auto-read: when new blocks appeared, read the most important one
    if (newBlocks.length) {
      const batch = newBlocks; newBlocks = [];
      if (K.store && K.store.state.settings.autoRead && !document.documentElement.classList.contains('spk-off')) {
        const best = batch.filter(x => x.blk.isConnected && x.def.prio > 0).sort((a, b) => b.def.prio - a.def.prio)[0]
          || batch.filter(x => x.blk.isConnected && x.blk.matches('.trick-note,.lead'))[0];
        if (best && best.blk._spk) { clearTimeout(autoT); autoT = setTimeout(() => { if (best.blk.isConnected && best.blk._spk && K.store.state.settings.autoRead) toggleIfIdle(best.blk._spk); }, 450); }
      }
    }
  }
  let autoT = 0;
  function toggleIfIdle(btn) { if (curBtn !== btn) toggle(btn); }
  S.scan = scan;

  function start() {
    const mo = new MutationObserver(muts => {
      for (const m of muts) { if (m.target.closest && m.target.closest('.spk')) continue; scheduleScan(); return; }
    });
    ROOTS().forEach(r => mo.observe(r, { childList: true, subtree: true, characterData: true }));
    window.addEventListener('hashchange', stop);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    window.addEventListener('pagehide', stop);
    scheduleScan(); updateAvailability();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

})();
