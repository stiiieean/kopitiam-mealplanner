const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratingsController');
const reviewController = require('../controllers/ReviewController');
const { requireLogin } = require('../middleware/auth');

router.get('/', requireLogin, ratingsController.getAllStores);
router.get('/:storeId', requireLogin, ratingsController.getStoreById);
router.get('/:storeId/review/new', requireLogin, reviewController.getNewReview);
router.post('/:storeId/review/new', requireLogin, reviewController.postNewReview);

module.exports = router;
