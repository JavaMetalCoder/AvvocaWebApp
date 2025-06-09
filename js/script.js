// ===== AVVOCÀ - JAVASCRIPT UNIFICATO COMPLETO ===== //

// Configurazione globale
const CONFIG = {
  backend: {
    // URL del backend - cambia questo per production
    baseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:8080' 
      : 'https://avvoca-backend.onrender.com', // URL del tuo backend in produzione
    endpoints: {
      checkout: '/create-checkout-session',
      health: '/health'
    }
  },
  stripe: {
    // Le chiavi pubbliche possono essere inserite qui o nel backend
    publishableKey: 'pk_test_...' // Inserisci la tua chiave pubblica Stripe se necessario
  },
  validation: {
    minDescriptionLength: 50,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png']
  },
  ui: {
    animationDuration: 300,
    toastDuration: 5000
  }
};

// ===== UTILITY FUNCTIONS ===== //

// Logger con livelli
const Logger = {
  info: (msg, data = null) => {
    console.log(`ℹ️ ${msg}`, data || '');
  },
  error: (msg, error = null) => {
    console.error(`❌ ${msg}`, error || '');
  },
  warning: (msg, data = null) => {
    console.warn(`⚠️ ${msg}`, data || '');
  },
  success: (msg, data = null) => {
    console.log(`✅ ${msg}`, data || '');
  }
};

// Gestione cookie semplificata
const CookieManager = {
  set: (name, value, days = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },
  
  get: (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  
  remove: (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

// Sistema di notifiche toast moderne
const Toast = {
  show: (message, type = 'info', duration = CONFIG.ui.toastDuration) => {
    // Rimuovi toast esistenti
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Mostra toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Rimuovi automaticamente
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), CONFIG.ui.animationDuration);
    }, duration);
    
    return toast;
  }
};

// Gestione loading overlay
const LoadingManager = {
  show: (message = 'Elaborazione in corso...') => {
    const existing = document.getElementById('loadingOverlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div style="text-align: center; color: #374151;">
        <div class="loading-spinner"></div>
        <div style="margin-top: 1rem; font-weight: 500;">${message}</div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    setTimeout(() => overlay.style.opacity = '1', 50);
  },
  
  hide: () => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), CONFIG.ui.animationDuration);
    }
  }
};

// ===== FORM VALIDATION SYSTEM ===== //

const FormValidator = {
  rules: {
    required: (value, fieldName) => {
      if (!value || value.trim() === '') {
        return `Il campo ${fieldName} è obbligatorio`;
      }
      return null;
    },
    
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Inserisci un indirizzo email valido';
      }
      return null;
    },
    
    emailMatch: (value, compareValue) => {
      if (value !== compareValue) {
        return 'Le email non coincidono';
      }
      return null;
    },
    
    minLength: (value, minLength) => {
      if (value.length < minLength) {
        return `Minimo ${minLength} caratteri richiesti`;
      }
      return null;
    },
    
    maxLength: (value, maxLength) => {
      if (value.length > maxLength) {
        return `Massimo ${maxLength} caratteri consentiti`;
      }
      return null;
    }
  },
  
  validateField: (field, customRules = []) => {
    const value = field.value.trim();
    const fieldName = field.getAttribute('aria-label') || 
                     field.closest('.form-group')?.querySelector('label')?.textContent?.replace('*', '').trim() ||
                     field.name;
    
    // Rimuovi errori precedenti
    FormValidator.clearFieldError(field);
    
    let error = null;
    
    // Validazioni base
    if (field.hasAttribute('required') && field.type !== 'file') {
      error = FormValidator.rules.required(value, fieldName);
      if (error) return FormValidator.showFieldError(field, error);
    }
    
    if (field.type === 'email' && value) {
      error = FormValidator.rules.email(value);
      if (error) return FormValidator.showFieldError(field, error);
    }
    
    if (field.hasAttribute('minlength') && value) {
      const minLength = parseInt(field.getAttribute('minlength'));
      error = FormValidator.rules.minLength(value, minLength);
      if (error) return FormValidator.showFieldError(field, error);
    }
    
    if (field.hasAttribute('maxlength') && value) {
      const maxLength = parseInt(field.getAttribute('maxlength'));
      error = FormValidator.rules.maxLength(value, maxLength);
      if (error) return FormValidator.showFieldError(field, error);
    }
    
    // Validazioni personalizzate
    for (const rule of customRules) {
      error = rule(value, field);
      if (error) return FormValidator.showFieldError(field, error);
    }
    
    return true;
  },
  
  showFieldError: (field, message) => {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    const container = field.closest('.form-group') || field.parentNode;
    container.appendChild(errorElement);
    
    return false;
  },
  
  clearFieldError: (field) => {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    
    const container = field.closest('.form-group') || field.parentNode;
    const existingError = container.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  },
  
  validateForm: (form) => {
    const fields = form.querySelectorAll('input:not([type="hidden"]), textarea, select');
    let isValid = true;
    let firstErrorField = null;
    
    fields.forEach(field => {
      const customRules = [];
      
      // Regola personalizzata per conferma email
      if (field.name === 'email2') {
        const emailField = form.querySelector('input[name="email"]');
        if (emailField) {
          customRules.push((value) => FormValidator.rules.emailMatch(value, emailField.value));
        }
      }
      
      const fieldValid = FormValidator.validateField(field, customRules);
      if (!fieldValid) {
        isValid = false;
        if (!firstErrorField) {
          firstErrorField = field;
        }
      }
    });
    
    // Validazione checkbox privacy
    const privacyCheckbox = form.querySelector('input[name="privacy"]');
    if (privacyCheckbox && !privacyCheckbox.checked) {
      Toast.show('Devi accettare la Privacy Policy per continuare', 'error');
      if (!firstErrorField) {
        firstErrorField = privacyCheckbox;
      }
      isValid = false;
    }
    
    // Focus sul primo errore
    if (firstErrorField) {
      firstErrorField.focus();
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return isValid;
  }
};

// ===== FILE UPLOAD MANAGER ===== //

const FileManager = {
  init: (input) => {
    const container = input.closest('.file-group');
    if (!container) return;
    
    const dropZone = container.querySelector('.file-drop-zone');
    if (!dropZone) return;
    
    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, FileManager.preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });
    
    dropZone.addEventListener('drop', (e) => FileManager.handleDrop(e, input), false);
    
    // File selection
    input.addEventListener('change', (e) => FileManager.handleFiles(e.target.files, input));
  },
  
  preventDefaults: (e) => {
    e.preventDefault();
    e.stopPropagation();
  },
  
  handleDrop: (e, input) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    FileManager.handleFiles(files, input);
  },
  
  handleFiles: (files, input) => {
    const container = input.closest('.file-group');
    const validFiles = [];
    
    // Validazione file
    Array.from(files).forEach(file => {
      const errors = FileManager.validateFile(file);
      if (errors.length === 0) {
        validFiles.push(file);
      } else {
        errors.forEach(error => Toast.show(error, 'error'));
      }
    });
    
    if (validFiles.length === 0) return;
    
    // Limita numero file
    if (validFiles.length > CONFIG.validation.maxFiles) {
      Toast.show(`Massimo ${CONFIG.validation.maxFiles} file consentiti`, 'warning');
      validFiles.splice(CONFIG.validation.maxFiles);
    }
    
    // Aggiorna input
    const dt = new DataTransfer();
    validFiles.forEach(file => dt.items.add(file));
    input.files = dt.files;
    
    // Mostra lista file
    FileManager.displayFileList(validFiles, container);
    
    Logger.success(`${validFiles.length} file caricati correttamente`);
  },
  
  validateFile: (file) => {
    const errors = [];
    
    // Dimensione
    if (file.size > CONFIG.validation.maxFileSize) {
      errors.push(`File "${file.name}" troppo grande (max 10MB)`);
    }
    
    // Tipo
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!CONFIG.validation.allowedFileTypes.includes(extension)) {
      errors.push(`Tipo file "${extension}" non supportato per "${file.name}"`);
    }
    
    return errors;
  },
  
  displayFileList: (files, container) => {
    let listElement = container.querySelector('.file-list');
    if (!listElement) {
      listElement = document.createElement('ul');
      listElement.className = 'file-list';
      container.appendChild(listElement);
    }
    
    listElement.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${file.name} (${FileManager.formatFileSize(file.size)})</span>
        <button type="button" class="file-remove" onclick="FileManager.removeFile(${index}, this)">×</button>
      `;
      listElement.appendChild(li);
    });
  },
  
  removeFile: (index, button) => {
    const container = button.closest('.file-group');
    const input = container.querySelector('input[type="file"]');
    
    const dt = new DataTransfer();
    Array.from(input.files).forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });
    
    input.files = dt.files;
    FileManager.displayFileList(input.files, container);
    
    if (input.files.length === 0) {
      const fileList = container.querySelector('.file-list');
      if (fileList) fileList.remove();
    }
  },
  
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
};

// ===== CHARACTER COUNTERS ===== //

const CharacterCounter = {
  init: (textarea) => {
    const maxLength = parseInt(textarea.getAttribute('maxlength'));
    if (!maxLength) return;
    
    const container = textarea.closest('.form-group');
    if (!container) return;
    
    let counter = container.querySelector('.char-count span');
    if (!counter) {
      // Cerca pattern esistente o crea nuovo
      const existingCounter = container.querySelector('[id$="-counter"]');
      if (existingCounter) {
        counter = existingCounter;
      } else {
        const counterDiv = document.createElement('div');
        counterDiv.className = 'char-count';
        counterDiv.innerHTML = `<span>0/${maxLength}</span>`;
        counter = counterDiv.querySelector('span');
        
        // Inserisci dopo il textarea
        const fieldHelp = container.querySelector('.field-help');
        if (fieldHelp) {
          fieldHelp.parentNode.insertBefore(counterDiv, fieldHelp);
        } else {
          container.appendChild(counterDiv);
        }
      }
    }
    
    const updateCounter = () => {
      const currentLength = textarea.value.length;
      counter.textContent = `${currentLength}/${maxLength}`;
      
      const counterContainer = counter.closest('.char-count');
      if (currentLength > maxLength * 0.9) {
        counterContainer.classList.add('warning');
      } else {
        counterContainer.classList.remove('warning');
      }
      
      if (currentLength > maxLength) {
        counterContainer.classList.add('error');
      } else {
        counterContainer.classList.remove('error');
      }
    };
    
    textarea.addEventListener('input', updateCounter);
    textarea.addEventListener('paste', () => setTimeout(updateCounter, 10));
    updateCounter(); // Inizializza
  }
};

// ===== MOBILE MENU ===== //

const MobileMenu = {
  init: () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (!hamburger || !navLinks) return;
    
    hamburger.addEventListener('click', MobileMenu.toggle);
    
    if (overlay) {
      overlay.addEventListener('click', MobileMenu.close);
    }
    
    // Chiudi menu su link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', MobileMenu.close);
    });
    
    // Chiudi su Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') MobileMenu.close();
    });
  },
  
  toggle: () => {
    const hamburger = document.querySelector('.hamburger');
    const isOpen = hamburger.classList.contains('active');
    
    if (isOpen) {
      MobileMenu.close();
    } else {
      MobileMenu.open();
    }
  },
  
  open: () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.mobile-overlay');
    
    hamburger.classList.add('active');
    navLinks.classList.add('active');
    if (overlay) overlay.classList.add('active');
    
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  },
  
  close: () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.mobile-overlay');
    
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
};

// ===== COOKIE BANNER ===== //

const CookieBanner = {
  init: () => {
    const banner = document.querySelector('.cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    
    if (!banner) return;
    
    // Mostra banner se non accettato
    if (!CookieManager.get('cookies_accepted')) {
      setTimeout(() => {
        banner.style.display = 'flex';
        banner.classList.remove('hide');
      }, 2000);
    }
    
    if (acceptBtn) {
      acceptBtn.addEventListener('click', CookieBanner.accept);
    }
  },
  
  accept: () => {
    const banner = document.querySelector('.cookie-banner');
    
    CookieManager.set('cookies_accepted', 'true', 365);
    
    if (banner) {
      banner.classList.add('hide');
      setTimeout(() => {
        banner.style.display = 'none';
      }, CONFIG.ui.animationDuration);
    }
    
    Logger.info('Cookie accettati');
  }
};

// ===== STRIPE PAYMENT INTEGRATION ===== //

const PaymentManager = {
  processing: false,
  
  async processPayment(formData, files) {
    if (PaymentManager.processing) {
      Toast.show('Pagamento già in corso...', 'warning');
      return;
    }
    
    PaymentManager.processing = true;
    LoadingManager.show('Creazione sessione di pagamento...');
    
    try {
      // Rileva il tipo di servizio dalla URL o dal form
      const servizio = PaymentManager.detectService();
      Logger.info(`Servizio rilevato: ${servizio}`);
      
      // Prepara FormData per l'invio
      const submitData = new FormData();
      
      // Aggiungi tutti i campi del form
      for (const [key, value] of Object.entries(formData)) {
        if (value !== null && value !== undefined) {
          submitData.append(key, value);
        }
      }
      
      // Aggiungi il servizio
      submitData.append('servizio', servizio);
      
      // Aggiungi file se presenti
      if (files && files.length > 0) {
        Array.from(files).forEach(file => {
          submitData.append('documenti', file);
        });
        Logger.info(`${files.length} file aggiunti alla richiesta`);
      }
      
      // Chiamata al backend per creare sessione Stripe
      const response = await fetch(`${CONFIG.backend.baseUrl}${CONFIG.backend.endpoints.checkout}`, {
        method: 'POST',
        body: submitData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Errore di comunicazione' }));
        throw new Error(errorData.error || `Errore HTTP ${response.status}`);
      }
      
      const { url, sessionId } = await response.json();
      
      if (!url) {
        throw new Error('URL di pagamento non ricevuto dal server');
      }
      
      Logger.success('Sessione di pagamento creata, reindirizzamento a Stripe...');
      LoadingManager.hide();
      
      // Reindirizza a Stripe Checkout
      window.location.href = url;
      
    } catch (error) {
      Logger.error('Errore durante il pagamento:', error);
      LoadingManager.hide();
      
      let errorMessage = 'Si è verificato un errore durante la creazione del pagamento.';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Problema di connessione. Verifica la tua connessione internet e riprova.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show(errorMessage, 'error', 8000);
      
    } finally {
      PaymentManager.processing = false;
    }
  },
  
  detectService() {
    // Prima prova a rilevare dalla URL
    const path = window.location.pathname.toLowerCase();
    if (path.includes('parere')) return 'parere';
    if (path.includes('revisione')) return 'revisione';
    if (path.includes('redazione')) return 'redazione';
    
    // Prova dal campo del form se presente
    const serviceField = document.querySelector('input[name="servizio"]');
    if (serviceField && serviceField.value) {
      return serviceField.value;
    }
    
    // Prova dal titolo della pagina
    const title = document.title.toLowerCase();
    if (title.includes('parere')) return 'parere';
    if (title.includes('revisione')) return 'revisione';
    if (title.includes('redazione')) return 'redazione';
    
    // Default
    Logger.warning('Servizio non rilevato, uso default: parere');
    return 'parere';
  }
};

// ===== FORM SUBMISSION HANDLER ===== //

const FormHandler = {
  init: () => {
    const serviceForm = document.getElementById('serviceForm');
    if (!serviceForm) return;
    
    serviceForm.addEventListener('submit', FormHandler.handleSubmit);
    
    // Inizializza validazione real-time
    const fields = serviceForm.querySelectorAll('input:not([type="hidden"]), textarea, select');
    fields.forEach(field => {
      // Validazione on blur
      field.addEventListener('blur', () => {
        if (field.value.trim() || field.type === 'email') {
          FormValidator.validateField(field);
        }
      });
      
      // Rimuovi errori on input
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          FormValidator.clearFieldError(field);
        }
      });
    });
    
    Logger.info('Form handler inizializzato');
  },
  
  async handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('.submit-btn');
    
    Logger.info('Invio form iniziato');
    
    try {
      // Disabilita pulsante
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.6';
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="loading-spinner" style="width: 20px; height: 20px; margin-right: 8px;"></span>Elaborazione...';
      }
      
      // Validazione completa
      if (!FormValidator.validateForm(form)) {
        Logger.warning('Validazione form fallita');
        return;
      }
      
      // Raccogli dati del form
      const formData = FormHandler.collectFormData(form);
      Logger.info('Dati form raccolti:', Object.keys(formData));
      
      // Raccogli file
      const fileInput = form.querySelector('input[type="file"]');
      const files = fileInput ? fileInput.files : null;
      
      // Avvia processo di pagamento
      await PaymentManager.processPayment(formData, files);
      
    } catch (error) {
      Logger.error('Errore durante l\'invio:', error);
      Toast.show('Si è verificato un errore. Riprova.', 'error');
      
    } finally {
      // Riabilita pulsante
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
        const servizio = PaymentManager.detectService();
        const icon = servizio === 'parere' ? '💳' : servizio === 'revisione' ? '🔍' : '✒️';
        submitButton.innerHTML = `<span class="submit-icon">${icon}</span>Procedi al Pagamento Sicuro`;
      }
    }
  },
  
  collectFormData(form) {
    const formData = {};
    const inputs = form.querySelectorAll('input:not([type="file"]), textarea, select');
    
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        formData[input.name] = input.checked;
      } else if (input.type === 'radio') {
        if (input.checked) {
          formData[input.name] = input.value;
        }
      } else {
        formData[input.name] = input.value.trim();
      }
    });
    
    // Rimuovi campi vuoti (eccetto checkbox)
    Object.keys(formData).forEach(key => {
      if (formData[key] === '' && typeof formData[key] !== 'boolean') {
        delete formData[key];
      }
    });
    
    return formData;
  }
};

// ===== SMOOTH SCROLLING ===== //

const SmoothScroll = {
  init: () => {
    // Gestisce link interni con smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', SmoothScroll.handleClick);
    });
  },
  
  handleClick(e) {
    const href = e.target.getAttribute('href');
    if (!href || href === '#') return;
    
    const target = document.querySelector(href);
    if (!target) return;
    
    e.preventDefault();
    
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const targetPosition = target.offsetTop - headerHeight - 20;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
};

// ===== INTERSECTION OBSERVER ANIMATIONS ===== //

const AnimationManager = {
  init: () => {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
    
    // Elementi da animare
    const elementsToAnimate = document.querySelectorAll('.step, .area-box, .servizio-card, section h2, .process-step, .detail-item');
    elementsToAnimate.forEach(el => {
      observer.observe(el);
    });
  }
};

// ===== FORM IMPROVEMENTS ===== //

const FormImprovements = {
  init: () => {
    // Auto-focus primo campo con errore
    FormImprovements.setupErrorFocus();
    
    // Migliora UX dei select
    FormImprovements.enhanceSelects();
    
    // Auto-save form data
    FormImprovements.setupAutoSave();
    
    // Placeholder animation
    FormImprovements.setupPlaceholderAnimations();
  },
  
  setupErrorFocus: () => {
    // Focus automatico su primo campo con errore
    const firstError = document.querySelector('.field-error');
    if (firstError) {
      const field = firstError.closest('.form-group')?.querySelector('input, textarea, select');
      if (field) {
        setTimeout(() => field.focus(), 100);
      }
    }
  },
  
  enhanceSelects: () => {
    // Miglioramenti per i select
    document.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', () => {
        if (select.value) {
          select.classList.add('has-value');
        } else {
          select.classList.remove('has-value');
        }
      });
      
      // Inizializza stato
      if (select.value) {
        select.classList.add('has-value');
      }
    });
  },
  
  setupAutoSave: () => {
    const form = document.getElementById('serviceForm');
    if (!form) return;
    
    // Auto-save ogni 30 secondi
    let autoSaveTimer;
    
    const saveFormData = () => {
      try {
        const formData = FormHandler.collectFormData(form);
        const saveKey = `formData_${window.location.pathname}`;
        sessionStorage.setItem(saveKey, JSON.stringify(formData));
        Logger.info('Dati form salvati automaticamente');
      } catch (error) {
        Logger.error('Errore auto-save:', error);
      }
    };
    
    const restoreFormData = () => {
      try {
        const saveKey = `formData_${window.location.pathname}`;
        const savedData = sessionStorage.getItem(saveKey);
        
        if (savedData) {
          const formData = JSON.parse(savedData);
          
          Object.keys(formData).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field && formData[key]) {
              if (field.type === 'checkbox') {
                field.checked = formData[key];
              } else {
                field.value = formData[key];
                // Trigger change per select
                if (field.tagName === 'SELECT') {
                  field.dispatchEvent(new Event('change'));
                }
              }
            }
          });
          
          Logger.info('Dati form ripristinati');
        }
      } catch (error) {
        Logger.error('Errore ripristino form:', error);
      }
    };
    
    // Ripristina al caricamento
    restoreFormData();
    
    // Auto-save on input
    form.addEventListener('input', () => {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(saveFormData, 30000); // 30 secondi
    });
    
    // Cancella dati salvati dopo invio
    form.addEventListener('submit', () => {
      const saveKey = `formData_${window.location.pathname}`;
      sessionStorage.removeItem(saveKey);
    });
  },
  
  setupPlaceholderAnimations: () => {
    // Animazioni per placeholder
    document.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('focus', () => {
        field.parentElement.classList.add('focused');
      });
      
      field.addEventListener('blur', () => {
        if (!field.value) {
          field.parentElement.classList.remove('focused');
        }
      });
      
      // Inizializza stato
      if (field.value) {
        field.parentElement.classList.add('focused');
      }
    });
  }
};

// ===== ACCESSIBILITY IMPROVEMENTS ===== //

const AccessibilityManager = {
  init: () => {
    AccessibilityManager.setupKeyboardNavigation();
    AccessibilityManager.setupScreenReaderSupport();
    AccessibilityManager.setupFocusManagement();
    AccessibilityManager.setupAriaSupport();
  },
  
  setupKeyboardNavigation: () => {
    // Escape chiude menu mobile
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        MobileMenu.close();
        
        // Chiudi anche eventuali toast
        const toasts = document.querySelectorAll('.toast');
        toasts.forEach(toast => toast.remove());
      }
    });
    
    // Tab trap per menu mobile
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      navLinks.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && navLinks.classList.contains('active')) {
          const focusableElements = navLinks.querySelectorAll('a, button');
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
      });
    }
    
    // Enter su card servizi (se presenti nella homepage)
    document.querySelectorAll('.servizio-card').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  },
  
  setupScreenReaderSupport: () => {
    // Annunci per screen reader
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.id = 'announcer';
    document.body.appendChild(announcer);
    
    window.announceToScreenReader = (message) => {
      announcer.textContent = message;
      setTimeout(() => announcer.textContent = '', 1000);
    };
    
    // Annunci per cambio stato form
    const form = document.getElementById('serviceForm');
    if (form) {
      form.addEventListener('submit', () => {
        window.announceToScreenReader('Elaborazione pagamento in corso...');
      });
    }
  },
  
  setupFocusManagement: () => {
    // Skip links
    const skipLinks = document.querySelectorAll('.skip-to-content');
    skipLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
    
    // Focus management per toast
    let lastFocusedElement = null;
    
    window.addEventListener('beforeunload', () => {
      lastFocusedElement = document.activeElement;
    });
  },
  
  setupAriaSupport: () => {
    // Aggiorna aria-expanded per hamburger
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
      hamburger.setAttribute('aria-expanded', 'false');
    }
    
    // Aggiorna aria-invalid per campi con errori
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('error')) {
        e.target.setAttribute('aria-invalid', 'true');
      } else {
        e.target.removeAttribute('aria-invalid');
      }
    });
    
    // Descrizioni aria per form
    const form = document.getElementById('serviceForm');
    if (form) {
      const submitBtn = form.querySelector('.submit-btn');
      if (submitBtn && !submitBtn.getAttribute('aria-describedby')) {
        const helpText = form.querySelector('.form-submit .field-help');
        if (helpText) {
          const descId = 'submit-description';
          helpText.id = descId;
          submitBtn.setAttribute('aria-describedby', descId);
        }
      }
    }
  }
};

// ===== PERFORMANCE MONITORING ===== //

const PerformanceMonitor = {
  init: () => {
    // Monitora performance di caricamento
    window.addEventListener('load', () => {
      setTimeout(() => {
        if ('performance' in window) {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            Logger.info(`Pagina caricata in ${Math.round(loadTime)}ms`);
            
            // Invia metriche se configurato
            if (typeof gtag !== 'undefined') {
              gtag('event', 'page_load_time', {
                value: Math.round(loadTime),
                event_category: 'Performance'
              });
            }
          }
        }
      }, 0);
    });
    
    // Monitora errori JavaScript
    window.addEventListener('error', (e) => {
      Logger.error('JavaScript Error:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
      
      // Invia a analytics se configurato
      if (typeof gtag !== 'undefined') {
        gtag('event', 'javascript_error', {
          event_category: 'Error',
          event_label: e.message,
          value: 1
        });
      }
    });
    
    // Monitora errori di rete
    window.addEventListener('unhandledrejection', (e) => {
      Logger.error('Unhandled Promise Rejection:', e.reason);
    });
  }
};

// ===== SERVICE CARD INTERACTIONS (per homepage) ===== //

const ServiceCards = {
  init: () => {
    const serviceCards = document.querySelectorAll('.servizio-card');
    
    serviceCards.forEach(card => {
      card.addEventListener('click', ServiceCards.handleCardClick);
      card.addEventListener('keydown', ServiceCards.handleCardKeydown);
    });
  },
  
  handleCardClick(e) {
    const card = e.currentTarget;
    const cardTitle = card.querySelector('h3')?.textContent || '';
    
    let targetPage = '';
    if (cardTitle.includes('Parere')) {
      targetPage = 'pages/parere.html';
    } else if (cardTitle.includes('Revisione')) {
      targetPage = 'pages/revisione.html';
    } else if (cardTitle.includes('Redazione')) {
      targetPage = 'pages/redazione.html';
    }
    
    if (targetPage) {
      window.location.href = targetPage;
    }
  },
  
  handleCardKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.click();
    }
  }
};

// ===== UTILITY FUNCTIONS ===== //

const Utils = {
  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },
  
  // Detect mobile
  isMobile: () => {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Get query params
  getQueryParam: (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },
  
  // Scroll to element
  scrollToElement: (element, offset = 0) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (element) {
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const elementPosition = element.offsetTop - headerHeight - offset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }
};

// ===== MAIN APPLICATION CLASS ===== //

class AvvocaApp {
  constructor() {
    this.initialized = false;
    this.isServicePage = this.detectServicePage();
  }
  
  detectServicePage() {
    return !!document.getElementById('serviceForm');
  }
  
  async init() {
    if (this.initialized) return;
    
    try {
      Logger.info('🚀 Inizializzazione Avvocà App...');
      
      // Inizializzazioni sincrone base
      MobileMenu.init();
      CookieBanner.init();
      SmoothScroll.init();
      AccessibilityManager.init();
      PerformanceMonitor.init();
      
      // Inizializzazioni per homepage
      if (!this.isServicePage) {
        ServiceCards.init();
      }
      
      // Inizializzazioni per le pagine di servizio
      if (this.isServicePage) {
        FormHandler.init();
        FormImprovements.init();
        
        // Inizializza componenti form
        document.querySelectorAll('input[type="file"]').forEach(FileManager.init);
        document.querySelectorAll('textarea[maxlength]').forEach(CharacterCounter.init);
        
        Logger.info('Componenti form inizializzati');
      }
      
      // Animazioni solo se supportate
      if ('IntersectionObserver' in window) {
        AnimationManager.init();
      }
      
      // Test connessione backend (solo per pagine servizio)
      if (this.isServicePage) {
        await this.testBackendConnection();
      }
      
      // Setup event listeners globali
      this.setupGlobalEventListeners();
      
      this.initialized = true;
      Logger.success('✅ Avvocà App inizializzata correttamente');
      
      // Notifica pronta per screen reader
      if (window.announceToScreenReader) {
        window.announceToScreenReader('Applicazione caricata');
      }
      
    } catch (error) {
      Logger.error('❌ Errore durante l\'inizializzazione:', error);
    }
  }
  
  async testBackendConnection() {
    try {
      const response = await fetch(`${CONFIG.backend.baseUrl}${CONFIG.backend.endpoints.health}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        Logger.success('Backend connesso:', data.status);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      Logger.warning('Backend non raggiungibile:', error.message);
      // Non bloccare l'app se il backend non è raggiungibile
    }
  }
  
  setupGlobalEventListeners() {
    // Resize handler con throttle
    window.addEventListener('resize', Utils.throttle(() => {
      // Chiudi menu mobile su resize
      if (window.innerWidth > 768) {
        MobileMenu.close();
      }
      
      // Aggiorna layout se necessario
      this.handleResize();
    }, 250));
    
    // Scroll handler per effetti
    window.addEventListener('scroll', Utils.throttle(() => {
      this.handleScroll();
    }, 100));
    
    // Beforeunload per cleanup
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
    
    // Online/offline detection
    window.addEventListener('online', () => {
      Toast.show('Connessione ripristinata', 'success', 3000);
    });
    
    window.addEventListener('offline', () => {
      Toast.show('Connessione persa. Controlla la tua rete.', 'warning', 5000);
    });
  }
  
  handleResize() {
    // Aggiorna dimensioni elementi se necessario
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  handleScroll() {
    // Effetti scroll se necessari
    const scrollY = window.scrollY;
    
    // Header shadow on scroll
    const header = document.querySelector('header');
    if (header) {
      if (scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }
  
  cleanup() {
    // Cleanup necessario prima dell'unload
    Logger.info('Cleanup applicazione...');
    
    // Ferma timer attivi
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    // Rimuovi event listeners globali se necessario
    // (Gli event listeners si puliscono automaticamente)
  }
  
  // Metodi pubblici per interazione esterna
  showNotification(message, type = 'info') {
    Toast.show(message, type);
  }
  
  validateCurrentForm() {
    const form = document.getElementById('serviceForm');
    if (form) {
      return FormValidator.validateForm(form);
    }
    return true;
  }
  
  getFormData() {
    const form = document.getElementById('serviceForm');
    if (form) {
      return FormHandler.collectFormData(form);
    }
    return {};
  }
}

// ===== GLOBAL ERROR HANDLER ===== //

window.addEventListener('error', (e) => {
  Logger.error('Global Error:', e.error);
  
  // Mostra errore user-friendly solo se non è un errore di rete
  if (!e.error?.message?.includes('fetch')) {
    Toast.show('Si è verificato un errore. Ricarica la pagina se il problema persiste.', 'error');
  }
});

// ===== AUTO-INITIALIZATION ===== //

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new AvvocaApp();
    app.init().catch(error => {
      Logger.error('Errore inizializzazione app:', error);
    });
    
    // Rendi disponibile globalmente per debug
    window.AvvocaApp = app;
  });
} else {
  // DOM già caricato
  const app = new AvvocaApp();
  app.init().catch(error => {
    Logger.error('Errore inizializzazione app:', error);
  });
  
  // Rendi disponibile globalmente per debug
  window.AvvocaApp = app;
}

// ===== EXPOSE GLOBAL UTILITIES ===== //

// Esporta utilities per uso globale se necessario
window.AvvocaUtils = {
  Toast,
  Logger,
  FormValidator,
  LoadingManager,
  CookieManager,
  Utils,
  PaymentManager
};

// ===== DEVELOPMENT HELPERS ===== //

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Helper per development
  window.dev = {
    testToast: (type = 'info') => Toast.show(`Test notification ${type}`, type),
    testValidation: () => {
      const form = document.getElementById('serviceForm');
      if (form) return FormValidator.validateForm(form);
      return 'No form found';
    },
    testPayment: () => {
      const form = document.getElementById('serviceForm');
      if (form) {
        const formData = FormHandler.collectFormData(form);
        Logger.info('Form data:', formData);
        return formData;
      }
      return 'No form found';
    },
    showLoadingManager: () => LoadingManager.show('Test loading...'),
    hideLoadingManager: () => LoadingManager.hide(),
    config: CONFIG
  };
  
  Logger.info('🛠️ Development helpers available in window.dev');
}