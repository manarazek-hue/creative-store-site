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
