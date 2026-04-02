/* ====================================
   EMBER & OAK — Restaurant Website JS
   ==================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==================== LOADER ====================
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    // Trigger hero reveal animations
    document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 120 + 200);
    });
  }, 2800);
  document.body.style.overflow = 'hidden';


  // ==================== CUSTOM CURSOR ====================
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
    follower.style.left = mouseX + 'px';
    follower.style.top = mouseY + 'px';
  });

  document.querySelectorAll('a, button, .g-item, .menu-item, .testi-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('grow');
      follower.classList.add('grow');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('grow');
      follower.classList.remove('grow');
    });
  });


  // ==================== NAV SCROLL ====================
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });


  // ==================== HAMBURGER / MOBILE MENU ====================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  // ==================== INTERSECTION OBSERVER (REVEAL) ====================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal-up').forEach(el => {
    // Skip hero items (handled by loader)
    if (!el.closest('.hero')) {
      revealObserver.observe(el);
    }
  });


  // ==================== COUNTER ANIMATION ====================
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const start = performance.now();

    function update(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));


  // ==================== MENU TABS ====================
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.menu-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`[data-content="${target}"]`).classList.add('active');
    });
  });


  // ==================== TESTIMONIAL SLIDER ====================
  const track = document.getElementById('testi-track');
  const dotsContainer = document.getElementById('testi-dots');
  const cards = track.querySelectorAll('.testi-card');
  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let autoSlide;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('testi-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  function getCardWidth() {
    const card = cards[0];
    const style = window.getComputedStyle(card);
    return card.offsetWidth + parseInt(style.marginRight || 0) + 32; // 32 = gap
  }

  function goToSlide(index) {
    const maxIndex = cards.length - 1;
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    const offset = currentIndex * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;
    document.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  // Drag support
  track.addEventListener('mousedown', (e) => {
    isDragging = true; startX = e.clientX;
    clearInterval(autoSlide);
    track.style.transition = 'none';
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    const offset = currentIndex * getCardWidth() - diff;
    track.style.transform = `translateX(-${offset}px)`;
  });
  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    const diff = e.clientX - startX;
    if (diff < -80) goToSlide(currentIndex + 1);
    else if (diff > 80) goToSlide(currentIndex - 1);
    else goToSlide(currentIndex);
    startAutoSlide();
  });

  // Touch support
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX; isDragging = true;
    track.style.transition = 'none'; clearInterval(autoSlide);
  }, { passive: true });
  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    track.style.transform = `translateX(-${currentIndex * getCardWidth() - diff}px)`;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    isDragging = false; track.style.transition = '';
    const diff = e.changedTouches[0].clientX - startX;
    if (diff < -60) goToSlide(currentIndex + 1);
    else if (diff > 60) goToSlide(currentIndex - 1);
    else goToSlide(currentIndex);
    startAutoSlide();
  });

  function startAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      goToSlide(currentIndex < cards.length - 1 ? currentIndex + 1 : 0);
    }, 4500);
  }
  startAutoSlide();


  // ==================== PARALLAX HERO BG ====================
  const heroBg = document.querySelector('.hero-bg');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  }, { passive: true });


  // ==================== GALLERY TILT EFFECT ====================
  document.querySelectorAll('.g-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      item.style.transform = `scale(1.03) perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });


  // ==================== FORM SUBMISSION ====================
  const form = document.getElementById('res-form');
  const success = document.getElementById('form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Confirming…';
    btn.disabled = true;

    setTimeout(() => {
      success.classList.add('show');
      form.reset();
      btn.textContent = 'Confirm Reservation';
      btn.disabled = false;
      setTimeout(() => success.classList.remove('show'), 6000);
    }, 1800);
  });


  // ==================== SMOOTH ANCHOR SCROLL ====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = nav.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ==================== STAGGER MENU ITEMS ====================
  const menuObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.menu-item');
        items.forEach((item, i) => {
          item.style.opacity = '0';
          item.style.transform = 'translateX(-20px)';
          setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, i * 80);
        });
        menuObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const menuGrid = document.getElementById('menu-grid');
  if (menuGrid) menuObserver.observe(menuGrid);


  // ==================== ABOUT IMAGES PARALLAX ====================
  const img1 = document.querySelector('.about-img-card.img1');
  const img2 = document.querySelector('.about-img-card.img2');

  if (img1 && img2) {
    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', parallaxAbout, { passive: true });
        } else {
          window.removeEventListener('scroll', parallaxAbout);
        }
      });
    });
    aboutObserver.observe(document.querySelector('.about-image-wrap'));

    function parallaxAbout() {
      const el = document.querySelector('.about-image-wrap');
      const rect = el.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      img1.style.transform = `translateY(${-progress * 30}px)`;
      img2.style.transform = `translateY(${progress * 20}px)`;
    }
  }


  // ==================== NAV ACTIVE LINKS ====================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--cream)' : '';
    });
  }, { passive: true });

});