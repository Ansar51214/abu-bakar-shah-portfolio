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
    const visitsTabs = Array.from(visitsSection.querySelectorAll(".tab-btn"));
    const visitsPanels = Array.from(visitsSection.querySelectorAll(".tab-content"));
    const lightbox = document.querySelector("[data-visits-lightbox]");
    const lightboxImage = document.querySelector("[data-visits-lightbox-image]");
    const lightboxCaption = document.querySelector("[data-visits-lightbox-caption]");
    const closeLightboxButton = document.querySelector("[data-visits-close]");
    const previousButton = document.querySelector("[data-visits-prev]");
    const nextButton = document.querySelector("[data-visits-next]");
    let activeVisitImages = [];
    let activeVisitIndex = 0;
    let lastFocusedElement = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStarted = false;

    function activateVisitsTab(category) {
      const activeContent = document.getElementById(category);

      if (!activeContent) {
        return;
      }

      visitsTabs.forEach((tab) => {
        const isActive = tab.dataset.tab === category;
        tab.classList.toggle("active", isActive);
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });

      visitsPanels.forEach((panel) => {
        panel.style.display = "none";
        panel.style.opacity = "0";
        panel.classList.remove("is-active");
        panel.classList.add("is-hidden");
        panel.hidden = true;
      });

      activeContent.hidden = false;
      activeContent.classList.remove("is-hidden");
      activeContent.style.display = "grid";

      setTimeout(() => {
        activeContent.style.transition = "opacity 0.3s ease";
        activeContent.style.opacity = "1";
        activeContent.classList.add("is-active");
      }, 10);
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
      tab.addEventListener("click", () => activateVisitsTab(tab.dataset.tab));
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

    lightbox?.addEventListener("touchstart", (event) => {
      if (!lightbox.classList.contains("is-open") || !event.changedTouches.length) {
        return;
      }

      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStarted = true;
    }, { passive: true });

    lightbox?.addEventListener("touchend", (event) => {
      if (!touchStarted || !event.changedTouches.length) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const isHorizontalSwipe = Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

      touchStarted = false;

      if (isHorizontalSwipe) {
        showAdjacentVisit(deltaX < 0 ? 1 : -1);
      }
    }, { passive: true });

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

  const counterGroups = document.querySelectorAll("[data-counter-group]");
  const counterFormatter = new Intl.NumberFormat("en");

  function animateCounter(counter) {
    const target = Number(counter.dataset.target || "0");
    const suffix = counter.dataset.suffix || "";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = 2000;
    const startTime = performance.now();

    if (reducedMotion) {
      counter.textContent = `${counterFormatter.format(target)}${suffix}`;
      return;
    }

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      counter.textContent = `${counterFormatter.format(value)}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(update);
      }
    }

    window.requestAnimationFrame(update);
  }

  if (counterGroups.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll("[data-target]").forEach(animateCounter);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 });

    counterGroups.forEach((group) => counterObserver.observe(group));
  } else {
    counterGroups.forEach((group) => group.querySelectorAll("[data-target]").forEach(animateCounter));
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
    function onPageLoad() {
      document.body.classList.add("page-loaded");
    }

    if (document.readyState === "complete") {
      requestAnimationFrame(onPageLoad);
    } else {
      window.addEventListener("load", () => requestAnimationFrame(onPageLoad));
    }
  }

  triggerPageLoadReveal();
}());
