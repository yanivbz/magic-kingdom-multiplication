/* SVG helpers for גן הצורות: angles, paper-corner checker, shapes, world scenes. */
K.geoArt = (function () {
  const INK = '#2a2150';
  const polar = (cx, cy, deg, r) => {
    const a = deg * Math.PI / 180;
    return [cx + Math.cos(a) * r, cy - Math.sin(a) * r];
  };
  const pt = p => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  const typ = deg => K.GEO.ANGLE.typeOf(deg);
  const typCol = deg => K.GEO.ANGLE.types[typ(deg)].color;

  function arcPath(cx, cy, r, a0, a1) {
    const sweepDeg = ((a1 - a0) % 360 + 360) % 360;
    const large = sweepDeg > 180 ? 1 : 0;
    const p0 = polar(cx, cy, a0, r), p1 = polar(cx, cy, a1, r);
    /* visual CCW (our polar is y-up) is SVG sweep-flag 0 */
    return `M${pt(p0)} A${r} ${r} 0 ${large} 0 ${pt(p1)}`;
  }

  function paperPath(cx, cy, a0, dir, len) {
    /* quarter-square from ray a0 toward a0+dir*90 */
    const a90 = a0 + dir * 90;
    const pA = polar(cx, cy, a0, len);
    const pC = polar(cx, cy, a90, len);
    const pB = [pA[0] + (pC[0] - cx), pA[1] + (pC[1] - cy)];
    return { d: `M${cx} ${cy} L${pt(pA)} L${pt(pB)} L${pt(pC)} Z`, pA, pB, pC, a90 };
  }

  /* A static or annotated angle figure. deg is the interior (0..180). */
  function angleSVG(opts = {}) {
    const {
      deg = 60, rot = 20, size = 280, paper = false, arc = true,
      label = true, names = false, handle = false, markRight = false,
      id = 'ang', className = '', dim = false
    } = opts;
    const w = size, h = size, cx = w / 2, cy = h / 2, len = size * 0.40;
    const a0 = rot, a1 = rot + deg;
    const col = typCol(deg);
    const [x0, y0] = polar(cx, cy, a0, len);
    const [x1, y1] = polar(cx, cy, a1, len);
    const arcR = Math.min(58, len * 0.46);
    const type = typ(deg);
    const T = K.GEO.ANGLE.types[type];
    const paperLen = len * 0.62;
    const pap = paper ? paperPath(cx, cy, a0, 1, paperLen) : null;
    const rightMark = (markRight || type === 'right') && Math.abs(deg - 90) <= 8;
    const sq = rightMark ? paperPath(cx, cy, a0, 1, Math.min(28, arcR * 0.7)) : null;
    return `<svg class="geo-ang ${className}" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${T.full}" data-deg="${deg}" data-rot="${rot}" data-id="${id}">
      ${paper && pap ? `<path class="geo-paper" d="${pap.d}" fill="#fff6c8" fill-opacity=".82" stroke="#e0c25a" stroke-width="2"/>
        <path d="M${pt(pap.pA)} L${cx} ${cy} L${pt(pap.pC)}" fill="none" stroke="#d4a017" stroke-width="3" stroke-linecap="round"/>` : ''}
      ${arc && deg < 178 ? `<path class="geo-arc" d="${arcPath(cx, cy, arcR, a0, a1)}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" opacity="${dim ? .4 : 1}"/>` : ''}
      ${deg >= 170 ? `<path class="geo-arc" d="${arcPath(cx, cy, 26, a0, a1)}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round"/>` : ''}
      ${sq ? `<path d="${sq.d}" fill="none" stroke="${INK}" stroke-width="3"/>` : ''}
      <line class="geo-ray" x1="${cx}" y1="${cy}" x2="${x0}" y2="${y0}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <line class="geo-ray geo-ray-move" x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      ${[[x0, y0, a0], [x1, y1, a1]].map(([x, y, a]) => {
        const [ax, ay] = polar(0, 0, a, 12);
        return `<polygon points="${x + ax},${y - ay} ${x - ay * 0.7},${y - ax * 0.7} ${x + ay * 0.7},${y + ax * 0.7}" fill="${INK}"/>`;
      }).join('')}
      <circle class="geo-vertex" cx="${cx}" cy="${cy}" r="8" fill="#fff" stroke="${INK}" stroke-width="4"/>
      ${handle ? `<g class="geo-handle" data-handle="1" style="cursor:grab">
        <circle cx="${x1}" cy="${y1}" r="26" fill="transparent"/>
        <circle cx="${x1}" cy="${y1}" r="14" fill="#ff6fae" stroke="#fff" stroke-width="4"/>
      </g>` : ''}
      ${names ? `<text class="geo-lab" x="${cx}" y="${Math.min(h - 16, cy + len * 0.72)}" text-anchor="middle" font-size="22" font-weight="800" font-family="Rubik,sans-serif" fill="${col}">${T.full}</text>` : ''}
      ${label === 'parts' ? partsLabels(cx, cy, a0, a1, len, w, h) : ''}
    </svg>`;
  }

  function partsLabels(cx, cy, a0, a1, len, w, h) {
    const mid0 = polar(cx, cy, a0, len * 0.62);
    const mid1 = polar(cx, cy, a1, len * 0.62);
    const clamp = (x, y) => [Math.max(28, Math.min(w - 28, x)), Math.max(22, Math.min(h - 14, y))];
    const p0 = clamp(mid0[0], mid0[1] - 16);
    const p1 = clamp(mid1[0], mid1[1] - 16);
    return `<text x="${cx}" y="${cy + 28}" text-anchor="middle" font-size="16" font-weight="800" font-family="Rubik,sans-serif" fill="${INK}">קודקוד</text>
      <text x="${p0[0]}" y="${p0[1]}" text-anchor="middle" font-size="16" font-weight="700" font-family="Rubik,sans-serif" fill="#5b34d6">קרן</text>
      <text x="${p1[0]}" y="${p1[1]}" text-anchor="middle" font-size="16" font-weight="700" font-family="Rubik,sans-serif" fill="#5b34d6">קרן</text>`;
  }

  /* Interactive rotatable arm. startDeg / startRot. onChange(deg, type). */
  function mountDial(host, opts = {}) {
    const rot = opts.rot != null ? opts.rot : 15;
    let deg = opts.deg != null ? opts.deg : 55;
    const size = opts.size || 300;
    const showName = !!opts.showName;
    const livePaper = !!opts.paper;
    host.innerHTML = `<div class="geo-dial"><div class="geo-dial-svg"></div>${opts.caption || showName ? `<p class="geo-dial-cap" aria-live="polite">${opts.caption || ''}</p>` : ''}</div>`;
    const box = host.querySelector('.geo-dial-svg');
    const cap = host.querySelector('.geo-dial-cap');
    function updateCap() {
      if (showName && cap) {
        const T = K.GEO.ANGLE.types[typ(deg)];
        cap.innerHTML = `<b style="color:${T.color}">${T.full}</b>`;
      }
    }
    function paint() {
      box.innerHTML = angleSVG({ deg, rot, size, handle: true, names: showName, paper: livePaper, label: opts.parts ? 'parts' : false, id: opts.id || 'dial' });
      const svg = box.querySelector('svg');
      svg.style.touchAction = 'none';
      updateCap();
      if (opts.onChange) opts.onChange(deg, typ(deg));
    }
    paint();
    let dragging = false;
    function setFromEvent(e) {
      const svg = box.querySelector('svg'); if (!svg) return;
      const r = svg.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * size;
      const y = (e.clientY - r.top) / r.height * size;
      const cx = size / 2, cy = size / 2;
      const a = Math.atan2(cy - y, x - cx) * 180 / Math.PI;
      let d = ((a - rot) % 360 + 360) % 360;
      if (d > 200 && d < 360) d = d > 280 ? 8 : 180;
      d = Math.max(8, Math.min(180, d));
      if (Math.abs(d - 90) <= 4) d = 90;
      if (Math.abs(d - 180) <= 4) d = 180;
      deg = Math.round(d);
      paint();
    }
    box.addEventListener('pointerdown', ev => {
      if (ev.button != null && ev.button !== 0) return;
      ev.preventDefault(); ev.stopPropagation();
      dragging = true;
      try { box.setPointerCapture(ev.pointerId); } catch (e) {}
      setFromEvent(ev);
    });
    box.addEventListener('pointermove', ev => { if (!dragging) return; ev.preventDefault(); setFromEvent(ev); });
    const stop = ev => { if (!dragging) return; dragging = false; try { box.releasePointerCapture(ev.pointerId); } catch (e) {} };
    box.addEventListener('pointerup', stop);
    box.addEventListener('pointercancel', stop);
    return {
      getDeg: () => deg,
      getType: () => typ(deg),
      setDeg(d) { deg = d; paint(); },
      destroy() { host.innerHTML = ''; }
    };
  }

  /* Overlay a paper corner on an existing wrap that already has (or will have) an angle. Returns HTML snippet. */
  function withPaper(deg, rot, size = 260, extra = '') {
    return `<div class="geo-paper-wrap">${angleSVG({ deg, rot, size, paper: true, names: true, className: 'has-paper' })}${extra}</div>`;
  }

  /* Clickable polygon with angle hotspots. pts: [[x,y],...], rights: index[] */
  function shapeSVG(shape, opts = {}) {
    const { selected = [], showAll = false, size = 300 } = opts;
    const pts = shape.pts;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad = 36;
    const bw = maxX - minX || 1, bh = maxY - minY || 1;
    const s = Math.min((size - pad * 2) / bw, (size - pad * 2) / bh);
    const ox = (size - bw * s) / 2 - minX * s, oy = (size - bh * s) / 2 - minY * s;
    const P = pts.map(p => [p[0] * s + ox, p[1] * s + oy]);
    const poly = P.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const rights = new Set(shape.rights);
    const dots = P.map((p, i) => {
      const on = selected.includes(i);
      const isR = rights.has(i);
      const cls = on ? (showAll ? (isR ? 'ok' : 'bad') : 'on') : (showAll && isR ? 'miss' : '');
      return `<g class="geo-hot ${cls}" data-i="${i}" role="button" tabindex="0" aria-label="זווית ${i + 1}" aria-pressed="${on}">
        <circle cx="${p[0]}" cy="${p[1]}" r="22" fill="transparent"/>
        <circle cx="${p[0]}" cy="${p[1]}" r="12" fill="${on ? '#ff6fae' : '#fff'}" stroke="${INK}" stroke-width="3"/>
      </g>`;
    }).join('');
    return `<svg class="geo-shape" viewBox="0 0 ${size} ${size}" width="100%" role="img" aria-label="${shape.name}">
      <polygon points="${poly}" fill="#fff0f8" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
  }

  function angleAt(prev, cur, next) {
    const ux = prev[0] - cur[0], uy = prev[1] - cur[1];
    const vx = next[0] - cur[0], vy = next[1] - cur[1];
    const du = Math.hypot(ux, uy), dv = Math.hypot(vx, vy);
    let c = (ux * vx + uy * vy) / (du * dv);
    c = Math.min(1, Math.max(-1, c));
    return Math.acos(c) * 180 / Math.PI;
  }
  function rightsOf(pts, concaveOk = true) {
    const n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const d = angleAt(pts[(i + n - 1) % n], pts[i], pts[(i + 1) % n]);
      /* smaller angle between edges; for convex this is interior. For a concave 270°, acos gives 90 — skip using cross sign if needed. */
      const prev = pts[(i + n - 1) % n], cur = pts[i], next = pts[(i + 1) % n];
      const cross = (cur[0] - prev[0]) * (next[1] - cur[1]) - (cur[1] - prev[1]) * (next[0] - cur[0]);
      const interior = cross < 0 ? d : 360 - d; /* depends on winding; we use CCW polygons (y-down, screen): cross>0 is right turn... */
      /* We'll mark as right if the *smaller* geometric corner is ~90 and it's a convex corner (interior ~90). */
      const interiorGuess = (Math.abs(d - 90) <= 8) ? (/* convex right */ 90) : d;
      if (Math.abs(d - 90) <= 8) {
        /* If this is a reflex interior, the small angle is the exterior; skip if polygon is concave here.
           cross sign with y-down: for CCW polygon, interior is left (cross > 0 in y-down? )
           Screen y-down: CCW means cross (x1*y2-y1*x2) of incoming? Let's compute winding later in data by hand. */
        out.push(i);
      }
    }
    return out;
  }

  /* Hand-built shapes (screen coords, mostly CCW). rights listed explicitly. */
  function rotPts(pts, deg, cx, cy) {
    const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return pts.map(([x, y]) => {
      const dx = x - cx, dy = y - cy;
      return [cx + c * dx - s * dy, cy + s * dx + c * dy];
    });
  }
  function makeShapes() {
    const sq = [[40, 40], [160, 40], [160, 160], [40, 160]];
    const rect = [[30, 60], [200, 60], [200, 140], [30, 140]];
    const rtri = [[30, 170], [30, 40], [190, 170]];
    const house = [[40, 90], [40, 180], [180, 180], [180, 90], [110, 30]]; /* rights at 0,1,2,3; peak acute */
    const ell = [[40, 40], [100, 40], [100, 110], [170, 110], [170, 180], [40, 180]]; /* L: rights at all but maybe inner 2 is 270 if CCW */
    /* CCW L starting top-left: 40,40 -> 100,40 -> 100,110 -> 170,110 -> 170,180 -> 40,180.
       Interiors: 90,90,270,90,90,90. Smaller-angle at vertex 2 is 90 but interior 270 — exclude 2. */
    const kiteish = [[110, 20], [180, 100], [110, 180], [40, 100]]; /* rhombus diamond: often not 90 */
    const rtrap = [[40, 160], [200, 160], [160, 60], [80, 60]]; /* rights maybe at bottom if not; this is isosceles trap, not rights */
    const oneRight = [[30, 170], [30, 50], [140, 50], [200, 170]]; /* right at 0 and 1 (axis-aligned) */
    const list = [
      { id: 'sq', name: 'ריבוע', pts: sq, rights: [0, 1, 2, 3] },
      { id: 'sq-rot', name: 'ריבוע מסובב', pts: rotPts(sq, 28, 100, 100), rights: [0, 1, 2, 3] },
      { id: 'rect', name: 'מלבן', pts: rect, rights: [0, 1, 2, 3] },
      { id: 'rect-rot', name: 'מלבן מסובב', pts: rotPts(rect, -22, 115, 100), rights: [0, 1, 2, 3] },
      { id: 'rtri', name: 'משולש ישר-זווית', pts: rtri, rights: [0] },
      { id: 'rtri-rot', name: 'משולש ישר-זווית', pts: rotPts(rtri, 40, 100, 110), rights: [0] },
      { id: 'house', name: 'בית', pts: house, rights: [0, 1, 2, 3] },
      { id: 'ell', name: 'צורת ר', pts: ell, rights: [0, 1, 3, 4, 5] },
      { id: 'one-r', name: 'מצולע', pts: oneRight, rights: [0, 1] },
      { id: 'sq45', name: 'ריבוע על הקודקוד', pts: rotPts(sq, 45, 100, 100), rights: [0, 1, 2, 3] }
    ];
    return list;
  }
  const SHAPES = makeShapes();

  /* Cute real-world scenes. Each marks one highlighted angle of a given kind. */
  function worldClock(kind) {
    /* 3:00 right, ~1:00 acute, ~5:00 obtuse, 6:00 straight (but 6 is 180 from 12, hour at 3? Use hour+minute).
       Hands from center: minute at 12 (90° screen up = math 90), hour varies. */
    const hourAng = { right: 0, acute: 55, obtuse: 125, straight: 180 }; /* math deg from east, minute hand pointing east? Let's put minute hand pointing up (90). */
    const minA = 90;
    const hourA = 90 - ({ right: 90, acute: 40, obtuse: 125, straight: 180 }[kind]);
    const deg = Math.abs(((minA - hourA) % 360 + 360) % 360);
    const measure = Math.min(deg, 360 - deg);
    /* recompute hour so measure matches kind */
    const want = { right: 90, acute: 45, obtuse: 130, straight: 180 }[kind];
    const hA = minA - want;
    return { kind, title: 'שעון', ask: 'איזה סוג זווית יוצרות מחוגי השעון?',
      deg: want, rot: Math.min(hA, minA),
      svg(size = 280) {
        const c = size / 2, r = size * 0.36;
        const pM = polar(c, c, minA, r * 0.88), pH = polar(c, c, hA, r * 0.62);
        return `<svg class="geo-world" viewBox="0 0 ${size} ${size}" width="100%" role="img" aria-label="שעון">
          <circle cx="${c}" cy="${c}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="6"/>
          ${[0,30,60,90,120,150,180,210,240,270,300,330].map(d => {
            const o = polar(c, c, 90 - d, r * 0.82), i = polar(c, c, 90 - d, r * 0.70);
            return `<line x1="${o[0]}" y1="${o[1]}" x2="${i[0]}" y2="${i[1]}" stroke="${INK}" stroke-width="${d % 90 === 0 ? 4 : 2}"/>`;
          }).join('')}
          <path d="${arcPath(c, c, r * 0.32, hA, minA)}" fill="none" stroke="${typCol(want)}" stroke-width="6" stroke-linecap="round"/>
          <line x1="${c}" y1="${c}" x2="${pH[0]}" y2="${pH[1]}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
          <line x1="${c}" y1="${c}" x2="${pM[0]}" y2="${pM[1]}" stroke="#ff5a6e" stroke-width="5" stroke-linecap="round"/>
          <circle cx="${c}" cy="${c}" r="7" fill="${INK}"/>
        </svg>`;
      } };
  }
  function worldBook(kind) {
    const open = { acute: 55, right: 90, obtuse: 125 }[kind] || 55;
    return { kind, title: 'ספר פתוח', ask: 'איזה סוג זווית יש בפתיחה של הספר?', deg: open, rot: 180 - open / 2,
      svg(size = 280) {
        const c = size / 2, y = size * 0.62, len = size * 0.38, rot = 180 - open / 2;
        const p0 = polar(c, y, rot, len), p1 = polar(c, y, rot + open, len);
        return `<svg class="geo-world" viewBox="0 0 ${size} ${size}" width="100%" role="img" aria-label="ספר פתוח">
          <path d="M${c} ${y} L${p0[0]} ${p0[1]} L${p0[0]} ${p0[1] - 70} L${c} ${y - 70} Z" fill="#ffd9ec" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
          <path d="M${c} ${y} L${p1[0]} ${p1[1]} L${p1[0]} ${p1[1] - 70} L${c} ${y - 70} Z" fill="#dce9ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
          <path d="${arcPath(c, y, 42, rot, rot + open)}" fill="none" stroke="${typCol(open)}" stroke-width="6" stroke-linecap="round"/>
          <circle cx="${c}" cy="${y}" r="6" fill="${INK}"/>
        </svg>`;
      } };
  }
  function worldPizza(kind) {
    const sl = { acute: 40, right: 90, obtuse: 120 }[kind] || 40;
    return { kind, title: 'משולש פיצה', ask: 'איזה סוג זווית יש בקודקוד של המשולש?', deg: sl, rot: 90 - sl / 2,
      svg(size = 280) {
        const c = size / 2, rot = 90 - sl / 2, r = size * 0.4;
        const p0 = polar(c, c, rot, r), p1 = polar(c, c, rot + sl, r);
        return `<svg class="geo-world" viewBox="0 0 ${size} ${size}" width="100%" role="img" aria-label="פיצה">
          <path d="M${c} ${c} L${p0[0]} ${p0[1]} A${r} ${r} 0 0 0 ${p1[0]} ${p1[1]} Z" fill="#ffd34d" stroke="${INK}" stroke-width="5"/>
          <path d="M${c} ${c} L${((p0[0]+p1[0])/2).toFixed(1)} ${((p0[1]+p1[1])/2).toFixed(1)}" stroke="#e8a020" stroke-width="3"/>
          <circle cx="${(c+p0[0]+p1[0])/3}" cy="${(c+p0[1]+p1[1])/3}" r="10" fill="#ff5a6e"/>
          <circle cx="${(c*1.1+p0[0]*0.6+p1[0]*0.3)/2}" cy="${(c*1.1+p0[1]*0.6+p1[1]*0.3)/2}" r="8" fill="#2fc79a"/>
          <path d="${arcPath(c, c, 48, rot, rot + sl)}" fill="none" stroke="${typCol(sl)}" stroke-width="6" stroke-linecap="round"/>
          <circle cx="${c}" cy="${c}" r="6" fill="${INK}"/>
        </svg>`;
      } };
  }
  function worldDoor(kind) {
    const open = { acute: 50, right: 90, obtuse: 130 }[kind] || 50;
    return { kind, title: 'דלת פתוחה', ask: 'איזה סוג זווית נוצרת בין הדלת לקיר?', deg: open, rot: 180,
      svg(size = 280) {
        const wallX = 70, floor = size * 0.82, hinge = [wallX, floor], len = size * 0.42;
        const door = polar(hinge[0], hinge[1], 180 - open, len); /* from wall going left (180) opening inward */
        /* wall is vertical (90), door at 180-open? Wall ray downward? Wall along 90 (up). Angle at hinge between wall-up and door. */
        const a0 = 90, a1 = 90 + open;
        const dEnd = polar(hinge[0], hinge[1], a1, len);
        return `<svg class="geo-world" viewBox="0 0 ${size} ${size}" width="100%" role="img" aria-label="דלת">
          <rect x="20" y="30" width="50" height="${floor - 30}" fill="#e9dcff" stroke="${INK}" stroke-width="5"/>
          <line x1="${wallX}" y1="30" x2="${wallX}" y2="${floor}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
          <line x1="${hinge[0]}" y1="${hinge[1]}" x2="${dEnd[0]}" y2="${dEnd[1]}" stroke="#c98b55" stroke-width="14" stroke-linecap="round"/>
          <circle cx="${(hinge[0]+dEnd[0])/2 + 6}" cy="${(hinge[1]+dEnd[1])/2}" r="5" fill="#ffc41f" stroke="${INK}" stroke-width="2"/>
          <path d="${arcPath(hinge[0], hinge[1], 44, a0, a1)}" fill="none" stroke="${typCol(open)}" stroke-width="6" stroke-linecap="round"/>
          <circle cx="${hinge[0]}" cy="${hinge[1]}" r="6" fill="${INK}"/>
        </svg>`;
      } };
  }
  function worldSlide(kind) {
    const a = { acute: 50, right: 90, obtuse: 120 }[kind] || 50;
    return { kind, title: 'מגלשה', ask: 'איזה סוג זווית יש בין המגלשה לרצפה?', deg: a, rot: 0,
      svg(size = 280) {
        const base = [40, 220], len = 180;
        const end = polar(base[0], base[1], a, len);
        return `<svg class="geo-world" viewBox="0 0 ${size} ${size}" width="100%" role="img" aria-label="מגלשה">
          <line x1="20" y1="220" x2="260" y2="220" stroke="#7a6aa5" stroke-width="8" stroke-linecap="round"/>
          <path d="M${base[0]} ${base[1]} L${end[0]} ${end[1]}" stroke="#4db3ff" stroke-width="14" stroke-linecap="round"/>
          <path d="M${base[0]} ${base[1]} L${end[0]} ${end[1]}" stroke="#fff" stroke-width="4" stroke-dasharray="8 8" opacity=".5"/>
          <rect x="${end[0] - 8}" y="${end[1] - 4}" width="16" height="30" fill="#9a6bff" stroke="${INK}" stroke-width="3"/>
          <path d="${arcPath(base[0], base[1], 50, 0, a)}" fill="none" stroke="${typCol(a)}" stroke-width="6" stroke-linecap="round"/>
          <circle cx="${base[0]}" cy="${base[1]}" r="6" fill="${INK}"/>
        </svg>`;
      } };
  }
  function worldTable(kind) {
    /* table corner is always right; if other kinds requested, fall back to a book on the table? Use a laptop for non-right. */
    if (kind === 'right') {
      return { kind, title: 'שולחן', ask: 'איזה סוג זווית יש בפינת השולחן?', deg: 90, rot: 180,
        svg(size = 280) {
          return `<svg class="geo-world" viewBox="0 0 ${size} ${size}" width="100%" role="img" aria-label="שולחן">
            <path d="M50 80 H230 V200 H50 Z" fill="#e8c48a" stroke="${INK}" stroke-width="6"/>
            <path d="M50 200 L40 250 M230 200 L240 250" stroke="#8a5a33" stroke-width="8" stroke-linecap="round"/>
            <path d="${arcPath(50, 80, 44, 270, 360)}" fill="none" stroke="${typCol(90)}" stroke-width="6" stroke-linecap="round"/>
            <circle cx="50" cy="80" r="6" fill="${INK}"/>
            <rect x="50" y="80" width="22" height="22" fill="none" stroke="${INK}" stroke-width="3"/>
          </svg>`;
        } };
    }
    const open = { acute: 50, obtuse: 130, straight: 180 }[kind] || 50;
    return { kind, title: 'מחשב נייד', ask: 'איזה סוג זווית נוצרת בפתיחת המחשב?', deg: open, rot: 0,
      svg(size = 280) {
        const hinge = [60, 190], len = 150;
        const lid = polar(hinge[0], hinge[1], open, len);
        return `<svg class="geo-world" viewBox="0 0 ${size} ${size}" width="100%" role="img" aria-label="מחשב נייד">
          <rect x="60" y="190" width="160" height="24" rx="4" fill="#cfc3f2" stroke="${INK}" stroke-width="4"/>
          <line x1="${hinge[0]}" y1="${hinge[1]}" x2="${lid[0]}" y2="${lid[1]}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
          <line x1="${hinge[0]}" y1="${hinge[1]}" x2="${lid[0]}" y2="${lid[1]}" stroke="#9a6bff" stroke-width="6" stroke-linecap="round"/>
          <path d="${arcPath(hinge[0], hinge[1], 48, 0, open)}" fill="none" stroke="${typCol(open)}" stroke-width="6" stroke-linecap="round"/>
          <circle cx="${hinge[0]}" cy="${hinge[1]}" r="6" fill="${INK}"/>
        </svg>`;
      } };
  }

  const WORLD_FNS = {
    clock: worldClock, book: worldBook, pizza: worldPizza, door: worldDoor, slide: worldSlide, table: worldTable
  };
  const WORLD_IDS = ['clock', 'book', 'pizza', 'door', 'slide', 'table'];

  function pickWorld(kind) {
    const ids = WORLD_IDS.slice();
    /* table is always-right as table; laptop otherwise — still ok for all kinds */
    const id = ids[Math.floor(Math.random() * ids.length)];
    return Object.assign({ id }, WORLD_FNS[id](kind));
  }

  function gardenBanner() {
    return `<svg class="garden-banner" viewBox="0 0 400 160" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8e0ff"/><stop offset="1" stop-color="#e7ffd8"/></linearGradient>
      </defs>
      <rect width="400" height="160" rx="24" fill="url(#gSky)"/>
      <path d="M0 120 Q80 90 140 120 T280 110 T400 124 V160 H0z" fill="#8ed86a"/>
      <path d="M0 136 Q100 116 200 136 T400 138 V160 H0z" fill="#6fc85a"/>
      <path d="M40 86 A90 90 0 0 1 220 86" fill="none" stroke="#ff6f8e" stroke-width="8"/>
      <path d="M50 86 A80 80 0 0 1 210 86" fill="none" stroke="#ffd34d" stroke-width="8"/>
      <path d="M60 86 A70 70 0 0 1 200 86" fill="none" stroke="#6ee7b7" stroke-width="8"/>
      <path d="M70 86 A60 60 0 0 1 190 86" fill="none" stroke="#6bb8ff" stroke-width="8"/>
      <g transform="translate(300 70)">
        <circle cx="0" cy="0" r="28" fill="#ffe08a"/>
        <circle cx="-8" cy="-4" r="5" fill="${INK}"/>
        <circle cx="8" cy="-4" r="5" fill="${INK}"/>
        <path d="M-10 10 Q0 18 10 10" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <path d="M-22 -18 Q0 -36 22 -18" fill="#ff6fae"/>
        <path d="M-16 -16 Q0 -28 16 -16" fill="#ffd34d"/>
      </g>
      <text x="200" y="148" text-anchor="middle" font-size="15" font-weight="700" fill="#2a2150" font-family="Rubik,sans-serif">קשתית בגן הצורות</text>
    </svg>`;
  }

  function mapGardenPatch() {
    /* decorative patch drawn on the kefel map, left of the meadow, under the portal */
    return `<g class="geo-map-patch" transform="translate(48 518)" pointer-events="none">
      <ellipse cx="0" cy="10" rx="36" ry="16" fill="#8ed86a" opacity=".9"/>
      <path d="M-22 0 A28 28 0 0 1 22 0" fill="none" stroke="#ff6f8e" stroke-width="3"/>
      <path d="M-18 0 A22 22 0 0 1 18 0" fill="none" stroke="#ffd34d" stroke-width="3"/>
      <path d="M-14 0 A16 16 0 0 1 14 0" fill="none" stroke="#6bb8ff" stroke-width="3"/>
      <circle cx="-16" cy="8" r="4" fill="#ff6fae"/>
      <circle cx="14" cy="10" r="4" fill="#ffd34d"/>
      <circle cx="2" cy="14" r="4" fill="#fff"/>
    </g>`;
  }

  return {
    polar, arcPath, angleSVG, mountDial, withPaper, shapeSVG, SHAPES, pickWorld, WORLD_IDS, gardenBanner, mapGardenPatch,
    typ, typCol, PORTAL: [48, 518]
  };
})();
