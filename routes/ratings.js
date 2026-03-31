const express = require('express');
const router = express.Router();
const ratingsController = require('../controllers/ratingsController');
const reviewController = require('../controllers/ReviewController');
const storeController = require('../controllers/storeController');
const { requireLogin, requireAdmin } = require('../middleware/auth');

// /new must be registered before /:storeId to avoid Express treating "new" as a storeId
router.get('/new', requireLogin, storeController.getNewStore);
router.post('/new', requireLogin, storeController.postNewStore);

router.get('/', requireLogin, ratingsController.getAllStores);
router.get('/:storeId', requireLogin, ratingsController.getStoreById);
router.get('/:storeId/review/new', requireLogin, reviewController.getNewReview);
router.post('/:storeId/review/new', requireLogin, reviewController.postNewReview);
router.get('/:storeId/edit', requireLogin, requireAdmin, storeController.getEditStore);
router.post('/:storeId/edit', requireLogin, requireAdmin, storeController.postEditStore);
router.post('/:storeId/delete', requireLogin, requireAdmin, storeController.deleteStore);

module.exports = router;
