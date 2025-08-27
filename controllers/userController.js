const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Admin creates vendor
exports.createVendor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Vendor already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    const vendor = new User({
      name,
      email,
      passwordHash,
      role: 'vendor',
    });
    

    await vendor.save();
    res.status(201).json({ message: 'Vendor created', vendorId: vendor._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vendor creates employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Employee already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    const employee = new User({
      name,
      email,
      passwordHash,
      role: 'employee',
      vendorId: req.user.userId, // vendor creating employee
    });

    await employee.save();
    res.status(201).json({ message: 'Employee created', employeeId: employee._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vendor gets employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee', vendorId: req.user.userId })
      .select('-passwordHash');
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// controllers/userController.js
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
