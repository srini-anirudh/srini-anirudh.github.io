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
