const InventoryItem = require('../models/InventoryItem');
const LowStockLog = require('../models/LowStockLog');

// Add inventory item (vendor)
exports.addItem = async (req, res) => {
  try {
    const { name, partNumber, quantity, unitPrice, isGenuine } = req.body;

    const item = new InventoryItem({
      vendorId: req.user.userId,
      name,
      partNumber,
      quantity,
      unitPrice,
      isGenuine
    });

    await item.save();
    res.status(201).json({ message: 'Inventory item added', itemId: item._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update inventory quantity (vendor)
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    const item = await InventoryItem.findOneAndUpdate(
      { _id: id, vendorId: req.user.userId },
      update,
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.json({ message: 'Inventory item updated', item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List inventory items (vendor)
exports.getInventory = async (req, res) => {
  try {
    const items = await InventoryItem.find({ vendorId: req.user.userId });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLowStockLogs = async (req, res) => {
  try {
    const logs = await LowStockLog.find({ vendorId: req.user.userId }).sort({ loggedAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
