import express from 'express';
import { run, get, all } from '../db/database.js';
import { requireAuth, requireModerator } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

const checkBadges = (userId) => {
  const completions = all(
    `SELECT c.*, m.category FROM completions c
     JOIN missions m ON c.mission_id = m.id
     WHERE c.user_id = ? AND c.status = 'completata'`,
    [userId]
  );
  const count = completions.length;
  if (count === 0) return [];

  const earnedBadges = [];

  const addBadge = (condition) => {
    const badge = get('SELECT id FROM badges WHERE condition = ?', [condition]);
    if (!badge) return;
    try {
      run('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)', [userId, badge.id]);
      earnedBadges.push(badge.id);
    } catch (e) { /* già ottenuto */ }
  };

  if (count >= 1) addBadge('first_mission');
  if (count >= 5) addBadge('5_missions');
  if (count >= 10) addBadge('10_missions');

  const hasPhoto = completions.some(c => c.proof_image !== null);
  if (hasPhoto) addBadge('has_photo');

  const categories = new Set(completions.map(c => c.category));
  const total = get('SELECT COUNT(DISTINCT category) as count FROM missions');
  if (categories.size >= total.count) addBadge('all_categories');

  return earnedBadges;
};

// GET /my
router.get('/my', requireAuth, (req, res) => {
  try {
    const completions = all(
      `SELECT c.*, m.title, m.points as mission_points
       FROM completions c
       JOIN missions m ON c.mission_id = m.id
       WHERE c.user_id = ?
       ORDER BY c.accepted_at DESC`,
      [req.session.userId]
    );
    res.json(completions);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero completamenti' });
  }
});

// GET /pending
router.get('/pending', requireModerator, (req, res) => {
  try {
    const rows = all(
      `SELECT c.*, m.title as mission_title, u.username
       FROM completions c
       JOIN missions m ON c.mission_id = m.id
       JOIN users u ON c.user_id = u.id
       WHERE c.status = 'in_attesa'
       ORDER BY c.accepted_at ASC`,
      []
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero prove in attesa' });
  }
});

// POST /missions/:missionId/accept
router.post('/missions/:missionId/accept', requireAuth, (req, res) => {
  if (['admin', 'moderator'].includes(req.session.userRole)) {
    return res.status(403).json({ 
      error: 'Admin e moderatori non possono accettare missioni' 
    });
  }

  try {
    const result = run(
      'INSERT INTO completions (user_id, mission_id, status) VALUES (?, ?, ?)',
      [req.session.userId, req.params.missionId, 'accettata']
    );
    res.status(201).json({ id: result.lastInsertRowid, message: 'Missione accettata' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Hai già accettato questa missione' });
    }
    res.status(500).json({ error: "Errore nell'accettazione della missione" });
  }
});

// POST /missions/:missionId/submit
router.post('/missions/:missionId/submit', requireAuth, upload.single('proof_image'), (req, res) => {
  const { proof_text } = req.body;
  const proof_image = req.file ? `/uploads/proofs/${req.file.filename}` : null;

  if (!proof_text && !proof_image) {
    return res.status(400).json({ error: "Devi fornire almeno un testo o un'immagine" });
  }

  try {
    const result = run(
      `UPDATE completions
       SET status = 'in_attesa', proof_text = ?, proof_image = ?
       WHERE user_id = ? AND mission_id = ? AND (status = 'accettata' OR status = 'rifiutata')`,
      [proof_text || null, proof_image, req.session.userId, req.params.missionId]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Completamento non trovato o stato non valido' });
    }
    res.json({ message: 'Prova inviata con successo' });
  } catch (err) {
    res.status(500).json({ error: "Errore nell'invio della prova" });
  }
});

// POST /:id/verify
router.post('/:id/verify', requireModerator, (req, res) => {
  try {
    const comp = get(
      'SELECT c.*, m.points FROM completions c JOIN missions m ON c.mission_id = m.id WHERE c.id = ?',
      [req.params.id]
    );
    if (!comp) return res.status(404).json({ error: 'Completamento non trovato' });
    if (comp.status === 'completata') return res.status(400).json({ error: 'Già verificata' });
    if (comp.user_id === req.session.userId) return res.status(403).json({ error: 'Non puoi verificare una tua prova' });

    run(
      `UPDATE completions SET status = 'completata', verified_by = ?, verified_at = datetime('now') WHERE id = ?`,
      [req.session.userId, req.params.id]
    );
    run('UPDATE users SET points = points + ? WHERE id = ?', [comp.points, comp.user_id]);

    const newBadges = checkBadges(comp.user_id);

    const io = req.app.get('io');
    if (io) io.emit('leaderboard_update', { message: 'Classifica aggiornata' });

    res.json({ message: 'Prova verificata e punti assegnati', newBadges });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante la verifica' });
  }
});

// POST /:id/reject
router.post('/:id/reject', requireModerator, (req, res) => {
  const { feedback } = req.body;
  try {
    const comp = get('SELECT user_id FROM completions WHERE id = ?', [req.params.id]);
    if (!comp) return res.status(404).json({ error: 'Completamento non trovato' });
    if (comp.user_id === req.session.userId) return res.status(403).json({ error: 'Non puoi rifiutare una tua prova' });

    run(
      `UPDATE completions SET status = 'rifiutata', feedback = ?, verified_by = ?, verified_at = datetime('now') WHERE id = ?`,
      [feedback || 'La prova non soddisfa i requisiti', req.session.userId, req.params.id]
    );
    res.json({ message: 'Prova rifiutata' });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante il rifiuto' });
  }
});

export default router;