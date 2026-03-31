const User = require('../models/User');
const Review = require('../models/Review');
const Store = require('../models/Store');

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

// POST /profile/delete
exports.deleteAccount = async (req, res) => {
  const userId = req.session.user._id;

  try {
    // Find all reviews by this user
    const userReviews = await Review.find({ userid: userId });

    // Remove each review's reference from its store
    for (const review of userReviews) {
      await Store.retrieveById(review.storeId).then(store => {
        if (store) {
          store.reviews.pull(review._id);
          return store.save();
        }
      });
    }

    // Delete all reviews by the user
    await Review.deleteMany({ userid: userId });

    // Delete the user
    await User.deleteById(userId);

    // Destroy session and redirect to login
    req.session.destroy(() => {
      res.redirect('/login');
    });
  } catch (error) {
    console.error(error);
    res.send('Error deleting account');
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
