const express = require('express');
const router = express.Router();
const ReviewController = require('./../controllers/ReviewController');

router.get('/', ReviewController.getReviewsPage);

// router.get('/tea/:teaId', ReviewController.getReviewsByTea);

// router.get('/stats/:teaId', ReviewController.getTeaStats);

router.post('/create', ReviewController.createReview);

router.get('/create', ReviewController.showReviewForm);


module.exports = router;
