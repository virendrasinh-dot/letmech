const JobCard = require("../models/JobCard");
const Vehicle = require("../models/Vehicle");
const generateInvoicePDF = require("../utils/invoiceGenerator");
const path = require("path");

// Create job card (employee/vendor)
exports.createJobCard = async (req, res) => {
  try {
    const {
      jcDate,
      regNo,
      jcType,
      name,
      address,
      email,
      phone,
      make,
      model,
      mileage,
      serviceAdvisor,
      mechanic,
      pickupType,
      observations,
      repairs,
    } = req.body;

    // Validate required fields
    if (!jcDate || !regNo || !jcType || !name || !email || !phone || !make || !model) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Parse date
    const date = new Date(jcDate);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // MM
    const year = date.getFullYear().toString().slice(-2); // last 2 digits
    const fullYear = date.getFullYear(); // YYYY for date calculations

    // Count existing job cards for the same month/year
    const count = await JobCard.countDocuments({
      jcDate: {
        $gte: new Date(fullYear, date.getMonth(), 1),
        $lte: new Date(fullYear, date.getMonth() + 1, 0),
      },
    });

    const incrementalNumber = String(count + 1).padStart(5, "0"); // 00001, 00002...
    const jcNo = `JC${month}${year}${incrementalNumber}`;

    // Find or create vehicle
    let vehicle = await Vehicle.findOne({ registrationNumber: regNo });
    if (!vehicle) {
      vehicle = new Vehicle({
        customerId: phone,
        vendorId: req.user.userId,
        registrationNumber: regNo,
        type: "car",
        brand: make,
        model,
      });
      await vehicle.save();
    }

    // Create job card
    const jobCard = new JobCard({
      jcNo,
      jcDate,
      regNo,
      vehicleId: vehicle._id,
      customerId: phone,
      vendorId: req.user.userId,
      createdBy: req.user.userId,
      name,
      address,
      email,
      phone,
      jcType,
      make,
      model,
      mileage,
      serviceAdvisor,
      mechanic,
      pickupType,
      observations,
      repairs,
    });

    await jobCard.save();
    res.status(201).json({ message: "Job card created", jobCardId: jobCard._id, jcNo });
  } catch (err) {
    console.error(err);
    if (err.code === 11000 && err.keyPattern?.jcNo) {
      return res.status(400).json({ message: "JC Number already exists. Try again." });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Get customer's job cards by phone
exports.getCustomerJobCards = async (req, res) => {
  try {
    const { phone } = req.query;
    const jobCards = await JobCard.find({ customerId: phone })
      .populate("vehicleId", "registrationNumber type brand model")
      .populate("createdBy", "name");
    res.json(jobCards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Close job card by updating repairs with closing details
exports.closeJobCardRepairs = async (req, res) => {
  try {
    const { id } = req.params;
    const { repairs } = req.body;

    if (!repairs || !Array.isArray(repairs) || repairs.length === 0) {
      return res.status(400).json({ message: "Repairs data is required" });
    }

    const jobCard = await JobCard.findById(id);
    if (!jobCard) return res.status(404).json({ message: "Job card not found" });

    // Update only the required fields
    jobCard.repairs = repairs;
    jobCard.isClosed = true;
    jobCard.closingDate = new Date();

    await jobCard.save(); // This will now succeed because regNo and other required fields are already set

    res.json({ message: "Job card closed successfully", jobCard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Close job card by updating repairs with closing details
exports.closeJobCardRepairs = async (req, res) => {
  try {
    const { id } = req.params;
    const { repairs } = req.body;

    if (!repairs || !Array.isArray(repairs) || repairs.length === 0) {
      return res.status(400).json({ message: "Repairs data is required" });
    }

    const jobCard = await JobCard.findById(id);
    if (!jobCard) return res.status(404).json({ message: "Job card not found" });

    jobCard.repairs = repairs; // ✅ keep parts array intact
    jobCard.status = "closed";
    jobCard.completedAt = new Date();

    // Calculate totals
    const totalPartsCost = repairs.reduce(
      (sum, r) =>
        sum + (r.parts?.reduce((s, p) => s + (p.cost || 0), 0) || 0),
      0
    );
    const totalLaborCost = repairs.reduce((sum, r) => sum + (r.laborCost || 0), 0);
    jobCard.totalCost = totalPartsCost + totalLaborCost;

    await jobCard.save();

    res.json({
      message: "Job card closed successfully",
      jobCard,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get service report
exports.getServiceReport = async (req, res) => {
  try {
    const { id } = req.params;
    const jobCard = await JobCard.findById(id)
      .populate("vehicleId")
      .populate("createdBy", "name")
      .populate("vendorId", "name");

    if (!jobCard) return res.status(404).json({ message: "Job card not found" });

    const report = {
      jobCardId: jobCard._id,
      jcNo: jobCard.jcNo,
      jcDate: jobCard.jcDate,
      vendor: jobCard.vendorId?.name,
      customer: {
        name: jobCard.name,
        email: jobCard.email,
        phone: jobCard.phone,
        address: jobCard.address,
      },
      vehicle: {
        registrationNumber: jobCard.vehicleId.registrationNumber,
        type: jobCard.vehicleId.type,
        brand: jobCard.vehicleId.brand,
        model: jobCard.vehicleId.model,
        mileage: jobCard.mileage,
      },
      serviceTeam: {
        serviceAdvisor: jobCard.serviceAdvisor,
        mechanic: jobCard.mechanic,
      },
      pickupType: jobCard.pickupType,
      observations: jobCard.observations,
      repairs: jobCard.repairs,
      createdBy: jobCard.createdBy?.name,
    };

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get job cards by vendor (or employee)
exports.getVendorJobCards = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "vendor") {
      filter = { vendorId: req.user.userId };
    } else if (req.user.role === "employee") {
      filter = { createdBy: req.user.userId };
    }

    const jobCards = await JobCard.find(filter)
      .populate("vehicleId", "registrationNumber type brand model")
      .populate("createdBy", "name")
      .populate("vendorId", "name");

    res.json(jobCards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Download invoice PDF
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const jobCard = await JobCard.findById(id)
      .populate("vehicleId")
      .populate("createdBy", "name")
      .populate("vendorId", "name");

    if (!jobCard) return res.status(404).json({ message: "Job card not found" });

    const report = {
      jobCardId: jobCard._id,
      jcNo: jobCard.jcNo,
      jcDate: jobCard.jcDate,
      vendor: jobCard.vendorId?.name,
      customer: {
        name: jobCard.name,
        email: jobCard.email,
        phone: jobCard.phone,
        address: jobCard.address,
      },
      vehicle: {
        registrationNumber: jobCard.vehicleId.registrationNumber,
        type: jobCard.vehicleId.type,
        brand: jobCard.vehicleId.brand,
        model: jobCard.vehicleId.model,
        mileage: jobCard.mileage,
      },
      serviceTeam: {
        serviceAdvisor: jobCard.serviceAdvisor,
        mechanic: jobCard.mechanic,
      },
      pickupType: jobCard.pickupType,
      observations: jobCard.observations,
      repairs: jobCard.repairs,
      createdBy: jobCard.createdBy?.name,
    };

    const filename = `invoice-${jobCard._id}.pdf`;
    const filepath = path.join(__dirname, "../invoices", filename);

    await generateInvoicePDF(report, filepath);

    res.download(filepath, filename, (err) => {
      if (err) console.error("Download error:", err);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
