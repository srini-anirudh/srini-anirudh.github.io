/**
 * Light and Dark Mode
 */
// Select the dark/light mode button and its inner elements.
const colorModeToggle = document.querySelector(".color-mode-toggle");
const sun = colorModeToggle ? colorModeToggle.querySelector(".sun") : null;
const moon = colorModeToggle ? colorModeToggle.querySelector(".moon") : null;
const body = document.body;
const html = document.documentElement;

// Set initial state based on localStorage (also sync html class set in head).
if (localStorage.getItem("darkMode") === "enabled") {
  body.classList.add("dark-mode");
  html.classList.add("dark-mode");
  if (sun && moon) {
    sun.classList.remove("visible");
    moon.classList.add("visible");
  }
} else {
  body.classList.remove("dark-mode");
  html.classList.remove("dark-mode");
  if (sun && moon) {
    sun.classList.add("visible");
    moon.classList.remove("visible");
  }
}

// Toggle dark/light mode when the button is clicked.
if (colorModeToggle && sun && moon) {
  colorModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    html.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("darkMode", "enabled");
      sun.classList.remove("visible");
      moon.classList.add("visible");
    } else {
      localStorage.setItem("darkMode", "disabled");
      sun.classList.add("visible");
      moon.classList.remove("visible");
    }
  });
}

/**
 * Name and pronunciation
 */
const nameParts = document.querySelectorAll(".name-part");

const audioFiles = {
  "first-name": new Audio("assets/data/first-name.mp3"),
  "last-name": new Audio("assets/data/last-name.mp3"),
};

nameParts.forEach((part) => {
  part.addEventListener("click", () => {
    const audio = audioFiles[part.id];
    audio.currentTime = 0;
    audio.play();
  });
});

/**
 * Burger
 */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    navLinks.classList.toggle("show"); // for showing/hiding the menu
  });
}

/**
 * Email Obfuscation (hopefully)
 */
function sendEmail() {
  // Obfuscated email parts
  const user = "anirudh.srinivasan";
  const domain = "tihiitb";
  const tld = "org";

  // Construct and open mailto link
  const email = user + "@" + domain + "." + tld;
  window.location.href = "mailto:" + email;
}

/**
 * Section toast
 */

// Function to copy section link to clipboard
function copyLink(event, sectionId) {
  event.preventDefault();

  // Create the full URL with anchor
  const url =
    window.location.origin + window.location.pathname + "#" + sectionId;

  // Copy to clipboard
  navigator.clipboard
    .writeText(url)
    .then(function () {
      // Show success toast
      showToast("Link copied to clipboard!");
    })
    .catch(function () {
      // Fallback for older browsers
      const tempInput = document.createElement("input");
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      showToast("Link copied to clipboard!");
    });
}

// Function to show toast notification
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector(".copy-toast");
  if (existingToast) {
    existingToast.remove();
  }

  // Create new toast
  const toast = document.createElement("div");
  toast.className = "copy-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // Hide toast after 2 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2000);
}

/**
 * Research BibTeX copy
 */
const bibtexEntries = {
  m3grounder: `@InProceedings{Venna_2026_CVPR,
    author    = {Venna, Venkata Kesav and Gunda, Sai Madhusudan and Jinka, Jyothi Swaroopa and Rachakonda, Hrithik Sagar and Srinivasan, Anirudh and Sarvadevabhatla, Ravi Kiran},
    title     = {M3Grounder: Mask-Based Multi-Span and Multi-Granular Grounding for Document QA},
    booktitle = {Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)},
    month     = {June},
    year      = {2026},
    pages     = {23685-23695}
}`,
};

function copyBibtex(entryKey) {
  const entry = bibtexEntries[entryKey];

  if (!entry) {
    showToast("BibTeX entry not found.");
    return;
  }

  navigator.clipboard
    .writeText(entry)
    .then(function () {
      showToast("BibTeX copied to clipboard!");
    })
    .catch(function () {
      const tempInput = document.createElement("textarea");
      tempInput.value = entry;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      showToast("BibTeX copied to clipboard!");
    });
}

// Make entire heading clickable
document.addEventListener("DOMContentLoaded", function () {
  const headings = document.querySelectorAll(".section-heading h2");
  headings.forEach((heading) => {
    heading.addEventListener("click", function (event) {
      const sectionId = this.parentElement.id;
      copyLink(event, sectionId);
    });
  });
});

function initializeResearchDetails() {
  document.querySelectorAll(".research-details").forEach((details) => {
    const content = details.querySelector(".research-abstract");

    if (!content) {
      return;
    }

    details.addEventListener("click", (event) => {
      event.preventDefault();

      if (details.open) {
        content.style.maxHeight = content.scrollHeight + "px";
        requestAnimationFrame(() => {
          content.style.maxHeight = "0";
          content.style.opacity = "0";
          content.style.marginTop = "0";
        });
        setTimeout(() => {
          details.open = false;
        }, 400);
      } else {
        details.open = true;
        content.style.maxHeight = "0";
        content.style.opacity = "0";
        content.style.marginTop = "0";
        requestAnimationFrame(() => {
          content.style.maxHeight = content.scrollHeight + "px";
          content.style.opacity = "1";
          content.style.marginTop = "12px";
        });
      }
    });
  });
}

/**
 * Hovering for image -> video
 */
function initializeMediaHover() {
  // Select all images that should turn into videos on hover
  const mediaImages = document.querySelectorAll(".research-media[data-video]");

  mediaImages.forEach((img) => {
    const videoSrc = img.dataset.video;
    const container = img.parentElement;

    // 'unchecked': The initial state.
    // 'exists': The video was found.
    // 'missing': The video returned an error (e.g., 404).
    let videoStatus = "unchecked";
    let videoElement = null;

    // This function creates and plays the video once it's confirmed to exist.
    const playVideo = () => {
      // Create the video element only on the first successful hover
      if (!videoElement) {
        videoElement = document.createElement("video");
        videoElement.src = videoSrc;
        videoElement.className = img.className;
        videoElement.alt = img.alt;
        videoElement.muted = true;
        videoElement.loop = true;
        videoElement.playsInline = true;
        videoElement.style.display = "none";
        container.appendChild(videoElement);
      }

      // Swap visibility and play
      img.style.display = "none";
      videoElement.style.display = "block";
      videoElement.play().catch(() => {});
    };

    // When the mouse enters the container
    container.addEventListener("mouseenter", async () => {
      // If we already confirmed the video exists, just play it.
      if (videoStatus === "exists") {
        playVideo();
        return;
      }

      // If we already know the video is missing, do nothing.
      if (videoStatus === "missing") {
        return;
      }

      // First hover: Check if the video file is accessible.
      try {
        // We use a 'HEAD' request because we only need the status,
        // not the whole video file. This is much faster.
        const response = await fetch(videoSrc, { method: "HEAD" });

        if (response.ok) {
          // The video exists.
          videoStatus = "exists";
          playVideo();
        } else {
          // The video returned an error (e.g., 404 Not Found).
          videoStatus = "missing";
          console.warn(
            `Video not found: ${videoSrc}. Status: ${response.status}. Keeping the image.`,
          );
        }
      } catch (error) {
        // A network error occurred.
        videoStatus = "missing";
        console.error(
          `Network error while checking for video: ${videoSrc}`,
          error,
        );
      }
    });

    // When the mouse leaves the container
    container.addEventListener("mouseleave", () => {
      // If the video element has been created, pause and hide it.
      if (videoElement) {
        videoElement.pause();
        videoElement.style.display = "none";
        img.style.display = "block";
      }
    });
  });
}

// Run the script once the page has loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeMediaHover();
  initializeResearchDetails();
});
