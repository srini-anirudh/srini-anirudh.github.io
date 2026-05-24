/**
 * particles-js config
 */

const particlesConfig = {
  particles: {
    number: {
      value: 45,
      density: {
        enable: true,
        value_area: 800,
      },
    },
    color: {
      value: "#bebebe",
    },
    shape: {
      type: "circle",
      stroke: {
        width: 2,
        color: "#bebebe",
      },
      polygon: {
        nb_sides: 7,
      },
      image: {
        src: "img/github.svg",
        width: 100,
        height: 100,
      },
    },
    opacity: {
      value: 1,
      random: false,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false,
      },
    },
    size: {
      value: 3,
      random: true,
      anim: {
        enable: false,
        speed: 10,
        size_min: 0.1,
        sync: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 250,
      color: "#d4d4d4",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1.5,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  interactivity: {
    detect_on: "window",
    events: {
      onhover: {
        enable: true,
        mode: "grab",
      },
      onclick: {
        enable: true,
        mode: "push",
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 140,
        line_linked: {
          opacity: 1,
        },
      },
      bubble: {
        distance: 300,
        size: 70,
        duration: 2,
        opacity: 8,
        speed: 3,
      },
      repulse: {
        distance: 500,
        duration: 0.4,
      },
      push: {
        particles_nb: 2,
      },
      remove: {
        particles_nb: 2,
      },
    },
  },
  retina_detect: true,
};

// Track if particles have been initialized
let particlesInitialized = false;

function initParticles() {
  if (!particlesInitialized) {
    particlesJS("particles-js", particlesConfig);
    particlesInitialized = true;
  }
}

function destroyParticles() {
  if (particlesInitialized && window.pJSDom && window.pJSDom.length > 0) {
    window.pJSDom[0].pJS.fn.vendors.destroypJS();
    window.pJSDom = [];
    particlesInitialized = false;
  }
}

// Initialize particles if dark mode is already active
if (
  document.documentElement.classList.contains("dark-mode") ||
  document.body.classList.contains("dark-mode")
) {
  initParticles();
}

// Listen for dark mode toggle
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      const isDarkMode =
        document.body.classList.contains("dark-mode") ||
        document.documentElement.classList.contains("dark-mode");
      if (isDarkMode) {
        initParticles();
      } else {
        destroyParticles();
      }
    }
  });
});

observer.observe(document.body, { attributes: true });

window.addEventListener(
  "click",
  (e) => {
    // If there's any selected text, cancel the event.
    if (window.getSelection().toString().length > 0) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  },
  true, // 'true' makes this a capturing listener
);
