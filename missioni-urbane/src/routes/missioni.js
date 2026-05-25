import express from 'express';
import { getAll, getById, create, update, archive } from '../repositories/missions.repo.js';
import { requireAdmin } from '../middleware/auth.js';
import db from '../db/database.js'; 

const router = express.Router();

// L'endpoint GET / è in server.js per la home, ma qui c'è ancora l'endpoint map-data
router.get('/api/map-data', (req, res) => {
  try {
    const missions = getAll();
    // Return only active missions with lat lng
    const mapMissions = missions.filter(m => m.lat && m.lng);
    res.json(mapMissions);
  } catch (err) {
    console.error("Errore nel GET /api/map-data:", err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// GET /missions/:id -> Detail view
router.get('/:id', (req, res) => {
  try {
    const missionId = req.params.id;
    const mission = getById(missionId);

    if (!mission) {
      return res.render('missions/detail', { error: 'Missione non trovata' });
    }

    let completion = null;
    if (req.session && req.session.userId) {
      completion = db.prepare('SELECT * FROM completions WHERE user_id = ? AND mission_id = ?')
                     .get(req.session.userId, missionId);
    }

    res.render('missions/detail', { mission, completion });
  } catch (err) {
    console.error("Errore nel GET /:id:", err);
    res.render('missions/detail', { error: 'Errore nel recupero della missione' });
  }
});

// Admin routes (POST / PUT / DELETE per missions)
// POST /missions
router.post('/', requireAdmin, (req, res) => {
  try {
    create({...req.body, created_by: req.session.userId});
    res.redirect('/admin');
  } catch (err) {
    console.error("Errore nel POST /missions:", err);
    res.redirect('/admin'); 
  }
});

router.post('/:id/update', requireAdmin, (req, res) => {
  try {
    update(req.params.id, req.body);
    res.redirect('/admin');
  } catch (err) {
    console.error("Errore update:", err);
    res.redirect('/admin');
  }
});

router.post('/:id/archive', requireAdmin, (req, res) => {
  try {
    archive(req.params.id);
    res.redirect('/admin');
  } catch (err) {
    console.error("Errore archive:", err);
    res.redirect('/admin');
  }
});

export default router;
