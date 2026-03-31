const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireLogin } = require('../middleware/auth');

router.get('/', requireLogin, profileController.getProfile);
router.post('/', requireLogin, profileController.postProfile);
router.post('/delete', requireLogin, profileController.deleteAccount);

module.exports = router;
