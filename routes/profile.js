const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/login');
}

router.get('/', isAuthenticated, profileController.getProfile);
router.post('/', isAuthenticated, profileController.postProfile);

module.exports = router;
