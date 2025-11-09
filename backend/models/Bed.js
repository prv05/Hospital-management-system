import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: [true, 'Bed number is required'],
    unique: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  wardNumber: {
    type: String,
    required: [true, 'Ward number is required']
  },
  wardType: {
    type: String,
    enum: ['general', 'semi-private', 'private', 'icu'],
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  bedType: {
    type: String,
    enum: ['general', 'semi-private', 'private', 'icu'],
    required: true
  },
  status: {
    type: String,
    enum: ['vacant', 'occupied', 'reserved', 'maintenance', 'cleaning'],
    default: 'vacant'
  },
  dailyCharge: {
    type: Number,
    required: true,
    min: 0
  },
  facilities: [{
    name: String,
    isWorking: { type: Boolean, default: true }
  }],
  currentPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedNurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  admittedAt: Date,
  lastCleaned: Date,
  lastMaintenance: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  notes: String
}, {
  timestamps: true
});

// Index for searching
bedSchema.index({ status: 1, bedType: 1, wardType: 1, wardNumber: 1 });

export default mongoose.model('Bed', bedSchema);
