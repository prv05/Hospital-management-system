import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import Admission from '../models/Admission.js';
import User from '../models/User.js';
import Bed from '../models/Bed.js';
import Department from '../models/Department.js';
import LabTest from '../models/LabTest.js';
import { generatePatientId, generateAdmissionId, generateLabTestId } from '../utils/idGenerator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get doctor dashboard stats
// @route   GET /api/doctors/dashboard
// @access  Private (Doctor)
export const getDoctorDashboard = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get today's appointments
  const todaysAppointments = await Appointment.find({
    doctor: doctor._id,
    appointmentDate: { $gte: today, $lt: tomorrow }
  })
    .populate({
      path: 'patient',
      populate: { path: 'user' }
    })
    .sort({ appointmentTime: 1 });

  // Get appointment counts
  const appointmentStats = await Appointment.aggregate([
    {
      $match: {
        doctor: doctor._id,
        appointmentDate: { $gte: today, $lt: tomorrow }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get this week's stats
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  
  const weeklyStats = await Appointment.aggregate([
    {
      $match: {
        doctor: doctor._id,
        appointmentDate: { $gte: weekStart }
      }
    },
    {
      $group: {
        _id: null,
        totalPatients: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      todaysAppointments,
      stats: {
        today: appointmentStats,
        weekly: weeklyStats[0] || { totalPatients: 0, completed: 0 }
      },
      doctor
    }
  });
});

// @desc    Get all appointments for doctor
// @route   GET /api/doctors/appointments
// @access  Private (Doctor)
export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  const { status, date, limit = 50 } = req.query;
  
  const query = { doctor: doctor._id };
  
  if (status) query.status = status;
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    query.appointmentDate = { $gte: startDate, $lt: endDate };
  }

  const appointments = await Appointment.find(query)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .limit(parseInt(limit))
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
    return timeA.localeCompare(timeB); // Ascending time
  });

  res.status(200).json({
    success: true,
    count: sortedAppointments.length,
    data: sortedAppointments
  });
});

// @desc    Get patient queue
// @route   GET /api/doctors/queue
// @access  Private (Doctor)
export const getPatientQueue = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get all today's appointments
  const queue = await Appointment.find({
    doctor: doctor._id,
    appointmentDate: { $gte: today, $lt: tomorrow }
  })
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .sort({ appointmentTime: 1 })
    .lean();

  // Categorize appointments
  const categorized = {
    waiting: queue.filter(apt => apt.status === 'waiting' || apt.status === 'confirmed'),
    inConsultation: queue.filter(apt => apt.status === 'in-consultation'),
    completed: queue.filter(apt => apt.status === 'completed')
  };

  res.status(200).json({
    success: true,
    data: categorized
  });
});

// @desc    Get all patients for this doctor
// @route   GET /api/doctors/patients
// @access  Private (Doctor)
export const getDoctorPatients = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  // Get patients where doctor is primary doctor or treating doctor
  const directPatients = await Patient.find({
    $or: [
      { primaryDoctor: doctor._id },
      { treatingDoctors: doctor._id }
    ]
  })
    .populate('user', 'firstName lastName email phone dateOfBirth gender')
    .populate({
      path: 'primaryDoctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ createdAt: -1 });

  // Get unique patients who have appointments with this doctor
  const appointments = await Appointment.find({ doctor: doctor._id })
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone dateOfBirth age' }
    })
    .select('patient');

  // Extract unique patients from appointments
  const patientMap = new Map();
  
  // Add direct patients first
  directPatients.forEach(patient => {
    patientMap.set(patient._id.toString(), patient);
  });
  
  // Add patients from appointments
  appointments.forEach(apt => {
    if (apt.patient && apt.patient._id) {
      const patientId = apt.patient._id.toString();
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, apt.patient);
      }
    }
  });

  const patients = Array.from(patientMap.values());

  res.status(200).json({
    success: true,
    count: patients.length,
    data: patients
  });
});

// @desc    Search patients
// @route   GET /api/doctors/patients/search
// @access  Private (Doctor)
export const searchPatients = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const patients = await Patient.find({
    $or: [
      { patientId: new RegExp(query, 'i') },
      { 'emergencyContact.phone': new RegExp(query, 'i') }
    ]
  })
    .populate('user')
    .limit(20);

  res.status(200).json({
    success: true,
    count: patients.length,
    data: patients
  });
});

// @desc    Get patient details
// @route   GET /api/doctors/patients/:id
// @access  Private (Doctor)
export const getPatientDetails = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('user')
    .lean();

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Get appointment count for this patient
  const totalVisits = await Appointment.countDocuments({ 
    patient: patient._id,
    status: { $in: ['completed', 'in-consultation'] }
  });

  // Get recent appointments
  const appointments = await Appointment.find({ patient: patient._id })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('department', 'name')
    .sort({ appointmentDate: -1 })
    .limit(10)
    .lean();

  // Get current admission with vitals history
  const currentAdmission = await Admission.findOne({ 
    patient: patient._id, 
    status: 'admitted' 
  })
    .populate('bed')
    .populate({
      path: 'vitalsHistory.recordedBy',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ admissionDate: -1 })
    .lean();

  // Get admission history
  const admissionHistory = await Admission.find({ patient: patient._id })
    .populate('bed')
    .populate('doctor')
    .sort({ admissionDate: -1 })
    .limit(5)
    .lean();

  res.status(200).json({
    success: true,
    data: {
      ...patient,
      totalVisits,
      appointments,
      currentAdmission,
      admissionHistory
    }
  });
});

// @desc    Update appointment consultation notes
// @route   PUT /api/doctors/appointments/:id/consultation
// @access  Private (Doctor)
export const updateConsultationNotes = asyncHandler(async (req, res) => {
  const { diagnosis, observations, treatmentPlan, followUpDate } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  appointment.consultationNotes = {
    diagnosis,
    observations,
    treatmentPlan,
    followUpDate
  };
  appointment.status = 'completed';
  appointment.checkOutTime = new Date();
  
  if (appointment.checkInTime) {
    appointment.consultationDuration = Math.round(
      (appointment.checkOutTime - appointment.checkInTime) / 60000
    );
  }

  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Consultation notes updated successfully',
    data: appointment
  });
});

// @desc    Update appointment status
// @route   PATCH /api/doctors/appointments/:id/status
// @access  Private (Doctor)
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  appointment.status = status;
  
  if (status === 'in-consultation' && !appointment.checkInTime) {
    appointment.checkInTime = new Date();
  }

  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Appointment status updated',
    data: appointment
  });
});

// @desc    Get doctor analytics
// @route   GET /api/doctors/analytics
// @access  Private (Doctor)
export const getDoctorAnalytics = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  const { period = 'week' } = req.query;
  
  let startDate = new Date();
  
  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === 'year') {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const analytics = await Appointment.aggregate([
    {
      $match: {
        doctor: doctor._id,
        appointmentDate: { $gte: startDate }
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
        typeBreakdown: [
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ],
        dailyCount: [
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' }
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
              totalAppointments: { $sum: 1 },
              completedAppointments: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              },
              averageConsultationFee: { $avg: '$consultationFee' }
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

// @desc    Update patient medical history
// @route   PUT /api/doctors/patients/:id/medical-history
// @access  Private (Doctor)
export const updatePatientMedicalHistory = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  const allowedUpdates = ['bloodGroup', 'height', 'weight', 'allergies', 'chronicDiseases', 'currentMedications'];
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      patient[field] = req.body[field];
    }
  });

  await patient.save();

  res.status(200).json({
    success: true,
    message: 'Patient medical history updated successfully',
    data: patient
  });
});

// @desc    Add surgery record
// @route   POST /api/doctors/patients/:id/surgeries
// @access  Private (Doctor)
export const addSurgeryRecord = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  const { surgeryName, date, surgeon, hospital, notes } = req.body;

  patient.surgeries.push({
    surgeryName,
    date: date || new Date(),
    surgeon: surgeon || `Dr. ${req.user.firstName} ${req.user.lastName}`,
    hospital,
    notes
  });

  await patient.save();

  res.status(201).json({
    success: true,
    message: 'Surgery record added successfully',
    data: patient.surgeries
  });
});

// @desc    Add vaccination record
// @route   POST /api/doctors/patients/:id/vaccinations
// @access  Private (Doctor)
export const addVaccinationRecord = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  const { vaccineName, date, dose, administeredBy, nextDueDate } = req.body;

  patient.vaccinations.push({
    vaccineName,
    date: date || new Date(),
    dose,
    administeredBy: administeredBy || `Dr. ${req.user.firstName} ${req.user.lastName}`,
    nextDueDate
  });

  await patient.save();

  res.status(201).json({
    success: true,
    message: 'Vaccination record added successfully',
    data: patient.vaccinations
  });
});

// @desc    Add prescription
// @route   POST /api/doctors/patients/:id/prescriptions
// @access  Private (Doctor)
export const addPrescription = asyncHandler(async (req, res) => {
  console.log('=== Add Prescription Request ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  const { appointment, diagnosis, medicines, notes, followUpDate } = req.body;

  console.log('Creating prescription with medicines:', medicines);

  const prescription = await Prescription.create({
    prescriptionId: `PRX${Date.now()}`,
    patient: patient._id,
    doctor: doctor._id,
    appointment,
    diagnosis,
    medicines,
    notes,
    followUpDate
  });

  patient.prescriptions.push(prescription._id);
  
  // Set primary doctor if not set
  if (!patient.primaryDoctor) {
    patient.primaryDoctor = doctor._id;
  }
  
  // Add doctor to treating doctors if not already there
  if (!patient.treatingDoctors) {
    patient.treatingDoctors = [doctor._id];
  } else if (!patient.treatingDoctors.includes(doctor._id)) {
    patient.treatingDoctors.push(doctor._id);
  }
  
  await patient.save();

  const populatedPrescription = await Prescription.findById(prescription._id)
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('patient');

  console.log('Prescription created successfully:', prescription._id);

  res.status(201).json({
    success: true,
    message: 'Prescription added successfully',
    data: populatedPrescription
  });
});

// @desc    Add new patient (by doctor)
// @route   POST /api/doctors/patients
// @access  Private (Doctor)
export const addNewPatient = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    address,
    bloodGroup,
    emergencyContact,
    allergies,
    chronicDiseases,
    medicalHistory
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create user account
  const user = await User.create({
    email,
    password,
    role: 'patient',
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    address
  });

  // Create patient profile
  const patient = await Patient.create({
    user: user._id,
    patientId: generatePatientId(),
    bloodGroup,
    emergencyContact,
    allergies: allergies || [],
    chronicDiseases: chronicDiseases || [],
    medicalHistory: medicalHistory || [],
    primaryDoctor: doctor._id,
    treatingDoctors: [doctor._id],
    registrationDate: new Date()
  });

  const populatedPatient = await Patient.findById(patient._id)
    .populate('user', '-password')
    .populate({
      path: 'primaryDoctor',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  res.status(201).json({
    success: true,
    message: 'Patient added successfully',
    data: populatedPatient
  });
});

// @desc    Admit patient
// @route   POST /api/doctors/admissions
// @access  Private (Doctor)
export const admitPatient = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const {
    patientId,
    bedId,
    admissionType,
    reasonForAdmission,
    provisionalDiagnosis,
    treatmentPlan,
    admissionDate
  } = req.body;

  // Validate patient
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Validate and check bed availability
  const bed = await Bed.findById(bedId);
  if (!bed) {
    return res.status(404).json({
      success: false,
      message: 'Bed not found'
    });
  }

  if (bed.status !== 'vacant') {
    return res.status(400).json({
      success: false,
      message: `Bed ${bed.bedNumber} is not available. Current status: ${bed.status}`
    });
  }

  // Create admission record
  const admission = await Admission.create({
    admissionId: generateAdmissionId(),
    patient: patient._id,
    doctor: doctor._id,
    department: doctor.department,
    bed: bed._id,
    admissionType: admissionType || 'Scheduled',
    admissionDate: admissionDate || new Date(),
    reasonForAdmission,
    provisionalDiagnosis,
    treatmentPlan,
    status: 'admitted'
  });

  // Update bed status
  bed.status = 'occupied';
  bed.currentPatient = patient._id;
  bed.assignedDoctor = doctor._id;
  await bed.save();

  // Update patient record
  patient.admissions.push(admission._id);
  
  // Set primary doctor if not set, or add to treating doctors
  if (!patient.primaryDoctor) {
    patient.primaryDoctor = doctor._id;
  }
  
  // Add doctor to treating doctors if not already there
  if (!patient.treatingDoctors.includes(doctor._id)) {
    patient.treatingDoctors.push(doctor._id);
  }
  
  await patient.save();

  // Populate the admission data
  const populatedAdmission = await Admission.findById(admission._id)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('department')
    .populate('bed');

  res.status(201).json({
    success: true,
    message: 'Patient admitted successfully',
    data: populatedAdmission
  });
});

// @desc    Get available beds
// @route   GET /api/doctors/beds/available
// @access  Private (Doctor)
export const getAvailableBeds = asyncHandler(async (req, res) => {
  const { wardType, floor } = req.query;

  const query = { status: 'vacant' };
  
  if (wardType) {
    query.wardType = wardType;
  }
  
  if (floor) {
    query.floor = parseInt(floor);
  }

  const beds = await Bed.find(query)
    .populate('department')
    .sort({ floor: 1, bedNumber: 1 });

  res.status(200).json({
    success: true,
    count: beds.length,
    data: beds
  });
});

// @desc    Order lab test for patient
// @route   POST /api/doctors/patients/:id/lab-tests
// @access  Private (Doctor)
export const orderLabTest = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  const { testName, testCategory, urgency, notes, cost, appointment } = req.body;

  // Create lab test order
  const labTest = await LabTest.create({
    testId: generateLabTestId(),
    patient: patient._id,
    doctor: doctor._id,
    appointment: appointment || null,
    testName,
    testCategory,
    urgency: urgency || 'routine',
    notes,
    cost,
    status: 'requested'
  });

  // Add to patient's lab reports
  patient.labReports.push(labTest._id);
  
  // Update treating doctors relationship
  if (!patient.primaryDoctor) {
    patient.primaryDoctor = doctor._id;
  }
  if (!patient.treatingDoctors || !patient.treatingDoctors.includes(doctor._id)) {
    if (!patient.treatingDoctors) {
      patient.treatingDoctors = [doctor._id];
    } else {
      patient.treatingDoctors.push(doctor._id);
    }
  }
  
  await patient.save();

  const populatedLabTest = await LabTest.findById(labTest._id)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    });

  res.status(201).json({
    success: true,
    message: 'Lab test ordered successfully',
    data: populatedLabTest
  });
});

// @desc    Get lab tests ordered by doctor
// @route   GET /api/doctors/lab-tests
// @access  Private (Doctor)
export const getDoctorLabTests = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const { status, patientId } = req.query;
  
  const query = { doctor: doctor._id };
  
  if (status) {
    query.status = status;
  }
  
  if (patientId) {
    query.patient = patientId;
  }

  const labTests = await LabTest.find(query)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('appointment')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: labTests.length,
    data: labTests
  });
});

// @desc    Get specific lab test details
// @route   GET /api/doctors/lab-tests/:id
// @access  Private (Doctor)
export const getLabTestDetails = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const labTest = await LabTest.findById(req.params.id)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone dateOfBirth gender' }
    })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('appointment')
    .populate('technician', 'firstName lastName')
    .populate('sampleCollectedBy', 'firstName lastName');

  if (!labTest) {
    return res.status(404).json({
      success: false,
      message: 'Lab test not found'
    });
  }

  // Verify doctor has access to this lab test
  if (labTest.doctor._id.toString() !== doctor._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this lab test'
    });
  }

  res.status(200).json({
    success: true,
    data: labTest
  });
});

// @desc    Get patient's lab test history
// @route   GET /api/doctors/patients/:id/lab-tests
// @access  Private (Doctor)
export const getPatientLabTests = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  const labTests = await LabTest.find({ patient: patient._id })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: labTests.length,
    data: labTests
  });
});

// @desc    Get prescriptions written by doctor
// @route   GET /api/doctors/prescriptions
// @access  Private (Doctor)
export const getDoctorPrescriptions = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const { patientId, status } = req.query;
  
  const query = { doctor: doctor._id };
  
  if (patientId) {
    query.patient = patientId;
  }

  const prescriptions = await Prescription.find(query)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone' }
    })
    .populate({
      path: 'doctor',
      populate: [
        { path: 'user', select: 'firstName lastName' },
        { path: 'department', select: 'name' }
      ]
    })
    .populate('appointment')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
});

// @desc    Get specific prescription details
// @route   GET /api/doctors/prescriptions/:id
// @access  Private (Doctor)
export const getPrescriptionDetails = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const prescription = await Prescription.findById(req.params.id)
    .populate({
      path: 'patient',
      populate: { path: 'user', select: 'firstName lastName email phone dateOfBirth gender' }
    })
    .populate({
      path: 'doctor',
      populate: [
        { path: 'user', select: 'firstName lastName' },
        { path: 'department', select: 'name' }
      ]
    })
    .populate('appointment');

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }

  // Verify doctor has access to this prescription
  if (prescription.doctor._id.toString() !== doctor._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this prescription'
    });
  }

  res.status(200).json({
    success: true,
    data: prescription
  });
});

// @desc    Get patient's prescription history
// @route   GET /api/doctors/patients/:id/prescriptions
// @access  Private (Doctor)
export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  const prescriptions = await Prescription.find({ patient: patient._id })
    .populate({
      path: 'doctor',
      populate: [
        { path: 'user', select: 'firstName lastName' },
        { path: 'department', select: 'name' }
      ]
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
});

