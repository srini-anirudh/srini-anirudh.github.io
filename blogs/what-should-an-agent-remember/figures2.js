/* Figures 6–10 — requires figures.js */
(function () {
  'use strict';
  if (!window.AGM) { if (window.console) console.error('figures2.js loaded before figures.js'); return; }
  var G = window.AGM;
  var C = G.C, reg = G.reg, R = G.R, L = G.L, P = G.P, CIR = G.CIR, T = G.T, ARR = G.ARR,
    title = G.title, WRAP = G.WRAP, el = G.el, clamp = G.clamp, lerp = G.lerp, ease = G.ease,
    eout = G.eout, r2 = G.r2, seg = G.seg, fmt = G.fmt;

  /* =========================================================
     FIGURE 6 — the consolidation ladder
     ========================================================= */
  (function () {
    var W = 1000, H = 600;

    var TURNS = [
      { s: 'session 41 · Aug 02', txt: 'build failed — nvcc: command not found ... after 20 min: turns out CUDA_HOME was unset', tok: 1480 },
      { s: 'session 58 · Aug 19', txt: 'same nvcc error again on the cluster. why does this keep happening', tok: 1260 },
      { s: 'session 63 · Aug 27', txt: 'ran `module load cuda/12.4` first and the build went straight through', tok: 1520 }
    ];
    var EPISODES = [
      { id: 'e₁', s: 'build on cluster-A', a: 'make -j32', o: 'nvcc not found', r: 'fail', t: 'Aug 02' },
      { id: 'e₂', s: 'build on cluster-A', a: 'make -j32', o: 'nvcc not found', r: 'fail', t: 'Aug 19' },
      { id: 'e₃', s: 'build on cluster-A', a: 'module load cuda/12.4; make -j32', o: 'built clean', r: 'success', t: 'Aug 27' }
    ];

    var TYPES = [
      { n: 'WORKING', col: C.blue, life: 'one task', trig: 'every step', ret: 'always in context', ex: 'goal, plan, open questions' },
      { n: 'EPISODIC', col: C.amber, life: 'months', trig: 'end of episode', ret: 'similarity + recency', ex: '(s, a, o, r, t) tuples' },
      { n: 'SEMANTIC', col: C.green, life: 'until superseded', trig: 'consolidation', ret: 'entity + similarity', ex: 'atomic facts about the world' },
      { n: 'PROCEDURAL', col: C.violet, life: 'until it stops working', trig: 'success, ≥ n times', ret: 'task-shape match', ex: 'reusable skills and runbooks' }
    ];

    reg('fig-taxonomy', {
      w: W, h: H, dur: 1300, hold: 750,
      stages: [
        { t: 'Working memory', c: 'What matters right now: the goal, the step, the file, the last error. It lives in context, and it is rewritten in place rather than appended to.' },
        { t: 'Raw turns arrive', c: 'Three sessions across four weeks, 4,260 tokens of transcript. Lossless and almost unusable — nothing here is retrievable by the thing that would need it.' },
        { t: 'Episode one', c: 'The first session collapses to a tuple: state, action, observation, outcome, time. 1,480 tokens become 18. The failure is now a first-class object.' },
        { t: 'Episode two', c: 'And the same failure again, three weeks later. Two near-identical records — which is itself a signal, not just duplication.' },
        { t: 'Episode three', c: 'This time it worked. The successful episode differs from the failures by exactly one prefix, which is the whole causal content.' },
        { t: 'Semantic extraction', c: 'Detach the fact from the episodes that produced it. It is now retrievable by entity — you can ask about cluster-A without knowing that August happened.' },
        { t: 'Procedural distillation', c: 'The comparison across e₁, e₂, e₃ yields something better than a fact: an executable prefix that makes the failure not happen.' },
        { t: 'Reflection', c: 'And above that, the generalisation. Note the counter: promoting a rule after one observation is overgeneralisation; after three it is inference.' },
        { t: 'The compression', c: 'Four thousand two hundred and sixty tokens to twenty-two, and the twenty-two are more useful than the four thousand, because they are the part that changes what the agent does.' },
        { t: 'What retrieval returns', c: 'Ask "why do builds fail here" against each tier. The raw store returns three redundant transcripts; the consolidated store returns one rule that answers it.' },
        { t: 'Four types, four policies', c: 'The reason to keep these separate is not taxonomy for its own sake — they differ in lifetime, in what triggers a write, and in how they are found again.' }
      ],
      draw: function (i, p) {
        var s = '', view = [0, 0, W, H];

        if (i === 10) {
          var f = eout(p);
          s += title(60, 42, 'FOUR MEMORY TYPES  ·  FOUR DIFFERENT POLICIES', { size: 12, op: f });
          for (var q = 0; q < 4; q++) {
            var cop = f * clamp(p * 5 - q, 0, 1);
            var y = 72 + q * 122;
            s += R(60, y, 880, 108, { rx: 3, fill: C.wash, stroke: TYPES[q].col, sw: 1.2, op: cop * 0.9 });
            s += R(60, y, 4, 108, { fill: TYPES[q].col, op: cop });
            s += T(80, y + 30, TYPES[q].n, { size: 14, weight: 700, fill: TYPES[q].col, ls: '0.12em', op: cop, disp: true });
            s += T(80, y + 52, TYPES[q].ex, { size: 10.5, fill: C.dim, op: cop });
            var cols = [['LIFETIME', TYPES[q].life], ['WRITE TRIGGER', TYPES[q].trig], ['RETRIEVED BY', TYPES[q].ret]];
            for (var cc = 0; cc < 3; cc++) {
              var xx = 380 + cc * 190;
              s += T(xx, y + 30, cols[cc][0], { size: 8.5, fill: C.faint, ls: '0.13em', op: cop });
              s += WRAP(xx, y + 52, cols[cc][1], 176, { size: 11, fill: C.ink, op: cop });
            }
          }
          return { svg: s, view: view };
        }

        s += title(60, 40, 'FROM RAW TURNS TO A REUSABLE RULE', { size: 12 });

        /* working memory card, always present but only lit at stage 0 */
        var wmOn = (i === 0) ? 1 : 0.35;
        if (i < 8) {
        s += R(660, 60, 280, 128, { rx: 3, fill: C.wash, stroke: i === 0 ? C.blue : C.line2, sw: i === 0 ? 1.5 : 1, op: wmOn === 1 ? 1 : 0.75 });
        s += T(676, 82, 'WORKING MEMORY', { size: 10, weight: 600, fill: i === 0 ? C.blue : C.dim, ls: '0.13em' });
        var wm = [['goal', 'get the build green'], ['step', '2 of 4'], ['host', 'cluster-A'], ['last', 'nvcc: command not found']];
        for (var w = 0; w < wm.length; w++) {
          s += T(676, 104 + w * 20, wm[w][0], { size: 9, fill: C.faint });
          s += T(730, 104 + w * 20, wm[w][1], { size: 9.5, fill: i === 0 ? C.ink : C.dim });
        }
        if (i === 0) s += T(676, 202, 'in context · rewritten, not appended', { size: 9.5, fill: C.blue, op: eout(p) });
        }

        /* lane 1: raw turns */
        var rawOp = i >= 1 ? 1 : 0;
        if (rawOp) {
          s += T(60, 80, 'RAW TURNS', { size: 10, fill: C.dim, ls: '0.13em', weight: 600 });
          for (var t = 0; t < 3; t++) {
            var op = (i === 1) ? eout(seg(p, t * 0.22, t * 0.22 + 0.5)) : 1;
            var dim = (i >= 2 && i - 2 >= t) ? 0.45 : 1;
            if (i >= 5) dim = 0.3;
            s += R(60, 92 + t * 60, 560, 52, { rx: 2, fill: C.wash, stroke: C.line2, op: op * dim });
            s += T(72, 112 + t * 60, TURNS[t].s, { size: 9, fill: C.faint, op: op * dim });
            s += WRAP(72, 128 + t * 60, TURNS[t].txt, 500, { size: 9.5, fill: C.ink, op: op * dim });
            s += T(608, 112 + t * 60, fmt(TURNS[t].tok), { size: 9.5, fill: C.faint, anchor: 'end', op: op * dim });
          }
        }

        /* lane 2: episodes */
        if (i >= 2) {
          s += T(60, 300, 'EPISODIC', { size: 10, fill: C.amber, ls: '0.13em', weight: 600 });
          var shownEp = clamp(i - 1, 0, 3);
          for (var e = 0; e < shownEp; e++) {
            var opE = (i === e + 2) ? eout(p) : 1;
            var dimE = (i >= 6) ? 0.42 : 1;
            var ep = EPISODES[e];
            var x = 60 + e * 296;
            s += R(x, 312, 280, 84, { rx: 2, fill: C.wash, stroke: ep.r === 'success' ? C.green : C.amber, sw: 1.2, op: opE * dimE });
            s += T(x + 12, 332, ep.id + '  ' + ep.t, { size: 10, weight: 600, fill: ep.r === 'success' ? C.green : C.amber, op: opE * dimE });
            s += T(x + 12, 350, 's: ' + ep.s, { size: 8.8, fill: C.dim, op: opE * dimE });
            s += WRAP(x + 12, 364, 'a: ' + ep.a, 256, { size: 8.8, fill: C.ink, op: opE * dimE });
            s += T(x + 12, 388, 'o: ' + ep.o + '  →  ' + ep.r, { size: 8.8, fill: ep.r === 'success' ? C.green : C.rose, op: opE * dimE });
            if (i === e + 2) {
              s += ARR(x + 140, 240 + e * 4, x + 140, 306, { stroke: C.amber, sw: 1.3, op: eout(seg(p, 0, 0.5)) * 0.8 });
            }
          }
          if (i === 3) s += T(660, 214, 'two identical failures', { size: 11, fill: C.amber, op: eout(p), weight: 600 });
          if (i === 3) s += T(660, 232, 'the repetition is the signal', { size: 9.5, fill: C.dim, op: eout(p) });
          if (i === 4) s += T(660, 214, 'one prefix differs', { size: 11, fill: C.green, op: eout(p), weight: 600 });
          if (i === 4) s += T(660, 232, '`module load cuda/12.4`', { size: 9.5, fill: C.green, op: eout(p) });
        }

        /* lane 3: semantic + procedural */
        if (i >= 5) {
          var opS = (i === 5) ? eout(p) : 1;
          s += T(60, 434, 'SEMANTIC', { size: 10, fill: C.green, ls: '0.13em', weight: 600, op: opS });
          s += R(60, 444, 420, 46, { rx: 2, fill: C.wash, stroke: C.green, sw: 1.2, op: opS });
          s += T(72, 464, '(cluster-A, requires, CUDA module load before build)', { size: 10, fill: C.ink, op: opS });
          s += T(72, 480, 'source: e₁,e₂,e₃ · confidence 0.93 · valid from Aug 27', { size: 8.5, fill: C.faint, op: opS });
        }
        if (i >= 6) {
          var opP = (i === 6) ? eout(p) : 1;
          s += T(520, 434, 'PROCEDURAL', { size: 10, fill: C.violet, ls: '0.13em', weight: 600, op: opP });
          s += R(520, 444, 420, 46, { rx: 2, fill: C.wash, stroke: C.violet, sw: 1.2, op: opP });
          s += T(532, 464, 'skill build_on_cluster_A():', { size: 10, fill: C.ink, op: opP });
          s += T(532, 480, '  module load cuda/12.4 && make -j32', { size: 10, fill: C.violet, op: opP });
        }
        if (i >= 7) {
          var opR = (i === 7) ? eout(p) : 1;
          s += R(60, 508, 880, 54, { rx: 3, fill: 'rgba(180,138,232,0.07)', stroke: C.violet, sw: 1.3, op: opR });
          s += T(76, 530, 'REFLECTION', { size: 10, fill: C.violet, ls: '0.13em', weight: 600, op: opR });
          s += T(76, 550, 'On cluster-A, always load the CUDA module before building. Observed 3×; 1 fix confirmed.', { size: 11.5, fill: C.ink, op: opR });
          s += T(924, 530, 'n = 3', { size: 10, fill: C.violet, anchor: 'end', op: opR });
          s += T(924, 550, 'promoted', { size: 9, fill: C.faint, anchor: 'end', op: opR });
        }

        /* stage 8: token accounting */
        if (i === 8) {
          var f8 = eout(p);
          s += R(640, 60, 300, 210, { rx: 3, fill: '#0b0f12', stroke: C.line2, op: f8 });
          s += T(656, 84, 'TOKENS AT EACH TIER', { size: 10, fill: C.dim, ls: '0.13em', op: f8 });
          var tiers = [['raw turns', 4260, C.line2], ['episodes', 54, C.amber], ['semantic + skill', 38, C.green], ['reflection', 22, C.violet]];
          for (var z = 0; z < 4; z++) {
            var yy = 110 + z * 40;
            var ww = 260 * Math.pow(tiers[z][1] / 4260, 0.32) * f8;
            s += T(656, yy, tiers[z][0], { size: 10, fill: C.ink, op: f8 });
            s += R(656, yy + 6, ww, 12, { fill: tiers[z][2], op: f8 * 0.55 });
            s += T(924, yy, fmt(tiers[z][1]), { size: 10.5, fill: tiers[z][2], anchor: 'end', weight: 600, op: f8 });
          }
          s += T(656, 258, '194× smaller · and strictly more useful', { size: 10, fill: C.green, op: f8 });
        }

        /* stage 9: retrieval comparison */
        if (i === 9) {
          var f9 = eout(p);
          s += R(640, 60, 300, 210, { rx: 3, fill: '#0b0f12', stroke: C.line2, op: f9 });
          s += T(656, 84, 'QUERY: "why do builds fail here?"', { size: 9.5, fill: C.dim, op: f9 });
          s += T(656, 116, 'raw store  →', { size: 10, fill: C.faint, op: f9 });
          s += T(656, 136, '3 transcripts, 4,260 tok', { size: 10.5, fill: C.rose, op: f9 });
          s += T(656, 152, 'two of them say the same thing', { size: 9, fill: C.faint, op: f9 });
          s += L(656, 172, 924, 172, { stroke: C.line, op: f9 });
          s += T(656, 196, 'consolidated  →', { size: 10, fill: C.faint, op: f9 });
          s += T(656, 216, '1 rule, 22 tok', { size: 10.5, fill: C.green, op: f9 });
          s += T(656, 232, 'and it answers the question', { size: 9, fill: C.faint, op: f9 });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 7 — one conversation, seven representations
     ========================================================= */
  (function () {
    var W = 1000, H = 600;
    var SRC = [
      'user:  we finally moved project-x off Jenkins — it deploys',
      '       through GitHub Actions now, since about mid-August.',
      'agent: got it. anything else changed in the pipeline?',
      'user:  yeah the staging runners are on image v3. and please',
      '       stop suggesting the old jenkinsfile, it is deleted.'
    ];

    var REPS = [
      {
        n: 'FULL TRANSCRIPT', col: C.line2, tok: 640, fid: 1.0, upd: 0, ret: 'scan only',
        body: ['user: we finally moved project-x off Jenkins — it', '      deploys through GitHub Actions now, since', '      about mid-August.', 'agent: got it. anything else changed?', 'user: yeah the staging runners are on image v3.', '      and please stop suggesting the old', '      jenkinsfile, it is deleted.'],
        note: 'nothing is lost and nothing is findable'
      },
      {
        n: 'CHUNKS', col: C.blue, tok: 660, fid: 0.98, upd: 0.15, ret: 'similarity',
        body: ['[chunk 1]  we finally moved project-x off Jenkins —', '           it deploys through GitHub Actions now,', '           since about mid-Aug. got it. anything', '─────────── boundary cuts the causal unit ───────────', '[chunk 2]  else changed? yeah the staging runners', '           are on image v3. and please stop', '           suggesting the old jenkinsfile.'],
        note: 'boundaries are insensitive to event structure'
      },
      {
        n: 'SUMMARY', col: C.teal, tok: 42, fid: 0.55, upd: 0.2, ret: 'similarity',
        body: ['project-x switched from Jenkins to GitHub Actions', 'in mid-August; staging runners updated to image v3;', 'the old Jenkinsfile has been removed.'],
        note: 'lossy with respect to a purpose you do not yet know'
      },
      {
        n: 'ATOMIC FACTS', col: C.green, tok: 34, fid: 0.62, upd: 0.9, ret: 'similarity + entity',
        body: ['(project-x, deploys_via, GitHub Actions)', '(project-x, not_deploys_via, Jenkins)', '(staging-runners, image, v3)', '(jenkinsfile, status, deleted)'],
        note: 'each one can be superseded without touching the others'
      },
      {
        n: 'STRUCTURED RECORDS', col: C.green, tok: 96, fid: 0.7, upd: 1.0, ret: 'similarity + filters + time',
        body: ['{ entity: "project-x",', '  fact: "deploys via GitHub Actions",', '  source: "user 2026-08-14T11:02Z",', '  confidence: 0.94,', '  valid_from: "2026-08-14", valid_to: null,', '  scope: "project" }'],
        note: 'every field earns its place downstream'
      },
      {
        n: 'VECTOR MEMORY', col: C.violet, tok: 34, fid: 0.62, upd: 0.35, ret: 'semantic association',
        body: ['m₁ → [ 0.14, −0.62, 0.08, … ]   d = 1536', 'm₂ → [ 0.13, −0.60, 0.11, … ]', '', 'cos(m₁, m₂) = 0.97', '"deploys via GH Actions" and "deploys via Jenkins"', 'are nearest neighbours — similarity cannot tell', 'you which one is current'],
        note: 'great at association, blind to recency and truth'
      },
      {
        n: 'TEMPORAL GRAPH', col: C.amber, tok: 88, fid: 0.72, upd: 1.0, ret: 'traversal + time + entity',
        body: ['(project-x) ──deploys_via──▶ (GitHub Actions)', '                 [ 2026-08-14 → ∞ ]', '(project-x) ──deploys_via──▶ (Jenkins)', '                 [ 2024-01-09 → 2026-08-13 ]  closed', '(project-x) ──uses──▶ (staging-runners) ──image──▶ (v3)'],
        note: 'invalidation is an edge property, not an argument at read time'
      }
    ];

    var QUERIES = [
      { q: 'how does project-x deploy?', ok: [1, 1, 1, 1, 1, 1, 1] },
      { q: 'how did it deploy last year?', ok: [1, 1, 0, 0, 1, 0, 1] },
      { q: 'when did that change?', ok: [1, 0, 0, 0, 1, 0, 1] },
      { q: 'what else depends on the runners?', ok: [0, 0, 0, 0, 0, 0, 1] }
    ];

    reg('fig-representations', {
      w: W, h: H, dur: 1200, hold: 800,
      stages: (function () {
        var base = [{ t: 'The source', c: 'One short exchange carrying four facts, one correction and an implicit date. Everything below is this, written down differently.' }];
        var caps = [
          'Lossless and unusable. Keep it as an archive tier — it is the only representation you can re-derive the others from when your extraction improves.',
          'Fixed-size windows over the text. Cheap and general, but a chunk boundary does not know where an event begins or ends.',
          'A rewrite in fewer tokens. Fifteen times smaller, and lossy in a way you cannot audit without the original.',
          'Triples. Individually retrievable and, crucially, individually updatable — you can close one without disturbing its neighbours.',
          'The same fact with its metadata. Provenance, confidence, validity interval, scope. This is what production memory actually looks like.',
          'Embeddings. Excellent at finding the right topic, and structurally unable to tell you which of two near-identical assertions is current.',
          'Entities and relations with time on the edges. Multi-hop and temporal queries become native; you pay for it in extraction cost and error.'
        ];
        for (var i = 0; i < 7; i++) base.push({ t: REPS[i].n.charAt(0) + REPS[i].n.slice(1).toLowerCase(), c: caps[i] });
        base.push({ t: 'Token cost', c: 'Plotted together. The three cheap representations are also the three that lose the most, except where structure buys the fidelity back.' });
        base.push({ t: 'Updatability', c: 'A different axis, and the one that matters for a store that lives for months. Summaries can only be rewritten wholesale; records can be edited per field.' });
        base.push({ t: 'Four queries', c: 'The real test. Not "can it be retrieved" but "can this question be answered from it." Only two representations survive all four.' });
        base.push({ t: 'Use several', c: 'No representation dominates, so serious systems run an archive, a fact table with provenance, a vector index over both, and a graph where relations matter.' });
        return base;
      })(),
      draw: function (i, p) {
        var s = '', view = [0, 0, W, H];

        /* source panel, always on the left */
        s += title(56, 40, 'SOURCE  ·  ONE EXCHANGE', { size: 11 });
        s += R(56, 56, 320, 132, { rx: 3, fill: C.wash, stroke: i === 0 ? C.blue : C.line2, sw: i === 0 ? 1.5 : 1 });
        for (var q = 0; q < SRC.length; q++) {
          var op = (i === 0) ? eout(seg(p, q * 0.13, q * 0.13 + 0.45)) : 0.75;
          s += T(70, 80 + q * 20, SRC[q], { size: 9.2, fill: q % 2 === 0 ? C.ink : C.dim, op: op });
        }
        if (i === 0) {
          var f0 = eout(seg(p, 0.55, 1));
          s += R(56, 204, 320, 96, { rx: 3, fill: C.wash, stroke: C.amber, sw: 1.2, op: f0 });
          s += T(70, 226, 'WHAT IS IN HERE', { size: 9.5, fill: C.amber, ls: '0.13em', op: f0 });
          s += T(70, 246, '· 4 facts', { size: 10, fill: C.ink, op: f0 });
          s += T(70, 264, '· 1 correction (Jenkins is out)', { size: 10, fill: C.ink, op: f0 });
          s += T(70, 282, '· 1 fuzzy date ("about mid-August")', { size: 10, fill: C.ink, op: f0 });
        }

        if (i >= 1 && i <= 7) {
          var rp = REPS[i - 1], f = eout(p);
          s += title(410, 40, 'REPRESENTATION ' + i + ' / 7', { size: 11, op: 1 });
          s += R(410, 56, 534, 300, { rx: 3, fill: '#0b0f12', stroke: rp.col, sw: 1.4 });
          s += R(410, 56, 534, 38, { fill: rp.col, op: 0.12 });
          s += T(426, 80, rp.n, { size: 13, weight: 700, fill: rp.col, ls: '0.12em', disp: true });
          s += T(928, 80, fmt(rp.tok) + ' tok', { size: 11, fill: rp.col, anchor: 'end', weight: 600 });
          for (var b = 0; b < rp.body.length; b++) {
            var bop = f * clamp(p * 3 - b * 0.14, 0, 1);
            s += T(426, 122 + b * 19, rp.body[b], { size: 9.6, fill: rp.body[b].indexOf('─') === 0 ? C.rose : C.ink, op: bop });
          }
          s += T(426, 336, rp.note, { size: 10, fill: C.dim, op: f });

          /* meters */
          var meters = [['fidelity', rp.fid], ['updatability', rp.upd]];
          for (var m = 0; m < 2; m++) {
            var my = 392 + m * 54;
            s += T(410, my, meters[m][0], { size: 9.5, fill: C.faint, ls: '0.12em' });
            s += R(410, my + 8, 300, 14, { fill: '#0b0f12', stroke: C.line2 });
            s += R(411, my + 9, 298 * meters[m][1] * f, 12, { fill: rp.col, op: 0.55 });
            s += T(716, my + 19, Math.round(meters[m][1] * 100) + '%', { size: 10, fill: rp.col, weight: 600 });
          }
          s += T(410, 392 + 108, 'retrievable by:  ' + rp.ret, { size: 10.5, fill: C.ink });
          /* transform arrow */
          s += ARR(384, 122, 402, 122, { stroke: rp.col, sw: 1.4, op: f, head: 6 });
        }

        if (i === 8 || i === 9) {
          var f2 = eout(p), isTok = i === 8;
          s += title(410, 40, isTok ? 'TOKEN COST' : 'UPDATABILITY', { size: 11 });
          var maxT = 660;
          for (var z = 0; z < 7; z++) {
            var y = 66 + z * 60;
            var v = isTok ? Math.pow(REPS[z].tok / maxT, 0.34) : REPS[z].upd;
            s += T(410, y + 12, REPS[z].n, { size: 10, fill: REPS[z].col, weight: 600 });
            s += R(410, y + 20, 460, 16, { fill: '#0b0f12', stroke: C.line2, op: f2 });
            s += R(411, y + 21, 458 * v * f2, 14, { fill: REPS[z].col, op: 0.5 });
            s += T(936, y + 33, isTok ? fmt(REPS[z].tok) + ' tok' : Math.round(REPS[z].upd * 100) + '%',
              { size: 10, fill: C.ink, anchor: 'end', op: f2 });
          }
          if (!isTok) s += T(410, 512, 'a summary can only be rewritten whole; a record can be edited per field', { size: 10.5, fill: C.dim, op: f2 });
          else s += T(410, 512, 'cheap is not automatically good — see the query grid next', { size: 10.5, fill: C.dim, op: f2 });
        }

        if (i >= 10) {
          var f3 = i === 10 ? eout(p) : 1;
          s += title(56, 216, 'CAN THIS QUESTION BE ANSWERED FROM IT?', { size: 11, op: f3 });
          var gx = 300, colW = 90;
          for (var c2 = 0; c2 < 7; c2++) {
            s += T(gx + c2 * colW + colW / 2, 244, String(c2 + 1), { size: 10, fill: REPS[c2].col, anchor: 'middle', weight: 600, op: f3 });
            s += T(gx + c2 * colW + colW / 2, 258, REPS[c2].n.split(' ')[0].slice(0, 9).toLowerCase(), { size: 7.6, fill: C.faint, anchor: 'middle', op: f3 });
          }
          for (var rq = 0; rq < QUERIES.length; rq++) {
            var ry = 282 + rq * 46;
            var rop = f3 * clamp(p * 4 - rq * 0.5, 0, 1);
            if (i > 10) rop = 1;
            s += T(56, ry + 16, QUERIES[rq].q, { size: 10.5, fill: C.ink, op: rop });
            for (var cq = 0; cq < 7; cq++) {
              var okv = QUERIES[rq].ok[cq];
              s += R(gx + cq * colW + 12, ry, colW - 24, 26, {
                rx: 2, fill: okv ? C.green : C.rose, op: rop * (okv ? 0.22 : 0.14),
                stroke: okv ? C.green : C.rose, sw: 1
              });
              s += T(gx + cq * colW + colW / 2, ry + 18, okv ? '✓' : '✕', { size: 12, fill: okv ? C.green : C.rose, anchor: 'middle', op: rop });
            }
          }
          if (i === 11) {
            var f4 = eout(p);
            s += R(56, 494, 888, 42, { rx: 3, fill: C.wash, stroke: C.green, sw: 1.3, op: f4 });
            s += T(500, 520, 'archive  +  structured records  +  vector index  +  graph where relations matter',
              { size: 12, fill: C.green, anchor: 'middle', weight: 600, op: f4 });
          }
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 8 — write triage
     ========================================================= */
  (function () {
    var W = 1000, H = 600;
    var OBS = [
      {
        src: 'user', txt: 'hey, back again',
        all: { act: 'ADD', rec: '"user said hey"', col: C.rose, why: 'stored — no filter at all' },
        salient: { act: 'SKIP', rec: '', col: C.faint, why: 'names no durable entity' },
        full: { act: 'SKIP', rec: '', col: C.faint, why: 'no salience, no novelty, nothing to carry' }
      },
      {
        src: 'user', txt: 'my favourite pizza today is pepperoni',
        all: { act: 'ADD', rec: '(user, favourite_pizza, pepperoni)', col: C.rose, why: 'stored immediately' },
        salient: { act: 'ADD', rec: '(user, favourite_pizza, pepperoni)', col: C.rose, why: 'names the user, looks like a preference' },
        full: { act: 'DEFER', rec: 'held until end of session', col: C.amber, why: 'preference-shaped, but extraction waits for the session to close' }
      },
      {
        src: 'user', txt: 'actually I hate pepperoni, I was kidding',
        all: { act: 'ADD', rec: '(user, hates, pepperoni)', col: C.rose, why: 'now the store contains both' },
        salient: { act: 'ADD', rec: '(user, hates, pepperoni)', col: C.rose, why: 'also salient — contradiction now live in the store' },
        full: { act: 'DROP', rec: 'candidate discarded', col: C.green, why: 'the retraction cancels the deferred write before it lands' }
      },
      {
        src: 'user', txt: 'we use Postgres 16 on project-x',
        all: { act: 'ADD', rec: '(project-x, db, Postgres 16)', col: C.green, why: 'stored' },
        salient: { act: 'ADD', rec: '(project-x, db, Postgres 16)', col: C.green, why: 'durable entity, stable fact' },
        full: { act: 'ADD', rec: '(project-x, db, Postgres 16) · user-stated · conf 0.95', col: C.green, why: 'salient, novel, stable, high provenance — a clean write' }
      },
      {
        src: 'tool', txt: 'ls -R returned 3,142 paths (81 KB)',
        all: { act: 'ADD', rec: '81 KB of paths', col: C.rose, why: 'stored verbatim; the store is now mostly this' },
        salient: { act: 'SKIP', rec: '', col: C.faint, why: 'no entity, no assertion' },
        full: { act: 'DISTIL', rec: '(project-x, layout, "src/ tests/ infra/ · 3.1k files")', col: C.green, why: 'the raw dump is discarded; the conclusion drawn from it is kept' }
      },
      {
        src: 'agent', txt: 'deploy failed: missing scope read:user → added scope → succeeded',
        all: { act: 'ADD', rec: 'full trajectory, 4.1k tokens', col: C.amber, why: 'stored raw, unindexed' },
        salient: { act: 'ADD', rec: 'episode text', col: C.amber, why: 'salient, but stored as prose' },
        full: { act: 'ADD ×2', rec: 'episode e₇ (outcome: success) + skill add_scope_then_deploy()', col: C.green, why: 'outcome-gated: it succeeded, so both the episode and the procedure are written' }
      },
      {
        src: 'user', txt: 'here is the deploy key: sk-live-9f2a…',
        all: { act: 'ADD', rec: 'sk-live-9f2a…', col: C.rose, why: 'a credential now lives in a retrievable store' },
        salient: { act: 'ADD', rec: 'sk-live-9f2a…', col: C.rose, why: 'names a durable entity — salience alone does not save you' },
        full: { act: 'REFUSE', rec: 'never persisted', col: C.green, why: 'hard rule, not a heuristic — assume anything stored comes back in a context window' }
      },
      {
        src: 'user', txt: "I've moved to Bangalore",
        all: { act: 'ADD', rec: '(user, lives_in, Bangalore)', col: C.amber, why: 'appended alongside the old city' },
        salient: { act: 'ADD', rec: '(user, lives_in, Bangalore)', col: C.amber, why: 'appended — both cities now retrieve' },
        full: { act: 'SUPERSEDE', rec: 'close Hyderabad [→ 2026-09-04]; open Bangalore [2026-09-05 →]', col: C.green, why: 'same slot, so the old assertion is closed rather than shadowed' }
      }
    ];

    function scoreStore(pol) {
      var good = 0, junk = 0, danger = 0, contra = 0;
      for (var i = 0; i < OBS.length; i++) {
        var d = OBS[i][pol];
        if (d.act === 'SKIP' || d.act === 'DROP' || d.act === 'REFUSE') continue;
        if (i === 6) { danger++; continue; }
        if (i === 0 || i === 4 && pol !== 'full') { junk++; continue; }
        if (i === 1 || i === 2) { if (pol === 'full') continue; junk++; contra = 1; continue; }
        good++;
      }
      return { good: good, junk: junk, danger: danger, contra: contra };
    }

    reg('fig-triage', {
      w: W, h: H, dur: 1100, hold: 800,
      params: { pol: 'full' },
      stages: [
        { t: 'A greeting', c: 'Nothing to carry forward. Under "store everything" it still becomes a record.' },
        { t: 'A preference — maybe', c: 'Preference-shaped and about the user, which is exactly the pattern a salience rule fires on.' },
        { t: 'The retraction', c: 'And here is why a write policy cannot be a per-message classifier: the correct decision about message 2 depends on message 3.' },
        { t: 'A durable fact', c: 'Salient, novel, stable, user-stated. Every policy agrees; a full policy also records the provenance and the confidence.' },
        { t: 'A large tool dump', c: 'Three thousand paths. Storing it raw floods the store; storing nothing loses a real conclusion. The right move is to keep what you learned, not what you read.' },
        { t: 'A failure and its fix', c: 'The single most valuable record type an agent produces — and the one that most justifies gating on outcome, because a failed attempt should not become precedent.' },
        { t: 'A credential', c: 'Salience does not save you here. This is where a heuristic has to be replaced by a hard rule.' },
        { t: 'A change of state', c: 'Not new information — a correction to information already held. Append and both cities retrieve; supersede and only one does.' },
        { t: 'What is in the store', c: function (st) { return 'Under the ' + st.params.pol + ' policy, this is what the agent will read back later.'; } },
        { t: 'Three stores compared', c: 'Storing everything and storing salient things produce stores of similar size and very different composition. The difference is not volume; it is what fraction is safe to act on.' }
      ],
      controls: function (panel, st, render) {
        var btns = panel.querySelectorAll('#triage-policy button');
        for (var i = 0; i < btns.length; i++) {
          (function (b) {
            b.addEventListener('click', function () {
              st.params.pol = b.getAttribute('data-policy');
              for (var q = 0; q < btns.length; q++) btns[q].setAttribute('aria-pressed', btns[q] === b ? 'true' : 'false');
              render();
            });
          })(btns[i]);
        }
      },
      draw: function (i, p, st) {
        var s = '', view = [0, 0, W, H], pol = st.params.pol;
        var polName = pol === 'all' ? 'STORE EVERYTHING' : (pol === 'salient' ? 'SALIENCE ONLY' : 'FULL POLICY');
        s += title(56, 40, 'OBSERVATION STREAM  ·  POLICY: ' + polName, { size: 11.5 });

        if (i === 9) {
          var f = eout(p);
          var pols = ['all', 'salient', 'full'];
          var names = ['store everything', 'salience only', 'full policy'];
          for (var m = 0; m < 3; m++) {
            var sc = scoreStore(pols[m]);
            var x = 56 + m * 300, y = 70;
            var isCur = pols[m] === pol;
            s += R(x, y, 276, 440, { rx: 3, fill: C.wash, stroke: isCur ? C.green : C.line2, sw: isCur ? 1.5 : 1, op: f });
            s += T(x + 16, y + 28, names[m], { size: 13, weight: 700, fill: isCur ? C.green : C.dim, disp: true, op: f });
            s += T(x + 16, y + 48, (sc.good + sc.junk + sc.danger) + ' records written', { size: 10, fill: C.faint, op: f });
            var bars = [['useful', sc.good, C.green], ['junk', sc.junk, C.amber], ['dangerous', sc.danger, C.rose]];
            for (var b = 0; b < 3; b++) {
              var by = y + 82 + b * 58;
              s += T(x + 16, by, bars[b][0], { size: 10, fill: bars[b][2], op: f });
              s += R(x + 16, by + 8, 244, 18, { fill: '#0b0f12', stroke: C.line2, op: f });
              s += R(x + 17, by + 9, 242 * clamp(bars[b][1] / 5, 0, 1) * f, 16, { fill: bars[b][2], op: 0.55 * f });
              s += T(x + 252, by + 22, String(bars[b][1]), { size: 11, fill: C.ink, anchor: 'end', weight: 600, op: f });
            }
            var flags = [];
            if (sc.contra) flags.push('· contradictory pair in the store');
            if (sc.danger) flags.push('· a live credential is retrievable');
            if (pols[m] === 'all') flags.push('· 81 KB of paths crowding retrieval');
            if (pols[m] === 'full') { flags.push('· no contradictions'); flags.push('· no secrets'); flags.push('· one reusable skill'); }
            for (var fl = 0; fl < flags.length; fl++) {
              s += T(x + 16, y + 288 + fl * 22, flags[fl], { size: 10, fill: flags[fl].indexOf('no ') > 0 || flags[fl].indexOf('reusable') > 0 ? C.green : C.rose, op: f });
            }
            s += T(x + 16, y + 412, pols[m] === 'full' ? 'safe to act on' : 'requires adjudication at read time',
              { size: 10.5, fill: pols[m] === 'full' ? C.green : C.amber, weight: 600, op: f });
          }
          return { svg: s, view: view };
        }

        var shown = clamp(i + 1, 1, 8);
        if (i === 8) shown = 8;
        for (var k = 0; k < 8; k++) {
          var y2 = 62 + k * 54;
          var d = OBS[k][pol];
          var vis = k < shown ? 1 : 0.16;
          var isNew = (k === i) && i <= 7;
          var op = isNew ? eout(p) : vis;
          var revealed = k < shown;

          s += R(56, y2, 440, 46, { rx: 2, fill: C.wash, stroke: isNew ? C.blue : C.line2, sw: isNew ? 1.4 : 1, op: Math.max(op, 0.16) });
          s += T(68, y2 + 18, OBS[k].src, { size: 8.5, fill: OBS[k].src === 'tool' ? C.violet : (OBS[k].src === 'agent' ? C.amber : C.blue), ls: '0.12em', op: Math.max(op, 0.16) });
          s += WRAP(68, y2 + 34, OBS[k].txt, 416, { size: 10, fill: C.ink, op: Math.max(op, 0.16) });

          if (revealed) {
            var dop = isNew ? eout(seg(p, 0.35, 1)) : 1;
            s += ARR(500, y2 + 23, 528, y2 + 23, { stroke: d.col, sw: 1.3, op: dop, head: 6 });
            s += R(536, y2, 408, 46, { rx: 2, fill: 'rgba(0,0,0,0.2)', stroke: d.col, sw: 1.1, op: dop * 0.95 });
            s += T(548, y2 + 18, d.act, { size: 10, weight: 700, fill: d.col, ls: '0.1em', op: dop });
            if (d.rec) s += WRAP(596, y2 + 18, d.rec, 340, { size: 9, fill: C.ink, op: dop });
            s += WRAP(548, y2 + 36, d.why, 388, { size: 8.6, fill: C.faint, op: dop });
          }
        }

        if (i === 8) {
          var f2 = eout(p);
          var sc2 = scoreStore(pol);
          s += R(56, 504, 888, 76, { rx: 3, fill: C.wash, stroke: C.green, sw: 1.2, op: f2 });
          s += T(72, 528, 'RESULTING STORE', { size: 10, fill: C.dim, ls: '0.13em', op: f2 });
          s += T(72, 558, (sc2.good + sc2.junk + sc2.danger) + ' records', { size: 20, weight: 700, fill: C.ink, disp: true, op: f2 });
          s += T(200, 542, sc2.good + ' useful', { size: 11, fill: C.green, op: f2 });
          s += T(200, 562, sc2.junk + ' junk', { size: 11, fill: C.amber, op: f2 });
          s += T(320, 542, sc2.danger + ' dangerous', { size: 11, fill: C.rose, op: f2 });
          s += T(320, 562, sc2.contra ? 'contradiction present' : 'no contradictions', { size: 11, fill: sc2.contra ? C.rose : C.green, op: f2 });
          s += WRAP(520, 542, pol === 'full'
            ? 'every surviving record carries provenance, a timestamp and a scope; one of them is executable'
            : 'the agent will read all of this back later and cannot tell which parts to trust', 410, { size: 10, fill: C.dim, op: f2 });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 9 — append / replace / supersede
     ========================================================= */
  (function () {
    var W = 1000, H = 560;
    var t0 = 90, t1 = 940;
    function tx(f) { return lerp(t0, t1, f); }
    var MOVE = 0.62;

    function timeline(y, label, col) {
      var s = L(t0, y, t1, y, { stroke: C.line2, sw: 1.2 });
      s += T(t0 - 12, y + 4, label, { size: 10, fill: col || C.dim, anchor: 'end', weight: 600 });
      return s;
    }
    function ticks(y) {
      var lbl = ['Jun 2023', 'Jan 2025', 'Aug 2026', 'Sep 2026', 'now'];
      var at = [0.02, 0.32, 0.60, 0.78, 0.98];
      var s = '';
      for (var i = 0; i < lbl.length; i++) {
        s += L(tx(at[i]), y - 5, tx(at[i]), y + 5, { stroke: C.line2 });
        s += T(tx(at[i]), y + 22, lbl[i], { size: 8.6, fill: C.faint, anchor: 'middle' });
      }
      return s;
    }

    reg('fig-temporal', {
      w: W, h: H, dur: 1250, hold: 800,
      stages: [
        { t: 'One assertion', c: 'The store learns that the user lives in Hyderabad and files it as a fact with no end.' },
        { t: 'It answers', c: 'Asked where the user lives, retrieval returns one record and the answer is right.' },
        { t: 'The world changes', c: 'In September the user mentions they have moved. The old record is not wrong about the past — it is wrong about now.' },
        { t: 'Append-only', c: 'The naive write adds a second record. Both are true statements about different times, and nothing in the store says which time.' },
        { t: 'The ambiguity', c: 'Both embed to nearly the same point, so both retrieve. The model has to adjudicate, and it will do so using ordering or recency in the prompt — neither of which is a fact about the world.' },
        { t: 'Delete and replace', c: 'The obvious fix: overwrite. Now the current question is answered correctly again.' },
        { t: 'What it cost', c: 'But the history is gone. "Where were they living when we shipped the v2 release?" is now unanswerable, and nothing in the system flags that it used to be.' },
        { t: 'Supersede', c: 'Close the old interval instead of deleting the record. One assertion ends, another begins, and both remain queryable.' },
        { t: 'Both questions answer', c: 'A filter on valid_to = ∞ gives the present; a filter on a date gives the past. This is the same move relational databases made for the same reason.' },
        { t: 'Two clocks', c: 'The move happened in July; the system learned in September. Conflating event time with ingestion time makes "what did we believe when we decided that?" unanswerable.' }
      ],
      draw: function (i, p) {
        var s = '', view = [0, 0, W, H];
        s += title(56, 40, 'ONE SLOT:  lives_in(user, ?)', { size: 12 });

        var mode = i <= 4 ? 'append' : (i <= 6 ? 'replace' : 'supersede');
        var modeName = { append: 'APPEND-ONLY', replace: 'DELETE AND REPLACE', supersede: 'SUPERSEDE' }[mode];
        var modeCol = { append: C.rose, replace: C.amber, supersede: C.green }[mode];
        s += T(944, 40, modeName, { size: 11, fill: modeCol, anchor: 'end', weight: 700, ls: '0.13em' });

        var y1 = 130, y2 = 190;
        s += timeline(y1, 'm₁', C.blue);
        s += timeline(y2, 'm₂', C.green);
        s += ticks(250);

        /* m1 bar */
        var m1End = (i >= 7) ? lerp(0.98, MOVE, i === 7 ? ease(p) : 1) : 0.98;
        var m1Vis = (mode === 'replace' && i >= 5) ? (i === 5 ? 1 - ease(p) : 0) : 1;
        if (m1Vis > 0.02) {
          s += R(tx(0.02), y1 - 11, tx(m1End) - tx(0.02), 22, { rx: 2, fill: C.blue, op: 0.28 * m1Vis, stroke: C.blue, sw: 1.1 });
          s += T(tx(0.02) + 10, y1 + 4, 'lives_in(user, Hyderabad)', { size: 10.5, fill: C.ink, op: m1Vis });
          if (i >= 7) {
            s += T(tx(m1End) + 8, y1 + 4, 'valid_to = 2026-08-31', { size: 9.5, fill: C.blue, op: (i === 7 ? eout(p) : 1) });
          } else if (m1Vis > 0.5) {
            s += T(tx(0.98) - 8, y1 - 18, 'valid_to = ∞', { size: 9.5, fill: C.rose, anchor: 'end', op: m1Vis });
          }
        }
        if (mode === 'replace' && i === 5 && p > 0.3) {
          s += T(tx(0.5), y1 - 26, 'deleted', { size: 11, fill: C.rose, anchor: 'middle', weight: 600, op: eout(seg(p, 0.3, 1)) });
        }

        /* m2 bar */
        var m2On = i >= 3 ? (i === 3 ? eout(p) : 1) : 0;
        if (m2On > 0.02) {
          s += R(tx(MOVE), y2 - 11, tx(0.98) - tx(MOVE), 22, { rx: 2, fill: C.green, op: 0.28 * m2On, stroke: C.green, sw: 1.1 });
          s += T(tx(MOVE) + 10, y2 + 4, 'lives_in(user, Bangalore)', { size: 10.5, fill: C.ink, op: m2On });
          s += T(tx(0.98) - 8, y2 - 18, 'valid_from = 2026-09-01', { size: 9.5, fill: C.green, anchor: 'end', op: m2On });
        }

        /* the change event */
        if (i >= 2) {
          var evOp = i === 2 ? eout(p) : 0.8;
          s += L(tx(MOVE), 96, tx(MOVE), 268, { stroke: C.amber, sw: 1.2, dash: '4 4', op: evOp });
          s += T(tx(MOVE), 88, '"I\'ve moved to Bangalore"', { size: 10, fill: C.amber, anchor: 'middle', op: evOp, weight: 600 });
        }

        /* query panels */
        var qy = 310;
        function queryPanel(x, q, ans, ok, op, note) {
          var out = R(x, qy, 420, 118, { rx: 3, fill: C.wash, stroke: ok === 1 ? C.green : (ok === 0 ? C.rose : C.amber), sw: 1.2, op: op });
          out += T(x + 14, qy + 24, 'QUERY', { size: 9, fill: C.faint, ls: '0.13em', op: op });
          out += T(x + 14, qy + 44, q, { size: 11, fill: C.ink, op: op });
          out += L(x + 14, qy + 58, x + 406, qy + 58, { stroke: C.line, op: op });
          out += WRAP(x + 14, qy + 78, ans, 392, { size: 11, fill: ok === 1 ? C.green : (ok === 0 ? C.rose : C.amber), op: op, weight: 500 });
          if (note) out += WRAP(x + 14, qy + 100, note, 392, { size: 9, fill: C.faint, op: op });
          return out;
        }

        if (i === 1) s += queryPanel(56, 'where does the user live?', 'Hyderabad  ✓  one record, unambiguous', 1, eout(p));
        if (i === 3) s += queryPanel(56, 'the store now holds', 'two records in the same slot, neither marked current', 2, eout(p));
        if (i === 4) {
          var f4 = eout(p);
          s += queryPanel(56, 'where does the user live?', 'Hyderabad? Bangalore? both retrieve', 0, f4,
            'cos(m₁, m₂) ≈ 0.97 — they differ by one token in the same slot');
          s += R(512, qy, 432, 118, { rx: 3, fill: C.wash, stroke: C.rose, sw: 1.2, op: f4 });
          s += T(526, qy + 24, 'WHAT THE MODEL SEES', { size: 9, fill: C.faint, ls: '0.13em', op: f4 });
          s += T(526, qy + 46, '[memory] user lives in Hyderabad', { size: 10, fill: C.dim, op: f4 });
          s += T(526, qy + 64, '[memory] user lives in Bangalore', { size: 10, fill: C.dim, op: f4 });
          s += WRAP(526, qy + 90, 'no timestamps, no validity — the answer is decided by prompt ordering, not by the world', 404, { size: 9.5, fill: C.rose, op: f4 });
        }
        if (i === 5) s += queryPanel(56, 'where does the user live?', 'Bangalore  ✓  correct again', 1, eout(p));
        if (i === 6) {
          s += queryPanel(56, 'where were they living at the v2 release?', 'unanswerable — the record was destroyed', 0, eout(p),
            'and nothing in the system reports that this used to be answerable');
        }
        if (i >= 8) {
          var f8 = i === 8 ? eout(p) : 1;
          s += queryPanel(56, 'where do they live now?', 'Bangalore  ✓  filter valid_to = ∞', 1, f8);
          s += queryPanel(512, 'where at the v2 release (Mar 2026)?', 'Hyderabad  ✓  filter date ∈ [valid_from, valid_to]', 1, f8);
        }

        if (i === 9) {
          var f9 = eout(p);
          s += R(56, 448, 888, 96, { rx: 3, fill: C.wash, stroke: C.violet, sw: 1.3, op: f9 });
          s += T(72, 472, 'TWO CLOCKS', { size: 10, fill: C.violet, ls: '0.13em', weight: 600, op: f9 });
          s += T(72, 498, 'event time', { size: 10.5, fill: C.dim, op: f9 });
          s += T(190, 498, 'the move happened in July 2026', { size: 11, fill: C.ink, op: f9 });
          s += T(72, 522, 'ingestion time', { size: 10.5, fill: C.dim, op: f9 });
          s += T(190, 522, 'the system learned it on 5 September 2026', { size: 11, fill: C.ink, op: f9 });
          s += WRAP(560, 498, 'keep both, or "what did we believe when we made that call?" has no answer', 370, { size: 10, fill: C.violet, op: f9 });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 10 — truth density under append-only vs managed
     ========================================================= */
  (function () {
    var W = 1000, H = 540;
    var gx = 88, gy = 84, gw = 500, gh = 340;
    var TMAX = 100;   /* steps, arbitrary units */
    var A = 6;        /* facts per step */

    function nTrue(t, lam) { return (A / lam) * (1 - Math.exp(-lam * t)); }
    function nAll(t) { return A * t; }
    function rhoAppend(t, lam) { return t <= 0 ? 1 : clamp(nTrue(t, lam) / nAll(t), 0, 1); }
    function rhoManaged(t, lam, rec) {
      if (t <= 0) return 1;
      var tr = nTrue(t, lam), stale = nAll(t) - tr;
      var kept = tr + (1 - rec) * stale;
      return clamp(tr / Math.max(kept, 1e-6), 0, 1);
    }

    reg('fig-forgetting', {
      w: W, h: H, dur: 1300, hold: 800,
      params: { lam: 0.12, rec: 0.7 },
      stages: [
        { t: 'Facts arrive', c: 'Six new assertions per step, forever. Nothing here is controversial — this is just what a long-running agent does.' },
        { t: 'Facts go stale', c: 'Each one stays true for an exponentially distributed time. A constant hazard is the simplest assumption that is not obviously wrong.' },
        { t: 'The store grows linearly', c: 'N(t) = a·t. Append-only means the record count is a straight line with no ceiling.' },
        { t: 'True facts saturate', c: 'But the number of currently-true facts converges to a/λ. Arrivals and expirations balance, and the true set stops growing.' },
        { t: 'The ratio', c: 'One line grows without bound, the other flattens. Their ratio is the fraction of your memory that is actually true.' },
        { t: 'ρ(t) ≈ 1 / λt', c: 'The truth density of an append-only store decays like 1/t. After ten fact-lifetimes roughly one record in ten is current; after a hundred, one in a hundred.' },
        { t: 'With deletion', c: 'Catch a fraction of the stale records and the curve flattens. Deletion recall is the single parameter that decides whether the store rots.' },
        { t: 'Growth alone hurts', c: 'Even with nothing going stale, retrieval returns a fixed k. Distractors scale with store size while relevant items do not, so precision@k falls purely from growth.' },
        { t: 'The slogan', c: 'An agent with no memory of an incident asks about it. An agent with a wrong memory of it acts. Bad memory is worse than no memory.' }
      ],
      controls: function (panel, st, render) {
        var sl = panel.querySelector('#forget-lambda'), o1 = panel.querySelector('#forget-lambda-out');
        var sr = panel.querySelector('#forget-recall'), o2 = panel.querySelector('#forget-recall-out');
        if (sl) sl.addEventListener('input', function () { st.params.lam = parseInt(sl.value, 10) / 100; o1.textContent = st.params.lam.toFixed(2); render(); });
        if (sr) sr.addEventListener('input', function () { st.params.rec = parseInt(sr.value, 10) / 100; o2.textContent = sr.value + '%'; render(); });
      },
      draw: function (i, p, st) {
        var s = '', view = [0, 0, W, H];
        var lam = clamp(st.params.lam, 0.01, 1), rec = clamp(st.params.rec, 0, 1);

        s += title(88, 40, 'AN APPEND-ONLY MEMORY, OVER TIME', { size: 12 });
        s += T(88, 60, 'a = ' + A + ' facts / step   ·   λ = ' + lam.toFixed(2) + ' / step   ·   deletion recall = ' + Math.round(rec * 100) + '%', { size: 10, fill: C.faint });

        var countMode = i <= 3;
        var maxCount = A * TMAX;
        s += R(gx, gy, gw, gh, { rx: 2, fill: '#0b0f12', stroke: C.line2 });
        for (var g = 0; g <= 4; g++) {
          var yy = gy + gh * g / 4;
          s += L(gx, yy, gx + gw, yy, { stroke: C.line, op: 0.75 });
          s += T(gx - 8, yy + 3.5, countMode ? fmt(maxCount - maxCount * g / 4) : (1 - g / 4).toFixed(2),
            { size: 9, fill: C.faint, anchor: 'end' });
        }
        for (var g2 = 0; g2 <= 5; g2++) {
          var xx = gx + gw * g2 / 5;
          s += L(xx, gy + gh, xx, gy + gh + 5, { stroke: C.line2 });
          s += T(xx, gy + gh + 20, String(Math.round(TMAX * g2 / 5)), { size: 9, fill: C.faint, anchor: 'middle' });
        }
        s += T(gx + gw / 2, gy + gh + 42, 'steps →', { size: 10, fill: C.faint, anchor: 'middle' });
        s += T(gx - 8, gy - 12, countMode ? 'records' : 'fraction of the store that is currently true', { size: 10, fill: C.dim });

        function plot(fn, col, sw, upto, dash, op) {
          var d = '', first = true;
          for (var t = 0; t <= 160; t++) {
            var tt = TMAX * t / 160;
            if (tt / TMAX > upto) break;
            var v = fn(tt);
            var px = gx + (tt / TMAX) * gw;
            var py = gy + gh - (countMode ? clamp(v / maxCount, 0, 1) : clamp(v, 0, 1)) * gh;
            d += (first ? 'M' : 'L') + r2(px) + ' ' + r2(py); first = false;
          }
          return P(d, { stroke: col, sw: sw || 2, dash: dash, op: op });
        }

        if (countMode) {
          var upA = (i === 2) ? ease(p) : (i >= 2 ? 1 : (i === 0 ? ease(p) * 0.35 : 0.35));
          s += plot(nAll, C.rose, 2.2, upA);
          if (i >= 2) s += T(gx + gw - 8, gy + 24, 'N(t) = a·t   all records', { size: 10.5, fill: C.rose, anchor: 'end' });
          if (i >= 3) {
            var upT = (i === 3) ? ease(p) : 1;
            s += plot(function (t) { return nTrue(t, lam); }, C.green, 2.2, upT);
            var satY = gy + gh - clamp((A / lam) / maxCount, 0, 1) * gh;
            s += L(gx, satY, gx + gw, satY, { stroke: C.green, dash: '3 5', op: 0.5 });
            s += T(gx + 10, satY - 8, 'a/λ = ' + fmt(A / lam) + '  (saturates)', { size: 10, fill: C.green });
            s += T(gx + gw - 8, satY + 20, 'still-true records', { size: 10.5, fill: C.green, anchor: 'end' });
          }
          if (i === 1) {
            var f1 = eout(p);
            for (var q = 0; q < 12; q++) {
              var qx = gx + 30 + q * 38, qy2 = gy + 60;
              var dead = q < Math.round(f1 * 8);
              s += R(qx, qy2, 26, 26, { rx: 2, fill: dead ? C.rose : C.green, op: dead ? 0.3 : 0.45, stroke: dead ? C.rose : C.green });
              if (dead) s += T(qx + 13, qy2 + 18, '✕', { size: 12, fill: C.rose, anchor: 'middle' });
            }
            s += T(gx + 30, gy + 44, 'each fact has a lifetime ~ Exp(λ)', { size: 10, fill: C.dim, op: f1 });
          }
          if (i === 0) {
            var f0 = eout(p);
            s += T(gx + 30, gy + 44, 'six new assertions per step, indefinitely', { size: 10.5, fill: C.rose, op: f0 });
          }
        } else {
          var upR = (i === 4) ? ease(p) : 1;
          s += plot(function (t) { return rhoAppend(t, lam); }, C.rose, 2.4, upR);
          s += T(gx + gw - 8, gy + gh - rhoAppend(TMAX, lam) * gh - 14, 'append-only', { size: 10.5, fill: C.rose, anchor: 'end' });
          if (i >= 5) {
            s += plot(function (t) { return 1 / Math.max(lam * t, 1e-6); }, C.amber, 1.4, 1, '4 4', i === 5 ? eout(p) : 0.7);
            var fop = i === 5 ? eout(p) : 0.9;
            s += R(gx + 8, gy + 10, 300, 26, { rx: 2, fill: '#0b0f12', stroke: C.amber, sw: 1, op: fop * 0.9 });
            s += T(gx + 18, gy + 28, 'ρ(t) = (1 − e^(−λt)) / λt   ≈   1/λt', { size: 12, fill: C.amber, op: fop });
          }
          if (i >= 6) {
            var upM = (i === 6) ? ease(p) : 1;
            s += plot(function (t) { return rhoManaged(t, lam, rec); }, C.green, 2.4, upM);
            s += T(gx + gw - 8, gy + gh - rhoManaged(TMAX, lam, rec) * gh - 14,
              'with deletion (recall ' + Math.round(rec * 100) + '%)', { size: 10.5, fill: C.green, anchor: 'end' });
          }
          /* readouts at t = TMAX */
          s += R(626, gy, 314, 130, { rx: 3, fill: C.wash, stroke: C.line2 });
          s += T(642, gy + 24, 'AT STEP ' + TMAX, { size: 9.5, fill: C.faint, ls: '0.13em' });
          s += T(642, gy + 52, 'append-only', { size: 10.5, fill: C.rose });
          s += T(924, gy + 52, Math.round(rhoAppend(TMAX, lam) * 100) + '% true', { size: 13, fill: C.rose, anchor: 'end', weight: 700 });
          if (i >= 6) {
            s += T(642, gy + 80, 'with deletion', { size: 10.5, fill: C.green });
            s += T(924, gy + 80, Math.round(rhoManaged(TMAX, lam, rec) * 100) + '% true', { size: 13, fill: C.green, anchor: 'end', weight: 700 });
          }
          s += T(642, gy + 110, fmt(nAll(TMAX)) + ' records held', { size: 10, fill: C.dim });
        }

        /* precision@k panel */
        if (i === 7) {
          var f7 = eout(p);
          s += R(626, 240, 314, 184, { rx: 3, fill: C.wash, stroke: C.amber, sw: 1.2, op: f7 });
          s += T(642, 264, 'PRECISION AT FIXED k', { size: 9.5, fill: C.amber, ls: '0.13em', op: f7 });
          var sizes = [200, 2000, 20000];
          for (var z = 0; z < 3; z++) {
            var yz = 292 + z * 44;
            var prec = clamp(6 / (6 + 0.0016 * sizes[z]), 0, 1);
            s += T(642, yz, 'n = ' + fmt(sizes[z]), { size: 10, fill: C.dim, op: f7 });
            s += R(722, yz - 11, 160, 14, { fill: '#0b0f12', stroke: C.line2, op: f7 });
            s += R(723, yz - 10, 158 * prec * f7, 12, { fill: C.amber, op: 0.55 });
            s += T(924, yz, Math.round(prec * 100) + '%', { size: 10.5, fill: C.amber, anchor: 'end', weight: 600, op: f7 });
          }
          s += WRAP(642, 412, 'relevant items stay fixed; distractors scale with n', 284, { size: 9.5, fill: C.faint, op: f7 });
        }

        if (i === 8) {
          var f9 = eout(p);
          s += R(626, 240, 314, 184, { rx: 3, fill: C.wash, stroke: C.rose, sw: 1.3, op: f9 });
          s += T(642, 272, 'BAD MEMORY IS', { size: 15, fill: C.rose, weight: 700, disp: true, op: f9 });
          s += T(642, 296, 'WORSE THAN', { size: 15, fill: C.rose, weight: 700, disp: true, op: f9 });
          s += T(642, 320, 'NO MEMORY', { size: 15, fill: C.rose, weight: 700, disp: true, op: f9 });
          s += WRAP(642, 356, 'an agent with no memory of an incident asks. an agent with a wrong memory of it acts.', 284, { size: 10.5, fill: C.ink, op: f9 });
        }
        return { svg: s, view: view };
      }
    });
  })();

})();
