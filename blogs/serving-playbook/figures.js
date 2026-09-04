/* ------------------------------------------------------------------
   The Serving Playbook - animated figures
   A tiny frame engine plus eighteen hand-built SVG animations.
   Every figure honours the blog animation contract: prev/next,
   play/pause, 0.5x/1x/2x, frame counter, reduced motion.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var P = {
    bg: "#0f1317", ink: "#e4eaee", dim: "#93a0a8", faint: "#5d6a73",
    line: "#39454e", grid: "#1c242b", panel: "#161c22",
    green: "#3fd1a0", blue: "#5ab2e8", amber: "#f0b45a",
    pink: "#e8697d", purple: "#a98bf0", teal: "#4fb8c9", rust: "#d97a52"
  };
  var HUES = [P.green, P.blue, P.amber, P.purple, P.teal, P.pink, P.rust, "#8fd15a"];
  var MONO = "IBM Plex Mono, ui-monospace, monospace";

  function R(n) { return Math.round(n * 100) / 100; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function S(f, a, b) { return clamp((f - a) / (b - a), 0, 1); }
  function E(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function rc(x, y, w, h, fill, extra) {
    return '<rect x="' + R(x) + '" y="' + R(y) + '" width="' + R(Math.max(0, w)) +
      '" height="' + R(Math.max(0, h)) + '" fill="' + fill + '" ' + (extra || "") + "/>";
  }
  function tx(x, y, s, o) {
    o = o || {};
    return '<text x="' + R(x) + '" y="' + R(y) + '" fill="' + (o.f || P.dim) +
      '" font-family="' + (o.ff || MONO) + '" font-size="' + (o.s || 11) +
      '" font-weight="' + (o.w || 500) + '" text-anchor="' + (o.a || "start") + '"' +
      (o.op !== undefined ? ' opacity="' + R(o.op) + '"' : "") +
      (o.ls ? ' letter-spacing="' + o.ls + '"' : "") + ">" + s + "</text>";
  }
  function ln(x1, y1, x2, y2, st, w, extra) {
    return '<line x1="' + R(x1) + '" y1="' + R(y1) + '" x2="' + R(x2) + '" y2="' + R(y2) +
      '" stroke="' + st + '" stroke-width="' + (w || 1) + '" ' + (extra || "") + "/>";
  }
  function pth(d, st, w, fill, extra) {
    return '<path d="' + d + '" stroke="' + (st || "none") + '" stroke-width="' + (w || 1) +
      '" fill="' + (fill || "none") + '" ' + (extra || "") + "/>";
  }
  function sv(inner, w, h) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg"' +
      ' preserveAspectRatio="xMidYMid meet" role="presentation"' +
      ' style="display:block;width:100%;height:auto;max-width:100%;overflow:visible">' +
      inner + "</svg>";
  }
  function meter(x, y, w, h, frac, col, label, value) {
    var s = rc(x, y, w, h, "#1b242b");
    s += rc(x, y, w * clamp(frac, 0, 1), h, col);
    s += rc(x, y, w, h, "none", 'stroke="' + P.line + '" stroke-width="0.8"');
    if (label) s += tx(x, y - 6, label, { s: 10, f: P.faint });
    if (value) s += tx(x + w, y - 6, value, { s: 10, f: col, a: "end", w: 600 });
    return s;
  }
  function chip(x, y, w, h, col, label, op) {
    var s = rc(x, y, w, h, col, 'opacity="' + (op === undefined ? 1 : op) + '" rx="1"');
    s += tx(x + w / 2, y + h / 2 + 4, label, { s: 11, f: "#08141a", a: "middle", w: 600, op: op });
    return s;
  }

  /* ---------------- frame engine ---------------- */
  var RM = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  function Figure(el, total, render, base) {
    this.el = el; this.total = total; this.render = render; this.base = base || 110;
    this.i = 0; this.speed = 1; this.timer = null; this.playing = false; this.userPaused = false;
    this.stage = el.querySelector(".animation-stage");
    this.caption = el.querySelector(".figure-caption");
    this.status = el.querySelector(".animation-status");
    var self = this;
    this.btn = {};
    Array.prototype.forEach.call(el.querySelectorAll("button[data-action]"), function (b) {
      self.btn[b.getAttribute("data-action")] = b;
    });
    this.btn.previous.addEventListener("click", function () { self.pause(true); self.step(-1); });
    this.btn.next.addEventListener("click", function () { self.pause(true); self.step(1); });
    this.btn["play-pause"].addEventListener("click", function () {
      if (self.playing) { self.pause(true); } else { self.play(true); }
    });
    this.speedBtns = el.querySelectorAll("button[data-speed]");
    Array.prototype.forEach.call(this.speedBtns, function (b) {
      b.addEventListener("click", function () { self.setSpeed(parseFloat(b.getAttribute("data-speed"))); });
    });
    this.draw();
    if (RM.matches) {
      this.pause(false);
    } else if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!self.userPaused) self.play(false); }
          else { self.halt(); self.playing = false; self.reflect(); }
        });
      }, { threshold: 0.05 });
      io.observe(el);
      setTimeout(function () {
        if (!self.playing && !self.userPaused && self.el.getBoundingClientRect().top < window.innerHeight) self.play(false);
      }, 400);
    } else {
      this.play(false);
    }
  }
  Figure.prototype.halt = function () { if (this.timer) { clearInterval(this.timer); this.timer = null; } };
  Figure.prototype.play = function (byUser) {
    if (byUser) this.userPaused = false;
    this.halt();
    this.playing = true;
    var self = this;
    this.timer = setInterval(function () { self.step(1); }, this.base / this.speed);
    this.reflect();
  };
  Figure.prototype.pause = function (byUser) {
    if (byUser) this.userPaused = true;
    this.halt(); this.playing = false; this.reflect();
  };
  Figure.prototype.setSpeed = function (v) {
    this.speed = v;
    Array.prototype.forEach.call(this.speedBtns, function (b) {
      b.setAttribute("aria-pressed", parseFloat(b.getAttribute("data-speed")) === v ? "true" : "false");
    });
    if (this.playing) this.play(false);
  };
  Figure.prototype.step = function (d) {
    this.i = (this.i + d + this.total) % this.total;
    this.draw();
  };
  Figure.prototype.reflect = function () {
    var b = this.btn["play-pause"];
    b.textContent = this.playing ? "Pause" : "Play";
    b.setAttribute("aria-pressed", this.playing ? "true" : "false");
    b.setAttribute("aria-label", this.playing ? "Pause animation" : "Play animation");
  };
  Figure.prototype.draw = function () {
    var out = this.render(this.i, RM.matches);
    this.stage.innerHTML = out[0];
    if (this.caption) this.caption.innerHTML = out[1];
    this.stage.setAttribute("aria-label", String(out[1]).replace(/<[^>]+>/g, ""));
    this.status.textContent = "Frame " + pad2(this.i + 1) + " / " + this.total;
  };

  var REG = [];
  function reg(id, total, render, base) { REG.push({ id: id, total: total, render: render, base: base }); }

  /* =========================================================
     FIGURE 1 - weight-read amortization
     ========================================================= */
  var F1B = [2, 4, 8, 16, 32, 64, 128, 256];
  reg("fig-amortize", 64, function (f) {
    var B = 1, k = 0;
    if (f >= 18) { k = Math.min(F1B.length - 1, Math.floor((f - 18) / 5)); B = F1B[k]; }
    var ridge = 295, I = B;
    var fu = Math.min(1, I / ridge), bu = I <= ridge ? 1 : ridge / I;
    var ms = Math.max(4.78, 0.01616 * B), tps = B / ms * 1000;
    var g = "";
    g += rc(0, 0, 720, 340, P.bg);
    // HBM
    g += rc(34, 62, 132, 150, P.panel, 'stroke="' + P.line + '"');
    g += tx(100, 84, "HBM", { s: 12, f: P.ink, a: "middle", w: 600 });
    g += tx(100, 102, "3.35 TB/s", { s: 10, a: "middle" });
    for (var i = 0; i < 5; i++) g += rc(48, 116 + i * 17, 104, 12, i % 2 ? "#233039" : "#2a3a45");
    g += tx(100, 226, "16 GB of weights", { s: 10, a: "middle", f: P.faint });
    // stream
    var ph = (f % 6) / 6;
    for (var c = 0; c < 7; c++) {
      var cx = 176 + ((c + ph) % 7) * 11;
      g += pth("M" + R(cx) + " 130 l6 7 l-6 7", P.blue, 1.6);
    }
    g += tx(215, 112, "one sweep", { s: 9.5, a: "middle", f: P.blue });
    g += tx(215, 168, "per iteration", { s: 9.5, a: "middle", f: P.faint });
    // SM block
    g += rc(258, 62, 168, 150, P.panel, 'stroke="' + P.line + '"');
    g += tx(342, 84, "TENSOR CORES", { s: 11, f: P.ink, a: "middle", w: 600, ls: "1" });
    g += tx(342, 100, "989 TFLOP/s bf16", { s: 10, a: "middle" });
    var cols = 8, rows = 5, lit = Math.round(fu * cols * rows);
    for (var r2 = 0; r2 < rows; r2++) for (var c2 = 0; c2 < cols; c2++) {
      var idx = r2 * cols + c2;
      g += rc(276 + c2 * 17, 114 + r2 * 17, 13, 13, idx < lit ? P.green : "#1e272e");
    }
    g += tx(342, 226, lit + " of 40 units doing work", { s: 10, a: "middle", f: P.faint });
    // tokens out
    g += tx(510, 84, "TOKENS THIS STEP", { s: 11, f: P.ink, a: "middle", w: 600, ls: "1" });
    var shown = Math.min(B, 24);
    for (var t2 = 0; t2 < shown; t2++) {
      var op = 0.35 + 0.65 * S(f % 6, 0, 3);
      g += rc(436 + (t2 % 6) * 25, 104 + Math.floor(t2 / 6) * 20, 20, 15, P.amber, 'opacity="' + R(t2 === shown - 1 ? op : 1) + '"');
    }
    if (B > 24) g += tx(510, 200, "+ " + (B - 24) + " more", { s: 10, a: "middle", f: P.amber });
    g += tx(510, 226, "batch size B = " + B, { s: 11, a: "middle", f: P.ink, w: 600 });
    // meters
    g += meter(34, 268, 300, 13, bu, P.blue, "HBM BANDWIDTH USED", Math.round(bu * 100) + "%");
    g += meter(34, 306, 300, 13, fu, P.green, "PEAK FLOPS USED", (fu * 100 < 1 ? (fu * 100).toFixed(1) : Math.round(fu * 100)) + "%");
    g += tx(386, 262, "arithmetic intensity", { s: 10 });
    g += tx(700, 262, I + " FLOP/byte", { s: 11, a: "end", f: P.ink, w: 600 });
    g += tx(386, 284, "balance point", { s: 10 });
    g += tx(700, 284, "295 FLOP/byte", { s: 11, a: "end", f: P.faint });
    g += tx(386, 306, "step time", { s: 10 });
    g += tx(700, 306, ms.toFixed(2) + " ms", { s: 11, a: "end", f: P.ink, w: 600 });
    g += tx(386, 328, "throughput", { s: 10 });
    g += tx(700, 328, Math.round(tps).toLocaleString() + " tok/s", { s: 11, a: "end", f: P.amber, w: 600 });
    var cap;
    if (f < 18) cap = "Batch 1. The full 16 GB of weights crosses the bus to produce <b>one token</b>. The tensor cores are 0.3% busy.";
    else if (B < 64) cap = "Batch " + B + ". Identical weight traffic, " + B + "&times; the useful work. Intensity is exactly <b>B FLOPs per byte</b>.";
    else if (B < 256) cap = "Batch " + B + ". Step time has barely moved while throughput is up " + Math.round(tps / 209) + "&times;. This is the free lunch.";
    else cap = "Batch 256 sits on the balance point. Past here decode is <b>compute-bound</b> and extra batch costs real time.";
    return [sv(g, 720, 340), cap];
  });

  /* =========================================================
     FIGURE 2 - static batch decay
     ========================================================= */
  var F2L = [5, 20, 8, 24, 12, 7, 16, 10];
  reg("fig-static", 60, function (f) {
    var T = 24, cw = 20, ch = 18, x0 = 148, y0 = 66;
    var iter = clamp(Math.round(f * T / 54), 0, T);
    var g = rc(0, 0, 720, 330, P.bg);
    g += tx(148, 34, "STATIC BATCH OF 8 - ITERATION " + pad2(iter), { s: 11, f: P.ink, w: 600, ls: "1" });
    var useful = 0;
    for (var r = 0; r < 8; r++) {
      var y = y0 + r * (ch + 4);
      g += tx(140, y + 13, "R" + (r + 1), { s: 10, a: "end", f: P.faint });
      g += tx(120, y + 13, F2L[r] + "t", { s: 9, a: "end", f: P.line });
      for (var c = 0; c < T; c++) {
        var x = x0 + c * (cw + 2);
        if (c >= iter) { g += rc(x, y, cw, ch, "#161e24"); continue; }
        if (c < F2L[r]) { useful++; g += rc(x, y, cw, ch, HUES[r % 8], 'opacity="0.85"'); }
        else { g += rc(x, y, cw, ch, "#2a1a1e"); g += ln(x, y + ch, x + cw, y, "#4a2b32", 1); }
      }
      if (iter > F2L[r]) g += tx(x0 + F2L[r] * (cw + 2) + 3, y + 13, "EOS", { s: 8, f: P.pink });
    }
    var cur = x0 + iter * (cw + 2) - 1;
    if (iter < T) g += ln(cur, y0 - 6, cur, y0 + 8 * (ch + 4) - 2, P.ink, 1.5, 'opacity="0.7"');
    // queue
    g += tx(20, 66, "QUEUE", { s: 10, f: P.faint, ls: "1" });
    for (var q = 0; q < 4; q++) {
      var op = iter >= T ? 0.25 : 1;
      g += rc(20, 76 + q * 22, 78, 17, "#20292f", 'stroke="' + P.line + '"');
      g += tx(59, 89 + q * 22, "R" + (9 + q), { s: 10, a: "middle", f: P.faint, op: op });
    }
    g += tx(20, 186, "blocked until", { s: 9, f: P.pink });
    g += tx(20, 198, "the batch ends", { s: 9, f: P.pink });
    var tot = 8 * iter, dead = tot - useful;
    var util = tot ? useful / tot : 1;
    g += meter(148, 268, 300, 13, util, util > 0.75 ? P.green : P.amber, "SLOT-STEPS DOING USEFUL WORK", Math.round(util * 100) + "%");
    g += tx(480, 268, "useful", { s: 10 });
    g += tx(700, 268, useful + " cells", { s: 11, a: "end", f: P.green, w: 600 });
    g += tx(480, 290, "wasted on finished slots", { s: 10 });
    g += tx(700, 290, dead + " cells", { s: 11, a: "end", f: P.pink, w: 600 });
    g += tx(148, 300, "effective batch size", { s: 10 });
    var eff = 0; for (var e2 = 0; e2 < 8; e2++) if (iter < F2L[e2]) eff++;
    g += tx(430, 300, eff + " of 8", { s: 11, a: "end", f: eff > 5 ? P.green : P.pink, w: 600 });
    var cap;
    if (iter < 5) cap = "All eight sequences are live. This is the batch you paid for, and it lasts five iterations.";
    else if (iter < 14) cap = "R1 hit end-of-sequence at step 5. Its slot, its KV blocks and its rows in every GEMM are still allocated.";
    else if (iter < T) cap = "Effective batch size has decayed to " + eff + ". Arithmetic intensity is leaking away while four requests wait in the queue.";
    else cap = "Final tally: <b>102 useful slot-steps out of 192</b>. Forty-seven percent of the batch was spent on sequences that had already finished.";
    return [sv(g, 720, 330), cap];
  });

  /* =========================================================
     FIGURE 3 - static vs continuous  (hero)
     ========================================================= */
  var F3L = [4, 18, 3, 7, 12, 2, 9, 5, 20, 3, 6, 4, 8, 15, 2, 5];
  var F3stat = [], F3cont = [], F3statEnd = 0, F3contEnd = 0;
  (function () {
    var base = 0;
    for (var g = 0; g < 4; g++) {
      var grp = F3L.slice(g * 4, g * 4 + 4);
      var dur = Math.max.apply(null, grp);
      for (var i = 0; i < 4; i++) F3stat.push({ id: g * 4 + i, slot: i, s: base, e: base + grp[i], ge: base + dur });
      base += dur;
    }
    F3statEnd = base;
    var free = [0, 0, 0, 0];
    for (var j = 0; j < F3L.length; j++) {
      var s = 0;
      for (var k = 1; k < 4; k++) if (free[k] < free[s]) s = k;
      F3cont.push({ id: j, slot: s, s: free[s], e: free[s] + F3L[j] });
      free[s] += F3L[j];
    }
    F3contEnd = Math.max.apply(null, free);
  })();
  reg("fig-continuous", 72, function (f) {
    var T = F3statEnd, W = 452, x0 = 196, u = W / T;
    var t = clamp(f * T / 66, 0, T);
    var g = rc(0, 0, 720, 380, P.bg);
    function panel(y0, label, jobs, isStatic, endT) {
      var s = tx(x0, y0 - 12, label, { s: 11, f: P.ink, w: 600, ls: "1" });
      for (var r = 0; r < 4; r++) {
        s += rc(x0, y0 + r * 24, W, 19, "#161e24");
        s += tx(x0 - 8, y0 + r * 24 + 14, "slot " + r, { s: 9, a: "end", f: P.line });
      }
      var done = 0, busy = 0;
      for (var i = 0; i < jobs.length; i++) {
        var j = jobs[i], y = y0 + j.slot * 24;
        if (j.s >= t) continue;
        var w = (Math.min(t, j.e) - j.s) * u;
        s += rc(x0 + j.s * u, y, w, 19, HUES[j.id % 8], 'opacity="0.88"');
        if (w > 16) s += tx(x0 + j.s * u + 3, y + 13, "R" + (j.id + 1), { s: 8.5, f: "#0a1519", w: 600 });
        if (j.e <= t) done++; else busy++;
        if (isStatic && j.e < t) {
          var dw = (Math.min(t, j.ge) - j.e) * u;
          s += rc(x0 + j.e * u, y, dw, 19, "#2a1a1e");
        }
      }
      s += tx(x0 + W + 10, y0 + 14, "done", { s: 9, f: P.faint });
      s += tx(x0 + W + 10, y0 + 30, done + " / 16", { s: 13, f: done === 16 ? P.green : P.ink, w: 600 });
      s += tx(x0 + W + 10, y0 + 50, "live " + busy, { s: 9, f: P.faint });
      if (t >= endT) {
        var dx = x0 + endT * u, near = dx > 460;
        s += ln(dx, y0 - 4, dx, y0 + 96, P.green, 1.5, 'stroke-dasharray="3 3"');
        s += tx(near ? dx - 6 : dx + 4, y0 + 108, "drained at iteration " + endT, { s: 9.5, f: P.green, a: near ? "end" : "start" });
      }
      return s;
    }
    g += panel(56, "STATIC BATCHING - groups of four, everyone waits for the slowest", F3stat, true, F3statEnd);
    g += panel(212, "CONTINUOUS BATCHING - a free slot is refilled on the next iteration", F3cont, false, F3contEnd);
    // queue column
    g += tx(20, 44, "ARRIVALS", { s: 10, f: P.faint, ls: "1" });
    for (var q = 0; q < 16; q++) {
      var placed = F3cont[q].s < t;
      g += rc(20 + (q % 4) * 20, 56 + Math.floor(q / 4) * 18, 17, 15, placed ? "#1b2429" : HUES[q % 8], 'opacity="' + (placed ? 1 : 0.9) + '"');
    }
    g += tx(20, 148, "16 requests,", { s: 9.5, f: P.faint });
    g += tx(20, 160, "lengths 2-20", { s: 9.5, f: P.faint });
    g += tx(20, 180, "grey = already", { s: 9, f: P.line });
    g += tx(20, 191, "admitted", { s: 9, f: P.line });
    // cursor
    g += ln(x0 + t * u, 30, x0 + t * u, 320, P.ink, 1.2, 'opacity="0.55"');
    g += tx(x0 + t * u, 24, "iter " + Math.round(t), { s: 9.5, a: "middle", f: P.ink });
    // utilisation
    var uS = 0, uC = 0;
    for (var a = 0; a < 16; a++) { uS += Math.max(0, Math.min(t, F3stat[a].e) - F3stat[a].s); uC += Math.max(0, Math.min(t, F3cont[a].e) - F3cont[a].s); }
    var capS = 4 * Math.min(t, F3statEnd), capC = 4 * Math.min(t, F3contEnd);
    g += meter(196, 344, 210, 12, capS ? uS / capS : 0, P.pink, "STATIC OCCUPANCY", capS ? Math.round(uS / capS * 100) + "%" : "-");
    g += meter(452, 344, 210, 12, capC ? uC / capC : 0, P.green, "CONTINUOUS OCCUPANCY", capC ? Math.round(uC / capC * 100) + "%" : "-");
    var cap;
    if (t < 12) cap = "Both panels start identically: four slots, four requests, everything busy.";
    else if (t < F3contEnd) cap = "The short requests have finished. Above, their slots sit dark until the group boundary. Below, the next arrival took the slot on the following iteration.";
    else if (t < F3statEnd) cap = "Continuous batching drained the queue at iteration " + F3contEnd + ". Static batching is still working through group four.";
    else cap = "Same GPU, same sixteen requests: <b>" + F3statEnd + " iterations versus " + F3contEnd + "</b>. The gap widens with output-length variance.";
    return [sv(g, 720, 380), cap];
  }, 95);

  /* =========================================================
     FIGURE 4 - scheduler state machine
     ========================================================= */
  var F4KEY = [
    { f: 0, wait: ["D", "E", "F", "G"], run: ["A", "B", "C"], pre: [], kv: 20, tok: 3, note: "steady state" },
    { f: 8, wait: ["E", "F", "G"], run: ["A", "B", "C", "D"], pre: [], kv: 30, tok: 4, note: "admit D" },
    { f: 16, wait: ["F", "G"], run: ["A", "B", "C", "D", "E"], pre: [], kv: 42, tok: 5, note: "admit E" },
    { f: 24, wait: ["F", "G"], run: ["A", "B", "C", "D", "E"], pre: [], kv: 59, tok: 5, note: "everyone grows" },
    { f: 32, wait: ["F", "G"], run: ["A", "B", "C", "D"], pre: ["E"], kv: 44, tok: 4, note: "preempt E" },
    { f: 40, wait: ["F", "G"], run: ["B", "C", "D"], pre: ["E"], kv: 33, tok: 3, note: "A finishes" },
    { f: 48, wait: ["G"], run: ["B", "C", "D", "E", "F"], pre: [], kv: 46, tok: 5, note: "readmit E, refill" },
    { f: 55, wait: ["G"], run: ["B", "C", "D", "E", "F"], pre: [], kv: 50, tok: 5, note: "steady state" }
  ];
  var F4COL = { wait: 46, run: 268, pre: 528 };
  function f4pos(state) {
    var m = {};
    ["wait", "run", "pre"].forEach(function (k) {
      state[k].forEach(function (id, i) { m[id] = [F4COL[k], 116 + i * 30, k]; });
    });
    return m;
  }
  reg("fig-scheduler", 56, function (f) {
    var a = F4KEY[0], b = F4KEY[0];
    for (var i = 0; i < F4KEY.length - 1; i++) if (f >= F4KEY[i].f && f <= F4KEY[i + 1].f) { a = F4KEY[i]; b = F4KEY[i + 1]; }
    if (f >= F4KEY[F4KEY.length - 1].f) { a = b = F4KEY[F4KEY.length - 1]; }
    var t = b.f === a.f ? 1 : E(S(f, a.f, b.f));
    var pa = f4pos(a), pb = f4pos(b);
    var g = rc(0, 0, 720, 358, P.bg);
    var cols = [["WAITING", F4COL.wait, 150], ["RUNNING", F4COL.run, 190], ["PREEMPTED", F4COL.pre, 150]];
    cols.forEach(function (c) {
      g += rc(c[1] - 14, 92, c[2], 190, "#141b21", 'stroke="' + P.line + '" stroke-dasharray="2 3"');
      g += tx(c[1] - 14, 84, c[0], { s: 10.5, f: P.faint, ls: "1.5" });
    });
    g += tx(F4COL.run - 14, 296, "batched into the next forward pass", { s: 9.5, f: P.faint });
    g += tx(F4COL.pre - 14, 296, "KV dropped, will be re-prefilled", { s: 9.5, f: P.faint });
    "ABCDEFG".split("").forEach(function (id, k) {
      var A = pa[id], Bp = pb[id];
      if (!A && !Bp) return;
      if (!A) A = Bp; if (!Bp) Bp = A;
      var x = lerp(A[0], Bp[0], t), y = lerp(A[1], Bp[1], t);
      var col = Bp[2] === "run" ? HUES[k % 8] : (Bp[2] === "pre" ? P.pink : "#2b353c");
      var moving = A[2] !== Bp[2] && t > 0.05 && t < 0.95;
      var op = 1;
      if (id === "A" && f > 36) op = clamp(1 - S(f, 36, 42), 0, 1);
      g += rc(x, y, 108, 22, col, 'opacity="' + R(op) + '" rx="1"');
      g += tx(x + 8, y + 15, "seq " + id, { s: 10.5, f: Bp[2] === "wait" ? P.dim : "#0a1519", w: 600, op: op });
      g += tx(x + 100, y + 15, Bp[2] === "wait" ? "queued" : (Bp[2] === "pre" ? "evicted" : "live"), { s: 8.5, a: "end", f: Bp[2] === "wait" ? P.line : "#0a1519", op: op });
      if (moving) g += pth("M" + R(x + 116) + " " + R(y + 11) + " l10 0", P.ink, 1.4, "none", 'opacity="0.5"');
    });
    var kv = lerp(a.kv, b.kv, t), tok = lerp(a.tok, b.tok, t);
    g += tx(46, 40, "ONE ITERATION OF THE ADMISSION LOOP", { s: 11, f: P.ink, w: 600, ls: "1" });
    g += tx(46, 58, b.note, { s: 10, f: P.amber });
    g += meter(46, 322, 172, 12, kv / 64, kv > 56 ? P.pink : P.blue, "KV BLOCKS", Math.round(kv) + " / 64");
    g += meter(268, 322, 172, 12, tok / 8, P.green, "SEQUENCE SLOTS", Math.round(tok) + " / 8");
    g += meter(490, 322, 172, 12, clamp(tok * 64 / 512, 0, 1), P.amber, "TOKEN BUDGET", Math.round(tok * 64) + " / 512");
    var wm = 46 + 172 * (56 / 64);
    g += ln(wm, 316, wm, 340, P.pink, 1, 'stroke-dasharray="2 2"');
    g += tx(wm + 3, 348, "watermark", { s: 8.5, f: P.pink });
    var cap;
    if (f < 16) cap = "Free blocks are above the watermark, so the scheduler pulls the next waiting sequence into the running set.";
    else if (f < 30) cap = "Five sequences are generating. Each one consumes a fresh KV block every sixteen steps, so pressure rises even with no new admissions.";
    else if (f < 38) cap = "The watermark is breached. Something must go: <b>seq E is preempted</b>, its blocks returned to the pool.";
    else if (f < 46) cap = "Seq A hits its stop token and releases everything at once. Memory pressure drops immediately.";
    else cap = "E is readmitted and re-prefilled from its prompt, and F joins from the queue. Recompute was cheaper than a PCIe round trip.";
    return [sv(g, 720, 358), cap];
  }, 120);

  /* ---- export for the second file ---- */
  window.__SERVING_FIG = { P: P, HUES: HUES, MONO: MONO, R: R, clamp: clamp, lerp: lerp, S: S, E: E, rc: rc, tx: tx, ln: ln, pth: pth, sv: sv, meter: meter, chip: chip, reg: reg, REG: REG, Figure: Figure };

  function boot() {
    REG.forEach(function (r) {
      var el = document.getElementById(r.id);
      if (el) new Figure(el, r.total, r.render, r.base);
    });
  }
  window.__SERVING_BOOT = boot;
})();
