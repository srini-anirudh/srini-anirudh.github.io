/* ---------------------------------------------------------------------
   Too Many Parameters - animated figures and interactive labs.
   A small frame engine, a small numerics kit, and thirteen hand-built
   SVG figures. Every figure honours the blog animation contract:
   Previous / Play-Pause / Next / 0.5x / 1x / 2x / frame counter,
   autoplay on scroll-in, manual interaction pins the pause, and
   prefers-reduced-motion starts everything paused.
   --------------------------------------------------------------------- */
(function () {
  "use strict";

  var P = {
    bg: "#0f1317", ink: "#e4eaee", dim: "#93a0a8", faint: "#5d6a73",
    line: "#39454e", grid: "#1c242b", panel: "#161c22",
    green: "#3fd1a0", blue: "#5ab2e8", amber: "#f0b45a",
    pink: "#e8697d", purple: "#a98bf0", teal: "#4fb8c9", rust: "#d97a52"
  };
  var HUES = [P.green, P.blue, P.amber, P.purple, P.teal, P.pink, P.rust, "#8fd15a"];
  var MONO = "IBM Plex Mono, ui-monospace, monospace";

  /* ---------------- tiny helpers ---------------- */
  function R(n) { return Math.round(n * 100) / 100; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function S(f, a, b) { return clamp((f - a) / (b - a), 0, 1); }
  function E(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function rc(x, y, w, h, fill, extra) {
    return '<rect x="' + R(x) + '" y="' + R(y) + '" width="' + R(Math.max(0, w)) +
      '" height="' + R(Math.max(0, h)) + '" fill="' + fill + '" ' + (extra || "") + "/>";
  }
  function tx(x, y, s, o) {
    o = o || {};
    return '<text x="' + R(x) + '" y="' + R(y) + '" fill="' + (o.f || P.dim) +
      '" font-family="' + (o.ff || MONO) + '" font-size="' + (o.s || 11) +
      '" font-weight="' + (o.w || 500) + '" text-anchor="' + (o.a || "start") + '"' +
      (o.op !== undefined ? ' opacity="' + R(o.op) + '"' : "") +
      (o.ls ? ' letter-spacing="' + o.ls + '"' : "") + ">" + s + "</text>";
  }
  function ln(x1, y1, x2, y2, st, w, extra) {
    return '<line x1="' + R(x1) + '" y1="' + R(y1) + '" x2="' + R(x2) + '" y2="' + R(y2) +
      '" stroke="' + st + '" stroke-width="' + (w || 1) + '" ' + (extra || "") + "/>";
  }
  function pth(d, st, w, fill, extra) {
    return '<path d="' + d + '" stroke="' + (st || "none") + '" stroke-width="' + (w || 1) +
      '" fill="' + (fill || "none") + '" ' + (extra || "") + "/>";
  }
  function cir(x, y, r, fill, extra) {
    return '<circle cx="' + R(x) + '" cy="' + R(y) + '" r="' + R(r) + '" fill="' + fill + '" ' + (extra || "") + "/>";
  }
  function sv(inner, w, h) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg" role="presentation">' +
      inner + "</svg>";
  }
  function meter(x, y, w, h, frac, col, label, value) {
    var s = rc(x, y, w, h, "#1b242b");
    s += rc(x, y, w * clamp(frac, 0, 1), h, col);
    s += rc(x, y, w, h, "none", 'stroke="' + P.line + '" stroke-width="0.8"');
    if (label) s += tx(x, y - 6, label, { s: 10, f: P.faint });
    if (value) s += tx(x + w, y - 6, value, { s: 10, f: col, a: "end", w: 600 });
    return s;
  }
  function polyline(pts, col, w, extra) {
    if (!pts.length) return "";
    var d = "";
    for (var i = 0; i < pts.length; i++) d += (i ? " L" : "M") + R(pts[i][0]) + " " + R(pts[i][1]);
    return pth(d, col, w, "none", extra);
  }
  function fmt(v, k) {
    if (!isFinite(v)) return "inf";
    if (v === 0) return "0";
    var a = Math.abs(v);
    if (a >= 1e4 || a < 1e-3) return v.toExponential(k === undefined ? 1 : k);
    return v.toFixed(k === undefined ? 3 : k);
  }
  function si(v) {
    var u = ["", "K", "M", "B", "T", "P"], i = 0;
    while (Math.abs(v) >= 1000 && i < u.length - 1) { v /= 1000; i++; }
    return (v >= 100 ? v.toFixed(0) : v.toFixed(v >= 10 ? 1 : 2)) + u[i];
  }

  /* ---------------- numerics ---------------- */
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function gauss(r) {
    var u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  /* Solve A z = b for symmetric positive definite A (in place, Cholesky). */
  function solveSPD(A, b) {
    var n = b.length, i, j, k, s;
    var L = [];
    for (i = 0; i < n; i++) { L.push(new Float64Array(n)); }
    for (i = 0; i < n; i++) {
      for (j = 0; j <= i; j++) {
        s = A[i][j];
        for (k = 0; k < j; k++) s -= L[i][k] * L[j][k];
        if (i === j) L[i][i] = Math.sqrt(Math.max(s, 1e-14));
        else L[i][j] = s / L[j][j];
      }
    }
    var y = new Float64Array(n);
    for (i = 0; i < n; i++) {
      s = b[i];
      for (k = 0; k < i; k++) s -= L[i][k] * y[k];
      y[i] = s / L[i][i];
    }
    var z = new Float64Array(n);
    for (i = n - 1; i >= 0; i--) {
      s = y[i];
      for (k = i + 1; k < n; k++) s -= L[k][i] * z[k];
      z[i] = s / L[i][i];
    }
    return z;
  }
  /* Jacobi eigendecomposition of a small symmetric matrix. Returns {val, vec}
     with vec[j] the j-th eigenvector as an array. */
  function jacobi(Ain, sweeps) {
    var n = Ain.length, i, j, k, p, q;
    var A = [];
    for (i = 0; i < n; i++) A.push(Float64Array.from(Ain[i]));
    var V = [];
    for (i = 0; i < n; i++) { V.push(new Float64Array(n)); V[i][i] = 1; }
    for (var sweep = 0; sweep < (sweeps || 14); sweep++) {
      var off = 0;
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) off += A[i][j] * A[i][j];
      if (off < 1e-22) break;
      for (p = 0; p < n - 1; p++) for (q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-18) continue;
        var theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        var t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        var c = 1 / Math.sqrt(t * t + 1), s2 = t * c;
        for (k = 0; k < n; k++) {
          var akp = A[k][p], akq = A[k][q];
          A[k][p] = c * akp - s2 * akq;
          A[k][q] = s2 * akp + c * akq;
        }
        for (k = 0; k < n; k++) {
          var apk = A[p][k], aqk = A[q][k];
          A[p][k] = c * apk - s2 * aqk;
          A[q][k] = s2 * apk + c * aqk;
        }
        for (k = 0; k < n; k++) {
          var vkp = V[k][p], vkq = V[k][q];
          V[k][p] = c * vkp - s2 * vkq;
          V[k][q] = s2 * vkp + c * vkq;
        }
      }
    }
    var val = [], vec = [];
    for (i = 0; i < n; i++) {
      val.push(A[i][i]);
      var col = new Float64Array(n);
      for (k = 0; k < n; k++) col[k] = V[k][i];
      vec.push(col);
    }
    var order = val.map(function (v, ix) { return ix; }).sort(function (a, b) { return val[b] - val[a]; });
    return { val: order.map(function (ix) { return val[ix]; }), vec: order.map(function (ix) { return vec[ix]; }) };
  }

  /* ---------------- frame engine ---------------- */
  var RM = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  function Figure(el, total, render, base) {
    this.el = el; this.total = total; this.render = render; this.base = base || 110;
    this.i = 0; this.speed = 1; this.timer = null; this.playing = false; this.userPaused = false;
    this.stage = el.querySelector(".animation-stage");
    this.caption = el.querySelector(".figure-caption");
    this.status = el.querySelector(".animation-status");
    var self = this;
    this.btn = {};
    Array.prototype.forEach.call(el.querySelectorAll("button[data-action]"), function (b) {
      self.btn[b.getAttribute("data-action")] = b;
    });
    this.btn.previous.addEventListener("click", function () { self.pause(true); self.step(-1); });
    this.btn.next.addEventListener("click", function () { self.pause(true); self.step(1); });
    this.btn["play-pause"].addEventListener("click", function () {
      if (self.playing) { self.pause(true); } else { self.play(true); }
    });
    this.speedBtns = el.querySelectorAll("button[data-speed]");
    Array.prototype.forEach.call(this.speedBtns, function (b) {
      b.addEventListener("click", function () { self.setSpeed(parseFloat(b.getAttribute("data-speed"))); });
    });
    el.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowLeft") { self.pause(true); self.step(-1); ev.preventDefault(); }
      else if (ev.key === "ArrowRight") { self.pause(true); self.step(1); ev.preventDefault(); }
    });
    this.draw();
    if (RM.matches) {
      this.pause(false);
    } else if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!self.userPaused) self.play(false); }
          else { self.halt(); self.playing = false; self.reflect(); }
        });
      }, { threshold: 0.2 });
      io.observe(el);
    } else {
      this.play(false);
    }
  }
  Figure.prototype.halt = function () { if (this.timer) { clearInterval(this.timer); this.timer = null; } };
  Figure.prototype.play = function (byUser) {
    if (byUser) this.userPaused = false;
    this.halt();
    this.playing = true;
    var self = this;
    this.timer = setInterval(function () { self.step(1); }, this.base / this.speed);
    this.reflect();
  };
  Figure.prototype.pause = function (byUser) {
    if (byUser) this.userPaused = true;
    this.halt(); this.playing = false; this.reflect();
  };
  Figure.prototype.setSpeed = function (v) {
    this.speed = v;
    Array.prototype.forEach.call(this.speedBtns, function (b) {
      b.setAttribute("aria-pressed", parseFloat(b.getAttribute("data-speed")) === v ? "true" : "false");
    });
    if (this.playing) this.play(false);
  };
  Figure.prototype.step = function (d) {
    this.i = (this.i + d + this.total) % this.total;
    this.draw();
  };
  Figure.prototype.reflect = function () {
    var b = this.btn["play-pause"];
    b.textContent = this.playing ? "Pause" : "Play";
    b.setAttribute("aria-pressed", this.playing ? "true" : "false");
    b.setAttribute("aria-label", this.playing ? "Pause animation" : "Play animation");
  };
  Figure.prototype.draw = function () {
    var out = this.render(this.i, RM.matches);
    this.stage.innerHTML = out[0];
    if (this.caption) this.caption.innerHTML = out[1];
    this.stage.setAttribute("aria-label", String(out[1]).replace(/<[^>]+>/g, ""));
    this.status.textContent = "Frame " + pad2(this.i + 1) + " / " + this.total;
  };

  var REG = [], LABS = [];
  function reg(id, total, render, base) { REG.push({ id: id, total: total, render: render, base: base }); }
  function lab(id, setup) { LABS.push({ id: id, setup: setup }); }

  /* =====================================================================
     FIGURE 1 - the bias-variance decomposition, actually computed
     ===================================================================== */
  var F1 = (function () {
    var N = 14, SIG = 0.24, REPS = 20, DMAX = 12;
    function g(x) { return Math.sin(2.3 * x) + 0.42 * x * x; }
    var grid = [];
    for (var i = 0; i < 90; i++) grid.push(-1 + 2 * i / 89);
    var sets = [];
    for (var s = 0; s < REPS; s++) {
      var r = rng(101 + s * 7717), xs = [], ys = [];
      for (var k = 0; k < N; k++) {
        var x = -1 + 2 * (k + 0.5) / N;
        xs.push(x); ys.push(g(x) + SIG * gauss(r));
      }
      sets.push({ x: xs, y: ys });
    }
    function polyfit(d, data) {
      var m = d + 1, i, j, k;
      var A = [], b = new Float64Array(m);
      for (i = 0; i < m; i++) A.push(new Float64Array(m));
      for (k = 0; k < data.x.length; k++) {
        var pw = new Float64Array(m);
        pw[0] = 1;
        for (i = 1; i < m; i++) pw[i] = pw[i - 1] * data.x[k];
        for (i = 0; i < m; i++) {
          b[i] += pw[i] * data.y[k];
          for (j = 0; j < m; j++) A[i][j] += pw[i] * pw[j];
        }
      }
      for (i = 0; i < m; i++) A[i][i] += 1e-9;
      return solveSPD(A, b);
    }
    function evalPoly(c, x) { var s = 0; for (var i = c.length - 1; i >= 0; i--) s = s * x + c[i]; return s; }
    var byDeg = [];
    for (var d = 1; d <= DMAX; d++) {
      var curves = [], mean = new Float64Array(grid.length);
      for (var q = 0; q < REPS; q++) {
        var c = polyfit(d, sets[q]);
        var cv = grid.map(function (x) { return clamp(evalPoly(c, x), -6, 6); });
        curves.push(cv);
        for (var t = 0; t < grid.length; t++) mean[t] += cv[t] / REPS;
      }
      var bias2 = 0, vari = 0;
      for (var t2 = 0; t2 < grid.length; t2++) {
        bias2 += Math.pow(mean[t2] - g(grid[t2]), 2) / grid.length;
        for (var q2 = 0; q2 < REPS; q2++) vari += Math.pow(curves[q2][t2] - mean[t2], 2) / (REPS * grid.length);
      }
      byDeg.push({ d: d, curves: curves, mean: mean, bias2: bias2, vari: vari, total: bias2 + vari + SIG * SIG });
    }
    return { grid: grid, g: g, sets: sets, byDeg: byDeg, SIG: SIG, DMAX: DMAX, REPS: REPS };
  })();

  reg("fig-bias-variance", 66, function (f) {
    var W = 720, H = 380;
    var g = rc(0, 0, W, H, P.bg);
    var LX = 34, LW = 330, LY = 66, LH = 214;
    var X = function (x) { return LX + (x + 1.15) / 2.3 * LW; };
    var Y = function (v) { return LY + LH / 2 - clamp(v, -2.2, 2.2) / 2.2 * (LH / 2); };
    for (var q = -2; q <= 2; q++) g += ln(LX, Y(q), LX + LW, Y(q), "#1a2228", 1);
    g += ln(X(0), LY, X(0), LY + LH, "#1a2228", 1);
    g += tx(LX, 42, "FITS ON 20 REDRAWN SAMPLES", { s: 10.5, f: P.ink, w: 600, ls: "1" });

    var di = f < 6 ? -1 : Math.min(F1.DMAX - 1, Math.floor((f - 6) / 5));
    var sub = f < 6 ? 0 : (f - 6) % 5;
    var shown = di < 0 ? 0 : (sub >= 3 ? F1.REPS : Math.round(F1.REPS * (sub + 1) / 3));

    var truth = F1.grid.map(function (x) { return [X(x), Y(F1.g(x))]; });
    if (di >= 0) {
      var rec = F1.byDeg[di];
      for (var c = 0; c < shown; c++) {
        var pts = F1.grid.map(function (x, ix) { return [X(x), Y(rec.curves[c][ix])]; });
        g += polyline(pts, P.blue, 1, 'opacity="0.26"');
      }
      if (sub >= 2 || shown >= F1.REPS) {
        var mp = F1.grid.map(function (x, ix) { return [X(x), Y(rec.mean[ix])]; });
        g += polyline(mp, P.amber, 2.2);
      }
    }
    g += polyline(truth, P.ink, 1.6, 'stroke-dasharray="5 4" opacity="0.85"');
    for (var i = 0; i < F1.sets[0].x.length; i++) g += cir(X(F1.sets[0].x[i]), Y(F1.sets[0].y[i]), 2.6, P.dim, 'opacity="0.85"');
    g += tx(LX, LY + LH + 20, "dashed = truth g(x)", { s: 9.5, f: P.faint });
    g += tx(LX + 128, LY + LH + 20, "blue = 20 fits", { s: 9.5, f: P.blue });
    g += tx(LX + 240, LY + LH + 20, "amber = mean fit", { s: 9.5, f: P.amber });

    /* risk curve */
    var RX = 424, RW = 262, RY = 66, RH = 214;
    var rlo = 0.0004, rhi = 4;
    var CX = function (d) { return RX + (d - 1) / (F1.DMAX - 1) * RW; };
    var CY = function (v) { return RY + RH - Math.log(clamp(v, rlo, rhi) / rlo) / Math.log(rhi / rlo) * RH; };
    g += rc(RX, RY, RW, RH, "#101519");
    for (var yv = -3; yv <= 0; yv++) { var lv = Math.pow(10, yv); g += ln(RX, CY(lv), RX + RW, CY(lv), "#1a2228", 1); g += tx(RX - 6, CY(lv) + 4, "1e" + yv, { s: 8.5, a: "end", f: P.line }); }
    g += tx(RX, 42, "RISK OVER THE DOMAIN  (log scale)", { s: 10.5, f: P.ink, w: 600, ls: "1" });
    g += ln(RX, CY(F1.SIG * F1.SIG), RX + RW, CY(F1.SIG * F1.SIG), P.faint, 1, 'stroke-dasharray="3 3"');
    g += tx(RX + RW - 4, CY(F1.SIG * F1.SIG) - 6, "irreducible noise", { s: 8.5, a: "end", f: P.faint });
    var upto = di < 0 ? -1 : di;
    var bp = [], vp = [], tp = [];
    for (var k2 = 0; k2 <= upto; k2++) {
      bp.push([CX(F1.byDeg[k2].d), CY(F1.byDeg[k2].bias2)]);
      vp.push([CX(F1.byDeg[k2].d), CY(F1.byDeg[k2].vari)]);
      tp.push([CX(F1.byDeg[k2].d), CY(F1.byDeg[k2].total)]);
    }
    g += polyline(bp, P.teal, 1.8);
    g += polyline(vp, P.pink, 1.8);
    g += polyline(tp, P.green, 2.4);
    if (upto >= 0) g += cir(CX(F1.byDeg[upto].d), CY(F1.byDeg[upto].total), 4, P.green);
    g += tx(RX + 8, RY + 16, "bias squared", { s: 9, f: P.teal });
    g += tx(RX + 8, RY + 29, "variance", { s: 9, f: P.pink });
    g += tx(RX + 8, RY + 42, "total risk", { s: 9, f: P.green });
    g += tx(RX + RW, RY + RH + 20, "polynomial degree", { s: 9.5, a: "end", f: P.faint });
    g += tx(RX, RY + RH + 20, "degree 1", { s: 8.5, f: P.line });

    /* readouts */
    var rec2 = di < 0 ? null : F1.byDeg[di];
    g += tx(34, 320, "degree", { s: 9.5, f: P.line });
    g += tx(34, 342, di < 0 ? "-" : String(rec2.d), { s: 17, f: P.ink, w: 600 });
    g += tx(140, 320, "bias squared", { s: 9.5, f: P.line });
    g += tx(140, 342, di < 0 ? "-" : fmt(rec2.bias2), { s: 15, f: P.teal, w: 600 });
    g += tx(300, 320, "variance", { s: 9.5, f: P.line });
    g += tx(300, 342, di < 0 ? "-" : fmt(rec2.vari), { s: 15, f: P.pink, w: 600 });
    g += tx(452, 320, "total risk", { s: 9.5, f: P.line });
    g += tx(452, 342, di < 0 ? "-" : fmt(rec2.total), { s: 15, f: P.green, w: 600 });
    g += tx(586, 320, "best so far", { s: 9.5, f: P.line });
    var best = 99, bd = 0;
    for (var b2 = 0; b2 <= upto; b2++) if (F1.byDeg[b2].total < best) { best = F1.byDeg[b2].total; bd = F1.byDeg[b2].d; }
    g += tx(586, 342, upto < 0 ? "-" : "degree " + bd, { s: 14, f: P.amber, w: 600 });

    var cap;
    if (di < 0) cap = "Fourteen noisy samples from a fixed smooth function, redrawn twenty times. Nothing has been fitted yet.";
    else if (rec2.d <= 2) cap = "Degree " + rec2.d + ". Every fit misses the same way, so the twenty curves lie almost on top of each other: <b>high bias, low variance</b>.";
    else if (rec2.d <= 5) cap = "Degree " + rec2.d + ". The mean fit has caught up with the truth and the spread is still narrow. Total risk bottoms out around here.";
    else if (rec2.d <= 9) cap = "Degree " + rec2.d + ". Bias is already spent. Every extra degree of freedom is used to chase whichever noise realization that sample happened to contain.";
    else cap = "Degree " + rec2.d + " with fourteen points. The fits fan out wildly between the data and <b>total risk is " + Math.round(rec2.total / 0.079) + " times its best value</b>, essentially all of it variance. This is the classical overfitting regime, and it is real.";
    return [sv(g, W, H), cap];
  }, 130);

  /* =====================================================================
     FIGURE 2 - label corruption
     ===================================================================== */
  var F2LAB = (function () {
    var r = rng(4242), a = [];
    for (var i = 0; i < 100; i++) a.push({ t: Math.floor(r() * 6), rnd: Math.floor(r() * 6), u: r() });
    return a;
  })();
  reg("fig-random-labels", 60, function (f) {
    var W = 720, H = 372;
    var pcorr = clamp(S(f, 4, 50), 0, 1);
    var g = rc(0, 0, W, H, P.bg);
    g += tx(30, 32, "LABEL CORRUPTION " + Math.round(pcorr * 100) + "%", { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 50, "same architecture, same optimizer, same 100 examples", { s: 9.5, f: P.faint });
    for (var i = 0; i < 100; i++) {
      var x = 30 + (i % 10) * 21, y = 66 + Math.floor(i / 10) * 21;
      var flipped = F2LAB[i].u < pcorr;
      var lab = flipped ? F2LAB[i].rnd : F2LAB[i].t;
      g += rc(x, y, 18, 18, HUES[lab % 8], 'opacity="' + (flipped ? 0.95 : 0.55) + '"');
      if (flipped) g += rc(x, y, 18, 18, "none", 'stroke="' + P.pink + '" stroke-width="1"');
    }
    g += tx(30, 296, "faded = true label", { s: 9, f: P.faint });
    g += tx(30, 310, "outlined = randomized", { s: 9, f: P.pink });

    /* training curves */
    var TX0 = 268, TW = 210, TY = 66, TH = 180;
    g += rc(TX0, TY, TW, TH, "#101519");
    g += tx(TX0, 50, "TRAINING LOSS", { s: 10, f: P.faint, ls: "1" });
    for (var s2 = 0; s2 <= 4; s2++) g += ln(TX0, TY + TH * s2 / 4, TX0 + TW, TY + TH * s2 / 4, "#1a2228", 1);
    var levels = [0, 0.25, 0.5, 0.75, 1];
    for (var L = 0; L < levels.length; L++) {
      var pl = levels[L];
      if (pl > pcorr + 0.001) continue;
      var slow = 1 + 2.1 * pl;
      var pts = [];
      for (var k = 0; k <= 60; k++) {
        var tt = k / 60;
        var loss = Math.exp(-5.2 * tt / slow) * (1 + 0.35 * pl);
        pts.push([TX0 + tt * TW, TY + TH - (1 - clamp(loss, 0, 1)) * 0 + clamp(loss, 0, 1.2) * TH * 0.8]);
      }
      var isCur = Math.abs(pl - pcorr) < 0.13;
      g += polyline(pts, isCur ? P.pink : P.blue, isCur ? 2.2 : 1.1, isCur ? "" : 'opacity="0.4"');
    }
    g += tx(TX0, TY + TH + 16, "steps", { s: 9, f: P.faint });
    g += tx(TX0 + TW, TY + TH + 16, "every curve reaches zero", { s: 9, a: "end", f: P.green });

    /* right readouts */
    var RX = 508;
    g += tx(RX, 50, "WHAT MOVES, WHAT DOES NOT", { s: 10, f: P.faint, ls: "1" });
    g += meter(RX, 90, 182, 14, 1, P.green, "FINAL TRAINING ACCURACY", "100%");
    g += tx(RX, 120, "unchanged at every corruption level", { s: 9, f: P.faint });
    var slowf = 1 + 2.1 * pcorr;
    g += meter(RX, 158, 182, 14, slowf / 3.5, P.amber, "STEPS TO FIT, RELATIVE", slowf.toFixed(1) + "x");
    g += tx(RX, 188, "a constant factor, not an explosion", { s: 9, f: P.faint });
    var terr = 0.06 + 0.84 * pcorr;
    g += meter(RX, 226, 182, 14, terr, P.pink, "TEST ERROR", Math.round(terr * 100) + "%");
    g += tx(RX, 256, "climbs straight to chance", { s: 9, f: P.faint });
    g += rc(RX, 278, 182, 62, "#12181d", 'stroke="' + P.line + '"');
    g += tx(RX + 10, 298, "GENERALIZATION GAP", { s: 9, f: P.pink, ls: "1" });
    g += tx(RX + 10, 322, Math.round(terr * 100) + " points", { s: 18, f: P.ink, w: 600 });

    g += rc(30, 330, 220, 34, "#12181d", 'stroke="' + P.line + '"');
    g += tx(40, 351, "capacity is identical throughout", { s: 10, f: P.dim });

    var cap;
    if (pcorr < 0.05) cap = "Clean labels. Training loss goes to zero, test error is 6%, and everything is as it should be.";
    else if (pcorr < 0.45) cap = Math.round(pcorr * 100) + "% of labels randomized. Training loss still reaches zero. It takes " + slowf.toFixed(1) + " times as many steps &mdash; a constant factor, not a wall.";
    else if (pcorr < 0.95) cap = "At " + Math.round(pcorr * 100) + "% corruption the model is memorizing most of the dataset outright, and generalizing on the rest.";
    else cap = "Every label random. Training accuracy 100%, test accuracy at chance. <b>Nothing about the model class changed</b> &mdash; only the labels did.";
    return [sv(g, W, H), cap];
  });

  /* =====================================================================
     FIGURE 3 - the solution set
     ===================================================================== */
  reg("fig-solution-set", 56, function (f) {
    var W = 720, H = 372;
    var g = rc(0, 0, W, H, P.bg);
    var stage = f < 14 ? 0 : (f < 28 ? 1 : (f < 42 ? 2 : 3));
    var names = ["p = 2 &lt; n = 3", "p = 3 = n", "p = 4 &gt; n", "p = 12 &#8811; n"];
    var titles = ["OVERDETERMINED", "EXACTLY DETERMINED", "UNDERDETERMINED", "MASSIVELY UNDERDETERMINED"];
    g += tx(30, 32, titles[stage] + "  -  " + names[stage], { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 50, "three training points, a growing family of functions that fit them", { s: 9.5, f: P.faint });

    /* left: parameter space cartoon */
    var LX = 30, LY = 74, LW = 300, LH = 216;
    g += rc(LX, LY, LW, LH, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');
    g += tx(LX + 6, LY + 16, "parameter space", { s: 9, f: P.faint });
    var cx = LX + LW / 2, cy = LY + LH / 2;
    var angs = [0.4, 1.9, 3.3];
    for (var c = 0; c < 3; c++) {
      var a = angs[c], dx = Math.cos(a) * 150, dy = Math.sin(a) * 110;
      var off = stage === 0 ? (c - 1) * 15 : 0;
      g += ln(cx - dx + off, cy - dy + off * 0.4, cx + dx + off, cy + dy + off * 0.4, HUES[c], 1.2, 'opacity="0.75"');
    }
    if (stage === 0) {
      g += cir(cx, cy, 5, P.ink);
      g += tx(cx + 12, cy + 4, "least-squares compromise", { s: 9, f: P.ink });
      g += tx(LX + 6, LY + LH - 10, "the three constraints do not meet: no exact fit", { s: 9, f: P.faint });
    } else if (stage === 1) {
      g += cir(cx, cy, 5, P.green);
      g += tx(cx + 12, cy + 4, "the unique interpolant", { s: 9, f: P.green });
      g += tx(LX + 6, LY + LH - 10, "one solution, no freedom left", { s: 9, f: P.faint });
    } else {
      var t = E(S(f, stage === 2 ? 28 : 42, stage === 2 ? 36 : 50));
      var len = (stage === 2 ? 78 : 128) * t;
      g += ln(cx - len, cy + len * 0.42, cx + len, cy - len * 0.42, P.green, 2.4);
      if (stage === 3) {
        for (var b = 1; b <= 3; b++) {
          g += ln(cx - len + b * 9, cy + len * 0.42 + b * 16, cx + len + b * 9, cy - len * 0.42 + b * 16, P.green, 1.1, 'opacity="' + R(0.5 - b * 0.1) + '"');
          g += ln(cx - len - b * 9, cy + len * 0.42 - b * 16, cx + len - b * 9, cy - len * 0.42 - b * 16, P.green, 1.1, 'opacity="' + R(0.5 - b * 0.1) + '"');
        }
      }
      var mx = cx - 26, my = cy + 11;
      g += cir(mx, my, 4.5, P.amber);
      g += tx(LX + 6, LY + LH - 26, "amber = the minimum-norm point on the set", { s: 9, f: P.amber });
      g += cir(cx + 44, cy - 19, 3.4, P.pink);
      g += cir(cx - 66, cy + 28, 3.4, P.pink);
      g += tx(LX + 6, LY + LH - 10, stage === 2 ? "a line of exact interpolants: dimension p - n = 1" : "a subspace of dimension 9, every point a perfect fit", { s: 9, f: P.faint });
    }

    /* right: functions through the same points */
    var RX = 366, RY = 74, RW = 324, RH = 216;
    g += rc(RX, RY, RW, RH, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');
    g += tx(RX + 6, RY + 16, "function space, evaluated", { s: 9, f: P.faint });
    var px = [0.2, 0.5, 0.8], py = [0.62, 0.34, 0.58];
    var FX = function (u) { return RX + 20 + u * (RW - 40); };
    var FY = function (v) { return RY + 22 + v * (RH - 44); };
    var nCurves = stage === 0 ? 1 : (stage === 1 ? 1 : (stage === 2 ? 3 : 7));
    for (var q = 0; q < nCurves; q++) {
      var amp = stage <= 1 ? 0 : (q - (nCurves - 1) / 2) * (stage === 2 ? 0.11 : 0.085);
      /* the perturbation vanishes at u = 0.2, 0.5 and 0.8, which are the three
         training points, so every curve interpolates them exactly */
      var kwig = stage === 3 ? 3 : 1;
      var pts = [];
      for (var s3 = 0; s3 <= 140; s3++) {
        var u = s3 / 140;
        var v = py[0] + (py[1] - py[0]) * (1 - Math.cos(Math.PI * clamp((u - 0.2) / 0.3, 0, 1))) / 2;
        if (u > 0.5) v = py[1] + (py[2] - py[1]) * (1 - Math.cos(Math.PI * clamp((u - 0.5) / 0.3, 0, 1))) / 2;
        if (u < 0.2) v = py[0] + (u - 0.2) * 0.5;
        if (u > 0.8) v = py[2] + (u - 0.8) * -0.4;
        var bump = 0;
        if (stage >= 2 && u >= 0.2 && u <= 0.8) bump = amp * Math.sin(kwig * Math.PI * (u - 0.2) / 0.3);
        pts.push([FX(u), FY(clamp(v + bump, 0.03, 0.97))]);
      }
      var isMin = q === Math.floor(nCurves / 2);
      g += polyline(pts, stage <= 1 ? (stage ? P.green : P.ink) : (isMin ? P.amber : P.green),
        isMin || stage <= 1 ? 2.1 : 1.2, isMin || stage <= 1 ? "" : 'opacity="0.42"');
    }
    for (var d2 = 0; d2 < 3; d2++) g += cir(FX(px[d2]), FY(py[d2]), 4, P.ink);
    if (stage === 0) g += tx(RX + 12, RY + RH - 10, "the fit misses every point a little", { s: 9, f: P.faint });
    else if (stage === 1) g += tx(RX + 12, RY + RH - 10, "hits all three, and has nothing left over", { s: 9, f: P.faint });
    else g += tx(RX + 12, RY + RH - 10, "identical on the data, arbitrarily different off it", { s: 9, f: P.faint });

    g += tx(30, 320, "training loss", { s: 9.5, f: P.line });
    g += tx(30, 342, stage === 0 ? "> 0" : "= 0 for every curve shown", { s: 14, f: stage === 0 ? P.amber : P.green, w: 600 });
    g += tx(400, 320, "test loss", { s: 9.5, f: P.line });
    g += tx(400, 342, stage <= 1 ? "determined" : "not determined by the data", { s: 14, f: stage <= 1 ? P.green : P.pink, w: 600 });

    var caps = [
      "Fewer parameters than constraints. There is no exact fit, so least squares returns the single best compromise and the data pins it down completely.",
      "Exactly as many parameters as points. One function threads all three, and it has no freedom left to be sensible with.",
      "One extra parameter and the answer becomes a <b>line</b>. Every point on it fits the training data perfectly and disagrees everywhere else.",
      "With p far above n the solution set is a high-dimensional subspace. Training loss has stopped being a selection rule &mdash; <b>something else has to pick</b>."
    ];
    return [sv(g, W, H), caps[stage]];
  }, 120);

  /* ---- export for the other figure files ---- */
  window.__TMP_FIG = {
    P: P, HUES: HUES, MONO: MONO, R: R, clamp: clamp, lerp: lerp, S: S, E: E, pad2: pad2, fmt: fmt, si: si,
    rc: rc, tx: tx, ln: ln, pth: pth, cir: cir, sv: sv, meter: meter, polyline: polyline,
    rng: rng, gauss: gauss, solveSPD: solveSPD, jacobi: jacobi,
    reg: reg, lab: lab, REG: REG, LABS: LABS, Figure: Figure, RM: RM
  };

  window.__TMP_BOOT = function () {
    REG.forEach(function (r) {
      var el = document.getElementById(r.id);
      if (el) new Figure(el, r.total, r.render, r.base);
    });
    LABS.forEach(function (l) {
      var el = document.getElementById(l.id);
      if (el) l.setup(el);
    });
  };
})();
