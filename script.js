(function () {
  "use strict";

  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("[data-nav-links]");
  const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));

  // Navbar scroll shadow.
  function setNavState() {
    if (!nav) {
      return;
    }
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  setNavState();
  window.addEventListener("scroll", setNavState, { passive: true });

  // Mobile hamburger menu toggle.
  if (navToggle && navLinks) {
    const closeMobileMenu = () => {
      document.body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("menu-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navAnchors.forEach((anchor) => {
      anchor.addEventListener("click", () => {
        closeMobileMenu();
      });
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });
  }

  function initHeroParticles() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas || window.innerWidth < 768 || !window.THREE) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.BufferGeometry();
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const gold = new THREE.Color("#c9a84c");
    const green = new THREE.Color("#52b788");

    for (let i = 0; i < particleCount; i += 1) {
      const index = i * 3;
      positions[index] = Math.random() * 20 - 10;
      positions[index + 1] = Math.random() * 20 - 10;
      positions[index + 2] = Math.random() * 20 - 10;

      const mixed = gold.clone().lerp(green, Math.random() > 0.72 ? 0.65 : 0.08);
      colors[index] = mixed.r;
      colors[index + 1] = mixed.g;
      colors[index + 2] = mixed.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.94
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    let frameId = 0;

    window.addEventListener("mousemove", (event) => {
      mouseX = (event.clientX - window.innerWidth / 2) / 200;
      mouseY = (event.clientY - window.innerHeight / 2) / 200;
    }, { passive: true });

    function resizeRenderer() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", resizeRenderer);

    function animate() {
      frameId = window.requestAnimationFrame(animate);
      particles.rotation.y += 0.0005;
      particles.rotation.x += 0.0002;
      camera.position.x += (mouseX - camera.position.x) * 0.035;
      camera.position.y += (-mouseY - camera.position.y) * 0.035;
      camera.position.z = 5;
      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("beforeunload", () => {
      window.cancelAnimationFrame(frameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    });
  }

  try {
    initHeroParticles();
  } catch (error) {
    console.warn("Three.js particles initialization failed:", error);
  }

  const tiltCards = document.querySelectorAll("[data-tilt]");

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      if (window.matchMedia("(pointer: coarse)").matches) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);

      card.style.transition = "transform 80ms ease, box-shadow 160ms ease";
      card.style.transform = `perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transition = "transform 450ms ease, box-shadow 220ms ease";
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
  });

  const revealItems = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.02,
      rootMargin: "0px 0px -70px 0px"
    });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Professional Experience scroll animation. Cards remain visible if JavaScript support is limited.
  const experienceSection = document.querySelector(".experience-section");
  const experienceItems = document.querySelectorAll("[data-experience-reveal]");

  if (experienceSection && experienceItems.length && "IntersectionObserver" in window) {
    experienceSection.classList.add("has-scroll-animation");

    const experienceObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          experienceObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.02,
      rootMargin: "0px 0px -80px 0px"
    });

    experienceItems.forEach((item) => experienceObserver.observe(item));
  }

  // Official Visits tabs and lightbox gallery.
  const visitsSection = document.querySelector(".visits-section");

  if (visitsSection) {
    const visitsTabs = Array.from(visitsSection.querySelectorAll("[data-visits-tab]"));
    const visitsPanels = Array.from(visitsSection.querySelectorAll("[data-visits-panel]"));
    const lightbox = document.querySelector("[data-visits-lightbox]");
    const lightboxImage = document.querySelector("[data-visits-lightbox-image]");
    const lightboxCaption = document.querySelector("[data-visits-lightbox-caption]");
    const closeLightboxButton = document.querySelector("[data-visits-close]");
    const previousButton = document.querySelector("[data-visits-prev]");
    const nextButton = document.querySelector("[data-visits-next]");
    let activeVisitImages = [];
    let activeVisitIndex = 0;
    let lastFocusedElement = null;

    function activateVisitsTab(category) {
      console.log("Visits tab toggled to:", category);
      visitsTabs.forEach((tab) => {
        const isActive = tab.dataset.visitsTab === category;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });

      visitsPanels.forEach((panel) => {
        const isActive = panel.dataset.visitsPanel === category;
        panel.classList.remove("is-active");
        panel.hidden = !isActive;
        panel.classList.toggle("is-hidden", !isActive);

        if (isActive) {
          requestAnimationFrame(() => panel.classList.add("is-active"));
        }
      });
    }

    function getVisitItems(panel) {
      if (!panel) return [];
      return Array.from(panel.querySelectorAll(".visit-card:not([hidden]) [data-visit-image]")).map((button) => {
        const image = button.querySelector("img");
        const card = button.closest(".visit-card");
        const caption = card ? card.querySelector(".visit-caption") : null;

        return {
          alt: image ? image.alt : "",
          caption: caption ? caption.textContent.replace(/\s+/g, " ").trim() : "",
          src: image ? (image.currentSrc || image.src) : ""
        };
      });
    }

    function renderLightboxImage() {
      const item = activeVisitImages[activeVisitIndex];

      if (!item || !lightboxImage || !lightboxCaption) {
        return;
      }

      lightboxImage.src = item.src;
      lightboxImage.alt = item.alt;
      lightboxCaption.textContent = item.caption;
    }

    function openLightbox(button) {
      console.log("Image click registered. Opening lightbox...");
      if (!lightbox) {
        console.warn("Lightbox element not found!");
        return;
      }

      const activePanel = button.closest("[data-visits-panel]");
      if (!activePanel) {
        return;
      }
      const galleryButtons = Array.from(activePanel.querySelectorAll(".visit-card:not([hidden]) [data-visit-image]"));
      activeVisitImages = getVisitItems(activePanel);
      activeVisitIndex = galleryButtons.indexOf(button);
      lastFocusedElement = document.activeElement;

      renderLightboxImage();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeLightboxButton?.focus();
    }

    function closeLightbox() {
      if (!lightbox) {
        return;
      }

      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      lightboxImage?.removeAttribute("src");

      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }

    function showAdjacentVisit(direction) {
      if (!activeVisitImages.length) {
        return;
      }

      activeVisitIndex = (activeVisitIndex + direction + activeVisitImages.length) % activeVisitImages.length;
      renderLightboxImage();
    }

    visitsTabs.forEach((tab) => {
      tab.addEventListener("click", () => activateVisitsTab(tab.dataset.visitsTab));
    });

    visitsSection.querySelectorAll("[data-visit-image]").forEach((button) => {
      button.addEventListener("click", () => openLightbox(button));
    });

    closeLightboxButton?.addEventListener("click", closeLightbox);
    previousButton?.addEventListener("click", () => showAdjacentVisit(-1));
    nextButton?.addEventListener("click", () => showAdjacentVisit(1));

    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (!lightbox?.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showAdjacentVisit(-1);
      } else if (event.key === "ArrowRight") {
        showAdjacentVisit(1);
      }
    });

    // Hide a visit card only if its final image is genuinely unavailable.
    const visitImages = visitsSection.querySelectorAll(".visit-image-button img");

    visitImages.forEach((img) => {
      if (img.complete && img.naturalWidth) {
        img.classList.add("is-loaded");
      } else {
        img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
      }

      img.addEventListener("error", () => {
        const card = img.closest(".visit-card");
        if (card) {
          card.hidden = true;
        }
      }, { once: true });
    });
  }

  const counterGroup = document.querySelector("[data-counter-group]");

  function animateCounter(counter) {
    const target = Number(counter.dataset.target || "0");
    const suffix = counter.dataset.suffix || "";
    const duration = 2000;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      counter.textContent = `${value}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(update);
      }
    }

    window.requestAnimationFrame(update);
  }

  if (counterGroup) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll("[data-target]").forEach(animateCounter);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 });

    counterObserver.observe(counterGroup);
  }

  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navAnchors.forEach((anchor) => {
        anchor.classList.toggle("is-active", anchor.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, {
    threshold: 0.32,
    rootMargin: "-35% 0px -45% 0px"
  });

  sections.forEach((section) => sectionObserver.observe(section));

  const contactForm = document.querySelector("[data-contact-form]");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const message = String(formData.get("message") || "").trim();
      const whatsappText = [
        "Assalam-o-Alaikum,",
        `My name is ${name}.`,
        `Email: ${email}`,
        "",
        message
      ].join("\n");

      window.open(`https://wa.me/923317311110?text=${encodeURIComponent(whatsappText)}`, "_blank", "noopener");
      contactForm.reset();
    });
  }

  // Trigger a subtle fade-in for hero and about images/layout on initial page load
  function triggerPageLoadReveal() {
    if (document.readyState === "complete") {
      requestAnimationFrame(() => document.body.classList.add("page-loaded"));
    } else {
      window.addEventListener("load", () => requestAnimationFrame(() => document.body.classList.add("page-loaded")));
    }
  }

  triggerPageLoadReveal();
}());
