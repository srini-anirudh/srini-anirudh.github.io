/* Figures 4-8 */
(function () {
  "use strict";
  var mk = window.__mkReel, G = window.__HG, C = G.C;

  /* ============ F4 : the context builder ============ */
  var CB = [
    { t: "system message", sub: "chosen by the API server, not by you", tok: 900,  c: "#4d5b66" },
    { t: "tools[]", sub: "shell \u00b7 update_plan \u00b7 web_search \u00b7 mcp__*", tok: 4200, c: C.purple },
    { t: "instructions", sub: "model-specific base prompt bundled with the CLI", tok: 3100, c: C.blue },
    { t: "developer: <permissions instructions>", sub: "sandbox mode \u00b7 approval policy \u00b7 writable roots", tok: 700, c: C.amber },
    { t: "developer_instructions", sub: "optional, from user config", tok: 250, c: C.amber },
    { t: "user: project instructions", sub: "AGENTS.md aggregated root \u2192 cwd, capped at 32 KiB", tok: 5200, c: C.teal },
    { t: "user: skills preamble + metadata", sub: "names and descriptions only, bodies loaded on demand", tok: 1600, c: C.teal },
    { t: "user: <environment_context>", sub: "cwd \u00b7 shell", tok: 120, c: C.green },
    { t: "user: the actual request", sub: "\u201cAdd an architecture diagram to the README\u201d", tok: 40, c: C.blue }
  ];
  mk({
    id: "fig-context", w: 1000, h: 600, dur: 1.9,
    aria: "The initial prompt assembled block by block, with token widths, showing that the user's request is the smallest block.",
    stages: [
      { label: "system", cam: [430, 130, 1.7], caption: "The first item is not yours. The server decides the system message and where it goes." },
      { label: "tools", cam: [430, 165, 1.6], caption: "Every tool definition is text in the context window, paid for on every call of the turn." },
      { label: "instructions", cam: [430, 200, 1.55], caption: "Model-specific operating instructions, versioned with the model rather than with your project." },
      { label: "permissions", cam: [430, 235, 1.5], caption: "The sandbox is described to the model in words. The words are advice; the sandbox is the enforcement." },
      { label: "developer", cam: [430, 265, 1.5], caption: "User-level configuration, more specific than the model prompt and less specific than the project." },
      { label: "project", cam: [430, 300, 1.45], caption: "AGENTS.md and friends, aggregated from the repository root down to the working directory. More specific instructions go later." },
      { label: "skills", cam: [430, 335, 1.4], caption: "Skills appear as metadata first. The full procedure is fetched only if the model asks for it." },
      { label: "environment", cam: [430, 360, 1.4], caption: "Where am I, and what shell am I holding. Two lines that prevent a great deal of confusion." },
      { label: "the request", cam: [430, 390, 1.35], caption: "And finally the thing the user actually typed \u2014 the smallest block on the screen." },
      { label: "Proportion", cam: [500, 300, 1.05], caption: "The user's request is well under one percent of the first prompt. Everything else is the harness talking." },
      { label: "The invariant", cam: [500, 300, 1.05], caption: "Blocks 1\u20138 are byte-identical on the next call. That is what makes the prefix cacheable \u2014 and what makes reordering tools expensive." }
    ],
    draw: function (ctx, si, t) {
      var x0 = 180, y0 = 74, rowH = 40, scale = 0.055;
      var total = 0; CB.forEach(function (b) { total += b.tok; });
      G.txt(ctx, "input list, in order", x0, 52, { size: 11, weight: 600, color: C.dim });
      G.txt(ctx, "tokens", 700, 52, { size: 11, weight: 600, color: C.dim, align: "right" });
      for (var i = 0; i < CB.length; i++) {
        if (i > si) continue;
        var b = CB[i], y = y0 + i * rowH;
        var a = (i === si) ? G.easeOut(t) : 1;
        var w = Math.max(26, b.tok * scale);
        ctx.save(); G.alpha(ctx, a);
        G.box(ctx, x0, y, w, 26, { fill: b.c, r: 2 });
        G.txt(ctx, b.t, x0 + w + 12, y + 8, { size: 11.5, weight: 600, color: C.ink });
        G.txt(ctx, b.sub, x0 + w + 12, y + 23, { size: 9.5, color: C.faint });
        G.txt(ctx, G.fmt(b.tok), x0 - 10, y + 13, { size: 10, color: C.faint, align: "right" });
        ctx.restore();
      }
      if (si >= 9) {
        var a9 = si === 9 ? G.easeOut(t) : 1;
        ctx.save(); G.alpha(ctx, a9);
        var by = y0 + CB.length * rowH + 24;
        G.box(ctx, x0, by, 600, 26, { fill: "#121920", stroke: "#2b353e", r: 3 });
        var acc = 0;
        for (var j = 0; j < CB.length; j++) {
          var frac = CB[j].tok / total;
          G.box(ctx, x0 + 600 * acc, by, 600 * frac, 26, { fill: CB[j].c, r: 0 });
          acc += frac;
        }
        G.txt(ctx, "total first prompt \u2248 " + G.fmt(total) + " tokens", x0, by + 46, { size: 12, weight: 600, color: C.ink });
        G.txt(ctx, "the user's request is " + (100 * CB[8].tok / total).toFixed(2) + "% of it", x0, by + 66, { size: 11, color: C.amber });
        ctx.restore();
      }
      if (si >= 10) {
        ctx.save(); G.alpha(ctx, si === 10 ? G.easeOut(t) : 1);
        var py = y0 + 8 * rowH - 6;
        G.line(ctx, x0 - 34, y0 - 4, x0 - 34, py, { color: C.green, lw: 2 });
        G.line(ctx, x0 - 34, y0 - 4, x0 - 27, y0 - 4, { color: C.green, lw: 2 });
        G.line(ctx, x0 - 34, py, x0 - 27, py, { color: C.green, lw: 2 });
        ctx.save(); ctx.translate(x0 - 46, (y0 + py) / 2); ctx.rotate(-Math.PI / 2);
        G.txt(ctx, "identical next call", 0, 0, { size: 10.5, weight: 600, color: C.green, align: "center" });
        ctx.restore();
        G.box(ctx, 700, 120, 250, 160, { fill: C.panel, stroke: C.green, r: 5 });
        G.txt(ctx, "THE PREFIX CONTRACT", 714, 142, { size: 10, weight: 600, color: C.green });
        var lines = ["static content first", "variable content last", "tools in a fixed order", "config changes appended,", "never edited in place"];
        lines.forEach(function (L, i2) { G.txt(ctx, L, 714, 168 + i2 * 20, { size: 11, color: C.dim }); });
        ctx.restore();
      }
    }
  });

  /* ============ F5 : append-only vs mutate ============ */
  mk({
    id: "fig-append", w: 1000, h: 560, dur: 2.1,
    aria: "Two lanes compare an append-only history against one that edits an earlier item, showing how much of the prefix cache survives each request.",
    stages: [
      { label: "Two lanes", cam: [500, 260, 1.05], caption: "Same model, same task, same three requests. The only difference is where new information is written." },
      { label: "Request 1", cam: [500, 260, 1.05], caption: "First request: nothing is cached yet, both lanes pay full price." },
      { label: "Request 2", cam: [500, 260, 1.05], caption: "Second request: both lanes hit the cache on everything but the new tail." },
      { label: "Config changes", cam: [500, 260, 1.05], caption: "Now the working directory changes mid-turn. Both harnesses must tell the model." },
      { label: "Append vs edit", cam: [500, 260, 1.05], caption: "Lane A appends a new environment message. Lane B rewrites the original one in place." },
      { label: "Request 3", cam: [500, 260, 1.05], caption: "Lane A still matches its prefix exactly. Lane B diverges at item 6, so everything after it is recomputed." },
      { label: "The bill", cam: [500, 260, 1.05], caption: "A one-line edit thirty items back invalidated thirty items of cached computation." },
      { label: "Other landmines", cam: [500, 260, 1.05], caption: "Any of these has the same effect: swapping models, re-sorting a tool list, an MCP server announcing new tools." },
      { label: "The rule", cam: [500, 260, 1.05], caption: "Treat everything the model has already seen as immutable. The history is a ledger, not a document." }
    ],
    draw: function (ctx, si, t) {
      var lanes = [
        { y: 80, name: "LANE A \u00b7 append-only", col: C.green },
        { y: 300, name: "LANE B \u00b7 edit in place", col: C.red }
      ];
      var itemW = 26, itemH = 26, x0 = 150, gap = 3;
      var baseCount = 8;
      lanes.forEach(function (L, li) {
        G.txt(ctx, L.name, x0, L.y - 22, { size: 12, weight: 600, color: L.col });
        var n = baseCount + (si >= 2 ? 3 : 0) + (si >= 4 ? 1 : 0) + (si >= 5 ? 3 : 0);
        var divergeAt = (li === 1 && si >= 5) ? 5 : -1;
        for (var i = 0; i < n; i++) {
          var x = x0 + i * (itemW + gap);
          var cached = (si >= 2 && i < baseCount) || (si >= 5 && i < baseCount + 3);
          if (divergeAt >= 0 && i >= divergeAt) cached = false;
          var col = cached ? "#183a2e" : "#2a1f1c";
          var bd = cached ? C.green : (divergeAt >= 0 && i >= divergeAt ? C.red : "#3b4750");
          var isEdit = (li === 1 && si >= 4 && i === 5);
          ctx.save();
          if (isEdit && si === 4) G.alpha(ctx, 0.55 + 0.45 * Math.sin(t * Math.PI * 3));
          G.box(ctx, x, L.y, itemW, itemH, { fill: isEdit ? "#3a2116" : col, stroke: isEdit ? C.amber : bd, r: 2 });
          ctx.restore();
          if (i === 5) G.txt(ctx, "env", x + itemW / 2, L.y + itemH / 2, { size: 8, color: isEdit ? C.amber : C.faint, align: "center" });
        }
        if (li === 0 && si >= 4) {
          var xa = x0 + (baseCount + 3) * (itemW + gap);
          ctx.save(); if (si === 4) G.alpha(ctx, 0.55 + 0.45 * Math.sin(t * Math.PI * 3));
          G.box(ctx, xa, L.y, itemW, itemH, { fill: "#12332a", stroke: C.green, r: 2 });
          G.txt(ctx, "env'", xa + itemW / 2, L.y + itemH / 2, { size: 8, color: C.green, align: "center" });
          ctx.restore();
        }
        /* cache bar */
        var hit = li === 0 ? (si >= 5 ? (baseCount + 4) : si >= 2 ? baseCount : 0) : (si >= 5 ? 5 : si >= 2 ? baseCount : 0);
        var tot = baseCount + (si >= 2 ? 3 : 0) + (si >= 4 ? 1 : 0) + (si >= 5 ? 3 : 0);
        G.box(ctx, x0, L.y + 48, 430, 16, { fill: "#131a20", stroke: "#2b353e", r: 2 });
        ctx.save(); G.alpha(ctx, si >= 5 ? 1 : 0.85);
        G.box(ctx, x0, L.y + 48, 430 * (hit / tot), 16, { fill: L.col, r: 2 });
        ctx.restore();
        G.txt(ctx, "cache hit " + Math.round(100 * hit / tot) + "%", x0 + 442, L.y + 56, { size: 11, weight: 600, color: L.col });
      });

      if (si >= 6) {
        ctx.save(); G.alpha(ctx, si === 6 ? G.easeOut(t) : 1);
        G.box(ctx, 730, 100, 230, 130, { fill: C.panel, stroke: "#2b353e", r: 5 });
        G.txt(ctx, "RECOMPUTED PREFIX", 744, 122, { size: 10, weight: 600, color: C.faint });
        G.txt(ctx, "Lane A", 744, 150, { size: 11, color: C.dim });
        G.txt(ctx, "0 items", 946, 150, { size: 13, weight: 600, color: C.green, align: "right" });
        G.txt(ctx, "Lane B", 744, 180, { size: 11, color: C.dim });
        G.txt(ctx, "10 items", 946, 180, { size: 13, weight: 600, color: C.red, align: "right" });
        G.txt(ctx, "cost: everything after the edit", 744, 208, { size: 9.5, color: C.faint });
        ctx.restore();
      }
      if (si >= 7) {
        ctx.save(); G.alpha(ctx, si === 7 ? G.easeOut(t) : 1);
        var land = ["switch model mid-turn", "re-sort the tool list", "MCP server adds a tool", "change sandbox mode", "change working directory"];
        G.txt(ctx, "CACHE-MISS LANDMINES", 730, 262, { size: 10, weight: 600, color: C.amber });
        land.forEach(function (L2, i3) {
          G.cross(ctx, 738, 288 + i3 * 22, C.amber, 0.8);
          G.txt(ctx, L2, 752, 288 + i3 * 22, { size: 11, color: C.dim });
        });
        ctx.restore();
      }
      if (si >= 8) {
        ctx.save(); G.alpha(ctx, si === 8 ? G.easeOut(t) : 1);
        G.box(ctx, 150, 424, 560, 66, { fill: "#0d1a16", stroke: C.green, r: 5 });
        G.txt(ctx, "INVARIANT", 166, 446, { size: 10, weight: 600, color: C.green });
        G.txt(ctx, "model-visible history is append-only; state changes are new messages,", 166, 466, { size: 12, color: C.ink });
        G.txt(ctx, "never edits to old ones.", 166, 482, { size: 12, color: C.ink });
        ctx.restore();
      }
    }
  });

  /* ============ F6 : action space ============ */
  var TASK = "rename symbol  parse_cfg \u2192 load_cfg  across the repo, then run the tests";
  var LANES6 = [
    {
      name: "A. raw shell only", col: C.red, x: 60,
      steps: ["grep -rn parse_cfg .", "sed -n '1,60p' a.py", "python - <<'EOF' \u2026", "cat > a.py <<'EOF' \u2026", "sed -n '1,60p' b.py", "cat > b.py <<'EOF' \u2026", "\u2026 3 more files \u2026", "pytest -q"],
      note: "maximally expressive, maximally error-prone"
    },
    {
      name: "B. structured tools", col: C.amber, x: 370,
      steps: ["search(\"parse_cfg\")", "read_file(a.py, 40, 80)", "apply_patch(a.py, \u2026)", "apply_patch(b.py, \u2026)", "\u2026 3 more patches \u2026", "run_tests()"],
      note: "narrower, validated, easier to get right"
    },
    {
      name: "C. code as action", col: C.green, x: 680,
      steps: ["for f in repo.glob('**/*.py'):", "    s = f.read_text()", "    if 'parse_cfg' in s:", "        f.write_text(s.replace(\u2026))", "run(['pytest','-q'])"],
      note: "one action carries control flow"
    }
  ];
  mk({
    id: "fig-action", w: 1000, h: 600, dur: 2.2,
    aria: "Three action spaces \u2014 raw shell, structured tools, and executable code \u2014 solving the same rename task, with turn counters and measured deltas from the literature.",
    stages: [
      { label: "One task", cam: [460, 130, 1.15], caption: "One task, one model. The only thing that changes is the set of actions the harness will accept." },
      { label: "Shell", cam: [500, 300, 1.04], caption: "With only a shell, everything is possible and nothing is checked. Each edit is a fresh chance to mangle a file." },
      { label: "Structured", cam: [500, 300, 1.04], caption: "With named tools, the arguments have a schema, patches can be validated, and search output can be shaped." },
      { label: "Code", cam: [500, 300, 1.04], caption: "With code as the action, one turn can carry a loop. Five files become one action instead of five." },
      { label: "Turn counts", cam: [500, 340, 1.02], caption: "The turn counts differ by more than a constant, and every turn is a full round trip through the model." },
      { label: "Measured", cam: [500, 380, 1.0], caption: "These are not hypothetical differences \u2014 they are among the most reproduced results in the agent literature." },
      { label: "The catch", cam: [500, 380, 1.0], caption: "But expressiveness cuts both ways: a wider action space is also a wider attack surface and a harder thing to sandbox." }
    ],
    draw: function (ctx, si, t) {
      G.txt(ctx, "TASK", 60, 56, { size: 10, weight: 600, color: C.faint });
      G.txt(ctx, TASK, 60, 76, { size: 13, color: C.ink });
      LANES6.forEach(function (L, li) {
        var show = si >= 1 + li ? 1 : 0;
        if (si === 1 + li) show = G.easeOut(t);
        if (si >= 4) show = 1;
        if (show <= 0.01) return;
        ctx.save(); G.alpha(ctx, show);
        G.box(ctx, L.x, 120, 260, 300, { fill: C.panel, stroke: L.col, r: 5 });
        G.txt(ctx, L.name, L.x + 14, 144, { size: 12, weight: 600, color: L.col });
        var visible = (si === 1 + li) ? Math.ceil(G.easeOut(t) * L.steps.length) : L.steps.length;
        for (var i = 0; i < L.steps.length && i < visible; i++) {
          G.txt(ctx, String(i + 1).padStart(2, "0"), L.x + 14, 176 + i * 24, { size: 9.5, color: C.faint });
          G.txt(ctx, L.steps[i], L.x + 38, 176 + i * 24, { size: 10.5, color: C.dim });
        }
        G.txt(ctx, L.note, L.x + 14, 400, { size: 9.5, color: C.faint });
        ctx.restore();
      });
      if (si >= 4) {
        var counts = [8, 6, 1];
        var a = si === 4 ? G.easeOut(t) : 1;
        ctx.save(); G.alpha(ctx, a);
        LANES6.forEach(function (L, li) {
          G.box(ctx, L.x, 434, 260, 40, { fill: "#121920", stroke: "#2b353e", r: 3 });
          G.txt(ctx, "model round-trips", L.x + 14, 454, { size: 10.5, color: C.dim });
          G.txt(ctx, counts[li] + (li === 2 ? " (+1 verify)" : ""), L.x + 246, 454, { size: 14, weight: 600, color: L.col, align: "right" });
        });
        ctx.restore();
      }
      if (si >= 5) {
        ctx.save(); G.alpha(ctx, si === 5 ? G.easeOut(t) : 1);
        var facts = [
          ["SWE-agent 2024", "a purpose-built interface beat a plain Linux shell by 10.7 points on a 300-issue subset", C.amber],
          ["CodeAct 2024", "code-as-action gained up to 20.7 points and needed 2.1 fewer turns on multi-tool tasks", C.green],
          ["Anthropic 2025", "letting the agent call tools from code cut one workflow from ~150k to ~2k tokens", C.blue]
        ];
        facts.forEach(function (f, i4) {
          G.box(ctx, 60, 492 + i4 * 34, 880, 30, { fill: "#121920", stroke: "#242e37", r: 3 });
          G.txt(ctx, f[0], 74, 507 + i4 * 34, { size: 10.5, weight: 600, color: f[2] });
          G.txt(ctx, f[1], 210, 507 + i4 * 34, { size: 11, color: C.dim });
        });
        ctx.restore();
      }
      if (si === 6) {
        ctx.save();
        G.alpha(ctx, G.easeOut(t) * 0.82);
        ctx.fillStyle = "#0f1317"; ctx.fillRect(-200, -100, 1400, 800);
        ctx.restore();
        ctx.save(); G.alpha(ctx, G.easeOut(t) * 0.98);
        G.box(ctx, 240, 200, 520, 200, { fill: "#0d0f12", stroke: C.red, r: 6 });
        G.txt(ctx, "THE SAME PROPERTY, READ FROM SECURITY", 262, 232, { size: 11, weight: 600, color: C.red });
        var ls = [
          "A wider action space is a wider blast radius.",
          "An interpreter that can express any loop can also express",
          "any exfiltration. Which is why the action-space decision and",
          "the containment decision have to be made together, not in",
          "sequence by two different teams."
        ];
        ls.forEach(function (s, i5) { G.txt(ctx, s, 262, 268 + i5 * 24, { size: 12.5, color: C.ink }); });
        ctx.restore();
      }
    }
  });

  /* ============ F7 : edit-protocol lab ============ */
  var FORMATS = [
    { key: "whole", name: "whole file", col: C.blue },
    { key: "sr", name: "SEARCH / REPLACE", col: C.green },
    { key: "udiff", name: "unified diff", col: C.amber },
    { key: "anchor", name: "anchored patch", col: C.purple }
  ];
  function editCost(st) {
    var F = st.F, E = st.E, c = st.c / 100, tau = 11, ctxL = 6;
    var out = { whole: F * tau, sr: (2 * E + 4) * tau, udiff: (E + 2 * ctxL) * tau, anchor: (E + ctxL + 2) * tau };
    var p = {
      whole: Math.min(0.995, 0.90 + 0.09 * c) * Math.max(0.35, 1 - Math.max(0, F - 400) / 1600),
      sr: 0.52 + 0.45 * c,
      udiff: 0.36 + 0.58 * c,
      anchor: 0.46 + 0.50 * c
    };
    var res = {};
    FORMATS.forEach(function (f) {
      var pp = Math.min(0.995, Math.max(0.05, p[f.key]));
      res[f.key] = { out: out[f.key], p: pp, exp: out[f.key] / pp, retries: (1 / pp) - 1 };
    });
    return res;
  }
  mk({
    id: "fig-edit", w: 1000, h: 540, dur: 2, autoplay: false, resume: false,
    aria: "An interactive comparison of four code-edit protocols, showing output tokens, apply-success probability, and expected tokens per successfully applied edit.",
    stages: [
      { label: "Expected cost per applied edit", cam: [500, 270, 1], caption: "Expected tokens per successfully applied edit. Success probabilities are schematic; the shape of the trade-off is the real content." }
    ],
    knobs: [
      { key: "F", label: "File size", min: 40, max: 1200, value: 420, step: 10, fmt: function (v) { return Math.round(v) + " lines"; } },
      { key: "E", label: "Edit size", min: 1, max: 120, value: 9, step: 1, fmt: function (v) { return Math.round(v) + " lines"; } },
      { key: "c", label: "Model fluency in the format", min: 0, max: 100, value: 72, step: 1, fmt: function (v) { return v + "%"; } }
    ],
    labNote: "If an attempt costs \\(m\\) output tokens and applies cleanly with probability \\(p\\), retries are geometric and the expected cost of one landed edit is \\(\\mathbb{E}[m]=m/p\\). Whole-file rewrites keep \\(p\\) high but scale \\(m\\) with the file; diffs keep \\(m\\) small but pay for it in \\(p\\). Success probabilities here are illustrative, chosen to reproduce the direction of published ablations rather than any specific measurement.",
    draw: function (ctx, si, t, st) {
      var r = editCost(st);
      var maxE = 0; FORMATS.forEach(function (f) { maxE = Math.max(maxE, r[f.key].exp); });
      var x0 = 80, y0 = 90, bw = 450, rowH = 78;
      G.txt(ctx, "EXPECTED OUTPUT TOKENS PER LANDED EDIT", x0, 60, { size: 10.5, weight: 600, color: C.faint });
      FORMATS.forEach(function (f, i) {
        var d = r[f.key], y = y0 + i * rowH;
        var w = bw * (d.exp / maxE);
        G.txt(ctx, f.name, x0, y, { size: 12.5, weight: 600, color: f.col });
        G.box(ctx, x0, y + 14, bw, 26, { fill: "#131a20", stroke: "#232c34", r: 2 });
        G.box(ctx, x0, y + 14, w, 26, { fill: f.col, r: 2 });
        var wOut = bw * (d.out / maxE);
        G.box(ctx, x0, y + 14, wOut, 26, { fill: "rgba(255,255,255,0.16)", r: 2 });
        G.txt(ctx, Math.round(d.exp) + " tok", x0 + bw + 12, y + 27, { size: 11, weight: 600, color: f.col });
        G.txt(ctx, "attempt " + Math.round(d.out) + " tok  \u00b7  applies " + (100 * d.p).toFixed(0) + "%  \u00b7  " + d.retries.toFixed(2) + " expected retries",
          x0, y + 54, { size: 10, color: C.faint });
      });
      /* verdict panel */
      var best = FORMATS[0], worst = FORMATS[0];
      FORMATS.forEach(function (f) {
        if (r[f.key].exp < r[best.key].exp) best = f;
        if (r[f.key].exp > r[worst.key].exp) worst = f;
      });
      var bx = 640;
      G.box(ctx, bx, 90, 300, 300, { fill: C.panel, stroke: "#2b353e", r: 5 });
      G.txt(ctx, "AT THESE SETTINGS", bx + 16, 114, { size: 10, weight: 600, color: C.faint });
      G.txt(ctx, "cheapest", bx + 16, 144, { size: 11, color: C.dim });
      G.txt(ctx, best.name, bx + 284, 144, { size: 12, weight: 600, color: best.col, align: "right" });
      G.txt(ctx, "most expensive", bx + 16, 172, { size: 11, color: C.dim });
      G.txt(ctx, worst.name, bx + 284, 172, { size: 12, weight: 600, color: worst.col, align: "right" });
      G.txt(ctx, "spread", bx + 16, 200, { size: 11, color: C.dim });
      G.txt(ctx, (r[worst.key].exp / r[best.key].exp).toFixed(1) + "\u00d7", bx + 284, 200, { size: 15, weight: 600, color: C.amber, align: "right" });
      G.line(ctx, bx + 16, 220, bx + 284, 220, { color: "#2b353e" });
      var msg = st.F < 120
        ? ["On a small file, rewriting the whole", "thing is often the cheapest reliable", "option \u2014 the diff machinery is pure", "overhead."]
        : (st.c < 40
          ? ["A model that is shaky on diff syntax", "should be given the format it can", "actually emit, even if that format", "burns more tokens."]
          : ["On a large file with a fluent model,", "anchored and search/replace edits", "win by an order of magnitude \u2014", "which is why harnesses ship several."]);
      msg.forEach(function (m, i) { G.txt(ctx, m, bx + 16, 246 + i * 20, { size: 11, color: C.ink }); });
      G.txt(ctx, "shaded segment = one attempt; full bar = attempts + retries", x0, y0 + 4 * rowH + 6, { size: 10, color: C.faint });
    }
  });

  /* ============ F8 : observation funnel ============ */
  var POLICIES = [
    { n: "raw", d: "paste everything", keep: 1.0, needle: true, blow: true },
    { n: "head truncate", d: "first 8 kB", keep: 0.06, needle: false, blow: false },
    { n: "head + tail", d: "first 4 kB, last 4 kB", keep: 0.07, needle: false, blow: false },
    { n: "structured", d: "counts, paths, one line each", keep: 0.04, needle: true, blow: false },
    { n: "spill to file", d: "summary + a handle to re-query", keep: 0.03, needle: true, blow: false }
  ];
  mk({
    id: "fig-observe", w: 1000, h: 580, dur: 2.1,
    aria: "A large tool output passing through five truncation policies, showing which preserve the single line that actually mattered.",
    stages: [
      { label: "The raw output", cam: [430, 170, 1.12], caption: "One command. Twenty megabytes of matches. Somewhere in there is the line that explains the bug." },
      { label: "Raw", cam: [500, 300, 1.05], caption: "Pasting it whole preserves the needle and destroys the context window. Codex caps tool output at 10,000 tokens by default for exactly this reason." },
      { label: "Head", cam: [500, 300, 1.05], caption: "Truncating the head is cheap, deterministic, and silently discards the answer whenever the answer is late." },
      { label: "Head and tail", cam: [500, 300, 1.05], caption: "Head-and-tail is better for stack traces and no better for grep. The failure mode did not go away; it moved." },
      { label: "Structured", cam: [500, 300, 1.05], caption: "Summarising into counts and paths costs the harness a parser and saves the model a context window." },
      { label: "Spill", cam: [500, 300, 1.05], caption: "Best of both: return a small summary plus a handle the agent can query again if it needs to." },
      { label: "The transform", cam: [500, 320, 1.0], caption: "The harness is not a pipe. It is a sensor pipeline, and its gain and clipping decide what the agent can perceive." }
    ],
    draw: function (ctx, si, t) {
      var srcX = 70, srcY = 70, srcW = 200, srcH = 220;
      G.box(ctx, srcX, srcY, srcW, srcH, { fill: "#121920", stroke: "#33414c", r: 4 });
      G.txt(ctx, "grep -rn TODO .", srcX + 12, srcY + 22, { size: 11, weight: 600, color: C.ink });
      G.txt(ctx, "42,118 matches", srcX + 12, srcY + 42, { size: 10.5, color: C.dim });
      G.txt(ctx, "\u2248 20 MB  \u00b7  \u2248 5.2M tokens", srcX + 12, srcY + 58, { size: 10.5, color: C.red });
      for (var i = 0; i < 22; i++) {
        var yy = srcY + 78 + i * 6;
        var isNeedle = i === 14;
        ctx.save(); G.alpha(ctx, isNeedle ? 1 : 0.5);
        G.box(ctx, srcX + 12, yy, isNeedle ? 150 : 40 + (i * 37) % 130, 3.5, { fill: isNeedle ? C.amber : "#3a4650", r: 1 });
        ctx.restore();
      }
      if (si >= 0) {
        ctx.save(); G.alpha(ctx, si === 0 ? G.easeOut(t) : 0.9);
        G.txt(ctx, "\u2190 the line that matters", srcX + srcW + 10, srcY + 78 + 14 * 6 + 2, { size: 10, weight: 600, color: C.amber });
        ctx.restore();
      }
      var lx = 380, ly = 80, rowH = 84;
      for (var p = 0; p < POLICIES.length; p++) {
        if (si < p + 1) continue;
        var P = POLICIES[p], y = ly + p * rowH;
        var a = si === p + 1 ? G.easeOut(t) : 1;
        ctx.save(); G.alpha(ctx, a);
        G.box(ctx, lx, y, 420, 64, { fill: C.panel, stroke: P.needle ? (P.blow ? C.red : C.green) : C.red, r: 4 });
        G.txt(ctx, P.n, lx + 14, y + 20, { size: 12, weight: 600, color: C.ink });
        G.txt(ctx, P.d, lx + 130, y + 20, { size: 10.5, color: C.faint });
        G.box(ctx, lx + 14, y + 32, 260, 12, { fill: "#131a20", stroke: "#232c34", r: 2 });
        G.box(ctx, lx + 14, y + 32, 260 * P.keep, 12, { fill: P.blow ? C.red : C.blue, r: 2 });
        G.txt(ctx, (P.keep * 5.2e6 > 1000 ? G.fmt(P.keep * 5.2e6) : Math.round(P.keep * 5.2e6)) + " tok", lx + 282, y + 38, { size: 10, color: C.dim });
        if (P.needle) { G.tick(ctx, lx + 356, y + 38, C.green, 1.1); G.txt(ctx, "needle kept", lx + 366, y + 38, { size: 10, weight: 600, color: C.green }); }
        else { G.cross(ctx, lx + 356, y + 38, C.red, 1.1); G.txt(ctx, "needle lost", lx + 366, y + 38, { size: 10, weight: 600, color: C.red }); }
        if (P.blow) G.txt(ctx, "context window exhausted", lx + 14, y + 56, { size: 9.5, color: C.red });
        ctx.restore();
      }
      if (si >= 6) {
        ctx.save(); G.alpha(ctx, si === 6 ? G.easeOut(t) : 1);
        G.box(ctx, 70, 330, 260, 190, { fill: "#0d1a16", stroke: C.green, r: 5 });
        G.txt(ctx, "o_model = \u03a6(o_env)", 86, 356, { size: 13, weight: 600, color: C.green });
        var ls = ["\u03a6 is chosen by the harness.", "", "It sets what the agent can", "notice at all \u2014 the same role", "an amplifier and its clipping", "point play in an instrument", "chain."];
        ls.forEach(function (s, i2) { G.txt(ctx, s, 86, 382 + i2 * 19, { size: 11, color: C.dim }); });
        ctx.restore();
      }
    }
  });
})();
