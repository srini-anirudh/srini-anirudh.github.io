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
