# Agenzia di Missioni Urbane

Applicazione web full-stack per il corso **Tecnologie Informatiche per il Web**
(085879, Politecnico di Milano).

Gli utenti esplorano la città completando **missioni urbane**: sfide reali che richiedono
di trovare luoghi, scattare foto o descrivere dettagli del mondo fisico. I completamenti
vengono verificati da moderatori e premiati con punti e badge. Una classifica pubblica
aggiornata in tempo reale mostra i migliori agenti.

---

## Livelli implementati

| Livello | Stato | Descrizione |
|---------|-------|-------------|
| **Livello 1** | Completo | Registrazione, login, missioni, accettazione, prova testuale, punteggio |
| **Livello 2** | Completo | Categorie, stati, verifica moderatori, classifica, badge, filtri |
| **Livello 3** | Completo | Mappa interattiva (Leaflet.js), upload foto (Multer), real-time (Socket.io) |

---

## Stack tecnologico

| Strato | Tecnologia |
|--------|------------|
| Runtime | Node.js ≥ 20 |
| Framework HTTP | Express 5 |
| Template engine (SSR) | express-handlebars |
| Database | SQLite tramite better-sqlite3 |
| Sessioni | express-session + connect-sqlite3 |
| Hashing password | bcrypt |
| Upload file | Multer |
| Real-time | Socket.io |
| Mappa interattiva | Leaflet.js (CDN) |

> **Nota tecnica**: non viene usato alcun ORM. Tutte le query al database usano
> prepared statement con better-sqlite3 (API sincrona). Nessun framework di scaffolding.

---

## Prerequisiti

- **Node.js ≥ 20** e **npm ≥ 10**
- Nessun'altra dipendenza di sistema richiesta (SQLite è in-process)

---

## Installazione e avvio

### 1. Clona il repository e spostati nella cartella del progetto

```bash
cd missioni-urbane
```

### 2. Configura le variabili d'ambiente

Copia il file di esempio e personalizzalo:
```bash
cp .env.example .env
```
Modifica `SESSION_SECRET` con una stringa lunga e casuale. `PORT` è opzionale (default: 3000).

### 3. Installa le dipendenze

```bash
npm install
```

### 4. Popola il database con i dati di test

```bash
npm run seed
```

Questo comando crea automaticamente il database SQLite (`src/db/missioni.db`),
le tabelle e inserisce:
- 3 utenti predefiniti (admin, moderatore, utente standard)
- 5 badge sbloccabili
- 6 missioni di esempio distribuite sulla mappa

### 5. Avvia il server

```bash
npm start          # avvio normale
npm run dev        # avvio con hot-reload (node --watch)
```

Il server risponde su **http://localhost:3000** (o sulla porta specificata in `.env`).

---

## Credenziali di test

| Ruolo | Username | Email | Password |
|-------|----------|-------|----------|
| **Admin** | admin | admin@missioni.it | admin123 |
| **Moderatore** | moderatore1 | mod@missioni.it | mod123 |
| **Utente** | agente_mario | mario@missioni.it | user123 |

---

## Struttura del progetto

```
missioni-urbane/
├── public/
│   ├── css/
│   │   ├── main.css              # Variabili, reset, layout
│   │   └── components.css        # Card, bottoni, form, tabelle
│   └── js/
│       ├── map.js                # Mappa Leaflet (carica missioni via fetch)
│       └── leaderboard.js        # Aggiornamento real-time classifica (Socket.io)
├── src/
│   ├── db/
│   │   ├── database.js           # Connessione SQLite, schema, pragma WAL + FK
│   │   └── seed.js               # Dati di test (utenti, badge, missioni)
│   ├── middleware/
│   │   ├── auth.js               # requireAuth, requireAdmin, requireModerator
│   │   └── upload.js             # Configurazione Multer (upload foto prove)
│   ├── repositories/             # Pattern DAO — tutte le query SQL qui
│   │   ├── users.repo.js
│   │   ├── missions.repo.js
│   │   └── completions.repo.js
│   ├── routes/
│   │   ├── auth.js               # GET/POST /auth/register, /login, /logout
│   │   ├── missioni.js           # GET /missions/:id, POST accept/update/archive
│   │   ├── completamenti.js      # POST accept, submit, verify, reject
│   │   ├── users.js              # GET /users/dashboard, /leaderboard, /leaderboard/data
│   │   └── admin.js              # GET/POST /admin — dashboard, crea missioni, verifica prove
│   └── server.js                 # Entry point: Express, Socket.io, middleware, routes
├── uploads/
│   └── proofs/                   # Foto caricate dagli utenti (escluso da git)
├── views/
│   ├── layouts/
│   │   └── main.hbs              # Layout HTML principale
│   ├── partials/
│   │   ├── header.hbs            # Navigazione con ruolo-aware links
│   │   └── footer.hbs
│   ├── auth/
│   │   ├── login.hbs
│   │   └── register.hbs
│   ├── admin/
│   │   ├── dashboard.hbs
│   │   ├── create-mission.hbs
│   │   └── verify-proofs.hbs
│   ├── missions/
│   │   └── detail.hbs            # Dettaglio missione + form accetta/invia prova
│   ├── moderator/
│   │   └── pending.hbs
│   ├── users/
│   │   ├── dashboard.hbs         # Profilo utente, badge, completamenti
│   │   └── leaderboard.hbs       # Classifica (SSR + aggiornamento real-time)
│   ├── errors/
│   │   ├── 403.hbs
│   │   ├── 404.hbs
│   │   └── 500.hbs
│   └── home.hbs                  # Lista missioni con filtri
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Modello dati
```sql
users (id, username UNIQUE, email UNIQUE, password, role, points, created_at)
-- role: 'user' | 'moderator' | 'admin'

missions (id, title, description, location, lat, lng, points,
          difficulty, category, status, created_by → users.id, created_at)
-- difficulty: 'facile' | 'medio' | 'difficile'
-- status: 'attiva' | 'archiviata'

completions (id, user_id → users.id, mission_id → missions.id,
             status, proof_text, proof_image, feedback,
             verified_by → users.id, accepted_at, verified_at)
-- status: 'accettata' | 'in_attesa' | 'completata' | 'rifiutata'
-- UNIQUE(user_id, mission_id)

badges (id, name, description, icon, condition)
user_badges (user_id → users.id, badge_id → badges.id, earned_at)
-- PRIMARY KEY (user_id, badge_id)
```

## Flusso principale dell'applicazione
```text
Utente               Moderatore/Admin
  │                       │
  ├─ Registrazione        │
  ├─ Login                │
  │                       ├─ Crea missione
  ├─ Vede lista missioni  │
  ├─ Accetta missione     │
  ├─ Invia prova          │
  │  (testo + foto)       │
  │                       ├─ Verifica prova → 'completata'
  │                       │   ↳ assegna punti
  │                       │   ↳ assegna badge
  │                       │   ↳ emette evento Socket.io
  ├─ Vede punti aggiornati│
  └─ Classifica real-time ←── Socket.io 'leaderboard_update'
```

## Funzionalità per ruolo
### Utente (user)
- Visualizzare e filtrare missioni per categoria e difficoltà
- Vedere la mappa interattiva con i marker delle missioni
- Accettare una missione (una sola volta per missione)
- Inviare prova di completamento con testo e/o foto
- Visualizzare il proprio profilo con punti, badge e storico completamenti
- Consultare la classifica aggiornata in real-time

### Moderatore (moderator)
- Tutte le funzionalità utente
- Accedere alla coda prove pendenti
- Approvare o rifiutare prove con feedback testuale
- L'approvazione è atomica: aggiorna status + punti + badge in una singola transazione SQL

### Admin
- Tutte le funzionalità moderatore
- Creare, modificare e archiviare missioni
- Accesso al pannello di amministrazione

---

## Estensioni di Livello 3 implementate

1. **Mappa interattiva (Leaflet.js)**
   Le missioni con coordinate geografiche appaiono come marker personalizzati sulla mappa
   nella home page. Cliccando su un marker si apre un popup con titolo, punti e link
   alla pagina di dettaglio. I dati sono caricati via fetch da `/missions/api/map-data`.
2. **Upload foto come prova (Multer)**
   Gli utenti possono allegare un'immagine alla prova di completamento. Il file viene
   salvato su disco in `uploads/proofs/` con nome univoco generato da Multer. Il path
   viene persistito nel database e l'immagine è visibile ai moderatori nella coda di verifica.
3. **Classifica real-time (Socket.io)**
   Quando un moderatore approva una prova, il server emette l'evento `leaderboard_update`
   a tutti i client connessi. La pagina della classifica si aggiorna automaticamente via fetch
   senza ricaricare la pagina, mostrando brevemente un indicatore visivo di aggiornamento.

---

## Sicurezza

- Password hashate con bcrypt (cost factor 10), mai memorizzate in chiaro
- Tutte le query usano prepared statement (no concatenazione di stringhe → no SQL injection)
- Cookie di sessione con `httpOnly: true` e `sameSite: lax`
- Validazione lato server di tutti i form (la validazione HTML è solo UX)
- Autorizzazioni verificate da middleware dedicati (`requireAuth`, `requireModerator`, `requireAdmin`)
- Foreign keys attive (`PRAGMA foreign_keys = ON`) e WAL mode abilitato
