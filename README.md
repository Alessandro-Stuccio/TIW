# Agenzia di Missioni Urbane

Applicazione web full-stack sviluppata per il corso di **Tecnologie Informatiche per il Web**. 
L'applicazione permette agli utenti di esplorare la città completando missioni urbane e inviando prove (testuali o fotografiche). I moderatori e gli amministratori verificano i completamenti, assegnando punti e badge visibili in una classifica pubblica aggiornata in tempo reale.

---

## Livelli Implementati

| Livello | Funzionalità |
|---------|--------------|
| **Livello 1** | Registrazione, login, esplorazione missioni, accettazione, prova testuale e punteggio. |
| **Livello 2** | Categorie, stati, verifica moderatori, classifica, badge e filtri. |
| **Livello 3** | Mappa interattiva (Leaflet), upload foto (Multer), aggiornamento real-time (Socket.io). |

---

## Stack Tecnologico

- **Runtime**: Node.js
- **Web Framework**: Express 5
- **Template Engine**: express-handlebars (SSR)
- **Database**: SQLite (via better-sqlite3)
- **Sessioni**: express-session (con connect-sqlite3)
- **Sicurezza**: bcrypt
- **Upload File**: Multer
- **Real-time**: Socket.io
- **Mappe**: Leaflet.js

---

## Installazione e Avvio

1. Posizionati nella cartella del progetto:
   ```bash
   cd missioni-urbane
   ```

2. Configura l'ambiente (modifica il valore di `SESSION_SECRET` nel nuovo file):
   ```bash
   cp .env.example .env
   ```

3. Installa le dipendenze:
   ```bash
   npm install
   ```

4. Crea il database e popola i dati iniziali:
   ```bash
   npm run seed
   ```

5. Avvia il server:
   ```bash
   npm start
   ```

L'applicazione sarà accessibile all'indirizzo: **http://localhost:3000**

---

## Credenziali di Test

| Ruolo | Username | Email | Password |
|-------|----------|-------|----------|
| **Admin** | admin | admin@missioni.it | admin123 |
| **Moderatore** | moderatore1 | mod@missioni.it | mod123 |
| **Utente** | agente_mario | mario@missioni.it | user123 |

---

## Funzionalità per Ruolo

- **Utente (user)**
  - Esplorazione e filtraggio missioni (lista o mappa).
  - Accettazione delle missioni e invio di prove (testo e/o foto).
  - Consultazione della classifica globale e del profilo personale (punti e badge).

- **Moderatore (moderator)**
  - Tutte le funzionalità utente.
  - Accesso alla coda di prove in attesa (`/completions/pending`).
  - Verifica delle prove con possibilità di approvare o rifiutare fornendo un feedback testuale.

- **Admin (admin)**
  - Tutte le funzionalità moderatore.
  - Creazione, modifica e archiviazione delle missioni (`/admin/missions`).
  - Accesso alla dashboard gestionale HQ.

---

## Modello Dati

Le entità principali del database SQLite sono:

- **users**: `id`, `username`, `email`, `password`, `role`, `points`, `created_at`
- **missions**: `id`, `title`, `description`, `location`, `lat`, `lng`, `points`, `difficulty`, `category`, `status` (*attiva*, *archiviata*), `created_by`, `created_at`
- **completions**: `id`, `user_id`, `mission_id`, `status` (*accettata*, *in_attesa*, *completata*, *rifiutata*), `proof_text`, `proof_image`, `feedback`, `verified_by`, `accepted_at`, `verified_at`
- **badges**: `id`, `name`, `description`, `icon`, `condition`
- **user_badges**: `user_id`, `badge_id`, `earned_at`

---

## Struttura del Progetto

```text
missioni-urbane/
├── public/       # File statici (CSS, immagini, script JS per Leaflet e Socket.io)
├── src/          # Codice backend principale
│   ├── db/             # Schema database SQLite e script di seed
│   ├── middleware/     # Controllo accessi (auth) e configurazione upload (Multer)
│   ├── repositories/   # Pattern DAO per interazioni con il database
│   ├── routes/         # Endpoint e logica di routing (auth, completamenti, missioni, admin, users)
│   ├── utils/          # Funzioni e utility generiche (es. validazione)
│   └── server.js       # Entry point Express, Socket.io e Handlebars
├── uploads/      # Directory locale per i file caricati (le foto delle prove)
└── views/        # Template Handlebars (layout, admin, auth, errors, partials)
```
