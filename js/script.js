// ===== CONFIGURAZIONE =====
const config = {
  scrollThreshold: 100,
  mobileBreakpoint: 768,
  throttleDelay: 100
};

// ===== UTILITY =====
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
}

// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCookieBanner();
  initSmoothScroll();
  initScrollAnimations();
  initServiceCardLinks();
  initScrollProgress();
  initAccessibility();
  initFormExtras();           // conteggio caratteri, file input, back link
  if ('ontouchstart' in window) initTouchOptimizations();
});

// ===== MOBILE MENU =====
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav-links');
  const overlay = document.querySelector('.mobile-overlay');
  if (!hamburger || !nav) return;

  let open = false;
  const toggle = () => {
    open = !open;
    hamburger.classList.toggle('active', open);
    nav.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', open);
    if (open) trapFocus(nav);
  };
  hamburger.addEventListener('click', toggle);
  overlay.addEventListener('click', toggle);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', toggle));
  window.addEventListener('resize', debounce(() => {
    if (open && window.innerWidth > config.mobileBreakpoint) toggle();
  }, 200));

  function trapFocus(container) {
    const focusable = container.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])');
    const first = focusable[0], last = focusable[focusable.length - 1];
    container.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (e.key === 'Escape') {
        toggle();
        hamburger.focus();
      }
    });
  }
}

// ===== COOKIE BANNER =====
function initCookieBanner() {
  const banner = document.querySelector('.cookie-banner');
  const btn = document.querySelector('#accept-cookies');
  if (!banner || !btn) return;

  const accepted = localStorage.getItem('cookiesAccepted') === 'true';
  banner.style.display = accepted ? 'none' : 'flex';
  btn.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    banner.classList.add('hide');
    setTimeout(() => banner.style.display = 'none', 300);
    showToast('Cookie accettati');
  });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  const headerH = document.querySelector('header')?.offsetHeight || 0;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = a.getAttribute('href');
      if (t.length > 1) {
        const el = document.querySelector(t);
        if (el) {
          e.preventDefault();
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.pageYOffset - headerH - 20,
            behavior: 'smooth'
          });
          history.pushState(null, '', t);
          el.setAttribute('tabindex', '-1');
          el.focus();
        }
      }
    });
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const items = document.querySelectorAll('.step, .area-box, .servizio-card, section h2');
  if (!items.length) return;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('animated');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });
  items.forEach(i => io.observe(i));
}

// ===== SERVIZI → PAGINE DEDICATE =====
function initServiceCardLinks() {
  const mapping = { 0: 'parere.html', 1: 'revisione.html', 2: 'redazione.html' };
  document.querySelectorAll('.servizio-card').forEach((card, i) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const url = mapping[i];
      if (url) window.location.href = url;
    });
  });
}

// ===== SCROLL PROGRESS BAR =====
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  function update() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = p + '%';
  }
  window.addEventListener('scroll', throttle(update, config.throttleDelay));
  update();
}

// ===== ACCESSIBILITÀ =====
function initAccessibility() {
  document.querySelectorAll('.skip-to-content').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  });
}

// ===== TOUCH OPTIMIZATIONS =====
function initTouchOptimizations() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, false);
}

// ===== FORM EXTRAS: CHAR COUNT, FILE INPUT, BACK LINK =====
function initFormExtras() {
  // torna a home
  document.querySelectorAll('.back-home').forEach(btn => {
    btn.addEventListener('click', () => location.href = 'index.html');
  });

  // conteggio caratteri
  const descr = document.getElementById('descrizione');
  const counter = document.getElementById('descrizione-counter');
  if (descr && counter) {
    counter.textContent = `${descr.value.length}/2000`;
    descr.addEventListener('input', () => {
      const len = descr.value.length;
      counter.textContent = `${len}/2000`;
      if (len < 50) counter.classList.add('error');
      else counter.classList.remove('error');
    });
  }

  // gestione file input con lista + rimozione
  document.querySelectorAll('input[type="file"]').forEach(input => {
    const list = document.createElement('ul');
    list.className = 'file-list';
    input.parentNode.appendChild(list);

    input.addEventListener('change', () => {
      list.innerHTML = '';
      Array.from(input.files).forEach((f, i) => {
        const li = document.createElement('li');
        li.textContent = f.name;
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'file-remove';
        rm.textContent = '×';
        rm.addEventListener('click', () => {
          const dt = new DataTransfer();
          Array.from(input.files).forEach((old, idx) => {
            if (idx !== i) dt.items.add(old);
          });
          input.files = dt.files;
          li.remove();
        });
        li.appendChild(rm);
        list.appendChild(li);
      });
    });
  });
}
