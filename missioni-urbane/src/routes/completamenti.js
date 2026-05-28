import express from 'express';
import { requireAuth, requireModerator } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { acceptMission, submitProof, verifyCompletion, rejectCompletion, getPending, getById as getCompById } from '../repositories/completions.repo.js';

const router = express.Router();

// POST /completions/missions/:missionId/accept
router.post('/missions/:missionId/accept', requireAuth, (req, res) => {
  if (['admin', 'moderator'].includes(req.session.role)) {
    return res.redirect(`/missions/${req.params.missionId}`); 
  }

  try {
    acceptMission(req.session.userId, req.params.missionId);
    res.redirect(`/missions/${req.params.missionId}`);
  } catch (err) {
    console.error("Errore nell'accettazione della missione:", err);
    res.redirect(`/missions/${req.params.missionId}`);
  }
});

// POST /completions/missions/:missionId/submit
router.post('/missions/:missionId/submit', requireAuth, upload.single('proof_image'), (req, res) => {
  const { proof_text } = req.body;
  const proof_image = req.file ? `/uploads/proofs/${req.file.filename}` : null;

  if (!proof_text && !proof_image) {
    return res.redirect(`/missions/${req.params.missionId}`);
  }

  try {
    submitProof(req.session.userId, req.params.missionId, proof_text, proof_image);
    res.redirect(`/users/dashboard`);
  } catch (err) {
    console.error("Errore nell'invio della prova:", err);
    res.redirect(`/missions/${req.params.missionId}`);
  }
});

// Moderazione - GET /pending per vedere le prove
router.get('/pending', requireModerator, (req, res) => {
  try {
    const pendings = getPending();
    res.render('moderator/pending', { pendings });
  } catch (err) {
    console.error("Errore nel GET /pending:", err);
    res.redirect('/');
  }
});

// POST /completions/:id/verify
router.post('/:id/verify', requireModerator, async (req, res) => {
  try {
    const comp = getCompById(req.params.id);
    if (!comp || comp.status === 'completata' || comp.user_id === req.session.userId) {
       return res.redirect('/completions/pending');
    }
    
    verifyCompletion(req.params.id, req.session.userId);
    
    res.redirect('/completions/pending');
  } catch (err) {
    console.error("Errore verify:", err);
    res.redirect('/completions/pending');
  }
});

// POST /completions/:id/reject
router.post('/:id/reject', requireModerator, (req, res) => {
  const { feedback } = req.body;
  try {
    rejectCompletion(req.params.id, feedback, req.session.userId);
    res.redirect('/completions/pending');
  } catch (err) {
    console.error("Errore reject:", err);
    res.redirect('/completions/pending');
  }
});

export default router;