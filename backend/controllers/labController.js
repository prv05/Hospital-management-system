import LabTest from '../models/LabTest.js';
import Patient from '../models/Patient.js';
import { generateLabTestId } from '../utils/idGenerator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get all lab test requests
// @route   GET /api/lab/tests
// @access  Private (Lab, Admin)
export const getAllLabTests = asyncHandler(async (req, res) => {
  const { status, urgency, date } = req.query;

  const query = {};
  
  if (status) query.status = status;
  if (urgency) query.urgency = urgency;
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    query.createdAt = { $gte: startDate, $lt: endDate };
  }

  const tests = await LabTest.find(query)
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    })
    .populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    })
    .populate('technician', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tests.length,
    data: tests
  });
});

// @desc    Create lab test request
// @route   POST /api/lab/tests
// @access  Private (Doctor, Admin)
export const createLabTest = asyncHandler(async (req, res) => {
  const { patient, doctor, testName, testCategory, urgency, appointment, cost } = req.body;

  const test = await LabTest.create({
    testId: generateLabTestId(),
    patient,
    doctor,
    testName,
    testCategory,
    urgency: urgency || 'routine',
    appointment,
    cost
  });

  // Add to patient's lab reports
  await Patient.findByIdAndUpdate(patient, {
    $push: { labReports: test._id }
  });

  res.status(201).json({
    success: true,
    message: 'Lab test request created successfully',
    data: test
  });
});

// @desc    Update test status
// @route   PATCH /api/lab/tests/:id/status
// @access  Private (Lab, Admin)
export const updateTestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const test = await LabTest.findById(req.params.id);

  if (!test) {
    return res.status(404).json({
      success: false,
      message: 'Lab test not found'
    });
  }

  test.status = status;

  if (status === 'sample-collected') {
    test.sampleCollectedAt = new Date();
    test.sampleCollectedBy = req.user._id;
  }

  if (status === 'in-process') {
    test.technician = req.user._id;
  }

  if (status === 'completed') {
    test.completedAt = new Date();
  }

  await test.save();

  res.status(200).json({
    success: true,
    message: 'Test status updated successfully',
    data: test
  });
});

// @desc    Add test results
// @route   PUT /api/lab/tests/:id/results
// @access  Private (Lab, Admin)
export const addTestResults = asyncHandler(async (req, res) => {
  const { results, notes } = req.body;

  const test = await LabTest.findById(req.params.id);

  if (!test) {
    return res.status(404).json({
      success: false,
      message: 'Lab test not found'
    });
  }

  test.results = results;
  test.notes = notes;
  test.status = 'completed';
  test.completedAt = new Date();
  test.technician = req.user._id;

  await test.save();

  res.status(200).json({
    success: true,
    message: 'Test results added successfully',
    data: test
  });
});

// @desc    Get test by ID
// @route   GET /api/lab/tests/:id
// @access  Private
export const getTestById = asyncHandler(async (req, res) => {
  const test = await LabTest.findById(req.params.id)
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    })
    .populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    })
    .populate('technician', 'firstName lastName')
    .populate('sampleCollectedBy', 'firstName lastName');

  if (!test) {
    return res.status(404).json({
      success: false,
      message: 'Lab test not found'
    });
  }

  res.status(200).json({
    success: true,
    data: test
  });
});

// @desc    Get lab analytics
// @route   GET /api/lab/analytics
// @access  Private (Lab, Admin)
export const getLabAnalytics = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;

  let startDate = new Date();
  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  }

  const analytics = await LabTest.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $facet: {
        statusBreakdown: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        categoryBreakdown: [
          {
            $group: {
              _id: '$testCategory',
              count: { $sum: 1 },
              revenue: { $sum: '$cost' }
            }
          }
        ],
        urgencyBreakdown: [
          {
            $group: {
              _id: '$urgency',
              count: { $sum: 1 }
            }
          }
        ],
        dailyTests: [
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ],
        totalStats: [
          {
            $group: {
              _id: null,
              totalTests: { $sum: 1 },
              completedTests: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              },
              totalRevenue: { $sum: '$cost' }
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

// @desc    Get pending tests
// @route   GET /api/lab/pending
// @access  Private (Lab, Admin)
export const getPendingTests = asyncHandler(async (req, res) => {
  const pendingTests = await LabTest.find({
    status: { $in: ['requested', 'sample-collected', 'in-process'] }
  })
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    })
    .populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    })
    .sort({ urgency: -1, createdAt: 1 });

  res.status(200).json({
    success: true,
    count: pendingTests.length,
    data: pendingTests
  });
});
