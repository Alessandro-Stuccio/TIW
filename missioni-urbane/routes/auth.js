import express from 'express';
import bcrypt from 'bcrypt';
import { run, get, all } from '../db/database.js';

const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'L\'username deve avere almeno 3 caratteri' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato email non valido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    
    // Auto login
    req.session.userId = result.lastInsertRowid;
    req.session.userRole = 'user';
    req.session.role = 'user';
    
    res.status(201).json({ 
      id: result.lastInsertRowid, 
      username, 
      email, 
      role: 'user',
      points: 0 
    });
  } catch (err) {
    console.error("Errore nel POST /register:", err);
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Username o email già in uso' });
    }
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatori' });
  }

  try {
    const user = get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    
    // Setup session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.role = user.role;
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points
    });
  } catch (err) {
    console.error("Errore nel POST /login:", err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Impossibile disconnettersi' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout effettuato con successo' });
  });
});

// GET /me
router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.json(null);
  }
  
  try {
    const user = get('SELECT id, username, email, role, points, created_at FROM users WHERE id = ?', [req.session.userId]);
    
    if (!user) {
      return res.status(401).json({ error: 'Utente non trovato' });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Errore nel GET /me:", err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

export default router;
