import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Nurse from '../models/Nurse.js';
import Patient from '../models/Patient.js';
import Department from '../models/Department.js';
import Bed from '../models/Bed.js';
import Appointment from '../models/Appointment.js';
import Billing from '../models/Billing.js';
import { generateDoctorId, generateNurseId } from '../utils/idGenerator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalPatients = await Patient.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const totalNurses = await Nurse.countDocuments();
  const totalDepartments = await Department.countDocuments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = await Appointment.countDocuments({
    appointmentDate: { $gte: today, $lt: tomorrow }
  });

  const beds = await Bed.find();
  const bedStats = {
    total: beds.length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    vacant: beds.filter(b => b.status === 'vacant').length
  };

  const todayRevenue = await Billing.aggregate([
    {
      $match: {
        createdAt: { $gte: today, $lt: tomorrow }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amountPaid' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalPatients,
        totalDoctors,
        totalNurses,
        totalDepartments,
        todayAppointments,
        bedStats,
        todayRevenue: todayRevenue[0]?.total || 0
      }
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive } = req.query;

  const query = {};
  if (role) query.role = role;
  if (isActive) query.isActive = isActive === 'true';

  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Create user with role
// @route   POST /api/admin/users
// @access  Private (Admin)
export const createUser = asyncHandler(async (req, res) => {
  const { email, password, role, firstName, lastName, phone, dateOfBirth, gender, address, roleSpecificData } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Create user
  const user = await User.create({
    email,
    password,
    role,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    address,
    isActive: true
  });

  // Create role-specific profile
  let profile = null;

  if (role === 'doctor' && roleSpecificData) {
    profile = await Doctor.create({
      user: user._id,
      employeeId: generateDoctorId(),
      ...roleSpecificData
    });
  } else if (role === 'nurse' && roleSpecificData) {
    profile = await Nurse.create({
      user: user._id,
      employeeId: generateNurseId(),
      ...roleSpecificData
    });
  }

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user, profile }
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

// @desc    Delete user (deactivate)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully'
  });
});

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private (Admin)
export const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find()
    .populate('head', 'firstName lastName email')
    .sort({ name: 1 })
    .lean();

  // Get doctor count for each department
  const departmentsWithCount = await Promise.all(
    departments.map(async (dept) => {
      const doctorCount = await Doctor.countDocuments({ department: dept._id });
      return {
        ...dept,
        doctorCount
      };
    })
  );

  res.status(200).json({
    success: true,
    count: departmentsWithCount.length,
    data: departmentsWithCount
  });
});

// @desc    Get doctors by department
// @route   GET /api/admin/departments/:id/doctors
// @access  Private (Admin)
export const getDepartmentDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find({ department: req.params.id })
    .populate('user', 'firstName lastName email phone')
    .lean();

  // Filter out doctors without user data and sort manually
  const validDoctors = doctors
    .filter(doc => doc.user)
    .sort((a, b) => {
      const nameA = a.user.firstName?.toLowerCase() || '';
      const nameB = b.user.firstName?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });

  res.status(200).json({
    success: true,
    count: validDoctors.length,
    data: validDoctors
  });
});

// @desc    Create department
// @route   POST /api/admin/departments
// @access  Private (Admin)
export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: department
  });
});

// @desc    Update department
// @route   PUT /api/admin/departments/:id
// @access  Private (Admin)
export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: department
  });
});

// @desc    Delete department
// @route   DELETE /api/admin/departments/:id
// @access  Private (Admin)
export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);

  if (!department) {
    return res.status(404).json({
      success: false,
      message: 'Department not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Department deleted successfully'
  });
});

// @desc    Get all beds
// @route   GET /api/admin/beds
// @access  Private (Admin)
export const getAllBeds = asyncHandler(async (req, res) => {
  const beds = await Bed.find()
    .populate({
      path: 'currentPatient',
      populate: {
        path: 'user',
        select: 'firstName lastName email phone gender'
      }
    })
    .populate({
      path: 'assignedDoctor',
      select: 'firstName lastName email phone'
    })
    .populate({
      path: 'assignedNurse',
      select: 'firstName lastName email phone'
    })
    .sort({ bedNumber: 1 });

  res.status(200).json({
    success: true,
    count: beds.length,
    data: beds
  });
});

// @desc    Create bed
// @route   POST /api/admin/beds
// @access  Private (Admin)
export const createBed = asyncHandler(async (req, res) => {
  const bed = await Bed.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Bed created successfully',
    data: bed
  });
});

// @desc    Update bed
// @route   PUT /api/admin/beds/:id
// @access  Private (Admin)
export const updateBed = asyncHandler(async (req, res) => {
  const bed = await Bed.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!bed) {
    return res.status(404).json({
      success: false,
      message: 'Bed not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Bed updated successfully',
    data: bed
  });
});

// @desc    Delete bed
// @route   DELETE /api/admin/beds/:id
// @access  Private (Admin)
export const deleteBed = asyncHandler(async (req, res) => {
  const bed = await Bed.findByIdAndDelete(req.params.id);

  if (!bed) {
    return res.status(404).json({
      success: false,
      message: 'Bed not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Bed deleted successfully'
  });
});

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getSystemAnalytics = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  let startDate = new Date();
  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === 'year') {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const appointmentStats = await Appointment.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const revenueStats = await Billing.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: '$billType',
        revenue: { $sum: '$amountPaid' },
        count: { $sum: 1 }
      }
    }
  ]);

  const userGrowth = await User.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      appointmentStats,
      revenueStats,
      userGrowth
    }
  });
});
