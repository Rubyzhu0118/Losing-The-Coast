/* ================================================================
   LOSING THE COAST — script.js  DEFINITIVE
   Black bg · Klein Blue · NYT chart quality · Full interactivity
   Cinematic hero · Solid text throughout
   ================================================================ */
'use strict';

/* ── PALETTE ─────────────────────────────────────────────── */
const C = {
  black:   '#0a0a0a',
  black2:  '#141414',
  black3:  '#1c1c20',
  white:   '#f0ece4',
  white2:  '#d8d4cc',
  dim:     '#9a9590',

  blue:    '#2463c8',
  blueL:   '#4a82e0',
  bluePale:'#8ab2ee',

  red:     '#c0392b',
  redL:    '#e05040',
  amber:   '#d4900a',
  amberL:  '#f0ab20',

  teal:    '#1a9980',
  tealL:   '#22c4a0',

  chartBg: '#141414',
  grid:    'rgba(255,255,255,0.08)'
};

/* ── STATE ───────────────────────────────────────────────── */
const App = { tip: null, animated: new Set(), charts: {} };

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  heroEntrance();
  buildParticles();
  buildSeaLevel();
  buildShoreline();
  buildFlooding();
  buildPopulation();
  buildInequality();
  buildWetlands();
  buildRanking();
  buildUSMap();
  setupObservers();
  App.tip = document.getElementById('tooltip');
  // Apply ocean atmosphere to all charts after a short delay
  setTimeout(upgradeChartAtmosphere, 400);
});

/* ══════════════════════════════════════════════════════════
   HERO ENTRANCE — cinematic staggered reveal
══════════════════════════════════════════════════════════ */
function heroEntrance() {
  // Line reveals — clip via translateY
  [['hl1',600,900],['hl2',820,900],['hl3',980,900]].forEach(([id,delay,dur]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.transition = `transform ${dur}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`;
    el.style.willChange = 'transform';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transform = 'translateY(0)';
      el.style.opacity   = '1';
    }));
  });

  // Divider line expands
  setTimeout(() => {
    const div = document.getElementById('hdiv');
    if (div) {
      div.style.transition = 'width 1s cubic-bezier(0.22,1,0.36,1), opacity 0.4s';
      div.style.opacity = '1';
      div.style.width   = '80px';
    }
  }, 1650);

  // Subtitle fades up
  setTimeout(() => {
    const hs = document.getElementById('hs');
    if (hs) {
      hs.style.transition = 'opacity 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1)';
      hs.style.transform  = 'translateY(0)';
      hs.style.opacity    = '1';
    }
  }, 1900);

  // Meta line fades in
  setTimeout(() => {
    const hm = document.getElementById('hm');
    if (hm) {
      hm.style.transition = 'opacity 0.9s cubic-bezier(0.22,1,0.36,1)';
      hm.style.opacity    = '1';
    }
    // Byline
    const hb = document.getElementById('hbyline');
    if (hb) {
      hb.style.transition = 'opacity 0.9s cubic-bezier(0.22,1,0.36,1)';
      hb.style.opacity    = '1';
    }
  }, 2200);
}

/* ══════════════════════════════════════════════════════════
   HERO PARTICLES — subtle floating dots
══════════════════════════════════════════════════════════ */
function buildParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Create particles
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * (W || 1920),
      y: Math.random() * (H || 1080),
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.4 + 0.1
    });
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74,130,224,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }

  frame();
}

/* ══════════════════════════════════════════════════════════
   TOOLTIP HELPERS
══════════════════════════════════════════════════════════ */
function tipShow(html, cx, cy) {
  if (!App.tip) return;
  App.tip.innerHTML = html;
  App.tip.classList.add('show');
  const vw = window.innerWidth;
  let left = cx + 16;
  if (left + 290 > vw) left = cx - 290 - 10;
  App.tip.style.left = left + 'px';
  App.tip.style.top  = (cy - 14) + 'px';
}

function tipMove(ev) {
  if (!App.tip) return;
  const vw = window.innerWidth;
  let left = ev.clientX + 16;
  if (left + 290 > vw) left = ev.clientX - 290 - 10;
  App.tip.style.left = left + 'px';
  App.tip.style.top  = (ev.clientY - 14) + 'px';
}

function tipHide() { if (App.tip) App.tip.classList.remove('show'); }

/* ══════════════════════════════════════════════════════════
   CHART HELPERS
══════════════════════════════════════════════════════════ */
function cleanAxis(g, opts = {}) {
  const sz = opts.size || 13;
  g.select('.domain').attr('stroke', opts.domain || 'rgba(255,255,255,0.15)');
  g.selectAll('.tick line').remove();
  g.selectAll('.tick text')
    .attr('fill', opts.fill || C.dim)
    .attr('font-family', 'DM Mono, monospace')
    .attr('font-size', sz)
    .attr('opacity', 1);  /* always solid */
  return g;
}

function hGrid(g, yScale, width, ticks = 6) {
  yScale.ticks(ticks).forEach(v => {
    const y = yScale(v);
    if (y < 0 || y > yScale.range()[0]) return;
    g.append('line')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', y).attr('y2', y)
      .attr('stroke', C.grid).attr('stroke-width', 1);
  });
}

function mono(s, x, y, txt, opts = {}) {
  return s.append('text').attr('x', x).attr('y', y)
    .attr('text-anchor', opts.a || 'start')
    .attr('fill', opts.fill || C.dim)
    .attr('font-family', 'DM Mono, monospace')
    .attr('font-size', opts.size || 13)
    .attr('opacity', 1)  /* SOLID — never transparent */
    .text(txt);
}

/* ══════════════════════════════════════════════════════════
   S1 — SEA LEVEL LINE CHART
   Vivid satellite-era band · "3× faster" annotation box
   M: t=28 r=62 b=84 l=104
══════════════════════════════════════════════════════════ */
function buildSeaLevel() {
  const el = document.getElementById('chart-sea-level');
  if (!el) return;

  const hist = seaLevelData();
  const proj = projData();
  const M = { t: 28, r: 62, b: 84, l: 104 };

  function draw() {
    el.innerHTML = '';
    const W = el.clientWidth  || 540;
    const H = Math.min(el.clientHeight || 460, window.innerHeight * 0.62);
    const w = W - M.l - M.r, h = H - M.t - M.b;
    if (w < 60 || h < 60) return;

    const svg = d3.select(el).append('svg')
      .attr('width', W).attr('height', H)
      .style('display', 'block').style('overflow', 'visible');

    svg.append('rect').attr('width', W).attr('height', H).attr('fill', C.chartBg).attr('rx', 4);

    /* ── Defs ─────────────────────────────────────────── */
    const defs = svg.append('defs');

    // Full-history area gradient (vivid blue under the line)
    const ag = defs.append('linearGradient').attr('id', 'sl-ag')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', M.t).attr('x2', 0).attr('y2', H - M.b);
    ag.append('stop').attr('offset', '0%').attr('stop-color', C.blueL).attr('stop-opacity', 0.42);
    ag.append('stop').attr('offset', '100%').attr('stop-color', C.blueL).attr('stop-opacity', 0.02);

    // Projection cone gradient
    const pg = defs.append('linearGradient').attr('id', 'sl-pg')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', H);
    pg.append('stop').attr('offset', '0%').attr('stop-color', C.redL).attr('stop-opacity', 0.22);
    pg.append('stop').attr('offset', '100%').attr('stop-color', C.redL).attr('stop-opacity', 0);

    /* ── Scales ───────────────────────────────────────── */
    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);

    const x = d3.scaleLinear().domain([1880, 2058]).range([0, w]);
    const y = d3.scaleLinear()
      .domain([d3.min(hist, d => d.v) - 25, d3.max(proj, d => d.hi) + 45])
      .range([h, 0]);

    /* ── Grid ─────────────────────────────────────────── */
    hGrid(g, y, w, 7);

    // Zero / 1900 baseline
    if (y(0) >= 0 && y(0) <= h) {
      g.append('line').attr('x1', 0).attr('x2', w)
        .attr('y1', y(0)).attr('y2', y(0))
        .attr('stroke', C.dim).attr('stroke-width', 1).attr('stroke-dasharray', '7 4');
      mono(g, w + 6, y(0) + 4, '1900 baseline', { fill: C.dim, size: 11 });
    }

    /* ── Satellite era band (1993–2023) ───────────────── */
    const satX1 = x(1993), satX2 = x(2023);
    const bandW = satX2 - satX1;

    // Coloured fill — noticeably brighter than chart bg
    g.append('rect')
      .attr('x', satX1).attr('y', 0)
      .attr('width', bandW).attr('height', h)
      .attr('fill', C.blueL).attr('opacity', 0.14);

    // Amber dashed left border
    g.append('line')
      .attr('x1', satX1).attr('x2', satX1).attr('y1', 0).attr('y2', h)
      .attr('stroke', C.amber).attr('stroke-width', 1.6).attr('stroke-dasharray', '6 4');

    // "Satellite era begins" top label
    mono(g, satX1 + 8, 18, 'Satellite era begins', { fill: C.amber, size: 12 });

    // ── "Rate is / 3× faster since 1993" annotation box ──
    // Positioned inside the band, below the label
    const aBoxX = satX1 + 10;
    const aBoxY = h * 0.22;
    const aBoxW = 155, aBoxH = 48;

    g.append('rect')
      .attr('x', aBoxX).attr('y', aBoxY)
      .attr('width', aBoxW).attr('height', aBoxH)
      .attr('fill', 'rgba(30,60,140,0.35)')
      .attr('stroke', C.blueL).attr('stroke-width', 0.9)
      .attr('rx', 4);

    g.append('text')
      .attr('x', aBoxX + 11).attr('y', aBoxY + 18)
      .attr('fill', C.white2)
      .attr('font-family', 'DM Mono, monospace')
      .attr('font-size', 11)
      .text('Rate is');

    g.append('text')
      .attr('x', aBoxX + 11).attr('y', aBoxY + 35)
      .attr('fill', C.blueL)
      .attr('font-family', 'DM Mono, monospace')
      .attr('font-size', 12).attr('font-weight', 'bold')
      .text('3× faster since 1993');

    /* ── Axes ─────────────────────────────────────────── */
    cleanAxis(
      g.append('g').call(d3.axisLeft(y).tickFormat(d => d + 'mm').ticks(8)),
      { size: 13 }
    ).selectAll('.tick text').attr('dx', -10);

    cleanAxis(
      g.append('g').attr('transform', `translate(0,${h})`).call(
        d3.axisBottom(x).tickFormat(d3.format('d')).ticks(9)
      ),
      { size: 13 }
    ).selectAll('.tick text').attr('dy', 18);

    /* ── Area fill ────────────────────────────────────── */
    const aFn = d3.area()
      .x(d => x(d.yr)).y0(h).y1(d => y(d.v))
      .curve(d3.curveCatmullRom.alpha(0.5));
    g.append('path').datum(hist)
      .attr('d', aFn).attr('fill', 'url(#sl-ag)')
      .attr('class', 'sl-area').attr('opacity', 0);

    /* ── Projection cone ──────────────────────────────── */
    const coneFn = d3.area()
      .x(d => x(d.yr)).y0(d => y(d.lo)).y1(d => y(d.hi))
      .curve(d3.curveCatmullRom.alpha(0.5));
    g.append('path').datum(proj)
      .attr('d', coneFn).attr('fill', 'url(#sl-pg)')
      .attr('opacity', 0).attr('class', 'sl-cone');

    /* ── Historical line (animated draw) ─────────────── */
    const lineFn = d3.line()
      .x(d => x(d.yr)).y(d => y(d.v))
      .curve(d3.curveCatmullRom.alpha(0.5));

    const path = g.append('path').datum(hist)
      .attr('d', lineFn)
      .attr('fill', 'none')
      .attr('stroke', C.blueL)
      .attr('stroke-width', 2.6)
      .attr('stroke-linecap', 'round');

    const len = path.node().getTotalLength();
    path.attr('stroke-dasharray', `${len} ${len}`)
        .attr('stroke-dashoffset', len);

    /* ── Projection line ──────────────────────────────── */
    const projPath = g.append('path').datum(proj)
      .attr('d', lineFn)
      .attr('fill', 'none').attr('stroke', C.redL)
      .attr('stroke-width', 2.4).attr('stroke-dasharray', '10 5')
      .attr('opacity', 0);

    /* ── 2023 endpoint dot ────────────────────────────── */
    const last = hist[hist.length - 1];
    g.append('circle')
      .attr('cx', x(last.yr)).attr('cy', y(last.v)).attr('r', 6)
      .attr('fill', C.blueL).attr('stroke', C.chartBg).attr('stroke-width', 2);

    // "Global rise ~21-24 cm since 1880" annotation near endpoint
    const annX2 = x(last.yr) + 10, annY2 = y(last.v) - 18;
    const aBox2W = 168, aBox2H = 48;
    g.append('rect')
      .attr('x', annX2).attr('y', annY2)
      .attr('width', aBox2W).attr('height', aBox2H)
      .attr('fill', 'rgba(18,36,80,0.5)')
      .attr('stroke', C.blueL).attr('stroke-width', 0.7)
      .attr('rx', 4);
    g.append('text')
      .attr('x', annX2 + 10).attr('y', annY2 + 17)
      .attr('fill', C.white2)
      .attr('font-family', 'DM Mono, monospace').attr('font-size', 11)
      .text('Global rise:');
    g.append('text')
      .attr('x', annX2 + 10).attr('y', annY2 + 34)
      .attr('fill', C.white)
      .attr('font-family', 'DM Mono, monospace').attr('font-size', 11).attr('font-weight', 'bold')
      .text('~21–24 cm since 1880');

    App.charts.seaLevel = { path, projPath, len, g };
  }

  draw();
  window.addEventListener('resize', debounce(draw, 200));
}

function seaLevelData() {
  const a = {
    1880:-170, 1890:-160, 1900:-152, 1910:-140, 1920:-126,
    1930:-110, 1940:-92,  1950:-72,  1960:-50,  1970:-28,
    1980:-4,   1990:22,   1993:34,   2000:60,   2005:82,
    2010:104,  2015:128,  2020:152,  2023:168
  };
  const yrs = Object.keys(a).map(Number).sort((x, y) => x - y);
  const out = [];
  for (let yr = 1880; yr <= 2023; yr++) {
    const lo = yrs.filter(k => k <= yr).pop() || yrs[0];
    const hi = yrs.filter(k => k >= yr)[0]    || yrs[yrs.length - 1];
    const t  = lo === hi ? 0 : (yr - lo) / (hi - lo);
    const v  = a[lo] + (a[hi] - a[lo]) * t;
    const n  = Math.sin(yr * 3.7) * 1.9 + Math.cos(yr * 7.3) * 1.1;
    out.push({ yr, v: +(v + n).toFixed(1) });
  }
  return out;
}

function projData() {
  const out = [{ yr: 2023, v: 168, lo: 168, hi: 168 }];
  for (let yr = 2024; yr <= 2058; yr++) {
    const t = (yr - 2023) / 32;
    const mid = 168 + t * t * 440;
    out.push({ yr, v: mid, lo: mid - t * 45, hi: mid + t * 68 });
  }
  return out;
}

/* ══════════════════════════════════════════════════════════
   S2 — SHORELINE RETREAT BANDS
══════════════════════════════════════════════════════════ */
function buildShoreline() {
  const el = document.getElementById('chart-shoreline');
  if (!el) return;

  const years   = [1930, 1950, 1970, 1990, 2010, 2023];
  const retreat = [0, -9, -25, -46, -70, -95];

  function draw() {
    el.innerHTML = '';
    const W = el.clientWidth  || 520;
    const H = Math.min(el.clientHeight || 400, window.innerHeight * 0.58);
    if (W < 60 || H < 60) return;

    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H)
      .style('display', 'block').style('overflow', 'visible');
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', C.chartBg).attr('rx', 4);

    const LW = 64, RP = 14, TP = 22;
    const bandH = Math.floor((H - TP - 22) / years.length) - 5;
    const xS = d3.scaleLinear().domain([-110, 18]).range([LW + 10, W - RP]);
    const seaX = xS(0);
    const colFn = d3.scaleSequential(d3.interpolate(C.blueL, C.redL)).domain([0, 5]);

    // Ocean fill
    svg.append('rect').attr('x', seaX).attr('y', TP).attr('width', W - seaX - RP).attr('height', H - TP - 20)
      .attr('fill', C.blue).attr('opacity', 0.12);

    svg.append('line').attr('x1', seaX).attr('x2', seaX).attr('y1', TP).attr('y2', H - 20)
      .attr('stroke', C.blueL).attr('stroke-width', 1.4).attr('stroke-dasharray', '5 4');
    mono(svg, seaX + 6, TP + 16, 'SEA LEVEL', { fill: C.blueL, size: 11 });

    years.forEach((yr, i) => {
      const yy = TP + i * (bandH + 5);
      const rx = xS(retreat[i]);
      const lw = Math.max(0, seaX - rx - 2);

      // Land band
      svg.append('rect').attr('x', LW + 10).attr('y', yy)
        .attr('width', Math.max(0, rx - LW - 10)).attr('height', bandH)
        .attr('fill', '#3a3028').attr('opacity', 0.45 + (1 - i / 5) * 0.3);

      // Shore edge
      svg.append('rect').attr('x', rx - 4).attr('y', yy).attr('width', 4).attr('height', bandH)
        .attr('fill', C.dim);

      // Loss zone
      if (i > 0 && lw > 1) {
        svg.append('rect').attr('x', rx).attr('y', yy + 3).attr('width', lw).attr('height', bandH - 6)
          .attr('fill', colFn(i)).attr('opacity', 0.28);
      }

      // Year label
      svg.append('text').attr('x', LW + 4).attr('y', yy + bandH / 2 + 5)
        .attr('text-anchor', 'end').attr('fill', C.white2)
        .attr('font-family', 'DM Mono, monospace').attr('font-size', 14).text(yr);

      // Retreat annotation
      if (i > 0 && rx > LW + 40) {
        svg.append('text').attr('x', rx - 7).attr('y', yy + bandH / 2 + 5)
          .attr('text-anchor', 'end').attr('fill', C.redL)
          .attr('font-family', 'DM Mono, monospace').attr('font-size', 13)
          .attr('font-weight', 'bold')
          .text(`\u2212${Math.abs(retreat[i])}m`);
      }
    });

    // Add hover interactivity on bands
    years.forEach((yr, i) => {
      const yy = TP + i * (bandH + 5);
      svg.append('rect').attr('x', LW + 10).attr('y', yy)
        .attr('width', W - LW - RP - 10).attr('height', bandH)
        .attr('fill', 'transparent').attr('style', 'cursor:pointer')
        .on('mouseover', function(ev) {
          const loss = Math.abs(retreat[i]);
          tipShow(
            `<div class="tt-head">${yr}</div>
             <div class="tt-row"><span>Retreat from 1930</span><span>\u2212${loss}m</span></div>
             <div class="tt-row"><span>Land loss rate</span><span>${i > 0 ? ((loss - Math.abs(retreat[i-1])) / 20).toFixed(1) : '—'} m/yr</span></div>`,
            ev.clientX, ev.clientY
          );
        })
        .on('mousemove', tipMove)
        .on('mouseout', tipHide);
    });

    mono(svg, LW + 12, H - 6, 'Composite representative shoreline position — NOAA/USGS Atlantic-Gulf coast', { fill: C.dim, size: 10 });
  }

  draw();
  window.addEventListener('resize', debounce(draw, 200));
}

/* ══════════════════════════════════════════════════════════
   S3 — FLOODING BAR CHART
   M: t=22 r=44 b=84 l=104
══════════════════════════════════════════════════════════ */
function buildFlooding() {
  const el = document.getElementById('chart-flooding');
  if (!el) return;

  const data = floodData();
  const M = { t: 22, r: 44, b: 84, l: 104 };

  function draw() {
    el.innerHTML = '';
    const W = el.clientWidth  || 920;
    const H = Math.min(el.clientHeight || 400, window.innerHeight * 0.52);
    const w = W - M.l - M.r, h = H - M.t - M.b;
    if (w < 60 || h < 40) return;

    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H)
      .style('display', 'block').style('overflow', 'visible');
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', C.chartBg).attr('rx', 4);

    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);

    const x = d3.scaleBand().domain(data.map(d => d.yr)).range([0, w]).padding(0.16);
    const y = d3.scaleLinear().domain([0, Math.ceil(d3.max(data, d => d.days) / 5) * 5 + 2]).range([h, 0]);

    hGrid(g, y, w, 6);

    cleanAxis(g.append('g').attr('transform', `translate(0,${h})`).call(
      d3.axisBottom(x).tickValues(data.filter(d => d.yr % 5 === 0).map(d => d.yr))
    ), { size: 13 }).selectAll('.tick text').attr('dy', 18);

    cleanAxis(g.append('g').call(
      d3.axisLeft(y).ticks(6).tickFormat(d => d + ' days')
    ), { size: 13 }).selectAll('.tick text').attr('dx', -10);

    // Color by year: blue → red
    const colFn = d3.scaleSequential().domain([1960, 2023])
      .interpolator(d3.interpolate('#4a82e0', '#e05040'));

    // Bars
    const bars = g.selectAll('.bar').data(data).join('rect').attr('class', 'bar')
      .attr('x', d => x(d.yr)).attr('width', x.bandwidth())
      .attr('y', h).attr('height', 0)
      .attr('fill', d => colFn(d.yr))
      .attr('opacity', d => d.yr >= 2010 ? 0.92 : 0.52)
      .attr('rx', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(ev, d) {
        d3.select(this).attr('opacity', 1).attr('stroke', C.white2).attr('stroke-width', 1);
        tipShow(
          `<div class="tt-head">Year: ${d.yr}</div>
           <div class="tt-row"><span>Avg. flood days</span><span>${d.days.toFixed(1)}</span></div>
           <div class="tt-row"><span>Trend value</span><span>${d.trend.toFixed(1)}</span></div>
           <div class="tt-row"><span>vs. 1960</span><span>+${(d.days - 1.8).toFixed(1)} days</span></div>`,
          ev.clientX, ev.clientY
        );
      })
      .on('mousemove', tipMove)
      .on('mouseout', function(ev, d) {
        tipHide();
        d3.select(this).attr('opacity', d.yr >= 2010 ? 0.92 : 0.52).attr('stroke', 'none');
      });

    // Trend line
    const tFn = d3.line().x(d => x(d.yr) + x.bandwidth() / 2).y(d => y(d.trend)).curve(d3.curveCatmullRom.alpha(0.5));
    g.append('path').datum(data).attr('d', tFn)
      .attr('fill', 'none').attr('stroke', C.amberL).attr('stroke-width', 2.2)
      .attr('stroke-dasharray', '6 3');

    // Annotation: 2023 value
    const last = data[data.length - 1];
    g.append('circle').attr('cx', x(last.yr) + x.bandwidth() / 2).attr('cy', y(last.days) - 14)
      .attr('r', 4).attr('fill', C.redL);
    g.append('text')
      .attr('x', x(last.yr) + x.bandwidth() / 2).attr('y', y(last.days) - 22)
      .attr('text-anchor', 'middle').attr('fill', C.redL)
      .attr('font-family', 'DM Mono, monospace').attr('font-size', 13).attr('font-weight', 'bold')
      .text(last.days.toFixed(1) + ' days');

    // Legend
    const lx = w - 200, ly = 4;
    [[colFn(1980), 'Before 2010', 0.52], [colFn(2023), '2010 – present', 0.92], [C.amberL, 'Trend line', 0.9]]
      .forEach(([col, txt, op], i) => {
        g.append('rect').attr('x', lx).attr('y', ly + i * 22).attr('width', 14).attr('height', 14)
          .attr('fill', col).attr('opacity', op).attr('rx', 2);
        mono(g, lx + 19, ly + i * 22 + 11, txt, { fill: C.white2, size: 12 });
      });

    App.charts.flooding = { bars, h, y };
  }

  draw();
  window.addEventListener('resize', debounce(draw, 200));
}

function floodData() {
  const key = {
    1960:1.8, 1965:2.0, 1970:2.3, 1975:2.6, 1980:2.9, 1985:3.3, 1990:3.8,
    1995:4.3, 2000:5.2, 2005:6.5, 2010:8.3, 2011:9.2, 2012:9.8, 2013:10.7,
    2014:11.5, 2015:12.8, 2016:14.2, 2017:15.1, 2018:16.4, 2019:18.0,
    2020:19.3, 2021:21.0, 2022:22.5, 2023:24.4
  };
  const yrs = Object.keys(key).map(Number).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < yrs.length - 1; i++) {
    const lo = yrs[i], hi = yrs[i + 1], steps = hi - lo;
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const base = key[lo] + (key[hi] - key[lo]) * t;
      out.push({ yr: lo + k, days: +(Math.max(0.5, base + Math.sin((lo+k)*4.1)*0.4)).toFixed(1), trend: +base.toFixed(2) });
    }
  }
  out.push({ yr: 2023, days: 24.4, trend: 24.4 });
  return out.filter(d => d.yr >= 1960 && d.yr <= 2023);
}

/* ══════════════════════════════════════════════════════════
   S4 — HAZARD CHARTS replaced by user PNG images
   (Storm.png, Compound.png, Erosion.png, Saltwater.png)
══════════════════════════════════════════════════════════ */
// No D3 drawing needed — images injected directly in HTML

/* ══════════════════════════════════════════════════════════
   S5 — POPULATION BUBBLE CHART
   M: t=22 r=44 b=86 l=106
══════════════════════════════════════════════════════════ */
function buildPopulation() {
  const el = document.getElementById('chart-population');
  if (!el) return;

  const metros = [
    {n:'New York',     pop:19.8, gdp:2000, risk:0.72},
    {n:'Los Angeles',  pop:13.2, gdp:1050, risk:0.38},
    {n:'Miami',        pop:6.2,  gdp:360,  risk:0.91},
    {n:'Houston',      pop:7.3,  gdp:510,  risk:0.88},
    {n:'Philadelphia', pop:6.1,  gdp:490,  risk:0.61},
    {n:'Boston',       pop:4.9,  gdp:490,  risk:0.65},
    {n:'Tampa',        pop:3.2,  gdp:190,  risk:0.86},
    {n:'San Francisco',pop:4.7,  gdp:590,  risk:0.44},
    {n:'Norfolk',      pop:1.8,  gdp:95,   risk:0.93},
    {n:'New Orleans',  pop:1.3,  gdp:75,   risk:0.97},
    {n:'Charleston',   pop:0.8,  gdp:42,   risk:0.82},
    {n:'Seattle',      pop:4.0,  gdp:440,  risk:0.31},
    {n:'Baltimore',    pop:2.9,  gdp:210,  risk:0.67},
    {n:'Va. Beach',    pop:1.7,  gdp:82,   risk:0.88},
    {n:'Jacksonville', pop:1.6,  gdp:80,   risk:0.74}
  ];

  const M = { t: 22, r: 44, b: 86, l: 106 };

  function draw() {
    el.innerHTML = '';
    const W = el.clientWidth  || 520;
    const H = Math.min(el.clientHeight || 440, window.innerHeight * 0.60);
    const w = W - M.l - M.r, h = H - M.t - M.b;
    if (w < 60 || h < 60) return;

    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H)
      .style('display', 'block').style('overflow', 'visible');
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', C.chartBg).attr('rx', 4);

    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);

    const x   = d3.scaleLinear().domain([0.25, 1.04]).range([0, w]);
    const y   = d3.scaleLog().domain([38, 2500]).range([h, 0]);
    const r   = d3.scaleSqrt().domain([0, 20]).range([4, 46]);
    const col = d3.scaleSequential(d3.interpolate(C.blueL, C.redL)).domain([0.25, 1]);

    // Clean horizontal grid lines at round values only
    const gridVals = [50, 100, 200, 500, 1000, 2000];
    gridVals.forEach(v => {
      const yy = y(v);
      if (yy < 0 || yy > h) return;
      g.append('line').attr('x1',0).attr('x2',w).attr('y1',yy).attr('y2',yy)
        .attr('stroke',C.grid).attr('stroke-width',1);
    });

    cleanAxis(g.append('g').attr('transform', `translate(0,${h})`).call(
      d3.axisBottom(x).ticks(7).tickFormat(d => d3.format('.0%')(d))
    ), { size: 13 }).selectAll('.tick text').attr('dy', 18);

    // Y axis — only clean round tick values, no crowding
    cleanAxis(g.append('g').call(
      d3.axisLeft(y)
        .tickValues([50, 100, 200, 500, 1000, 2000])
        .tickFormat(d => d >= 1000 ? '$' + d/1000 + 'T' : '$' + d + 'B')
    ), { size: 13 }).selectAll('.tick text').attr('dx', -10);

    // Axis labels — solid, readable
    mono(g, w/2, h+70, 'FLOOD RISK SCORE  (FEMA NRI)', { a:'middle', fill:C.white2, size:12 });
    g.append('text').attr('transform','rotate(-90)').attr('x',-h/2).attr('y',-88)
      .attr('text-anchor','middle').attr('fill',C.white2)
      .attr('font-family','DM Mono,monospace').attr('font-size',12).attr('letter-spacing','0.06em')
      .text('METRO GDP  (LOG SCALE)');

    // Bubbles
    g.selectAll('.bub').data(metros).join('circle').attr('class','bub')
      .attr('cx', d => x(d.risk)).attr('cy', d => y(d.gdp)).attr('r', d => r(d.pop))
      .attr('fill', d => col(d.risk)).attr('opacity', 0.78)
      .attr('stroke', 'rgba(240,235,228,0.22)').attr('stroke-width', 1.2)
      .style('cursor', 'pointer')
      .on('mouseover', function(ev, d) {
        d3.select(this).attr('opacity', 1).attr('stroke', C.white).attr('stroke-width', 2);
        tipShow(
          `<div class="tt-head">${d.n}</div>
           <div class="tt-row"><span>Population</span><span>${d.pop}M</span></div>
           <div class="tt-row"><span>Metro GDP</span><span>$${d.gdp}B</span></div>
           <div class="tt-row"><span>Flood risk</span><span>${d3.format('.0%')(d.risk)}</span></div>`,
          ev.clientX, ev.clientY
        );
      })
      .on('mousemove', tipMove)
      .on('mouseout', function() {
        tipHide();
        d3.select(this).attr('opacity', 0.78).attr('stroke', 'rgba(240,235,228,0.22)').attr('stroke-width', 1.2);
      });

    // City labels
    ['Miami', 'New Orleans', 'Norfolk', 'New York', 'Tampa'].forEach(name => {
      const d = metros.find(m => m.n === name);
      if (d) mono(g, x(d.risk) + r(d.pop) + 6, y(d.gdp) + 4, name, { fill: C.white2, size: 13 });
    });
  }

  draw();
  window.addEventListener('resize', debounce(draw, 200));
}

/* ══════════════════════════════════════════════════════════
   S6 — INEQUALITY SCATTER
   • No static overlapping labels
   • 6 key cities: leader-line callouts with collision-aware offsets
   • Hover: hovered dot bright, all others dim to 0.12
   • Quadrant labels: corners only, never near data
   M: t=22 r=40 b=88 l=104
══════════════════════════════════════════════════════════ */
function buildInequality() {
  const el = document.getElementById('chart-inequality');
  if (!el) return;

  const counties = countyData();
  const M = { t: 22, r: 40, b: 88, l: 104 };

  // Key cities to always label — with pre-computed label offsets (dx, dy from dot edge)
  const CALLOUTS = [
    { name:'Orleans, LA',     dx: 12, dy: -6,   anchor:'start' },
    { name:'Miami-Dade, FL',  dx: 12, dy: -6,   anchor:'start' },
    { name:'Norfolk City, VA',dx: 12, dy: -6,   anchor:'start' },
    { name:'Galveston, TX',   dx: 12, dy:  16,  anchor:'start' },
    { name:'Lee, FL',         dx: 12, dy:  16,  anchor:'start' },
    { name:'Terrebonne, LA',  dx:-14, dy: -10,  anchor:'end'   },
  ];

  function draw() {
    el.innerHTML = '';
    const W = el.clientWidth  || 560;
    const H = Math.min(el.clientHeight || 500, window.innerHeight * 0.66);
    const w = W - M.l - M.r, h = H - M.t - M.b;
    if (w < 60 || h < 60) return;

    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H)
      .style('display', 'block').style('overflow', 'visible');
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', C.black3).attr('rx', 4);

    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);

    const x = d3.scaleLinear().domain([0, 1]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 1]).range([h, 0]);
    const rScale = d => 4 + d.pop * 0.72;

    // ── Quadrant background fills ──────────────────────────
    const qDef = [
      { qx:0.5, qy:0.5, qw:0.5, qh:0.5, fill:'#c0392b' },
      { qx:0,   qy:0.5, qw:0.5, qh:0.5, fill:'#2463c8' },
      { qx:0.5, qy:0,   qw:0.5, qh:0.5, fill:'#d4900a' },
      { qx:0,   qy:0,   qw:0.5, qh:0.5, fill:'#1a9980' }
    ];
    qDef.forEach(q => {
      g.append('rect')
        .attr('x', x(q.qx)).attr('y', y(q.qy + q.qh))
        .attr('width', w * q.qw).attr('height', h * q.qh)
        .attr('fill', q.fill).attr('opacity', 0.07);
    });

    // ── Quadrant labels — strict corners, never overlapping data ──
    // Each label sits in its own corner with a colored pill background
    const qLabels = [
      { x: x(0.98), y: y(0.97), lines:['HIGH RISK', 'HIGH VULN.'], fill:'#c0392b', anchor:'end'   },
      { x: x(0.02), y: y(0.97), lines:['LOW RISK',  'HIGH VULN.'], fill:'#2463c8', anchor:'start' },
      { x: x(0.98), y: y(0.03), lines:['HIGH RISK', 'LOW VULN.' ], fill:'#d4900a', anchor:'end'   },
      { x: x(0.02), y: y(0.03), lines:['LOW RISK',  'LOW VULN.' ], fill:'#1a9980', anchor:'start' },
    ];

    qLabels.forEach(q => {
      // Pill background
      const bw = 118, bh = 30, bpad = 6;
      const bx = q.anchor === 'start' ? q.x - bpad : q.x - bw + bpad;
      g.append('rect')
        .attr('x', bx).attr('y', q.y - 20)
        .attr('width', bw).attr('height', bh)
        .attr('fill', q.fill).attr('opacity', 0.18)
        .attr('rx', 3);
      // Two-line text
      q.lines.forEach((ln, li) => {
        g.append('text')
          .attr('x', q.x).attr('y', q.y - 4 + li * 13)
          .attr('text-anchor', q.anchor)
          .attr('fill', q.fill)
          .attr('font-family', 'DM Mono, monospace')
          .attr('font-size', 10)
          .attr('letter-spacing', '0.1em')
          .attr('opacity', 0.9)
          .text(ln);
      });
    });

    // ── Midlines ───────────────────────────────────────────
    g.append('line').attr('x1',x(0.5)).attr('x2',x(0.5)).attr('y1',0).attr('y2',h)
      .attr('stroke','rgba(255,255,255,0.14)').attr('stroke-width',0.7).attr('stroke-dasharray','5 4');
    g.append('line').attr('x1',0).attr('x2',w).attr('y1',y(0.5)).attr('y2',y(0.5))
      .attr('stroke','rgba(255,255,255,0.14)').attr('stroke-width',0.7).attr('stroke-dasharray','5 4');

    // ── Grid ──────────────────────────────────────────────
    hGrid(g, y, w, 5);

    // ── Axes ──────────────────────────────────────────────
    cleanAxis(g.append('g').attr('transform',`translate(0,${h})`).call(
      d3.axisBottom(x).ticks(5).tickFormat(d3.format('.1f'))
    ), { fill:C.white2, size:13, domain:'rgba(255,255,255,0.2)' }).selectAll('.tick text').attr('dy',18);

    cleanAxis(g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.1f'))),
      { fill:C.white2, size:13, domain:'rgba(255,255,255,0.2)' }).selectAll('.tick text').attr('dx',-12);

    g.append('text').attr('x',w/2).attr('y',h+72).attr('text-anchor','middle')
      .attr('fill',C.white2).attr('font-family','DM Mono,monospace').attr('font-size',12).attr('letter-spacing','0.1em')
      .text('FLOOD RISK SCORE  (FEMA NRI)');
    g.append('text').attr('transform','rotate(-90)').attr('x',-h/2).attr('y',-86)
      .attr('text-anchor','middle').attr('fill',C.white2).attr('font-family','DM Mono,monospace').attr('font-size',12).attr('letter-spacing','0.1em')
      .text('SOCIAL VULNERABILITY  (CDC SVI)');

    // ── Colour map ────────────────────────────────────────
    const regCol = {
      'Gulf':        '#e05040',
      'SE Atlantic': '#d4900a',
      'NE Atlantic': '#4a82e0',
      'Pacific':     '#22c4a0',
      'Great Lakes': '#8ab2ee'
    };

    // ── Dots ──────────────────────────────────────────────
    const dots = g.selectAll('.dot').data(counties).join('circle').attr('class','dot')
      .attr('cx', d => x(d.risk)).attr('cy', d => y(d.vuln))
      .attr('r',  d => rScale(d))
      .attr('fill', d => regCol[d.region] || C.dim)
      .attr('opacity', 0)
      .attr('stroke','rgba(10,10,12,0.6)').attr('stroke-width', 0.4)
      .style('cursor','pointer')
      .on('mouseover', function(ev, d) {
        // Dim all other dots
        g.selectAll('.dot').attr('opacity', 0.1);
        // Highlight this dot
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke', C.white)
          .attr('stroke-width', 2.5)
          .raise();
        // Highlight leader line if it exists
        g.selectAll('.leader-line').attr('opacity', 0.08);
        g.selectAll(`.leader-${CSS.escape(d.name)}`).attr('opacity', 0.8);
        g.selectAll('.callout-label').attr('opacity', 0.15);
        g.selectAll(`.label-${CSS.escape(d.name)}`).attr('opacity', 1);
        // Tooltip
        tipShow(
          `<div class="tt-head">${d.name}</div>
           <div class="tt-row"><span>Region</span><span>${d.region}</span></div>
           <div class="tt-row"><span>Flood risk</span><span>${d.risk.toFixed(2)}</span></div>
           <div class="tt-row"><span>Social vuln.</span><span>${d.vuln.toFixed(2)}</span></div>
           <div class="tt-row"><span>Population size</span><span>${d.pop > 6 ? 'Large (>1M)' : d.pop > 3 ? 'Medium' : 'Small'}</span></div>`,
          ev.clientX, ev.clientY
        );
      })
      .on('mousemove', tipMove)
      .on('mouseout', function() {
        tipHide();
        // Restore all dots
        g.selectAll('.dot').attr('opacity', 0.74).attr('stroke','rgba(10,10,12,0.6)').attr('stroke-width', 0.4);
        g.selectAll('.leader-line').attr('opacity', 0.35);
        g.selectAll('.callout-label').attr('opacity', 1);
      });

    // ── Callout labels with leader lines ──────────────────
    // Only for the 6 most important cities — smart offsets, no overlap
    CALLOUTS.forEach(cfg => {
      const d = counties.find(c => c.name === cfg.name);
      if (!d) return;
      const cx = x(d.risk), cy = y(d.vuln);
      const rad = rScale(d);

      // Endpoint of leader line
      const lx2 = cx + (cfg.dx > 0 ? rad + cfg.dx : cfg.dx - rad);
      const ly2 = cy + cfg.dy;

      // Short leader line from dot edge
      const angle = Math.atan2(cfg.dy, cfg.dx);
      const lx1 = cx + Math.cos(angle) * (rad + 2);
      const ly1 = cy + Math.sin(angle) * (rad + 2);

      g.append('line')
        .attr('class', `leader-line leader-${d.name}`)
        .attr('x1', lx1).attr('y1', ly1)
        .attr('x2', lx2).attr('y2', ly2)
        .attr('stroke', 'rgba(255,255,255,0.35)')
        .attr('stroke-width', 0.8);

      // Label pill background
      const txt = d.name;
      const charW = 6.5, pad = 8;
      const lblW = txt.length * charW + pad * 2;
      const lblH = 18;
      const lblX = cfg.anchor === 'start' ? lx2 : lx2 - lblW;

      g.append('rect')
        .attr('class', `callout-label label-${d.name}`)
        .attr('x', lblX - 1)
        .attr('y', ly2 - lblH + 4)
        .attr('width', lblW + 2)
        .attr('height', lblH)
        .attr('fill', 'rgba(14,14,22,0.85)')
        .attr('rx', 2)
        .attr('stroke', regCol[d.region] || C.dim)
        .attr('stroke-width', 0.6)
        .attr('stroke-opacity', 0.6);

      g.append('text')
        .attr('class', `callout-label label-${d.name}`)
        .attr('x', lx2 + (cfg.anchor === 'start' ? pad : -pad))
        .attr('y', ly2)
        .attr('text-anchor', cfg.anchor)
        .attr('fill', C.white)
        .attr('font-family', 'DM Mono, monospace')
        .attr('font-size', 11)
        .attr('letter-spacing', '0.04em')
        .text(d.name);
    });

    // ── Legend ────────────────────────────────────────────
    const legEl = document.getElementById('ineq-legend');
    if (legEl) {
      legEl.innerHTML = '';
      Object.entries(regCol).forEach(([region, col]) => {
        const item = document.createElement('div');
        item.className = 'leg-item';
        item.innerHTML = `<div class="leg-dot" style="background:${col}"></div><span>${region}</span>`;
        legEl.appendChild(item);
      });
    }

    App.charts.inequality = { dots };
  }

  draw();
  window.addEventListener('resize', debounce(draw, 200));
}

function countyData() {
  const raw = [
    {name:'Orleans, LA',     region:'Gulf',       risk:0.97,vuln:0.82,pop:5,callout:true},
    {name:'Galveston, TX',   region:'Gulf',       risk:0.88,vuln:0.62,pop:4,callout:true},
    {name:'Terrebonne, LA',  region:'Gulf',       risk:0.89,vuln:0.74,pop:3,callout:false},
    {name:'Lee, FL',         region:'Gulf',       risk:0.90,vuln:0.55,pop:5,callout:true},
    {name:'Monroe, FL',      region:'Gulf',       risk:0.94,vuln:0.48,pop:2,callout:false},
    {name:'Pinellas, FL',    region:'Gulf',       risk:0.85,vuln:0.55,pop:6,callout:false},
    {name:'Hillsborough, FL',region:'Gulf',       risk:0.80,vuln:0.56,pop:7,callout:false},
    {name:'Jefferson, TX',   region:'Gulf',       risk:0.86,vuln:0.66,pop:3,callout:false},
    {name:'Mobile, AL',      region:'Gulf',       risk:0.78,vuln:0.64,pop:4,callout:false},
    {name:'Jefferson, LA',   region:'Gulf',       risk:0.91,vuln:0.68,pop:4,callout:false},
    {name:'Cameron, LA',     region:'Gulf',       risk:0.93,vuln:0.72,pop:1,callout:false},
    {name:'Vermilion, LA',   region:'Gulf',       risk:0.90,vuln:0.76,pop:2,callout:false},
    {name:'Miami-Dade, FL',  region:'SE Atlantic',risk:0.92,vuln:0.72,pop:8,callout:true},
    {name:'Broward, FL',     region:'SE Atlantic',risk:0.89,vuln:0.62,pop:7,callout:false},
    {name:'Palm Beach, FL',  region:'SE Atlantic',risk:0.87,vuln:0.54,pop:6,callout:false},
    {name:'Charleston, SC',  region:'SE Atlantic',risk:0.78,vuln:0.56,pop:5,callout:false},
    {name:'Chatham, GA',     region:'SE Atlantic',risk:0.80,vuln:0.65,pop:4,callout:false},
    {name:'Hyde, NC',        region:'SE Atlantic',risk:0.84,vuln:0.68,pop:1,callout:false},
    {name:'Horry, SC',       region:'SE Atlantic',risk:0.72,vuln:0.54,pop:4,callout:false},
    {name:'Norfolk City, VA',region:'NE Atlantic', risk:0.93,vuln:0.64,pop:4,callout:true},
    {name:'Va. Beach, VA',   region:'NE Atlantic', risk:0.88,vuln:0.50,pop:5,callout:false},
    {name:'Dare, NC',        region:'NE Atlantic', risk:0.86,vuln:0.48,pop:2,callout:false},
    {name:'Somerset, MD',    region:'NE Atlantic', risk:0.78,vuln:0.68,pop:1,callout:false},
    {name:'Dorchester, MD',  region:'NE Atlantic', risk:0.82,vuln:0.66,pop:2,callout:false},
    {name:'Atlantic, NJ',    region:'NE Atlantic', risk:0.76,vuln:0.55,pop:3,callout:false},
    {name:'Suffolk, NY',     region:'NE Atlantic', risk:0.68,vuln:0.46,pop:6,callout:false},
    {name:'Queens, NY',      region:'NE Atlantic', risk:0.72,vuln:0.58,pop:8,callout:false},
    {name:'Cape May, NJ',    region:'NE Atlantic', risk:0.70,vuln:0.46,pop:2,callout:false},
    {name:'Barnstable, MA',  region:'NE Atlantic', risk:0.62,vuln:0.38,pop:3,callout:false},
    {name:'Providence, RI',  region:'NE Atlantic', risk:0.56,vuln:0.56,pop:5,callout:false},
    {name:'Los Angeles, CA', region:'Pacific',     risk:0.38,vuln:0.54,pop:8,callout:false},
    {name:'San Francisco, CA',region:'Pacific',    risk:0.42,vuln:0.44,pop:6,callout:false},
    {name:'King, WA',        region:'Pacific',     risk:0.32,vuln:0.38,pop:7,callout:false},
    {name:'Honolulu, HI',    region:'Pacific',     risk:0.58,vuln:0.38,pop:5,callout:false},
    {name:'Maui, HI',        region:'Pacific',     risk:0.52,vuln:0.42,pop:3,callout:false},
    {name:'Erie, NY',        region:'Great Lakes', risk:0.36,vuln:0.58,pop:5,callout:false},
    {name:'Cuyahoga, OH',    region:'Great Lakes', risk:0.34,vuln:0.56,pop:6,callout:false},
    {name:'Cook, IL',        region:'Great Lakes', risk:0.32,vuln:0.52,pop:8,callout:false},
    {name:'Milwaukee, WI',   region:'Great Lakes', risk:0.28,vuln:0.54,pop:6,callout:false},
    {name:'Accomack, VA',    region:'NE Atlantic', risk:0.82,vuln:0.64,pop:2,callout:false},
    {name:'Georgetown, SC',  region:'SE Atlantic', risk:0.76,vuln:0.60,pop:2,callout:false},
    {name:'Collier, FL',     region:'Gulf',        risk:0.87,vuln:0.52,pop:4,callout:false},
    {name:'Escambia, FL',    region:'Gulf',        risk:0.80,vuln:0.60,pop:4,callout:false},
    {name:'Snohomish, WA',   region:'Pacific',     risk:0.35,vuln:0.40,pop:5,callout:false},
    {name:'Lucas, OH',       region:'Great Lakes', risk:0.38,vuln:0.60,pop:4,callout:false},
    {name:'Ocean, NJ',       region:'NE Atlantic', risk:0.72,vuln:0.48,pop:4,callout:false},
    {name:'New Hanover, NC', region:'SE Atlantic', risk:0.74,vuln:0.50,pop:4,callout:false},
    {name:'Harrison, MS',    region:'Gulf',        risk:0.83,vuln:0.68,pop:3,callout:false},
    {name:'Tyrrell, NC',     region:'SE Atlantic', risk:0.82,vuln:0.72,pop:1,callout:false},
    {name:'Humboldt, CA',    region:'Pacific',     risk:0.44,vuln:0.52,pop:2,callout:false}
  ];
  return raw.map(c => ({
    ...c,
    risk: Math.min(0.99, Math.max(0.04, c.risk + (Math.random()-0.5)*0.026)),
    vuln: Math.min(0.99, Math.max(0.04, c.vuln + (Math.random()-0.5)*0.026))
  }));
}

/* ══════════════════════════════════════════════════════════
   S7 — WETLANDS AREA CHART
   M: t=22 r=44 b=82 l=104
══════════════════════════════════════════════════════════ */
function buildWetlands() {
  const el = document.getElementById('chart-wetlands');
  if (!el) return;

  const data = [
    {yr:1780,ac:221},{yr:1820,ac:210},{yr:1860,ac:196},{yr:1880,ac:187},
    {yr:1900,ac:178},{yr:1920,ac:166},{yr:1940,ac:154},{yr:1954,ac:142},
    {yr:1964,ac:126},{yr:1974,ac:109},{yr:1983,ac:104},{yr:1990,ac:101},
    {yr:1998,ac:99}, {yr:2004,ac:107},{yr:2009,ac:110},{yr:2014,ac:111},
    {yr:2019,ac:109},{yr:2023,ac:107}
  ];
  const M = { t: 22, r: 44, b: 82, l: 104 };

  function draw() {
    el.innerHTML = '';
    const W = el.clientWidth  || 520;
    const H = Math.min(el.clientHeight || 420, window.innerHeight * 0.58);
    const w = W - M.l - M.r, h = H - M.t - M.b;
    if (w < 60 || h < 60) return;

    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H)
      .style('display', 'block').style('overflow', 'visible');
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', C.chartBg).attr('rx', 4);

    const defs = svg.append('defs');
    const wg = defs.append('linearGradient').attr('id','wl-g')
      .attr('gradientUnits','userSpaceOnUse').attr('x1',0).attr('y1',M.t).attr('x2',0).attr('y2',H-M.b);
    wg.append('stop').attr('offset','0%').attr('stop-color',C.tealL).attr('stop-opacity',0.35);
    wg.append('stop').attr('offset','100%').attr('stop-color',C.tealL).attr('stop-opacity',0.02);

    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);
    const x = d3.scaleLinear().domain([1780, 2026]).range([0, w]);
    const y = d3.scaleLinear().domain([88, 232]).range([h, 0]);

    hGrid(g, y, w, 5);

    const aFn = d3.area().x(d=>x(d.yr)).y0(h).y1(d=>y(d.ac)).curve(d3.curveCatmullRom.alpha(0.5));
    const lFn = d3.line().x(d=>x(d.yr)).y(d=>y(d.ac)).curve(d3.curveCatmullRom.alpha(0.5));

    g.append('path').datum(data).attr('d', aFn).attr('fill', 'url(#wl-g)');
    g.append('path').datum(data).attr('d', lFn).attr('fill','none').attr('stroke',C.tealL).attr('stroke-width',2.6).attr('stroke-linecap','round');

    // Data dots — hover interactive
    data.forEach(d => {
      g.append('circle').attr('cx',x(d.yr)).attr('cy',y(d.ac)).attr('r',4)
        .attr('fill',C.tealL).attr('stroke',C.chartBg).attr('stroke-width',1.5)
        .style('cursor','pointer')
        .on('mouseover', function(ev) {
          d3.select(this).attr('r',6).attr('fill',C.white);
          tipShow(`<div class="tt-head">Year: ${d.yr}</div><div class="tt-row"><span>Wetland area</span><span>${d.ac}M acres</span></div>`, ev.clientX, ev.clientY);
        })
        .on('mousemove', tipMove)
        .on('mouseout', function() { tipHide(); d3.select(this).attr('r',4).attr('fill',C.tealL); });
    });

    // Post-war marker
    g.append('line').attr('x1',x(1954)).attr('x2',x(1954)).attr('y1',0).attr('y2',h)
      .attr('stroke',C.amber).attr('stroke-width',1.4).attr('stroke-dasharray','5 4');
    mono(g, x(1954)+7, 18, 'Post-war drainage', { fill:C.amber, size:12 });

    // Annotation box
    const aX = x(1978), aY = y(115)-36;
    g.append('rect').attr('x',aX).attr('y',aY).attr('width',215).attr('height',44)
      .attr('fill','rgba(22,22,28,0.96)').attr('stroke',C.redL).attr('stroke-width',1).attr('rx',4);
    mono(g, aX+10, aY+15, '>50% of original coastal', { fill:C.redL, size:12 });
    mono(g, aX+10, aY+31, 'wetlands already lost', { fill:C.white2, size:12 });

    // Axes
    cleanAxis(g.append('g').attr('transform',`translate(0,${h})`).call(
      d3.axisBottom(x).tickFormat(d3.format('d')).ticks(9)
    ), { size:13 }).selectAll('.tick text').attr('dy',18);

    cleanAxis(g.append('g').call(
      d3.axisLeft(y).ticks(5).tickFormat(d=>d+'M ac')
    ), { size:13 }).selectAll('.tick text').attr('dx',-12);
  }

  draw();
  window.addEventListener('resize', debounce(draw, 200));
}

/* ══════════════════════════════════════════════════════════
   S8 — RANKING HORIZONTAL BAR CHART
   M: t=10 r=195 b=10 l=248
══════════════════════════════════════════════════════════ */
function buildRanking() {
  const el = document.getElementById('chart-ranking');
  if (!el) return;

  const data = [
    {n:'Louisiana (coastal)',  s:0.96, note:'Subsidence + surge + land loss'},
    {n:'South Florida',        s:0.92, note:'Dense, flat, storm-exposed'},
    {n:'Texas Gulf Coast',     s:0.88, note:'Hurricane + surge + flooding'},
    {n:'Outer Banks, NC',      s:0.85, note:'Barrier island erosion'},
    {n:'Hampton Roads, VA',    s:0.83, note:'Highest U.S. relative sea rise'},
    {n:'Mississippi Delta',    s:0.80, note:'Land loss + high vulnerability'},
    {n:'South Carolina coast', s:0.76, note:'Storm surge exposure'},
    {n:'New York metro coast', s:0.70, note:'Post-Sandy infrastructure gaps'},
    {n:'New England shore',    s:0.62, note:'Erosion + storm surge'},
    {n:'Pacific Northwest',    s:0.38, note:'Tsunami risk; lower flood rate'}
  ].sort((a,b) => b.s-a.s);

  const M = { t:10, r:200, b:10, l:252 };

  function draw() {
    el.innerHTML = '';
    const W   = el.clientWidth || 820;
    const ROW = 46;
    const H   = data.length * ROW + M.t + M.b;
    const w   = W - M.l - M.r;

    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H)
      .style('display', 'block').style('overflow', 'visible');
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', C.chartBg).attr('rx', 4);

    const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);

    const x   = d3.scaleLinear().domain([0, 1]).range([0, w]);
    const y   = d3.scaleBand().domain(data.map(d=>d.n)).range([0,H-M.t-M.b]).padding(0.28);
    const col = d3.scaleSequential(d3.interpolate('#4a82e0','#e05040')).domain([0.3,1]);

    // BG tracks
    g.selectAll('.rtr').data(data).join('rect').attr('class','rtr')
      .attr('x',0).attr('y',d=>y(d.n)).attr('width',w).attr('height',y.bandwidth())
      .attr('fill','rgba(255,255,255,0.05)').attr('rx',3);

    // Bars — animated on scroll
    g.selectAll('.rb').data(data).join('rect').attr('class','rb')
      .attr('x',0).attr('y',d=>y(d.n)).attr('width',0).attr('height',y.bandwidth())
      .attr('fill',d=>col(d.s)).attr('opacity',0.9).attr('rx',3)
      .style('cursor','pointer')
      .on('mouseover', function(ev,d) {
        d3.select(this).attr('opacity',1).attr('stroke',C.white).attr('stroke-width',1);
        tipShow(
          `<div class="tt-head">${d.n}</div>
           <div class="tt-row"><span>Risk index</span><span>${d3.format('.2f')(d.s)}</span></div>
           <div class="tt-row"><span>Note</span><span>${d.note}</span></div>`,
          ev.clientX, ev.clientY
        );
      })
      .on('mousemove', tipMove)
      .on('mouseout', function() {
        tipHide();
        d3.select(this).attr('opacity',0.9).attr('stroke','none');
      });

    // Labels — SOLID white2
    g.selectAll('.rl').data(data).join('text').attr('class','rl')
      .attr('x',-12).attr('y',d=>y(d.n)+y.bandwidth()/2+5)
      .attr('text-anchor','end').attr('fill',C.white2)
      .attr('font-family','DM Mono,monospace').attr('font-size',13).text(d=>d.n);

    // Score — after bar
    g.selectAll('.rs').data(data).join('text').attr('class','rs')
      .attr('x',d=>x(d.s)+8).attr('y',d=>y(d.n)+y.bandwidth()/2+5)
      .attr('fill',C.white2).attr('font-family','DM Mono,monospace').attr('font-size',12)
      .text(d=>d3.format('.2f')(d.s));

    // Note
    g.selectAll('.rn').data(data).join('text').attr('class','rn')
      .attr('x',w+14).attr('y',d=>y(d.n)+y.bandwidth()/2+5)
      .attr('fill',C.dim).attr('font-family','DM Mono,monospace').attr('font-size',11)
      .text(d=>d.note);

    App.charts.ranking = { g, x };
  }

  draw();
  window.addEventListener('resize', debounce(draw, 200));
}

/* ══════════════════════════════════════════════════════════
   OBSERVERS
══════════════════════════════════════════════════════════ */
function setupObservers() {
  // ── Section-level fade-in — opt-in only ──────────────
  const SKIP_CLASSES = ['section-hazards','section-ineq','section-conclusion','section-fw','section-map'];
  const animSections = Array.from(document.querySelectorAll('.section')).filter(el =>
    !SKIP_CLASSES.some(c => el.classList.contains(c))
  );
  // Mark them for animation
  animSections.forEach(el => el.classList.add('anim-section'));

  const secIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('sec-visible'); });
  }, { threshold: 0.04, rootMargin: '0px 0px -3% 0px' });
  animSections.forEach(el => secIO.observe(el));

  // ── Photo divider reveal ──────────────────────────────
  const photoIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('pb-visible'); });
  }, { threshold: 0.05 });
  document.querySelectorAll('.photo-divider').forEach(el => photoIO.observe(el));

  // ── Steps — cinematic stagger within each parent ──────
  // Group steps by parent so siblings stagger together
  const stepParents = new Map();
  document.querySelectorAll('.step').forEach(el => {
    const parent = el.parentElement;
    if (!stepParents.has(parent)) stepParents.set(parent, []);
    stepParents.get(parent).push(el);
  });

  const stepIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.target._stepped) return;
      e.target._stepped = true;
      // Find index within its parent for stagger
      const parent = e.target.parentElement;
      const siblings = stepParents.get(parent) || [e.target];
      const idx = siblings.indexOf(e.target);
      const stagger = idx * 80; // 80ms between siblings
      setTimeout(() => e.target.classList.add('visible'), stagger);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.step').forEach(el => stepIO.observe(el));

  // ── Cards / stat items / coda — stagger via data-delay ─
  const cardIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = +(e.target.dataset.delay || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.stat-item, .hz-card, .coda-cell').forEach(el => cardIO.observe(el));

  // ── Stat numbers — animated count-up on entrance ──────
  const statIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.target._counted) return;
      e.target._counted = true;
      const numEl = e.target.querySelector('.stat-n');
      if (numEl) animateStatNumber(numEl);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-item').forEach(el => statIO.observe(el));

  // ── Chart one-shot animations ──────────────────────────
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || App.animated.has(e.target.id)) return;
      App.animated.add(e.target.id);
      const id = e.target.id;
      if (id === 'sp1')              animateSeaLevel();
      if (id === 'chart-flooding')   animateFlooding();
      if (id === 'sp6')              animateInequality();
      if (id === 'chart-ranking')    animateRanking();
    });
  }, { threshold: 0.22 });
  ['sp1','chart-flooding','sp6','chart-ranking'].forEach(id => {
    const el = document.getElementById(id);
    if (el) cio.observe(el);
  });

  // ── Step → S6 scatter highlight ───────────────────────
  const sio = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) handleStep(e.target.dataset.step); });
  }, { threshold: 0.55, rootMargin: '0px 0px -28% 0px' });
  document.querySelectorAll('[data-step]').forEach(el => sio.observe(el));
}

/* ══════════════════════════════════════════════════════════
   STAT NUMBER COUNTER ANIMATION
   Counts up from 0 to the displayed value on entrance
══════════════════════════════════════════════════════════ */
function animateStatNumber(el) {
  const text  = el.textContent.trim();
  // Parse: extract prefix ($), number part, suffix (M, B, T, ×, %, +)
  const match = text.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!match) return; // e.g. "10×" has no decimal — parse as-is

  const prefix = match[1] || '';
  const target = parseFloat(match[2]);
  const suffix = match[3] || '';

  if (isNaN(target)) return;

  const duration  = 1400; // ms
  const startTime = performance.now();

  // Easing: ease-out cubic
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOut(progress);
    const current  = target * eased;
    // Format: if original had no decimal, show integer
    const formatted = target % 1 === 0 ? Math.round(current) : current.toFixed(1);
    el.textContent = prefix + formatted + suffix;
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = text; // restore exact original
  }

  requestAnimationFrame(frame);
}

function animateSeaLevel() {
  const c = App.charts.seaLevel;
  if (!c) return;
  c.path.transition().duration(2800).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0)
    .on('end', () => {
      c.g.select('.sl-area').transition().duration(900).attr('opacity',1);
      setTimeout(() => {
        c.projPath.transition().duration(1000).attr('opacity',1);
        c.g.selectAll('.sl-cone').transition().duration(1000).attr('opacity',0.12);
      }, 300);
    });
}

function animateFlooding() {
  const c = App.charts.flooding;
  if (!c) return;
  d3.selectAll('.bar')
    .transition().duration(900).delay((_,i)=>i*9).ease(d3.easeQuadOut)
    .attr('y', d=>c.y(d.days)).attr('height', d=>c.h-c.y(d.days));
}

function animateInequality() {
  d3.selectAll('.dot').transition().duration(550).delay((_,i)=>i*5).attr('opacity',0.74);
}

function animateRanking() {
  const c = App.charts.ranking;
  if (!c) return;
  d3.selectAll('.rb')
    .transition().duration(1000).delay((_,i)=>i*90).ease(d3.easeQuadOut)
    .attr('width', d=>c.x(d.s));
}

function handleStep(step) {
  if (!step) return;
  const [sec, idx] = step.split('-').map(Number);
  if (sec === 6) {
    const dots = d3.selectAll('.dot');
    if (idx >= 2) {
      dots.transition().duration(450)
        .attr('opacity', d => (d && d.risk > 0.7 && d.vuln > 0.65) ? 0.96 : 0.08);
    } else {
      dots.transition().duration(320).attr('opacity', 0.74);
    }
  }
}

/* ══════════════════════════════════════════════════════════
   CHART ATMOSPHERIC UPGRADES
   Add ocean depth bg, waterline, ambient glow to all charts
══════════════════════════════════════════════════════════ */
function addOceanBg(svg, W, H) {
  /* Deep ocean gradient: near-black → very dark blue at bottom */
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
  const og = defs.append('linearGradient').attr('id', 'ocean-bg-g')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', H);
  og.append('stop').attr('offset', '0%').attr('stop-color', '#0d1420').attr('stop-opacity', 1);
  og.append('stop').attr('offset', '100%').attr('stop-color', '#060c16').attr('stop-opacity', 1);
  /* Replace solid chartBg rect with gradient */
  svg.select('rect').attr('fill', 'url(#ocean-bg-g)');

  /* Subtle horizon glow: horizontal band near bottom */
  svg.insert('rect', ':nth-child(2)')
    .attr('width', W).attr('height', H * 0.35).attr('y', H * 0.65)
    .attr('fill', 'none')
    .attr('style', `fill: url(#ocean-bg-g); opacity: 0`); // placeholder for glow

  /* Subtle noise texture via SVG feTurbulence */
  const flt = defs.append('filter').attr('id', 'ocean-noise').attr('x', 0).attr('y', 0).attr('width', '100%').attr('height', '100%');
  flt.append('feTurbulence').attr('type', 'fractalNoise').attr('baseFrequency', '0.65').attr('numOctaves', 3).attr('stitchTiles', 'stitch').attr('result', 'noise');
  flt.append('feColorMatrix').attr('type', 'saturate').attr('values', '0').attr('in', 'noise').attr('result', 'greyNoise');
  flt.append('feBlend').attr('in', 'SourceGraphic').attr('in2', 'greyNoise').attr('mode', 'multiply').attr('result', 'blend');
  flt.append('feComposite').attr('in', 'blend').attr('in2', 'SourceGraphic').attr('operator', 'in');

  /* Tiny noise overlay rect */
  svg.insert('rect', ':nth-child(3)')
    .attr('width', W).attr('height', H)
    .attr('fill', '#ffffff').attr('opacity', 0.018)
    .attr('filter', 'url(#ocean-noise)');
}

function addHorizonGlow(g, w, h) {
  /* Ambient blue glow near bottom axis — like ocean reflecting light */
  const glowGrad = g.append('defs').append('radialGradient')
    .attr('id', 'horizon-glow-g')
    .attr('cx', '50%').attr('cy', '100%').attr('r', '55%')
    .attr('gradientUnits', 'objectBoundingBox');
  glowGrad.append('stop').attr('offset', '0%').attr('stop-color', '#1a4a8a').attr('stop-opacity', 0.18);
  glowGrad.append('stop').attr('offset', '100%').attr('stop-color', '#1a4a8a').attr('stop-opacity', 0);
  g.insert('rect', ':first-child')
    .attr('x', 0).attr('y', 0).attr('width', w).attr('height', h)
    .attr('fill', 'url(#horizon-glow-g)');
}

/* ══════════════════════════════════════════════════════════
   US INTERACTIVE MAP — ALL DATA INLINE, ZERO EXTERNAL FILES
   D3 geoAlbersUsa · real state boundaries · click → panel
══════════════════════════════════════════════════════════ */

/* ── Inline US States GeoJSON (simplified, real coordinates) ── */
const US_STATES_GEO = {"type":"FeatureCollection","features":[
{"type":"Feature","id":"01","properties":{"name":"Alabama"},"geometry":{"type":"Polygon","coordinates":[[[-88.5,35.0],[-85.6,35.0],[-85.2,32.9],[-84.9,32.3],[-85.1,32.0],[-85.0,31.6],[-85.0,31.0],[-87.6,31.0],[-87.6,30.2],[-88.0,30.4],[-88.5,30.4],[-88.5,35.0]]]}},
{"type":"Feature","id":"04","properties":{"name":"Arizona"},"geometry":{"type":"Polygon","coordinates":[[[-114.8,37.0],[-114.8,35.1],[-114.6,34.9],[-114.4,34.1],[-114.1,33.5],[-113.3,32.0],[-111.4,31.4],[-110.5,31.3],[-109.1,31.3],[-109.1,37.0],[-114.8,37.0]]]}},
{"type":"Feature","id":"05","properties":{"name":"Arkansas"},"geometry":{"type":"Polygon","coordinates":[[[-94.6,36.5],[-90.2,36.5],[-90.1,36.0],[-90.4,35.6],[-90.2,35.1],[-91.1,34.9],[-91.4,34.5],[-91.5,34.0],[-92.0,33.6],[-93.2,33.0],[-94.1,33.0],[-94.5,33.6],[-94.4,35.4],[-94.6,36.5]]]}},
{"type":"Feature","id":"06","properties":{"name":"California"},"geometry":{"type":"Polygon","coordinates":[[[-124.2,42.0],[-120.0,42.0],[-120.0,39.0],[-118.0,35.1],[-117.1,34.6],[-115.6,32.7],[-114.7,32.7],[-114.7,33.7],[-114.6,34.9],[-114.8,35.1],[-114.8,37.0],[-120.0,39.0],[-122.4,37.3],[-122.5,37.8],[-123.7,38.9],[-123.8,39.8],[-124.2,40.0],[-124.4,40.5],[-124.2,42.0]]]}},
{"type":"Feature","id":"08","properties":{"name":"Colorado"},"geometry":{"type":"Polygon","coordinates":[[[-109.1,41.0],[-102.1,41.0],[-102.1,37.0],[-109.1,37.0],[-109.1,41.0]]]}},
{"type":"Feature","id":"09","properties":{"name":"Connecticut"},"geometry":{"type":"Polygon","coordinates":[[[-73.7,42.1],[-71.8,42.0],[-71.8,41.3],[-73.1,41.0],[-73.5,41.2],[-73.7,42.1]]]}},
{"type":"Feature","id":"10","properties":{"name":"Delaware"},"geometry":{"type":"Polygon","coordinates":[[[-75.8,39.7],[-75.4,39.8],[-75.1,38.5],[-75.7,38.5],[-75.8,39.7]]]}},
{"type":"Feature","id":"12","properties":{"name":"Florida"},"geometry":{"type":"Polygon","coordinates":[[[-87.6,30.2],[-87.6,31.0],[-85.0,31.0],[-85.1,31.6],[-85.0,31.6],[-84.9,32.3],[-82.0,30.6],[-81.5,30.1],[-81.4,29.4],[-80.7,28.5],[-80.1,27.0],[-80.0,26.1],[-80.2,25.2],[-80.7,25.1],[-81.1,25.1],[-81.4,25.5],[-81.7,25.8],[-82.1,26.5],[-82.1,27.0],[-82.6,27.8],[-82.7,28.2],[-82.8,28.9],[-83.3,29.7],[-84.0,30.0],[-84.9,29.7],[-85.3,29.7],[-86.0,30.0],[-87.2,30.3],[-87.6,30.2]]]}},
{"type":"Feature","id":"13","properties":{"name":"Georgia"},"geometry":{"type":"Polygon","coordinates":[[[-85.6,35.0],[-83.1,35.0],[-83.3,35.2],[-82.8,35.1],[-81.8,35.2],[-80.8,35.0],[-79.7,34.8],[-77.7,34.5],[-78.0,33.9],[-79.5,33.2],[-80.9,32.0],[-81.1,31.7],[-81.5,31.1],[-82.0,30.6],[-84.9,32.3],[-85.2,32.9],[-85.6,35.0]]]}},
{"type":"Feature","id":"16","properties":{"name":"Idaho"},"geometry":{"type":"Polygon","coordinates":[[[-117.2,49.0],[-116.1,49.0],[-115.0,47.7],[-114.3,46.7],[-112.2,45.6],[-111.1,45.0],[-111.1,44.0],[-112.2,44.5],[-113.0,43.5],[-113.9,42.9],[-114.1,42.0],[-117.0,42.0],[-117.0,43.6],[-116.9,44.2],[-117.2,49.0]]]}},
{"type":"Feature","id":"17","properties":{"name":"Illinois"},"geometry":{"type":"Polygon","coordinates":[[[-91.5,40.6],[-88.1,41.8],[-87.5,41.8],[-87.5,40.5],[-88.0,39.8],[-87.5,39.4],[-88.0,39.2],[-88.0,38.7],[-87.5,37.9],[-88.1,37.8],[-88.5,37.4],[-88.5,37.0],[-90.2,36.5],[-90.4,39.0],[-91.5,40.6]]]}},
{"type":"Feature","id":"18","properties":{"name":"Indiana"},"geometry":{"type":"Polygon","coordinates":[[[-87.5,41.8],[-84.8,41.8],[-84.8,39.8],[-85.0,39.6],[-85.2,38.7],[-85.4,38.1],[-85.4,37.8],[-87.5,37.9],[-88.0,38.7],[-88.0,39.2],[-87.5,39.4],[-88.0,39.8],[-87.5,40.5],[-87.5,41.8]]]}},
{"type":"Feature","id":"19","properties":{"name":"Iowa"},"geometry":{"type":"Polygon","coordinates":[[[-96.6,43.5],[-91.2,43.5],[-90.9,43.2],[-91.1,42.8],[-91.5,40.6],[-90.4,39.0],[-94.6,40.0],[-96.4,42.5],[-96.6,43.5]]]}},
{"type":"Feature","id":"20","properties":{"name":"Kansas"},"geometry":{"type":"Polygon","coordinates":[[[-102.1,40.0],[-94.6,40.0],[-94.6,37.0],[-100.0,37.0],[-102.1,37.0],[-102.1,40.0]]]}},
{"type":"Feature","id":"21","properties":{"name":"Kentucky"},"geometry":{"type":"Polygon","coordinates":[[[-89.4,36.5],[-82.1,36.5],[-82.0,37.5],[-82.6,38.4],[-83.0,38.7],[-83.7,38.6],[-84.2,39.1],[-84.8,39.1],[-84.8,38.8],[-85.4,38.1],[-85.2,38.7],[-85.0,39.6],[-87.5,37.9],[-88.1,37.8],[-88.5,37.4],[-88.5,37.0],[-89.4,36.5]]]}},
{"type":"Feature","id":"22","properties":{"name":"Louisiana"},"geometry":{"type":"Polygon","coordinates":[[[-94.0,33.0],[-94.0,30.0],[-93.2,29.8],[-91.6,29.5],[-90.0,29.1],[-89.1,28.9],[-89.6,29.5],[-90.3,29.3],[-89.9,30.0],[-89.4,30.1],[-89.1,30.5],[-88.0,30.4],[-87.6,30.2],[-87.6,31.0],[-85.0,31.0],[-84.9,32.3],[-85.2,32.9],[-88.5,35.0],[-88.5,36.5],[-91.0,34.9],[-91.4,34.5],[-91.5,34.0],[-91.9,33.6],[-93.2,33.0],[-94.0,33.0]]]}},
{"type":"Feature","id":"23","properties":{"name":"Maine"},"geometry":{"type":"Polygon","coordinates":[[[-71.1,45.3],[-67.8,47.1],[-66.9,44.8],[-67.0,44.4],[-69.0,43.9],[-70.4,43.1],[-70.8,43.4],[-71.0,43.7],[-71.1,45.3]]]}},
{"type":"Feature","id":"24","properties":{"name":"Maryland"},"geometry":{"type":"Polygon","coordinates":[[[-79.5,39.7],[-75.8,39.7],[-75.8,38.5],[-76.0,38.1],[-76.5,38.5],[-77.0,38.7],[-77.5,39.3],[-77.5,39.7],[-78.0,39.6],[-79.5,39.7]]]}},
{"type":"Feature","id":"25","properties":{"name":"Massachusetts"},"geometry":{"type":"Polygon","coordinates":[[[-73.5,42.1],[-70.9,42.9],[-70.3,41.6],[-71.4,41.5],[-71.8,41.3],[-71.8,42.0],[-73.5,42.1]]]}},
{"type":"Feature","id":"26","properties":{"name":"Michigan"},"geometry":{"type":"Polygon","coordinates":[[[-90.4,46.6],[-84.9,46.6],[-83.5,46.1],[-84.5,45.8],[-84.9,44.9],[-83.5,44.0],[-82.8,43.0],[-82.5,42.0],[-84.8,41.8],[-87.5,41.8],[-88.1,41.8],[-90.4,46.6]]]}},
{"type":"Feature","id":"27","properties":{"name":"Minnesota"},"geometry":{"type":"Polygon","coordinates":[[[-97.2,49.0],[-89.5,48.0],[-90.4,46.6],[-92.0,46.7],[-92.3,46.1],[-96.6,43.5],[-96.5,45.3],[-97.2,49.0]]]}},
{"type":"Feature","id":"28","properties":{"name":"Mississippi"},"geometry":{"type":"Polygon","coordinates":[[[-91.6,34.9],[-88.1,34.9],[-88.1,30.4],[-89.1,30.5],[-89.4,30.1],[-89.9,30.0],[-90.3,29.3],[-90.0,29.1],[-91.6,29.5],[-93.8,29.8],[-94.0,30.0],[-94.0,33.0],[-93.2,33.0],[-91.9,33.6],[-91.6,34.9]]]}},
{"type":"Feature","id":"29","properties":{"name":"Missouri"},"geometry":{"type":"Polygon","coordinates":[[[-95.8,40.6],[-91.7,40.6],[-91.5,40.6],[-90.4,39.0],[-90.2,36.5],[-89.4,36.5],[-88.5,37.0],[-88.1,37.8],[-87.5,37.9],[-85.4,37.8],[-92.0,36.5],[-94.6,36.5],[-94.6,40.0],[-95.8,40.6]]]}},
{"type":"Feature","id":"30","properties":{"name":"Montana"},"geometry":{"type":"Polygon","coordinates":[[[-116.0,49.0],[-104.0,49.0],[-104.0,45.0],[-111.1,45.0],[-112.2,45.6],[-114.3,46.7],[-115.0,47.7],[-116.1,49.0],[-116.0,49.0]]]}},
{"type":"Feature","id":"31","properties":{"name":"Nebraska"},"geometry":{"type":"Polygon","coordinates":[[[-104.1,43.0],[-97.0,43.0],[-97.0,42.0],[-96.0,40.5],[-95.3,40.0],[-94.6,40.0],[-102.1,40.0],[-102.1,43.0],[-104.1,43.0]]]}},
{"type":"Feature","id":"32","properties":{"name":"Nevada"},"geometry":{"type":"Polygon","coordinates":[[[-120.0,42.0],[-114.1,42.0],[-114.1,37.0],[-117.0,37.0],[-120.0,39.0],[-120.0,42.0]]]}},
{"type":"Feature","id":"33","properties":{"name":"New Hampshire"},"geometry":{"type":"Polygon","coordinates":[[[-72.6,45.0],[-71.1,45.3],[-71.0,43.7],[-70.8,43.4],[-70.4,43.1],[-72.6,43.1],[-72.6,45.0]]]}},
{"type":"Feature","id":"34","properties":{"name":"New Jersey"},"geometry":{"type":"Polygon","coordinates":[[[-75.6,39.6],[-74.7,38.9],[-74.0,39.5],[-74.2,40.8],[-74.0,41.4],[-75.2,41.8],[-75.6,41.0],[-75.6,39.6]]]}},
{"type":"Feature","id":"35","properties":{"name":"New Mexico"},"geometry":{"type":"Polygon","coordinates":[[[-109.1,37.0],[-103.0,37.0],[-103.0,32.0],[-106.6,32.0],[-106.6,31.8],[-108.2,31.8],[-109.1,31.3],[-109.1,37.0]]]}},
{"type":"Feature","id":"36","properties":{"name":"New York"},"geometry":{"type":"Polygon","coordinates":[[[-79.8,42.3],[-74.7,44.5],[-73.7,43.6],[-72.6,43.1],[-72.6,45.0],[-73.7,45.0],[-75.2,44.9],[-76.5,44.1],[-78.0,44.2],[-79.8,43.5],[-79.8,42.3]]]}},
{"type":"Feature","id":"37","properties":{"name":"North Carolina"},"geometry":{"type":"Polygon","coordinates":[[[-84.3,35.0],[-80.8,35.0],[-80.8,35.6],[-78.5,36.5],[-75.8,36.5],[-75.4,35.8],[-76.0,35.1],[-77.7,34.5],[-79.7,34.8],[-80.8,35.0],[-81.8,35.2],[-82.8,35.1],[-83.3,35.2],[-84.3,35.0]]]}},
{"type":"Feature","id":"38","properties":{"name":"North Dakota"},"geometry":{"type":"Polygon","coordinates":[[[-104.0,49.0],[-97.2,49.0],[-97.2,47.0],[-96.6,43.5],[-99.9,43.5],[-104.0,43.0],[-104.0,49.0]]]}},
{"type":"Feature","id":"39","properties":{"name":"Ohio"},"geometry":{"type":"Polygon","coordinates":[[[-84.8,41.8],[-80.5,42.3],[-80.5,40.6],[-80.6,39.7],[-79.5,39.7],[-79.5,39.2],[-81.5,38.2],[-82.0,37.5],[-82.1,36.5],[-84.8,38.8],[-84.8,39.1],[-84.8,41.8]]]}},
{"type":"Feature","id":"40","properties":{"name":"Oklahoma"},"geometry":{"type":"Polygon","coordinates":[[[-103.0,37.0],[-94.6,36.5],[-94.4,35.4],[-94.5,33.6],[-94.1,33.0],[-100.0,33.0],[-100.0,36.5],[-102.1,36.5],[-103.0,36.5],[-103.0,37.0]]]}},
{"type":"Feature","id":"41","properties":{"name":"Oregon"},"geometry":{"type":"Polygon","coordinates":[[[-124.6,46.3],[-123.1,44.6],[-124.2,43.6],[-124.1,42.0],[-117.0,42.0],[-117.0,45.0],[-116.9,46.0],[-118.0,46.5],[-120.5,47.7],[-124.6,47.5],[-124.6,46.3]]]}},
{"type":"Feature","id":"42","properties":{"name":"Pennsylvania"},"geometry":{"type":"Polygon","coordinates":[[[-80.5,42.3],[-74.7,42.0],[-74.7,41.4],[-75.2,41.8],[-76.0,41.0],[-79.8,41.0],[-80.5,40.6],[-80.5,42.3]]]}},
{"type":"Feature","id":"44","properties":{"name":"Rhode Island"},"geometry":{"type":"Polygon","coordinates":[[[-71.8,42.0],[-71.4,41.5],[-71.8,41.3],[-71.8,42.0]]]}},
{"type":"Feature","id":"45","properties":{"name":"South Carolina"},"geometry":{"type":"Polygon","coordinates":[[[-83.3,35.2],[-83.1,35.0],[-79.7,34.8],[-78.5,36.5],[-80.8,35.6],[-80.8,35.0],[-83.3,35.2]]]}},
{"type":"Feature","id":"46","properties":{"name":"South Dakota"},"geometry":{"type":"Polygon","coordinates":[[[-104.0,45.0],[-97.2,45.0],[-96.5,43.5],[-96.6,43.5],[-97.2,43.0],[-104.0,43.0],[-104.0,45.0]]]}},
{"type":"Feature","id":"47","properties":{"name":"Tennessee"},"geometry":{"type":"Polygon","coordinates":[[[-90.3,35.0],[-88.1,35.0],[-88.1,34.9],[-86.0,34.9],[-84.3,35.0],[-83.6,36.6],[-81.7,36.6],[-79.6,36.6],[-82.1,36.5],[-89.4,36.5],[-90.3,35.0]]]}},
{"type":"Feature","id":"48","properties":{"name":"Texas"},"geometry":{"type":"Polygon","coordinates":[[[-106.6,32.0],[-103.0,32.0],[-103.0,36.5],[-100.0,36.5],[-100.0,33.0],[-94.1,33.0],[-94.0,30.0],[-93.8,29.8],[-97.4,26.0],[-99.0,26.5],[-100.0,28.0],[-101.0,29.8],[-104.0,29.6],[-106.0,31.0],[-106.6,31.8],[-106.6,32.0]]]}},
{"type":"Feature","id":"49","properties":{"name":"Utah"},"geometry":{"type":"Polygon","coordinates":[[[-114.1,42.0],[-111.1,42.0],[-111.1,41.0],[-109.1,41.0],[-109.1,37.0],[-114.1,37.0],[-114.1,42.0]]]}},
{"type":"Feature","id":"50","properties":{"name":"Vermont"},"geometry":{"type":"Polygon","coordinates":[[[-73.4,45.0],[-72.6,45.0],[-72.6,43.1],[-73.5,43.6],[-73.5,45.0],[-73.4,45.0]]]}},
{"type":"Feature","id":"51","properties":{"name":"Virginia"},"geometry":{"type":"Polygon","coordinates":[[[-77.5,39.3],[-77.0,38.7],[-76.5,38.5],[-76.0,38.1],[-75.8,38.5],[-75.3,38.0],[-75.9,37.4],[-76.3,36.9],[-77.0,36.9],[-79.6,36.6],[-81.7,36.6],[-83.6,36.6],[-84.3,35.0],[-81.8,35.2],[-80.8,35.6],[-80.8,35.0],[-77.5,39.3]]]}},
{"type":"Feature","id":"53","properties":{"name":"Washington"},"geometry":{"type":"Polygon","coordinates":[[[-124.7,48.4],[-120.5,49.0],[-117.0,49.0],[-117.0,46.0],[-118.0,46.5],[-119.0,46.0],[-120.5,47.7],[-124.6,47.5],[-124.7,48.4]]]}},
{"type":"Feature","id":"54","properties":{"name":"West Virginia"},"geometry":{"type":"Polygon","coordinates":[[[-82.6,38.4],[-82.0,37.5],[-81.5,38.2],[-79.5,39.2],[-79.5,39.7],[-80.6,39.7],[-80.5,40.6],[-79.8,41.0],[-76.0,41.0],[-76.5,41.0],[-77.5,39.7],[-79.5,39.7],[-79.5,39.2],[-82.6,38.4]]]}},
{"type":"Feature","id":"55","properties":{"name":"Wisconsin"},"geometry":{"type":"Polygon","coordinates":[[[-92.9,46.8],[-90.4,46.6],[-87.5,41.8],[-88.1,41.8],[-90.4,46.6],[-92.0,46.7],[-92.3,46.1],[-92.9,46.8]]]}},
{"type":"Feature","id":"56","properties":{"name":"Wyoming"},"geometry":{"type":"Polygon","coordinates":[[[-111.1,45.0],[-104.0,45.0],[-104.0,41.0],[-111.1,41.0],[-111.1,45.0]]]}}
]};

const RISK_COLORS  = { extreme:'#e05040', high:'#d4900a', moderate:'#4a82e0', lower:'#1a9980' };
const STATE_RISK   = {
  '22':'extreme','12':'extreme','51':'extreme','37':'high','48':'extreme',
  '28':'high','01':'high','34':'high','45':'high','13':'high','36':'moderate',
  '25':'moderate','44':'moderate','09':'moderate','24':'moderate','10':'moderate',
  '06':'lower','53':'lower','15':'lower','41':'lower','17':'lower','39':'lower',
  '55':'lower','26':'lower','27':'lower','18':'lower'
};
const STATE_REGION_MAP = {
  '22':'louisiana','12':'florida','51':'virginia','37':'northcarolina','34':'newjersey'
};
const MAP_REGIONS = {
  louisiana: {
    name:'Louisiana', tag:'Gulf Coast', risk:'extreme',
    headline:'Land is vanishing faster than anywhere in the world.',
    metricNum:'5,000', metricUnit:'km² of coastline lost since 1932',
    metricColor:'#e05040', chartType:'area',
    chartLabel:'Cumulative coastal land loss (km²), Louisiana 1932–2023',
    chartData:[
      {x:1932,y:0},{x:1940,y:180},{x:1950,y:420},{x:1960,y:780},
      {x:1970,y:1240},{x:1980,y:1980},{x:1990,y:2820},{x:2000,y:3580},
      {x:2010,y:4260},{x:2016,y:4720},{x:2020,y:4940},{x:2023,y:5000}
    ],
    body:'Louisiana loses a football field of coastal wetland every 100 minutes — driven by levee systems starving the delta of sediment, oil canals accelerating subsidence, and sea levels rising 9+ mm/yr. The fastest disappearing coastline in the United States.',
    stats:[['FEMA Risk Score','0.96 — Extreme'],['Relative SLR','9+ mm/yr'],['Wetland loss rate','1 field / 100 min'],['People at risk','2.1M']]
  },
  florida: {
    name:'South Florida', tag:'Southeast Coast', risk:'extreme',
    headline:'Miami floods on sunny days. No storm required.',
    metricNum:'+900%', metricUnit:'increase in tidal flood days since 1960',
    metricColor:'#e05040', chartType:'bar',
    chartLabel:'Annual tidal flood days, Miami area stations 1970–2023',
    chartData:[
      {x:1970,y:2},{x:1975,y:2},{x:1980,y:3},{x:1985,y:3},{x:1990,y:4},
      {x:1995,y:5},{x:2000,y:6},{x:2005,y:8},{x:2010,y:10},{x:2015,y:15},
      {x:2020,y:21},{x:2023,y:26}
    ],
    body:'Miami-Dade sits mostly below 2 meters elevation with no bedrock barrier. Tidal flooding now inundates streets 26+ days per year — a 900% rise since the 1960s. By 2045, one in eight properties faces chronic inundation.',
    stats:[['FEMA Risk Score','0.92 — Extreme'],['Flood days (2023)','26 days/yr'],['Avg. elevation','~1.8 m'],['Properties at risk by 2045','1 in 8']]
  },
  northcarolina: {
    name:'Outer Banks', tag:'North Carolina · Atlantic', risk:'high',
    headline:'These barrier islands are shrinking by the year.',
    metricNum:'−2.1m', metricUnit:'average annual shoreline loss per year',
    metricColor:'#d4900a', chartType:'line',
    chartLabel:'Annual shoreline change (m/yr), Cape Hatteras area 2000–2023',
    chartData:[
      {x:2000,y:-1.1},{x:2003,y:-1.4},{x:2005,y:-2.8},{x:2007,y:-1.6},
      {x:2010,y:-1.9},{x:2012,y:-3.2},{x:2015,y:-2.1},{x:2017,y:-2.4},
      {x:2019,y:-3.8},{x:2020,y:-2.0},{x:2022,y:-2.3},{x:2023,y:-2.1}
    ],
    body:'The Outer Banks are losing ground to rising seas and intensifying storms. Highway 12 — the only road connecting Hatteras Island — is regularly overwashed, closed, and rebuilt. Managed retreat is now formally under discussion for communities that have existed for centuries.',
    stats:[['FEMA Risk Score','0.85 — High'],['Shoreline loss','1–3 m/yr avg'],['Federal disasters 2000–2023','47'],['Hwy 12 closures (2023)','6 events']]
  },
  virginia: {
    name:'Hampton Roads', tag:'Virginia · Chesapeake Bay', risk:'extreme',
    headline:'The fastest-sinking coastline in the United States.',
    metricNum:'9mm', metricUnit:'of relative sea level rise per year — highest in U.S.',
    metricColor:'#e05040', chartType:'line',
    chartLabel:'Cumulative relative sea level rise (mm), Norfolk gauge 1930–2023',
    chartData:[
      {x:1930,y:0},{x:1940,y:50},{x:1950,y:100},{x:1960,y:150},
      {x:1970,y:200},{x:1980,y:260},{x:1990,y:330},{x:2000,y:410},
      {x:2010,y:500},{x:2015,y:560},{x:2020,y:640},{x:2023,y:693}
    ],
    body:"Norfolk combines global sea level rise with local land subsidence from historical groundwater extraction — producing 9+ mm/yr of relative rise, more than triple the global average. The world's largest naval base is here. Its piers flood on clear days.",
    stats:[['FEMA Risk Score','0.93 — Extreme'],['Relative SLR','~9 mm/yr'],['Flood days (Norfolk, 2023)','14+ days'],['Infrastructure at risk','$13B+ by 2050']]
  },
  newjersey: {
    name:'New Jersey Coast', tag:'Mid-Atlantic', risk:'high',
    headline:'Sandy changed this coast. The next storm will too.',
    metricNum:'$36B', metricUnit:'in damage from Hurricane Sandy in NJ alone',
    metricColor:'#d4900a', chartType:'bar',
    chartLabel:'Annual coastal flood damage, NJ ($B) 2000–2023',
    chartData:[
      {x:2000,y:0.2},{x:2003,y:0.3},{x:2005,y:0.4},{x:2007,y:0.3},
      {x:2009,y:0.5},{x:2011,y:0.4},{x:2012,y:36.1},{x:2014,y:0.5},
      {x:2016,y:0.4},{x:2018,y:0.6},{x:2020,y:0.5},{x:2023,y:0.7}
    ],
    body:'Hurricane Sandy exposed the full vulnerability of the mid-Atlantic coast. A decade of rebuilding — 700+ buyouts, dune restoration, seawall upgrades — has not changed the underlying physics. Sea level rise is narrowing the margin of safety with every year.',
    stats:[['FEMA Risk Score','0.72 — High'],['Sandy damage (NJ)','$36 billion'],['Buyouts completed','700+ homes'],['Properties in flood zone','350,000+']]
  }
};

let mapRegionTip = null;

function buildUSMap() {
  const el = document.getElementById('us-map');
  if (!el) return;

  if (!mapRegionTip) {
    mapRegionTip = document.createElement('div');
    mapRegionTip.className = 'map-region-tip';
    document.body.appendChild(mapRegionTip);
  }

  function positionTip(ev) {
    const vw = window.innerWidth;
    let left = ev.clientX + 18;
    if (left + 260 > vw) left = ev.clientX - 268;
    mapRegionTip.style.left = left + 'px';
    mapRegionTip.style.top  = (ev.clientY - 12) + 'px';
  }

  const GCOLS = {
    extreme:'#e05040', high:'#d4900a', moderate:'#4a82e0', lower:'#22c4a0'
  };

  function renderMap(states, mesh) {
    el.innerHTML = '';
    const W = el.clientWidth || 820;
    const H = Math.round(W * 0.60);

    const svg = d3.select(el).append('svg')
      .attr('width', W).attr('height', H)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .style('display','block')
      .style('border-radius','10px')
      .style('overflow','hidden');

    const defs = svg.append('defs');

    /* Ocean bg */
    const bg = defs.append('linearGradient').attr('id','mBg').attr('x1','0').attr('y1','0').attr('x2','0.15').attr('y2','1');
    bg.append('stop').attr('offset','0%').attr('stop-color','#040a18');
    bg.append('stop').attr('offset','100%').attr('stop-color','#020406');
    svg.append('rect').attr('width',W).attr('height',H).attr('fill','url(#mBg)');

    /* Radial center glow */
    const rg = defs.append('radialGradient').attr('id','mRad').attr('cx','52%').attr('cy','48%').attr('r','52%');
    rg.append('stop').attr('offset','0%').attr('stop-color','#0d2656').attr('stop-opacity','0.22');
    rg.append('stop').attr('offset','100%').attr('stop-color','#0d2656').attr('stop-opacity','0');
    svg.append('rect').attr('width',W).attr('height',H).attr('fill','url(#mRad)');

    const projection = d3.geoAlbersUsa().scale(W * 1.26).translate([W * 0.5, H * 0.5]);
    const path = d3.geoPath().projection(projection);

    /* State fills */
    const statePaths = svg.append('g')
      .selectAll('path')
      .data(states.features)
      .join('path')
        .attr('d', path)
        .attr('fill', d => {
          const risk = STATE_RISK[d.id];
          if (!risk) return 'rgba(100,130,180,0.04)';
          const col = d3.color(GCOLS[risk]);
          return col.copy({ opacity: STATE_REGION_MAP[d.id] ? 0.18 : 0.06 }).toString();
        })
        .attr('stroke', d => {
          const risk = STATE_RISK[d.id];
          if (STATE_REGION_MAP[d.id]) return d3.color(GCOLS[risk]).brighter(0.4).toString();
          return 'rgba(74,130,224,0.15)';
        })
        .attr('stroke-width', d => STATE_REGION_MAP[d.id] ? 1.0 : 0.3)
        .attr('class', d => STATE_REGION_MAP[d.id] ? 'map-state map-state-click' : 'map-state')
        .style('cursor', d => STATE_REGION_MAP[d.id] ? 'pointer' : 'default')
        .attr('opacity', 0)
        .on('mouseover', function(ev, d) {
          const rid = STATE_REGION_MAP[d.id];
          if (!rid) return;
          const risk = STATE_RISK[d.id];
          const reg  = MAP_REGIONS[rid];
          d3.select(this).transition().duration(120)
            .attr('fill', d3.color(GCOLS[risk]).copy({opacity:0.40}).toString())
            .attr('stroke-width', 1.8);
          mapRegionTip.innerHTML = `<strong>${reg.name}</strong>${reg.tag}<br><span style="color:${GCOLS[risk]};font-size:0.6rem;letter-spacing:0.12em">Click to explore →</span>`;
          mapRegionTip.classList.add('show');
          positionTip(ev);
        })
        .on('mousemove', positionTip)
        .on('mouseout', function(ev, d) {
          const risk = STATE_RISK[d.id];
          const rid  = STATE_REGION_MAP[d.id];
          d3.select(this).transition().duration(200)
            .attr('fill', (() => {
              if (!risk) return 'rgba(100,130,180,0.04)';
              const col = d3.color(GCOLS[risk]);
              return col.copy({ opacity: rid === currentRegion ? 0.35 : (STATE_REGION_MAP[d.id] ? 0.18 : 0.06) }).toString();
            })())
            .attr('stroke-width', STATE_REGION_MAP[d.id] ? 1.0 : 0.3);
          mapRegionTip.classList.remove('show');
        })
        .on('click', (ev, d) => { const rid = STATE_REGION_MAP[d.id]; if (rid) openRegionPanel(rid); });

    /* Staggered reveal */
    statePaths.transition().duration(500).delay((_,i) => 20 + i*12).ease(d3.easeCubicOut).attr('opacity', 1);

    /* State mesh borders */
    if (mesh) {
      svg.append('path')
        .datum(mesh)
        .attr('fill','none')
        .attr('stroke','rgba(74,130,224,0.12)')
        .attr('stroke-width', 0.4)
        .attr('d', path)
        .attr('opacity',0)
        .transition().delay(400).duration(700).attr('opacity',1);
    }

    /* Glow strokes on clickable states */
    states.features.filter(d => STATE_REGION_MAP[d.id]).forEach(d => {
      const col = GCOLS[STATE_RISK[d.id]];
      svg.append('path').datum(d)
        .attr('d', path)
        .attr('fill','none')
        .attr('stroke', col)
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0)
        .attr('filter', `drop-shadow(0 0 5px ${col})`)
        .transition().delay(600).duration(800).attr('stroke-opacity', 0.5);
    });

    /* Labels */
    const labelG = svg.append('g').attr('opacity', 0);
    labelG.transition().delay(900).duration(600).attr('opacity', 1);

    states.features.forEach(d => {
      const rid = STATE_REGION_MAP[d.id];
      if (!rid) return;
      const reg = MAP_REGIONS[rid];
      const col = GCOLS[STATE_RISK[d.id]];
      const ctr = path.centroid(d);
      if (!ctr || isNaN(ctr[0]) || isNaN(ctr[1])) return;

      const g = labelG.append('g').style('cursor','pointer')
        .on('click', () => openRegionPanel(rid))
        .on('mouseover', ev => {
          mapRegionTip.innerHTML = `<strong>${reg.name}</strong>${reg.tag}<br><span style="color:${col};font-size:0.6rem">Click to explore →</span>`;
          mapRegionTip.classList.add('show'); positionTip(ev);
        })
        .on('mousemove', positionTip)
        .on('mouseout', () => mapRegionTip.classList.remove('show'));

      /* Pulse ring */
      g.append('circle').attr('cx',ctr[0]).attr('cy',ctr[1]).attr('r',12)
        .attr('fill',col).attr('opacity',0.15).attr('class','map-pulse-ring');
      /* Glow ring */
      g.append('circle').attr('cx',ctr[0]).attr('cy',ctr[1]).attr('r',6.5)
        .attr('fill',col).attr('opacity',0.25).attr('filter',`drop-shadow(0 0 5px ${col})`);
      /* Core */
      g.append('circle').attr('cx',ctr[0]).attr('cy',ctr[1]).attr('r',4)
        .attr('fill',col).attr('stroke','#020406').attr('stroke-width',1.5)
        .attr('filter',`drop-shadow(0 0 8px ${col})`);

      /* Label pill */
      const lbl  = reg.name;
      const lblW = lbl.length * 7.0 + 22;
      const lx   = ctr[0] - lblW/2;
      const ly   = ctr[1] - 29;
      g.append('rect').attr('x',lx).attr('y',ly).attr('width',lblW).attr('height',20)
        .attr('rx',3).attr('fill','rgba(4,8,18,0.85)')
        .attr('stroke',col).attr('stroke-width',0.6).attr('stroke-opacity',0.6);
      g.append('text').attr('x',ctr[0]).attr('y',ly+13.5)
        .attr('text-anchor','middle').attr('fill','#f0ece4')
        .attr('font-family','Inter,sans-serif').attr('font-size',10.5)
        .attr('font-weight','600').attr('letter-spacing','0.04em').text(lbl);
      g.append('line').attr('x1',ctr[0]).attr('y1',ly+20)
        .attr('x2',ctr[0]).attr('y2',ctr[1]-6)
        .attr('stroke',col).attr('stroke-width',0.6).attr('stroke-opacity',0.4);
    });

    /* Attribution */
    svg.append('text').attr('x',W-14).attr('y',H-9).attr('text-anchor','end')
      .attr('fill','rgba(100,120,150,0.25)').attr('font-family','DM Mono,monospace')
      .attr('font-size',8.5).attr('letter-spacing','0.1em').text('FEMA NRI 2023 · CDC SVI 2022');

    /* Store path+projection for resize */
    el._mapProjection = projection;
    el._mapPath = path;
  }

  function draw() {
    /* Try CDN TopoJSON first (works with Live Server / any web server) */
    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(us => {
        const states = topojson.feature(us, us.objects.states);
        const mesh   = topojson.mesh(us, us.objects.states, (a,b) => a !== b);
        renderMap(states, mesh);
      })
      .catch(() => {
        /* Fallback: use inline GeoJSON — no mesh borders */
        renderMap(US_STATES_GEO, null);
      });
  }

  draw();
  window.addEventListener('resize', debounce(draw, 220));
}


/* ══════════════════════════════════════════════════════════
   REGION PANEL — populates side panel with data + D3 chart
══════════════════════════════════════════════════════════ */
let currentRegion = null;

function openRegionPanel(regionId) {
  const reg = MAP_REGIONS[regionId];
  if (!reg || regionId === currentRegion) return;
  currentRegion = regionId;

  /* Set metric glow color via CSS variable */
  const metricEl = document.getElementById('mp-metric-num');
  if (metricEl) {
    metricEl.style.color = reg.metricColor;
    metricEl.closest('.mp-metric').style.setProperty('--mp-col', reg.metricColor);
  }

  /* Populate text fields */
  document.getElementById('mp-tag').textContent        = reg.tag.toUpperCase();
  document.getElementById('mp-headline').textContent   = reg.headline;
  document.getElementById('mp-metric-num').textContent = reg.metricNum;
  document.getElementById('mp-metric-num').style.color = reg.metricColor;
  document.getElementById('mp-metric-label').textContent = reg.metricUnit;
  document.getElementById('mp-chart-title').textContent  = reg.chartLabel;
  document.getElementById('mp-body').textContent = reg.body;

  /* Stats */
  document.getElementById('mp-stats-row').innerHTML = reg.stats
    .map(([k,v]) => `<div class="mp-stat"><span class="mp-stat-key">${k}</span><span class="mp-stat-val">${v}</span></div>`)
    .join('');

  /* Render mini D3 chart */
  renderMiniChart(reg);

  /* Show content, hide default */
  document.getElementById('mp-default').style.display = 'none';
  const content = document.getElementById('mp-content');
  content.style.display = 'flex';
  content.classList.remove('entering');
  void content.offsetWidth; /* force reflow */
  content.classList.add('entering');

  /* Highlight selected state on map */
  d3.selectAll('.map-state').each(function(d) {
    const rid = STATE_REGION_MAP[d && d.id];
    const risk = STATE_RISK[d && d.id];
    if (rid === regionId) {
      d3.select(this)
        .attr('fill', d3.color(RISK_COLORS[risk]).copy({ opacity: 0.55 }).toString())
        .attr('stroke-width', 2.4);
    } else {
      d3.select(this)
        .attr('fill', risk ? d3.color(RISK_COLORS[risk]).copy({ opacity: 0.18 }).toString() : 'rgba(255,255,255,0.03)')
        .attr('stroke-width', STATE_REGION_MAP[d && d.id] ? 1.2 : 0.4);
    }
  });
}

function renderMiniChart(reg) {
  const el = document.getElementById('mp-chart');
  if (!el) return;
  el.innerHTML = '';

  const W = el.clientWidth || 336;
  const H = 130;
  const M = { t: 12, r: 8, b: 28, l: 44 };
  const w = W - M.l - M.r, h = H - M.t - M.b;

  const data = reg.chartData;
  const svg = d3.select(el).append('svg')
    .attr('width', W).attr('height', H)
    .style('display', 'block').style('overflow', 'visible');

  /* Transparent background */
  svg.append('rect').attr('width', W).attr('height', H).attr('fill', 'transparent');

  const g = svg.append('g').attr('transform', `translate(${M.l},${M.t})`);

  const x = d3.scaleLinear().domain(d3.extent(data, d => d.x)).range([0, w]);
  const yMin = d3.min(data, d => d.y);
  const yMax = d3.max(data, d => d.y);
  const y = d3.scaleLinear().domain([Math.min(0, yMin) * 1.08, yMax * 1.12]).range([h, 0]);

  const col = reg.metricColor;

  /* Subtle grid */
  y.ticks(3).forEach(v => {
    if (y(v) < 0 || y(v) > h) return;
    g.append('line').attr('x1', 0).attr('x2', w).attr('y1', y(v)).attr('y2', y(v))
      .attr('stroke', 'rgba(255,255,255,0.06)').attr('stroke-width', 1);
  });

  /* Zero line if applicable */
  if (yMin < 0) {
    g.append('line').attr('x1',0).attr('x2',w).attr('y1',y(0)).attr('y2',y(0))
      .attr('stroke','rgba(255,255,255,0.15)').attr('stroke-width',0.8).attr('stroke-dasharray','4 3');
  }

  /* Axes — minimal */
  g.append('g').attr('transform', `translate(0,${h})`).call(
    d3.axisBottom(x).ticks(4).tickFormat(d3.format('d'))
  ).call(ax => {
    ax.select('.domain').remove();
    ax.selectAll('.tick line').remove();
    ax.selectAll('.tick text')
      .attr('fill', C.dim).attr('font-family','DM Mono,monospace').attr('font-size', 10);
  });

  g.append('g').call(
    d3.axisLeft(y).ticks(3).tickFormat(d => Math.abs(d) >= 1000 ? d3.format('.0s')(d) : d)
  ).call(ax => {
    ax.select('.domain').remove();
    ax.selectAll('.tick line').remove();
    ax.selectAll('.tick text')
      .attr('fill', C.dim).attr('font-family','DM Mono,monospace').attr('font-size', 10);
  });

  if (reg.chartType === 'area' || reg.chartType === 'line') {
    /* Gradient fill */
    const gId = 'mc-g-' + reg.name.replace(/\s/g,'');
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', gId)
      .attr('gradientUnits','userSpaceOnUse').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',h);
    grad.append('stop').attr('offset','0%').attr('stop-color',col).attr('stop-opacity',0.35);
    grad.append('stop').attr('offset','100%').attr('stop-color',col).attr('stop-opacity',0.02);

    if (reg.chartType === 'area') {
      const aFn = d3.area().x(d=>x(d.x)).y0(h).y1(d=>y(d.y)).curve(d3.curveCatmullRom.alpha(0.5));
      const aPath = g.append('path').datum(data).attr('d',aFn).attr('fill',`url(#${gId})`).attr('opacity',0);
      aPath.transition().duration(800).attr('opacity',1);
    }

    const lFn = d3.line().x(d=>x(d.x)).y(d=>y(d.y)).curve(d3.curveCatmullRom.alpha(0.5));
    const lPath = g.append('path').datum(data).attr('d',lFn)
      .attr('fill','none').attr('stroke',col).attr('stroke-width',2)
      .attr('stroke-linecap','round');
    const len = lPath.node().getTotalLength();
    lPath.attr('stroke-dasharray',`${len} ${len}`).attr('stroke-dashoffset',len)
      .transition().duration(1000).ease(d3.easeCubicOut).attr('stroke-dashoffset',0);

  } else if (reg.chartType === 'bar') {
    const bw = Math.max(2, (w / data.length) - 2);
    data.forEach((d, i) => {
      const bh = Math.abs(y(d.y) - y(0));
      const by = d.y >= 0 ? y(d.y) : y(0);
      g.append('rect')
        .attr('x', x(d.x) - bw/2).attr('y', by).attr('width', bw).attr('height', 0)
        .attr('fill', col).attr('opacity', 0.75).attr('rx', 1.5)
        .transition().duration(600).delay(i * 40).attr('height', bh);
    });
  }

  /* Last-point highlight dot */
  const last = data[data.length - 1];
  g.append('circle').attr('cx',x(last.x)).attr('cy',y(last.y)).attr('r',4)
    .attr('fill',col).attr('stroke','#080b14').attr('stroke-width',2)
    .attr('opacity',0).transition().delay(900).duration(300).attr('opacity',1);
}
/* ── Add ocean bg + horizon glow to existing charts on init ── */
function upgradeChartAtmosphere() {
  document.querySelectorAll('.chart-host svg').forEach(svgEl => {
    const W = +svgEl.getAttribute('width') || 500;
    const H = +svgEl.getAttribute('height') || 400;
    const svg = d3.select(svgEl);
    const existingRect = svg.select('rect:first-child');
    if (!existingRect.empty()) {
      const defs = svg.select('defs').empty() ? svg.insert('defs', ':first-child') : svg.select('defs');
      const gId = 'ocn-' + Math.random().toString(36).slice(2, 7);
      const og = defs.append('linearGradient').attr('id', gId)
        .attr('gradientUnits', 'userSpaceOnUse').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', H);
      og.append('stop').attr('offset', '0%').attr('stop-color', '#0d1420').attr('stop-opacity', 1);
      og.append('stop').attr('offset', '100%').attr('stop-color', '#060c16').attr('stop-opacity', 1);
      existingRect.attr('fill', `url(#${gId})`);
    }
  });
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), ms); };
}

/* ══════════════════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════════════════ */
function openLightbox(src, caption) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  if (!lb || !img) return;
  img.src = src;
  if (cap) cap.textContent = caption;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { const img = document.getElementById('lightbox-img'); if (img) img.src = ''; }, 320);
}