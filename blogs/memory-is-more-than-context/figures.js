/* ============================================================
   Memory Is More Than Context — figure engine + figures 1–5
   Pure SVG, regenerated per frame. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- palette + type ---------- */
  var C = {
    ink: '#e4eaee', dim: '#93a0a8', faint: '#63727c',
    bg: '#0f1317', line: '#242c34', line2: '#39454e', wash: '#141a20',
    green: '#3fd1a0', blue: '#5ab2e8', amber: '#e8b45a',
    rose: '#e8746a', violet: '#b48ae8', teal: '#4fb8b0'
  };
  var FM = "'IBM Plex Mono', ui-monospace, monospace";
  var FD = "'Bricolage Grotesque', system-ui, sans-serif";

  /* ---------- math helpers ---------- */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function eout(t) { return 1 - Math.pow(1 - t, 3); }
  function ein(t) { return t * t * t; }
  function r2(n) { return Math.round(n * 100) / 100; }
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }

  /* ---------- svg string builders ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function A(o) {
    var s = '';
    for (var k in o) {
      if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
      var v = o[k];
      if (v === null || v === undefined || v === '') continue;
      if (typeof v === 'number') {
        if (!isFinite(v)) throw new Error('non-finite attribute ' + k + '=' + v);
        v = r2(v);
      }
      s += ' ' + k + '="' + v + '"';
    }
    return s;
  }
  function el(tag, attrs, inner) {
    if (inner === undefined || inner === null) return '<' + tag + A(attrs) + '/>';
    return '<' + tag + A(attrs) + '>' + inner + '</' + tag + '>';
  }
  function R(x, y, w, h, o) {
    o = o || {};
    return el('rect', {
      x: x, y: y, width: Math.max(0, w), height: Math.max(0, h), rx: o.rx || 0,
      fill: o.fill || 'none', stroke: o.stroke || '', 'stroke-width': o.sw || (o.stroke ? 1 : ''),
      opacity: o.op, 'stroke-dasharray': o.dash
    });
  }
  function L(x1, y1, x2, y2, o) {
    o = o || {};
    return el('line', {
      x1: x1, y1: y1, x2: x2, y2: y2, stroke: o.stroke || C.line2,
      'stroke-width': o.sw || 1, opacity: o.op, 'stroke-dasharray': o.dash,
      'stroke-linecap': o.cap
    });
  }
  function P(d, o) {
    o = o || {};
    return el('path', {
      d: d, fill: o.fill || 'none', stroke: o.stroke || '', 'stroke-width': o.sw || (o.stroke ? 1 : ''),
      opacity: o.op, 'stroke-dasharray': o.dash, 'stroke-linecap': o.cap, 'stroke-linejoin': o.join,
      'marker-end': o.marker
    });
  }
  function CIR(cx, cy, r, o) {
    o = o || {};
    return el('circle', {
      cx: cx, cy: cy, r: Math.max(0, r), fill: o.fill || 'none', stroke: o.stroke || '',
      'stroke-width': o.sw || (o.stroke ? 1 : ''), opacity: o.op, 'stroke-dasharray': o.dash
    });
  }
  function T(x, y, s, o) {
    o = o || {};
    return el('text', {
      x: x, y: y, fill: o.fill || C.ink,
      'font-family': o.disp ? FD : FM,
      'font-size': o.size || 12, 'font-weight': o.weight || 400,
      'text-anchor': o.anchor || 'start', opacity: o.op,
      'letter-spacing': o.ls, 'dominant-baseline': o.base
    }, esc(s));
  }
  /* arrow with a triangular head, drawn as one path so it scales cleanly */
  function ARR(x1, y1, x2, y2, o) {
    o = o || {};
    var col = o.stroke || C.line2, sw = o.sw || 1.4, hd = o.head || 7;
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) return '';
    var ux = dx / len, uy = dy / len;
    var bx = x2 - ux * hd, by = y2 - uy * hd;
    var px = -uy, py = ux;
    var out = L(x1, y1, bx, by, { stroke: col, sw: sw, op: o.op, dash: o.dash, cap: 'round' });
    out += P('M' + r2(x2) + ' ' + r2(y2) + 'L' + r2(bx + px * hd * 0.5) + ' ' + r2(by + py * hd * 0.5) +
      'L' + r2(bx - px * hd * 0.5) + ' ' + r2(by - py * hd * 0.5) + 'Z',
      { fill: col, op: o.op });
    return out;
  }
  /* rounded label chip */
  function CHIP(x, y, w, h, label, o) {
    o = o || {};
    var s = R(x, y, w, h, { rx: o.rx === undefined ? 3 : o.rx, fill: o.fill || C.wash, stroke: o.stroke || C.line2, sw: o.sw || 1, op: o.op });
    if (label) {
      s += T(o.center ? x + w / 2 : x + (o.pad || 10), y + h / 2 + (o.size || 11) * 0.36, label, {
        fill: o.tx || C.ink, size: o.size || 11, weight: o.weight || 500,
        anchor: o.center ? 'middle' : 'start', op: o.op, disp: o.disp
      });
    }
    return s;
  }
  function title(x, y, s, o) {
    o = o || {};
    return T(x, y, s, { fill: o.fill || C.dim, size: o.size || 11, weight: 600, ls: '0.14em', op: o.op, anchor: o.anchor });
  }
  /* multi-line wrapped mono text */
  function WRAP(x, y, s, width, o) {
    o = o || {};
    var size = o.size || 11, cw = size * 0.6, per = Math.max(4, Math.floor(width / cw));
    var words = String(s).split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var t = cur ? cur + ' ' + words[i] : words[i];
      if (t.length > per && cur) { lines.push(cur); cur = words[i]; } else { cur = t; }
    }
    if (cur) lines.push(cur);
    var out = '';
    for (var j = 0; j < lines.length; j++) {
      out += T(x, y + j * (size * 1.42), lines[j], o);
    }
    return out;
  }

  /* ---------- registry + engine ---------- */
  var REG = {};
  function reg(id, def) { REG[id] = def; }

  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function mount(id) {
    var panel = document.querySelector('[data-fig="' + id + '"]');
    var def = REG[id];
    if (!panel || !def) return null;
    var host = panel.querySelector('.fig-svg');
    var capEl = panel.querySelector('.stage-caption');
    var statusEl = panel.querySelector('.animation-status');
    var total = def.stages.length;
    var DUR = def.dur || 1500, HOLD = def.hold || 800;

    var st = { i: 0, t: 0, playing: false, speed: 1, params: {}, visible: false };
    if (def.params) for (var k in def.params) st.params[k] = def.params[k];

    function progress() { return reduced ? 1 : clamp(st.t / DUR, 0, 1); }

    function render() {
      var p = ease(progress());
      var out;
      try { out = def.draw(st.i, p, st); }
      catch (e) {
        out = { svg: T(20, 40, 'figure error: ' + e.message, { fill: C.rose, size: 12 }) };
        if (window.console) console.error('[' + id + '] stage ' + st.i, e);
      }
      var vb = out.view || [0, 0, def.w, def.h];
      host.innerHTML = '<svg viewBox="' + r2(vb[0]) + ' ' + r2(vb[1]) + ' ' + r2(vb[2]) + ' ' + r2(vb[3]) +
        '" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet" style="max-height:' + (def.maxh || 560) + 'px">' +
        el('rect', { x: -4000, y: -4000, width: 12000, height: 12000, fill: C.bg }) + out.svg + '</svg>';
      var stage = def.stages[st.i];
      capEl.innerHTML = '<b>' + esc(stage.t) + '</b> &mdash; ' + esc(typeof stage.c === 'function' ? stage.c(st) : stage.c);
      statusEl.textContent = 'Stage ' + (st.i < 9 ? '0' : '') + (st.i + 1) + ' / ' + total;
    }

    function go(i, keepPlay) {
      st.i = ((i % total) + total) % total;
      st.t = 0;
      if (!keepPlay) { /* caller decides */ }
      render();
    }

    /* ---- controls ---- */
    var prevBtn = panel.querySelector('[data-action="previous"]');
    var nextBtn = panel.querySelector('[data-action="next"]');
    var ppBtn = panel.querySelector('[data-action="play-pause"]');
    var speedBtns = panel.querySelectorAll('[data-speed]');

    function setPlaying(v) {
      st.playing = v && !reduced;
      ppBtn.textContent = st.playing ? 'Pause' : 'Play';
      ppBtn.setAttribute('aria-pressed', st.playing ? 'true' : 'false');
      ppBtn.setAttribute('aria-label', st.playing ? 'Pause animation' : 'Play animation');
    }

    prevBtn.addEventListener('click', function () { setPlaying(false); go(st.i - 1); });
    nextBtn.addEventListener('click', function () { setPlaying(false); go(st.i + 1); });
    ppBtn.addEventListener('click', function () { setPlaying(!st.playing); });
    for (var s = 0; s < speedBtns.length; s++) {
      (function (b) {
        b.addEventListener('click', function () {
          st.speed = parseFloat(b.getAttribute('data-speed'));
          for (var q = 0; q < speedBtns.length; q++) {
            speedBtns[q].setAttribute('aria-pressed', speedBtns[q] === b ? 'true' : 'false');
          }
        });
      })(speedBtns[s]);
    }

    /* ---- optional lab controls ---- */
    if (def.controls) def.controls(panel, st, render, function () { setPlaying(false); });

    /* ---- loop ---- */
    var last = 0;
    function tick(now) {
      if (!last) last = now;
      var dt = Math.min(80, now - last); last = now;
      if (st.playing && st.visible) {
        st.t += dt * st.speed;
        if (st.t >= DUR + HOLD) { st.i = (st.i + 1) % total; st.t = 0; }
        render();
      }
      requestAnimationFrame(tick);
    }

    if (reduced) { setPlaying(false); }
    else { setPlaying(true); }
    render();

    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (ents) {
        for (var e = 0; e < ents.length; e++) st.visible = ents[e].isIntersecting;
      }, { threshold: 0.16 });
      io.observe(panel);
    } else { st.visible = true; }

    requestAnimationFrame(tick);
    return st;
  }

  function boot() {
    for (var id in REG) { if (Object.prototype.hasOwnProperty.call(REG, id)) mount(id); }
  }

  window.AGM = {
    C: C, FM: FM, FD: FD, reg: reg, REG: REG, mount: mount, boot: boot, reduced: reduced,
    clamp: clamp, lerp: lerp, ease: ease, eout: eout, ein: ein, r2: r2, seg: seg, fmt: fmt,
    esc: esc, el: el, R: R, L: L, P: P, CIR: CIR, T: T, ARR: ARR, CHIP: CHIP, title: title, WRAP: WRAP
  };

  /* =========================================================
     FIGURE 1 — three substrates
     ========================================================= */
  (function () {
    var W = 1000, H = 540;
    var LLM = { x: 400, y: 168, w: 200, h: 132 };
    var CTX = { x: 62, y: 168, w: 292, h: 132 };
    var OUT = { x: 646, y: 168, w: 292, h: 132 };
    var STORE = { x: 350, y: 392, w: 300, h: 96 };

    var toks = ['system policy', 'tool schemas', 'retrieved memory', 'plan + state', 'recent turns', 'user request'];

    function ctxBox(fill, op, label, active) {
      var s = R(CTX.x, CTX.y, CTX.w, CTX.h, { rx: 3, fill: C.wash, stroke: active ? C.blue : C.line2, sw: active ? 1.6 : 1, op: op });
      s += title(CTX.x + 12, CTX.y + 22, label, { fill: active ? C.blue : C.dim, op: op });
      for (var i = 0; i < toks.length; i++) {
        var yy = CTX.y + 36 + i * 15;
        s += R(CTX.x + 12, yy, CTX.w - 24, 11, { rx: 1.5, fill: fill, op: op * (active ? 0.5 : 0.28) });
        s += T(CTX.x + 16, yy + 9, toks[i], { size: 8.5, fill: active ? C.ink : C.faint, op: op });
      }
      return s;
    }

    function llmBox(op, thetaOp, zoomLabel) {
      var s = R(LLM.x, LLM.y, LLM.w, LLM.h, { rx: 3, fill: '#131b21', stroke: C.line2, sw: 1.4, op: op });
      s += T(LLM.x + LLM.w / 2, LLM.y + 34, 'LLM', { size: 22, weight: 700, anchor: 'middle', disp: true, op: op });
      /* theta lattice */
      if (thetaOp > 0.01) {
        for (var r = 0; r < 5; r++) {
          for (var c2 = 0; c2 < 13; c2++) {
            var v = ((r * 13 + c2) * 37 % 11) / 11;
            s += R(LLM.x + 20 + c2 * 12.5, LLM.y + 50 + r * 11, 9.5, 8, {
              rx: 1, fill: C.violet, op: thetaOp * (0.16 + v * 0.5)
            });
          }
        }
        s += T(LLM.x + LLM.w / 2, LLM.y + LLM.h - 10, 'θ  frozen', { size: 9.5, fill: C.violet, anchor: 'middle', op: thetaOp });
      }
      if (zoomLabel > 0.01) {
        s += T(LLM.x + LLM.w / 2, LLM.y - 12, 'parametric memory', { size: 10, fill: C.violet, anchor: 'middle', weight: 600, ls: '0.1em', op: zoomLabel });
      }
      return s;
    }

    function storeBox(op, active) {
      var s = R(STORE.x, STORE.y, STORE.w, STORE.h, { rx: 3, fill: C.wash, stroke: active ? C.green : C.line2, sw: active ? 1.6 : 1, op: op });
      s += title(STORE.x + 12, STORE.y + 21, 'EXTERNAL PERSISTENT STORE', { fill: active ? C.green : C.dim, op: op });
      var rows = ['(user, prefers, long-form)', 'ep#41 deploy failed → scope', 'skill: rebuild_index()'];
      for (var i = 0; i < rows.length; i++) {
        s += R(STORE.x + 12, STORE.y + 30 + i * 19, STORE.w - 24, 15, { rx: 1.5, fill: C.green, op: op * 0.12 });
        s += T(STORE.x + 17, STORE.y + 41 + i * 19, rows[i], { size: 8.5, fill: C.ink, op: op * 0.9 });
      }
      return s;
    }

    var cards = [
      { n: 'PARAMETRIC', k: 'θ', col: C.violet, rows: [['where', 'in the weights'], ['size', 'enormous'], ['token cost', 'none'], ['editable', 'no, not precisely'], ['attributable', 'no'], ['forgettable', 'no']] },
      { n: 'CONTEXTUAL', k: 'x₁:ₙ', col: C.blue, rows: [['where', 'this forward pass'], ['size', 'bounded by B'], ['token cost', 'the whole bill'], ['editable', 'completely'], ['attributable', 'yes'], ['forgettable', 'automatically']] },
      { n: 'EXTERNAL', k: 'M', col: C.green, rows: [['where', 'outside the model'], ['size', 'unbounded'], ['token cost', 'only what you load'], ['editable', 'yes, per record'], ['attributable', 'yes, with provenance'], ['forgettable', 'yes — on request']] }
    ];

    function cardScene(op, revealN) {
      var s = title(62, 46, 'THREE SUBSTRATES, THREE SETS OF PROPERTIES', { op: op, size: 12 });
      for (var i = 0; i < 3; i++) {
        var cop = op * clamp(revealN - i, 0, 1);
        if (cop < 0.01) continue;
        var x = 62 + i * 300, y = 76, w = 276, h = 400;
        s += R(x, y, w, h, { rx: 3, fill: C.wash, stroke: cards[i].col, sw: 1.3, op: cop * 0.9 });
        s += R(x, y, w, 46, { fill: cards[i].col, op: cop * 0.14 });
        s += T(x + 14, y + 21, cards[i].n, { size: 11, weight: 600, ls: '0.13em', fill: cards[i].col, op: cop });
        s += T(x + 14, y + 38, cards[i].k, { size: 13, weight: 600, fill: C.ink, op: cop });
        for (var r = 0; r < cards[i].rows.length; r++) {
          var yy = y + 74 + r * 52;
          s += T(x + 14, yy, cards[i].rows[r][0], { size: 9, fill: C.faint, ls: '0.1em', op: cop });
          s += WRAP(x + 14, yy + 18, cards[i].rows[r][1], w - 28, { size: 11.5, fill: C.ink, op: cop });
          if (r < cards[i].rows.length - 1) s += L(x + 14, yy + 32, x + w - 14, yy + 32, { stroke: C.line, op: cop * 0.8 });
        }
      }
      return s;
    }

    reg('fig-substrates', {
      w: W, h: H, dur: 1500, hold: 850,
      stages: [
        { t: 'One call', c: 'Tokens in, tokens out. The primitive is a pure function: the same input gives the same distribution, and nothing survives the return.' },
        { t: 'Parametric memory', c: 'Everything the model knows from training lives in θ. Free at inference, impossible to edit precisely, impossible to attribute or revoke.' },
        { t: 'Contextual memory', c: 'The tokens present in this forward pass. Fresh, attributable, fully editable — and the only thing you actually pay for.' },
        { t: 'The call returns', c: 'The context is gone. The KV cache is evicted or reused only as a latency optimisation; it is not a state channel between calls.' },
        { t: 'Call t+1 starts empty', c: 'Nothing from the previous call carries over automatically. If it matters later, some program outside the model has to put it back as tokens.' },
        { t: 'Write', c: 'That program is the agent. It selects from the observation stream and commits records to an external store that outlives any single call.' },
        { t: 'Read', c: 'And on the next call it retrieves from that store into the fresh context window. The two arrows — write and read — are the whole subject.' },
        { t: 'The loop', c: 'Parametric memory is fixed. Contextual memory is transient. Everything an agent learns during operation has to live in the third box and be ferried across.' },
        { t: 'Compared', c: 'Laying the three substrates side by side: they differ on every property that matters operationally.' },
        { t: 'Why the third box exists', c: 'Only external memory is simultaneously durable, editable, attributable and deletable. It exists precisely to bridge a frozen θ and a transient x.' }
      ],
      draw: function (i, p) {
        var s = '';
        var view = [0, 0, W, H];

        if (i >= 8) {
          var cardsOp = i === 8 ? eout(p) : 1;
          var reveal = i === 8 ? p * 3.4 : 3;
          if (i === 8 && p < 0.45) {
            /* cross-fade out of the diagram */
            var fo = 1 - seg(p, 0, 0.45);
            s += ctxBox(C.blue, fo * 0.6, 'CONTEXT WINDOW', false) + llmBox(fo * 0.6, fo * 0.6, 0) + storeBox(fo * 0.6, false);
          }
          s += cardScene(cardsOp, reveal);
          if (i === 9) {
            var hl = eout(p);
            s += R(62, 76, 876, 400, { rx: 3, stroke: C.green, sw: 1.4, op: hl * 0.35, dash: '4 5' });
            s += R(662, 76, 276, 400, { rx: 3, fill: C.green, op: hl * 0.07 });
            s += T(500, 508, 'durable  ·  editable  ·  attributable  ·  deletable  —  only the third box has all four',
              { size: 12.5, anchor: 'middle', fill: C.green, weight: 600, op: hl });
          }
          return { svg: s, view: view };
        }

        /* ---- diagram scene ---- */
        var thetaOp = i >= 1 ? (i === 1 ? eout(p) : 1) : 0;
        var ctxOp = i >= 2 ? (i === 2 ? eout(p) : 1) : 0.18;
        var ctxActive = (i === 2) || (i === 6 && p > 0.5);
        var storeOp = i >= 5 ? (i === 5 ? eout(seg(p, 0, 0.5)) : 1) : 0;

        /* camera */
        if (i === 1) { var z = ease(p); view = [lerp(0, 360, z), lerp(0, 152, z), lerp(W, 280, z), lerp(H, 151, z)]; }
        else if (i === 2) { var z2 = ease(p); view = [lerp(360, 30, z2), lerp(152, 138, z2), lerp(280, 360, z2), lerp(151, 194, z2)]; }
        else if (i === 3) { var z3 = ease(p); view = [lerp(30, 0, z3), lerp(138, 0, z3), lerp(360, W, z3), lerp(194, H, z3)]; }
        else if (i === 5) { var z5 = ease(p); view = [0, lerp(0, 60, z5), W, lerp(H, H, z5)]; }

        s += title(62, 46, i >= 5 ? 'THE AGENT LOOP' : 'ONE CALL', { size: 12 });

        /* context */
        var gone = (i === 3) ? eout(seg(p, 0.35, 1)) : (i >= 4 && i < 6 ? 1 : 0);
        s += ctxBox(C.blue, ctxOp * (1 - gone * 0.72), i === 4 ? 'CONTEXT WINDOW  t+1  (empty)' : 'CONTEXT WINDOW  x₁:ₙ', ctxActive);
        if (i === 2) s += T(CTX.x + CTX.w / 2, CTX.y - 12, 'contextual memory', { size: 10, fill: C.blue, anchor: 'middle', weight: 600, ls: '0.1em', op: eout(p) });
        if (i === 3 && p > 0.4) s += T(CTX.x + CTX.w / 2, CTX.y + CTX.h + 24, 'discarded', { size: 11, fill: C.rose, anchor: 'middle', weight: 600, op: eout(seg(p, 0.4, 1)) });
        if (i === 4) s += T(CTX.x + CTX.w / 2, CTX.y + CTX.h + 24, 'nothing carried over', { size: 11, fill: C.amber, anchor: 'middle', weight: 600, op: eout(p) });

        /* llm */
        s += llmBox(1, thetaOp, i === 1 ? eout(p) : 0);

        /* arrows in/out */
        var aIn = i === 0 ? eout(seg(p, 0.1, 0.55)) : 1;
        var aOut = i === 0 ? eout(seg(p, 0.5, 1)) : (i === 3 ? 1 : 1);
        s += ARR(CTX.x + CTX.w + 8, LLM.y + LLM.h / 2, LLM.x - 8, LLM.y + LLM.h / 2, { stroke: C.blue, sw: 1.6, op: aIn * (1 - gone * 0.7) });
        s += T((CTX.x + CTX.w + LLM.x) / 2, LLM.y + LLM.h / 2 - 10, 'xₜ', { size: 11, anchor: 'middle', fill: C.blue, op: aIn * (1 - gone * 0.7) });
        s += ARR(LLM.x + LLM.w + 8, LLM.y + LLM.h / 2, OUT.x - 8, LLM.y + LLM.h / 2, { stroke: C.green, sw: 1.6, op: aOut });
        s += T((LLM.x + LLM.w + OUT.x) / 2, LLM.y + LLM.h / 2 - 10, 'yₜ', { size: 11, anchor: 'middle', fill: C.green, op: aOut });

        /* output */
        s += R(OUT.x, OUT.y, OUT.w, OUT.h, { rx: 3, fill: C.wash, stroke: C.line2, op: aOut });
        s += title(OUT.x + 12, OUT.y + 22, 'RESPONSE / ACTION', { op: aOut });
        s += T(OUT.x + 12, OUT.y + 46, 'call deploy(env="staging")', { size: 10, fill: C.ink, op: aOut });
        s += T(OUT.x + 12, OUT.y + 64, '→ 401  missing scope', { size: 10, fill: C.rose, op: aOut });
        s += T(OUT.x + 12, OUT.y + 88, 'observation oₜ', { size: 9.5, fill: C.dim, op: aOut });

        /* store + write/read */
        if (storeOp > 0.01) {
          s += storeBox(storeOp, i === 5 || i === 6);
          var wOp = i === 5 ? eout(seg(p, 0.45, 1)) : 1;
          s += ARR(OUT.x + OUT.w / 2, OUT.y + OUT.h + 8, STORE.x + STORE.w - 30, STORE.y - 8, { stroke: C.green, sw: 1.6, op: wOp });
          s += T(OUT.x + OUT.w / 2 + 40, STORE.y - 26, 'WRITE', { size: 10, fill: C.green, weight: 600, ls: '0.12em', anchor: 'middle', op: wOp });
          var rOp = i >= 6 ? (i === 6 ? eout(p) : 1) : 0;
          if (rOp > 0.01) {
            s += ARR(STORE.x + 30, STORE.y - 8, CTX.x + CTX.w / 2, CTX.y + CTX.h + 8, { stroke: C.blue, sw: 1.6, op: rOp });
            s += T(CTX.x + CTX.w / 2 + 46, STORE.y - 26, 'READ', { size: 10, fill: C.blue, weight: 600, ls: '0.12em', anchor: 'middle', op: rOp });
          }
        }

        if (i === 7) {
          var f = eout(p);
          s += T(500, 522, 'the agent is the program that decides what crosses these two arrows',
            { size: 12.5, anchor: 'middle', fill: C.amber, weight: 600, op: f });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 2 — assembling one context window
     ========================================================= */
  (function () {
    var W = 1000, H = 560;
    var BAR = { x: 300, y: 90, w: 250, h: 420 };
    var BUDGET = 32000;

    var blocks = [
      { k: 'S', n: 'system + policy', t: 1200, col: C.violet, note: 'stable across the whole session — put it first so the prefix cache holds' },
      { k: 'T', n: 'tool definitions', t: 2600, col: C.teal, note: 'every unused schema is rent; nine tools you never call still cost 2.6k' },
      { k: 'F', n: 'durable facts', t: 700, col: C.green, note: 'user + project facts that rarely change; cheap and high density' },
      { k: 'P', n: 'plan + task state', t: 900, col: C.amber, note: 'rewritten in place each step, not appended — a plan, not a log' },
      { k: 'M', n: 'retrieved memories', t: 1800, col: C.blue, note: 'the part you control most directly; 8 of 30 candidates survived selection' },
      { k: 'H', n: 'recent conversation', t: 5400, col: C.dim, note: 'grows without bound unless something compacts it' },
      { k: 'O', n: 'tool observations', t: 14200, col: C.rose, note: 'the silent budget killer — one directory listing, one stack trace, one API dump' },
      { k: 'U', n: 'current user message', t: 260, col: C.ink, note: 'the only block you did not choose' }
    ];

    reg('fig-assembly', {
      w: W, h: H, dur: 1400, hold: 700,
      stages: [
        { t: 'An empty budget', c: 'One context window, 32,000 tokens wide. Every block that goes in displaces something else.' },
        { t: 'S — system and policy', c: 'Standing instructions. Small, stable, and first: everything before the first change is a prefix-cache hit.' },
        { t: 'T — tool definitions', c: 'Schemas for the tools currently exposed. Twice the size of the system prompt, and you pay it on every step whether or not a tool is called.' },
        { t: 'F — durable facts', c: 'The user and project facts that rarely change. Highest density in the whole window: 700 tokens that shape every decision.' },
        { t: 'P — plan and task state', c: 'What we are doing, what is done, what is open. Rewritten each step rather than appended.' },
        { t: 'M — retrieved memories', c: 'Eight memories survived from thirty candidates. This is the block that memory engineering actually controls.' },
        { t: 'H — recent conversation', c: 'Turns since the last compaction. Grows monotonically until something summarises it.' },
        { t: 'O — tool observations', c: 'And here is where the budget goes. Raw tool output is by far the largest block, and almost none of it is load-bearing after the first read.' },
        { t: 'U — the user message', c: 'The only block you did not choose. 260 tokens out of 27,060 — under one percent of what the model reads.' },
        { t: 'The real ratio', c: 'Engineered context is 93% of the window. Prompt engineering optimises the last 1%; context engineering optimises the other 99%.' },
        { t: 'Compaction changes everything', c: 'Summarise the observations and compact the history and the same step fits in 9,000 tokens — a 3× cut, entirely from the two blocks nobody writes prompts about.' }
      ],
      draw: function (i, p) {
        var s = '';
        var view = [0, 0, W, H];
        s += title(62, 46, 'ONE CONTEXT WINDOW  ·  BUDGET 32,000 TOKENS', { size: 12 });

        var compact = i === 10 ? ease(p) : 0;
        var scaleT = function (tk, idx) {
          if (idx === 6) return lerp(tk, 900, compact);
          if (idx === 5) return lerp(tk, 800, compact);
          return tk;
        };

        var shown = i === 0 ? 0 : Math.min(blocks.length, i);
        var partial = (i >= 1 && i <= 8) ? eout(p) : 1;

        /* total for scaling the bar */
        var totalT = 0;
        for (var q = 0; q < blocks.length; q++) totalT += scaleT(blocks[q].t, q);
        var px = BAR.h / BUDGET;

        /* budget frame */
        s += R(BAR.x, BAR.y, BAR.w, BAR.h, { rx: 2, fill: '#0b0f12', stroke: C.line2, sw: 1.2 });
        for (var g = 0; g <= 8; g++) {
          var gy = BAR.y + BAR.h * g / 8;
          s += L(BAR.x - 6, gy, BAR.x, gy, { stroke: C.line2, op: 0.8 });
          s += T(BAR.x - 11, gy + 3.5, fmt(BUDGET - BUDGET * g / 8), { size: 8.5, fill: C.faint, anchor: 'end' });
        }
        s += T(BAR.x + BAR.w / 2, BAR.y - 12, 'tokens', { size: 9.5, fill: C.faint, anchor: 'middle' });

        /* stack from the bottom */
        var yCur = BAR.y + BAR.h;
        var labelSlots = [];
        for (var b = 0; b < blocks.length; b++) {
          var vis = b < shown ? 1 : (b === shown - 0 && i >= 1 && b === i - 1 ? partial : 0);
          if (b < i - 1) vis = 1;
          else if (b === i - 1) vis = partial;
          else vis = 0;
          if (i >= 9) vis = 1;
          if (vis <= 0.005) continue;
          var tk = scaleT(blocks[b].t, b) * vis;
          var hh = tk * px;
          yCur -= hh;
          s += R(BAR.x + 1, yCur, BAR.w - 2, hh, { fill: blocks[b].col, op: 0.30 });
          s += R(BAR.x + 1, yCur, 3, hh, { fill: blocks[b].col, op: 0.95 });
          s += L(BAR.x + 1, yCur, BAR.x + BAR.w - 1, yCur, { stroke: blocks[b].col, op: 0.55 });
          if (hh > 13) {
            s += T(BAR.x + 12, yCur + hh / 2 + 4, blocks[b].k + '  ' + blocks[b].n, { size: 10.5, fill: C.ink, weight: 500 });
            s += T(BAR.x + BAR.w - 10, yCur + hh / 2 + 4, fmt(tk), { size: 10, fill: blocks[b].col, anchor: 'end', weight: 600 });
          }
          labelSlots.push({ b: b, y: yCur + hh / 2, h: hh, tk: tk });
        }

        /* right-hand note for the active block */
        var act = clamp(i - 1, 0, blocks.length - 1);
        if (i >= 1 && i <= 8) {
          var bl = blocks[act], op = eout(seg(p, 0.25, 1));
          var slot = null;
          for (var z = 0; z < labelSlots.length; z++) if (labelSlots[z].b === act) slot = labelSlots[z];
          var ny = slot ? clamp(slot.y - 34, 96, 430) : 200;
          s += R(600, ny, 340, 76, { rx: 3, fill: C.wash, stroke: bl.col, sw: 1.2, op: op * 0.9 });
          s += T(614, ny + 22, bl.k + ' · ' + bl.n, { size: 11, fill: bl.col, weight: 600, ls: '0.08em', op: op });
          s += WRAP(614, ny + 42, bl.note, 312, { size: 10.5, fill: C.ink, op: op });
          if (slot) s += ARR(BAR.x + BAR.w + 6, slot.y, 594, ny + 38, { stroke: bl.col, sw: 1.2, op: op * 0.7, head: 6 });
        }

        /* left-hand running total */
        var used = 0;
        for (var u = 0; u < blocks.length; u++) {
          var vv = (u < i - 1) ? 1 : (u === i - 1 ? partial : 0);
          if (i >= 9) vv = 1;
          used += scaleT(blocks[u].t, u) * vv;
        }
        s += T(62, 110, 'USED', { size: 9.5, fill: C.faint, ls: '0.14em' });
        s += T(62, 142, fmt(used), { size: 30, weight: 700, fill: C.ink, disp: true });
        s += T(62, 162, 'of ' + fmt(BUDGET) + ' tokens', { size: 10, fill: C.faint });
        s += R(62, 176, 200, 8, { fill: '#0b0f12', stroke: C.line2 });
        s += R(63, 177, (200 - 2) * clamp(used / BUDGET, 0, 1), 6, { fill: used / BUDGET > 0.8 ? C.rose : C.green, op: 0.8 });

        if (i >= 9) {
          var f = i === 9 ? eout(p) : 1;
          var chosen = used - blocks[7].t;
          s += R(50, 210, 208, 118, { rx: 3, fill: C.wash, stroke: C.amber, sw: 1.2, op: f * 0.9 });
          s += T(62, 232, 'YOU CHOSE', { size: 9.5, fill: C.amber, ls: '0.14em', op: f });
          s += T(62, 262, fmt(chosen), { size: 24, weight: 700, fill: C.amber, disp: true, op: f });
          s += T(62, 280, Math.round(100 * chosen / used) + '% of the window', { size: 10, fill: C.dim, op: f });
          s += T(62, 306, 'the user wrote ' + fmt(blocks[7].t) + ' (' + (Math.round(1000 * blocks[7].t / used) / 10) + '%)', { size: 9.5, fill: C.faint, op: f });
        }
        if (i === 10) {
          var f2 = eout(p);
          s += R(600, 300, 340, 96, { rx: 3, fill: C.wash, stroke: C.green, sw: 1.3, op: f2 * 0.95 });
          s += T(614, 324, 'AFTER COMPACTION', { size: 10, fill: C.green, weight: 600, ls: '0.12em', op: f2 });
          s += T(614, 352, fmt(used) + ' tokens', { size: 19, weight: 700, fill: C.green, disp: true, op: f2 });
          s += T(614, 376, 'observations extracted · history summarised', { size: 10, fill: C.dim, op: f2 });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 3 — context budget lab (knapsack with interactions)
     ========================================================= */
  (function () {
    var W = 1000, H = 600;
    var ITEMS = [
      { id: 0, n: 'user prefers dark mode', u: 0.06, l: 20, tag: 'trivia — cheap but idle' },
      { id: 1, n: 'project-x deploys via GitHub Actions', u: 0.85, l: 30, tag: 'key fact' },
      { id: 2, n: 'deploys are done through GH Actions (restated)', u: 0.84, l: 34, tag: 'near-duplicate of #2' },
      { id: 3, n: 'project-x deploys via Jenkins  [2025, stale]', u: 0.70, l: 32, tag: 'contradicts #2' },
      { id: 4, n: 'deploy runbook §3 — full text', u: 0.95, l: 2200, tag: 'high value, awful density' },
      { id: 5, n: 'last deploy failed: missing scope read:user', u: 0.82, l: 42, tag: 'episode' },
      { id: 6, n: 'fix: add read:user to the staging app config', u: 0.68, l: 38, tag: 'complements #6' },
      { id: 7, n: 'user Q2 travel plans', u: -0.15, l: 260, tag: 'distractor — negative utility' },
      { id: 8, n: 'staging runners are on image v3', u: 0.45, l: 28, tag: 'context' }
    ];
    var DUP = [1, 2], CONTRA = [1, 3], COMP = [5, 6];

    function utility(set) {
      var s = 0, i;
      for (i = 0; i < set.length; i++) s += ITEMS[set[i]].u;
      var has = function (k) { return set.indexOf(k) >= 0; };
      if (has(DUP[0]) && has(DUP[1])) s -= 1.02 * Math.min(ITEMS[DUP[0]].u, ITEMS[DUP[1]].u);
      if (has(CONTRA[0]) && has(CONTRA[1])) s -= 0.95;
      if (has(COMP[0]) && has(COMP[1])) s += 0.28;
      return s;
    }
    function tokens(set) { var s = 0; for (var i = 0; i < set.length; i++) s += ITEMS[set[i]].l; return s; }

    function selectBy(mode, B) {
      var chosen = [], trace = [], remaining = [], i;
      for (i = 0; i < ITEMS.length; i++) remaining.push(i);
      if (mode === 'relevance' || mode === 'density') {
        var order = remaining.slice().sort(function (a, b) {
          return mode === 'relevance' ? ITEMS[b].u - ITEMS[a].u
            : (ITEMS[b].u / ITEMS[b].l) - (ITEMS[a].u / ITEMS[a].l);
        });
        for (i = 0; i < order.length; i++) {
          var cand = order[i];
          if (tokens(chosen) + ITEMS[cand].l <= B) {
            chosen.push(cand);
            trace.push({ pick: cand, why: mode === 'relevance' ? 'highest raw utility left' : 'highest utility per token', d: ITEMS[cand].u });
          } else {
            trace.push({ pick: -1, skip: cand, why: 'does not fit in the remaining budget', d: 0 });
          }
        }
        return { chosen: chosen, trace: trace };
      }
      /* marginal gain per token, greedy */
      var guard = 0;
      while (guard++ < 24) {
        var best = -1, bestD = 0, bestRatio = -1e9, rejected = null;
        for (i = 0; i < ITEMS.length; i++) {
          if (chosen.indexOf(i) >= 0) continue;
          if (tokens(chosen) + ITEMS[i].l > B) continue;
          var d = utility(chosen.concat([i])) - utility(chosen);
          var ratio = d / ITEMS[i].l;
          if (d <= 0.0001) { if (!rejected) rejected = { id: i, d: d }; continue; }
          if (ratio > bestRatio) { bestRatio = ratio; best = i; bestD = d; }
        }
        if (best < 0) break;
        chosen.push(best);
        trace.push({ pick: best, why: 'best marginal gain per token (Δ=' + (Math.round(bestD * 100) / 100) + ')', d: bestD, rejected: rejected });
      }
      return { chosen: chosen, trace: trace };
    }

    reg('fig-knapsack', {
      w: W, h: H, dur: 1150, hold: 700,
      params: { B: 2300, mode: 'marginal' },
      stages: [
        { t: 'Nine candidates', c: 'Everything retrieval put on the table. Each has a token cost and a utility for the current decision — and some of them interact.' },
        { t: 'Cost against utility', c: 'Plotted, the runbook is obviously the most useful single item and obviously the worst buy: 1,400 tokens for one fact you could state in 30.' },
        { t: 'Pick 1', c: function (st) { return 'Greedy selection under the ' + st.params.mode + ' rule begins. Watch which items get taken and which get passed over.'; } },
        { t: 'Pick 2', c: 'Each pick is scored against what is already in the set, not in isolation.' },
        { t: 'Pick 3', c: 'The complement pair is the interesting case: the fix is worth more once the failure episode is in.' },
        { t: 'Pick 4', c: 'The near-duplicate has a marginal gain of essentially zero once its twin is in the set, so it is never selected.' },
        { t: 'Pick 5', c: 'And the contradicting stale fact has a negative marginal gain — including it would make the context worse, not merely bigger.' },
        { t: 'Budget spent', c: 'No further item has positive marginal gain per token within the remaining budget.' },
        { t: 'The selected context', c: 'A compact, non-contradictory, non-redundant working set. Change the budget slider and watch what falls out first.' },
        { t: 'Three rules compared', c: 'Top-k relevance grabs the runbook and starves. Density does better. Marginal gain is the only rule that sees duplication, contradiction, and complementarity at all.' }
      ],
      controls: function (panel, st, render, pause) {
        var slider = panel.querySelector('#knap-budget');
        var out = panel.querySelector('#knap-budget-out');
        if (slider) {
          slider.addEventListener('input', function () {
            st.params.B = parseInt(slider.value, 10);
            out.textContent = fmt(st.params.B);
            render();
          });
        }
        var btns = panel.querySelectorAll('#knap-strategy button');
        for (var i = 0; i < btns.length; i++) {
          (function (b) {
            b.addEventListener('click', function () {
              st.params.mode = b.getAttribute('data-strategy');
              for (var q = 0; q < btns.length; q++) btns[q].setAttribute('aria-pressed', btns[q] === b ? 'true' : 'false');
              render();
            });
          })(btns[i]);
        }
      },
      draw: function (i, p, st) {
        var s = '', B = clamp(st.params.B, 200, 200000), mode = st.params.mode;
        var res = selectBy(mode, B);
        var view = [0, 0, W, H];

        s += title(62, 42, 'CANDIDATE POOL  ·  BUDGET ' + fmt(B) + ' TOKENS  ·  RULE: ' + mode.toUpperCase(), { size: 11.5 });

        /* how many picks are revealed at this stage */
        var picksShown = 0;
        if (i >= 2 && i <= 6) picksShown = Math.min(res.chosen.length, (i - 1) + (p > 0.55 ? 0 : 0));
        else if (i >= 7) picksShown = res.chosen.length;
        var animPick = (i >= 2 && i <= 6) ? (i - 2) : -1;

        /* pool list, left */
        var lx = 62, ly = 66, rowH = 40;
        for (var k = 0; k < ITEMS.length; k++) {
          var it = ITEMS[k];
          var idx = res.chosen.indexOf(k);
          var taken = idx >= 0 && idx < picksShown;
          var animating = (idx === animPick) && (i >= 2 && i <= 6);
          var y = ly + k * rowH;
          var col = taken ? C.green : C.line2;
          var rejected = false, rejReason = '';
          if (i >= 5 && k === DUP[1] && res.chosen.indexOf(DUP[0]) >= 0 && res.chosen.indexOf(DUP[1]) < 0) { rejected = true; rejReason = 'Δ ≈ 0'; }
          if (i >= 6 && k === CONTRA[1] && res.chosen.indexOf(CONTRA[0]) >= 0 && res.chosen.indexOf(CONTRA[1]) < 0) { rejected = true; rejReason = 'Δ < 0'; }
          if (rejected) col = C.rose;

          var op = animating ? lerp(0.55, 1, eout(p)) : 1;
          s += R(lx, y, 400, rowH - 6, { rx: 2, fill: taken ? 'rgba(63,209,160,0.10)' : C.wash, stroke: col, sw: taken || rejected ? 1.3 : 1, op: op });
          s += T(lx + 10, y + 15, '#' + (k + 1) + '  ' + it.n, { size: 10.5, fill: taken ? C.ink : (rejected ? C.rose : C.dim), weight: taken ? 500 : 400, op: op });
          s += T(lx + 10, y + 28, it.tag, { size: 8.5, fill: C.faint, op: op });
          s += T(lx + 336, y + 15, fmt(it.l) + ' tok', { size: 9.5, fill: C.faint, anchor: 'end', op: op });
          s += T(lx + 392, y + 15, 'u ' + it.u.toFixed(2), { size: 9.5, fill: C.amber, anchor: 'end', op: op });
          if (rejected) s += T(lx + 392, y + 28, rejReason, { size: 9, fill: C.rose, anchor: 'end', op: op });
          if (taken) s += T(lx + 392, y + 28, 'selected', { size: 9, fill: C.green, anchor: 'end', op: op });
        }

        /* scatter, stage 1 */
        if (i === 1) {
          var f = eout(p);
          var sx = 520, sy = 90, sw = 420, sh = 300;
          s += R(sx, sy, sw, sh, { rx: 2, fill: '#0b0f12', stroke: C.line2, op: f });
          s += T(sx + sw / 2, sy - 10, 'utility vs. token cost  (log x)', { size: 10, fill: C.dim, anchor: 'middle', op: f });
          s += T(sx + sw / 2, sy + sh + 22, 'tokens →', { size: 9.5, fill: C.faint, anchor: 'middle', op: f });
          s += T(sx - 10, sy + sh / 2, 'u', { size: 10, fill: C.faint, anchor: 'end', op: f });
          for (var q2 = 0; q2 < ITEMS.length; q2++) {
            var lx2 = Math.log(ITEMS[q2].l) / Math.log(2400);
            var px2 = sx + 24 + lx2 * (sw - 60);
            var py2 = sy + sh - 60 - ITEMS[q2].u * (sh - 110);
            s += CIR(px2, py2, 6, { fill: q2 === 4 ? C.rose : C.blue, op: f * 0.85 });
            s += T(px2 + 10, py2 + 4, '#' + (q2 + 1), { size: 9, fill: C.dim, op: f });
          }
          s += T(sx + 20, sy + 26, 'density = u / ℓ  —  the isolines are diagonals here', { size: 10, fill: C.amber, op: f });
          s += T(sx + 20, sy + 44, '#5 (runbook) is top-right: best u, worst buy;  #8 is below zero', { size: 9.5, fill: C.rose, op: f });
        }

        /* budget bar, right, stages 2+ */
        if (i >= 2 && i < 9) {
          var bx = 520, by = 78, bw = 420, bh = 300;
          var used = 0;
          s += R(bx, by, bw, bh, { rx: 2, fill: '#0b0f12', stroke: C.line2 });
          s += T(bx, by - 10, 'SELECTED CONTEXT', { size: 10, fill: C.dim, ls: '0.14em' });
          var yy = by + 10;
          for (var c3 = 0; c3 < picksShown; c3++) {
            var id = res.chosen[c3];
            var hgt = clamp(ITEMS[id].l / B * bh, 16, bh - 20);
            var opp = (c3 === picksShown - 1 && i <= 6) ? eout(p) : 1;
            s += R(bx + 8, yy, bw - 16, hgt - 4, { rx: 2, fill: C.green, op: 0.14 * opp });
            s += R(bx + 8, yy, 3, hgt - 4, { fill: C.green, op: 0.9 * opp });
            s += T(bx + 18, yy + 14, ITEMS[id].n.slice(0, 42), { size: 10, fill: C.ink, op: opp });
            s += T(bx + bw - 16, yy + 14, fmt(ITEMS[id].l), { size: 9.5, fill: C.green, anchor: 'end', op: opp });
            yy += hgt;
            used += ITEMS[id].l;
          }
          s += T(bx, by + bh + 22, fmt(used) + ' / ' + fmt(B) + ' tokens', { size: 11, fill: C.ink, weight: 600 });
          s += T(bx + bw, by + bh + 22, 'U = ' + utility(res.chosen.slice(0, picksShown)).toFixed(2), { size: 11, fill: C.amber, weight: 600, anchor: 'end' });
          if (i >= 2 && i <= 6 && res.trace[i - 2]) {
            s += WRAP(bx, by + bh + 44, res.trace[i - 2].why, bw, { size: 10, fill: C.dim });
          }
          if (i === 7 || i === 8) {
            s += WRAP(bx, by + bh + 44, i === 7 ? 'no remaining item has positive marginal gain per token inside the budget'
              : 'compact, consistent, complementary — ' + res.chosen.length + ' of 9 candidates', bw, { size: 10, fill: C.green });
          }
        }

        /* comparison, stage 9 */
        if (i === 9) {
          var f3 = eout(p);
          var modes = ['relevance', 'density', 'marginal'];
          var names = ['top-k relevance', 'density  u/ℓ', 'marginal gain  Δ/ℓ'];
          var cx0 = 520, cy0 = 90, cw = 420;
          s += T(cx0, cy0 - 10, 'ACHIEVED UTILITY AT THIS BUDGET', { size: 10, fill: C.dim, ls: '0.14em', op: f3 });
          var maxU = 0.01;
          var vals = [];
          for (var m = 0; m < 3; m++) { var rr = selectBy(modes[m], B); var uu = utility(rr.chosen); vals.push({ u: uu, n: rr.chosen.length, t: tokens(rr.chosen) }); if (uu > maxU) maxU = uu; }
          for (var m2 = 0; m2 < 3; m2++) {
            var yb = cy0 + 24 + m2 * 86;
            var wb = (cw - 40) * clamp(vals[m2].u / Math.max(maxU, 1), 0, 1) * f3;
            var isCur = modes[m2] === mode;
            s += T(cx0, yb, names[m2], { size: 11, fill: isCur ? C.green : C.dim, weight: isCur ? 600 : 400, op: f3 });
            s += R(cx0, yb + 10, cw - 40, 24, { fill: '#0b0f12', stroke: C.line2, op: f3 });
            s += R(cx0 + 1, yb + 11, Math.max(0, wb - 2), 22, { fill: isCur ? C.green : C.blue, op: f3 * 0.55 });
            s += T(cx0 + 8, yb + 27, 'U = ' + vals[m2].u.toFixed(2), { size: 10.5, fill: C.ink, weight: 600, op: f3 });
            s += T(cx0 + cw - 44, yb + 27, vals[m2].n + ' items · ' + fmt(vals[m2].t) + ' tok', { size: 9.5, fill: C.faint, anchor: 'end', op: f3 });
            s += T(cx0, yb + 50, m2 === 0 ? 'takes the runbook first and runs out of room'
              : (m2 === 1 ? 'good buys, but keeps the duplicate and the contradiction'
                : 'sees the interactions: skips both, adds the complement'),
              { size: 9.5, fill: C.faint, op: f3 });
          }
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 4 — position effects
     ========================================================= */
  (function () {
    var W = 1000, H = 520;
    /* schematic utilisation: U-shape, deeper and lower as n grows */
    function util(k, n) {
      var x = k;                       /* 0..1 relative position */
      var depth = 0.20 + 0.30 * clamp((n - 4000) / 26000, 0, 1);
      var base = 0.94 - 0.16 * clamp((n - 4000) / 26000, 0, 1);
      var bowl = 1 - Math.exp(-Math.pow((x - 0.5) / 0.30, 2) * 1.6);
      var tailBoost = 0.05 * Math.pow(x, 6);
      return clamp(base - depth * (1 - bowl) + tailBoost * depth, 0.05, 1);
    }
    var POS = [0.02, 0.25, 0.5, 0.75, 0.98];

    reg('fig-position', {
      w: W, h: H, dur: 1400, hold: 800,
      stages: [
        { t: 'A short context', c: 'Four thousand tokens, one relevant fact. Wherever it sits, the model finds it. Position is not yet a variable.' },
        { t: 'A long context, fact at the head', c: 'Thirty thousand tokens now. At the very beginning, utilisation is still high — the head of the context is well attended.' },
        { t: 'A quarter of the way in', c: 'Already softening. Nothing changed about the fact, only where it sits relative to everything else.' },
        { t: 'The middle', c: 'The dip. Same fact, same budget, same question — and the lowest chance of it being used. This is the effect Lost in the Middle named.' },
        { t: 'Three quarters', c: 'Recovering as we approach the tail.' },
        { t: 'At the very end', c: 'Back near the top. The two ends of the window are the two premium slots, and the region between them is where information goes to be ignored.' },
        { t: 'The curve', c: 'Sweeping the position gives a U. Its exact depth and asymmetry vary by model, task and length — the shape is the robust part, not the numbers.' },
        { t: 'Longer is worse everywhere', c: 'Growing the context does not just move the dip, it lowers the whole curve. Capacity and utilisation are different quantities.' },
        { t: 'The consequence', c: 'Effective utility factorises into content and placement. Two contexts holding identical information are not equally good — so context construction is sequencing, not just selection.' }
      ],
      draw: function (i, p) {
        var s = '', view = [0, 0, W, H];
        var nShort = 4000, nLong = 30000;
        var n = (i === 0) ? nShort : (i === 7 ? lerp(12000, 30000, ease(p)) : nLong);
        if (i === 8) n = nLong;

        var bx = 70, by = 92, bw = 860, bh = 54;
        s += title(70, 44, 'CONTEXT WINDOW  ·  ' + fmt(n) + ' TOKENS', { size: 11.5 });

        /* the strip */
        s += R(bx, by, bw, bh, { rx: 2, fill: '#0b0f12', stroke: C.line2, sw: 1.2 });
        var nBlocks = 46;
        for (var b = 0; b < nBlocks; b++) {
          var w1 = bw / nBlocks;
          s += R(bx + b * w1 + 1, by + 8, w1 - 2, bh - 16, { fill: C.line2, op: 0.35 });
        }
        s += T(bx, by - 8, 'head', { size: 9.5, fill: C.faint });
        s += T(bx + bw, by - 8, 'tail', { size: 9.5, fill: C.faint, anchor: 'end' });

        /* needle position */
        var kFrom, kTo;
        if (i === 0) { kFrom = 0.5; kTo = 0.5; }
        else if (i <= 5) { kFrom = POS[Math.max(0, i - 2)]; kTo = POS[i - 1]; }
        else { kFrom = 0.5; kTo = 0.5; }
        var k = (i >= 1 && i <= 5) ? lerp(kFrom, kTo, ease(p)) : (i === 0 ? 0.5 : 0.5);

        var sweep = (i === 6) ? ease(p) : 0;
        if (i === 6) k = lerp(0.02, 0.98, sweep);

        var nx = bx + k * (bw - 12) + 6;
        var uu = util(k, n);
        var showNeedle = i <= 6;
        if (showNeedle) {
          s += R(nx - 6, by + 4, 12, bh - 8, { rx: 1.5, fill: C.amber, op: 0.9 });
          s += T(nx, by - 20, 'the fact', { size: 10, fill: C.amber, anchor: 'middle', weight: 600 });
        }

        /* curve axes */
        var gx = 70, gy = 200, gw = 860, gh = 220;
        s += R(gx, gy, gw, gh, { rx: 2, fill: '#0b0f12', stroke: C.line2 });
        for (var g = 0; g <= 4; g++) {
          var yy = gy + gh * g / 4;
          s += L(gx, yy, gx + gw, yy, { stroke: C.line, op: 0.8 });
          s += T(gx - 8, yy + 3.5, (1 - g / 4).toFixed(2), { size: 9, fill: C.faint, anchor: 'end' });
        }
        s += T(gx - 8, gy - 12, 'utilisation  φ(k, n)', { size: 10, fill: C.dim });
        s += T(gx + gw / 2, gy + gh + 26, 'position of the fact within the context  →', { size: 10, fill: C.faint, anchor: 'middle' });

        function curve(nn, upto) {
          var d = '', first = true;
          for (var t = 0; t <= 120; t++) {
            var kk = t / 120;
            if (kk > upto) break;
            var px = gx + kk * gw, py = gy + gh - util(kk, nn) * gh;
            d += (first ? 'M' : 'L') + r2(px) + ' ' + r2(py); first = false;
          }
          return d;
        }

        if (i >= 6) {
          var upto = i === 6 ? sweep : 1;
          if (i >= 7) {
            s += P(curve(12000, 1), { stroke: C.blue, sw: 1.6, op: i === 7 ? 1 - 0.4 * ease(p) : 0.45, dash: '4 4' });
            s += T(gx + gw - 6, gy + gh - util(0.5, 12000) * gh - 12, 'n = 12k', { size: 9.5, fill: C.blue, anchor: 'end', op: 0.8 });
          }
          s += P(curve(n, upto), { stroke: C.amber, sw: 2.2 });
          if (i >= 7) s += T(gx + gw - 6, gy + gh - util(0.5, 30000) * gh + 22, 'n = 30k', { size: 9.5, fill: C.amber, anchor: 'end' });
        } else {
          /* sampled points so far */
          for (var q = 0; q <= Math.max(0, i - 1); q++) {
            var kk2 = i === 0 ? 0.5 : POS[q];
            var px2 = gx + kk2 * gw, py2 = gy + gh - util(kk2, n) * gh;
            s += CIR(px2, py2, 5, { fill: C.amber, op: 0.85 });
          }
          if (i > 0) {
            s += CIR(gx + k * gw, gy + gh - uu * gh, 7, { fill: C.amber });
            s += CIR(gx + k * gw, gy + gh - uu * gh, 13, { stroke: C.amber, sw: 1.2, op: 0.5 });
          } else {
            s += CIR(gx + 0.5 * gw, gy + gh - util(0.5, nShort) * gh, 7, { fill: C.green });
            s += P(curve(nShort, 1), { stroke: C.green, sw: 1.6, op: 0.5, dash: '3 4' });
          }
        }

        /* readout */
        if (i <= 6) {
          s += R(gx + gw - 210, gy + 14, 196, 58, { rx: 2, fill: C.wash, stroke: C.line2, op: 0.95 });
          s += T(gx + gw - 198, gy + 34, 'utilisation here', { size: 9.5, fill: C.faint });
          s += T(gx + gw - 198, gy + 58, (i === 0 ? util(0.5, nShort) : uu).toFixed(2), { size: 21, fill: i === 3 ? C.rose : C.amber, weight: 700, disp: true });
        }

        if (i === 8) {
          var f = eout(p);
          s += R(70, 452, 860, 52, { rx: 3, fill: C.wash, stroke: C.amber, sw: 1.2, op: f * 0.95 });
          s += T(500, 476, 'u_eff(c)  =  u(c) · φ(k, n)', { size: 17, fill: C.amber, anchor: 'middle', weight: 600, op: f });
          s += T(500, 494, 'content × placement — so the same set of memories, reordered, is a different context',
            { size: 10.5, fill: C.dim, anchor: 'middle', op: f });
        }
        return { svg: s, view: view };
      }
    });
  })();

  /* =========================================================
     FIGURE 5 — the agent memory loop  (preview source)
     ========================================================= */
  (function () {
    var W = 1000, H = 580;
    var CX = 500, CY = 300, RX = 336, RY = 182;
    var NODES = [
      { k: 'OBSERVE', d: 'tool result · user turn · env event', col: C.blue },
      { k: 'WRITE GATE', d: 'should this be remembered?', col: C.amber },
      { k: 'EXTRACT', d: 'fact · episode · skill · reflection', col: C.amber },
      { k: 'STORE', d: 'episodic / semantic / procedural', col: C.green },
      { k: 'MANAGE', d: 'merge · supersede · expire · delete', col: C.green },
      { k: 'RETRIEVE', d: 'build the query, then search', col: C.violet },
      { k: 'RANK', d: 'relevance · recency · importance · dedupe', col: C.violet },
      { k: 'CONSTRUCT', d: 'order · compress · mark provenance', col: C.violet }
    ];
    function nodePt(idx) {
      var a = (-90 + idx * 45) * Math.PI / 180;
      return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), a: a };
    }
    function ringPt(tt) { /* tt in [0,1) from top, clockwise */
      var a = (-90 + tt * 360) * Math.PI / 180;
      return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) };
    }

    var PHASE = [
      { lo: 0, hi: 2, name: 'WRITE' },
      { lo: 3, hi: 4, name: 'MANAGE' },
      { lo: 5, hi: 7, name: 'READ' }
    ];

    reg('fig-loop', {
      w: W, h: H, dur: 1300, hold: 700, maxh: 600,
      stages: [
        { t: 'Three operations, not one', c: 'WRITE decides what becomes a memory. MANAGE keeps the store true over time. READ decides what comes back and how it is arranged. A vector database is a slice of the third.' },
        { t: 'Observe', c: 'Something happens: a tool returns, the user says something, the environment changes. This is the raw material, and most of it is not worth keeping.' },
        { t: 'Write gate', c: 'The hardest decision in the system, and the one made with the least information — you must judge future usefulness before the future query exists.' },
        { t: 'Extract', c: 'If it survives the gate, in what form? An atomic fact, an episode with its outcome, a reusable procedure, or a reflection generalising several episodes.' },
        { t: 'Store', c: 'Written with provenance, timestamp, confidence and scope — not as a bare string. The representation decides what will be retrievable and what will be updatable.' },
        { t: 'Manage', c: 'The tier everyone skips. Merge duplicates, close superseded facts with an end date, expire what has gone stale, honour deletions. Without this the store rots.' },
        { t: 'Retrieve', c: 'Not an embedding lookup: first resolve what to ask. "Can we do it like last time?" has to become a query with an entity, a filter and a time bound.' },
        { t: 'Rank', c: 'Multiple signals combined, redundancy penalised, and a calibrated threshold so the system is allowed to come back with nothing.' },
        { t: 'Construct', c: 'Order by volatility for the cache and by importance for attention; compress what must be compressed; label every memory with where it came from.' },
        { t: 'Decide and act', c: 'Only now does the model see anything. Everything above determined what it is looking at.' },
        { t: 'The loop closes', c: 'The action changes the environment, which produces the next observation. The store is downstream of the agent\u2019s own behaviour — which is what makes it able to poison itself.' },
        { t: 'Where the vector DB sits', c: 'One box of eight, and only part of that one. Buying a vector database and calling memory solved leaves seven decisions unmade.' }
      ],
      draw: function (i, p) {
        var s = '', view = [0, 0, W, H];

        /* camera: gentle zoom onto the active node in stages 1..8 */
        var focus = (i >= 1 && i <= 8) ? i - 1 : -1;
        if (focus >= 0) {
          /* a centred push-in: the ring fills the canvas, so panning would crop
             node labels. Focus is carried by the highlight and the packet. */
          var m = ease(clamp(p * 1.5, 0, 1));
          var inset = 0.045;
          view = [lerp(0, W * inset, m), lerp(0, H * inset, m),
                  lerp(W, W * (1 - 2 * inset), m), lerp(H, H * (1 - 2 * inset), m)];
        }

        /* ring guide */
        s += el('ellipse', { cx: CX, cy: CY, rx: RX, ry: RY, fill: 'none', stroke: C.line, 'stroke-width': 1.4, 'stroke-dasharray': '2 6' });

        /* phase arcs + a collision-free legend on stage 0 */
        if (i === 0) {
          var f0 = eout(p);
          var arcCols = [C.amber, C.green, C.violet];
          var arcNote = ['what becomes a memory', 'keeping the store true', 'what comes back, and how'];
          for (var ph = 0; ph < 3; ph++) {
            var a0 = (-90 + (PHASE[ph].lo - 0.45) * 45) * Math.PI / 180;
            var a1 = (-90 + (PHASE[ph].hi + 0.45) * 45) * Math.PI / 180;
            var d = '';
            for (var t2 = 0; t2 <= 40; t2++) {
              var aa = lerp(a0, a1, t2 / 40);
              d += (t2 ? 'L' : 'M') + r2(CX + (RX + 22) * Math.cos(aa)) + ' ' + r2(CY + (RY + 22) * Math.sin(aa));
            }
            s += P(d, { stroke: arcCols[ph], sw: 5, op: f0 * 0.6, cap: 'round' });
            var ly = 470 + ph * 34;
            s += R(48, ly - 12, 14, 14, { rx: 2, fill: arcCols[ph], op: f0 * 0.85 });
            s += T(72, ly, PHASE[ph].name, { size: 13, fill: arcCols[ph], weight: 700, ls: '0.14em', op: f0, disp: true });
            s += T(168, ly, arcNote[ph], { size: 10, fill: C.dim, op: f0 });
          }
        }

        /* ring direction arrows */
        for (var m2 = 0; m2 < 8; m2++) {
          var tt = (m2 + 0.5) / 8;
          var pA = ringPt(tt - 0.012), pB = ringPt(tt + 0.012);
          s += ARR(pA.x, pA.y, pB.x, pB.y, { stroke: C.line2, sw: 1.2, head: 8, op: 0.9 });
        }

        /* nodes */
        for (var k = 0; k < 8; k++) {
          var np2 = nodePt(k);
          var active = (k === focus) || (i === 0);
          var dim = (i >= 9 && i <= 10) ? 0.55 : 1;
          var hi = (i === 11 && (k === 3 || k === 5)) ? 1 : 0;
          var bw = 168, bh = 58;
          var col = NODES[k].col;
          var bxx = np2.x - bw / 2, byy = np2.y - bh / 2;
          s += R(bxx, byy, bw, bh, {
            rx: 3, fill: active ? '#141d23' : C.wash,
            stroke: active ? col : C.line2, sw: active ? 1.8 : 1, op: dim
          });
          if (active) s += R(bxx, byy, 3, bh, { fill: col, op: dim });
          s += T(np2.x, np2.y - 6, NODES[k].k, { size: 11.5, weight: 700, fill: active ? col : C.dim, anchor: 'middle', ls: '0.1em', op: dim });
          s += T(np2.x, np2.y + 12, NODES[k].d, { size: 8.6, fill: active ? C.ink : C.faint, anchor: 'middle', op: dim });
          if (hi) {
            s += R(bxx - 6, byy - 6, bw + 12, bh + 12, { rx: 4, stroke: C.rose, sw: 1.6, op: eout(p), dash: '4 4' });
            s += T(np2.x, byy + bh + 26, k === 3 ? 'the index lives here' : 'and the search here', { size: 11, fill: C.rose, anchor: 'middle', weight: 600, op: eout(p) });
            s += T(np2.x, byy + bh + 42, 'part of one box', { size: 9.5, fill: C.rose, anchor: 'middle', op: eout(p) });
          }
        }

        /* centre: model + action + environment */
        var cActive = (i === 9 || i === 10);
        s += R(CX - 116, CY - 52, 232, 104, { rx: 3, fill: cActive ? '#141d23' : C.wash, stroke: cActive ? C.blue : C.line2, sw: cActive ? 1.8 : 1 });
        s += T(CX, CY - 26, 'LLM', { size: 20, weight: 700, anchor: 'middle', disp: true, fill: cActive ? C.blue : C.dim });
        s += T(CX, CY - 6, 'decide', { size: 9.5, anchor: 'middle', fill: C.faint });
        s += L(CX - 96, CY + 4, CX + 96, CY + 4, { stroke: C.line, op: 0.9 });
        s += T(CX, CY + 22, 'action  →  environment', { size: 11, anchor: 'middle', fill: cActive ? C.ink : C.dim, weight: 500 });
        s += T(CX, CY + 40, 'which produces the next observation', { size: 8.6, anchor: 'middle', fill: C.faint });

        /* construct -> llm arrow */
        var n7 = nodePt(7);
        var arrIn = (i >= 8) ? (i === 8 ? eout(seg(p, 0.5, 1)) : 1) : 0.25;
        s += ARR(n7.x + 44, n7.y + 30, CX - 92, CY - 34, { stroke: C.violet, sw: 1.5, op: arrIn });
        /* llm -> observe arrow */
        var n0 = nodePt(0);
        var arrOut = (i === 10) ? eout(p) : (i === 11 ? 1 : 0.25);
        s += ARR(CX + 60, CY - 52, n0.x + 30, n0.y + 32, { stroke: C.blue, sw: 1.5, op: arrOut });

        /* travelling packet */
        if (i >= 1 && i <= 8) {
          var from = (i - 1) / 8, to = i / 8;
          var tt2 = lerp(from, to, ease(p));
          var pp = ringPt(tt2);
          s += CIR(pp.x, pp.y, 9, { fill: C.ink, op: 0.95 });
          s += CIR(pp.x, pp.y, 15, { stroke: C.ink, sw: 1.2, op: 0.4 });
        }

        /* header */
        s += title(48, 40, 'WRITE  →  MANAGE  →  READ', { size: 13 });
        s += T(48, 60, 'one closed loop, eight decision points', { size: 10, fill: C.faint });
        return { svg: s, view: view };
      }
    });
  })();

})();
