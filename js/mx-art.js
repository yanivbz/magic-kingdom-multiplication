/* SVG drawings for the math+geometry exam prep: base-10 blocks, shapes, angles, triangles, lines. */
(function () {
  const A = K.MXART = {};
  const INK = '#2a2150', VI = '#7a4dff', PK = '#ff5fa2', FILL = '#efe8ff';
  const svg = (w, h, body, cls = '') => `<svg class="mx-svg ${cls}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${body}</svg>`;

  /* ---- base-10 blocks: cube = 1,000 · flat = 100 · rod = 10 · unit = 1 ---- */
  function cube(x, y, s) { // isometric-ish cube with grid lines
    const d = s * .35, g = s / 10; let b = '';
    b += `<path d="M${x} ${y + d}h${s}v${s}h${-s}z" fill="#ffd66b" stroke="${INK}" stroke-width="1.4"/>`;
    b += `<path d="M${x} ${y + d}l${d} ${-d}h${s}l${-d} ${d}z" fill="#ffe7a3" stroke="${INK}" stroke-width="1.4"/>`;
    b += `<path d="M${x + s} ${y + d}l${d} ${-d}v${s}l${-d} ${d}z" fill="#f2b73b" stroke="${INK}" stroke-width="1.4"/>`;
    for (let i = 1; i < 10; i++) b += `<path d="M${x + i * g} ${y + d}v${s}M${x} ${y + d + i * g}h${s}" stroke="${INK}" stroke-opacity=".28" stroke-width=".7"/>`;
    return b;
  }
  function flat(x, y, s) { let b = `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#8fd3ff" stroke="${INK}" stroke-width="1.4"/>`; const g = s / 10; for (let i = 1; i < 10; i++) b += `<path d="M${x + i * g} ${y}v${s}M${x} ${y + i * g}h${s}" stroke="${INK}" stroke-opacity=".3" stroke-width=".7"/>`; return b; }
  function rod(x, y, w, h) { let b = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#8be0b9" stroke="${INK}" stroke-width="1.4"/>`; for (let i = 1; i < 10; i++) b += `<path d="M${x} ${y + i * h / 10}h${w}" stroke="${INK}" stroke-opacity=".35" stroke-width=".7"/>`; return b; }
  const unit = (x, y, s) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#ff9cc6" stroke="${INK}" stroke-width="1.4"/>`;
  /* one small picture per block (no labels, so the count is the child's job); wraps on small screens, thousands first (left) */
  A.blocks = (th, h, t, u) => {
    const one = [];
    for (let i = 0; i < th; i++) one.push(svg(80, 80, cube(4, 8, 56), 'b-cube'));
    for (let i = 0; i < h; i++) one.push(svg(70, 70, flat(3, 3, 64), 'b-flat'));
    if (t) one.push(svg(t * 15 + 4, 84, Array.from({ length: t }, (_, i) => rod(3 + i * 15, 3, 10, 78)).join(''), 'b-rods'));
    if (u) one.push(svg(Math.ceil(u / 2) * 16 + 4, 36, Array.from({ length: u }, (_, i) => unit(3 + Math.floor(i / 2) * 16, 3 + (i % 2) * 16, 12)).join(''), 'b-units'));
    return `<div class="mx-blocks" dir="ltr">${one.join('')}</div>`;
  };
  A.blocksKey = () => {
    const item = (draw, w, label) => `<span class="mx-bk">${svg(w, 80, draw)}<b dir="ltr">${label}</b></span>`;
    return `<div class="mx-bkey">${item(cube(4, 8, 50), 74, '1,000')}${item(flat(6, 8, 62), 76, '100')}${item(rod(6, 4, 9, 70), 22, '10')}${item(unit(5, 36, 12), 24, '1')}</div>`;
  };

  /* ---- polygons & other shapes ---- */
  const reg = (n, cx, cy, r, rot = -90) => Array.from({ length: n }, (_, i) => { const a = (rot + i * 360 / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const pts = P => P.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  const SH = {
    triangle: () => `<polygon points="50,12 90,86 10,86"/>`,
    rect: () => `<rect x="8" y="26" width="84" height="50"/>`,
    square: () => `<rect x="18" y="18" width="64" height="64"/>`,
    trapezoid: () => `<polygon points="28,24 72,24 94,80 6,80"/>`,
    pentagon: () => `<polygon points="${pts(reg(5, 50, 52, 40))}"/>`,
    hexagon: () => `<polygon points="${pts(reg(6, 50, 50, 40, 0))}"/>`,
    semicircle: () => `<path d="M8 70A42 42 0 0 1 92 70Z"/>`,
    ellipse: () => `<ellipse cx="50" cy="50" rx="44" ry="28"/>`,
    circle: () => `<circle cx="50" cy="50" r="38"/>`,
    open: () => `<polyline points="14,80 30,20 70,20 86,80" fill="none"/>`,
    curvy: () => `<path d="M12 80L50 16L88 80Q50 56 12 80Z"/>`
  };
  A.shape = k => svg(100, 100, `<g fill="${FILL}" stroke="${INK}" stroke-width="3" stroke-linejoin="round">${SH[k]()}</g>`, 'mx-shape');
  /* polygon with n sides; mark = 'vertex' | 'side' | null */
  A.polygon = (n, mark, seed = 0) => {
    const P = reg(n, 100, 92, 70, -90 + seed);
    let b = `<polygon points="${pts(P)}" fill="${FILL}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
    if (mark === 'side') { const i = seed % n, a = P[i], c = P[(i + 1) % n]; b += `<line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" stroke="${PK}" stroke-width="9" stroke-linecap="round"/>`; }
    if (mark === 'vertex') { const a = P[seed % n]; b += `<circle cx="${a[0]}" cy="${a[1]}" r="10" fill="${PK}" stroke="#fff" stroke-width="3"/>`; }
    return svg(200, 180, b, 'mx-poly');
  };
  A.pentagonKey = () => {
    const P = reg(5, 110, 84, 58);
    let b = `<polygon points="${pts(P)}" fill="${FILL}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    b += `<circle cx="${P[0][0]}" cy="${P[0][1]}" r="7" fill="${PK}"/><text x="${P[0][0] + 14}" y="${P[0][1] + 4}" font-size="17" font-weight="700" fill="${PK}">קודקוד</text>`;
    const m = [(P[2][0] + P[3][0]) / 2, (P[2][1] + P[3][1]) / 2];
    b += `<line x1="${P[2][0]}" y1="${P[2][1]}" x2="${P[3][0]}" y2="${P[3][1]}" stroke="${VI}" stroke-width="7" stroke-linecap="round"/><text x="${m[0]}" y="${m[1] + 24}" text-anchor="middle" font-size="17" font-weight="700" fill="${VI}">צלע</text>`;
    return svg(220, 175, b, 'mx-key');
  };

  /* ---- angles ---- */
  A.angle = (deg, rot = 0, shape7 = false) => {
    const L = 78; let V, E1, E2;
    const pt = (a, r) => [V[0] + r * Math.cos(a * Math.PI / 180), V[1] - r * Math.sin(a * Math.PI / 180)]; // y flipped: angles turn counter-clockwise like in a notebook
    if (shape7) { // like the digit 7: a top stroke to the left and a slanted stroke going down-left
      V = [150, 30]; E1 = [V[0] - L * 1.3, V[1]]; E2 = [V[0] - L * 1.1 * Math.cos(deg * Math.PI / 180), V[1] + L * 1.1 * Math.sin(deg * Math.PI / 180)];
    } else {
      rot = Math.max(-12, Math.min(rot, 186 - deg));
      V = [deg > 100 ? 104 : 50, 112]; E1 = pt(rot, L); E2 = pt(rot + deg, L);
    }
    let b = `<polyline points="${pts([E1, V, E2])}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    const u1 = [(E1[0] - V[0]) / Math.hypot(E1[0] - V[0], E1[1] - V[1]), (E1[1] - V[1]) / Math.hypot(E1[0] - V[0], E1[1] - V[1])];
    const u2 = [(E2[0] - V[0]) / Math.hypot(E2[0] - V[0], E2[1] - V[1]), (E2[1] - V[1]) / Math.hypot(E2[0] - V[0], E2[1] - V[1])];
    if (deg === 90) { const s = 16; b += `<path d="M${V[0] + u1[0] * s} ${V[1] + u1[1] * s}L${V[0] + (u1[0] + u2[0]) * s} ${V[1] + (u1[1] + u2[1]) * s}L${V[0] + u2[0] * s} ${V[1] + u2[1] * s}" fill="none" stroke="${PK}" stroke-width="3"/>`; }
    else { const r = 24, p1 = [V[0] + u1[0] * r, V[1] + u1[1] * r], p2 = [V[0] + u2[0] * r, V[1] + u2[1] * r]; const cross = u1[0] * u2[1] - u1[1] * u2[0]; b += `<path d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}A${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}" fill="none" stroke="${PK}" stroke-width="3"/>`; }
    b += `<circle cx="${V[0]}" cy="${V[1]}" r="4.5" fill="${INK}"/>`;
    return svg(200, 140, b, 'mx-angle');
  };
  /* exact angle in degrees between the two drawn rays (used by the verifier in the browser test) */
  A.anglesKey = () => `<div class="mx-akey">${[['חדה', 45], ['ישרה', 90], ['קהה', 130]].map(([n, d]) => `<span>${A.angle(d, 0)}<b>${n}</b></span>`).join('')}</div>`;

  /* ---- triangle drawn to scale from its 3 side lengths ---- */
  A.triangle = (s, label) => {
    const [a, b, c] = s;            // c = base, a = left side, b = right side
    const x = (a * a - b * b + c * c) / (2 * c), y = Math.sqrt(Math.max(0, a * a - x * x));
    const k = Math.min(150 / c, 110 / Math.max(y, 1), 150 / Math.max(x, c - x, 1) * 1.0);
    const P0 = [0, 0], P1 = [c * k, 0], P2 = [x * k, y * k];
    const minX = Math.min(0, P2[0]), maxX = Math.max(P1[0], P2[0]);
    const ox = 120 - (minX + maxX) / 2, oy = 150;
    const T = p => [ox + p[0], oy - p[1]];
    const A0 = T(P0), A1 = T(P1), A2 = T(P2), cx = (A0[0] + A1[0] + A2[0]) / 3, cy = (A0[1] + A1[1] + A2[1]) / 3;
    const lab = (p, q, v) => { const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], d = [m[0] - cx, m[1] - cy], L = Math.hypot(...d) || 1; const off = Math.abs(d[0] / L) > .5 ? 34 : 18; return `<text x="${(m[0] + d[0] / L * off).toFixed(1)}" y="${(m[1] + d[1] / L * off + 6).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="700" fill="${VI}">${v} ס"מ</text>`; };
    let g = `<polygon points="${pts([A0, A1, A2])}" fill="${FILL}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
    g += lab(A0, A1, c) + lab(A0, A2, a) + lab(A1, A2, b);
    if (label) g += `<text x="${cx.toFixed(1)}" y="${(cy + 7).toFixed(1)}" text-anchor="middle" font-size="20" font-weight="800" fill="${INK}">${label}</text>`;
    return svg(240, 175, g, 'mx-tri');
  };

  /* ---- lines: straight / curved / broken ---- */
  A.line = k => svg(160, 70, k === 'straight' ? `<line x1="12" y1="50" x2="148" y2="20" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`
    : k === 'curve' ? `<path d="M12 50C50 0 100 80 148 22" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`
    : `<polyline points="12,52 50,18 88,52 124,20 148,40" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`, 'mx-line');
})();
