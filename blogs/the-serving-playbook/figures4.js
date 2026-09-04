/* Figures 19-22: the SGLang runtime up close, then boot */
(function () {
  "use strict";
  var F = window.__SERVING_FIG;
  if (!F) { console.error("figures4.js loaded before figures.js"); return; }
  var P = F.P, HUES = F.HUES, R = F.R, clamp = F.clamp, lerp = F.lerp, S = F.S, E = F.E;
  var rc = F.rc, tx = F.tx, ln = F.ln, pth = F.pth, sv = F.sv, meter = F.meter, reg = F.reg;

  function edge(px, py, cx2, cy2, col, op) {
    return pth("M" + R(px) + " " + R(py) + " C" + R(px + 18) + " " + R(py) + " " +
      R(cx2 - 18) + " " + R(cy2) + " " + R(cx2) + " " + R(cy2), col, 1.1, "none",
      'opacity="' + R(op === undefined ? 0.8 : op) + '"');
  }
  function node(x, y, w, h, col, title, span, op, pinned) {
    var s = rc(x, y, w, h, "#141b21", 'stroke="' + col + '" stroke-width="1.1" opacity="' + R(op) + '"');
    s += tx(x + 8, y + 12, title, { s: 9.5, f: col, w: 600, op: op });
    if (span) s += tx(x + 8, y + 24, span, { s: 8.5, f: P.line, op: op });
    if (pinned) {
      s += rc(x + w - 16, y + 5, 10, 10, "none", 'stroke="' + P.amber + '" stroke-width="1.2" opacity="' + R(op) + '"');
      s += rc(x + w - 14, y + 9, 6, 6, P.amber, 'opacity="' + R(op) + '"');
    }
    return s;
  }

  /* =========================================================
     FIGURE 19 - the four radix-tree operations
     ========================================================= */
  reg("fig-radix-ops", 88, function (f) {
    var st = Math.min(3, Math.floor(f / 22)), lf = f % 22;
    var g = rc(0, 0, 720, 404, P.bg);
    var titles = [
      ["MATCH", "walk from the root, comparing token ids, until they stop agreeing"],
      ["SPLIT", "the match ended inside a node's span, so the node is cut in two"],
      ["INSERT", "the unmatched suffix becomes a new child, and only it is prefilled"],
      ["PIN AND EVICT", "running requests hold a refcount; eviction takes unpinned leaves first"]
    ];
    g += tx(30, 28, titles[st][0], { s: 12.5, f: P.ink, w: 600, ls: "1.5" });
    g += tx(30, 46, titles[st][1], { s: 10, f: P.faint });

    // incoming token strip
    var matched = st === 0 ? Math.round(E(S(lf, 2, 17)) * 80) : 80;
    var TOT = 112;
    g += tx(30, 76, "incoming", { s: 9.5, f: P.faint });
    g += tx(30, 88, "request", { s: 9.5, f: P.faint });
    for (var i = 0; i < 28; i++) {
      var tokAt = i * 4;
      var on = tokAt < matched;
      var isNew = tokAt >= 100;
      g += rc(110 + i * 16, 70, 14, 22, on ? (tokAt < 40 ? P.green : P.blue) : (isNew ? "#241c33" : "#1a2129"),
        'stroke="#232c33" stroke-width="0.6"');
    }
    g += tx(690, 86, matched + " / " + TOT + " matched", { s: 10.5, a: "end", f: P.green, w: 600 });

    // ---- tree
    var splitP = st === 1 ? E(S(lf, 3, 16)) : (st > 1 ? 1 : 0);
    var bw = lerp(146, 86, splitP);
    var b2op = splitP;
    var cop = st === 2 ? E(S(lf, 4, 16)) : (st > 2 ? 1 : 0);
    var evictP = st === 3 ? E(S(lf, 10, 19)) : 0;

    var rootX = 30, aX = 94, bX = 240;
    g += node(rootX, 176, 40, 30, P.faint, "root", "", 1, false);
    g += edge(rootX + 40, 191, aX, 191, P.line, 0.9);
    g += node(aX, 176, 118, 30, P.green, "system prompt", "tokens 0-39", 1, st === 3);
    g += edge(aX + 118, 191, bX, 191, P.line, 0.9);
    g += node(bX, 176, bw, 30, P.blue, splitP > 0.5 ? "document A" : "document A", splitP > 0.5 ? "40-79" : "tokens 40-99", 1, st === 3);
    if (splitP > 0.02) {
      g += edge(bX + bw, 191, bX + bw + 20, 191, P.line, b2op);
      g += node(bX + bw + 20, 176, 84, 30, P.blue, "tail", "80-99", b2op, false);
      if (splitP < 0.98) g += ln(bX + bw + 6, 168, bX + bw + 6, 214, P.amber, 1.4, 'stroke-dasharray="3 2"');
    }
    if (cop > 0.02) {
      g += edge(bX + bw, 200, bX + bw + 20, 244, P.purple, cop);
      g += node(bX + bw + 20, 230, 84, 30, P.purple, "new suffix", "100-111", cop, false);
    }
    // sibling leaves
    var q1op = 1, oldop = st === 3 ? 1 - evictP : 1;
    g += edge(aX + 118, 186, bX, 122, P.line, 0.7);
    g += node(bX, 108, 110, 30, P.amber, "query 1", "live request", q1op, st === 3);
    g += edge(aX + 118, 198, bX, 300, P.line, 0.7 * oldop);
    g += node(bX, 286, 110, 30, P.rust, "old chat turn", "idle 40 s", oldop, false);
    if (st === 3 && evictP > 0.05 && evictP < 0.95)
      g += tx(bX + 120, 305, "evicting", { s: 9.5, f: P.pink, op: 1 - Math.abs(evictP - 0.5) * 2 + 0.3 });

    // annotation
    var notes = [
      ["comparison is on token ids, not text",
        ["the walk costs O(matched tokens),", "not O(cache size)"]],
      ["NOTHING IS COPIED",
        ["the KV blocks stay exactly where they", "are - only the tree metadata is cut"]],
      ["ONLY 12 TOKENS ARE PREFILLED",
        ["the other 100 are already resident and", "are attended to out of existing blocks"]],
      ["A PINNED NODE CANNOT GO",
        ["and freeing a leaf may turn its parent", "into the next eviction candidate"]]
    ];
    g += rc(400, 104, 290, 62, "#12181d", 'stroke="' + (st === 0 ? P.line : P.amber) + '" stroke-dasharray="2 3"');
    g += tx(412, 124, notes[st][0], { s: 9.5, f: st === 0 ? P.faint : P.amber, ls: st === 0 ? "0" : "1" });
    g += tx(412, 143, notes[st][1][0], { s: 9.5, f: P.dim });
    g += tx(412, 159, notes[st][1][1], { s: 9.5, f: P.dim });

    // ---- KV pool
    g += tx(30, 340, "KV BLOCK POOL", { s: 9, f: P.line, ls: "1.2" });
    for (var b = 0; b < 42; b++) {
      var col = "#161d22";
      if (b < 10) col = P.green;
      else if (b < 25) col = P.blue;
      else if (b < 31) col = P.amber;
      else if (b < 37) col = P.rust;
      else col = cop > 0.5 ? P.purple : "#161d22";
      g += rc(30 + b * 16, 348, 14, 20, col, 'opacity="' + (b >= 31 && b < 37 && st === 3 ? R(1 - evictP * 0.85) : 1) + '"');
    }
    g += tx(30, 388, "green = system prompt   blue = document A   amber = live query   purple = new suffix", { s: 9, f: P.line });
    var caps = [
      "The tree is a compressed trie over <b>token ids</b>. Matching walks it once and stops at the first disagreement &mdash; here after 80 of the request's 112 tokens.",
      "The match landed inside the middle of a node, so the node is <b>split into a parent and a child</b>. This is a pointer edit. Not one byte of KV moves.",
      "The 12 unmatched tokens become a new child and the only thing that gets prefilled. Everything to its left is attended to out of blocks that already exist.",
      "Nodes on the path of a running request carry a refcount and are unevictable. Eviction is LRU <b>restricted to leaves</b>, applied recursively as parents become leaves."
    ];
    return [sv(g, 720, 404), caps[st]];
  }, 110);

  /* =========================================================
     FIGURE 20 - cache-aware scheduling
     ========================================================= */
  var F20 = ["A", "B", "A", "C", "B", "A", "C", "A"];
  var F20ORD = [0, 2, 5, 7, 1, 4, 3, 6];
  var F20SZ = { A: 1800, B: 1200, C: 900 };
  function simulate(order) {
    var cache = [], out = [], cost = 0;
    for (var i = 0; i < order.length; i++) {
      var tag = F20[order[i]];
      var hit = cache.indexOf(tag) >= 0;
      if (hit) { cache.splice(cache.indexOf(tag), 1); cache.push(tag); }
      else { cost += F20SZ[tag]; if (cache.length >= 2) cache.shift(); cache.push(tag); }
      out.push({ idx: order[i], tag: tag, hit: hit, cache: cache.slice() });
    }
    return { steps: out, cost: cost };
  }
  var F20FIFO = simulate([0, 1, 2, 3, 4, 5, 6, 7]);
  var F20SORT = simulate(F20ORD);
  reg("fig-cache-sched", 64, function (f) {
    var aware = f >= 30, lf = aware ? f - 30 : f;
    var sim = aware ? F20SORT : F20FIFO;
    var order = aware ? F20ORD : [0, 1, 2, 3, 4, 5, 6, 7];
    var done = clamp(Math.floor(S(lf, 2, 24) * 8) + (lf > 2 ? 1 : 0), 0, 8);
    var g = rc(0, 0, 720, 362, P.bg);
    g += tx(30, 28, aware ? "CACHE-AWARE ORDER" : "ARRIVAL ORDER", { s: 12.5, f: aware ? P.green : P.amber, w: 600, ls: "1.5" });
    g += tx(30, 46, aware ? "the waiting queue is sorted by longest match against the tree" : "eight requests, three distinct shared prefixes, room for two in cache", { s: 10, f: P.faint });
    // queue
    g += tx(30, 82, "QUEUE", { s: 9, f: P.line, ls: "1.2" });
    for (var i = 0; i < 8; i++) {
      var src = order[i];
      var homeX = 30 + i * 84;
      var mv = aware ? E(S(lf, 0, 6)) : 1;
      var fromX = 30 + src * 84;
      var x = lerp(fromX, homeX, mv);
      var st = i < done ? sim.steps[i] : null;
      var col = HUES[F20[src].charCodeAt(0) - 65];
      g += rc(x, 92, 76, 40, "#141b21", 'stroke="' + (st ? (st.hit ? P.green : P.pink) : col) + '" stroke-width="1.1"');
      g += rc(x, 92, 76, 6, col, 'opacity="0.85"');
      g += tx(x + 38, 116, "prefix " + F20[src], { s: 10, a: "middle", f: col, w: 600 });
      if (st) g += tx(x + 38, 128, st.hit ? "hit" : "miss", { s: 8.5, a: "middle", f: st.hit ? P.green : P.pink });
    }
    // cache state
    g += tx(30, 168, "CACHE (2 SLOTS)", { s: 9, f: P.line, ls: "1.2" });
    var cur = done ? sim.steps[done - 1].cache : [];
    for (var c = 0; c < 2; c++) {
      g += rc(30 + c * 96, 178, 88, 30, "#141b21", 'stroke="' + P.line + '"');
      if (cur[c]) g += tx(74 + c * 96, 198, "prefix " + cur[c], { s: 10, a: "middle", f: HUES[cur[c].charCodeAt(0) - 65], w: 600 });
      else g += tx(74 + c * 96, 198, "empty", { s: 9.5, a: "middle", f: P.line });
    }
    g += tx(240, 190, aware ? "each prefix is loaded once and reused while it is hot" : "the tags alternate, so every load evicts the one about to be needed", { s: 9.5, f: aware ? P.green : P.pink });
    g += tx(240, 206, aware ? "" : "this is cache thrashing, produced entirely by ordering", { s: 9.5, f: P.faint });
    // running cost
    var spent = 0, hits = 0;
    for (var k = 0; k < done; k++) { if (!sim.steps[k].hit) spent += F20SZ[sim.steps[k].tag]; else hits++; }
    g += meter(30, 250, 300, 13, spent / 7800, aware ? P.green : P.pink, "PREFILL TOKENS RECOMPUTED", spent.toLocaleString());
    g += tx(370, 250, "cache hits", { s: 10 });
    g += tx(690, 250, hits + " of " + done, { s: 12, a: "end", f: hits > done / 2 ? P.green : P.pink, w: 600 });
    // comparison bars
    g += ln(30, 282, 690, 282, "#1f272d", 1);
    g += rc(30, 296, 660 * (7800 / 7800), 16, P.pink, 'opacity="' + (aware ? 0.3 : 0.9) + '"');
    g += tx(38, 308, "arrival order: 7,800 tokens recomputed", { s: 9.5, f: aware ? P.faint : "#160c0f", w: 600 });
    g += rc(30, 320, 660 * (3900 / 7800), 16, P.green, 'opacity="' + (aware ? 0.9 : 0.25) + '"');
    g += tx(38, 332, "cache-aware order: 3,900", { s: 9.5, f: aware ? "#08141a" : P.faint, w: 600 });
    g += tx(30, 356, "reordering must be bounded, or a cold prefix waits forever behind a hot one", { s: 9, f: P.line });
    var cap;
    if (!aware && done < 4) cap = "Served in arrival order, the two cache slots hold whatever arrived last.";
    else if (!aware) cap = "Every miss evicts the prefix that the next request wanted. Six of eight requests re-prefill from scratch.";
    else if (lf < 8) cap = "Same eight requests, same cache. The scheduler sorts the queue by longest match before building the batch.";
    else cap = "Three misses instead of six: <b>half the prefill work removed by ordering alone</b>. No kernel, no model, no extra memory.";
    return [sv(g, 720, 362), cap];
  });

  /* =========================================================
     FIGURE 21 - overlapped scheduler
     ========================================================= */
  reg("fig-overlap-sched", 56, function (f) {
    var ov = f >= 28, lf = ov ? f - 28 : f;
    var g = rc(0, 0, 720, 340, P.bg);
    var x0 = 140, W = 540;
    g += tx(30, 28, ov ? "OVERLAPPED SCHEDULER" : "SERIAL SCHEDULER", { s: 12.5, f: ov ? P.green : P.amber, w: 600, ls: "1.5" });
    g += tx(30, 46, ov ? "step i+1 is prepared on the CPU while step i runs on the GPU" : "prepare, launch, wait, detokenize, repeat", { s: 10, f: P.faint });
    var lanes = [["SCHEDULER (CPU)", 84], ["GPU", 136], ["DETOKENIZER (CPU)", 188]];
    for (var l = 0; l < 3; l++) {
      g += tx(x0 - 10, lanes[l][1] + 19, lanes[l][0], { s: 9, a: "end", f: P.faint });
      g += rc(x0, lanes[l][1], W, 28, "#101519");
    }
    var n = 6, prog = E(S(lf, 1, 22));
    var unit = ov ? W / n : W / n;
    for (var i = 0; i < n; i++) {
      var app = clamp((prog * n) - i, 0, 1);
      if (app <= 0) break;
      if (!ov) {
        var base = x0 + i * unit;
        g += rc(base + 1, 84, unit * 0.26 * app, 28, P.amber, 'opacity="0.9"');
        g += rc(base + unit * 0.28, 136, unit * 0.56 * app, 28, P.blue, 'opacity="0.9"');
        g += rc(base + unit * 0.86, 188, unit * 0.12 * app, 28, P.teal, 'opacity="0.9"');
        g += rc(base + unit * 0.84, 136, unit * 0.16 * app, 28, "#2a1a1e");
      } else {
        var b2 = x0 + i * unit;
        g += rc(b2 + 1, 84, unit * 0.3 * app, 28, P.amber, 'opacity="0.9"');
        g += rc(b2 + 1, 136, unit * 0.98 * app, 28, P.blue, 'opacity="0.9"');
        if (i > 0) g += rc(b2 - unit * 0.55, 188, unit * 0.22 * app, 28, P.teal, 'opacity="0.85"');
      }
      if (app > 0.5) g += tx(x0 + i * unit + unit * 0.5, 155, "i+" + i, { s: 8.5, a: "middle", f: "#08141a" });
    }
    g += tx(x0, 234, ov
      ? "the scheduler runs one step ahead, so the GPU never waits for Python to decide anything"
      : "amber = build the batch and block tables   blue = forward pass   teal = detokenize", { s: 9.5, f: P.faint });
    g += tx(x0, 250, ov
      ? "detokenization sits in its own process and cannot stall the loop at all"
      : "dark gaps on the GPU lane are the CPU deciding what to do next", { s: 9.5, f: ov ? P.faint : P.pink });
    g += meter(30, 292, 300, 14, ov ? 0.03 : 0.34, ov ? P.green : P.pink, "GPU IDLE PER ITERATION", ov ? "3%" : "34%");
    g += tx(390, 292, "decode throughput", { s: 10 });
    g += tx(690, 292, ov ? "1.45x" : "1.00x", { s: 13, a: "end", f: ov ? P.green : P.ink, w: 600 });
    g += tx(30, 330, "this is the same disease as kernel-launch overhead, one level up the stack", { s: 9, f: P.line });
    return [sv(g, 720, 340), ov
      ? "Nothing about the model changed. The CPU simply stopped being on the critical path, which at small batch is worth more than most kernel work."
      : "At twelve milliseconds an iteration, the few milliseconds of Python that build the next batch are not hiding anywhere."];
  });

  /* =========================================================
     FIGURE 22 - compressed FSM and jump-forward decoding
     ========================================================= */
  var F22 = [
    { t: '{"name": "', forced: true, tok: 5 },
    { t: 'Ada', forced: false, tok: 2 },
    { t: '", "age": ', forced: true, tok: 4 },
    { t: '36', forced: false, tok: 1 },
    { t: '}', forced: true, tok: 1 }
  ];
  reg("fig-jump-forward", 68, function (f) {
    var jump = f >= 34, lf = jump ? f - 34 : f;
    var g = rc(0, 0, 720, 372, P.bg);
    g += tx(30, 28, jump ? "JUMP-FORWARD DECODING" : "TOKEN-BY-TOKEN MASKING", { s: 12.5, f: jump ? P.green : P.amber, w: 600, ls: "1.5" });
    g += tx(30, 46, jump ? "runs the grammar has already decided are emitted without a forward pass" : "the grammar masks the logits, but every token still costs a forward pass", { s: 10, f: P.faint });
    g += tx(30, 82, "SCHEMA", { s: 9, f: P.line, ls: "1.2" });
    g += rc(90, 68, 600, 24, "#141b21", 'stroke="' + P.line + '"');
    g += tx(100, 84, '{ "name": string, "age": integer }', { s: 11, f: P.blue });
    // build the char strip
    var total = 0, i, j;
    for (i = 0; i < F22.length; i++) total += F22[i].tok;
    var emitted;
    if (!jump) emitted = clamp(Math.round(E(S(lf, 2, 28)) * total), 0, total);
    else {
      // jumps land instantly, sampled tokens tick
      var beat = E(S(lf, 2, 28));
      var marks = [0, 5, 7, 11, 12, 13];
      var idx = clamp(Math.floor(beat * 5.999), 0, 5);
      emitted = marks[idx + 1] !== undefined ? lerp(marks[idx], marks[idx + 1], (beat * 5.999) % 1) : total;
      emitted = Math.round(emitted);
    }
    var passes = 0, seen = 0, cx = 48;
    g += tx(30, 128, "OUTPUT", { s: 9, f: P.line, ls: "1.2" });
    for (i = 0; i < F22.length; i++) {
      var seg = F22[i], chars = seg.t.length;
      var segFrom = seen, segTo = seen + seg.tok;
      var vis = clamp((emitted - segFrom) / seg.tok, 0, 1);
      var col = seg.forced ? P.amber : P.green;
      for (j = 0; j < chars; j++) {
        var on = (j / chars) < vis;
        g += rc(cx + j * 21, 140, 19, 30, on ? col : "#151b20", 'opacity="' + (on ? 0.9 : 1) + '"');
        if (on) g += tx(cx + j * 21 + 9.5, 161, seg.t[j].replace("&", "+").replace('"', "&quot;"), { s: 12, a: "middle", f: "#0a1519", w: 600 });
      }
      if (vis > 0) {
        if (!jump || !seg.forced) passes += Math.round(vis * seg.tok);
      }
      var mid = cx + chars * 21 / 2, wide = chars >= 4;
      g += tx(mid, 186, wide ? (seg.forced ? "forced" : "sampled") : (seg.forced ? "fixed" : "free"), { s: 8.5, a: "middle", f: col });
      if (vis > 0.5) {
        var spent = jump && seg.forced ? 0 : seg.tok;
        g += tx(mid, 200, wide ? spent + (spent === 1 ? " pass" : " passes") : String(spent),
          { s: 8.5, a: "middle", f: spent === 0 ? P.green : (seg.forced ? P.pink : P.faint) });
      }
      cx += chars * 21 + 8;
      seen = segTo;
    }
    // FSM strip
    g += tx(30, 236, "FSM", { s: 9, f: P.line, ls: "1.2" });
    var sx = 90;
    for (i = 0; i < F22.length; i++) {
      var w = jump && F22[i].forced ? 76 : 116;
      var on2 = emitted >= (function () { var a = 0; for (var q = 0; q <= i; q++) a += F22[q].tok; return a - F22[i].tok; })();
      g += rc(sx, 226, w, 26, "#141b21", 'stroke="' + (on2 ? (F22[i].forced ? P.amber : P.green) : P.line) + '" stroke-width="1.1"');
      g += tx(sx + w / 2, 243, jump && F22[i].forced ? "one edge" : (F22[i].forced ? F22[i].tok + (F22[i].tok === 1 ? " state" : " states") : "free"), { s: 9, a: "middle", f: on2 ? (F22[i].forced ? P.amber : P.green) : P.line });
      if (i < F22.length - 1) g += pth("M" + (sx + w) + " 239 l10 0", P.line, 1);
      sx += w + 10;
    }
    g += tx(90, 268, jump
      ? "deterministic runs of the automaton are compressed into a single edge"
      : "each state advances by exactly one token, whether or not there was a choice", { s: 9.5, f: P.faint });
    g += meter(30, 302, 300, 14, passes / 13, jump ? P.green : P.pink, "FORWARD PASSES SPENT", passes + " / 13 tokens");
    g += tx(390, 302, "model calls saved", { s: 10 });
    g += tx(690, 302, jump ? "10 of 13" : "0", { s: 13, a: "end", f: jump ? P.green : P.ink, w: 600 });
    g += tx(30, 340, jump
      ? "the catch: a jumped string must be retokenized, and its boundaries may not"
      : "ten of these thirteen tokens had exactly one legal continuation, and each", { s: 9.5, f: jump ? P.amber : P.pink });
    g += tx(30, 356, jump
      ? "match the split the model would have produced"
      : "still cost a full pass through the model", { s: 9.5, f: jump ? P.amber : P.pink });
    return [sv(g, 720, 372), jump
      ? "Compressing deterministic runs turns thirteen forward passes into three. For heavily templated output &mdash; tool calls, fixed JSON &mdash; most of the response is structure, not content."
      : "Constrained decoding usually means masking logits. The mask is correct, but it does not save the forward pass that produced the logits."];
  }, 105);

})();
