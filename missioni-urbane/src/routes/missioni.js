// Router che gestisce la fruizione pubblica delle missioni da parte degli utenti.
// Attenzione: la rotta GET '/' è dichiarata globalmente in server.js per gestire l'homepage.
import express from 'express';
import { getAll, getById } from '../repositories/missions.repo.js';
import db from '../db/database.js';

const router = express.Router();

// GET /missions/api/map-data
// Endpoint JSON dedicato alla fornitura di dati per Leaflet.js
// Estrae e restituisce esclusivamente le missioni dotate di coordinate geografiche valide.
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

// GET /missions/:id 
// Mostra i dettagli di una specifica missione (titolo, descrizione, ecc.).
// Valuta anche se l'utente loggato l'ha già accettata (tramite una query sul completamento)
// per adattare l'interfaccia (mostrando il form di prova o il bottone di accetta).
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

export default router;
