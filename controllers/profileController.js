const User = require('../models/User');

// GET /profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.redirect('/login');
    res.render('profile', { user, success: null, failure: null });
  } catch (error) {
    console.error(error);
    res.send('Error loading profile');
  }
};

// POST /profile
exports.postProfile = async (req, res) => {
  const newUsername = req.body.username;

  if (!newUsername || newUsername.trim() === '') {
    const user = await User.findById(req.session.user._id);
    return res.render('profile', { user, success: null, failure: 'Username cannot be empty.' });
  }

  try {
    await User.findByIdAndUpdate(req.session.user._id, { username: newUsername.trim() });
    req.session.user.username = newUsername.trim();
    const user = await User.findById(req.session.user._id);
    res.render('profile', { user, success: 'Profile updated successfully.', failure: null });
  } catch (error) {
    console.error(error);
    res.send('Error updating profile');
  }
};
