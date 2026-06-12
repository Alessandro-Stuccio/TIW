// Middleware per proteggere le rotte che richiedono il login.
// Se la sessione non è valida, l'utente viene reindirizzato alla pagina di login.
export const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/auth/login');
};

// Middleware per proteggere le rotte sensibili del Quartier Generale.
// L'accesso è consentito ESCLUSIVAMENTE agli amministratori.
export const requireAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  }
  res.status(403).render('errors/403');
};

// Middleware per l'accesso alle funzionalità di moderazione (es. verifica prove).
// È accessibile sia ai Moderatori diretti sia agli Admin (che ereditano implicitamente tali permessi).
export const requireModerator = (req, res, next) => {
  if (req.session && req.session.userId && (req.session.role === 'admin' || req.session.role === 'moderator')) {
    return next();
  }
  res.status(403).render('errors/403');
};
