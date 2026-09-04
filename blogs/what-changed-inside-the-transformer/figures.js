/* ==========================================================================
   What Changed Inside the Transformer? — figure engine and animations
   All figures share one playback controller so that every animated panel
   satisfies the same contract: Previous / Play-Pause / Next, 0.5x-1x-2x speed,
   a frame counter, keyboard access, reduced-motion support, and autoplay that
   yields to manual interaction.
   ========================================================================== */
(function () {
  "use strict";

  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var C = {
    ink: "#e4eaee", dim: "#93a0a8", faint: "#68747c", line: "#39454e", grid: "#232d35",
    accent: "#3fd1a0", warm: "#f2b45f", cool: "#5ab2e8", red: "#ef7a7a", violet: "#b48ce8",
    bg: "#0f1317", box: "#161d24", box2: "#1b242c"
  };
  var MONO = "'IBM Plex Mono', ui-monospace, monospace";
  var DISP = "'Bricolage Grotesque', system-ui, sans-serif";

  /* ---------- tiny SVG helpers ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function txt(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" fill="' + (o.fill || C.ink) + '" font-family="' + (o.disp ? DISP : MONO) +
      '" font-size="' + (o.size || 12) + '" font-weight="' + (o.weight || 400) + '" text-anchor="' + (o.anchor || "start") +
      '"' + (o.ls ? ' letter-spacing="' + o.ls + '"' : "") + (o.op != null ? ' opacity="' + o.op + '"' : "") + ">" + esc(s) + "</text>";
  }
  function rect(x, y, w, h, o) {
    o = o || {};
    return '<rect x="' + x + '" y="' + y + '" width="' + Math.max(0, w) + '" height="' + Math.max(0, h) +
      '" rx="' + (o.r || 2) + '" fill="' + (o.fill || "none") + '" stroke="' + (o.stroke || "none") +
      '" stroke-width="' + (o.sw || 1) + '"' + (o.op != null ? ' opacity="' + o.op + '"' : "") +
      (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>";
  }
  function line(x1, y1, x2, y2, o) {
    o = o || {};
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.stroke || C.line) +
      '" stroke-width="' + (o.sw || 1) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") +
      (o.op != null ? ' opacity="' + o.op + '"' : "") + (o.cap ? ' stroke-linecap="' + o.cap + '"' : "") + "/>";
  }
  function path(d, o) {
    o = o || {};
    return '<path d="' + d + '" fill="' + (o.fill || "none") + '" stroke="' + (o.stroke || C.line) +
      '" stroke-width="' + (o.sw || 1) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") +
      (o.op != null ? ' opacity="' + o.op + '"' : "") + (o.cap ? ' stroke-linecap="' + o.cap + '"' : "") +
      (o.join ? ' stroke-linejoin="' + o.join + '"' : "") + "/>";
  }
  function circ(cx, cy, r, o) {
    o = o || {};
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (o.fill || "none") +
      '" stroke="' + (o.stroke || "none") + '" stroke-width="' + (o.sw || 1) + '"' +
      (o.op != null ? ' opacity="' + o.op + '"' : "") + "/>";
  }
  function svgOpen(vb, h) {
    return '<svg data-camera="1" viewBox="' + vb.join(" ") + '" preserveAspectRatio="xMidYMid meet" role="img" ' +
      'style="max-height:' + (h || "58vh") + '" xmlns="http://www.w3.org/2000/svg">';
  }
  function fmtBytes(b) {
    var u = ["B", "KiB", "MiB", "GiB", "TiB"], i = 0;
    while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
    return (b >= 100 ? b.toFixed(0) : b >= 10 ? b.toFixed(1) : b.toFixed(2)) + " " + u[i];
  }
  function fmtNum(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(n / 1e9 >= 100 ? 0 : 2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
    return String(Math.round(n));
  }
  function fmtTok(s) {
    if (s >= 1048576) return (s / 1048576) + "M";
    if (s >= 1024) return (s / 1024) + "k";
    return String(s);
  }
  function cap(html) { return '<p class="figure-caption">' + html + "</p>"; }
  function legend(items) {
    var h = '<div class="figure-legend">';
    items.forEach(function (it) { h += '<span><i style="background:' + it[0] + '"></i>' + esc(it[1]) + "</span>"; });
    return h + "</div>";
  }

  /* ==========================================================================
     Playback controller
     ========================================================================== */
  function Figure(root, opts) {
    this.root = root;
    this.stage = root.querySelector(".animation-stage");
    this.status = root.querySelector(".animation-status");
    this.total = opts.total;
    this.interval = opts.interval || 3200;
    this.renderFrame = opts.render;
    this.onVariant = opts.onVariant || null;
    this.frame = 0;
    this.speed = 1;
    this.userPaused = RM;
    this.visible = false;
    this.suspended = false;
    this.timer = null;
    this.nudgeTimer = null;
    this.raf = null;
    this.currentView = null;
    this.bind();
    this.draw();
    this.observe();
    this.syncPlayButton();
  }

  Figure.prototype.bind = function () {
    var self = this;
    this.root.querySelectorAll(".animation-controls [data-action]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-action");
        if (a === "previous") { self.step(-1); self.nudge(); }
        else if (a === "next") { self.step(1); self.nudge(); }
        else if (a === "play-pause") { self.toggle(); }
      });
    });
    this.root.querySelectorAll(".animation-controls [data-speed]").forEach(function (b) {
      b.addEventListener("click", function () {
        self.speed = parseFloat(b.getAttribute("data-speed"));
        self.root.querySelectorAll(".animation-controls [data-speed]").forEach(function (o) {
          o.setAttribute("aria-pressed", o === b ? "true" : "false");
        });
        self.restartTimer();
      });
    });
    this.root.querySelectorAll(".panel-toggles button").forEach(function (b) {
      b.addEventListener("click", function () {
        var group = b.parentNode;
        group.querySelectorAll("button").forEach(function (o) {
          o.setAttribute("aria-pressed", o === b ? "true" : "false");
        });
        if (self.onVariant) self.onVariant(b.dataset);
        self.draw();
      });
    });
    this.root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { self.step(-1); self.nudge(); e.preventDefault(); }
      else if (e.key === "ArrowRight") { self.step(1); self.nudge(); e.preventDefault(); }
      else if (e.key === " " || e.key === "Enter") {
        if (e.target === self.root) { self.toggle(); e.preventDefault(); }
      }
    });
  };

  Figure.prototype.observe = function () {
    var self = this;
    if (!("IntersectionObserver" in window)) { this.visible = true; this.restartTimer(); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { self.visible = en.isIntersecting && en.intersectionRatio > 0.2; });
      self.restartTimer();
    }, { threshold: [0, 0.2, 0.6] }).observe(this.root);
  };

  Figure.prototype.shouldPlay = function () {
    return !RM && !this.userPaused && !this.suspended && this.visible && this.total > 1;
  };

  Figure.prototype.restartTimer = function () {
    var self = this;
    clearInterval(this.timer);
    this.timer = null;
    if (this.shouldPlay()) {
      this.timer = setInterval(function () { self.step(1); }, this.interval / this.speed);
    }
    this.syncPlayButton();
  };

  Figure.prototype.syncPlayButton = function () {
    var b = this.root.querySelector('[data-action="play-pause"]');
    if (!b) return;
    var playing = !!this.timer;
    b.textContent = playing ? "Pause" : "Play";
    b.setAttribute("aria-label", playing ? "Pause animation" : "Play animation");
    b.setAttribute("aria-pressed", playing ? "true" : "false");
  };

  Figure.prototype.toggle = function () {
    this.userPaused = !this.userPaused;
    this.suspended = false;
    clearTimeout(this.nudgeTimer);
    this.restartTimer();
  };

  /* Manual stepping suspends autoplay; it resumes after a documented 12s idle. */
  Figure.prototype.nudge = function () {
    var self = this;
    if (RM || this.userPaused) return;
    this.suspended = true;
    this.restartTimer();
    clearTimeout(this.nudgeTimer);
    this.nudgeTimer = setTimeout(function () {
      self.suspended = false;
      self.restartTimer();
    }, 12000);
  };

  Figure.prototype.step = function (d) { this.setFrame(this.frame + d); };

  Figure.prototype.setFrame = function (i) {
    this.frame = ((i % this.total) + this.total) % this.total;
    this.draw();
  };

  Figure.prototype.draw = function () {
    var out = this.renderFrame(this.frame, this);
    if (typeof out === "string") out = { html: out };
    this.stage.innerHTML = out.html;
    var lbl = out.label ? " · " + out.label : "";
    this.status.textContent = "Frame " + String(this.frame + 1).padStart(2, "0") + " / " +
      String(this.total).padStart(2, "0") + lbl;
    var svg = this.stage.querySelector("svg[data-camera]");
    if (svg && out.view) this.tween(svg, out.view);
    else if (svg) this.currentView = null;
  };

  Figure.prototype.tween = function (svg, to) {
    var self = this;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (RM || !this.currentView) {
      svg.setAttribute("viewBox", to.join(" "));
      this.currentView = to.slice();
      return;
    }
    var from = this.currentView.slice();
    var same = from.every(function (v, i) { return Math.abs(v - to[i]) < 0.5; });
    if (same) { svg.setAttribute("viewBox", to.join(" ")); this.currentView = to.slice(); return; }
    var t0 = performance.now(), dur = 540;
    function stepFn(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      var cur = from.map(function (v, i) { return v + (to[i] - v) * e; });
      self.currentView = cur;
      svg.setAttribute("viewBox", cur.map(function (v) { return v.toFixed(2); }).join(" "));
      if (p < 1) self.raf = requestAnimationFrame(stepFn);
      else { self.currentView = to.slice(); self.raf = null; }
    }
    this.raf = requestAnimationFrame(stepFn);
  };

  function mount(id, opts) {
    var root = document.getElementById(id);
    if (!root) return null;
    return new Figure(root, opts);
  }

  /* ==========================================================================
     FIGURE 1 — the morph: 2017 decoder block to a 2026 block, one edit at a time
     ========================================================================== */
  var M_W = 1060, M_H = 700;

  function morphSpec(f) {
    var s = {
      inputLabel: f <= 2 ? "Token embedding  +  positional embedding" : "Token embedding",
      inputNote: f === 0 ? "sinusoidal, added once" : (f <= 2 ? "learned table, added once" : "position now enters inside attention"),
      attn: {
        norm: f === 0 ? null : (f <= 1 ? "LayerNorm" : "RMSNorm"),
        streamNorm: f === 0 ? "LayerNorm" : null,
        title: "Multi-Head Attention",
        lines: ["8 query heads · 8 KV heads", "dropout p = 0.1", "bias on Q, K, V, O"]
      },
      ffn: {
        norm: f === 0 ? null : (f <= 1 ? "LayerNorm" : "RMSNorm"),
        streamNorm: f === 0 ? "LayerNorm" : null,
        title: "Feed-forward network",
        lines: ["ReLU · 2 matrices", "d_ff = 4d", "dropout p = 0.1"]
      }
    };
    // 3: RoPE
    if (f >= 3) s.attn.lines[0] = "8 query heads · 8 KV heads  +  RoPE on Q,K";
    // 4: dropout removed
    if (f >= 4) {
      s.attn.lines = s.attn.lines.filter(function (l) { return l.indexOf("dropout") < 0; });
      s.ffn.lines = s.ffn.lines.filter(function (l) { return l.indexOf("dropout") < 0; });
    }
    // 5: biases removed
    if (f >= 5) s.attn.lines = s.attn.lines.filter(function (l) { return l.indexOf("bias") < 0; });
    // 6: SwiGLU
    if (f >= 6) { s.ffn.title = "SwiGLU feed-forward"; s.ffn.lines = ["SiLU gate ⊙ value · 3 matrices", "d_ff = 8d/3"]; }
    // 7: GQA
    if (f >= 7) { s.attn.title = "Grouped-Query Attention"; s.attn.lines[0] = "32 query heads · 8 KV heads  +  RoPE"; }
    // 8: QK-norm
    if (f >= 8) s.attn.lines.push("RMSNorm on Q and K");
    // 9: sliding window
    if (f >= 9) s.attn.lines.push("sliding window 4096 · 3 of every 4 layers");
    // 10: MoE
    if (f >= 10) { s.ffn.title = "Mixture of Experts"; s.ffn.lines = ["256 SwiGLU experts · top-8 routed", "router: one d × N matrix"]; }
    // 11: shared expert
    if (f >= 11) s.ffn.lines.push("+ 1 shared expert, always active");
    // 12: gate / sinks
    if (f >= 12) s.attn.lines.push("output gate σ(·)  ·  attention sink logit");
    return s;
  }

  var MORPH_META = [
    { t: "2017 · the original decoder block", c: "<strong>The starting point.</strong> Positional information is a sinusoid added to the embedding. Normalization sits <em>after</em> each residual add, directly on the identity path. The feed-forward network is two matrices with ReLU between them, and dropout is applied everywhere.", focus: null },
    { t: "Edit 1 · pre-norm", c: "<strong>Move normalization onto the branch.</strong> The residual path becomes a literal identity, so gradients reach layer 1 without passing through <em>L</em> normalization Jacobians. GPT-2 already did this in 2019; the learning-rate warmup requirement relaxes and depth becomes affordable.", focus: "norm" },
    { t: "Edit 2 · RMSNorm", c: "<strong>Delete the mean.</strong> RMSNorm keeps the rescaling and drops the re-centering and the shift parameter. One cross-feature reduction instead of two — which, under tensor parallelism, is one collective instead of two, twice per block, for every token.", focus: "norm" },
    { t: "Edit 3 · RoPE", c: "<strong>Position moves inside attention.</strong> Instead of adding a vector at the input and hoping it survives 40 layers of mixing, each layer rotates its own queries and keys by an angle proportional to position. The inner product then depends only on the offset.", focus: "attn" },
    { t: "Edit 4 · no dropout", c: "<strong>Nothing to overfit.</strong> Dropout was built for many-epoch training on small corpora. Frontier pretraining is a single pass over trillions of tokens, so the regularizer buys nothing and costs throughput.", focus: "both" },
    { t: "Edit 5 · no biases", c: "<strong>Drop the bias vectors.</strong> After a normalization layer with its own learned scale, an additive bias on a linear projection is largely redundant. gpt-oss is the notable model that kept them.", focus: "attn" },
    { t: "Edit 6 · SwiGLU", c: "<strong>The feed-forward network learns to gate.</strong> Two matrices become three: a gate path, a value path, and an elementwise product between them. Shrinking d_ff to 8d/3 keeps the parameter count identical to the old 4d design.", focus: "ffn" },
    { t: "Edit 7 · grouped-query attention", c: "<strong>Fewer keys and values than queries.</strong> Thirty-two query heads now share eight KV heads. Attention FLOPs are unchanged; the KV cache and the bytes read per decode step drop fourfold. In a memory-bound regime that is a fourfold speedup.", focus: "attn" },
    { t: "Edit 8 · QK-norm", c: "<strong>Bound the attention logits.</strong> Nothing constrains ‖q‖ or ‖k‖, so logits can grow until softmax saturates and bf16 loses precision. Normalizing q and k per head caps the logit scale no matter what the projections learn.", focus: "attn" },
    { t: "Edit 9 · sliding window", c: "<strong>Most layers stop looking far.</strong> Three layers in four attend only to the last 4096 tokens, so their KV cache stops growing with context. The remaining layer keeps a global view, and depth carries information between windows.", focus: "attn" },
    { t: "Edit 10 · mixture of experts", c: "<strong>Parameters without FLOPs.</strong> One feed-forward network becomes 256, and a router picks eight per token. Total capacity scales with the expert count; compute per token scales with the eight that actually run.", focus: "ffn" },
    { t: "Edit 11 · shared expert", c: "<strong>One expert everyone uses.</strong> Some computation is genuinely universal. Making one expert always-on stops the 256 routed experts from each independently relearning it.", focus: "ffn" },
    { t: "Edit 12 · gates and sinks", c: "<strong>Let attention say nothing.</strong> Softmax forces the weights to sum to one, so a head with nothing to retrieve still has to dump its mass somewhere. A learned sink logit or a sigmoid output gate gives it a legitimate no-op.", focus: "attn" },
    { t: "2026 · a frontier block", c: "<strong>Same skeleton.</strong> Attention, residual add, feed-forward, residual add — exactly the 2017 control flow. Every organ inside it has been replaced, and almost every replacement was motivated by memory bandwidth, numerical stability, or serving cost rather than by better language modeling.", focus: null }
  ];

  function morphRender(f) {
    var s = morphSpec(f), meta = MORPH_META[f];
    var SP = 205;                    // residual spine x
    var BX = 300, BW = 660;          // branch box geometry
    var y = 118;
    var g = "";
    var focusY = null, focusH = null;

    g += rect(0, 0, M_W, M_H, { fill: C.bg });

    // input
    g += rect(BX - 60, 44, BW + 60, 46, { fill: C.box, stroke: f <= 3 ? C.warm : C.line, sw: f === 3 ? 1.8 : 1 });
    g += txt(BX - 44, 66, s.inputLabel, { size: 14, weight: 600, fill: C.ink });
    g += txt(BX - 44, 82, s.inputNote, { size: 10.5, fill: f === 3 ? C.warm : C.faint });
    g += line(SP, 90, SP, 118, { stroke: C.line, sw: 2 });

    function unit(u, key) {
      var rows = [];
      if (u.norm) rows.push({ kind: "norm", label: u.norm });
      rows.push({ kind: "core", label: u.title, lines: u.lines });
      var hCore = 34 + u.lines.length * 17;
      var hh = (u.norm ? 34 + 12 : 0) + hCore;
      var top = y;
      var out = "";
      var isFocus = meta.focus === key || meta.focus === "both";

      // branch bracket out of the spine and back
      var bot = top + hh + 34;
      out += path("M " + SP + " " + top + " L " + (BX - 26) + " " + top, { stroke: C.line, sw: 1.4 });
      out += path("M " + (BX - 26) + " " + (bot - 34) + " L " + SP + " " + (bot - 34), { stroke: C.line, sw: 1.4 });
      out += line(BX - 26, top, BX - 26, bot - 34, { stroke: C.line, sw: 1.4 });
      // spine through the branch (the identity path)
      out += line(SP, top, SP, bot, { stroke: meta.focus === "norm" ? C.accent : C.line, sw: 3 });

      var yy = top;
      if (u.norm) {
        var nf = meta.focus === "norm";
        out += rect(BX, yy - 17, BW, 34, { fill: nf ? "#173028" : C.box2, stroke: nf ? C.accent : C.line, sw: nf ? 1.8 : 1 });
        out += txt(BX + 14, yy + 5, u.norm, { size: 12.5, weight: 600, fill: nf ? C.accent : C.dim });
        out += txt(BX + BW - 14, yy + 5, "inside the branch", { size: 10, fill: C.faint, anchor: "end" });
        yy += 46;
      }
      var cf = isFocus;
      out += rect(BX, yy - 17, BW, hCore, { fill: cf ? "#1c2a33" : C.box, stroke: cf ? C.cool : C.line, sw: cf ? 1.8 : 1 });
      out += txt(BX + 14, yy + 4, u.title, { size: 14.5, weight: 700, disp: true, fill: cf ? C.cool : C.ink });
      u.lines.forEach(function (l, i) {
        out += txt(BX + 14, yy + 24 + i * 17, "· " + l, { size: 11.5, fill: cf ? "#cfe0ea" : C.dim });
      });
      if (cf) { focusY = yy - 34; focusH = hCore + 60; }

      // add node
      out += circ(SP, bot, 13, { fill: C.bg, stroke: C.line, sw: 1.6 });
      out += txt(SP, bot + 5, "+", { size: 16, anchor: "middle", fill: C.ink, weight: 600 });
      out += line(BX - 26, bot - 34, BX - 26, bot, { stroke: C.line, sw: 1.4 });
      out += path("M " + (BX - 26) + " " + bot + " L " + (SP + 14) + " " + bot, { stroke: C.line, sw: 1.4 });

      y = bot + 14;
      if (u.streamNorm) {
        var sf = meta.focus === "norm";
        out += line(SP, bot + 13, SP, y + 6, { stroke: C.red, sw: 3 });
        out += rect(SP - 140, y + 6, 280, 32, { fill: "#2a1c1c", stroke: C.red, sw: 1.4 });
        out += txt(SP, y + 27, u.streamNorm + "  (on the residual path)", { size: 11, anchor: "middle", fill: C.red, weight: 600 });
        y += 38;
      }
      y += 30;
      return out;
    }

    g += unit(s.attn, "attn");
    g += line(SP, y - 30, SP, y, { stroke: C.line, sw: 3 });
    g += unit(s.ffn, "ffn");

    g += line(SP, y - 30, SP, y + 8, { stroke: C.line, sw: 3 });
    g += txt(SP + 18, y + 12, "to the next block  ×  " + (f >= 9 ? "64" : f >= 6 ? "32" : "12") + " layers", { size: 11, fill: C.faint });

    // stage rail on the right
    var railX = M_W - 34;
    for (var i = 0; i < 14; i++) {
      var on = i <= f;
      g += rect(railX, 60 + i * 22, 14, 14, { fill: on ? (i === f ? C.accent : "#2c4a41") : "#1a2128", stroke: i === f ? C.accent : "#232d35", r: 2 });
    }
    g += txt(railX + 7, 56 + 14 * 22 + 12, "edits", { size: 9, anchor: "middle", fill: C.faint, ls: "0.1em" });

    var view = [0, 0, M_W, M_H];
    if (focusY != null && !RM) view = [BX - 130, Math.max(0, focusY - 30), BW + 240, Math.min(M_H, focusH + 130)];
    else if (meta.focus === "norm" && !RM) view = [SP - 90, 100, 820, 460];

    var html = svgOpen(view, "62vh") + g + "</svg>";
    html += cap("<strong>" + esc(meta.t) + ".</strong> " + meta.c);
    return { html: html, view: view, label: meta.t };
  }

  mount("fig-morph", { total: 14, interval: 4200, render: morphRender });

  /* ==========================================================================
     FIGURE 2 — the residual stream
     ========================================================================== */
  var streamVariant = "pre";
  var S_W = 1020, S_H = 560, NL = 24;

  var STREAM_MODEL = {
    post: {
      name: "Post-LN (2017)",
      norm: function (l) { return 1; },
      grad: function (l) { return Math.pow(0.86, NL - l); },
      color: C.red,
      blurb: "Normalization sits on the identity path. The stream is renormalized every layer, so its scale is flat — but the backward pass multiplies a normalization Jacobian per layer and the signal reaching layer 1 decays geometrically."
    },
    pre: {
      name: "Pre-LN (GPT-2 onward)",
      norm: function (l) { return Math.sqrt(1 + l * 0.62); },
      grad: function (l) { return 1; },
      color: C.accent,
      blurb: "Normalization moves onto the branch. Gradients traverse a pure identity path, so depth is cheap — at the cost of a residual norm that grows like √ℓ, shrinking the relative influence of later layers."
    },
    sandwich: {
      name: "Pre + post norm on the branch",
      norm: function (l) { return Math.sqrt(1 + l * 0.17); },
      grad: function (l) { return 1; },
      color: C.cool,
      blurb: "Normalize the sublayer output as well as its input, still inside the branch. The identity path stays clean and the branch writes a scale-controlled delta, so the stream grows far more slowly. Gemma 3 and Olmo 2/3 sit in this family."
    }
  };

  function streamRender(f) {
    var M = STREAM_MODEL[streamVariant];
    var shown = Math.min(NL, Math.round((f / 11) * NL));
    if (f >= 12) shown = NL;
    var g = rect(0, 0, S_W, S_H, { fill: C.bg });
    var x0 = 92, x1 = S_W - 200, yb = 300, yt = 74;
    var maxN = 4.2;

    // axes
    g += line(x0, yb, x1, yb, { stroke: C.line });
    g += line(x0, yt, x0, yb, { stroke: C.line });
    g += txt(x0, yt - 26, "‖x‖ of the residual stream, and the gradient reaching layer 1", { size: 12, weight: 600, fill: C.ink });
    g += txt(x0, yt - 10, M.name, { size: 10.5, fill: M.color, ls: "0.1em" });
    for (var t = 1; t <= 4; t++) {
      var yy = yb - (t / maxN) * (yb - yt);
      g += line(x0, yy, x1, yy, { stroke: C.grid, dash: "2 5" });
      g += txt(x0 - 8, yy + 4, String(t) + "×", { size: 10, anchor: "end", fill: C.faint });
    }

    // per-layer deltas as ticks + stream norm curve
    var pts = [], gpts = [];
    for (var l = 0; l <= NL; l++) {
      var px = x0 + (l / NL) * (x1 - x0);
      var py = yb - (M.norm(l) / maxN) * (yb - yt);
      var gy = yb - (M.grad(l) / maxN) * (yb - yt);
      pts.push([px, py]); gpts.push([px, gy]);
    }
    function poly(arr, n) {
      var d = "M " + arr[0][0] + " " + arr[0][1];
      for (var i = 1; i <= n; i++) d += " L " + arr[i][0] + " " + arr[i][1];
      return d;
    }
    // written deltas
    for (var l2 = 1; l2 <= shown; l2++) {
      var bx = x0 + (l2 / NL) * (x1 - x0);
      var h = (pts[l2][1] - pts[l2 - 1][1]);
      g += line(bx, pts[l2 - 1][1], bx, pts[l2][1], { stroke: M.color, sw: 5, op: 0.35, cap: "round" });
      if (l2 === shown && f < 12) {
        g += circ(bx, pts[l2][1], 6, { fill: M.color });
        g += txt(bx + 12, pts[l2][1] - 8, "layer " + l2 + " writes its delta", { size: 10.5, fill: M.color });
      }
    }
    if (shown > 0) {
      g += path(poly(pts, shown), { stroke: M.color, sw: 2.4, join: "round" });
      g += path(poly(gpts, shown), { stroke: C.warm, sw: 2, dash: "5 4" });
    }
    g += txt(x1 + 10, pts[NL][1] + 4, "residual ‖x‖", { size: 10.5, fill: M.color });
    g += txt(x1 + 10, gpts[NL][1] - 10, "gradient at layer 1", { size: 10.5, fill: C.warm });
    g += txt(x1 / 2 + x0 / 2, yb + 26, "layer index  0 → 24", { size: 10.5, anchor: "middle", fill: C.faint });

    // schematic of one block for the chosen variant
    var bx0 = 92, by0 = 360, bw = 760;
    g += rect(bx0, by0, bw, 150, { fill: "#121920", stroke: C.grid });
    var sx = bx0 + 40;
    g += line(sx, by0 + 20, sx, by0 + 130, { stroke: streamVariant === "post" ? C.red : C.accent, sw: 3.5 });
    g += txt(sx - 26, by0 + 16, "x", { size: 12, fill: C.ink, weight: 600 });
    g += txt(bx0 + 14, by0 - 10, "one block, drawn for this placement", { size: 10.5, fill: C.faint, ls: "0.1em" });

    var boxes = [];
    if (streamVariant === "post") {
      boxes = [["sublayer F", C.cool, false], ["LayerNorm", C.red, true]];
    } else if (streamVariant === "pre") {
      boxes = [["Norm", C.accent, false], ["sublayer F", C.cool, false]];
    } else {
      boxes = [["Norm", C.accent, false], ["sublayer F", C.cool, false], ["Norm", C.accent, false]];
    }
    var bxx = sx + 90;
    boxes.forEach(function (b, i) {
      var onStream = b[2];
      var yy = onStream ? by0 + 62 : by0 + 40;
      var xx = onStream ? sx - 78 : bxx;
      g += rect(xx, yy, 156, 44, { fill: onStream ? "#2a1c1c" : C.box, stroke: b[1], sw: 1.5 });
      g += txt(xx + 78, yy + 27, b[0], { size: 12.5, anchor: "middle", fill: b[1], weight: 600 });
      if (!onStream) bxx += 178;
    });
    if (streamVariant !== "post") {
      g += path("M " + sx + " " + (by0 + 32) + " L " + (sx + 84) + " " + (by0 + 32), { stroke: C.line, sw: 1.4 });
      g += path("M " + (bxx - 16) + " " + (by0 + 62) + " L " + (bxx + 40) + " " + (by0 + 62) + " L " + (bxx + 40) + " " + (by0 + 110) + " L " + (sx + 14) + " " + (by0 + 110), { stroke: C.line, sw: 1.4 });
      g += circ(sx, by0 + 110, 12, { fill: C.bg, stroke: C.line, sw: 1.5 });
      g += txt(sx, by0 + 115, "+", { size: 15, anchor: "middle", fill: C.ink });
      g += txt(bx0 + 14, by0 + 142, "identity path is untouched — gradient flows to layer 1 unattenuated", { size: 10.5, fill: C.accent });
    } else {
      g += path("M " + sx + " " + (by0 + 32) + " L " + (sx + 84) + " " + (by0 + 32), { stroke: C.line, sw: 1.4 });
      g += path("M " + (sx + 246) + " " + (by0 + 62) + " L " + (sx + 300) + " " + (by0 + 62) + " L " + (sx + 300) + " " + (by0 + 40) + " L " + (sx + 14) + " " + (by0 + 40), { stroke: C.line, sw: 1.4, dash: "4 3" });
      g += txt(bx0 + 14, by0 + 142, "the normalization sits ON the residual path — every backward pass goes through it", { size: 10.5, fill: C.red });
    }

    var caption;
    if (f === 0) caption = "<strong>Setup.</strong> Every sublayer reads the stream, computes a delta, and adds it back. Nothing is ever overwritten. Watch what happens to the magnitude of the stream as those deltas pile up.";
    else if (f < 12) caption = "<strong>Layer " + shown + " of 24.</strong> " + M.blurb;
    else caption = "<strong>All 24 layers.</strong> " + M.blurb + " Switch placements above to compare — the two curves trade off against each other, and every modern design is a choice about which trade you want.";
    var html = svgOpen([0, 0, S_W, S_H], "56vh") + g + "</svg>";
    html += legend([[M.color, "residual norm"], [C.warm, "gradient reaching layer 1"], [C.cool, "sublayer"], [C.accent, "norm on the branch"], [C.red, "norm on the stream"]]);
    html += cap(caption);
    return { html: html, view: [0, 0, S_W, S_H], label: STREAM_MODEL[streamVariant].name };
  }

  mount("fig-stream", {
    total: 13, interval: 1900, render: streamRender,
    onVariant: function (d) { if (d.variant) streamVariant = d.variant; }
  });

  /* ==========================================================================
     FIGURE 3 — rotary position embeddings
     ========================================================================== */
  var R_W = 1020, R_H = 560;

  function dial(cx, cy, r, ang, col, label, sw) {
    var x = cx + r * Math.cos(ang), y = cy - r * Math.sin(ang);
    var o = circ(cx, cy, r, { stroke: C.grid, sw: 1 });
    o += line(cx, cy, x, y, { stroke: col, sw: sw || 2.4, cap: "round" });
    o += circ(x, y, 4.5, { fill: col });
    if (label) o += txt(x + (Math.cos(ang) >= 0 ? 10 : -10), y - 8, label, { size: 11, fill: col, anchor: Math.cos(ang) >= 0 ? "start" : "end", weight: 600 });
    return o;
  }
  function arcBetween(cx, cy, r, a1, a2, col) {
    var lo = Math.min(a1, a2), hi = Math.max(a1, a2);
    var x1 = cx + r * Math.cos(lo), y1 = cy - r * Math.sin(lo);
    var x2 = cx + r * Math.cos(hi), y2 = cy - r * Math.sin(hi);
    var large = (hi - lo) > Math.PI ? 1 : 0;
    return path("M " + x1 + " " + y1 + " A " + r + " " + r + " 0 " + large + " 0 " + x2 + " " + y2, { stroke: col, sw: 2.2, dash: "4 3" });
  }

  var ROPE = [
    { t: "The problem", c: "<strong>Attention cannot see order.</strong> Softmax over a set of key–value pairs is permutation-equivariant: shuffle the inputs and the outputs shuffle with them. Nothing in the mechanism distinguishes the third token from the tenth." },
    { t: "First answer: add a vector", c: "<strong>Absolute embeddings.</strong> Add a position vector to each token embedding, once, at the input. It works, and it has two failure modes: row <em>m</em> does not exist beyond the trained maximum, and the signal has to survive every subsequent layer of mixing." },
    { t: "The requirement", c: "<strong>State what we actually want.</strong> The attention logit between a query at position <em>m</em> and a key at position <em>n</em> should depend on the two vectors and on <em>m−n</em> alone. Write that down and the space of solutions collapses fast." },
    { t: "Rotation, m = 0", c: "<strong>Two dimensions at a time.</strong> Take a coordinate pair and rotate it by an angle proportional to position. At position 0 nothing moves; this is the reference." },
    { t: "Rotation, m = 3", c: "<strong>Position becomes an angle.</strong> The query at position 3 is rotated by 3θ. The vector's length is unchanged — rotations are orthogonal, so no information is destroyed and no scale is introduced." },
    { t: "The inner product", c: "<strong>Absolute positions cancel.</strong> Rotate the query by mθ and the key by nθ. Because R(a)ᵀR(b) = R(b−a), the dot product depends only on the angle between them plus (n−m)θ. Exactly the requirement, with no extra terms in the score." },
    { t: "Shift both", c: "<strong>Translation invariance, demonstrated.</strong> Move both tokens four positions later. Both dials advance, the angle between them is identical, and so is the logit. This is the property absolute embeddings never had." },
    { t: "Many frequencies", c: "<strong>A clock with many hands.</strong> RoPE splits the head into d/2 pairs and gives pair <em>i</em> its own frequency θᵢ = b^(−2i/d). Fast dials resolve nearby offsets precisely; slow dials carry coarse long-range structure." },
    { t: "The logit as a function of offset", c: "<strong>What the model actually sees.</strong> Summing over all frequency bands gives an oscillating logit with a decaying envelope: nearby tokens interact strongly, distant ones weakly. That decay was not designed in — it falls out of the geometric frequency spacing." },
    { t: "The base is a context dial", c: "<strong>Why the base kept growing.</strong> The slowest wavelength is 2πb tokens. If your context exceeds it, the model has never seen a full period of its slowest dial and offsets alias. Llama 2 used 10⁴; Llama 3 uses 5×10⁵; Qwen3 uses 10⁶." },
    { t: "YaRN", c: "<strong>Stretch only what fails.</strong> High-frequency dials already complete many periods inside the training window and extrapolate fine. Low-frequency ones do not. YaRN interpolates the slow bands and leaves the fast ones alone, rather than rescaling everything uniformly." },
    { t: "NoPE", c: "<strong>Or remove it.</strong> The causal mask already breaks the symmetry: token <em>m</em> sees exactly <em>m</em> predecessors. SmolLM3 and Trinity Large drop RoPE entirely in their global attention layers, keeping it only where offsets are short — deleting precisely the frequencies that fail to extrapolate." }
  ];

  function ropeRender(f) {
    var g = rect(0, 0, R_W, R_H, { fill: C.bg });
    var meta = ROPE[f];
    var theta = 0.42;
    g += txt(46, 44, meta.t.toUpperCase(), { size: 10.5, fill: C.faint, ls: "0.18em", weight: 600 });

    if (f === 0 || f === 1) {
      var toks = ["the", "cat", "sat", "on", "mat"];
      var order = f === 0 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4];
      var bx = 70;
      for (var i = 0; i < 5; i++) {
        g += rect(bx + i * 120, 100, 96, 44, { fill: C.box, stroke: C.line });
        g += txt(bx + i * 120 + 48, 128, toks[order[i]], { size: 14, anchor: "middle", fill: C.ink, weight: 600 });
        if (f === 1) {
          g += line(bx + i * 120 + 48, 152, bx + i * 120 + 48, 176, { stroke: C.warm, sw: 1.4 });
          g += rect(bx + i * 120, 176, 96, 32, { fill: "#2a2418", stroke: C.warm });
          g += txt(bx + i * 120 + 48, 197, "p" + i, { size: 12, anchor: "middle", fill: C.warm, weight: 600 });
        }
      }
      if (f === 0) {
        var sh = [3, 0, 4, 1, 2];
        for (var j = 0; j < 5; j++) {
          g += rect(bx + j * 120, 250, 96, 44, { fill: C.box, stroke: C.line, op: 0.75 });
          g += txt(bx + j * 120 + 48, 278, toks[sh[j]], { size: 14, anchor: "middle", fill: C.dim, weight: 600 });
          g += path("M " + (bx + sh[j] * 120 + 48) + " 148 C " + (bx + sh[j] * 120 + 48) + " 200, " + (bx + j * 120 + 48) + " 200, " + (bx + j * 120 + 48) + " 246", { stroke: C.red, sw: 1.2, op: 0.65 });
        }
        g += txt(70, 336, "The attention outputs permute identically. The mechanism has no notion of \"third\" or \"tenth\".", { size: 13, fill: C.red });
        g += txt(70, 366, "softmax(QKᵀ)V  is equivariant under any permutation of the sequence axis", { size: 12, fill: C.dim });
      } else {
        g += rect(70, 250, 576, 96, { fill: "#20191a", stroke: C.red });
        g += txt(90, 280, "Failure mode 1:  row m does not exist for m ≥ S_max.  GPT-2 could not read a 1025th token.", { size: 12.5, fill: C.red });
        g += txt(90, 306, "Failure mode 2:  position enters once, additively, and must survive every layer of mixing.", { size: 12.5, fill: C.red });
        g += txt(90, 332, "And the quantity attention needs is the offset m − n, not m and n separately.", { size: 12.5, fill: C.dim });
      }
    } else if (f === 2) {
      g += rect(70, 96, 880, 210, { fill: C.box, stroke: C.line });
      g += txt(100, 150, "⟨ f(q, m),  f(k, n) ⟩   =   g( q,  k,  m − n )", { size: 26, fill: C.accent, weight: 600, disp: true });
      g += txt(100, 196, "Find an f such that the inner product forgets absolute position entirely.", { size: 13.5, fill: C.ink });
      g += txt(100, 226, "f must preserve norms — otherwise it changes the logit scale with position.", { size: 12.5, fill: C.dim });
      g += txt(100, 252, "f must be applied per token, independently, so it can be fused into the projections.", { size: 12.5, fill: C.dim });
      g += txt(100, 284, "In 2D there is essentially one norm-preserving family: rotations.", { size: 13.5, fill: C.warm, weight: 600 });
    } else if (f === 3 || f === 4 || f === 5 || f === 6) {
      var m = f === 3 ? 0 : f === 4 ? 3 : f === 5 ? 5 : 9;
      var n = f <= 4 ? null : (f === 5 ? 2 : 6);
      var qa = 0.9, ka = 0.15;
      var cx = 300, cy = 300, r = 150;
      g += dial(cx, cy, r, qa + m * theta, C.accent, "q at m=" + m);
      if (n != null) {
        g += dial(cx, cy, r, ka + n * theta, C.cool, "k at n=" + n);
        g += arcBetween(cx, cy, 66, qa + m * theta, ka + n * theta, C.warm);
        var dd = Math.abs((qa + m * theta) - (ka + n * theta));
        g += txt(cx + 78, cy - 6, "angle = φ + (m−n)θ", { size: 12, fill: C.warm, weight: 600 });
        g += txt(cx + 78, cy + 12, "= " + dd.toFixed(3) + " rad", { size: 11.5, fill: C.warm });
      }
      g += dial(cx, cy, r, f === 3 ? qa : qa, "#2c3941", "", 1.4);
      g += txt(cx, cy + r + 34, "one coordinate pair of the head", { size: 11, anchor: "middle", fill: C.faint });

      var px = 570;
      g += rect(px, 130, 400, 250, { fill: C.box, stroke: C.line });
      if (f === 3) {
        g += txt(px + 24, 172, "f(q, m) = R(mθ) · q", { size: 18, fill: C.accent, weight: 600 });
        g += txt(px + 24, 208, "R(α) = [ cos α  −sin α ]", { size: 13, fill: C.dim });
        g += txt(px + 24, 228, "       [ sin α   cos α ]", { size: 13, fill: C.dim });
        g += txt(px + 24, 268, "‖R(α)q‖ = ‖q‖ for every α.", { size: 12.5, fill: C.ink });
        g += txt(px + 24, 292, "Position changes direction, never magnitude.", { size: 12.5, fill: C.dim });
      } else if (f === 4) {
        g += txt(px + 24, 172, "m = 3  ⟹  rotate by 3θ", { size: 18, fill: C.accent, weight: 600 });
        g += txt(px + 24, 210, "Each position advances the dial by a fixed step.", { size: 12.5, fill: C.ink });
        g += txt(px + 24, 236, "Nothing is added to the vector; it is turned.", { size: 12.5, fill: C.dim });
      } else {
        g += txt(px + 24, 168, "⟨R(mθ)q, R(nθ)k⟩", { size: 17, fill: C.ink, weight: 600 });
        g += txt(px + 24, 200, "= qᵀ R(mθ)ᵀ R(nθ) k", { size: 15, fill: C.dim });
        g += txt(px + 24, 232, "= qᵀ R((n−m)θ) k", { size: 17, fill: C.accent, weight: 600 });
        g += txt(px + 24, 274, f === 6 ? "m and n both advanced by 4." : "m and n appear only through their difference.", { size: 12.5, fill: C.ink });
        g += txt(px + 24, 298, f === 6 ? "The angle — and the logit — are unchanged." : "Relative position, obtained for free.", { size: 12.5, fill: f === 6 ? C.warm : C.dim });
      }
    } else if (f === 7) {
      var freqs = [0, 8, 20, 32, 48, 63];
      var d = 128, b = 10000;
      freqs.forEach(function (i, k) {
        var th = Math.pow(b, -2 * i / d);
        var cx2 = 130 + k * 152, cy2 = 210;
        g += dial(cx2, cy2, 54, (16 * th * 6) % (2 * Math.PI), k < 2 ? C.accent : k < 4 ? C.cool : C.violet, "", 2.2);
        g += txt(cx2, cy2 + 84, "pair " + i, { size: 11, anchor: "middle", fill: C.ink, weight: 600 });
        g += txt(cx2, cy2 + 102, "λ = " + fmtNum(2 * Math.PI / th) + " tok", { size: 10, anchor: "middle", fill: C.dim });
      });
      g += txt(60, 350, "θᵢ = b^(−2i/d).  Pair 0 turns a full circle every ~6 tokens; pair 63 needs ~63,000.", { size: 13, fill: C.ink });
      g += txt(60, 378, "Together they encode position the way a set of clock hands encodes time — redundantly, at many scales.", { size: 12.5, fill: C.dim });
    } else if (f === 8) {
      var ax = 90, ay = 300, aw = 840, ah = 190;
      g += line(ax, ay, ax + aw, ay, { stroke: C.line });
      g += line(ax, ay - ah, ax, ay + 60, { stroke: C.line });
      var d2 = "M ";
      for (var o = 0; o <= 400; o++) {
        var v = 0;
        for (var i2 = 0; i2 < 16; i2++) {
          var th2 = Math.pow(10000, -2 * (i2 * 4) / 128);
          v += Math.cos(o * th2) / 16;
        }
        var xx2 = ax + (o / 400) * aw, yy2 = ay - v * ah * 0.9;
        d2 += (o === 0 ? "" : " L ") + xx2.toFixed(1) + " " + yy2.toFixed(1);
      }
      g += path(d2, { stroke: C.accent, sw: 2 });
      g += txt(ax, ay - ah - 16, "relative attention logit contributed by RoPE, summed over frequency bands", { size: 12, fill: C.ink, weight: 600 });
      g += txt(ax + aw, ay + 24, "offset m − n  →  400", { size: 11, anchor: "end", fill: C.faint });
      g += txt(ax, ay + 24, "0", { size: 11, fill: C.faint });
      g += txt(ax + 20, ay - ah + 24, "strong, oscillating near zero offset", { size: 11.5, fill: C.accent });
      g += txt(ax + 420, ay - 40, "envelope decays with distance", { size: 11.5, fill: C.warm });
    } else if (f === 9) {
      var bases = [[10000, "Llama 2", C.dim], [500000, "Llama 3", C.cool], [1000000, "Qwen3", C.accent]];
      var maxw = 2 * Math.PI * 1000000;
      bases.forEach(function (bb, k) {
        var w = 2 * Math.PI * bb[0];
        var yy3 = 130 + k * 84;
        g += txt(80, yy3 + 4, bb[1], { size: 13, fill: bb[2], weight: 600 });
        g += rect(210, yy3 - 14, 700 * Math.pow(w / maxw, 0.42), 28, { fill: bb[2], op: 0.5 });
        g += txt(220, yy3 + 5, "b = " + fmtNum(bb[0]) + "   ·   slowest wavelength ≈ " + fmtNum(w) + " tokens", { size: 11.5, fill: "#0d1518", weight: 600 });
      });
      g += line(210 + 700 * Math.pow(2 * Math.PI * 20860 / maxw, 0.42), 96, 210 + 700 * Math.pow(2 * Math.PI * 20860 / maxw, 0.42), 400, { stroke: C.red, dash: "4 4", sw: 1.6 });
      g += txt(215 + 700 * Math.pow(2 * Math.PI * 20860 / maxw, 0.42), 420, "131k context", { size: 11, fill: C.red });
      g += txt(80, 452, "A model whose context exceeds its slowest wavelength is asking its dials to distinguish offsets", { size: 12.5, fill: C.ink });
      g += txt(80, 476, "it never saw a full period of. That is the mechanism behind the cliff at the training length.", { size: 12.5, fill: C.dim });
    } else {
      var yb2 = 160;
      if (f === 10) {
        g += txt(80, yb2, "High-frequency bands  (i small)", { size: 13.5, fill: C.accent, weight: 600 });
        g += txt(80, yb2 + 26, "Complete thousands of periods inside the training window. Already well calibrated. Leave alone.", { size: 12.5, fill: C.dim });
        g += txt(80, yb2 + 78, "Low-frequency bands  (i large)", { size: 13.5, fill: C.warm, weight: 600 });
        g += txt(80, yb2 + 104, "Never complete one period. Every long offset maps to an angle the model has no calibration for.", { size: 12.5, fill: C.dim });
        g += txt(80, yb2 + 130, "Interpolate these: divide the position by a scale factor so the trained angle range still covers the new context.", { size: 12.5, fill: C.dim });
        g += rect(80, yb2 + 168, 840, 76, { fill: C.box, stroke: C.warm });
        g += txt(104, yb2 + 200, "YaRN = per-band interpolation + a temperature correction on the attention logits", { size: 14, fill: C.warm, weight: 600 });
        g += txt(104, yb2 + 226, "Uniform rescaling (\"position interpolation\") damages the fast bands it did not need to touch.", { size: 12, fill: C.dim });
      } else {
        var n5 = 6;
        for (var i5 = 0; i5 < n5; i5++) {
          for (var j5 = 0; j5 < n5; j5++) {
            var on = j5 <= i5;
            g += rect(120 + j5 * 40, 120 + i5 * 40, 34, 34, { fill: on ? C.accent : "#182027", op: on ? 0.55 : 1, stroke: C.grid });
          }
          g += txt(120 + n5 * 40 + 16, 142 + i5 * 40, "token " + i5 + " sees " + (i5 + 1) + " positions", { size: 11.5, fill: C.dim });
        }
        g += txt(120, 104, "causal mask", { size: 11, fill: C.faint, ls: "0.12em" });
        g += rect(560, 140, 400, 200, { fill: C.box, stroke: C.accent });
        g += txt(584, 178, "The mask already encodes order.", { size: 15, fill: C.accent, weight: 600 });
        g += txt(584, 210, "The number of visible tokens is the position.", { size: 12.5, fill: C.ink });
        g += txt(584, 236, "A model can read it off the attention pattern.", { size: 12.5, fill: C.dim });
        g += txt(584, 276, "So: RoPE in the local layers, where offsets are", { size: 12.5, fill: C.dim });
        g += txt(584, 298, "short and the fast bands work well —", { size: 12.5, fill: C.dim });
        g += txt(584, 320, "and nothing at all in the global ones.", { size: 12.5, fill: C.warm, weight: 600 });
      }
    }

    var html = svgOpen([0, 0, R_W, R_H], "56vh") + g + "</svg>";
    html += cap(meta.c);
    return { html: html, view: [0, 0, R_W, R_H], label: meta.t };
  }

  mount("fig-rope", { total: 12, interval: 4000, render: ropeRender });

  /* ==========================================================================
     FIGURE 4 — normalization placement
     ========================================================================== */
  var N_W = 1040, N_H = 540;
  var NORM_VARIANTS = [
    { key: "post", name: "Post-LN · 2017", col: C.red, onStream: true },
    { key: "pre", name: "Pre-LN · GPT-2 →", col: C.accent, onStream: false },
    { key: "sand", name: "Pre + post · Gemma 3, Olmo 2", col: C.cool, onStream: false }
  ];
  var NORM_FRAMES = [
    "Three placements, three different residual paths. Everything else about the block is identical — same attention, same feed-forward, same parameters. Only the position of the normalization layer changes.",
    "<strong>Forward, step 1.</strong> The stream arrives at the block. Post-LN feeds it straight into the sublayer; the other two normalize first.",
    "<strong>Forward, step 2.</strong> The sublayer computes its delta. Under pre-norm its input is scale-controlled, so the sublayer never sees the accumulated growth of the stream directly.",
    "<strong>Forward, step 3.</strong> The delta is added back. Post-LN then normalizes the <em>sum</em> — which is the fateful step, because that normalization is now part of the identity path.",
    "<strong>Forward complete.</strong> Post-LN emits a unit-scale stream. Pre-LN emits a stream that has grown. The sandwich sits in between, because its second norm bounds what the branch is allowed to write.",
    "<strong>Twenty-four layers later.</strong> Post-LN holds the scale flat by construction. Pre-LN has grown by roughly √L. The sandwich grows far more slowly, which is the entire argument for it.",
    "<strong>Backward, step 1.</strong> Now run the chain rule. The gradient enters at the top of the block and has to reach the bottom.",
    "<strong>Backward, step 2.</strong> Post-LN: the gradient must pass through the normalization Jacobian before it reaches the residual junction. Pre-LN and the sandwich: the junction is a plain addition, so one branch of the gradient passes through untouched.",
    "<strong>Backward, step 3.</strong> The Jacobian of a residual add is I + ∂F. Stack L of them under pre-norm and the identity dominates the product. Stack L normalization Jacobians under post-norm and it does not.",
    "<strong>Backward complete.</strong> This is why post-LN Transformers need learning-rate warmup and get harder to train with depth, and why essentially every model after GPT-2 moved the norm onto the branch.",
    "<strong>The trade, stated plainly.</strong> Post-norm controls scale and damages gradient flow. Pre-norm preserves gradient flow and lets scale drift. The sandwich and Olmo's branch-output norm are both attempts to have both — and both are ordinary engineering compromises, not theory."
  ];

  function normRender(f) {
    var g = rect(0, 0, N_W, N_H, { fill: C.bg });
    var colW = 320, gap = 24, x0 = 40;
    var fwdStage = f >= 1 && f <= 4 ? f : (f === 5 ? 4 : 0);
    var bwdStage = f >= 6 && f <= 9 ? f - 5 : 0;

    NORM_VARIANTS.forEach(function (V, k) {
      var X = x0 + k * (colW + gap), Y = 76;
      g += rect(X, Y - 34, colW, 340, { fill: "#121920", stroke: C.grid });
      g += txt(X + 14, Y - 12, V.name, { size: 12, fill: V.col, weight: 600, ls: "0.06em" });

      var sx = X + 52, top = Y + 16, bot = Y + 244;
      // residual spine
      var spineCol = (bwdStage >= 2 && V.onStream) ? C.red : (bwdStage >= 2 ? C.accent : C.line);
      g += line(sx, top, sx, bot + 40, { stroke: spineCol, sw: bwdStage >= 2 ? 4 : 3 });

      var boxes;
      if (V.key === "post") boxes = [["sublayer F", C.cool]];
      else if (V.key === "pre") boxes = [["Norm", V.col], ["sublayer F", C.cool]];
      else boxes = [["Norm", V.col], ["sublayer F", C.cool], ["Norm", V.col]];

      var byy = top + 10;
      boxes.forEach(function (b, i) {
        var active = fwdStage >= (i + 1) && fwdStage <= 4;
        g += rect(sx + 44, byy, 190, 40, { fill: active ? "#1c2a33" : C.box, stroke: active ? C.warm : b[1], sw: active ? 2 : 1.2 });
        g += txt(sx + 139, byy + 25, b[0], { size: 12, anchor: "middle", fill: active ? C.warm : b[1], weight: 600 });
        byy += 54;
      });
      // branch wiring
      g += path("M " + sx + " " + (top + 10) + " L " + (sx + 40) + " " + (top + 10), { stroke: C.line, sw: 1.3 });
      g += path("M " + (sx + 234) + " " + (byy - 30) + " L " + (sx + 262) + " " + (byy - 30) + " L " + (sx + 262) + " " + bot + " L " + (sx + 13) + " " + bot, { stroke: C.line, sw: 1.3 });
      g += circ(sx, bot, 12, { fill: C.bg, stroke: fwdStage >= 3 ? C.warm : C.line, sw: fwdStage >= 3 ? 2 : 1.4 });
      g += txt(sx, bot + 5, "+", { size: 15, anchor: "middle", fill: C.ink });

      if (V.onStream) {
        var act = fwdStage >= 4 || bwdStage >= 2;
        g += rect(sx - 42, bot + 20, 190, 34, { fill: "#2a1c1c", stroke: C.red, sw: act ? 2 : 1.2 });
        g += txt(sx + 53, bot + 42, "LayerNorm", { size: 12, anchor: "middle", fill: C.red, weight: 600 });
        if (bwdStage >= 2) g += txt(sx + 156, bot + 42, "× J_LN", { size: 11, fill: C.red, weight: 600 });
      }

      // gradient arrow
      if (bwdStage >= 1) {
        var gy = bot + (V.onStream ? 62 : 16);
        g += path("M " + (sx - 26) + " " + gy + " L " + (sx - 26) + " " + (top - 4), { stroke: V.onStream ? C.red : C.accent, sw: 2.4, dash: bwdStage >= 3 ? "" : "5 4" });
        g += path("M " + (sx - 31) + " " + (top + 6) + " L " + (sx - 26) + " " + (top - 4) + " L " + (sx - 21) + " " + (top + 6), { stroke: V.onStream ? C.red : C.accent, sw: 2.4 });
      }

      // scale / gradient readouts
      var norm24 = V.key === "post" ? 1 : V.key === "pre" ? Math.sqrt(1 + 24 * 0.62) : Math.sqrt(1 + 24 * 0.17);
      var grad = V.key === "post" ? Math.pow(0.86, 24) : 1;
      if (f >= 5) {
        g += txt(X + 14, Y + 292, "‖x‖ after 24 layers:  " + norm24.toFixed(2) + "×", { size: 11.5, fill: V.col, weight: 600 });
      }
      if (f >= 9) {
        g += txt(X + 14, Y + 312, "gradient at layer 1:  " + (grad < 0.1 ? grad.toFixed(3) : grad.toFixed(2)) + "×", { size: 11.5, fill: grad < 0.5 ? C.red : C.accent, weight: 600 });
      }
      if (f === 10) {
        var verdict = V.key === "post" ? "scale ✓   gradient ✗" : V.key === "pre" ? "scale ✗   gradient ✓" : "scale ~   gradient ✓";
        g += rect(X + 12, Y + 326, colW - 24, 30, { fill: C.box, stroke: V.col });
        g += txt(X + colW / 2, Y + 346, verdict, { size: 12.5, anchor: "middle", fill: V.col, weight: 600 });
      }
    });

    g += txt(40, 44, f >= 6 ? "BACKWARD PASS" : "FORWARD PASS", { size: 10.5, fill: f >= 6 ? C.warm : C.faint, ls: "0.18em", weight: 600 });
    if (f >= 8) {
      g += rect(40, N_H - 66, N_W - 80, 46, { fill: C.box, stroke: C.grid });
      g += txt(60, N_H - 38, "∂x_{ℓ+1}/∂x_ℓ  =  I + ∂F/∂x   (pre-norm)      vs.      J_LN · (I + ∂F/∂x)   (post-norm)", { size: 14, fill: C.ink, weight: 600 });
    }

    var view = [0, 0, N_W, N_H];
    var html = svgOpen(view, "54vh") + g + "</svg>";
    html += cap(NORM_FRAMES[f]);
    return { html: html, view: view, label: f >= 6 ? "backward" : "forward" };
  }

  mount("fig-norm", { total: 11, interval: 3400, render: normRender });

  /* ==========================================================================
     FIGURE 5 — SwiGLU
     ========================================================================== */
  var G_W = 1020, G_H = 520;
  var GLU_FRAMES = [
    "<strong>The 2017 feed-forward network.</strong> Project up by 4×, apply a pointwise nonlinearity, project back down. Two matrices, 8d² parameters, and roughly two thirds of a dense model lives here.",
    "<strong>One path only.</strong> Every feature travels the same route: a linear map, an elementwise squash, another linear map. Interactions between features can only happen inside the matrices, additively.",
    "<strong>Split the up-projection in two.</strong> Same input, two independent linear maps. Nothing has changed yet — this is still a linear operation, just written as two.",
    "<strong>Squash one branch only.</strong> The gate path gets SiLU: z·σ(z). The value path stays linear. The asymmetry is the point.",
    "<strong>Multiply them.</strong> This is the whole idea. The output is now bilinear in the input: a product of two learned projections, computed per channel. A two-matrix MLP has to approximate this with depth and width; here it is a primitive.",
    "<strong>Project down.</strong> Three matrices total, all of shape d × d_ff.",
    "<strong>The parameter accounting.</strong> Three matrices instead of two means d_ff has to shrink to keep the budget. Setting 3·d·d_ff = 8d² gives d_ff = 8d/3, which is where that unfamiliar number in every config file comes from.",
    "<strong>What the gate buys.</strong> Fix the value input and sweep the gate. The same feature passes through, is suppressed, or is inverted depending on a different feature — conditional routing, learned per channel, in one layer.",
    "<strong>In production.</strong> The 8/3 rule is a parity convention, not a law: Llama 2 follows it exactly, Llama 3 deliberately overspends, and MoE experts are far narrower because there are hundreds of them."
  ];

  function gluRender(f) {
    var g = rect(0, 0, G_W, G_H, { fill: C.bg });
    var cx = 90, cy = 220;

    function mat(x, y, w, h, label, sub, col, on) {
      var o = rect(x, y, w, h, { fill: on ? "#1c2a33" : C.box, stroke: on ? col : C.line, sw: on ? 2 : 1.2 });
      o += txt(x + w / 2, y + h / 2 + 1, label, { size: 13.5, anchor: "middle", fill: on ? col : C.ink, weight: 700, disp: true });
      if (sub) o += txt(x + w / 2, y + h / 2 + 19, sub, { size: 10.5, anchor: "middle", fill: C.dim });
      return o;
    }

    if (f <= 5) {
      g += circ(cx, cy, 9, { fill: C.warm });
      g += txt(cx, cy - 22, "x", { size: 15, anchor: "middle", fill: C.warm, weight: 700 });
      g += txt(cx, cy + 34, "d", { size: 11, anchor: "middle", fill: C.faint });

      if (f <= 1) {
        g += line(cx + 10, cy, 190, cy, { stroke: C.line, sw: 1.6 });
        g += mat(190, cy - 34, 150, 68, "W₁", "d → 4d", C.cool, f === 1);
        g += line(340, cy, 400, cy, { stroke: C.line, sw: 1.6 });
        g += mat(400, cy - 34, 150, 68, "GELU", "pointwise", C.violet, f === 1);
        g += line(550, cy, 610, cy, { stroke: C.line, sw: 1.6 });
        g += mat(610, cy - 34, 150, 68, "W₂", "4d → d", C.cool, f === 1);
        g += line(760, cy, 820, cy, { stroke: C.line, sw: 1.6 });
        g += circ(830, cy, 9, { fill: C.accent });
        g += txt(830, cy - 22, "y", { size: 15, anchor: "middle", fill: C.accent, weight: 700 });
        g += txt(190, cy + 96, "parameters  =  d·4d  +  4d·d  =  8d²", { size: 15, fill: C.ink, weight: 600 });
        if (f === 1) g += txt(190, cy + 126, "Every channel takes the same route. Feature interaction is additive, inside the weights.", { size: 12.5, fill: C.dim });
      } else {
        var yG = cy - 76, yV = cy + 76;
        g += path("M " + (cx + 10) + " " + cy + " L 160 " + cy + " L 160 " + yG + " L 190 " + yG, { stroke: C.line, sw: 1.6 });
        g += path("M 160 " + cy + " L 160 " + yV + " L 190 " + yV, { stroke: C.line, sw: 1.6 });
        g += mat(190, yG - 26, 140, 52, "W_gate", "d → d_ff", C.accent, f === 2 || f === 3);
        g += mat(190, yV - 26, 140, 52, "W_value", "d → d_ff", C.cool, f === 2);
        if (f >= 3) {
          g += line(330, yG, 380, yG, { stroke: C.line, sw: 1.6 });
          g += mat(380, yG - 26, 120, 52, "SiLU", "z·σ(z)", C.violet, f === 3);
        }
        g += line(330, yV, 520, yV, { stroke: C.line, sw: 1.6 });
        if (f >= 4) {
          g += path("M 500 " + yG + " L 560 " + yG + " L 560 " + (cy - 22), { stroke: C.line, sw: 1.6 });
          g += path("M 520 " + yV + " L 560 " + yV + " L 560 " + (cy + 22), { stroke: C.line, sw: 1.6 });
          g += circ(560, cy, 20, { fill: f === 4 ? "#1c2a33" : C.box, stroke: f === 4 ? C.warm : C.line, sw: f === 4 ? 2.2 : 1.4 });
          g += txt(560, cy + 7, "⊙", { size: 20, anchor: "middle", fill: f === 4 ? C.warm : C.ink });
          g += txt(560, cy + 46, "elementwise product", { size: 11, anchor: "middle", fill: f === 4 ? C.warm : C.faint });
        }
        if (f >= 5) {
          g += line(580, cy, 640, cy, { stroke: C.line, sw: 1.6 });
          g += mat(640, cy - 30, 150, 60, "W_down", "d_ff → d", C.cool, true);
          g += line(790, cy, 840, cy, { stroke: C.line, sw: 1.6 });
          g += circ(850, cy, 9, { fill: C.accent });
          g += txt(850, cy - 22, "y", { size: 15, anchor: "middle", fill: C.accent, weight: 700 });
        }
        if (f === 4) g += txt(190, G_H - 60, "y  =  W_down · ( SiLU(W_gate x)  ⊙  W_value x )", { size: 16, fill: C.warm, weight: 600 });
      }
    } else if (f === 6) {
      g += rect(70, 80, 880, 150, { fill: C.box, stroke: C.line });
      g += txt(100, 130, "3 · d · d_ff   =   8 d²", { size: 26, fill: C.ink, weight: 600, disp: true });
      g += txt(100, 180, "d_ff  =  8d / 3  ≈  2.667 d", { size: 26, fill: C.accent, weight: 700, disp: true });
      g += txt(100, 212, "then rounded up to a multiple of 128 or 256 so the GEMM tiles cleanly", { size: 12, fill: C.faint });
      var rows = [["d = 4096", "8d/3 = 10,923", "Llama 2 7B ships 11,008", C.accent],
                  ["d = 4096", "8d/3 = 10,923", "Llama 3 8B ships 14,336  (3.5 d)", C.warm]];
      rows.forEach(function (r, i) {
        var yy = 280 + i * 52;
        g += rect(70, yy, 880, 42, { fill: "#121920", stroke: C.grid });
        g += txt(94, yy + 27, r[0], { size: 12.5, fill: C.dim });
        g += txt(260, yy + 27, r[1], { size: 12.5, fill: C.dim });
        g += txt(500, yy + 27, r[2], { size: 13, fill: r[3], weight: 600 });
      });
      g += txt(70, 420, "The rule keeps parameters at parity with the old 4d design. Teams break it deliberately when they judge", { size: 12.5, fill: C.dim });
      g += txt(70, 444, "the extra FFN capacity worth the compute — so read 8/3 as a convention with a reason, not a constraint.", { size: 12.5, fill: C.dim });
    } else if (f === 7) {
      var ax = 110, ay = 400, aw = 400, ah = 280;
      g += line(ax, ay, ax + aw, ay, { stroke: C.line });
      g += line(ax, ay, ax, ay - ah, { stroke: C.line });
      g += line(ax, ay - ah / 2, ax + aw, ay - ah / 2, { stroke: C.grid, dash: "3 4" });
      [[-2, C.red, "gate = −2  ·  suppressed and flipped"], [0.5, C.warm, "gate = 0.5  ·  attenuated"], [3, C.accent, "gate = 3  ·  passes through"]].forEach(function (gc) {
        var gv = gc[0] * (1 / (1 + Math.exp(-gc[0])));
        var d = "M ";
        for (var i = 0; i <= 60; i++) {
          var v = -2 + (i / 60) * 4;
          var y = gv * v;
          d += (i === 0 ? "" : " L ") + (ax + (i / 60) * aw).toFixed(1) + " " + (ay - ah / 2 - y * 34).toFixed(1);
        }
        g += path(d, { stroke: gc[1], sw: 2.2 });
      });
      g += txt(ax, ay - ah - 16, "output channel vs. value input, for three gate values", { size: 12, fill: C.ink, weight: 600 });
      g += txt(ax + aw / 2, ay + 24, "W_value x", { size: 11, anchor: "middle", fill: C.faint });
      var lx = 570;
      g += rect(lx, 120, 380, 210, { fill: C.box, stroke: C.line });
      g += txt(lx + 24, 158, "One channel, three behaviours,", { size: 15, fill: C.ink, weight: 600 });
      g += txt(lx + 24, 182, "selected by a different feature.", { size: 15, fill: C.accent, weight: 600 });
      g += txt(lx + 24, 218, "A plain MLP can approximate this,", { size: 12.5, fill: C.dim });
      g += txt(lx + 24, 240, "but it needs width or depth to do so.", { size: 12.5, fill: C.dim });
      g += txt(lx + 24, 276, "The gated form gets it in one product,", { size: 12.5, fill: C.dim });
      g += txt(lx + 24, 298, "at no extra parameter cost.", { size: 12.5, fill: C.dim });
      [[-2, C.red], [0.5, C.warm], [3, C.accent]].forEach(function (gc, i) {
        g += rect(lx + 24, 350 + i * 26, 12, 12, { fill: gc[1] });
        g += txt(lx + 44, 361 + i * 26, "gate = " + gc[0], { size: 11.5, fill: C.dim });
      });
    } else {
      var cfg = [
        ["Llama 2 7B", 4096, 11008, "dense · 8d/3 exactly", C.accent],
        ["Llama 3 8B", 4096, 14336, "dense · 3.5 d, deliberate", C.warm],
        ["Qwen3 8B", 4096, 12288, "dense · 3.0 d", C.cool],
        ["Olmo 3 32B", 5120, 27648, "dense · 5.4 d", C.cool],
        ["Qwen3-235B expert", 4096, 1536, "MoE · 128 of them", C.violet],
        ["DeepSeek-V3 expert", 7168, 2048, "MoE · 256 + 1 shared", C.violet]
      ];
      g += txt(80, 76, "d_model", { size: 10.5, fill: C.faint, ls: "0.14em" });
      g += txt(300, 76, "d_ff", { size: 10.5, fill: C.faint, ls: "0.14em" });
      cfg.forEach(function (r, i) {
        var yy = 106 + i * 58;
        g += txt(80, yy + 20, r[0], { size: 13, fill: C.ink, weight: 600 });
        g += rect(300, yy, 4 + 520 * (r[2] / 28000), 30, { fill: r[4], op: 0.55 });
        g += txt(312, yy + 20, String(r[2]), { size: 12, fill: "#0d1518", weight: 700 });
        g += txt(300 + 12 + 520 * (r[2] / 28000) + 14, yy + 20, r[3], { size: 11.5, fill: C.dim });
        g += txt(230, yy + 20, String(r[1]), { size: 12, fill: C.faint, anchor: "end" });
      });
      g += txt(80, 470, "MoE experts are narrow on purpose: capacity comes from having many, not from each being wide.", { size: 12.5, fill: C.dim });
    }

    var html = svgOpen([0, 0, G_W, G_H], "52vh") + g + "</svg>";
    html += cap(GLU_FRAMES[f]);
    return { html: html, view: [0, 0, G_W, G_H], label: f <= 5 ? "construction" : f === 6 ? "accounting" : f === 7 ? "what gating buys" : "in production" };
  }

  mount("fig-swiglu", { total: 9, interval: 3600, render: gluRender });

  /* ==========================================================================
     FIGURE 6 — KV cache growth
     ========================================================================== */
  var K_W = 1020, K_H = 560;
  var KV_PRESETS = {
    llama8b: { name: "Llama 3 8B shape", L: 32, nq: 32, nkv: 8, dh: 128, weights: 16 * 1073741824, win: 4096, ratio: 4, asym: false },
    olmo32b: { name: "Olmo 3 32B shape", L: 64, nq: 40, nkv: 8, dh: 128, weights: 64 * 1073741824, win: 4096, ratio: 4, asym: false },
    dsv3: { name: "DeepSeek-V3 shape", L: 61, nq: 128, nkv: 128, dh: 128, weights: 671e9, win: 4096, ratio: 4, asym: true }
  };
  var kvPreset = "llama8b";

  function kvBytes(p, s) {
    var mha = p.asym ? p.L * p.nq * ((p.dh + 64) + p.dh) * 2 * s : 2 * p.L * p.nq * p.dh * 2 * s;
    var gqa = 2 * p.L * p.nkv * p.dh * 2 * s;
    var mqa = 2 * p.L * 1 * p.dh * 2 * s;
    var mla = p.L * (512 + 64) * 2 * s;
    var perLayerTok = 2 * p.nkv * p.dh * 2;
    var nGlobal = Math.round(p.L / p.ratio), nLocal = p.L - nGlobal;
    var swa = nGlobal * s * perLayerTok + nLocal * Math.min(s, p.win) * perLayerTok;
    return { mha: mha, gqa: gqa, mqa: mqa, mla: mla, swa: swa };
  }

  function kvRender(f) {
    var p = KV_PRESETS[kvPreset];
    var s = 1024 * Math.pow(2, f);
    var b = kvBytes(p, s);
    var g = rect(0, 0, K_W, K_H, { fill: C.bg });
    var lo = Math.log(1048576), hi = Math.log(2199023255552); // 1 MiB .. 2 TiB
    var X0 = 210, XW = 620;
    function bw(v) { return Math.max(2, XW * (Math.log(Math.max(v, 1048576)) - lo) / (hi - lo)); }

    g += txt(46, 44, "KV CACHE FOR ONE SEQUENCE · " + p.name.toUpperCase(), { size: 10.5, fill: C.faint, ls: "0.16em", weight: 600 });
    g += txt(46, 74, "sequence length  " + fmtTok(s) + " tokens", { size: 22, fill: C.accent, weight: 700, disp: true });

    // log gridlines
    var marks = [1048576, 1073741824, 10 * 1073741824, 100 * 1073741824, 1099511627776];
    marks.forEach(function (mk) {
      var x = X0 + bw(mk);
      g += line(x, 106, x, 400, { stroke: C.grid, dash: "2 5" });
      g += txt(x, 418, fmtBytes(mk), { size: 9.5, anchor: "middle", fill: C.faint });
    });
    // 80 GB HBM line
    var hbm = X0 + bw(80 * 1073741824);
    g += line(hbm, 100, hbm, 404, { stroke: C.red, sw: 1.6, dash: "6 4" });
    g += txt(hbm + 6, 116, "80 GB HBM", { size: 10.5, fill: C.red, weight: 600 });

    var bars = [
      ["MHA — every head its own K,V", b.mha, C.red],
      ["GQA — " + p.nq + " Q heads : " + p.nkv + " KV heads", b.gqa, C.warm],
      ["MQA — one shared KV head", b.mqa, C.cool],
      ["MLA — latent r = 512 (+64 RoPE)", b.mla, C.violet],
      ["GQA + sliding window, 3:1", b.swa, C.accent]
    ];
    if (kvPreset === "dsv3") bars[1][0] = "GQA — hypothetical 128:8";
    bars.forEach(function (r, i) {
      var y = 140 + i * 52;
      g += txt(X0 - 14, y + 19, r[0], { size: 11.5, anchor: "end", fill: C.dim });
      g += rect(X0, y, bw(r[1]), 28, { fill: r[2], op: 0.62 });
      g += rect(X0, y, bw(r[1]), 28, { stroke: r[2], sw: 1 });
      var lbl = fmtBytes(r[1]);
      var inside = bw(r[1]) > 120;
      g += txt(inside ? X0 + bw(r[1]) - 10 : X0 + bw(r[1]) + 10, y + 19, lbl,
        { size: 12, anchor: inside ? "end" : "start", fill: inside ? "#0d1518" : r[2], weight: 700 });
    });
    // weights reference
    g += rect(X0, 404, bw(p.weights), 12, { fill: "#2c3941" });
    g += txt(X0 - 14, 414, "model weights", { size: 10.5, anchor: "end", fill: C.faint });

    // right panel: arithmetic intensity
    g += rect(46, 452, K_W - 92, 80, { fill: C.box, stroke: C.grid });
    g += txt(66, 478, "ARITHMETIC INTENSITY AT DECODE  =  n_q / n_kv   FLOPs per byte", { size: 11, fill: C.faint, ls: "0.1em", weight: 600 });
    var ints = [["MHA", 1], ["GQA " + p.nq + ":" + p.nkv, p.nq / p.nkv], ["MQA", p.nq]];
    ints.forEach(function (r, i) {
      var x = 66 + i * 210;
      g += txt(x, 510, r[0], { size: 12, fill: C.dim });
      g += txt(x + 110, 510, r[1].toFixed(0) + " F/B", { size: 13, fill: r[1] > 8 ? C.accent : C.red, weight: 700 });
    });
    g += txt(700, 510, "H100 ridge point ≈ 295 F/B", { size: 12, fill: C.warm, weight: 600 });

    var cs;
    if (f <= 2) cs = "At short context the cache is a rounding error next to the weights. Every variant looks the same, which is exactly why nobody worried about this in 2020.";
    else if (f <= 5) cs = "The cache is now the same order of magnitude as the weights. Note that the bars are on a log scale: multi-head attention is already an order of magnitude above grouped-query.";
    else if (f <= 7) cs = "Full multi-head attention no longer fits on a single 80 GB device for one sequence — before batching. This is the point at which GQA stopped being an optimization and became the default.";
    else if (f <= 9) cs = "Only the latent and sliding-window variants are still viable. Note that the sliding-window bar has almost stopped growing: three quarters of its layers are capped at the 4096-token window.";
    else cs = "One million tokens. The bottom two bars are the only designs in this list that a serving stack can actually run. The bottom panel is the reason: at n_q/n_kv = 1, decode attention is memory-bound by nearly three orders of magnitude, so the only lever is reading fewer bytes.";

    var html = svgOpen([0, 0, K_W, K_H], "58vh") + g + "</svg>";
    html += cap("<strong>" + fmtTok(s) + " tokens.</strong> " + cs);
    return { html: html, view: [0, 0, K_W, K_H], label: fmtTok(s) + " tokens" };
  }

  mount("fig-kv", {
    total: 11, interval: 2600, render: kvRender,
    onVariant: function (d) { if (d.kvmodel) kvPreset = d.kvmodel; }
  });

  /* ==========================================================================
     FIGURE 7 — attention masks and receptive fields
     ========================================================================== */
  var A_W = 1020, A_H = 560;
  var MASK_FRAMES = [
    { scheme: "full", layer: 0, t: "Full causal attention", c: "<strong>Every query sees every predecessor.</strong> The mask is a lower triangle. Cost per layer is O(s²) in FLOPs and the KV cache holds all s tokens." },
    { scheme: "full", layer: 0, t: "The cost", c: "<strong>Both terms scale badly.</strong> Attention FLOPs grow quadratically and the cache grows linearly and without bound. At 65k tokens the cache is the dominant memory consumer in the entire system." },
    { scheme: "full", layer: 1, t: "Receptive field", c: "<strong>One layer is enough.</strong> With full attention, position 0 can reach the final position in a single hop. That is the property we are about to trade away." },
    { scheme: "swa", layer: 0, t: "Sliding window", c: "<strong>Punch holes in the mask.</strong> Restrict every query to the last w keys. FLOPs drop to O(s·w), and — the part that matters more — the KV cache for this layer is capped at w tokens no matter how long the sequence gets." },
    { scheme: "swa", layer: 0, t: "The cache stops growing", c: "<strong>A bounded cache.</strong> Once s exceeds w, this layer's cache is constant. Olmo 3 uses w = 4096; Gemma 3 uses 1024; gpt-oss uses 128." },
    { scheme: "swa", layer: 1, t: "Receptive field, layer 1", c: "<strong>Now information has to hop.</strong> After one local layer, a position knows about the w tokens behind it and nothing else." },
    { scheme: "swa", layer: 2, t: "Receptive field, layer 2", c: "<strong>The cone widens.</strong> Layer 2 reads positions that already summarized their own windows, so the effective reach is 2w. This is exactly the receptive-field argument from convolutional networks." },
    { scheme: "swa", layer: 3, t: "Receptive field, layer 3", c: "<strong>Reach grows linearly in depth.</strong> L local layers give L·w tokens of reach. Sixty-four layers at w = 4096 is 262k — comfortably past any context these models train on." },
    { scheme: "mix", layer: 0, t: "Interleaving", c: "<strong>Nobody relies on hops alone.</strong> Production designs put a full-attention layer every few local ones, so long-range information has a direct path rather than a chain of summaries." },
    { scheme: "mix", layer: 1, t: "The global hop", c: "<strong>One layer restores full reach.</strong> The global layer sees everything, so anything the local layers gathered becomes available everywhere at once. Sixteen of Olmo 3's sixty-four layers do this." },
    { scheme: "mix", layer: 2, t: "What it costs in bytes", c: "<strong>Olmo 3 32B at 65,536 tokens.</strong> Sixteen global layers still carry a full cache; forty-eight local layers are capped at 4096. The total falls from 16 GiB to 4.75 GiB, and three quarters of the model stops caring about context length." },
    { scheme: "mix", layer: 3, t: "Nobody agrees on the numbers", c: "<strong>Windows from 128 to 4096, ratios from 1:1 to 5:1.</strong> That spread across serious labs is the strongest available evidence that the exact values do not matter much, as long as some global path exists." }
  ];

  function maskRender(f) {
    var M = MASK_FRAMES[f];
    var g = rect(0, 0, A_W, A_H, { fill: C.bg });
    var n = 22, cell = 15, gx = 60, gy = 110, w = 6;

    g += txt(46, 44, M.t.toUpperCase(), { size: 10.5, fill: C.faint, ls: "0.16em", weight: 600 });
    g += txt(gx, gy - 16, "attention mask · query row i, key column j", { size: 10.5, fill: C.faint });

    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
        var vis = j <= i;
        if (M.scheme === "swa" || (M.scheme === "mix" && (i % 4) !== 3)) vis = vis && (i - j) < w;
        var col = vis ? (M.scheme === "full" ? C.cool : C.accent) : "#182027";
        g += rect(gx + j * cell, gy + i * cell, cell - 2, cell - 2, { fill: col, op: vis ? 0.6 : 1, r: 1 });
      }
    }
    if (M.scheme !== "full") {
      g += path("M " + gx + " " + (gy + w * cell) + " L " + (gx + (n - w) * cell) + " " + (gy + n * cell), { stroke: C.warm, sw: 1.6, dash: "4 3" });
      g += txt(gx + n * cell + 12, gy + n * cell - 6, "window edge, w", { size: 10.5, fill: C.warm });
    }

    // right panel
    var px = gx + n * cell + 60, py = 110;
    if (f <= 1) {
      g += rect(px, py, 500, 150, { fill: C.box, stroke: C.line });
      g += txt(px + 24, py + 44, "FLOPs per layer   ∝  s²", { size: 17, fill: C.red, weight: 600 });
      g += txt(px + 24, py + 80, "KV cache per layer  ∝  s", { size: 17, fill: C.red, weight: 600 });
      g += txt(px + 24, py + 118, "Both unbounded in context length.", { size: 12.5, fill: C.dim });
      if (f === 1) {
        g += rect(px, py + 180, 500, 116, { fill: "#20191a", stroke: C.red });
        g += txt(px + 24, py + 214, "Olmo 3 32B at 65k tokens:", { size: 13, fill: C.ink, weight: 600 });
        g += txt(px + 24, py + 242, "64 layers × 65,536 tokens × 4 KiB  =  16 GiB", { size: 14, fill: C.red, weight: 700 });
        g += txt(px + 24, py + 268, "per sequence, before batching", { size: 11.5, fill: C.dim });
      }
    } else if (f === 2 || (f >= 5 && f <= 7) || f === 9) {
      // receptive field cone
      var cx0 = px + 250, base = py + 300, sp = 18, layers = M.layer;
      var isMix = M.scheme === "mix";
      for (var L2 = 0; L2 <= 4; L2++) {
        var yy = base - L2 * 62;
        var reach = M.scheme === "full" ? 12 : Math.min(12, L2 * 2);
        if (isMix && L2 >= 1) reach = 12;
        for (var t2 = -12; t2 <= 12; t2++) {
          var on = L2 <= layers && Math.abs(t2) <= reach && L2 > 0;
          var isSrc = L2 === 0 && t2 === 0;
          g += rect(cx0 + t2 * sp - 6, yy - 6, 12, 12, {
            fill: isSrc ? C.warm : (on ? (isMix && L2 === 1 ? C.violet : C.accent) : "#1a2128"),
            op: on ? 0.8 : 1, r: 2
          });
        }
        var lab = L2 === 0 ? "input" : (isMix && L2 === 1 ? "global layer" : "local layer " + L2);
        g += txt(cx0 - 13 * sp - 12, yy + 4, lab, { size: 10.5, anchor: "end", fill: L2 <= layers ? C.dim : C.faint });
      }
      g += txt(cx0, base + 34, "one token's influence, spreading upward", { size: 11, anchor: "middle", fill: C.faint });
      if (f === 7) g += txt(px, py + 350, "reach  =  L × w   =   64 × 4096   =   262,144 tokens", { size: 14, fill: C.accent, weight: 700 });
      if (f === 9) g += txt(px, py + 350, "one global layer restores full reach in a single hop", { size: 14, fill: C.violet, weight: 700 });
    } else if (f === 3 || f === 4) {
      g += rect(px, py, 500, 150, { fill: C.box, stroke: C.accent });
      g += txt(px + 24, py + 44, "FLOPs per layer   ∝  s · w", { size: 17, fill: C.accent, weight: 600 });
      g += txt(px + 24, py + 80, "KV cache per layer  =  min(s, w)", { size: 17, fill: C.accent, weight: 600 });
      g += txt(px + 24, py + 118, "Bounded. The cache stops growing at s = w.", { size: 12.5, fill: C.dim });
      if (f === 4) {
        var ws = [[128, "gpt-oss"], [1024, "Gemma 3"], [4096, "Olmo 3, Mistral, Trinity"]];
        ws.forEach(function (r, i) {
          var yy2 = py + 200 + i * 46;
          g += rect(px, yy2, 420 * Math.pow(r[0] / 4096, 0.4), 30, { fill: C.accent, op: 0.5 });
          g += txt(px + 12, yy2 + 20, "w = " + r[0], { size: 12, fill: "#0d1518", weight: 700 });
          g += txt(px + 430, yy2 + 20, r[1], { size: 11.5, fill: C.dim });
        });
      }
    } else if (f === 8) {
      for (var l3 = 0; l3 < 12; l3++) {
        var glob = (l3 % 4) === 3;
        g += rect(px, py + l3 * 26, glob ? 420 : 150, 20, { fill: glob ? C.violet : C.accent, op: 0.55, r: 2 });
        g += txt(px + 434, py + l3 * 26 + 15, glob ? "global" : "local w=4096", { size: 10.5, fill: glob ? C.violet : C.dim });
      }
      g += txt(px, py - 16, "layer stack, 3 local : 1 global", { size: 10.5, fill: C.faint });
      g += txt(px, py + 340, "Olmo 3 and Trinity use 3:1. Gemma 3 uses 5:1. GPT-3 and gpt-oss use 1:1.", { size: 12.5, fill: C.dim });
    } else if (f === 10) {
      g += txt(px, py + 10, "Olmo 3 32B · 65,536 tokens · bf16", { size: 13, fill: C.ink, weight: 600 });
      var comp = [["full attention, 64 layers", 16, C.red], ["3:1 sliding window", 4.75, C.accent]];
      comp.forEach(function (r, i) {
        var yy3 = py + 60 + i * 76;
        g += rect(px, yy3, 460 * (r[1] / 16), 46, { fill: r[2], op: 0.55 });
        g += txt(px + 14, yy3 + 29, r[1] + " GiB", { size: 17, fill: "#0d1518", weight: 700 });
        g += txt(px, yy3 + 66, r[0], { size: 11.5, fill: C.dim });
      });
      g += txt(px, py + 240, "16 global × 65,536 × 4 KiB   =  4.00 GiB", { size: 12.5, fill: C.dim });
      g += txt(px, py + 264, "48 local  ×  4,096 × 4 KiB   =  0.75 GiB", { size: 12.5, fill: C.dim });
      g += txt(px, py + 296, "3.4× smaller — and 75% of it no longer grows", { size: 13.5, fill: C.accent, weight: 700 });
    } else {
      var tbl = [["GPT-3", "1:1", "banded"], ["Mistral 7B", "all local", "4096"], ["Gemma 2", "1:1", "4096"],
                 ["Gemma 3", "5:1", "1024"], ["gpt-oss", "1:1", "128"], ["Olmo 3", "3:1", "4096"], ["Trinity Large", "3:1", "4096"]];
      g += txt(px, py + 2, "local : global", { size: 10.5, fill: C.faint, ls: "0.12em" });
      g += txt(px + 200, py + 2, "window", { size: 10.5, fill: C.faint, ls: "0.12em" });
      tbl.forEach(function (r, i) {
        var yy4 = py + 34 + i * 34;
        g += txt(px - 170, yy4, r[0], { size: 12.5, fill: C.ink, weight: 600 });
        g += txt(px, yy4, r[1], { size: 12.5, fill: C.accent });
        g += txt(px + 200, yy4, r[2], { size: 12.5, fill: C.dim });
      });
    }

    var html = svgOpen([0, 0, A_W, A_H], "58vh") + g + "</svg>";
    html += cap(M.c);
    return { html: html, view: [0, 0, A_W, A_H], label: M.t };
  }

  mount("fig-mask", { total: 12, interval: 3600, render: maskRender });

  /* ==========================================================================
     FIGURE 8 — mixture of experts
     ========================================================================== */
  var E_W = 1020, E_H = 540;
  var MOE_FRAMES = [
    "<strong>The dense baseline.</strong> One feed-forward network, and every token goes through all of it. Parameters and FLOPs are welded together: adding capacity means adding compute for every token you ever process.",
    "<strong>Make many copies.</strong> Replace the single network with N independent ones. Nothing about the computation has changed yet — this is just eight feed-forward networks sitting next to each other.",
    "<strong>Add a router.</strong> One d × N matrix scores every expert for this token. It is the cheapest component in the layer and it decides everything about the layer's behaviour.",
    "<strong>Keep the top k.</strong> Take the two highest-scoring experts, run only those, and combine their outputs weighted by the (renormalized) router scores. The other six are never touched.",
    "<strong>Different tokens, different experts.</strong> Routing is per token, not per sequence, and it is learned end to end. Over a batch, every expert receives work — the question is whether it receives a fair share.",
    "<strong>The weld is cut.</strong> Total parameters scale with N. FLOPs per token scale with k. That is the entire proposition, and it is why every frontier open-weight model released since 2024 is sparse.",
    "<strong>Granularity.</strong> Fix the parameter and FLOP budget, then choose how to spend it. Few large experts give you 28 possible routing configurations; many small ones give you 4×10¹⁴, at identical cost. This is DeepSeekMoE's central argument.",
    "<strong>Sparsity is still increasing.</strong> Mixtral activated 28% of its parameters per token. Kimi K2.5 activates 3.2%. Nobody has published where this stops.",
    "<strong>The shared expert.</strong> One expert every token always uses, alongside its routed top-k. The reasoning: some computation is universal, and forcing 256 specialists to each rediscover it wastes capacity. Adoption is genuinely split.",
    "<strong>Routing collapses on its own.</strong> An expert that is slightly better early gets more tokens, trains faster, and gets more tokens still. Left alone, a handful absorb everything and the rest become dead parameters.",
    "<strong>Two ways to fix it.</strong> An auxiliary load-balancing loss works but adds a gradient pointed away from your actual objective. DeepSeek-V3's alternative keeps a per-expert bias used only for top-k selection and nudges it between steps — balance without touching the loss.",
    "<strong>What it costs the cluster.</strong> Experts are sharded across devices, so every MoE layer becomes two all-to-alls: dispatch each token to the devices holding its experts, then gather the results. Across 58 layers, on a fabric slower than NVLink, the routing pattern is the throughput."
  ];

  function moeRender(f) {
    var g = rect(0, 0, E_W, E_H, { fill: C.bg });
    var tokens = ["the", "∫", "def", "の"];
    var routes = [[1, 4], [6, 2], [0, 5], [3, 6]];

    if (f <= 5 || f === 8) {
      var N = 8, ex0 = 400, exW = 108, exH = 46, exGap = 12;
      // tokens
      tokens.forEach(function (t, i) {
        var on = (f <= 3 && i === 0) || f >= 4;
        g += rect(60, 120 + i * 74, 84, 46, { fill: on ? C.box : "#141a20", stroke: on ? C.warm : C.grid, sw: on ? 1.6 : 1 });
        g += txt(102, 149 + i * 74, t, { size: 16, anchor: "middle", fill: on ? C.warm : C.faint, weight: 600 });
      });
      g += txt(60, 100, "tokens", { size: 10.5, fill: C.faint, ls: "0.14em" });

      if (f === 0) {
        g += rect(ex0, 170, 300, 130, { fill: C.box, stroke: C.cool, sw: 1.6 });
        g += txt(ex0 + 150, 228, "feed-forward network", { size: 15, anchor: "middle", fill: C.cool, weight: 700, disp: true });
        g += txt(ex0 + 150, 254, "3 · d · d_ff parameters, all used", { size: 11.5, anchor: "middle", fill: C.dim });
        tokens.forEach(function (t, i) {
          g += path("M 144 " + (143 + i * 74) + " C 280 " + (143 + i * 74) + ", 300 235, " + ex0 + " 235", { stroke: C.warm, sw: 1.3, op: 0.7 });
        });
      } else {
        // router
        if (f >= 2) {
          g += rect(250, 190, 92, 90, { fill: C.box, stroke: C.violet, sw: 1.6 });
          g += txt(296, 228, "router", { size: 12, anchor: "middle", fill: C.violet, weight: 700 });
          g += txt(296, 248, "d × N", { size: 10.5, anchor: "middle", fill: C.dim });
        }
        for (var e = 0; e < N; e++) {
          var ey = 84 + e * (exH + exGap);
          var chosen = false;
          if (f === 3) chosen = routes[0].indexOf(e) >= 0;
          if (f >= 4) chosen = routes.some(function (r) { return r.indexOf(e) >= 0; });
          g += rect(ex0, ey, exW, exH, { fill: chosen ? "#173028" : C.box, stroke: chosen ? C.accent : C.grid, sw: chosen ? 1.8 : 1 });
          g += txt(ex0 + exW / 2, ey + 28, "expert " + e, { size: 11.5, anchor: "middle", fill: chosen ? C.accent : C.faint, weight: 600 });
          if (f === 2) {
            var sc = [0.04, 0.31, 0.19, 0.03, 0.28, 0.05, 0.07, 0.03][e];
            g += rect(ex0 + exW + 12, ey + 12, 220 * sc, 22, { fill: C.violet, op: 0.5 });
            g += txt(ex0 + exW + 18, ey + 28, sc.toFixed(2), { size: 11, fill: C.ink, weight: 600 });
          }
        }
        if (f >= 3) {
          var src = f === 3 ? [0] : [0, 1, 2, 3];
          src.forEach(function (ti) {
            routes[ti].forEach(function (e2) {
              var ey2 = 84 + e2 * (exH + exGap) + exH / 2;
              g += path("M 144 " + (143 + ti * 74) + " C 260 " + (143 + ti * 74) + ", 340 " + ey2 + ", " + ex0 + " " + ey2,
                { stroke: [C.warm, C.cool, C.accent, C.violet][ti], sw: 1.6, op: 0.8 });
            });
          });
        }
        if (f === 8) {
          g += rect(ex0, 84 + 8 * (exH + exGap) + 10, exW, exH, { fill: "#2a2418", stroke: C.warm, sw: 1.8 });
          g += txt(ex0 + exW / 2, 84 + 8 * (exH + exGap) + 38, "shared", { size: 11.5, anchor: "middle", fill: C.warm, weight: 700 });
          tokens.forEach(function (t, i) {
            g += path("M 144 " + (143 + i * 74) + " C 300 " + (143 + i * 74) + ", 320 " + (84 + 8 * (exH + exGap) + 33) + ", " + ex0 + " " + (84 + 8 * (exH + exGap) + 33),
              { stroke: C.warm, sw: 1.1, dash: "3 3", op: 0.75 });
          });
          g += txt(ex0 + exW + 20, 84 + 8 * (exH + exGap) + 38, "always active, for every token", { size: 12, fill: C.warm });
          g += txt(ex0 + exW + 20, 84 + 8 * (exH + exGap) + 58, "used by DeepSeek, Kimi, GLM, Qwen3-Next · not by Qwen3 main line or gpt-oss", { size: 10.5, fill: C.dim });
        }
        if (f === 5) {
          g += rect(620, 120, 340, 200, { fill: C.box, stroke: C.line });
          g += txt(644, 158, "total FFN params  ∝  N", { size: 16, fill: C.accent, weight: 700 });
          g += txt(644, 196, "FLOPs per token   ∝  k", { size: 16, fill: C.warm, weight: 700 });
          g += txt(644, 240, "N = 256, k = 8", { size: 13, fill: C.ink });
          g += txt(644, 266, "→ 32× the capacity at the same cost", { size: 13, fill: C.dim });
          g += txt(644, 300, "The router itself is d × N — negligible.", { size: 11.5, fill: C.faint });
        }
      }
    } else if (f === 6) {
      [[8, 2, "8 experts, top-2", 28, C.warm, 160], [256, 8, "256 experts, top-8", 409663695276000, C.accent, 60]].forEach(function (cfg, k) {
        var X = 70 + k * 490, Y = 110;
        g += txt(X, Y - 18, cfg[2], { size: 13.5, fill: cfg[4], weight: 700, disp: true });
        var cols = cfg[0] === 8 ? 4 : 16, sz = cfg[0] === 8 ? 88 : 22, gp = cfg[0] === 8 ? 10 : 4;
        for (var e3 = 0; e3 < cfg[0]; e3++) {
          var r3 = Math.floor(e3 / cols), c3 = e3 % cols;
          var chosen3 = e3 < cfg[1];
          g += rect(X + c3 * (sz + gp), Y + r3 * (sz / (cfg[0] === 8 ? 2 : 1) + gp), sz, cfg[0] === 8 ? sz / 2 : sz,
            { fill: chosen3 ? cfg[4] : "#182027", op: chosen3 ? 0.6 : 1, stroke: C.grid, r: 2 });
        }
        var by = Y + (cfg[0] === 8 ? 2 : 16) * ((cfg[0] === 8 ? sz / 2 : sz) + gp) + 24;
        g += txt(X, by, "routing configurations", { size: 11, fill: C.faint, ls: "0.1em" });
        g += txt(X, by + 34, cfg[0] === 8 ? "28" : "4.1 × 10¹⁴", { size: 30, fill: cfg[4], weight: 800, disp: true });
        g += txt(X, by + 62, "same parameters · same FLOPs", { size: 11.5, fill: C.dim });
      });
      g += txt(70, E_H - 34, "Finer granularity also lowers the pressure on any single expert to be a generalist.", { size: 12.5, fill: C.dim });
    } else if (f === 7) {
      var models = [["Mixtral 8×7B", 27.6, C.red], ["Qwen3-235B-A22B", 9.4, C.warm], ["DeepSeek-V3", 5.5, C.cool],
                    ["gpt-oss-120b", 4.4, C.cool], ["Qwen3-Coder-Next", 3.8, C.accent], ["Kimi K2.5", 3.2, C.accent]];
      g += txt(70, 90, "active parameters as a share of total", { size: 11, fill: C.faint, ls: "0.12em" });
      models.forEach(function (r, i) {
        var yy = 120 + i * 58;
        g += txt(70, yy + 24, r[0], { size: 13, fill: C.ink, weight: 600 });
        g += rect(330, yy, 560 * (r[1] / 30), 34, { fill: r[2], op: 0.6 });
        g += txt(330 + 560 * (r[1] / 30) + 12, yy + 23, r[1] + " %", { size: 13.5, fill: r[2], weight: 700 });
      });
      g += txt(70, E_H - 26, "2023 → 2026, left to right in time. Total size grew; the fraction you pay for shrank.", { size: 12.5, fill: C.dim });
    } else if (f === 9 || f === 10) {
      var load = f === 9 ? [0.41, 0.03, 0.28, 0.01, 0.02, 0.19, 0.02, 0.04] : [0.14, 0.11, 0.13, 0.12, 0.13, 0.12, 0.12, 0.13];
      var bx0 = 120, bw0 = 92, base0 = 400;
      load.forEach(function (v, i) {
        var h = v * 640;
        var col = f === 9 ? (v > 0.15 ? C.red : "#2c3941") : C.accent;
        g += rect(bx0 + i * (bw0 + 12), base0 - h, bw0, h, { fill: col, op: 0.7 });
        g += txt(bx0 + i * (bw0 + 12) + bw0 / 2, base0 + 20, "e" + i, { size: 11, anchor: "middle", fill: C.faint });
        g += txt(bx0 + i * (bw0 + 12) + bw0 / 2, base0 - h - 10, (v * 100).toFixed(0) + "%", { size: 11, anchor: "middle", fill: col, weight: 600 });
      });
      g += line(bx0 - 20, base0, bx0 + 8 * (bw0 + 12), base0, { stroke: C.line });
      g += txt(bx0 - 20, 100, f === 9 ? "share of tokens routed to each expert — collapsed" : "share of tokens routed to each expert — balanced",
        { size: 13, fill: f === 9 ? C.red : C.accent, weight: 600 });
      if (f === 9) g += txt(bx0 - 20, 128, "Three experts take 88% of the traffic. The other five are dead parameters and idle devices.", { size: 12, fill: C.dim });
      else {
        g += txt(bx0 - 20, 128, "Auxiliary loss:  add α · N · Σ fᵢ Pᵢ  to the objective.", { size: 12, fill: C.dim });
        g += txt(bx0 - 20, 150, "Auxiliary-loss-free:  keep a bias bᵢ used only for top-k selection; increment it when expert i is starved.", { size: 12, fill: C.dim });
      }
    } else {
      var dev = 4, dx0 = 90, dw = 190;
      for (var dvi = 0; dvi < dev; dvi++) {
        g += rect(dx0 + dvi * (dw + 30), 120, dw, 220, { fill: C.box, stroke: C.grid });
        g += txt(dx0 + dvi * (dw + 30) + dw / 2, 146, "GPU " + dvi, { size: 12, anchor: "middle", fill: C.dim, weight: 600 });
        for (var ee = 0; ee < 4; ee++) {
          g += rect(dx0 + dvi * (dw + 30) + 20, 166 + ee * 40, dw - 40, 30, { fill: "#1b2a24", stroke: C.accent, sw: 0.8 });
          g += txt(dx0 + dvi * (dw + 30) + dw / 2, 186 + ee * 40, "expert " + (dvi * 4 + ee), { size: 10.5, anchor: "middle", fill: C.accent });
        }
      }
      for (var a = 0; a < dev; a++) {
        for (var bq = 0; bq < dev; bq++) {
          if (a === bq) continue;
          g += path("M " + (dx0 + a * (dw + 30) + dw / 2) + " 360 C " + (dx0 + a * (dw + 30) + dw / 2) + " 420, " +
            (dx0 + bq * (dw + 30) + dw / 2) + " 420, " + (dx0 + bq * (dw + 30) + dw / 2) + " 360",
            { stroke: C.violet, sw: 1, op: 0.4 });
        }
      }
      g += txt(90, 452, "dispatch all-to-all  →  expert compute  →  combine all-to-all", { size: 14, fill: C.violet, weight: 600 });
      g += txt(90, 478, "Twice per MoE layer. Load imbalance turns into a straggler that every device waits on.", { size: 12, fill: C.dim });
    }

    var html = svgOpen([0, 0, E_W, E_H], "56vh") + g + "</svg>";
    html += cap(MOE_FRAMES[f]);
    return { html: html, view: [0, 0, E_W, E_H], label: "step " + (f + 1) };
  }

  mount("fig-moe", { total: 12, interval: 3800, render: moeRender });

  /* ==========================================================================
     FIGURE 9 — beyond softmax
     ========================================================================== */
  var L_W = 1020, L_H = 520;
  var LIN_FRAMES = [
    "<strong>Softmax attention keeps everything.</strong> Every key and value ever computed stays in the cache, because any of them might be the one the next query needs. Precision of retrieval is bought with unbounded memory.",
    "<strong>Two bad scalings.</strong> Compute grows quadratically in sequence length; the cache grows linearly and forever. Sliding windows bound the second; nothing so far bounds both without giving something up.",
    "<strong>Rewrite the score as a kernel.</strong> Replace exp(qᵀk) with φ(q)ᵀφ(k) for some feature map φ. The exponential is what forces you to compute each pair separately; a factorizable score does not.",
    "<strong>Now reassociate.</strong> Matrix multiplication is associative, so instead of (φ(q)φ(K)ᵀ)V — which builds an s×s matrix — compute φ(q)(φ(K)ᵀV), which never does.",
    "<strong>The cache becomes a state.</strong> Σ φ(kₙ)vₙᵀ is a fixed d×d matrix that you update in place as tokens arrive. Constant memory, constant work per token, for any sequence length.",
    "<strong>Watch them diverge.</strong> The cache climbs with every token. The state does not move. At 256k tokens this is the difference between a serving stack that works and one that does not.",
    "<strong>What you gave up.</strong> exp is sharp — it can put nearly all its mass on one key, which is what \"retrieve the value stored at that specific token\" requires. A summed state superposes everything, and interference grows with what you have written into it.",
    "<strong>The delta rule.</strong> Instead of only accumulating, erase before you write: remove the state's existing prediction for this key, then write the new association, with learned gates controlling decay and write strength. This is what makes Gated DeltaNet competitive rather than merely cheap.",
    "<strong>Nobody ships it alone.</strong> Qwen3-Next, Qwen3-Coder-Next, and Qwen3.5 interleave three Gated DeltaNet blocks per gated-attention block. Ling 2.5 does the same with Lightning Attention. The structural argument is identical to sliding windows: most layers do not need exact long-range retrieval.",
    "<strong>Where this stands.</strong> There is no public controlled comparison at frontier scale. What we have is that Qwen promoted hybrid attention from a side branch into their main model line — a strong revealed preference, and not the same thing as a result."
  ];

  function linRender(f) {
    var g = rect(0, 0, L_W, L_H, { fill: C.bg });
    if (f === 0 || f === 4 || f === 5) {
      var s = f === 0 ? 8 : (f === 4 ? 8 : 20);
      var shown = f === 5 ? 20 : 8;
      g += txt(70, 84, "SOFTMAX ATTENTION · GROWING KV CACHE", { size: 10.5, fill: C.red, ls: "0.14em", weight: 600 });
      for (var i = 0; i < shown; i++) {
        g += rect(70 + i * 40, 106, 32, 32, { fill: C.red, op: 0.45, r: 2 });
        g += rect(70 + i * 40, 142, 32, 32, { fill: C.warm, op: 0.45, r: 2 });
      }
      g += txt(70, 196, "K and V for every token seen so far — " + shown + " entries and counting", { size: 12, fill: C.dim });
      if (f >= 4) {
        g += txt(70, 268, "LINEAR ATTENTION · FIXED STATE", { size: 10.5, fill: C.accent, ls: "0.14em", weight: 600 });
        for (var r = 0; r < 6; r++) for (var c = 0; c < 6; c++) {
          g += rect(70 + c * 26, 290 + r * 26, 22, 22, { fill: C.accent, op: 0.2 + 0.5 * Math.abs(Math.sin(r * 1.7 + c * 2.3 + shown)), r: 1 });
        }
        g += txt(240, 320, "S  =  Σ φ(kₙ) vₙᵀ", { size: 20, fill: C.accent, weight: 700 });
        g += txt(240, 350, "one d × d matrix, updated in place", { size: 12, fill: C.dim });
        g += txt(240, 374, "size after " + shown + " tokens: identical to size after 1", { size: 12, fill: C.accent, weight: 600 });
      }
      if (f === 5) {
        g += rect(640, 96, 320, 130, { fill: "#20191a", stroke: C.red });
        g += txt(664, 132, "cache at 256k tokens", { size: 12, fill: C.dim });
        g += txt(664, 168, "grows without bound", { size: 18, fill: C.red, weight: 700 });
        g += rect(640, 262, 320, 130, { fill: "#152a23", stroke: C.accent });
        g += txt(664, 298, "state at 256k tokens", { size: 12, fill: C.dim });
        g += txt(664, 334, "exactly d × d", { size: 18, fill: C.accent, weight: 700 });
      }
    } else if (f === 1) {
      var ax = 110, ay = 420, aw = 800, ah = 300;
      g += line(ax, ay, ax + aw, ay, { stroke: C.line });
      g += line(ax, ay, ax, ay - ah, { stroke: C.line });
      var d1 = "M ", d2 = "M ";
      for (var i2 = 0; i2 <= 100; i2++) {
        var t = i2 / 100;
        d1 += (i2 ? " L " : "") + (ax + t * aw).toFixed(1) + " " + (ay - t * t * ah * 0.95).toFixed(1);
        d2 += (i2 ? " L " : "") + (ax + t * aw).toFixed(1) + " " + (ay - t * ah * 0.42).toFixed(1);
      }
      g += path(d1, { stroke: C.red, sw: 2.4 });
      g += path(d2, { stroke: C.warm, sw: 2.4 });
      g += path("M " + ax + " " + (ay - 8) + " L " + (ax + aw) + " " + (ay - 8), { stroke: C.accent, sw: 2.4 });
      g += txt(ax + aw + 10, ay - ah * 0.9, "FLOPs  O(s²)", { size: 11.5, fill: C.red, anchor: "end" });
      g += txt(ax + aw - 8, ay - ah * 0.42 - 12, "KV cache  O(s)", { size: 11.5, fill: C.warm, anchor: "end" });
      g += txt(ax + aw - 8, ay - 22, "linear-attention state  O(1)", { size: 11.5, fill: C.accent, anchor: "end" });
      g += txt(ax + aw / 2, ay + 26, "sequence length", { size: 11, anchor: "middle", fill: C.faint });
    } else if (f === 2 || f === 3) {
      g += rect(70, 110, 880, 90, { fill: C.box, stroke: C.line });
      g += txt(96, 166, "exp( qᵀk )   →   φ(q)ᵀ φ(k)", { size: 26, fill: f === 2 ? C.accent : C.dim, weight: 700, disp: true });
      if (f === 3) {
        g += rect(70, 230, 420, 180, { fill: "#20191a", stroke: C.red });
        g += txt(96, 268, "( φ(q) φ(K)ᵀ ) V", { size: 20, fill: C.red, weight: 700 });
        g += txt(96, 302, "builds an s × s matrix first", { size: 12.5, fill: C.dim });
        g += txt(96, 328, "memory O(s²), compute O(s²d)", { size: 12.5, fill: C.dim });
        g += rect(530, 230, 420, 180, { fill: "#152a23", stroke: C.accent });
        g += txt(556, 268, "φ(q) ( φ(K)ᵀ V )", { size: 20, fill: C.accent, weight: 700 });
        g += txt(556, 302, "builds a d × d matrix instead", { size: 12.5, fill: C.dim });
        g += txt(556, 328, "memory O(d²), compute O(sd²)", { size: 12.5, fill: C.dim });
        g += txt(556, 368, "and d² does not depend on s at all", { size: 12.5, fill: C.accent, weight: 600 });
      } else {
        g += txt(96, 250, "The exponential is exactly what prevents factorization: exp(qᵀk) cannot be written", { size: 13, fill: C.ink });
        g += txt(96, 276, "as a product of a function of q and a function of k. Every pair must be computed.", { size: 13, fill: C.ink });
        g += txt(96, 320, "Replace it with a feature map and the score becomes a plain inner product —", { size: 13, fill: C.dim });
        g += txt(96, 346, "and plain inner products live inside matrix multiplications, which are associative.", { size: 13, fill: C.dim });
      }
    } else if (f === 6) {
      var cx = 300, cy = 260;
      for (var k2 = 0; k2 < 9; k2++) {
        var a2 = (k2 / 9) * Math.PI * 2;
        g += line(cx, cy, cx + 130 * Math.cos(a2), cy - 130 * Math.sin(a2), { stroke: C.accent, sw: 1.6, op: 0.35 });
      }
      g += circ(cx, cy, 26, { fill: "#152a23", stroke: C.accent, sw: 1.6 });
      g += txt(cx, cy + 5, "S", { size: 16, anchor: "middle", fill: C.accent, weight: 700 });
      g += txt(cx, cy + 172, "nine associations superposed in one state", { size: 11.5, anchor: "middle", fill: C.faint });
      g += rect(540, 150, 420, 220, { fill: C.box, stroke: C.line });
      g += txt(566, 190, "Softmax can concentrate.", { size: 15, fill: C.ink, weight: 600 });
      g += txt(566, 218, "One key gets 0.98 of the mass.", { size: 12.5, fill: C.dim });
      g += txt(566, 258, "A summed state cannot.", { size: 15, fill: C.red, weight: 600 });
      g += txt(566, 286, "Reading it back returns the target", { size: 12.5, fill: C.dim });
      g += txt(566, 308, "plus interference from everything", { size: 12.5, fill: C.dim });
      g += txt(566, 330, "else written into the same matrix.", { size: 12.5, fill: C.dim });
    } else if (f === 7) {
      g += rect(70, 120, 880, 90, { fill: C.box, stroke: C.accent });
      g += txt(96, 176, "Sₘ  =  Sₘ₋₁ ( αₘ I − βₘ kₘ kₘᵀ )  +  βₘ vₘ kₘᵀ", { size: 24, fill: C.accent, weight: 700, disp: true });
      var terms = [["αₘ", "decay — how fast old memories fade", C.warm],
                   ["βₘ kₘkₘᵀ", "erase — remove the state's current prediction for this key", C.red],
                   ["βₘ vₘkₘᵀ", "write — install the new association", C.accent]];
      terms.forEach(function (r, i) {
        var yy = 250 + i * 66;
        g += rect(70, yy, 880, 52, { fill: "#121920", stroke: C.grid });
        g += txt(96, yy + 32, r[0], { size: 15, fill: r[2], weight: 700 });
        g += txt(280, yy + 32, r[1], { size: 12.5, fill: C.dim });
      });
      g += txt(70, 474, "Pure accumulation only ever adds. The delta rule makes the state a memory you can overwrite.", { size: 12.5, fill: C.ink });
    } else if (f === 8) {
      for (var l = 0; l < 12; l++) {
        var attn = (l % 4) === 3;
        g += rect(180, 90 + l * 32, attn ? 520 : 300, 24, { fill: attn ? C.violet : C.accent, op: 0.55, r: 2 });
        g += txt(714, 107 + l * 32, attn ? "gated attention · exact retrieval" : "Gated DeltaNet · fixed state", { size: 11, fill: attn ? C.violet : C.dim });
        g += txt(164, 107 + l * 32, String(l), { size: 10.5, anchor: "end", fill: C.faint });
      }
      g += txt(180, 76, "Qwen3-Next / Qwen3.5 layer pattern, 3 : 1", { size: 11, fill: C.faint, ls: "0.1em" });
      g += txt(180, 500, "Ling 2.5 uses the same shape with Lightning Attention and MLA. GLM-5 keeps full attention but adds sparse selection.", { size: 12, fill: C.dim });
    } else {
      g += rect(70, 110, 880, 300, { fill: C.box, stroke: C.line });
      g += txt(96, 160, "What is actually established", { size: 16, fill: C.ink, weight: 700, disp: true });
      var pts = ["Linear attention has O(1) state and O(1) per-token cost. This is arithmetic, not an empirical claim.",
                 "Pure linear attention is worse at exact retrieval. This is well established and is why nobody ships it alone.",
                 "Hybrids match full attention at the scales their authors tested — reported by the authors, not independently replicated.",
                 "No public apples-to-apples comparison exists at frontier scale with data and post-training held fixed."];
      pts.forEach(function (p2, i) {
        g += txt(96, 208 + i * 46, "·", { size: 18, fill: i < 2 ? C.accent : C.warm, weight: 700 });
        g += txt(116, 208 + i * 46, p2, { size: 12.5, fill: i < 2 ? C.ink : C.dim });
      });
      g += txt(96, 396, "Qwen moving hybrid attention into their main line is a strong signal. It is not an ablation.", { size: 12.5, fill: C.warm, weight: 600 });
    }
    var html = svgOpen([0, 0, L_W, L_H], "54vh") + g + "</svg>";
    html += cap(LIN_FRAMES[f]);
    return { html: html, view: [0, 0, L_W, L_H], label: "step " + (f + 1) };
  }

  mount("fig-linear", { total: 10, interval: 3800, render: linRender });

  /* ==========================================================================
     FIGURE 10 — interactive architecture calculator
     ========================================================================== */
  var CALC_PRESETS = {
    gpt2xl: { label: "GPT-2 XL", d: 1600, L: 48, nq: 25, nkv: 25, dh: 64, V: 50257, tied: 1, moe: 0, glu: 0, dff: 6400, N: 0, k: 0, de: 0, shared: 0, denseLayers: 0, attn: "gqa", s: 1024 },
    llama2: { label: "Llama 2 7B", d: 4096, L: 32, nq: 32, nkv: 32, dh: 128, V: 32000, tied: 0, moe: 0, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, dff: 11008, N: 0, k: 0, de: 0, shared: 0, denseLayers: 0, attn: "gqa", s: 4096 },
    llama3: { label: "Llama 3 8B", d: 4096, L: 32, nq: 32, nkv: 8, dh: 128, V: 128256, tied: 0, moe: 0, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, dff: 14336, N: 0, k: 0, de: 0, shared: 0, denseLayers: 0, attn: "gqa", s: 8192 },
    olmo3: { label: "Olmo 3 32B", d: 5120, L: 64, nq: 40, nkv: 8, dh: 128, V: 100352, tied: 0, moe: 0, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, dff: 27648, N: 0, k: 0, de: 0, shared: 0, denseLayers: 0, attn: "gqa", s: 65536 },
    qwen3: { label: "Qwen3-235B-A22B", d: 4096, L: 94, nq: 64, nkv: 4, dh: 128, V: 151936, tied: 0, moe: 1, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, dff: 12288, N: 128, k: 8, de: 1536, shared: 0, denseLayers: 0, attn: "gqa", s: 32768 },
    gptoss: { label: "gpt-oss-120b", d: 2880, L: 36, nq: 64, nkv: 8, dh: 64, V: 201088, tied: 0, moe: 1, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, dff: 2880, N: 128, k: 4, de: 2880, shared: 0, denseLayers: 0, attn: "gqa", s: 131072 },
    dsv3: { label: "DeepSeek-V3", d: 7168, L: 61, nq: 128, nkv: 128, dh: 128, V: 129280, tied: 0, moe: 1, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, glu: 1, dff: 18432, N: 256, k: 8, de: 2048, shared: 1, denseLayers: 3, attn: "mla", s: 131072 }
  };
  var MLA = { r: 512, rope: 64, qlora: 1536, nope: 128, vh: 128 };

  function calcModel(c) {
    var emb = c.V * c.d * (c.tied ? 1 : 2);
    var attn, kvPerTok;
    if (c.attn === "mla") {
      var per = c.d * MLA.qlora + MLA.qlora * c.nq * (MLA.nope + MLA.rope) +
        c.d * (MLA.r + MLA.rope) + MLA.r * c.nq * (MLA.nope + MLA.vh) + c.nq * MLA.vh * c.d;
      attn = per * c.L;
      kvPerTok = c.L * (MLA.r + MLA.rope) * 2;
    } else {
      attn = 2 * c.L * c.d * c.dh * (c.nq + c.nkv);
      kvPerTok = 2 * c.L * c.nkv * c.dh * 2;
    }
    var ffnTotal, ffnActive;
    if (c.moe) {
      var Lm = c.L - c.denseLayers;
      ffnTotal = 3 * Lm * c.d * c.de * (c.N + c.shared) + 3 * c.denseLayers * c.d * c.dff + Lm * c.d * c.N;
      ffnActive = 3 * Lm * c.d * c.de * (c.k + c.shared) + 3 * c.denseLayers * c.d * c.dff;
    } else {
      var nm = c.glu ? 3 : 2;
      ffnTotal = ffnActive = nm * c.L * c.d * c.dff;
    }
    var total = emb + attn + ffnTotal;
    var head = c.V * c.d;
    var active = attn + ffnActive + head;
    var attnFlops = 4 * c.L * c.nq * c.dh * c.s;
    var mmFlops = 2 * active;
    return {
      total: total, active: active, emb: emb, attn: attn, ffnTotal: ffnTotal, ffnActive: ffnActive,
      frac: active / total, kvPerTok: kvPerTok, kvAtS: kvPerTok * c.s,
      flops: mmFlops + attnFlops, attnShare: attnFlops / (mmFlops + attnFlops),
      wBytes: total * 2
    };
  }

  (function initCalc() {
    var root = document.getElementById("fig-calc");
    if (!root) return;
    var ctrls = root.querySelector("#calc-controls");
    var out = root.querySelector("#calc-readout");
    var cfg = Object.assign({}, CALC_PRESETS.llama3);

    var SEQS = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576];
    var FIELDS = [
      { k: "d", label: "d_model", min: 512, max: 8192, step: 128 },
      { k: "L", label: "layers", min: 4, max: 128, step: 1 },
      { k: "nq", label: "query heads", min: 4, max: 128, step: 4 },
      { k: "nkv", label: "KV heads", min: 1, max: 128, step: 1, hideIf: function () { return cfg.attn === "mla"; } },
      { k: "dh", label: "head dim", min: 32, max: 256, step: 32 },
      { k: "V", label: "vocabulary", min: 16000, max: 262144, step: 2048 },
      { k: "dff", label: "dense d_ff", min: 512, max: 32768, step: 256, hideIf: function () { return !!cfg.moe && cfg.denseLayers === 0; } },
      { k: "N", label: "experts", min: 0, max: 512, step: 1, showIf: function () { return !!cfg.moe; } },
      { k: "k", label: "top-k routed", min: 1, max: 32, step: 1, showIf: function () { return !!cfg.moe; } },
      { k: "de", label: "expert d_ff", min: 128, max: 8192, step: 128, showIf: function () { return !!cfg.moe; } },
      { k: "shared", label: "shared experts", min: 0, max: 4, step: 1, showIf: function () { return !!cfg.moe; } }
    ];

    function buildControls() {
      var h = "";
      h += '<div class="calc-field"><label for="calc-ffn">feed-forward</label>' +
        '<select id="calc-ffn"><option value="classic">classic FFN &mdash; 2 matrices, GELU</option>' +
        '<option value="swiglu">dense SwiGLU &mdash; 3 matrices</option>' +
        '<option value="moe">mixture of experts</option></select></div>';
      h += '<div class="calc-field"><label for="calc-attn">attention</label>' +
        '<select id="calc-attn"><option value="gqa">MHA / GQA / MQA</option><option value="mla">multi-head latent (r=512)</option></select></div>';
      FIELDS.forEach(function (f) {
        if (f.showIf && !f.showIf()) return;
        if (f.hideIf && f.hideIf()) return;
        h += '<div class="calc-field"><label for="cf-' + f.k + '">' + f.label + ' <b id="cv-' + f.k + '">' + cfg[f.k] + '</b></label>' +
          '<input type="range" id="cf-' + f.k + '" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" value="' + cfg[f.k] + '" ' +
          'aria-label="' + f.label + '"></div>';
      });
      var si = SEQS.indexOf(cfg.s); if (si < 0) si = 3;
      h += '<div class="calc-field"><label for="cf-s">sequence length <b id="cv-s">' + fmtTok(cfg.s) + '</b></label>' +
        '<input type="range" id="cf-s" min="0" max="' + (SEQS.length - 1) + '" step="1" value="' + si + '" aria-label="sequence length"></div>';
      h += '<div class="calc-field"><label for="cf-tied">tied embeddings <b id="cv-tied">' + (cfg.tied ? "yes" : "no") + '</b></label>' +
        '<input type="range" id="cf-tied" min="0" max="1" step="1" value="' + cfg.tied + '" aria-label="tied embeddings"></div>';
      ctrls.innerHTML = h;

      ctrls.querySelector("#calc-ffn").value = cfg.moe ? "moe" : (cfg.glu ? "swiglu" : "classic");
      ctrls.querySelector("#calc-attn").value = cfg.attn;
      ctrls.querySelector("#calc-ffn").addEventListener("change", function (e) {
        var v = e.target.value;
        cfg.moe = v === "moe" ? 1 : 0;
        cfg.glu = v === "classic" ? 0 : 1;
        if (cfg.moe && !cfg.N) { cfg.N = 64; cfg.k = 8; cfg.de = 1536; }
        buildControls(); render();
      });
      ctrls.querySelector("#calc-attn").addEventListener("change", function (e) {
        cfg.attn = e.target.value; buildControls(); render();
      });
      FIELDS.forEach(function (f) {
        var el2 = ctrls.querySelector("#cf-" + f.k);
        if (!el2) return;
        el2.addEventListener("input", function () {
          cfg[f.k] = parseInt(el2.value, 10);
          if (f.k === "nq" && cfg.nkv > cfg.nq) cfg.nkv = cfg.nq;
          if (f.k === "k" && cfg.k > cfg.N) cfg.k = cfg.N;
          var vb = ctrls.querySelector("#cv-" + f.k); if (vb) vb.textContent = cfg[f.k];
          render();
        });
      });
      ctrls.querySelector("#cf-s").addEventListener("input", function (e) {
        cfg.s = SEQS[parseInt(e.target.value, 10)];
        ctrls.querySelector("#cv-s").textContent = fmtTok(cfg.s);
        render();
      });
      ctrls.querySelector("#cf-tied").addEventListener("input", function (e) {
        cfg.tied = parseInt(e.target.value, 10);
        ctrls.querySelector("#cv-tied").textContent = cfg.tied ? "yes" : "no";
        render();
      });
    }

    function bar(label, frac, col) {
      return '<div class="bar-row"><span>' + esc(label) + '</span><span class="bar-track">' +
        '<span class="bar-fill" style="width:' + Math.min(100, frac * 100).toFixed(1) + '%;background:' + col + '"></span>' +
        '</span><span style="flex:0 0 62px;text-align:right">' + (frac * 100).toFixed(1) + "%</span></div>";
    }

    function render() {
      var m = calcModel(cfg);
      var h = "";
      h += '<div class="readout"><dt>total parameters</dt><dd>' + fmtNum(m.total) +
        "<small>" + fmtBytes(m.wBytes) + " of weights in bf16</small></dd></div>";
      h += '<div class="readout"><dt>active parameters per token</dt><dd>' + fmtNum(m.active) +
        "<small>" + (m.frac * 100).toFixed(1) + "% of total" + (cfg.moe ? " · sparse" : " · dense") + "</small></dd></div>";
      h += '<div class="readout"><dt>KV cache</dt><dd>' + fmtBytes(m.kvPerTok) + " / token" +
        "<small>" + fmtBytes(m.kvAtS) + " at " + fmtTok(cfg.s) + " tokens, one sequence</small></dd></div>";
      h += '<div class="readout"><dt>forward FLOPs per token</dt><dd>' + fmtNum(m.flops) +
        "<small>attention scores and value aggregation are " + (m.attnShare * 100).toFixed(1) + "% of it at this length</small></dd></div>";
      h += '<div style="margin-top:14px">';
      h += bar("embeddings", m.emb / m.total, C.violet);
      h += bar("attention", m.attn / m.total, C.cool);
      h += bar(cfg.moe ? "experts" : "feed-forward", m.ffnTotal / m.total, C.accent);
      h += "</div>";
      h += '<p class="figure-note" style="margin-top:12px">Training a step costs roughly 6 × active parameters × tokens in FLOPs, so ' +
        fmtNum(6 * m.active) + " per token of forward and backward combined.</p>";
      out.innerHTML = h;
    }

    root.querySelectorAll(".panel-toggles button").forEach(function (b) {
      b.addEventListener("click", function () {
        root.querySelectorAll(".panel-toggles button").forEach(function (o) {
          o.setAttribute("aria-pressed", o === b ? "true" : "false");
        });
        cfg = Object.assign({}, CALC_PRESETS[b.getAttribute("data-preset")]);
        buildControls(); render();
      });
    });

    buildControls();
    render();
  })();

})();
