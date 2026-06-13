/**
 * Router per il pannello di amministrazione (Admin HQ).
 * Gestisce la dashboard amministrativa e il ciclo di vita completo 
 * delle missioni (creazione, lettura, aggiornamento, archiviazione).
 */
import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { create as createMission, getAll, getById, update as updateMission, archive as archiveMission } from '../repositories/missions.repo.js';
import { validateMissionInput } from '../utils/validation.js';
import db from '../db/database.js';

const router = express.Router();

/**
 * GET /admin
 * Mostra la dashboard principale del pannello amministrativo HQ.
 */
router.get('/', requireAdmin, (req, res) => {
  res.render(' ');
});

/**
 * GET /admin/create-mission
 * Renderizza il modulo per la creazione di una nuova missione.
 */
router.get('/create-mission', requireAdmin, (req, res) => {
  res.render('admin/create-mission');
});

/**
 * POST /admin/create-mission
 * Elabora i dati inviati per la creazione di una missione.
 */
router.post('/create-mission', requireAdmin, (req, res) => {
  // Esegue la validazione dei dati in ingresso tramite utility dedicata
  const { errors, data } = validateMissionInput(req.body);

  if (errors.length > 0) {
    // In caso di validazione fallita, re-renderizza il modulo mantenendo i dati inseriti e mostrando gli errori
    return res.render('admin/create-mission', { errors, formData: data });
  }

  try {
    const pts = parseInt(data.points, 10);
    createMission({
      title: data.title.trim(), description: data.description.trim(),
      location: data.location.trim(), lat: data.lat || null, lng: data.lng || null,
      points: pts, difficulty: data.difficulty, category: data.category,
      created_by: req.session.userId
    });
    res.redirect('/admin/missions');
  } catch (err) {
    console.error('Errore creazione missione:', err);
    res.render('admin/create-mission', { errors: ['Errore interno del server.'], formData: data });
  }
});

/**
 * GET /admin/missions
 * Recupera ed elenca tutte le missioni presenti nel sistema, incluse quelle archiviate, 
 * per consentirne la gestione completa da parte dell'amministratore.
 */
router.get('/missions', requireAdmin, (req, res) => {
  try {
    // Esegue una query diretta per bypassare i filtri sullo stato (es. 'attiva') previsti dai metodi generici
    const missions = db.prepare('SELECT * FROM missions ORDER BY created_at DESC').all();
    res.render('admin/missions-list', { missions });
  } catch (err) {
    console.error('Errore get missions:', err);
    res.redirect('/admin');
  }
});

/**
 * GET /admin/missions/:id/edit
 * Renderizza il modulo di modifica precompilato per una specifica missione esistente.
 */
router.get('/missions/:id/edit', requireAdmin, (req, res) => {
  try {
    const mission = getById(req.params.id);
    if (!mission) {
      return res.redirect('/admin/missions');
    }
    // Passa i dati della missione come `formData` per consentire la precompilazione del partial Handlebars `_mission-form`
    res.render('admin/edit-mission', { formData: mission });
  } catch (err) {
    console.error('Errore get edit mission:', err);
    res.redirect('/admin/missions');
  }
});

/**
 * POST /admin/missions/:id/update
 * Elabora i dati inviati per l'aggiornamento di una missione esistente.
 */
router.post('/missions/:id/update', requireAdmin, (req, res) => {
  const { errors, data } = validateMissionInput(req.body);

  if (errors.length > 0) {
    data.id = req.params.id; // Conserva l'ID della missione per permettere il corretto funzionamento del modulo in caso di errore
    return res.render('admin/edit-mission', { errors, formData: data });
  }

  try {
    const pts = parseInt(data.points, 10);
    updateMission(req.params.id, {
      title: data.title.trim(), description: data.description.trim(),
      location: data.location.trim(), lat: data.lat || null, lng: data.lng || null,
      points: pts, difficulty: data.difficulty, category: data.category,
      status: req.body.status || 'attiva' // Imposta lo stato fornito dal modulo o adotta 'attiva' come fallback
    });
    res.redirect('/admin/missions');
  } catch (err) {
    console.error('Errore update missione:', err);
    data.id = req.params.id;
    res.render('admin/edit-mission', { errors: ['Errore interno del server.'], formData: data });
  }
});

/**
 * POST /admin/missions/:id/archive
 * Archivia una missione rendendola non più visibile o completabile dagli utenti standard.
 */
router.post('/missions/:id/archive', requireAdmin, (req, res) => {
  try {
    archiveMission(req.params.id);
    res.redirect('/admin/missions');
  } catch (err) {
    console.error("Errore archive:", err);
    res.redirect('/admin/missions');
  }
});

export default router;
