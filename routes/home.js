const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { requireLogin } = require('../middleware/auth');

router.get('/', requireLogin, homeController.getHome);

module.exports = router;
