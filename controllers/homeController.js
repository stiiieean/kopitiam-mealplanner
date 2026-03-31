// GET /home
exports.getHome = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('home', { user: req.session.user });
};
