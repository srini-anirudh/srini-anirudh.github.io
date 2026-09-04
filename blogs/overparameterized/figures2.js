/* Figures 4-7 and Lab 1: the interpolation phenomena, computed live. */
(function () {
  "use strict";
  var F = window.__TMP_FIG;
  var P = F.P, HUES = F.HUES, R = F.R, clamp = F.clamp, lerp = F.lerp, S = F.S, E = F.E, fmt = F.fmt;
  var rc = F.rc, tx = F.tx, ln = F.ln, pth = F.pth, cir = F.cir, sv = F.sv, meter = F.meter,
      polyline = F.polyline, reg = F.reg, lab = F.lab;
  var rng = F.rng, gauss = F.gauss, solveSPD = F.solveSPD, jacobi = F.jacobi;

  /* =====================================================================
     The model everything in this section is computed from.

       x ~ N(0, Sigma),  Sigma = diag(1, 1/2, 1/3, ...)
       y = <beta*, x> + sigma * eps
       fit the first p coordinates by ridge regression, lambda -> 0
       excess risk = sum_j  Sigma_j (beta_hat_j - beta*_j)^2

     A decaying spectrum matters: with isotropic features, interpolation is
     never benign and the second descent does not happen.
     ===================================================================== */
  var LM = (function () {
    var NMAX = 110, PMAX = 420;
    var r = rng(20260904);
    var SPEC = new Float64Array(PMAX);
    for (var j = 0; j < PMAX; j++) SPEC[j] = 1 / (j + 1);
    var Z = [];
    for (var i = 0; i < NMAX; i++) {
      var row = new Float64Array(PMAX);
      for (var k = 0; k < PMAX; k++) row[k] = Math.sqrt(SPEC[k]) * gauss(r);
      Z.push(row);
    }
    var B = new Float64Array(PMAX), nrm = 0;
    for (var q = 0; q < PMAX; q++) { B[q] = Math.pow(q + 1, -0.6); nrm += SPEC[q] * B[q] * B[q]; }
    nrm = Math.sqrt(nrm);
    for (var q2 = 0; q2 < PMAX; q2++) B[q2] /= nrm;
    var NOISE = [];
    for (var m = 0; m < NMAX; m++) NOISE.push(gauss(r));

    function labels(n, sigma) {
      var y = new Float64Array(n);
      for (var i = 0; i < n; i++) {
        var s = 0;
        for (var j = 0; j < PMAX; j++) s += Z[i][j] * B[j];
        y[i] = s + sigma * NOISE[i];
      }
      return y;
    }
    /* ridge fit on the first p coordinates */
    function fit(n, p, sigma, lambda, y) {
      y = y || labels(n, sigma);
      var beta = new Float64Array(p), i, j, k, s;
      if (p <= n) {
        var A = [], b = new Float64Array(p);
        for (i = 0; i < p; i++) A.push(new Float64Array(p));
        for (i = 0; i < n; i++) {
          for (j = 0; j < p; j++) {
            b[j] += Z[i][j] * y[i];
            for (k = 0; k < p; k++) A[j][k] += Z[i][j] * Z[i][k];
          }
        }
        for (i = 0; i < p; i++) A[i][i] += lambda;
        beta = solveSPD(A, b);
      } else {
        var G = [];
        for (i = 0; i < n; i++) {
          var g2 = new Float64Array(n);
          for (k = 0; k < n; k++) {
            s = 0;
            for (j = 0; j < p; j++) s += Z[i][j] * Z[k][j];
            g2[k] = s + (i === k ? lambda : 0);
          }
          G.push(g2);
        }
        var al = solveSPD(G, y);
        for (i = 0; i < n; i++) for (j = 0; j < p; j++) beta[j] += al[i] * Z[i][j];
      }
      return beta;
    }
    function risk(beta) {
      var p = beta.length, s = 0;
      for (var j = 0; j < PMAX; j++) {
        var bh = j < p ? beta[j] : 0;
        s += SPEC[j] * (bh - B[j]) * (bh - B[j]);
      }
      return s;
    }
    function trainMSE(beta, n, y) {
      var p = beta.length, s = 0;
      for (var i = 0; i < n; i++) {
        var f = 0;
        for (var j = 0; j < p; j++) f += Z[i][j] * beta[j];
        s += (f - y[i]) * (f - y[i]);
      }
      return s / n;
    }
    function norm(beta) { var s = 0; for (var j = 0; j < beta.length; j++) s += beta[j] * beta[j]; return Math.sqrt(s); }
    /* predictions on held-out rows (uses rows n .. n+m-1 of Z) */
    function heldout(beta, n, m, sigma) {
      var out = [], p = beta.length;
      for (var i = n; i < Math.min(NMAX, n + m); i++) {
        var f = 0, t = 0;
        for (var j = 0; j < PMAX; j++) { t += Z[i][j] * B[j]; if (j < p) f += Z[i][j] * beta[j]; }
        out.push([t, f]);
      }
      return out;
    }
    return { NMAX: NMAX, PMAX: PMAX, SPEC: SPEC, Z: Z, B: B, labels: labels, fit: fit,
             risk: risk, trainMSE: trainMSE, norm: norm, heldout: heldout };
  })();
  window.__TMP_LM = LM;

  /* p grid used by the model-wise sweeps */
  function pgrid(pmax) {
    var g = [], v;
    for (var i = 0; i <= 46; i++) {
      v = Math.round(2 * Math.pow(pmax / 2, i / 46));
      if (!g.length || v > g[g.length - 1]) g.push(v);
    }
    return g;
  }

  /* =====================================================================
     FIGURE 4 - model-wise double descent
     ===================================================================== */
  var F4 = (function () {
    var n = 40, sigma = 0.45, lambda = 1e-6;
    var y = LM.labels(n, sigma);
    var ps = pgrid(LM.PMAX), rows = [];
    for (var i = 0; i < ps.length; i++) {
      var beta = LM.fit(n, ps[i], sigma, lambda, y);
      rows.push({ p: ps[i], risk: LM.risk(beta), train: LM.trainMSE(beta, n, y),
                  norm: LM.norm(beta), ho: LM.heldout(beta, n, 26, sigma) });
    }
    return { n: n, sigma: sigma, ps: ps, rows: rows, y: y };
  })();

  reg("fig-model-wise", 64, function (f) {
    var W = 720, H = 384;
    var g = rc(0, 0, W, H, P.bg);
    var idx = Math.min(F4.rows.length - 1, Math.floor(S(f, 2, 58) * (F4.rows.length - 1) + 0.0001));
    var row = F4.rows[idx];
    g += tx(30, 30, "RIDGELESS LEAST SQUARES, n = 40 SAMPLES", { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 48, "covariance spectrum 1, 1/2, 1/3, ...; label noise 0.45", { s: 9.5, f: P.faint });

    /* left: held-out predictions */
    var LX = 30, LY = 74, LW = 236, LH = 200;
    g += rc(LX, LY, LW, LH, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');

    var lim = 3.2;
    var HX = function (v) { return LX + LW / 2 + clamp(v, -lim, lim) / lim * (LW / 2 - 16); };
    var HY = function (v) { return LY + LH / 2 - clamp(v, -lim, lim) / lim * (LH / 2 - 18); };
    g += ln(HX(-lim), HY(-lim), HX(lim), HY(lim), P.line, 1, 'stroke-dasharray="3 3"');
    for (var h = 0; h < row.ho.length; h++) {
      var t0 = row.ho[h][0], f0 = row.ho[h][1];
      var off = Math.abs(f0 - t0) > 1.2;
      g += cir(HX(t0), HY(f0), 3, off ? P.pink : P.green, 'opacity="0.9"');
      if (Math.abs(f0) > lim) g += pth("M" + R(HX(t0) - 4) + " " + R(f0 > 0 ? LY + 16 : LY + LH - 8) + " l8 0 l-4 " + (f0 > 0 ? "-6" : "6") + " z", P.pink, 1, P.pink);
    }
    g += tx(LX + 6, LY + LH - 8, "held-out predictions vs truth; the diagonal is perfect", { s: 8.5, f: P.faint });

    /* right: risk vs p */
    var RX = 300, RY = 74, RW = 386, RH = 200;
    var lo = 0.03, hi = 40;
    var CX = function (p) { return RX + Math.log(p / 2) / Math.log(LM.PMAX / 2) * RW; };
    var CY = function (v) { return RY + RH - (Math.log(clamp(v, lo, hi) / lo) / Math.log(hi / lo)) * RH; };
    g += rc(RX, RY, RW, RH, "#101519");
    for (var d = -1; d <= 1; d++) { var lv = Math.pow(10, d); g += ln(RX, CY(lv), RX + RW, CY(lv), "#1a2228", 1); g += tx(RX - 6, CY(lv) + 4, lv >= 1 ? String(lv) : "0." + String(lv).slice(2), { s: 8.5, a: "end", f: P.line }); }
    [2, 10, 40, 100, 300].forEach(function (pv) { g += ln(CX(pv), RY, CX(pv), RY + RH, "#1a2228", 1); g += tx(CX(pv), RY + RH + 15, String(pv), { s: 8.5, a: "middle", f: P.line }); });
    g += ln(CX(F4.n), RY, CX(F4.n), RY + RH, P.pink, 1.1, 'stroke-dasharray="3 3"');
    g += tx(CX(F4.n) + 5, RY + 14, "p = n", { s: 9, f: P.pink });
    var pts = [], trn = [];
    for (var i = 0; i <= idx; i++) {
      pts.push([CX(F4.rows[i].p), CY(F4.rows[i].risk)]);
      trn.push([CX(F4.rows[i].p), CY(Math.max(F4.rows[i].train, lo))]);
    }
    g += polyline(trn, P.blue, 1.4, 'opacity="0.6"');
    g += polyline(pts, P.green, 2.2);
    g += cir(CX(row.p), CY(row.risk), 4.5, P.green);
    g += tx(RX + 8, RY + 16, "EXCESS RISK  (log scale)", { s: 9.5, f: P.faint, ls: "1" });
    g += tx(RX + 8, RY + RH - 8, "blue = training error", { s: 8.5, f: P.blue });
    g += tx(RX + RW - 8, RY + RH - 8, "parameters p, log axis", { s: 8.5, a: "end", f: P.faint });

    /* readouts */
    g += tx(30, 306, "p", { s: 9.5, f: P.line });
    g += tx(30, 328, String(row.p), { s: 17, f: P.ink, w: 600 });
    g += tx(112, 306, "p / n", { s: 9.5, f: P.line });
    g += tx(112, 328, (row.p / F4.n).toFixed(2), { s: 15, f: P.dim, w: 600 });
    g += tx(206, 306, "training error", { s: 9.5, f: P.line });
    g += tx(206, 328, row.train < 1e-8 ? "0" : fmt(row.train), { s: 15, f: row.train < 1e-8 ? P.green : P.blue, w: 600 });
    g += tx(360, 306, "excess risk", { s: 9.5, f: P.line });
    g += tx(360, 328, fmt(row.risk), { s: 15, f: row.risk > 1 ? P.pink : P.green, w: 600 });
    g += tx(500, 306, "coefficient norm", { s: 9.5, f: P.line });
    g += tx(500, 328, row.norm.toFixed(1), { s: 15, f: row.norm > 8 ? P.pink : P.amber, w: 600 });
    g += tx(30, 350, "COEFFICIENT NORM", { s: 8.5, f: P.faint, ls: "1" });
    g += meter(30, 358, 656, 9, clamp(Math.log(row.norm / 0.5) / Math.log(60), 0, 1), row.norm > 8 ? P.pink : P.amber, "", "");

    var cap;
    if (row.p < 10) cap = "p = " + row.p + ". Underparameterized: the model cannot even express the signal, and the error is almost all bias.";
    else if (row.p < F4.n * 0.7) cap = "p = " + row.p + ". The classical sweet spot has been passed. Training error is falling and test error has started to climb.";
    else if (row.p < F4.n * 0.98) cap = "p = " + row.p + ", approaching the threshold. The coefficient norm is exploding as the design matrix becomes singular.";
    else if (row.p <= F4.n * 1.15) cap = "<b>p = n.</b> Exactly enough freedom to interpolate and none left over. Risk is " + fmt(row.risk, 1) + " &mdash; two orders of magnitude worse than the classical optimum.";
    else if (row.p < 140) cap = "p = " + row.p + ". Past the threshold the extra directions give the minimum-norm solution somewhere cheap to put the noise, and the norm collapses.";
    else cap = "p = " + row.p + ", more than ten times the sample size. Risk has returned to roughly its classical best. <b>The second descent is real, and it is the min-norm bias doing the work.</b>";
    return [sv(g, W, H), cap];
  }, 115);

  /* =====================================================================
     FIGURE 5 - epoch-wise: gradient flow, solved exactly
     ===================================================================== */
  var F5 = (function () {
    var n = 40, p = 44, sigma = 0.45;
    var y = LM.labels(n, sigma), i, k, j, s;
    var G = [];
    for (i = 0; i < n; i++) {
      var row = new Float64Array(n);
      for (k = 0; k < n; k++) { s = 0; for (j = 0; j < p; j++) s += LM.Z[i][j] * LM.Z[k][j]; row[k] = s; }
      G.push(row);
    }
    var ev = jacobi(G, 22);
    var uy = ev.vec.map(function (v) { var t = 0; for (var m = 0; m < n; m++) t += v[m] * y[m]; return t; });
    var ts = [], rows = [];
    for (var e = 0; e <= 52; e++) ts.push(Math.pow(10, -2 + 6 * e / 52));
    ts.forEach(function (t) {
      var al = new Float64Array(n);
      for (var a = 0; a < n; a++) {
        var lam = ev.val[a], c = lam > 1e-13 ? (1 - Math.exp(-lam * t)) / lam : t;
        for (var m2 = 0; m2 < n; m2++) al[m2] += c * uy[a] * ev.vec[a][m2];
      }
      var beta = new Float64Array(p);
      for (var q = 0; q < n; q++) for (var w = 0; w < p; w++) beta[w] += al[q] * LM.Z[q][w];
      var learned = 0;
      for (var z = 0; z < n; z++) if (ev.val[z] * t > 1) learned++;
      rows.push({ t: t, risk: LM.risk(beta), train: LM.trainMSE(beta, n, y), norm: LM.norm(beta), learned: learned });
    });
    return { n: n, p: p, ev: ev, rows: rows, ts: ts };
  })();

  reg("fig-epoch-wise", 60, function (f) {
    var W = 720, H = 384;
    var g = rc(0, 0, W, H, P.bg);
    var idx = Math.min(F5.rows.length - 1, Math.floor(S(f, 2, 54) * (F5.rows.length - 1) + 0.0001));
    var row = F5.rows[idx];
    g += tx(30, 30, "GRADIENT FLOW ON A FIXED MODEL  -  n = 40, p = 44", { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 48, "nothing about the model changes. only the number of steps does.", { s: 9.5, f: P.faint });

    /* left: eigenvalue ladder */
    var LX = 30, LY = 74, LW = 190, LH = 196;
    g += rc(LX, LY, LW, LH, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');
    g += tx(LX + 6, LY + 15, "directions, by eigenvalue", { s: 9, f: P.faint });
    for (var d = 0; d < F5.n; d++) {
      var yy = LY + 24 + d * (LH - 34) / F5.n;
      var lam = F5.ev.val[d];
      var frac = clamp((Math.log(lam) + 6) / 10, 0.02, 1);
      var lit = lam * row.t > 1;
      g += rc(LX + 8, yy, (LW - 22) * frac, 3.2, lit ? (d > F5.n - 8 ? P.pink : P.green) : "#243038");
    }
    g += tx(LX + 6, LY + LH - 16, "lit = already fitted", { s: 8.5, f: P.green });
    g += tx(LX + 6, LY + LH - 5, "pink = the small ones, where noise lives", { s: 8.5, f: P.pink });

    /* right: curves over log time */
    var RX = 254, RY = 74, RW = 432, RH = 196;
    var lo = 0.02, hi = 30;
    var CX = function (t) { return RX + (Math.log10(t) + 2) / 8 * RW; };
    var CY = function (v) { return RY + RH - (Math.log(clamp(v, lo, hi) / lo) / Math.log(hi / lo)) * RH; };
    g += rc(RX, RY, RW, RH, "#101519");
    for (var q2 = -1; q2 <= 1; q2++) { var lv = Math.pow(10, q2); g += ln(RX, CY(lv), RX + RW, CY(lv), "#1a2228", 1); g += tx(RX - 6, CY(lv) + 4, lv >= 1 ? String(lv) : "0." + String(lv).slice(2), { s: 8.5, a: "end", f: P.line }); }
    for (var e2 = -2; e2 <= 6; e2 += 2) { g += ln(CX(Math.pow(10, e2)), RY, CX(Math.pow(10, e2)), RY + RH, "#1a2228", 1); g += tx(CX(Math.pow(10, e2)), RY + RH + 15, "1e" + e2, { s: 8.5, a: "middle", f: P.line }); }
    var tp = [], rp = [];
    for (var i = 0; i <= idx; i++) {
      rp.push([CX(F5.rows[i].t), CY(F5.rows[i].risk)]);
      tp.push([CX(F5.rows[i].t), CY(Math.max(F5.rows[i].train, lo))]);
    }
    g += polyline(tp, P.blue, 1.5, 'opacity="0.7"');
    g += polyline(rp, P.green, 2.2);
    g += cir(CX(row.t), CY(row.risk), 4.5, P.green);
    /* the third phase, which this model does not produce */
    g += rc(CX(1e4), RY, RX + RW - CX(1e4), RH, "#0c1114");
    g += ln(CX(1e4), RY, CX(1e4), RY + RH, P.faint, 1, 'stroke-dasharray="2 3"');
    if (idx >= F5.rows.length - 1) {
      var sch = [];
      for (var s4 = 0; s4 <= 16; s4++) {
        var uu = s4 / 16;
        sch.push([CX(1e4) + uu * (RX + RW - CX(1e4)), CY(7.5 * Math.pow(0.13, uu))]);
      }
      g += polyline(sch, P.amber, 1.6, 'stroke-dasharray="4 3" opacity="0.8"');
    }
    g += tx(CX(1e4) + 6, RY + 16, "deep nets:", { s: 8.5, f: P.amber });
    g += tx(CX(1e4) + 6, RY + 28, "a reported", { s: 8.5, f: P.amber });
    g += tx(CX(1e4) + 6, RY + 40, "third phase", { s: 8.5, f: P.amber });
    g += tx(CX(1e4) + 6, RY + 58, "not produced", { s: 8.5, f: P.faint });
    g += tx(CX(1e4) + 6, RY + 70, "by this model", { s: 8.5, f: P.faint });
    g += tx(RX + 8, RY + 16, "TEST AND TRAINING ERROR OVER TRAINING TIME", { s: 9.5, f: P.faint, ls: "1" });
    g += tx(RX + 8, RY + RH - 8, "blue = training error", { s: 8.5, f: P.blue });
    g += tx(CX(1e4) - 8, RY + RH - 8, "gradient flow time, log axis", { s: 8.5, a: "end", f: P.faint });

    g += tx(30, 302, "time", { s: 9.5, f: P.line });
    g += tx(30, 324, row.t.toExponential(0), { s: 16, f: P.ink, w: 600 });
    g += tx(140, 302, "directions fitted", { s: 9.5, f: P.line });
    g += tx(140, 324, row.learned + " / " + F5.n, { s: 16, f: row.learned >= F5.n ? P.pink : P.green, w: 600 });
    g += tx(300, 302, "training error", { s: 9.5, f: P.line });
    g += tx(300, 324, row.train < 1e-8 ? "0" : fmt(row.train), { s: 15, f: P.blue, w: 600 });
    g += tx(452, 302, "test error", { s: 9.5, f: P.line });
    g += tx(452, 324, fmt(row.risk), { s: 15, f: row.risk > 0.3 ? P.pink : P.green, w: 600 });
    g += tx(596, 302, "weight norm", { s: 9.5, f: P.line });
    g += tx(596, 324, row.norm.toFixed(1), { s: 15, f: P.amber, w: 600 });
    g += meter(30, 356, 656, 10, row.learned / F5.n, row.learned >= F5.n ? P.pink : P.green,
      "EFFECTIVE MODEL COMPLEXITY - DIRECTIONS THE OPTIMIZER HAS ACTUALLY FITTED", row.learned + " of 40");

    var cap;
    if (row.t < 0.15) cap = "The first few steps fit only the highest-variance directions, which is where the signal is. Test error is already falling fast.";
    else if (row.t < 0.7) cap = "<b>Best test error, at " + fmt(row.risk) + "</b>, with only " + row.learned + " of 40 directions fitted. Training error is still visibly non-zero. This is what early stopping buys.";
    else if (row.t < 60) cap = "Now the small-eigenvalue directions are being fitted, and those are the ones carrying noise rather than signal. Test error climbs while training error keeps falling.";
    else if (row.t < 5e3) cap = "Training error has reached zero. Test error has risen " + Math.round(row.risk / 0.05) + "-fold from its best. Time behaved exactly like a capacity dial.";
    else cap = "The exactly-solvable model stops here: gradient flow time acts like an inverse ridge, so it reproduces the descent and the ascent but not the reported third phase. <b>That part is deep-network behaviour this model does not explain.</b>";
    return [sv(g, W, H), cap];
  }, 115);

  /* =====================================================================
     FIGURE 6 - sample-wise non-monotonicity
     ===================================================================== */
  var F6 = (function () {
    var p = 60, sigma = 0.45, lambda = 1e-6, rows = [];
    for (var n = 8; n <= 108; n += 2) {
      var y = LM.labels(n, sigma);
      var beta = LM.fit(n, p, sigma, lambda, y);
      rows.push({ n: n, risk: LM.risk(beta), norm: LM.norm(beta), train: LM.trainMSE(beta, n, y) });
    }
    return { p: p, rows: rows };
  })();

  reg("fig-sample-wise", 56, function (f) {
    var W = 720, H = 376;
    var g = rc(0, 0, W, H, P.bg);
    var idx = Math.min(F6.rows.length - 1, Math.floor(S(f, 2, 50) * (F6.rows.length - 1) + 0.0001));
    var row = F6.rows[idx];
    g += tx(30, 30, "FIXED MODEL, p = 60. ONLY THE DATASET GROWS.", { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 48, "the model is not moving. the interpolation threshold is moving towards it.", { s: 9.5, f: P.faint });

    var RX = 60, RY = 76, RW = 626, RH = 186;
    var lo = 0.02, hi = 40;
    var CX = function (n) { return RX + (n - 8) / 100 * RW; };
    var CY = function (v) { return RY + RH - (Math.log(clamp(v, lo, hi) / lo) / Math.log(hi / lo)) * RH; };
    g += rc(RX, RY, RW, RH, "#101519");
    for (var d = -1; d <= 1; d++) { var lv = Math.pow(10, d); g += ln(RX, CY(lv), RX + RW, CY(lv), "#1a2228", 1); g += tx(RX - 6, CY(lv) + 4, lv >= 1 ? String(lv) : "0." + String(lv).slice(2), { s: 8.5, a: "end", f: P.line }); }
    [20, 40, 60, 80, 100].forEach(function (nv) { g += ln(CX(nv), RY, CX(nv), RY + RH, "#1a2228", 1); g += tx(CX(nv), RY + RH + 16, String(nv), { s: 8.5, a: "middle", f: P.line }); });
    g += ln(CX(F6.p), RY, CX(F6.p), RY + RH, P.pink, 1.1, 'stroke-dasharray="3 3"');
    g += tx(CX(F6.p) + 5, RY + 14, "n = p = 60", { s: 9, f: P.pink });
    var pts = [];
    for (var i = 0; i <= idx; i++) pts.push([CX(F6.rows[i].n), CY(F6.rows[i].risk)]);
    g += polyline(pts, P.green, 2.2);
    g += cir(CX(row.n), CY(row.risk), 4.5, P.green);
    g += tx(RX + 8, RY + 16, "EXCESS RISK AS SAMPLES ARE ADDED  (log scale)", { s: 9.5, f: P.faint, ls: "1" });
    g += tx(RX + RW - 8, RY + RH - 8, "training samples n", { s: 8.5, a: "end", f: P.faint });

    /* regime strip */
    var SY = 290;
    g += rc(RX, SY, RW, 16, "#161d22");
    var thr = CX(F6.p);
    g += rc(RX, SY, thr - RX, 16, P.green, 'opacity="0.28"');
    g += rc(thr, SY, RX + RW - thr, 16, P.blue, 'opacity="0.22"');
    g += tx(RX + 10, SY + 12, "overparameterized: p > n", { s: 9, f: P.green });
    g += tx(RX + RW - 10, SY + 12, "underparameterized: n > p", { s: 9, a: "end", f: P.blue });
    var mark = CX(row.n);
    g += ln(mark, SY - 4, mark, SY + 20, P.ink, 1.4);

    g += tx(30, 336, "n", { s: 9.5, f: P.line });
    g += tx(30, 358, String(row.n), { s: 17, f: P.ink, w: 600 });
    g += tx(120, 336, "n / p", { s: 9.5, f: P.line });
    g += tx(120, 358, (row.n / F6.p).toFixed(2), { s: 15, f: P.dim, w: 600 });
    g += tx(230, 336, "excess risk", { s: 9.5, f: P.line });
    g += tx(230, 358, fmt(row.risk), { s: 15, f: row.risk > 1 ? P.pink : P.green, w: 600 });
    g += tx(390, 336, "vs risk at n = 40", { s: 9.5, f: P.line });
    var base = F6.rows[16].risk;
    var rel = row.risk / base;
    g += tx(390, 358, (rel >= 1 ? rel.toFixed(1) + "x worse" : (1 / rel).toFixed(1) + "x better"), { s: 15, f: rel >= 1 ? P.pink : P.green, w: 600 });
    g += tx(566, 336, "coefficient norm", { s: 9.5, f: P.line });
    g += tx(566, 358, row.norm.toFixed(1), { s: 15, f: P.amber, w: 600 });

    var cap;
    if (row.n < 30) cap = "n = " + row.n + ". Far more parameters than samples, and the minimum-norm solution is doing fine.";
    else if (row.n < 54) cap = "n = " + row.n + ". Adding data has moved the threshold towards the model, and risk is rising. <b>More data is making this worse.</b>";
    else if (row.n <= 66) cap = "n = " + row.n + ", right at the cliff. Risk is " + fmt(row.risk, 1) + ". Every extra sample here costs accuracy.";
    else if (row.n < 88) cap = "n = " + row.n + ". Past the threshold and back into the classical regime, where data helps again.";
    else cap = "n = " + row.n + ". Now genuinely overdetermined, and the estimator is behaving like an ordinary textbook regression.";
    return [sv(g, W, H), cap];
  }, 115);

  /* =====================================================================
     LAB 1 - kill the peak
     ===================================================================== */
  lab("lab-ridge", function (el) {
    var stage = el.querySelector(".animation-stage");
    var read = el.querySelector(".lab-readout");
    var sl = { lam: el.querySelector("#ridge-lambda"), sig: el.querySelector("#ridge-noise"), n: el.querySelector("#ridge-n") };
    var out = { lam: el.querySelector("#ridge-lambda-out"), sig: el.querySelector("#ridge-noise-out"), n: el.querySelector("#ridge-n-out") };
    var PS = (function () { var a = [], v; for (var i = 0; i <= 34; i++) { v = Math.round(2 * Math.pow(LM.PMAX / 2, i / 34)); if (!a.length || v > a[a.length - 1]) a.push(v); } return a; })();
    var TUNE = [1e-6, 1e-3, 1e-2, 0.1, 1];
    var pending = false;

    function render() {
      var lamExp = parseFloat(sl.lam.value), lambda = Math.pow(10, lamExp);
      var sigma = parseFloat(sl.sig.value), n = parseInt(sl.n.value, 10);
      out.lam.textContent = lamExp <= -9 ? "0 (ridgeless)" : lambda.toExponential(1);
      out.sig.textContent = sigma.toFixed(2);
      out.n.textContent = String(n);
      var y = LM.labels(n, sigma);
      var cur = [], best = [], bestLam = [];
      for (var i = 0; i < PS.length; i++) {
        var p = PS[i];
        cur.push(LM.risk(LM.fit(n, p, sigma, Math.max(lambda, 1e-9), y)));
        var bv = Infinity, bl = TUNE[0];
        for (var k = 0; k < TUNE.length; k++) {
          var v = LM.risk(LM.fit(n, p, sigma, TUNE[k], y));
          if (v < bv) { bv = v; bl = TUNE[k]; }
        }
        best.push(bv); bestLam.push(bl);
      }
      var W = 720, H = 306;
      var g = rc(0, 0, W, H, P.bg);
      var RX = 60, RY = 40, RW = 626, RH = 196;
      var lo = 0.02, hi = 60;
      var CX = function (p) { return RX + Math.log(p / 2) / Math.log(LM.PMAX / 2) * RW; };
      var CY = function (v) { return RY + RH - (Math.log(clamp(v, lo, hi) / lo) / Math.log(hi / lo)) * RH; };
      g += rc(RX, RY, RW, RH, "#101519");
      for (var d = -1; d <= 1; d++) { var lv = Math.pow(10, d); g += ln(RX, CY(lv), RX + RW, CY(lv), "#1a2228", 1); g += tx(RX - 6, CY(lv) + 4, lv >= 1 ? String(lv) : "0." + String(lv).slice(2), { s: 8.5, a: "end", f: P.line }); }
      [2, 10, 40, 100, 300].forEach(function (pv) { g += ln(CX(pv), RY, CX(pv), RY + RH, "#1a2228", 1); g += tx(CX(pv), RY + RH + 15, String(pv), { s: 8.5, a: "middle", f: P.line }); });
      g += ln(CX(n), RY, CX(n), RY + RH, P.pink, 1.1, 'stroke-dasharray="3 3"');
      g += tx(CX(n) + 5, RY + 14, "p = n = " + n, { s: 9, f: P.pink });
      g += polyline(best.map(function (v, i) { return [CX(PS[i]), CY(v)]; }), P.blue, 1.6, 'stroke-dasharray="4 3"');
      g += polyline(cur.map(function (v, i) { return [CX(PS[i]), CY(v)]; }), P.green, 2.3);
      g += tx(RX + 8, RY + RH - 22, "green = your ridge", { s: 8.5, f: P.green });
      g += tx(RX + 8, RY + RH - 8, "blue dashed = best ridge at each p", { s: 8.5, f: P.blue });
      g += tx(RX + 8, RY + 16, "EXCESS RISK VS MODEL SIZE  (log scale)", { s: 9.5, f: P.faint, ls: "1" });
      g += tx(RX + RW - 8, RY + RH - 8, "parameters p, log axis", { s: 8.5, a: "end", f: P.faint });
      var peak = 0, peakP = 0, floor = Infinity, bpeak = 0;
      for (var q = 0; q < cur.length; q++) { if (cur[q] > peak) { peak = cur[q]; peakP = PS[q]; } if (cur[q] < floor) floor = cur[q]; if (best[q] > bpeak) bpeak = best[q]; }
      g += meter(60, 274, 260, 12, clamp(Math.log(peak / floor) / Math.log(600), 0, 1), peak / floor > 12 ? P.pink : P.green,
        "PEAK HEIGHT ABOVE THE FLOOR", (peak / floor).toFixed(1) + "x");
      g += meter(426, 274, 260, 12, clamp(Math.log(bpeak / floor) / Math.log(600), 0, 1), P.blue,
        "SAME, WITH THE RIDGE TUNED", (bpeak / Math.min.apply(null, best)).toFixed(1) + "x");
      stage.innerHTML = sv(g, W, H);
      stage.setAttribute("aria-label", "Double descent curve with ridge " + out.lam.textContent + ", noise " + sigma.toFixed(2) + ", n = " + n +
        ". Peak is " + (peak / floor).toFixed(1) + " times the floor; with a tuned ridge it is " + (bpeak / Math.min.apply(null, best)).toFixed(1) + " times.");
      var msg;
      if (peak / floor > 40) msg = "The peak at p = " + peakP + " is <b>" + (peak / floor).toFixed(0) + " times</b> the best risk on this curve. Now drag the ridge slider right.";
      else if (peak / floor > 6) msg = "Peak is " + (peak / floor).toFixed(1) + "x the floor. Still visible, already much smaller.";
      else if (sigma < 0.06) msg = "With almost no label noise there is barely a peak to remove &mdash; the spike was mostly the model straining to reproduce values that carried no signal.";
      else msg = "Peak is down to <b>" + (peak / floor).toFixed(1) + "x</b>. The curve is close to monotone: what looked like a new regime of statistics was an unregularized solve near a singularity.";
      read.innerHTML = msg;
    }
    function schedule() {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () { pending = false; render(); });
    }
    ["lam", "sig", "n"].forEach(function (k) { sl[k].addEventListener("input", schedule); });
    render();
  });

  /* =====================================================================
     FIGURE 7 - benign overfitting: where the noise goes
     ===================================================================== */
  var F7 = (function () {
    var NMAX = 40, PMAX = 460, HEAD = 6, TAIL = 0.05, n = 30, sigma = 0.4;
    var r = rng(777);
    var SPEC = new Float64Array(PMAX);
    for (var j = 0; j < PMAX; j++) SPEC[j] = j < HEAD ? 1 : TAIL;
    var Z = [];
    for (var i = 0; i < NMAX; i++) {
      var row = new Float64Array(PMAX);
      for (var k = 0; k < PMAX; k++) row[k] = Math.sqrt(SPEC[k]) * gauss(r);
      Z.push(row);
    }
    var B = new Float64Array(PMAX), base = [1, -0.8, 0.6, -0.45, 0.35, -0.25], nn = 0;
    for (var q = 0; q < HEAD; q++) { B[q] = base[q]; nn += SPEC[q] * B[q] * B[q]; }
    nn = Math.sqrt(nn);
    for (var q2 = 0; q2 < HEAD; q2++) B[q2] /= nn;
    var NZ = [];
    for (var m = 0; m < NMAX; m++) NZ.push(gauss(r));
    var y = new Float64Array(n);
    for (var a = 0; a < n; a++) { var s = 0; for (var b = 0; b < PMAX; b++) s += Z[a][b] * B[b]; y[a] = s + sigma * NZ[a]; }
    var ps = [], rows = [];
    for (var e = 0; e <= 44; e++) { var v = Math.round(31 * Math.pow(PMAX / 31, e / 44)); if (!ps.length || v > ps[ps.length - 1]) ps.push(v); }
    ps.forEach(function (p) {
      var G = [], i2, k2, j2, s2;
      for (i2 = 0; i2 < n; i2++) {
        var g2 = new Float64Array(n);
        for (k2 = 0; k2 < n; k2++) { s2 = 0; for (j2 = 0; j2 < p; j2++) s2 += Z[i2][j2] * Z[k2][j2]; g2[k2] = s2 + (i2 === k2 ? 1e-9 : 0); }
        G.push(g2);
      }
      var al = solveSPD(G, y);
      var beta = new Float64Array(p);
      for (i2 = 0; i2 < n; i2++) for (j2 = 0; j2 < p; j2++) beta[j2] += al[i2] * Z[i2][j2];
      var head = 0, tail = 0, tmax = 0, tenergy = 0;
      for (j2 = 0; j2 < PMAX; j2++) {
        var bh = j2 < p ? beta[j2] : 0;
        var err = SPEC[j2] * (bh - B[j2]) * (bh - B[j2]);
        if (j2 < HEAD) head += err; else { tail += err; tmax = Math.max(tmax, Math.abs(bh)); tenergy += bh * bh; }
      }
      rows.push({ p: p, head: head, tail: tail, risk: head + tail, tmax: tmax, tenergy: tenergy,
                  coef: Array.prototype.slice.call(beta.slice(0, Math.min(p, 60))) });
    });
    return { HEAD: HEAD, n: n, ps: ps, rows: rows, B: B, PMAX: PMAX };
  })();

  reg("fig-benign", 60, function (f) {
    var W = 720, H = 384;
    var g = rc(0, 0, W, H, P.bg);
    var idx = Math.min(F7.rows.length - 1, Math.floor(S(f, 2, 54) * (F7.rows.length - 1) + 0.0001));
    var row = F7.rows[idx];
    g += tx(30, 30, "MINIMUM-NORM INTERPOLATION, n = 30 NOISY POINTS", { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 48, "six signal directions with variance 1, then a flat tail of variance 0.05", { s: 9.5, f: P.faint });

    /* coefficient bars */
    var BX = 30, BY = 82, BW = 656, BH = 118;
    g += rc(BX, BY, BW, BH, "#101519");
    var shown = Math.min(row.coef.length, 60);
    var cw = BW / 60;
    var mid = BY + BH * 0.52;
    var scale = 0.82;
    /* signed power scale, so coefficients three orders of magnitude apart stay visible */
    var bar = function (v) { return Math.pow(clamp(Math.abs(v), 0, 3) / 3, 0.4) * (BH * 0.5) * scale; };
    for (var j = 0; j < shown; j++) {
      var v = row.coef[j];
      var h = bar(v);
      var col = j < F7.HEAD ? P.green : P.amber;
      g += rc(BX + j * cw + 1, v >= 0 ? mid - h : mid, cw - 2, h, col, 'opacity="0.92"');
      if (j < F7.HEAD) {
        var ty2 = mid - Math.sign(F7.B[j]) * bar(F7.B[j]);
        g += ln(BX + j * cw + 1, ty2, BX + j * cw + cw - 1, ty2, P.ink, 1.6);
      }
    }
    g += ln(BX, mid, BX + BW, mid, P.line, 1);
    g += ln(BX + F7.HEAD * cw, BY, BX + F7.HEAD * cw, BY + BH, P.line, 1, 'stroke-dasharray="3 3"');
    g += tx(BX + 4, BY + 14, "signal", { s: 9, f: P.green });
    g += tx(BX + F7.HEAD * cw + 8, BY + 14, "tail directions, fitted coefficients (first " + Math.min(54, row.p - F7.HEAD) + " of " + (row.p - F7.HEAD) + ")", { s: 9, f: P.amber });
    g += tx(BX + BW - 4, BY + 14, "white ticks = the truth", { s: 8.5, a: "end", f: P.ink });

    /* risk decomposition curve */
    var RX = 30, RY = 222, RW = 400, RH = 108;
    var lo = 0.01, hi = 40;
    var CX = function (p) { return RX + Math.log(p / 31) / Math.log(F7.PMAX / 31) * RW; };
    var CY = function (v) { return RY + RH - (Math.log(clamp(v, lo, hi) / lo) / Math.log(hi / lo)) * RH; };
    g += rc(RX, RY, RW, RH, "#101519");
    g += tx(RX, RY - 8, "EXCESS RISK, SPLIT  (log scale)", { s: 9.5, f: P.faint, ls: "1" });
    var tp = [], hp = [], ap = [];
    for (var i = 0; i <= idx; i++) {
      tp.push([CX(F7.rows[i].p), CY(F7.rows[i].tail)]);
      hp.push([CX(F7.rows[i].p), CY(F7.rows[i].head)]);
      ap.push([CX(F7.rows[i].p), CY(F7.rows[i].risk)]);
    }
    g += polyline(tp, P.amber, 1.6);
    g += polyline(hp, P.teal, 1.6);
    g += polyline(ap, P.green, 2.2);
    g += cir(CX(row.p), CY(row.risk), 4, P.green);
    g += tx(RX + 6, RY + RH - 22, "amber = absorbed noise", { s: 8.5, f: P.amber });
    g += tx(RX + 6, RY + RH - 10, "teal = signal error", { s: 8.5, f: P.teal });
    g += tx(RX + RW - 6, RY + RH - 10, "total dimension p, log axis", { s: 8.5, a: "end", f: P.faint });

    /* readouts */
    g += tx(452, 232, "p", { s: 9.5, f: P.line });
    g += tx(452, 252, String(row.p), { s: 16, f: P.ink, w: 600 });
    g += tx(560, 232, "largest tail coefficient", { s: 9.5, f: P.line });
    g += tx(560, 252, row.tmax.toFixed(3), { s: 16, f: P.amber, w: 600 });
    g += tx(452, 282, "risk from absorbed noise", { s: 9.5, f: P.line });
    g += tx(452, 302, fmt(row.tail), { s: 16, f: P.amber, w: 600 });
    g += tx(452, 330, "training error", { s: 9.5, f: P.line });
    g += tx(452, 350, "0  (exact interpolation, always)", { s: 13, f: P.green, w: 600 });
    g += meter(452, 368, 234, 9, clamp(row.tail / 3, 0, 1), P.amber, "", "");

    var cap;
    if (row.p < 36) cap = "p = " + row.p + ", barely above n. There is almost nowhere to put the noise, so it lands on a handful of coordinates with enormous weights. Risk " + fmt(row.risk, 1) + ".";
    else if (row.p < 80) cap = "p = " + row.p + ". More tail directions, so each absorbs a smaller share. The largest tail coefficient has fallen to " + row.tmax.toFixed(2) + ".";
    else if (row.p < 200) cap = "p = " + row.p + ". <b>Noise risk is now " + fmt(row.tail) + ", down from " + fmt(F7.rows[0].tail, 1) + "</b>, while the training points are still hit exactly. This is benign overfitting.";
    else cap = "p = " + row.p + ". Note the teal curve turning up: too much tail variance starts diluting the signal directions too. The condition is a <b>range</b>, not a direction.";
    return [sv(g, W, H), cap];
  }, 115);
})();
