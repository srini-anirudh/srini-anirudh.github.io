/* Figures 19-22 (vLLM deep dive), then boot */
(function () {
  "use strict";
  var F = window.__SERVING_FIG;
  if (!F) { console.error("figures5.js loaded before figures.js"); return; }
  var P = F.P, HUES = F.HUES, R = F.R, clamp = F.clamp, lerp = F.lerp, S = F.S, E = F.E;
  var rc = F.rc, tx = F.tx, ln = F.ln, pth = F.pth, sv = F.sv, meter = F.meter, reg = F.reg;

  /* =========================================================
     A - where num_gpu_blocks actually comes from
     ========================================================= */
  reg("fig-block-budget", 64, function (f) {
    var st = Math.min(3, Math.floor(f / 16)), lf = f % 16;
    var g = rc(0, 0, 720, 372, P.bg);
    var heads = [
      ["THE POOL IS NOT 80 GB", "every byte the KV cache gets is a byte something else did not take"],
      ["SUBTRACT THE WEIGHTS", "measured after loading, not estimated from the parameter count"],
      ["RUN A PROFILING FORWARD PASS", "a dummy batch at the configured maximum, to measure peak activation"],
      ["APPLY THE UTILISATION CAP, THEN DIVIDE", "what is left, in units of one block"]
    ];
    g += tx(30, 28, heads[st][0], { s: 12.5, f: P.ink, w: 600, ls: "1.3" });
    g += tx(30, 46, heads[st][1], { s: 10, f: P.faint });
    var X = 30, W = 660, sc = W / 80, Y = 92, H = 54;
    var wG = 16, aG = 4.5, capG = 72;
    var wA = st >= 1 ? E(S(lf, 1, 9)) : 0; if (st > 1) wA = 1;
    var aA = st >= 2 ? E(S(lf, 2, 10)) : 0; if (st > 2) aA = 1;
    var cA = st >= 3 ? E(S(lf, 1, 8)) : 0;
    g += rc(X, Y, W, H, "#161d22", 'stroke="' + P.line + '"');
    g += tx(X, Y - 10, "80 GB OF HBM", { s: 9.5, f: P.faint, ls: "1.2" });
    var cx = X;
    g += rc(cx, Y, wG * sc * wA, H, P.purple);
    if (wA > 0.6) g += tx(cx + wG * sc / 2, Y + 32, "weights 16", { s: 10, a: "middle", f: "#0a1519", w: 600 });
    cx += wG * sc * wA;
    g += rc(cx, Y, aG * sc * aA, H, "#4a565f");
    cx += aG * sc * aA;
    var kvW = (capG - wG * wA - aG * aA) * sc - (cA ? 0 : 0);
    if (st >= 3) kvW = (capG - wG - aG) * sc;
    else kvW = (80 - wG * wA - aG * aA) * sc;
    g += rc(cx, Y, kvW, H, P.green, 'opacity="0.85"');
    g += tx(cx + kvW / 2, Y + 32, st >= 3 ? "KV cache 51.5 GB" : "available " + (80 - wG * wA - aG * aA).toFixed(1) + " GB",
      { s: 11, a: "middle", f: "#08141a", w: 600 });
    if (st >= 3) {
      g += rc(X + capG * sc, Y, 8 * sc * cA, H, "#2a1a1e");
      g += ln(X + capG * sc, Y - 16, X + capG * sc, Y + H + 10, P.pink, 1.4, 'stroke-dasharray="3 3" opacity="' + R(cA) + '"');
      g += tx(X + capG * sc, Y - 22, "gpu_memory_utilization = 0.90", { s: 9.5, a: "end", f: P.pink, op: cA });
      g += tx(X + capG * sc + 8, Y + 32, "held back", { s: 9, f: P.pink, op: cA });
    }
    if (aA > 0.6 && st >= 2) {
      g += ln(X + wG * sc + aG * sc / 2, Y + H, X + wG * sc + aG * sc / 2, Y + H + 12, "#5a666f", 1);
      g += tx(X + wG * sc + aG * sc / 2, Y + H + 24, "activation 4.5", { s: 8.5, a: "middle", f: "#7c8890" });
    }
    if (st === 2) {
      var pulse = 0.35 + 0.45 * Math.abs(Math.sin(lf * 0.5));
      g += rc(X + wG * sc, Y, aG * sc, H, P.blue, 'opacity="' + R(pulse) + '"');
      g += tx(X + wG * sc + aG * sc + 10, Y + 20, "peak activation and workspace: 4.5 GB", { s: 10, f: P.blue });
      g += tx(X + wG * sc + aG * sc + 10, Y + 36, "measured, because a wrong guess here is an OOM in production", { s: 9.5, f: P.faint });
    }
    // arithmetic
    var rows = [
      ["total HBM", "80.0 GB", P.dim, 0],
      ["x gpu_memory_utilization 0.90", "72.0 GB", P.pink, 3],
      ["- model weights", "16.0 GB", P.purple, 1],
      ["- peak activation (profiled)", "4.5 GB", P.blue, 2],
      ["= KV cache", "51.5 GB", P.green, 3],
      ["/ block bytes (16 tok x 128 KiB)", "2 MiB", P.faint, 3],
      ["= num_gpu_blocks", "26,368", P.ink, 3]
    ];
    for (var i = 0; i < rows.length; i++) {
      var vis = st >= rows[i][3];
      g += tx(30, 190 + i * 22, rows[i][0], { s: 10.5, f: vis ? (i === 6 ? P.ink : P.dim) : "#242d34", w: i === 6 ? 600 : 400 });
      g += tx(360, 190 + i * 22, vis ? rows[i][1] : "-", { s: 11, a: "end", f: vis ? rows[i][2] : "#242d34", w: 600 });
    }
    if (st === 3 && lf > 6) {
      g += rc(400, 176, 290, 116, "#12181d", 'stroke="' + P.line + '"');
      g += tx(414, 196, "WHAT THAT NUMBER BUYS", { s: 9.5, f: P.faint, ls: "1.2" });
      var cc = [["4,096-token context", "256 blk", "103 sequences"], ["512-token context", "32 blk", "824 sequences"], ["watermark held free", "264 blk", "1% of the pool"]];
      for (var k = 0; k < 3; k++) {
        g += tx(414, 220 + k * 24, cc[k][0], { s: 10, f: P.dim });
        g += tx(600, 220 + k * 24, cc[k][1], { s: 9.5, a: "end", f: P.line });
        g += tx(676, 220 + k * 24, cc[k][2].split(" ")[0], { s: 11, a: "end", f: k === 2 ? P.amber : P.green, w: 600 });
      }
      g += tx(414, 286, "0.85 to 0.95 is worth 8 GB: sixteen more", { s: 9, f: P.faint });
    }
    g += tx(30, 356, "this single integer sets your ceiling on concurrency, and therefore on arithmetic intensity", { s: 9.5, f: P.line });
    var caps = [
      "Concurrency is decided at startup by one integer, and the arithmetic that produces it is worth knowing by heart.",
      "Weights are subtracted after loading rather than computed from the parameter count, because quantization, LoRA adapters and layout padding all move the real number.",
      "vLLM then runs a dummy forward pass at the configured maximum batch and sequence length and watches the allocator. <b>The activation budget is measured, not guessed.</b>",
      "Whatever survives the cap is divided by the size of one block. That quotient &mdash; <b>num_gpu_blocks</b> &mdash; is the number every scheduling decision afterwards is really about."
    ];
    return [sv(g, 720, 372), caps[st]];
  }, 115);

  /* =========================================================
     B - inside the paged attention kernel
     ========================================================= */
  var BSZ = [1, 8, 16, 32, 128];
  reg("fig-paged-kernel", 72, function (f) {
    var st = Math.min(2, Math.floor(f / 24)), lf = f % 24;
    var g = rc(0, 0, 720, 390, P.bg);
    var heads = [
      ["ONE QUERY ROW, EIGHT THOUSAND KEYS", "the decode attention shape has almost no parallelism in it"],
      ["PARTITION OVER THE KV AXIS, GATHER THROUGH THE TABLE", "one thread block per slice of the cache, wherever that slice lives"],
      ["WHY BLOCK SIZE IS A TUNING KNOB", "three quantities that move in different directions"]
    ];
    g += tx(30, 28, heads[st][0], { s: 12, f: P.ink, w: 600, ls: "1.2" });
    g += tx(30, 46, heads[st][1], { s: 10, f: P.faint });

    if (st === 0) {
      g += tx(30, 92, "query", { s: 10, f: P.green });
      for (var q = 0; q < 8; q++) g += rc(30 + q * 20, 100, 18, 18, P.green, 'opacity="0.85"');
      g += tx(30, 136, "1 x 128", { s: 9, f: P.line });
      g += tx(200, 92, "keys and values", { s: 10, f: P.blue });
      var rows = 11;
      for (var r = 0; r < rows; r++) {
        var op = r === rows - 1 ? 0.3 : 0.75;
        g += rc(200, 100 + r * 15, 160, 12, P.blue, 'opacity="' + op + '"');
      }
      g += tx(200, 288, "8,192 x 128, growing by one row per step", { s: 9, f: P.line });
      g += tx(410, 92, "132 SMs", { s: 10, f: P.faint });
      var lit0 = clamp(Math.floor(E(S(lf, 4, 14)) * 2), 0, 2);
      for (var s0 = 0; s0 < 132; s0++)
        g += rc(410 + (s0 % 12) * 23, 100 + Math.floor(s0 / 12) * 16, 20, 13, s0 < lit0 ? P.amber : "#1a2229");
      g += tx(30, 330, "parallelised over queries and heads, one decoding sequence yields " + lit0 + " thread block" + (lit0 === 1 ? "" : "s") + " of work.", { s: 9.5, f: P.pink });
      g += tx(30, 348, "The other 130 multiprocessors have nothing to do.", { s: 9.5, f: P.pink });
    } else if (st === 1) {
      var pr = E(S(lf, 2, 18));
      g += tx(30, 88, "LOGICAL BLOCKS", { s: 9.5, f: P.faint, ls: "1.1" });
      for (var b = 0; b < 10; b++) {
        var on = b / 10 < pr;
        g += rc(30, 102 + b * 20, 96, 16, on ? P.blue : "#1a2229", 'opacity="' + (on ? 0.85 : 1) + '"');
        g += tx(36, 114 + b * 20, "blk " + b, { s: 9, f: on ? "#08141a" : P.line });
      }
      g += tx(160, 88, "BLOCK TABLE", { s: 9.5, f: P.faint, ls: "1.1" });
      var tbl = [11, 3, 19, 7, 22, 2, 30, 14, 25, 8, 17, 5];
      for (var t = 0; t < 10; t++) {
        var on2 = t / 10 < pr;
        g += tx(160, 114 + t * 20, "-> phys " + tbl[t], { s: 9.5, f: on2 ? P.ink : "#242d34", w: on2 ? 600 : 400 });
      }
      g += tx(280, 88, "PHYSICAL BLOCKS IN HBM", { s: 9.5, f: P.faint, ls: "1.1" });
      for (var p = 0; p < 36; p++) {
        var idx = tbl.indexOf(p), owned = idx >= 0 && idx < 10 && idx / 10 < pr;
        g += rc(280 + (p % 6) * 40, 100 + Math.floor(p / 6) * 34, 36, 28, owned ? P.blue : "#161d22",
          'stroke="' + (owned ? P.blue : "#212a30") + '" stroke-width="0.8" opacity="' + (owned ? 0.85 : 1) + '"');
        g += tx(298 + (p % 6) * 40, 118 + Math.floor(p / 6) * 34, p, { s: 9, a: "middle", f: owned ? "#08141a" : "#2c363d" });
      }
      var lit = Math.round(pr * 96);
      g += tx(536, 88, "SMs", { s: 9.5, f: P.faint });
      for (var s1 = 0; s1 < 96; s1++)
        g += rc(536 + (s1 % 8) * 22, 100 + Math.floor(s1 / 8) * 16, 19, 13, s1 < lit ? P.green : "#1a2229");
      g += tx(536, 300, lit + " thread blocks busy", { s: 10, f: P.green, w: 600 });
      g += tx(30, 340, "each thread block reads one table entry, gathers its 16 tokens, returns a partial softmax", { s: 9.5, f: P.dim });
      g += tx(30, 358, "a second pass rescales the partials - the same reduction Flash-Decoding uses", { s: 9.5, f: P.faint });
    } else {
      var bi = clamp(Math.floor(lf / 4.6), 0, 4), bs = BSZ[bi];
      g += tx(30, 88, "block_size = " + bs, { s: 22, f: P.amber, w: 600 });
      var L = 400;
      var waste = ((bs - 1) / 2) / L;
      var entries = Math.ceil(L / bs) / 400;
      var eff = 1 - 1 / (1 + bs / 8);
      g += meter(30, 150, 300, 14, clamp(waste * 12, 0, 1), waste > 0.06 ? P.pink : P.green, "INTERNAL WASTE PER SEQUENCE", (waste * 100).toFixed(1) + "%");
      g += tx(30, 180, "half a block on average, wasted in the last block", { s: 9, f: P.line });
      g += meter(30, 216, 300, 14, clamp(entries * 2.6, 0, 1), entries > 0.25 ? P.pink : P.green, "BLOCK-TABLE ENTRIES", Math.ceil(L / bs) + " per sequence");
      g += tx(30, 246, "read by every thread block, on every decode step", { s: 9, f: P.line });
      g += meter(30, 282, 300, 14, eff, eff > 0.6 ? P.green : P.pink, "GATHER EFFICIENCY", Math.round(eff * 100) + "%");
      g += tx(30, 312, "longer contiguous runs mean better coalesced loads", { s: 9, f: P.line });
      g += rc(390, 130, 300, 196, "#12181d", 'stroke="' + P.line + '"');
      var verdicts = [
        ["block_size 1", "pure indirection. A table entry per token,", "no contiguity at all, and the kernel spends", "its life chasing pointers."],
        ["block_size 8", "waste is negligible but the table is still", "large and the gathered runs are short."],
        ["block_size 16", "the usual compromise: under 2% waste, a", "manageable table, and runs long enough to", "coalesce. This is the default for a reason."],
        ["block_size 32", "fine for long generations, wasteful when", "most sequences are short."],
        ["block_size 128", "excellent coalescing, and 16% of your KV", "memory spent on tokens that do not exist.", "Concurrency pays for the kernel's comfort."]
      ];
      g += tx(404, 156, verdicts[bi][0], { s: 11, f: P.amber, w: 600, ls: "1" });
      for (var v = 1; v < verdicts[bi].length; v++) g += tx(404, 182 + (v - 1) * 18, verdicts[bi][v], { s: 10, f: P.dim });
      for (var d = 0; d < 5; d++) {
        g += rc(390 + d * 62, 344, 52, 3, d === bi ? P.amber : "#212a30");
        g += tx(390 + d * 62, 364, BSZ[d], { s: 9, f: d === bi ? P.amber : P.line });
      }
    }
    var caps2 = [
      "A decoding step has one query per sequence and a KV cache thousands of rows tall. Parallelising over queries gives the GPU almost nothing to do.",
      "So parallelise over the <b>KV axis instead</b>. Each thread block takes one block of the cache, finds it through the block table, and computes a partial softmax that a second pass reduces.",
      "Every property you want moves in a different direction with block size, which is why this is a knob and not a constant."
    ];
    return [sv(g, 720, 390), caps2[st]];
  }, 110);

  /* =========================================================
     C - automatic prefix caching by chained block hash
     ========================================================= */
  var HA = ["a41f", "7c02", "e918", "3b7d", "d550"];
  var HB = ["a41f", "7c02", "e918", "91c4", "6f2a"];
  reg("fig-block-hash", 76, function (f) {
    var st = Math.min(3, Math.floor(f / 19)), lf = f % 19;
    var g = rc(0, 0, 720, 392, P.bg);
    var heads = [
      ["HASH EACH BLOCK WITH ITS HISTORY", "block_hash = H(previous block hash, this block's token ids)"],
      ["A SECOND REQUEST LOOKS ITSELF UP", "three hits, two misses, and nothing new to schedule"],
      ["WHY THE CHAIN IS NOT OPTIONAL", "the same sixteen tokens after a different history are not the same state"],
      ["EVICTED IS NOT GONE", "a freed block keeps its hash until something else claims it"]
    ];
    g += tx(30, 28, heads[st][0], { s: 12, f: P.ink, w: 600, ls: "1.2" });
    g += tx(30, 46, heads[st][1], { s: 10, f: P.faint });
    var labels = ["system prompt", "few-shot ex.", "few-shot ex.", "document", "question"];
    var nA = st === 0 ? clamp(Math.floor(E(S(lf, 2, 16)) * 5) + (lf > 2 ? 1 : 0), 0, 5) : 5;
    var nB = st === 1 ? clamp(Math.floor(E(S(lf, 2, 16)) * 5) + (lf > 2 ? 1 : 0), 0, 5) : (st > 1 ? 5 : 0);
    function chain(y, hs, n, col, tag) {
      var s = tx(30, y - 10, tag, { s: 9.5, f: col, ls: "1.1" });
      for (var i = 0; i < 5; i++) {
        var on = i < n, shared = tag.indexOf("B") >= 0 && i < 3;
        var x = 30 + i * 128;
        s += rc(x, y, 116, 26, on ? (shared ? "#1b2b33" : "#141b21") : "#141920",
          'stroke="' + (on ? (shared ? P.green : col) : "#212a30") + '" stroke-width="1"');
        s += tx(x + 58, y + 17, on ? labels[i] : "-", { s: 9.5, a: "middle", f: on ? (shared ? P.green : col) : P.line });
        s += tx(x + 58, y + 42, on ? hs[i] : "", { s: 10.5, a: "middle", f: on ? (shared ? P.green : P.amber) : P.line, w: 600 });
        if (i < 4 && on) s += pth("M" + (x + 116) + " " + (y + 13) + " l10 0", P.line, 1);
        if (on && i < 4) s += pth("M" + (x + 58) + " " + (y + 48) + " C" + (x + 90) + " " + (y + 62) + " " + (x + 126) + " " + (y + 62) + " " + (x + 158) + " " + (y + 48), P.line, 1, "none", 'opacity="0.55"');
      }
      return s;
    }
    if (st < 3) {
      g += chain(88, HA, nA, P.blue, "REQUEST A - BLOCKS OF 16 TOKENS, AND THEIR CHAINED HASHES");
      if (st >= 1) g += chain(196, HB, nB, P.purple, "REQUEST B - SAME SYSTEM PROMPT AND EXAMPLES, DIFFERENT DOCUMENT");
    }
    if (st === 1 && nB >= 3) {
      g += rc(30, 264, 660, 54, "#12181d", 'stroke="' + P.green + '" stroke-dasharray="2 3"');
      g += tx(44, 286, "three hash lookups hit. B's block table points at A's physical blocks and the", { s: 10, f: P.green });
      g += tx(44, 304, "refcounts go to two, so 48 tokens are never prefilled at all.", { s: 10, f: P.green });
    }
    if (st === 2) {
      g += tx(30, 258, "UNCHAINED - hash the block's own tokens only", { s: 10, f: P.pink, ls: "1" });
      var boxes = [["conversation X", "...please summarise..."], ["conversation Y", "...please summarise..."]];
      for (var c = 0; c < 2; c++) {
        g += rc(30 + c * 340, 270, 300, 44, "#1e1418", 'stroke="' + P.pink + '"');
        g += tx(44 + c * 340, 289, boxes[c][0], { s: 10, f: P.dim });
        g += tx(44 + c * 340, 305, boxes[c][1] + "  ->  hash 2f10", { s: 10, f: P.pink, w: 600 });
      }
      g += tx(360, 334, "same key, different history, wrong KV served", { s: 10.5, a: "middle", f: P.pink, w: 600 });
      g += tx(30, 358, "CHAINED - fold in the prefix", { s: 10, f: P.green, ls: "1" });
      g += tx(30, 380, "X: H(H(H(h0,b1),b2),b3) = 8ae2      Y: H(H(H(h0,b1'),b2'),b3) = c74b      no collision", { s: 10, f: P.green });
    }
    if (st === 3) {
      var ph = E(S(lf, 2, 16));
      g += tx(30, 96, "SEQUENCE A FINISHES - REFCOUNTS FALL TO ZERO", { s: 10, f: P.faint, ls: "1.1" });
      for (var b2 = 0; b2 < 5; b2++) {
        var freed = ph > 0.25, revived = ph > 0.7 && b2 < 3;
        g += rc(30 + b2 * 128, 112, 116, 32, revived ? "#1b2b33" : (freed ? "#181f25" : "#141b21"),
          'stroke="' + (revived ? P.green : (freed ? P.line : P.blue)) + '" stroke-width="1"');
        g += tx(88 + b2 * 128, 132, HA[b2], { s: 10.5, a: "middle", f: revived ? P.green : (freed ? P.faint : P.blue), w: 600 });
        g += tx(88 + b2 * 128, 158, revived ? "revived, refcount 1" : (freed ? "free queue, hash kept" : "refcount 1"), { s: 8.5, a: "middle", f: revived ? P.green : P.line });
      }
      g += rc(30, 190, 660, 92, "#12181d", 'stroke="' + P.line + '"');
      g += tx(44, 212, "THE FREE QUEUE IS AN LRU CACHE, NOT A DISCARD PILE", { s: 9.5, f: P.faint, ls: "1.1" });
      g += tx(44, 236, "A block with refcount zero is returned to the tail of the free list but keeps its hash entry.", { s: 10, f: P.dim });
      g += tx(44, 256, "Any later request that hashes to it takes it straight back. The hash is only dropped at the", { s: 10, f: P.dim });
      g += tx(44, 276, "moment the block is actually handed to a different sequence.", { s: 10, f: P.dim });
      g += meter(30, 320, 300, 13, ph > 0.7 ? 0.6 : (ph > 0.25 ? 0 : 0.2), ph > 0.7 ? P.green : P.line, "BLOCKS RECLAIMED WITHOUT RECOMPUTE", ph > 0.7 ? "3 of 5" : "0");
      g += tx(390, 314, "this is why a measured hit rate can exceed", { s: 9.5, f: P.faint });
      g += tx(390, 330, "what the live working set explains", { s: 9.5, f: P.faint });
    }
    var caps3 = [
      "Each block's identity is the hash of its own tokens folded together with the hash of everything before it. Computing it costs a hash per sixteen tokens.",
      "The second request hashes its own blocks and finds three of them already in the table. No tree walk, no comparison of token ids &mdash; a dictionary lookup per block.",
      "Drop the chain and identical text at the same offset in two unrelated conversations produces the same key. The failure is silent: the output stays fluent and is answering the wrong context.",
      "Freed blocks keep their hashes while they sit in the free queue, so a prefix can come back from the dead if nothing has claimed its memory yet."
    ];
    return [sv(g, 720, 392), caps3[st]];
  }, 115);

  /* =========================================================
     D - preemption: recompute or swap
     ========================================================= */
  reg("fig-preempt", 64, function (f) {
    var g = rc(0, 0, 720, 392, P.bg);
    var show = f >= 42;
    g += tx(30, 28, "ONE SEQUENCE MUST GO: 8,192 TOKENS, 512 BLOCKS, 1 GiB OF KV", { s: 12, f: P.ink, w: 600, ls: "1.2" });
    g += tx(30, 46, "both paths free the same memory and pay for it later in different currencies", { s: 10, f: P.faint });
    var pr = E(S(f, 2, 34));
    // recompute
    g += rc(30, 76, 320, 176, "#12181d", 'stroke="' + P.green + '" stroke-width="0.9"');
    g += tx(44, 98, "RECOMPUTE", { s: 11, f: P.green, w: 600, ls: "1.2" });
    for (var i = 0; i < 32; i++) {
      var gone = pr > 0.12;
      g += rc(44 + (i % 16) * 18, 112 + Math.floor(i / 16) * 18, 16, 16, gone ? "#1a2128" : P.blue, 'opacity="' + (gone ? 1 : 0.85) + '"');
    }
    g += tx(44, 168, pr > 0.12 ? "blocks free: immediately" : "dropping KV...", { s: 10, f: pr > 0.12 ? P.green : P.dim });
    if (pr > 0.35) {
      var pf = clamp(S(pr, 0.35, 1), 0, 1);
      g += rc(44, 186, 292 * pf, 20, P.amber);
      g += tx(48, 200, "re-prefill 8,192 tokens", { s: 9.5, f: "#160c07", w: 600 });
      g += tx(44, 226, "131 TFLOP at 400 TFLOP/s = 327 ms", { s: 10, f: P.amber });
      g += tx(44, 242, "paid on readmission, batched with other work", { s: 9, f: P.line });
    }
    // swap
    g += rc(370, 76, 320, 176, "#12181d", 'stroke="' + P.blue + '" stroke-width="0.9"');
    g += tx(384, 98, "SWAP TO HOST", { s: 11, f: P.blue, w: 600, ls: "1.2" });
    var moved = clamp(S(pr, 0.05, 0.55), 0, 1);
    for (var j = 0; j < 32; j++) {
      var out = (j / 32) < moved;
      g += rc(384 + (j % 16) * 18, 112 + Math.floor(j / 16) * 18, 16, 16, out ? "#1a2128" : P.blue, 'opacity="' + (out ? 1 : 0.85) + '"');
    }
    for (var k = 0; k < 5; k++) {
      if (moved <= 0 || moved >= 1) break;
      var t2 = ((f * 0.11) + k / 5) % 1;
      g += rc(384 + t2 * 280, 156, 14, 10, P.teal, 'opacity="' + R(0.3 + 0.6 * Math.sin(t2 * Math.PI)) + '"');
    }
    g += tx(384, 186, moved >= 1 ? "blocks free: after 21 ms of PCIe" : "copying 1 GiB over PCIe...", { s: 10, f: moved >= 1 ? P.blue : P.dim });
    if (pr > 0.6) {
      g += rc(384, 198, 292 * clamp(S(pr, 0.6, 1), 0, 1), 20, P.teal);
      g += tx(388, 212, "swap out + swap in", { s: 9.5, f: "#08141a", w: 600 });
      g += tx(384, 236, "2 GiB at 50 GB/s = 43 ms", { s: 10, f: P.teal });
    }
    if (show) {
      g += ln(30, 270, 690, 270, "#1f272d", 1);
      g += tx(30, 292, "THE ARITHMETIC SAYS SWAP", { s: 10, f: P.teal, ls: "1.1" });
      g += rc(230, 280, 400 * (327 / 327), 14, P.amber);
      g += tx(236, 291, "recompute 327 ms", { s: 9.5, f: "#160c07", w: 600 });
      g += rc(230, 300, 400 * (43 / 327), 14, P.teal);
      g += tx(230 + 400 * (43 / 327) + 8, 311, "swap 43 ms", { s: 9.5, f: P.teal, w: 600 });
      g += tx(30, 340, "AND YET RECOMPUTE IS THE DEFAULT", { s: 10, f: P.green, ls: "1.1" });
      g += tx(30, 362, "it frees memory now rather than in 21 ms  -  it needs no reserved host buffer  -  it competes with", { s: 9.5, f: P.dim });
      g += tx(30, 380, "nothing for PCIe  -  and with prefix caching the re-prefill is usually a cache hit anyway", { s: 9.5, f: P.dim });
    }
    var cap;
    if (f < 14) cap = "The pool is under its watermark and the running set cannot all grow. One sequence has to release its blocks.";
    else if (f < 34) cap = "Recompute drops the KV and is done. Swap has to move a gigabyte before the memory it is freeing becomes usable.";
    else if (f < 48) cap = "Measured in raw time the swap is roughly <b>eight times cheaper</b>, because a KV byte moves far faster than a FLOP recomputes it.";
    else cap = "The default is still recompute, and the reasons are all about <em>when</em> rather than <em>how much</em>: pressure has to be relieved immediately, and a prefix cache often makes the bill vanish.";
    return [sv(g, 720, 392), cap];
  }, 110);

  /* ---------------- boot ---------------- */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", window.__SERVING_BOOT);
  else window.__SERVING_BOOT();
})();
