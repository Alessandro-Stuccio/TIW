import express from 'express';
import { requireAdmin, requireModerator } from '../middleware/auth.js';
import { create as createMission } from '../repositories/missions.repo.js';
import { getPending, verifyCompletion, rejectCompletion } from '../repositories/completions.repo.js';

const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
  res.render('admin/dashboard');
});

router.get('/create-mission', requireAdmin, (req, res) => {
  res.render('admin/create-mission');
});

router.post('/create-mission', requireAdmin, (req, res) => {
  const { title, description, location, lat, lng, points, difficulty, category } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3)
    errors.push('Il titolo deve avere almeno 3 caratteri.');
  if (!description || description.trim().length < 10)
    errors.push('La descrizione deve avere almeno 10 caratteri.');
  if (!location || location.trim().length < 2)
    errors.push('Il luogo è obbligatorio.');
  const pts = parseInt(points, 10);
  if (isNaN(pts) || pts <= 0)
    errors.push('I punti devono essere un numero positivo.');
  if (lat && (isNaN(parseFloat(lat)) || parseFloat(lat) < -90 || parseFloat(lat) > 90))
    errors.push('Latitudine non valida (deve essere tra -90 e 90).');
  if (lng && (isNaN(parseFloat(lng)) || parseFloat(lng) < -180 || parseFloat(lng) > 180))
    errors.push('Longitudine non valida (deve essere tra -180 e 180).');

  const validDifficulties = ['facile', 'medio', 'difficile'];
  if (!validDifficulties.includes(difficulty))
    errors.push('Difficoltà non valida.');

  const validCategories = ['esplorazione', 'cultura', 'fotografia', 'utilità', 'assurdità controllata'];
  if (!validCategories.includes(category))
    errors.push('Categoria non valida.');

  if (errors.length > 0) {
    return res.render('admin/create-mission', { errors, formData: req.body });
  }

  try {
    createMission({
      title: title.trim(), description: description.trim(),
      location: location.trim(), lat: lat || null, lng: lng || null,
      points: pts, difficulty, category,
      created_by: req.session.userId
    });
    res.redirect('/admin');
  } catch (err) {
    console.error('Errore creazione missione:', err);
    res.render('admin/create-mission', { errors: ['Errore interno del server.'], formData: req.body });
  }
});

router.get('/verify-proofs', requireModerator, (req, res) => {
  try {
    const pendings = getPending();
    res.render('admin/verify-proofs', { pendings });
  } catch (err) {
    console.error("Errore pending proofs:", err);
    res.redirect('/admin');
  }
});

router.post('/verify-proofs/:id/approve', requireModerator, (req, res) => {
  try {
    verifyCompletion(req.params.id, req.session.userId);
    const io = req.app.get('io');
    if (io) io.emit('leaderboard_update', { message: 'Classifica aggiornata' });
    res.redirect('/admin/verify-proofs');
  } catch (err) {
    console.error("Errore verify:", err);
    res.redirect('/admin/verify-proofs');
  }
});

router.post('/verify-proofs/:id/reject', requireModerator, (req, res) => {
  try {
    rejectCompletion(req.params.id, req.body.feedback, req.session.userId);
    res.redirect('/admin/verify-proofs');
  } catch (err) {
    console.error("Errore reject:", err);
    res.redirect('/admin/verify-proofs');
  }
});

export default router;
