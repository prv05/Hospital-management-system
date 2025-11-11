import Medicine from '../models/Medicine.js';
import Prescription from '../models/Prescription.js';
import Billing from '../models/Billing.js';
import { generateMedicineId, generateBillId } from '../utils/idGenerator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get all medicines
// @route   GET /api/pharmacy/medicines
// @access  Private (Pharmacy, Admin)
export const getAllMedicines = asyncHandler(async (req, res) => {
  const { search, category, lowStock, expiringSoon } = req.query;

  let query = { isActive: true };

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { genericName: new RegExp(search, 'i') }
    ];
  }

  if (category) {
    query.category = category;
  }

  const medicines = await Medicine.find(query).sort({ name: 1 });

  let filteredMedicines = medicines;

  if (lowStock === 'true') {
    filteredMedicines = medicines.filter(med => med.isLowStock);
  }

  if (expiringSoon === 'true') {
    filteredMedicines = medicines.filter(med => med.isExpiringSoon);
  }

  res.status(200).json({
    success: true,
    count: filteredMedicines.length,
    data: filteredMedicines
  });
});

// @desc    Add new medicine
// @route   POST /api/pharmacy/medicines
// @access  Private (Pharmacy, Admin)
export const addMedicine = asyncHandler(async (req, res) => {
  const medicineData = {
    ...req.body,
    medicineId: generateMedicineId()
  };

  const medicine = await Medicine.create(medicineData);

  res.status(201).json({
    success: true,
    message: 'Medicine added successfully',
    data: medicine
  });
});

// @desc    Update medicine
// @route   PUT /api/pharmacy/medicines/:id
// @access  Private (Pharmacy, Admin)
export const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Medicine updated successfully',
    data: medicine
  });
});

// @desc    Delete medicine
// @route   DELETE /api/pharmacy/medicines/:id
// @access  Private (Pharmacy, Admin)
export const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  medicine.isActive = false;
  await medicine.save();

  res.status(200).json({
    success: true,
    message: 'Medicine deleted successfully'
  });
});

// @desc    Dispense medicine
// @route   POST /api/pharmacy/dispense
// @access  Private (Pharmacy)
export const dispenseMedicine = asyncHandler(async (req, res) => {
  const { prescriptionId, medicines } = req.body;

  const prescription = await Prescription.findById(prescriptionId)
    .populate('patient');

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }

  if (prescription.isDispensed) {
    return res.status(400).json({
      success: false,
      message: 'Prescription already dispensed'
    });
  }

  // Prepare billing items and update medicine stock
  const billingItems = [];
  let subtotal = 0;

  for (const prescribedMedicine of prescription.medicines) {
    // Find the medicine in inventory by name
    const medicine = await Medicine.findOne({ 
      name: { $regex: new RegExp(prescribedMedicine.medicineName, 'i') }
    });
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: `Medicine "${prescribedMedicine.medicineName}" not found in inventory`
      });
    }

    const quantity = prescribedMedicine.quantity || 1;

    if (medicine.stock.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock.quantity}, Required: ${quantity}`
      });
    }

    const unitPrice = medicine.price?.sellingPrice || 0;
    const totalPrice = unitPrice * quantity;

    // Add to billing items
    billingItems.push({
      itemType: 'medicine',
      description: `${medicine.name} - ${prescribedMedicine.dosage} (${prescribedMedicine.frequency} for ${prescribedMedicine.duration})`,
      quantity: quantity,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      date: new Date()
    });

    subtotal += totalPrice;

    // Update medicine stock
    medicine.stock.quantity -= quantity;
    medicine.totalDispensed = (medicine.totalDispensed || 0) + quantity;
    await medicine.save();
  }

  // Calculate tax (9% CGST + 9% SGST = 18% total)
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const totalAmount = subtotal + cgst + sgst;

  // Create billing record
  const billing = await Billing.create({
    billId: generateBillId(),
    patient: prescription.patient._id,
    billType: 'Pharmacy',
    billDate: new Date(),
    items: billingItems,
    subtotal: subtotal,
    tax: {
      cgst: cgst,
      sgst: sgst,
      igst: 0
    },
    totalAmount: totalAmount,
    amountPaid: 0,
    balanceAmount: totalAmount,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    generatedBy: req.user._id
  });

  // Update prescription
  prescription.isDispensed = true;
  prescription.dispensedBy = req.user._id;
  prescription.dispensedAt = new Date();
  await prescription.save();

  res.status(200).json({
    success: true,
    message: 'Medicines dispensed successfully and bill generated',
    data: {
      prescription,
      billing
    }
  });
});

// @desc    Update stock
// @route   PATCH /api/pharmacy/medicines/:id/stock
// @access  Private (Pharmacy, Admin)
export const updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body; // operation: 'add' or 'remove'

  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  if (operation === 'add') {
    medicine.stock.quantity += quantity;
    medicine.lastRestocked = new Date();
  } else if (operation === 'remove') {
    if (medicine.stock.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }
    medicine.stock.quantity -= quantity;
  }

  await medicine.save();

  res.status(200).json({
    success: true,
    message: 'Stock updated successfully',
    data: medicine
  });
});

// @desc    Get pharmacy analytics
// @route   GET /api/pharmacy/analytics
// @access  Private (Pharmacy, Admin)
export const getPharmacyAnalytics = asyncHandler(async (req, res) => {
  const totalMedicines = await Medicine.countDocuments({ isActive: true });
  
  const medicines = await Medicine.find({ isActive: true });
  
  const lowStockCount = medicines.filter(m => m.isLowStock).length;
  const expiredCount = medicines.filter(m => m.isExpired).length;
  const expiringSoonCount = medicines.filter(m => m.isExpiringSoon).length;

  const categoryBreakdown = await Medicine.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalStock: { $sum: '$stock.quantity' }
      }
    }
  ]);

  const recentDispensed = await Prescription.find({ isDispensed: true })
    .sort({ dispensedAt: -1 })
    .limit(10)
    .populate('patient doctor');

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalMedicines,
        lowStockCount,
        expiredCount,
        expiringSoonCount
      },
      categoryBreakdown,
      recentDispensed
    }
  });
});

// @desc    Get stock alerts
// @route   GET /api/pharmacy/alerts
// @access  Private (Pharmacy, Admin)
export const getStockAlerts = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({ isActive: true });

  const alerts = {
    lowStock: medicines.filter(m => m.isLowStock),
    expired: medicines.filter(m => m.isExpired),
    expiringSoon: medicines.filter(m => m.isExpiringSoon)
  };

  res.status(200).json({
    success: true,
    data: alerts
  });
});

// @desc    Get all prescriptions
// @route   GET /api/pharmacy/prescriptions
// @access  Private (Pharmacy, Admin)
export const getAllPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find()
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
});

// @desc    Get single prescription
// @route   GET /api/pharmacy/prescriptions/:id
// @access  Private (Pharmacy, Admin)
export const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }

  res.status(200).json({
    success: true,
    data: prescription
  });
});
