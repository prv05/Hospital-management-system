import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import LabTest from '../models/LabTest.js';
import Billing from '../models/Billing.js';
import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import { generateAppointmentId } from '../utils/idGenerator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get patient dashboard
// @route   GET /api/patients/dashboard
// @access  Private (Patient)
// FIXED: Added safe date handling to prevent getTime() errors
export const getPatientDashboard = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id })
    .populate('user');

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient profile not found'
    });
  }

  // Get all appointments for this patient
  const allAppointments = await Appointment.find({
    patient: patient._id
  })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('department')
    .lean();

  console.log('✅ FIXED VERSION LOADED - Total appointments:', allAppointments.length);

  // Filter upcoming appointments in JavaScript to avoid date comparison issues
  const now = new Date();
  const upcomingAppointments = allAppointments
    .filter(apt => {
      if (!apt.appointmentDate) return false;
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= now && ['scheduled', 'confirmed'].includes(apt.status);
    })
    .sort((a, b) => {
      const dateA = a.appointmentDate ? new Date(a.appointmentDate) : new Date(0);
      const dateB = b.appointmentDate ? new Date(b.appointmentDate) : new Date(0);
      return dateA - dateB;
    })
    .slice(0, 5);

  const recentPrescriptions = await Prescription.find({ patient: patient._id })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .sort({ createdAt: -1 })
    .limit(5);

  const pendingBills = await Billing.find({
    patient: patient._id,
    paymentStatus: { $in: ['pending', 'partial'] }
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      patient,
      upcomingAppointments,
      recentPrescriptions,
      pendingBills
    }
  });
});

// @desc    Book appointment
// @route   POST /api/patients/appointments
// @access  Private (Patient)
export const bookAppointment = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  const { doctor, department, appointmentDate, appointmentTime, type, symptoms, notes } = req.body;

  // Check if doctor exists
  const doctorData = await Doctor.findById(doctor).populate('user');
  if (!doctorData) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }

  // Check if slot is available
  const existingAppointment = await Appointment.findOne({
    doctor,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: { $ne: 'cancelled' }
  });

  if (existingAppointment) {
    return res.status(400).json({
      success: false,
      message: 'This slot is already booked'
    });
  }

  const appointment = await Appointment.create({
    appointmentId: generateAppointmentId(),
    patient: patient._id,
    doctor,
    department,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    type: type || 'consultation',
    symptoms,
    notes,
    consultationFee: doctorData.consultationFee,
    status: 'scheduled'
  });

  patient.appointments.push(appointment._id);
  patient.totalVisits += 1;
  await patient.save();

  // Auto-generate bill for the appointment
  const billId = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const consultationFee = doctorData.consultationFee || 500;
  await Billing.create({
    billId,
    patient: patient._id,
    billType: 'OPD',
    appointment: appointment._id,
    items: [{
      itemType: 'consultation',
      description: `Consultation with Dr. ${doctorData.user.firstName} ${doctorData.user.lastName}`,
      quantity: 1,
      unitPrice: consultationFee,
      totalPrice: consultationFee
    }],
    subtotal: consultationFee,
    totalAmount: consultationFee,
    amountPaid: 0,
    balanceAmount: consultationFee,
    paymentStatus: 'pending',
    generatedBy: doctorData.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: appointment
  });
});

// @desc    Get all appointments
// @route   GET /api/patients/appointments
// @access  Private (Patient)
export const getMyAppointments = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  const { status, upcoming } = req.query;
  
  const query = { patient: patient._id };
  
  if (status) query.status = status;

  let appointments = await Appointment.find(query)
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('department')
    .lean();

  // Filter in JavaScript if upcoming is requested
  if (upcoming === 'true') {
    const now = new Date();
    appointments = appointments.filter(apt => {
      if (!apt.appointmentDate) return false;
      return new Date(apt.appointmentDate) >= now;
    });
  }

  // Sort by date
  appointments.sort((a, b) => {
    const dateA = a.appointmentDate ? new Date(a.appointmentDate) : new Date(0);
    const dateB = b.appointmentDate ? new Date(b.appointmentDate) : new Date(0);
    return dateB - dateA;
  });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// @desc    Cancel appointment
// @route   DELETE /api/patients/appointments/:id
// @access  Private (Patient)
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  const patient = await Patient.findOne({ user: req.user._id });
  if (appointment.patient.toString() !== patient._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You can only cancel your own appointments'
    });
  }

  appointment.status = 'cancelled';
  appointment.cancelledBy = req.user._id;
  appointment.cancelledAt = new Date();
  appointment.cancelReason = req.body.reason || 'Cancelled by patient';
  
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully'
  });
});

// @desc    Get medical history
// @route   GET /api/patients/medical-history
// @access  Private (Patient)
export const getMedicalHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id })
    .populate('user', 'firstName lastName email phone dateOfBirth gender address')
    .populate('prescriptions')
    .populate('labReports')
    .populate({
      path: 'appointments',
      populate: { path: 'doctor', populate: 'user' }
    });

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient profile not found'
    });
  }

  // Calculate age if dateOfBirth is available
  let age = null;
  if (patient.user.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(patient.user.dateOfBirth);
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  // Calculate BMI if height and weight are available
  let bmi = null;
  if (patient.height && patient.weight) {
    const heightInMeters = patient.height / 100;
    bmi = (patient.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }

  res.status(200).json({
    success: true,
    data: {
      // Personal Information
      personalInfo: {
        firstName: patient.user.firstName,
        lastName: patient.user.lastName,
        email: patient.user.email,
        phone: patient.user.phone,
        dateOfBirth: patient.user.dateOfBirth,
        age: age,
        gender: patient.user.gender,
        address: patient.user.address,
        patientId: patient.patientId,
        bloodGroup: patient.bloodGroup,
        registrationDate: patient.registrationDate
      },
      // Physical Information
      physicalInfo: {
        height: patient.height,
        weight: patient.weight,
        bmi: bmi
      },
      // Emergency Contact
      emergencyContact: patient.emergencyContact,
      // Medical Data
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      chronicDiseases: patient.chronicDiseases,
      currentMedications: patient.currentMedications,
      surgeries: patient.surgeries,
      vaccinations: patient.vaccinations,
      // Insurance
      insurance: patient.insurance,
      // Records
      prescriptions: patient.prescriptions,
      labReports: patient.labReports,
      appointments: patient.appointments
    }
  });
});

// @desc    Get billing history
// @route   GET /api/patients/billing
// @access  Private (Patient)
export const getBillingHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  const bills = await Billing.find({ patient: patient._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bills.length,
    data: bills
  });
});

// @desc    Update profile
// @route   PUT /api/patients/profile
// @access  Private (Patient)
export const updateProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });

  const allowedUpdates = ['emergencyContact', 'familyMembers', 'height', 'weight', 'insurance'];
  
  allowedUpdates.forEach(field => {
    if (req.body[field]) {
      patient[field] = req.body[field];
    }
  });

  await patient.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: patient
  });
});

// @desc    Get all departments
// @route   GET /api/patients/departments
// @access  Private (Patient)
export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true })
    .select('name description')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: departments.length,
    data: departments
  });
});

// @desc    Get doctors by department
// @route   GET /api/patients/doctors
// @access  Private (Patient)
export const getDoctorsByDepartment = asyncHandler(async (req, res) => {
  const { department } = req.query;
  
  // Query for available doctors (not on leave and available)
  const query = { 
    isAvailable: true,
    isOnLeave: false
  };
  
  if (department) {
    // Convert string to ObjectId for proper MongoDB query
    query.department = new mongoose.Types.ObjectId(department);
  }

  const doctors = await Doctor.find(query)
    .populate('user', 'firstName lastName email phone')
    .populate('department', 'name')
    .sort({ 'user.firstName': 1 });

  console.log(`Found ${doctors.length} doctors for department:`, department);

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors
  });
});

// @desc    Get patient's lab tests
// @route   GET /api/patients/lab-tests
// @access  Private (Patient)
export const getPatientLabTests = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient profile not found'
    });
  }

  const labTests = await LabTest.find({ patient: patient._id })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('technician', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: labTests.length,
    data: labTests
  });
});

// @desc    Get patient prescriptions
// @route   GET /api/patients/prescriptions
// @access  Private (Patient)
export const getMyPrescriptions = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient profile not found'
    });
  }

  const prescriptions = await Prescription.find({ patient: patient._id })
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'firstName lastName' }
    })
    .populate('appointment')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
});

// @desc    Get patient bills (alias for getBillingHistory)
// @route   GET /api/patients/bills
// @access  Private (Patient)
export const getMyBills = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient profile not found'
    });
  }

  const bills = await Billing.find({ patient: patient._id })
    .populate('appointment')
    .populate('generatedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bills.length,
    data: bills
  });
});
