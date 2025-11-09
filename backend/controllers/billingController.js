import Billing from '../models/Billing.js';
import Patient from '../models/Patient.js';
import { generateBillId } from '../utils/idGenerator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Generate new bill
// @route   POST /api/billing/generate
// @access  Private (Billing Staff, Admin)
export const generateBill = asyncHandler(async (req, res) => {
  const { patient, billType, items, discount, tax, appointment, admission, insurance, notes } = req.body;

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Calculate discount amount
  let discountAmount = 0;
  if (discount) {
    if (discount.percentage) {
      discountAmount = (subtotal * discount.percentage) / 100;
    } else if (discount.amount) {
      discountAmount = discount.amount;
    }
  }

  // Calculate tax
  const taxAmount = (tax?.cgst || 0) + (tax?.sgst || 0) + (tax?.igst || 0);

  // Calculate total
  const totalAmount = subtotal - discountAmount + taxAmount;

  const bill = await Billing.create({
    billId: generateBillId(),
    patient,
    billType,
    items,
    subtotal,
    discount: discount || { amount: 0, percentage: 0 },
    tax: tax || { cgst: 0, sgst: 0, igst: 0 },
    totalAmount,
    balanceAmount: totalAmount,
    appointment,
    admission,
    insurance,
    generatedBy: req.user._id,
    notes
  });

  // Update patient billing array
  await Patient.findByIdAndUpdate(patient, {
    $push: { billings: bill._id }
  });

  res.status(201).json({
    success: true,
    message: 'Bill generated successfully',
    data: bill
  });
});

// @desc    Search bills
// @route   GET /api/billing/search
// @access  Private (Billing Staff, Admin)
export const searchBills = asyncHandler(async (req, res) => {
  const { patientId, billId, phone, status, billType } = req.query;

  let query = {};

  if (billId) {
    query.billId = new RegExp(billId, 'i');
  }

  if (status) {
    query.paymentStatus = status;
  }

  if (billType) {
    query.billType = billType;
  }

  if (patientId || phone) {
    const patientQuery = {};
    if (patientId) patientQuery.patientId = new RegExp(patientId, 'i');
    if (phone) patientQuery['user.phone'] = new RegExp(phone, 'i');

    const patients = await Patient.find(patientQuery).populate('user');
    const patientIds = patients.map(p => p._id);
    query.patient = { $in: patientIds };
  }

  const bills = await Billing.find(query)
    .populate('patient')
    .populate('generatedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    count: bills.length,
    data: bills
  });
});

// @desc    Get bill by ID
// @route   GET /api/billing/:id
// @access  Private (Billing Staff, Admin, Patient)
export const getBillById = asyncHandler(async (req, res) => {
  const bill = await Billing.findById(req.params.id)
    .populate('patient')
    .populate('appointment')
    .populate('generatedBy', 'firstName lastName');

  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  res.status(200).json({
    success: true,
    data: bill
  });
});

// @desc    Add payment to bill
// @route   POST /api/billing/:id/payment
// @access  Private (Billing Staff, Admin)
export const addPayment = asyncHandler(async (req, res) => {
  const { method, amount, transactionId } = req.body;

  const bill = await Billing.findById(req.params.id);

  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  if (amount > bill.balanceAmount) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount exceeds balance'
    });
  }

  bill.paymentMethods.push({
    method,
    amount,
    transactionId,
    transactionDate: new Date()
  });

  bill.amountPaid += amount;
  bill.balanceAmount = bill.totalAmount - bill.amountPaid;

  if (bill.balanceAmount === 0) {
    bill.paymentStatus = 'paid';
  } else {
    bill.paymentStatus = 'partial';
  }

  await bill.save();

  res.status(200).json({
    success: true,
    message: 'Payment added successfully',
    data: bill
  });
});

// @desc    Get revenue analytics
// @route   GET /api/billing/analytics
// @access  Private (Billing Staff, Admin)
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;

  let startDate = new Date();
  if (period === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  }

  const analytics = await Billing.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $facet: {
        revenueByType: [
          {
            $group: {
              _id: '$billType',
              totalRevenue: { $sum: '$totalAmount' },
              totalPaid: { $sum: '$amountPaid' },
              count: { $sum: 1 }
            }
          }
        ],
        paymentStatus: [
          {
            $group: {
              _id: '$paymentStatus',
              count: { $sum: 1 },
              amount: { $sum: '$totalAmount' }
            }
          }
        ],
        dailyRevenue: [
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              revenue: { $sum: '$amountPaid' },
              bills: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ],
        totalStats: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$amountPaid' },
              totalPending: { $sum: '$balanceAmount' },
              totalBills: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: analytics[0]
  });
});

// @desc    Apply discount to bill
// @route   PATCH /api/billing/:id/discount
// @access  Private (Billing Staff, Admin)
export const applyDiscount = asyncHandler(async (req, res) => {
  const { percentage, amount, reason } = req.body;

  const bill = await Billing.findById(req.params.id);

  if (!bill) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  if (bill.paymentStatus === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot apply discount to paid bill'
    });
  }

  let discountAmount = 0;
  if (percentage) {
    discountAmount = (bill.subtotal * percentage) / 100;
    bill.discount.percentage = percentage;
  } else if (amount) {
    discountAmount = amount;
    bill.discount.amount = amount;
  }

  bill.discount.reason = reason;
  
  const taxAmount = bill.tax.cgst + bill.tax.sgst + bill.tax.igst;
  bill.totalAmount = bill.subtotal - discountAmount + taxAmount;
  bill.balanceAmount = bill.totalAmount - bill.amountPaid;

  await bill.save();

  res.status(200).json({
    success: true,
    message: 'Discount applied successfully',
    data: bill
  });
});
