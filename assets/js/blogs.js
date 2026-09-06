const blogShellScriptSource = document.currentScript?.src || "";
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

const blogFilterButtons = [...document.querySelectorAll(".blog-filter[data-blog-filter]")];
const blogCards = [...document.querySelectorAll("[data-blog-categories]")];
const blogFilterStatus = document.querySelector(".blog-filter-status");
const blogFilterReset = document.querySelector(".blog-filter-reset");
const blogSearchInput = document.querySelector("[data-blog-search]");
const blogTagFilter = document.querySelector("[data-blog-tag-filter]");
const blogList = document.querySelector(".blog-list");
const originalBlogCardOrder = [...blogCards];
const learningPathPanel = document.querySelector(".learning-path-panel");
const learningPathTitle = document.querySelector(".learning-path-title");
const learningPathDescription = document.querySelector(".learning-path-description");
const learningPathGroups = document.querySelector(".learning-path-groups");

function getBlogCardSlug(card) {
  return (card.getAttribute("href") || "").replace(/^\.\//, "").replace(/\/$/, "");
}

function normalizeBlogFilterText(value) {
  return (value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();
}

function getBlogCardTags(card) {
  return [...card.querySelectorAll(".blog-tags span")]
    .map((tag) => tag.textContent.trim())
    .filter(Boolean);
}

const blogCardSearchData = new Map(blogCards.map((card) => {
  const title = card.querySelector("h3")?.textContent || "";
  const summary = card.querySelector(".blog-card-body > p")?.textContent || "";
  const label = card.querySelector(".blog-card-label")?.textContent || "";
  const tags = getBlogCardTags(card);
  return [card, {
    tags: tags.map(normalizeBlogFilterText),
    text: normalizeBlogFilterText([title, summary, label, ...tags].join(" ")),
  }];
}));

if (blogTagFilter && blogCards.length) {
  const tags = new Map();
  blogCards.forEach((card) => {
    getBlogCardTags(card).forEach((label) => {
      const value = normalizeBlogFilterText(label);
      const current = tags.get(value) || { label, count: 0 };
      current.count += 1;
      tags.set(value, current);
    });
  });
  [...tags.entries()]
    .sort((left, right) => left[1].label.localeCompare(right[1].label))
    .forEach(([value, tag]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = `${tag.label} (${tag.count})`;
      blogTagFilter.append(option);
    });
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

let activeBlogFilter = "all";
let activeBlogSearch = "";
let activeBlogTag = "all";

function applyBlogFilters(updateAddress = true) {
  if (!blogFilterButtons.length || !blogCards.length) return;

  const selected = blogFilterButtons.some((button) => button.dataset.blogFilter === activeBlogFilter)
    ? activeBlogFilter
    : "all";
  activeBlogFilter = selected;
  const selectedButton = blogFilterButtons.find((button) => button.dataset.blogFilter === selected);
  const pathSlugs = getLearningPathGroups(selectedButton).flatMap((group) => group.slugs);
  const selectedSeries = (selectedButton?.dataset.blogMembers || "").split(/\s+/).filter(Boolean);
  const searchTokens = normalizeBlogFilterText(activeBlogSearch).split(/\s+/).filter(Boolean);
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
    const searchData = blogCardSearchData.get(card);
    const matchesTopic = selected === "all" || selectedSeries.some((name) => series.includes(name));
    const matchesTag = activeBlogTag === "all" || searchData.tags.includes(activeBlogTag);
    const matchesSearch = !searchTokens.length || searchTokens.every((token) => searchData.text.includes(token));
    const show = matchesTopic && matchesTag && matchesSearch;
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
    const tagLabel = blogTagFilter?.selectedOptions[0]?.textContent.replace(/\s+\(\d+\)$/, "");
    const qualifiers = [];
    if (selected !== "all") qualifiers.push(`in ${label}`);
    if (activeBlogTag !== "all") qualifiers.push(`tagged ${tagLabel}`);
    if (activeBlogSearch.trim()) qualifiers.push(`matching “${activeBlogSearch.trim()}”`);
    blogFilterStatus.textContent = !qualifiers.length
      ? `Showing all ${visible} articles`
      : `Showing ${visible} ${visible === 1 ? "article" : "articles"} ${qualifiers.join(" ")}`;
  }

  if (blogFilterReset) {
    blogFilterReset.hidden = selected === "all" && activeBlogTag === "all" && !activeBlogSearch.trim();
  }
  renderLearningPath(selected === "all" ? null : selectedButton);

  if (updateAddress) {
    const url = new URL(window.location.href);
    url.searchParams.delete("category");
    if (selected === "all") url.searchParams.delete("series");
    else url.searchParams.set("series", selected);
    if (activeBlogTag === "all") url.searchParams.delete("tag");
    else url.searchParams.set("tag", activeBlogTag);
    if (activeBlogSearch.trim()) url.searchParams.set("q", activeBlogSearch.trim());
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url);
  }
}

blogFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeBlogFilter = button.dataset.blogFilter;
    applyBlogFilters();
  });
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
  activeBlogFilter = url.searchParams.get("series")
    || legacyCategoryMap[legacyCategory]
    || "all";
  activeBlogSearch = url.searchParams.get("q") || "";
  activeBlogTag = normalizeBlogFilterText(url.searchParams.get("tag")) || "all";
  if (blogSearchInput) blogSearchInput.value = activeBlogSearch;
  if (blogTagFilter && [...blogTagFilter.options].some((option) => option.value === activeBlogTag)) {
    blogTagFilter.value = activeBlogTag;
  } else {
    activeBlogTag = "all";
  }
  applyBlogFilters(false);
}

blogSearchInput?.addEventListener("input", () => {
  activeBlogSearch = blogSearchInput.value;
  applyBlogFilters();
});

blogTagFilter?.addEventListener("change", () => {
  activeBlogTag = blogTagFilter.value;
  applyBlogFilters();
});

blogFilterReset?.addEventListener("click", () => {
  activeBlogFilter = "all";
  activeBlogSearch = "";
  activeBlogTag = "all";
  if (blogSearchInput) blogSearchInput.value = "";
  if (blogTagFilter) blogTagFilter.value = "all";
  applyBlogFilters();
});

window.addEventListener("popstate", () => {
  const url = new URL(window.location.href);
  activeBlogFilter = url.searchParams.get("series") || "all";
  activeBlogSearch = url.searchParams.get("q") || "";
  activeBlogTag = normalizeBlogFilterText(url.searchParams.get("tag")) || "all";
  if (blogSearchInput) blogSearchInput.value = activeBlogSearch;
  if (blogTagFilter) {
    if (![...blogTagFilter.options].some((option) => option.value === activeBlogTag)) activeBlogTag = "all";
    blogTagFilter.value = activeBlogTag;
  }
  applyBlogFilters(false);
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

function flashcardElement(tag, className, textContent) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent !== undefined) element.textContent = textContent;
  return element;
}

function cleanFlashcardSourceText(value, limit = Infinity) {
  const text = (value || "")
    .replace(/[\u00a0\u2007\u202f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= limit) return text;
  const shortened = text.slice(0, Math.max(0, limit - 1));
  const wordBoundary = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, wordBoundary > limit * 0.72 ? wordBoundary : shortened.length).trim()}…`;
}

function flashcardSentenceSummary(value, limit = 280) {
  const sourceText = cleanFlashcardSourceText(value);
  const mathSnippets = [];
  const text = sourceText.replace(/\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/g, (snippet) => {
    const token = `\uE100${mathSnippets.length}\uE101`;
    mathSnippets.push(snippet);
    return token;
  });
  const restoreMath = (summary) => summary
    .replace(/\uE100(\d+)\uE101/g, (_match, index) => mathSnippets[Number(index)] || "")
    .replace(/\uE100\d*…?$/g, "…");
  if (text.length <= limit) return restoreMath(text);
  const decimalSafeText = text.replace(/(\d)\.(\d)/g, "$1\uE000$2");
  const sentences = (decimalSafeText.match(/[^.!?]+[.!?]+(?:[”’"']|$)?/g) || [])
    .map((sentence) => sentence.replace(/\uE000/g, "."));
  let summary = "";
  for (const sentence of sentences) {
    if (!summary && sentence.trim().length > limit) return restoreMath(cleanFlashcardSourceText(sentence, limit));
    if (summary && summary.length + sentence.trim().length + 1 > limit) {
      if (summary.length < limit * 0.46) return restoreMath(cleanFlashcardSourceText(`${summary} ${sentence}`, limit));
      break;
    }
    summary = `${summary} ${sentence.trim()}`.trim();
    if (summary.length >= limit * 0.58) break;
  }
  return restoreMath(summary || cleanFlashcardSourceText(text, limit));
}

function cleanFlashcardHeading(value) {
  return cleanFlashcardSourceText(value)
    .replace(/^\d+\s*[.\-—:]\s*/, "")
    .replace(/^part\s+[ivxlcdm\d]+\s*[:\-—]\s*/i, "")
    .trim();
}

function flashcardReadableProse(node) {
  if (!node || node.matches?.("figcaption, .fig-cap, .fig-note, .figure-caption, .figure-note, .eq, .math, .math-block, .eqbox, .keymath, .formula, .key-math")) return "";
  const rawText = cleanFlashcardSourceText(node.textContent);
  if (/^(?:\$\$[\s\S]+\$\$|\\\[[\s\S]+\\\]|\\\([\s\S]+\\\))$/.test(rawText)) return "";
  const clone = node.cloneNode(true);
  clone.querySelectorAll([
    ".katex",
    ".katex-display",
    ".eq",
    ".math",
    ".math-block",
    ".eq-inline",
    ".eqbox",
    ".keymath",
    ".formula",
    ".key-math",
    "script",
    "style",
  ].join(", ")).forEach((element) => element.remove());
  return cleanFlashcardSourceText(clone.textContent);
}

function flashcardInsightScore(value, title = "") {
  const text = cleanFlashcardSourceText(value);
  const titleTokens = flashcardCoverageTokens(title);
  const textTokens = flashcardCoverageTokens(text);
  let score = Math.min(3, titleTokens.filter((token) => textTokens.includes(token)).length);
  if (/(?:therefore|which means|this means|so that|because|implies?|consequence|trade-?off|rule of thumb|in practice|the result|the key|the point|must|should|cannot|only when|instead|rather than|,\s*not\b)/i.test(text)) score += 4;
  if (/(?:\buse\b|choose|prefer|avoid|keep|replace|allocate|budget)/i.test(text)) score += 3;
  if (/(?:scales? (?:as|with)|grows?|falls?|increases?|decreases?|reduces?|costs?|saves?|dominates?|bottleneck|bounded?|optimal|stable|unstable)/i.test(text)) score += 4;
  if (/(?:failure|fails?|wrong|risk|danger|incident|security|privacy|leak|poison|struggle|highest-leverage|most systems)/i.test(text)) score += 3;
  if (/(?:beats?|matters?|worth|currency|mental model|rule|invariant)/i.test(text)) score += 3;
  if (/(?:\d[\d,]*(?:\.\d+)?\s*(?:[-–]\s*)?(?:×|x|%|flops?|bytes?|tokens?)|[=≈∝≤≥]|\bO\s*\()/i.test(text)) score += 3;
  if (/(?:for example|specifically|holding .* fixed|doubling|halving)/i.test(text)) score += 2;
  if (/^(?:nobody starts|there is a moment|before |everything (?:so far|above)|first,|here is|now |one last|pulling |start (?:with|from)|the claim of this section|this section|we (?:begin|have|started)|so far)/i.test(text)) score -= 6;
  if (/^(?:and|but|so|which)\b/i.test(text)) score -= 5;
  if (/[:：]\s*$/.test(text)) score -= 4;
  if (/^(?:in|on) (?:january|february|march|april|may|june|july|august|september|october|november|december|19\d\d|20\d\d)/i.test(text)) score -= 2;
  return score;
}

function flashcardInsightSummary(value, title = "", limit = 280) {
  const source = cleanFlashcardSourceText(value);
  if (!source) return "";
  const protectedParts = [];
  const protectedText = source
    .replace(/\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/g, (snippet) => {
      const token = `\uE110${protectedParts.length}\uE111`;
      protectedParts.push(snippet);
      return token;
    })
    .replace(/\b(?:et al|e\.g|i\.e|Fig|Eq|Sec|Dr)\./gi, (abbreviation) => abbreviation.replace(/\./g, "\uE002"))
    .replace(/(\d)\.(\d)/g, "$1\uE000$2");
  const restore = (text) => text
    .replace(/\uE000/g, ".")
    .replace(/\uE002/g, ".")
    .replace(/\uE110(\d+)\uE111/g, (_match, index) => protectedParts[Number(index)] || "");
  const sentences = (protectedText.match(/[^.!?]+[.!?]+(?:[”’"']|$)?|[^.!?]+$/g) || [])
    .map((sentence, index) => ({
      index,
      text: restore(sentence.trim()),
    }))
    .filter((sentence) => sentence.text.length >= 18);
  if (!sentences.length) return flashcardSentenceSummary(source, limit);
  sentences.forEach((sentence) => { sentence.score = flashcardInsightScore(sentence.text, title); });
  const ranked = [...sentences].sort((left, right) => right.score - left.score || left.index - right.index);
  const selected = [ranked[0]];
  for (const candidate of ranked.slice(1)) {
    const prospectiveLength = selected.reduce((total, sentence) => total + sentence.text.length + 1, 0) + candidate.text.length;
    if (candidate.score < 2 || prospectiveLength > limit) continue;
    selected.push(candidate);
    if (selected.length === 3) break;
  }
  const summary = selected.sort((left, right) => left.index - right.index).map((sentence) => sentence.text).join(" ");
  return flashcardSentenceSummary(summary, limit);
}

function collectFlashcardSections(article) {
  const excluded = /^(contents?|table of contents|references?|further reading|related (?:reading|articles?)|citation|acknowledg(?:e)?ments?|notes?)$/i;
  const isUsefulHeading = (heading) => {
    if (heading.closest("nav, .toc, .article-toc, footer, .article-citation")) return false;
    const title = cleanFlashcardHeading(heading.textContent);
    return title.length > 2 && !excluded.test(title);
  };

  let headings = [...article.querySelectorAll("h2")].filter(isUsefulHeading);
  if (headings.length < 3) {
    headings = [...headings, ...article.querySelectorAll("h3")]
      .filter(isUsefulHeading)
      .filter((heading, index, all) => all.indexOf(heading) === index)
      .filter((heading) => !heading.closest(".panel-head, figure, .article-panel"));
  }
  headings.sort((left, right) => (
    left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  ));

  const readingOrder = [...article.querySelectorAll("h2, h3, p, figcaption, .aside-note, .keyline, .nuance, section > ul > li, section > ol > li")];
  const seenTitles = new Set();
  return headings.flatMap((heading, index) => {
    const title = cleanFlashcardHeading(heading.textContent);
    const titleKey = title.toLowerCase();
    if (seenTitles.has(titleKey)) return [];
    seenTitles.add(titleKey);

    if (!heading.id) heading.id = `article-concept-${index + 1}`;
    const start = readingOrder.indexOf(heading);
    const summaries = [];
    for (let cursor = start + 1; cursor < readingOrder.length; cursor += 1) {
      const candidate = readingOrder[cursor];
      if (candidate.matches("h2") || candidate.matches(heading.tagName.toLowerCase())) break;
      if (!candidate.matches("p, figcaption, .aside-note, .keyline, .nuance, li")) continue;
      if (candidate.closest("nav, .toc, .article-toc, footer, .article-citation, .animation-controls")) continue;
      const text = flashcardReadableProse(candidate);
      if (text.length < 45 || /^figure\s+\d+/i.test(text)) continue;
      summaries.push(text);
      if (summaries.length === 14) break;
    }

    const transitional = /^(?:before |everything (?:so far|above)|first,|here is|now |one last|pulling |start (?:with|from)|the claim of this section|this section|we (?:begin|have|started)|so far)/i;
    const rankedSummaries = summaries
      .filter((text) => text.length >= 85 && !transitional.test(text))
      .map((text, position) => ({ text, score: flashcardInsightScore(text, title) - position * 0.08 }))
      .sort((left, right) => right.score - left.score);
    const summarySource = rankedSummaries[0]?.text
      || summaries.find((text) => text.length >= 85)
      || summaries[0]
      || "";
    const summary = flashcardInsightSummary(summarySource, title, 300);
    return [{
      id: heading.id,
      title,
      summary,
      heading,
      index,
    }];
  });
}

function formulaLooksMeaningful(value, isTex = false) {
  const text = cleanFlashcardSourceText(value);
  if (text.length < 4 || text.length > 1600) return false;
  if (isTex) {
    return /[=<>^]|\\(?:frac|sum|prod|int|sqrt|approx|propto|le|ge|exp|log|mathbb|mathcal|operatorname|begin)\b/.test(text);
  }
  return /[=≈≃∝≤≥<>±×÷/∑∏∫√→]|\b(?:argmax|argmin|softmax|log|exp|var|expectation|flops?|bytes?|O\s*\()\b/i.test(text);
}

function flashcardPlainFormula(value) {
  let text = cleanFlashcardSourceText(value)
    .replace(/^\$\$|\$\$$/g, "")
    .replace(/^\\\[|\\\]$/g, "")
    .replace(/^\\\(|\\\)$/g, "")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁴/g, "^4")
    .replace(/⁵/g, "^5")
    .replace(/⁻/g, "-")
    .replace(/\\mathcal\{O\}/g, "O")
    .replace(/\\(?:operatorname|mathrm|mathbf|mathit|mathbb)\{([^{}]*)\}/g, "$1")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)")
    .replace(/√\s*([A-Za-zα-ωΑ-Ωℓ]+(?:_[A-Za-z0-9]+)?)/g, "sqrt($1)")
    .replace(/\\(?:cdot|times)/g, "*")
    .replace(/\\(?:leq|le)/g, "≤")
    .replace(/\\(?:geq|ge)/g, "≥")
    .replace(/\\approx/g, "≈")
    .replace(/\\propto/g, "∝")
    .replace(/\\(?:left|right|bigl|bigr|Bigl|Bigr)/g, "")
    .replace(/\^\(([^()]+)\)/g, "^$1")
    .replace(/_\(([^()]+)\)/g, "_$1")
    .replace(/\^\{([^{}]+)\}/g, "^$1")
    .replace(/_\{([^{}]+)\}/g, "_$1")
    .replace(/[{}]/g, "")
    .replace(/\\([A-Za-z]+)/g, "$1");
  for (let pass = 0; pass < 2; pass += 1) {
    text = text.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)");
  }
  return cleanFlashcardSourceText(text);
}

function flashcardSemanticMathText(node) {
  const clone = node.cloneNode(true);
  clone.querySelectorAll("sup").forEach((script) => script.replaceWith(`^(${cleanFlashcardSourceText(script.textContent)})`));
  clone.querySelectorAll("sub").forEach((script) => script.replaceWith(`_(${cleanFlashcardSourceText(script.textContent)})`));
  return cleanFlashcardSourceText(clone.textContent);
}

function flashcardFormulaKey(value) {
  return flashcardPlainFormula(value)
    .toLowerCase()
    .replace(/[·×]/g, "*")
    .replace(/[\s\u200b()[\]]+/g, "")
    .replace(/[;,.:]+$/g, "");
}

function flashcardFormulaSubject(node) {
  const row = node.closest?.("tr");
  if (!row) return "";
  const firstCell = row.querySelector("th, td");
  const currentCell = node.closest("th, td");
  if (!firstCell || firstCell === currentCell) return "";
  return cleanFlashcardSourceText(firstCell.textContent, 70);
}

function flashcardUsefulFormulaContext(value, formulaText) {
  const context = cleanFlashcardSourceText(value);
  if (!context || flashcardFormulaKey(context) === flashcardFormulaKey(formulaText)) return "";
  const proseOnly = context
    .replace(/\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/g, " ")
    .replace(/\\[A-Za-z]+/g, " ")
    .replace(/[^A-Za-z\s-]/g, " ");
  const proseWords = (proseOnly.match(/\b[A-Za-z][A-Za-z-]{2,}\b/g) || [])
    .filter((word) => !/^(?:argmax|argmin|frac|left|right|mathbb|mathrm|sqrt|sum|times)$/i.test(word));
  return proseWords.length >= 5 ? flashcardSentenceSummary(context, 290) : "";
}

function flashcardSplitFormulaTerms(expression) {
  const terms = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < expression.length; index += 1) {
    if (expression[index] === "(") depth += 1;
    else if (expression[index] === ")") depth -= 1;
    else if (expression[index] === "+" && depth === 0) {
      terms.push(expression.slice(start, index));
      start = index + 1;
    }
  }
  terms.push(expression.slice(start));
  return terms.map((term) => term.trim()).filter(Boolean);
}

function flashcardScalingFactors(expression) {
  const compact = flashcardPlainFormula(expression)
    .replace(/\s+/g, "")
    .replace(/sqrt\(([^()]+)\)/gi, "$1^0.5");
  if (!compact || /(?:log|exp|softmax|sum|var|conv|min|max)/i.test(compact) || /\([^)]*[+−-][^)]*\)/.test(compact)) return null;
  const divisionParts = compact.split("/");
  if (divisionParts.length > 2) return null;
  const factors = new Map();
  let denominatorConstant = null;

  divisionParts.forEach((part, partIndex) => {
    const denominator = partIndex === 1;
    if (denominator && /^\(?\d+(?:\.\d+)?\)?$/.test(part)) denominatorConstant = Number(part.replace(/[()]/g, ""));
    const tokenPattern = /([A-Za-zα-ωΑ-ΩℓσΣ](?:_[A-Za-z0-9]+)?)(?:\^(-?\d+(?:\.\d+)?))?/g;
    let match;
    while ((match = tokenPattern.exec(part))) {
      const variable = match[1];
      const exponent = Number(match[2] || 1) * (denominator ? -1 : 1);
      factors.set(variable, (factors.get(variable) || 0) + exponent);
    }
    const remainder = part
      .replace(tokenPattern, "")
      .replace(/[\d.*·×^()+−-]/g, "");
    if (remainder) factors.clear();
  });

  [...factors.entries()].forEach(([variable, exponent]) => {
    if (!exponent || variable === "O") factors.delete(variable);
  });
  if (!factors.size || factors.size > 5) return null;
  return { factors, denominatorConstant };
}

function flashcardFactorDescription(variable, exponent) {
  if (exponent === 1) return `linear in ${variable}`;
  if (exponent === 2) return `quadratic in ${variable}`;
  if (exponent === 3) return `cubic in ${variable}`;
  if (exponent === 0.5) return `square-root in ${variable}`;
  if (exponent === -1) return `inversely proportional to ${variable}`;
  if (exponent === -2) return `inverse-quadratic in ${variable}`;
  return exponent > 0 ? `proportional to ${variable}^${exponent}` : `proportional to 1/${variable}^${Math.abs(exponent)}`;
}

function flashcardDoublingEffect(variable, exponent, noun = "it") {
  if (exponent === 1) return `doubling ${variable} doubles ${noun}`;
  if (exponent === 2) return `doubling ${variable} makes ${noun} 4× larger`;
  if (exponent === 3) return `doubling ${variable} makes ${noun} 8× larger`;
  if (exponent === 0.5) return `doubling ${variable} makes ${noun} about 1.41× larger`;
  if (exponent === -1) return `doubling ${variable} halves ${noun}`;
  if (exponent === -2) return `doubling ${variable} cuts ${noun} to one quarter`;
  const multiplier = Math.pow(2, Math.abs(exponent));
  const formatted = Number.isInteger(multiplier) ? String(multiplier) : multiplier.toFixed(2);
  return exponent > 0
    ? `doubling ${variable} makes ${noun} ${formatted}× larger`
    : `doubling ${variable} divides ${noun} by ${formatted}`;
}

function flashcardFormulaConsequence(value, subject = "") {
  const plain = flashcardPlainFormula(value);
  const compact = plain.replace(/\s+/g, "");
  const complexity = compact.match(/^(?:O|Θ)\((.*)\)$/i);
  let expression = complexity?.[1] || "";
  let quantity = subject ? `${subject} cost` : "The quantity";

  if (complexity && expression === "1") {
    return `${quantity} is constant-time with respect to the modeled input size. Doubling that input does not increase this operation's asymptotic work, although fixed implementation costs still remain.`;
  }

  if (/[∈⊂]\s*(?:R|ℝ)/.test(plain)) {
    const shapeBody = plain.match(/[∈⊂]\s*(?:R|ℝ)\s*\^?\s*\(?([^)]{1,100})\)?/i)?.[1] || "";
    const shapeScaling = flashcardScalingFactors(shapeBody);
    if (shapeScaling) {
      const axes = [...shapeScaling.factors.keys()];
      const effects = [...shapeScaling.factors]
        .slice(0, 4)
        .map(([variable, exponent]) => flashcardDoublingEffect(variable, exponent, "the stored element count"));
      return `This is a tensor-shape constraint. Storage scales with the product of its axes (${axes.join(", ")}); ${effects.join("; ")}. The same dimensions also determine which matrix products are valid.`;
    }
    return "This is a shape constraint, not a scalar equality: it specifies the object's permitted dimensions and therefore which products are valid. Storage grows with the product of the listed axis sizes.";
  }
  const rootSum = compact.match(/^([A-Za-z]+)\+sqrt\(?([A-Za-z]+)\)?\+sqrt\(?([A-Za-z]+)\)?$/i);
  if (rootSum) {
    return `${quantity} combines a linear ${rootSum[1]} term with square-root ${rootSum[2]} and ${rootSum[3]} terms. Doubling ${rootSum[1]} doubles the linear contribution, while either square-root input must grow 4× to double its contribution.`;
  }

  const inverseRoot = compact.match(/^(?:O\()?1\/sqrt\(?([A-Za-zα-ωΑ-Ωℓ]+)\)?\)?$/i);
  if (inverseRoot) {
    return `${quantity} falls with the inverse square root of ${inverseRoot[1]}. Doubling ${inverseRoot[1]} multiplies it by \\(1/\\sqrt{2}\\approx0.71\\); cutting it in half requires 4× more ${inverseRoot[1]}.`;
  }
  const rootDenominator = compact.match(/^([A-Za-zα-ωΑ-Ωℓ]+)\/sqrt\(?([A-Za-zα-ωΑ-Ωℓ]+)\)?$/i);
  if (rootDenominator) {
    return `${quantity} is linear in ${rootDenominator[1]} and inverse-square-root in ${rootDenominator[2]}. Doubling ${rootDenominator[1]} doubles it; doubling ${rootDenominator[2]} multiplies it by about 0.71.`;
  }
  const inverseVariable = compact.match(/^1\/([A-Za-zα-ωΑ-Ωḡ]+)$/i);
  if (inverseVariable) {
    return `${quantity} is inversely proportional to ${inverseVariable[1]}. Doubling ${inverseVariable[1]} halves it; halving ${inverseVariable[1]} doubles it.`;
  }
  const symbolicPower = compact.match(/^([A-Za-z])\^(-?[A-Za-zα-ωΑ-Ω]+|-?\d*\.\d+)$/i);
  if (symbolicPower) {
    const exponent = Number(symbolicPower[2]);
    if (Number.isFinite(exponent)) {
      const factor = Math.pow(2, exponent);
      return `${quantity} follows a power law in ${symbolicPower[1]} with exponent ${exponent}. Doubling ${symbolicPower[1]} multiplies it by \\(2^{${exponent}}\\approx${factor.toFixed(2)}\\), ${factor < 1 ? "so it decreases" : factor < 2 ? "so it grows sublinearly" : "so it grows superlinearly"}.`;
    }
    const negative = symbolicPower[2].startsWith("-");
    return `${quantity} is a power law in ${symbolicPower[1]}. Because the exponent is ${negative ? "negative" : "positive"}, increasing ${symbolicPower[1]} ${negative ? "reduces" : "increases"} the result; doubling it changes the result by \\(2^{${symbolicPower[2]}}\\).`;
  }
  if (/∂.+\/∂.+(?:→|≈|=)I/.test(compact)) {
    return "The local Jacobian approaches the identity, so both activations and gradients pass through the block with little rescaling instead of being repeatedly amplified or attenuated.";
  }
  if (/q(?:\^T|⊤)?k\/sqrt\(?d\)?/i.test(compact)) {
    return "The raw dot-product variance grows with head width \\(d\\); dividing by \\(\\sqrt d\\) keeps the attention-logit scale roughly constant, preventing softmax from saturating merely because the head is wider.";
  }
  if (/\/[^/]*(?:\|\||‖).*(?:\^2|²)/.test(compact)) {
    return "The denominator is squared: doubling its magnitude cuts the ratio to one quarter, while halving it makes the ratio 4× larger.";
  }
  if (/(?:1|beta)\)?\/\(?(?:lvert)?y(?:rvert)?\)?logpi/i.test(compact)) {
    const betaScaled = /beta/i.test(compact);
    return `Dividing sequence log-probability by response length turns a sum into a per-token average, removing the automatic penalty on longer answers.${betaScaled ? " The β factor sets preference strength: doubling β doubles the margin before the outer loss is applied." : " Length now matters only through answer quality, not simply through the number of accumulated log-probability terms."}`;
  }
  if (/^logpi(?:_|$)/i.test(compact)) {
    return "Raw sequence log-probability sums one usually-negative term per token, so longer answers receive a larger-magnitude penalty unless the objective normalizes for length.";
  }

  if (!expression) {
    const relation = plain.match(/^(.{1,45}?)(?:=|≈|∝)(.+)$/);
    if (relation && relation[2].length <= 90) {
      expression = relation[2];
      const left = cleanFlashcardSourceText(relation[1], 32);
      if (left && !/[+*/]/.test(left)) quantity = left;
    }
  }
  if (!expression && /^[\dA-Za-zα-ωΑ-Ωℓ().+*/^_-]+$/.test(compact) && /[A-Za-zα-ωΑ-Ωℓ]/.test(compact) && /[+*/^]/.test(compact)) {
    expression = compact;
  }

  if (expression) {
    const distributive = expression.match(/^(.*?)\(([^()+]+)\+([^()+]+)\)(.*?)$/);
    if (distributive) {
      const [, prefix, firstBranch, secondBranch, suffix] = distributive;
      expression = `${prefix}${firstBranch}${suffix}+${prefix}${secondBranch}${suffix}`;
    }
    const terms = flashcardSplitFormulaTerms(expression);
    const parsedTerms = terms.map(flashcardScalingFactors);
    if (parsedTerms.every(Boolean)) {
      if (parsedTerms.length === 1) {
        const parsed = parsedTerms[0];
        const descriptions = [...parsed.factors].map(([variable, exponent]) => flashcardFactorDescription(variable, exponent));
        const effects = [...parsed.factors].slice(0, 4).map(([variable, exponent]) => flashcardDoublingEffect(variable, exponent));
        const constant = parsed.denominatorConstant && parsed.denominatorConstant > 1
          ? ` The /${parsed.denominatorConstant} lowers the constant by ${parsed.denominatorConstant}× but does not change the asymptotic order.`
          : "";
        return `${quantity} is ${descriptions.join(", ")}. Holding other terms fixed, ${effects.join("; ")}.${constant}`;
      }

      const termNames = ["first", "second", "third"];
      const descriptions = parsedTerms.map((parsed, index) => (
        `the ${termNames[index] || `${index + 1}th`} term is ${[...parsed.factors].map(([variable, exponent]) => flashcardFactorDescription(variable, exponent)).join(", ")}`
      ));
      const variables = [...new Set(parsedTerms.flatMap((parsed) => [...parsed.factors.keys()]))].slice(0, 3);
      const effects = variables.map((variable) => {
        const changes = parsedTerms.map((parsed, index) => {
          const exponent = parsed.factors.get(variable) || 0;
          const noun = `the ${termNames[index] || `${index + 1}th`} term`;
          return exponent ? flashcardDoublingEffect(variable, exponent, noun) : `${noun} is unchanged`;
        });
        return changes.join(" while ");
      });
      const effectText = effects.join("; ");
      return `${quantity} adds two regimes: ${descriptions.join("; ")}. ${effectText.charAt(0).toUpperCase()}${effectText.slice(1)}. Whichever term is larger dominates the total.`;
    }
  }

  if (/softmax|exp\([^)]*\).*\/(?:sum|Σ)/i.test(plain)) {
    return "The outputs are coupled probabilities: raising one logit increases its share while reducing the others, and adding the same constant to every logit changes nothing.";
  }
  if (/(?:≥|≤|<|>)/.test(plain)) {
    return "This is a regime boundary: moving a quantity across the threshold changes which condition or approximation is valid.";
  }
  if (/\b(?:min|max)\b/i.test(plain)) {
    return "The active branch changes when the arguments cross; within a branch, only the selected argument controls the result.";
  }
  if (/\b(?:log|ln)\b/i.test(plain)) {
    return "The logarithm turns multiplicative changes into additive ones, so ratios—not raw differences—set the scale of the effect.";
  }
  if (/[=≈∝]/.test(plain)) {
    return "Read the right-hand side as a sensitivity map: coefficients set proportional changes, powers amplify them, and denominators suppress them.";
  }
  return "";
}

function flashcardFormulaExplanation({ formulaText, context, subject, section }) {
  const prose = flashcardUsefulFormulaContext(context, formulaText);
  const consequence = flashcardFormulaConsequence(formulaText, subject);
  const proseAlreadyExplainsChange = /(?:\d+(?:\.\d+)?\s*[×x]|quadratic|linear|doubl|halv|increase|decrease|reduction|proportional|scales? (?:as|with)|grows?|shrinks?)/i.test(prose);
  if (prose && consequence && !proseAlreadyExplainsChange) return flashcardSentenceSummary(`${consequence} ${prose}`, 430);
  if (prose) return prose;
  if (consequence) return consequence;
  return `This relationship formalizes “${section?.title || "the section's core mechanism"}”. To read its sensitivity, change one input at a time while holding the others fixed, then compare the resulting value or regime.`;
}

function collectFlashcardFormulae(article, sections) {
  const formulae = [];
  const seen = new Map();
  const mathSelector = ".eq, .math, .math-block, .eq-inline, .eqbox, .keymath, .formula, .key-math, .m, .v";
  const ignoredSelector = "nav, .toc, .article-toc, script, style, pre, svg, canvas, .article-citation";

  const sectionForNode = (node) => {
    let current = null;
    sections.forEach((section) => {
      if (section.heading === node || (section.heading.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)) current = section;
    });
    return current;
  };

  const nearbyExplanation = (node) => {
    const findText = (direction) => {
      let sibling = node[direction];
      for (let steps = 0; sibling && steps < 4; steps += 1, sibling = sibling[direction]) {
        if (sibling.matches?.("h2, h3")) break;
        const candidate = sibling.matches?.("p, .aside-note, .keyline, .nuance")
          ? sibling
          : sibling.querySelector?.("p:not(.fig-caption):not(.figure-caption)");
        const text = cleanFlashcardSourceText(candidate?.textContent);
        if (text.length >= 55) return text;
      }
      return "";
    };
    return findText("nextElementSibling") || findText("previousElementSibling");
  };

  const addFormula = ({ node, text, html = "", tex = "", context = "", subject = "", forceMeaningful = false }) => {
    if (!forceMeaningful && !formulaLooksMeaningful(text, Boolean(tex))) return;
    const key = flashcardFormulaKey(text);
    if (!key) return;
    const section = sectionForNode(node);
    const formulaSubject = subject || flashcardFormulaSubject(node);
    const explanation = flashcardFormulaExplanation({ formulaText: text, context, subject: formulaSubject, section });
    if (seen.has(key)) {
      const existing = seen.get(key);
      const existingIsFallback = /formalizes|compare cases by changing/i.test(existing.context);
      const candidateIsSpecific = /\d+(?:\.\d+)?\s*[×x]|quadratic|linear|doubl|halv|increase|decrease|reduction|proportional/i.test(explanation);
      if (existingIsFallback || (candidateIsSpecific && !/\d+(?:\.\d+)?\s*[×x]|quadratic|linear|doubl|halv|increase|decrease|reduction|proportional/i.test(existing.context))) {
        existing.context = explanation;
      }
      return;
    }
    const formula = {
      text: cleanFlashcardSourceText(text),
      html,
      tex,
      context: explanation,
      sectionId: section?.id || "core-relationships",
      sectionTitle: section?.title || "Core relationships",
    };
    formulae.push(formula);
    seen.set(key, formula);
  };

  [...article.querySelectorAll(mathSelector)].forEach((node) => {
    if (node.closest(ignoredSelector)) return;
    const parentMath = node.parentElement?.closest(mathSelector);
    if (parentMath) return;
    const isInlineNotation = node.matches(".m, .v, .eq-inline");
    if (isInlineNotation && !node.closest("p, li, td, th, figcaption")) return;
    const clone = node.cloneNode(true);
    const noteText = [...clone.querySelectorAll(".math-note, .eq-note, .eqnote, .an, .lbl")]
      .map((note) => note.textContent)
      .join(" ");
    clone.querySelectorAll(".math-note, .eq-note, .eqnote, .an, .lbl, script, style, button").forEach((child) => child.remove());
    clone.querySelectorAll("[id]").forEach((child) => child.removeAttribute("id"));
    const text = flashcardSemanticMathText(clone);
    const compactRatio = text.includes("/") && cleanFlashcardSourceText(text).length <= 44 && !/\b[a-z]{4,}\s+[a-z]{4,}\b/i.test(text);
    const meaningfulSuperscript = Boolean(clone.querySelector("sup")) && cleanFlashcardSourceText(text).length >= 3;
    if (isInlineNotation && !formulaLooksMeaningful(text) && !compactRatio && !meaningfulSuperscript) return;
    const adjacentNote = node.nextElementSibling?.matches(".math-note, .eq-note, .eqnote, .an, .lbl")
      ? node.nextElementSibling.textContent
      : "";
    addFormula({
      node,
      text,
      html: clone.innerHTML,
      context: noteText || adjacentNote || (isInlineNotation ? node.closest("p, li, td, th, figcaption")?.textContent : "") || nearbyExplanation(node),
      forceMeaningful: isInlineNotation && (compactRatio || meaningfulSuperscript),
    });
  });

  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();
  const texPattern = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g;
  while (textNode) {
    const parent = textNode.parentElement;
    if (parent && !parent.closest(ignoredSelector) && !parent.closest(mathSelector)) {
      let match;
      while ((match = texPattern.exec(textNode.nodeValue || ""))) {
        const tex = match[0];
        const inner = match[1] || match[2] || match[3] || "";
        const context = (parent.textContent || "").replace(match[0], " ");
        addFormula({
          node: parent,
          text: inner,
          tex,
          context: cleanFlashcardSourceText(context) || nearbyExplanation(parent),
          subject: flashcardFormulaSubject(parent),
        });
      }
      texPattern.lastIndex = 0;
    }
    textNode = walker.nextNode();
  }

  [...article.querySelectorAll("code")].forEach((node) => {
    if (node.closest(ignoredSelector) || node.closest(mathSelector)) return;
    const text = flashcardSemanticMathText(node);
    const hasStrongRelationship = /[=≈≃∝≤≥<>±×÷∑∏∫√→]|\b(?:argmax|argmin|softmax|log|exp|var|flops?|bytes?|O\s*\()\b/i.test(text);
    const isRatioExpression = text.includes("/") && /[\d()^]/.test(text);
    if ((!hasStrongRelationship && !isRatioExpression) || text.length > 240) return;
    addFormula({
      node,
      text,
      html: node.innerHTML,
      context: node.closest("p, li, figcaption")?.textContent || "",
      subject: flashcardFormulaSubject(node),
    });
  });

  return formulae;
}

function captureFlashcardArticleSource(article) {
  const sections = collectFlashcardSections(article);
  return { sections, formulae: collectFlashcardFormulae(article, sections) };
}

const flashcardCoverageStopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "in", "into", "is", "it",
  "model", "models", "of", "on", "or", "part", "the", "this", "to", "toward", "towards", "what", "when", "where", "why", "with",
]);

function flashcardCoverageTokens(value) {
  return cleanFlashcardSourceText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 2 && !flashcardCoverageStopWords.has(token));
}

function buildFlashcardSectionReview(sections, cards) {
  const cardText = cards.map((card) => flashcardCoverageTokens(`${card[0]} ${card[2] || ""}`));
  return sections.flatMap((section) => {
    if (!section.summary) return [];
    const sectionTokens = [...new Set(flashcardCoverageTokens(section.title))];
    const covered = sectionTokens.length && cardText.some((tokens) => {
      const overlap = sectionTokens.filter((token) => tokens.includes(token)).length;
      return overlap >= Math.min(2, Math.ceil(sectionTokens.length * 0.5));
    });
    if (covered) return [];
    const question = /\?$/.test(section.title)
      ? section.title
      : `What should you retain from “${section.title}”?`;
    const reviewCard = [question, section.summary, `Section lens · ${section.title}`];
    reviewCard.sectionId = section.id;
    return [reviewCard];
  });
}

function matchFlashcardCardToSection(card, sections) {
  const cardTokens = [...new Set(flashcardCoverageTokens(`${card[0]} ${card[2] || ""}`))];
  let best = null;
  sections.forEach((section) => {
    const sectionTokens = [...new Set(flashcardCoverageTokens(section.title))];
    if (!sectionTokens.length) return;
    const overlap = sectionTokens.filter((token) => cardTokens.includes(token)).length;
    const required = Math.min(2, Math.ceil(sectionTokens.length * 0.5));
    const score = overlap / sectionTokens.length;
    if (overlap >= required && (!best || score > best.score)) best = { section, score };
  });
  return best?.section || null;
}

function flashcardTakeaway(value) {
  return flashcardInsightSummary(value, "", 280);
}

function appendFlashcardFormula(target, formula) {
  if (formula.html) target.innerHTML = formula.html;
  else target.textContent = formula.tex || formula.text;
}

async function initializeBlogFlashcards() {
  if (!document.body.classList.contains("blog-article")) return;

  const pathParts = location.pathname.split("/").filter(Boolean);
  const blogsIndex = pathParts.lastIndexOf("blogs");
  const slug = blogsIndex >= 0 ? pathParts[blogsIndex + 1] : "";
  const article = document.querySelector("main.article-content, main.article-wrap, main");
  if (!slug || !article || !blogShellScriptSource) return;
  const articleSource = captureFlashcardArticleSource(article);

  try {
    const dataUrl = new URL("blog-flashcards-data.js", blogShellScriptSource).href;
    if (!window.BLOG_FLASHCARDS?.[slug]) await loadScriptOnce(dataUrl);
  } catch (_error) {
    return;
  }

  const deck = window.BLOG_FLASHCARDS?.[slug];
  if (!deck || !Array.isArray(deck.cards) || !deck.cards.length) return;
  const deepDiveCards = Array.isArray(deck.deepDive) ? deck.deepDive : [];
  const curatedCards = [...deck.cards, ...deepDiveCards];
  const sectionReviewCards = buildFlashcardSectionReview(articleSource.sections, curatedCards);
  const deckCards = [...curatedCards, ...sectionReviewCards];
  const estimatedMinutes = Math.max(3, Math.ceil(
    deckCards.length * 0.65
    + (deck.results?.length || 0) * 0.35
    + (deck.table?.rows?.length || 0) * 0.22
    + articleSource.formulae.length * 0.12,
  ));

  const switcher = flashcardElement("section", "article-view-switcher");
  switcher.setAttribute("aria-label", "Choose a reading format");
  const switcherInner = flashcardElement("div", "article-view-switcher__inner");
  switcherInner.appendChild(flashcardElement("span", "article-view-switcher__label", "Read as"));
  const controls = flashcardElement("div", "article-view-switcher__controls");
  const articleButton = flashcardElement("button", "article-view-switcher__button", "Full article");
  const cardsButton = flashcardElement("button", "article-view-switcher__button", "TL;DR flashcards");
  articleButton.type = cardsButton.type = "button";
  controls.append(articleButton, cardsButton);
  switcherInner.appendChild(controls);
  switcher.appendChild(switcherInner);

  const panel = flashcardElement("section", "flashcard-deck");
  panel.hidden = true;
  panel.setAttribute("aria-labelledby", "flashcard-deck-title");

  const hero = flashcardElement("header", "flashcard-deck__hero");
  const heroCopy = flashcardElement("div", "flashcard-deck__hero-copy");
  const formulaCountLabel = articleSource.formulae.length ? ` · ${articleSource.formulae.length} formulae` : "";
  heroCopy.appendChild(flashcardElement("p", "flashcard-deck__eyebrow", `TL;DR · ${deckCards.length} questions${formulaCountLabel} · about ${estimatedMinutes} min`));
  const title = flashcardElement("h2", "flashcard-deck__title", deck.title);
  title.id = "flashcard-deck-title";
  heroCopy.append(title, flashcardElement("p", "flashcard-deck__summary", deck.summary));

  const heroVisual = flashcardElement("div", "flashcard-deck__visual");
  const preview = document.createElement("img");
  preview.dataset.src = new URL(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "./preview.png" : "./preview.gif", location.href).href;
  preview.alt = `Visual summary for ${deck.title}`;
  preview.loading = "lazy";
  heroVisual.appendChild(preview);
  hero.append(heroCopy, heroVisual);

  const framework = flashcardElement("aside", "flashcard-framework");
  framework.appendChild(flashcardElement("p", "flashcard-framework__eyebrow", "First-principles concept map"));
  const frameworkMap = flashcardElement("div", "flashcard-framework__map");
  const frameworkCenter = flashcardElement("div", "flashcard-framework__center");
  frameworkCenter.append(
    flashcardElement("span", "flashcard-framework__center-label", "Central idea"),
    flashcardElement("strong", "", deck.title),
  );
  const frameworkFlow = flashcardElement("ol", "flashcard-framework__flow");
  (deck.framework || []).forEach((step, index) => {
    const item = flashcardElement("li", "flashcard-framework__step");
    item.append(
      flashcardElement("span", "flashcard-framework__number", String(index + 1).padStart(2, "0")),
      flashcardElement("span", "flashcard-framework__step-label", ["Observe", "Explain", "Decide"][index] || "Apply"),
      flashcardElement("span", "flashcard-framework__text", step),
    );
    frameworkFlow.appendChild(item);
  });
  frameworkMap.append(frameworkCenter, frameworkFlow);
  framework.append(frameworkMap, flashcardElement("p", "flashcard-framework__takeaway", deck.takeaway));

  const conceptMap = flashcardElement("section", "flashcard-concept-map");
  if (articleSource.sections.length) {
    conceptMap.setAttribute("aria-labelledby", "flashcard-concept-map-title");
    const conceptHeader = flashcardElement("div", "flashcard-concept-map__header");
    conceptHeader.append(
      flashcardElement("p", "flashcard-concept-map__eyebrow", "Map the whole article"),
      flashcardElement("h3", "flashcard-concept-map__title", "Article concept map"),
      flashcardElement("p", "flashcard-concept-map__intro", `${articleSource.sections.length} major concepts, in reading order. Select any branch to open that section in the full article.`),
    );
    conceptHeader.querySelector("h3").id = "flashcard-concept-map-title";
    const conceptBody = flashcardElement("div", "flashcard-concept-map__body");
    const conceptRoot = flashcardElement("div", "flashcard-concept-map__root");
    conceptRoot.append(
      flashcardElement("span", "flashcard-concept-map__root-label", "Central question"),
      flashcardElement("strong", "", deck.title),
    );
    const conceptBranches = flashcardElement("ol", "flashcard-concept-map__branches");
    articleSource.sections.forEach((section, index) => {
      const item = flashcardElement("li", "flashcard-concept-map__branch");
      const button = flashcardElement("button", "flashcard-concept-map__node");
      button.type = "button";
      button.append(
        flashcardElement("span", "flashcard-concept-map__number", String(index + 1).padStart(2, "0")),
        flashcardElement("strong", "", section.title),
      );
      if (section.summary) button.appendChild(flashcardElement("span", "flashcard-concept-map__summary", flashcardSentenceSummary(section.summary, 135)));
      button.addEventListener("click", () => {
        setMode("article");
        document.getElementById(section.id)?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
      item.appendChild(button);
      conceptBranches.appendChild(item);
    });
    conceptBody.append(conceptRoot, conceptBranches);
    conceptMap.append(conceptHeader, conceptBody);
    if (articleSource.sections.length > 10) {
      conceptMap.classList.add("is-collapsed");
      const conceptToggle = flashcardElement("button", "flashcard-concept-map__toggle", `Show all ${articleSource.sections.length} concepts`);
      conceptToggle.type = "button";
      conceptToggle.setAttribute("aria-expanded", "false");
      conceptToggle.addEventListener("click", () => {
        const expanded = conceptMap.classList.toggle("is-expanded");
        conceptToggle.textContent = expanded ? "Show the compact map" : `Show all ${articleSource.sections.length} concepts`;
        conceptToggle.setAttribute("aria-expanded", String(expanded));
      });
      conceptMap.appendChild(conceptToggle);
    }
  }

  const results = flashcardElement("section", "flashcard-results");
  results.setAttribute("aria-labelledby", "flashcard-results-title");
  const resultsHeader = flashcardElement("div", "flashcard-results__header");
  resultsHeader.append(
    flashcardElement("p", "flashcard-results__eyebrow", "Keep these"),
    flashcardElement("h3", "flashcard-results__title", "Key takeaways & results"),
    flashcardElement("p", "flashcard-results__intro", "The equations, numerical rules, or invariants that carry most of the article."),
  );
  resultsHeader.querySelector("h3").id = "flashcard-results-title";
  const resultsGrid = flashcardElement("div", "flashcard-results__grid");
  (deck.results || []).forEach((result) => {
    const item = flashcardElement("article", "flashcard-result");
    item.append(
      flashcardElement("p", "flashcard-result__label", result[0]),
      flashcardElement("p", "flashcard-result__value", result[1]),
      flashcardElement("p", "flashcard-result__note", result[2]),
    );
    resultsGrid.appendChild(item);
  });
  results.append(resultsHeader, resultsGrid);

  const formulaGuide = flashcardElement("section", "flashcard-formula-guide");
  const formulaGroupDetails = [];
  if (articleSource.formulae.length) {
    formulaGuide.setAttribute("aria-labelledby", "flashcard-formula-guide-title");
    const formulaHeader = flashcardElement("div", "flashcard-formula-guide__header");
    const formulaHeaderCopy = flashcardElement("div", "flashcard-formula-guide__header-copy");
    const formulaGroups = new Map();
    articleSource.formulae.forEach((formula) => {
      if (!formulaGroups.has(formula.sectionId)) formulaGroups.set(formula.sectionId, { title: formula.sectionTitle, formulae: [] });
      formulaGroups.get(formula.sectionId).formulae.push(formula);
    });
    formulaHeaderCopy.append(
      flashcardElement("p", "flashcard-formula-guide__eyebrow", "Complete math reference"),
      flashcardElement("h3", "flashcard-formula-guide__title", "Formula guide"),
      flashcardElement("p", "flashcard-formula-guide__intro", `${articleSource.formulae.length} meaningful equations and numerical relationships, grouped across ${formulaGroups.size} article sections. Repeated single-symbol notation is intentionally omitted.`),
    );
    formulaHeaderCopy.querySelector("h3").id = "flashcard-formula-guide-title";
    const formulaeInitiallyOpen = articleSource.formulae.length <= 10;
    const formulaExpand = flashcardElement("button", "flashcard-formula-guide__expand", formulaeInitiallyOpen ? "Collapse every section" : "Expand every section");
    formulaExpand.type = "button";
    formulaExpand.setAttribute("aria-expanded", String(formulaeInitiallyOpen));
    formulaHeader.append(formulaHeaderCopy, formulaExpand);
    const formulaGroupList = flashcardElement("div", "flashcard-formula-guide__groups");
    [...formulaGroups.values()].forEach((group, groupIndex) => {
      const details = flashcardElement("details", "flashcard-formula-group");
      details.open = formulaeInitiallyOpen || groupIndex === 0;
      const summary = flashcardElement("summary", "flashcard-formula-group__summary");
      summary.append(
        flashcardElement("strong", "", group.title),
        flashcardElement("span", "", `${group.formulae.length} ${group.formulae.length === 1 ? "relationship" : "relationships"}`),
      );
      const list = flashcardElement("div", "flashcard-formula-group__list");
      group.formulae.forEach((formula, formulaIndex) => {
        const item = flashcardElement("article", "flashcard-formula");
        const formulaCell = flashcardElement("div", "flashcard-formula__cell");
        const value = flashcardElement("div", "flashcard-formula__value");
        appendFlashcardFormula(value, formula);
        formulaCell.append(
          flashcardElement("span", "flashcard-formula__cell-label", "Formula"),
          value,
        );
        const consequenceCell = flashcardElement("div", "flashcard-formula__cell flashcard-formula__consequence");
        consequenceCell.append(
          flashcardElement("span", "flashcard-formula__cell-label", "Consequence / sensitivity"),
          flashcardElement("p", "flashcard-formula__context", formula.context),
        );
        item.append(
          flashcardElement("span", "flashcard-formula__number", String(formulaIndex + 1).padStart(2, "0")),
          formulaCell,
          consequenceCell,
        );
        list.appendChild(item);
      });
      details.append(summary, list);
      formulaGroupList.appendChild(details);
      formulaGroupDetails.push(details);
    });
    formulaExpand.addEventListener("click", () => {
      const shouldOpen = formulaGroupDetails.some((details) => !details.open);
      formulaGroupDetails.forEach((details) => { details.open = shouldOpen; });
      formulaExpand.textContent = shouldOpen ? "Collapse every section" : "Expand every section";
      formulaExpand.setAttribute("aria-expanded", String(shouldOpen));
    });
    formulaGuide.append(formulaHeader, formulaGroupList);
  }

  const summaryTable = flashcardElement("section", "flashcard-summary-table");
  if (deck.table) {
    summaryTable.setAttribute("aria-labelledby", "flashcard-summary-table-title");
    const tableHeader = flashcardElement("div", "flashcard-summary-table__header");
    tableHeader.append(
      flashcardElement("p", "flashcard-summary-table__eyebrow", "At a glance"),
      flashcardElement("h3", "flashcard-summary-table__title", deck.table.title),
      flashcardElement("p", "flashcard-summary-table__intro", deck.table.intro),
    );
    tableHeader.querySelector("h3").id = "flashcard-summary-table-title";
    const tableScroll = flashcardElement("div", "flashcard-summary-table__scroll");
    const table = document.createElement("table");
    const tableHead = document.createElement("thead");
    const headingRow = document.createElement("tr");
    deck.table.columns.forEach((column) => {
      const heading = flashcardElement("th", "", column);
      heading.scope = "col";
      headingRow.appendChild(heading);
    });
    tableHead.appendChild(headingRow);
    const tableBody = document.createElement("tbody");
    deck.table.rows.forEach((row) => {
      const tableRow = document.createElement("tr");
      row.forEach((cell, cellIndex) => {
        const element = flashcardElement(cellIndex === 0 ? "th" : "td", "", cell);
        if (cellIndex === 0) element.scope = "row";
        element.dataset.label = deck.table.columns[cellIndex];
        tableRow.appendChild(element);
      });
      tableBody.appendChild(tableRow);
    });
    table.append(tableHead, tableBody);
    tableScroll.appendChild(table);
    summaryTable.append(tableHeader, tableScroll);
  }

  const retentionTable = flashcardElement("section", "flashcard-summary-table flashcard-retention-table");
  retentionTable.setAttribute("aria-labelledby", "flashcard-retention-table-title");
  const retentionHeader = flashcardElement("div", "flashcard-summary-table__header");
  retentionHeader.append(
    flashcardElement("p", "flashcard-summary-table__eyebrow", "Complete takeaway checklist"),
    flashcardElement("h3", "flashcard-summary-table__title", `${deckCards.length} things to retain`),
    flashcardElement("p", "flashcard-summary-table__intro", "A one-line checkpoint for every core, deep-dive, and section-level question covered by this article."),
  );
  retentionHeader.querySelector("h3").id = "flashcard-retention-table-title";
  const retentionScroll = flashcardElement("div", "flashcard-summary-table__scroll");
  const retentionGrid = document.createElement("table");
  const retentionHead = document.createElement("thead");
  const retentionHeadingRow = document.createElement("tr");
  ["Question", "What to remember"].forEach((column) => {
    const heading = flashcardElement("th", "", column);
    heading.scope = "col";
    retentionHeadingRow.appendChild(heading);
  });
  retentionHead.appendChild(retentionHeadingRow);
  const retentionBody = document.createElement("tbody");
  deckCards.forEach((card) => {
    const row = document.createElement("tr");
    const question = flashcardElement("th", "", card[0]);
    question.scope = "row";
    question.dataset.label = "Question";
    const takeaway = flashcardElement("td", "", flashcardTakeaway(card[1]));
    takeaway.dataset.label = "What to remember";
    row.append(question, takeaway);
    retentionBody.appendChild(row);
  });
  retentionGrid.append(retentionHead, retentionBody);
  retentionScroll.appendChild(retentionGrid);
  retentionTable.append(retentionHeader, retentionScroll);
  if (deckCards.length > 10) {
    retentionTable.classList.add("is-collapsed");
    const retentionToggle = flashcardElement("button", "flashcard-retention-table__toggle", `Show all ${deckCards.length} takeaways`);
    retentionToggle.type = "button";
    retentionToggle.setAttribute("aria-expanded", "false");
    retentionToggle.addEventListener("click", () => {
      const expanded = retentionTable.classList.toggle("is-expanded");
      retentionToggle.textContent = expanded ? "Show the compact checklist" : `Show all ${deckCards.length} takeaways`;
      retentionToggle.setAttribute("aria-expanded", String(expanded));
    });
    retentionTable.appendChild(retentionToggle);
  }

  const deckTools = flashcardElement("div", "flashcard-deck__tools");
  deckTools.appendChild(flashcardElement("p", "flashcard-deck__hint", "Try answering before you reveal each card."));
  const expandButton = flashcardElement("button", "flashcard-deck__expand", "Reveal all answers");
  expandButton.type = "button";
  deckTools.appendChild(expandButton);

  const cardList = flashcardElement("ol", "flashcard-list");
  const cardDetails = deckCards.map((card, index) => {
    if (index === 0) cardList.appendChild(flashcardElement("li", "flashcard-list__divider", "Core mental model"));
    if (deepDiveCards.length && index === deck.cards.length) cardList.appendChild(flashcardElement("li", "flashcard-list__divider", "Deeper questions"));
    if (sectionReviewCards.length && index === curatedCards.length) cardList.appendChild(flashcardElement("li", "flashcard-list__divider", "Section-by-section review"));
    const item = flashcardElement("li", "flashcard-list__item");
    const details = flashcardElement("details", "flashcard");
    const linkedResults = (deck.results || []).filter((_result, resultIndex) => deck.resultLinks?.[resultIndex] === index);
    const matchedSection = card.sectionId
      ? articleSource.sections.find((section) => section.id === card.sectionId)
      : matchFlashcardCardToSection(card, articleSource.sections);
    const linkedFormulae = matchedSection
      ? articleSource.formulae.filter((formula) => formula.sectionId === matchedSection.id).slice(0, card.sectionId ? 3 : 2)
      : [];
    const question = flashcardElement("summary", "flashcard__question");
    question.append(
      flashcardElement("span", "flashcard__number", String(index + 1).padStart(2, "0")),
      flashcardElement("span", "flashcard__prompt", card[0]),
      flashcardElement("span", linkedResults.length || linkedFormulae.length ? "flashcard__reveal flashcard__reveal--visual" : "flashcard__reveal", "Reveal"),
    );
    const answer = flashcardElement("div", "flashcard__answer");
    answer.appendChild(flashcardElement("p", "", card[1]));
    if (card[2]) answer.appendChild(flashcardElement("p", "flashcard__lens", card[2]));
    linkedResults.forEach((result) => {
      const diagram = flashcardElement("figure", "flashcard-answer-diagram");
      diagram.setAttribute("aria-label", `Explanation diagram for ${result[0]}`);
      diagram.appendChild(flashcardElement("figcaption", "flashcard-answer-diagram__title", "See the relationship"));
      const flow = flashcardElement("div", "flashcard-answer-diagram__flow");
      const premise = flashcardElement("div", "flashcard-answer-diagram__node");
      premise.append(
        flashcardElement("span", "flashcard-answer-diagram__label", "Start with"),
        flashcardElement("strong", "", result[0]),
      );
      const relation = flashcardElement("div", "flashcard-answer-diagram__node flashcard-answer-diagram__node--result");
      relation.append(
        flashcardElement("span", "flashcard-answer-diagram__label", "Relationship"),
        flashcardElement("strong", "flashcard-answer-diagram__math", result[1]),
      );
      const meaning = flashcardElement("div", "flashcard-answer-diagram__node");
      meaning.append(
        flashcardElement("span", "flashcard-answer-diagram__label", "Therefore"),
        flashcardElement("strong", "", result[2]),
      );
      flow.append(premise, relation, meaning);
      diagram.appendChild(flow);
      answer.appendChild(diagram);
    });
    if (linkedFormulae.length) {
      const formulaFigure = flashcardElement("figure", "flashcard-answer-formulae");
      formulaFigure.appendChild(flashcardElement("figcaption", "flashcard-answer-formulae__title", "Math used in this section"));
      linkedFormulae.forEach((formula) => {
        const formulaItem = flashcardElement("div", "flashcard-answer-formulae__item");
        const value = flashcardElement("div", "flashcard-answer-formulae__value");
        appendFlashcardFormula(value, formula);
        formulaItem.append(value, flashcardElement("p", "", formula.context));
        formulaFigure.appendChild(formulaItem);
      });
      answer.appendChild(formulaFigure);
    }
    details.append(question, answer);
    item.appendChild(details);
    cardList.appendChild(item);
    return details;
  });

  const finish = flashcardElement("div", "flashcard-deck__finish");
  finish.appendChild(flashcardElement("p", "", "Ready for the derivations, evidence, and edge cases?"));
  const fullArticleButton = flashcardElement("button", "flashcard-deck__read-full", "Read the full article");
  fullArticleButton.type = "button";
  finish.appendChild(fullArticleButton);

  panel.append(hero, framework);
  if (articleSource.sections.length) panel.appendChild(conceptMap);
  if (deck.results?.length) panel.appendChild(results);
  if (deck.table) panel.appendChild(summaryTable);
  panel.appendChild(retentionTable);
  if (articleSource.formulae.length) panel.appendChild(formulaGuide);
  panel.append(deckTools, cardList, finish);
  article.parentNode.insertBefore(switcher, article);
  article.parentNode.insertBefore(panel, article);
  renderBlogMath(panel);

  function setMode(mode, updateUrl = true) {
    const flashcards = mode === "flashcards";
    document.documentElement.dataset.readingMode = flashcards ? "flashcards" : "article";
    panel.hidden = !flashcards;
    article.hidden = flashcards;
    if (flashcards && !preview.hasAttribute("src")) preview.src = preview.dataset.src;
    articleButton.classList.toggle("is-active", !flashcards);
    cardsButton.classList.toggle("is-active", flashcards);
    articleButton.setAttribute("aria-pressed", String(!flashcards));
    cardsButton.setAttribute("aria-pressed", String(flashcards));
    if (updateUrl) {
      const url = new URL(location.href);
      if (flashcards) url.searchParams.set("view", "flashcards");
      else url.searchParams.delete("view");
      history.replaceState({}, "", url);
    }
    window.dispatchEvent(new Event("resize"));
  }

  articleButton.addEventListener("click", () => setMode("article"));
  cardsButton.addEventListener("click", () => setMode("flashcards"));
  fullArticleButton.addEventListener("click", () => {
    setMode("article");
    article.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  expandButton.addEventListener("click", () => {
    const shouldOpen = cardDetails.some((details) => !details.open);
    cardDetails.forEach((details) => { details.open = shouldOpen; });
    expandButton.textContent = shouldOpen ? "Hide all answers" : "Reveal all answers";
    const url = new URL(location.href);
    if (shouldOpen) url.searchParams.set("answers", "all");
    else url.searchParams.delete("answers");
    history.replaceState({}, "", url);
  });
  cardDetails.forEach((details) => details.addEventListener("toggle", () => {
    const allOpen = cardDetails.every((card) => card.open);
    const allClosed = cardDetails.every((card) => !card.open);
    if (allOpen) expandButton.textContent = "Hide all answers";
    else if (allClosed) expandButton.textContent = "Reveal all answers";
    else expandButton.textContent = "Reveal all answers";
  }));

  const initialMode = new URL(location.href).searchParams.get("view") === "flashcards" ? "flashcards" : "article";
  setMode(initialMode, false);
  if (new URL(location.href).searchParams.get("answers") === "all") {
    cardDetails.forEach((details) => { details.open = true; });
    expandButton.textContent = "Hide all answers";
  }
}

async function renderBlogMath(container) {
  if (!container || !/(\$\$|\\\(|\\\[)/.test(container.textContent || "")) return;

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
    window.renderMathInElement(container, {
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

async function initializeBlogMath() {
  if (!document.body.classList.contains("blog-article")) return;
  const article = document.querySelector("main.article-content, main.article-wrap, main");
  await renderBlogMath(article);
}

initializeBlogFlashcards();
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
