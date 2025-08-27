const express = require('express');
const router = express.Router();
const jobCardController = require('../controllers/jobCardController');
const auth = require('../middleware/auth');

// Employee creates job card
router.post('/', auth(['employee', 'vendor']), jobCardController.createJobCard);

// Close job card repairs
router.post('/close/:id', auth(['employee', 'vendor']), jobCardController.closeJobCardRepairs);

// Customer fetches their job cards
router.get('/customer', auth(['customer']), jobCardController.getCustomerJobCards);

// Vendor fetches job cards
router.get('/vendor', auth(['vendor', 'employee']), jobCardController.getVendorJobCards);

// Service report
router.get('/report/:id', auth(['employee', 'vendor', 'admin']), jobCardController.getServiceReport);

// Invoice download
router.get('/invoice/:id', auth(['vendor', 'employee', 'admin']), jobCardController.downloadInvoicePDF);

module.exports = router;
