import express from 'express';
// Router dedicato all'autenticazione.
// Gestisce registrazione, login e logout degli utenti.
import bcrypt from 'bcrypt';
import { findByEmail, createUser } from '../repositories/users.repo.js';

const router = express.Router();

// GET /auth/register
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/register');
});

// POST /auth/register
// POST /auth/register
// Elabora il form di registrazione. 
// Validiamo l'input (lunghezza password, formato email) e tentiamo la creazione sul DB.
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.render('auth/register', { error: 'Tutti i campi sono obbligatori', username, email });
  }

  if (username.length < 3) {
    return res.render('auth/register', { error: 'L\'username deve avere almeno 3 caratteri', username, email });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('auth/register', { error: 'Formato email non valido', username, email });
  }

  if (password.length < 6) {
    return res.render('auth/register', { error: 'La password deve avere almeno 6 caratteri', username, email });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = createUser(username, email, hashedPassword);

    // Auto login: rigeneriamo il session ID per prevenire session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error("Errore rigenerazione sessione:", err);
        return res.render('auth/register', { error: 'Errore interno del server', username, email });
      }
      req.session.userId = userId;
      req.session.role = 'user';
      req.session.username = username;
      res.redirect('/');
    });
  } catch (err) {
    console.error("Errore nel POST /auth/register:", err);
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.render('auth/register', { error: 'Username o email già in uso', username, email });
    }
    res.render('auth/register', { error: 'Errore interno del server', username, email });
  }
});

// GET /auth/login
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/login');
});

// POST /auth/login
// POST /auth/login
// Verifica le credenziali confrontando l'hash della password (tramite users.repo.js).
// In caso di successo, inizializza la sessione.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.render('auth/login', { error: 'Email e password sono obbligatori', email });
  }

  try {
    const user = findByEmail(email);
    
    if (!user) {
      return res.render('auth/login', { error: 'Credenziali non valide', email });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.render('auth/login', { error: 'Credenziali non valide', email });
    }
    
    // Setup session
    // Rigeneriamo il session ID al login (prevenzione session fixation), poi
    // salviamo i dati utente essenziali: express-session li serializzerà
    // nel database SQLite configurato in server.js
    req.session.regenerate((err) => {
      if (err) {
        console.error("Errore rigenerazione sessione:", err);
        return res.render('auth/login', { error: 'Errore interno del server', email });
      }
      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.username = user.username;
      res.redirect('/');
    });
  } catch (err) {
    console.error("Errore nel POST /auth/login:", err);
    res.render('auth/login', { error: 'Errore interno del server', email });
  }
});

// POST /auth/logout
// POST /auth/logout
// Distrugge la sessione attiva e rimuove i cookie collegati, disconnettendo l'utente.
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

export default router;
