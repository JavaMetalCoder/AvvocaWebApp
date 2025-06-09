/**
 * AVVOCÀ - JAVASCRIPT MODERNO E OTTIMIZZATO
 * Compatibile con il nuovo design azzurro e bianco
 * Con integrazione pagamenti Stripe completa
 */

// ===== CONFIGURAZIONE MODERNA =====
const CONFIG = {
  MOBILE_BREAKPOINT: 768,
  THROTTLE_DELAY: 16,
  DEBOUNCE_DELAY: 250,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 600,
  STORAGE_KEYS: {
    COOKIES: 'cookiesAccepted',
    THEME: 'userTheme'
  },
  SELECTORS: {
    hamburger: '.hamburger',
    navLinks: '.nav-links',
    overlay: '.mobile-overlay',
    cookieBanner: '.cookie-banner',
    acceptCookies: '#accept-cookies',
    smoothLinks: 'a[href^="#"]',
    animatedElements: '.step, .area-box, .servizio-card, section h2',
    serviceCards: '.servizio-card',
    backButtons: '.back-link',
    forms: '#serviceForm',
    fileInputs: 'input[type="file"]',
    textareas: '#descrizione'
  }
};

// ===== CONFIGURAZIONE BACKEND =====
const BACKEND_CONFIG = {
  BASE_URL: 'https://avvocawebappbackend.onrender.com',
  ENDPOINTS: {
    checkout: '/create-checkout-session',
    health: '/health',
    cancel: '/payment-cancelled'
  }
};

// ===== UTILITÀ MODERNE =====
const Utils = {
  // Query selectors ottimizzati
  qs: (selector, context = document) => context.querySelector(selector),
  qsa: (selector, context = document) => Array.from(context.querySelectorAll(selector)),

  // Throttle per performance
  throttle(fn, limit = CONFIG.THROTTLE_DELAY) {
    let inThrottle = false;
    return function executedFunction(...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Debounce per input
  debounce(fn, delay = CONFIG.DEBOUNCE_DELAY) {
    let timeoutId;
    return function debouncedFunction(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // Storage sicuro
  storage: {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn('Storage access failed:', e);
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        console.warn('Storage write failed:', e);
        return false;
      }
    }
  },

  // Toast notification moderna
  showToast(message, type = 'success', duration = CONFIG.TOAST_DURATION) {
    // Rimuovi toast esistenti
    Utils.qsa('.toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    
    // Stili dinamici per il toast
    Object.assign(toast.style, {
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9',
      color: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '1rem',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      zIndex: '1000',
      maxWidth: '400px',
      fontSize: '0.875rem',
      fontWeight: '500'
    });

    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    document.body.appendChild(toast);

    // Animazione entrata
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });

    // Auto rimozione
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);

    return toast;
  },

  // Validazione email
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Formattazione dimensione file
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
};

// ===== GESTIONE MOBILE MENU MODERNA =====
class MobileMenu {
  constructor() {
    this.hamburger = Utils.qs(CONFIG.SELECTORS.hamburger);
    this.navLinks = Utils.qs(CONFIG.SELECTORS.navLinks);
    this.overlay = Utils.qs(CONFIG.SELECTORS.overlay);
    this.isOpen = false;
    this.focusableElements = [];

    if (this.hamburger && this.navLinks) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    // Toggle menu
    this.hamburger.addEventListener('click', () => this.toggle());
    
    // Close su overlay click
    this.overlay?.addEventListener('click', () => this.close());

    // Close su link click
    Utils.qsa('a', this.navLinks).forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    // Responsive handling
    const handleResize = Utils.debounce(() => {
      if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT && this.isOpen) {
        this.close();
      }
    });

    window.addEventListener('resize', handleResize);

    // Escape key handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        this.hamburger.focus();
      }
    });
  }

  setupAccessibility() {
    this.focusableElements = Utils.qsa(
      'a, button, [tabindex]:not([tabindex="-1"])',
      this.navLinks
    );

    this.hamburger.setAttribute('aria-expanded', 'false');
    this.hamburger.setAttribute('aria-controls', 'mobile-nav');
    this.navLinks.setAttribute('id', 'mobile-nav');
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.updateDOM();
    this.trapFocus();
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.updateDOM();
    document.body.style.overflow = '';
  }

  updateDOM() {
    this.hamburger.classList.toggle('active', this.isOpen);
    this.navLinks.classList.toggle('active', this.isOpen);
    this.overlay?.classList.toggle('active', this.isOpen);
    this.hamburger.setAttribute('aria-expanded', this.isOpen);
  }

  trapFocus() {
    if (!this.isOpen || !this.focusableElements.length) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    this.navLinks.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => firstElement.focus());
  }
}

// ===== GESTIONE COOKIE BANNER =====
class CookieBanner {
  constructor() {
    this.banner = Utils.qs(CONFIG.SELECTORS.cookieBanner);
    this.acceptBtn = Utils.qs(CONFIG.SELECTORS.acceptCookies);
    
    if (this.banner && this.acceptBtn) {
      this.init();
    }
  }

  init() {
    const accepted = Utils.storage.get(CONFIG.STORAGE_KEYS.COOKIES) === 'true';
    
    if (accepted) {
      this.banner.style.display = 'none';
      return;
    }

    this.bindEvents();
    this.banner.style.display = 'flex';
  }

  bindEvents() {
    this.acceptBtn.addEventListener('click', () => this.accept());
  }

  accept() {
    Utils.storage.set(CONFIG.STORAGE_KEYS.COOKIES, 'true');
    this.banner.classList.add('hide');
    
    setTimeout(() => {
      this.banner.style.display = 'none';
    }, 300);

    Utils.showToast('Cookie accettati! 🍪', 'success');
  }
}

// ===== SMOOTH SCROLL MIGLIORATO =====
class SmoothScroll {
  constructor() {
    this.headerHeight = Utils.qs('header')?.offsetHeight || 80;
    this.init();
  }

  init() {
    Utils.qsa(CONFIG.SELECTORS.smoothLinks).forEach(link => {
      link.addEventListener('click', (e) => this.handleClick(e, link));
    });
  }

  handleClick(e, link) {
    const targetId = link.getAttribute('href');
    
    if (targetId.length <= 1) return;

    const targetElement = Utils.qs(targetId);
    if (!targetElement) return;

    e.preventDefault();

    const targetPosition = targetElement.getBoundingClientRect().top + 
                          window.pageYOffset - 
                          this.headerHeight - 20;

    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth'
    });

    // Update URL e focus per accessibilità
    history.pushState(null, '', targetId);
    
    // Focus management
    setTimeout(() => {
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus();
      
      // Rimuovi tabindex dopo il focus
      setTimeout(() => {
        targetElement.removeAttribute('tabindex');
      }, 1000);
    }, 500);
  }
}

// ===== ANIMAZIONI SCROLL OTTIMIZZATE =====
class ScrollAnimations {
  constructor() {
    this.elements = Utils.qsa(CONFIG.SELECTORS.animatedElements);
    if (this.elements.length) {
      this.init();
    }
  }

  init() {
    // Usa Intersection Observer per performance migliori
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    this.elements.forEach(el => this.observer.observe(el));
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Aggiungi un piccolo delay per effetto cascata
        const delay = Array.from(this.elements).indexOf(entry.target) * 100;
        
        setTimeout(() => {
          entry.target.classList.add('animated');
        }, Math.min(delay, 500));
        
        this.observer.unobserve(entry.target);
      }
    });
  }
}

// ===== SERVICE CARDS NAVIGATION =====
class ServiceCards {
  constructor() {
    this.cards = Utils.qsa(CONFIG.SELECTORS.serviceCards);
    this.pageMapping = {
      0: '/pages/parere.html',
      1: '/pages/revisione.html', 
      2: '/pages/redazione.html'
    };
    
    if (this.cards.length) {
      this.init();
    }
  }

  init() {
    this.cards.forEach((card, index) => {
      this.setupCard(card, index);
    });
  }

  setupCard(card, index) {
    const url = this.pageMapping[index];
    if (!url) return;

    // Accessibilità
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Vai al servizio ${card.querySelector('h3')?.textContent}`);

    // Event handlers
    const navigate = () => {
      // Aggiungi loading state
      card.style.opacity = '0.7';
      card.style.transform = 'scale(0.98)';
      
      setTimeout(() => {
        window.location.href = url;
      }, 150);
    };
    
    card.addEventListener('click', navigate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate();
      }
    });

    // Hover effects migliorati
    card.addEventListener('mouseenter', () => {
      card.style.cursor = 'pointer';
    });
  }
}

// ===== PAYMENT MANAGER - INTEGRAZIONE STRIPE =====
class PaymentManager {
  constructor() {
    this.isProcessing = false;
    this.sessionData = null;
    this.init();
  }

  init() {
    console.log('💳 PaymentManager inizializzato');
    this.testBackendConnection();
  }

  async testBackendConnection() {
    try {
      console.log('🔍 Test connessione backend...');
      const response = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.ENDPOINTS.health}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connesso:', data);
        return true;
      } else {
        console.warn('⚠️ Backend risponde ma con errore:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend non raggiungibile:', error);
      Utils.showToast('Servizio temporaneamente non disponibile', 'error', 4000);
      return false;
    }
  }

  async processPayment(formData) {
    if (this.isProcessing) {
      Utils.showToast('Pagamento già in corso...', 'warning');
      return false;
    }

    console.log('🚀 Avvio processo di pagamento...');
    
    try {
      this.isProcessing = true;
      
      // Step 1: Prepara dati
      const paymentData = this.preparePaymentData(formData);
      console.log('📋 Dati preparati:', Object.fromEntries(paymentData.entries()));

      // Step 2: Chiamata al backend
      console.log('📡 Invio richiesta al backend...');
      const response = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.ENDPOINTS.checkout}`, {
        method: 'POST',
        body: paymentData // FormData per supportare file upload
      });

      console.log(`📊 Response status: ${response.status}`);

      // Step 3: Gestione risposta
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Errore backend:', errorText);
        
        let errorMessage = 'Errore durante la creazione del pagamento';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Usa messaggio di default se non è JSON
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);

      // Step 4: Validazione risposta
      if (!data.url || !data.sessionId) {
        console.error('❌ Risposta incompleta:', data);
        throw new Error('Risposta del server incompleta');
      }

      // Step 5: Salva session data
      this.sessionData = {
        sessionId: data.sessionId,
        timestamp: Date.now(),
        formData: Object.fromEntries(paymentData.entries())
      };

      // Step 6: Redirect a Stripe
      console.log('🔗 Redirect a Stripe Checkout...');
      Utils.showToast('Reindirizzamento a Stripe...', 'info', 2000);
      
      // Piccolo delay per mostrare il messaggio
      setTimeout(() => {
        window.location.href = data.url;
      }, 500);

      return true;

    } catch (error) {
      console.error('💥 Errore pagamento:', error);
      this.handlePaymentError(error);
      return false;
    } finally {
      // Reset processing dopo un delay per evitare click multipli rapidi
      setTimeout(() => {
        this.isProcessing = false;
      }, 2000);
    }
  }

  preparePaymentData(formData) {
    // Rileva il servizio dalla pagina corrente se non presente
    if (!formData.get('servizio')) {
      const currentPage = window.location.pathname.toLowerCase();
      let servizio = 'parere'; // default
      
      if (currentPage.includes('parere')) servizio = 'parere';
      else if (currentPage.includes('revisione')) servizio = 'revisione';
      else if (currentPage.includes('redazione')) servizio = 'redazione';
      
      formData.set('servizio', servizio);
      console.log(`🎯 Servizio rilevato: ${servizio}`);
    }

    // Aggiungi timestamp per tracking
    formData.set('timestamp', new Date().toISOString());
    
    return formData;
  }

  handlePaymentError(error) {
    let errorMessage = 'Si è verificato un errore durante il pagamento. ';
    
    // Messaggi di errore specifici
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage += 'Controlla la tua connessione internet e riprova.';
    } else if (error.message.includes('500')) {
      errorMessage += 'Problema temporaneo del server. Riprova tra qualche minuto.';
    } else if (error.message.includes('400') || error.message.includes('validation')) {
      errorMessage += 'Verifica che tutti i campi siano compilati correttamente.';
    } else if (error.message.includes('timeout')) {
      errorMessage += 'Richiesta scaduta. Riprova.';
    } else {
      errorMessage += error.message || 'Errore sconosciuto.';
    }

    Utils.showToast(errorMessage, 'error', 6000);
  }

  // Metodo per gestire il ritorno da Stripe (se necessario)
  handleStripeReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      console.log('🎉 Ritorno da Stripe con session:', sessionId);
      // Qui potresti fare verifiche aggiuntive se necessario
    }
  }
}

// ===== FORM ENHANCEMENTS AVANZATI =====
class FormEnhancements {
  constructor() {
    this.forms = Utils.qsa(CONFIG.SELECTORS.forms);
    this.paymentManager = new PaymentManager();
    
    if (this.forms.length) {
      this.init();
    }
  }

  init() {
    this.setupCharacterCounters();
    this.setupFileInputs();
    this.setupFormValidation();
    this.setupRealTimeValidation();
  }

  setupCharacterCounters() {
    const textarea = Utils.qs(CONFIG.SELECTORS.textareas);
    const counter = Utils.qs('#descrizione-counter');
    
    if (!textarea || !counter) return;

    const updateCounter = () => {
      const length = textarea.value.length;
      const maxLength = parseInt(textarea.getAttribute('maxlength')) || 2000;
      const minLength = parseInt(textarea.getAttribute('minlength')) || 50;
      
      counter.textContent = `${length}/${maxLength}`;
      
      // Aggiorna stili basati sulla lunghezza
      counter.classList.remove('text-red-500', 'text-yellow-500', 'text-green-500');
      
      if (length < minLength) {
        counter.classList.add('text-red-500');
        counter.style.color = '#ef4444';
      } else if (length < minLength + 20) {
        counter.classList.add('text-yellow-500');
        counter.style.color = '#f59e0b';
      } else {
        counter.classList.add('text-green-500');
        counter.style.color = '#10b981';
      }
    };

    textarea.addEventListener('input', updateCounter);
    textarea.addEventListener('paste', () => setTimeout(updateCounter, 10));
    updateCounter(); // Initial call
  }

  setupFileInputs() {
    Utils.qsa(CONFIG.SELECTORS.fileInputs).forEach(input => {
      const listContainer = this.createFileList(input);
      
      input.addEventListener('change', () => {
        this.updateFileList(input, listContainer);
      });

      // Drag & drop support
      this.setupDragDrop(input);
    });
  }

  createFileList(input) {
    let list = input.parentNode.querySelector('.file-list');
    
    if (!list) {
      list = document.createElement('ul');
      list.className = 'file-list';
      list.setAttribute('aria-label', 'File selezionati');
      input.parentNode.appendChild(list);
    }
    
    return list;
  }

  updateFileList(input, listContainer) {
    listContainer.innerHTML = '';
    
    Array.from(input.files).forEach((file, index) => {
      const listItem = this.createFileListItem(file, index, input);
      listContainer.appendChild(listItem);
    });

    // Feedback visivo
    if (input.files.length > 0) {
      Utils.showToast(`${input.files.length} file${input.files.length > 1 ? 's' : ''} selezionato${input.files.length > 1 ? 'i' : ''}`, 'success', 2000);
    }
  }

  createFileListItem(file, index, input) {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="file-info">
        <span class="file-name">${file.name}</span>
        <span class="file-size">(${Utils.formatFileSize(file.size)})</span>
      </div>
      <button type="button" class="file-remove" aria-label="Rimuovi ${file.name}">
        ×
      </button>
    `;
    
    li.querySelector('.file-remove').addEventListener('click', () => {
      this.removeFile(input, index);
    });
    
    return li;
  }

  removeFile(input, indexToRemove) {
    const dt = new DataTransfer();
    
    Array.from(input.files).forEach((file, index) => {
      if (index !== indexToRemove) {
        dt.items.add(file);
      }
    });
    
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  setupDragDrop(input) {
    const dropZone = input.parentNode;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      input.files = files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  setupRealTimeValidation() {
    this.forms.forEach(form => {
      // Validazione email
      const emailInputs = Utils.qsa('input[type="email"]', form);
      emailInputs.forEach(input => {
        const validateEmail = Utils.debounce(() => {
          const isValid = Utils.isValidEmail(input.value);
          this.updateFieldValidation(input, isValid || input.value === '');
        }, 500);

        input.addEventListener('input', validateEmail);
        input.addEventListener('blur', validateEmail);
      });

      // Validazione conferma email
      const email2 = Utils.qs('input[name="email2"]', form);
      const email1 = Utils.qs('input[name="email"]', form);
      
      if (email1 && email2) {
        const validateEmailMatch = () => {
          const matches = email1.value === email2.value;
          this.updateFieldValidation(email2, matches || email2.value === '');
        };

        email2.addEventListener('input', Utils.debounce(validateEmailMatch, 300));
        email2.addEventListener('blur', validateEmailMatch);
      }

      // Validazione campi required
      Utils.qsa('input[required], textarea[required], select[required]', form).forEach(field => {
        const validateRequired = () => {
          const isValid = field.value.trim() !== '';
          this.updateFieldValidation(field, isValid);
        };

        field.addEventListener('blur', validateRequired);
      });
    });
  }

  updateFieldValidation(field, isValid) {
    field.classList.remove('input-error', 'input-success');
    
    if (field.value !== '') {
      field.classList.add(isValid ? 'input-success' : 'input-error');
    }
  }

  setupFormValidation() {
    this.forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e, form));
    });
  }

  async handleFormSubmit(e, form) {
    e.preventDefault();
    
    if (!this.validateForm(form)) return;

    const submitBtn = form.querySelector('.submit-btn, button[type="submit"], input[type="submit"]');
    const originalText = submitBtn?.textContent || submitBtn?.value || 'Invia';
    
    try {
      // UI Loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtn.tagName === 'BUTTON') {
          submitBtn.innerHTML = `
            <span>Elaborazione...</span>
            <div class="spinner"></div>
          `;
        } else {
          submitBtn.value = 'Elaborazione...';
        }
      }
      
      // Processa il pagamento
      const formData = new FormData(form);
      const success = await this.paymentManager.processPayment(formData);
      
      if (!success) {
        // Errore già gestito nel PaymentManager
        return;
      }
      
      // Se arriviamo qui, il redirect dovrebbe essere già partito
      // Ma aggiungiamo un fallback
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.tagName === 'BUTTON') {
            submitBtn.textContent = originalText;
          } else {
            submitBtn.value = originalText;
          }
        }
      }, 5000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      Utils.showToast('Errore durante l\'invio. Riprova.', 'error');
      
      // Ripristina UI
      if (submitBtn) {
        submitBtn.disabled = false;
        if (submitBtn.tagName === 'BUTTON') {
          submitBtn.textContent = originalText;
        } else {
          submitBtn.value = originalText;
        }
      }
    }
  }

  validateForm(form) {
    const formData = new FormData(form);
    const errors = [];

    // Validazione email
    const email = formData.get('email');
    const email2 = formData.get('email2');
    
    if (email && email2 && email !== email2) {
      errors.push('Le email non coincidono');
    }

    if (email && !Utils.isValidEmail(email)) {
      errors.push('Email non valida');
    }

    // Validazione descrizione
    const description = formData.get('descrizione');
    if (description && description.length < 50) {
      errors.push('La descrizione deve essere di almeno 50 caratteri');
    }

    // Validazione campi required
    Utils.qsa('[required]', form).forEach(field => {
      if (!field.value.trim()) {
        const label = field.previousElementSibling?.textContent || 
                     field.getAttribute('placeholder') || 
                     field.name || 
                     'Campo obbligatorio';
        errors.push(`${label.replace('*', '')} è obbligatorio`);
      }
    });

    if (errors.length > 0) {
      this.showFormErrors(form, errors);
      return false;
    }

    return true;
  }

  showFormErrors(form, errors) {
    let messageContainer = form.querySelector('.form-message');
    
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'form-message';
      form.appendChild(messageContainer);
    }

    messageContainer.className = 'form-message error';
    messageContainer.style.display = 'block';
    messageContainer.innerHTML = `
      <h4>❌ Correggi questi errori:</h4>
      <ul>
        ${errors.map(error => `<li>${error}</li>`).join('')}
      </ul>
    `;

    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  resetForm(form) {
    form.reset();
    
    // Rimuovi classi di validazione
    Utils.qsa('.input-error, .input-success', form).forEach(field => {
      field.classList.remove('input-error', 'input-success');
    });

    // Reset contatori caratteri
    const counter = form.querySelector('#descrizione-counter');
    if (counter) {
      counter.textContent = '0/2000';
      counter.style.color = '';
    }

    // Reset file lists
    Utils.qsa('.file-list', form).forEach(list => {
      list.innerHTML = '';
    });
  }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
class AccessibilityEnhancements {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupReducedMotion();
    this.setupFocusManagement();
  }

  setupKeyboardNavigation() {
    // Aggiunge supporto keyboard per elementi custom
    Utils.qsa('[role="button"]:not(button)').forEach(element => {
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          element.click();
        }
      });
    });
  }

  setupReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupFocusManagement() {
    // Migliora la visibilità del focus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('using-keyboard');
    });

    // Aggiungi stili CSS per keyboard focus
    const style = document.createElement('style');
    style.textContent = `
      .using-keyboard *:focus {
        outline: 2px solid #0ea5e9 !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// ===== PERFORMANCE OPTIMIZATIONS =====
class PerformanceOptimizations {
  constructor() {
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.setupTouchOptimizations();
    this.setupIntersectionObserver();
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      Utils.qsa('img[data-src]').forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
      });
    }
  }

  setupTouchOptimizations() {
    if ('ontouchstart' in window) {
      // Previene double-tap zoom
      let lastTouchEnd = 0;
      document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, { passive: false });
    }
  }

  setupIntersectionObserver() {
    // Osserva elementi per analytics o altre funzioni
    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Traccia visualizzazione sezione
            const sectionName = entry.target.id || entry.target.className;
            console.log(`Section viewed: ${sectionName}`);
          }
        });
      }, { threshold: 0.5 });

      Utils.qsa('section[id]').forEach(section => {
        sectionObserver.observe(section);
      });
    }
  }
}

// ===== SUCCESS/CANCEL PAGE HANDLER =====
class PaymentResultHandler {
  constructor() {
    this.init();
  }

  init() {
    // Gestisce le pagine di successo e cancellazione
    if (window.location.pathname.includes('success.html')) {
      this.handleSuccess();
    } else if (window.location.pathname.includes('cancel.html')) {
      this.handleCancel();
    }
  }

  handleSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      console.log('🎉 Pagamento completato con successo:', sessionId);
      
      // Salva nel storage per tracciamento
      Utils.storage.set('lastPaymentSession', sessionId);
      Utils.storage.set('lastPaymentDate', new Date().toISOString());
      
      // Mostra notifica di successo
      setTimeout(() => {
        Utils.showToast('Pagamento completato con successo! 🎉', 'success', 5000);
      }, 1000);
      
      // Analytics o tracking
      this.trackPaymentSuccess(sessionId);
    }
  }

  handleCancel() {
    console.log('❌ Pagamento annullato dall\'utente');
    
    // Mostra messaggio informativo
    setTimeout(() => {
      Utils.showToast('Pagamento annullato. Puoi riprovare quando vuoi.', 'info', 4000);
    }, 1000);
    
    // Eventualmente invia notifica al backend
    this.notifyPaymentCancellation();
  }

  trackPaymentSuccess(sessionId) {
    // Qui puoi aggiungere tracking analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: sessionId,
        currency: 'EUR'
      });
    }
  }

  async notifyPaymentCancellation() {
    try {
      // Recupera dati dalla sessione se disponibili
      const lastSession = Utils.storage.get('tempSessionData');
      
      if (lastSession) {
        const sessionData = JSON.parse(lastSession);
        
        await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.ENDPOINTS.cancel}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionData.sessionId,
            email: sessionData.email,
            nome: sessionData.nome
          })
        });
        
        // Pulisci storage
        Utils.storage.set('tempSessionData', '');
      }
    } catch (error) {
      console.warn('Errore notifica cancellazione:', error);
    }
  }
}

// ===== INIZIALIZZAZIONE PRINCIPALE =====
class AvvocaApp {
  constructor() {
    this.components = [];
    this.init();
  }

  async init() {
    // Aspetta che il DOM sia pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initComponents());
    } else {
      this.initComponents();
    }
  }

  initComponents() {
    try {
      // Inizializza tutti i componenti
      this.components = [
        new MobileMenu(),
        new CookieBanner(),
        new SmoothScroll(),
        new ScrollAnimations(),
        new ServiceCards(),
        new FormEnhancements(), // Include PaymentManager
        new PaymentResultHandler(),
        new AccessibilityEnhancements(),
        new PerformanceOptimizations()
      ];

      // Aggiungi stili per componenti
      this.addDynamicStyles();

      // Setup global error handler
      this.setupErrorHandling();

      console.log('✅ Avvocà App inizializzata correttamente');
      console.log('💳 Backend configurato:', BACKEND_CONFIG.BASE_URL);
      
    } catch (error) {
      console.error('❌ Errore nell\'inizializzazione:', error);
      Utils.showToast('Errore nell\'inizializzazione dell\'app', 'error');
    }
  }

  addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Spinner per loading states */
      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-left: 8px;
        display: inline-block;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Drag & Drop states */
      .drag-over {
        border-color: #0ea5e9 !important;
        background-color: rgba(14, 165, 233, 0.05) !important;
        transform: scale(1.02);
        transition: all 0.2s ease;
      }
      
      /* Form validation states */
      .input-error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
      }
      
      .input-success {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
      }
      
      /* Form messages */
      .form-message {
        margin: 1rem 0;
        padding: 1rem;
        border-radius: 0.5rem;
        display: none;
      }
      
      .form-message.error {
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
      }
      
      .form-message.success {
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #16a34a;
      }
      
      .form-message h4 {
        margin: 0 0 0.5rem 0;
        font-weight: 600;
      }
      
      .form-message ul {
        margin: 0;
        padding-left: 1.5rem;
      }
      
      .form-message li {
        margin: 0.25rem 0;
      }
      
      /* File list styling */
      .file-list {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0;
      }
      
      .file-list li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.25rem;
        margin: 0.25rem 0;
      }
      
      .file-info {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      
      .file-name {
        font-weight: 500;
        color: #374151;
      }
      
      .file-size {
        font-size: 0.875rem;
        color: #6b7280;
      }
      
      .file-remove {
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .file-remove:hover {
        background: #dc2626;
      }
      
      /* Loading states */
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      
      .loading-content {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .form-message {
          font-size: 0.875rem;
        }
        
        .file-list li {
          padding: 0.75rem 0.5rem;
        }
        
        .file-info {
          font-size: 0.875rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      Utils.showToast('Si è verificato un errore imprevisto', 'error');
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });

    // Network errors
    window.addEventListener('offline', () => {
      Utils.showToast('Connessione internet persa', 'warning', 0);
    });

    window.addEventListener('online', () => {
      Utils.showToast('Connessione internet ripristinata', 'success');
    });
  }

  // Metodo per cleanup
  destroy() {
    this.components.forEach(component => {
      if (component.destroy && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
  }

  // Debug helper
  getStatus() {
    return {
      components: this.components.length,
      backend: BACKEND_CONFIG.BASE_URL,
      initialized: true,
      timestamp: new Date().toISOString()
    };
  }
}

// ===== UTILITY FUNCTIONS GLOBALI =====
// Funzioni helper esposte globalmente per debug e testing

window.AvvocaDebug = {
  testBackend: async () => {
    const pm = new PaymentManager();
    return await pm.testBackendConnection();
  },
  
  showToast: (message, type) => {
    Utils.showToast(message, type);
  },
  
  getAppStatus: () => {
    return window.avvocaApp ? window.avvocaApp.getStatus() : { error: 'App not initialized' };
  },
  
  forcePaymentTest: async (mockData = {}) => {
    const form = Utils.qs('#serviceForm');
    if (!form) {
      console.error('Form non trovato');
      return;
    }
    
    // Popola form con dati di test
    const testData = {
      nome: 'Test User',
      email: 'test@example.com',
      email2: 'test@example.com',
      macroarea: 'Diritto Civile',
      descrizione: 'Questa è una descrizione di test per verificare il funzionamento del sistema di pagamento. Deve essere di almeno 50 caratteri per passare la validazione.',
      servizio: 'parere',
      ...mockData
    };
    
    Object.keys(testData).forEach(key => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        field.value = testData[key];
      }
    });
    
    console.log('🧪 Test pagamento con dati:', testData);
    form.dispatchEvent(new Event('submit'));
  }
};

// ===== AVVIO APPLICAZIONE =====
const avvocaApp = new AvvocaApp();

// Esponi app per debug
window.avvocaApp = avvocaApp;

// Export per testing (se necessario)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    AvvocaApp, 
    Utils, 
    PaymentManager, 
    FormEnhancements 
  };
}

// Log di inizializzazione
console.log(`
🏛️ AVVOCÀ - Sistema Inizializzato
📧 Backend: ${BACKEND_CONFIG.BASE_URL}
🔧 Debug: window.AvvocaDebug
📱 App: window.avvocaApp
`);

// Test rapido backend all'avvio (solo in development)
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
  setTimeout(() => {
    window.AvvocaDebug.testBackend().then(connected => {
      console.log(connected ? '✅ Backend test: OK' : '❌ Backend test: FAILED');
    });
  }, 2000);
}