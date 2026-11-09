(function () {
  var root = document.getElementById("slide-viewer");
  if (!root) return;
  var count = parseInt(root.getAttribute("data-count"), 10);
  var base = root.getAttribute("data-base") || "slides/";
  var img = root.querySelector(".sv-img");
  var cur = root.querySelector(".sv-cur");
  var bar = root.querySelector(".sv-bar i");
  var prev = root.querySelector(".sv-prev");
  var next = root.querySelector(".sv-next");
  var full = root.querySelector(".sv-full");
  var texts = document.querySelectorAll(".sv-text li");
  var n = 1;

  function pad(i) { return ("000" + i).slice(-3); }
  function altFor(i) {
    var li = texts[i - 1];
    var t = li ? li.textContent.replace(/\s+/g, " ").trim() : "";
    return "Slide " + i + " of " + count + (t ? ": " + t.slice(0, 140) : "");
  }
  function preload(i) {
    if (i < 1 || i > count) return;
    var p = new Image();
    p.src = base + pad(i) + ".webp";
  }
  function show(i, push) {
    n = Math.max(1, Math.min(count, i));
    img.src = base + pad(n) + ".webp";
    img.alt = altFor(n);
    cur.textContent = n;
    bar.style.width = (100 * n / count) + "%";
    prev.disabled = n === 1;
    next.disabled = n === count;
    preload(n + 1);
    preload(n + 2);
    preload(n - 1);
    if (push !== false) {
      try { history.replaceState(null, "", "#" + n); } catch (e) {}
    }
  }
  function go(d) { show(n + d); }

  prev.addEventListener("click", function () { go(-1); });
  next.addEventListener("click", function () { go(1); });
  if (full) {
    full.addEventListener("click", function () {
      var el = root;
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else if (el.requestFullscreen) { el.requestFullscreen(); }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k === "ArrowRight" || k === "PageDown" || k === " " && !e.shiftKey) { e.preventDefault(); go(1); }
    else if (k === "ArrowLeft" || k === "PageUp" || k === " " && e.shiftKey) { e.preventDefault(); go(-1); }
    else if (k === "Home") { e.preventDefault(); show(1); }
    else if (k === "End") { e.preventDefault(); show(count); }
    else if (k === "f" || k === "F") { if (full) full.click(); }
  });
  var x0 = null;
  var stage = root.querySelector(".sv-stage");
  stage.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });
  img.addEventListener("click", function (e) {
    var r = img.getBoundingClientRect();
    go(e.clientX - r.left > r.width / 2 ? 1 : -1);
  });
  window.addEventListener("hashchange", function () {
    var h = parseInt(location.hash.slice(1), 10);
    if (h && h !== n) show(h, false);
  });
  var start = parseInt(location.hash.slice(1), 10) || 1;
  show(start, false);
})();
