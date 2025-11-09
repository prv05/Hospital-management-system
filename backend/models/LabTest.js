import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
  testId: {
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
  testName: {
    type: String,
    required: [true, 'Test name is required']
  },
  testCategory: {
    type: String,
    enum: ['Blood', 'Urine', 'Stool', 'Radiology', 'ECG', 'Ultrasound', 'CT Scan', 'MRI', 'X-Ray', 'Biopsy', 'Other'],
    required: true
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  status: {
    type: String,
    enum: ['requested', 'sample-collected', 'in-process', 'completed', 'cancelled'],
    default: 'requested'
  },
  sampleId: {
    type: String,
    unique: true,
    sparse: true
  },
  sampleCollectedAt: Date,
  sampleCollectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  results: [{
    parameter: String,
    value: String,
    unit: String,
    normalRange: String,
    isAbnormal: { type: Boolean, default: false }
  }],
  notes: String,
  reportFile: String, // PDF file path
  completedAt: Date,
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  billing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing'
  }
}, {
  timestamps: true
});

// Auto-generate sample ID when status changes to sample-collected
labTestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'sample-collected' && !this.sampleId) {
    this.sampleId = `SMPL${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

export default mongoose.model('LabTest', labTestSchema);
