// Router per la gestione del profilo utente e della classifica pubblica.
import express from 'express';
import { getLeaderboard, findById, getUserBadges } from '../repositories/users.repo.js';
import { getByUserId } from '../repositories/completions.repo.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /users/leaderboard/data
// Endpoint API utilizzato dal frontend (leaderboard.js) per scaricare i dati aggiornati
// in formato JSON, necessario per l'aggiornamento real-time (Socket.io) senza ricaricare la pagina.
router.get('/leaderboard/data', (req, res) => {
  try {
    const leaderboard = getLeaderboard(50);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Errore server' });
  }
});

// GET /users/leaderboard
// Restituisce la vista HTML completa (SSR) della classifica, calcolata al momento della richiesta.
router.get('/leaderboard', (req, res) => {
  try {
    const leaderboard = getLeaderboard(50);
    res.render('users/leaderboard', { leaderboard });
  } catch (err) {
    console.error("Errore nel GET /leaderboard:", err);
    res.render('users/leaderboard', { error: 'Errore nel recupero della classifica' });
  }
});

// GET /users/dashboard
// Pagina profilo riservata all'utente loggato. Aggrega diverse query al DB per costruire una vista completa:
// profilo base, storico dei completamenti e badge guadagnati.
router.get('/dashboard', requireAuth, (req, res) => {
  try {
    const userId = req.session.userId;
    const userProfile = findById(userId);
    const badges = getUserBadges(userId);
    const completions = getByUserId(userId);
    
    res.render('users/dashboard', { userProfile, badges, completions });
  } catch (err) {
    console.error("Errore nel GET /dashboard:", err);
    res.redirect('/');
  }
});

export default router;
