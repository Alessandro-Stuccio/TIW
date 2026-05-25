import db from './database.js';
import bcrypt from 'bcrypt';

const hash = (pwd) => bcrypt.hashSync(pwd, 10);

// Utenti
const admin = db.prepare(
  `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`
).run('admin', 'admin@missioni.it', hash('admin123'), 'admin');

db.prepare(
  `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`
).run('moderatore1', 'mod@missioni.it', hash('mod123'), 'moderator');

db.prepare(
  `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`
).run('agente_mario', 'mario@missioni.it', hash('user123'), 'user');

// Badge
const badges = [
  ['Prima missione', 'Completa la tua prima missione', '🎯', 'first_mission'],
  ['Esploratore', 'Completa 5 missioni', '🗺️', '5_missions'],
  ['Agente', 'Completa 10 missioni', '🕵️', '10_missions'],
  ['Fotografo', 'Invia una prova con foto', '📸', 'has_photo'],
  ['Tuttofare', 'Una missione per ogni categoria', '🌟', 'all_categories'],
];
for (const [name, description, icon, condition] of badges) {
  db.prepare(`INSERT OR IGNORE INTO badges (name, description, icon, condition) VALUES (?, ?, ?, ?)`).run(name, description, icon, condition);
}