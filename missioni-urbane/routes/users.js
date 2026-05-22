import express from 'express';
import { run, get, all } from '../db/database.js';

const router = express.Router();

// GET /leaderboard
router.get('/leaderboard', (req, res) => {
  try {
    const leaderboard = all('SELECT id, username, points FROM users ORDER BY points DESC LIMIT 50', []);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero della leaderboard' });
  }
});

// GET /:id/profile
router.get('/:id/profile', (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = get('SELECT id, username, points, role, created_at FROM users WHERE id = ?', [userId]);
    
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    const badges = all(`
      SELECT b.*, ub.earned_at 
      FROM user_badges ub 
      JOIN badges b ON ub.badge_id = b.id 
      WHERE ub.user_id = ?
      ORDER BY ub.earned_at DESC
    `, [userId]);
    
    res.json({ user, badges });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero del profilo' });
  }
});

export default router;
