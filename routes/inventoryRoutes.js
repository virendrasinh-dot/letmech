const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const inventoryController = require('../controllers/inventoryController');

// Vendor adds inventory
router.post('/', auth(['vendor']), inventoryController.addItem);

// Vendor updates inventory
router.put('/:id', auth(['vendor']), inventoryController.updateItem);

// Vendor views low stock logs (specific first)
router.get('/low-stock', auth(['vendor']), inventoryController.getLowStockLogs);

// Vendor views inventory (general last)
router.get('/', auth(['vendor']), inventoryController.getInventory);

module.exports = router;
