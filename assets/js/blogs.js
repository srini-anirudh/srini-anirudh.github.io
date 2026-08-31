const blogColorModeToggle = document.querySelector(".color-mode-toggle");
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
