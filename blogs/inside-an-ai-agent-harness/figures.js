/* =====================================================================
   Figure engine for "Inside an AI Agent Harness".
   Canvas reels: staged interpolation, camera lerp, full a11y controls.
   ===================================================================== */
(function () {
  "use strict";

  var REDUCED = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var C = {
    bg: "#0f1317", grid: "#1b232a", ink: "#e4eaee", dim: "#93a0a8", faint: "#5d6a73",
    green: "#3fd1a0", blue: "#5ab2e8", amber: "#e8b44a", red: "#e8705f",
    purple: "#b78bea", teal: "#4fb8c6", panel: "#161d24", line: "#2b353e"
  };

  /* ---------- drawing helpers ---------- */
  var G = {
    clamp: function (v, a, b) { return v < a ? a : v > b ? b : v; },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    ease: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    easeOut: function (t) { return 1 - Math.pow(1 - t, 3); },
    fade: function (t, a, b) { return G.clamp((t - a) / Math.max(1e-6, b - a), 0, 1); },
    alpha: function (ctx, v) { ctx.globalAlpha = G.clamp(v, 0, 1); },
    rr: function (ctx, x, y, w, h, r) {
      r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    },
    box: function (ctx, x, y, w, h, o) {
      o = o || {};
      G.rr(ctx, x, y, w, h, o.r == null ? 4 : o.r);
      if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
      if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 1.4; ctx.stroke(); }
    },
    txt: function (ctx, s, x, y, o) {
      o = o || {};
      var size = o.size || 13, weight = o.weight || 400;
      var fam = o.mono === false ? "'Bricolage Grotesque', system-ui, sans-serif" : "'IBM Plex Mono', ui-monospace, monospace";
      ctx.font = weight + " " + size + "px " + fam;
      ctx.fillStyle = o.color || C.ink;
      ctx.textAlign = o.align || "left";
      ctx.textBaseline = o.baseline || "middle";
      ctx.fillText(s, x, y);
    },
    line: function (ctx, x1, y1, x2, y2, o) {
      o = o || {};
      ctx.beginPath();
      if (o.dash) ctx.setLineDash(o.dash); else ctx.setLineDash([]);
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = o.color || C.line; ctx.lineWidth = o.lw || 1.3; ctx.stroke();
      ctx.setLineDash([]);
    },
    arrow: function (ctx, x1, y1, x2, y2, o) {
      o = o || {};
      var col = o.color || C.dim, hs = o.head || 6;
      G.line(ctx, x1, y1, x2, y2, { color: col, lw: o.lw || 1.4, dash: o.dash });
      var a = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - hs * Math.cos(a - 0.42), y2 - hs * Math.sin(a - 0.42));
      ctx.lineTo(x2 - hs * Math.cos(a + 0.42), y2 - hs * Math.sin(a + 0.42));
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    },
    curve: function (ctx, pts, o) {
      o = o || {};
      if (!pts || pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.strokeStyle = o.color || C.green; ctx.lineWidth = o.lw || 2; 
      if (o.dash) ctx.setLineDash(o.dash); else ctx.setLineDash([]);
      ctx.stroke(); ctx.setLineDash([]);
    },
    grid: function (ctx, x, y, w, h, nx, ny) {
      ctx.save(); G.alpha(ctx, 0.5);
      for (var i = 0; i <= nx; i++) G.line(ctx, x + w * i / nx, y, x + w * i / nx, y + h, { color: C.grid, lw: 1 });
      for (var j = 0; j <= ny; j++) G.line(ctx, x, y + h * j / ny, x + w, y + h * j / ny, { color: C.grid, lw: 1 });
      ctx.restore();
    },
    tick: function (ctx, x, y, col, sc) {
      sc = sc || 1;
      ctx.beginPath();
      ctx.moveTo(x - 4 * sc, y); ctx.lineTo(x - 1 * sc, y + 3.5 * sc); ctx.lineTo(x + 4.5 * sc, y - 4 * sc);
      ctx.strokeStyle = col || C.green; ctx.lineWidth = 2 * sc; ctx.lineCap = "round"; ctx.stroke();
      ctx.lineCap = "butt";
    },
    cross: function (ctx, x, y, col, sc) {
      sc = sc || 1;
      ctx.beginPath();
      ctx.moveTo(x - 4 * sc, y - 4 * sc); ctx.lineTo(x + 4 * sc, y + 4 * sc);
      ctx.moveTo(x + 4 * sc, y - 4 * sc); ctx.lineTo(x - 4 * sc, y + 4 * sc);
      ctx.strokeStyle = col || C.red; ctx.lineWidth = 2 * sc; ctx.lineCap = "round"; ctx.stroke();
      ctx.lineCap = "butt";
    },
    clip: function (ctx, s, max, ctxRef) {
      if (s.length <= max) return s;
      return s.slice(0, Math.max(0, max - 1)) + "\u2026";
    },
    fmt: function (n) {
      if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + "k";
      return "" + Math.round(n);
    },
    C: C
  };
  window.__HG = G;

  /* ---------- reel factory ---------- */
  function mkReel(cfg) {
    var root = document.getElementById(cfg.id);
    if (!root) return null;
    var stage = root.querySelector(".animation-stage");
    var canvas = document.createElement("canvas");
    var W = cfg.w || 1000, H = cfg.h || 600;
    canvas.width = W; canvas.height = H;
    canvas.style.width = "100%";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", cfg.aria || "Animated figure");
    stage.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var state = {};
    if (cfg.knobs) cfg.knobs.forEach(function (k) { state[k.key] = k.value; });

    var N = cfg.stages.length;
    var si = 0, ti = REDUCED ? 1 : 0, playing = false, speed = 1, raf = null, last = 0;
    var visible = false, userHeld = false, holdTimer = null;

    var statusEl = root.querySelector(".animation-status");
    var btnPrev = root.querySelector('[data-action="previous"]');
    var btnPlay = root.querySelector('[data-action="play-pause"]');
    var btnNext = root.querySelector('[data-action="next"]');
    var speedBtns = Array.prototype.slice.call(root.querySelectorAll("[data-speed]"));

    function camAt() {
      var cur = cfg.stages[si].cam || [W / 2, H / 2, 1];
      var prev = (si > 0 ? cfg.stages[si - 1].cam : cfg.stages[0].cam) || [W / 2, H / 2, 1];
      if (REDUCED) return cur;
      var e = G.ease(ti);
      return [G.lerp(prev[0], cur[0], e), G.lerp(prev[1], cur[1], e), G.lerp(prev[2], cur[2], e)];
    }

    function render() {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);
      var cam = camAt();
      ctx.translate(W / 2, H / 2);
      ctx.scale(cam[2], cam[2]);
      ctx.translate(-cam[0], -cam[1]);
      try { cfg.draw(ctx, si, REDUCED ? 1 : ti, state, G); }
      catch (e) { if (window.console) console.error("[fig " + cfg.id + "]", e); }
      ctx.restore();
      /* caption bar drawn in screen space */
      var cap = cfg.stages[si].caption;
      if (cap) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.font = "400 12.5px 'IBM Plex Mono', ui-monospace, monospace";
        var avail = W - 108, lines = [], words = cap.split(" "), cur = "";
        for (var wi = 0; wi < words.length; wi++) {
          var trial = cur ? cur + " " + words[wi] : words[wi];
          if (ctx.measureText(trial).width > avail && cur) { lines.push(cur); cur = words[wi]; }
          else cur = trial;
          if (lines.length === 2) break;
        }
        if (cur && lines.length < 2) lines.push(cur);
        var barH = lines.length > 1 ? 46 : 34;
        G.alpha(ctx, 0.95);
        G.box(ctx, 0, H - barH, W, barH, { fill: "#0b0f12", r: 0 });
        G.line(ctx, 0, H - barH, W, H - barH, { color: C.line });
        for (var li = 0; li < lines.length; li++) {
          G.txt(ctx, lines[li], 16, H - barH + 15 + li * 16, { size: 12.5, color: C.dim });
        }
        G.txt(ctx, (si + 1) + " / " + N, W - 16, H - barH + 15, { size: 12, color: C.faint, align: "right" });
        ctx.restore();
      }
    }

    function updateStatus() {
      if (statusEl) statusEl.textContent = "Stage " + String(si + 1).padStart(2, "0") + " / " + N + " \u00b7 " + cfg.stages[si].label;
    }

    function frame(now) {
      raf = null;
      if (!playing) return;
      var dt = last ? (now - last) / 1000 : 0;
      last = now;
      var dur = (cfg.stages[si].dur || cfg.dur || 2.1) / speed;
      ti += dt / dur;
      while (ti >= 1) {
        ti -= 1;
        si = (si + 1) % N;
        updateStatus();
      }
      render();
      raf = requestAnimationFrame(frame);
    }

    function play() {
      if (playing) return;
      playing = true; last = 0;
      if (btnPlay) { btnPlay.textContent = "Pause"; btnPlay.setAttribute("aria-pressed", "true"); btnPlay.setAttribute("aria-label", "Pause animation"); }
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      playing = false;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      if (btnPlay) { btnPlay.textContent = "Play"; btnPlay.setAttribute("aria-pressed", "false"); btnPlay.setAttribute("aria-label", "Play animation"); }
    }
    function step(d) {
      si = (si + d + N) % N; ti = 1;
      updateStatus(); render();
    }
    function hold() {
      userHeld = true;
      pause();
      if (holdTimer) clearTimeout(holdTimer);
      if (!REDUCED && cfg.resume !== false) {
        holdTimer = setTimeout(function () { userHeld = false; if (visible) play(); }, 9000);
      }
    }

    if (btnPrev) btnPrev.addEventListener("click", function () { hold(); step(-1); });
    if (btnNext) btnNext.addEventListener("click", function () { hold(); step(1); });
    if (btnPlay) btnPlay.addEventListener("click", function () {
      if (playing) { userHeld = true; pause(); }
      else { userHeld = false; if (holdTimer) clearTimeout(holdTimer); play(); }
    });
    speedBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        speed = parseFloat(b.getAttribute("data-speed"));
        speedBtns.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      });
    });

    /* knobs */
    if (cfg.knobs && cfg.knobs.length) {
      var lab = document.createElement("div");
      lab.className = "lab";
      cfg.knobs.forEach(function (k) {
        var f = document.createElement("div");
        f.className = "lab-field";
        var uid = cfg.id + "-" + k.key;
        f.innerHTML = '<label for="' + uid + '">' + k.label + '</label>' +
          '<input id="' + uid + '" type="range" min="' + k.min + '" max="' + k.max + '" step="' + (k.step || 1) + '" value="' + k.value + '" />' +
          '<output id="' + uid + '-out"></output>';
        lab.appendChild(f);
        var inp = f.querySelector("input"), out = f.querySelector("output");
        function sync() {
          state[k.key] = parseFloat(inp.value);
          out.textContent = k.fmt ? k.fmt(state[k.key], state) : state[k.key];
          if (cfg.onKnob) cfg.onKnob(state, G);
          render();
        }
        inp.addEventListener("input", sync);
        k._sync = sync;
      });
      if (cfg.labNote) {
        var nd = document.createElement("p");
        nd.className = "lab-note";
        nd.innerHTML = cfg.labNote;
        lab.appendChild(nd);
      }
      root.appendChild(lab);
      cfg.knobs.forEach(function (k) { k._sync(); });
    }

    updateStatus();
    if (cfg.onKnob) cfg.onKnob(state, G);
    render();

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          visible = e.isIntersecting;
          if (visible && !REDUCED && !userHeld && cfg.autoplay !== false) play();
          else if (!visible) pause();
        });
      }, { threshold: 0.25 });
      io.observe(root);
    } else if (!REDUCED && cfg.autoplay !== false) {
      visible = true; play();
    }
    return { render: render, state: state };
  }
  window.__mkReel = mkReel;
})();
