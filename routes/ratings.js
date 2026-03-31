const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratingsController');
const reviewController = require('../controllers/ReviewController');

router.get('/', ratingsController.getAllStores);
router.get('/:storeId', ratingsController.getStoreById);
router.get('/:storeId/review/new', reviewController.getNewReview);
router.post('/:storeId/review/new', reviewController.postNewReview);

module.exports = router;