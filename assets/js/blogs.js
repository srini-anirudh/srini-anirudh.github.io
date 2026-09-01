const blogColorModeToggle = document.querySelector(".color-mode-toggle");
window.__blogShellReady = true;
document.documentElement.setAttribute("data-shell-ready", "true");
const blogSun = blogColorModeToggle?.querySelector(".sun");
const blogMoon = blogColorModeToggle?.querySelector(".moon");
const blogNavToggle = document.querySelector(".nav-toggle");
const blogNavLinks = document.querySelector(".nav-links");

function syncBlogTheme(enabled) {
  document.documentElement.classList.toggle("dark-mode", enabled);
  document.body.classList.toggle("dark-mode", enabled);
  blogSun?.classList.toggle("visible", !enabled);
  blogMoon?.classList.toggle("visible", enabled);
}

syncBlogTheme(localStorage.getItem("darkMode") === "enabled");

blogColorModeToggle?.addEventListener("click", () => {
  const enabled = !document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", enabled ? "enabled" : "disabled");
  syncBlogTheme(enabled);
});

function toggleBlogNavigation() {
  const open = blogNavToggle?.classList.toggle("open") || false;
  blogNavLinks?.classList.toggle("show", open);
  blogNavToggle?.setAttribute("aria-expanded", String(open));
}

blogNavToggle?.addEventListener("click", toggleBlogNavigation);
blogNavToggle?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggleBlogNavigation();
  }
});

const blogFilterButtons = [...document.querySelectorAll("[data-blog-filter]")];
const blogCards = [...document.querySelectorAll("[data-blog-categories]")];
const blogFilterStatus = document.querySelector(".blog-filter-status");

function applyBlogFilter(filter, updateAddress = true) {
  if (!blogFilterButtons.length || !blogCards.length) return;

  const selected = blogFilterButtons.some((button) => button.dataset.blogFilter === filter)
    ? filter
    : "all";
  let visible = 0;

  blogCards.forEach((card) => {
    const categories = (card.dataset.blogCategories || "").split(/\s+/);
    const show = selected === "all" || categories.includes(selected);
    card.hidden = !show;
    if (show) visible += 1;
  });

  document.querySelectorAll("[data-blog-series-heading]").forEach((heading) => {
    const series = heading.dataset.blogSeriesHeading;
    heading.hidden = !blogCards.some((card) => !card.hidden && card.dataset.blogSeries === series);
  });

  blogFilterButtons.forEach((button) => {
    const active = button.dataset.blogFilter === selected;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (blogFilterStatus) {
    const label = blogFilterButtons.find((button) => button.dataset.blogFilter === selected)?.textContent.trim();
    blogFilterStatus.textContent = selected === "all"
      ? `Showing all ${visible} articles`
      : `Showing ${visible} ${label} ${visible === 1 ? "article" : "articles"}`;
  }

  if (updateAddress) {
    const url = new URL(window.location.href);
    if (selected === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", selected);
    window.history.replaceState({}, "", url);
  }
}

blogFilterButtons.forEach((button) => {
  button.addEventListener("click", () => applyBlogFilter(button.dataset.blogFilter));
});

if (blogFilterButtons.length) {
  const initialFilter = new URL(window.location.href).searchParams.get("category") || "all";
  applyBlogFilter(initialFilter, false);
}

const animatedPreviewCards = [...document.querySelectorAll(".blog-card")]
  .filter((card) => card.querySelector("[data-animated-src]"));
const previewMotionAllowed = window.matchMedia("(prefers-reduced-motion: no-preference)");
const hoverPreviewAvailable = window.matchMedia("(hover: hover) and (pointer: fine)");

function setPreviewMotion(card, animate) {
  const preview = card.querySelector("[data-animated-src]");
  if (!preview) return;
  const nextSource = animate && previewMotionAllowed.matches
    ? preview.dataset.animatedSrc
    : preview.dataset.stillSrc;
  card.classList.toggle("is-animating-preview", Boolean(animate && previewMotionAllowed.matches));
  if (nextSource && preview.getAttribute("src") !== nextSource) preview.setAttribute("src", nextSource);
}

animatedPreviewCards.forEach((card) => {
  card.addEventListener("mouseenter", () => {
    if (hoverPreviewAvailable.matches) setPreviewMotion(card, true);
  });
  card.addEventListener("mouseleave", () => setPreviewMotion(card, false));
  card.addEventListener("focus", () => setPreviewMotion(card, true));
  card.addEventListener("blur", () => setPreviewMotion(card, false));
});

previewMotionAllowed.addEventListener?.("change", (event) => {
  if (!event.matches) animatedPreviewCards.forEach((card) => setPreviewMotion(card, false));
});

document.querySelectorAll(".article-share").forEach((button) => {
  button.addEventListener("click", async () => {
    const shareData = {
      title: document.title,
      text: document.querySelector('meta[name="description"]')?.content || document.title,
      url: window.location.href,
    };
    const status = button.parentElement.querySelector(".share-status");

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        if (status) {
          status.textContent = "Link copied";
          window.setTimeout(() => { status.textContent = ""; }, 2200);
        }
      }
    } catch (error) {
      if (error.name !== "AbortError" && status) {
        status.textContent = "Copy the URL to share";
      }
    }
  });
});

document.querySelectorAll("[data-copy-citation]").forEach((button) => {
  button.addEventListener("click", async () => {
    const citation = button.closest(".article-citation")?.querySelector("code")?.textContent.trim();
    const status = button.parentElement?.querySelector(".citation-status");
    if (!citation) return;

    try {
      await navigator.clipboard.writeText(citation);
      if (status) {
        status.textContent = "BibTeX copied";
        window.setTimeout(() => { status.textContent = ""; }, 2200);
      }
    } catch (_error) {
      if (status) status.textContent = "Select the BibTeX above to copy";
    }
  });
});

function initializeDistillSideToc() {
  if (!document.body.classList.contains("blog-article")) return;

  const article = document.querySelector("main.article-content");
  const sourceLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  const seenTargets = new Set();
  const entries = sourceLinks.flatMap((sourceLink) => {
    const id = decodeURIComponent(sourceLink.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target || seenTargets.has(id)) return [];
    seenTargets.add(id);

    const namedLabel = sourceLink.querySelector(".toc-name")?.textContent;
    const labelClone = sourceLink.cloneNode(true);
    labelClone.querySelectorAll(".toc-num, .toc-tag, .toc-sub").forEach((node) => node.remove());
    const firstChild = labelClone.firstElementChild;
    if (firstChild && /^\s*\d+[.·]?\s*$/.test(firstChild.textContent || "")) firstChild.remove();
    const label = (namedLabel || labelClone.textContent || target.textContent)
      .replace(/\s+/g, " ")
      .trim();
    return label ? [{ id, target, label }] : [];
  });

  if (!article || entries.length < 2) return;

  document.querySelectorAll(".toc-rail, .spy-rail, .distill-side-toc").forEach((rail) => rail.remove());

  const rail = document.createElement("nav");
  rail.className = "distill-side-toc";
  rail.setAttribute("aria-label", "On this page");
  const heading = document.createElement("h2");
  heading.textContent = "Contents";
  const list = document.createElement("ol");

  entries.forEach((entry) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${entry.id}`;
    link.textContent = entry.label;
    link.title = entry.label;
    item.appendChild(link);
    list.appendChild(item);
    entry.link = link;
  });

  rail.append(heading, list);
  document.body.appendChild(rail);

  let visible = false;
  let currentIndex = -1;
  let ticking = false;

  function placeRail() {
    const articleRect = article.getBoundingClientRect();
    const gutter = articleRect.left;
    const safetyGap = 32;
    const minimumWidth = 176;
    const maximumWidth = 232;
    const availableWidth = Math.floor(gutter - safetyGap - 18);
    visible = window.innerWidth >= 1180 && availableWidth >= minimumWidth;

    rail.classList.toggle("is-visible", visible);
    document.documentElement.classList.toggle("distill-side-toc-active", visible);
    if (!visible) return;

    const width = Math.min(maximumWidth, availableWidth);
    rail.style.width = `${width}px`;
    rail.style.left = `${Math.max(18, Math.floor(gutter - safetyGap - width))}px`;
  }

  function markCurrentSection() {
    if (!visible) return;
    const readingLine = Math.max(112, window.innerHeight * 0.3);
    let nextIndex = 0;
    entries.forEach((entry, index) => {
      if (entry.target.getBoundingClientRect().top <= readingLine) nextIndex = index;
    });
    if (nextIndex === currentIndex) return;
    currentIndex = nextIndex;
    entries.forEach((entry, index) => {
      if (index === currentIndex) entry.link.setAttribute("aria-current", "location");
      else entry.link.removeAttribute("aria-current");
    });
    const activeLink = entries[currentIndex].link;
    const linkTop = activeLink.offsetTop;
    const linkBottom = linkTop + activeLink.offsetHeight;
    if (linkTop < rail.scrollTop) {
      rail.scrollTop = linkTop;
    } else if (linkBottom > rail.scrollTop + rail.clientHeight) {
      rail.scrollTop = linkBottom - rail.clientHeight;
    }
  }

  function update() {
    placeRail();
    markCurrentSection();
    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();
}

initializeDistillSideToc();
