// ===== CONFIGURAZIONE =====
const config = {
  scrollThreshold: 100,
  animationDuration: 300,
  debounceDelay: 150,
  throttleDelay: 100,
  formAutoSaveInterval: 5000,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024
};

// ===== UTILITY =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function isMobile() {
  return (
    window.innerWidth <= config.mobileBreakpoint ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
}

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ===== INIZIALIZZAZIONE =====
document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initSmoothScroll();
  initStickyHeader();
  initScrollAnimations();
  initFormHandler();
  initScrollProgress();

  if (isTouchDevice()) {
    initTouchOptimizations();
  }
});

// ===== MENU MOBILE (Hamburger) =====
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.mobile-overlay');

  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', function () {
    const expanded = this.getAttribute('aria-expanded') === 'true' || false;
    this.setAttribute('aria-expanded', !expanded);
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });

  overlay.addEventListener('click', () => {
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const yOffset = window.innerWidth <= config.mobileBreakpoint ? -60 : -90;
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
}

// ===== STICKY HEADER =====
function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', throttle(() => {
    if (window.scrollY > config.scrollThreshold) {
      header.classList.add('sticky');
      // shrink effect
      if (window.scrollY > lastScrollY) {
        header.classList.add('shrink');
      } else {
        header.classList.remove('shrink');
      }
    } else {
      header.classList.remove('sticky', 'shrink');
    }
    lastScrollY = window.scrollY;
  }, 50));
}

// ===== ANIMAZIONI SU SCROLL =====
function initScrollAnimations() {
  const animatedEls = document.querySelectorAll(
    '.step, .area-box, .servizio-card, .bio-section, .testimonial, .form-container, section'
  );

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  animatedEls.forEach(el => {
    el.classList.add('before-animate');
    observer.observe(el);
  });
}

// ===== FORM HANDLER COMPLETO (STRIPE) =====
function initFormHandler() {
  const form = document.getElementById('consultationForm');
  if (!form) return;

  const submitButton = form.querySelector('.submit-btn');
  const originalButtonText = submitButton.textContent;
  const messageDiv = form.parentNode.querySelector('.form-message');
  const formInputs = form.querySelectorAll('input, textarea, select');

  // Conta caratteri live descrizione
  const descrizione = document.getElementById('descrizione');
  const counter = document.getElementById('descrizione-counter');
  if (descrizione && counter) {
    descrizione.addEventListener('input', () => {
      counter.textContent = `${descrizione.value.length}/1000`;
    });
  }

  // Carica dati salvati localStorage all'avvio (opzionale)
  function loadFormData() {
    const savedData = localStorage.getItem('consultationFormData');
    if (savedData) {
      try {
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach((key) => {
          const input = form.querySelector(`[name="${key}"]`);
          if (input && !input.value) {
            input.value = formData[key];
          }
        });
      } catch (e) {
        console.error('Error loading form data:', e);
      }
    }
  }
  loadFormData();

  // Validazione campo
  function validateField(field) {
    const value = field.value.trim();
    const fieldGroup = field.closest('.form-group');
    fieldGroup.classList.remove('error', 'success');
    const existingError = fieldGroup.querySelector('.field-error');
    if (existingError) existingError.remove();

    let isValid = true;
    let errorMessage = '';

    switch (field.name) {
      case 'nome':
        if (!value || value.length < 2) {
          isValid = false;
          errorMessage = 'Il nome deve essere di almeno 2 caratteri';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Inserisci un indirizzo email valido';
        }
        break;
      case 'macroarea':
        if (!value) {
          isValid = false;
          errorMessage = 'Seleziona una macroarea';
        }
        break;
      case 'servizio':
        if (!value) {
          isValid = false;
          errorMessage = 'Scegli il servizio richiesto';
        }
        break;
      case 'descrizione':
        if (!value || value.length < 10) {
          isValid = false;
          errorMessage = 'Descrivi la questione in almeno 10 caratteri';
        }
        if (value.length > 1000) {
          isValid = false;
          errorMessage = 'Hai superato il limite di 1000 caratteri';
        }
        break;
      // Puoi aggiungere altre validazioni qui...
    }

    if (!isValid && value) {
      fieldGroup.classList.add('error');
      const errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      errorEl.textContent = errorMessage;
      fieldGroup.appendChild(errorEl);
    } else if (isValid && value) {
      fieldGroup.classList.add('success');
    }

    return isValid;
  }

  // Validazione in tempo reale
  formInputs.forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener(
      'input',
      debounce(() => {
        validateField(input);
      }, 400)
    );
  });

  // Submit form: invio a Stripe backend, redirect su Stripe checkout
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    let isFormValid = true;
    formInputs.forEach((input) => {
      if (!validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      showMessage('error', 'Per favore, correggi gli errori nel form');
      const firstError = form.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Crea FormData (il name del campo file DEVE essere "allegati" come lato backend)
    const formData = new FormData(form);

    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Reindirizzamento...';

    try {
      const response = await fetch('https://avvocawebappbackend.onrender.com/create-checkout-session', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        showMessage(data.error || "Errore nella creazione della sessione di pagamento.");
      }
    } catch (error) {
      showMessage('error', 'Errore durante l\'invio', [
        'Si è verificato un errore. Riprova più tardi.',
        'Se il problema persiste, scrivi a: avvocatopasqualegranata@gmail.com',
      ]);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

  // Mostra messaggi form
  function showMessage(type, title, messages) {
    messageDiv.style.display = 'block';
    messageDiv.className = `form-message ${type}`;
    let html = `<h4>${title}</h4>`;
    if (Array.isArray(messages)) {
      html += '<ul>';
      messages.forEach((msg) => {
        html += `<li>${msg}</li>`;
      });
      html += '</ul>';
    } else {
      html += `<p>${messages}</p>`;
    }
    messageDiv.innerHTML = html;
    if (type === 'success') {
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 10000);
    }
  }
}

// ===== SCROLL PROGRESS INDICATOR =====
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = (scrollTop / documentHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }

  window.addEventListener('scroll', throttle(updateProgress, 50));
  updateProgress();
}

// ===== TOAST NOTIFICATION =====
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

// ===== MOBILE TOUCH OPTIMIZATION (OPTIONAL) =====
function initTouchOptimizations() {
  // Disabilita double-tap zoom, miglioramenti touch (se vuoi)
}
