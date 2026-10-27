/* Custom SVG art: characters, icons, kingdom map, castle home. */
K.art = (function () {
  const INK = '#2a2150';

  function face(mood, my, noseless) {
    const eye = (x, pdx = 0, pdy = 0) => `<ellipse cx="${x}" cy="92" rx="7.5" ry="9.5" fill="${INK}"/><circle cx="${x + 2.6 + pdx}" cy="${88 + pdy}" r="3" fill="#fff"/><circle cx="${x - 2.5 + pdx}" cy="${96 + pdy}" r="1.4" fill="#fff" opacity=".85"/>`;
    const arc = x => `<path d="M${x - 8} 95 Q${x} 82 ${x + 8} 95" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
    const brow = d => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`;
    let eyes, mouth = '', brows = '';
    if (mood === 'cheer') {
      eyes = arc(76) + arc(124);
      mouth = `<path d="M87 ${my - 1} Q100 ${my + 28} 113 ${my - 1} Z" fill="#8a1f45"/><ellipse cx="100" cy="${my + 12}" rx="8" ry="5" fill="#ff7a9a"/>`;
    } else if (mood === 'think') {
      eyes = `<g class="eyes">${eye(76, 3, -3)}${eye(124, 3, -3)}</g>`;
      brows = brow('M65 76 Q76 68 87 75') + brow('M113 78 Q124 76 135 80');
      mouth = `<path d="M92 ${my + 4} Q99 ${my - 1} 108 ${my + 3}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    } else if (mood === 'oops') {
      eyes = `<g class="eyes">${eye(76)}${eye(124)}</g>`;
      brows = brow('M65 79 Q76 74 87 68') + brow('M113 68 Q124 74 135 79');
      mouth = `<path d="M91 ${my + 6} Q100 ${my} 109 ${my + 6}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    } else { // happy
      eyes = `<g class="eyes">${eye(76)}${eye(124)}</g>`;
      mouth = `<path d="M90 ${my} Q100 ${my + 12} 110 ${my}" fill="none" stroke="${INK}" stroke-width="3.8" stroke-linecap="round"/>`;
    }
    const cheeks = `<circle cx="58" cy="108" r="8.5" fill="#ff8fa3" opacity=".42"/><circle cx="142" cy="108" r="8.5" fill="#ff8fa3" opacity=".42"/>`;
    return `<g class="face">${cheeks}${eyes}${brows}${noseless ? '' : ''}${mouth}</g>`;
  }

  function char(id, mood = 'happy', label) {
    const nm = (K.CHARACTERS[id] || {}).name || '';
    const open = `<svg class="char char-${id} mood-${mood}" viewBox="0 0 200 230" role="img" aria-label="${label || nm}" xmlns="http://www.w3.org/2000/svg">`;
    const shadow = `<ellipse cx="100" cy="222" rx="54" ry="7" fill="${INK}" opacity=".13"/>`;
    if (id === 'bear') return open + `<defs>
      <radialGradient id="bearF" cx=".38" cy=".28" r=".85"><stop offset="0" stop-color="#e8b384"/><stop offset="1" stop-color="#b9774a"/></radialGradient></defs>${shadow}
      <g class="body">
        <ellipse cx="76" cy="211" rx="23" ry="12" fill="#a86c3c"/><ellipse cx="124" cy="211" rx="23" ry="12" fill="#a86c3c"/>
        <ellipse cx="76" cy="212" rx="12" ry="6" fill="#f6dcb8" opacity=".8"/><ellipse cx="124" cy="212" rx="12" ry="6" fill="#f6dcb8" opacity=".8"/>
        <g class="arm arm-r"><ellipse cx="146" cy="172" rx="14" ry="26" transform="rotate(-18 146 172)" fill="url(#bearF)"/></g>
        <ellipse cx="100" cy="170" rx="47" ry="49" fill="url(#bearF)"/><ellipse cx="100" cy="180" rx="30" ry="33" fill="#f8e2c3"/>
        <g class="arm arm-l"><ellipse cx="54" cy="172" rx="14" ry="26" transform="rotate(18 54 172)" fill="url(#bearF)"/></g>
        <path d="M66 138 Q100 156 134 138 L136 152 Q100 170 64 152 Z" fill="#ff5a6e"/><path d="M118 150 l14 30 l-14 4 z" fill="#e8465a"/>
      </g>
      <g class="head">
        <circle cx="48" cy="50" r="20" fill="#b9774a"/><circle cx="48" cy="52" r="10.5" fill="#f3a9a0"/>
        <circle cx="152" cy="50" r="20" fill="#b9774a"/><circle cx="152" cy="52" r="10.5" fill="#f3a9a0"/>
        <ellipse cx="100" cy="92" rx="61" ry="55" fill="url(#bearF)"/>
        <ellipse cx="100" cy="112" rx="27" ry="21" fill="#f8e2c3"/>
        ${face(mood, 117)}
        <ellipse cx="100" cy="103" rx="10" ry="7" fill="#4a2c1d"/><ellipse cx="97" cy="101" rx="3.5" ry="1.8" fill="#fff" opacity=".6"/>
      </g></svg>`;
    if (id === 'puppy') return open + `<defs>
      <radialGradient id="pupF" cx=".38" cy=".28" r=".85"><stop offset="0" stop-color="#f9d392"/><stop offset="1" stop-color="#e9a94f"/></radialGradient></defs>${shadow}
      <g class="body">
        <path class="tail" d="M142 190 Q176 176 168 148" fill="none" stroke="#e9a94f" stroke-width="14" stroke-linecap="round"/>
        <ellipse cx="76" cy="211" rx="23" ry="12" fill="#e0993d"/><ellipse cx="124" cy="211" rx="23" ry="12" fill="#e0993d"/>
        <ellipse cx="76" cy="212" rx="12" ry="6" fill="#fff6e8" opacity=".9"/><ellipse cx="124" cy="212" rx="12" ry="6" fill="#fff6e8" opacity=".9"/>
        <g class="arm arm-r"><ellipse cx="146" cy="172" rx="13" ry="26" transform="rotate(-18 146 172)" fill="url(#pupF)"/></g>
        <ellipse cx="100" cy="170" rx="46" ry="49" fill="url(#pupF)"/><ellipse cx="100" cy="182" rx="29" ry="33" fill="#fff6e8"/>
        <g class="arm arm-l"><ellipse cx="54" cy="172" rx="13" ry="26" transform="rotate(18 54 172)" fill="url(#pupF)"/></g>
        <path d="M64 140 Q100 158 136 140 L135 152 Q100 168 65 152 Z" fill="#4db3ff"/><circle cx="100" cy="162" r="8" fill="#ffc83d" stroke="#e29b00" stroke-width="2"/>
      </g>
      <g class="head">
        <g class="ear ear-l"><ellipse cx="45" cy="88" rx="19" ry="38" transform="rotate(14 45 88)" fill="#b9733a"/></g>
        <g class="ear ear-r"><ellipse cx="155" cy="88" rx="19" ry="38" transform="rotate(-14 155 88)" fill="#b9733a"/></g>
        <ellipse cx="100" cy="92" rx="58" ry="54" fill="url(#pupF)"/>
        <path d="M88 40 Q100 30 112 40 L109 80 Q100 86 91 80 Z" fill="#fff6e8"/>
        <circle cx="124" cy="92" r="19" fill="#b9733a" opacity=".85"/>
        <ellipse cx="100" cy="114" rx="29" ry="20" fill="#fff6e8"/>
        ${face(mood, 117)}
        ${mood === 'oops' ? '' : '<path d="M95 124 Q100 140 106 124 Z" fill="#ff7a9a"/>'}
        <ellipse cx="100" cy="103" rx="11" ry="7.5" fill="${INK}"/><ellipse cx="96.5" cy="101" rx="3.8" ry="1.9" fill="#fff" opacity=".6"/>
      </g></svg>`;
    // princess
    return open + `<defs>
      <linearGradient id="prH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c0652e"/><stop offset="1" stop-color="#8b4524"/></linearGradient>
      <linearGradient id="prD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9ccb"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient>
      <linearGradient id="prC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd966"/><stop offset="1" stop-color="#ffb11f"/></linearGradient></defs>${shadow}
      <g class="body">
        <path d="M38 96 Q22 176 46 206 L154 206 Q178 176 162 96 Z" fill="url(#prH)"/>
        <ellipse cx="82" cy="212" rx="14" ry="8" fill="#e0457f"/><ellipse cx="118" cy="212" rx="14" ry="8" fill="#e0457f"/>
        <g class="arm arm-r"><ellipse cx="152" cy="176" rx="9" ry="22" transform="rotate(-20 152 176)" fill="#ffdcbc"/><circle cx="148" cy="158" r="14" fill="url(#prD)"/></g>
        <path d="M70 140 Q100 150 130 140 L162 212 Q100 226 38 212 Z" fill="url(#prD)"/>
        <path d="M76 150 Q100 158 124 150 L128 162 Q100 172 72 162 Z" fill="#ffc83d"/>
        <path d="M58 196 Q100 206 142 196" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" opacity=".85"/>
        <path d="M100 176 l4 9 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1 z" fill="#fff" opacity=".9"/>
        <g class="arm arm-l"><ellipse cx="48" cy="176" rx="9" ry="22" transform="rotate(20 48 176)" fill="#ffdcbc"/><circle cx="52" cy="158" r="14" fill="url(#prD)"/></g>
      </g>
      <g class="head">
        <ellipse cx="100" cy="95" rx="56" ry="52" fill="#ffdcbc"/>
        <path d="M43 96 Q40 36 100 34 Q160 36 157 96 Q144 64 120 60 Q100 76 80 60 Q56 66 43 96 Z" fill="url(#prH)"/>
        <path d="M43 96 Q36 120 46 150 Q52 120 58 96 Z" fill="url(#prH)"/><path d="M157 96 Q164 120 154 150 Q148 120 142 96 Z" fill="url(#prH)"/>
        ${face(mood, 119)}
        <ellipse cx="100" cy="106" rx="3.2" ry="2.2" fill="#e8a98a"/>
        <path d="M68 44 L72 18 L88 32 L100 10 L112 32 L128 18 L132 44 Q100 52 68 44 Z" fill="url(#prC)" stroke="#e29b00" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="100" cy="30" r="5" fill="#ff5fa2"/><circle cx="76" cy="38" r="3.4" fill="#4db3ff"/><circle cx="124" cy="38" r="3.4" fill="#4db3ff"/>
      </g></svg>`;
  }

  const I = {
    coin: `<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="#ffb81f"/><circle cx="16" cy="16" r="14" fill="none" stroke="#e08a00" stroke-width="2"/><circle cx="16" cy="16" r="9.5" fill="#ffd966" stroke="#e8a000" stroke-width="1.5"/><path d="M16 9.5l2 4.2 4.6.6-3.4 3.2.9 4.5-4.1-2.3-4.1 2.3.9-4.5-3.4-3.2 4.6-.6z" fill="#ffb81f"/></svg>`,
    flame: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2c1 6 8 9 8 17a8 8 0 0 1-16 0c0-4 2-6 3-8 1 2 2 3 3 3 1-4 1-8 2-12z" fill="#ff7a3d"/><path d="M16 14c.6 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-2 1-3 1.600-4 .6 1 1.200 1.500 1.800 1.500.6-2 .6-4 .6-6z" fill="#ffd34d"/></svg>`,
    star: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.500l4.100 8.400 9.200 1.300-6.700 6.500 1.600 9.200L16 23.500l-8.200 4.400 1.600-9.200-6.700-6.500 9.200-1.300z" fill="#ffc41f" stroke="#e8920c" stroke-width="1.600" stroke-linejoin="round"/></svg>`,
    starOff: `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.500l4.100 8.400 9.200 1.300-6.700 6.500 1.600 9.200L16 23.500l-8.200 4.400 1.600-9.200-6.700-6.500 9.200-1.300z" fill="#e7e1f5" stroke="#cfc6e8" stroke-width="1.600" stroke-linejoin="round"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.500" y="10.500" width="15" height="11" rx="3" fill="#8b82b3"/><path d="M8 10.500V8a4 4 0 0 1 8 0v2.500" fill="none" stroke="#8b82b3" stroke-width="2.600" stroke-linecap="round"/></svg>`,
    sound: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500z" fill="currentColor"/><path d="M15.500 8.500a5 5 0 0 1 0 7M18 6a8.500 8.500 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    mute: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500z" fill="currentColor"/><path d="M16 9.500l5 5M21 9.500l-5 5" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"/></svg>`,
    gear: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.500a3.500 3.500 0 1 0 0 7 3.500 3.500 0 0 0 0-7zm8.500 4.500l-1.900-.4a6.800 6.800 0 0 0-.7-1.700l1.100-1.600-1.800-1.800-1.600 1.100a6.800 6.800 0 0 0-1.700-.7L13.500 5.800h-3l-.4 1.900c-.6.200-1.200.4-1.700.7L6.800 7.300 5 9.100l1.100 1.600c-.3.500-.5 1.100-.7 1.700l-1.900.4v3l1.900.4c.2.600.4 1.200.7 1.700L5 18.500l1.800 1.800 1.600-1.100c.5.300 1.100.5 1.700.7l.4 1.900h3l.4-1.900c.6-.2 1.200-.4 1.700-.7l1.600 1.100 1.800-1.800-1.100-1.600c.3-.5.500-1.100.7-1.700l1.900-.4z" fill="currentColor" opacity=".9" transform="translate(0 -1.500) scale(1)"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>`,
    map: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.500l6-2.500 6 2.500 6-2.500v13.500l-6 2.500-6-2.500-6 2.500z" fill="currentColor" opacity=".25"/><path d="M3 6.500l6-2.500 6 2.500 6-2.500v13.500l-6 2.500-6-2.500-6 2.500zM9 4v13.500M15 6.500V20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.500" y="3.500" width="17" height="17" rx="3" fill="currentColor" opacity=".2"/><path d="M3.500 9.500h17M3.500 15h17M9.500 3.500v17M15 3.500v17" stroke="currentColor" stroke-width="2"/><rect x="3.500" y="3.500" width="17" height="17" rx="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    book: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6.500C10 5 7 4.500 4 5v13c3-.5 6 0 8 1.500 2-1.500 5-2 8-1.500V5c-3-.5-6 0-8 1.500z" fill="currentColor" opacity=".22"/><path d="M12 6.500C10 5 7 4.500 4 5v13c3-.5 6 0 8 1.500 2-1.500 5-2 8-1.500V5c-3-.5-6 0-8 1.500zM12 6.500v13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
    home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4.500v-6h-5v6H5a1 1 0 0 1-1-1z" fill="currentColor" opacity=".22" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
    close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
    back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    bulb: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6.500 6.500 0 0 0-3.800 11.800c.6.500 1 1.200 1 2V18h5.600v-1.200c0-.8.400-1.500 1-2A6.500 6.500 0 0 0 12 3z" fill="#ffd34d" stroke="#e8a000" stroke-width="1.600"/><path d="M9.500 21h5" stroke="#e8a000" stroke-width="2" stroke-linecap="round"/></svg>`,
    check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.500l4.500 4.500L19 7.500" fill="none" stroke="currentColor" stroke-width="3.400" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    del: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linejoin="round"/><path d="M12.500 9.500l5 5M17.500 9.500l-5 5" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"/></svg>`
  };

  /* honey jar for the "what is multiplication" story */
  const jar = (n) => `<svg class="jar" viewBox="0 0 60 70" aria-hidden="true"><defs><linearGradient id="jg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffc233"/><stop offset=".5" stop-color="#ffd966"/><stop offset="1" stop-color="#f5a30f"/></linearGradient></defs>
    <rect x="14" y="4" width="32" height="12" rx="4" fill="#9a5b2d"/><rect x="12" y="12" width="36" height="6" rx="3" fill="#b8733a"/>
    <path d="M10 24a10 10 0 0 1 10-8h20a10 10 0 0 1 10 8v32a12 12 0 0 1-12 12H22a12 12 0 0 1-12-12z" fill="url(#jg)" stroke="#d9890a" stroke-width="2"/>
    <rect x="17" y="34" width="26" height="20" rx="6" fill="#fff6dc"/><path d="M30 38.500l2 4 4.400.6-3.200 3 .8 4.400-4-2.200-4 2.200.8-4.400-3.200-3 4.400-.6z" fill="#ffb81f"/>
    <path d="M12 22q4 6 6 0t6 0 6 0 6 0 6 0 6 0v2H12z" fill="#ffe08a" opacity=".9"/></svg>`;

  /* ---------- kingdom map ---------- */
  const MAP = { w: 400, h: 900 };
  const NODES = { gate: [200, 855], 2: [115, 770], 5: [270, 712], 10: [125, 652], 3: [270, 560], 4: [120, 496], 6: [272, 388], 7: [122, 328], 8: [265, 268], 9: [200, 172] };
  function smoothPath(pts) {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
    }
    return d;
  }
  const tree = (x, y, s = 1, c = '#2f9e5a') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="0" width="6" height="12" rx="2" fill="#8a5a33"/><path d="M0-34L16-8H-16z" fill="${c}"/><path d="M0-24L19 4H-19z" fill="${c}"/><path d="M0-24L19 4H-19z" fill="#fff" opacity=".07"/></g>`;
  const cloud = (x, y, s = 1, o = 1) => `<g class="cloud" transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="34" ry="14" fill="#fff"/><ellipse cx="-16" cy="-8" rx="18" ry="14" fill="#fff"/><ellipse cx="10" cy="-12" rx="22" ry="16" fill="#fff"/></g>`;
  const flower = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M0 0v10" stroke="#3a9b52" stroke-width="2"/><circle cx="0" cy="-2" r="3.500" fill="${c}"/><circle cx="0" cy="-2" r="1.400" fill="#fff6a8"/><circle cx="-4" cy="-4" r="2.600" fill="${c}"/><circle cx="4" cy="-4" r="2.600" fill="${c}"/><circle cx="0" cy="-7" r="2.600" fill="${c}"/></g>`;
  const crystal = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-30L10-8 0 6-10-8z" fill="${c}"/><path d="M0-30L10-8 0-6z" fill="#fff" opacity=".35"/></g>`;

  function mapScene() {
    const path = smoothPath([NODES.gate, NODES[2], NODES[5], NODES[10], NODES[3], NODES[4], NODES[6], NODES[7], NODES[8], NODES[9]]);
    let flowers = '', trees = '', crystals = '';
    const fc = ['#ff6fae', '#ffd34d', '#ffffff', '#b78cff', '#ff8f3d'];
    for (let i = 0; i < 26; i++) { const x = (i * 83 + 40) % 380 + 10, y = 440 + ((i * 47) % 150); flowers += flower(x, y, fc[i % 5]); }
    [[30, 640], [370, 660], [60, 700], [350, 740], [40, 790], [380, 800], [180, 700], [210, 790], [20, 590], [380, 600], [300, 770], [90, 610]].forEach(([x, y], i) => trees += tree(x, y, .8 + (i % 3) * .18, i % 2 ? '#2f9e5a' : '#3bb36b'));
    [[40, 340, 1.1, '#6ee7ff'], [360, 330, 1.3, '#ff9ccb'], [70, 270, .9, '#b78cff'], [345, 410, 1, '#6ee7ff'], [30, 420, .8, '#ff9ccb'], [385, 250, .9, '#b78cff']].forEach(([x, y, s, c]) => crystals += crystal(x, y, s, c));
    const ribbon = (y, txt, locked) => `<g transform="translate(200 ${y})" class="ribbon${locked ? ' is-locked' : ''}"><path d="M-84-17h168l-10 17 10 17h-168l10-17z" fill="${locked ? '#9d94c4' : '#7a4dff'}"/><path d="M-84 17h168v4h-168z" fill="#000" opacity=".12"/><text y="${locked ? 5 : 6}" text-anchor="middle" font-size="${locked ? 14 : 17}" font-weight="700" fill="#fff" font-family="Rubik,sans-serif">${locked ? txt + ' · בקרוב' : txt}</text></g>`;
    const lockedCls = id => (K.AREAS.find(a => a.id === id).tables.some(t => K.TABLES[t].ready) ? '' : ' region-locked');
    return `<svg class="map-svg" viewBox="0 0 ${MAP.w} ${MAP.h}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <defs>
      <linearGradient id="mSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8ff"/><stop offset=".22" stop-color="#cdeaff"/><stop offset=".36" stop-color="#ffe9f4"/><stop offset=".5" stop-color="#d9f3b8"/><stop offset=".8" stop-color="#9edc8a"/><stop offset="1" stop-color="#6fc47c"/></linearGradient>
      <linearGradient id="mMtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9a6ff"/><stop offset="1" stop-color="#8d78e6"/></linearGradient>
      <radialGradient id="mSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#fff7c2" stop-opacity="0"/></radialGradient>
      <linearGradient id="mRoof" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9b6bff"/><stop offset="1" stop-color="#6c3fe0"/></linearGradient>
    </defs>
    <rect width="400" height="900" fill="url(#mSky)"/>
    <circle cx="330" cy="60" r="70" fill="url(#mSun)"/><circle cx="330" cy="60" r="22" fill="#fff3a6"/>
    ${cloud(70, 70, 1.1, .9)}${cloud(190, 205, .8, .8)}${cloud(330, 150, 1, .85)}${cloud(40, 400, .8, .7)}
    <g class="region region-castle${lockedCls('castle')}">
      <path d="M0 215Q100 190 200 205T400 195V260H0z" fill="#e9dcff"/>
      <g transform="translate(200 18)">
        <rect x="-60" y="60" width="120" height="100" rx="6" fill="#ffd3e6"/><rect x="-100" y="80" width="42" height="80" rx="5" fill="#ffc2dc"/><rect x="58" y="80" width="42" height="80" rx="5" fill="#ffc2dc"/>
        <path d="M-70 62L0 8 70 62z" fill="url(#mRoof)"/><path d="M-108 82L-79 38-50 82z" fill="url(#mRoof)"/><path d="M50 82L79 38 108 82z" fill="url(#mRoof)"/>
        <path d="M0 8V-14" stroke="#8a5a33" stroke-width="3"/><path d="M0-14l22 7-22 7z" fill="#ff5a6e"/>
        <rect x="-8" y="86" width="16" height="22" rx="8" fill="#6c3fe0" opacity=".85"/><rect x="-92" y="98" width="12" height="18" rx="6" fill="#6c3fe0" opacity=".7"/><rect x="80" y="98" width="12" height="18" rx="6" fill="#6c3fe0" opacity=".7"/>
        <path d="M-60 160V120M60 160V120" stroke="#fff" opacity=".4" stroke-width="3"/>
      </g>
    </g>
    <g class="region region-mountain${lockedCls('mountain')}">
      <path d="M-10 420L60 290 120 360 190 250 260 350 320 270 410 410V440H-10z" fill="url(#mMtn)"/>
      <path d="M190 250l-26 38 14-8 12 12 12-12 14 8z" fill="#fff" opacity=".9"/><path d="M60 290l-18 28 10-6 8 8 8-8 8 6z" fill="#fff" opacity=".9"/><path d="M320 270l-18 28 10-6 8 8 8-8 8 6z" fill="#fff" opacity=".9"/>
      ${crystals}
    </g>
    <g class="region region-meadow${lockedCls('meadow')}">
      <path d="M-10 440Q100 410 200 440T410 430V640H-10z" fill="#b5ea8d"/>
      <path d="M-10 540Q120 505 230 540T410 520V640H-10z" fill="#a4e07d"/>
      <path d="M60 520A100 100 0 0 1 340 520" fill="none" stroke="#ff6f8e" stroke-width="7" opacity=".55"/><path d="M68 520A92 92 0 0 1 332 520" fill="none" stroke="#ffd34d" stroke-width="7" opacity=".55"/><path d="M76 520A84 84 0 0 1 324 520" fill="none" stroke="#6ee7b7" stroke-width="7" opacity=".55"/><path d="M84 520A76 76 0 0 1 316 520" fill="none" stroke="#6bb8ff" stroke-width="7" opacity=".55"/>
      ${flowers}
    </g>
    <g class="region region-forest${lockedCls('forest')}">
      <path d="M-10 630Q110 600 210 630T410 620V900H-10z" fill="#77cf80"/>
      <path d="M-10 740Q120 705 230 740T410 725V900H-10z" fill="#62c06f"/>
      ${trees}
      <g transform="translate(330 700)"><ellipse cx="0" cy="6" rx="26" ry="6" fill="#000" opacity=".1"/><rect x="-6" y="-26" width="12" height="32" fill="#8a5a33"/><ellipse cx="0" cy="-30" rx="24" ry="22" fill="#ffc233"/><path d="M-20-34q20 10 40 0" stroke="#d9890a" stroke-width="2" fill="none"/><path d="M-14-24q14 8 28 0" stroke="#d9890a" stroke-width="2" fill="none"/><circle cx="0" cy="-12" r="5" fill="#6b3d1a"/></g>
    </g>
    <g transform="translate(200 822)"><rect x="-70" y="0" width="30" height="62" rx="4" fill="#d9cfff"/><rect x="40" y="0" width="30" height="62" rx="4" fill="#d9cfff"/><path d="M-76 2L-55-22-34 2z" fill="url(#mRoof)"/><path d="M34 2L55-22 76 2z" fill="url(#mRoof)"/><path d="M-40 20Q0-18 40 20" fill="none" stroke="#b9a6ff" stroke-width="10" stroke-linecap="round"/></g>
    <path d="${path}" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
    <path d="${path}" fill="none" stroke="#fff6dc" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${path}" fill="none" stroke="#e6c98a" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>
    ${ribbon(600, 'יער הדבש', false)}${ribbon(448, 'אחו הפרפרים', true)}${ribbon(222, 'הר הגבישים', true)}${ribbon(24, 'טירת הכוכבים', true)}
  </svg>`;
  }

  /* ---------- castle home ---------- */
  const ITEMS = {
    rainbow: `<g opacity=".9"><path d="M30 190A100 100 0 0 1 230 190" fill="none" stroke="#ff6f8e" stroke-width="8"/><path d="M38 190A92 92 0 0 1 222 190" fill="none" stroke="#ffd34d" stroke-width="8"/><path d="M46 190A84 84 0 0 1 214 190" fill="none" stroke="#6ee7b7" stroke-width="8"/><path d="M54 190A76 76 0 0 1 206 190" fill="none" stroke="#6bb8ff" stroke-width="8"/></g>`,
    moon: `<g class="float"><circle cx="352" cy="46" r="30" fill="#fff3a6" opacity=".35"/><path d="M360 28a22 22 0 1 0 0 38 17 17 0 0 1 0-38z" fill="#ffe680"/></g>`,
    balloon: `<g class="float" transform="translate(330 110)"><path d="M0 34Q-4 52 2 66" stroke="#8a5a33" fill="none"/><ellipse cx="0" cy="14" rx="17" ry="21" fill="#ff5a6e"/><ellipse cx="-6" cy="8" rx="4" ry="7" fill="#fff" opacity=".4"/><path d="M-4 35h8l-2 5h-4z" fill="#e8465a"/></g>`,
    flag: `<g transform="translate(200 26)"><path d="M0 0V-34" stroke="#8a5a33" stroke-width="3"/><path class="wave" d="M0-34l30 9-30 9z" fill="#ff5a6e"/></g>`,
    tree: `<g transform="translate(58 232)"><rect x="-5" y="-20" width="10" height="34" rx="3" fill="#8a5a33"/><circle cx="0" cy="-42" r="30" fill="#3bb36b"/><circle cx="-14" cy="-32" r="18" fill="#2f9e5a"/><circle cx="14" cy="-50" r="16" fill="#47c279"/><circle cx="-8" cy="-48" r="4" fill="#ff5a6e"/><circle cx="14" cy="-34" r="4" fill="#ff5a6e"/><circle cx="2" cy="-30" r="4" fill="#ff5a6e"/></g>`,
    flowers: `<g>${[[130, 262, '#ff6fae'], [146, 268, '#ffd34d'], [162, 262, '#b78cff'], [240, 266, '#ff8f3d'], [256, 262, '#ff6fae'], [272, 268, '#ffffff']].map(([x, y, c]) => flower(x, y, c)).join('')}</g>`,
    fountain: `<g transform="translate(318 244)"><ellipse cx="0" cy="12" rx="34" ry="10" fill="#9ad8ff"/><path d="M-34 8Q-34 24 0 24T34 8V12Q34 28 0 28T-34 12z" fill="#d9cfff"/><rect x="-5" y="-12" width="10" height="24" fill="#d9cfff"/><path class="water" d="M0-12Q-14-26-18-6M0-12Q14-26 18-6M0-12V-30" stroke="#6bd0ff" stroke-width="3" fill="none" stroke-linecap="round"/></g>`,
    swing: `<g transform="translate(370 214)"><path d="M-28 40L-14-4M28 40L14-4M-14-4h28" stroke="#b8733a" stroke-width="5" stroke-linecap="round" fill="none"/><g class="swing"><path d="M-6-4V28M6-4V28" stroke="#6b3d1a" stroke-width="1.500"/><rect x="-10" y="26" width="20" height="5" rx="2" fill="#ff6fae"/></g></g>`,
    lantern: `<g>${[[148, 236], [252, 236], [96, 252], [304, 218]].map(([x, y], i) => `<g class="twinkle" style="animation-delay:${i * .4}s"><circle cx="${x}" cy="${y}" r="12" fill="#ffe680" opacity=".35"/><path d="M${x} ${y - 7}l2 5 5 .6-4 3.500 1 5-4-2.700-4 2.700 1-5-4-3.500 5-.6z" fill="#ffc41f"/></g>`).join('')}</g>`,
    butterfly: `<g>${[[150, 130], [244, 92]].map(([x, y], i) => `<g class="flutter" style="animation-delay:${i * .6}s" transform="translate(${x} ${y})"><ellipse cx="-6" cy="-3" rx="7" ry="9" fill="#ff8f3d"/><ellipse cx="6" cy="-3" rx="7" ry="9" fill="#ff8f3d"/><ellipse cx="-5" cy="6" rx="5" ry="6" fill="#ffd34d"/><ellipse cx="5" cy="6" rx="5" ry="6" fill="#ffd34d"/><rect x="-1" y="-8" width="2" height="18" rx="1" fill="${INK}"/></g>`).join('')}</g>`,
    doghouse: `<g transform="translate(40 250)"><rect x="-18" y="-16" width="36" height="28" fill="#ffb86b"/><path d="M-24-14L0-34 24-14z" fill="#e0457f"/><path d="M-8 12v-14a8 8 0 0 1 16 0v14z" fill="${INK}"/><rect x="-16" y="12" width="32" height="3" fill="#00000020"/></g>`,
    unicorn: `<g class="float" transform="translate(262 252)"><text font-size="42" text-anchor="middle" y="0">🦄</text></g>`
  };

  function homeScene(charId, owned, newest) {
    const own = id => owned.includes(id) ? `<g class="home-item${newest === id ? ' pop-in' : ''}" data-item="${id}">${ITEMS[id]}</g>` : '';
    return `<svg class="home-svg" viewBox="0 0 400 300" role="img" aria-label="הבית והטירה שלי">
    <defs><linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ff"/><stop offset="1" stop-color="#ffe9f4"/></linearGradient>
    <linearGradient id="hRoof" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9b6bff"/><stop offset="1" stop-color="#6c3fe0"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#hSky)"/>
    ${own('moon')}${own('rainbow')}
    <g opacity=".95">${cloud(70, 50, .9)}${cloud(300, 80, .7, .9)}</g>
    <path d="M-10 230Q90 205 200 225T410 215V300H-10z" fill="#a4e07d"/><path d="M-10 262Q120 240 240 262T410 250V300H-10z" fill="#8bd46f"/>
    <g transform="translate(200 40)"><rect x="-44" y="52" width="88" height="130" rx="5" fill="#ffd3e6"/><rect x="-86" y="82" width="38" height="100" rx="4" fill="#ffc2dc"/><rect x="48" y="82" width="38" height="100" rx="4" fill="#ffc2dc"/>
      <path d="M-52 54L0 0 52 54z" fill="url(#hRoof)"/><path d="M-92 84L-67 44-42 84z" fill="url(#hRoof)"/><path d="M42 84L67 44 92 84z" fill="url(#hRoof)"/>
      <rect x="-12" y="120" width="24" height="62" rx="12" fill="#8a5a33"/><circle cx="6" cy="152" r="2" fill="#ffd34d"/>
      <rect x="-6" y="70" width="12" height="20" rx="6" fill="#6c3fe0" opacity=".85"/><rect x="-74" y="102" width="12" height="20" rx="6" fill="#6c3fe0" opacity=".7"/><rect x="62" y="102" width="12" height="20" rx="6" fill="#6c3fe0" opacity=".7"/></g>
    <path d="M200 222Q160 250 120 300H280Q240 250 200 222z" fill="#fff6dc"/>
    ${own('flag')}${own('tree')}${own('doghouse')}${own('flowers')}${own('fountain')}${own('swing')}${own('unicorn')}${own('lantern')}${own('balloon')}${own('butterfly')}
    </svg>`;
  }

  return { char, icons: I, jar, mapScene, homeScene, NODES, MAP, ITEMS };
})();
