import db from '../db/database.js';

export const getAll = (category, difficulty) => {
  let query = "SELECT * FROM missions WHERE status = 'attiva'";
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }

  query += ' ORDER BY created_at DESC';
  return db.prepare(query).all(...params);
};

export const getById = (id) => {
  return db.prepare('SELECT * FROM missions WHERE id = ?').get(id);
};

export const create = (missionData) => {
  const { title, description, location, lat, lng, points, difficulty, category, created_by } = missionData;
  const result = db.prepare(`
    INSERT INTO missions (title, description, location, lat, lng, points, difficulty, category, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title, description, location, lat || null, lng || null, points, 
    difficulty || 'facile', category || 'esplorazione', created_by
  );
  return result.lastInsertRowid;
};

export const update = (id, missionData) => {
  const { title, description, location, lat, lng, points, difficulty, category, status } = missionData;
  const result = db.prepare(`
    UPDATE missions 
    SET title = ?, description = ?, location = ?, lat = ?, lng = ?, 
        points = ?, difficulty = ?, category = ?, status = ?
    WHERE id = ?
  `).run(
    title, description, location, lat, lng, points, difficulty, category, status, id
  );
  return result.changes;
};

export const archive = (id) => {
  const result = db.prepare("UPDATE missions SET status = 'archiviata' WHERE id = ?").run(id);
  return result.changes;
};
