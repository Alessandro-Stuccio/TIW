import { run, get } from './database.js';
import bcrypt from 'bcrypt';

const hash = (pwd) => bcrypt.hashSync(pwd, 10);

// Utenti
const admin = run(
  `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
  ['admin', 'admin@missioni.it', hash('admin123'), 'admin']
);
run(
  `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
  ['moderatore1', 'mod@missioni.it', hash('mod123'), 'moderator']
);
run(
  `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
  ['agente_mario', 'mario@missioni.it', hash('user123'), 'user']
);

// Badge
const badges = [
  ['Prima missione', 'Completa la tua prima missione', '🎯', 'first_mission'],
  ['Esploratore', 'Completa 5 missioni', '🗺️', '5_missions'],
  ['Agente', 'Completa 10 missioni', '🕵️', '10_missions'],
  ['Fotografo', 'Invia una prova con foto', '📸', 'has_photo'],
  ['Tuttofare', 'Una missione per ogni categoria', '🌟', 'all_categories'],
];
for (const [name, description, icon, condition] of badges) {
  run(`INSERT INTO badges (name, description, icon, condition) VALUES (?, ?, ?, ?)`,
    [name, description, icon, condition]);
}

// Missioni
const missions = [
  ['La fontana nascosta', 'Trova e descrivi una fontanella nel raggio di 500m dal centro.', 'Piazza Navona, Roma', 41.8992, 12.4731, 15, 'facile', 'esplorazione', admin.lastInsertRowid],
  ['Affresco segreto', 'Descrivi un affresco o murales poco conosciuto in citta.', 'Trastevere, Roma', 41.8896, 12.4698, 25, 'media', 'cultura', admin.lastInsertRowid],
  ['Il posto piu strano', 'Trova il luogo piu insolito o bizzarro che riesci a trovare.', 'Centro storico, Roma', 41.9028, 12.4964, 30, 'difficile', 'assurdita', admin.lastInsertRowid],
  ['Scatto al tramonto', 'Fotografa un palazzo storico durante il tramonto.', 'Colosseo, Roma', 41.8902, 12.4922, 20, 'media', 'fotografia', admin.lastInsertRowid],
  ['Mappa dei vicoli', 'Descrivi un vicolo che non compare su Google Maps.', 'Quartiere Prati, Roma', 41.9072, 12.4647, 15, 'facile', 'esplorazione', admin.lastInsertRowid],
  ['Mercato storico', 'Visita un mercato rionale e descrivi tre bancarelle particolari.', 'Campo de Fiori, Roma', 41.8956, 12.4722, 20, 'facile', 'cultura', admin.lastInsertRowid],
  ['Graffiti urbano', 'Trova e fotografa un graffiti che racconta una storia.', 'Ostiense, Roma', 41.8719, 12.4791, 25, 'media', 'fotografia', admin.lastInsertRowid],
  ['La panchina dimenticata', 'Trova una panchina isolata e descrivi cosa si vede da li.', 'Villa Borghese, Roma', 41.9142, 12.4921, 10, 'facile', 'esplorazione', admin.lastInsertRowid],
];

for (const m of missions) {
  run(
    `INSERT INTO missions (title, description, location, lat, lng, points, difficulty, category, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    m
  );
}

console.log('Seed completato!');
console.log('Admin:       admin / admin123');
console.log('Moderatore:  moderatore1 / mod123');
console.log('Utente:      agente_mario / user123');