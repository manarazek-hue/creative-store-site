const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const year = document.querySelector('#year');
const sectionsToReveal = document.querySelectorAll('.section-fade');
const statsSection = document.querySelector('#stats');
const statNumbers = document.querySelectorAll('.stat-number');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  sectionsToReveal.forEach((section) => revealObserver.observe(section));


// Custom contact form handler with optional reCAPTCHA support
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('[data-fs-submit-btn]') || form.querySelector('button[type=submit]');
  const successBox = document.querySelector('[data-fs-success]');
  const errorBox = document.querySelector('[data-fs-error]');

  function show(el) { if (el) el.style.display = ''; }
  function hide(el) { if (el) el.style.display = 'none'; }
  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.classList.toggle('is-loading', !!on);
  }

  hide(successBox); hide(errorBox);

  // Optional reCAPTCHA v3: add data-recaptcha-sitekey="SITE_KEY" to the form element
  const recaptchaKey = form.dataset.recaptchaSitekey || null;
  let recaptchaReady = false;

  async function ensureRecaptcha() {
    if (!recaptchaKey) return false;
    if (window.grecaptcha && window.grecaptcha.execute) { recaptchaReady = true; return true; }
    // load script
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaKey}`;
      s.onload = () => { recaptchaReady = true; resolve(true); };
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  // submission logic used by click and submit handlers
  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    hide(successBox); hide(errorBox);

    // basic browser validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setLoading(true);

    try {
      const url = form.action;
      const formData = new FormData(form);

      // run reCAPTCHA if configured
      if (recaptchaKey) {
        const ok = await ensureRecaptcha();
        if (ok && window.grecaptcha && window.grecaptcha.execute) {
          const token = await window.grecaptcha.execute(recaptchaKey, { action: 'submit' });
          formData.append('g-recaptcha-response', token);
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        hide(errorBox);
        // show modal instead of inline box
        const modal = document.getElementById('success-modal');
        if (modal) {
          modal.classList.add('open');
          modal.setAttribute('aria-hidden', 'false');
          // wire modal buttons
          const closeBtn = modal.querySelector('.modal-close');
          const okBtn = modal.querySelector('.modal-ok');
          let autoCloseTimer = null;
          const AUTO_CLOSE_MS = 4000;
          const closeModal = () => {
            if (autoCloseTimer) { clearTimeout(autoCloseTimer); autoCloseTimer = null; }
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
          };
          if (closeBtn) closeBtn.onclick = closeModal;
          if (okBtn) okBtn.onclick = closeModal;
          modal.onclick = (ev) => { if (ev.target === modal) closeModal(); };
          // auto-close after AUTO_CLOSE_MS
          autoCloseTimer = setTimeout(closeModal, AUTO_CLOSE_MS);
        } else {
          show(successBox);
        }
        form.reset();
        // quick cooldown then re-enable
        setTimeout(() => setLoading(false), 800);
      } else {
        let data = {};
        try { data = await res.json(); } catch (_) {}
        // populate field errors if present
        if (data && data.errors && Array.isArray(data.errors)) {
          data.errors.forEach(err => {
            const el = form.querySelector(`[data-fs-error="${err.field}"]`);
            if (el) el.textContent = err.message;
          });
        }
        show(errorBox);
        setLoading(false);
      }
    } catch (err) {
      console.error('Form submit error', err);
      show(errorBox);
      setLoading(false);
    }
  }

  // prefer click on the button (prevents native navigation); also keep submit handler for completeness
  if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
  form.addEventListener('submit', handleSubmit);
})();
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statNumbers.forEach((number) => {
            const target = Number(number.getAttribute('data-value')) || 0;
            let start = 0;
            const duration = 1400;
            const step = (timestamp, startTime) => {
              if (!startTime) startTime = timestamp;
              const progress = Math.min((timestamp - startTime) / duration, 1);
              number.textContent = Math.floor(progress * target).toLocaleString();
              if (progress < 1) {
                window.requestAnimationFrame((next) => step(next, startTime));
              } else {
                number.textContent = target.toLocaleString();
              }
            };
            window.requestAnimationFrame(step);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
  }
}

  /* Additional interactive features: typewriter, filters, sticky nav, active link, project modal */
  (function () {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.style.display = 'none';
    }

    // Sticky header background tweak
    const header = document.querySelector('.site-header');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('scrolled', y > 10);
      lastScroll = y;
    }, { passive: true });

    // Active link highlighting
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    if ('IntersectionObserver' in window && sections.length) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = e.target.id;
            navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
          }
        });
      }, { threshold: 0.5 });
      sections.forEach(s => obs.observe(s));
    }

    // Typewriter for hero
    const tw = document.querySelector('[data-typewriter]');
    if (tw) {
      const text = tw.getAttribute('data-typewriter') || tw.textContent.trim();
      tw.textContent = '';
      const caret = document.createElement('span'); caret.className = 'typed-caret';
      tw.appendChild(caret);
      let i = 0;
      const delay = 28;
      (function typeChar() {
        if (i < text.length) {
          const ch = document.createTextNode(text.charAt(i));
          tw.insertBefore(ch, caret);
          i++;
          setTimeout(typeChar, delay + (Math.random() * 40));
        }
      })();
    }

    // Project filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      projectCards.forEach(card => {
        const tags = (card.dataset.tags || '').split(',').map(s => s.trim()).filter(Boolean);
        const show = f === 'all' || tags.includes(f);
        card.classList.toggle('hidden', !show);
      });
    }));

    // Project modal carousel
    const projectModal = document.getElementById('project-modal');
    const modalTitle = projectModal && projectModal.querySelector('#project-modal-title');
    const modalDesc = projectModal && projectModal.querySelector('#project-modal-desc');
    const carouselTrack = projectModal && projectModal.querySelector('.carousel-track');
    const carouselDots = projectModal && projectModal.querySelector('.carousel-dots');
    const prevBtn = projectModal && projectModal.querySelector('.carousel-nav.prev');
    const nextBtn = projectModal && projectModal.querySelector('.carousel-nav.next');
    let currentSlide = 0;
    let slideCount = 0;

    function setSlide(index) {
      if (!carouselTrack || !carouselDots) return;
      currentSlide = Math.max(0, Math.min(index, slideCount - 1));
      const offset = -currentSlide * 100;
      carouselTrack.style.transform = `translateX(${offset}%)`;
      carouselDots.querySelectorAll('button').forEach((btn, idx) => btn.classList.toggle('active', idx === currentSlide));
      updateCarouselControls();
    }

    function buildCarousel(images) {
      if (!carouselTrack || !carouselDots) return;
      carouselTrack.innerHTML = '';
      carouselDots.innerHTML = '';
      const imgList = images.filter(Boolean);
      if (imgList.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'carousel-slide';
        placeholder.innerHTML = '<div class="carousel-placeholder">Images coming soon for this project.</div>';
        carouselTrack.appendChild(placeholder);
        imgList.push('');
      }
      slideCount = imgList.length;
      imgList.forEach((src, idx) => {
        if (idx === 0 && carouselTrack.children.length) {
          // placeholder already inserted
        } else {
          const slide = document.createElement('div');
          slide.className = 'carousel-slide';
          slide.innerHTML = `<img src="${src}" alt="Project screenshot ${idx + 1}" />`;
          carouselTrack.appendChild(slide);
        }
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = idx === 0 ? 'active' : '';
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => setSlide(idx));
        carouselDots.appendChild(dot);
      });
      setSlide(0);
    }

    function updateCarouselControls() {
      if (!prevBtn || !nextBtn) return;
      prevBtn.disabled = currentSlide <= 0;
      nextBtn.disabled = currentSlide >= slideCount - 1;
    }

    function openModal(card) {
      if (!projectModal) return;
      const title = card.querySelector('h3') && card.querySelector('h3').textContent;
      const desc = card.querySelector('p') && card.querySelector('p').textContent;
      if (modalTitle) modalTitle.textContent = title || 'Project';
      if (modalDesc) modalDesc.textContent = desc || '';
      const imagesMeta = card.dataset.images || '';
      const images = imagesMeta.split('|').map(src => src.trim()).filter(Boolean);
      buildCarousel(images);
      updateCarouselControls();
      projectModal.classList.add('open'); projectModal.setAttribute('aria-hidden', 'false');
      const close = () => { projectModal.classList.remove('open'); projectModal.setAttribute('aria-hidden', 'true'); };
      const closeBtn = projectModal.querySelector('.modal-close');
      const okBtn = projectModal.querySelector('.modal-ok');
      if (closeBtn) closeBtn.onclick = close;
      if (okBtn) okBtn.onclick = close;
      projectModal.onclick = (ev) => { if (ev.target === projectModal) close(); };
      document.addEventListener('keydown', function esc(e){ if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
      setTimeout(() => { (projectModal.querySelector('.modal-close') || projectModal).focus(); }, 60);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { if (currentSlide > 0) { setSlide(currentSlide - 1); updateCarouselControls(); } });
    if (nextBtn) nextBtn.addEventListener('click', () => { if (currentSlide < slideCount - 1) { setSlide(currentSlide + 1); updateCarouselControls(); } });

    projectCards.forEach(card => card.addEventListener('click', () => openModal(card)));

    // Smooth scroll for same-page nav (ensure offset for sticky header)
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        if (href.startsWith('#')) {
          const el = document.querySelector(href);
          if (el) {
            e.preventDefault();
            const y = el.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }
      });
    });

  })();
