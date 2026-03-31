// Redirect to login if not logged in
exports.requireLogin = (req, res, next) => {
  if (req.session && req.session.user) return next();
  res.redirect('/login');
};

// Redirect to home if not an admin
exports.requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next();
  res.status(403).redirect('/home');
};
