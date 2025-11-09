import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema({
  admissionId: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  bed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed',
    required: true
  },
  admissionType: {
    type: String,
    enum: ['Emergency', 'Scheduled', 'Transfer'],
    required: true
  },
  admissionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dischargeDate: Date,
  status: {
    type: String,
    enum: ['admitted', 'discharged', 'transferred', 'absconded', 'deceased'],
    default: 'admitted'
  },
  reasonForAdmission: {
    type: String,
    required: true
  },
  provisionalDiagnosis: String,
  finalDiagnosis: String,
  treatmentPlan: String,
  vitalsHistory: [{
    date: { type: Date, default: Date.now },
    bloodPressure: String,
    temperature: Number,
    pulse: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Nurse' }
  }],
  medications: [{
    medicine: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    administeredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nurse' }]
  }],
  procedures: [{
    procedureName: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    assistedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nurse' }],
    date: Date,
    notes: String,
    cost: Number
  }],
  surgeries: [{
    surgeryName: String,
    surgeon: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    assistantSurgeons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    anesthetist: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    nurses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Nurse' }],
    surgeryDate: Date,
    duration: Number, // in minutes
    notes: String,
    cost: Number
  }],
  labTests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest'
  }],
  progressNotes: [{
    date: { type: Date, default: Date.now },
    note: String,
    writtenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  dischargeDetails: {
    dischargedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    dischargeSummary: String,
    followUpInstructions: String,
    followUpDate: Date,
    medicationsOnDischarge: [{
      medicine: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    dietInstructions: String,
    activityRestrictions: String
  },
  totalStayDays: Number,
  billing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing'
  },
  isEmergency: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate total stay days before saving discharge
admissionSchema.pre('save', function(next) {
  if (this.dischargeDate && this.admissionDate) {
    const diffTime = Math.abs(this.dischargeDate - this.admissionDate);
    this.totalStayDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

export default mongoose.model('Admission', admissionSchema);
