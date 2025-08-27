const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Vehicle Service Management System API ✅');
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const vehicleRoutes = require('./routes/vehicleRoutes');
app.use('/api/vehicles', vehicleRoutes);

const jobCardRoutes = require('./routes/jobCardRoutes');
app.use('/api/jobcards', jobCardRoutes);

const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
console.log("📦 MONGO_URI from .env:", mongoURI ? mongoURI : "❌ Not Found");

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ⚠️ For Vercel we don't listen here
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, (log) => {
    console.log(`🚀 API running on http://localhost:${PORT} + ${log}`);
  });
}

module.exports = app;
