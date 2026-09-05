/* Figures 11–15 + boot — requires figures.js */
(function () {
  'use strict';
  if (!window.AGM) { if (window.console) console.error('figures3.js loaded before figures.js'); return; }
  var G = window.AGM;
  var C = G.C, reg = G.reg, R = G.R, L = G.L, P = G.P, CIR = G.CIR, T = G.T, ARR = G.ARR,
    title = G.title, WRAP = G.WRAP, el = G.el, clamp = G.clamp, lerp = G.lerp, ease = G.ease,
    eout = G.eout, r2 = G.r2, seg = G.seg, fmt = G.fmt;

  /* =========================================================
     FIGURE 11 — retrieval scoring lab
     ========================================================= */
  (function () {
    var W = 1000, H = 560;
    var MEM = [
      { n: 'project-x deploys via GitHub Actions', sem: 0.92, rec: 0.95, imp: 0.90, tag: '' },
      { n: 'project-x deploys via Jenkins  [2025]', sem: 0.91, rec: 0.10, imp: 0.80, tag: 'stale' },
      { n: 'workflow file: .github/deploy-staging.yml', sem: 0.88, rec: 0.90, imp: 0.85, tag: '' },
      { n: 'deployments go through GitHub Actions', sem: 0.90, rec: 0.93, imp: 0.86, tag: 'near-duplicate of #1' },
      { n: 'staging requires OAuth scope read:user', sem: 0.62, rec: 0.88, imp: 0.96, tag: '' },
      { n: 'production deploys need a second approval', sem: 0.58, rec: 0.66, imp: 0.55, tag: '' },
      { n: 'project-y deploys via Cloud Build', sem: 0.55, rec: 0.80, imp: 0.30, tag: 'wrong entity' },
      { n: 'the user prefers long-form writing', sem: 0.05, rec: 0.70, imp: 0.40, tag: '' }
    ];

    function scores(a, b, g, mmr) {
      var tot = Math.max(a + b + g, 0.0001);
      var arr = [];
      for (var i = 0; i < MEM.length; i++) {
        arr.push({ i: i, s: (a * MEM[i].sem + b * MEM[i].rec + g * MEM[i].imp) / tot, pen: 0 });
      }
      arr.sort(function (x, y) { return y.s - x.s; });
      if (mmr) {
        var seen = [];
        for (var k = 0; k < arr.length; k++) {
          var m = arr[k].i;
          for (var j = 0; j < seen.length; j++) {
            var simPair = (m === 3 && seen[j] === 0) || (m === 0 && seen[j] === 3) ? 0.96 : 0;
            if (simPair > 0.9) { arr[k].pen = 0.45 * simPair; arr[k].s -= arr[k].pen; }
          }
          seen.push(m);
        }
        arr.sort(function (x, y) { return y.s - x.s; });
      }
      return arr;
    }

    reg('fig-ranking', {
      w: W, h: H, dur: 1150, hold: 850,
      params: { a: 0.60, b: 0.25, g: 0.30 },
      stages: [
        { t: 'The pool and the query', c: 'Eight memories, three observable features each. The query is "how do we deploy project-x to staging?"' },
        { t: 'Semantic similarity alone', c: 'Rank by cosine alone and the answer is nearly right — and the second-ranked record is a stale fact from 2025 that scores 0.91 because it is about exactly the same topic.' },
        { t: 'Why that happens', c: 'Similarity measures aboutness, not truth or currency. Two assertions in the same slot with different objects are near neighbours by construction.' },
        { t: 'Add recency', c: 'A decayed time signal pushes the 2025 record down without needing to know it is wrong. Cheap, and it fixes the most common failure.' },
        { t: 'Add importance', c: 'A stored significance score lifts the scope requirement — moderately on-topic, but the thing that actually breaks the deploy if you miss it.' },
        { t: 'It is a log-odds', c: 'The weighted sum is not an arbitrary hack. Under conditional independence it is exactly the naive-Bayes posterior log-odds, and the weights are per-feature calibration constants.' },
        { t: 'Penalise redundancy', c: 'Two records saying the same thing occupy two of your k slots for one fact\u2019s worth of information. A marginal-relevance penalty drops the second.' },
        { t: 'Threshold, not top-k', c: 'Because the score is a log-odds it can be thresholded. Always returning k means returning k irrelevant records when nothing relevant exists — and abstention becomes impossible.' }
      ],
      controls: function (panel, st, render) {
        var ids = [['#rank-alpha', '#rank-alpha-out', 'a'], ['#rank-beta', '#rank-beta-out', 'b'], ['#rank-gamma', '#rank-gamma-out', 'g']];
        for (var i = 0; i < ids.length; i++) {
          (function (spec) {
            var sl = panel.querySelector(spec[0]), o = panel.querySelector(spec[1]);
            if (!sl) return;
            sl.addEventListener('input', function () {
              st.params[spec[2]] = parseInt(sl.value, 10) / 100;
              o.textContent = st.params[spec[2]].toFixed(2);
              render();
            });
          })(ids[i]);
        }
      },
      draw: function (i, p, st) {
        var s = '', view = [0, 0, W, H];
        var a = clamp(st.params.a, 0, 1), b = clamp(st.params.b, 0, 1), g = clamp(st.params.g, 0, 1);
        var useA = a, useB = b, useG = g;
        if (i <= 2) { useA = a; useB = 0; useG = 0; }
        else if (i === 3) { useA = a; useB = lerp(0, b, ease(p)); useG = 0; }
        else if (i === 4) { useA = a; useB = b; useG = lerp(0, g, ease(p)); }
        var mmr = i >= 6;
        var ranked = scores(useA, useB, useG, mmr);

        s += title(56, 40, 'QUERY:  "how do we deploy project-x to staging?"', { size: 11.5 });
        var wlab = 'α=' + useA.toFixed(2) + '   β=' + useB.toFixed(2) + '   γ=' + useG.toFixed(2) + (mmr ? '   + MMR' : '');
        s += T(944, 40, wlab, { size: 11, fill: C.green, anchor: 'end', weight: 600 });

        /* feature table on the left */
        s += T(56, 70, 'MEMORY', { size: 9, fill: C.faint, ls: '0.13em' });
        s += T(392, 70, 'sem', { size: 9, fill: C.blue, ls: '0.1em', anchor: 'end' });
        s += T(436, 70, 'rec', { size: 9, fill: C.amber, ls: '0.1em', anchor: 'end' });
        s += T(480, 70, 'imp', { size: 9, fill: C.violet, ls: '0.1em', anchor: 'end' });
        for (var k = 0; k < MEM.length; k++) {
          var y = 84 + k * 46;
          s += R(56, y, 432, 38, { rx: 2, fill: C.wash, stroke: C.line2, op: 0.9 });
          s += WRAP(68, y + 17, MEM[k].n, 300, { size: 9.6, fill: C.ink });
          if (MEM[k].tag) s += T(68, y + 31, MEM[k].tag, { size: 8.4, fill: MEM[k].tag === 'stale' ? C.rose : C.faint });
          s += T(392, y + 22, MEM[k].sem.toFixed(2), { size: 9.5, fill: C.blue, anchor: 'end' });
          s += T(436, y + 22, MEM[k].rec.toFixed(2), { size: 9.5, fill: useB > 0.01 ? C.amber : C.faint, anchor: 'end' });
          s += T(480, y + 22, MEM[k].imp.toFixed(2), { size: 9.5, fill: useG > 0.01 ? C.violet : C.faint, anchor: 'end' });
        }

        /* ranking on the right */
        s += T(520, 70, 'RANKED', { size: 9, fill: C.faint, ls: '0.13em' });
        s += T(944, 70, 'score', { size: 9, fill: C.faint, ls: '0.1em', anchor: 'end' });
        var thresh = 0.55;
        for (var r = 0; r < ranked.length; r++) {
          var y2 = 84 + r * 46, m = ranked[r].i;
          var above = ranked[r].s >= thresh;
          var cut = (i === 7) && !above;
          var col = cut ? C.rose : (r < 3 ? C.green : C.line2);
          var dropped = mmr && ranked[r].pen > 0;
          if (dropped) col = C.amber;
          s += R(520, y2, 424, 38, { rx: 2, fill: cut ? 'rgba(232,116,106,0.06)' : C.wash, stroke: col, sw: (r < 3 && !cut) ? 1.3 : 1, op: cut ? 0.6 : 1 });
          s += T(532, y2 + 22, String(r + 1), { size: 11, fill: col === C.line2 ? C.dim : col, weight: 700 });
          s += WRAP(554, y2 + 17, MEM[m].n, 300, { size: 9.6, fill: cut ? C.faint : C.ink });
          if (dropped) s += T(554, y2 + 31, 'redundancy penalty −' + ranked[r].pen.toFixed(2), { size: 8.4, fill: C.amber });
          else if (MEM[m].tag === 'stale' && i <= 2) s += T(554, y2 + 31, 'ranked #' + (r + 1) + ' and it is wrong', { size: 8.4, fill: C.rose });
          var bw = 60 * clamp(ranked[r].s, 0, 1);
          s += R(864, y2 + 12, 60, 14, { fill: '#0b0f12', stroke: C.line2 });
          s += R(865, y2 + 13, Math.max(0, bw - 2), 12, { fill: cut ? C.rose : C.green, op: 0.5 });
          s += T(944, y2 + 8, ranked[r].s.toFixed(3), { size: 9.5, fill: cut ? C.rose : C.ink, anchor: 'end', weight: 600 });
        }

        if (i === 2) {
          var f2 = eout(p);
          var idx = -1;
          for (var q = 0; q < ranked.length; q++) if (ranked[q].i === 1) idx = q;
          var yy = 84 + idx * 46;
          s += R(516, yy - 4, 432, 46, { rx: 3, stroke: C.rose, sw: 1.6, op: f2, dash: '4 4' });
        }

        if (i === 5) {
          var f5 = eout(p);
          s += R(56, 452, 888, 88, { rx: 3, fill: C.wash, stroke: C.violet, sw: 1.3, op: f5 });
          s += T(72, 478, 'log [ P(useful | f) / P(¬useful | f) ]   =   log-prior   +   Σⱼ log [ P(fⱼ | useful) / P(fⱼ | ¬useful) ]',
            { size: 12.5, fill: C.violet, op: f5 });
          s += T(72, 504, 'a constant plus a sum of per-feature log-likelihood ratios — so the weights are calibration constants,', { size: 10.5, fill: C.ink, op: f5 });
          s += T(72, 522, 'the features should be roughly independent, and the score is meaningfully thresholdable.', { size: 10.5, fill: C.ink, op: f5 });
        }
        if (i === 7) {
          var f7 = eout(p);
          var ty = 84 + 46 * 3 - 5;
          s += L(516, ty, 948, ty, { stroke: C.rose, sw: 1.6, dash: '5 4', op: f7 });
          s += R(56, 466, 888, 54, { rx: 3, fill: C.wash, stroke: C.rose, sw: 1.2, op: f7 });
          s += T(72, 492, 'threshold  S ≥ ' + thresh.toFixed(2), { size: 12, fill: C.rose, weight: 600, op: f7 });
          s += T(240, 492, 'below the line: returned anyway by top-k, withheld by a threshold — which is what makes abstention possible',
            { size: 10.5, fill: C.ink, op: f7 });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 12 — the memory hierarchy and paging
     ========================================================= */
  (function () {
    var W = 1000, H = 560;
    var TIERS = [
      { n: 'CURRENT CONTEXT', sub: 'instructions · tools · plan · turns · retrieved memories', cap: '32k tokens', lat: 'prefill', col: C.blue, an: 'registers + L1' },
      { n: 'SESSION STATE', sub: 'rolling summary · scratchpad · open questions', cap: '~40k tokens', lat: 'string concat', col: C.teal, an: 'RAM' },
      { n: 'LONG-TERM STORE', sub: 'facts · episodes · skills · entity graph', cap: 'millions', lat: 'retrieval call', col: C.green, an: 'SSD' },
      { n: 'ARCHIVE', sub: 'raw transcripts · logs · artifacts', cap: 'unbounded', lat: 'explicit search', col: C.violet, an: 'cold storage' }
    ];

    reg('fig-hierarchy', {
      w: W, h: H, dur: 1250, hold: 800,
      stages: [
        { t: 'Four tiers', c: 'Small and expensive at the top, large and cheap at the bottom. The same shape as a CPU memory hierarchy, for the same reason.' },
        { t: 'The context fills', c: 'Steps accumulate. Tool output, turns, retrieved memories — nothing has been thrown away yet, and the window is finite.' },
        { t: 'Memory pressure', c: 'At some occupancy the system raises an alert. MemGPT does this literally: a system message tells the model the window is filling so it can act before truncation does it blindly.' },
        { t: 'Write out', c: 'The model calls a memory function to flush what it wants to keep. This is the crucial inversion — the model manages its own memory through tool calls rather than being managed.' },
        { t: 'Evict to session state', c: 'Older turns leave the window and land in the session tier as a summary. They are not gone; they are one hop away.' },
        { t: 'Consolidate downward', c: 'Session material that proves durable gets promoted into long-term storage as facts, episodes, and skills with provenance.' },
        { t: 'Raw material to the archive', c: 'And the unprocessed transcript falls to cold storage. Cheap, and the only tier from which you can re-derive everything above when your extraction improves.' },
        { t: 'Page back in', c: 'A new query arrives that needs something evicted twenty steps ago. Retrieval pulls it up through the tiers into the window — the illusion of a much larger context.' },
        { t: 'The cost ladder', c: 'Each hop down is cheaper to hold and more expensive to reach. That asymmetry is what makes placement a real decision rather than an implementation detail.' },
        { t: 'Eviction is the policy', c: 'As in a cache, the intelligence is not in the storage. It is in choosing what to page out — which is choosing what the agent will find hard to think about next.' }
      ],
      draw: function (i, p) {
        var s = '', view = [0, 0, W, H];
        s += title(56, 40, 'VIRTUAL CONTEXT MANAGEMENT', { size: 12 });

        var ys = [64, 178, 292, 406];
        var hs = [96, 96, 96, 96];
        for (var t = 0; t < 4; t++) {
          var wdt = 520 - t * 0;
          var col = TIERS[t].col;
          var active = (i === 4 && t <= 1) || (i === 5 && t >= 1 && t <= 2) || (i === 6 && t === 3) || (i === 7) || (i === 0);
          s += R(56, ys[t], 560, hs[t], { rx: 3, fill: C.wash, stroke: active ? col : C.line2, sw: active ? 1.4 : 1 });
          s += R(56, ys[t], 4, hs[t], { fill: col, op: 0.9 });
          s += T(76, ys[t] + 28, TIERS[t].n, { size: 13, weight: 700, fill: col, ls: '0.1em', disp: true });
          s += T(76, ys[t] + 48, TIERS[t].sub, { size: 9.6, fill: C.dim });
          s += T(600, ys[t] + 28, TIERS[t].cap, { size: 10, fill: C.ink, anchor: 'end' });
          s += T(600, ys[t] + 46, TIERS[t].lat, { size: 9, fill: C.faint, anchor: 'end' });
          s += T(76, ys[t] + 78, '≈ ' + TIERS[t].an, { size: 9, fill: C.faint });
        }

        /* occupancy meter for the context tier */
        var occ = 0.36;
        if (i === 1) occ = lerp(0.36, 0.88, ease(p));
        else if (i === 2) occ = 0.9;
        else if (i === 3) occ = 0.9;
        else if (i === 4) occ = lerp(0.9, 0.52, ease(p));
        else if (i >= 5) occ = 0.52;
        if (i === 7) occ = lerp(0.52, 0.66, ease(p));
        s += R(240, ys[0] + 62, 300, 18, { fill: '#0b0f12', stroke: C.line2 });
        s += R(241, ys[0] + 63, 298 * occ, 16, { fill: occ > 0.82 ? C.rose : C.blue, op: 0.55 });
        s += L(241 + 298 * 0.85, ys[0] + 60, 241 + 298 * 0.85, ys[0] + 82, { stroke: C.amber, sw: 1.3 });
        s += T(241 + 298 * 0.85 + 4, ys[0] + 58, 'pressure', { size: 8.4, fill: C.amber });
        s += T(548, ys[0] + 76, Math.round(occ * 100) + '%', { size: 10, fill: occ > 0.82 ? C.rose : C.blue, weight: 600 });

        if (i === 2) {
          var f2 = eout(p);
          s += R(636, ys[0], 308, 96, { rx: 3, fill: 'rgba(232,180,90,0.08)', stroke: C.amber, sw: 1.4, op: f2 });
          s += T(652, ys[0] + 26, 'SYSTEM ALERT', { size: 10, fill: C.amber, ls: '0.13em', weight: 600, op: f2 });
          s += WRAP(652, ys[0] + 50, 'memory pressure — main context is 90% full; write anything you need to keep before it is truncated', 280, { size: 10, fill: C.ink, op: f2 });
        }
        if (i === 3) {
          var f3 = eout(p);
          s += R(636, ys[0], 308, 96, { rx: 3, fill: C.wash, stroke: C.green, sw: 1.4, op: f3 });
          s += T(652, ys[0] + 26, 'MODEL CALLS', { size: 10, fill: C.green, ls: '0.13em', weight: 600, op: f3 });
          s += T(652, ys[0] + 50, 'memory.write(', { size: 10.5, fill: C.ink, op: f3 });
          s += T(652, ys[0] + 68, '  "cluster-A needs a CUDA module load")', { size: 10.5, fill: C.green, op: f3 });
          s += T(652, ys[0] + 86, 'the model manages its own memory', { size: 9, fill: C.faint, op: f3 });
        }

        /* paging arrows */
        function pageArrow(from, to, col, op, label, dir) {
          var x = dir > 0 ? 300 : 380;
          var y1 = ys[from] + hs[from], y2 = ys[to];
          if (dir < 0) { y1 = ys[from]; y2 = ys[to] + hs[to]; }
          var out = ARR(x, y1 + 3, x, y2 - 3, { stroke: col, sw: 1.8, op: op, head: 8 });
          out += T(x + 12, (y1 + y2) / 2 + 4, label, { size: 9.5, fill: col, op: op });
          return out;
        }
        if (i === 4) s += pageArrow(0, 1, C.teal, eout(p), 'evict + summarise', 1);
        if (i === 5) s += pageArrow(1, 2, C.green, eout(p), 'consolidate', 1);
        if (i === 6) s += pageArrow(2, 3, C.violet, eout(p), 'retain raw', 1);
        if (i === 7) {
          var f7 = eout(p);
          s += pageArrow(2, 0, C.green, f7, 'page in on retrieval', -1);
          s += R(636, ys[2], 308, 96, { rx: 3, fill: C.wash, stroke: C.green, sw: 1.3, op: f7 });
          s += T(652, ys[2] + 26, 'NEW QUERY', { size: 10, fill: C.green, ls: '0.13em', weight: 600, op: f7 });
          s += WRAP(652, ys[2] + 50, '"why did the build fail last month?" — the answer left the window twenty steps ago and comes back in 340 tokens', 280, { size: 10, fill: C.ink, op: f7 });
        }

        if (i === 8) {
          var f8 = eout(p);
          s += R(636, 64, 308, 438, { rx: 3, fill: '#0b0f12', stroke: C.line2, op: f8 });
          s += T(652, 92, 'HOLD COST  vs  REACH COST', { size: 9.5, fill: C.dim, ls: '0.12em', op: f8 });
          for (var z = 0; z < 4; z++) {
            var yz = 122 + z * 96;
            s += T(652, yz, TIERS[z].n, { size: 10, fill: TIERS[z].col, weight: 600, op: f8 });
            s += T(652, yz + 20, 'hold', { size: 9, fill: C.faint, op: f8 });
            s += R(700, yz + 10, 220, 12, { fill: '#0b0f12', stroke: C.line2, op: f8 });
            s += R(701, yz + 11, 218 * Math.pow(0.28, z) * f8, 10, { fill: C.rose, op: 0.55 });
            s += T(652, yz + 44, 'reach', { size: 9, fill: C.faint, op: f8 });
            s += R(700, yz + 34, 220, 12, { fill: '#0b0f12', stroke: C.line2, op: f8 });
            s += R(701, yz + 35, 218 * (0.06 + z * 0.31) * f8, 10, { fill: C.blue, op: 0.55 });
          }
          s += WRAP(652, 486, 'cheap to hold is expensive to reach — which makes placement a decision', 280, { size: 9.5, fill: C.faint, op: f8 });
        }
        if (i === 9) {
          var f9 = eout(p);
          s += R(636, 64, 308, 438, { rx: 3, fill: C.wash, stroke: C.amber, sw: 1.3, op: f9 });
          s += WRAP(660, 140, 'The storage is not where the intelligence is.', 268, { size: 15, fill: C.amber, op: f9 });
          s += WRAP(660, 220, 'Choosing what to page out is choosing what the agent will find hard to think about next — exactly as in a cache, and with exactly the same consequence when you get it wrong.', 268, { size: 11.5, fill: C.ink, op: f9 });
          s += WRAP(660, 400, 'keep the archive: it is the only tier you can re-derive the others from', 268, { size: 10, fill: C.violet, op: f9 });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 13 — the poisoning fixed point
     ========================================================= */
  (function () {
    var W = 1000, H = 560;
    var gx = 470, gy = 92, gw = 470, gh = 296;

    function eStar(rho, phi, eps) {
      var k = rho - 1, c = (1 - phi) * eps;
      if (Math.abs(k) < 1e-6) return eps;
      var Bq = 1 - phi * rho - c * k;
      var disc = Bq * Bq + 4 * k * c;
      if (disc < 0) disc = 0;
      var e = (-Bq + Math.sqrt(disc)) / (2 * k);
      if (!isFinite(e) || e < 0 || e > 1) {
        var e2 = (-Bq - Math.sqrt(disc)) / (2 * k);
        e = (isFinite(e2) && e2 >= 0 && e2 <= 1) ? e2 : clamp(e, 0, 1);
      }
      return clamp(e, 0, 1);
    }
    function xOf(rho) { return gx + (Math.log(rho) - Math.log(0.06)) / (Math.log(12) - Math.log(0.06)) * gw; }
    function yOf(e) { return gy + gh - clamp(e, 0, 1) * gh; }

    reg('fig-poison', {
      w: W, h: H, dur: 1250, hold: 800,
      params: { phi: 0.80, eps: 0.15 },
      stages: [
        { t: 'The closed loop', c: 'The agent produces outputs, a gate decides which become records, and later inputs retrieve them. Unlike a document corpus, this store is downstream of the agent\u2019s own behaviour.' },
        { t: 'Experience-following', c: 'When a task closely matches a stored record, the output closely matches that record\u2019s output. φ is how strongly that happens — a property of the model, not of your system.' },
        { t: 'The write gate', c: 'The gate accepts correct episodes with probability β and incorrect ones with probability α. Their ratio ρ = α/β is the only number that describes how discriminating it is.' },
        { t: 'What is in the store', c: 'At steady state the wrong fraction of records is w(e) = ρe / (ρe + 1 − e). At ρ = 1 that is just e: the store mirrors the agent exactly.' },
        { t: 'The fixed point', c: 'The agent\u2019s error is a mixture of following memory and reasoning fresh, and memory\u2019s quality depends on the agent\u2019s error. Solving the loop gives a quadratic.' },
        { t: 'ρ = 1 — no gate', c: 'Storing everything leaves the error rate exactly where it started, regardless of φ. You pay storage, dilution and retrieval cost for no accuracy change.' },
        { t: 'ρ < 1 — a real gate', c: 'Filter better than chance and the store becomes cleaner than the agent that wrote it, so following it drags the error down below the base rate.' },
        { t: 'ρ > 1 — inverted', c: 'And a gate that preferentially keeps confident-but-wrong outputs runs the same machinery in reverse. Nothing about the retrieval changed.' },
        { t: 'φ is a gain term', c: 'Experience-following is neither virtue nor vice. It multiplies your write policy in whichever direction that policy points — which is why selective addition beats any retrieval improvement.' }
      ],
      controls: function (panel, st, render) {
        var s1 = panel.querySelector('#poison-phi'), o1 = panel.querySelector('#poison-phi-out');
        var s2 = panel.querySelector('#poison-eps'), o2 = panel.querySelector('#poison-eps-out');
        if (s1) s1.addEventListener('input', function () { st.params.phi = parseInt(s1.value, 10) / 100; o1.textContent = st.params.phi.toFixed(2); render(); });
        if (s2) s2.addEventListener('input', function () { st.params.eps = parseInt(s2.value, 10) / 100; o2.textContent = st.params.eps.toFixed(2); render(); });
      },
      draw: function (i, p, st) {
        var s = '', view = [0, 0, W, H];
        var phi = clamp(st.params.phi, 0, 1), eps = clamp(st.params.eps, 0.01, 0.9);

        s += title(56, 40, 'A TOY MODEL OF THE COMPOUNDING LOOP', { size: 12 });

        /* left: the loop diagram */
        var nodes = [
          { x: 150, y: 110, w: 190, h: 46, n: 'agent output', c: C.blue },
          { x: 150, y: 196, w: 190, h: 46, n: 'write gate  α, β', c: i >= 2 ? C.amber : C.line2 },
          { x: 150, y: 282, w: 190, h: 46, n: 'memory store', c: i >= 3 ? C.green : C.line2 },
          { x: 150, y: 368, w: 190, h: 46, n: 'retrieved as precedent', c: i >= 1 ? C.violet : C.line2 }
        ];
        for (var n = 0; n < 4; n++) {
          var nd = nodes[n];
          s += R(nd.x, nd.y, nd.w, nd.h, { rx: 3, fill: C.wash, stroke: nd.c, sw: 1.2 });
          s += T(nd.x + nd.w / 2, nd.y + 28, nd.n, { size: 11, fill: C.ink, anchor: 'middle', weight: 500 });
          if (n < 3) s += ARR(nd.x + nd.w / 2, nd.y + nd.h + 2, nodes[n + 1].x + nodes[n + 1].w / 2, nodes[n + 1].y - 2, { stroke: nd.c, sw: 1.4, op: 0.8 });
        }
        /* feedback edge */
        var fbOp = i >= 1 ? 1 : 0.3;
        s += P('M' + 150 + ' ' + 391 + ' L' + 96 + ' ' + 391 + ' L' + 96 + ' ' + 133 + ' L' + 146 + ' ' + 133,
          { stroke: C.violet, sw: 1.5, op: fbOp });
        s += ARR(120, 133, 146, 133, { stroke: C.violet, sw: 1.5, op: fbOp, head: 7 });
        if (i >= 1) s += T(88, 262, 'φ', { size: 18, fill: C.violet, weight: 700, anchor: 'middle', op: i === 1 ? eout(p) : 1 });
        if (i === 1) s += WRAP(150, 442, 'φ = probability the output mirrors the retrieved record', 200, { size: 10, fill: C.violet, op: eout(p) });
        if (i === 2) s += WRAP(150, 442, 'ρ = α / β — one number for how well the gate separates right from wrong', 200, { size: 10, fill: C.amber, op: eout(p) });
        if (i === 3) s += WRAP(150, 442, 'w(e) = ρe / (ρe + 1 − e)', 200, { size: 12, fill: C.green, op: eout(p) });

        /* right: the curve */
        if (i >= 4) {
          var f = i === 4 ? eout(p) : 1;
          s += R(gx, gy, gw, gh, { rx: 2, fill: '#0b0f12', stroke: C.line2, op: f });
          for (var gg = 0; gg <= 4; gg++) {
            var yy = gy + gh * gg / 4;
            s += L(gx, yy, gx + gw, yy, { stroke: C.line, op: 0.7 * f });
            s += T(gx - 8, yy + 3.5, (1 - gg / 4).toFixed(2), { size: 9, fill: C.faint, anchor: 'end', op: f });
          }
          var rhoTicks = [0.06, 0.125, 0.25, 0.5, 1, 2, 4, 8];
          for (var rt = 0; rt < rhoTicks.length; rt++) {
            var xx = xOf(rhoTicks[rt]);
            s += L(xx, gy + gh, xx, gy + gh + 5, { stroke: C.line2, op: f });
            s += T(xx, gy + gh + 20, String(rhoTicks[rt]), { size: 8.6, fill: C.faint, anchor: 'middle', op: f });
          }
          s += T(gx + gw / 2, gy + gh + 42, 'gate leakage ratio  ρ = α / β   (log scale)', { size: 10, fill: C.faint, anchor: 'middle', op: f });
          s += T(gx - 8, gy - 12, 'steady-state error  e★', { size: 10, fill: C.dim, op: f });

          function curve(ph, upto) {
            var d = '', first = true;
            for (var t = 0; t <= 140; t++) {
              var rr = Math.exp(lerp(Math.log(0.06), Math.log(12), t / 140));
              if (t / 140 > upto) break;
              d += (first ? 'M' : 'L') + r2(xOf(rr)) + ' ' + r2(yOf(eStar(rr, ph, eps)));
              first = false;
            }
            return d;
          }
          var reveal = (i === 4) ? ease(p) : 1;
          /* reference curves */
          if (i >= 8) {
            var refs = [0.3, 0.6, 0.95];
            for (var rf = 0; rf < refs.length; rf++) {
              var op = eout(p) * 0.55;
              s += P(curve(refs[rf], 1), { stroke: C.dim, sw: 1.2, op: op, dash: '3 4' });
              s += T(xOf(9.5), yOf(eStar(9.5, refs[rf], eps)) - 6, 'φ=' + refs[rf], { size: 9, fill: C.dim, anchor: 'end', op: op });
            }
          }
          s += P(curve(phi, reveal), { stroke: C.amber, sw: 2.4, op: f });

          /* baseline */
          s += L(gx, yOf(eps), gx + gw, yOf(eps), { stroke: C.blue, sw: 1.2, dash: '4 4', op: 0.7 * f });
          s += T(gx + 8, yOf(eps) - 8, 'ε₀ = ' + eps.toFixed(2) + '  (no memory)', { size: 9.5, fill: C.blue, op: f });
          s += L(xOf(1), gy, xOf(1), gy + gh, { stroke: C.line2, dash: '3 5', op: 0.8 * f });

          /* markers */
          function marker(rho, col, lab, op) {
            var e = eStar(rho, phi, eps);
            var out = CIR(xOf(rho), yOf(e), 6, { fill: col, op: op });
            out += CIR(xOf(rho), yOf(e), 12, { stroke: col, sw: 1.2, op: op * 0.5 });
            out += T(xOf(rho) + (rho > 2 ? -14 : 14), yOf(e) - 12, lab + '  e★ = ' + e.toFixed(3),
              { size: 10.5, fill: col, weight: 600, anchor: rho > 2 ? 'end' : 'start', op: op });
            return out;
          }
          if (i === 5) s += marker(1, C.blue, 'ρ = 1', eout(p));
          if (i === 6) s += marker(0.25, C.green, 'ρ = 0.25', eout(p));
          if (i === 7) s += marker(4, C.rose, 'ρ = 4', eout(p));
          if (i === 8) { s += marker(0.25, C.green, 'ρ = 0.25', 1); s += marker(4, C.rose, 'ρ = 4', 1); }
        }

        if (i >= 4) {
          s += R(gx, 458, gw, 90, { rx: 3, fill: C.wash, stroke: C.line2 });
          s += T(gx + 16, 484, 'e  =  φ · w(e)  +  (1 − φ) · ε₀', { size: 13, fill: C.amber, weight: 600 });
          s += T(gx + 16, 508, 'k = ρ − 1,  c = (1 − φ)ε₀', { size: 10, fill: C.dim });
          s += T(gx + 16, 532, 'e★ = [ −(1 − φρ − ck) + √((1 − φρ − ck)² + 4kc) ] / 2k', { size: 10.5, fill: C.ink });
        }
        if (i === 8) {
          s += R(56, 458, 380, 90, { rx: 3, fill: C.wash, stroke: C.green, sw: 1.3, op: eout(p) });
          s += WRAP(72, 484, 'φ belongs to the model you were given. ρ belongs to the system you built. Only one of them is yours to set.', 352, { size: 11.5, fill: C.green, op: eout(p) });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 14 — the ablation ladder
     ========================================================= */
  (function () {
    var W = 1000, H = 520;
    var COND = [
      { n: 'no memory', v: 0.62, col: C.line2, d: 'parametric knowledge plus the current turn — the floor' },
      { n: 'random memories', v: 0.54, col: C.rose, d: 'same tokens, same format, irrelevant content' },
      { n: 'retrieved memories', v: 0.74, col: C.blue, d: 'the system you actually shipped' },
      { n: 'oracle memories', v: 0.86, col: C.green, d: 'the gold set, hand-labelled, same budget and format' },
      { n: 'full history', v: 0.79, col: C.violet, d: 'everything in context, budget permitting' }
    ];
    var bx = 250, by = 96, bw = 620, rowH = 62;

    reg('fig-ablation', {
      w: W, h: H, dur: 1200, hold: 800,
      stages: [
        { t: 'The naive comparison', c: 'With memory, 74%. Without, 62%. Twelve points — and on its own that number localises nothing at all.' },
        { t: 'Condition 1 — no memory', c: 'The floor. Whatever the model manages from its weights plus the current turn.' },
        { t: 'Condition 2 — random memories', c: 'Same token budget, same delimiters, irrelevant content. This lands *below* the floor, and the gap is the price of a bad retrieval.' },
        { t: 'Condition 3 — retrieved', c: 'Your system. Twelve points above the floor and twenty above random, which is the more honest comparison.' },
        { t: 'Condition 4 — oracle', c: 'The right memories, hand-picked, in the same format and budget. Anything between this and condition 3 is retrieval headroom.' },
        { t: 'Condition 5 — full history', c: 'Everything in context. Here it lands below oracle, which is direct evidence that curation beats capacity — and above it would have meant your representation is destroying information.' },
        { t: 'The four gaps', c: 'Each gap localises a different team\u2019s work: distraction cost, delivered lift, retrieval headroom, and compression loss.' },
        { t: 'The cheap control', c: 'Finally: re-ask the questions your system got right, with memory removed and everything else identical. Whatever it still gets right was never a memory win.' }
      ],
      draw: function (i, p) {
        var s = '', view = [0, 0, W, H];
        s += title(56, 40, 'ABLATION LADDER  ·  SAME TASK SET, FIVE CONDITIONS', { size: 12 });

        var shown = (i === 0) ? [0, 2] : (i >= 6 ? [0, 1, 2, 3, 4] : []);
        if (i >= 1 && i <= 5) { shown = []; for (var q = 0; q <= i - 1; q++) shown.push(q); }

        for (var k = 0; k < 5; k++) {
          var y = by + k * rowH;
          var on = shown.indexOf(k) >= 0;
          var animating = (i >= 1 && i <= 5 && k === i - 1);
          var op = animating ? eout(p) : (on ? 1 : 0.14);
          var wv = bw * COND[k].v * (animating ? ease(p) : 1);
          s += T(bx - 14, y + 22, COND[k].n, { size: 11.5, fill: on ? COND[k].col : C.faint, anchor: 'end', weight: 600, op: Math.max(op, 0.35) });
          s += T(bx - 14, y + 38, '(' + (k + 1) + ')', { size: 9, fill: C.faint, anchor: 'end', op: Math.max(op, 0.35) });
          s += R(bx, y, bw, 34, { fill: '#0b0f12', stroke: C.line2, op: Math.max(op, 0.3) });
          if (on) {
            s += R(bx + 1, y + 1, Math.max(0, wv - 2), 32, { fill: COND[k].col, op: 0.42 * op });
            s += T(bx + wv - 10, y + 23, Math.round(COND[k].v * 100) + '%', { size: 12, fill: C.ink, anchor: 'end', weight: 700, op: op });
            if (animating || i <= 5) s += T(bx + 8, y + 52, COND[k].d, { size: 9.4, fill: C.faint, op: op });
          }
        }

        /* baseline line */
        s += L(bx + bw * COND[0].v, by - 8, bx + bw * COND[0].v, by + 5 * rowH - 20, { stroke: C.dim, dash: '3 5', op: 0.6 });
        s += T(bx + bw * COND[0].v, by - 14, 'floor', { size: 9, fill: C.dim, anchor: 'middle' });

        if (i === 0) {
          var f0 = eout(p);
          s += R(bx, 400, bw, 76, { rx: 3, fill: C.wash, stroke: C.amber, sw: 1.2, op: f0 });
          s += T(bx + 16, 426, '74%  −  62%  =  +12 points', { size: 15, fill: C.amber, weight: 600, op: f0 });
          s += WRAP(bx + 16, 450, 'did memory cause it? which part of the pipeline earned it? would better retrieval help, or is the writer the problem? none of these are answerable from one number.', bw - 32, { size: 10, fill: C.dim, op: f0 });
        }

        if (i >= 6) {
          var f6 = i === 6 ? eout(p) : 1;
          var gaps = [
            { a: 0, b: 1, lab: 'distraction cost', v: COND[1].v - COND[0].v, col: C.rose },
            { a: 0, b: 2, lab: 'delivered lift', v: COND[2].v - COND[0].v, col: C.blue },
            { a: 2, b: 3, lab: 'retrieval headroom', v: COND[3].v - COND[2].v, col: C.green },
            { a: 3, b: 4, lab: 'compression loss', v: COND[4].v - COND[3].v, col: C.violet }
          ];
          for (var g = 0; g < gaps.length; g++) {
            var gp = gaps[g];
            var x1 = bx + bw * COND[gp.a].v, x2 = bx + bw * COND[gp.b].v;
            var yy = by + 12 + Math.max(gp.a, gp.b) * rowH;
            var op2 = f6 * clamp(p * 4 - g * 0.5, 0, 1);
            if (i > 6) op2 = 1;
            s += R(Math.min(x1, x2), yy - 8, Math.abs(x2 - x1), 26, { fill: gp.col, op: 0.2 * op2 });
            s += T((x1 + x2) / 2, yy + 34, gp.lab + '  ' + (gp.v >= 0 ? '+' : '') + Math.round(gp.v * 100),
              { size: 10, fill: gp.col, anchor: 'middle', weight: 600, op: op2 });
          }
          if (i === 6) {
            s += R(56, 426, 888, 68, { rx: 3, fill: C.wash, stroke: C.line2, op: f6 });
            s += T(72, 452, 'A₄ − A₁  =  (A₃ − A₁)  +  (A₄ − A₃)      ·      track A₂ − A₁ and A₅ − A₄ separately',
              { size: 12.5, fill: C.ink, op: f6 });
            s += T(72, 478, 'value of the right memories  =  delivered lift  +  retrieval headroom', { size: 10, fill: C.faint, op: f6 });
          }
        }

        if (i === 7) {
          var f7 = eout(p);
          s += R(56, 426, 888, 68, { rx: 3, fill: 'rgba(232,180,90,0.07)', stroke: C.amber, sw: 1.3, op: f7 });
          s += T(72, 452, 'CONTROL:  re-ask the questions it got right, with memory removed', { size: 12, fill: C.amber, weight: 600, op: f7 });
          s += T(72, 478, 'whatever it still answers correctly was never a memory win — it was parametric knowledge wearing a badge', { size: 10.5, fill: C.ink, op: f7 });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 15 — the whole machine
     ========================================================= */
  (function () {
    var W = 1000, H = 660;
    var BOX = [
      { id: 'env', x: 380, y: 26, w: 240, h: 40, n: 'USER / ENVIRONMENT', c: C.blue, sub: '' },
      { id: 'run', x: 380, y: 92, w: 240, h: 44, n: 'AGENT RUNTIME', c: C.blue, sub: 'observations, events' },
      { id: 'gate', x: 356, y: 162, w: 288, h: 48, n: 'MEMORY WRITER', c: C.amber, sub: 'salience · novelty · outcome gate · privacy' },
      { id: 'ep', x: 92, y: 246, w: 236, h: 60, n: 'EPISODIC', c: C.amber, sub: '(s, a, o, r, t) with outcomes' },
      { id: 'sem', x: 382, y: 246, w: 236, h: 60, n: 'SEMANTIC', c: C.green, sub: 'facts + provenance + validity' },
      { id: 'proc', x: 672, y: 246, w: 236, h: 60, n: 'PROCEDURAL', c: C.violet, sub: 'skills, runbooks, reflections' },
      { id: 'cons', x: 356, y: 340, w: 288, h: 46, n: 'CONSOLIDATION + MANAGE', c: C.green, sub: 'merge · supersede · expire · delete' },
      { id: 'ret', x: 300, y: 418, w: 400, h: 52, n: 'RETRIEVAL LAYER', c: C.violet, sub: 'query construction · semantic · temporal · entity · graph' },
      { id: 'rank', x: 356, y: 500, w: 288, h: 42, n: 'RANK + THRESHOLD', c: C.violet, sub: 'multi-signal · dedupe · abstain' },
      { id: 'ctx', x: 300, y: 572, w: 400, h: 52, n: 'CONTEXT ENGINEER', c: C.teal, sub: 'select under budget · order · compress · label' }
    ];
    function byId(id) { for (var i = 0; i < BOX.length; i++) if (BOX[i].id === id) return BOX[i]; return null; }

    var REVEAL = {
      1: ['env', 'run'], 2: ['gate'], 3: ['ep', 'sem', 'proc'], 4: ['cons'],
      5: ['ret'], 6: ['rank'], 7: ['ctx']
    };

    reg('fig-architecture', {
      w: W, h: H, dur: 1150, hold: 750, maxh: 640,
      stages: [
        { t: 'Start from the loop', c: 'Everything below has been argued for individually. Assembled, the dependencies become obvious — and so does how little of it a vector database covers.' },
        { t: 'Runtime and observations', c: 'The agent runs, and the environment emits far more than is worth keeping. This is where the funnel starts, and it should narrow hard.' },
        { t: 'The writer', c: 'One component with four jobs: judge salience, check novelty, gate on outcome, and refuse anything that must not persist. Outcome-gating is the highest-leverage single line in the diagram.' },
        { t: 'Three stores', c: 'Separated not out of taxonomic tidiness but because they differ in write trigger, lifetime, and how they are found again.' },
        { t: 'Consolidation and management', c: 'Episodes become facts, repeated facts become rules, superseded assertions get closed, expired ones get dropped. The tier most systems never build.' },
        { t: 'Retrieval', c: 'Beginning with query construction, because "can we do it like last time?" is not a query. Then hybrid search across the indexes that suit each part of it.' },
        { t: 'Rank and threshold', c: 'Combine the signals, penalise redundancy, and allow the system to return nothing — the retrieval-side prerequisite for abstention.' },
        { t: 'Context construction', c: 'Select under budget by marginal gain, order for both cache and attention, compress what must be compressed, and label every memory with where it came from.' },
        { t: 'And only now, the model', c: 'The model sees the output of nine components. Its behaviour is bounded by every decision above it.' },
        { t: 'The loop closes', c: 'The action changes the environment, which produces the next observation, which enters the writer. The store is downstream of behaviour it also causes.' },
        { t: 'What a vector DB covers', c: 'Part of one box. Useful, necessary, and nowhere near sufficient — seven of these decisions remain yours to make.' },
        { t: 'Build it in this order', c: 'Archive, then compaction, then structured facts, then supersession, then outcome-gated writes, then thresholded retrieval, then deletion, then consolidation. The graph comes last, when a query demands it.' }
      ],
      draw: function (i, p) {
        var s = '', view = [0, 0, W, H];

        var overlayDim = (i === 10) ? 0.42 : (i === 11 ? 0.22 : 1);
        function vis(id) {
          if (i >= 10) { return (i === 10 && id === 'ret') ? 1 : overlayDim; }
          for (var k = 1; k <= 7; k++) {
            if (REVEAL[k] && REVEAL[k].indexOf(id) >= 0) {
              if (i > k) return 1;
              if (i === k) return eout(p);
              return i === 0 ? 0.18 : 0;
            }
          }
          return 1;
        }
        function isActive(id) {
          for (var k = 1; k <= 7; k++) if (REVEAL[k] && REVEAL[k].indexOf(id) >= 0 && i === k) return true;
          if (i === 8 && id === 'ctx') return true;
          return false;
        }

        s += title(48, 20, 'AGENT MEMORY  ·  END TO END', { size: 11.5 });

        /* connectors */
        function link(a, b, col, op, dash) {
          var A1 = byId(a), B1 = byId(b);
          return ARR(A1.x + A1.w / 2, A1.y + A1.h + 2, B1.x + B1.w / 2, B1.y - 2, { stroke: col, sw: 1.4, op: op, dash: dash, head: 7 });
        }
        var lop = i === 0 ? 0.18 : (i >= 10 ? overlayDim : 1);
        s += link('env', 'run', C.blue, Math.min(lop, vis('run')));
        s += link('run', 'gate', C.amber, Math.min(lop, vis('gate')));
        var gate = byId('gate');
        var stores = ['ep', 'sem', 'proc'];
        for (var q = 0; q < 3; q++) {
          var B2 = byId(stores[q]);
          s += ARR(gate.x + gate.w / 2, gate.y + gate.h + 2, B2.x + B2.w / 2, B2.y - 2, { stroke: B2.c, sw: 1.3, op: Math.min(lop, vis(stores[q])), head: 7 });
        }
        var cons = byId('cons');
        for (var q2 = 0; q2 < 3; q2++) {
          var B3 = byId(stores[q2]);
          s += ARR(B3.x + B3.w / 2, B3.y + B3.h + 2, cons.x + cons.w / 2, cons.y - 2, { stroke: C.green, sw: 1.1, op: Math.min(lop, vis('cons')) * 0.75, head: 6 });
        }
        s += link('cons', 'ret', C.violet, Math.min(lop, vis('ret')));
        s += link('ret', 'rank', C.violet, Math.min(lop, vis('rank')));
        s += link('rank', 'ctx', C.teal, Math.min(lop, vis('ctx')));

        /* boxes */
        for (var b = 0; b < BOX.length; b++) {
          var bx = BOX[b], op = vis(bx.id), act = isActive(bx.id);
          if (op < 0.02) continue;
          s += R(bx.x, bx.y, bx.w, bx.h, { rx: 3, fill: act ? '#141d23' : C.wash, stroke: act ? bx.c : C.line2, sw: act ? 1.7 : 1, op: op });
          s += R(bx.x, bx.y, 3, bx.h, { fill: bx.c, op: op });
          s += T(bx.x + bx.w / 2, bx.y + (bx.sub ? 22 : 26), bx.n, { size: 11.5, weight: 700, fill: act ? bx.c : C.ink, anchor: 'middle', ls: '0.1em', op: op });
          if (bx.sub) s += T(bx.x + bx.w / 2, bx.y + 38, bx.sub, { size: 8.8, fill: act ? C.ink : C.faint, anchor: 'middle', op: op });
        }

        /* the LLM + action, right column */
        var llmOp = i >= 10 ? overlayDim : (i >= 8 ? (i === 8 ? eout(p) : 1) : (i === 0 ? 0.18 : 0.28));
        s += R(724, 500, 224, 124, { rx: 3, fill: i >= 8 ? '#141d23' : C.wash, stroke: i >= 8 ? C.blue : C.line2, sw: i >= 8 ? 1.7 : 1, op: llmOp });
        s += T(836, 536, 'LLM', { size: 20, weight: 700, anchor: 'middle', disp: true, fill: i >= 8 ? C.blue : C.dim, op: llmOp });
        s += L(748, 552, 924, 552, { stroke: C.line, op: llmOp });
        s += T(836, 576, 'action', { size: 12, anchor: 'middle', fill: C.ink, op: llmOp, weight: 500 });
        s += T(836, 600, 'tool call · edit · reply', { size: 8.8, anchor: 'middle', fill: C.faint, op: llmOp });
        var ctxB = byId('ctx');
        s += ARR(ctxB.x + ctxB.w + 2, ctxB.y + 26, 720, 562, { stroke: C.teal, sw: 1.5, op: llmOp, head: 7 });

        /* closing edge back to environment */
        var closeOp = i >= 10 ? overlayDim : (i === 9 ? eout(p) : 0.16);
        s += P('M948 562 L972 562 L972 46 L624 46', { stroke: C.blue, sw: 1.6, op: closeOp });
        s += ARR(650 + 8, 46, 624, 46, { stroke: C.blue, sw: 1.6, op: closeOp, head: 8 });
        if (i === 9) s += T(960, 226, 'the store is downstream of behaviour it also causes',
          { size: 10.5, fill: C.blue, anchor: 'end', op: eout(p) });

        /* vector db overlay */
        if (i === 10) {
          var f10 = eout(p);
          var rt = byId('ret');
          s += R(rt.x - 6, rt.y - 6, rt.w + 12, rt.h + 12, { rx: 4, stroke: C.rose, sw: 1.8, op: f10, dash: '5 4' });
          s += R(40, 74, 244, 152, { rx: 3, fill: C.wash, stroke: C.rose, sw: 1.3, op: f10 });
          s += T(58, 100, 'A VECTOR DATABASE', { size: 10, fill: C.rose, ls: '0.13em', weight: 600, op: f10 });
          s += WRAP(58, 124, 'is the semantic-search part of one box out of ten — and none of what to write, what to merge, what to supersede, what to delete, or how to build the query.', 212, { size: 10, fill: C.ink, op: f10 });
        }

        /* build order */
        if (i === 11) {
          var f11 = eout(p);
          var steps = ['archive', 'compaction + test', 'structured facts', 'supersession',
            'outcome-gated writes', 'thresholded retrieval', 'deletion + expiry', 'consolidation', 'graph (only on demand)'];
          s += R(316, 60, 368, 540, { rx: 3, fill: '#0b0f12', stroke: C.green, sw: 1.4, op: f11 });
          s += T(340, 92, 'BUILD IT IN THIS ORDER', { size: 11, fill: C.green, ls: '0.13em', weight: 600, op: f11 });
          for (var z = 0; z < steps.length; z++) {
            var op2 = f11 * clamp(p * 3 - z * 0.16, 0, 1);
            s += CIR(356, 128 + z * 48, 13, { stroke: z === 8 ? C.faint : C.green, sw: 1.2, op: op2 });
            s += T(356, 132 + z * 48, String(z + 1), { size: 10.5, fill: z === 8 ? C.faint : C.green, anchor: 'middle', op: op2 });
            s += T(384, 132 + z * 48, steps[z], { size: 12, fill: z === 8 ? C.faint : C.ink, op: op2 });
            if (z < steps.length - 1) s += L(356, 141 + z * 48, 356, 163 + z * 48, { stroke: C.green, op: op2 * 0.4 });
          }
          s += WRAP(340, 566, 'most struggling systems built 9 and skipped 3–7', 330, { size: 10.5, fill: C.amber, op: f11 });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* ---------- boot ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { G.boot(); });
  } else { G.boot(); }
})();
