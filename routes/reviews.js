const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');

router.get('/review/:reviewId/edit', ReviewController.getEditReview);
router.post('/review/:reviewId/edit', ReviewController.postEditReview);

router.post('/review/:reviewId/delete', ReviewController.deleteReview);

module.exports = router;
