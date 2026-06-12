// Router che gestisce tutto il ciclo di vita del completamento di una missione:
// 1. Accettazione da parte dell'utente
// 2. Invio della prova (submit)
// 3. Verifica da parte dei moderatori (approvazione o rifiuto)
import express from 'express';
import fs from 'fs';
import { requireAuth, requireModerator } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { acceptMission, submitProof, verifyCompletion, rejectCompletion, getPending, getById as getCompById } from '../repositories/completions.repo.js';
import { getById as getMissionById } from '../repositories/missions.repo.js';
import db from '../db/database.js';

const router = express.Router();

// Helper: re-renderizza la pagina di dettaglio missione con un messaggio di errore,
// ricaricando missione e completamento per mantenere coerente l'interfaccia.
const renderDetailWithError = (req, res, missionId, error) => {
  const mission = getMissionById(missionId);
  const completion = db.prepare('SELECT * FROM completions WHERE user_id = ? AND mission_id = ?')
                       .get(req.session.userId, missionId);
  return res.render('missions/detail', { mission, completion, error });
};

// Helper: elimina dal disco un file caricato che non è stato associato a nessuna prova.
const removeUploadedFile = (file) => {
  if (file) fs.unlink(file.path, (err) => {
    if (err) console.error('Errore rimozione file orfano:', err);
  });
};

// POST /completions/missions/:missionId/accept
// Permette ad un utente base di accettare una missione. Admin e Moderatori non possono accettarle per giocare.
router.post('/missions/:missionId/accept', requireAuth, (req, res) => {
  if (['admin', 'moderator'].includes(req.session.role)) {
    return res.redirect(`/missions/${req.params.missionId}`);
  }

  try {
    // Si possono accettare solo missioni esistenti e ancora attive
    const mission = getMissionById(req.params.missionId);
    if (!mission || mission.status !== 'attiva') {
      return res.redirect(`/missions/${req.params.missionId}`);
    }
    acceptMission(req.session.userId, req.params.missionId);
    res.redirect(`/missions/${req.params.missionId}`);
  } catch (err) {
    console.error("Errore nell'accettazione della missione:", err);
    res.redirect(`/missions/${req.params.missionId}`);
  }
});

// POST /completions/missions/:missionId/submit
// Questa rotta processa l'invio fisico della prova (testo e foto).
// Usiamo il middleware 'upload.single' di Multer per intercettare eventuali immagini dal form-data.
// Lo invochiamo manualmente per poter gestire i suoi errori (file troppo grande, tipo non valido)
// mostrando un messaggio chiaro invece della pagina 500 generica.
router.post('/missions/:missionId/submit', requireAuth, (req, res, next) => {
  upload.single('proof_image')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'L\'immagine supera la dimensione massima di 5MB.'
        : err.message;
      return renderDetailWithError(req, res, req.params.missionId, message);
    }
    next();
  });
}, (req, res) => {
  const { proof_text } = req.body;
  const proof_image = req.file ? `/uploads/proofs/${req.file.filename}` : null;
  const missionId = req.params.missionId;

  if (!proof_text && !proof_image) {
    // Validazione base: non si può inviare una prova completamente vuota
    return renderDetailWithError(req, res, missionId, 'Devi fornire un testo o un\'immagine come prova.');
  }

  try {
    const changes = submitProof(req.session.userId, missionId, proof_text, proof_image);

    if (changes === 0) {
      // La prova non è stata registrata: l'eventuale file caricato resterebbe orfano su disco
      removeUploadedFile(req.file);
      return renderDetailWithError(req, res, missionId,
        'Devi prima accettare la missione per poter inviare una prova, oppure la prova è già stata inviata.');
    }

    res.redirect(`/users/dashboard`);
  } catch (err) {
    console.error("Errore nell'invio della prova:", err);
    removeUploadedFile(req.file);
    res.redirect(`/missions/${missionId}`);
  }
});

// Moderazione - GET /pending
// Pagina dove Moderatori e Admin possono ispezionare la coda delle prove non ancora verificate.
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
// Approva una specifica prova e aggiorna la classifica in tempo reale inviando un evento socket.
router.post('/:id/verify', requireModerator, async (req, res) => {
  try {
    const comp = getCompById(req.params.id);
    if (!comp || comp.status !== 'in_attesa' || comp.user_id === req.session.userId) {
       return res.redirect('/completions/pending');
    }

    const success = verifyCompletion(req.params.id, req.session.userId);
    if (success) {
      const io = req.app.get('io');
      if (io) io.emit('leaderboard_update', { message: 'Classifica aggiornata' });
    }
    
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
    const comp = getCompById(req.params.id);
    if (!comp || comp.status !== 'in_attesa' || comp.user_id === req.session.userId) {
       return res.redirect('/completions/pending');
    }

    rejectCompletion(req.params.id, feedback, req.session.userId);
    res.redirect('/completions/pending');
  } catch (err) {
    console.error("Errore reject:", err);
    res.redirect('/completions/pending');
  }
});

export default router;