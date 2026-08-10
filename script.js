(function () {
  "use strict";

/* =========================================
Project Data Source
Single source of truth: data/projects.json
========================================= */

window.ManaOSPortfolioProjects = {};

fetch("./data/projects.json", { cache: "no-store" })
  .then(function (response) {
    if (!response.ok) {
      throw new Error(
        "Unable to load data/projects.json: HTTP " + response.status
      );
    }

    return response.json();
  })
  .then(function (data) {
    var projects = {};

    if (data && data.flagship) {
      projects[data.flagship.id] = {
        id: data.flagship.id,
        title: data.flagship.name,
        status: data.flagship.status,
        category: data.flagship.type,
        description: data.flagship.description,
        architecture: Array.isArray(data.flagship.publicArchitecture)
          ? data.flagship.publicArchitecture.join(" → ")
          : "",
        technologies: []
      };
    }

    if (data && Array.isArray(data.ecosystem)) {
      data.ecosystem.forEach(function (project) {
        projects[project.id] = {
          id: project.id,
          title: project.name,
          status: project.status,
          category: project.category,
          description: project.description || "",
          architecture: project.architecture || "",
          technologies: Array.isArray(project.technologies)
            ? project.technologies
            : []
        };
      });
    }

    if (data && Array.isArray(data.independentProjects)) {
      data.independentProjects.forEach(function (project) {
        projects[project.id] = {
          id: project.id,
          title: project.name,
          status: project.status,
          category: project.category,
          description: project.description || "",
          architecture: project.architecture || "",
          technologies: Array.isArray(project.technologies)
            ? project.technologies
            : []
        };
      });
    }

    window.ManaOSPortfolioProjects = projects;

    console.log(
      "ManaOS portfolio project data loaded:",
      Object.keys(projects)
    );
  })
  .catch(function (error) {
    console.error("ManaOS portfolio project data failed to load:", error);
  });

  /* =========================================
     Global helpers
     ========================================= */

  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.from((parent || document).querySelectorAll(selector));
  }

  function show(element) {
    if (element) {
      element.style.display = "";
    }
  }

  function hide(element) {
    if (element) {
      element.style.display = "none";
    }
  }

  /* =========================================
     Footer year
     ========================================= */

  const year = qs("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* =========================================
     Mobile navigation
     ========================================= */

  const navToggle = qs(".nav-toggle");
  const navLinksContainer = qs(".nav-links");

  if (navToggle && navLinksContainer) {
    navToggle.addEventListener("click", function () {
      const isOpen = navLinksContainer.classList.toggle("open");

      navToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });

    qsa(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinksContainer.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* =========================================
     Sticky header
     ========================================= */

  const header = qs(".site-header");

  if (header) {
    window.addEventListener(
      "scroll",
      function () {
        const scrollY = window.scrollY || window.pageYOffset || 0;

        header.classList.toggle("scrolled", scrollY > 10);
      },
      { passive: true }
    );
  }

  /* =========================================
     Theme button
     Currently disabled intentionally.
     ========================================= */

  const themeButton = qs("#theme-toggle");

  if (themeButton) {
    themeButton.style.display = "none";
  }

  /* =========================================
     Section reveal animation
     ========================================= */

  const revealSections = qsa(".section-fade");

  if (
    revealSections.length &&
    "IntersectionObserver" in window
  ) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    revealSections.forEach(function (section) {
      revealObserver.observe(section);
    });
  } else {
    revealSections.forEach(function (section) {
      section.classList.add("visible");
    });
  }

  /* =========================================
     Hero typewriter
     ========================================= */

  const typewriter = qs("[data-typewriter]");

  if (typewriter) {
    const originalText =
      typewriter.getAttribute("data-typewriter") ||
      typewriter.textContent.trim();

    typewriter.textContent = "";

    const caret = document.createElement("span");
    caret.className = "typed-caret";

    typewriter.appendChild(caret);

    let index = 0;

    function typeCharacter() {
      if (index >= originalText.length) {
        return;
      }

      const character =
        document.createTextNode(originalText.charAt(index));

      typewriter.insertBefore(character, caret);

      index += 1;

      const delay =
        28 + Math.random() * 40;

      window.setTimeout(typeCharacter, delay);
    }

    typeCharacter();
  }

  /* =========================================
     Active navigation links
     ========================================= */

  const pageSections = qsa("main section[id]");
  const navigationLinks = qsa(".nav-links a");

  if (
    pageSections.length &&
    navigationLinks.length &&
    "IntersectionObserver" in window
  ) {
    const activeObserver =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              return;
            }

            const sectionId = entry.target.id;

            navigationLinks.forEach(function (link) {
              const href = link.getAttribute("href");

              link.classList.toggle(
                "active",
                href === "#" + sectionId
              );
            });
          });
        },
        {
          threshold: 0.45
        }
      );

    pageSections.forEach(function (section) {
      activeObserver.observe(section);
    });
  }

  /* =========================================
     Smooth scrolling
     ========================================= */

  qsa('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const href = link.getAttribute("href");

      if (!href || href === "#") {
        return;
      }

      const target = qs(href);

      if (!target) {
        return;
      }

      event.preventDefault();

      const headerOffset = 72;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth"
      });
    });
  });

  /* =========================================
     Project filtering
     ========================================= */

  const filterButtons = qsa(".filter-btn");
  const projectCards = qsa(".project-card");

  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterButtons.forEach(function (item) {
          item.classList.remove("active");
        });

        button.classList.add("active");

        const filter =
          button.getAttribute("data-filter") || "all";

        projectCards.forEach(function (card) {
          const tags =
            (card.getAttribute("data-tags") || "")
              .split(",")
              .map(function (tag) {
                return tag.trim();
              })
              .filter(Boolean);

          const shouldShow =
            filter === "all" ||
            tags.includes(filter);

          card.classList.toggle(
            "hidden",
            !shouldShow
          );
        });
      });
    });
  }

  /* =========================================
     Project modal
     ========================================= */

  const projectModal = qs("#project-modal");

  if (projectModal) {
    const modalTitle =
      qs("#project-modal-title", projectModal);

    const modalDescription =
      qs("#project-modal-desc", projectModal);

    const carouselTrack =
      qs(".carousel-track", projectModal);

    const carouselDots =
      qs(".carousel-dots", projectModal);

    const previousButton =
      qs(".carousel-nav.prev", projectModal);

    const nextButton =
      qs(".carousel-nav.next", projectModal);

    const closeButton =
      qs(".modal-close", projectModal);

    const modalOkButton =
      qs(".modal-ok", projectModal);

    let currentSlide = 0;
    let slideCount = 0;

    function updateCarouselControls() {
      if (previousButton) {
        previousButton.disabled =
          currentSlide <= 0;
      }

      if (nextButton) {
        nextButton.disabled =
          currentSlide >= slideCount - 1;
      }
    }

    function setSlide(index) {
      if (!carouselTrack || !carouselDots) {
        return;
      }

      if (slideCount <= 0) {
        return;
      }

      currentSlide = Math.max(
        0,
        Math.min(index, slideCount - 1)
      );

      carouselTrack.style.transform =
        "translateX(-" +
        currentSlide * 100 +
        "%)";

      qsa("button", carouselDots).forEach(
        function (dot, dotIndex) {
          dot.classList.toggle(
            "active",
            dotIndex === currentSlide
          );
        }
      );

      updateCarouselControls();
    }

    function buildCarousel(images) {
      if (!carouselTrack || !carouselDots) {
        return;
      }

      carouselTrack.innerHTML = "";
      carouselDots.innerHTML = "";

      const validImages =
        images.filter(function (image) {
          return Boolean(image);
        });

      if (!validImages.length) {
        const placeholder =
          document.createElement("div");

        placeholder.className =
          "carousel-slide";

        placeholder.innerHTML =
          '<div class="carousel-placeholder">' +
          "Project images coming soon." +
          "</div>";

        carouselTrack.appendChild(
          placeholder
        );

        slideCount = 1;

        updateCarouselControls();

        return;
      }

      slideCount = validImages.length;

      validImages.forEach(
        function (imageSource, index) {
          const slide =
            document.createElement("div");

          slide.className =
            "carousel-slide";

          const image =
            document.createElement("img");

          image.src = imageSource;

          image.alt =
            "Project screenshot " +
            (index + 1);

          image.loading = "lazy";

          slide.appendChild(image);

          carouselTrack.appendChild(slide);

          const dot =
            document.createElement("button");

          dot.type = "button";

          dot.className =
            index === 0 ? "active" : "";

          dot.setAttribute(
            "aria-label",
            "Go to slide " +
              (index + 1)
          );

          dot.addEventListener(
            "click",
            function () {
              setSlide(index);
            }
          );

          carouselDots.appendChild(dot);
        }
      );

      setSlide(0);
    }

    function closeProjectModal() {
      projectModal.classList.remove("open");

      projectModal.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    function openProjectModal(card) {
      if (!card) {
        return;
      }

      const titleElement =
        qs("h3", card);

      const descriptionElement =
        qs("p", card);

      if (modalTitle) {
        modalTitle.textContent =
          titleElement
            ? titleElement.textContent.trim()
            : "Project";
      }

      if (modalDescription) {
        modalDescription.textContent =
          descriptionElement
            ? descriptionElement.textContent.trim()
            : "";
      }

      const imageData =
        card.getAttribute("data-images") || "";

      const images =
        imageData
          .split("|")
          .map(function (source) {
            return source.trim();
          })
          .filter(Boolean);

      buildCarousel(images);

      projectModal.classList.add("open");

      projectModal.setAttribute(
        "aria-hidden",
        "false"
      );

      window.setTimeout(function () {
        if (closeButton) {
          closeButton.focus();
        }
      }, 50);
    }

    if (previousButton) {
      previousButton.addEventListener(
        "click",
        function () {
          setSlide(currentSlide - 1);
        }
      );
    }

    if (nextButton) {
      nextButton.addEventListener(
        "click",
        function () {
          setSlide(currentSlide + 1);
        }
      );
    }

    if (closeButton) {
      closeButton.addEventListener(
        "click",
        closeProjectModal
      );
    }

    if (modalOkButton) {
      modalOkButton.addEventListener(
        "click",
        closeProjectModal
      );
    }

    projectModal.addEventListener(
      "click",
      function (event) {
        if (event.target === projectModal) {
          closeProjectModal();
        }
      }
    );

    document.addEventListener(
      "keydown",
      function (event) {
        if (!projectModal.classList.contains("open")) {
          return;
        }

        if (event.key === "Escape") {
          closeProjectModal();
        }

        if (
          event.key === "ArrowLeft" &&
          currentSlide > 0
        ) {
          setSlide(currentSlide - 1);
        }

        if (
          event.key === "ArrowRight" &&
          currentSlide < slideCount - 1
        ) {
          setSlide(currentSlide + 1);
        }
      }
    );

    projectCards.forEach(function (card) {
      card.addEventListener(
        "click",
        function () {
          openProjectModal(card);
        }
      );

      card.setAttribute(
        "tabindex",
        "0"
      );

      card.addEventListener(
        "keydown",
        function (event) {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            openProjectModal(card);
          }
        }
      );
    });
  }

  /* =========================================
     Animated statistics
     ========================================= */

  const statsSection = qs("#stats");
  const statNumbers = qsa(".stat-number");

  function animateStat(element) {
    const target =
      Number(
        element.getAttribute("data-value")
      ) || 0;

    const duration = 1400;
    const startTime = performance.now();

    function update(timestamp) {
      const elapsed =
        timestamp - startTime;

      const progress = Math.min(
        elapsed / duration,
        1
      );

      const value = Math.floor(
        progress * target
      );

      element.textContent =
        value.toLocaleString();

      if (progress < 1) {
        window.requestAnimationFrame(
          update
        );
      } else {
        element.textContent =
          target.toLocaleString();
      }
    }

    window.requestAnimationFrame(update);
  }

  if (
    statsSection &&
    statNumbers.length &&
    "IntersectionObserver" in window
  ) {
    let statsAnimated = false;

    const statsObserver =
      new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (
              entry.isIntersecting &&
              !statsAnimated
            ) {
              statsAnimated = true;

              statNumbers.forEach(
                animateStat
              );

              observer.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.3
        }
      );

    statsObserver.observe(statsSection);
  } else {
    statNumbers.forEach(function (element) {
      const target =
        Number(
          element.getAttribute("data-value")
        ) || 0;

      element.textContent =
        target.toLocaleString();
    });
  }

  /* =========================================
     Contact form
     ========================================= */

  const contactForm =
    qs("#contact-form");

  if (contactForm) {
    const submitButton =
      qs(
        "[data-fs-submit-btn]",
        contactForm
      ) ||
      qs(
        'button[type="submit"]',
        contactForm
      );

    const successBox =
      qs("[data-fs-success]");

    const errorBox =
      qs("[data-fs-error]");

    const successModal =
      qs("#success-modal");

    function setLoading(isLoading) {
      if (!submitButton) {
        return;
      }

      submitButton.disabled =
        Boolean(isLoading);

      submitButton.classList.toggle(
        "is-loading",
        Boolean(isLoading)
      );

      if (isLoading) {
        submitButton.setAttribute(
          "aria-busy",
          "true"
        );
      } else {
        submitButton.removeAttribute(
          "aria-busy"
        );
      }
    }

    function closeSuccessModal() {
      if (!successModal) {
        return;
      }

      successModal.classList.remove(
        "open"
      );

      successModal.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    function openSuccessModal() {
      if (!successModal) {
        show(successBox);
        return;
      }

      successModal.classList.add(
        "open"
      );

      successModal.setAttribute(
        "aria-hidden",
        "false"
      );

      const modalClose =
        qs(
          ".modal-close",
          successModal
        );

      if (modalClose) {
        modalClose.focus();
      }

      window.setTimeout(
        closeSuccessModal,
        4000
      );
    }

    if (successBox) {
      hide(successBox);
    }

    if (errorBox) {
      hide(errorBox);
    }

    async function handleContactSubmit(
      event
    ) {
      event.preventDefault();

      hide(successBox);
      hide(errorBox);

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      setLoading(true);

      try {
        const formData =
          new FormData(
            contactForm
          );

        const response =
          await fetch(
            contactForm.action,
            {
              method: "POST",
              body: formData,
              headers: {
                Accept:
                  "application/json"
              }
            }
          );

        if (!response.ok) {
          let responseData = {};

          try {
            responseData =
              await response.json();
          } catch (error) {
            responseData = {};
          }

          if (
            responseData &&
            Array.isArray(
              responseData.errors
            )
          ) {
            responseData.errors.forEach(
              function (item) {
                if (!item.field) {
                  return;
                }

                const fieldError =
                  qs(
                    '[data-fs-error="' +
                      item.field +
                      '"]',
                    contactForm
                  );

                if (fieldError) {
                  fieldError.textContent =
                    item.message ||
                    "Please check this field.";
                }
              }
            );
          }

          show(errorBox);
          setLoading(false);

          return;
        }

        contactForm.reset();

        hide(errorBox);

        openSuccessModal();

        window.setTimeout(
          function () {
            setLoading(false);
          },
          800
        );
      } catch (error) {
        console.error(
          "Contact form submission error:",
          error
        );

        show(errorBox);

        setLoading(false);
      }
    }

    contactForm.addEventListener(
      "submit",
      handleContactSubmit
    );

    if (submitButton) {
      submitButton.addEventListener(
        "click",
        function () {
          if (
            submitButton.type !==
            "submit"
          ) {
            handleContactSubmit(
              new Event("submit", {
                cancelable: true
              })
            );
          }
        }
      );
    }

    if (successModal) {
      const closeButton =
        qs(
          ".modal-close",
          successModal
        );

      const okButton =
        qs(
          ".modal-ok",
          successModal
        );

      if (closeButton) {
        closeButton.addEventListener(
          "click",
          closeSuccessModal
        );
      }

      if (okButton) {
        okButton.addEventListener(
          "click",
          closeSuccessModal
        );
      }

      successModal.addEventListener(
        "click",
        function (event) {
          if (
            event.target ===
            successModal
          ) {
            closeSuccessModal();
          }
        }
      );

      document.addEventListener(
        "keydown",
        function (event) {
          if (
            event.key === "Escape" &&
            successModal.classList.contains(
              "open"
            )
          ) {
            closeSuccessModal();
          }
        }
      );
    }
  }

})();
/* =========================================================
   3.3B PROJECT DETAIL CONTROLLER
   ========================================================= */

(function () {

  "use strict";

/* =========================================
Project Data Source
Single source of truth: data/projects.json
========================================= */

window.ManaOSPortfolioProjects = {};

fetch("./data/projects.json", { cache: "no-store" })
  .then(function (response) {
    if (!response.ok) {
      throw new Error(
        "Unable to load data/projects.json: HTTP " + response.status
      );
    }

    return response.json();
  })
  .then(function (data) {
    var projects = {};

    if (data && data.flagship) {
      projects[data.flagship.id] = {
        id: data.flagship.id,
        title: data.flagship.name,
        status: data.flagship.status,
        category: data.flagship.type,
        description: data.flagship.description,
        architecture: Array.isArray(data.flagship.publicArchitecture)
          ? data.flagship.publicArchitecture.join(" → ")
          : "",
        technologies: []
      };
    }

    if (data && Array.isArray(data.ecosystem)) {
      data.ecosystem.forEach(function (project) {
        projects[project.id] = {
          id: project.id,
          title: project.name,
          status: project.status,
          category: project.category,
          description: project.description || "",
          architecture: project.architecture || "",
          technologies: Array.isArray(project.technologies)
            ? project.technologies
            : []
        };
      });
    }

    if (data && Array.isArray(data.independentProjects)) {
      data.independentProjects.forEach(function (project) {
        projects[project.id] = {
          id: project.id,
          title: project.name,
          status: project.status,
          category: project.category,
          description: project.description || "",
          architecture: project.architecture || "",
          technologies: Array.isArray(project.technologies)
            ? project.technologies
            : []
        };
      });
    }

    window.ManaOSPortfolioProjects = projects;

    console.log(
      "ManaOS portfolio project data loaded:",
      Object.keys(projects)
    );
  })
  .catch(function (error) {
    console.error("ManaOS portfolio project data failed to load:", error);
  });

  const modal = document.getElementById(
    "portfolio-project-modal"
  );

  if (!modal) {
    return;
  }

  const title = document.getElementById(
    "portfolio-project-title"
  );

  const status = document.getElementById(
    "portfolio-project-status"
  );

  const category = document.getElementById(
    "portfolio-project-category"
  );

  const description = document.getElementById(
    "portfolio-project-description"
  );

  const architecture = document.getElementById(
    "portfolio-project-architecture"
  );

  const technologies = document.getElementById(
    "portfolio-project-technologies"
  );

  const closeButtons = modal.querySelectorAll(
    ".portfolio-modal-close"
  );

  function openProject(id) {

    const project =
      window.ManaOSPortfolioProjects &&
      window.ManaOSPortfolioProjects[id];

    if (!project) {
      return;
    }

    title.textContent = project.title;
    status.textContent = project.status;
    category.textContent = project.category;
    description.textContent = project.description;
    architecture.textContent = project.architecture;

    technologies.innerHTML = "";

    project.technologies.forEach(function (technology) {

      const tag = document.createElement("span");

      tag.textContent = technology;

      technologies.appendChild(tag);

    });

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

  }

  function closeProject() {

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

  }

  document
    .querySelectorAll("[data-project]")
    .forEach(function (card) {

      card.addEventListener("click", function () {

        const projectId =
          card.getAttribute("data-project");

        openProject(projectId);

      });

    });

  closeButtons.forEach(function (button) {

    button.addEventListener(
      "click",
      closeProject
    );

  });

  modal.addEventListener(
    "click",
    function (event) {

      if (event.target === modal) {
        closeProject();
      }

    }
  );

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape" &&
        modal.classList.contains("open")
      ) {

        closeProject();

      }

    }
  );

})();
