/* Simple photo lightbox for the Events page. */
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll("a.ev-photo"));
  if (!links.length) return;
  var box = document.createElement("div");
  box.className = "ev-lb"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Photo viewer");
  box.innerHTML = '<button class="ev-x" aria-label="Close">&times;</button><button class="ev-prev" aria-label="Previous">&#8249;</button><img alt="" /><div class="ev-lb-cap"></div><button class="ev-next" aria-label="Next">&#8250;</button>';
  document.body.appendChild(box);
  var img = box.querySelector("img"), cap = box.querySelector(".ev-lb-cap"), cur = 0;
  function show(i) {
    cur = (i + links.length) % links.length;
    img.src = links[cur].getAttribute("href"); img.alt = links[cur].getAttribute("data-cap") || "";
    cap.textContent = (links[cur].getAttribute("data-cap") || "") + "  (" + (cur + 1) + "/" + links.length + ")";
  }
  function open(i) { show(i); box.classList.add("open"); document.body.style.overflow = "hidden"; }
  function close() { box.classList.remove("open"); document.body.style.overflow = ""; }
  links.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); open(i); }); });
  box.querySelector(".ev-x").addEventListener("click", close);
  box.querySelector(".ev-prev").addEventListener("click", function (e) { e.stopPropagation(); show(cur - 1); });
  box.querySelector(".ev-next").addEventListener("click", function (e) { e.stopPropagation(); show(cur + 1); });
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
  });
})();

/* Contents bar: highlight the section in view, and a soft reveal for the big blocks. */
(function () {
  var toc = document.querySelector(".ev-toc");
  if (!toc || !("IntersectionObserver" in window)) return;
  var map = {};
  Array.prototype.forEach.call(toc.querySelectorAll("a[href^='#']"), function (a) { map[a.getAttribute("href").slice(1)] = a; });
  var vis = {};
  var spy = new IntersectionObserver(function (es) {
    es.forEach(function (e) { vis[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
    var best = null, bv = 0;
    Object.keys(vis).forEach(function (k) { if (vis[k] > bv) { bv = vis[k]; best = k; } });
    Object.keys(map).forEach(function (k) { map[k].classList.toggle("on", k === best); });
    if (best && map[best] && toc.scrollWidth > toc.clientWidth) {
      var a = map[best]; toc.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
    }
  }, { rootMargin: "-90px 0px -45% 0px", threshold: [0, .1, .3, .6] });
  Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var rv = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } });
  }, { threshold: 0.04 });
  Array.prototype.forEach.call(document.querySelectorAll(".ev-take, .ev-qa, .ev-kitbanner, .dg"), function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) return;
    el.classList.add("ev-reveal"); rv.observe(el);
  });
})();
