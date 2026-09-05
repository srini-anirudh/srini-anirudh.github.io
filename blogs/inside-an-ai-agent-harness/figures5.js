/* Figures 13-16 */
(function () {
  "use strict";
  var mk = window.__mkReel, G = window.__HG, C = G.C;

  /* ============ F13 : budget and the runaway loop ============ */
  mk({
    id: "fig-budget", w: 1000, h: 540, dur: 2, autoplay: false, resume: false,
    aria: "An interactive geometric model of loop length: the expected number of steps diverges as the per-step continuation probability approaches one, and a turn cap bounds the tail.",
    stages: [{ label: "Loop-length distribution", cam: [500, 260, 1], caption: "If the agent continues with probability q at every step, turn length is geometric. Its mean is 1/(1\u2212q) and its tail is where your money goes." }],
    knobs: [
      { key: "q", label: "P(the model asks for another tool call)", min: 70, max: 99, value: 94, step: 1, fmt: function (v) { return (v / 100).toFixed(2); } },
      { key: "B", label: "Turn cap", min: 5, max: 150, value: 40, step: 5, fmt: function (v) { return Math.round(v) + " steps"; } },
      { key: "cps", label: "Cost per step", min: 2, max: 60, value: 18, step: 1, fmt: function (v) { return "$" + (v / 100).toFixed(2); } }
    ],
    labNote: "With continuation probability \\(q\\), \\(P(L=n)=(1-q)q^{\\,n-1}\\), so \\(\\mathbb{E}[L]=1/(1-q)\\) and \\(P(L>B)=q^{B}\\). Between \\(q=0.90\\) and \\(q=0.98\\) the mean expands fivefold while nothing about the model changed. A cap turns an unbounded expectation into a bounded one; it is a harness primitive, not a request you make of the model.",
    draw: function (ctx, si, t, st) {
      var q = st.q / 100, B = Math.round(st.B), cps = st.cps / 100;
      var mean = 1 / (1 - q), capped = (1 - Math.pow(q, B)) / (1 - q), pOver = Math.pow(q, B);
      var px = 80, py = 78, pw = 540, ph = 300, NMAX = 150;
      G.grid(ctx, px, py, pw, ph, 10, 5);
      G.line(ctx, px, py + ph, px + pw, py + ph, { color: "#41505c" });
      G.line(ctx, px, py, px, py + ph, { color: "#41505c" });
      var pmax = 1 - q;
      for (var n = 1; n <= NMAX; n++) {
        var p = (1 - q) * Math.pow(q, n - 1);
        var x = px + pw * (n - 1) / (NMAX - 1), w = pw / NMAX;
        var h = ph * (p / pmax);
        var over = n > B;
        G.box(ctx, x, py + ph - h, Math.max(1.6, w - 1), h, { fill: over ? "#3a2320" : "#1f4a3c", r: 0 });
        if (over) { ctx.save(); G.alpha(ctx, 0.9); G.box(ctx, x, py + ph - h, Math.max(1.6, w - 1), h, { fill: "rgba(232,112,95,0.55)", r: 0 }); ctx.restore(); }
      }
      var bx = px + pw * (B - 1) / (NMAX - 1);
      G.line(ctx, bx, py, bx, py + ph, { color: C.amber, lw: 2 });
      G.txt(ctx, "turn cap", bx + 8, py + 14, { size: 10.5, weight: 600, color: C.amber });
      var mx = px + pw * (mean - 1) / (NMAX - 1);
      if (mean <= NMAX) {
        G.line(ctx, mx, py, mx, py + ph, { color: C.blue, dash: [4, 4], lw: 1.5 });
        G.txt(ctx, "E[L] = " + mean.toFixed(1), mx + 8, py + 34, { size: 10.5, weight: 600, color: C.blue });
      }
      for (var g = 0; g <= 5; g++) G.txt(ctx, Math.round(NMAX * g / 5), px + pw * g / 5, py + ph + 16, { size: 9.5, color: C.faint, align: "center" });
      G.txt(ctx, "steps in the turn", px + pw / 2, py + ph + 38, { size: 11, color: C.dim, align: "center" });
      ctx.save(); ctx.translate(px - 46, py + ph / 2); ctx.rotate(-Math.PI / 2);
      G.txt(ctx, "probability", 0, 0, { size: 11, color: C.dim, align: "center" }); ctx.restore();

      var ox = 660;
      G.box(ctx, ox, 78, 290, 300, { fill: C.panel, stroke: "#2b353e", r: 5 });
      G.txt(ctx, "WHAT THE CAP BUYS", ox + 16, 102, { size: 10, weight: 600, color: C.faint });
      var rows = [
        ["E[steps], uncapped", mean.toFixed(1), C.red],
        ["E[steps], capped", capped.toFixed(1), C.green],
        ["P(turn hits the cap)", (100 * pOver).toFixed(1) + "%", pOver > 0.25 ? C.amber : C.dim],
        ["E[cost], uncapped", "$" + (mean * cps).toFixed(2), C.red],
        ["E[cost], capped", "$" + (capped * cps).toFixed(2), C.green],
        ["worst case, capped", "$" + (B * cps).toFixed(2), C.ink]
      ];
      rows.forEach(function (r, i) {
        G.txt(ctx, r[0], ox + 16, 132 + i * 30, { size: 11, color: C.dim });
        G.txt(ctx, r[1], ox + 274, 132 + i * 30, { size: 13, weight: 600, color: r[2], align: "right" });
      });
      G.line(ctx, ox + 16, 320, ox + 274, 320, { color: "#2b353e" });
      G.txt(ctx, pOver > 0.25 ? "a quarter of turns die at the cap:" : "the cap is rarely binding here:", ox + 16, 340, { size: 10.5, color: C.faint });
      G.txt(ctx, pOver > 0.25 ? "you are truncating real work" : "it is insurance, not a constraint", ox + 16, 358, { size: 10.5, color: C.faint });
      G.box(ctx, 80, 420, 870, 84, { fill: "#121920", stroke: "#2b353e", r: 5 });
      G.txt(ctx, "A CAP IS NOT A STOPPING CRITERION", 98, 444, { size: 10.5, weight: 600, color: C.amber });
      G.txt(ctx, "It bounds the bill. Deciding whether the work is done is a separate question, and the model's own", 98, 468, { size: 12, color: C.ink });
      G.txt(ctx, "\u201cI'm finished\u201d is only one of the inputs to it.", 98, 490, { size: 12, color: C.ink });
    }
  });

  /* ============ F14 : failure fingerprints (real data) ============ */
  var CATS = [
    { k: "solved", col: C.green },
    { k: "stopped early", col: C.blue },
    { k: "claimed done, tests failed", col: C.red },
    { k: "wall-clock timeout", col: C.amber },
    { k: "hit turn cap", col: C.purple },
    { k: "crashed", col: "#8c6f5e" },
    { k: "infra error", col: "#4d5b66" }
  ];
  var FP = [
    { n: "Goose", v: [40, 35, 0, 10, 9, 4, 2], note: "stops cleanly when stuck; never claims a wrong fix" },
    { n: "OpenCode", v: [47, 31, 0, 15, 0, 5, 2], note: "no turn budget exposed, so it dies on the clock instead" },
    { n: "OpenHands-SDK", v: [46, 4, 14, 11, 12, 11, 2], note: "pushes to closure; sometimes declares done on a red suite" }
  ];
  mk({
    id: "fig-fingerprint", w: 1000, h: 600, dur: 2.3,
    aria: "Stacked bars of trial outcomes for three open-source harnesses, pooled over two models, showing harness-specific failure fingerprints.",
    stages: [
      { label: "Three harnesses", cam: [500, 250, 1.05], caption: "One hundred trials per harness, pooled over two models, on the same fifty tasks." },
      { label: "Pass rates", cam: [500, 250, 1.05], caption: "Solve rates land within eight points of each other \u2014 close enough that most pairwise differences are inside the noise." },
      { label: "The failures", cam: [500, 270, 1.02], caption: "The failures are not interchangeable. Each harness fails in its own characteristic way." },
      { label: "Goose", cam: [500, 280, 1.02], caption: "Goose stops voluntarily when stuck. You get an honest \u201cI can't do this\u201d rather than a plausible wrong patch." },
      { label: "OpenCode", cam: [500, 280, 1.02], caption: "OpenCode never declares victory on a failing suite, but with no turn cap it burns the clock instead." },
      { label: "OpenHands", cam: [500, 280, 1.02], caption: "OpenHands-SDK drives toward closure and, fourteen times in a hundred, declares done while the verifier disagrees." },
      { label: "Replication", cam: [500, 290, 1.0], caption: "The fingerprint replicates across both models. It is a property of the scaffold, not of the weights." },
      { label: "Oversight", cam: [500, 300, 1.0], caption: "Which means each harness implies a different oversight discipline for the human sitting next to it." }
    ],
    draw: function (ctx, si, t) {
      var x0 = 110, y0 = 110, barW = 210, gap = 60, H = 240;
      FP.forEach(function (f, fi) {
        var x = x0 + fi * (barW + gap);
        var focus = (si === 3 + fi) ? 1 : (si >= 3 && si <= 5 ? 0.32 : 1);
        ctx.save(); G.alpha(ctx, focus);
        G.txt(ctx, f.n, x + barW / 2, y0 - 22, { size: 13, weight: 600, color: C.ink, align: "center" });
        var acc = 0;
        for (var i = 0; i < CATS.length; i++) {
          if (si < 2 && i > 0) continue;
          var val = f.v[i];
          var a = (si === 2 && i > 0) ? G.easeOut(G.clamp((t - i * 0.09) * 2, 0, 1)) : 1;
          var h = H * val / 100;
          ctx.save(); G.alpha(ctx, focus * a);
          G.box(ctx, x, y0 + acc, barW, h, { fill: CATS[i].col, r: 0 });
          if (h > 15) G.txt(ctx, val + "", x + barW / 2, y0 + acc + h / 2, { size: 11, weight: 600, color: "#0b0f12", align: "center" });
          ctx.restore();
          acc += h;
        }
        G.box(ctx, x, y0, barW, H, { stroke: "#2b353e", lw: 1, r: 0 });
        if (si >= 1) {
          ctx.save(); G.alpha(ctx, focus * (si === 1 ? G.easeOut(t) : 1));
          G.txt(ctx, f.v[0] + "% solved", x + barW / 2, y0 + H + 22, { size: 12.5, weight: 600, color: C.green, align: "center" });
          ctx.restore();
        }
        if (si === 3 + fi) {
          ctx.save(); G.alpha(ctx, G.easeOut(t));
          G.txt(ctx, f.note, x + barW / 2, y0 + H + 44, { size: 11, color: C.amber, align: "center" });
          ctx.restore();
        }
        ctx.restore();
      });
      /* legend */
      if (si >= 2) {
        ctx.save(); G.alpha(ctx, si === 2 ? G.easeOut(t) : 1);
        CATS.forEach(function (c, i) {
          var lx = 110 + (i % 4) * 220, ly = 426 + Math.floor(i / 4) * 24;
          G.box(ctx, lx, ly - 6, 12, 12, { fill: c.col, r: 2 });
          G.txt(ctx, c.k, lx + 18, ly, { size: 10.5, color: C.dim });
        });
        ctx.restore();
      }
      if (si >= 6) {
        ctx.save(); G.alpha(ctx, si === 6 ? G.easeOut(t) : 1);
        G.txt(ctx, "same three shapes under both models tested", 500, 62, { size: 11.5, weight: 600, color: C.blue, align: "center" });
        ctx.restore();
      }
      if (si >= 7) {
        ctx.save(); G.alpha(ctx, si === 7 ? G.easeOut(t) : 1);
        G.box(ctx, 110, 484, 780, 60, { fill: "#0d1a16", stroke: C.green, r: 4 });
        G.txt(ctx, "\u201cclaimed done\u201d and \u201cstopped early\u201d demand opposite things from a reviewer:", 128, 506, { size: 11.5, color: C.ink });
        G.txt(ctx, "verify the output, or go and finish it yourself.", 128, 526, { size: 11.5, color: C.ink });
        ctx.restore();
      }
    }
  });

  /* ============ F15 : the harness effect, measured ============ */
  var PTS = [
    { h: "Goose", m: "Qwen 3.6 Plus", pass: 48.0, tok: 28142, turns: 17.96, idle: 0.20, col: C.green, sx: 1, sy: 0 },
    { h: "Goose", m: "MiniMax M2.5", pass: 38.0, tok: 36950, turns: 25.25, idle: 0.30, col: C.green, sx: 1, sy: 0 },
    { h: "OpenHands-SDK", m: "Qwen 3.6 Plus", pass: 50.0, tok: 841201, turns: 25.95, idle: 0.72, col: C.blue, sx: -1, sy: -26 },
    { h: "OpenHands-SDK", m: "MiniMax M2.5", pass: 46.0, tok: 843286, turns: 24.19, idle: 0.66, col: C.blue, sx: -1, sy: 22 },
    { h: "OpenCode", m: "Qwen 3.6 Plus", pass: 50.0, tok: 1147740, turns: 21.71, idle: 2.00, col: C.amber, sx: 1, sy: -26 },
    { h: "OpenCode", m: "MiniMax M2.5", pass: 46.0, tok: 1546977, turns: 27.46, idle: 2.16, col: C.amber, sx: 1, sy: 22 }
  ];
  mk({
    id: "fig-effect", w: 1000, h: 596, dur: 2, autoplay: false, resume: false,
    aria: "An interactive Pareto plot of pass rate against tokens per solved task for three harnesses and two models, with an adjustable token budget.",
    stages: [{ label: "Pass rate vs tokens per solved task", cam: [500, 270, 1], caption: "Six harness\u2013model pairs on the same fifty tasks. Pass rate is the vertical axis; the horizontal axis is a log scale over two orders of magnitude." }],
    knobs: [
      { key: "budget", label: "Your budget per solved task", min: 4.3, max: 6.3, value: 5.4, step: 0.05, fmt: function (v) { return G.fmt(Math.pow(10, v)) + " tokens"; } },
      { key: "which", label: "Show", min: 0, max: 2, value: 0, fmt: function (v) { return ["both models", "Qwen 3.6 Plus", "MiniMax M2.5"][Math.round(v)]; } }
    ],
    labNote: "Data from a controlled 300-trial study across three open-source harnesses and two models on a stratified fifty-task subset of Terminal-Bench Pro. Pass-rate differences span 0&ndash;8 points and mostly sit inside the bootstrap interval; tokens per solved task span 40&times;. The same asymmetry appears on Terminal-Bench 2.0, where one model was reported at 52.1% and 57.8% under two harnesses while consuming 256.9M and 3.9M input tokens respectively.",
    draw: function (ctx, si, t, st) {
      var px = 100, py = 76, pw = 560, ph = 320;
      var lo = 4.3, hi = 6.3;
      function X(tok) { return px + pw * (Math.log(tok) / Math.LN10 - lo) / (hi - lo); }
      function Y(p) { return py + ph - ph * (p - 30) / 30; }
      G.grid(ctx, px, py, pw, ph, 8, 6);
      G.line(ctx, px, py + ph, px + pw, py + ph, { color: "#41505c" });
      G.line(ctx, px, py, px, py + ph, { color: "#41505c" });
      for (var e = 5; e >= 0; e--) { }
      [4.5, 5, 5.5, 6].forEach(function (L) {
        var x = X(Math.pow(10, L));
        G.txt(ctx, G.fmt(Math.pow(10, L)), x, py + ph + 16, { size: 10, color: C.faint, align: "center" });
      });
      [30, 40, 50, 60].forEach(function (v) { G.txt(ctx, v + "%", px - 10, Y(v), { size: 10, color: C.faint, align: "right" }); });
      G.txt(ctx, "tokens per solved task  (log scale)", px + pw / 2, py + ph + 38, { size: 11, color: C.dim, align: "center" });
      ctx.save(); ctx.translate(px - 54, py + ph / 2); ctx.rotate(-Math.PI / 2);
      G.txt(ctx, "pass rate", 0, 0, { size: 11, color: C.dim, align: "center" }); ctx.restore();

      var bxv = X(Math.pow(10, st.budget));
      ctx.save(); G.alpha(ctx, 0.13);
      G.box(ctx, px, py, Math.max(0, bxv - px), ph, { fill: C.green, r: 0 });
      ctx.restore();
      G.line(ctx, bxv, py, bxv, py + ph, { color: C.green, dash: [5, 4], lw: 1.6 });
      G.txt(ctx, "budget", bxv - 6, py + 14, { size: 10, weight: 600, color: C.green, align: "right" });

      var which = Math.round(st.which), best = null, nAfford = 0;
      PTS.forEach(function (P) {
        if (which === 1 && P.m !== "Qwen 3.6 Plus") return;
        if (which === 2 && P.m !== "MiniMax M2.5") return;
        var x = X(P.tok), y = Y(P.pass);
        var afford = P.tok <= Math.pow(10, st.budget);
        if (afford) { nAfford++; if (!best || P.pass > best.pass) best = P; }
        ctx.save(); G.alpha(ctx, afford ? 1 : 0.3);
        ctx.beginPath(); ctx.arc(x, y, P.m === "Qwen 3.6 Plus" ? 8 : 6, 0, 6.29);
        ctx.fillStyle = P.col; ctx.fill();
        if (P.m !== "Qwen 3.6 Plus") { ctx.beginPath(); ctx.arc(x, y, 3, 0, 6.29); ctx.fillStyle = C.bg; ctx.fill(); }
        var al = P.sx > 0 ? "left" : "right", lx2 = x + P.sx * 13, ly2 = y + (P.sy || 0);
        G.txt(ctx, P.h, lx2, ly2 - 6, { size: 10.5, weight: 600, color: P.col, align: al });
        G.txt(ctx, P.m, lx2, ly2 + 8, { size: 9.5, color: C.faint, align: al });
        ctx.restore();
      });
      var ox = 700;
      G.box(ctx, ox, 76, 250, 200, { fill: C.panel, stroke: "#2b353e", r: 5 });
      G.txt(ctx, "AT THIS BUDGET", ox + 16, 100, { size: 10, weight: 600, color: C.faint });
      G.txt(ctx, "affordable pairs", ox + 16, 130, { size: 11, color: C.dim });
      G.txt(ctx, nAfford + " of " + (which === 0 ? 6 : 3), ox + 234, 130, { size: 13, weight: 600, color: C.ink, align: "right" });
      G.txt(ctx, "best affordable", ox + 16, 160, { size: 11, color: C.dim });
      G.txt(ctx, best ? best.h : "\u2014", ox + 234, 160, { size: 12, weight: 600, color: best ? best.col : C.red, align: "right" });
      G.txt(ctx, best ? best.pass.toFixed(0) + "% pass" : "nothing fits", ox + 234, 180, { size: 11, color: C.dim, align: "right" });
      G.txt(ctx, "cheapest \u2192 dearest", ox + 16, 214, { size: 11, color: C.dim });
      G.txt(ctx, (1546977 / 28142).toFixed(0) + "\u00d7", ox + 234, 214, { size: 16, weight: 600, color: C.amber, align: "right" });
      G.txt(ctx, "pass-rate spread", ox + 16, 244, { size: 11, color: C.dim });
      G.txt(ctx, "12 points", ox + 234, 244, { size: 13, weight: 600, color: C.blue, align: "right" });

      G.box(ctx, ox, 292, 250, 104, { fill: "#121920", stroke: "#2b353e", r: 5 });
      G.txt(ctx, "IDLE TURNS PER TASK", ox + 16, 314, { size: 10, weight: 600, color: C.faint });
      [["Goose", 0.25, C.green], ["OpenHands", 0.69, C.blue], ["OpenCode", 2.08, C.amber]].forEach(function (r, i) {
        G.txt(ctx, r[0], ox + 16, 338 + i * 20, { size: 10.5, color: C.dim });
        G.box(ctx, ox + 110, 332 + i * 20, 90 * (r[1] / 2.2), 10, { fill: r[2], r: 2 });
        G.txt(ctx, r[1].toFixed(2), ox + 234, 338 + i * 20, { size: 10.5, color: C.dim, align: "right" });
      });
      G.box(ctx, 100, 440, 850, 88, { fill: "#121920", stroke: "#2b353e", r: 5 });
      G.txt(ctx, "WHAT A LEADERBOARD ROW ACTUALLY MEASURES", 118, 464, { size: 10.5, weight: 600, color: C.amber });
      G.txt(ctx, "Q = f(model, harness, tools, environment).  Reporting only the model name collapses four variables into one, and", 118, 488, { size: 12, color: C.ink });
      G.txt(ctx, "throws away exactly the two \u2014 cost and oversight burden \u2014 that decide whether the thing is deployable.", 118, 510, { size: 12, color: C.ink });
    }
  });

  /* ============ F16 : the moving frontier ============ */
  var RESP = [
    { n: "line-numbered file viewer", v: [0.95, 0.55, 0.25] },
    { n: "search-result shaping", v: [0.9, 0.7, 0.5] },
    { n: "edit-format scaffolding", v: [0.95, 0.65, 0.4] },
    { n: "retry and repair prompting", v: [0.85, 0.5, 0.3] },
    { n: "plan tracking", v: [0.7, 0.55, 0.45] },
    { n: "context compaction", v: [0.2, 0.6, 0.9] },
    { n: "permissions and approval", v: [0.25, 0.6, 0.95] },
    { n: "sandbox and egress control", v: [0.35, 0.7, 1.0] },
    { n: "event log and resumability", v: [0.1, 0.45, 0.9] },
    { n: "budgets and termination", v: [0.2, 0.55, 0.9] },
    { n: "verification services", v: [0.4, 0.6, 0.85] },
    { n: "tracing and audit", v: [0.1, 0.4, 0.85] }
  ];
  mk({
    id: "fig-frontier", w: 1000, h: 648, dur: 2.4,
    aria: "A heat grid of twelve harness responsibilities across three years, showing the interface-teaching half of the harness shrinking while the governance half grows.",
    stages: [
      { label: "2024", cam: [500, 300, 1.0], caption: "2024: a purpose-built interface was the difference between three percent and twelve percent. Teaching the model to use a computer was most of the work." },
      { label: "2025", cam: [500, 300, 1.0], caption: "2025: models absorb the interface. A hundred-line agent with nothing but bash starts clearing three quarters of SWE-bench Verified." },
      { label: "2026", cam: [500, 300, 1.0], caption: "2026: the interface half keeps fading, the governance half keeps growing, and every frontier lab now ships its own harness." },
      { label: "Two halves", cam: [500, 300, 1.0], caption: "Split the rows and the pattern is clean: everything that teaches the model to act is being absorbed into the weights." },
      { label: "What stays", cam: [500, 320, 1.0], caption: "Everything that binds, records, or pays for the agent is not. No amount of capability makes a model its own sandbox." },
      { label: "The bet", cam: [500, 320, 1.0], caption: "Which suggests where to spend your engineering: not on teaching the model to read a file, but on what happens when it reads the wrong one." }
    ],
    draw: function (ctx, si, t) {
      var x0 = 286, y0 = 96, cw = 142, rh = 34;
      var years = ["2024", "2025", "2026"];
      var upto = si >= 2 ? 3 : si + 1;
      years.forEach(function (y, i) {
        ctx.save(); G.alpha(ctx, i < upto ? 1 : 0.18);
        G.txt(ctx, y, x0 + i * cw + cw / 2, y0 - 22, { size: 13, weight: 600, color: i === upto - 1 ? C.ink : C.faint, align: "center" });
        ctx.restore();
      });
      RESP.forEach(function (R, ri) {
        var y = y0 + ri * rh;
        var isGov = ri >= 5;
        var dim = (si === 3 && isGov) || (si === 4 && !isGov) ? 0.22 : 1;
        ctx.save(); G.alpha(ctx, dim);
        G.txt(ctx, R.n, x0 - 16, y + rh / 2, { size: 11.5, color: C.dim, align: "right" });
        for (var i = 0; i < 3; i++) {
          var a = i < upto ? (i === si && si < 3 ? G.easeOut(t) : 1) : 0.08;
          var v = R.v[i];
          ctx.save(); G.alpha(ctx, dim * a);
          var col = isGov ? "63,209,160" : "232,180,74";
          G.box(ctx, x0 + i * cw + 6, y + 4, cw - 12, rh - 10, { fill: "rgba(" + col + "," + (0.14 + 0.72 * v) + ")", r: 3 });
          G.txt(ctx, Math.round(v * 100) + "", x0 + i * cw + cw / 2, y + rh / 2, { size: 10.5, weight: 600, color: v > 0.55 ? "#08110d" : "#8b98a1", align: "center" });
          ctx.restore();
        }
        ctx.restore();
      });
      G.txt(ctx, "how much the harness must supply  (0 \u2013 100)", x0 + 213, y0 + RESP.length * rh + 24, { size: 10.5, color: C.faint, align: "center" });
      if (si >= 3) {
        ctx.save(); G.alpha(ctx, si === 3 ? G.easeOut(t) : 1);
        G.line(ctx, 60, y0 + 5 * rh - 4, 960, y0 + 5 * rh - 4, { color: "#4a5a66", dash: [6, 5] });
        G.txt(ctx, "teaching the model to act", 736, y0 + 2 * rh, { size: 11.5, weight: 600, color: C.amber });
        G.txt(ctx, "\u2193 absorbed into the weights", 736, y0 + 2 * rh + 20, { size: 10.5, color: C.faint });
        ctx.restore();
      }
      if (si >= 4) {
        ctx.save(); G.alpha(ctx, si === 4 ? G.easeOut(t) : 1);
        G.txt(ctx, "governing what it does", 736, y0 + 8 * rh, { size: 11.5, weight: 600, color: C.green });
        G.txt(ctx, "\u2191 growing, and not going anywhere", 736, y0 + 8 * rh + 20, { size: 10.5, color: C.faint });
        ctx.restore();
      }
      if (si >= 5) {
        ctx.save(); G.alpha(ctx, si === 5 ? G.easeOut(t) : 1);
        G.box(ctx, 60, 542, 880, 50, { fill: "#0d1a16", stroke: C.green, r: 5 });
        G.txt(ctx, "Schematic. The trend direction follows published results; the numbers are an illustration, not a measurement.", 78, 566, { size: 11, color: C.dim });
        ctx.restore();
      }
    }
  });
})();
