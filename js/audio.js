/* Sound effects (WebAudio, synthesized – no files) + haptics. */
K.audio = (function () {
  let ctx = null, master = null;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, t0, dur, { type = 'sine', vol = 0.3, slideTo = null, attack = 0.01 } = {}) {
    const c = ensure(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + t0 + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(g); g.connect(master);
    o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
  }
  const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G4: 392, E4: 329.63, C4: 261.63 };
  const sfx = {
    tap()    { tone(620, 0, 0.07, { type: 'triangle', vol: 0.18 }); },
    pop()    { tone(300, 0, 0.12, { type: 'sine', vol: 0.3, slideTo: 700 }); },
    dot(i)   { tone(440 + (i || 0) * 38, 0, 0.1, { type: 'sine', vol: 0.16 }); },
    right()  { [N.C5, N.E5, N.G5].forEach((f, i) => tone(f, i * 0.08, 0.22, { type: 'triangle', vol: 0.28 })); },
    wrong()  { tone(330, 0, 0.18, { type: 'sine', vol: 0.2 }); tone(262, 0.14, 0.28, { type: 'sine', vol: 0.2 }); },
    coin()   { tone(N.E6, 0, 0.08, { type: 'square', vol: 0.08 }); tone(N.E6 * 1.26, 0.07, 0.2, { type: 'square', vol: 0.08 }); },
    star()   { [N.G5, N.C6, N.E6].forEach((f, i) => tone(f, i * 0.1, 0.3, { type: 'triangle', vol: 0.28 })); },
    unlock() { [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => tone(f, i * 0.09, 0.35, { type: 'triangle', vol: 0.26 })); },
    fanfare(){ [[N.C5,0],[N.C5,.12],[N.C5,.24],[N.G5,.36],[N.E5,.55],[N.G5,.7],[N.C6,.9]].forEach(([f,t]) => tone(f, t, 0.3, { type: 'triangle', vol: 0.3 })); },
    whoosh() { tone(200, 0, 0.25, { type: 'sawtooth', vol: 0.05, slideTo: 900 }); },
    buy()    { [N.G5, N.C6].forEach((f, i) => tone(f, i * 0.07, 0.18, { type: 'triangle', vol: 0.25 })); }
  };
  const vib = {
    tap: 8, right: [18, 40, 28], wrong: [30], star: [20, 40, 20, 40, 60], coin: 12, fanfare: [30, 50, 30, 50, 90], buy: [15, 30, 15]
  };
  return {
    unlock: ensure,
    play(name, arg) {
      if (K.store && !K.store.state.settings.sound) { /* muted */ }
      else if (sfx[name]) { try { sfx[name](arg); } catch (e) {} }
      if (K.store && K.store.state.settings.haptics && vib[name] && navigator.vibrate) { try { navigator.vibrate(vib[name]); } catch (e) {} }
    }
  };
})();
