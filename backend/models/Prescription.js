import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: {
    type: String,
    required: true
  },
  medicines: [{
    medicineName: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    timing: {
      type: String,
      enum: ['before-meal', 'after-meal', 'with-meal', 'empty-stomach', 'bedtime'],
      default: 'after-meal'
    },
    instructions: String,
    quantity: Number
  }],
  tests: [{
    testName: String,
    urgency: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine' }
  }],
  advice: String,
  dietRecommendations: String,
  followUpDate: Date,
  isDispensed: {
    type: Boolean,
    default: false
  },
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dispensedAt: Date,
  validUntil: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Prescription', prescriptionSchema);
