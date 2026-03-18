// GET /home
exports.getHome = (req, res) => {
  // TODO: uncomment once session is set up by auth teammates
  // if (!req.session.user) {
  //   return res.redirect('/login');
  // }

  // TODO: replace with req.session.user once session is integrated
  const user = req.session ? req.session.user : null;

  res.render('home', { user });
};