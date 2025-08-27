const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  customerId: { type: String, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // assigned vendor
  type: { type: String, enum: ['bike', 'car', 'truck', 'bus', 'other'], required: true },
  brand: String,
  model: String,
  registrationNumber: { type: String, required: true, unique: true },
  fuelType: String,
  year: Number
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
