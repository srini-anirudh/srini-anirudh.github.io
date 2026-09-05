/* Figures 9-12 */
(function () {
  "use strict";
  var mk = window.__mkReel, G = window.__HG, C = G.C;

  /* ============ F9 : verification closes the loop ============ */
  mk({
    id: "fig-verify", w: 1000, h: 560, dur: 2.0,
    aria: "Two agents attempt the same fix. One only reasons; the other runs the tests. Confidence and actual correctness are tracked separately for each.",
    stages: [
      { label: "Two agents", cam: [500, 260, 1.05], caption: "Same model, same patch, same five iterations. One harness offers a test runner; the other does not." },
      { label: "Iteration 1", cam: [500, 260, 1.05], caption: "Both write a plausible patch. Both are equally confident. Only one of them knows anything." },
      { label: "Iteration 2", cam: [500, 260, 1.05], caption: "The unverified agent re-reads its own patch and finds it convincing. Confidence rises; correctness does not move." },
      { label: "Iteration 3", cam: [500, 260, 1.05], caption: "The verified agent gets two failures back. Confidence falls \u2014 which is the correct response to evidence." },
      { label: "Iteration 4", cam: [500, 260, 1.05], caption: "A failing assertion names the wrong assumption. This is information the weights did not contain." },
      { label: "Iteration 5", cam: [500, 260, 1.05], caption: "Green. Now confidence and correctness point at the same thing." },
      { label: "The gap", cam: [500, 300, 1.0], caption: "Without an executable check, self-reported confidence is a random variable that happens to trend upward." },
      { label: "The service", cam: [500, 300, 1.0], caption: "So verification is not a tool the model may choose. It is a service the harness owes the loop." }
    ],
    draw: function (ctx, si, t) {
      var lanes = [
        { name: "no verifier", col: C.red, y: 90, conf: [0.55, 0.68, 0.79, 0.86, 0.93], corr: [0.2, 0.2, 0.2, 0.2, 0.2] },
        { name: "tests in the loop", col: C.green, y: 300, conf: [0.55, 0.30, 0.42, 0.35, 0.95], corr: [0.2, 0.2, 0.45, 0.45, 1.0] }
      ];
      var x0 = 90, pw = 480, ph = 130;
      var step = si <= 5 ? Math.max(0, si - 1) : 4;
      var frac = (si >= 1 && si <= 5) ? G.easeOut(t) : 1;
      lanes.forEach(function (L) {
        G.txt(ctx, L.name, x0, L.y - 20, { size: 12, weight: 600, color: L.col });
        G.grid(ctx, x0, L.y, pw, ph, 4, 4);
        G.line(ctx, x0, L.y + ph, x0 + pw, L.y + ph, { color: "#41505c" });
        G.line(ctx, x0, L.y, x0, L.y + ph, { color: "#41505c" });
        G.txt(ctx, "1.0", x0 - 8, L.y, { size: 9, color: C.faint, align: "right" });
        G.txt(ctx, "0", x0 - 8, L.y + ph, { size: 9, color: C.faint, align: "right" });
        function series(arr, col, dash) {
          var pts = [];
          for (var i = 0; i <= step; i++) {
            var v = arr[i];
            if (i === step && si >= 1 && si <= 5) v = G.lerp(arr[Math.max(0, i - 1)], arr[i], frac);
            pts.push([x0 + pw * i / 4, L.y + ph - ph * v]);
          }
          if (pts.length > 1) G.curve(ctx, pts, { color: col, lw: 2.2, dash: dash });
          var last = pts[pts.length - 1];
          ctx.beginPath(); ctx.arc(last[0], last[1], 3.6, 0, 6.29); ctx.fillStyle = col; ctx.fill();
          return last;
        }
        var a = series(L.conf, L.col, [5, 4]);
        var b = series(L.corr, C.blue, null);
        void a; void b;
        G.box(ctx, x0 + 8, L.y + 6, 160, 40, { fill: "rgba(11,15,18,0.9)", stroke: "#2b353e", r: 3 });
        G.box(ctx, x0 + 18, L.y + 18, 14, 2.5, { fill: L.col, r: 1 });
        G.txt(ctx, "stated confidence", x0 + 38, L.y + 19, { size: 9.5, color: L.col });
        G.box(ctx, x0 + 18, L.y + 36, 14, 2.5, { fill: C.blue, r: 1 });
        G.txt(ctx, "tests passing", x0 + 38, L.y + 37, { size: 9.5, color: C.blue });
        for (var i = 0; i <= step; i++) G.txt(ctx, "it " + (i + 1), x0 + pw * i / 4, L.y + ph + 16, { size: 9, color: C.faint, align: "center" });
      });
      /* loop diagram */
      var lx = 640;
      var ring = ["edit", "lint", "test", "read failure", "repair"];
      G.txt(ctx, "THE VERIFY LOOP", lx, 70, { size: 10, weight: 600, color: C.faint });
      ring.forEach(function (r, i) {
        var y = 96 + i * 44;
        var act = (si >= 1 && (i === ((si - 1) % 5)));
        ctx.save(); if (act) G.alpha(ctx, 0.6 + 0.4 * Math.sin(t * Math.PI * 2));
        G.box(ctx, lx, y, 170, 32, { fill: act ? "#12332a" : C.panel, stroke: act ? C.green : "#2b353e", r: 3 });
        G.txt(ctx, r, lx + 14, y + 16, { size: 11.5, weight: act ? 600 : 400, color: act ? C.green : C.dim });
        ctx.restore();
        if (i < ring.length - 1) G.arrow(ctx, lx + 85, y + 32, lx + 85, y + 42, { color: "#3c4954", head: 4 });
      });
      ctx.save();
      ctx.beginPath(); ctx.moveTo(lx + 170, 112); ctx.bezierCurveTo(lx + 230, 112, lx + 230, 290, lx + 172, 290);
      ctx.strokeStyle = "#3c4954"; ctx.lineWidth = 1.3; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      G.arrow(ctx, lx + 190, 112, lx + 172, 112, { color: "#3c4954", head: 5 });
      ctx.restore();
      if (si >= 6) {
        ctx.save(); G.alpha(ctx, si === 6 ? G.easeOut(t) : 1);
        G.box(ctx, 90, 462, 480, 72, { fill: "#1c1210", stroke: C.red, r: 5 });
        G.txt(ctx, "a\u2081 \u2192 o\u2082 \u2192 a\u2082 :  the arrow through the world is the only one", 106, 486, { size: 12.5, color: C.ink });
        G.txt(ctx, "that carries information the model did not already have.", 106, 508, { size: 12.5, color: C.ink });
        ctx.restore();
      }
      if (si >= 7) {
        ctx.save(); G.alpha(ctx, si === 7 ? G.easeOut(t) : 1);
        G.box(ctx, 640, 330, 300, 128, { fill: C.panel, stroke: C.green, r: 5 });
        G.txt(ctx, "NORMALISE THE VERDICT", 656, 354, { size: 10, weight: 600, color: C.green });
        var ls = ["{ passed: 418, failed: 2,", "  failures: [ \u2026 ] }", "", "not 8,000 lines of console"];
        ls.forEach(function (s, i3) { G.txt(ctx, s, 656, 380 + i3 * 20, { size: 11, color: C.dim }); });
        ctx.restore();
      }
    }
  });

  /* ============ F10 : the permission ladder ============ */
  var CMDS = [
    { c: "git status", risk: "read" },
    { c: "npm test", risk: "workspace" },
    { c: "Edit(src/app.ts)", risk: "workspace" },
    { c: "rm -rf build/", risk: "workspace" },
    { c: "curl -X POST https://x.io", risk: "external" },
    { c: "git push origin main", risk: "external" }
  ];
  var MODES = ["default", "acceptEdits", "plan", "dontAsk", "bypassPermissions"];
  var RULES = {
    deny: ["Bash(curl *)"],
    ask: ["Bash(git push *)"],
    allow: ["Bash(git *)", "Bash(npm test)", "Read", "Grep"]
  };
  function route(cmdIdx, modeIdx) {
    var c = CMDS[cmdIdx].c, mode = MODES[modeIdx];
    var steps = [];
    steps.push({ n: "hooks", v: "pass", col: C.dim });
    if (/^curl/.test(c)) { steps.push({ n: "deny rules", v: "BLOCKED", col: C.red }); return { steps: steps, out: "denied", col: C.red, why: "a deny rule matches, and deny wins even in bypassPermissions" }; }
    steps.push({ n: "deny rules", v: "no match", col: C.dim });
    if (/^git push/.test(c)) {
      steps.push({ n: "ask rules", v: "MATCH", col: C.amber });
      if (mode === "dontAsk") return { steps: steps, out: "denied", col: C.red, why: "an ask rule matched in a mode that never prompts, so it is denied instead" };
      return { steps: steps, out: "ask the user", col: C.amber, why: "ask rules route to the approval callback even under bypassPermissions" };
    }
    steps.push({ n: "ask rules", v: "no match", col: C.dim });
    if (mode === "bypassPermissions") { steps.push({ n: "permission mode", v: "APPROVE", col: C.green }); return { steps: steps, out: "allowed", col: C.green, why: "bypassPermissions approves everything that survives deny and ask" }; }
    if (mode === "acceptEdits" && /^Edit\(/.test(c)) { steps.push({ n: "permission mode", v: "APPROVE", col: C.green }); return { steps: steps, out: "allowed", col: C.green, why: "acceptEdits auto-approves file operations only" }; }
    if (mode === "plan" && (/^Edit\(/.test(c) || /^rm /.test(c))) { steps.push({ n: "permission mode", v: "ROUTE", col: C.amber }); return { steps: steps, out: "ask the user", col: C.amber, why: "in plan mode writes cannot be auto-approved, even by an allow rule" }; }
    steps.push({ n: "permission mode", v: "fall through", col: C.dim });
    var allowed = RULES.allow.some(function (r) {
      var base = r.replace(/\(.*\)$/, ""), inner = (r.match(/\((.*)\)/) || [])[1];
      if (!inner) return c.indexOf(base) === 0;
      var pref = inner.replace("*", "");
      return c.indexOf(pref) === 0;
    });
    if (allowed) { steps.push({ n: "allow rules", v: "MATCH", col: C.green }); return { steps: steps, out: "allowed", col: C.green, why: "an explicit allow rule covers this command" }; }
    steps.push({ n: "allow rules", v: "no match", col: C.dim });
    if (mode === "dontAsk") { steps.push({ n: "callback", v: "SKIPPED", col: C.red }); return { steps: steps, out: "denied", col: C.red, why: "unresolved calls are denied when the harness is not allowed to prompt" }; }
    steps.push({ n: "callback", v: "PROMPT", col: C.amber });
    return { steps: steps, out: "ask the user", col: C.amber, why: "nothing matched, so the decision is handed back to a human" };
  }
  mk({
    id: "fig-perm", w: 1000, h: 520, dur: 2, autoplay: false, resume: false,
    aria: "An interactive permission ladder: a command falls through hooks, deny rules, ask rules, permission mode, allow rules and finally a human callback.",
    stages: [{ label: "Permission evaluation order", cam: [500, 260, 1], caption: "Pick a command and a mode. The ladder is evaluated top to bottom; the first rung that decides, wins." }],
    knobs: [
      { key: "cmd", label: "Requested action", min: 0, max: CMDS.length - 1, value: 4, fmt: function (v) { return CMDS[Math.round(v)].c; } },
      { key: "mode", label: "Permission mode", min: 0, max: MODES.length - 1, value: 0, fmt: function (v) { return MODES[Math.round(v)]; } }
    ],
    labNote: "The ordering is what makes the layer trustworthy: deny beats mode, and ask beats mode, so no permissive setting can silently unlock a rule you wrote down. Modelled on the Claude Agent SDK's documented six-step evaluation.",
    draw: function (ctx, si, t, st) {
      var r = route(Math.round(st.cmd), Math.round(st.mode));
      var LADDER = ["hooks", "deny rules", "ask rules", "permission mode", "allow rules", "callback"];
      var x0 = 300, y0 = 92, rowH = 54;
      G.box(ctx, 60, 92, 200, 70, { fill: C.panel, stroke: C.blue, r: 4 });
      G.txt(ctx, "MODEL REQUESTS", 74, 114, { size: 10, weight: 600, color: C.blue });
      G.txt(ctx, CMDS[Math.round(st.cmd)].c, 74, 138, { size: 12, color: C.ink });
      G.arrow(ctx, 260, 127, x0 - 8, y0 + 18, { color: "#3c4954" });
      G.box(ctx, 60, 200, 200, 200, { fill: "#121920", stroke: "#2b353e", r: 4 });
      G.txt(ctx, "CONFIGURED RULES", 74, 222, { size: 10, weight: 600, color: C.faint });
      var yy = 246;
      [["deny", RULES.deny, C.red], ["ask", RULES.ask, C.amber], ["allow", RULES.allow, C.green]].forEach(function (grp) {
        G.txt(ctx, grp[0], 74, yy, { size: 10.5, weight: 600, color: grp[2] }); yy += 18;
        grp[1].forEach(function (s) { G.txt(ctx, s, 84, yy, { size: 10, color: C.dim }); yy += 16; });
        yy += 6;
      });
      for (var i = 0; i < LADDER.length; i++) {
        var s = r.steps[i], y = y0 + i * rowH;
        var reached = !!s;
        ctx.save(); G.alpha(ctx, reached ? 1 : 0.28);
        var isTerm = reached && (s.v === "BLOCKED" || s.v === "APPROVE" || s.v === "MATCH" || s.v === "PROMPT" || s.v === "SKIPPED" || s.v === "ROUTE");
        G.box(ctx, x0, y, 330, 40, { fill: isTerm ? "#161d24" : C.panel, stroke: isTerm ? (s ? s.col : "#2b353e") : "#2b353e", lw: isTerm ? 2 : 1.2, r: 4 });
        G.txt(ctx, String(i + 1), x0 + 16, y + 20, { size: 10, color: C.faint });
        G.txt(ctx, LADDER[i], x0 + 36, y + 20, { size: 12, weight: 600, color: reached ? C.ink : C.faint });
        if (reached) G.txt(ctx, s.v, x0 + 314, y + 20, { size: 11, weight: 600, color: s.col, align: "right" });
        ctx.restore();
        if (i < LADDER.length - 1 && r.steps[i + 1]) G.arrow(ctx, x0 + 165, y + 40, x0 + 165, y + rowH - 2, { color: "#3c4954", head: 4 });
      }
      var ox = 700;
      G.box(ctx, ox, 92, 250, 150, { fill: C.panel, stroke: r.col, lw: 2, r: 5 });
      G.txt(ctx, "OUTCOME", ox + 16, 116, { size: 10, weight: 600, color: C.faint });
      G.txt(ctx, r.out.toUpperCase(), ox + 16, 146, { size: 18, weight: 600, color: r.col });
      var words = r.why.split(" "), lineArr = [], cur = "";
      words.forEach(function (w) { if ((cur + " " + w).length > 30) { lineArr.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; });
      lineArr.push(cur);
      lineArr.slice(0, 4).forEach(function (L, i2) { G.txt(ctx, L, ox + 16, 176 + i2 * 17, { size: 10.5, color: C.dim }); });
      G.box(ctx, ox, 262, 250, 138, { fill: "#121920", stroke: "#2b353e", r: 4 });
      G.txt(ctx, "WHY ORDER MATTERS", ox + 16, 284, { size: 10, weight: 600, color: C.faint });
      ["deny  >  mode", "ask  >  mode", "mode  >  allow", "", "a permissive mode cannot", "override a written rule"].forEach(function (L2, i3) {
        G.txt(ctx, L2, ox + 16, 308 + i3 * 17, { size: 10.5, color: i3 < 3 ? C.ink : C.dim });
      });
    }
  });

  /* ============ F11 : approval fatigue ============ */
  function fatigue(st) {
    var N = Math.max(1, Math.round(st.N)), a0 = st.a0 / 100, h = Math.max(1e-3, st.h), red = st.red / 100;
    function meanCatch(n) {
      var s = 0;
      for (var i = 1; i <= n; i++) s += a0 * Math.pow(0.5, (i - 1) / h);
      return n > 0 ? s / n : 0;
    }
    var N2 = Math.max(1, Math.round(N * (1 - red)));
    return { N: N, N2: N2, a0: a0, h: h, base: meanCatch(N), sand: meanCatch(N2), curve: function (i) { return a0 * Math.pow(0.5, (i - 1) / h); } };
  }
  mk({
    id: "fig-fatigue", w: 1000, h: 566, dur: 2, autoplay: false, resume: false,
    aria: "An interactive model of approval fatigue: per-prompt vigilance decays with the number of prompts, so reducing the number of prompts raises the probability that the one dangerous action is caught.",
    stages: [{ label: "Vigilance decay", cam: [500, 260, 1], caption: "Per-prompt vigilance decays as prompts accumulate. Fewer prompts is not laziness; it is how you get supervision back." }],
    knobs: [
      { key: "N", label: "Approval prompts per session", min: 10, max: 400, value: 220, step: 5, fmt: function (v) { return Math.round(v) + " prompts"; } },
      { key: "a0", label: "Vigilance on the first prompt", min: 40, max: 99, value: 92, step: 1, fmt: function (v) { return v + "%"; } },
      { key: "h", label: "Vigilance half-life", min: 5, max: 200, value: 45, step: 5, fmt: function (v) { return v + " prompts"; } },
      { key: "red", label: "Prompts removed by a sandbox", min: 0, max: 95, value: 84, step: 1, fmt: function (v) { return v + "%"; } }
    ],
    labNote: "Model the chance a reviewer catches a bad action at prompt \\(n\\) as \\(a(n)=a_0 2^{-n/h}\\), and place the one dangerous action uniformly among the \\(N\\) prompts of a session. Expected catch rate is \\(\\bar a = \\frac1N\\sum_n a(n)\\), which <em>falls</em> as \\(N\\) grows. Anthropic reports that users approved roughly 93% of Claude Code permission prompts, and that an OS-level sandbox removed about 84% of the prompts. Half-life and initial vigilance here are illustrative parameters, not measurements.",
    draw: function (ctx, si, t, st) {
      var f = fatigue(st);
      var px = 90, py = 74, pw = 520, ph = 300;
      G.grid(ctx, px, py, pw, ph, 10, 5);
      G.line(ctx, px, py + ph, px + pw, py + ph, { color: "#41505c" });
      G.line(ctx, px, py, px, py + ph, { color: "#41505c" });
      G.txt(ctx, "1.0", px - 8, py, { size: 9.5, color: C.faint, align: "right" });
      G.txt(ctx, "0", px - 8, py + ph, { size: 9.5, color: C.faint, align: "right" });
      G.txt(ctx, "prompt number within the session", px + pw / 2, py + ph + 34, { size: 11, color: C.dim, align: "center" });
      ctx.save(); ctx.translate(px - 50, py + ph / 2); ctx.rotate(-Math.PI / 2);
      G.txt(ctx, "probability this prompt is really read", 0, 0, { size: 11, color: C.dim, align: "center" }); ctx.restore();
      var pts = [];
      for (var i = 1; i <= f.N; i++) pts.push([px + pw * (i - 1) / Math.max(1, f.N - 1), py + ph - ph * f.curve(i)]);
      /* sandboxed region shading */
      var xs = px + pw * (f.N2 - 1) / Math.max(1, f.N - 1);
      ctx.save(); G.alpha(ctx, 0.16);
      G.box(ctx, px, py, xs - px, ph, { fill: C.green, r: 0 });
      ctx.restore();
      G.line(ctx, xs, py, xs, py + ph, { color: C.green, dash: [5, 4], lw: 1.6 });
      G.txt(ctx, "sandboxed session ends here", xs + 8, py + 16, { size: 10, weight: 600, color: C.green });
      G.curve(ctx, pts, { color: C.amber, lw: 2.4 });
      /* mean lines */
      function meanLine(v, col, lbl) {
        var y = py + ph - ph * v;
        G.line(ctx, px, y, px + pw, y, { color: col, dash: [3, 5], lw: 1.4 });
        G.txt(ctx, lbl + " " + (100 * v).toFixed(0) + "%", px + pw - 6, y - 10, { size: 10.5, weight: 600, color: col, align: "right" });
      }
      meanLine(f.base, C.red, "mean, unsandboxed");
      meanLine(f.sand, C.green, "mean, sandboxed");
      for (var g = 0; g <= 5; g++) G.txt(ctx, Math.round(f.N * g / 5), px + pw * g / 5, py + ph + 16, { size: 9.5, color: C.faint, align: "center" });

      var bx = 660;
      G.box(ctx, bx, 74, 290, 300, { fill: C.panel, stroke: "#2b353e", r: 5 });
      G.txt(ctx, "EXPECTED SUPERVISION", bx + 16, 98, { size: 10, weight: 600, color: C.faint });
      G.txt(ctx, "prompts shown", bx + 16, 130, { size: 11, color: C.dim });
      G.txt(ctx, f.N + "  \u2192  " + f.N2, bx + 274, 130, { size: 13, weight: 600, color: C.ink, align: "right" });
      G.txt(ctx, "chance the bad one is caught", bx + 16, 162, { size: 11, color: C.dim });
      G.txt(ctx, (100 * f.base).toFixed(0) + "%", bx + 150, 190, { size: 22, weight: 600, color: C.red, align: "right" });
      G.txt(ctx, "\u2192", bx + 168, 190, { size: 16, color: C.faint });
      G.txt(ctx, (100 * f.sand).toFixed(0) + "%", bx + 274, 190, { size: 22, weight: 600, color: C.green, align: "right" });
      G.line(ctx, bx + 16, 214, bx + 274, 214, { color: "#2b353e" });
      var lines = [
        "Removing prompts did not weaken",
        "oversight. It restored it.",
        "",
        "The dangerous move is the one",
        "that arrives at prompt 180, when",
        "the reviewer is clicking through",
        "on muscle memory."
      ];
      lines.forEach(function (L, i2) { G.txt(ctx, L, bx + 16, 238 + i2 * 19, { size: 11, color: i2 < 2 ? C.ink : C.dim }); });

      G.box(ctx, 90, 412, 860, 92, { fill: "#121920", stroke: "#2b353e", r: 5 });
      G.txt(ctx, "AND THE FAILURE MODE THIS DOES NOT FIX", 108, 436, { size: 10, weight: 600, color: C.amber });
      G.txt(ctx, "When the malicious instruction arrives through the user \u2014 a pasted prompt from a phishing email \u2014 there is nothing", 108, 462, { size: 12, color: C.ink });
      G.txt(ctx, "anomalous for a classifier to catch and nothing unusual for a reviewer to see. Only the environment holds.", 108, 484, { size: 12, color: C.ink });
    }
  });

  /* ============ F12 : containment ============ */
  mk({
    id: "fig-contain", w: 1000, h: 640, dur: 2.2,
    aria: "Three containment patterns \u2014 ephemeral container, human-in-the-loop sandbox, sealed VM \u2014 followed by two real failures in which the boundary held but data still left.",
    stages: [
      { label: "Risk", cam: [480, 130, 1.15], caption: "Risk is likelihood times damage. Training drives down the first term; only containment touches the second." },
      { label: "Ephemeral container", cam: [430, 290, 1.06], caption: "Pattern one: server-side, per-session filesystem, nothing of the user's machine in reach. Low ceiling, tiny blast radius." },
      { label: "HITL sandbox", cam: [500, 290, 1.06], caption: "Pattern two: the agent runs on your machine, reads freely, writes only inside the workspace, and gets no network by default." },
      { label: "Sealed VM", cam: [570, 290, 1.06], caption: "Pattern three: a real VM with its own kernel. Credentials stay in the host keychain and never enter the guest." },
      { label: "Match the user", cam: [500, 300, 1.02], caption: "The choice is not about the model. It is about whether this user can evaluate what the agent is about to do." },
      { label: "Failure 1", cam: [500, 360, 1.02], caption: "First real failure: the egress allowlist passed traffic to an approved domain, and the data left through it." },
      { label: "Capability, not destination", cam: [500, 360, 1.02], caption: "An allowlist is not a destination filter. It is a capability grant \u2014 every function reachable at that domain is now in scope." },
      { label: "Failure 2", cam: [500, 400, 1.0], caption: "Second real failure: config in a freshly cloned repository executed before the trust prompt was shown." },
      { label: "The lesson", cam: [500, 320, 1.0], caption: "Across all of it, the battle-tested primitives held and the custom pieces broke." }
    ],
    draw: function (ctx, si, t) {
      G.txt(ctx, "Risk  =  P(failure)  \u00d7  damage(failure)", 500, 62, { size: 16, weight: 600, color: C.ink, align: "center", mono: false });
      if (si >= 0) {
        ctx.save(); G.alpha(ctx, si === 0 ? G.easeOut(t) : 0.85);
        G.txt(ctx, "\u2193 model training, evals, classifiers", 330, 92, { size: 11, color: C.green, align: "center" });
        G.txt(ctx, "\u2193 sandboxes, VMs, egress control", 700, 92, { size: 11, color: C.blue, align: "center" });
        ctx.restore();
      }
      var pats = [
        { n: "EPHEMERAL CONTAINER", p: "claude.ai code execution", x: 70, col: C.blue, rows: ["gVisor, server-side", "per-session filesystem", "no access to your machine", "blast radius: the container"], ceil: 0.3, s: 1 },
        { n: "HITL SANDBOX", p: "Claude Code", x: 360, col: C.amber, rows: ["Seatbelt / bubblewrap", "reads allowed", "writes inside the workspace", "network denied by default"], ceil: 0.72, s: 2 },
        { n: "SEALED VM", p: "Claude Cowork", x: 650, col: C.green, rows: ["vendor hypervisor", "own kernel and filesystem", "only the mounted workspace", "credentials stay on the host"], ceil: 0.55, s: 3 }
      ];
      pats.forEach(function (P) {
        if (si < P.s) return;
        var a = si === P.s ? G.easeOut(t) : 1;
        ctx.save(); G.alpha(ctx, a);
        G.box(ctx, P.x, 130, 280, 190, { fill: C.panel, stroke: P.col, r: 5 });
        G.txt(ctx, P.n, P.x + 16, 154, { size: 11.5, weight: 600, color: P.col });
        G.txt(ctx, P.p, P.x + 16, 172, { size: 10, color: C.faint });
        P.rows.forEach(function (r, i) { G.txt(ctx, r, P.x + 16, 200 + i * 22, { size: 11, color: C.dim }); });
        G.box(ctx, P.x + 16, 296, 248, 10, { fill: "#131a20", stroke: "#232c34", r: 2 });
        G.box(ctx, P.x + 16, 296, 248 * P.ceil, 10, { fill: P.col, r: 2 });
        ctx.restore();
      });
      if (si >= 4) {
        ctx.save(); G.alpha(ctx, si === 4 ? G.easeOut(t) : 1);
        G.txt(ctx, "capability ceiling \u2192", 70, 332, { size: 10, color: C.faint });
        G.txt(ctx, "match isolation strength to the user's capacity for oversight", 500, 356, { size: 13, weight: 600, color: C.ink, align: "center", mono: false });
        ctx.restore();
      }
      if (si >= 5) {
        var a5 = si === 5 ? G.easeOut(t) : 1;
        ctx.save(); G.alpha(ctx, a5);
        G.box(ctx, 70, 380, 860, 104, { fill: "#1c1210", stroke: C.red, r: 5 });
        G.txt(ctx, "THE SANDBOX WORKED AND THE DATA LEFT ANYWAY", 88, 402, { size: 11, weight: 600, color: C.red });
        G.txt(ctx, "poisoned file in the workspace  \u2192  agent calls an approved API with an attacker's key", 88, 426, { size: 11.5, color: C.ink });
        G.txt(ctx, "\u2192  the proxy sees an allowed domain  \u2192  the upload succeeds", 88, 446, { size: 11.5, color: C.ink });
        if (si >= 6) G.txt(ctx, "fix: a proxy inside the boundary passing only the session's own token", 88, 468, { size: 11, color: C.green });
        ctx.restore();
      }
      if (si >= 7) {
        ctx.save(); G.alpha(ctx, si === 7 ? G.easeOut(t) : 1);
        G.box(ctx, 70, 496, 420, 82, { fill: "#1c1608", stroke: C.amber, r: 5 });
        G.txt(ctx, "EVERYTHING BEFORE THE TRUST DIALOG", 88, 518, { size: 10.5, weight: 600, color: C.amber });
        G.txt(ctx, "project config parsed at startup, before", 88, 540, { size: 11, color: C.ink });
        G.txt(ctx, "\u201cdo you trust this folder?\u201d was ever shown", 88, 558, { size: 11, color: C.ink });
        ctx.restore();
      }
      if (si >= 8) {
        ctx.save(); G.alpha(ctx, si === 8 ? G.easeOut(t) : 1);
        G.box(ctx, 510, 496, 420, 82, { fill: "#0d1a16", stroke: C.green, r: 5 });
        G.txt(ctx, "THE PATTERN", 528, 518, { size: 10.5, weight: 600, color: C.green });
        G.txt(ctx, "hypervisors, seccomp and gVisor held.", 528, 540, { size: 11, color: C.ink });
        G.txt(ctx, "The custom allowlist proxy did not.", 528, 558, { size: 11, color: C.ink });
        ctx.restore();
      }
    }
  });
})();
