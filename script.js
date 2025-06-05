// ===== GESTIONE FORM CONSULENZE =====
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('consultationForm');
    const submitButton = form.querySelector('.submit-btn');
    const originalButtonText = submitButton.textContent;
    if (!document.querySelector('.form-message')) {
        const messageContainer = document.createElement('div');
        messageContainer.className = 'form-message';
        form.appendChild(messageContainer);
    }
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            nome: form.nome.value.trim(),
            email: form.email.value.trim(),
            telefono: form.telefono.value.trim(),
            area_legale: form.area_legale.value,
            tipo_consulenza: form.tipo_consulenza.value,
            urgenza: form.urgenza.value,
            descrizione: form.descrizione.value.trim()
        };
        if (!validateForm(formData)) return;
        sendConsultationRequest(formData);
    });
    function validateForm(data) {
        const messageContainer = document.querySelector('.form-message');
        messageContainer.innerHTML = '';
        messageContainer.className = 'form-message';
        let errors = [];
        if (!data.nome || data.nome.length < 2) errors.push('Il nome deve essere di almeno 2 caratteri');
        if (!data.email || !isValidEmail(data.email)) errors.push('Inserisci un indirizzo email valido');
        if (!data.area_legale) errors.push('Seleziona l\'area legale di tuo interesse');
        if (!data.tipo_consulenza) errors.push('Scegli il tipo di consulenza');
        if (!data.descrizione || data.descrizione.length < 20) errors.push('Descrivi la tua situazione (almeno 20 caratteri)');
        if (errors.length > 0) {
            showMessage('error', 'Controlla questi campi:', errors);
            return false;
        }
        return true;
    }
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function sendConsultationRequest(data) {
        const messageContainer = document.querySelector('.form-message');
        submitButton.disabled = true;
        submitButton.textContent = 'Invio in corso...';
        setTimeout(() => {
            const success = Math.random() > 0.05;
            if (success) {
                const consultationType = form.tipo_consulenza.options[form.tipo_consulenza.selectedIndex].text;
                showMessage('success', 'Perfetto! Richiesta inviata! 🎉', [
                    `Consulenza richiesta: ${consultationType}`,
                    `Ti contatterò entro 24 ore all'indirizzo: ${data.email}`,
                    'Riceverai presto le istruzioni per il pagamento',
                    'Controlla anche la cartella spam, giusto per sicurezza!'
                ]);
                form.reset();
                messageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                showMessage('error', 'Ops! Problema tecnico 😅', [
                    'C\'è stato un errore nell\'invio',
                    'Riprova tra qualche minuto o scrivimi direttamente via email'
                ]);
            }
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }, 2000);
    }
    function showMessage(type, title, messages) {
        const messageContainer = document.querySelector('.form-message');
        messageContainer.className = `form-message ${type}`;
        let html = `<h4>${title}</h4>`;
        if (Array.isArray(messages)) {
            html += '<ul>';
            messages.forEach(msg => { html += `<li>${msg}</li>`; });
            html += '</ul>';
        } else {
            html += `<p>${messages}</p>`;
        }
        messageContainer.innerHTML = html;
        if (type === 'success') {
            setTimeout(() => {
                messageContainer.style.opacity = '0';
                setTimeout(() => {
                    messageContainer.innerHTML = '';
                    messageContainer.className = 'form-message';
                    messageContainer.style.opacity = '1';
                }, 500);
            }, 10000);
        }
    }
});

// ===== SMOOTH SCROLL =====
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
});

// ===== NAVBAR HIGHLIGHT =====
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    function highlightNav() {
        let current = '';
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === '#' + current ? '#1e3a8a' : '#374151';
        });
    }
    window.addEventListener('scroll', highlightNav);
    highlightNav();
});
