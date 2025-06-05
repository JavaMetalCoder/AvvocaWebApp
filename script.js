// SMOOTH SCROLL NAV
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if(target) {
          window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
        }
      });
    });
  });
  
  // FORM HANDLING
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('consultationForm');
    if(!form) return;
    const msgBox = document.querySelector('.form-message');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      msgBox.style.display = 'none';
      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      const descrizione = form.descrizione.value.trim();
      const servizio = form.servizio.value;
      let error = [];
      if(nome.length < 2) error.push('Inserisci il tuo nome.');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error.push('Email non valida.');
      if(descrizione.length < 15) error.push('Descrizione troppo breve.');
      if(!servizio) error.push('Scegli un servizio.');
      if(error.length) {
        msgBox.textContent = error.join(' ');
        msgBox.style.background = '#fef2f2'; msgBox.style.color = '#dc2626';
        msgBox.style.display = 'block';
        return;
      }
      msgBox.textContent = 'Richiesta inviata! Riceverai risposta entro 24/48h.';
      msgBox.style.background = '#dcfce7'; msgBox.style.color = '#166534';
      msgBox.style.display = 'block';
      form.reset();
    });
  });
  