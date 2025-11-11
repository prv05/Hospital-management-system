import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  emergencyContact: {
    name: { type: String, required: true },
    relation: { type: String, required: true },
    phone: { type: String, required: true }
  },
  familyMembers: [{
    name: String,
    relation: String,
    phone: String,
    dateOfBirth: Date
  }],
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: { type: String, enum: ['active', 'resolved', 'chronic'], default: 'active' },
    notes: String
  }],
  allergies: [{
    allergen: String,
    severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'moderate' },
    reaction: String
  }],
  chronicDiseases: [String],
  currentMedications: [{
    medicineName: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
  }],
  surgeries: [{
    surgeryName: String,
    date: Date,
    hospital: String,
    surgeon: String,
    notes: String
  }],
  vaccinations: [{
    vaccineName: String,
    date: Date,
    nextDueDate: Date,
    administeredBy: String
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    validUpto: Date,
    coverageAmount: Number,
    claimsMade: { type: Number, default: 0 }
  },
  admissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission'
  }],
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }],
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  labReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest'
  }],
  billings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing'
  }],
  primaryDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  treatingDoctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  height: Number, // in cm
  weight: Number, // in kg
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastVisit: Date,
  totalVisits: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate BMI
patientSchema.virtual('bmi').get(function() {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }
  return null;
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

export default mongoose.model('Patient', patientSchema);
