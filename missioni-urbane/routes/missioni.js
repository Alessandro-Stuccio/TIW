import express from 'express';
import { run, get, all } from '../db/database.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /
router.get('/', (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let query = "SELECT * FROM missions WHERE status = 'attiva'";
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY created_at DESC';

    const missions = all(query, params);

    res.json(missions);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero delle missioni' });
  }
});

// GET /:id
router.get('/:id', (req, res) => {
  try {
    const missionId = req.params.id;

    const mission = get('SELECT * FROM missions WHERE id = ?', [missionId]);

    if (!mission) {
      return res.status(404).json({ error: 'Missione non trovata' });
    }

    let completion = null;

    // Se l'utente è loggato, recupera anche lo stato di completamento
    if (req.session && req.session.userId) {
      completion = get('SELECT * FROM completions WHERE user_id = ? AND mission_id = ?', [req.session.userId, missionId]);
    }

    res.json({ mission, completion });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero della missione' });
  }
});

// POST /
router.post('/', requireAdmin, (req, res) => {
  const { title, description, location, lat, lng, points, difficulty, category } = req.body;

  if (!title || !description || !location || points === undefined) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  try {
    const result = run(
      `INSERT INTO missions (title, description, location, lat, lng, points, difficulty, category, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, location, lat || null, lng || null, points, difficulty || 'facile', category || 'esplorazione', req.session.userId]
    );

    res.status(201).json({ id: result.lastInsertRowid, message: 'Missione creata' });
  } catch (err) {
    res.status(500).json({ error: 'Errore nella creazione della missione' });
  }
});

// PUT /:id
router.put('/:id', requireAdmin, (req, res) => {
  const { title, description, location, lat, lng, points, difficulty, category, status } = req.body;
  const missionId = req.params.id;

  try {
    const result = run(
      `UPDATE missions 
       SET title = ?, description = ?, location = ?, lat = ?, lng = ?, 
           points = ?, difficulty = ?, category = ?, status = ?
       WHERE id = ?`,
      [title, description, location, lat, lng, points, difficulty, category, status, missionId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Missione non trovata' });
    }

    res.json({ message: 'Missione aggiornata con successo' });
  } catch (err) {
    res.status(500).json({
      error: "Errore nell'aggiornamento della missione" });
  }
});

// DELETE /:id
router.delete('/:id', requireAdmin, (req, res) => {
  const missionId = req.params.id;

  try {
    // Invece di DELETE vera e propria, impostiamo status = 'archiviata'
    const result = run("UPDATE missions SET status = 'archiviata' WHERE id = ?", [missionId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Missione non trovata' });
    }

    res.json({ message: 'Missione archiviata con successo' });
  } catch (err) {
    res.status(500).json({
      error: "Errore nell'archiviazione della missione" });
  }
});

export default router;
