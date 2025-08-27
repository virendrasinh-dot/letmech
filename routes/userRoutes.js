const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Admin creates vendor
router.post('/vendor', auth(['admin']), userController.createVendor);

// Vendor creates employee
router.post('/employee', auth(['vendor']), userController.createEmployee);

// Vendor lists their employees
router.get('/employees', auth(['vendor']), userController.getEmployees);

// Logged-in user fetches own profile
router.get('/me', auth(['admin', 'vendor', 'employee', 'customer']), userController.getMe);

module.exports = router;
