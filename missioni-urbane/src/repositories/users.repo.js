import db from '../db/database.js';

export const getLeaderboard = (limit = 50) => {
  return db.prepare('SELECT id, username, points FROM users ORDER BY points DESC LIMIT ?').all(limit);
};

export const findById = (id) => {
  return db.prepare('SELECT id, username, points, role, created_at FROM users WHERE id = ?').get(id);
};

export const findByEmail = (email) => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

export const getUserBadges = (userId) => {
  return db.prepare(`
    SELECT b.*, ub.earned_at 
    FROM user_badges ub 
    JOIN badges b ON ub.badge_id = b.id 
    WHERE ub.user_id = ?
    ORDER BY ub.earned_at DESC
  `).all(userId);
};

export const createUser = (username, email, password) => {
  const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, password);
  return result.lastInsertRowid;
};
