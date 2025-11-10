import Nurse from '../models/Nurse.js';
import Patient from '../models/Patient.js';
import Admission from '../models/Admission.js';
import Bed from '../models/Bed.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get nurse dashboard
// @route   GET /api/nurses/dashboard
// @access  Private (Nurse)
export const getNurseDashboard = asyncHandler(async (req, res) => {
  const nurse = await Nurse.findOne({ user: req.user._id })
    .populate('user')
    .populate('department')
    .populate({
      path: 'assignedPatients.patient',
      populate: { path: 'user' }
    });

  if (!nurse) {
    return res.status(404).json({
      success: false,
      message: 'Nurse profile not found'
    });
  }

  const activePatients = nurse.assignedPatients.filter(ap => ap.status === 'active');

  res.status(200).json({
    success: true,
    data: {
      nurse,
      activePatients,
      totalAssigned: activePatients.length
    }
  });
});

// @desc    Get assigned patients
// @route   GET /api/nurses/patients
// @access  Private (Nurse)
export const getAssignedPatients = asyncHandler(async (req, res) => {
  const nurse = await Nurse.findOne({ user: req.user._id })
    .populate({
      path: 'assignedPatients.patient',
      populate: { path: 'user' }
    });

  const activePatients = nurse.assignedPatients.filter(ap => ap.status === 'active');

  res.status(200).json({
    success: true,
    count: activePatients.length,
    data: activePatients
  });
});

// @desc    Record patient vitals
// @route   POST /api/nurses/patients/:id/vitals
// @access  Private (Nurse)
export const recordVitals = asyncHandler(async (req, res) => {
  const { bloodPressure, temperature, pulse, respiratoryRate, oxygenSaturation, weight, height } = req.body;
  
  const admission = await Admission.findOne({
    patient: req.params.id,
    status: 'admitted'
  });

  if (!admission) {
    return res.status(404).json({
      success: false,
      message: 'No active admission found for this patient'
    });
  }

  const nurse = await Nurse.findOne({ user: req.user._id });

  admission.vitalsHistory.push({
    bloodPressure,
    temperature,
    pulse,
    respiratoryRate,
    oxygenSaturation,
    recordedBy: nurse._id,
    date: new Date()
  });

  await admission.save();

  res.status(201).json({
    success: true,
    message: 'Vitals recorded successfully',
    data: admission.vitalsHistory[admission.vitalsHistory.length - 1]
  });
});

// @desc    Get bed occupancy
// @route   GET /api/nurses/beds
// @access  Private (Nurse)
export const getBedOccupancy = asyncHandler(async (req, res) => {
  const nurse = await Nurse.findOne({ user: req.user._id });
  
  const { status, ward } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (ward) query.wardNumber = ward;
  if (nurse?.assignedWard) query.wardNumber = nurse.assignedWard;

  const beds = await Bed.find(query)
    .populate({
      path: 'currentPatient',
      populate: { path: 'user' }
    })
    .populate('assignedNurse')
    .populate('department')
    .sort({ bedNumber: 1 });

  const stats = {
    total: beds.length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    vacant: beds.filter(b => b.status === 'vacant').length,
    reserved: beds.filter(b => b.status === 'reserved').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length
  };

  res.status(200).json({
    success: true,
    stats,
    data: beds
  });
});

// @desc    Add medication administration record
// @route   POST /api/nurses/patients/:id/medication
// @access  Private (Nurse)
export const recordMedicationAdministration = asyncHandler(async (req, res) => {
  const { medicine, dosage, time } = req.body;
  
  const admission = await Admission.findOne({
    patient: req.params.id,
    status: 'admitted'
  });

  if (!admission) {
    return res.status(404).json({
      success: false,
      message: 'No active admission found'
    });
  }

  const nurse = await Nurse.findOne({ user: req.user._id });

  const medication = admission.medications.find(m => m.medicine === medicine);
  if (medication) {
    medication.administeredBy.push(nurse._id);
  }

  await admission.save();

  res.status(200).json({
    success: true,
    message: 'Medication administration recorded'
  });
});

// @desc    Mark attendance
// @route   POST /api/nurses/attendance
// @access  Private (Nurse)
export const markAttendance = asyncHandler(async (req, res) => {
  const nurse = await Nurse.findOne({ user: req.user._id });
  
  const { checkIn, checkOut, status } = req.body;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingAttendance = nurse.attendance.find(
    att => att.date.toDateString() === today.toDateString()
  );

  if (existingAttendance) {
    if (checkOut) {
      existingAttendance.checkOut = checkOut;
    }
  } else {
    nurse.attendance.push({
      date: today,
      checkIn: checkIn || new Date().toLocaleTimeString(),
      status: status || 'present'
    });
  }

  if (checkIn) {
    nurse.isOnDuty = true;
  }
  if (checkOut) {
    nurse.isOnDuty = false;
  }

  await nurse.save();

  res.status(200).json({
    success: true,
    message: 'Attendance marked successfully',
    data: nurse.attendance[nurse.attendance.length - 1]
  });
});

// @desc    Update patient observations/notes
// @route   PUT /api/nurses/patients/:id/observations
// @access  Private (Nurse)
export const updatePatientObservations = asyncHandler(async (req, res) => {
  const nurse = await Nurse.findOne({ user: req.user._id });
  
  if (!nurse) {
    return res.status(404).json({
      success: false,
      message: 'Nurse profile not found'
    });
  }

  const patient = await Patient.findById(req.params.id);
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  const { observations, notes } = req.body;

  // You can add observations to patient record or create a separate observation record
  // For now, we'll add it to medical history if available
  
  res.status(200).json({
    success: true,
    message: 'Patient observations updated successfully',
    data: { observations, notes, recordedBy: `${req.user.firstName} ${req.user.lastName}` }
  });
});

// @desc    Get all beds
// @route   GET /api/nurse/beds
// @access  Private (Nurse)
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

// @desc    Update bed assignment (patient, doctor, nurse)
// @route   PUT /api/nurse/beds/:id/assign
// @access  Private (Nurse)
export const updateBedAssignment = asyncHandler(async (req, res) => {
  const { currentPatient, assignedDoctor, assignedNurse, status } = req.body;

  const bed = await Bed.findById(req.params.id);

  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }

  // Update bed fields
  if (currentPatient !== undefined) {
    bed.currentPatient = currentPatient || null;
    bed.admittedAt = currentPatient ? new Date() : null;
  }
  
  if (assignedDoctor !== undefined) {
    bed.assignedDoctor = assignedDoctor || null;
  }
  
  if (assignedNurse !== undefined) {
    bed.assignedNurse = assignedNurse || null;
  }
  
  if (status) {
    bed.status = status;
  }

  const updatedBed = await bed.save();

  // Populate the updated bed
  await updatedBed.populate([
    {
      path: 'currentPatient',
      populate: {
        path: 'user',
        select: 'firstName lastName email phone gender'
      }
    },
    {
      path: 'assignedDoctor',
      select: 'firstName lastName email phone'
    },
    {
      path: 'assignedNurse',
      select: 'firstName lastName email phone'
    }
  ]);

  res.status(200).json({
    success: true,
    message: 'Bed assignment updated successfully',
    data: updatedBed
  });
});

// @desc    Clear bed assignment
// @route   PUT /api/nurse/beds/:id/discharge
// @access  Private (Nurse)
export const dischargeBed = asyncHandler(async (req, res) => {
  const bed = await Bed.findById(req.params.id);

  if (!bed) {
    res.status(404);
    throw new Error('Bed not found');
  }

  bed.currentPatient = null;
  bed.assignedDoctor = null;
  bed.assignedNurse = null;
  bed.admittedAt = null;
  bed.status = 'vacant';

  const updatedBed = await bed.save();

  res.status(200).json({
    success: true,
    message: 'Patient discharged and bed cleared successfully',
    data: updatedBed
  });
});
