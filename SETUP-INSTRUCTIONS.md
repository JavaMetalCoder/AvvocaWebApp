# 🚀 Guida Setup Completa - Sito Avvocà

## 📋 CHECKLIST PRE-INSTALLAZIONE

- [ ] VS Code installato
- [ ] Git installato (opzionale)
- [ ] Account GitHub creato (per backup)
- [ ] Accesso hosting Aruba (credenziali ricevute)
- [ ] Dominio avvoca.net attivo

## 📁 STEP 1: Organizzazione File

### Crea la struttura cartelle:
```
📁 avvoca-website/
├── 📄 index.html
├── 📄 style.css  
├── 📄 script.js
├── 📄 README.md
├── 📄 .gitignore
├── 📁 assets/
│   ├── logo-avvoca.png (DA AGGIUNGERE)
│   └── foto-avvocato.jpg (DA AGGIUNGERE)
├── 📁 pages/ (DA CREARE)
│   ├── privacy.html
│   ├── termini.html
│   ├── disclaimer.html
│   └── cookies.html
└── 📁 backend/ (DA CREARE)
    └── contact.php
```

### Copia i file forniti:
1. Copia il contenuto di ogni artifact nei rispettivi file
2. Salva tutto nella cartella `avvoca-website`
3. Apri la cartella in VS Code

## 🎨 STEP 2: Personalizzazione Contenuti

### A. Logo e Immagini
1. **Ottieni il logo finale** del brand Avvocà
2. Salvalo come `assets/logo-avvoca.png` (formato PNG, 200x200px)
3. Se hai una foto, salvala come `assets/foto-avvocato.jpg`
4. **Sostituisci nel codice**:

In `index.html`, trova e sostituisci:
```html
<!-- LOGO NAVBAR - Cerca riga ~27 -->
<!-- Da: -->
<div class="logo-img">👨‍💼</div>

<!-- A: -->
<img src="assets/logo-avvoca.png" alt="Avvocà Logo" class="logo-img">

<!-- AVATAR SEZIONE - Cerca riga ~45 -->  
<!-- Da: -->
<div class="avatar">👨‍💼</div>

<!-- A: -->
<img src="assets/foto-avvocato.jpg" alt="Avvocato" class="avatar-photo">
```

### B. Dati Personali
In `index.html`, aggiorna:

**Qualifiche (riga ~48):**
```html
<p>• Avvocato iscritto all'Albo n. [NUMERO]<br>
• Specializzato in [TUE SPECIALIZZAZIONI]<br>
• [ANNI] anni di esperienza<br>
• [NUMERO]+ consulenze positive</p>
```

**Biografia (riga ~55-65):**
- Sostituisci con la tua storia personale
- Mantieni il tono friendly ma professionale

### C. Prezzi Servizi
In `index.html`, aggiorna i prezzi (righe ~85-140):
```html
<div class="prezzo">€[TUO PREZZO]</div>
```

### D. Informazioni di Contatto
In `index.html`, footer (riga ~185):
```html
<p>© 2025 Avvocà - [TUO NOME COMPLETO] • avvoca.net<br>
```

## 🔧 STEP 3: Test Locale

### Apertura in VS Code:
1. Apri VS Code
2. File → Open Folder → Seleziona `avvoca-website`
3. Installa l'estensione "Live Server"
4. Click destro su `index.html` → "Open with Live Server"

### Test Funzionalità:
- [ ] Navigazione smooth tra sezioni
- [ ] Form contatti (attualmente simulazione)
- [ ] Design responsive (F12 → toggle device)
- [ ] Hover effects su servizi e bottoni

## 🌐 STEP 4: Deploy su Aruba

### A. Accesso Pannello Aruba
1. Vai su `managehosting.aruba.it`
2. Login con:
   - **Username**: 16584421@aruba.it
   - **Password**: Pippo2007.

### B. Upload File
1. Nel pannello, vai su "File Manager"
2. Naviga alla cartella `public_html` o `htdocs`
3. **Upload tutti i file**:
   - index.html
   - style.css
   - script.js
   - cartella assets/ (se hai immagini)

### C. Test Online
1. Vai su `avvoca.net`
2. Verifica che tutto funzioni
3. Testa su mobile

## 📧 STEP 5: Email Professionali

### Creazione Caselle Email:
1. Nel pannello Aruba → "Gestione Email"
2. Crea queste caselle:
   - `info@avvoca.net` (principale)
   - `consulenze@avvoca.net` (form contatti)
   - `[tuonome]@avvoca.net` (personale)

### Configurazione Outlook/Gmail:
- **Server IMAP**: mail.avvoca.net
- **Porta**: 993 (SSL)
- **Server SMTP**: mail.avvoca.net  
- **Porta**: 465 (SSL)

## 🔨 STEP 6: Funzionalità Avanzate

### A. Form Contatti Funzionante
Crea il file `backend/contact.php`:
```php
<?php
if ($_POST) {
    $nome = $_POST['nome'];
    $email = $_POST['email'];
    $messaggio = $_POST['descrizione'];
    
    $to = "info@avvoca.net";
    $subject = "Nuova richiesta consulenza";
    $body = "Nome: $nome\nEmail: $email\nMessaggio: $messaggio";
    
    if (mail($to, $subject, $body)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
}
?>
```

Poi in `script.js`, sostituisci la simulazione (riga ~80) con:
```javascript
fetch('backend/contact.php', {
    method: 'POST',
    body: new FormData(form)
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        showMessage('success', 'Messaggio inviato!', ['Ti contatteremo presto']);
    } else {
        showMessage('error', 'Errore invio', ['Riprova più tardi']);
    }
});
```

### B. Documenti Legali
Crea le pagine mancanti in `pages/`:
- `privacy.html` - Privacy Policy GDPR compliant
- `termini.html` - Termini e condizioni servizio
- `disclaimer.html` - Disclaimer uso AI
- `cookies.html` - Cookie Policy

## 🔒 STEP 7: Setup GitHub (Backup)

### Inizializzazione Repository:
```bash
cd avvoca-website
git init
git add .
git commit -m "Initial commit - Sito Avvocà v1.0"
```

### Collegamento GitHub:
1. Crea repository su GitHub.com
2. Collega il repository:
```bash
git remote add origin https://github.com/[username]/avvoca-website.git
git push -u origin main
```

### Aggiornamenti Futuri:
```bash
git add .
git commit -m "Descrizione modifiche"
git push
```

## ✅ CHECKLIST FINALE

### Pre-Launch:
- [ ] Tutti i file caricati su Aruba
- [ ] Sito accessibile da avvoca.net
- [ ] Form contatti funzionante
- [ ] Email professionali attive
- [ ] Test su desktop e mobile
- [ ] Backup su GitHub

### Post-Launch:
- [ ] Google Analytics configurato
- [ ] Google My Business creato
- [ ] SEO base ottimizzato
- [ ] Social media collegati
- [ ] Sistema pagamenti (fase 2)

## 🆘 RISOLUZIONE PROBLEMI

### Sito non si carica:
- Verifica che i file siano in `public_html`
- Controlla che `index.html` sia nella root
- Verifica DNS dominio (può richiedere 24h)

### Form non funziona:
- Controlla che `contact.php` sia caricato
- Verifica configurazione email su Aruba
- Testa invio da webmail Aruba

### Email non arrivano:
- Controlla cartella spam
- Verifica configurazione SMTP
- Testa invio manuale da pannello Aruba

## 📞 SUPPORTO

### Aruba Support:
- Tel: 0575 862 300
- Email: hosting@staff.aruba.it
- Pannello: ticket di supporto

### Documentazione:
- [Guida Aruba Hosting](https://guide.aruba.it/hosting)
- [PHP Mail Function](https://www.php.net/manual/en/function.mail.php)

---

**🎯 Obiettivo**: Sito Avvocà online e funzionante entro 24 ore!**