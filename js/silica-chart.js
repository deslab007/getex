/* Getex — "Silica exposure doesn't have to be constant to count" chart.
 *
 * Illustrative model (same as the client's draft graph):
 *   everyday work  — a steady 0.018 mg/m3, every day for 10 years
 *   occasional     — four short tasks peaking at ~0.545 mg/m3, plus a trace baseline
 * Both reach ~0.18 mg/m3-years by year 10.
 *
 * Drawn as SVG at the container's real pixel width (redrawn on resize) so the
 * text stays legible on phones. Hover / touch shows a crosshair and readout.
 */
(function () {
  'use strict';
  var el = document.getElementById('silica-chart');
  if (!el) return;

  var EVERY = 0.018, WES = 0.05, PEAK = 0.545, BASE = 0.002;
  var BURSTS = [1.4, 3.9, 6.4, 8.9];
  var AREA = (10 * EVERY - 10 * BASE) / BURSTS.length; // dose per burst, so both totals match
  var HALF = AREA / PEAK;                               // triangle half-width (years)
  var C_EVERY = '#7a7a7a', C_OCC = '#4e9a26', INK = '#1a1a1a', MUTED = '#6b6b6b', GRID = '#ececec';

  function conc(t) {
    var c = 0;
    BURSTS.forEach(function (b) { var d = Math.abs(t - b); if (d < HALF) c = Math.max(c, PEAK * (1 - d / HALF)); });
    return c;
  }
  function cumOcc(t) {
    var c = BASE * t;
    BURSTS.forEach(function (b) {
      if (t >= b + HALF) c += AREA;
      else if (t > b - HALF) {
        var x = t - (b - HALF);            // area of the triangle up to t
        c += x <= HALF ? PEAK * x * x / (2 * HALF) : AREA - PEAK * Math.pow(2 * HALF - x, 2) / (2 * HALF);
      }
    });
    return c;
  }

  // data table (years 0..10)
  var tb = document.getElementById('silica-chart-table');
  if (tb) {
    var rows = '';
    for (var y = 0; y <= 10; y++) rows += '<tr><th scope="row">' + y + '</th><td>' + (EVERY * y).toFixed(3) + '</td><td>' + cumOcc(y).toFixed(3) + '</td></tr>';
    tb.innerHTML = rows;
  }

  var NS = 'http://www.w3.org/2000/svg';
  function n(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function fmt(v, d) { return v.toFixed(d); }

  function draw() {
    var W = el.clientWidth; if (!W) return;
    var small = W < 560;
    var fs = small ? 11 : 12;
    var L = small ? 40 : 52, R = small ? 10 : 16;
    var PH = small ? 170 : 210;        // panel plot height
    var TT = 34;                       // panel title band
    var GAP = small ? 34 : 40;
    var XB = 38;                       // x-axis band
    var H = TT + PH + GAP + TT + PH + XB;
    var pw = W - L - R;
    var X = function (t) { return L + t / 10 * pw; };
    var top0 = TT, top1 = TT + PH + GAP + TT;
    var Y1 = function (v) { return top0 + PH - v / 0.6 * PH; };
    var Y2 = function (v) { return top1 + PH - v / 0.225 * PH; };

    var svg = n('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'font-size': fs, 'font-family': 'inherit', 'aria-hidden': 'true' });

    function panel(top, Y, ticks, dec, title) {
      svg.appendChild(n('text', { x: L - (small ? 34 : 46), y: top - 14, fill: MUTED, 'font-weight': 600 }, title));
      ticks.forEach(function (v) {
        svg.appendChild(n('line', { x1: L, x2: L + pw, y1: Y(v), y2: Y(v), stroke: v === 0 ? '#bdbdbd' : GRID }));
        svg.appendChild(n('text', { x: L - 8, y: Y(v) + 4, 'text-anchor': 'end', fill: MUTED }, fmt(v, dec)));
      });
    }
    panel(top0, Y1, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6], 1, small ? 'Exposure concentration (mg/m³, 8-hr TWA)' : 'Exposure concentration (mg/m³, 8-hr TWA on exposure days)');
    panel(top1, Y2, small ? [0, 0.05, 0.1, 0.15, 0.2] : [0, 0.025, 0.05, 0.075, 0.1, 0.125, 0.15, 0.175, 0.2], small ? 2 : 3, 'Cumulative exposure (mg/m³-years)');

    // x axis (shared)
    for (var t = 0; t <= 10; t += 2) {
      svg.appendChild(n('text', { x: X(t), y: top1 + PH + 18, 'text-anchor': 'middle', fill: MUTED }, t));
      svg.appendChild(n('line', { x1: X(t), x2: X(t), y1: top1 + PH, y2: top1 + PH + 4, stroke: '#bdbdbd' }));
    }
    svg.appendChild(n('text', { x: L + pw / 2, y: top1 + PH + 34, 'text-anchor': 'middle', fill: MUTED }, 'Years'));

    // --- top panel ---
    svg.appendChild(n('line', { x1: L, x2: L + pw, y1: Y1(WES), y2: Y1(WES), stroke: INK, 'stroke-width': 1.25, 'stroke-dasharray': '2 4', 'stroke-linecap': 'round' }));
    svg.appendChild(n('line', { x1: L, x2: L + pw, y1: Y1(EVERY), y2: Y1(EVERY), stroke: C_EVERY, 'stroke-width': 2 }));
    var d = 'M' + X(0) + ' ' + Y1(BASE);
    BURSTS.forEach(function (b) { d += ' L' + X(b - HALF) + ' ' + Y1(BASE) + ' L' + X(b) + ' ' + Y1(PEAK) + ' L' + X(b + HALF) + ' ' + Y1(BASE); });
    d += ' L' + X(10) + ' ' + Y1(BASE);
    svg.appendChild(n('path', { d: d, fill: 'none', stroke: C_OCC, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    // labels sit in the gaps between bursts so no spike runs through them
    function block(x, y, lines, anchor, bold, size) {
      var t = n('text', { x: x, y: y, fill: INK, 'text-anchor': anchor || 'start', 'font-weight': bold ? 600 : 400, 'font-size': size || fs });
      lines.forEach(function (line, i) { t.appendChild(n('tspan', { x: x, dy: i ? '1.3em' : 0 }, line)); });
      svg.appendChild(t);
    }
    var mid = X((BURSTS[1] + BURSTS[2]) / 2);
    block(mid, Y1(WES) - (small ? 24 : 9), small ? ['Current WES', '0.05 mg/m³'] : ['Current WES 0.05 mg/m³'], 'middle', true);
    var ax = X(BURSTS[0]) + (small ? 10 : 14), ay = Y1(0.43);
    svg.appendChild(n('line', { x1: X(BURSTS[0]) + 3, y1: Y1(PEAK) + 8, x2: ax - 2, y2: ay - 5, stroke: MUTED }));
    block(ax, ay, small ? ['A single task', 'can spike well', 'above everyday', 'exposure'] : ['A single high-intensity', 'task can spike well', 'above everyday exposure'], 'start', false, small ? 10 : fs);

    // --- bottom panel ---
    var pts = [], area = '';
    for (var i = 0; i <= 1000; i++) { var tt = i / 100; pts.push(X(tt) + ' ' + Y2(cumOcc(tt))); }
    area = 'M' + X(0) + ' ' + Y2(0) + ' L' + pts.join(' L') + ' L' + X(10) + ' ' + Y2(0) + 'Z';
    svg.appendChild(n('path', { d: area, fill: C_OCC, opacity: 0.1 }));
    svg.appendChild(n('path', { d: 'M' + pts.join(' L'), fill: 'none', stroke: C_OCC, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    svg.appendChild(n('line', { x1: X(0), y1: Y2(0), x2: X(10), y2: Y2(EVERY * 10), stroke: C_EVERY, 'stroke-width': 2 }));
    svg.appendChild(n('circle', { cx: X(10), cy: Y2(0.18), r: 4.5, fill: INK, stroke: '#fff', 'stroke-width': 2 }));
    var sl = n('text', { x: L + 10, y: Y2(0.205), fill: INK, 'font-weight': 600 });
    sl.appendChild(n('tspan', { x: L + 10, dy: 0 }, 'Same cumulative exposure by year 10'));
    sl.appendChild(n('tspan', { x: L + 10, dy: '1.3em', 'font-weight': 400, fill: MUTED }, 'Both reach about 0.18 mg/m³-years'));
    svg.appendChild(sl);

    // --- hover layer ---
    var g = n('g', { visibility: 'hidden' });
    var cross = n('line', { y1: top0, y2: top1 + PH, stroke: INK, 'stroke-width': 1, opacity: 0.35 });
    var d1 = n('circle', { r: 4.5, fill: C_OCC, stroke: '#fff', 'stroke-width': 2 });
    var d2 = n('circle', { r: 4.5, fill: C_OCC, stroke: '#fff', 'stroke-width': 2 });
    var d3 = n('circle', { r: 4.5, fill: C_EVERY, stroke: '#fff', 'stroke-width': 2 });
    g.appendChild(cross); g.appendChild(d1); g.appendChild(d2); g.appendChild(d3);
    svg.appendChild(g);
    var hit = n('rect', { x: L, y: top0, width: pw, height: top1 + PH - top0, fill: 'transparent' });
    svg.appendChild(hit);

    el.innerHTML = '';
    el.appendChild(svg);
    var tip = document.createElement('div');
    tip.className = 'chart-tip'; tip.hidden = true;
    el.appendChild(tip);

    function move(ev) {
      var r = svg.getBoundingClientRect();
      var cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      var t = Math.max(0, Math.min(10, (cx - L) / pw * 10));
      // snap to a nearby burst peak so the spikes are easy to read
      BURSTS.forEach(function (b) { if (Math.abs(t - b) < 0.12) t = b; });
      var x = X(t);
      cross.setAttribute('x1', x); cross.setAttribute('x2', x);
      d1.setAttribute('cx', x); d1.setAttribute('cy', Y1(Math.max(conc(t), BASE)));
      d2.setAttribute('cx', x); d2.setAttribute('cy', Y2(cumOcc(t)));
      d3.setAttribute('cx', x); d3.setAttribute('cy', Y2(EVERY * t));
      g.setAttribute('visibility', 'visible');
      tip.innerHTML = '<strong>Year ' + t.toFixed(1) + '</strong>' +
        '<span class="chart-tip-row"><i class="chart-key chart-key--occasional"></i>Occasional: ' + fmt(Math.max(conc(t), BASE), 3) + ' mg/m³ &middot; ' + fmt(cumOcc(t), 3) + ' cumulative</span>' +
        '<span class="chart-tip-row"><i class="chart-key chart-key--everyday"></i>Everyday: ' + fmt(EVERY, 3) + ' mg/m³ &middot; ' + fmt(EVERY * t, 3) + ' cumulative</span>';
      tip.hidden = false;
      var tw = tip.offsetWidth;
      tip.style.left = Math.max(0, Math.min(W - tw, x - tw / 2)) + 'px';
      tip.style.top = (top1 - TT - 10) + 'px';
    }
    function leave() { g.setAttribute('visibility', 'hidden'); tip.hidden = true; }
    hit.addEventListener('mousemove', move);
    hit.addEventListener('touchstart', move, { passive: true });
    hit.addEventListener('touchmove', move, { passive: true });
    hit.addEventListener('mouseleave', leave);
    hit.addEventListener('touchend', leave);
  }

  var last = 0, raf;
  function onResize() {
    if (el.clientWidth === last) return;
    last = el.clientWidth;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(draw);
  }
  window.addEventListener('resize', onResize);
  onResize();
})();
