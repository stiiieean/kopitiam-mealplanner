const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireLogin, requireAdmin } = require('../middleware/auth');

router.get('/', requireLogin, requireAdmin, adminController.getDashboard);
router.post('/users/create', requireLogin, requireAdmin, adminController.createUser);
router.post('/users/:userId/role', requireLogin, requireAdmin, adminController.updateRole);
router.post('/users/:userId/delete', requireLogin, requireAdmin, adminController.deleteUser);

module.exports = router;
