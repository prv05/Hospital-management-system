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

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;

  // Calculate date range based on period
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  // Get current period stats
  const totalPatients = await Patient.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const totalAppointments = await Appointment.countDocuments({
    createdAt: { $gte: startDate }
  });

  // Get previous period for comparison
  const previousStartDate = new Date(startDate);
  previousStartDate.setTime(startDate.getTime() - (now.getTime() - startDate.getTime()));
  
  const previousPatients = await Patient.countDocuments({
    createdAt: { $lt: startDate, $gte: previousStartDate }
  });

  // Calculate total revenue
  const revenueData = await Billing.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amountPaid' }
      }
    }
  ]);

  const previousRevenueData = await Billing.aggregate([
    {
      $match: {
        createdAt: { $lt: startDate, $gte: previousStartDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amountPaid' }
      }
    }
  ]);

  const totalRevenue = revenueData[0]?.total || 0;
  const previousRevenue = previousRevenueData[0]?.total || 0;

  // Calculate growth percentages
  const patientGrowth = previousPatients > 0 
    ? (((totalPatients - previousPatients) / previousPatients) * 100).toFixed(1)
    : 0;
  
  const revenueGrowth = previousRevenue > 0
    ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
    : 0;

  // Get revenue by department
  const revenueByDepartment = await Billing.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $lookup: {
        from: 'appointments',
        localField: 'appointment',
        foreignField: '_id',
        as: 'appointmentData'
      }
    },
    {
      $unwind: {
        path: '$appointmentData',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'doctors',
        localField: 'appointmentData.doctor',
        foreignField: '_id',
        as: 'doctorData'
      }
    },
    {
      $unwind: {
        path: '$doctorData',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'doctorData.department',
        foreignField: '_id',
        as: 'departmentData'
      }
    },
    {
      $unwind: {
        path: '$departmentData',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$departmentData.name',
        revenue: { $sum: '$amountPaid' }
      }
    },
    {
      $sort: { revenue: -1 }
    }
  ]);

  // Get monthly performance (last 6 months)
  const monthlyPerformance = await Billing.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$amountPaid' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  // Format monthly performance
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedMonthly = monthlyPerformance.map(item => ({
    month: months[item._id.month - 1],
    year: item._id.year,
    revenue: item.revenue,
    patients: item.count
  }));

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalPatients,
      totalDoctors,
      totalAppointments,
      revenueGrowth: parseFloat(revenueGrowth),
      patientGrowth: parseFloat(patientGrowth),
      revenueByDepartment,
      monthlyPerformance: formattedMonthly
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
      ...roleSpecificData,
      isAvailable: roleSpecificData.isAvailable !== undefined ? roleSpecificData.isAvailable : true,
      isOnLeave: roleSpecificData.isOnLeave || false
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

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin)
export const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find()
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'firstName lastName email phone'
      }
    })
    .populate({
      path: 'doctor',
      populate: {
        path: 'user',
        select: 'firstName lastName email phone'
      },
      select: 'specialization qualification department'
    })
    .populate('department', 'name code')
    .lean();

  // Sort manually to handle undefined dates
  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = a.appointmentDate ? new Date(a.appointmentDate).getTime() : 0;
    const dateB = b.appointmentDate ? new Date(b.appointmentDate).getTime() : 0;
    
    if (dateB !== dateA) {
      return dateB - dateA; // Sort by date descending
    }
    
    // If dates are equal, sort by time
    const timeA = a.appointmentTime || '';
    const timeB = b.appointmentTime || '';
    return timeB.localeCompare(timeA);
  });

  res.status(200).json({
    success: true,
    count: sortedAppointments.length,
    data: sortedAppointments
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

// @desc    Assign patient to nurse
// @route   POST /api/admin/nurses/:nurseId/assign-patient
// @access  Private (Admin)
export const assignPatientToNurse = asyncHandler(async (req, res) => {
  const { nurseId } = req.params;
  const { patientId, bedNumber } = req.body;

  if (!patientId) {
    return res.status(400).json({
      success: false,
      message: 'Patient ID is required'
    });
  }

  const nurse = await Nurse.findById(nurseId);
  if (!nurse) {
    return res.status(404).json({
      success: false,
      message: 'Nurse not found'
    });
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Check if patient is already assigned
  const existingAssignment = nurse.assignedPatients.find(
    ap => ap.patient.toString() === patientId && ap.status === 'active'
  );

  if (existingAssignment) {
    return res.status(400).json({
      success: false,
      message: 'Patient is already assigned to this nurse'
    });
  }

  // Add patient to nurse's assigned patients
  nurse.assignedPatients.push({
    patient: patientId,
    assignedDate: new Date(),
    bedNumber: bedNumber || 'N/A',
    status: 'active'
  });

  await nurse.save();

  const updatedNurse = await Nurse.findById(nurseId)
    .populate('user')
    .populate({
      path: 'assignedPatients.patient',
      populate: { path: 'user' }
    });

  res.status(200).json({
    success: true,
    message: 'Patient assigned to nurse successfully',
    data: updatedNurse
  });
});

// @desc    Unassign patient from nurse
// @route   DELETE /api/admin/nurses/:nurseId/unassign-patient/:patientId
// @access  Private (Admin)
export const unassignPatientFromNurse = asyncHandler(async (req, res) => {
  const { nurseId, patientId } = req.params;

  const nurse = await Nurse.findById(nurseId);
  if (!nurse) {
    return res.status(404).json({
      success: false,
      message: 'Nurse not found'
    });
  }

  // Find and update the assignment status
  const assignment = nurse.assignedPatients.find(
    ap => ap.patient.toString() === patientId && ap.status === 'active'
  );

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Patient assignment not found'
    });
  }

  assignment.status = 'discharged';
  await nurse.save();

  res.status(200).json({
    success: true,
    message: 'Patient unassigned from nurse successfully'
  });
});
