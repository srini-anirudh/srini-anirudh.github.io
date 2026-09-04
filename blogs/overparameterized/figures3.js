/* Figures 8-13, Labs 2-3, and boot. */
(function () {
  "use strict";
  var F = window.__TMP_FIG;
  var P = F.P, HUES = F.HUES, R = F.R, clamp = F.clamp, lerp = F.lerp, S = F.S, E = F.E, fmt = F.fmt, si = F.si;
  var rc = F.rc, tx = F.tx, ln = F.ln, pth = F.pth, cir = F.cir, sv = F.sv, meter = F.meter,
      polyline = F.polyline, reg = F.reg, lab = F.lab;
  var rng = F.rng, gauss = F.gauss;

  /* ---------- separable 2D logistic regression, run for real ---------- */
  function makeData(seed) {
    /* One class, expressed as y_i * x_i, so a valid separator has <w, z_i> > 0.
       Deliberately anisotropic: informative along the first coordinate, weakly
       and consistently offset along the second, so the separators that different
       procedures select actually differ. */
    var r = rng(seed * 9176 + 13), z = [];
    for (var i = 0; i < 12; i++) {
      var a = 1.0 + gauss(r) * 0.55, b = 0.35 + gauss(r) * 0.2;
      if (a < 0.35) a = 0.35 + Math.abs(gauss(r)) * 0.1;
      z.push([a, b]);
    }
    return z;
  }
  function maxMargin(z, norm) {
    var best = -1, bang = 0;
    for (var a = 0; a < 3600; a++) {
      var th = a * Math.PI * 2 / 3600, u = [Math.cos(th), Math.sin(th)];
      var den = norm === 1 ? (Math.abs(u[0]) + Math.abs(u[1])) : Math.sqrt(u[0] * u[0] + u[1] * u[1]);
      var m = Infinity;
      for (var i = 0; i < z.length; i++) m = Math.min(m, (u[0] * z[i][0] + u[1] * z[i][1]) / den);
      if (m > best) { best = m; bang = th; }
    }
    return { ang: bang, margin: best };
  }
  function marginOf(w, z, norm) {
    var den = norm === 1 ? (Math.abs(w[0]) + Math.abs(w[1])) : Math.sqrt(w[0] * w[0] + w[1] * w[1]);
    if (den < 1e-12) return 0;
    var m = Infinity;
    for (var i = 0; i < z.length; i++) m = Math.min(m, (w[0] * z[i][0] + w[1] * z[i][1]) / den);
    return m;
  }
  function runDescent(z, snaps, eta, wd) {
    wd = wd || 0;
    var w = [0, 0], out = [], next = 0, total = snaps[snaps.length - 1];
    for (var t = 1; t <= total; t++) {
      var g0 = 0, g1 = 0;
      for (var i = 0; i < z.length; i++) {
        var m = w[0] * z[i][0] + w[1] * z[i][1];
        var s = 1 / (1 + Math.exp(clamp(m, -60, 60)));
        g0 += s * z[i][0]; g1 += s * z[i][1];
      }
      w[0] += eta * (g0 - wd * w[0]);
      w[1] += eta * (g1 - wd * w[1]);
      while (next < snaps.length && t === snaps[next]) { out.push([w[0], w[1]]); next++; }
    }
    return out;
  }
  var SNAPS = (function () {
    var a = [], v, last = 0;
    for (var i = 0; i <= 53; i++) { v = Math.round(Math.pow(10, i / 10)); if (v > last) { a.push(v); last = v; } }
    return a;
  })();

  /* =====================================================================
     FIGURE 8 - implicit bias of gradient descent
     ===================================================================== */
  var F8 = (function () {
    var z = makeData(3);
    var mm = maxMargin(z, 2);
    var traj = runDescent(z, SNAPS, 0.25, 0);
    var rows = traj.map(function (w, i) {
      var nrm = Math.sqrt(w[0] * w[0] + w[1] * w[1]);
      var ang = Math.atan2(w[1], w[0]);
      var gap = Math.abs(((ang - mm.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      var loss = 0;
      for (var k = 0; k < z.length; k++) {
        var m = w[0] * z[k][0] + w[1] * z[k][1];
        loss += m > 30 ? Math.exp(-m) : Math.log(1 + Math.exp(-m));
      }
      return { t: SNAPS[i], w: w, norm: nrm, ang: ang, gap: gap, loss: loss / z.length, margin: marginOf(w, z, 2) };
    });
    return { z: z, mm: mm, rows: rows };
  })();

  reg("fig-implicit-bias", 68, function (f) {
    var W = 720, H = 384;
    var g = rc(0, 0, W, H, P.bg);
    var idx = Math.min(F8.rows.length - 1, Math.floor(S(f, 2, 62) * (F8.rows.length - 1) + 0.0001));
    var row = F8.rows[idx];
    g += tx(30, 30, "UNREGULARIZED LOGISTIC REGRESSION, RUN PAST ZERO TRAINING ERROR", { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 48, "fourteen separable points, plain gradient descent, no penalty of any kind", { s: 9.5, f: P.faint });

    var LX = 30, LY = 74, LW = 300, LH = 236;
    g += rc(LX, LY, LW, LH, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');
    var sc = 62, cx = LX + LW / 2, cy = LY + LH / 2;
    var X = function (a) { return cx + a * sc; }, Y = function (b) { return cy - b * sc; };
    g += ln(LX, cy, LX + LW, cy, "#1a2228", 1);
    g += ln(cx, LY, cx, LY + LH, "#1a2228", 1);
    /* max-margin separator and its street */
    var mu = [Math.cos(F8.mm.ang), Math.sin(F8.mm.ang)];
    var perp = [-mu[1], mu[0]];
    g += ln(X(-perp[0] * 2.4), Y(-perp[1] * 2.4), X(perp[0] * 2.4), Y(perp[1] * 2.4), P.amber, 1.4, 'stroke-dasharray="5 4"');
    var half = F8.mm.margin;
    g += ln(X(-perp[0] * 2.4 + mu[0] * half), Y(-perp[1] * 2.4 + mu[1] * half), X(perp[0] * 2.4 + mu[0] * half), Y(perp[1] * 2.4 + mu[1] * half), P.amber, 0.8, 'opacity="0.45"');
    g += ln(X(-perp[0] * 2.4 - mu[0] * half), Y(-perp[1] * 2.4 - mu[1] * half), X(perp[0] * 2.4 - mu[0] * half), Y(perp[1] * 2.4 - mu[1] * half), P.amber, 0.8, 'opacity="0.45"');
    /* current separator */
    var cu = [Math.cos(row.ang), Math.sin(row.ang)], cp = [-cu[1], cu[0]];
    g += ln(X(-cp[0] * 2.4), Y(-cp[1] * 2.4), X(cp[0] * 2.4), Y(cp[1] * 2.4), P.green, 2);
    for (var i = 0; i < F8.z.length; i++) {
      var pt = F8.z[i];
      var sup = Math.abs(mu[0] * pt[0] + mu[1] * pt[1] - F8.mm.margin) < 0.06;
      g += cir(X(pt[0]), Y(pt[1]), sup ? 5 : 3.4, sup ? P.amber : P.blue, 'opacity="0.92"');
      g += cir(X(-pt[0]), Y(-pt[1]), sup ? 5 : 3.4, sup ? P.amber : P.pink, 'opacity="0.55"');
    }
    g += tx(LX + 8, LY + 16, "green = current direction", { s: 8.5, f: P.green });
    g += tx(LX + 8, LY + 29, "amber dashed = max-margin, with its street", { s: 8.5, f: P.amber });
    g += tx(LX + 8, LY + LH - 8, "faded points are the mirrored class", { s: 8.5, f: P.faint });

    /* right: norm and angle gap over log t */
    var RX = 366, RY = 74, RW = 320, RH = 108;
    var CXt = function (t) { return RX + Math.log10(Math.max(t, 1)) / 5.3 * RW; };
    g += rc(RX, RY, RW, RH, "#101519");
    g += tx(RX, RY - 8, "WEIGHT NORM  -  grows like log t", { s: 9.5, f: P.faint, ls: "1" });
    var maxN = F8.rows[F8.rows.length - 1].norm;
    var np = [], gp = [];
    for (var k = 0; k <= idx; k++) {
      np.push([CXt(F8.rows[k].t), RY + RH - F8.rows[k].norm / maxN * (RH - 10)]);
      gp.push([CXt(F8.rows[k].t), 0]);
    }
    g += polyline(np, P.amber, 2);
    g += cir(CXt(row.t), RY + RH - row.norm / maxN * (RH - 10), 4, P.amber);

    var GY = 216, GH = 96;
    g += rc(RX, GY, RW, GH, "#101519");
    g += tx(RX, GY - 8, "ANGLE TO THE MAX-MARGIN DIRECTION", { s: 9.5, f: P.faint, ls: "1" });
    var maxG = F8.rows[0].gap || 1;
    var pts2 = [];
    for (var k2 = 0; k2 <= idx; k2++) pts2.push([CXt(F8.rows[k2].t), GY + GH - 8 - (1 - F8.rows[k2].gap / maxG) * (GH - 18)]);
    g += polyline(pts2, P.green, 2);
    g += cir(CXt(row.t), GY + GH - 8 - (1 - row.gap / maxG) * (GH - 18), 4, P.green);
    for (var e = 0; e <= 5; e += 1) { g += ln(CXt(Math.pow(10, e)), GY, CXt(Math.pow(10, e)), GY + GH, "#1a2228", 1); g += tx(CXt(Math.pow(10, e)), GY + GH + 14, "1e" + e, { s: 8.5, a: "middle", f: P.line }); }
    g += tx(RX + RW, GY + GH + 14, "gradient steps", { s: 9, a: "end", f: P.faint });

    g += tx(30, 332, "steps", { s: 9.5, f: P.line });
    g += tx(30, 352, si(row.t), { s: 16, f: P.ink, w: 600 });
    g += tx(122, 332, "training loss", { s: 9.5, f: P.line });
    g += tx(122, 352, row.loss < 1e-6 ? row.loss.toExponential(0) : fmt(row.loss), { s: 15, f: P.blue, w: 600 });
    g += tx(268, 332, "weight norm", { s: 9.5, f: P.line });
    g += tx(268, 352, row.norm.toFixed(1), { s: 15, f: P.amber, w: 600 });
    g += tx(404, 332, "angle to max-margin", { s: 9.5, f: P.line });
    g += tx(404, 352, (row.gap * 180 / Math.PI).toFixed(2) + " deg", { s: 15, f: row.gap < 0.02 ? P.green : P.pink, w: 600 });
    g += tx(578, 332, "margin, share of best", { s: 9.5, f: P.line });
    g += tx(578, 352, (100 * row.margin / F8.mm.margin).toFixed(1) + "%", { s: 15, f: P.green, w: 600 });

    var cap;
    if (row.t < 20) cap = "Early steps. The direction is dragged around by whichever points are still misclassified, and the margin is at " + (100 * row.margin / F8.mm.margin).toFixed(0) + "% of the best available.";
    else if (row.loss > 0.02) cap = "Training error is already zero and the loss is still falling, so the weights keep growing. Nothing in the objective is pushing back.";
    else if (row.t < 1e4) cap = "Margin now <b>" + (100 * row.margin / F8.mm.margin).toFixed(1) + "% of the maximum</b>, angle " + (row.gap * 180 / Math.PI).toFixed(1) + " degrees off. No margin term appears anywhere in the objective.";
    else cap = "After " + si(row.t) + " steps: <b>" + (100 * row.margin / F8.mm.margin).toFixed(1) + "% of the max margin, and still " + (row.gap * 180 / Math.PI).toFixed(1) + " degrees off it.</b> That is the O(1/log t) rate. Halving the remaining gap means squaring the step count.";
    return [sv(g, W, H), cap];
  }, 105);

  /* =====================================================================
     LAB 2 - which zero-error separator does the procedure return?
     ===================================================================== */
  var WDS = [0, 0.003, 0.01, 0.03, 0.1, 0.6, 3];
  lab("lab-margin", function (el) {
    var stage = el.querySelector(".animation-stage");
    var read = el.querySelector(".lab-readout");
    var slSteps = el.querySelector("#margin-steps"), slWd = el.querySelector("#margin-wd"), slSeed = el.querySelector("#margin-seed");
    var outSteps = el.querySelector("#margin-steps-out"), outWd = el.querySelector("#margin-wd-out"), outSeed = el.querySelector("#margin-seed-out");
    var cache = {};
    function runs(seed) {
      if (!cache[seed]) {
        var z = makeData(seed);
        cache[seed] = { z: z, mm: maxMargin(z, 2), traj: WDS.map(function (wd) { return runDescent(z, SNAPS, 0.25, wd); }) };
      }
      return cache[seed];
    }
    function render() {
      var si2 = Math.min(SNAPS.length - 1, parseInt(slSteps.value, 10));
      var wi = parseInt(slWd.value, 10), seed = parseInt(slSeed.value, 10);
      var d = runs(seed), w = d.traj[wi][si2];
      outSteps.textContent = SNAPS[si2].toLocaleString();
      outWd.textContent = WDS[wi] === 0 ? "0 (none)" : String(WDS[wi]);
      outSeed.textContent = String(seed);
      var W = 720, H = 296;
      var g = rc(0, 0, W, H, P.bg);
      var LX = 30, LY = 26, LW = 300, LH = 248;
      g += rc(LX, LY, LW, LH, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');
      var sc = 52, cx = LX + LW / 2, cy = LY + LH / 2;
      var X = function (a) { return cx + a * sc; }, Y = function (b) { return cy - b * sc; };
      g += ln(LX, cy, LX + LW, cy, "#1a2228", 1);
      g += ln(cx, LY, cx, LY + LH, "#1a2228", 1);
      function sep(ang, col, wid, dash) {
        var u = [Math.cos(ang), Math.sin(ang)], q = [-u[1], u[0]];
        return ln(X(-q[0] * 2.7), Y(-q[1] * 2.7), X(q[0] * 2.7), Y(q[1] * 2.7), col, wid, dash ? 'stroke-dasharray="5 4"' : "");
      }
      /* every separator the reader has already visited, faintly */
      for (var k = 0; k < WDS.length; k++) {
        var wk = d.traj[k][si2];
        if (k === wi) continue;
        g += sep(Math.atan2(wk[1], wk[0]), "#28323a", 1, false);
      }
      g += sep(d.mm.ang, P.amber, 1.4, true);
      g += sep(Math.atan2(w[1], w[0]), P.green, 2.4);
      for (var i = 0; i < d.z.length; i++) {
        g += cir(X(d.z[i][0]), Y(d.z[i][1]), 3.6, P.blue, 'opacity="0.92"');
        g += cir(X(-d.z[i][0]), Y(-d.z[i][1]), 3.6, P.pink, 'opacity="0.5"');
      }
      g += tx(LX + 8, LY + 16, "green = what this run returned", { s: 8.5, f: P.green });
      g += tx(LX + 8, LY + 29, "amber dashed = maximum margin", { s: 8.5, f: P.amber });
      g += tx(LX + 8, LY + LH - 8, "grey = the other weight-decay settings", { s: 8.5, f: P.faint });

      var RX = 360;
      var ang = Math.atan2(w[1], w[0]) * 180 / Math.PI;
      var mmAng = d.mm.ang * 180 / Math.PI;
      var mg = marginOf(w, d.z, 2), nrm = Math.hypot(w[0], w[1]);
      var loss = 0, wrong = 0;
      for (var q = 0; q < d.z.length; q++) {
        var m2 = w[0] * d.z[q][0] + w[1] * d.z[q][1];
        loss += (m2 > 30 ? Math.exp(-m2) : Math.log(1 + Math.exp(-m2))) / d.z.length;
        if (m2 <= 0) wrong++;
      }
      g += tx(RX, 44, "TRAINING ERROR", { s: 9.5, f: P.faint, ls: "1" });
      g += tx(RX, 68, wrong === 0 ? "0 of 12 misclassified" : wrong + " of 12 misclassified", { s: 16, f: wrong ? P.pink : P.green, w: 600 });
      g += tx(RX, 86, "identical for every setting below", { s: 9, f: P.faint });
      g += meter(RX, 118, 326, 12, clamp(mg / d.mm.margin, 0, 1), P.green, "MARGIN, SHARE OF THE BEST AVAILABLE", (100 * mg / d.mm.margin).toFixed(1) + "%");
      g += tx(RX, 158, "separator angle", { s: 9.5, f: P.line });
      g += tx(RX, 180, ang.toFixed(1) + " deg", { s: 16, f: P.green, w: 600 });
      g += tx(RX + 160, 158, "max-margin angle", { s: 9.5, f: P.line });
      g += tx(RX + 160, 180, mmAng.toFixed(1) + " deg", { s: 16, f: P.amber, w: 600 });
      g += tx(RX, 210, "weight norm", { s: 9.5, f: P.line });
      g += tx(RX, 232, nrm.toFixed(2), { s: 15, f: P.blue, w: 600 });
      g += tx(RX + 160, 210, "training loss", { s: 9.5, f: P.line });
      g += tx(RX + 160, 232, loss < 1e-5 ? loss.toExponential(1) : loss.toFixed(5), { s: 15, f: P.blue, w: 600 });
      g += tx(RX, 268, "every setting reaches zero training error in a few hundred steps", { s: 9, f: P.faint });
      stage.innerHTML = sv(g, W, H);
      stage.setAttribute("aria-label", "Separator at angle " + ang.toFixed(1) + " degrees after " + SNAPS[si2] +
        " steps with weight decay " + WDS[wi] + ", against a maximum-margin angle of " + mmAng.toFixed(1) + " degrees");
      var gap = Math.abs(ang - mmAng);
      read.innerHTML = SNAPS[si2] < 30
        ? "Too early to tell the settings apart. Everything is still just looking for any separator at all."
        : "Zero training error, and the answer still depends on how you got there: this run sits <b>" + gap.toFixed(1) + " degrees</b> from the maximum-margin direction at " + (100 * mg / d.mm.margin).toFixed(1) + "% of the best margin. Slide the weight decay across its range and watch the chosen separator swing while the training error never moves.";
    }
    [slSteps, slWd, slSeed].forEach(function (x) { x.addEventListener("input", render); });
    render();
  });

  /* =====================================================================
     FIGURE 9 - parameter space is not function space
     ===================================================================== */
  reg("fig-function-space", 56, function (f) {
    var W = 720, H = 370;
    var g = rc(0, 0, W, H, P.bg);
    var stage = f < 18 ? 0 : (f < 38 ? 1 : 2);
    var titles = ["PERMUTING HIDDEN UNITS", "RESCALING BETWEEN LAYERS", "SHARPNESS IS NOT A PROPERTY OF THE FUNCTION"];
    g += tx(30, 30, titles[stage], { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 48, "a three-unit hidden layer, and the identical function it computes throughout", { s: 9.5, f: P.faint });

    var LX = 30, LY = 74, LW = 330, LH = 210;
    g += rc(LX, LY, LW, LH, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');
    g += tx(LX + 8, LY + 16, "parameter space", { s: 9, f: P.faint });
    var perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    if (stage === 0) {
      var pi = Math.floor(S(f, 1, 17) * 5.99);
      var pm = perms[Math.min(5, pi)];
      var ux = [LX + 92, LX + 165, LX + 238];
      for (var i = 0; i < 3; i++) {
        var src = pm[i];
        g += cir(LX + 46, LY + 70 + 35, 7, P.dim);
        g += ln(LX + 53, LY + 105, ux[i] - 16, LY + 76, HUES[src], 1.4, 'opacity="0.8"');
        g += ln(ux[i] + 16, LY + 76, LX + 288, LY + 105, HUES[src], 1.4, 'opacity="0.8"');
        g += cir(ux[i], LY + 76, 15, "#1a2229", 'stroke="' + HUES[src] + '" stroke-width="1.6"');
        g += tx(ux[i], LY + 80, "h" + (src + 1), { s: 10, a: "middle", f: HUES[src], w: 600 });
      }
      g += cir(LX + 288, LY + 105, 7, P.dim);
      g += tx(LX + 8, LY + LH - 26, "arrangement " + (Math.min(5, pi) + 1) + " of 3! = 6", { s: 10, f: P.ink });
      g += tx(LX + 8, LY + LH - 10, "for a width-4096 layer there are 4096! of these", { s: 9, f: P.faint });
    } else if (stage === 1) {
      var t = S(f, 18, 37);
      var c = Math.pow(10, lerp(-1, 1, t));
      g += tx(LX + 8, LY + 50, "layer 1 weights  x  c", { s: 11, f: P.blue });
      g += meter(LX + 20, LY + 70, 280, 14, clamp((Math.log10(c) + 1) / 2, 0, 1), P.blue, "", "c = " + c.toFixed(2));
      g += tx(LX + 8, LY + 118, "layer 2 weights  /  c", { s: 11, f: P.amber });
      g += meter(LX + 20, LY + 138, 280, 14, clamp(1 - (Math.log10(c) + 1) / 2, 0, 1), P.amber, "", "1/c = " + (1 / c).toFixed(2));
      g += tx(LX + 8, LY + LH - 26, "parameter norm: " + (Math.sqrt(c * c + 1 / (c * c)) * 3.1).toFixed(2), { s: 11, f: P.pink, w: 600 });
      g += tx(LX + 8, LY + LH - 10, "a continuous, unbounded family - all one function", { s: 9, f: P.faint });
    } else {
      var t2 = S(f, 38, 55);
      var w = lerp(0.9, 0.11, E(t2));
      var bx = LX + 30, by = LY + 40, bw = 270, bh = 130;
      g += rc(bx, by, bw, bh, "#0d1216");
      var curve = [];
      for (var s3 = 0; s3 <= 120; s3++) {
        var u2 = -1 + 2 * s3 / 120;
        var v = Math.min(1, (u2 * u2) / (w * w));
        curve.push([bx + (u2 + 1) / 2 * bw, by + bh - 14 - v * (bh - 26)]);
      }
      g += polyline(curve, P.pink, 2.2);
      g += cir(bx + bw / 2, by + bh - 14, 4.5, P.green);
      g += tx(bx + bw / 2, by + bh - 22, "minimum", { s: 8.5, a: "middle", f: P.green });
      g += tx(bx, by - 6, "loss around the minimum, in these coordinates", { s: 9, f: P.faint });
      g += tx(LX + 8, LY + LH - 26, w > 0.5 ? "flat minimum" : "sharp minimum", { s: 12, f: P.pink, w: 600 });
      g += tx(LX + 8, LY + LH - 10, "reached purely by rescaling. the function never moved.", { s: 9, f: P.faint });
    }

    /* right: function space */
    var RX = 396, RY = 74, RW = 290, RH = 210;
    g += rc(RX, RY, RW, RH, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');
    g += tx(RX + 8, RY + 16, "function space", { s: 9, f: P.faint });
    var fp = [];
    for (var q = 0; q <= 120; q++) {
      var xx = -1 + 2 * q / 120;
      var yv = 1.6 * Math.max(0, xx + 0.6) - 3.0 * Math.max(0, xx - 0.05) + 1.2 * Math.max(0, -xx - 0.4);
      fp.push([RX + 24 + (xx + 1) / 2 * (RW - 48), RY + RH / 2 + 34 - yv * 58]);
    }
    g += polyline(fp, P.green, 2.4);
    g += tx(RX + 24, RY + 40, "f(x) - byte for byte identical in all three panels", { s: 9, f: P.green });
    g += cir(RX + RW / 2, RY + RH - 26, 5, P.green);
    g += tx(RX + RW / 2 + 12, RY + RH - 22, "one point", { s: 9.5, f: P.green });

    g += tx(30, 316, "distinct parameter vectors shown", { s: 9.5, f: P.line });
    g += tx(30, 338, stage === 0 ? "6" : (stage === 1 ? "a continuum" : "a continuum"), { s: 16, f: P.pink, w: 600 });
    g += tx(330, 316, "distinct functions", { s: 9.5, f: P.line });
    g += tx(330, 338, "1", { s: 16, f: P.green, w: 600 });
    g += tx(500, 316, "what parameter counting sees", { s: 9.5, f: P.line });
    g += tx(500, 338, "enormous capacity", { s: 14, f: P.amber, w: 600 });

    var caps = [
      "Swap two hidden units, and their incoming and outgoing weights with them, and the network computes precisely the same function. A width-<em>m</em> layer buries every solution under <b>m! identical copies</b>.",
      "In a ReLU network, scaling one layer up by c and the next down by c also leaves the function untouched &mdash; but it moves the parameter norm anywhere you like. Norm-based capacity measures have to survive this.",
      "The same trick makes any minimum look flat or sharp. <b>Sharpness in raw parameter coordinates is not a property of the learned function</b>, so it cannot on its own explain a property of the learned function."
    ];
    return [sv(g, W, H), caps[stage]];
  }, 120);

  /* =====================================================================
     FIGURE 10 - lazy versus rich, trained for real

     f_alpha(x) = alpha * ( h(theta, x) - h(theta_0, x) ),  step size eta/alpha^2.
     Large alpha holds the features at initialization; small alpha forces them
     to move. Same architecture, same target, same number of steps.
     ===================================================================== */
  var F10 = (function () {
    var M = 10, N = 48, STEPS = 12000, ETA = 0.06;
    var u1 = [Math.cos(0.5), Math.sin(0.5)], u2 = [Math.cos(2.4), Math.sin(2.4)];
    var Xs = [], Ys = [];
    for (var i = 0; i < N; i++) {
      var th = 2 * Math.PI * i / N, x = [Math.cos(th), Math.sin(th)];
      Xs.push(x);
      Ys.push(Math.max(0, u1[0] * x[0] + u1[1] * x[1]) + Math.max(0, u2[0] * x[0] + u2[1] * x[1]));
    }
    function train(alpha) {
      var r = rng(4242), w = [], a = [], k, q;
      for (k = 0; k < M; k++) {
        var t2 = 2 * Math.PI * (k + 0.37) / M;
        w.push([Math.cos(t2), Math.sin(t2)]);
        a.push(r() < 0.5 ? 1 : -1);
      }
      var w0 = w.map(function (v) { return [v[0], v[1]]; }), a0 = a.slice();
      var h0 = Xs.map(function (x2) {
        var s2 = 0;
        for (var kk = 0; kk < M; kk++) s2 += a0[kk] * Math.max(0, w0[kk][0] * x2[0] + w0[kk][1] * x2[1]);
        return s2;
      });
      var lr = ETA / (alpha * alpha), marks = [], snaps = [], mi = 0;
      for (var s3 = 0; s3 <= 40; s3++) marks.push(Math.round(STEPS * Math.pow(s3 / 40, 1.7)));
      for (var t = 0; t <= STEPS; t++) {
        while (mi < marks.length && t === marks[mi]) {
          var L = 0;
          for (q = 0; q < N; q++) {
            var hv = 0;
            for (k = 0; k < M; k++) hv += a[k] * Math.max(0, w[k][0] * Xs[q][0] + w[k][1] * Xs[q][1]);
            var fv = alpha * (hv - h0[q]);
            L += (fv - Ys[q]) * (fv - Ys[q]);
          }
          snaps.push({ w: w.map(function (v) { return [v[0], v[1]]; }), loss: L / N });
          mi++;
        }
        if (t === STEPS) break;
        var gw = [], ga = new Float64Array(M);
        for (k = 0; k < M; k++) gw.push([0, 0]);
        for (q = 0; q < N; q++) {
          var h = 0, pre = [];
          for (k = 0; k < M; k++) { var z = w[k][0] * Xs[q][0] + w[k][1] * Xs[q][1]; pre.push(z); h += a[k] * Math.max(0, z); }
          var e = 2 * (alpha * (h - h0[q]) - Ys[q]) * alpha / N;
          for (k = 0; k < M; k++) {
            if (pre[k] <= 0) continue;
            ga[k] += e * pre[k];
            gw[k][0] += e * a[k] * Xs[q][0];
            gw[k][1] += e * a[k] * Xs[q][1];
          }
        }
        for (k = 0; k < M; k++) { w[k][0] -= lr * gw[k][0]; w[k][1] -= lr * gw[k][1]; a[k] -= lr * ga[k]; }
      }
      return snaps;
    }
    return { rich: train(0.05), lazy: train(16), u1: u1, u2: u2, M: M };
  })();

  reg("fig-lazy-rich", 64, function (f) {
    var W = 720, H = 372;
    var g = rc(0, 0, W, H, P.bg);
    var idx = Math.min(F10.rich.length - 1, Math.floor(S(f, 2, 58) * (F10.rich.length - 1) + 0.0001));
    g += tx(30, 30, "SAME NETWORK, SAME TARGET, TWO OUTPUT SCALES", { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 48, "ten hidden units. each arrow is one unit's input direction; grey stubs mark where it started.", { s: 9.5, f: P.faint });

    function panel(x0, title, snaps, col, sub) {
      var s = rc(x0, 74, 320, 214, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');
      s += tx(x0 + 8, 90, title, { s: 10.5, f: col, w: 600, ls: "1" });
      s += tx(x0 + 8, 104, sub, { s: 9, f: P.faint });
      var cx = x0 + 160, cy = 198, rad = 70;
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" fill="none" stroke="#1a2228" stroke-width="1"/>';
      [F10.u1, F10.u2].forEach(function (u) {
        s += ln(cx, cy, cx + u[0] * rad * 1.2, cy - u[1] * rad * 1.2, P.ink, 1.4, 'stroke-dasharray="4 3" opacity="0.7"');
      });
      s += tx(cx + F10.u1[0] * rad * 1.24 + 4, cy - F10.u1[1] * rad * 1.24, "teacher", { s: 8.5, f: P.ink });
      var snap = snaps[idx], init = snaps[0];
      var moved = 0, dw = 0, maxn = 0.001;
      for (var k = 0; k < F10.M; k++) maxn = Math.max(maxn, Math.hypot(snap.w[k][0], snap.w[k][1]));
      for (var m = 0; m < F10.M; m++) {
        var wa = init.w[m], wb = snap.w[m];
        var na = Math.hypot(wa[0], wa[1]) || 1, nb = Math.hypot(wb[0], wb[1]) || 1;
        moved += Math.abs(((Math.atan2(wb[1], wb[0]) - Math.atan2(wa[1], wa[0]) + Math.PI * 3) % (Math.PI * 2)) - Math.PI) / F10.M;
        dw += Math.hypot(wb[0] - wa[0], wb[1] - wa[1]) / F10.M;
        s += ln(cx + wa[0] / na * rad * 0.9, cy - wa[1] / na * rad * 0.9, cx + wa[0] / na * rad, cy - wa[1] / na * rad, P.line, 2, 'opacity="0.7"');
        var len = clamp(nb / maxn, 0.16, 1) * rad;
        s += ln(cx, cy, cx + wb[0] / nb * len, cy - wb[1] / nb * len, col, 2, 'opacity="0.92"');
      }
      s += tx(x0 + 8, 280, "mean |change in w| = " + dw.toFixed(3), { s: 9.5, f: col });
      return { svg: s, moved: moved, dw: dw, loss: snap.loss };
    }
    var A = panel(30, "LAZY  -  output scale 16", F10.lazy, P.blue, "features stay where they started");
    var B = panel(366, "RICH  -  output scale 0.05", F10.rich, P.green, "features rotate onto the teacher");
    g += A.svg + B.svg;

    g += tx(30, 316, "lazy: feature movement", { s: 9.5, f: P.line });
    g += tx(30, 338, A.dw.toFixed(3), { s: 16, f: P.blue, w: 600 });
    g += tx(196, 316, "lazy: loss", { s: 9.5, f: P.line });
    g += tx(196, 338, fmt(A.loss), { s: 15, f: P.blue, w: 600 });
    g += tx(366, 316, "rich: feature movement", { s: 9.5, f: P.line });
    g += tx(366, 338, B.dw.toFixed(3), { s: 16, f: P.green, w: 600 });
    g += tx(542, 316, "rich: loss", { s: 9.5, f: P.line });
    g += tx(542, 338, fmt(B.loss), { s: 15, f: P.green, w: 600 });

    var ratio = B.dw / Math.max(A.dw, 1e-6);
    var cap;
    if (idx < 5) cap = "Both start from the same ring of random directions, and both are asked to fit the same two-neuron teacher.";
    else if (idx < 22) cap = "The small-scale network is already swinging its units towards the teacher. The large-scale one is fitting by adjusting output weights alone, leaving its features untouched.";
    else cap = "Both reach low loss. The rich network moved its features <b>" + Math.round(ratio) + " times further</b> than the lazy one. The lazy network solved the task without learning a single feature &mdash; which is exactly what the infinite-width kernel limit does.";
    return [sv(g, W, H), cap];
  }, 115);
})();
