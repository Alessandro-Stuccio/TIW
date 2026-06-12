// Script eseguibile (tramite `npm run seed`) per riempire il database con dati di partenza.
// Molto utile per resettare lo stato e fare testing o simulazioni.
import db from './database.js';
import bcrypt from 'bcrypt';

const hash = (pwd) => bcrypt.hashSync(pwd, 10);

// Inserimento di 3 tipologie fondamentali di utenti (Admin, Moderatore, Utente standard).
// Usiamo INSERT OR IGNORE per evitare che lanci in sequenza dello script duplichino i dati in caso i record esistano già.
const admin = db.prepare(
  `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`
).run('admin', 'admin@missioni.it', hash('admin123'), 'admin');

db.prepare(
  `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`
).run('moderatore1', 'mod@missioni.it', hash('mod123'), 'moderator');

db.prepare(
  `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`
).run('agente_mario', 'mario@missioni.it', hash('user123'), 'user');

// Registrazione statica dei Badge sbloccabili (obiettivi del gioco)
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

// Abbiamo bisogno di un riferimento all'id dell'admin per associargli la creazione delle missioni sottostanti.
const adminUser = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
const adminId = adminUser.id;

// Array strutturato di missioni di esempio dislocate sulla mappa e divise per categoria.
const missioni = [
  {
    title: 'Fontanella Nascosta',
    description: 'Trova una fontanella pubblica nel raggio di 500m dal centro e descrivi la sua posizione esatta.',
    location: 'Centro città',
    lat: 41.9028, lng: 12.4964,
    points: 10, difficulty: 'facile', category: 'esplorazione',
  },
  {
    title: 'Murales di Quartiere',
    description: 'Fotografa un murales o street art nel tuo quartiere e descrivi il soggetto rappresentato.',
    location: 'Quartieri periferici',
    lat: 41.8919, lng: 12.5113,
    points: 20, difficulty: 'facile', category: 'fotografia',
  },
  {
    title: 'Targa Storica',
    description: 'Trova una targa commemorativa su un edificio storico. Trascrivi il testo completo.',
    location: 'Centro storico',
    lat: 41.8986, lng: 12.4769,
    points: 30, difficulty: 'medio', category: 'cultura',
  },
  {
    title: 'Panchina Rossa',
    description: 'Individua una panchina rossa in un parco pubblico. Descrivi il parco e la sua posizione.',
    location: 'Parchi pubblici',
    lat: 41.9109, lng: 12.4818,
    points: 15, difficulty: 'facile', category: 'esplorazione',
  },
  {
    title: 'Cartello Assurdo',
    description: 'Trova un cartello stradale o un avviso che ti sembra particolarmente inutile o divertente. Descrivi il contesto.',
    location: 'Ovunque in città',
    lat: 41.8855, lng: 12.5034,
    points: 25, difficulty: 'medio', category: 'assurdità controllata',
  },
  {
    title: 'Scala Monumentale',
    description: 'Trova una scala con almeno 20 gradini in uno spazio pubblico e conta i gradini esatti.',
    location: 'Spazi pubblici',
    lat: 41.9061, lng: 12.4890,
    points: 40, difficulty: 'difficile', category: 'utilità',
  },
];

const insertMission = db.prepare(`
  INSERT OR IGNORE INTO missions (title, description, location, lat, lng, points, difficulty, category, created_by)
  VALUES (@title, @description, @location, @lat, @lng, @points, @difficulty, @category, @created_by)
`);

for (const m of missioni) {
  insertMission.run({ ...m, created_by: adminId });
}

console.log('Seed completato: utenti, badge e missioni inseriti.');