# Agenzia di Missioni Urbane

L'Agenzia di Missioni Urbane è una piattaforma web interattiva che permette agli utenti di scoprire e partecipare a missioni nel mondo reale. Gli utenti possono accettare sfide, inviare prove del loro completamento e scalare la classifica guadagnando punti e badge.

> **Livello Raggiunto:** Il progetto implementa con successo tutti i requisiti fino al **Livello 3**.

## Estensioni Tecniche (Livello 3)
Il progetto include funzionalità avanzate che rispettano le specifiche del Livello 3:
- **Leaflet.js**: Utilizzato per la visualizzazione e l'interazione con la mappa interattiva delle missioni.
- **Multer**: Implementato per gestire l'upload fisico delle immagini come prova di completamento delle missioni.
- **Socket.io**: Integrato per garantire l'aggiornamento in tempo reale della classifica (Leaderboard) senza necessità di ricaricare la pagina.

## Prerequisiti
- **Node.js v22+** (Strettamente richiesto in quanto il progetto fa uso del modulo nativo `node:sqlite`).

## Installazione e Avvio

Per configurare ed eseguire il progetto in locale, segui questi passaggi:

1. Installa le dipendenze:
```bash
npm install
```

2. Popola il database con i dati iniziali (seed):
```bash
npm run seed
```

3. Avvia il server di sviluppo:
```bash
npm run dev
```

Il server sarà accessibile all'indirizzo `http://localhost:3000` (o alla porta specificata nel tuo ambiente).

## Credenziali di Test

Il comando `npm run seed` genera automaticamente nel database alcuni utenti predefiniti per testare i diversi ruoli della piattaforma:

| Ruolo | Username | Password |
| :--- | :--- | :--- |
| **Admin** | admin | admin123 |
| **Moderatore** | moderatore1 | mod123 |
| **Utente** | agente_mario | user123 |
