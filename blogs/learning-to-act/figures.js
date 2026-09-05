/* Learning to Act — figure engine.
   One controller drives every animated panel in the article. A figure
   registers a spec: { total, captions, render(t, p), controls, sub }
   where t is a continuous stage position (0 .. total-1) so that motion is
   interpolated rather than snapped, and p is the figure's parameter object
   fed by any interactive inputs. */
(function () {
  "use strict";

  var SPECS = {};
  var REDUCED = false;
  try {
    REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) { REDUCED = false; }

  /* ---------- small math / string helpers shared by all figures ---------- */
  var H = {
    lerp: function (a, b, u) { return a + (b - a) * u; },
    clamp: function (v, a, b) { return v < a ? a : (v > b ? b : v); },
    ease: function (u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; },
    easeOut: function (u) { return 1 - Math.pow(1 - u, 3); },
    smooth: function (u) { return u * u * (3 - 2 * u); },
    /* progress of stage k as t sweeps through it: 0 before, 0..1 during, 1 after */
    seg: function (t, k) { return H.clamp(t - k, 0, 1); },
    /* eased version of the above */
    segE: function (t, k) { return H.smooth(H.clamp(t - k, 0, 1)); },
    /* a value that rises then falls across one stage — for flashes */
    pulse: function (t, k) { var u = H.clamp(t - k, 0, 1); return Math.sin(Math.PI * u); },
    fmt: function (v, d) { return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d); },
    esc: function (s) {
      return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    /* interpolate between two viewBox arrays for camera moves */
    cam: function (a, b, u) {
      u = H.clamp(u, 0, 1);
      var e = H.smooth(u);
      return [H.lerp(a[0], b[0], e), H.lerp(a[1], b[1], e), H.lerp(a[2], b[2], e), H.lerp(a[3], b[3], e)]
        .map(function (v) { return Math.round(v * 100) / 100; }).join(" ");
    },
    /* rounded rect path */
    box: function (x, y, w, h, r) {
      r = Math.min(r || 0, w / 2, h / 2);
      return "M" + (x + r) + " " + y + "h" + (w - 2 * r) + "a" + r + " " + r + " 0 0 1 " + r + " " + r +
        "v" + (h - 2 * r) + "a" + r + " " + r + " 0 0 1 " + (-r) + " " + r + "h" + (-(w - 2 * r)) +
        "a" + r + " " + r + " 0 0 1 " + (-r) + " " + (-r) + "v" + (-(h - 2 * r)) +
        "a" + r + " " + r + " 0 0 1 " + r + " " + (-r) + "z";
    },
    /* polyline from an array of [x,y] */
    poly: function (pts) {
      return pts.map(function (p, i) { return (i ? "L" : "M") + H.fmt(p[0], 2) + " " + H.fmt(p[1], 2); }).join("");
    },
    /* cubic-ish smooth path through points */
    curve: function (pts) {
      if (pts.length < 3) return H.poly(pts);
      var d = "M" + H.fmt(pts[0][0], 2) + " " + H.fmt(pts[0][1], 2);
      for (var i = 1; i < pts.length; i++) {
        var p0 = pts[i - 1], p1 = pts[i];
        var mx = (p0[0] + p1[0]) / 2;
        d += "C" + H.fmt(mx, 2) + " " + H.fmt(p0[1], 2) + " " + H.fmt(mx, 2) + " " + H.fmt(p1[1], 2) +
          " " + H.fmt(p1[0], 2) + " " + H.fmt(p1[1], 2);
      }
      return d;
    },
    arrow: function (x1, y1, x2, y2, col, w, op, dash) {
      var a = Math.atan2(y2 - y1, x2 - x1), L = 7;
      var hx = x2 - Math.cos(a) * 1.2, hy = y2 - Math.sin(a) * 1.2;
      return '<path d="' + H.poly([[x1, y1], [x2, y2]]) + '" stroke="' + col + '" stroke-width="' + (w || 1.4) +
        '" fill="none" opacity="' + (op === undefined ? 1 : op) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/>' +
        '<path d="M' + H.fmt(hx, 2) + ' ' + H.fmt(hy, 2) +
        'L' + H.fmt(hx - Math.cos(a - 0.42) * L, 2) + ' ' + H.fmt(hy - Math.sin(a - 0.42) * L, 2) +
        'L' + H.fmt(hx - Math.cos(a + 0.42) * L, 2) + ' ' + H.fmt(hy - Math.sin(a + 0.42) * L, 2) +
        'z" fill="' + col + '" opacity="' + (op === undefined ? 1 : op) + '"/>';
    },
    /* deterministic pseudo-random so figures are reproducible frame to frame */
    rnd: function (seed) {
      var s = seed % 2147483647; if (s <= 0) s += 2147483646;
      return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    }
  };

  var C = {
    bg: "#0f1317", panel: "#141a20", line: "#2b353e", grid: "#1e262d",
    ink: "#e4eaee", dim: "#93a0a8", faint: "#5d6a73",
    green: "#3fd1a0", blue: "#5ab2e8", amber: "#f0b357",
    red: "#f0706f", purple: "#b48ce0", pink: "#ef7fb4", teal: "#54d6d0"
  };

  function reg(id, spec) { SPECS[id] = spec; }

  /* ---------------------------- the controller --------------------------- */
  function mount(host) {
    var id = host.getAttribute("data-figure");
    var spec = SPECS[id];
    if (!spec) return;

    var stage = host.querySelector(".animation-stage");
    var status = host.querySelector(".animation-status");
    var capEl = host.querySelector(".figure-caption-live");
    var controlsRow = host.querySelector(".animation-controls");
    var paramHost = host.querySelector(".figure-params");

    var total = spec.total;
    var pos = 0.98;              /* continuous position in [0, total-1+eps); k+0.98 = stage k, settled */
    var playing = !REDUCED && spec.autoplay !== false;
    var speed = 1;
    var params = {};
    var raf = null, last = 0, visible = false, nudged = false;

    if (spec.params) {
      spec.params.forEach(function (p) { params[p.key] = p.value; });
    }

    function draw() {
      var t = H.clamp(pos, 0, total - 1);
      var svg;
      try { svg = spec.render(t, params); }
      catch (err) { svg = '<text x="10" y="20" fill="#f0706f" font-size="11">figure error</text>'; }
      stage.innerHTML = svg;
      var k = Math.min(total - 1, Math.floor(pos + 1e-6));
      if (status) status.textContent = "Stage " + String(k + 1).padStart(2, "0") + " / " + total;
      if (capEl) capEl.textContent = spec.captions[k] || "";
      if (spec.onDraw) spec.onDraw(params, k, host);
    }

    function loop(ts) {
      if (!playing) { raf = null; return; }
      if (!last) last = ts;
      var dt = Math.min(0.12, (ts - last) / 1000);
      last = ts;
      var rate = (spec.rate || 0.75) * speed;    /* stages per second */
      pos += dt * rate;
      if (pos >= total - 1 + (spec.hold === undefined ? 0.9 : spec.hold)) pos = 0;
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (REDUCED) return;
      playing = true; last = 0;
      if (!raf) raf = requestAnimationFrame(loop);
      setPlayBtn();
    }
    function stop() {
      playing = false;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      setPlayBtn();
    }
    var playBtn = host.querySelector('[data-action="play-pause"]');
    function setPlayBtn() {
      if (!playBtn) return;
      playBtn.textContent = playing ? "Pause" : "Play";
      playBtn.setAttribute("aria-label", playing ? "Pause animation" : "Play animation");
      playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    }

    host.querySelectorAll("[data-action]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-action");
        if (a === "play-pause") { playing ? stop() : start(); return; }
        stop();
        var k = Math.floor(pos + 1e-6);
        if (a === "next") k = (k + 1) % total;
        if (a === "previous") k = (k - 1 + total) % total;
        pos = k + 0.98; draw();
      });
    });
    host.querySelectorAll("[data-speed]").forEach(function (b) {
      b.addEventListener("click", function () {
        speed = parseFloat(b.getAttribute("data-speed"));
        host.querySelectorAll("[data-speed]").forEach(function (o) {
          o.setAttribute("aria-pressed", o === b ? "true" : "false");
        });
      });
    });

    /* interactive parameters render as labelled range inputs under the controls */
    if (spec.params && paramHost) {
      spec.params.forEach(function (p) {
        var wrap = document.createElement("label");
        wrap.className = "figure-param";
        var name = document.createElement("span");
        name.className = "figure-param-name";
        name.textContent = p.label;
        var input = document.createElement("input");
        input.type = "range";
        input.min = p.min; input.max = p.max; input.step = p.step;
        input.value = p.value;
        input.setAttribute("aria-label", p.label);
        var out = document.createElement("output");
        out.className = "figure-param-value";
        out.textContent = p.fmt ? p.fmt(p.value) : p.value;
        input.addEventListener("input", function () {
          params[p.key] = parseFloat(input.value);
          out.textContent = p.fmt ? p.fmt(params[p.key]) : params[p.key];
          stop();
          draw();
        });
        wrap.appendChild(name); wrap.appendChild(input); wrap.appendChild(out);
        paramHost.appendChild(wrap);
      });
    }

    /* pause while the reader is fiddling, resume on leaving the figure */
    host.addEventListener("pointerdown", function () { if (playing) stop(); });

    if ("IntersectionObserver" in window && !REDUCED) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          visible = e.isIntersecting;
          if (visible && !nudged && spec.autoplay !== false) { nudged = true; start(); }
          else if (!visible && playing) stop();
        });
      }, { threshold: 0.28 });
      io.observe(host);
    }

    if (REDUCED) {
      playing = false;
      setPlayBtn();
      if (playBtn) playBtn.disabled = true;
    } else {
      setPlayBtn();
    }
    draw();
  }

  function boot() {
    document.querySelectorAll("[data-figure]").forEach(mount);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.LTA = { reg: reg, H: H, C: C, specs: SPECS, mount: mount, reduced: REDUCED };
})();
