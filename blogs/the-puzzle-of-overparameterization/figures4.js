/* Figures 11-13, Lab 3, and boot. */
(function () {
  "use strict";
  var F = window.__TMP_FIG;
  var P = F.P, R = F.R, clamp = F.clamp, lerp = F.lerp, S = F.S, E = F.E, fmt = F.fmt, si = F.si;
  var rc = F.rc, tx = F.tx, ln = F.ln, cir = F.cir, sv = F.sv, meter = F.meter,
      polyline = F.polyline, reg = F.reg, lab = F.lab;

  /* =====================================================================
     FIGURE 11 - grokking, and the circuit competition underneath
     A reproduction of the published curve shapes, with the circuit-efficiency
     account of Varma et al. drawn as the mechanism beneath it.
     ===================================================================== */
  var F11 = (function () {
    var rows = [];
    for (var i = 0; i <= 60; i++) {
      var lg = 1 + 5 * i / 60;                 /* log10 steps, 10 .. 1e6 */
      var t = Math.pow(10, lg);
      var mem = 1 / (1 + Math.exp(-(lg - 2.05) / 0.16));           /* memorizing circuit */
      var gen = 1 / (1 + Math.exp(-(lg - 4.42) / 0.11));           /* generalizing circuit */
      var trainAcc = clamp(Math.max(mem, gen) * 1.001, 0, 1);
      var valAcc = 0.008 + 0.985 * gen;
      var norm = 1 + 5.2 * mem - 3.4 * gen;
      var effMem = 1 / (1 + 3.4 * mem);
      var effGen = 0.92;
      rows.push({ t: t, lg: lg, mem: mem, gen: gen, trainAcc: trainAcc, valAcc: valAcc, norm: norm, effMem: effMem, effGen: effGen });
    }
    return rows;
  })();

  reg("fig-grokking", 72, function (f) {
    var W = 720, H = 396;
    var g = rc(0, 0, W, H, P.bg);
    var idx = Math.min(F11.length - 1, Math.floor(S(f, 2, 66) * (F11.length - 1) + 0.0001));
    var row = F11[idx];
    g += tx(30, 30, "MODULAR ADDITION, ONE-LAYER TRANSFORMER, WEIGHT DECAY ON", { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 48, "curve shapes reproduced from the published experiments; the lower panel is the proposed mechanism", { s: 9.5, f: P.faint });

    var CX0 = 66, CW = 620, AY = 74, AH = 122;
    var X = function (lg) { return CX0 + (lg - 1) / 5 * CW; };
    var Y = function (v) { return AY + AH - v * (AH - 12); };
    g += rc(CX0, AY, CW, AH, "#101519");
    for (var q = 0; q <= 4; q++) { g += ln(CX0, Y(q / 4), CX0 + CW, Y(q / 4), "#1a2228", 1); g += tx(CX0 - 6, Y(q / 4) + 4, (q * 25) + "%", { s: 8.5, a: "end", f: P.line }); }
    for (var e = 1; e <= 6; e++) { g += ln(X(e), AY, X(e), AY + AH, "#1a2228", 1); g += tx(X(e), AY + AH + 14, "1e" + e, { s: 8.5, a: "middle", f: P.line }); }
    g += tx(CX0, 62, "ACCURACY", { s: 9.5, f: P.faint, ls: "1" });
    var trp = [], vap = [];
    for (var i = 0; i <= idx; i++) { trp.push([X(F11[i].lg), Y(F11[i].trainAcc)]); vap.push([X(F11[i].lg), Y(F11[i].valAcc)]); }
    g += polyline(trp, P.blue, 2);
    g += polyline(vap, P.green, 2.4);
    g += cir(X(row.lg), Y(row.valAcc), 4.5, P.green);
    g += tx(CX0 + 10, AY + 16, "blue = training", { s: 9, f: P.blue });
    g += tx(CX0 + 110, AY + 16, "green = held out", { s: 9, f: P.green });
    if (row.lg > 2.4 && row.lg < 4.3) g += tx(X(3.35), AY + 62, "the plateau", { s: 10, a: "middle", f: P.faint });

    /* phase strip */
    var SY = 226;
    g += rc(CX0, SY, CW, 16, "#161d22");
    var b1 = X(2.3), b2 = X(4.3);
    g += rc(CX0, SY, b1 - CX0, 16, P.pink, 'opacity="0.3"');
    g += rc(b1, SY, b2 - b1, 16, P.amber, 'opacity="0.26"');
    g += rc(b2, SY, CX0 + CW - b2, 16, P.green, 'opacity="0.3"');
    g += tx(CX0 + 8, SY + 12, "memorization", { s: 9, f: P.pink });
    g += tx(b1 + 8, SY + 12, "circuit formation", { s: 9, f: P.amber });
    g += tx(b2 + 8, SY + 12, "cleanup", { s: 9, f: P.green });
    g += ln(X(row.lg), SY - 4, X(row.lg), SY + 20, P.ink, 1.4);

    /* mechanism panel */
    var MY = 268, MH = 76;
    g += rc(CX0, MY, CW, MH, "#101519");
    g += tx(CX0, MY - 8, "THE MECHANISM", { s: 9.5, f: P.faint, ls: "1" });
    var mp = [], gp = [], np = [];
    for (var k = 0; k <= idx; k++) {
      mp.push([X(F11[k].lg), MY + MH - 6 - F11[k].mem * (MH - 16)]);
      gp.push([X(F11[k].lg), MY + MH - 6 - F11[k].gen * (MH - 16)]);
      np.push([X(F11[k].lg), MY + MH - 6 - clamp(F11[k].norm / 6.5, 0, 1) * (MH - 16)]);
    }
    g += polyline(mp, P.pink, 1.8);
    g += polyline(gp, P.green, 1.8);
    g += polyline(np, P.amber, 1.4, 'stroke-dasharray="4 3"');
    g += tx(CX0 + 110, MY - 8, "pink = memorizing", { s: 8.5, f: P.pink });
    g += tx(CX0 + 240, MY - 8, "green = generalizing", { s: 8.5, f: P.green });
    g += tx(CX0 + 388, MY - 8, "amber dashed = parameter norm", { s: 8.5, f: P.amber });

    g += tx(30, 364, "steps", { s: 9.5, f: P.line });
    g += tx(30, 384, si(row.t), { s: 15, f: P.ink, w: 600 });
    g += tx(126, 364, "training", { s: 9.5, f: P.line });
    g += tx(126, 384, (row.trainAcc * 100).toFixed(0) + "%", { s: 15, f: P.blue, w: 600 });
    g += tx(228, 364, "held out", { s: 9.5, f: P.line });
    g += tx(228, 384, (row.valAcc * 100).toFixed(0) + "%", { s: 15, f: row.valAcc > 0.5 ? P.green : P.pink, w: 600 });
    g += tx(340, 364, "logits per unit of norm, memorizing", { s: 9.5, f: P.line });
    g += tx(340, 384, row.effMem.toFixed(2), { s: 15, f: P.pink, w: 600 });
    g += tx(600, 364, "generalizing", { s: 9.5, f: P.line });
    g += tx(600, 384, row.effGen.toFixed(2), { s: 15, f: P.green, w: 600 });

    var cap;
    if (row.lg < 2.2) cap = "The memorizing circuit forms almost immediately. Training accuracy is on its way to 100% and held-out accuracy is at chance.";
    else if (row.lg < 3.6) cap = "Nothing visible is happening. Underneath, the generalizing circuit is forming smoothly &mdash; you only see it if you measure that circuit directly.";
    else if (row.lg < 4.6) cap = "<b>The transition.</b> The generalizing circuit is now strong enough that weight decay can afford to dismantle the memorizing one, and held-out accuracy follows.";
    else cap = "Cleanup complete. The network has replaced a lookup table with modular arithmetic implemented in Fourier components, at a lower parameter norm than the table cost.";
    return [sv(g, W, H), cap];
  }, 110);

  /* =====================================================================
     FIGURE 12 - memorize until full, then generalize
     ===================================================================== */
  var F12 = (function () {
    var CAP = 1.0;                       /* model capacity, normalized */
    var rows = [];
    for (var i = 0; i <= 56; i++) {
      var lg = -1.4 + 3.2 * i / 56;      /* log10 of dataset bits / capacity */
      var D = Math.pow(10, lg);
      var mem = CAP * (1 - Math.exp(-D / CAP * 1.15));   /* fills, then saturates */
      var perEx = mem / D;
      var gen = 1 / (1 + Math.exp(-(lg - 0.15) / 0.42)); /* structure the weights hold instead */
      rows.push({ lg: lg, D: D, mem: mem, perEx: perEx, gen: gen });
    }
    return { CAP: CAP, rows: rows };
  })();

  reg("fig-capacity", 60, function (f) {
    var W = 720, H = 372;
    var g = rc(0, 0, W, H, P.bg);
    var idx = Math.min(F12.rows.length - 1, Math.floor(S(f, 2, 54) * (F12.rows.length - 1) + 0.0001));
    var row = F12.rows[idx];
    g += tx(30, 30, "WHAT THE WEIGHTS HOLD, AS THE CORPUS GROWS", { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 48, "capacity fixed at roughly 3.6 bits per parameter; dataset size on the horizontal axis", { s: 9.5, f: P.faint });

    /* the tank */
    var TX = 30, TY = 78, TW = 150, TH = 190;
    g += rc(TX, TY, TW, TH, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');
    var fill = clamp(row.mem / F12.CAP, 0, 1);
    g += rc(TX + 2, TY + TH - 2 - fill * (TH - 4), TW - 4, fill * (TH - 4), P.pink, 'opacity="0.72"');
    g += ln(TX, TY + 2, TX + TW, TY + 2, P.pink, 1.4, 'stroke-dasharray="4 3"');
    g += tx(TX + 6, TY + 18, "capacity", { s: 9, f: P.pink });
    g += tx(TX + TW / 2, TY + TH / 2, (fill * 100).toFixed(0) + "% full", { s: 15, a: "middle", f: P.ink, w: 600 });
    g += tx(TX, TY + TH + 18, "verbatim storage of specific data", { s: 9, f: P.faint });

    /* curves */
    var RX = 234, RY = 78, RW = 452, RH = 190;
    var X = function (lg) { return RX + (lg + 1.4) / 3.2 * RW; };
    g += rc(RX, RY, RW, RH, "#101519");
    for (var q = 0; q <= 4; q++) g += ln(RX, RY + RH * q / 4, RX + RW, RY + RH * q / 4, "#1a2228", 1);
    g += ln(X(0), RY, X(0), RY + RH, P.pink, 1.1, 'stroke-dasharray="3 3"');
    g += tx(X(0) + 5, RY + 14, "corpus = capacity", { s: 9, f: P.pink });
    g += tx(RX, 66, "PER EXAMPLE MEMORIZED, AND STRUCTURE LEARNED", { s: 9.5, f: P.faint, ls: "1" });
    var mp = [], gp = [];
    for (var i = 0; i <= idx; i++) {
      mp.push([X(F12.rows[i].lg), RY + RH - 8 - clamp(F12.rows[i].perEx, 0, 1) * (RH - 20)]);
      gp.push([X(F12.rows[i].lg), RY + RH - 8 - F12.rows[i].gen * (RH - 20)]);
    }
    g += polyline(mp, P.pink, 2.2);
    g += polyline(gp, P.green, 2.2);
    g += cir(X(row.lg), RY + RH - 8 - clamp(row.perEx, 0, 1) * (RH - 20), 4, P.pink);
    g += tx(RX + 10, RY + 16, "pink = memorized per example", { s: 8.5, f: P.pink });
    g += tx(RX + 208, RY + 16, "green = generalizable structure", { s: 8.5, f: P.green });
    g += tx(RX + RW, RY + RH + 16, "corpus size, relative to capacity  (log)", { s: 9, a: "end", f: P.faint });

    g += tx(30, 302, "corpus / capacity", { s: 9.5, f: P.line });
    g += tx(30, 324, row.D < 1 ? "1 / " + (1 / row.D).toFixed(1) : row.D.toFixed(1) + " x", { s: 16, f: P.ink, w: 600 });
    g += tx(190, 302, "regime", { s: 9.5, f: P.line });
    g += tx(190, 324, row.D < 0.6 ? "memorization" : (row.D < 2 ? "the crossover" : "compression"), { s: 15, f: row.D < 0.6 ? P.pink : (row.D < 2 ? P.amber : P.green), w: 600 });
    g += tx(400, 302, "where the interpolation peak lives", { s: 9.5, f: P.line });
    g += tx(400, 324, "at the dashed line, corpus = capacity", { s: 13, f: P.amber, w: 600 });
    g += meter(30, 352, 656, 10, clamp((row.lg + 1.4) / 3.2, 0, 1), row.D < 1 ? P.pink : P.green, "", "");

    var cap;
    if (row.D < 0.35) cap = "A corpus far smaller than the weights can hold. There is no pressure to find structure, so the model stores examples &mdash; and leaks them.";
    else if (row.D < 1.6) cap = "The tank is filling. This is where the interpolation peak of section 4 lives, and where fine-tuning a large model on a small dataset sits.";
    else if (row.D < 12) cap = "Past capacity. Per-example memorization is falling because there is simply nowhere left to put it, and the only remaining way to reduce loss is structure.";
    else cap = "Frontier pretraining is roughly here, or further right: <b>corpus " + row.D.toFixed(0) + "x capacity and climbing</b>. Memorization is not a temptation the model resisted &mdash; it is an option it does not have.";
    return [sv(g, W, H), cap];
  }, 115);

  /* =====================================================================
     LAB 3 - capacity budget
     ===================================================================== */
  lab("lab-capacity", function (el) {
    var stage = el.querySelector(".animation-stage");
    var read = el.querySelector(".lab-readout");
    var sp = el.querySelector("#cap-params"), st = el.querySelector("#cap-tokens"), se = el.querySelector("#cap-entropy");
    var op = el.querySelector("#cap-params-out"), ot = el.querySelector("#cap-tokens-out"), oe = el.querySelector("#cap-entropy-out");
    var BITS = 3.6;
    function render() {
      var params = Math.pow(10, parseFloat(sp.value));
      var tokens = Math.pow(10, parseFloat(st.value));
      var hpt = parseFloat(se.value);
      op.textContent = si(params);
      ot.textContent = si(tokens);
      oe.textContent = hpt.toFixed(1);
      var capBits = params * BITS, corpusBits = tokens * hpt;
      var ratio = corpusBits / capBits;
      var W = 720, H = 250;
      var g = rc(0, 0, W, H, P.bg);
      g += tx(30, 30, "CAN THESE WEIGHTS HOLD THIS CORPUS?", { s: 11, f: P.ink, w: 600, ls: "1" });
      var BX = 30, BW = 656;
      var lo = -4, hi = 6;
      var lr = clamp(Math.log10(ratio), lo, hi);
      g += rc(BX, 62, BW, 26, "#101519", 'stroke="' + P.line + '" stroke-width="0.8"');
      var mid = BX + (0 - lo) / (hi - lo) * BW;
      g += rc(BX, 62, mid - BX, 26, P.pink, 'opacity="0.2"');
      g += rc(mid, 62, BX + BW - mid, 26, P.green, 'opacity="0.2"');
      g += ln(mid, 56, mid, 94, P.ink, 1.2, 'stroke-dasharray="3 3"');
      g += tx(mid, 108, "corpus = capacity", { s: 9, a: "middle", f: P.faint });
      var mx = BX + (lr - lo) / (hi - lo) * BW;
      g += cir(mx, 75, 7, ratio > 1 ? P.green : P.pink);
      g += tx(BX + 8, 79, "fits in the weights", { s: 9.5, f: P.pink });
      g += tx(BX + BW - 8, 79, "cannot fit: must compress", { s: 9.5, a: "end", f: P.green });
      g += tx(30, 146, "memorization capacity", { s: 9.5, f: P.line });
      g += tx(30, 168, si(capBits) + " bits", { s: 16, f: P.amber, w: 600 });
      g += tx(30, 188, "= " + si(capBits / 8) + "B of storage", { s: 10, f: P.faint });
      g += tx(240, 146, "information in the corpus", { s: 9.5, f: P.line });
      g += tx(240, 168, si(corpusBits) + " bits", { s: 16, f: P.blue, w: 600 });
      g += tx(240, 188, "= " + si(corpusBits / 8) + "B", { s: 10, f: P.faint });
      g += tx(470, 146, "corpus / capacity", { s: 9.5, f: P.line });
      g += tx(470, 168, ratio >= 1 ? si(ratio) + " x" : "1 / " + si(1 / ratio), { s: 20, f: ratio > 1 ? P.green : P.pink, w: 600 });
      g += tx(470, 188, ratio >= 1 ? "compression is forced" : "memorization is affordable", { s: 10, f: ratio > 1 ? P.green : P.pink });
      g += tx(30, 224, "capacity held at " + BITS + " bits per parameter, the measured figure for GPT-style models", { s: 9, f: P.faint });
      stage.innerHTML = sv(g, W, H);
      stage.setAttribute("aria-label", "Capacity budget: " + si(params) + " parameters hold " + si(capBits) + " bits; a corpus of " + si(tokens) +
        " tokens at " + hpt.toFixed(1) + " bits each carries " + si(corpusBits) + " bits, a ratio of " + (ratio >= 1 ? si(ratio) : "1/" + si(1 / ratio)));
      read.innerHTML = ratio > 20
        ? "The corpus outweighs the weights by <b>" + si(ratio) + "</b>. Storing it is not an option, so every bit of loss reduction has to come from structure."
        : (ratio > 1.5
          ? "Only <b>" + si(ratio) + "x</b> more corpus than capacity. This is a regime where some verbatim storage is affordable, and where deduplication decides which parts get it."
          : "Capacity exceeds the corpus. The cheapest way to reduce the loss is now to <b>store the data</b> &mdash; which is why small datasets and many epochs leak, and why grokking experiments are run here.");
    }
    [sp, st, se].forEach(function (x) { x.addEventListener("input", render); });
    render();
  });

  /* =====================================================================
     FIGURE 13 - the ladder from vacuous to non-vacuous
     ===================================================================== */
  var F13 = [
    { n: "Parameter counting (VC)", v: 300, c: P.pink, note: "11M-parameter network on 50,000 images. True but says nothing." },
    { n: "Naive norm-based bounds", v: 40, c: P.pink, note: "Smaller, still far above the trivial ceiling." },
    { n: "Best measured norm bounds", v: 4.5, c: P.amber, note: "Within an order of magnitude of meaning something." },
    { n: "PAC-Bayes + compression, images", v: 0.46, c: P.green, note: "First non-vacuous bounds at ImageNet scale." },
    { n: "Compression bounds, LLMs", v: 0.68, c: P.green, note: "Non-vacuous in bits per token for compressed pretrained models. Larger models bound better." },
    { n: "What the model actually does", v: 0.09, c: P.blue, note: "The true value. Every bound above has to sit above it, and the good ones still sit well above." }
  ];
  reg("fig-bounds", 52, function (f) {
    var W = 720, H = 366;
    var g = rc(0, 0, W, H, P.bg);
    var shown = clamp(Math.floor(S(f, 2, 44) * F13.length) + 1, 0, F13.length);
    g += tx(30, 30, "HOW LARGE IS THE GUARANTEE?", { s: 11.5, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 48, "each bound as a multiple of its own trivial ceiling, log scale. representative values.", { s: 9.5, f: P.faint });
    var BX = 250, BW = 400, lo = 0.05, hi = 500;
    var Xp = function (v) { return BX + Math.log(clamp(v, lo, hi) / lo) / Math.log(hi / lo) * BW; };
    [0.1, 1, 10, 100].forEach(function (t) {
      g += ln(Xp(t), 70, Xp(t), 300, "#1a2228", 1);
      g += tx(Xp(t), 316, t < 1 ? "0.1" : String(t), { s: 8.5, a: "middle", f: P.line });
    });
    g += ln(Xp(1), 62, Xp(1), 306, P.ink, 1.4, 'stroke-dasharray="4 3"');
    g += tx(Xp(1) + 6, 66, "trivial ceiling: anything at or above 1 says nothing", { s: 9, f: P.ink });
    for (var i = 0; i < F13.length; i++) {
      var y = 86 + i * 37;
      if (i >= shown) { g += tx(30, y + 12, F13[i].n, { s: 10, f: "#232c33" }); continue; }
      var grow = E(S(f, 2 + i * 7, 8 + i * 7));
      g += tx(30, y + 12, F13[i].n, { s: 10, f: P.dim });
      g += rc(BX, y, (Xp(F13[i].v) - BX) * grow, 17, F13[i].c, 'opacity="0.88"');
      if (grow > 0.85) g += tx(Xp(F13[i].v) + 7, y + 13, F13[i].v >= 1 ? String(F13[i].v) : F13[i].v.toFixed(2), { s: 10.5, f: F13[i].c, w: 600 });
    }
    var cur = F13[Math.max(0, shown - 1)];
    g += rc(30, 328, 656, 28, "#12181d", 'stroke="' + P.line + '"');
    g += tx(42, 346, cur.note, { s: 10.5, f: P.dim });
    var cap;
    if (shown <= 2) cap = "The classical bounds are not slightly loose. They exceed the largest value the quantity can take, by two or three orders of magnitude.";
    else if (shown <= 3) cap = "Norm-based measures shrink the number a great deal and still land above the ceiling in the regimes that matter.";
    else if (shown <= 5) cap = "Compression changes the picture. Describe the trained model in few enough bits and a union bound over that finite set becomes a real guarantee.";
    else cap = "Note the gap that remains. <b>Non-vacuous is a much weaker word than tight</b>, and the bounds are proved for compressed variants rather than the deployed weights.";
    return [sv(g, W, H), cap];
  }, 130);

  /* ---------------- boot ---------------- */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", window.__TMP_BOOT);
  else window.__TMP_BOOT();
})();
