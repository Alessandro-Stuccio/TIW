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
  const verifyTx = db.transaction(() => {
    const comp = db.prepare('SELECT * FROM completions WHERE id = ?').get(completionId);
    if (!comp || comp.status === 'completata') return;
    
    const mission = db.prepare('SELECT points FROM missions WHERE id = ?').get(comp.mission_id);

    db.prepare(`
      UPDATE completions 
      SET status = 'completata', verified_by = ?, verified_at = datetime('now') 
      WHERE id = ?
    `).run(verifiedByUserId, completionId);

    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(mission.points, comp.user_id);

    assignBadges(comp.user_id);
  });
  
  verifyTx();
};

export const rejectCompletion = (completionId, feedback, verifiedByUserId) => {
  const result = db.prepare(`
    UPDATE completions 
    SET status = 'rifiutata', feedback = ?, verified_by = ?, verified_at = datetime('now') 
    WHERE id = ?
  `).run(feedback || 'La prova non soddisfa i requisiti', verifiedByUserId, completionId);
  return result.changes;
};

export const assignBadges = (userId) => {
  const completions = db.prepare(`
    SELECT c.proof_image, m.category 
    FROM completions c 
    JOIN missions m ON c.mission_id = m.id 
    WHERE c.user_id = ? AND c.status = 'completata'
  `).all(userId);
  
  const badges = db.prepare('SELECT id, condition FROM badges').all();
  const cats = new Set(completions.map(c => c.category));
  
  for (let b of badges) {
    let earned = false;
    if (b.condition === 'first_mission' && completions.length >= 1) earned = true;
    if (b.condition === '5_missions' && completions.length >= 5) earned = true;
    if (b.condition === '10_missions' && completions.length >= 10) earned = true;
    if (b.condition === 'has_photo' && completions.some(c => c.proof_image !== null)) earned = true;
    if (b.condition === 'all_categories' && cats.size >= 4) earned = true;
    
    if (earned) {
      try {
        db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, b.id);
      } catch(e) {}
    }
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
