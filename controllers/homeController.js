// GET /home
exports.getHome = (req, res) => {
  // TODO: uncomment once session is set up by auth teammates
  // if (!req.session.user) {
  //   return res.redirect('/login');
  // }

  const user = req.session ? req.session.user : null;

  res.render('home', { user });
};

// GET /logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
