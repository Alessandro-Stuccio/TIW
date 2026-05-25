export const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Non autorizzato' });
};

export const requireAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Accesso negato: richiesti privilegi di admin' });
};

export const requireModerator = (req, res, next) => {
  if (req.session && req.session.userId && (req.session.userRole === 'admin' || req.session.userRole === 'moderator')) {
    return next();
  }
  res.status(403).json({ error: 'Accesso negato: richiesti privilegi di moderatore' });
};
