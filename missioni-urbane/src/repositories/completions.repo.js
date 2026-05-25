import db from '../db/database.js';

export const acceptMission = (userId, missionId) => {
  const result = db.prepare(
    'INSERT INTO completions (user_id, mission_id, status) VALUES (?, ?, ?)'
  ).run(userId, missionId, 'accettata');
  return result.lastInsertRowid;
};

export const submitProof = (userId, missionId, proofText, proofImage) => {
  const result = db.prepare(`
    UPDATE completions
    SET status = 'in_attesa', proof_text = ?, proof_image = ?
    WHERE user_id = ? AND mission_id = ? AND (status = 'accettata' OR status = 'rifiutata')
  `).run(proofText || null, proofImage, userId, missionId);
  return result.changes;
};

export const verifyCompletion = (completionId, verifiedByUserId) => {
  const result = db.prepare(`
    UPDATE completions 
    SET status = 'completata', verified_by = ?, verified_at = datetime('now') 
    WHERE id = ?
  `).run(verifiedByUserId, completionId);
  return result.changes;
};

export const rejectCompletion = (completionId, feedback, verifiedByUserId) => {
  const result = db.prepare(`
    UPDATE completions 
    SET status = 'rifiutata', feedback = ?, verified_by = ?, verified_at = datetime('now') 
    WHERE id = ?
  `).run(feedback || 'La prova non soddisfa i requisiti', verifiedByUserId, completionId);
  return result.changes;
};

export const assignBadges = (userId, badgeId) => {
  try {
    db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, badgeId);
    return true;
  } catch(e) {
    return false; // Già ottenuto o errore
  }
};

export const getByUserId = (userId) => {
  return db.prepare(`
    SELECT c.*, m.title, m.points as mission_points, m.category
    FROM completions c
    JOIN missions m ON c.mission_id = m.id
    WHERE c.user_id = ?
    ORDER BY c.accepted_at DESC
  `).all(userId);
};

export const getPending = () => {
  return db.prepare(`
    SELECT c.*, m.title as mission_title, u.username
    FROM completions c
    JOIN missions m ON c.mission_id = m.id
    JOIN users u ON c.user_id = u.id
    WHERE c.status = 'in_attesa'
    ORDER BY c.accepted_at ASC
  `).all();
};

export const getById = (id) => {
  return db.prepare(
    'SELECT c.*, m.points FROM completions c JOIN missions m ON c.mission_id = m.id WHERE c.id = ?'
  ).get(id);
};
