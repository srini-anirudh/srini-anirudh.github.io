/* Figures 5-11 */
(function () {
  "use strict";
  if (!window.__SERVING_FIG) { console.error("figures2.js loaded before figures.js"); return; }
  var F = window.__SERVING_FIG;
  var P = F.P, HUES = F.HUES, R = F.R, clamp = F.clamp, lerp = F.lerp, S = F.S, E = F.E;
  var rc = F.rc, tx = F.tx, ln = F.ln, pth = F.pth, sv = F.sv, meter = F.meter, reg = F.reg;

  /* =========================================================
     FIGURE 5 - reservation waste, then fragmentation
     ========================================================= */
  var F5USED = [420, 180, 1100, 260, 640, 150, 880, 310];
  var F5CH = [
    { x: 0, w: 70, free: 99 }, { x: 70, w: 110, free: 4 }, { x: 180, w: 60, free: 99 },
    { x: 240, w: 130, free: 99 }, { x: 370, w: 80, free: 9 }, { x: 450, w: 95, free: 99 },
    { x: 545, w: 55, free: 14 }
  ];
  reg("fig-kv-waste", 64, function (f) {
    var g = rc(0, 0, 720, 340, P.bg);
    if (f < 32) {
      g += tx(30, 34, "PHASE 1 - RESERVE max_model_len PER SEQUENCE", { s: 11, f: P.ink, w: 600, ls: "1" });
      g += tx(30, 52, "each bar is one reservation of 8,192 tokens = 1 GiB of KV", { s: 10, f: P.faint });
      var shown = clamp(Math.floor(f / 3) + 1, 0, 8), res = 0, use = 0;
      for (var i = 0; i < 8; i++) {
        var y = 76 + i * 26;
        if (i >= shown) continue;
        var grow = E(clamp((f - i * 3) / 7, 0, 1));
        g += rc(140, y, 480, 19, "#1b242b", 'stroke="' + P.line + '" stroke-width="0.8"');
        g += rc(140, y, 480 * (F5USED[i] / 8192) * grow, 19, HUES[i % 8]);
        g += tx(132, y + 14, "seq " + (i + 1), { s: 10, a: "end", f: P.faint });
        g += tx(628, y + 14, Math.round(F5USED[i] * grow) + " / 8192", { s: 9.5, f: P.line });
        res += 8192; use += F5USED[i] * grow;
      }
      var wasted = res ? 1 - use / res : 0;
      g += tx(140, 300, "reserved", { s: 10 });
      g += tx(360, 300, (res / 8192).toFixed(0) + " GiB", { s: 12, a: "end", f: P.ink, w: 600 });
      g += tx(400, 300, "actually written", { s: 10 });
      g += tx(620, 300, (use / 8192).toFixed(2) + " GiB", { s: 12, a: "end", f: P.green, w: 600 });
      g += meter(140, 322, 480, 12, wasted, P.pink, "INTERNAL WASTE", Math.round(wasted * 100) + "%");
      return [sv(g, 720, 340),
        f < 10 ? "Nobody knows how long a response will be, so the safe move is to reserve the maximum."
          : "Average generation is a few hundred tokens against a reservation of 8,192. <b>Ninety-three percent of the reservation is never written</b> - and that is concurrency you could have had."];
    }
    // phase 2 - fragmentation
    var ff = f - 32;
    g += tx(30, 34, "PHASE 2 - VARIABLE-SIZE CONTIGUOUS ALLOCATIONS", { s: 11, f: P.ink, w: 600, ls: "1" });
    g += tx(30, 52, "sequences finish in a different order than they started", { s: 10, f: P.faint });
    var freeTot = 0, holes = [];
    g += rc(58, 110, 604, 46, "#12181d", 'stroke="' + P.line + '"');
    for (var c = 0; c < F5CH.length; c++) {
      var ch = F5CH[c], gone = ff >= ch.free;
      if (gone) { freeTot += ch.w; holes.push(ch); g += rc(60 + ch.x, 112, ch.w - 2, 42, "#191f25"); g += tx(60 + ch.x + ch.w / 2, 137, ch.w + " MB", { s: 9, a: "middle", f: P.line }); }
      else { g += rc(60 + ch.x, 112, ch.w - 2, 42, HUES[c % 8], 'opacity="0.85"'); g += tx(60 + ch.x + ch.w / 2, 137, "seq " + (c + 1), { s: 9.5, a: "middle", f: "#0a1519", w: 600 }); }
    }
    g += tx(58, 100, "60 GB KV POOL", { s: 9.5, f: P.faint });
    if (ff > 17) {
      var probe = clamp(S(ff, 18, 31), 0, 1);
      var stops = [0, 70, 370, 545];
      var idx = Math.min(3, Math.floor(probe * 4));
      var px = Math.min(60 + stops[idx], 534);
      g += rc(px, 182, 150, 30, P.rust, 'opacity="0.9"');
      g += tx(px + 75, 202, "incoming: 150 MB", { s: 10, a: "middle", f: "#160c07", w: 600 });
      g += pth("M" + R(px + 75) + " 178 l-6 -10 l12 0 z", P.rust, 1, P.rust);
      g += tx(58, 240, "free in total", { s: 10 });
      g += tx(300, 240, freeTot + " MB", { s: 12, a: "end", f: P.green, w: 600 });
      g += tx(340, 240, "largest contiguous hole", { s: 10 });
      g += tx(662, 240, "110 MB", { s: 12, a: "end", f: P.pink, w: 600 });
      g += tx(58, 268, "ALLOCATION FAILS", { s: 12, f: P.pink, w: 600, ls: "1" });
      g += tx(58, 288, "There is 245 MB free and not one place to put 150 MB.", { s: 11, f: P.dim });
    }
    return [sv(g, 720, 340), ff < 4 ? "The pool starts packed. Now let sequences finish in arrival-independent order."
      : (ff < 18 ? "Each completion punches a hole. The free space is real but it is in pieces."
        : "<b>External fragmentation.</b> Enough memory, wrong shape. Prior systems wasted 60-80% of KV memory to these two effects combined.")];
  });

  /* =========================================================
     FIGURE 6 - paged KV, sharing and copy-on-write
     ========================================================= */
  var F6PHYS = [11, 3, 19, 7, 22];
  reg("fig-paged", 68, function (f) {
    var g = rc(0, 0, 720, 400, P.bg);
    var nA = clamp(Math.floor(S(f, 2, 26) * 5) + (f > 2 ? 1 : 0), 0, 5);
    if (f >= 26) nA = 5;
    var shareOn = f >= 30, cow = f >= 50;
    var nB = f < 30 ? 0 : clamp(Math.floor(S(f, 30, 46) * 4) + 1, 0, 4);
    g += tx(24, 30, "SEQUENCE A", { s: 10.5, f: P.green, w: 600, ls: "1" });
    g += tx(24, 46, "logical blocks", { s: 9, f: P.faint });
    for (var i = 0; i < 5; i++) {
      var y = 62 + i * 34;
      var on = i < nA;
      g += rc(24, y, 96, 26, on ? "#1e2b31" : "#151b20", 'stroke="' + (on ? P.green : P.line) + '" stroke-width="0.9"');
      g += tx(30, y + 17, "blk " + i, { s: 10, f: on ? P.green : P.line });
      g += tx(114, y + 17, on ? "16 tok" : "-", { s: 9, a: "end", f: P.line });
    }
    if (shareOn) {
      g += tx(24, 250, "SEQUENCE B", { s: 10.5, f: P.purple, w: 600, ls: "1" });
      g += tx(24, 264, "same system prompt", { s: 9, f: P.faint });
      for (var j = 0; j < 4; j++) {
        var yb = 276 + j * 30, onb = j < nB;
        var sharedB = j < 3;
        g += rc(24, yb, 96, 24, onb ? (sharedB ? "#232337" : "#2b2338") : "#151b20", 'stroke="' + (onb ? P.purple : P.line) + '" stroke-width="0.9"');
        g += tx(30, yb + 16, "blk " + j, { s: 10, f: onb ? P.purple : P.line });
        if (onb) g += tx(114, yb + 16, sharedB ? "shared" : (cow ? "copied" : "new"), { s: 8.5, a: "end", f: sharedB ? P.blue : P.amber });
      }
    }
    // block table
    g += rc(168, 56, 154, 200, "#12181d", 'stroke="' + P.line + '"');
    g += tx(168, 46, "BLOCK TABLE - A", { s: 9.5, f: P.faint, ls: "1" });
    for (var k = 0; k < 5; k++) {
      var ty = 74 + k * 36;
      if (k < nA) {
        g += tx(180, ty + 4, k, { s: 11, f: P.green, w: 600 });
        g += pth("M196 " + (ty) + " l22 0", P.line, 1);
        g += tx(226, ty + 4, "phys " + F6PHYS[k], { s: 11, f: P.ink, w: 600 });
        var rcnt = shareOn && k < 3 ? 2 : 1;
        g += tx(312, ty + 4, "rc=" + rcnt, { s: 9, a: "end", f: rcnt > 1 ? P.blue : P.line });
      } else { g += tx(180, ty + 4, k, { s: 11, f: P.line }); g += tx(226, ty + 4, "-", { s: 11, f: P.line }); }
    }
    if (shareOn) {
      g += rc(168, 270, 154, 106, "#12181d", 'stroke="' + P.line + '"');
      g += tx(168, 264, "BLOCK TABLE - B", { s: 9.5, f: P.faint, ls: "1" });
      for (var m = 0; m < 4; m++) {
        var my = 288 + m * 24;
        if (m >= nB) continue;
        var tgt = m < 3 ? F6PHYS[m] : (cow ? 14 : 19);
        g += tx(180, my, m, { s: 10.5, f: P.purple, w: 600 });
        g += pth("M194 " + (my - 4) + " l20 0", P.line, 1);
        g += tx(222, my, "phys " + tgt, { s: 10.5, f: m < 3 ? P.blue : (cow ? P.amber : P.ink), w: 600 });
      }
    }
    // physical grid
    g += tx(378, 46, "PHYSICAL KV BLOCKS - ONE FLAT POOL", { s: 9.5, f: P.faint, ls: "1" });
    for (var p = 0; p < 24; p++) {
      var px = 378 + (p % 6) * 54, py = 56 + Math.floor(p / 6) * 40;
      var owner = -1;
      for (var q = 0; q < nA; q++) if (F6PHYS[q] === p) owner = q;
      var isCow = cow && p === 14;
      var fill = owner >= 0 ? "#1e2b31" : (isCow ? "#2b2338" : "#141a1f");
      var stroke = owner >= 0 ? P.green : (isCow ? P.amber : "#222b32");
      g += rc(px, py, 48, 32, fill, 'stroke="' + stroke + '" stroke-width="' + (owner >= 0 || isCow ? 1.2 : 0.7) + '"');
      if (shareOn && owner >= 0 && owner < 3) g += rc(px + 3, py + 3, 42, 26, "none", 'stroke="' + P.blue + '" stroke-width="0.9"');
      g += tx(px + 24, py + 20, owner >= 0 ? "A" + owner : (isCow ? "B3" : p), { s: 10, a: "middle", f: owner >= 0 ? P.green : (isCow ? P.amber : "#2c363d"), w: owner >= 0 ? 600 : 400 });
    }
    g += tx(378, 236, "the free list decides placement; the table hides it", { s: 9.5, f: P.faint });
    if (shareOn) {
      g += rc(378, 258, 318, 62, "#141b21", 'stroke="' + P.blue + '" stroke-dasharray="2 3"');
      g += tx(390, 278, cow ? "COPY-ON-WRITE" : "PREFIX SHARING", { s: 10.5, f: cow ? P.amber : P.blue, w: 600, ls: "1" });
      g += tx(390, 296, cow ? "B diverged inside block 3, so that one block was" : "B's first three blocks point at A's physical blocks.", { s: 9.5, f: P.dim });
      g += tx(390, 310, cow ? "copied. Blocks 0-2 stay shared. Zero tokens recomputed." : "Refcounts go to 2. No copy, no recompute.", { s: 9.5, f: P.dim });
    }
    g += meter(378, 356, 318, 12, (nA + (shareOn ? (cow ? 1 : 0) : 0)) / 24, P.green, "POOL OCCUPANCY", (nA + (cow ? 1 : 0)) + " / 24 blocks");
    var cap;
    if (f < 26) cap = "Blocks are allocated only when they are filled, and they land wherever the free list points. Nothing is contiguous and nothing needs to be.";
    else if (f < 30) cap = "Sequence A now owns five scattered physical blocks with an internal waste of at most fifteen tokens in the last one.";
    else if (f < 50) cap = "Sequence B shares A's system prompt. Its block table simply points at the same physical blocks and the refcounts go to two.";
    else cap = "B's fourth block diverges from A's, so <b>only that block is copied</b>. This is beam search, parallel sampling and shared prompts, all as one mechanism.";
    return [sv(g, 720, 400), cap];
  });

  /* =========================================================
     FIGURE 7 - radix prefix tree
     ========================================================= */
  var F7N = [
    { id: "root", x: 34, y: 158, w: 44, h: 26, l: "root", tok: 0, at: 0, p: -1, c: P.faint },
    { id: "sys", x: 104, y: 158, w: 108, h: 26, l: "system prompt", tok: 380, at: 3, p: 0, c: P.green },
    { id: "docA", x: 240, y: 80, w: 96, h: 26, l: "document A", tok: 1800, at: 9, p: 1, c: P.blue },
    { id: "q1", x: 364, y: 50, w: 78, h: 24, l: "query 1", tok: 24, at: 13, p: 2, c: P.amber },
    { id: "q2", x: 364, y: 106, w: 78, h: 24, l: "query 2", tok: 31, at: 20, p: 2, c: P.amber },
    { id: "docB", x: 240, y: 158, w: 96, h: 26, l: "document B", tok: 1200, at: 27, p: 1, c: P.blue },
    { id: "q3", x: 364, y: 158, w: 78, h: 24, l: "query 3", tok: 18, at: 31, p: 5, c: P.amber },
    { id: "t1", x: 240, y: 226, w: 96, h: 26, l: "chat turn 1", tok: 260, at: 36, p: 1, c: P.purple },
    { id: "t2", x: 364, y: 226, w: 90, h: 26, l: "turn 2", tok: 240, at: 41, p: 7, c: P.purple },
    { id: "t3", x: 478, y: 226, w: 90, h: 26, l: "turn 3", tok: 230, at: 46, p: 8, c: P.purple }
  ];
  reg("fig-radix", 60, function (f) {
    var g = rc(0, 0, 720, 356, P.bg);
    g += tx(24, 24, "PREFIX TREE OVER CACHED KV BLOCKS", { s: 11, f: P.ink, w: 600, ls: "1" });
    g += tx(24, 40, "each node owns the KV of the token span it names", { s: 10, f: P.faint });
    var evict = f >= 52;
    var cached = 0, avoided = 0;
    for (var i = 0; i < F7N.length; i++) {
      var n = F7N[i];
      if (f < n.at) continue;
      var born = E(S(f, n.at, n.at + 3));
      var dead = evict && n.id === "q2" ? clamp(1 - S(f, 52, 57), 0, 1) : 1;
      var op = born * dead;
      if (n.p >= 0) {
        var pn = F7N[n.p];
        g += pth("M" + (pn.x + pn.w) + " " + (pn.y + pn.h / 2) + " C" + (pn.x + pn.w + 16) + " " + (pn.y + pn.h / 2) + " " + (n.x - 16) + " " + (n.y + n.h / 2) + " " + n.x + " " + (n.y + n.h / 2),
          P.line, 1, "none", 'opacity="' + R(op * 0.9) + '"');
      }
      g += rc(n.x, n.y, n.w, n.h, "#141b21", 'stroke="' + n.c + '" stroke-width="1.1" opacity="' + R(op) + '"');
      g += tx(n.x + n.w / 2, n.y + n.h / 2 + 4, n.l, { s: 9.5, a: "middle", f: n.c, w: 600, op: op });
      if (n.tok) g += tx(n.x + n.w / 2, n.y + n.h + 12, n.tok + " tok", { s: 8.5, a: "middle", f: P.line, op: op });
      if (dead > 0) cached += n.tok;
      if (i > 1) avoided += F7N[n.p].tok;
    }
    // arriving request
    var msg = "", matched = 0, fresh = 0, mcol = P.amber;
    if (f >= 9 && f < 13) { msg = "request: system prompt + document A"; matched = 380; fresh = 1800; }
    else if (f >= 13 && f < 20) { msg = "request: system + doc A + query 1"; matched = 2180; fresh = 24; }
    else if (f >= 20 && f < 27) { msg = "request: system + doc A + query 2"; matched = 2180; fresh = 31; }
    else if (f >= 27 && f < 36) { msg = "request: system + document B"; matched = 380; fresh = 1200; }
    else if (f >= 36 && f < 52) { msg = "chat continuation, turn " + (f < 41 ? 1 : (f < 46 ? 2 : 3)); matched = f < 41 ? 380 : (f < 46 ? 640 : 880); fresh = 240; }
    else if (f >= 52) { msg = "cache full - evict least-recently-used LEAF"; mcol = P.pink; }
    if (msg) {
      g += rc(24, 310, 400, 26, "#141b21", 'stroke="' + mcol + '" stroke-dasharray="2 3"');
      g += tx(34, 327, msg, { s: 10, f: mcol });
    }
    if (matched) {
      g += tx(444, 318, "prefix matched", { s: 10 });
      g += tx(696, 318, matched.toLocaleString() + " tok", { s: 12, a: "end", f: P.green, w: 600 });
      g += tx(444, 340, "recomputed", { s: 10 });
      g += tx(696, 340, fresh + " tok", { s: 12, a: "end", f: P.amber, w: 600 });
    }
    if (evict) {
      g += tx(444, 318, "evicting", { s: 10 });
      g += tx(696, 318, "query 2 (leaf)", { s: 12, a: "end", f: P.pink, w: 600 });
      g += tx(444, 340, "document A is safe", { s: 10, f: P.faint });
      g += tx(696, 340, "has live children", { s: 10, a: "end", f: P.blue });
    }
    g += meter(24, 288, 400, 11, clamp(cached / 5200, 0, 1), evict ? P.pink : P.blue, "CACHED PREFIX TOKENS", cached.toLocaleString());
    var cap;
    if (f < 9) cap = "One system prompt, shared by every request in the workload. Compute its KV once.";
    else if (f < 20) cap = "The second request walks the tree, matches the system prompt, and only pays for the document it added.";
    else if (f < 27) cap = "Query 2 arrives after a 2,180-token prefix that already exists. It prefills <b>thirty-one tokens</b>.";
    else if (f < 52) cap = "Multi-turn chat is the ideal case: every turn resends the whole conversation, and every turn matches all of it but the last exchange.";
    else cap = "Eviction is leaf-first. A node with live children cannot go, because its children's KV is only valid while its own is resident.";
    return [sv(g, 720, 356), cap];
  });

  /* =========================================================
     FIGURE 8 - chunked prefill
     ========================================================= */
  reg("fig-chunked", 64, function (f) {
    var T = 40, W = 470, x0 = 176, u = W / T;
    var t = clamp(f * T / 58, 0, T);
    var g = rc(0, 0, 720, 380, P.bg);
    function lane(y, title) { return tx(x0, y - 10, title, { s: 10.5, f: P.ink, w: 600, ls: "1" }) + rc(x0, y, W, 26, "#141b21"); }
    // top: monolithic
    var s = lane(64, "MONOLITHIC PREFILL - one 16k prompt admitted whole");
    for (var i = 0; i < T; i++) {
      if (i >= t) break;
      var x = x0 + i * u;
      if (i < 8 || i >= 30) s += rc(x + 0.6, 64, u - 1.2, 26, P.green, 'opacity="0.85"');
    }
    if (t > 8) s += rc(x0 + 8 * u, 64, (Math.min(t, 30) - 8) * u, 26, P.amber);
    if (t > 12) s += tx(x0 + 19 * u, 81, "PREFILL 16,384 TOKENS", { s: 10, a: "middle", f: "#160c07", w: 600 });
    g += s;
    g += tx(x0 - 8, 81, "GPU", { s: 10, a: "end", f: P.faint });
    // top TPOT chart
    g += tx(x0 - 8, 130, "TPOT", { s: 10, a: "end", f: P.faint });
    g += rc(x0, 104, W, 56, "#101519");
    g += ln(x0, 116, x0 + W, 116, "#2c3941", 1, 'stroke-dasharray="3 3"');
    g += tx(x0 + W + 6, 119, "50 ms SLO", { s: 8.5, f: P.pink });
    for (var k = 0; k < T; k++) {
      if (k >= t) break;
      var v = (k >= 8 && k < 30) ? 0 : 12;
      var xx = x0 + k * u;
      if (k === 30 && t > 30) { g += rc(xx, 106, u - 1, 52, P.pink); g += tx(xx + 8, 100, "440 ms stall", { s: 9.5, f: P.pink, w: 600 }); }
      else if (v) g += rc(xx + 0.6, 158 - v, u - 1.2, v, P.green);
    }
    // bottom: chunked
    var s2 = lane(216, "CHUNKED PREFILL - 512-token chunks piggybacked onto decode");
    for (var j = 0; j < T; j++) {
      if (j >= t) break;
      var x2 = x0 + j * u;
      if (j >= 6 && j < 34) {
        s2 += rc(x2 + 0.6, 216, u - 1.2, 17, P.amber, 'opacity="0.9"');
        s2 += rc(x2 + 0.6, 233, u - 1.2, 9, P.green);
      } else s2 += rc(x2 + 0.6, 216, u - 1.2, 26, P.green, 'opacity="0.85"');
    }
    g += s2;
    g += tx(x0 - 8, 233, "GPU", { s: 10, a: "end", f: P.faint });
    g += tx(x0, 258, "amber = prefill chunk, green = the decodes riding along in the same iteration", { s: 9.5, f: P.faint });
    g += tx(x0 - 8, 300, "TPOT", { s: 10, a: "end", f: P.faint });
    g += rc(x0, 276, W, 52, "#101519");
    g += ln(x0, 288, x0 + W, 288, "#2c3941", 1, 'stroke-dasharray="3 3"');
    for (var m = 0; m < T; m++) {
      if (m >= t) break;
      var vv = (m >= 6 && m < 34) ? 26 : 12;
      g += rc(x0 + m * u + 0.6, 326 - vv, u - 1.2, vv, vv > 20 ? P.teal : P.green);
    }
    g += ln(x0 + t * u, 46, x0 + t * u, 336, P.ink, 1.1, 'opacity="0.5"');
    // side readouts
    g += tx(24, 64, "victim sequence", { s: 10, f: P.faint });
    g += tx(24, 82, "already decoding", { s: 10, f: P.faint });
    g += tx(24, 122, "p99 TPOT", { s: 9.5, f: P.line });
    g += tx(24, 140, t > 30 ? "440 ms" : "12 ms", { s: 13, f: t > 30 ? P.pink : P.green, w: 600 });
    g += tx(24, 300, "p99 TPOT", { s: 9.5, f: P.line });
    g += tx(24, 318, t > 6 ? "26 ms" : "12 ms", { s: 13, f: P.green, w: 600 });
    g += tx(24, 348, "TTFT for the", { s: 9, f: P.line });
    g += tx(24, 360, "long prompt: 30 -> 34", { s: 9, f: P.amber });
    var cap;
    if (t < 8) cap = "Sixty sequences are decoding happily at twelve milliseconds a token. A 16k-token prompt has just been admitted.";
    else if (t < 30) cap = "Above: the prefill owns the GPU and every decode is frozen. Below: the same work in 512-token chunks, with the decodes batched in alongside.";
    else cap = "The monolithic run produced one <b>440 ms</b> inter-token stall. The chunked run traded four iterations of TTFT for a flat tail.";
    return [sv(g, 720, 380), cap];
  }, 100);

  /* =========================================================
     FIGURE 9 - roofline sweep
     ========================================================= */
  reg("fig-roofline", 60, function (f) {
    var g = rc(0, 0, 720, 380, P.bg);
    var L = 92, Rg = 660, Tp = 50, Bt = 280;
    function X(I) { return L + (Math.log(I) / Math.LN2 + 1) / 14 * (Rg - L); }
    function Y(v) { return Bt - (Math.log(v) / Math.LN10) / 3.2 * (Bt - Tp); }
    var PEAK = 989, BW = 3.35;
    for (var e = -1; e <= 13; e += 2) g += ln(X(Math.pow(2, e)), Tp, X(Math.pow(2, e)), Bt, "#1a2228", 1);
    for (var d = 0; d <= 3; d++) { g += ln(L, Y(Math.pow(10, d)), Rg, Y(Math.pow(10, d)), "#1a2228", 1); g += tx(L - 8, Y(Math.pow(10, d)) + 4, Math.pow(10, d), { s: 9, a: "end", f: P.line }); }
    var rid = PEAK / BW;
    g += pth("M" + R(X(0.5)) + " " + R(Y(BW * 0.5)) + " L" + R(X(rid)) + " " + R(Y(PEAK)) + " L" + R(X(8192)) + " " + R(Y(PEAK)), P.line, 2);
    g += tx(X(7) + 12, Y(BW * 7) + 20, "memory bound", { s: 9.5, f: P.blue });
    g += tx(X(1500), Y(PEAK) - 10, "compute bound - 989 TFLOP/s", { s: 9.5, f: P.green });
    g += ln(X(rid), Tp, X(rid), Bt, P.faint, 1, 'stroke-dasharray="3 3"');
    g += tx(X(rid), Bt + 16, "295", { s: 9, a: "middle", f: P.faint });
    g += tx(L, Bt + 36, "arithmetic intensity (FLOPs per byte of HBM traffic)", { s: 10, f: P.faint });
    g += tx(L - 8, Tp - 12, "TFLOP/s", { s: 10, f: P.faint, a: "start" });
    // fixed points
    g += rc(X(4096) - 4, Y(PEAK * 0.62) - 4, 8, 8, P.green);
    g += tx(X(4096) - 10, Y(PEAK * 0.62) + 4, "prefill, 4k chunk", { s: 9.5, a: "end", f: P.green });
    g += rc(X(2) - 4, Y(BW * 2) - 4, 8, 8, P.pink);
    g += tx(X(2) + 10, Y(BW * 2) + 4, "attention over 8k KV - never amortizes", { s: 9.5, f: P.pink });
    // sweep
    var B = Math.pow(2, S(f, 0, 54) * 10);
    for (var i = 0; i <= 54; i += 3) {
      if (i > f) break;
      var b = Math.pow(2, S(i, 0, 54) * 10);
      g += '<circle cx="' + R(X(b)) + '" cy="' + R(Y(Math.min(PEAK, BW * b))) + '" r="2.4" fill="' + P.amber + '" opacity="0.35"/>';
    }
    var ach = Math.min(PEAK, BW * B);
    g += '<circle cx="' + R(X(B)) + '" cy="' + R(Y(ach)) + '" r="6" fill="' + P.amber + '"/>';
    g += '<circle cx="' + R(X(B)) + '" cy="' + R(Y(ach)) + '" r="11" fill="none" stroke="' + P.amber + '" stroke-width="1" opacity="0.5"/>';
    g += tx(X(B), Y(ach) - 18, "decode, B = " + Math.round(B), { s: 10, a: "middle", f: P.amber, w: 600 });
    g += tx(24, 348, "achieved", { s: 9.5, f: P.line });
    g += tx(24, 368, ach.toFixed(1) + " TFLOP/s", { s: 12, f: P.amber, w: 600 });
    g += tx(300, 348, "fraction of peak", { s: 9.5, f: P.line });
    g += tx(300, 368, (ach / PEAK * 100).toFixed(1) + "%", { s: 12, f: P.ink, w: 600 });
    g += tx(490, 348, "KV footprint at 4k context", { s: 9.5, f: P.line });
    g += tx(490, 368, (B * 0.5).toFixed(0) + " GB", { s: 12, f: B * 0.5 > 60 ? P.pink : P.green, w: 600 });
    var cap;
    if (B < 8) cap = "Batch 1 sits at the far left of the memory-bound slope. The machine is a very expensive memory controller.";
    else if (B < 96) cap = "Every doubling of the batch doubles achieved FLOP/s at constant step time. This is the cheapest performance in the entire stack.";
    else if (B < 300) cap = "Approaching the ridge. Note the third readout: <b>the KV cache runs out before the arithmetic does</b>.";
    else cap = "Past the ridge, extra batch buys throughput at linear cost in latency - and the memory constraint bound long ago.";
    return [sv(g, 720, 380), cap];
  });

  /* =========================================================
     FIGURE 10 - disaggregated prefill/decode
     ========================================================= */
  reg("fig-disagg", 60, function (f) {
    var g = rc(0, 0, 720, 360, P.bg);
    var LY = 32;
    var done = clamp(Math.floor(S(f, 4, 40) * LY), 0, LY);
    var arrived = clamp(Math.floor(S(f, 10, 46) * LY), 0, LY);
    var decoding = f >= 46;
    g += tx(30, 32, "PREFILL POOL", { s: 10.5, f: P.amber, w: 600, ls: "1" });
    g += tx(30, 48, "TP=8, compute bound", { s: 9.5, f: P.faint });
    for (var i = 0; i < 2; i++) g += rc(30, 62 + i * 44, 132, 36, "#1c2229", 'stroke="' + P.amber + '" stroke-width="0.9"') + tx(96, 84 + i * 44, "H100 x8", { s: 10, a: "middle", f: P.amber });
    g += tx(30, 176, "layers finished", { s: 9.5, f: P.line });
    for (var l = 0; l < LY; l++) g += rc(30 + (l % 8) * 17, 186 + Math.floor(l / 8) * 12, 15, 10, l < done ? P.amber : "#1a2126");
    g += tx(30, 250, done + " / 32 layers", { s: 11, f: P.ink, w: 600 });
    // link
    g += tx(214, 32, "KV TRANSFER", { s: 10.5, f: P.blue, w: 600, ls: "1" });
    g += tx(214, 48, "400 Gb/s, streamed per layer", { s: 9.5, f: P.faint });
    g += rc(206, 92, 268, 44, "#101619", 'stroke="' + P.line + '"');
    for (var p = 0; p < 10; p++) {
      var ph = ((f * 0.09) + p / 10) % 1;
      var inflight = done > arrived;
      if (!inflight) continue;
      g += rc(210 + ph * 254, 100, 16, 28, P.blue, 'opacity="' + R(0.35 + 0.5 * Math.sin(ph * Math.PI)) + '"');
    }
    g += tx(340, 156, "layer " + Math.max(0, done) + " KV is final the moment layer " + Math.max(0, done) + " ends,", { s: 9.5, a: "middle", f: P.faint });
    g += tx(340, 170, "so it ships while layer " + Math.min(32, done + 1) + " is still computing", { s: 9.5, a: "middle", f: P.faint });
    g += meter(206, 200, 268, 12, arrived / LY, P.blue, "KV TRANSFERRED", Math.round(arrived / LY * 512) + " MiB / 512 MiB");
    g += meter(206, 238, 268, 12, done > arrived ? 0.72 : 0.05, P.blue, "LINK UTILISATION", done > arrived ? "72%" : "idle");
    // decode pool
    g += tx(516, 32, "DECODE POOL", { s: 10.5, f: P.green, w: 600, ls: "1" });
    g += tx(516, 48, "TP=2 x4 replicas, bandwidth bound", { s: 9.5, f: P.faint });
    for (var d = 0; d < 4; d++) {
      var dy = 62 + d * 34;
      g += rc(516, dy, 174, 28, "#1c2229", 'stroke="' + (decoding ? P.green : P.line) + '" stroke-width="0.9"');
      g += tx(526, dy + 18, "replica " + d, { s: 9.5, f: decoding ? P.green : P.line });
      g += rc(596, dy + 8, 84, 12, "#141a1f");
      g += rc(596, dy + 8, 84 * clamp(arrived / LY - d * 0.05, 0, 1), 12, P.green, 'opacity="0.8"');
    }
    if (decoding) for (var t2 = 0; t2 < 6; t2++) g += rc(516 + t2 * 22, 208, 18, 14, P.green, 'opacity="' + R(0.3 + 0.7 * ((f + t2) % 6) / 6) + '"');
    g += tx(516, 240, decoding ? "tokens streaming, TPOT undisturbed" : "waiting on KV", { s: 9.5, f: decoding ? P.green : P.line });
    g += rc(30, 284, 660, 62, "#12181d", 'stroke="' + P.line + '"');
    g += tx(44, 304, "DECOUPLED", { s: 9.5, f: P.green, ls: "1" });
    g += tx(150, 304, "parallelism degree, batch policy, hardware generation, both SLOs", { s: 10, f: P.dim });
    g += tx(44, 330, "NEWLY YOURS", { s: 9.5, f: P.pink, ls: "1" });
    g += tx(150, 330, "routing, KV ownership, failure of a node holding live state", { s: 10, f: P.dim });
    var cap;
    if (f < 12) cap = "The request lands in the prefill pool, which is configured for exactly one thing: turning a long prompt into KV as fast as possible.";
    else if (f < 44) cap = "Transfer overlaps compute. Layer <em>l</em>'s KV is immutable as soon as layer <em>l</em> is done, so 512 MiB moves behind the remaining layers.";
    else cap = "Decode begins on a machine that never saw a prefill. <b>A prompt surge can no longer perturb anyone's inter-token latency.</b>";
    return [sv(g, 720, 360), cap];
  });

  /* =========================================================
     FIGURE 11 - four parallelism strategies
     ========================================================= */
  var F11 = [
    { n: "DATA PARALLEL REPLICAS", c: P.green, lines: ["full weights on every GPU", "no collectives at all", "scales concurrency, not latency", "KV capacity limited per replica"] },
    { n: "TENSOR PARALLEL", c: P.blue, lines: ["each matrix sharded across GPUs", "two all-reduces per layer", "the only way to speed up one token", "small messages - needs NVLink"] },
    { n: "PIPELINE PARALLEL", c: P.purple, lines: ["layer ranges per GPU", "one activation per stage boundary", "tolerates slow links", "adds latency per stage"] },
    { n: "EXPERT PARALLEL", c: P.amber, lines: ["experts spread across GPUs", "all-to-all token routing", "big capacity per byte of HBM", "load depends on the data"] }
  ];
  reg("fig-parallel", 72, function (f) {
    var st = Math.min(3, Math.floor(f / 18)), lf = f % 18;
    var m = F11[st];
    var g = rc(0, 0, 720, 360, P.bg);
    g += tx(30, 34, m.n, { s: 12, f: m.c, w: 600, ls: "1.5" });
    for (var i = 0; i < 4; i++) {
      g += tx(440, 62 + i * 22, "-", { s: 11, f: P.line });
      g += tx(456, 62 + i * 22, m.lines[i], { s: 10.5, f: P.dim });
    }
    for (var t = 0; t < 4; t++) {
      var on = t === st;
      g += rc(30 + t * 96, 320, 88, 3, on ? m.c : "#212a30");
      g += tx(30 + t * 96, 340, ["replicas", "tensor", "pipeline", "expert"][t], { s: 9, f: on ? m.c : P.line });
    }
    var gx = [60, 190, 60, 190], gy = [92, 92, 206, 206];
    for (var k = 0; k < 4; k++) g += rc(gx[k], gy[k], 108, 76, "#141b21", 'stroke="' + P.line + '" stroke-width="0.9"') + tx(gx[k] + 6, gy[k] + 16, "GPU " + k, { s: 9, f: P.line });
    var pr = S(lf, 1, 15);
    if (st === 0) {
      for (var a = 0; a < 4; a++) {
        g += rc(gx[a] + 12, gy[a] + 26, 84, 40, m.c, 'opacity="0.28"');
        g += tx(gx[a] + 54, gy[a] + 51, "all weights", { s: 9.5, a: "middle", f: m.c });
        var rq = (pr * 4 + a) % 1;
        g += '<circle cx="' + R(gx[a] + 12 + rq * 84) + '" cy="' + R(gy[a] + 70) + '" r="4" fill="' + m.c + '"/>';
      }
      g += tx(60, 300, "four independent request streams, zero communication", { s: 10, f: P.faint });
    } else if (st === 1) {
      for (var b = 0; b < 4; b++) {
        g += rc(gx[b] + 12, gy[b] + 26, 84, 40, m.c, 'opacity="0.28"');
        g += tx(gx[b] + 54, gy[b] + 51, "shard " + b + " of W", { s: 9.5, a: "middle", f: m.c });
      }
      var cx = 174, cy = 168;
      var ring = E(clamp(pr * 2, 0, 1));
      for (var c2 = 0; c2 < 4; c2++) {
        var sx = gx[c2] + 54, sy = gy[c2] + 38;
        g += pth("M" + sx + " " + sy + " L" + R(lerp(sx, cx, ring)) + " " + R(lerp(sy, cy, ring)), m.c, 1.4, "none", 'opacity="0.8"');
      }
      if (pr > 0.5) { g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R(6 + 10 * S(pr, 0.5, 1)) + '" fill="none" stroke="' + m.c + '" stroke-width="1.4" opacity="' + R(1 - S(pr, 0.5, 1)) + '"/>'; }
      for (var lb = 0; lb < 4; lb++) g += tx(gx[lb] + 6, gy[lb] + 16, "GPU " + lb, { s: 9, f: P.line });
      g += rc(cx - 33, cy - 8, 66, 14, P.bg);
      g += tx(cx, cy + 4, "all-reduce", { s: 9.5, a: "middle", f: m.c, w: 600 });
      g += tx(60, 300, "twice per layer, 64 times per token, a few kilobytes each time", { s: 10, f: P.faint });
    } else if (st === 2) {
      for (var d = 0; d < 4; d++) {
        g += rc(gx[d] + 12, gy[d] + 26, 84, 40, m.c, 'opacity="0.28"');
        g += tx(gx[d] + 54, gy[d] + 51, "layers " + (d * 8) + "-" + (d * 8 + 7), { s: 9.5, a: "middle", f: m.c });
      }
      var order = [0, 1, 2, 3], seg = clamp(pr * 3, 0, 3), si = Math.min(2, Math.floor(seg)), sp = seg - si;
      var ax = gx[order[si]] + 54, ay = gy[order[si]] + 46, bx = gx[order[si + 1]] + 54, by = gy[order[si + 1]] + 46;
      g += '<circle cx="' + R(lerp(ax, bx, sp)) + '" cy="' + R(lerp(ay, by, sp)) + '" r="5" fill="' + m.c + '"/>';
      g += tx(60, 300, "one activation tensor crosses each boundary - cheap, and it tolerates a slow link", { s: 10, f: P.faint });
    } else {
      var loads = [0.9, 0.25, 0.55, 0.15];
      for (var e2 = 0; e2 < 4; e2++) {
        g += rc(gx[e2] + 12, gy[e2] + 26, 84, 40, m.c, 'opacity="0.22"');
        g += tx(gx[e2] + 54, gy[e2] + 44, "experts " + (e2 * 2) + "," + (e2 * 2 + 1), { s: 9.5, a: "middle", f: m.c });
        g += rc(gx[e2] + 12, gy[e2] + 52, 84 * loads[e2] * E(clamp(pr * 1.6, 0, 1)), 8, loads[e2] > 0.7 ? P.pink : m.c);
      }
      g += tx(330, 250, "all-to-all runs at the speed of the busiest expert", { s: 10, f: P.pink });
      g += tx(60, 300, "routing is data-dependent, so device load is decided by the batch, not the config", { s: 10, f: P.faint });
    }
    return [sv(g, 720, 360), "<b>" + m.n.toLowerCase() + ".</b> " + m.lines.join(" &middot; ")];
  }, 105);
})();
