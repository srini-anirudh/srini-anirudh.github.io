/* Figures 1-3 */
(function () {
  "use strict";
  var mk = window.__mkReel, G = window.__HG, C = G.C;

  /* ============ F1 : anatomy of the machine ============ */
  var BOX = {
    user:   { x: 330, y: 40,  w: 200, h: 34, t: "USER / CLI / IDE",        c: C.dim,    s: 3 },
    ctxb:   { x: 270, y: 96,  w: 320, h: 56, t: "CONTEXT BUILDER",         c: C.blue,   s: 3 },
    model:  { x: 320, y: 176, w: 220, h: 54, t: "MODEL",                   c: C.green,  s: 0 },
    policy: { x: 270, y: 252, w: 320, h: 56, t: "POLICY LAYER",            c: C.amber,  s: 4 },
    router: { x: 270, y: 332, w: 320, h: 44, t: "TOOL ROUTER",             c: C.purple, s: 5 },
    sand:   { x: 250, y: 400, w: 360, h: 58, t: "SANDBOX / RUNTIME",       c: C.red,    s: 6 },
    env:    { x: 230, y: 482, w: 400, h: 52, t: "ENVIRONMENT",             c: C.teal,   s: 8 }
  };
  var SUB = {
    ctxb:   "instructions \u00b7 tools \u00b7 repo map \u00b7 history",
    model:  "tokens in, tokens out",
    policy: "validate \u00b7 permissions \u00b7 guardrails \u00b7 budgets",
    router: "filesystem \u00b7 shell \u00b7 MCP \u00b7 subagents",
    sand:   "process isolation \u00b7 filesystem bounds \u00b7 egress",
    env:    "repo \u00b7 git \u00b7 tests \u00b7 processes \u00b7 network"
  };
  var RAIL = [
    { t: "EVENT LOG", s: 7 }, { t: "GIT CHECKPOINTS", s: 7 }, { t: "VERIFIERS", s: 7 },
    { t: "SKILLS & MEMORY", s: 7 }, { t: "TRACING", s: 7 }, { t: "PROMPT CACHE", s: 7 }
  ];
  var CANT = ["open a file", "run pytest", "see that it failed", "remember step 3", "ask permission", "stop itself"];

  mk({
    id: "fig-anatomy", w: 1000, h: 620, dur: 2.4,
    aria: "A layered anatomy diagram. A model box is progressively surrounded by a context builder, policy layer, tool router, sandbox and environment, with an observation return path and six side systems.",
    stages: [
      { label: "A distribution", cam: [430, 200, 1.75], caption: "A language model is a conditional distribution over tokens. Nothing more." },
      { label: "What it cannot do", cam: [430, 220, 1.55], caption: "None of the things a coding agent must do are operations on token probabilities." },
      { label: "Close the loop", cam: [460, 220, 1.35], caption: "Wrap it in a loop: the output of one call becomes part of the input to the next." },
      { label: "Context builder", cam: [430, 180, 1.3], caption: "Something must decide what the model sees before every single call." },
      { label: "Policy layer", cam: [430, 260, 1.28], caption: "Something must decide whether the requested action is allowed to happen at all." },
      { label: "Tool router", cam: [430, 320, 1.25], caption: "Something must map an abstract action onto a concrete implementation." },
      { label: "Sandbox", cam: [430, 380, 1.2], caption: "Something must bound what that implementation can reach." },
      { label: "Side systems", cam: [540, 300, 1.08], caption: "And something must remember, checkpoint, verify, trace, and pay for all of it." },
      { label: "Environment", cam: [450, 390, 1.12], caption: "Only at the very bottom does the world itself appear." },
      { label: "Return path", cam: [430, 300, 1.06], caption: "The return path is not free: raw output is normalised, truncated and redacted before it becomes context." },
      { label: "The whole machine", cam: [500, 300, 1.0], caption: "Agent = policy + harness + environment interface. The model is one box in eleven." },
      { label: "Proportion", cam: [500, 300, 1.0], caption: "By line count and by design decisions, the model is the smallest part of a coding agent." }
    ],
    draw: function (ctx, si, t) {
      function av(k) { return si > k ? 1 : si === k ? G.easeOut(t) : 0; }
      function drawBox(key) {
        var b = BOX[key], a = av(b.s);
        if (a <= 0.001) return;
        ctx.save(); G.alpha(ctx, a);
        var glow = (si === b.s) ? 0.5 + 0.5 * Math.sin(t * Math.PI) : 0;
        G.box(ctx, b.x, b.y, b.w, b.h, { fill: C.panel, stroke: b.c, lw: 1.4 + 1.8 * glow, r: 5 });
        G.txt(ctx, b.t, b.x + b.w / 2, b.y + (SUB[key] ? 19 : b.h / 2), { size: 13, weight: 600, color: b.c, align: "center" });
        if (SUB[key]) G.txt(ctx, SUB[key], b.x + b.w / 2, b.y + b.h - 15, { size: 10.5, color: C.faint, align: "center" });
        ctx.restore();
      }
      /* spine arrows */
      var chain = [["user", "ctxb", 3], ["ctxb", "model", 3], ["model", "policy", 4], ["policy", "router", 5], ["router", "sand", 6], ["sand", "env", 8]];
      chain.forEach(function (c) {
        var a = av(c[2]); if (a <= 0.001) return;
        var A = BOX[c[0]], B2 = BOX[c[1]];
        ctx.save(); G.alpha(ctx, a * 0.9);
        G.arrow(ctx, A.x + A.w / 2, A.y + A.h, B2.x + B2.w / 2, B2.y - 3, { color: C.faint });
        ctx.restore();
      });
      /* labels on the spine */
      if (av(4) > 0) {
        ctx.save(); G.alpha(ctx, av(4));
        G.txt(ctx, "proposed action", BOX.model.x + BOX.model.w / 2 + 10, 242, { size: 10, color: C.faint });
        ctx.restore();
      }
      Object.keys(BOX).forEach(drawBox);

      /* stage 0-1 : model alone + what it cannot do */
      if (si <= 1) {
        ctx.save(); G.alpha(ctx, si === 0 ? G.easeOut(t) : 1);
        G.txt(ctx, "x  \u2192   p(y | x)   \u2192  y", 430, 150, { size: 14, color: C.green, align: "center" });
        ctx.restore();
      }
      if (si === 1) {
        var n = Math.floor(G.easeOut(t) * CANT.length * 1.15);
        for (var i = 0; i < CANT.length; i++) {
          if (i >= n) continue;
          var yy = 264 + i * 26;
          ctx.save(); G.alpha(ctx, 1);
          G.cross(ctx, 322, yy, C.red, 1);
          G.txt(ctx, CANT[i], 340, yy, { size: 13, color: C.dim });
          ctx.restore();
        }
      }
      /* loop arrow at stage 2 */
      if (si >= 2) {
        var la = av(2);
        ctx.save(); G.alpha(ctx, la * 0.85);
        ctx.beginPath();
        ctx.moveTo(540, 203); ctx.bezierCurveTo(636, 203, 636, 124, 604, 124);
        ctx.strokeStyle = C.green; ctx.lineWidth = 1.6; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
        G.arrow(ctx, 610, 124, 592, 124, { color: C.green, head: 5 });
        if (si === 2) G.txt(ctx, "output \u2192 next input", 646, 164, { size: 10.5, color: C.green });
        ctx.restore();
      }
      /* observation return path */
      if (si >= 9) {
        var ra = av(9);
        ctx.save(); G.alpha(ctx, ra);
        G.line(ctx, 250, 430, 175, 430, { color: C.blue, lw: 1.6 });
        G.line(ctx, 175, 430, 175, 322, { color: C.blue, lw: 1.6 });
        G.line(ctx, 175, 260, 175, 124, { color: C.blue, lw: 1.6 });
        G.line(ctx, 175, 124, 268, 124, { color: C.blue, lw: 1.6 });
        G.arrow(ctx, 250, 124, 268, 124, { color: C.blue, head: 6 });
        G.box(ctx, 96, 262, 158, 56, { fill: "#111a20", stroke: C.blue, r: 4 });
        G.txt(ctx, "OBSERVATION", 175, 279, { size: 10.5, weight: 600, color: C.blue, align: "center" });
        G.txt(ctx, "normalise \u00b7 truncate", 175, 295, { size: 9.5, color: C.faint, align: "center" });
        G.txt(ctx, "redact \u00b7 inspect", 175, 307, { size: 9.5, color: C.faint, align: "center" });
        ctx.restore();
      }
      /* right rail */
      if (si >= 7) {
        var a7 = av(7);
        for (var r = 0; r < RAIL.length; r++) {
          var rp = G.clamp(a7 * RAIL.length - r, 0, 1);
          if (rp <= 0) continue;
          ctx.save(); G.alpha(ctx, rp);
          var ry = 96 + r * 50;
          G.box(ctx, 690, ry, 230, 38, { fill: "#12181e", stroke: "#33414c", r: 3 });
          G.txt(ctx, RAIL[r].t, 705, ry + 19, { size: 11, weight: 600, color: C.dim });
          G.line(ctx, 610, ry + 19, 688, ry + 19, { color: "#243039", dash: [3, 4] });
          ctx.restore();
        }
        ctx.save(); G.alpha(ctx, a7);
        G.txt(ctx, "SIDE SYSTEMS", 690, 76, { size: 10, weight: 600, color: C.faint });
        ctx.restore();
      }
      /* stage 10-11 framing */
      if (si >= 10) {
        ctx.save(); G.alpha(ctx, av(10));
        G.box(ctx, 214, 82, 720, 400, { stroke: "#3d4d59", lw: 1.2, r: 8 });
        G.txt(ctx, "AGENT HARNESS", 224, 74, { size: 11, weight: 600, color: "#6d8091" });
        ctx.restore();
      }
      if (si === 11) {
        ctx.save(); G.alpha(ctx, G.easeOut(t));
        var bx = 214, bw = 720, by = 544;
        G.box(ctx, bx, by, bw, 22, { fill: "#121920", stroke: "#2b353e", r: 3 });
        G.box(ctx, bx, by, bw * 0.09, 22, { fill: C.green, r: 3 });
        G.txt(ctx, "model", bx + 6, by + 11, { size: 10, weight: 600, color: "#06120e" });
        G.txt(ctx, "harness: loop \u00b7 context \u00b7 tools \u00b7 policy \u00b7 sandbox \u00b7 state \u00b7 verification \u00b7 budgets", bx + bw * 0.09 + 12, by + 11, { size: 10.5, color: C.dim });
        ctx.restore();
      }
    }
  });

  /* ============ F2 : the loop, unrolled ============ */
  var ITEMS = [
    { k: "system",        w: 46,  c: "#4d5b66", s: 0 },
    { k: "tools[]",       w: 92,  c: "#4d5b66", s: 0 },
    { k: "instructions",  w: 120, c: "#4d5b66", s: 0 },
    { k: "permissions",   w: 64,  c: "#4d5b66", s: 0 },
    { k: "AGENTS.md",     w: 78,  c: "#4d5b66", s: 0 },
    { k: "env_context",   w: 34,  c: "#4d5b66", s: 0 },
    { k: "user msg",      w: 40,  c: C.blue,    s: 0 },
    { k: "reasoning",     w: 58,  c: C.green,   s: 1 },
    { k: "function_call  shell(cat README)", w: 44, c: C.green, s: 1 },
    { k: "function_call_output", w: 96, c: C.purple, s: 4 },
    { k: "reasoning",     w: 62,  c: C.green,   s: 6 },
    { k: "function_call  apply_patch", w: 88, c: C.green, s: 6 },
    { k: "function_call_output  ok", w: 26, c: C.purple, s: 7 },
    { k: "function_call  pytest -q", w: 30, c: C.green, s: 8 },
    { k: "function_call_output  2 failed", w: 110, c: C.red, s: 9 },
    { k: "reasoning",     w: 70,  c: C.green,   s: 10 },
    { k: "function_call  apply_patch", w: 84, c: C.green, s: 10 },
    { k: "function_call_output  418 passed", w: 34, c: C.green, s: 11 },
    { k: "assistant message", w: 30, c: C.amber, s: 12 },
    { k: "user msg  (turn 2)", w: 44, c: C.blue, s: 13 }
  ];
  mk({
    id: "fig-loop", w: 1000, h: 620, dur: 2.0,
    aria: "The agent loop unrolled as an append-only list of prompt items growing downward, with the model re-reading the whole list on every call.",
    stages: [
      { label: "Initial input", cam: [500, 200, 1.16], caption: "The turn begins with a prompt: everything the harness decided the model should see, plus the user's message." },
      { label: "Inference", cam: [520, 195, 1.16], caption: "Inference returns a final message or a tool call. Here: a reasoning item and a request to run a shell command." },
      { label: "Parse", cam: [560, 230, 1.14], caption: "The harness parses the request. This is the first point at which the harness can refuse." },
      { label: "Execute", cam: [600, 300, 1.12], caption: "The tool runs in the environment. The model is not running; it is waiting." },
      { label: "Append", cam: [500, 260, 1.12], caption: "The result is appended as a function_call_output item. Nothing earlier is edited." },
      { label: "Exact prefix", cam: [480, 260, 1.10], caption: "The old prompt is an exact prefix of the new one. That property is worth an enormous amount of money." },
      { label: "Iterate", cam: [500, 300, 1.06], caption: "Model, tool, observation, model. A turn is not one inference; it is a variable-length chain of them." },
      { label: "Patch applied", cam: [500, 320, 1.04], caption: "An edit lands in the workspace. The agent's real output is already leaving the conversation." },
      { label: "Run tests", cam: [500, 340, 1.03], caption: "The agent asks the world a question it cannot answer from its own weights." },
      { label: "Failure returns", cam: [500, 350, 1.02], caption: "Two tests failed. That observation is worth more than any amount of further reasoning about the patch." },
      { label: "Repair", cam: [500, 360, 1.01], caption: "Ground truth changes the plan. This is the loop earning its keep." },
      { label: "Green", cam: [500, 370, 1.0], caption: "418 passed. The agent now has evidence, not a belief." },
      { label: "Turn ends", cam: [500, 380, 1.0], caption: "An assistant message with no tool call is the termination signal. Note what it does not certify." },
      { label: "Next turn", cam: [500, 380, 1.0], caption: "The next user message appends to the same list. Turn 2 re-sends everything from turn 1." }
    ],
    draw: function (ctx, si, t) {
      var x0 = 236, y0 = 60, rowH = 24;
      /* growing list */
      var vis = 0;
      for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].s <= si) vis = i + 1;
      var appearing = [];
      for (var j = 0; j < ITEMS.length; j++) if (ITEMS[j].s === si) appearing.push(j);
      G.txt(ctx, "input  (the list re-sent on every call)", x0, 42, { size: 11, weight: 600, color: C.dim });
      for (var k = 0; k < vis; k++) {
        var it = ITEMS[k], y = y0 + k * rowH;
        var a = (it.s === si) ? G.easeOut(G.clamp((t - 0.12 * appearing.indexOf(k)) * 1.6, 0, 1)) : 1;
        if (a <= 0.01) continue;
        var bw = G.clamp(it.w * 0.78, 10, 96);
        ctx.save(); G.alpha(ctx, a);
        G.box(ctx, x0, y + 3, bw, rowH - 11, { fill: it.c, r: 2 });
        G.txt(ctx, it.k, x0 + bw + 9, y + (rowH - 5) / 2, { size: 10, weight: 600, color: it.c });
        ctx.restore();
      }
      /* prefix bracket at stage>=5 */
      if (si >= 5) {
        var pk = 9, py = y0 + pk * rowH - 2;
        ctx.save(); G.alpha(ctx, si === 5 ? G.easeOut(t) : 0.75);
        G.line(ctx, x0 - 14, y0 - 2, x0 - 14, py, { color: C.green, lw: 2 });
        G.line(ctx, x0 - 14, y0 - 2, x0 - 8, y0 - 2, { color: C.green, lw: 2 });
        G.line(ctx, x0 - 14, py, x0 - 8, py, { color: C.green, lw: 2 });
        ctx.save(); ctx.translate(x0 - 24, (y0 + py) / 2); ctx.rotate(-Math.PI / 2);
        G.txt(ctx, "cacheable prefix", 0, 0, { size: 10.5, weight: 600, color: C.green, align: "center" });
        ctx.restore();
        ctx.restore();
      }
      /* model + environment on the right */
      var mx = 640;
      G.box(ctx, mx, 96, 190, 60, { fill: C.panel, stroke: C.green, r: 5 });
      G.txt(ctx, "MODEL", mx + 95, 116, { size: 13, weight: 600, color: C.green, align: "center" });
      G.txt(ctx, "inference", mx + 95, 136, { size: 10, color: C.faint, align: "center" });
      G.box(ctx, mx, 300, 190, 60, { fill: C.panel, stroke: C.purple, r: 5 });
      G.txt(ctx, "TOOL + SANDBOX", mx + 95, 320, { size: 12, weight: 600, color: C.purple, align: "center" });
      G.txt(ctx, "shell \u00b7 patch \u00b7 pytest", mx + 95, 340, { size: 9.5, color: C.faint, align: "center" });

      var pulseM = (si === 1 || si === 6 || si === 8 || si === 10 || si === 12) ? 0.5 + 0.5 * Math.sin(t * Math.PI * 2) : 0;
      var pulseT = (si === 3 || si === 7 || si === 9 || si === 11) ? 0.5 + 0.5 * Math.sin(t * Math.PI * 2) : 0;
      if (pulseM > 0) { ctx.save(); G.alpha(ctx, pulseM * 0.8); G.box(ctx, mx - 4, 92, 198, 68, { stroke: C.green, lw: 2.4, r: 6 }); ctx.restore(); }
      if (pulseT > 0) { ctx.save(); G.alpha(ctx, pulseT * 0.8); G.box(ctx, mx - 4, 296, 198, 68, { stroke: C.purple, lw: 2.4, r: 6 }); ctx.restore(); }

      G.arrow(ctx, 560, 126, mx - 6, 126, { color: "#3c4954" });
      G.txt(ctx, "whole list", 598, 114, { size: 9.5, color: C.faint, align: "center" });
      G.arrow(ctx, mx + 95, 158, mx + 95, 296, { color: "#3c4954" });
      G.txt(ctx, "action", mx + 102, 228, { size: 9.5, color: C.faint });
      ctx.save();
      G.line(ctx, mx, 330, 596, 330, { color: "#3c4954", lw: 1.3 });
      G.line(ctx, 596, 330, 596, 172, { color: "#3c4954", lw: 1.3 });
      G.arrow(ctx, 596, 190, 596, 172, { color: "#3c4954", head: 5 });
      G.txt(ctx, "observation", 604, 250, { size: 9.5, color: C.faint });
      ctx.restore();

      /* termination badge */
      if (si >= 12) {
        ctx.save(); G.alpha(ctx, si === 12 ? G.easeOut(t) : 1);
        G.box(ctx, mx, 400, 250, 92, { fill: "#161206", stroke: C.amber, r: 5 });
        G.txt(ctx, "TERMINATION CONDITION", mx + 12, 420, { size: 10.5, weight: 600, color: C.amber });
        G.txt(ctx, "no tool call requested", mx + 12, 442, { size: 11, color: C.ink });
        G.txt(ctx, "\u2260  the task actually succeeded", mx + 12, 462, { size: 11, color: C.red });
        G.txt(ctx, "\u2260  the tests are green", mx + 12, 478, { size: 11, color: C.red });
        ctx.restore();
      }
      /* running token count */
      var tot = 0;
      for (var q = 0; q < vis; q++) tot += ITEMS[q].w * 100;
      G.txt(ctx, "prompt length: " + G.fmt(tot) + " tokens", 640, 528, { size: 12, weight: 600, color: C.ink });
      G.txt(ctx, "model calls this turn: " + Math.max(1, [0,1,1,1,2,2,2,3,3,4,4,5,5,5][si]), 640, 548, { size: 11, color: C.dim });
    }
  });

  /* ============ F3 : quadratic cost lab ============ */
  function costCurves(st) {
    var K = Math.max(1, Math.round(st.K)), P0 = st.P0 * 1000, d = st.d * 1000, h = st.h / 100, r = st.r / 100;
    var naive = [], cached = [], cn = 0, cc = 0;
    for (var k = 1; k <= K; k++) {
      var full = P0 + k * d;
      var prefix = P0 + (k - 1) * d;
      cn += full;
      cc += h * (r * prefix + d) + (1 - h) * full;
      naive.push(cn); cached.push(cc);
    }
    return { naive: naive, cached: cached, K: K };
  }
  mk({
    id: "fig-cost", w: 1000, h: 560, dur: 2.2, autoplay: false, resume: false,
    aria: "An interactive plot of cumulative billed input tokens across turns, comparing a naive loop against one that preserves an exact cacheable prefix.",
    stages: [
      { label: "Cumulative billed input", cam: [500, 280, 1], caption: "Cumulative input tokens billed across one long turn. Move the sliders; the shape of the curve is the point." }
    ],
    knobs: [
      { key: "K", label: "Model calls in the turn", min: 5, max: 120, value: 60, fmt: function (v) { return Math.round(v) + " calls"; } },
      { key: "P0", label: "Fixed prompt prefix", min: 2, max: 40, value: 14, step: 1, fmt: function (v) { return v + "k tokens"; } },
      { key: "d", label: "Growth per call", min: 0.2, max: 8, value: 2.2, step: 0.1, fmt: function (v) { return v.toFixed(1) + "k tokens"; } },
      { key: "h", label: "Prefix cache hit rate", min: 0, max: 100, value: 92, step: 1, fmt: function (v) { return v + "%"; } },
      { key: "r", label: "Cached-token price", min: 5, max: 100, value: 10, step: 5, fmt: function (v) { return v + "% of full"; } }
    ],
    labNote: "Naive cost is \\(\\sum_{k=1}^{K}(P_0+k\\delta)=KP_0+\\tfrac{1}{2}\\delta K(K+1)\\) &mdash; quadratic in the number of calls. With an exact prefix cache you pay full price only for what is new, so the curve straightens into \\(O(K)\\). This is why append-only history is an economic decision, not a stylistic one.",
    draw: function (ctx, si, t, st) {
      var cv = costCurves(st);
      var px = 90, py = 60, pw = 620, ph = 400;
      var maxY = Math.max(cv.naive[cv.naive.length - 1] || 1, 1);
      G.grid(ctx, px, py, pw, ph, 10, 8);
      G.line(ctx, px, py + ph, px + pw, py + ph, { color: "#41505c" });
      G.line(ctx, px, py, px, py + ph, { color: "#41505c" });
      for (var g = 0; g <= 4; g++) {
        var v = maxY * g / 4;
        G.txt(ctx, G.fmt(v), px - 10, py + ph - ph * g / 4, { size: 10, color: C.faint, align: "right" });
      }
      for (var gx = 0; gx <= 5; gx++) G.txt(ctx, Math.round(cv.K * gx / 5), px + pw * gx / 5, py + ph + 16, { size: 10, color: C.faint, align: "center" });
      G.txt(ctx, "model calls  k", px + pw / 2, py + ph + 38, { size: 11, color: C.dim, align: "center" });
      ctx.save(); ctx.translate(px - 58, py + ph / 2); ctx.rotate(-Math.PI / 2);
      G.txt(ctx, "cumulative billed input tokens", 0, 0, { size: 11, color: C.dim, align: "center" }); ctx.restore();

      function poly(arr, col, fill) {
        if (!arr.length) return [px, py + ph];
        var pts = [];
        for (var i = 0; i < arr.length; i++) pts.push([px + pw * (i + 1) / cv.K, py + ph - ph * (arr[i] / maxY)]);
        if (fill) {
          ctx.beginPath(); ctx.moveTo(px, py + ph);
          pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); });
          ctx.lineTo(pts[pts.length - 1][0], py + ph); ctx.closePath();
          ctx.fillStyle = fill; ctx.fill();
        }
        G.curve(ctx, pts, { color: col, lw: 2.4 });
        return pts[pts.length - 1];
      }
      var e1 = poly(cv.naive, C.red, "rgba(232,112,95,0.10)");
      var e2 = poly(cv.cached, C.green, "rgba(63,209,160,0.12)");
      G.box(ctx, px + 14, py + 12, 214, 46, { fill: "rgba(11,15,18,0.86)", stroke: "#2b353e", r: 4 });
      G.box(ctx, px + 24, py + 24, 16, 4, { fill: C.red, r: 1 });
      G.txt(ctx, "no cacheable prefix", px + 48, py + 26, { size: 10.5, weight: 600, color: C.red });
      G.box(ctx, px + 24, py + 44, 16, 4, { fill: C.green, r: 1 });
      G.txt(ctx, "append-only + prefix cache", px + 48, py + 46, { size: 10.5, weight: 600, color: C.green });
      void e1; void e2;

      var tn = cv.naive[cv.naive.length - 1], tc = cv.cached[cv.cached.length - 1];
      var bx = 745;
      G.box(ctx, bx, 70, 215, 250, { fill: C.panel, stroke: "#2b353e", r: 5 });
      G.txt(ctx, "AT THE END OF THE TURN", bx + 14, 92, { size: 10, weight: 600, color: C.faint });
      G.txt(ctx, "naive", bx + 14, 122, { size: 11, color: C.dim });
      G.txt(ctx, G.fmt(tn), bx + 201, 122, { size: 14, weight: 600, color: C.red, align: "right" });
      G.txt(ctx, "cached", bx + 14, 152, { size: 11, color: C.dim });
      G.txt(ctx, G.fmt(tc), bx + 201, 152, { size: 14, weight: 600, color: C.green, align: "right" });
      G.line(ctx, bx + 14, 172, bx + 201, 172, { color: "#2b353e" });
      G.txt(ctx, "saving", bx + 14, 194, { size: 11, color: C.dim });
      G.txt(ctx, (100 * (1 - tc / tn)).toFixed(1) + "%", bx + 201, 194, { size: 16, weight: 600, color: C.amber, align: "right" });
      G.txt(ctx, "cost ratio", bx + 14, 222, { size: 11, color: C.dim });
      G.txt(ctx, (tn / tc).toFixed(1) + "\u00d7", bx + 201, 222, { size: 16, weight: 600, color: C.amber, align: "right" });
      G.txt(ctx, "growth \u2248 O(K" + (st.h > 60 ? ")" : "\u00b2)"), bx + 14, 254, { size: 11, color: C.dim });
      G.txt(ctx, st.h > 60 ? "linear" : "quadratic", bx + 201, 254, { size: 12, weight: 600, color: st.h > 60 ? C.green : C.red, align: "right" });
      G.txt(ctx, "one mid-turn edit to an", bx + 14, 284, { size: 10, color: C.faint });
      G.txt(ctx, "early item resets this to 0%.", bx + 14, 300, { size: 10, color: C.faint });
    }
  });
})();
