const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const vehicleController = require('../controllers/vehicleController');

// Customer adds vehicle
router.post('/', auth(['customer']), vehicleController.addVehicle);

// Customer gets their vehicles
router.get('/me', auth(['customer']), vehicleController.getCustomerVehicles);

// Vendor views vehicles assigned to them
router.get('/vendor', auth(['vendor']), vehicleController.getVendorVehicles);

module.exports = router;
