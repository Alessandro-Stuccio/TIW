# Changelog

## Modifiche e Bugfix: Agenzia di Missioni Urbane

### File Modificati
- `src/repositories/completions.repo.js`: Modificata `verifyCompletion` per restituire un booleano al termine della verifica della transazione in corso.
- `src/routes/completamenti.js`: Aggiunto controllo `changes === 0` su `submitProof`, controlli anti-self-verify simmetrici su `verify` e `reject`, e abilitato il lancio dell'evento `leaderboard_update` in caso di esito positivo della transazione di `verify`.
- `src/routes/admin.js`: Rimossi gli endpoint di verifica prove. Centralizzate e aggiunte rotte per la gestione delle missioni (`GET /missions`, `GET /missions/:id/edit`, `POST /missions/:id/update`, `POST /missions/:id/archive`) applicando validazione robusta.
- `src/routes/missioni.js`: Rimossi gli endpoint ridondanti `POST /`, `/:id/update`, `/:id/archive`.
- `views/admin/create-mission.hbs`: Rifattorizzata per includere e utilizzare il form condiviso `_mission-form.hbs`.
- `views/admin/dashboard.hbs`: Aggiornati i link in modo che la sezione revisione punti alla rotta `/completions/pending` e "Gestione missioni" punti a `/admin/missions`.
- `views/partials/header.hbs`: Modificate le condizioni del template Handlebars per assicurare che il link di navigazione "Verifica Prove" sia visibile in modo simmetrico sia agli utenti `admin` che `moderator`.
- `README.md`: Aggiornata la documentazione della struttura del progetto, allineandola al nuovo albero delle rotte e viste.
- `.gitignore`: Aggiunte estensioni file database in modo più generico. 

### File Creati
- `src/utils/validation.js`: Aggiunta logica di validazione modulare estratta e disaccoppiata dalle rotte.
- `views/partials/_mission-form.hbs`: Creato file per il markup riutilizzabile del form di creazione e modifica missioni, mostrando errori e valori in input in entrambe le route admin.
- `views/admin/edit-mission.hbs`: Creata pagina per la gestione ed update delle missioni attive e non.
- `views/admin/missions-list.hbs`: Creata pagina admin che mostra tutte le missioni con collegamenti per modifica e archiviazione.

### File Rimossi
- `views/admin/verify-proofs.hbs`: Eliminata, con convergenza di verifica unica in `views/moderator/pending.hbs`.
- `.env`: Eliminato il file reale al fine di non mantenere i token/secrets sul repository, lasciando solo `.env.example`.

### Task implementati
1. **Bug real-time**: Garantita l'emissione dell'evento Socket.io `leaderboard_update` per la verifica positiva di prove approvate da `/completions/:id/verify`.
2. **Logica di verifica duplicata**: Eliminata completamente la duplicazione tra `/admin/verify-proofs` e `/completions/pending`, convogliando su quest'ultima per la coda moderatori/admin, implementando anti-self-verify su prove rigettate e respinte. 
3. **Admin routes e Form di modifica**: Creata logica di validazione centralizzata con un form riutilizzabile e rimosse logiche vulnerabili da rotte di visualizzazione non adibite alla creazione e modifica di task.
4. **Bug Submit Prove**: Controllato lo state change in update. Se invio di prova non autorizzato, rimanda in pagina di dettaglio missione emettendo un errore specifico tramite renderer della view.
5. **Navigazione e Navbar**: Reso link di navigazione visibile logicamente agli utenti con i relativi permessi.
6. **Pulizia Progetto**: Rimossi segreti dal repo e ripuliti riferimenti vecchi, validati tutti i file mediante node `--check`.
