const Vehicle = require('../models/Vehicle');

// Register a vehicle (customer)
exports.addVehicle = async (req, res) => {
  try {
    const { vendorId, type, brand, model, registrationNumber, fuelType, year } = req.body;

    const exists = await Vehicle.findOne({ registrationNumber });
    if (exists) return res.status(400).json({ message: 'Vehicle already registered' });

    const vehicle = new Vehicle({
      customerId: req.user.userId,
      vendorId,
      type, brand, model, registrationNumber, fuelType, year
    });

    await vehicle.save();
    res.status(201).json({ message: 'Vehicle registered', vehicleId: vehicle._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get customer’s vehicles
exports.getCustomerVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ customerId: req.user.userId });
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vendor's vehicles (across customers)
exports.getVendorVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ vendorId: req.user.userId }).populate('customerId', 'name email');
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
