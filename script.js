// ===== UTILITÀ E CONFIGURAZIONE =====
const config = {
  scrollThreshold: 100,
  animationDuration: 300,
  debounceDelay: 150,
  throttleDelay: 100,
  formAutoSaveInterval: 5000,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024
};

// Utility: Debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Utility: Throttle
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Utility: Check if mobile device
function isMobile() {
  return window.innerWidth <= config.mobileBreakpoint || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Utility: Check if touch device
function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ===== INIZIALIZZAZIONE APP =====
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initSmoothScroll();
  initStickyHeader();
  initLazyLoading();
  initScrollAnimations();
  initFormHandler();
  initScrollProgress();
  initAccessibility();
  initPerformanceOptimizations();
  
  // Inizializza tooltips se presenti
  if (isTouchDevice()) {
    initTouchOptimizations();
  }
});

// ===== MENU MOBILE MIGLIORATO =====
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.mobile-overlay');
  const body = document.body;
  let isOpen = false;

  if (!hamburger || !navLinks) return;

  // Funzione per chiudere il menu
  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    overlay?.classList.remove('active');
    body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
    
    // Rimuovi focus trap
    document.removeEventListener('keydown', trapFocus);
  }

  // Funzione per aprire il menu
  function openMenu() {
    isOpen = true;
    hamburger.classList.add('active');
    navLinks.classList.add('active');
    overlay?.classList.add('active');
    body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
    
    // Aggiungi focus trap
    document.addEventListener('keydown', trapFocus);
    
    // Focus sul primo link
    setTimeout(() => {
      navLinks.querySelector('a')?.focus();
    }, 300);
  }

  // Toggle menu
  function toggleMenu() {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Focus trap per accessibilità
  function trapFocus(e) {
    if (e.key === 'Tab') {
      const focusableElements = navLinks.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    
    if (e.key === 'Escape') {
      closeMenu();
      hamburger.focus();
    }
  }

  // Event listeners
  hamburger.addEventListener('click', toggleMenu);
  
  // Chiudi con overlay
  overlay?.addEventListener('click', closeMenu);
  
  // Chiudi cliccando sui link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
      // Smooth scroll to section
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          setTimeout(() => {
            targetSection.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      }
    });
  });

  // Chiudi menu on resize se necessario
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > config.mobileBreakpoint && isOpen) {
        closeMenu();
      }
    }, 250);
  });

  // Previeni scroll quando menu è aperto su iOS
  if (isTouchDevice()) {
    let touchStartY = 0;
    
    navLinks.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });
    
    navLinks.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      const scrollTop = navLinks.scrollTop;
      const scrollHeight = navLinks.scrollHeight;
      const height = navLinks.clientHeight;
      
      if ((scrollTop === 0 && touchY > touchStartY) || 
          (scrollTop + height === scrollHeight && touchY < touchStartY)) {
        e.preventDefault();
      }
    }, { passive: false });
  }
}

// ===== SMOOTH SCROLL MIGLIORATO =====
function initSmoothScroll() {
  // Offset per header sticky
  const headerHeight = document.querySelector('header')?.offsetHeight || 0;
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      e.preventDefault();
      
      // Calcola posizione con offset
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
      
      // Smooth scroll con easing
      smoothScrollTo(targetPosition);
      
      // Update URL senza jump
      history.pushState(null, null, targetId);
      
      // Focus management per accessibilità
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus();
    });
  });
}

// Custom smooth scroll con easing
function smoothScrollTo(targetPosition) {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = Math.min(Math.abs(distance) * 0.5, 1000);
  let start = null;
  
  function animation(currentTime) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Easing function
    const easeProgress = easeInOutCubic(progress);
    
    window.scrollTo(0, startPosition + distance * easeProgress);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }
  
  requestAnimationFrame(animation);
}

// Easing function
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// ===== STICKY HEADER INTELLIGENTE =====
function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  
  let lastScrollTop = 0;
  let ticking = false;
  
  function updateHeader() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove scrolled class
    if (scrollTop > config.scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Hide/show su scroll
    if (scrollTop > lastScrollTop && scrollTop > 300) {
      // Scrolling down
      header.classList.add('hidden');
    } else {
      // Scrolling up
      header.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop;
    ticking = false;
  }
  
  // Throttled scroll event
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });
}

// ===== LAZY LOADING IMMAGINI =====
function initLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supporta lazy loading nativo
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  } else {
    // Fallback con Intersection Observer
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

// ===== ANIMAZIONI ON SCROLL =====
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.step, .area-box, .servizio-card, .bio-content, section h2'
  );
  
  if (!animatedElements.length) return;
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        
        // Stagger animation per elementi multipli
        const siblings = entry.target.parentElement.children;
        if (siblings.length > 1) {
          Array.from(siblings).forEach((sibling, index) => {
            if (!sibling.classList.contains('animated')) {
              setTimeout(() => {
                sibling.classList.add('animated');
              }, index * 100);
            }
          });
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  animatedElements.forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
}

// ===== FORM HANDLER AVANZATO =====
function initFormHandler() {
  const form = document.getElementById('consultationForm');
  if (!form) return;
  
  const submitButton = form.querySelector('.submit-btn');
  const originalButtonText = submitButton.textContent;
  const messageDiv = form.parentNode.querySelector('.form-message');
  const formInputs = form.querySelectorAll('input, textarea, select');
  
  // Auto-save form data
  let autoSaveTimer;
  
  function saveFormData() {
    const formData = {};
    formInputs.forEach(input => {
      if (input.name) {
        formData[input.name] = input.value;
      }
    });
    localStorage.setItem('consultationFormData', JSON.stringify(formData));
  }
  
  function loadFormData() {
    const savedData = localStorage.getItem('consultationFormData');
    if (savedData) {
      try {
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach(key => {
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
  
  // Carica dati salvati all'avvio
  loadFormData();
  
  // Real-time validation
  formInputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', debounce(() => {
      validateField(input);
      saveFormData();
    }, 500));
  });
  
  // Validazione singolo campo
  function validateField(field) {
    const value = field.value.trim();
    const fieldGroup = field.closest('.form-group');
    
    // Rimuovi errori precedenti
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
      case 'descrizione':
        if (!value || value.length < 10) {
          isValid = false;
          errorMessage = 'Descrivi il problema in almeno 10 caratteri';
        }
        break;
      case 'servizio':
        if (!value) {
          isValid = false;
          errorMessage = 'Seleziona un servizio';
        }
        break;
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
  
  // Submit form
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Valida tutti i campi
    let isFormValid = true;
    formInputs.forEach(input => {
      if (!validateField(input)) {
        isFormValid = false;
      }
    });
    
    if (!isFormValid) {
      showMessage('error', 'Per favore, correggi gli errori nel form');
      // Scrolla al primo errore
      const firstError = form.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Prepara dati
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Invia richiesta
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Invio in corso...';
    
    try {
      // Simula invio (sostituire con vera API)
      await sendFormData(data);
      
      // Success
      showMessage('success', 'Richiesta inviata con successo! 🎉', [
        `Servizio: ${form.servizio.options[form.servizio.selectedIndex].text}`,
        `Ti risponderemo entro 48h all'indirizzo: ${data.email}`,
        'Controlla la tua email per le istruzioni sul pagamento'
      ]);
      
      // Reset form e localStorage
      form.reset();
      localStorage.removeItem('consultationFormData');
      
      // Scroll to message
      messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Track event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          'event_category': 'engagement',
          'event_label': data.servizio
        });
      }
      
    } catch (error) {
      showMessage('error', 'Errore durante l\'invio', [
        'Si è verificato un errore. Riprova più tardi.',
        'Se il problema persiste, contattaci via email.'
      ]);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
  
  // Funzione invio dati (mock)
  async function sendFormData(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simula successo/errore random
        if (Math.random() > 0.1) {
          resolve({ success: true });
        } else {
          reject(new Error('Network error'));
        }
      }, 2000);
    });
  }
  
  // Mostra messaggi
  function showMessage(type, title, messages) {
    messageDiv.style.display = 'block';
    messageDiv.className = `form-message ${type}`;
    
    let html = `<h4>${title}</h4>`;
    if (Array.isArray(messages)) {
      html += '<ul>';
      messages.forEach(msg => {
        html += `<li>${msg}</li>`;
      });
      html += '</ul>';
    } else {
      html += `<p>${messages}</p>`;
    }
    
    messageDiv.innerHTML = html;
    
    // Auto-hide per success
    if (type === 'success') {
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 10000);
    }
  }
}

// ===== SCROLL PROGRESS INDICATOR =====
function initScrollProgress() {
  // Crea progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);
  
  // Update progress
  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = (scrollTop / documentHeight) * 100;
    
    progressBar.style.width = `${progress}%`;
  }
  
  // Throttled scroll event
  window.addEventListener('scroll', throttle(updateProgress, 50));
  
  // Initial update
  updateProgress();
}

// ===== ACCESSIBILITY IMPROVEMENTS =====
function initAccessibility() {
  // Skip links
  const skipLinks = document.querySelectorAll('.skip-to-content');
  skipLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  });
  
  // Announce page changes for screen readers
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  document.body.appendChild(announcer);
  
  // Keyboard navigation improvements
  document.addEventListener('keydown', (e) => {
    // Esc closes modals/menus
    if (e.key === 'Escape') {
      const activeMenu = document.querySelector('.nav-links.active');
      if (activeMenu) {
        document.querySelector('.hamburger')?.click();
      }
    }
  });
}

// ===== TOUCH OPTIMIZATIONS =====
function initTouchOptimizations() {
  // Previeni double-tap zoom su iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Migliora touch targets
  const touchTargets = document.querySelectorAll('a, button, input, select, textarea');
  touchTargets.forEach(target => {
    const rect = target.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      target.style.minWidth = '44px';
      target.style.minHeight = '44px';
    }
  });
  
  // Swipe gestures per menu mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      const navLinks = document.querySelector('.nav-links');
      const hamburger = document.querySelector('.hamburger');
      
      if (diff > swipeThreshold && navLinks?.classList.contains('active')) {
        // Swipe left - close menu
        hamburger?.click();
      }
    }
  }
}





// ===== UTILITY: Copy to clipboard =====
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copiato negli appunti!');
    }).catch(err => {
      console.error('Errore copia:', err);
    });
  } else {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Copiato negli appunti!');
    } catch (err) {
      console.error('Errore copia:', err);
    }
    document.body.removeChild(textArea);
  }
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
}