import mongoose from 'mongoose';

const nurseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required']
  },
  specialization: String,
  licenseNumber: {
    type: String,
    required: [true, 'Nursing license number is required'],
    unique: true
  },
  licenseExpiry: {
    type: Date,
    required: true
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: 0
  },
  designation: {
    type: String,
    enum: ['Staff Nurse', 'Senior Nurse', 'Head Nurse', 'Nurse Manager', 'ICU Nurse', 'OT Nurse'],
    default: 'Staff Nurse'
  },
  shiftTiming: {
    type: String,
    enum: ['morning', 'evening', 'night', 'rotating'],
    default: 'morning'
  },
  currentShift: {
    start: String,
    end: String
  },
  assignedWard: {
    type: String
  },
  assignedPatients: [{
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    assignedDate: { type: Date, default: Date.now },
    bedNumber: String,
    status: { type: String, enum: ['active', 'discharged'], default: 'active' }
  }],
  attendance: [{
    date: { type: Date, default: Date.now },
    checkIn: String,
    checkOut: String,
    status: { type: String, enum: ['present', 'absent', 'half-day', 'leave'], default: 'present' }
  }],
  leaves: [{
    startDate: Date,
    endDate: Date,
    reason: String,
    type: { type: String, enum: ['sick', 'casual', 'earned'] },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issueDate: Date,
    expiryDate: Date
  }],
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  isOnDuty: {
    type: Boolean,
    default: false
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Nurse', nurseSchema);
