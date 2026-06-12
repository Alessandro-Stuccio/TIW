// Router dedicato esclusivamente alle operazioni amministrative (Admin HQ).
// Qui si concentrano creazione, modifica e archiviazione delle missioni.
import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { create as createMission, getAll, getById, update as updateMission, archive as archiveMission } from '../repositories/missions.repo.js';
import { validateMissionInput } from '../utils/validation.js';
import db from '../db/database.js';

const router = express.Router();

// Mostra la dashboard principale del pannello HQ
router.get('/', requireAdmin, (req, res) => {
  res.render('admin/dashboard');
});

// Mostra il form vuoto per la creazione di una nuova missione
router.get('/create-mission', requireAdmin, (req, res) => {
  res.render('admin/create-mission');
});

// Gestisce la ricezione dei dati del form di creazione
router.post('/create-mission', requireAdmin, (req, res) => {
  // Prima di scrivere a database, effettuiamo una validazione robusta dei campi.
  // Utilizziamo un modulo utility esterno per mantenere pulito il controller.
  const { errors, data } = validateMissionInput(req.body);

  if (errors.length > 0) {
    // Se ci sono errori, re-renderizziamo il form ripopolandolo con i dati appena inviati (formData) e mostrando la lista degli errori.
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

// Elenca tutte le missioni (comprese le archiviate) per la gestione da parte dell'admin
router.get('/missions', requireAdmin, (req, res) => {
  try {
    // A differenza di 'getAll' generico, qui eseguiamo una query diretta che ignora lo stato 'attiva'.
    const missions = db.prepare('SELECT * FROM missions ORDER BY created_at DESC').all();
    res.render('admin/missions-list', { missions });
  } catch (err) {
    console.error('Errore get missions:', err);
    res.redirect('/admin');
  }
});

// Mostra il form per la modifica di una missione esistente
router.get('/missions/:id/edit', requireAdmin, (req, res) => {
  try {
    const mission = getById(req.params.id);
    if (!mission) {
      return res.redirect('/admin/missions');
    }
    // Passiamo la missione come `formData` così il partial Handlebars _mission-form la pre-compilerà
    res.render('admin/edit-mission', { formData: mission });
  } catch (err) {
    console.error('Errore get edit mission:', err);
    res.redirect('/admin/missions');
  }
});

// Processa l'update dei campi di una missione già esistente
router.post('/missions/:id/update', requireAdmin, (req, res) => {
  const { errors, data } = validateMissionInput(req.body);

  if (errors.length > 0) {
    data.id = req.params.id; // mantieni l'id per il form
    return res.render('admin/edit-mission', { errors, formData: data });
  }

  try {
    const pts = parseInt(data.points, 10);
    updateMission(req.params.id, {
      title: data.title.trim(), description: data.description.trim(),
      location: data.location.trim(), lat: data.lat || null, lng: data.lng || null,
      points: pts, difficulty: data.difficulty, category: data.category,
      status: req.body.status || 'attiva' // Assumi attiva o recupera dal body
    });
    res.redirect('/admin/missions');
  } catch (err) {
    console.error('Errore update missione:', err);
    data.id = req.params.id;
    res.render('admin/edit-mission', { errors: ['Errore interno del server.'], formData: data });
  }
});

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
