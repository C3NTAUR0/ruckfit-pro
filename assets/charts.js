/* ============================================================
   RuckFit Pro — lightweight SVG chart library
   No external dependencies. All charts are responsive.
   ============================================================ */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const cssVar = (n) => getComputedStyle(document.body).getPropertyValue(n).trim();

  function el(tag, attrs={}, children=[]) {
    const node = document.createElementNS(NS, tag);
    for (const k in attrs) {
      if (attrs[k] !== undefined && attrs[k] !== null) node.setAttribute(k, attrs[k]);
    }
    children.forEach(c => c && node.appendChild(c));
    return node;
  }

  /* Format helpers */
  function pad2(n) { return String(n).padStart(2, '0'); }
  function fmtNum(v, dec=1) {
    if (typeof v !== 'number') return v;
    return Number(v).toFixed(dec);
  }

  /* --------------------------------------------------------
     LINE / AREA chart
     opts: { data: [n,...] OR [{x:'W1', y:120},...],
             yMin, yMax, height=160, area=true, suffix='',
             color, dot=false, gridY=4 }
     -------------------------------------------------------- */
  function lineChart(container, opts) {
    container.innerHTML = '';
    const data = opts.data.map((d, i) => typeof d === 'object'
      ? { x: i, y: d.y, label: d.x ?? d.label }
      : { x: i, y: d, label: String(i+1) });
    if (data.length === 0) return;

    const W = container.clientWidth || 480;
    const H = opts.height || 160;
    const pad = { l: 30, r: 12, t: 14, b: 22 };

    const yMin = opts.yMin ?? Math.min(...data.map(d=>d.y));
    const yMax = opts.yMax ?? Math.max(...data.map(d=>d.y));
    const yRange = (yMax - yMin) || 1;

    const xStep = (W - pad.l - pad.r) / Math.max(1, data.length - 1);
    const xy = (i) => [pad.l + i * xStep, pad.t + (1 - (data[i].y - yMin) / yRange) * (H - pad.t - pad.b)];

    const svg = el('svg', { class:'chart-svg', viewBox:`0 0 ${W} ${H}`, preserveAspectRatio:'none' });
    // grid
    const g = el('g', { class:'chart-grid' });
    const gridLines = opts.gridY ?? 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = pad.t + i * (H - pad.t - pad.b) / gridLines;
      g.appendChild(el('line', { x1: pad.l, x2: W - pad.r, y1: y, y2: y }));
      const val = yMax - (i * yRange / gridLines);
      const t = el('text', { x: pad.l - 6, y: y + 3, 'text-anchor':'end' });
      t.textContent = fmtNum(val, val >= 100 ? 0 : 1);
      g.appendChild(t);
    }
    svg.appendChild(g);

    // x-axis labels (sparse)
    const axis = el('g', { class:'chart-axis' });
    const labelEvery = Math.max(1, Math.floor(data.length / 7));
    data.forEach((d, i) => {
      if (i % labelEvery !== 0 && i !== data.length - 1) return;
      const [x] = xy(i);
      const t = el('text', { x, y: H - 6, 'text-anchor':'middle' });
      t.textContent = d.label;
      axis.appendChild(t);
    });
    svg.appendChild(axis);

    // line path
    const color = opts.color || cssVar('--accent') || '#B5FF3C';
    const pts = data.map((_, i) => xy(i));
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

    if (opts.area !== false) {
      // gradient
      const gradId = 'g' + Math.random().toString(36).slice(2,8);
      const defs = el('defs');
      const linearGrad = el('linearGradient', { id: gradId, x1: 0, y1: 0, x2: 0, y2: 1 });
      linearGrad.appendChild(el('stop', { offset: '0%',   'stop-color': color, 'stop-opacity': '0.35' }));
      linearGrad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': '0' }));
      defs.appendChild(linearGrad);
      svg.appendChild(defs);
      const areaPath = linePath + ` L ${pts[pts.length-1][0]} ${H - pad.b} L ${pts[0][0]} ${H - pad.b} Z`;
      svg.appendChild(el('path', { d: areaPath, fill: `url(#${gradId})`, class:'chart-area' }));
    }

    svg.appendChild(el('path', { d: linePath, class:'chart-line', stroke: color }));

    if (opts.dot) {
      pts.forEach((p, i) => {
        const dot = el('circle', { cx: p[0], cy: p[1], r: 3, class:'chart-dot' });
        dot.style.fill = color;
        svg.appendChild(dot);
      });
    } else {
      // last point dot
      const last = pts[pts.length - 1];
      const lastDot = el('circle', { cx: last[0], cy: last[1], r: 4, class:'chart-dot' });
      lastDot.style.fill = color;
      svg.appendChild(lastDot);
    }

    // Tooltip
    const wrap = container;
    wrap.style.position = 'relative';
    const tip = document.createElement('div');
    tip.className = 'chart-tooltip';
    wrap.appendChild(tip);
    const hover = el('rect', { x: 0, y: 0, width: W, height: H, fill: 'transparent' });
    svg.appendChild(hover);

    svg.addEventListener('mousemove', (e) => {
      const rect = svg.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * W;
      let bestI = 0, bestD = Infinity;
      data.forEach((d, i) => {
        const dx = Math.abs(pad.l + i * xStep - px);
        if (dx < bestD) { bestD = dx; bestI = i; }
      });
      const [x, y] = xy(bestI);
      tip.textContent = `${data[bestI].label} • ${fmtNum(data[bestI].y, 1)}${opts.suffix||''}`;
      tip.style.left = ((x / W) * 100) + '%';
      tip.style.top = ((y / H) * 100) + '%';
      tip.classList.add('is-visible');
    });
    svg.addEventListener('mouseleave', () => tip.classList.remove('is-visible'));

    container.appendChild(svg);
  }

  /* --------------------------------------------------------
     BAR chart
     -------------------------------------------------------- */
  function barChart(container, opts) {
    container.innerHTML = '';
    const data = opts.data;
    const W = container.clientWidth || 480;
    const H = opts.height || 160;
    const pad = { l: 30, r: 12, t: 14, b: 22 };
    const yMin = 0;
    const yMax = opts.yMax ?? Math.max(...data.map(d => d.y || d.value));
    const yRange = (yMax - yMin) || 1;
    const n = data.length;
    const barW = (W - pad.l - pad.r) / n * 0.62;
    const step = (W - pad.l - pad.r) / n;

    const svg = el('svg', { class:'chart-svg', viewBox:`0 0 ${W} ${H}`, preserveAspectRatio:'none' });

    // grid
    const g = el('g', { class:'chart-grid' });
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + i * (H - pad.t - pad.b) / 4;
      g.appendChild(el('line', { x1: pad.l, x2: W - pad.r, y1: y, y2: y }));
      const val = yMax - (i * yRange / 4);
      const t = el('text', { x: pad.l - 6, y: y + 3, 'text-anchor':'end' });
      t.textContent = fmtNum(val, val >= 100 ? 0 : 1);
      g.appendChild(t);
    }
    svg.appendChild(g);

    const axis = el('g', { class:'chart-axis' });
    data.forEach((d, i) => {
      const x = pad.l + step * i + step / 2;
      const v = d.y ?? d.value;
      const h = (v / yRange) * (H - pad.t - pad.b);
      const y = H - pad.b - h;
      const fill = d.color || opts.color || cssVar('--accent') || '#B5FF3C';
      const r = el('rect', { x: x - barW / 2, y, width: barW, height: Math.max(2, h), class:'chart-bar', fill });
      r.setAttribute('rx', 4);
      r.addEventListener('mouseenter', () => r.style.filter = 'brightness(1.15)');
      r.addEventListener('mouseleave', () => r.style.filter = '');
      svg.appendChild(r);

      const t = el('text', { x, y: H - 6, 'text-anchor':'middle' });
      t.textContent = d.x ?? d.label;
      axis.appendChild(t);
    });
    svg.appendChild(axis);
    container.appendChild(svg);
  }

  /* --------------------------------------------------------
     SPARKLINE — small line, no axes
     -------------------------------------------------------- */
  function sparkline(container, data, opts={}) {
    container.innerHTML = '';
    const W = container.clientWidth || 100;
    const H = opts.height || 36;
    const min = Math.min(...data), max = Math.max(...data);
    const range = (max - min) || 1;
    const xStep = W / Math.max(1, data.length - 1);
    const xy = (i, v) => [i * xStep, H - 2 - ((v - min) / range) * (H - 4)];
    const pts = data.map((v, i) => xy(i, v));
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    const color = opts.color || cssVar('--accent');
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', width: '100%', height: H });
    svg.appendChild(el('path', { d, fill: 'none', stroke: color, 'stroke-width': 1.6, 'stroke-linecap':'round', 'stroke-linejoin':'round' }));
    svg.appendChild(el('circle', { cx: pts[pts.length-1][0], cy: pts[pts.length-1][1], r: 2.5, fill: color }));
    container.appendChild(svg);
  }

  /* --------------------------------------------------------
     GAUGE / RING — readiness score 0..100
     -------------------------------------------------------- */
  function ring(container, value, opts={}) {
    container.innerHTML = '';
    const size = opts.size || 132;
    const stroke = opts.stroke || 12;
    const r = (size / 2) - stroke / 2 - 2;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, value));
    const arc = (pct / 100) * c;
    const color =
      pct >= 75 ? cssVar('--success') :
      pct >= 55 ? cssVar('--warn')   :
                  cssVar('--danger');
    const svg = el('svg', { viewBox:`0 0 ${size} ${size}`, width: size, height: size });
    svg.appendChild(el('circle', {
      cx: size/2, cy: size/2, r,
      fill:'none', stroke: cssVar('--surface-2'), 'stroke-width': stroke
    }));
    const fg = el('circle', {
      cx: size/2, cy: size/2, r,
      fill:'none', stroke: color, 'stroke-width': stroke,
      'stroke-dasharray': `${arc} ${c}`,
      'stroke-dashoffset': 0,
      transform: `rotate(-90 ${size/2} ${size/2})`,
      'stroke-linecap':'round'
    });
    svg.appendChild(fg);

    const label = el('text', { x: size/2, y: size/2 + 2, 'text-anchor':'middle',
      'dominant-baseline':'middle',
      'font-family': cssVar('--font-display') || 'Space Grotesk',
      'font-weight':'700', 'font-size': size*0.28, fill: cssVar('--text') });
    label.textContent = Math.round(pct);
    svg.appendChild(label);

    const sub = el('text', { x: size/2, y: size/2 + size*0.22, 'text-anchor':'middle',
      'font-size': size*0.09, fill: cssVar('--muted') });
    sub.textContent = opts.label || 'READINESS';
    svg.appendChild(sub);

    container.appendChild(svg);
  }

  /* --------------------------------------------------------
     RADAR — quality balance
     -------------------------------------------------------- */
  function radar(container, dataObj, opts={}) {
    container.innerHTML = '';
    const labels = Object.keys(dataObj);
    const values = Object.values(dataObj);
    const W = container.clientWidth || 320;
    const H = opts.height || Math.min(W, 280);
    const cx = W/2, cy = H/2;
    const r = Math.min(W, H) / 2 - 28;
    const n = labels.length;
    const svg = el('svg', { class:'chart-svg', viewBox:`0 0 ${W} ${H}` });

    // rings
    const rings = 4;
    for (let k = 1; k <= rings; k++) {
      const rr = (r * k) / rings;
      svg.appendChild(el('circle', { cx, cy, r: rr, fill: 'none', stroke: cssVar('--border'), 'stroke-dasharray': '2 3' }));
    }
    // spokes
    for (let i = 0; i < n; i++) {
      const a = (-Math.PI/2) + (i * 2 * Math.PI / n);
      svg.appendChild(el('line', { x1: cx, y1: cy, x2: cx + r * Math.cos(a), y2: cy + r * Math.sin(a), stroke: cssVar('--border') }));
    }
    // polygon
    const pts = values.map((v, i) => {
      const a = (-Math.PI/2) + (i * 2 * Math.PI / n);
      const rr = r * Math.max(0, Math.min(100, v)) / 100;
      return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    svg.appendChild(el('polygon', { points: pts, fill: cssVar('--accent'), 'fill-opacity': 0.22, stroke: cssVar('--accent'), 'stroke-width': 2 }));
    // dots
    values.forEach((v, i) => {
      const a = (-Math.PI/2) + (i * 2 * Math.PI / n);
      const rr = r * Math.max(0, Math.min(100, v)) / 100;
      svg.appendChild(el('circle', { cx: cx + rr * Math.cos(a), cy: cy + rr * Math.sin(a), r: 3, fill: cssVar('--accent') }));
    });
    // labels
    labels.forEach((lab, i) => {
      const a = (-Math.PI/2) + (i * 2 * Math.PI / n);
      const lx = cx + (r + 16) * Math.cos(a);
      const ly = cy + (r + 16) * Math.sin(a);
      const t = el('text', { x: lx, y: ly, 'text-anchor':'middle', 'dominant-baseline':'middle', 'font-size':11, fill: cssVar('--muted') });
      t.textContent = lab;
      svg.appendChild(t);
    });
    container.appendChild(svg);
  }

  /* --------------------------------------------------------
     HEATMAP for adherence (7 col, N rows) or generic
     -------------------------------------------------------- */
  function heatmap(container, cells, opts={}) {
    // cells: array of {x, y, v (0..1), label}
    container.innerHTML = '';
    const cols = opts.cols || 7;
    const rows = opts.rows || Math.ceil(cells.length / cols);
    const W = container.clientWidth || 360;
    const cell = Math.floor((W - (cols + 1) * 4) / cols);
    const H = rows * (cell + 4) + 4;
    const svg = el('svg', { class:'chart-svg', viewBox:`0 0 ${W} ${H}` });
    cells.forEach((c) => {
      const x = 4 + c.x * (cell + 4);
      const y = 4 + c.y * (cell + 4);
      const a = Math.max(0.06, Math.min(1, c.v));
      const fill = `color-mix(in oklab, var(--accent) ${Math.round(a*90)}%, var(--surface-2))`;
      const r = el('rect', { x, y, width: cell, height: cell, rx: 4, fill });
      svg.appendChild(r);
      if (c.label) {
        const t = el('title');
        t.textContent = c.label;
        r.appendChild(t);
      }
    });
    container.appendChild(svg);
  }

  /* --------------------------------------------------------
     Acute:Chronic load (line)
     -------------------------------------------------------- */
  function acwrChart(container, data, opts={}) {
    container.innerHTML = '';
    const W = container.clientWidth || 480;
    const H = opts.height || 160;
    const pad = { l: 30, r: 12, t: 14, b: 22 };
    const yMax = Math.max(2, Math.max(...data) + 0.2);
    const yMin = 0;
    const yRange = yMax - yMin;
    const svg = el('svg', { class:'chart-svg', viewBox:`0 0 ${W} ${H}` });
    // safe zone .8..1.3
    const yFor = (v) => pad.t + (1 - (v - yMin)/yRange) * (H - pad.t - pad.b);
    const safeT = yFor(1.3), safeB = yFor(0.8);
    svg.appendChild(el('rect', { x: pad.l, y: safeT, width: W - pad.l - pad.r, height: safeB - safeT, fill: cssVar('--success-soft'), rx: 4 }));
    svg.appendChild(el('line', { x1: pad.l, x2: W - pad.r, y1: safeT, y2: safeT, stroke: cssVar('--success'), 'stroke-dasharray':'2 3' }));
    svg.appendChild(el('line', { x1: pad.l, x2: W - pad.r, y1: safeB, y2: safeB, stroke: cssVar('--success'), 'stroke-dasharray':'2 3' }));
    // line
    const xStep = (W - pad.l - pad.r) / Math.max(1, data.length - 1);
    const pts = data.map((v, i) => [pad.l + i * xStep, yFor(v)]);
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    svg.appendChild(el('path', { d, stroke: cssVar('--accent'), 'stroke-width': 2, fill:'none' }));
    pts.forEach(p => svg.appendChild(el('circle', { cx: p[0], cy: p[1], r: 2.5, fill: cssVar('--accent') })));
    // axis
    [0, 0.5, 1, 1.5, 2].forEach(v => {
      const y = yFor(v);
      const t = el('text', { x: pad.l - 6, y: y + 3, 'text-anchor':'end', class:'chart-axis', 'font-size': 10, fill: cssVar('--muted-2') });
      t.textContent = v.toFixed(1);
      svg.appendChild(t);
    });
    container.appendChild(svg);
  }

  /* --------------------------------------------------------
     Body soreness map — front silhouette w/ tinted regions
     -------------------------------------------------------- */
  function bodyMap(container, sore, opts={}) {
    // sore: object { neck, lShoulder, ..., rAnkle } (0..10)
    container.innerHTML = '';
    const W = 220, H = 360;
    const svg = el('svg', { class:'body-svg', viewBox:`0 0 ${W} ${H}` });
    const tint = (v) => {
      const a = Math.max(0.1, Math.min(1, v/8));
      if (v >= 6) return `color-mix(in oklab, var(--danger) ${Math.round(a*85)}%, var(--surface-2))`;
      if (v >= 3) return `color-mix(in oklab, var(--warn) ${Math.round(a*80)}%, var(--surface-2))`;
      return `color-mix(in oklab, var(--success) ${Math.round(a*80)}%, var(--surface-2))`;
    };
    const baseStroke = cssVar('--border-strong');

    function region(id, d, soreKey) {
      const v = sore[soreKey] ?? 0;
      const p = el('path', { d, fill: tint(v), stroke: baseStroke, 'stroke-width': 1 });
      const t = el('title');
      t.textContent = `${soreKey}: ${v}/10`;
      p.appendChild(t);
      svg.appendChild(p);
    }

    // head
    svg.appendChild(el('circle', { cx: 110, cy: 32, r: 22, fill: tint(0), stroke: baseStroke }));
    // neck
    region('neck', 'M 100 52 h 20 v 14 h -20 z', 'neck');
    // torso (one block, no fine subdivisions — chest/abs/upperBack averaged)
    const avgTorso = (sore.chest + sore.abs + sore.upperBack + sore.lowerBack) / 4;
    svg.appendChild(el('path', {
      d: 'M 78 68 L 142 68 L 152 96 L 152 168 L 132 178 L 88 178 L 68 168 L 68 96 Z',
      fill: tint(avgTorso), stroke: baseStroke
    }));
    // chest
    region('chest', 'M 88 76 L 132 76 L 130 100 L 90 100 Z', 'chest');
    // abs
    region('abs', 'M 92 108 L 128 108 L 128 152 L 92 152 Z', 'abs');
    // shoulders
    region('lShoulder', 'M 60 70 q -12 4 -8 26 l 18 -4 l -2 -22 z', 'lShoulder');
    region('rShoulder', 'M 160 70 q 12 4 8 26 l -18 -4 l 2 -22 z', 'rShoulder');
    // arms (L,R)
    svg.appendChild(el('rect', { x: 52, y: 92, width: 16, height: 80, rx: 8, fill: tint(0), stroke: baseStroke }));
    svg.appendChild(el('rect', { x: 152, y: 92, width: 16, height: 80, rx: 8, fill: tint(0), stroke: baseStroke }));
    // groin marker
    region('lGroin', 'M 92 178 L 108 178 L 108 192 L 92 192 z', 'lGroin');
    region('rGroin', 'M 112 178 L 128 178 L 128 192 L 112 192 z', 'rGroin');
    // legs
    region('lQuad', 'M 80 196 L 108 196 L 104 256 L 84 256 z', 'lQuad');
    region('rQuad', 'M 112 196 L 140 196 L 136 256 L 116 256 z', 'rQuad');
    region('lHam',  'M 80 196 L 108 196 L 108 220 L 80 220 z', 'lHam');     // hidden behind quad — same area
    region('rHam',  'M 112 196 L 140 196 L 140 220 L 112 220 z', 'rHam');
    // shins / calves
    region('lCalf', 'M 84 258 L 104 258 L 100 320 L 86 320 z', 'lCalf');
    region('rCalf', 'M 116 258 L 136 258 L 134 320 L 120 320 z', 'rCalf');
    // ankles
    region('lAnkle','M 86 322 L 100 322 L 100 336 L 86 336 z', 'lAnkle');
    region('rAnkle','M 120 322 L 134 322 L 134 336 L 120 336 z', 'rAnkle');
    // feet
    svg.appendChild(el('rect', { x: 80, y: 338, width: 26, height: 10, rx: 4, fill: tint(0), stroke: baseStroke }));
    svg.appendChild(el('rect', { x: 114, y: 338, width: 26, height: 10, rx: 4, fill: tint(0), stroke: baseStroke }));

    container.appendChild(svg);
  }

  /* --------------------------------------------------------
     Rugby pitch with positions (15s)
     -------------------------------------------------------- */
  function pitch(container, opts={}) {
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'pitch';
    // try lines
    const tryLine1 = document.createElement('div');
    tryLine1.className = 'pitch__line';
    tryLine1.style.cssText = 'left: 8%; top: 4%; bottom: 4%; width: 2px;';
    wrap.appendChild(tryLine1);
    const tryLine2 = tryLine1.cloneNode();
    tryLine2.style.cssText = 'right: 8%; top: 4%; bottom: 4%; width: 2px;';
    wrap.appendChild(tryLine2);
    // halfway
    const half = document.createElement('div');
    half.className = 'pitch__line';
    half.style.cssText = 'left: 50%; top: 4%; bottom: 4%; width: 2px;';
    wrap.appendChild(half);
    // 22s
    [.18,.34,.66,.82].forEach(p => {
      const l = document.createElement('div');
      l.className = 'pitch__line';
      l.style.cssText = `left:${p*100}%; top:8%; bottom:8%; width:1px; background:rgba(255,255,255,.18);`;
      wrap.appendChild(l);
    });

    // Position layout (x%, y%)
    const layout = {
      p1:{x:18,y:55},  p2:{x:20,y:48}, p3:{x:18,y:41},
      p4:{x:26,y:55},  p5:{x:26,y:41},
      p6:{x:33,y:60},  p7:{x:33,y:36}, p8:{x:36,y:48},
      p9:{x:44,y:48},  p10:{x:54,y:48},
      p12:{x:62,y:42}, p13:{x:70,y:54},
      p11:{x:80,y:64}, p14:{x:80,y:32}, p15:{x:85,y:48},
    };
    Object.entries(layout).forEach(([id, pt]) => {
      const pos = (window.RuckFit.POSITIONS).find(p=>p.id===id);
      const el = document.createElement('div');
      el.className = 'pitch__pos' + (opts.me === id ? ' is-me' : '');
      el.style.left = pt.x + '%';
      el.style.top  = pt.y + '%';
      el.innerHTML = `<div class="pitch__dot">${pos.number}</div><div class="pitch__label">${pos.name.replace(/\s*\(.*\)/,'')}</div>`;
      if (opts.onClick) el.addEventListener('click', () => opts.onClick(pos));
      wrap.appendChild(el);
    });

    container.appendChild(wrap);
  }

  window.RFCharts = { lineChart, barChart, sparkline, ring, radar, heatmap, acwrChart, bodyMap, pitch };
})();
