const mongoose = require("mongoose");

const partSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, default: 0 },
  remark: {
    type: String,
    enum: ["RJ", "REP", "NO", "PNA", "WO"],
    default: "",
  },
});

const repairSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  parts: [partSchema],        // Parts used for this repair
  laborCost: { type: Number, default: 0 },
  closingDate: { type: Date }, // Date when repair was closed
});

const jobCardSchema = new mongoose.Schema(
  {
    jcNo: { type: String, required: true, unique: true },
    jcDate: { type: Date, required: true },
    regNo: { type: String, required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    customerId: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    address: { type: String },
    email: { type: String },
    phone: { type: String },
    jcType: { type: String, enum: ["repair", "service", "accessories"], required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    mileage: { type: Number },
    serviceAdvisor: { type: String },
    mechanic: { type: String },
    pickupType: { type: String, enum: ["self", "pickup", "tow"] },
    observations: { type: String },
    repairs: [repairSchema],
    status: { type: String, enum: ["open", "closed"], default: "open" },
    completedAt: { type: Date },   // JC closing date
    totalCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobCard", jobCardSchema);
