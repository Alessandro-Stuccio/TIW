// DAO per le operazioni relative agli utenti: login, registrazione, lettura dati e classifica.
import db from '../db/database.js';

// Query principale per la costruzione della leaderboard (classifica). 
// Ritorna gli n utenti con più punti in ordine decrescente.
export const getLeaderboard = (limit = 50) => {
  return db.prepare('SELECT id, username, points FROM users ORDER BY points DESC LIMIT ?').all(limit);
};

// Estrae dal database le info pubbliche o base tramite un ID. (No password)
export const findById = (id) => {
  return db.prepare('SELECT id, username, points, role, created_at FROM users WHERE id = ?').get(id);
};

// Estrae un utente (comprese info sensibili come l'hash della password) tramite l'email per consentire il processo di Login.
export const findByEmail = (email) => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

// Effettua una JOIN tra la tabella di relazione (user_badges) e i badges stessi 
// per fornire all'utente l'elenco dei riconoscimenti sbloccati.
export const getUserBadges = (userId) => {
  return db.prepare(`
    SELECT b.*, ub.earned_at 
    FROM user_badges ub 
    JOIN badges b ON ub.badge_id = b.id 
    WHERE ub.user_id = ?
    ORDER BY ub.earned_at DESC
  `).all(userId);
};

// Crea un utente (Signup) garantendo l'inserimento dell'hash corretto generato da Bcrypt in auth.js.
export const createUser = (username, email, password) => {
  const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, password);
  return result.lastInsertRowid;
};
