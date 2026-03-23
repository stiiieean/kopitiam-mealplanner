const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');

//

// router.get('/tea/:teaId', ReviewController.getReviewsByTea);

// router.get('/stats/:teaId', ReviewController.getTeaStats);



router.get('/home', userController.home);
router.get('/home', userController.logout);


module.exports = router;
