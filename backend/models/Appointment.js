import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
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
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'surgery', 'checkup'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'waiting', 'in-consultation', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  symptoms: [String],
  notes: String,
  chiefComplaint: String,
  consultationNotes: {
    diagnosis: String,
    observations: String,
    treatmentPlan: String,
    followUpDate: Date,
    referredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
  },
  vitals: {
    bloodPressure: String,
    temperature: Number,
    pulse: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    recordedAt: Date,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Nurse' }
  },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  labTests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest'
  }],
  billing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing'
  },
  consultationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  cancelReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  checkInTime: Date,
  checkOutTime: Date,
  waitingTime: Number, // in minutes
  consultationDuration: Number // in minutes
}, {
  timestamps: true
});

// Index for efficient querying
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

export default mongoose.model('Appointment', appointmentSchema);
