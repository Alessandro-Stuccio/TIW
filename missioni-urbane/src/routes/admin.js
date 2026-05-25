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
  try {
    createMission({...req.body, created_by: req.session.userId});
    res.redirect('/admin');
  } catch (err) {
    console.error("Errore creazione missione:", err);
    res.redirect('/admin');
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
