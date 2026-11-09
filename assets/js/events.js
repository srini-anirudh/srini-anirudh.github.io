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
