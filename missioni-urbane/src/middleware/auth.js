export const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/auth/login');
};

export const requireAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  }
  res.status(403).render('errors/403');
};

export const requireModerator = (req, res, next) => {
  if (req.session && req.session.userId && (req.session.role === 'admin' || req.session.role === 'moderator')) {
    return next();
  }
  res.status(403).render('errors/403');
};
