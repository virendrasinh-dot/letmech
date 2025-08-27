const mongoose = require('mongoose');

const lowStockLogSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partName: { type: String, required: true },
  quantity: { type: Number, required: true },
  loggedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LowStockLog', lowStockLogSchema);
