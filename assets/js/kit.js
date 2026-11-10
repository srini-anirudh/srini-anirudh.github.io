/* Learner kit: calculators, module progress, expand/collapse. */
(function () {
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fmtT(us) {
    if (us < 1) { var ns = us * 1000; return ns.toFixed(ns < 10 ? 1 : 0) + " ns"; }
    if (us < 1000) return us.toFixed(us < 10 ? 1 : 0) + " µs";
    if (us < 1e6) return (us / 1000).toFixed(us < 1e4 ? 2 : 1) + " ms";
    return (us / 1e6).toFixed(2) + " s";
  }
  function fmtB(b) {
    if (b >= 1e9) return (b / 1e9).toFixed(1) + " GB";
    if (b >= 1048576) return (b / 1048576).toFixed(b / 1048576 < 10 ? 1 : 0) + " MiB";
    return (b / 1024).toFixed(0) + " KiB";
  }
  function logw(us) { return Math.max(2, Math.min(100, 100 * (Math.log10(us) + 3) / 8)); }

  var calcs = {
    roof: function (v) {
      var n = Math.pow(2, v.k), fl = 2 * n * n * n, by = 6 * n * n;
      var tc = fl / 989e12 * 1e6, tm = by / 3.35e12 * 1e6, tl = 8, mx = Math.max(tc, tm, tl);
      var verdict = mx === tl ? "Overhead bound. The GPU finishes before the CPU can launch the next kernel, so making the kernel faster would change nothing."
        : (tc >= tm ? "Compute bound. The maths units are the limit. This is where you want big matmuls to be." : "Memory bound. The units wait for HBM.");
      var ai = n / 3;
      return { o: { n: n.toLocaleString("en-US"), ai: (ai < 10 ? ai.toFixed(1) : Math.round(ai)) + " FLOPs/B", tc: fmtT(tc), tm: fmtT(tm), tl: fmtT(tl), verdict: verdict },
               bars: { bc: logw(tc), bm: logw(tm), bl: logw(tl) }, cls: mx === tl ? "warn" : (tc >= tm ? "good" : "bad") };
    },
    kv: function (v) {
      var pt = 2 * v.L * v.H * v.D * v.B, pr = pt * v.T, free = (v.NG * v.G * 0.9 - v.W) * 1e9;
      var n = free > 0 ? Math.floor(free / pr) : 0;
      return { o: { pt: (pt / 1024).toFixed(0) + " KiB", pr: fmtB(pr), free: free > 0 ? (free / 1e9).toFixed(0) + " GB" : "none", n: free > 0 ? n.toLocaleString("en-US") : "weights do not fit" },
               cls: free > 0 ? "good" : "bad" };
    },
    mem: function (v) {
      var st = 16 * v.P, per = st / v.N, lim = 80;
      var verdict = per <= lim ? "FSDP fits: " + per.toFixed(1) + " GB of state per GPU, before activations."
        : "Even sharded, " + per.toFixed(1) + " GB per GPU does not fit. Add GPUs, add tensor parallel, or offload.";
      return { o: { d: st.toFixed(0) + " GB", f: per.toFixed(1) + " GB", verdict: verdict },
               bars: { bd: Math.min(100, st / lim * 100), bf: Math.min(100, per / lim * 100) }, barcls: { bd: st > lim ? "bad" : "good", bf: per > lim ? "bad" : "good" }, cls: per <= lim ? "good" : "bad" };
    },
    ring: function (v) {
      var f = 2 * (v.N - 1) / v.N, sent = f * v.S, tb = sent / v.BW * 1e6, tl = 2 * (v.N - 1) * v.A, tt = tb + tl;
      return { o: { sent: sent.toFixed(2) + " GB", tb: fmtT(tb), tl: fmtT(tl), tt: fmtT(tt),
               verdict: tl > tb ? "Latency-dominated. The message is small for this link. Batch several into one." : "Bandwidth-dominated. The time is the data divided by the link speed." }, cls: tl > tb ? "warn" : "good" };
    }
  };

  $$(".kc[data-calc]").forEach(function (box) {
    var kind = box.getAttribute("data-calc"), fn = calcs[kind];
    if (kind === "grpo") return grpo(box);
    function read() {
      var v = {}; $$("[data-i]", box).forEach(function (i) { v[i.getAttribute("data-i")] = parseFloat(i.value) || 0; });
      return v;
    }
    function run() {
      var v = read(); if (kind === "kv" && v.T < 1) v.T = 1;
      var r = fn(v);
      Object.keys(r.o).forEach(function (k) { var e = $("[data-o='" + k + "']", box); if (e) e.textContent = r.o[k]; });
      if (r.bars) Object.keys(r.bars).forEach(function (k) { var e = $("[data-bar='" + k + "']", box); if (e) { e.style.width = r.bars[k] + "%"; e.className = (r.barcls && r.barcls[k]) || ""; } });
      var vd = $(".kc-verdict", box); if (vd && r.cls) vd.className = "kc-verdict " + r.cls;
      var nn = $("[data-o='n']", box); if (nn && kind === "kv") nn.parentNode.className = r.cls;
    }
    $$("[data-i]", box).forEach(function (i) { i.addEventListener("input", run); });
    $$("[data-preset]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var p = JSON.parse(b.getAttribute("data-preset"));
        Object.keys(p).forEach(function (k) { var i = $("[data-i='" + k + "']", box); if (i) i.value = p[k]; });
        run();
      });
    });
    run();
  });

  function grpo(box) {
    var rewards = [1, 0, 0, 1, 0, 0, 0, 1];
    var row = $("[data-o-html='gp']", box);
    function draw() {
      var n = rewards.length, mean = rewards.reduce(function (a, b) { return a + b; }, 0) / n;
      var sd = Math.sqrt(rewards.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / n);
      row.innerHTML = rewards.map(function (r, i) {
        var adv = sd > 1e-9 ? (r - mean) / sd : 0, w = Math.min(100, Math.abs(adv) / 3 * 100);
        return '<button type="button" class="gp ' + (r ? "pass" : "fail") + '" data-k="' + i + '"><span>' + (r ? "pass" : "fail") + '</span>' +
          '<em><i class="' + (adv >= 0 ? "pos" : "neg") + '" style="height:' + Math.max(3, w) + '%"></i></em><b>' + (adv >= 0 ? "+" : "−") + Math.abs(adv).toFixed(2) + '</b></button>';
      }).join("");
      $("[data-o='mean']", box).textContent = mean.toFixed(2); $("[data-o='std']", box).textContent = sd.toFixed(2);
      var vd = $(".kc-verdict", box);
      if (sd < 1e-9) { vd.textContent = "Every sample scored the same, so every advantage is zero. This prompt teaches the model nothing."; vd.className = "kc-verdict bad"; }
      else { vd.textContent = "Passing samples are pushed up, failing ones pushed down. The rarer the pass, the bigger its push."; vd.className = "kc-verdict good"; }
      $$(".gp", row).forEach(function (b) { b.addEventListener("click", function () { var k = +b.getAttribute("data-k"); rewards[k] = rewards[k] ? 0 : 1; draw(); }); });
    }
    draw();
  }

  /* progress */
  var KEY = "kit-done-v1", done = [];
  try { done = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { done = []; }
  var mods = $$("details.kit-mod[id^='m']").filter(function (d) { return /^m\d+$/.test(d.id); });
  function paint() {
    mods.forEach(function (d) { d.classList.toggle("done", done.indexOf(d.id) >= 0); });
    $$(".kit-map-c").forEach(function (a) { a.classList.toggle("done", done.indexOf(a.getAttribute("data-open")) >= 0); });
    $$(".kit-done").forEach(function (b) {
      var is = done.indexOf(b.getAttribute("data-mod")) >= 0, n = b.getAttribute("data-mod").slice(1);
      b.classList.toggle("on", is); $("span", b).textContent = is ? "Module " + n + " done. Tap to undo" : "Mark module " + n + " as done";
      $("i", b).className = is ? "fas fa-square-check" : "far fa-square-check";
    });
    var f = $("#kit-prog-fill"), t = $("#kit-prog-txt");
    if (f) f.style.width = (done.length / mods.length * 100) + "%";
    if (t) t.textContent = done.length + " of " + mods.length + " modules done";
  }
  $$(".kit-done").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("data-mod"), i = done.indexOf(id);
      if (i >= 0) done.splice(i, 1); else done.push(id);
      try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {}
      paint();
    });
  });
  paint();

  $$(".kit-map-c").forEach(function (a) {
    a.addEventListener("click", function () { var d = document.getElementById(a.getAttribute("data-open")); if (d) d.open = true; });
  });
  var all = function () { return $$("details.kit-mod"); };
  var bo = $("#kit-open"), bc = $("#kit-close");
  if (bo) bo.onclick = function () { all().forEach(function (d) { d.open = true; }); };
  if (bc) bc.onclick = function () { all().forEach(function (d) { d.open = false; }); };
  if (location.hash) { var t = document.querySelector(location.hash); if (t && t.tagName === "DETAILS") t.open = true; }
})();
