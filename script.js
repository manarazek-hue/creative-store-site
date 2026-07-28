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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
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
  });
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
