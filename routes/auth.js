const express = require('express');
const router = express.Router();
const auth = require('../controllers/Auth');

router.get('/home', auth.home);

router.get('/stats', auth.stats);

router.get('/register', auth.getRegister);

router.post('/register', auth.postRegister);

router.get('/login',auth.getLogin);

router.post('/login', auth.postLogin);

module.exports = router;