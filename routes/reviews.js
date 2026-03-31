const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { requireLogin } = require('../middleware/auth');

router.get('/review/:reviewId/edit', requireLogin, ReviewController.getEditReview);
router.post('/review/:reviewId/edit', requireLogin, ReviewController.postEditReview);
router.post('/review/:reviewId/delete', requireLogin, ReviewController.deleteReview);

module.exports = router;
