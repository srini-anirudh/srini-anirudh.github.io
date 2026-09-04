/* Figures 12-18, then boot */
(function () {
  "use strict";
  if (!window.__SERVING_FIG) { console.error("figures3.js loaded before figures.js"); return; }
  var F = window.__SERVING_FIG;
  var P = F.P, HUES = F.HUES, R = F.R, clamp = F.clamp, lerp = F.lerp, S = F.S, E = F.E;
  var rc = F.rc, tx = F.tx, ln = F.ln, pth = F.pth, sv = F.sv, meter = F.meter, reg = F.reg;

  /* =========================================================
     FIGURE 12 - topology
     ========================================================= */
  reg("fig-topology", 52, function (f) {
    var g = rc(0, 0, 720, 340, P.bg);
    var cross = f >= 26, lf = cross ? f - 26 : f;
    function node(ox, label, active) {
      var s = rc(ox, 62, 268, 116, "#12181d", 'stroke="' + (active ? P.green : P.line) + '" stroke-width="' + (active ? 1.3 : 0.8) + '"');
      s += tx(ox, 54, label, { s: 10, f: active ? P.green : P.faint, ls: "1" });
      for (var i = 0; i < 8; i++) {
        var x = ox + 12 + (i % 4) * 62, y = 76 + Math.floor(i / 4) * 48;
        s += rc(x, y, 52, 36, active ? "#1b2830" : "#161d22", 'stroke="' + (active ? P.green : "#242d34") + '" stroke-width="0.9"');
        s += tx(x + 26, y + 22, "g" + i, { s: 10, a: "middle", f: active ? P.green : P.line });
      }
      if (active) for (var j = 0; j < 8; j++) for (var k = j + 1; k < 8; k++) {
        if ((j + k) % 3) continue;
        var ax = ox + 38 + (j % 4) * 62, ay = 94 + Math.floor(j / 4) * 48;
        var bx = ox + 38 + (k % 4) * 62, by = 94 + Math.floor(k / 4) * 48;
        s += ln(ax, ay, bx, by, P.green, 0.8, 'opacity="0.5"');
      }
      return s;
    }
    g += node(30, "NODE 0 - NVLINK DOMAIN, 450 GB/s PER GPU", true);
    g += node(422, "NODE 1", cross);
    g += ln(298, 120, 422, 120, P.line, 1.4);
    g += rc(336, 106, 48, 28, "#161d22", 'stroke="' + P.line + '"');
    g += tx(360, 124, "NIC", { s: 9.5, a: "middle", f: P.faint });
    g += tx(360, 152, "50 GB/s", { s: 9.5, a: "middle", f: cross ? P.pink : P.faint });
    // moving payload
    var prog = (lf % 13) / 13;
    if (!cross) {
      var pos = prog * 244;
      g += '<circle cx="' + R(42 + pos) + '" cy="' + R(94 + (pos > 122 ? 48 : 0)) + '" r="5" fill="' + P.green + '"/>';
    } else {
      var px = lerp(298, 422, E(prog));
      g += '<circle cx="' + R(px) + '" cy="120" r="5" fill="' + P.pink + '"/>';
      g += '<circle cx="' + R(px) + '" cy="120" r="' + R(5 + 7 * (1 - prog)) + '" fill="none" stroke="' + P.pink + '" stroke-width="1" opacity="' + R(0.5 * prog) + '"/>';
    }
    g += tx(30, 210, "ONE DECODE ALL-REDUCE - 2 KB PER GPU", { s: 10.5, f: P.ink, w: 600, ls: "1" });
    var tIn = 9, tOut = 118;
    g += meter(30, 246, 300, 14, 1, P.green, "TP=8 INSIDE ONE NODE", tIn + " us");
    g += meter(30, 296, 300, 14, cross ? 1 : 0, cross ? P.pink : "#1b242b", "TP=16 ACROSS TWO NODES", cross ? tOut + " us" : "-");
    g += tx(368, 246, "x 2 per layer x 32 layers", { s: 10, f: P.faint });
    g += tx(368, 264, "= 0.58 ms of the token budget", { s: 11, f: P.green, w: 600 });
    if (cross) {
      g += tx(368, 296, "x 2 per layer x 32 layers", { s: 10, f: P.faint });
      g += tx(368, 314, "= 7.6 ms of the token budget", { s: 11, f: P.pink, w: 600 });
      g += tx(368, 332, "twice the GPUs, a slower token", { s: 10, f: P.pink });
    }
    var cap = cross
      ? "Doubling the tensor-parallel group across the fabric made every token slower. Decode all-reduces are <b>latency</b>, not bandwidth, and the network charges per message."
      : "Inside the NVLink domain the collective is small enough to disappear into the layer. Keep tensor-parallel groups here.";
    return [sv(g, 720, 340), cap];
  });

  /* =========================================================
     FIGURE 13 - speculative decoding
     ========================================================= */
  reg("fig-spec", 64, function (f) {
    var g = rc(0, 0, 720, 384, P.bg);
    var toks = ["the", "cat", "sat", "on"], acc = [1, 1, 1, 0];
    var nd = clamp(Math.floor(S(f, 3, 20) * 4) + (f > 3 ? 1 : 0), 0, 4);
    if (f >= 20) nd = 4;
    var verify = f >= 22, resolved = f >= 34;
    g += tx(30, 32, "DRAFT - a small model, run " + (nd || 0) + " times", { s: 10.5, f: P.blue, w: 600, ls: "1" });
    for (var i = 0; i < 4; i++) {
      var on = i < nd;
      g += rc(30 + i * 92, 46, 82, 34, on ? "#17242c" : "#141a1f", 'stroke="' + (on ? P.blue : P.line) + '" stroke-width="0.9"');
      g += tx(71 + i * 92, 68, on ? '"' + toks[i] + '"' : "-", { s: 12, a: "middle", f: on ? P.blue : P.line, w: 600 });
      if (on && i < 3) g += pth("M" + (114 + i * 92) + " 63 l8 0", P.line, 1);
    }
    g += tx(410, 68, "cheap and serial - four tiny forward passes", { s: 9.5, f: P.faint });
    // target
    g += tx(30, 116, "TARGET - the real model, run ONCE over all five positions", { s: 10.5, f: P.green, w: 600, ls: "1" });
    var vp = E(S(f, 22, 32));
    g += rc(30, 130, 366 * (verify ? vp : 0), 46, P.green, 'opacity="0.22"');
    g += rc(30, 130, 366, 46, "none", 'stroke="' + (verify ? P.green : P.line) + '" stroke-width="1"');
    if (verify) g += tx(213, 158, "one forward pass, five logit vectors", { s: 11, a: "middle", f: P.green, w: 600 });
    g += tx(410, 150, "costs almost exactly what one position costs,", { s: 9.5, f: P.faint });
    g += tx(410, 164, "because decode is memory bound", { s: 9.5, f: P.faint });
    // verdicts
    g += tx(30, 212, "VERDICT", { s: 10.5, f: P.ink, w: 600, ls: "1" });
    for (var j = 0; j < 5; j++) {
      var op = resolved ? E(S(f, 34 + j * 2, 38 + j * 2)) : 0;
      var isNew = j === 4;
      var col = isNew ? P.amber : (acc[j] ? P.green : P.pink);
      var lab = isNew ? '"a"' : '"' + toks[j] + '"';
      g += rc(30 + j * 92, 226, 82, 34, "#141a1f", 'stroke="' + col + '" stroke-width="1" opacity="' + R(op) + '"');
      g += tx(71 + j * 92, 248, lab, { s: 12, a: "middle", f: col, w: 600, op: op });
      g += tx(71 + j * 92, 274, isNew ? "resampled" : (acc[j] ? "accepted" : "rejected"), { s: 8.5, a: "middle", f: col, op: op });
    }
    if (resolved) g += tx(500, 248, "4 tokens from 1 target pass", { s: 11, f: P.amber, w: 600 });
    // batch panel
    var bshow = f >= 46;
    if (bshow) {
      g += rc(30, 292, 660, 82, "#12181d", 'stroke="' + P.line + '"');
      g += tx(44, 308, "SPEEDUP VERSUS RUNNING BATCH SIZE", { s: 9.5, f: P.faint, ls: "1" });
      var pts = [[1, 2.8], [4, 2.6], [16, 1.9], [32, 1.4], [64, 0.95], [128, 0.7]];
      for (var k = 0; k < pts.length; k++) {
        var bx = 60 + k * 108, sp = pts[k][1], hgt = 32 * sp / 2.8;
        var reveal = E(S(f, 48 + k * 2, 52 + k * 2));
        g += rc(bx, 362 - hgt * reveal, 40, hgt * reveal, sp > 1 ? P.green : P.pink);
        g += tx(bx + 56, 356, "B=" + pts[k][0], { s: 8.5, f: P.line });
        if (reveal > 0.8) g += tx(bx + 56, 342, sp.toFixed(1) + "x", { s: 10.5, f: sp > 1 ? P.green : P.pink, w: 600 });
      }
    }
    var cap;
    if (f < 22) cap = "A cheap draft proposes four continuations. Being wrong is allowed - it costs a wasted guess, not a wrong answer.";
    else if (f < 34) cap = "The target model scores all five positions in a single pass. At batch 1 the extra four positions are essentially free.";
    else if (f < 46) cap = "Rejection sampling accepts the matching prefix and resamples the first mismatch from a corrected distribution. The output distribution is <b>exactly</b> the target's.";
    else cap = "And here is the bill. Once continuous batching has filled the machine, the spare FLOPs speculation was spending no longer exist.";
    return [sv(g, 720, 384), cap];
  });

  /* =========================================================
     FIGURE 14 - CUDA graphs
     ========================================================= */
  reg("fig-graphs", 52, function (f) {
    var g = rc(0, 0, 720, 330, P.bg);
    var graph = f >= 26, lf = graph ? f - 26 : f;
    var N = 14, x0 = 120, u = 40;
    g += tx(30, 32, graph ? "CAPTURED GRAPH - ONE LAUNCH, SAME KERNELS" : "EAGER - ONE LAUNCH PER KERNEL", { s: 11, f: graph ? P.green : P.amber, w: 600, ls: "1" });
    g += tx(30, 92, "CPU", { s: 10.5, f: P.faint });
    g += tx(30, 172, "GPU", { s: 10.5, f: P.faint });
    g += rc(x0, 76, 560, 30, "#101519");
    g += rc(x0, 156, 560, 30, "#101519");
    var shown = clamp(Math.floor(S(lf, 0, 22) * N) + 1, 0, N);
    if (!graph) {
      for (var i = 0; i < N; i++) {
        if (i >= shown) break;
        g += rc(x0 + i * u, 76, 14, 30, P.amber, 'opacity="0.85"');
        g += rc(x0 + i * u + 16, 156, 22, 30, P.blue, 'opacity="0.85"');
        g += rc(x0 + i * u + 38, 156, 2, 30, "#2a1a1e");
      }
      g += tx(x0, 128, "6 us launch", { s: 9, f: P.amber });
      g += tx(x0 + 120, 128, "15 us kernel", { s: 9, f: P.blue });
      g += tx(x0 + 260, 128, "gap: the GPU is waiting for Python", { s: 9, f: P.pink });
    } else {
      g += rc(x0, 76, 20, 30, P.green);
      g += tx(x0 + 28, 96, "one graph launch", { s: 10, f: P.green });
      for (var j = 0; j < N; j++) {
        if (j >= shown) break;
        g += rc(x0 + 24 + j * 24, 156, 22, 30, P.blue, 'opacity="0.9"');
      }
      g += tx(x0, 128, "the DAG was recorded once at startup", { s: 9.5, f: P.faint });
    }
    g += meter(120, 232, 250, 14, graph ? 0.6 : 1, graph ? P.green : P.pink, "ITERATION TIME", graph ? "4.1 ms" : "6.8 ms");
    g += meter(410, 232, 250, 14, graph ? 0.04 : 0.4, graph ? P.green : P.pink, "GPU IDLE", graph ? "4%" : "40%");
    g += rc(30, 274, 660, 44, "#12181d", 'stroke="' + P.line + '"');
    g += tx(44, 292, graph ? "THE PRICE" : "THE PROBLEM", { s: 9.5, f: graph ? P.pink : P.amber, ls: "1" });
    g += tx(44, 308, graph
      ? "static shapes and addresses: bucket the batch size, preallocate block tables, no Python control flow inside"
      : "hundreds of kernels per iteration, each too small to hide its own launch cost", { s: 10, f: P.dim });
    return [sv(g, 720, 330), graph
      ? "Replay issues the whole iteration with one launch. Prefill, whose shapes change every request, usually stays in eager mode - which is why mixed chunked-prefill iterations sometimes give this back."
      : "At small batch the kernels are shorter than the gaps between them. No kernel optimization fixes this, because the kernels are not the problem."];
  });

  /* =========================================================
     FIGURE 15 - quantization budget
     ========================================================= */
  var F15 = [
    { n: "BF16 weights, FP16 KV", w: 16, kv: 0.5, note: "the baseline", c: P.blue },
    { n: "FP8 W8A8", w: 8, kv: 0.5, note: "compute path: prefill and large-batch decode get faster", c: P.teal },
    { n: "INT4 weight-only (AWQ/GPTQ)", w: 4, kv: 0.5, note: "bandwidth path: big win at small batch, nothing at large batch", c: P.green },
    { n: "BF16 weights, FP8 KV", w: 16, kv: 0.25, note: "capacity path: concurrency doubles, weights untouched", c: P.amber },
    { n: "INT4 weights, FP8 KV", w: 4, kv: 0.25, note: "the common production point", c: P.purple },
    { n: "INT4 weights, INT4 KV", w: 4, kv: 0.125, note: "needs per-channel K and per-token V, and long-context quality checks", c: P.pink }
  ];
  reg("fig-quant", 48, function (f) {
    var idx = Math.min(F15.length - 1, Math.floor(f / 8)), t = E(S(f % 8, 0, 5));
    var prev = F15[Math.max(0, idx - 1)], cur = F15[idx];
    var w = lerp(prev.w, cur.w, t), kvs = lerp(prev.kv, cur.kv, t);
    var ws = 6, total = 80;
    var free = total - w - ws, seqs = Math.floor(free / kvs);
    var g = rc(0, 0, 720, 340, P.bg);
    g += tx(30, 32, cur.n.toUpperCase(), { s: 12, f: cur.c, w: 600, ls: "1" });
    g += tx(30, 50, cur.note, { s: 10, f: P.faint });
    var X = 30, W = 660;
    g += tx(30, 84, "80 GB OF HBM", { s: 9.5, f: P.faint, ls: "1" });
    var wpx = W * w / total, spx = W * ws / total, fpx = W * free / total;
    g += rc(X, 92, wpx, 46, cur.c);
    g += rc(X + wpx, 92, spx, 46, "#38434b");
    g += rc(X + wpx + spx, 92, fpx, 46, "#1a2229", 'stroke="' + P.line + '" stroke-width="0.7"');
    if (wpx > 96) g += tx(X + wpx / 2, 120, "weights " + w.toFixed(0) + " GB", { s: 10, a: "middle", f: "#0a1519", w: 600 });
    else g += tx(X + wpx + 8, 120, "weights " + w.toFixed(0) + " GB", { s: 10, f: cur.c, w: 600 });
    g += tx(X + wpx + spx + fpx / 2, 120, "KV cache " + free.toFixed(0) + " GB", { s: 11, a: "middle", f: P.ink, w: 600 });
    // seq blocks
    g += tx(30, 166, "CONCURRENT 4k-TOKEN SEQUENCES THAT FIT", { s: 9.5, f: P.faint, ls: "1" });
    var cells = Math.min(280, seqs), per = Math.ceil(cells / 40);
    for (var i = 0; i < 40; i++) {
      var full = clamp((cells - i * per) / per, 0, 1);
      g += rc(30 + i * 16.5, 176, 14, 26, "#161d22");
      g += rc(30 + i * 16.5, 176 + 26 * (1 - full), 14, 26 * full, cur.c, 'opacity="0.85"');
    }
    g += tx(30, 224, seqs + " sequences", { s: 15, f: cur.c, w: 600 });
    g += tx(180, 224, "(baseline: 116)", { s: 10, f: P.faint });
    // three levers
    var levers = [
      ["WEIGHT BANDWIDTH", w < 8 ? 1 : (w < 16 ? 0.6 : 0.2), "decode latency at small batch"],
      ["COMPUTE PATH", cur.n.indexOf("FP8 W8A8") >= 0 ? 1 : 0.2, "prefill and large-batch decode"],
      ["KV CAPACITY", kvs < 0.2 ? 1 : (kvs < 0.4 ? 0.6 : 0.2), "how many users fit at once"]
    ];
    for (var k = 0; k < 3; k++) {
      g += meter(30 + k * 226, 278, 200, 12, levers[k][1], levers[k][1] > 0.5 ? cur.c : "#2a343b", levers[k][0], "");
      g += tx(30 + k * 226, 306, levers[k][2], { s: 9, f: P.line });
    }
    g += tx(30, 332, "workspace and activations held at 6 GB throughout", { s: 9, f: P.line });
    return [sv(g, 720, 340), "<b>" + cur.n + ".</b> " + cur.note.charAt(0).toUpperCase() + cur.note.slice(1) + "."];
  }, 130);

  /* =========================================================
     FIGURE 16 - routing
     ========================================================= */
  var F16REQ = ["A", "B", "A", "C", "A", "B", "A", "A"];
  reg("fig-routing", 56, function (f) {
    var aware = f >= 26, lf = aware ? f - 26 : f;
    var n = clamp(Math.floor(S(lf, 2, 22) * 8) + 1, 0, 8);
    var g = rc(0, 0, 720, 368, P.bg);
    g += tx(30, 32, aware ? "PREFIX-AWARE ROUTING" : "ROUND-ROBIN ROUTING", { s: 12, f: aware ? P.green : P.amber, w: 600, ls: "1" });
    g += tx(30, 50, aware ? "prefer the replica holding the longest match, unless its queue is running hot" : "perfectly balanced, perfectly cache-oblivious", { s: 10, f: P.faint });
    g += rc(30, 74, 96, 226, "#12181d", 'stroke="' + P.line + '"');
    g += tx(78, 94, "ROUTER", { s: 10, a: "middle", f: P.ink, w: 600, ls: "1" });
    var cached = ["A", "B", "C", "A"];
    var load = [0, 0, 0, 0], hits = 0;
    var assign = [];
    for (var i = 0; i < 8; i++) {
      var r;
      if (!aware) r = i % 4;
      else {
        var best = -1;
        for (var k = 0; k < 4; k++) if (cached[k] === F16REQ[i] && (best < 0 || load[k] < load[best])) best = k;
        if (best < 0 || load[best] >= 3) { best = 0; for (var m = 1; m < 4; m++) if (load[m] < load[best]) best = m; }
        r = best;
      }
      assign.push(r);
      if (i < n) { load[r]++; if (cached[r] === F16REQ[i]) hits++; }
    }
    for (var j = 0; j < 4; j++) {
      var y = 74 + j * 58;
      g += rc(220, y, 300, 50, "#141b21", 'stroke="' + P.line + '" stroke-width="0.9"');
      g += tx(232, y + 20, "replica " + j, { s: 10, f: P.dim });
      g += rc(232, y + 28, 60, 14, HUES[cached[j].charCodeAt(0) - 65], 'opacity="0.75"');
      g += tx(262, y + 39, "cache " + cached[j], { s: 9, a: "middle", f: "#0a1519", w: 600 });
      g += meter(310, y + 28, 130, 12, load[j] / 4, load[j] > 3 ? P.pink : P.blue, "", "");
      g += tx(450, y + 39, "queue " + load[j], { s: 9.5, f: load[j] > 3 ? P.pink : P.line });
      g += tx(450, y + 20, load[j] ? "" : "idle", { s: 9, f: P.line });
    }
    for (var q = 0; q < 8; q++) {
      var live = q < n;
      var col = HUES[F16REQ[q].charCodeAt(0) - 65];
      var ty = 120 + (q % 4) * 34;
      if (!live) { g += rc(38 + Math.floor(q / 4) * 40, 300 - (q % 4) * 0, 30, 18, col, 'opacity="0.5"'); continue; }
      var hit = cached[assign[q]] === F16REQ[q];
      var yy = 74 + assign[q] * 58 + 24;
      g += pth("M126 " + R(158 + q * 4) + " C170 " + R(158 + q * 4) + " 180 " + R(yy) + " 220 " + R(yy), hit ? P.green : P.pink, 1.1, "none", 'opacity="0.65"');
      g += '<circle cx="126" cy="' + R(158 + q * 4) + '" r="3.2" fill="' + col + '"/>';
    }
    g += tx(30, 322, "8 requests: five share prompt A, two share B, one is C", { s: 9.5, f: P.faint });
    var rate = n ? hits / n : 0;
    g += meter(30, 352, 250, 13, rate, rate > 0.5 ? P.green : P.pink, "PREFIX CACHE HIT RATE", Math.round(rate * 100) + "%");
    g += tx(320, 352, "mean TTFT", { s: 10 });
    g += tx(506, 352, aware ? "180 ms" : "640 ms", { s: 12, a: "end", f: aware ? P.green : P.pink, w: 600 });
    g += tx(552, 352, "hottest queue", { s: 10 });
    g += tx(690, 352, Math.max.apply(null, load) + "", { s: 12, a: "end", f: Math.max.apply(null, load) > 3 ? P.amber : P.ink, w: 600 });
    var cap;
    if (!aware) cap = "Even spread, and five of eight requests land on a replica that has never seen their system prompt. Every one of them re-prefills from scratch.";
    else if (lf < 18) cap = "Routing on longest cached prefix converts most of those prefills into cache hits.";
    else cap = "But replica 0 is now the hot one. The workable policy is soft: <b>prefer the cache, unless the queue is worse than the recompute</b>.";
    return [sv(g, 720, 368), cap];
  });

  /* =========================================================
     FIGURE 17 - VLM pipeline
     ========================================================= */
  var F17R = [
    { n: "photo, 1 tile", tiles: 1, vt: 64, out: 220, c: P.green },
    { n: "receipt, 4 tiles", tiles: 4, vt: 256, out: 40, c: P.amber },
    { n: "schematic, 12 tiles", tiles: 12, vt: 2304, out: 12, c: P.pink }
  ];
  reg("fig-vlm", 72, function (f) {
    var idx = Math.min(2, Math.floor(f / 22)), lf = f % 22;
    var cacheHit = f >= 66;
    var r = F17R[idx];
    var g = rc(0, 0, 720, 400, P.bg);
    var stages = ["arrive", "jpeg decode + tile", "ViT batch", "connector", "LLM prefill", "decode"];
    var sx = [30, 122, 268, 386, 480, 606];
    var sw = [80, 134, 106, 82, 114, 84];
    var reached = clamp(Math.floor(S(lf, 1, 17) * 6) + 1, 0, 6);
    for (var i = 0; i < 6; i++) {
      var on = i < reached;
      g += rc(sx[i], 96, sw[i], 78, on ? "#18222a" : "#131920", 'stroke="' + (on ? r.c : P.line) + '" stroke-width="0.9"');
      g += tx(sx[i] + sw[i] / 2, 88, stages[i], { s: 9, a: "middle", f: on ? r.c : P.line });
      if (i === 0 && on) { g += rc(sx[0] + 16, 116, 48, 38, r.c, 'opacity="0.55"'); g += tx(sx[0] + 40, 168, "prompt", { s: 8.5, a: "middle", f: P.faint }); }
      if (i === 3 && reached >= 4) { g += tx(sx[3] + sw[3] / 2, 132, "pool", { s: 10, a: "middle", f: r.c, w: 600 }); g += tx(sx[3] + sw[3] / 2, 148, "+ project", { s: 9, a: "middle", f: P.faint }); }
      if (i < 5) g += pth("M" + (sx[i] + sw[i]) + " 135 l" + (sx[i + 1] - sx[i] - sw[i]) + " 0", on ? r.c : P.line, 1.1);
    }
    // tiles inside stage 1
    for (var t = 0; t < r.tiles; t++) {
      if (reached < 2) break;
      var tw = r.tiles > 6 ? 18 : 28, cols = r.tiles > 6 ? 6 : 4;
      g += rc(128 + (t % cols) * (tw + 2), 108 + Math.floor(t / cols) * (tw + 2), tw, tw, r.c, 'opacity="0.7"');
    }
    if (reached >= 3) {
      var lit = clamp(Math.floor(S(lf, 7, 13) * 12), 0, 12);
      for (var v = 0; v < 12; v++) g += rc(276 + (v % 4) * 24, 108 + Math.floor(v / 4) * 22, 20, 18, v < lit ? P.blue : "#1a2229");
      g += tx(321, 190, "compute bound, fixed shape", { s: 8.5, a: "middle", f: P.blue });
    }
    if (reached >= 5) {
      g += tx(537, 128, r.vt.toLocaleString(), { s: 15, a: "middle", f: r.c, w: 600 });
      g += tx(537, 146, "visual tokens", { s: 9, a: "middle", f: P.faint });
    }
    if (reached >= 6) for (var o = 0; o < 5; o++) g += rc(614 + o * 14, 120, 10, 24, P.green, 'opacity="' + R(0.25 + 0.75 * ((f + o) % 5) / 5) + '"');
    g += tx(30, 60, "REQUEST: " + r.n.toUpperCase(), { s: 11.5, f: r.c, w: 600, ls: "1" });
    g += tx(30, 76, "the prompt length is not knowable until the preprocessor has run", { s: 9.5, f: P.faint });
    // work ratio
    var enc = r.vt * 0.4, dec = r.out * 1.0, tot = enc + dec;
    g += tx(30, 218, "WHERE THE WORK IS", { s: 9.5, f: P.faint, ls: "1" });
    g += rc(30, 228, 660 * enc / tot, 22, P.blue);
    g += rc(30 + 660 * enc / tot, 228, 660 * dec / tot, 22, P.green);
    g += tx(38, 244, "vision encoder", { s: 10, f: "#0a1519", w: 600 });
    g += tx(682, 244, "language decode", { s: 10, a: "end", f: "#0a1519", w: 600 });
    g += tx(30, 268, "this ratio swings by two orders of magnitude across requests, which is why the encoder wants its own pool", { s: 9.5, f: P.faint });
    // CPU pool
    var cpu = clamp(0.2 + r.tiles * 0.07, 0, 1);
    g += meter(30, 302, 300, 13, cpu, cpu > 0.85 ? P.pink : P.amber, "HOST PREPROCESS POOL", Math.round(cpu * 100) + "%");
    g += meter(390, 302, 300, 13, cacheHit ? 1 : 0.15, cacheHit ? P.green : "#243038", "IMAGE EMBEDDING CACHE", cacheHit ? "HIT - encoder skipped" : "cold");
    g += rc(30, 332, 660, 62, "#12181d", 'stroke="' + (cacheHit ? P.green : P.pink) + '" stroke-dasharray="2 3"');
    g += tx(44, 350, cacheHit ? "MULTI-TURN ON THE SAME IMAGE" : "CORRECTNESS TRAP", { s: 9.5, f: cacheHit ? P.green : P.pink, ls: "1" });
    g += tx(44, 368, cacheHit
      ? "post-connector embeddings are keyed by image hash plus the preprocessing config,"
      : "placeholder token ids are identical for every image, so a prefix hash that ignores", { s: 10, f: P.dim });
    g += tx(44, 384, cacheHit
      ? "so turn two skips the vision encoder entirely"
      : "pixels will serve one image's KV to another image's question", { s: 10, f: P.dim });
    var cap;
    if (idx === 0) cap = "A small photo becomes sixty-four visual tokens and a long answer. Decoder-dominated, and it looks just like a text request.";
    else if (idx === 1) cap = "Four tiles, a two-word answer. The same model, the same server, and now most of the cost is the vision tower.";
    else if (!cacheHit) cap = "Twelve tiles is <b>2,304 visual tokens</b> before the user has typed a word. The host preprocessing pool is now the bottleneck, not the GPU.";
    else cap = "Turn two of a conversation about the same image reuses the connector output. The cheapest win in VLM serving, and the one most often missing.";
    return [sv(g, 720, 400), cap];
  }, 100);

  /* =========================================================
     FIGURE 18 - goodput
     ========================================================= */
  function f18(load) {
    var thr = 62 * (1 - Math.exp(-load / 24));
    var ttft = 140 + 1500 / (1 + Math.exp(-(load - 58) / 5.5));
    var pass = 1 / (1 + Math.exp((ttft - 520) / 45));
    return { thr: thr, ttft: ttft, good: thr * pass };
  }
  reg("fig-goodput", 60, function (f) {
    var g = rc(0, 0, 720, 398, P.bg);
    var L = 70, Rg = 640, Tp = 56, Bt = 284;
    function X(l) { return L + l / 100 * (Rg - L); }
    function Yt(v) { return Bt - v / 70 * (Bt - Tp); }
    function Yl(v) { return Bt - clamp(v / 1800, 0, 1) * (Bt - Tp); }
    for (var i = 0; i <= 5; i++) { g += ln(X(i * 20), Tp, X(i * 20), Bt, "#1a2228", 1); g += tx(X(i * 20), Bt + 16, i * 20, { s: 9, a: "middle", f: P.line }); }
    g += ln(L, Bt, Rg, Bt, P.line, 1);
    g += tx(L, Bt + 36, "offered load (requests per second)", { s: 10, f: P.faint });
    g += ln(L, Yl(520), Rg, Yl(520), P.pink, 1, 'stroke-dasharray="4 3"');
    g += tx(Rg + 4, Yl(520) + 4, "TTFT SLO", { s: 9, f: P.pink });
    function curve(fn, col, upto, dash) {
      var d = "";
      for (var l = 0; l <= upto; l += 1.5) d += (d ? " L" : "M") + R(X(l)) + " " + R(fn(l));
      return d ? pth(d, col, 1.9, "none", dash ? 'stroke-dasharray="3 3" opacity="0.35"' : "") : "";
    }
    g += curve(function (l) { return Yt(f18(l).thr); }, P.blue, 100, true);
    g += curve(function (l) { return Yl(f18(l).ttft); }, P.pink, 100, true);
    g += curve(function (l) { return Yt(f18(l).good); }, P.green, 100, true);
    var cur = S(f, 0, 54) * 100;
    g += curve(function (l) { return Yt(f18(l).thr); }, P.blue, cur);
    g += curve(function (l) { return Yl(f18(l).ttft); }, P.pink, cur);
    g += curve(function (l) { return Yt(f18(l).good); }, P.green, cur);
    var v = f18(cur);
    g += ln(X(cur), Tp, X(cur), Bt, P.ink, 1, 'opacity="0.45"');
    g += '<circle cx="' + R(X(cur)) + '" cy="' + R(Yt(v.thr)) + '" r="4.5" fill="' + P.blue + '"/>';
    g += '<circle cx="' + R(X(cur)) + '" cy="' + R(Yl(v.ttft)) + '" r="4.5" fill="' + P.pink + '"/>';
    g += '<circle cx="' + R(X(cur)) + '" cy="' + R(Yt(v.good)) + '" r="5.5" fill="' + P.green + '"/>';
    // peak marker
    var best = 0, bl = 0;
    for (var l2 = 0; l2 <= 100; l2 += 0.5) { var gd = f18(l2).good; if (gd > best) { best = gd; bl = l2; } }
    if (cur > bl) {
      g += ln(X(bl), Tp, X(bl), Bt, P.green, 1, 'stroke-dasharray="2 3" opacity="0.6"');
      g += tx(X(bl), Tp - 8, "knee: " + bl.toFixed(0) + " rps", { s: 9.5, a: "middle", f: P.green });
    }
    g += tx(L, 30, "THROUGHPUT SATURATES. GOODPUT COLLAPSES.", { s: 11, f: P.ink, w: 600, ls: "1" });
    g += rc(30, 340, 200, 48, "#12181d", 'stroke="' + P.blue + '" stroke-width="0.8"');
    g += tx(42, 358, "raw throughput", { s: 9.5, f: P.blue });
    g += tx(42, 379, v.thr.toFixed(1) + " req/s", { s: 13, f: P.ink, w: 600 });
    g += rc(260, 340, 200, 48, "#12181d", 'stroke="' + P.pink + '" stroke-width="0.8"');
    g += tx(272, 358, "p99 time to first token", { s: 9.5, f: P.pink });
    g += tx(272, 379, Math.round(v.ttft) + " ms", { s: 13, f: v.ttft > 520 ? P.pink : P.ink, w: 600 });
    g += rc(490, 340, 200, 48, "#12181d", 'stroke="' + P.green + '" stroke-width="0.8"');
    g += tx(502, 358, "goodput - meets its SLO", { s: 9.5, f: P.green });
    g += tx(502, 379, v.good.toFixed(1) + " req/s", { s: 13, f: P.green, w: 600 });
    var cap;
    if (cur < 30) cap = "Under light load everything agrees: more traffic, more throughput, more served users, latency flat.";
    else if (cur < bl) cap = "Throughput is bending as the machine fills. Tail latency has started to climb but is still inside the objective.";
    else if (cur < 78) cap = "Past the knee at " + bl.toFixed(0) + " rps, every extra admitted request pushes the whole running set over the deadline.";
    else cap = "Throughput is near its maximum and <b>goodput is near zero</b>. The server is perfectly efficient at producing answers nobody is waiting for any more.";
    return [sv(g, 720, 398), cap];
  });

  /* =========================================================
     FIGURE 19 - which bottleneck each system was built against
     ========================================================= */
  var FBOT = [
    "finished sequences hold their batch slot",
    "KV over-reservation and fragmentation",
    "identical prefixes recomputed per request",
    "one long prefill freezes every decode",
    "CPU scheduling and kernel-launch overhead",
    "per-kernel inefficiency, HBM round trips",
    "placement and routing across replicas"
  ];
  var FSYS = [
    { n: "ORCA", tab: "Orca", t: "OSDI 2022 - the idea everything below inherits", c: P.amber, hit: [0],
      m: ["Rebuild the batch at every iteration rather than",
          "once per request group, and split the model's ops:",
          "linear layers take one ragged [total_tokens, d]",
          "tensor, attention stays per sequence."],
      o: "optimises: slot utilisation under variable output length" },
    { n: "vLLM", tab: "vLLM", t: "SOSP 2023 - the memory allocator is the product", c: P.green, hit: [1, 2, 3],
      m: ["Fixed-size KV blocks behind a per-sequence block",
          "table: allocation is lazy, fragmentation is zero,",
          "sharing is a refcount. Chaining block hashes turns",
          "prefix reuse into a side effect of that design, and",
          "a token budget caps every iteration."],
      o: "optimises: concurrency per gigabyte, then the latency tail" },
    { n: "SGLang", tab: "SGLang", t: "2024 - reuse and CPU overhead as first-class", c: P.blue, hit: [2, 4],
      m: ["A radix tree over cached KV makes reuse the default",
          "instead of a hit rate, and the queue is reordered to",
          "maximise matches. The scheduler for step i+1 runs on",
          "the CPU while step i runs on the GPU. Grammars",
          "compile to an FSM that skips determined tokens."],
      o: "optimises: repeated-prefix workloads and small-batch latency" },
    { n: "TensorRT-LLM", tab: "TRT-LLM", t: "compile the network, delete the interpreter", c: P.purple, hit: [4, 5],
      m: ["The graph is compiled ahead of time into a fused",
          "engine per shape bucket, so kernel choice, fusion",
          "and precision plumbing are settled before the first",
          "request arrives. In-flight batching runs in a C++",
          "runtime with nothing interpreted on the hot path."],
      o: "optimises: peak per-GPU throughput on NVIDIA silicon" },
    { n: "DISAGGREGATION", tab: "disagg", t: "DistServe, Splitwise, Mooncake", c: P.teal, hit: [3, 6],
      m: ["Stop co-locating the phases at all. Prefill and",
          "decode become separate pools with their own",
          "parallelism and batch policy, joined by a layer-wise",
          "KV transfer. The KV cache, not the model, becomes",
          "the object the cluster is organised around."],
      o: "optimises: TTFT and TPOT independently, at cluster scale" },
    { n: "TGI AND ROUTERS", tab: "routers", t: "the layer above any single engine", c: P.rust, hit: [6, 0],
      m: ["Continuous batching inside each shard, and a router",
          "in front that places work by pending tokens and",
          "cached prefix rather than by request count.",
          "Deliberately engine-agnostic underneath."],
      o: "optimises: fleet-level SLO attainment, not one GPU" }
  ];
  reg("fig-frameworks", 72, function (f) {
    var idx = Math.min(FSYS.length - 1, Math.floor(f / 12)), lf = f % 12;
    var sy = FSYS[idx];
    var g = rc(0, 0, 720, 396, P.bg);
    g += tx(30, 30, sy.n, { s: 13, f: sy.c, w: 600, ls: "1.5" });
    g += tx(30, 48, sy.t, { s: 10, f: P.faint });
    g += tx(30, 68, "THE BOTTLENECK STACK", { s: 9, f: P.line, ls: "1.2" });
    for (var i = 0; i < 7; i++) {
      var y = 78 + i * 33;
      var rank = sy.hit.indexOf(i);
      var on = rank >= 0;
      var app = on ? E(clamp((lf - 1 - rank * 2) / 4, 0, 1)) : 0;
      g += rc(30, y, 336, 25, "#131920", 'stroke="' + (on ? sy.c : "#1f272d") + '" stroke-width="' + (on ? 1.1 : 0.7) + '"');
      if (on) g += rc(30, y, 336 * app, 25, sy.c, 'opacity="0.18"');
      g += tx(42, y + 17, FBOT[i], { s: 10, f: on ? sy.c : "#333f46" });
      if (on && app > 0.55) g += tx(356, y + 17, "attacked", { s: 8.5, a: "end", f: sy.c, op: app });
    }
    g += tx(390, 68, "AND WHAT IT DOES ABOUT IT", { s: 9, f: P.line, ls: "1.2" });
    for (var k = 0; k < sy.m.length; k++) {
      var op = E(clamp((lf - 2 - k) / 3, 0, 1));
      g += tx(390, 96 + k * 21, sy.m[k], { s: 10, f: P.dim, op: op });
    }
    g += ln(30, 324, 690, 324, "#1f272d", 1);
    g += tx(30, 344, sy.o, { s: 10.5, f: sy.c, w: 600 });
    for (var t2 = 0; t2 < FSYS.length; t2++) {
      var act = t2 === idx;
      g += rc(30 + t2 * 111, 366, 100, 3, act ? FSYS[t2].c : "#212a30");
      g += tx(30 + t2 * 111, 386, FSYS[t2].tab, { s: 9, f: act ? FSYS[t2].c : P.line });
    }
    return [sv(g, 720, 396), "<b>" + sy.n.toLowerCase() + "</b> &mdash; " + sy.o.replace("optimises: ", "built to optimise ") + "."];
  }, 115);

})();
