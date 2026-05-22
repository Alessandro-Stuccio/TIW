# Agenzia di Missioni Urbane

Piattaforma per agenti sul campo: scopri missioni nella tua città, completale e scala la classifica globale.

## Tecnologie

- **Backend**: Node.js, Express (ES Modules)
- **Database**: SQLite (better-sqlite3)
- **Autenticazione**: express-session, bcrypt
- **Real-Time**: Socket.io (per la leaderboard)
- **Upload**: multer
- **Frontend**: HTML, CSS, Vanilla JS
- **Mappa**: Leaflet.js

## Installazione

1. Clona la repository o assicurati di essere nella cartella corretta.
2. Esegui il comando di installazione:
   ```bash
   npm install
   ```
3. Inizializza il database con i dati di test (missioni, badge, utenti admin):
   ```bash
   npm run seed
   ```
4. Avvia il server:
   ```bash
   npm start
   ```
   *(o `npm run dev` per abilitare l'hot reload del backend)*

## Utenti di test

Sono disponibili tre account di test per provare i vari ruoli del sistema:
- **Admin**: `email`: `admin@missioni.it` - `password`: `admin123`
- **Moderatore**: `email`: `mod@missioni.it` - `password`: `mod123`
- **Utente**: `email`: `mario@missioni.it` - `password`: `user123`

## Funzionalità principali

- Registrazione e Login.
- Visualizzazione mappa interattiva con Leaflet.
- Filtro missioni per difficoltà e categoria.
- Upload delle prove fotografiche.
- Assegnazione dinamica di badge.
- Dashboard admin per creazione missioni e validazione prove.
- Classifica globale in tempo reale.
