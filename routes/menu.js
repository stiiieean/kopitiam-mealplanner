const express = require('express');
const teaController = require('../controllers/TeaController');
const router = express.Router();

// Define a GET route to display the list of teas
router.get("/", teaController.getAllTeas);

module.exports = router;
