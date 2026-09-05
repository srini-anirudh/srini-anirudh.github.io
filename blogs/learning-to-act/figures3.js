/* Figures 6–10 */
(function () {
  "use strict";
  var L = window.LTA, H = L.H, C = L.C, reg = L.reg;

  function svg(vb, body, h) {
    return '<svg viewBox="' + vb + '" width="100%" height="' + (h || 440) +
      '" preserveAspectRatio="xMidYMid meet" role="img" xmlns="http://www.w3.org/2000/svg" ' +
      'font-family="IBM Plex Mono, ui-monospace, monospace">' + body + "</svg>";
  }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" fill="' + (o.fill || C.ink) + '" font-size="' + (o.size || 11) +
      '" text-anchor="' + (o.anchor || "start") + '" opacity="' + (o.op === undefined ? 1 : o.op) +
      '"' + (o.ls ? ' letter-spacing="' + o.ls + '"' : "") + ">" + H.esc(s) + "</text>";
  }
  function rect(x, y, w, h2, o) {
    o = o || {};
    return '<path d="' + H.box(x, y, Math.max(0, w), Math.max(0, h2), o.r === undefined ? 3 : o.r) +
      '" fill="' + (o.fill || "none") + '" stroke="' + (o.stroke || C.line) + '" stroke-width="' + (o.sw || 1) +
      '" opacity="' + (o.op === undefined ? 1 : o.op) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>";
  }
  function chip(x, y, w, h2, label, col, op, fo) {
    return rect(x, y, w, h2, { stroke: col, fill: col, op: (fo === undefined ? 0.13 : fo) * (op === undefined ? 1 : op) }) +
      rect(x, y, w, h2, { stroke: col, op: op }) +
      txt(x + w / 2, y + h2 / 2 + 4, label, { anchor: "middle", fill: col, size: 10.5, op: op });
  }

  /* ===================== FIGURE 6 — what the reward buys ================== */
  reg("fig-reward", {
    total: 14, rate: 0.6,
    captions: [
      "One task, five checkpoints: find the order, open the refund form, enter the amount, confirm, and land in the done state.",
      "Sparse outcome reward. The agent acts for forty steps and learns exactly one bit at the end.",
      "Across a batch, almost every rollout returns zero. The signal is real but it is thin.",
      "Dense reward: pay something at each checkpoint.",
      "Now the return is a staircase and a partial attempt is distinguishable from a hopeless one.",
      "Which genuinely helps — a trajectory that failed at the last step is no longer identical to one that never started.",
      "But shaping is a promise about what is valuable, and the policy will read it literally.",
      "Opening the form is worth +0.1. The agent opens the form.",
      "Closing it costs nothing. So it opens the form again.",
      "And again. Return climbs. Task success stays at zero.",
      "Zoom in: this is not a bug in the agent. It is the optimum of the reward we actually wrote down.",
      "Potential-based shaping is the one construction guaranteed to leave the optimal policy unchanged.",
      "The alternative is to make the outcome itself checkable: run the tests, query the database, diff the filesystem.",
      "A reward function is a contract with an environment. Anything the contract does not forbid is on the table."
    ],
    render: function (t) {
      var vb = H.cam([0, 0, 900, 440], [40, 150, 740, 362], H.segE(t, 10) - H.segE(t, 11));
      var b = rect(0, 0, 900, 440, { fill: C.bg, stroke: "none", r: 0 });
      var ms = ["find order", "open form", "enter amount", "confirm", "done"];
      var mx = [60, 220, 380, 540, 700];

      var a0 = H.segE(t, 0);
      b += txt(40, 32, "TASK RAIL", { fill: C.dim, size: 10, ls: 1.8, op: a0 });
      b += '<path d="' + H.poly([[60, 66], [760, 66]]) + '" stroke="' + C.line + '" stroke-width="2" opacity="' + a0 + '"/>';
      for (var i = 0; i < 5; i++) {
        b += '<circle cx="' + (mx[i] + 40) + '" cy="66" r="7" fill="' + C.bg + '" stroke="' + C.dim + '" stroke-width="1.6" opacity="' + a0 + '"/>';
        b += txt(mx[i] + 40, 90, ms[i], { anchor: "middle", fill: C.dim, size: 9.5, op: a0 });
      }

      /* ---- sparse ---- */
      var a1 = H.segE(t, 1);
      b += txt(40, 128, "SPARSE OUTCOME", { fill: C.blue, size: 10, ls: 1.6, op: a1 });
      var sp = [];
      for (var s = 0; s <= 40; s++) sp.push([60 + s * 17.5, s < 40 ? 168 : 138]);
      var nSp = Math.max(2, Math.round(41 * a1));
      b += '<path d="' + H.poly(sp.slice(0, nSp)) + '" stroke="' + C.blue + '" stroke-width="1.8" fill="none" opacity="' + H.segE(t, 1) + '"/>';
      if (a1 > 0.95) b += txt(770, 140, "r = 1", { fill: C.blue, size: 10 });
      var a2 = H.segE(t, 2);
      for (var k = 0; k < 24; k++) {
        var win = (k === 7 || k === 19);
        b += rect(60 + k * 12, 182, 8, 8, { fill: win ? C.blue : C.grid, stroke: "none", op: a2, r: 1 });
      }
      b += txt(360, 190, "2 of 24 rollouts return a non-zero reward", { fill: C.dim, size: 9.5, op: a2 });

      /* ---- dense ---- */
      var a3 = H.segE(t, 3), a4 = H.segE(t, 4);
      b += txt(40, 226, "DENSE / SHAPED", { fill: C.green, size: 10, ls: 1.6, op: a3 });
      var dn = [], lvl = 0;
      for (var s2 = 0; s2 <= 40; s2++) {
        if (s2 === 6 || s2 === 15 || s2 === 24 || s2 === 32) lvl += 0.14;
        if (s2 === 39) lvl += 0.44;
        dn.push([60 + s2 * 17.5, 296 - lvl * 80]);
      }
      var nDn = Math.max(2, Math.round(41 * Math.max(a3, a4)));
      b += '<path d="' + H.poly(dn.slice(0, nDn)) + '" stroke="' + C.green + '" stroke-width="1.8" fill="none" opacity="' + H.segE(t, 3) + '"/>';
      for (var g = 0; g < 4; g++) {
        b += txt(mx[g] + 40, 246, "+0.14", { anchor: "middle", fill: C.green, size: 9, op: H.segE(t, 3) });
      }
      b += txt(770, 224, "return \u2191", { fill: C.green, size: 9.5, op: a4 });
      b += txt(60, 314, "a near-miss and a no-start are now different trajectories", { fill: C.dim, size: 9.5, op: H.segE(t, 5) });

      /* ---- the exploit ---- */
      var a6 = H.segE(t, 6), a7 = H.segE(t, 7), a8 = H.segE(t, 8), a9 = H.segE(t, 9);
      b += txt(40, 344, "WHAT THE POLICY OPTIMISES", { fill: C.amber, size: 10, ls: 1.6, op: a6 });
      var loops = Math.floor(H.clamp((H.segE(t, 7) + H.segE(t, 8) * 2 + H.segE(t, 9) * 6), 0, 9));
      var ex = [[60, 396]];
      var cur = 396;
      for (var lp = 0; lp < loops; lp++) {
        ex.push([100 + lp * 62, cur]); cur -= 10; ex.push([140 + lp * 62, cur]);
      }
      b += '<path d="' + H.poly(ex) + '" stroke="' + C.amber + '" stroke-width="2" fill="none" opacity="' + Math.max(a7, a8) + '"/>';
      for (var lp2 = 0; lp2 < loops; lp2++) {
        b += '<path d="M' + (140 + lp2 * 62) + ' ' + (396 - lp2 * 10 - 10) + 'a14 12 0 1 1 -2 0" stroke="' + C.amber +
          '" stroke-width="1.2" fill="none" opacity="0.65"/>';
      }
      b += txt(60, 414, "open_form()  \u2192  close()  \u2192  open_form()  \u2026", { fill: C.amber, size: 9.5, op: a8 });
      b += txt(470, 380, "return: " + H.fmt(loops * 0.14, 2), { fill: C.amber, size: 12, op: a8 });
      b += txt(470, 400, "task success: 0", { fill: C.red, size: 12, op: a9 });

      /* right column: theory + verifiable */
      var a11 = H.segE(t, 11), a12 = H.segE(t, 12), a13 = H.segE(t, 13);
      b += rect(560, 116, 300, 90, { fill: C.panel, stroke: C.line, op: a11 });
      b += txt(576, 140, "F(s, a, s\u2032) = \u03b3 \u03a6(s\u2032) \u2212 \u03a6(s)", { fill: C.teal, size: 12.5, op: a11 });
      b += txt(576, 162, "a shaping term of this form leaves the set", { fill: C.dim, size: 9.5, op: a11 });
      b += txt(576, 176, "of optimal policies unchanged. Anything", { fill: C.dim, size: 9.5, op: a11 });
      b += txt(576, 190, "else is a new objective, not a hint.", { fill: C.dim, size: 9.5, op: a11 });

      b += rect(560, 218, 300, 104, { fill: C.panel, stroke: C.line, op: a12 });
      b += txt(576, 242, "VERIFIABLE OUTCOME", { fill: C.dim, size: 9, ls: 1.4, op: a12 });
      ["pytest -q  \u2192  12 passed", "SELECT status \u2192 'refunded'", "git diff  \u2192  3 files changed"].forEach(function (line, ii) {
        b += txt(576, 264 + ii * 19, line, { fill: C.green, size: 9.5, op: a12 });
      });
      b += txt(560, 348, "The reward is a contract.", { fill: C.ink, size: 12, op: a13 });
      b += txt(560, 366, "The policy is an adversary that reads it", { fill: C.dim, size: 9.5, op: a13 });
      b += txt(560, 380, "more carefully than you wrote it.", { fill: C.dim, size: 9.5, op: a13 });
      return svg(vb, b);
    }
  });

  /* ===================== FIGURE 7 — credit assignment ==================== */
  reg("fig-credit", {
    total: 12, rate: 0.58,
    captions: [
      "Four rollouts from the same task and the same initial state.",
      "Two reach the goal, two do not. That is the entire reward signal.",
      "Trajectory-level advantage: normalise the four returns and you get one number per rollout.",
      "That number is then attached to every action inside the rollout.",
      "Which means this action \u2014 a redundant page reload inside a winning rollout \u2014 is reinforced.",
      "And this one \u2014 a correct, necessary step inside a losing rollout \u2014 is punished.",
      "Trajectory-level credit is unbiased about the trajectory and extremely noisy about the action.",
      "But look: three of the four rollouts passed through the same environment state.",
      "Group the actions taken at that anchor state, across rollouts. They are directly comparable.",
      "Now compute a local advantage inside that group. The redundant reload goes negative even though its rollout won.",
      "Combine the two levels: an episode term for direction, a step term for resolution.",
      "This is the shape most 2025\u201326 agent RL algorithms converge on, whether by anchor grouping, trees, learned critics, or intrinsic per-turn signals."
    ],
    render: function (t) {
      var vb = H.cam([0, 0, 900, 440], [178, 44, 722, 353], H.segE(t, 8) - H.segE(t, 10));
      var b = rect(0, 0, 900, 440, { fill: C.bg, stroke: "none", r: 0 });
      var rows = [96, 168, 240, 312];
      var wins = [1, 0, 1, 0];
      var paths = [
        [0, 1, 2, 3, 4, 5, 6],
        [0, 1, 2, 7, 8, 9],
        [0, 1, 2, 3, 10, 5, 6],
        [0, 1, 11, 12, 13]
      ];
      var anchorStep = 2;   /* index within path where the anchor state sits */
      var stepX = function (i) { return 90 + i * 84; };

      b += txt(40, 42, "FOUR ROLLOUTS, ONE TASK", { fill: C.dim, size: 10, ls: 1.8 });
      for (var r = 0; r < 4; r++) {
        var app = H.segE(t, 0);
        var pth = paths[r];
        var pts = pth.map(function (_, i) { return [stepX(i), rows[r]]; });
        var nShow = Math.max(1, Math.round(pth.length * H.clamp(app * 1.2, 0, 1)));
        if (nShow > 1) b += '<path d="' + H.poly(pts.slice(0, nShow)) + '" stroke="' + C.faint + '" stroke-width="1.4" fill="none" opacity="' + app + '"/>';
        for (var i2 = 0; i2 < nShow; i2++) {
          /* colour by whichever credit scheme is currently active */
          var col = C.faint, op = app, rr = 6;
          var traj = H.segE(t, 3) - H.segE(t, 9);
          if (traj > 0.02) { col = wins[r] ? C.green : C.red; op = app * (0.35 + 0.65 * traj); }
          var stepMode = H.segE(t, 9);
          if (stepMode > 0.02 && i2 === anchorStep) {
            var localGood = (r === 0 || r === 3) ? false : true;
            if (r === 0) localGood = false;
            if (r === 1) localGood = true;
            if (r === 2) localGood = true;
            col = localGood ? C.green : C.red;
            op = app;
            rr = 6 + 2 * stepMode;
          }
          b += '<circle cx="' + stepX(i2) + '" cy="' + rows[r] + '" r="' + rr + '" fill="' + col + '" opacity="' + (op * 0.35) + '"/>';
          b += '<circle cx="' + stepX(i2) + '" cy="' + rows[r] + '" r="' + rr + '" fill="none" stroke="' + col + '" stroke-width="1.4" opacity="' + op + '"/>';
        }
        var a1 = H.segE(t, 1);
        b += txt(46, rows[r] + 4, "\u03c4" + (r + 1), { fill: C.dim, size: 11, op: app });
        b += txt(stepX(pth.length - 1) + 26, rows[r] + 4, wins[r] ? "R = 1" : "R = 0",
          { fill: wins[r] ? C.green : C.red, size: 10.5, op: a1 });
        var a2 = H.segE(t, 2);
        b += txt(stepX(pth.length - 1) + 84, rows[r] + 4, wins[r] ? "A = +1.0" : "A = \u22121.0",
          { fill: wins[r] ? C.green : C.red, size: 10.5, op: a2 });
      }

      /* callouts */
      var a4 = H.segE(t, 4), a5 = H.segE(t, 5);
      if (a4 > 0.02) {
        b += '<circle cx="' + stepX(4) + '" cy="' + rows[0] + '" r="' + (12 + 6 * H.pulse(t, 4)) + '" fill="none" stroke="' + C.amber + '" stroke-width="1.6" opacity="' + a4 + '"/>';
        b += txt(stepX(4), rows[0] - 22, "redundant reload, reinforced", { anchor: "middle", fill: C.amber, size: 9.5, op: a4 });
      }
      if (a5 > 0.02) {
        b += '<circle cx="' + stepX(3) + '" cy="' + rows[3] + '" r="' + (12 + 6 * H.pulse(t, 5)) + '" fill="none" stroke="' + C.amber + '" stroke-width="1.6" opacity="' + a5 + '"/>';
        b += txt(stepX(3), rows[3] + 30, "correct step, punished", { anchor: "middle", fill: C.amber, size: 9.5, op: a5 });
      }

      /* anchor grouping */
      var a7 = H.segE(t, 7), a8 = H.segE(t, 8);
      if (a7 > 0.02) {
        b += rect(stepX(anchorStep) - 22, rows[0] - 22, 44, rows[2] - rows[0] + 44, { stroke: C.purple, dash: "4 3", op: a7 });
        b += txt(stepX(anchorStep), rows[0] - 34, "anchor state  s\u0303", { anchor: "middle", fill: C.purple, size: 10, op: a7 });
      }
      if (a8 > 0.02) {
        b += rect(560, 96, 300, 118, { fill: C.panel, stroke: C.purple, op: a8 });
        b += txt(576, 118, "ACTIONS TAKEN AT  s\u0303", { fill: C.purple, size: 9, ls: 1.4, op: a8 });
        [["\u03c4\u2081  reload()", C.red], ["\u03c4\u2082  open(\u201corders\u201d)", C.green], ["\u03c4\u2083  open(\u201corders\u201d)", C.green]].forEach(function (e, ii) {
          b += txt(576, 142 + ii * 22, e[0], { fill: e[1], size: 10.5, op: a8 });
          b += txt(830, 142 + ii * 22, ii === 0 ? "\u22120.67" : "+0.33", { fill: e[1], size: 10.5, anchor: "end", op: a8 });
        });
      }

      var a10 = H.segE(t, 10);
      b += rect(40, 356, 500, 62, { fill: C.panel, stroke: C.line, op: a10 });
      b += txt(58, 382, "A(s\u209C, a\u209C)  =  A\u1d49\u1d56\u1da0\u02e2\u1d52\u1d48\u1d49(\u03c4)  +  \u03bb \u00b7 A\u02e2\u1d57\u1d49\u1d56(s\u209C, a\u209C)",
        { fill: C.green, size: 13.5, op: a10 });
      b += txt(58, 404, "direction from the outcome, resolution from the comparison at a shared state", { fill: C.dim, size: 9.5, op: a10 });
      return svg(vb, b);
    }
  });

  /* ===================== FIGURE 8 — the group-signal lab ================= */
  reg("fig-groupsignal", {
    total: 8, rate: 0.42,
    captions: [
      "A group of G rollouts on one task. Here every one of them fails.",
      "Their returns are identical, so the normalised advantage is zero for all of them. This batch contributes nothing.",
      "The same is true when every rollout succeeds. Only disagreement inside the group carries gradient.",
      "So the probability that a group is informative is one minus the two degenerate cases.",
      "Plotted against task success probability, that curve peaks at one half and dies at both ends.",
      "Now connect it to the horizon. If a task needs H decisions and each is right with probability q, then p = q^H.",
      "Success collapses geometrically in the horizon, so the fraction of useful groups collapses with it.",
      "Which is why long-horizon agent RL spends most of its compute on batches that teach nothing \u2014 and why difficulty filtering, curricula and denser credit are not optional extras."
    ],
    params: [
      { key: "q", label: "per-step reliability q", min: 0.80, max: 0.995, step: 0.005, value: 0.93, fmt: function (v) { return H.fmt(v, 3); } },
      { key: "Hh", label: "horizon H", min: 1, max: 60, step: 1, value: 12, fmt: function (v) { return Math.round(v); } },
      { key: "G", label: "group size G", min: 4, max: 32, step: 1, value: 8, fmt: function (v) { return Math.round(v); } }
    ],
    render: function (t, pm) {
      var b = rect(0, 0, 900, 440, { fill: C.bg, stroke: "none", r: 0 });
      var q = pm.q, Hh = Math.round(pm.Hh), G = Math.round(pm.G);
      var p = Math.pow(q, Hh);
      var Pinf = 1 - Math.pow(p, G) - Math.pow(1 - p, G);

      /* rollout lanes */
      b += txt(40, 34, "ONE GROUP", { fill: C.dim, size: 10, ls: 1.8 });
      var rnd = H.rnd(11);
      var pitch = Math.min(34, 300 / G);
      for (var i = 0; i < G; i++) {
        var y = 50 + i * pitch;
        var hgt = Math.min(22, pitch - 6);
        var ok;
        if (t < 2.0) ok = false;              /* stages 0-1: every rollout fails */
        else if (t < 3.0) ok = true;          /* stage 2: every rollout succeeds */
        else ok = (i / G) < Math.max(p, 0.001) + (i === 1 ? 0.4 : 0);
        void rnd;
        var col = ok ? C.green : C.red;
        b += rect(40, y, 160 * (0.55 + 0.45 * ((i * 29 % 7) / 7)), hgt, { fill: col, stroke: "none", op: 0.32, r: 2 });
        b += txt(212, y + hgt - 3, ok ? "R=1" : "R=0", { fill: col, size: 9.5 });
        if (t < 3.0) b += txt(254, y + hgt - 3, "A = 0", { fill: C.faint, size: 9.5, op: H.segE(t, 1) });
      }
      var degen = (t < 3.0) ? 1 : 0;
      if (degen) {
        b += rect(34, 44, 264, pitch * G + 8, { stroke: C.faint, dash: "4 3", op: H.segE(t, 1) });
        b += txt(40, 66 + pitch * G, "zero variance \u2192 zero gradient", { fill: C.faint, size: 10, op: H.segE(t, 1) });
      }
      b += txt(40, 44 + pitch * G + (degen ? 40 : 22), "G = " + G + " rollouts \u00b7 one task \u00b7 p = " + H.fmt(p, 3),
        { fill: C.dim, size: 9.5, op: 0.85 });

      /* formula panel */
      var a3 = H.segE(t, 3);
      b += rect(330, 44, 250, 128, { fill: C.panel, stroke: C.line, op: a3 });
      b += txt(346, 68, "P(group is informative)", { fill: C.dim, size: 9.5, op: a3 });
      b += txt(346, 96, "= 1 \u2212 p\u1d33 \u2212 (1\u2212p)\u1d33", { fill: C.green, size: 15, op: a3 });
      b += txt(346, 126, "p = " + (p < 0.001 ? p.toExponential(1) : H.fmt(p, 4)), { fill: C.amber, size: 11.5, op: a3 });
      b += txt(346, 146, "P = " + H.fmt(Pinf, 4), { fill: C.green, size: 11.5, op: a3 });
      b += txt(346, 164, "useful groups per 64: " + H.fmt(64 * Pinf, 1), { fill: C.dim, size: 10, op: a3 });

      var a5 = H.segE(t, 5);
      b += rect(330, 186, 250, 76, { fill: C.panel, stroke: C.line, op: a5 });
      b += txt(346, 210, "p = q^H = " + H.fmt(q, 3) + "^" + Hh, { fill: C.blue, size: 12.5, op: a5 });
      b += txt(346, 232, "H\u2085\u2080 = ln(0.5) / ln(q) = " + H.fmt(Math.log(0.5) / Math.log(q), 1) + " steps", { fill: C.dim, size: 10, op: a5 });
      b += txt(346, 250, "to double H\u2085\u2080 you must halve \u2212ln q", { fill: C.dim, size: 10, op: a5 });

      /* plot 1: P vs p */
      var a4 = H.segE(t, 4);
      var px = 604, py = 44, pw = 262, ph = 168;
      b += rect(px, py, pw, ph, { stroke: C.line, fill: C.panel, op: a4 });
      b += txt(px + 12, py + 18, "P  vs  task success p", { fill: C.dim, size: 9, ls: 1.3, op: a4 });
      var c1 = [];
      for (var u = 0; u <= 60; u++) {
        var pp = u / 60;
        var vv = 1 - Math.pow(pp, G) - Math.pow(1 - pp, G);
        c1.push([px + 26 + (u / 60) * (pw - 44), py + ph - 26 - vv * (ph - 52)]);
      }
      b += '<path d="' + H.curve(c1) + '" stroke="' + C.green + '" stroke-width="2" fill="none" opacity="' + a4 + '"/>';
      var mx1 = px + 26 + p * (pw - 44), my1 = py + ph - 26 - Pinf * (ph - 52);
      b += '<circle cx="' + H.fmt(mx1, 1) + '" cy="' + H.fmt(my1, 1) + '" r="4.5" fill="' + C.amber + '" opacity="' + a4 + '"/>';
      b += txt(px + 26, py + ph - 10, "0", { fill: C.faint, size: 8.5, op: a4 });
      b += txt(px + 26 + (pw - 44) / 2, py + ph - 10, "0.5", { fill: C.faint, size: 8.5, anchor: "middle", op: a4 });
      b += txt(px + pw - 18, py + ph - 10, "1", { fill: C.faint, size: 8.5, anchor: "end", op: a4 });

      /* plot 2: P vs H */
      var a6 = H.segE(t, 6);
      var qx = 604, qy = 228, qw = 262, qh = 168;
      b += rect(qx, qy, qw, qh, { stroke: C.line, fill: C.panel, op: a6 });
      b += txt(qx + 12, qy + 18, "P  vs  horizon H", { fill: C.dim, size: 9, ls: 1.3, op: a6 });
      var c2 = [];
      for (var hh = 1; hh <= 60; hh++) {
        var pq = Math.pow(q, hh);
        var vq = 1 - Math.pow(pq, G) - Math.pow(1 - pq, G);
        c2.push([qx + 26 + ((hh - 1) / 59) * (qw - 44), qy + qh - 26 - vq * (qh - 52)]);
      }
      b += '<path d="' + H.curve(c2) + '" stroke="' + C.blue + '" stroke-width="2" fill="none" opacity="' + a6 + '"/>';
      var mx2 = qx + 26 + ((Hh - 1) / 59) * (qw - 44);
      b += '<path d="' + H.poly([[mx2, qy + 26], [mx2, qy + qh - 26]]) + '" stroke="' + C.amber + '" stroke-width="1" stroke-dasharray="3 3" opacity="' + a6 + '"/>';
      b += txt(qx + 26, qy + qh - 10, "1", { fill: C.faint, size: 8.5, op: a6 });
      b += txt(qx + qw - 18, qy + qh - 10, "60", { fill: C.faint, size: 8.5, anchor: "end", op: a6 });

      var a7 = H.segE(t, 7);
      b += rect(40, 366, 540, 54, { fill: C.panel, stroke: C.line, op: a7 });
      b += txt(58, 392, "long horizon  \u21d2  p \u2192 0  \u21d2  informative groups \u2248 G \u00b7 p  \u2192 0", { fill: C.amber, size: 12.5, op: a7 });
      b += txt(58, 410, "the batch is not wrong, it is empty", { fill: C.dim, size: 9.5, op: a7 });
      return svg("0 0 900 440", b);
    }
  });

  /* ===================== FIGURE 9 — the echo trap ======================== */
  reg("fig-echotrap", {
    total: 12, rate: 0.6,
    captions: [
      "Four things worth watching during multi-turn agent RL. Three of them will move before the reward does.",
      "Early training looks healthy: mean reward climbs.",
      "Policy entropy falls, which is expected \u2014 the policy is committing to something.",
      "But watch the spread of rewards inside each group. It is narrowing faster than the mean is rising.",
      "Here is the cliff. Reward standard deviation collapses.",
      "Gradient norm spikes at almost exactly the same step.",
      "And only now does the mean reward stall and turn over. By the time the headline metric moves, the run is already gone.",
      "Look at what the rollouts contain: the same reasoning phrase, the same tool call, over and over.",
      "Zoom in. This is a self-reinforcing loop \u2014 the policy rewarded a pattern, sampled it more, and starved itself of anything to compare against.",
      "Reward variance is the early-warning signal, and it is cheap to log.",
      "Stabilised variants filter low-variance groups out of the batch, decouple the clipping range, and drop the KL anchor.",
      "None of this is exotic. It is what happens when the only thing keeping a group-relative method alive is disagreement, and the policy stops disagreeing with itself."
    ],
    render: function (t) {
      var vb = H.cam([0, 0, 900, 440], [470, 28, 532, 260], H.segE(t, 8) - H.segE(t, 9));
      var b = rect(0, 0, 900, 440, { fill: C.bg, stroke: "none", r: 0 });
      var px = 40, py = 56, pw = 520, ph = 250;
      b += rect(px, py, pw, ph, { stroke: C.line, fill: C.panel });
      b += txt(px + 12, py + 18, "TRAINING DYNAMICS", { fill: C.dim, size: 9, ls: 1.4 });
      b += txt(px + pw - 12, py + ph - 8, "step", { fill: C.faint, size: 9, anchor: "end" });

      var X = function (s) { return px + 30 + (s / 100) * (pw - 52); };
      var Y = function (v) { return py + ph - 28 - v * (ph - 58); };
      var cliff = 58;

      /* The legend runs along the top edge, clear of the plotted curves. */
      function series(fn, col, stageOn, label, lx) {
        var on = H.segE(t, stageOn);
        var n = Math.max(2, Math.round(101 * H.clamp(on * 1.25, 0, 1)));
        var pts = [];
        for (var s = 0; s < n; s++) pts.push([X(s), Y(fn(s))]);
        var d = '<path d="' + H.curve(pts) + '" stroke="' + col + '" stroke-width="1.9" fill="none" opacity="' + on + '"/>';
        /* the legend is listed from stage 0 so the reader knows what to watch */
        var lop = Math.max(0.45 * H.segE(t, 0), on), ly = py - 10;
        d += txt(lx + 14, ly, label, { fill: col, size: 9.5, op: lop });
        d += '<path d="' + H.poly([[lx, ly - 4], [lx + 10, ly - 4]]) + '" stroke="' + col +
          '" stroke-width="2" opacity="' + lop + '"/>';
        return d;
      }
      /* mean reward: climbs, stalls after the cliff, decays */
      b += series(function (s) {
        var v = 0.12 + 0.5 * (1 - Math.exp(-s / 26));
        if (s > cliff + 6) v -= 0.0075 * (s - cliff - 6);
        return H.clamp(v, 0.05, 0.95);
      }, C.green, 1, "mean reward", 40);
      /* entropy */
      b += series(function (s) { return H.clamp(0.86 * Math.exp(-s / 44) + 0.06, 0, 1); }, C.blue, 2, "policy entropy", 160);
      /* reward std: narrows then cliffs */
      b += series(function (s) {
        var v = 0.52 * Math.exp(-s / 40);
        if (s > cliff) v *= Math.exp(-(s - cliff) / 4);
        return H.clamp(v + 0.02, 0, 1);
      }, C.amber, 3, "reward std", 300);
      /* gradient norm: spike at cliff */
      b += series(function (s) {
        return H.clamp(0.12 + 0.85 * Math.exp(-Math.pow((s - cliff - 2) / 4.2, 2)), 0, 1);
      }, C.red, 5, "gradient norm", 410);

      var a4 = H.segE(t, 4);
      b += '<path d="' + H.poly([[X(cliff), py + 26], [X(cliff), py + ph - 28]]) + '" stroke="' + C.amber +
        '" stroke-width="1" stroke-dasharray="3 3" opacity="' + a4 + '"/>';
      b += txt(X(cliff) + 6, py + 34, "variance cliff", { fill: C.amber, size: 9.5, op: a4 });
      var a6 = H.segE(t, 6);
      b += txt(X(cliff + 26), py + 132, "reward turns over here", { fill: C.green, size: 9.5, op: a6 });

      /* rollout samples */
      var a7 = H.segE(t, 7);
      b += rect(584, 56, 276, 250, { fill: C.panel, stroke: C.line, op: a7 });
      b += txt(600, 78, "ROLLOUT SAMPLES, STEP " + (cliff + 10), { fill: C.dim, size: 9, ls: 1.3, op: a7 });
      for (var i = 0; i < 6; i++) {
        var same = i > 0;
        b += txt(600, 92 + i * 32, "\u03c4" + (i + 1) + "  I should check the page", { fill: same ? C.red : C.ink, size: 9.5, op: a7 * (0.55 + 0.45 * H.clamp(a7 * 3 - i * 0.3, 0, 1)) });
        b += txt(600, 106 + i * 32, "     search(\u201corder status\u201d)", { fill: same ? C.red : C.dim, size: 9.5, op: a7 * (0.55 + 0.45 * H.clamp(a7 * 3 - i * 0.3, 0, 1)) });
      }

      /* stabilised overlay */
      var a10 = H.segE(t, 10);
      if (a10 > 0.02) {
        var st = [];
        for (var s3 = 0; s3 <= 100; s3++) st.push([X(s3), Y(H.clamp(0.12 + 0.62 * (1 - Math.exp(-s3 / 40)), 0, 1))]);
        b += '<path d="' + H.curve(st) + '" stroke="' + C.teal + '" stroke-width="2" fill="none" opacity="' + a10 + '" stroke-dasharray="5 3"/>';
        b += txt(px + 40, py + 104, "stabilised variant", { fill: C.teal, size: 9.5, op: a10 });
      }
      var a11 = H.segE(t, 11);
      b += rect(40, 312, 820, 100, { fill: C.panel, stroke: C.line, op: a11 });
      b += txt(58, 338, "filter groups with near-zero return variance   \u00b7   decouple the clip bounds   \u00b7   drop the KL anchor   \u00b7   resample initial states", { fill: C.teal, size: 11, op: a11 });
      b += txt(58, 362, "A group-relative estimator has no baseline other than the group. When the group agrees, the estimator is not noisy \u2014 it is undefined,", { fill: C.dim, size: 10, op: a11 });
      b += txt(58, 380, "and the update it produces comes entirely from whatever asymmetry survives in the clipping and normalisation.", { fill: C.dim, size: 10, op: a11 });
      b += txt(58, 400, "Reward standard deviation is therefore the metric to alarm on, not mean reward.", { fill: C.amber, size: 10.5, op: a11 });
      return svg(vb, b);
    }
  });

  /* ===================== FIGURE 10 — horizon curriculum ================== */
  reg("fig-curriculum", {
    total: 12, rate: 0.6,
    captions: [
      "Two runs, same model, same environment, same algorithm. The only difference is how many turns the agent is allowed.",
      "Run A gets the full budget from step zero: thirty turns, every rollout, from the beginning.",
      "Run B starts at five turns and is allowed more only as it earns them.",
      "Early on, run A looks better. More turns means more chances to stumble into a reward.",
      "Run B is still learning to finish short tasks. Its ceiling is capped by construction.",
      "Then run A's rollouts start to fill with redundant exploration \u2014 long trajectories that wander and reach nothing.",
      "Its return variance collapses and the run turns over. Long horizons early are a variance problem, not a capability gain.",
      "Run B's budget steps up to ten. It carries a working short-horizon policy into the longer regime.",
      "Twenty turns. Backtracking and retry behaviour start showing up in the rollouts, because there is now room for them.",
      "Thirty. Same budget run A had all along, reached from a policy that already knows how to spend it.",
      "Run B ends higher and gets there on less compute, because it never spent a batch on trajectories it could not learn from.",
      "The horizon is a curriculum variable. It belongs next to learning rate and batch size, not in the environment config you set once."
    ],
    render: function (t) {
      var b = rect(0, 0, 900, 440, { fill: C.bg, stroke: "none", r: 0 });
      var px = 40, py = 66, pw = 540, ph = 260;
      b += rect(px, py, pw, ph, { stroke: C.line, fill: C.panel });
      b += txt(px + 12, py + 18, "SUCCESS RATE", { fill: C.dim, size: 9, ls: 1.4 });
      b += txt(px + pw - 12, py + ph - 8, "training steps", { fill: C.faint, size: 9, anchor: "end" });
      var X = function (s) { return px + 32 + (s / 100) * (pw - 54); };
      var Y = function (v) { return py + ph - 28 - v * (ph - 56); };
      for (var gl = 0; gl <= 4; gl++) {
        b += '<path d="' + H.poly([[px + 32, Y(gl / 4)], [px + pw - 22, Y(gl / 4)]]) +
          '" stroke="' + C.grid + '" stroke-width="1" opacity="0.85"/>';
        b += txt(px + 26, Y(gl / 4) + 3, String(gl * 25) + "%", { fill: C.faint, size: 8, anchor: "end" });
      }

      var prog = H.clamp((H.segE(t, 3) * 0.22 + H.segE(t, 5) * 0.2 + H.segE(t, 6) * 0.16 +
        H.segE(t, 7) * 0.14 + H.segE(t, 8) * 0.13 + H.segE(t, 9) * 0.1 + H.segE(t, 10) * 0.05), 0, 1);
      var upto = Math.round(prog * 100);

      function runA(s) {
        var v = 0.06 + 0.42 * (1 - Math.exp(-s / 16));
        if (s > 42) v -= 0.0064 * (s - 42);
        return H.clamp(v, 0.02, 1);
      }
      function runB(s) {
        var caps = [0.22, 0.42, 0.62, 0.84];
        var seg = s < 26 ? 0 : (s < 50 ? 1 : (s < 74 ? 2 : 3));
        var base = 0.04 + caps[seg] * (1 - Math.exp(-(s - [0, 26, 50, 74][seg]) / 12)) + [0, 0.16, 0.34, 0.52][seg];
        return H.clamp(Math.min(base, caps[seg] + [0, 0.16, 0.34, 0.52][seg]), 0.02, 1);
      }
      var pa = [], pb = [];
      for (var s = 0; s <= upto; s++) { pa.push([X(s), Y(runA(s))]); pb.push([X(s), Y(runB(s))]); }
      if (pa.length > 1) b += '<path d="' + H.curve(pa) + '" stroke="' + C.red + '" stroke-width="2.1" fill="none"/>';
      if (pb.length > 1) b += '<path d="' + H.curve(pb) + '" stroke="' + C.green + '" stroke-width="2.1" fill="none"/>';
      if (pa.length > 1) b += '<circle cx="' + H.fmt(pa[pa.length - 1][0], 1) + '" cy="' + H.fmt(pa[pa.length - 1][1], 1) + '" r="4" fill="' + C.red + '"/>';
      if (pb.length > 1) b += '<circle cx="' + H.fmt(pb[pb.length - 1][0], 1) + '" cy="' + H.fmt(pb[pb.length - 1][1], 1) + '" r="4" fill="' + C.green + '"/>';
      b += txt(px + 44, py + 40, "run A \u2014 fixed 30 turns", { fill: C.red, size: 10, op: H.segE(t, 1) });
      b += txt(px + 44, py + 58, "run B \u2014 progressive 5 \u2192 30", { fill: C.green, size: 10, op: H.segE(t, 2) });

      var a6 = H.segE(t, 6);
      if (a6 > 0.02 && upto > 46) {
        b += txt(X(58), Y(runA(58)) + 22, "run A turns over", { fill: C.red, size: 9.5, anchor: "middle", op: a6 });
      }

      /* horizon schedule bars */
      b += txt(608, 84, "ALLOWED TURNS", { fill: C.dim, size: 10, ls: 1.6 });
      var sched = [[0, 30, C.red, "run A"], [0, 5, C.green, ""], [26, 10, C.green, ""], [50, 20, C.green, ""], [74, 30, C.green, ""]];
      b += rect(608, 96, 252, 30, { fill: C.red, stroke: C.red, op: 0.16 * H.segE(t, 1), r: 2 });
      b += rect(608, 96, 252, 30, { stroke: C.red, op: H.segE(t, 1) });
      b += txt(618, 116, "run A:  30 turns from step 0", { fill: C.red, size: 10, op: H.segE(t, 1) });
      var stageFor = [2, 7, 8, 9];
      var wsc = [0.24, 0.42, 0.68, 1.0];
      for (var q = 0; q < 4; q++) {
        var op = H.segE(t, stageFor[q]);
        b += rect(608, 138 + q * 42, 196 * wsc[q], 30, { fill: C.green, stroke: C.green, op: 0.16 * op, r: 2 });
        b += rect(608, 138 + q * 42, 196 * wsc[q], 30, { stroke: C.green, op: op });
        b += txt(618, 158 + q * 42, [5, 10, 20, 30][q] + " turns", { fill: C.green, size: 10, op: op });
        b += txt(860, 158 + q * 42, "step " + [0, 26, 50, 74][q], { fill: C.faint, size: 9, anchor: "end", op: op });
      }

      var a11 = H.segE(t, 11);
      b += rect(40, 344, 540, 74, { fill: C.panel, stroke: C.line, op: a11 });
      b += txt(58, 370, "h\u209C = min(H\u2098\u2090\u2093 ,  h\u2080 + \u0394 \u00b7 \u230astep / T\u209b\u230b)", { fill: C.green, size: 13, op: a11 });
      b += txt(58, 394, "exploitation first, exploration second \u2014 the opposite of the usual schedule intuition", { fill: C.dim, size: 9.5, op: a11 });
      return svg("0 0 900 440", b);
    }
  });
})();
