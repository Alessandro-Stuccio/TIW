import express from 'express';
import { getLeaderboard, findById, getUserBadges } from '../repositories/users.repo.js';
import { getByUserId } from '../repositories/completions.repo.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/leaderboard', (req, res) => {
  try {
    const leaderboard = getLeaderboard(50);
    res.render('users/leaderboard', { leaderboard });
  } catch (err) {
    console.error("Errore nel GET /leaderboard:", err);
    res.render('users/leaderboard', { error: 'Errore nel recupero della classifica' });
  }
});

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
