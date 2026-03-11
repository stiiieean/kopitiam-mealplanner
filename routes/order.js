const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

router.get('/', OrderController.createOrder);

// router.post('/create', OrderController.createOrder);

// router.get('/history/:customerId', OrderController.getOrderHistory);

// router.get('/:orderId', OrderController.getOrderById);

module.exports = router;

