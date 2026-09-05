/* Figures 1–5 */
(function () {
  "use strict";
  var L = window.LTA, H = L.H, C = L.C, reg = L.reg;

  function svg(vb, body, w, h) {
    return '<svg viewBox="' + vb + '" width="100%" height="' + (h || 440) +
      '" preserveAspectRatio="xMidYMid meet" role="img" xmlns="http://www.w3.org/2000/svg" ' +
      'font-family="IBM Plex Mono, ui-monospace, monospace">' + body + "</svg>";
  }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" fill="' + (o.fill || C.ink) + '" font-size="' + (o.size || 11) +
      '" text-anchor="' + (o.anchor || "start") + '" opacity="' + (o.op === undefined ? 1 : o.op) +
      '"' + (o.weight ? ' font-weight="' + o.weight + '"' : "") +
      (o.ls ? ' letter-spacing="' + o.ls + '"' : "") +
      (o.family ? ' font-family="' + o.family + '"' : "") + ">" + H.esc(s) + "</text>";
  }
  function rect(x, y, w, h2, o) {
    o = o || {};
    return '<path d="' + H.box(x, y, Math.max(0, w), Math.max(0, h2), o.r === undefined ? 3 : o.r) +
      '" fill="' + (o.fill || "none") + '" stroke="' + (o.stroke || C.line) + '" stroke-width="' + (o.sw || 1) +
      '" opacity="' + (o.op === undefined ? 1 : o.op) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>";
  }
  function chip(x, y, w, h2, label, col, op, fillOp) {
    return rect(x, y, w, h2, { stroke: col, fill: col, op: (fillOp === undefined ? 0.13 : fillOp) * (op === undefined ? 1 : op) }) +
      rect(x, y, w, h2, { stroke: col, op: op }) +
      txt(x + w / 2, y + h2 / 2 + 4, label, { anchor: "middle", fill: col, size: 11, op: op });
  }

  /* ===================== FIGURE 1 — one answer vs one loop ================= */
  reg("fig-loop", {
    total: 12, rate: 0.62,
    captions: [
      "Reasoning RL. A prompt goes in and the policy is free to plan the entire output before it writes a single token.",
      "Two thousand tokens are emitted. Nothing outside the model is consulted while they are produced.",
      "An answer falls out the end of the stream.",
      "A verifier scores it. Note the world on the right: it is exactly as it was before the episode began.",
      "Agent RL starts from a state, not a prompt — and there is a world attached to it.",
      "The first action lands. The world mutates: a cell flips. The next observation is now a function of what the policy just did.",
      "State one is not something the policy chose. It was returned to it.",
      "Second action, second mutation. The branching factor of the future is set by the environment, not the decoder.",
      "Zoom in on the world. This object has state that outlives any single forward pass.",
      "Some transitions do not come back. The red cell is a write the policy cannot undo by sampling again.",
      "The rest of the trajectory could not have been planned at t = 0, because the states it visits did not exist yet.",
      "That is the whole difference. Everything else in this article is a consequence of it."
    ],
    render: function (t) {
      var cam0 = [0, 0, 900, 440], camZoom = [588, 198, 328, 182];
      var zin = H.segE(t, 8) - H.segE(t, 10);
      var vb = H.cam(cam0, camZoom, zin);
      var b = "";
      b += rect(0, 0, 900, 440, { fill: C.bg, stroke: "none", r: 0 });

      /* ---- reasoning lane ---- */
      var a0 = H.segE(t, 0);
      b += txt(40, 34, "REASONING RL", { fill: C.dim, size: 10, ls: 2, op: a0 });
      b += chip(40, 52, 96, 40, "prompt", C.blue, a0);
      /* token stream */
      var a1 = H.segE(t, 1);
      for (var i = 0; i < 46; i++) {
        var u = H.clamp(a1 * 52 - i, 0, 1);
        b += rect(152 + i * 8.6, 60 + (1 - u) * 6, 5.4, 24 * u, { fill: C.blue, stroke: "none", op: 0.55 * u, r: 1 });
      }
      var a2 = H.segE(t, 2);
      b += chip(556, 52, 92, 40, "answer", C.green, a2);
      var a3 = H.segE(t, 3);
      b += chip(668, 58, 60, 28, "r = 1", C.amber, a3);
      /* the untouched world */
      b += rect(760, 40, 104, 64, { stroke: C.faint, dash: "3 3", op: 0.5 + 0.5 * a3 });
      for (var gy = 0; gy < 3; gy++) for (var gx = 0; gx < 4; gx++) {
        b += rect(770 + gx * 22, 50 + gy * 16, 16, 11, { fill: C.faint, stroke: "none", op: 0.28, r: 1 });
      }
      b += txt(812, 118, "world: unchanged", { anchor: "middle", fill: C.faint, size: 9, op: a3 });

      b += '<path d="' + H.poly([[30, 150], [870, 150]]) + '" stroke="' + C.line + '" stroke-width="1" stroke-dasharray="2 5"/>';

      /* ---- agent lane ---- */
      var a4 = H.segE(t, 4);
      b += txt(40, 182, "AGENT RL", { fill: C.dim, size: 10, ls: 2, op: a4 });

      var nodeX = [40, 152, 264, 376, 488];
      var acts = ["search(\u201cq\u201d)", "click(3)", "write(f)", "submit()"];
      var stageOf = [4, 6, 7, 10, 10];        /* when node i appears */
      var actStage = [5, 7, 9, 10];

      /* world box */
      var wx = 610, wy = 218, ww = 250, wh = 130;
      b += rect(wx, wy, ww, wh, { stroke: C.line, fill: C.panel, op: a4 });
      b += txt(wx + 10, wy + 18, "ENVIRONMENT", { fill: C.dim, size: 9, ls: 1.6, op: a4 });
      var flips = [
        { s: 5, i: 3, col: C.green }, { s: 7, i: 9, col: C.blue },
        { s: 9, i: 6, col: C.red }, { s: 10, i: 13, col: C.amber }
      ];
      for (var k = 0; k < 20; k++) {
        var cx = wx + 14 + (k % 5) * 45, cy = wy + 30 + Math.floor(k / 5) * 24;
        var col = C.faint, op = 0.3;
        flips.forEach(function (f) {
          if (f.i === k) { var u = H.segE(t, f.s); col = u > 0.02 ? f.col : C.faint; op = 0.3 + 0.6 * u; }
        });
        b += rect(cx, cy, 38, 17, { fill: col, stroke: "none", op: op * a4, r: 2 });
      }
      b += txt(wx + ww / 2, wy + wh + 16, "state persists across steps", { anchor: "middle", fill: C.dim, size: 9, op: H.segE(t, 8) });

      /* trajectory track */
      for (var n = 0; n < 5; n++) {
        var av = H.segE(t, stageOf[n]);
        if (n === 3) av = H.segE(t, 10);
        if (n === 4) av = H.segE(t, 10) * 0.85;
        b += chip(nodeX[n], 240, 84, 38, "s" + n, n === 0 ? C.blue : C.purple, av);
        if (n < 4) {
          var au = H.segE(t, actStage[n]);
          b += H.arrow(nodeX[n] + 84, 259, nodeX[n] + 112, 259, C.amber, 1.4, au);
          b += txt(nodeX[n] + 98, 232, acts[n], { anchor: "middle", fill: C.amber, size: 9, op: au });
          /* action goes to the world, world returns the next state */
          if (n < 3) {
            var w1 = H.pulse(t, actStage[n]);
            b += '<path d="' + H.curve([[nodeX[n] + 42, 278], [nodeX[n] + 220, 330], [wx + 6, wy + 90]]) +
              '" stroke="' + C.amber + '" stroke-width="1.2" fill="none" opacity="' + (0.55 * w1) + '" stroke-dasharray="3 3"/>';
          }
        }
      }
      /* unplannable-future ribbon */
      var a10 = H.segE(t, 10);
      b += rect(370, 226, 218, 66, { stroke: C.red, dash: "4 4", op: 0.75 * a10 });
      b += txt(479, 308, "could not be planned at t = 0", { anchor: "middle", fill: C.red, size: 9.5, op: a10 });

      var a11 = H.segE(t, 11);
      b += rect(40, 360, 540, 54, { fill: C.panel, stroke: C.line, op: a11 });
      b += txt(58, 383, "s\u209C\u208A\u2081  ~  P( \u00b7 | s\u209C , a\u209C )", { fill: C.green, size: 14, op: a11 });
      b += txt(58, 402, "the next input is drawn by the world, not written by the policy", { fill: C.dim, size: 10, op: a11 });
      return svg(vb, b);
    }
  });

  /* ===================== FIGURE 2 — the observation problem ================ */
  reg("fig-pomdp", {
    total: 12, rate: 0.6,
    captions: [
      "Here is the true environment state: a page with sixty elements, of which the agent will see a fraction.",
      "Fog. The policy never receives s\u209C. It receives whatever the interface chose to render.",
      "The viewport is the observation function. One scroll position, one o\u209C.",
      "From one observation, several world states remain consistent. The belief is flat.",
      "Scroll. A second observation arrives — and it only makes sense relative to the first.",
      "The belief sharpens. This is inference, and it is happening inside the context window.",
      "Open a menu. Some information is only reachable by acting, which is why exploration and perception are the same problem here.",
      "Three observations in, two hypotheses are effectively dead.",
      "Zoom in. Nothing in this panel is a model weight — it is a posterior the policy has to carry in its activations.",
      "Then the world changes underneath. A cell flips that the agent cannot see. The belief is now confidently wrong.",
      "So the honest policy is not \u03c0(a | s). It is a function of the entire interaction history.",
      "Which means memory is not an add-on for agents. It is what makes the policy well-defined."
    ],
    render: function (t) {
      var vb = H.cam([0, 0, 900, 440], [458, 172, 424, 208], H.segE(t, 8) - H.segE(t, 9));
      var b = rect(0, 0, 900, 440, { fill: C.bg, stroke: "none", r: 0 });
      var rnd = H.rnd(7);
      var cells = [];
      for (var i = 0; i < 60; i++) cells.push(rnd());

      /* true state grid */
      b += txt(40, 26, "TRUE STATE  s\u209C", { fill: C.dim, size: 10, ls: 1.8 });
      var gx0 = 40, gy0 = 62, cw = 62, ch = 26;
      function cellAt(j) { return [gx0 + (j % 6) * (cw + 6), gy0 + Math.floor(j / 6) * (ch + 5)]; }
      function cellCol(j) {
        var fl = (j === 27 && H.segE(t, 9) > 0.3);
        return { c: fl ? C.red : (cells[j] > 0.72 ? C.blue : (cells[j] > 0.45 ? C.faint : C.line)), o: fl ? 0.8 : 0.44 };
      }
      for (var j = 0; j < 60; j++) {
        var p0 = cellAt(j), cc = cellCol(j);
        b += rect(p0[0], p0[1], cw, ch, { fill: cc.c, stroke: "none", r: 2, op: cc.o * (0.35 + 0.65 * H.segE(t, 0)) });
      }
      /* fog: the policy never receives s_t */
      var fog = H.segE(t, 1);
      var lift = H.segE(t, 9);   /* the reader is shown the change the agent cannot see */
      b += rect(gx0 - 6, gy0 - 6, 6 * (cw + 6), 10 * (ch + 5), { fill: C.bg, stroke: "none", op: 0.9 * fog * (1 - 0.5 * lift), r: 4 });
      if (lift > 0.02) {
        var pf = cellAt(27);
        b += rect(pf[0], pf[1], cw, ch, { fill: C.red, stroke: "none", r: 2, op: 0.85 * lift });
        b += rect(pf[0] - 3, pf[1] - 3, cw + 6, ch + 6, { stroke: C.red, sw: 1.4, op: lift, r: 3 });
        b += txt(pf[0] + cw + 12, pf[1] + ch / 2 + 4, "changed, and outside the viewport", { fill: C.red, size: 9.5, op: lift });
      }
      b += txt(gx0 + 3 * (cw + 6) - 6, gy0 + 5 * (ch + 5), "hidden from the policy",
        { anchor: "middle", fill: C.faint, size: 12, op: fog * (1 - H.segE(t, 2)) });
      /* viewport: the only band the policy can read, plus the cells it reveals */
      var vpStage = [2, 4, 6];
      var vpY = [gy0 - 4, gy0 + 3 * (ch + 5) - 4, gy0 + 6 * (ch + 5) - 4];
      var vp = vpY[0];
      for (var s = 1; s < 3; s++) vp = H.lerp(vp, vpY[s], H.segE(t, vpStage[s]));
      var vpOp = H.segE(t, 2);
      var vRow = Math.round((vp + 4 - gy0) / (ch + 5));
      for (var jj = vRow * 6; jj < Math.min(60, (vRow + 3) * 6); jj++) {
        var p1 = cellAt(jj), c1 = cellCol(jj);
        b += rect(p1[0], p1[1], cw, ch, { fill: c1.c, stroke: "none", r: 2, op: c1.o * vpOp });
      }
      b += rect(gx0 - 6, vp, 6 * (cw + 6), 3 * (ch + 5), { stroke: C.green, sw: 1.6, op: vpOp });
      b += txt(gx0 - 6, vp - 8, "viewport = O(o | s)", { fill: C.green, size: 9.5, op: vpOp });

      /* observation strip */
      b += txt(470, 34, "WHAT THE POLICY ACTUALLY GETS", { fill: C.dim, size: 10, ls: 1.8, op: H.segE(t, 2) });
      var obs = ["o\u2080  header, 6 links, \u201cnext\u201d", "o\u2081  table rows 12\u201317", "o\u2082  menu: filters, export"];
      for (var m = 0; m < 3; m++) {
        var oo = H.segE(t, [2, 4, 6][m]);
        b += rect(470, 46 + m * 34, 390, 26, { stroke: C.green, fill: C.green, op: 0.09 * oo, r: 2 });
        b += rect(470, 46 + m * 34, 390, 26, { stroke: C.green, op: 0.7 * oo });
        b += txt(482, 63 + m * 34, obs[m], { fill: C.green, size: 10, op: oo });
      }

      /* belief bars */
      b += txt(470, 182, "BELIEF OVER WORLD STATES", { fill: C.dim, size: 10, ls: 1.8, op: H.segE(t, 3) });
      var hyp = ["h\u2081 list view, page 2", "h\u2082 list view, filtered", "h\u2083 detail view", "h\u2084 stale cache"];
      var bel = [
        [.25, .25, .25, .25],
        [.40, .30, .20, .10],
        [.52, .34, .09, .05],
        [.61, .33, .04, .02]
      ];
      var bi = H.segE(t, 5) + H.segE(t, 7) + H.segE(t, 9);
      var lo = Math.min(3, Math.floor(bi)), hi = Math.min(3, lo + 1), fr = bi - lo;
      for (var q = 0; q < 4; q++) {
        var v = H.lerp(bel[lo][q], bel[hi][q], fr);
        var opb = H.segE(t, 3);
        b += txt(470, 208 + q * 30, hyp[q], { fill: C.dim, size: 9.5, op: opb });
        b += rect(470, 214 + q * 30, 300, 10, { fill: C.grid, stroke: "none", op: opb, r: 2 });
        b += rect(470, 214 + q * 30, 300 * v, 10, { fill: q < 2 ? C.purple : C.faint, stroke: "none", op: opb, r: 2 });
        b += txt(786, 223 + q * 30, H.fmt(v, 2), { fill: C.dim, size: 9.5, op: opb });
      }
      var stale = H.segE(t, 9);
      b += txt(470, 348, "world changed \u2014 belief is now confidently wrong", { fill: C.red, size: 10, op: stale });

      var a10 = H.segE(t, 10);
      b += rect(40, 348, 400, 62, { fill: C.panel, stroke: C.line, op: a10 });
      b += txt(58, 374, "\u03c0\u03b8( a\u209C | o\u2080\u2026o\u209C , a\u2080\u2026a\u209C\u208B\u2081 )", { fill: C.green, size: 14, op: a10 });
      b += txt(58, 396, "history-dependent by necessity, not by design choice", { fill: C.dim, size: 10, op: H.segE(t, 11) });
      return svg(vb, b);
    }
  });

  /* ===================== FIGURE 3 — action granularity =================== */
  reg("fig-granularity", {
    total: 6, rate: 0.4,
    autoplay: true,
    captions: [
      "Level 1 — raw input events. The action space is tiny and perfectly general, and a single task costs thousands of decisions.",
      "Level 2 — keystrokes and clicks on coordinates. Still generic, still an enormous horizon.",
      "Level 3 — semantic UI operations: click the element with this label, type into this field.",
      "Level 4 — API and tool calls. One decision now moves the world a long way, but the arguments have to be exactly right.",
      "Level 5 — whole workflows. Two decisions per task, and almost all the difficulty has moved inside a single action.",
      "Both terms are real. Credit assignment gets harder as the horizon grows; argument construction gets harder as actions get fatter. The interface is a design variable, and it has an interior optimum."
    ],
    params: [{ key: "N", label: "atomic operations in the task", min: 200, max: 6000, step: 100, value: 1800, fmt: function (v) { return v; } }],
    render: function (t, p) {
      var b = rect(0, 0, 900, 440, { fill: C.bg, stroke: "none", r: 0 });
      var N = p.N;
      var levels = [
        { name: "raw events", ex: "move_mouse(413, 271)", g: 1, A: 4 },
        { name: "keystrokes", ex: "keypress(\"a\") ; click()", g: 4, A: 120 },
        { name: "UI operations", ex: "click(\"Submit order\")", g: 20, A: 900 },
        { name: "tool / API calls", ex: "send_email(to, subj, body)", g: 160, A: 12000 },
        { name: "workflows", ex: "process_refund(order_id)", g: 900, A: 400000 }
      ];
      /* Stage k displays level k. The change into level k is animated over the
         first part of stage k, so a settled frame always matches its caption. */
      var idx = Math.min(4, Math.floor(t)), prev = Math.max(0, idx - 1);
      var fr = H.smooth(H.clamp((t - Math.floor(t)) / 0.4, 0, 1));
      if (t >= 5) { idx = 4; prev = 4; fr = 1; }
      var g = Math.exp(H.lerp(Math.log(levels[prev].g), Math.log(levels[idx].g), fr));
      var Asz = Math.exp(H.lerp(Math.log(levels[prev].A), Math.log(levels[idx].A), fr));
      var levPos = H.lerp(prev, idx, fr);
      var Hh = Math.max(2, N / g);

      b += txt(40, 34, "ACTION GRANULARITY", { fill: C.dim, size: 10, ls: 1.8 });
      /* ladder */
      for (var i = 0; i < 5; i++) {
        var on = (Math.abs(i - levPos) < 0.55) ? 1 : 0.3;
        var col = i <= 1 ? C.blue : (i <= 2 ? C.teal : (i === 3 ? C.green : C.amber));
        b += rect(40, 54 + i * 46, 250, 36, { stroke: col, fill: col, op: 0.1 * on, r: 3 });
        b += rect(40, 54 + i * 46, 250, 36, { stroke: col, op: on });
        b += txt(54, 70 + i * 46, "L" + (i + 1) + "  " + levels[i].name, { fill: col, size: 11, op: on });
        b += txt(54, 84 + i * 46, levels[i].ex, { fill: C.dim, size: 9, op: on });
      }

      /* horizon strip */
      b += txt(324, 66, "HORIZON  H = N / g", { fill: C.dim, size: 10, ls: 1.6 });
      b += txt(324, 92, String(Math.round(Hh)) + "  decisions", { fill: C.green, size: 22 });
      var shown = Math.min(90, Math.round(Hh));
      for (var k = 0; k < shown; k++) {
        b += rect(324 + (k % 30) * 17, 104 + Math.floor(k / 30) * 12, 12, 7, { fill: C.green, stroke: "none", op: 0.55, r: 1 });
      }
      if (Hh > 90) b += txt(324 + 30 * 17 + 6, 121, "\u2026", { fill: C.green, size: 14 });

      b += txt(324, 168, "ACTION SPACE  |\ud835\udc9c|", { fill: C.dim, size: 10, ls: 1.6 });
      b += txt(324, 194, Asz >= 1000 ? (Math.round(Asz / 1000) + "k distinct actions") : (Math.round(Asz) + " distinct actions"),
        { fill: C.amber, size: 16 });
      var lw = 300 * H.clamp(Math.log(Asz) / Math.log(400000), 0, 1);
      b += rect(324, 204, 300, 9, { fill: C.grid, stroke: "none", r: 2 });
      b += rect(324, 204, lw, 9, { fill: C.amber, stroke: "none", r: 2 });

      /* the two costs */
      var cred = Math.log(Hh) / Math.log(2);                 /* credit path length, in halvings */
      var argc = Math.log(Asz) / Math.log(2) / 3;            /* argument specification cost */
      b += txt(324, 250, "credit-assignment cost  \u221d  log H", { fill: C.blue, size: 10 });
      b += rect(324, 258, 300, 9, { fill: C.grid, stroke: "none", r: 2 });
      b += rect(324, 258, 300 * H.clamp(cred / 12, 0, 1), 9, { fill: C.blue, stroke: "none", r: 2 });
      b += txt(324, 292, "per-action specification cost  \u221d  log |\ud835\udc9c|", { fill: C.pink, size: 10 });
      b += rect(324, 300, 300, 9, { fill: C.grid, stroke: "none", r: 2 });
      b += rect(324, 300, 300 * H.clamp(argc / 6.5, 0, 1), 9, { fill: C.pink, stroke: "none", r: 2 });

      /* the U curve */
      var cx0 = 660, cy0 = 60, cwd = 200, cht = 250;
      b += rect(cx0, cy0, cwd, cht, { stroke: C.line, fill: C.panel });
      b += txt(cx0 + 10, cy0 + 18, "TOTAL DIFFICULTY", { fill: C.dim, size: 9, ls: 1.4 });
      var pts = [], pts0 = [], pts1 = [], pts2 = [];
      for (var u = 0; u <= 40; u++) {
        var lv = 1 + u * 0.1;
        var gg = Math.exp(H.lerp(0, Math.log(900), (lv - 1) / 4));
        var HH = Math.max(2, N / gg);
        var AA = Math.exp(H.lerp(Math.log(4), Math.log(400000), (lv - 1) / 4));
        /* Each cost is drawn linear in its log (dashed) and mildly convex
           (solid). Schematic shapes, not measurements. */
        var c1 = Math.log(HH) / Math.log(2) / 12;
        var c2 = Math.log(AA) / Math.log(2) / 19;
        var xx = cx0 + 18 + (u / 40) * (cwd - 34);
        pts1.push([xx, cy0 + cht - 34 - c1 * (cht - 78)]);
        pts2.push([xx, cy0 + cht - 34 - c2 * (cht - 78)]);
        pts0.push([xx, cy0 + cht - 34 - (c1 + c2) * 0.5 * (cht - 78)]);
        pts.push([xx, cy0 + cht - 34 - (Math.pow(c1, 1.7) + Math.pow(c2, 1.7)) * 1.5 * (cht - 78)]);
      }
      b += '<path d="' + H.curve(pts1) + '" stroke="' + C.blue + '" stroke-width="1.2" fill="none" opacity="0.55" stroke-dasharray="3 3"/>';
      b += '<path d="' + H.curve(pts2) + '" stroke="' + C.pink + '" stroke-width="1.2" fill="none" opacity="0.55" stroke-dasharray="3 3"/>';
      b += '<path d="' + H.curve(pts0) + '" stroke="' + C.faint + '" stroke-width="1.3" fill="none" opacity="0.7" stroke-dasharray="5 4"/>';
      b += txt(cx0 + cwd - 16, pts0[20][1] - 9, "linear sum: no optimum", { fill: C.faint, size: 8.5, anchor: "end" });
      b += '<path d="' + H.curve(pts) + '" stroke="' + C.green + '" stroke-width="2" fill="none"/>';
      b += txt(cx0 + 20, pts[20][1] + 24, "convex sum: an optimum", { fill: C.green, size: 8.5 });
      var mk = pts[Math.round(H.clamp(levPos / 4, 0, 1) * 40)];
      b += '<circle cx="' + H.fmt(mk[0], 1) + '" cy="' + H.fmt(mk[1], 1) + '" r="4.5" fill="' + C.amber + '"/>';
      b += txt(cx0 + 18, cy0 + cht - 14, "fine", { fill: C.faint, size: 9 });
      b += txt(cx0 + cwd - 18, cy0 + cht - 14, "coarse", { fill: C.faint, size: 9, anchor: "end" });

      var sum = H.segE(t, 5);
      b += rect(40, 336, 820, 76, { fill: C.panel, stroke: C.line, op: sum });
      b += txt(58, 362, "difficulty(g)  \u2248  \u03b1 \u00b7 log(N / g)   +   \u03b2 \u00b7 log |\ud835\udc9c(g)|", { fill: C.green, size: 14, op: sum });
      b += txt(58, 386, "The first term falls as actions get coarser and the second rises, but log(N/g) + log|\ud835\udc9c(g)| is nearly constant,", { fill: C.dim, size: 10, op: sum });
      b += txt(58, 402, "so a purely linear cost model predicts no sweet spot at all. That practitioners reliably find one says a term is convex.", { fill: C.dim, size: 10, op: sum });
      return svg(vb0(), b);
      function vb0() { return "0 0 900 440"; }
    }
  });

  /* ===================== FIGURE 4 — compounding error ==================== */
  reg("fig-compounding", {
    total: 12, rate: 0.62,
    captions: [
      "The expert ribbon: the states a demonstrator actually visits, and the only states behavioural cloning ever trains on.",
      "Training pairs are sampled from this ribbon. Off it, the policy has no supervision at all.",
      "Roll the cloned policy out. For a while it tracks the demonstration closely.",
      "At each step there is a small chance \u03b5 of choosing a different action.",
      "Here it fires. Not a catastrophic action — a slightly wrong one.",
      "The next state is now off the ribbon. And nothing in the training set describes it.",
      "Errors on unfamiliar states are larger, which pushes the policy further out.",
      "Zoom in on the branch point. This single deviation is what the rest of the episode is paying for.",
      "The cost is not \u03b5 per step. Once you leave, you keep leaving, so the deviation costs the remaining horizon.",
      "Summing over the step at which the first deviation happens gives a quadratic in T.",
      "Interactive training \u2014 collecting states from the learner's own distribution \u2014 removes the extra factor of T.",
      "That gap between \u03b5T\u00b2 and \u03b5T is the entire argument for training agents by interaction rather than by imitation."
    ],
    params: [{ key: "eps", label: "per-step error \u03b5", min: 0.002, max: 0.09, step: 0.002, value: 0.03, fmt: function (v) { return H.fmt(v, 3); } }],
    render: function (t, p) {
      var vb = H.cam([0, 0, 900, 440], [230, 120, 340, 166], H.segE(t, 7) - H.segE(t, 8));
      var b = rect(0, 0, 900, 440, { fill: C.bg, stroke: "none", r: 0 });
      var eps = p.eps;

      /* expert ribbon */
      var rib = [];
      for (var i = 0; i <= 60; i++) {
        var x = 40 + i * 8.2;
        rib.push([x, 250 + Math.sin(i * 0.16) * 34]);
      }
      var a0 = H.segE(t, 0);
      b += '<path d="' + H.curve(rib) + '" stroke="' + C.blue + '" stroke-width="16" fill="none" opacity="' + (0.13 * a0) + '" stroke-linecap="round"/>';
      b += '<path d="' + H.curve(rib) + '" stroke="' + C.blue + '" stroke-width="1.8" fill="none" opacity="' + a0 + '"/>';
      b += txt(40, 214, "EXPERT STATE DISTRIBUTION  d\u03c0*", { fill: C.blue, size: 10, ls: 1.6, op: a0 });

      var a1 = H.segE(t, 1);
      for (var j = 0; j <= 60; j += 4) {
        b += '<circle cx="' + H.fmt(rib[j][0], 1) + '" cy="' + H.fmt(rib[j][1], 1) + '" r="2.6" fill="' + C.blue + '" opacity="' + (0.8 * a1) + '"/>';
      }

      /* learner path */
      var branch = 26;
      var prog = H.clamp((H.segE(t, 2) * 0.35 + H.segE(t, 3) * 0.2 + H.segE(t, 4) * 0.12 + H.segE(t, 5) * 0.15 + H.segE(t, 6) * 0.18), 0, 1);
      var upTo = Math.round(prog * 60);
      var lp = [];
      for (var q = 0; q <= upTo; q++) {
        var base = rib[q];
        var off = q <= branch ? 0 : Math.min(94, Math.pow(q - branch, 1.45) * 1.05);
        lp.push([base[0], base[1] + off]);
      }
      if (lp.length > 1) {
        b += '<path d="' + H.curve(lp) + '" stroke="' + C.amber + '" stroke-width="2" fill="none"/>';
        var tip = lp[lp.length - 1];
        b += '<circle cx="' + H.fmt(tip[0], 1) + '" cy="' + H.fmt(tip[1], 1) + '" r="4.5" fill="' + C.amber + '"/>';
      }
      var a4 = H.segE(t, 4);
      if (a4 > 0.02) {
        var bp = rib[branch];
        b += '<circle cx="' + H.fmt(bp[0], 1) + '" cy="' + H.fmt(bp[1], 1) + '" r="' + (5 + 5 * H.pulse(t, 4)) + '" fill="none" stroke="' + C.red + '" stroke-width="1.6" opacity="' + a4 + '"/>';
        b += txt(bp[0] + 10, bp[1] - 12, "deviation, prob \u03b5", { fill: C.red, size: 9.5, op: a4 });
      }
      var a5 = H.segE(t, 5);
      b += txt(40, 196, "no training data describes these states", { fill: C.red, size: 10, op: a5 });

      /* cost bars after deviation */
      var a8 = H.segE(t, 8);
      for (var c = branch; c <= 60; c += 3) {
        var hgt = 3 + (c - branch) * 0.9;
        b += rect(rib[c][0] - 2, 386 - hgt, 4, hgt, { fill: C.red, stroke: "none", op: 0.6 * a8, r: 1 });
      }
      b += txt(40, 400, "per-step cost after leaving the ribbon", { fill: C.red, size: 9.5, op: a8 });

      /* the two laws plot */
      var a9 = H.segE(t, 9), a10 = H.segE(t, 10);
      var px = 578, py = 46, pw = 288, ph = 176;
      b += rect(px, py, pw, ph, { stroke: C.line, fill: C.panel, op: Math.max(a9, a10) });
      b += txt(px + 10, py + 18, "REGRET vs HORIZON", { fill: C.dim, size: 9, ls: 1.4, op: Math.max(a9, a10) });
      var q1 = [], l1 = [];
      for (var T = 0; T <= 60; T++) {
        var xx = px + 22 + (T / 60) * (pw - 40);
        /* both curves share one absolute scale, so the gap is the message */
        var scale = eps * 3600;
        q1.push([xx, py + ph - 22 - H.clamp(eps * T * T / scale, 0, 1) * (ph - 46)]);
        l1.push([xx, py + ph - 22 - H.clamp(eps * T / scale, 0, 1) * (ph - 46)]);
      }
      b += '<path d="' + H.curve(q1) + '" stroke="' + C.red + '" stroke-width="2" fill="none" opacity="' + a9 + '"/>';
      b += '<path d="' + H.curve(l1) + '" stroke="' + C.green + '" stroke-width="2" fill="none" opacity="' + a10 + '"/>';
      b += txt(px + 26, py + 40, "cloning:  O(\u03b5 T\u00b2)", { fill: C.red, size: 10.5, op: a9 });
      b += txt(px + 26, py + 76, "interaction:  O(\u03b5 T)", { fill: C.green, size: 10.5, op: a10 });
      b += txt(px + pw - 14, py + ph - 8, "T", { fill: C.faint, size: 9, anchor: "end" });

      var a11 = H.segE(t, 11);
      b += rect(578, 240, 288, 168, { fill: C.panel, stroke: C.line, op: a11 });
      b += txt(596, 266, "with \u03b5 = " + H.fmt(eps, 3) + " and T = 50:", { fill: C.dim, size: 10, op: a11 });
      b += txt(596, 292, "cloning regret  \u2248  " + H.fmt(eps * 2500, 1), { fill: C.red, size: 13, op: a11 });
      b += txt(596, 314, "interactive regret  \u2248  " + H.fmt(eps * 50, 1), { fill: C.green, size: 13, op: a11 });
      b += txt(596, 344, "ratio = T = 50\u00d7", { fill: C.amber, size: 12, op: a11 });
      b += txt(596, 372, "The horizon is not a detail. It is the", { fill: C.dim, size: 9.5, op: a11 });
      b += txt(596, 386, "multiplier on every mistake you did not", { fill: C.dim, size: 9.5, op: a11 });
      b += txt(596, 400, "train the policy to recover from.", { fill: C.dim, size: 9.5, op: a11 });
      return svg(vb, b);
    }
  });

  /* ===================== FIGURE 5 — environments as the dataset =========== */
  reg("fig-envscale", {
    total: 12, rate: 0.6,
    captions: [
      "reset() — the environment produces an initial state and a task. This is where a training example used to come from.",
      "observe() returns what the policy is allowed to see.",
      "The policy proposes an action.",
      "step(a) applies it. The environment's internal state changes; this is the part a static dataset cannot do.",
      "reward() scores the transition, or defers until the end.",
      "done tells the loop when to stop. Six functions, and you have a data generator.",
      "The whole loop lit up. Everything the policy will ever learn from is produced here.",
      "So the scaling question changes shape. Not how many documents — how many worlds.",
      "Ten environments. The agent gets very good at ten environments.",
      "A hundred. The in-domain curve barely moves; the held-out curve moves a lot.",
      "Five hundred and beyond, gains keep coming — this is the trend reported by recent synthetic-environment pipelines.",
      "Curating worlds is the 2026 analogue of curating a corpus, and it is a software-engineering problem as much as a research one."
    ],
    params: [{ key: "envs", label: "training environments", min: 1, max: 1000, step: 1, value: 100, fmt: function (v) { return Math.round(v); } }],
    render: function (t, p) {
      var b = rect(0, 0, 900, 440, { fill: C.bg, stroke: "none", r: 0 });
      /* the loop */
      var nodes = [
        { x: 60, y: 60, w: 120, h: 40, l: "reset()", c: C.blue },
        { x: 220, y: 60, w: 120, h: 40, l: "observe()", c: C.teal },
        { x: 220, y: 140, w: 120, h: 40, l: "\u03c0\u03b8(a | o)", c: C.green },
        { x: 60, y: 140, w: 120, h: 40, l: "step(a)", c: C.amber },
        { x: 60, y: 220, w: 120, h: 40, l: "reward()", c: C.pink },
        { x: 220, y: 220, w: 120, h: 40, l: "done", c: C.purple }
      ];
      nodes.forEach(function (n, i) {
        var op = H.segE(t, Math.min(i, 5));
        if (t >= 6) op = 1;
        b += chip(n.x, n.y, n.w, n.h, n.l, n.c, op);
      });
      var links = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]];
      links.forEach(function (e, i) {
        var A = nodes[e[0]], B = nodes[e[1]], op = H.segE(t, i + 1);
        var x1 = A.x + A.w / 2, y1 = A.y + A.h / 2, x2 = B.x + B.w / 2, y2 = B.y + B.h / 2;
        if (Math.abs(y1 - y2) < 2) { x1 = A.x + A.w * (x2 > x1 ? 1 : 0); x2 = B.x + B.w * (x2 > x1 ? 0 : 1); }
        else { y1 = A.y + A.h * (y2 > y1 ? 1 : 0); y2 = B.y + B.h * (y2 > y1 ? 0 : 1); }
        b += H.arrow(x1, y1, x2, y2, C.dim, 1.3, 0.75 * op);
      });
      var a6 = H.segE(t, 6);
      b += '<path d="' + H.poly([[340, 240], [382, 240], [382, 80], [340, 80]]) + '" stroke="' + C.purple +
        '" stroke-width="1.3" fill="none" opacity="' + (0.8 * a6) + '" stroke-dasharray="4 3"/>';
      b += H.arrow(382, 82, 344, 80, C.purple, 1.3, 0.8 * a6);
      b += rect(44, 44, 356, 232, { stroke: C.green, dash: "4 4", op: 0.5 * a6 });
      b += txt(222, 296, "one environment = one data generator", { anchor: "middle", fill: C.green, size: 10.5, op: a6 });

      /* environment tiles */
      var a7 = H.segE(t, 7);
      b += txt(450, 34, "ENVIRONMENT COUNT", { fill: C.dim, size: 10, ls: 1.8, op: a7 });
      var shownEnvs = Math.round(H.lerp(1, p.envs, H.clamp(H.segE(t, 8) + H.segE(t, 9) + H.segE(t, 10), 0, 1)));
      var tiles = Math.min(120, Math.round(shownEnvs / Math.max(1, p.envs / 120)));
      if (p.envs <= 120) tiles = Math.min(120, shownEnvs);
      for (var k = 0; k < tiles; k++) {
        var tx = 450 + (k % 24) * 17, ty = 46 + Math.floor(k / 24) * 15;
        b += rect(tx, ty, 13, 11, { fill: C.teal, stroke: "none", op: (0.18 + 0.42 * ((k * 37 % 11) / 11)) * a7, r: 1 });
      }
      b += txt(450, 148, String(Math.round(p.envs)) + " environments", { fill: C.teal, size: 12, op: a7 });

      /* scaling curve */
      var cx = 450, cy = 168, cw2 = 410, chh = 190;
      b += rect(cx, cy, cw2, chh, { stroke: C.line, fill: C.panel, op: a7 });
      b += txt(cx + 12, cy + 20, "SUCCESS RATE", { fill: C.dim, size: 9, ls: 1.4, op: a7 });
      b += txt(cx + cw2 - 12, cy + chh - 8, "environments (log)", { fill: C.faint, size: 9, anchor: "end", op: a7 });
      function yv(v) { return cy + chh - 30 - v * (chh - 56); }
      function xv(n) { return cx + 34 + (Math.log(n) / Math.log(1000)) * (cw2 - 60); }
      var inD = [], outD = [];
      for (var n = 1; n <= 1000; n *= 1.12) {
        var ln = Math.log(n) / Math.log(1000);
        inD.push([xv(n), yv(0.30 + 0.55 * Math.pow(ln, 0.35))]);
        outD.push([xv(n), yv(0.06 + 0.62 * Math.pow(ln, 0.8))]);
      }
      var reveal = H.clamp(H.segE(t, 8) * 0.4 + H.segE(t, 9) * 0.3 + H.segE(t, 10) * 0.3, 0, 1);
      var nIn = Math.max(2, Math.round(inD.length * reveal));
      b += '<path d="' + H.curve(inD.slice(0, nIn)) + '" stroke="' + C.faint + '" stroke-width="1.8" fill="none" stroke-dasharray="4 3" opacity="' + reveal + '"/>';
      b += '<path d="' + H.curve(outD.slice(0, nIn)) + '" stroke="' + C.green + '" stroke-width="2.2" fill="none" opacity="' + reveal + '"/>';
      b += txt(cx + 46, cy + 44, "in-domain", { fill: C.faint, size: 9.5, op: reveal });
      b += txt(cx + 46, cy + 60, "held-out environments", { fill: C.green, size: 9.5, op: reveal });
      var mx = xv(Math.max(1, p.envs));
      b += '<path d="' + H.poly([[mx, cy + 26], [mx, cy + chh - 30]]) + '" stroke="' + C.amber + '" stroke-width="1" stroke-dasharray="3 3" opacity="' + reveal + '"/>';
      ["1", "10", "100", "1000"].forEach(function (lab) {
        b += txt(xv(parseFloat(lab)), cy + chh - 14, lab, { fill: C.faint, size: 8.5, anchor: "middle", op: a7 });
      });
      var a11 = H.segE(t, 11);
      b += rect(44, 316, 356, 96, { fill: C.panel, stroke: C.line, op: a11 });
      b += txt(62, 342, "pretraining   \u2192  curate documents", { fill: C.dim, size: 10.5, op: a11 });
      b += txt(62, 362, "SFT          \u2192  curate demonstrations", { fill: C.dim, size: 10.5, op: a11 });
      b += txt(62, 384, "agent RL     \u2192  curate worlds", { fill: C.green, size: 12, op: a11 });
      return svg("0 0 900 440", b);
    }
  });
})();
