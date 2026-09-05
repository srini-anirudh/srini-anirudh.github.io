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
const blogFilterReset = document.querySelector(".blog-filter-reset");
const blogList = document.querySelector(".blog-list");
const originalBlogCardOrder = [...blogCards];
const learningPathPanel = document.querySelector(".learning-path-panel");
const learningPathTitle = document.querySelector(".learning-path-title");
const learningPathDescription = document.querySelector(".learning-path-description");
const learningPathGroups = document.querySelector(".learning-path-groups");

function getBlogCardSlug(card) {
  return (card.getAttribute("href") || "").replace(/^\.\//, "").replace(/\/$/, "");
}

function getLearningPathGroups(button) {
  return (button?.dataset.blogPaths || "")
    .split(";")
    .map((definition) => {
      const [label, slugs = ""] = definition.split("::");
      return { label: label?.trim(), slugs: slugs.split(/\s+/).filter(Boolean) };
    })
    .filter((group) => group.label && group.slugs.length);
}

function renderLearningPath(button) {
  if (!learningPathPanel || !learningPathGroups) return;
  const pathGroups = getLearningPathGroups(button);

  if (!pathGroups.length) {
    learningPathPanel.hidden = true;
    learningPathGroups.replaceChildren();
    return;
  }

  const cardsBySlug = new Map(blogCards.map((card) => [getBlogCardSlug(card), card]));
  const fragment = document.createDocumentFragment();
  pathGroups.forEach((group) => {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    const list = document.createElement("ol");
    heading.textContent = group.label;
    group.slugs.forEach((slug, index) => {
      const card = cardsBySlug.get(slug);
      if (!card) return;
      const item = document.createElement("li");
      const link = document.createElement("a");
      const number = document.createElement("span");
      const title = document.createElement("strong");
      number.textContent = String(index + 1).padStart(2, "0");
      title.textContent = card.querySelector("h3")?.textContent.trim() || slug;
      link.href = card.getAttribute("href");
      link.append(number, title);
      item.append(link);
      list.append(item);
    });
    section.append(heading, list);
    fragment.append(section);
  });

  learningPathTitle.textContent = button.dataset.blogFilterLabel || button.textContent.trim();
  learningPathDescription.textContent = button.dataset.pathDescription || "";
  learningPathGroups.replaceChildren(fragment);
  learningPathPanel.hidden = false;
}

function applyBlogFilter(filter, updateAddress = true) {
  if (!blogFilterButtons.length || !blogCards.length) return;

  const selected = blogFilterButtons.some((button) => button.dataset.blogFilter === filter)
    ? filter
    : "all";
  const selectedButton = blogFilterButtons.find((button) => button.dataset.blogFilter === selected);
  const pathSlugs = getLearningPathGroups(selectedButton).flatMap((group) => group.slugs);
  const selectedSeries = (selectedButton?.dataset.blogMembers || "").split(/\s+/).filter(Boolean);
  let visible = 0;

  if (blogList) {
    const cardsBySlug = new Map(blogCards.map((card) => [getBlogCardSlug(card), card]));
    const orderedCards = selected === "all"
      ? originalBlogCardOrder
      : [
          ...pathSlugs.map((slug) => cardsBySlug.get(slug)).filter(Boolean),
          ...originalBlogCardOrder.filter((card) => !pathSlugs.includes(getBlogCardSlug(card))),
        ];
    orderedCards.forEach((card) => blogList.append(card));
  }

  blogCards.forEach((card) => {
    const series = (card.dataset.blogSeries || "").split(/\s+/);
    const show = selected === "all" || selectedSeries.some((name) => series.includes(name));
    card.hidden = !show;
    if (show) visible += 1;
  });

  document.querySelectorAll("[data-blog-series-heading]").forEach((heading) => {
    const series = heading.dataset.blogSeriesHeading;
    heading.hidden = !blogCards.some((card) => !card.hidden && (card.dataset.blogSeries || "").split(/\s+/).includes(series));
  });

  blogFilterButtons.forEach((button) => {
    const active = button.dataset.blogFilter === selected;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (blogFilterStatus) {
    const label = selectedButton?.dataset.blogFilterLabel || selectedButton?.textContent.trim();
    blogFilterStatus.textContent = selected === "all"
      ? `Showing all ${visible} articles`
      : `Showing ${visible} ${visible === 1 ? "article" : "articles"} in ${label}`;
  }

  if (blogFilterReset) blogFilterReset.hidden = selected === "all";
  renderLearningPath(selected === "all" ? null : selectedButton);

  if (updateAddress) {
    const url = new URL(window.location.href);
    url.searchParams.delete("category");
    if (selected === "all") url.searchParams.delete("series");
    else url.searchParams.set("series", selected);
    window.history.replaceState({}, "", url);
  }
}

blogFilterButtons.forEach((button) => {
  button.addEventListener("click", () => applyBlogFilter(button.dataset.blogFilter));
});

if (blogFilterButtons.length) {
  const url = new URL(window.location.href);
  const legacyCategory = url.searchParams.get("category");
  const legacyCategoryMap = {
    architecture: "architectures",
    training: "llms",
    posttraining: "llms",
    reasoning: "llms",
    agents: "agents",
    systems: "systems",
    vlms: "vlms",
    foundations: "foundations",
  };
  const initialFilter = url.searchParams.get("series")
    || legacyCategoryMap[legacyCategory]
    || "all";
  applyBlogFilter(initialFilter, false);
}

window.addEventListener("popstate", () => {
  const selected = new URL(window.location.href).searchParams.get("series") || "all";
  applyBlogFilter(selected, false);
});

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

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });
}

async function initializeBlogMath() {
  if (!document.body.classList.contains("blog-article")) return;

  const article = document.querySelector("main.article-content, main.article-wrap, main");
  if (!article || !/(\$\$|\\\(|\\\[)/.test(article.textContent || "")) return;

  const version = "0.16.11";
  const base = `https://cdn.jsdelivr.net/npm/katex@${version}/dist`;
  if (!document.querySelector('link[data-blog-math="katex"]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = `${base}/katex.min.css`;
    stylesheet.dataset.blogMath = "katex";
    document.head.appendChild(stylesheet);
  }

  try {
    if (!window.katex) await loadScriptOnce(`${base}/katex.min.js`);
    if (!window.renderMathInElement) await loadScriptOnce(`${base}/contrib/auto-render.min.js`);
    window.renderMathInElement(article, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "svg"],
      throwOnError: false,
    });
    document.documentElement.dataset.mathReady = "true";
  } catch (_error) {
    document.documentElement.dataset.mathReady = "failed";
  }
}

initializeBlogMath();

function initializeDistillSideToc() {
  if (!document.body.classList.contains("blog-article")) return;

  const article = document.querySelector("main.article-content, main.article-wrap, main");
  let sourceLinks = [...document.querySelectorAll('.toc a[href^="#"], .article-toc a[href^="#"]')];
  if (!sourceLinks.length && article) {
    sourceLinks = [...article.querySelectorAll("section[id] > h2:first-child, h2[id]")].map((heading) => ({
      hash: `#${heading.closest("section[id]")?.id || heading.id}`,
      textContent: heading.textContent,
      cloneNode: () => heading.cloneNode(true),
      closest: () => null,
      querySelector: () => null,
    }));
  }
  const sourceToc = sourceLinks[0]?.closest(".toc");
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
  let layoutDirty = true;
  let gutterIntruders = [];
  const desktopMinimum = 1440;
  const railLeft = 32;
  const railWidth = 200;
  const railGap = 32;
  const contentBoundary = railLeft + railWidth + railGap;

  function containWideBlocks() {
    article.querySelectorAll(".blog-gutter-contained").forEach((element) => {
      element.classList.remove("blog-gutter-contained");
      element.style.removeProperty("--blog-gutter-nudge");
    });
    if (window.innerWidth < desktopMinimum) return;

    const articleRect = article.getBoundingClientRect();
    const wideThreshold = articleRect.width * 1.12;
    const candidates = [...article.querySelectorAll("*")].filter((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width < wideThreshold || rect.left >= contentBoundary) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && style.position !== "fixed";
    });
    const candidateSet = new Set(candidates);

    candidates
      .filter((element) => {
        let parent = element.parentElement;
        while (parent && parent !== article) {
          if (candidateSet.has(parent)) return false;
          parent = parent.parentElement;
        }
        return true;
      })
      .forEach((element) => {
        element.classList.add("blog-gutter-contained");
        const rect = element.getBoundingClientRect();
        const nudge = Math.max(0, Math.ceil(contentBoundary - rect.left));
        element.style.setProperty("--blog-gutter-nudge", `${nudge}px`);
      });
  }

  function measureGutterIntruders() {
    containWideBlocks();
    const articleRect = article.getBoundingClientRect();
    gutterIntruders = [...article.querySelectorAll("*")].filter((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1 || rect.left >= articleRect.left - 1) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && style.position !== "fixed";
    });
    layoutDirty = false;
  }

  function availableGutterBoundary() {
    if (layoutDirty) measureGutterIntruders();

    const railTop = 88;
    const railBottom = window.innerHeight - 28;
    let boundary = article.getBoundingClientRect().left;
    gutterIntruders.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom > railTop && rect.top < railBottom) boundary = Math.min(boundary, rect.left);
    });
    return boundary;
  }

  function placeRail() {
    const gutter = availableGutterBoundary();
    const pastInlineToc = !sourceToc || sourceToc.getBoundingClientRect().bottom <= 88;
    const contentKeepsLaneClear = gutter >= contentBoundary - 1;
    visible = pastInlineToc && window.innerWidth >= desktopMinimum && contentKeepsLaneClear;

    rail.classList.toggle("is-visible", visible);
    document.documentElement.classList.toggle("distill-side-toc-active", visible);
    if (!visible) return;

    rail.style.width = `${railWidth}px`;
    rail.style.left = `${railLeft}px`;
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
  window.addEventListener("resize", () => {
    layoutDirty = true;
    requestUpdate();
  }, { passive: true });
  window.addEventListener("load", () => {
    layoutDirty = true;
    requestUpdate();
  }, { once: true });
  document.fonts?.ready.then(() => {
    layoutDirty = true;
    requestUpdate();
  });
  update();
}

initializeDistillSideToc();
