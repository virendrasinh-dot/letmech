const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  partNumber: String,
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  isGenuine: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
