import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    required: true
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    building: String,
    floor: String,
    wing: String
  },
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  email: {
    type: String,
    lowercase: true
  },
  specialties: [String],
  facilities: [String],
  operatingHours: {
    weekdays: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '20:00' }
    },
    weekends: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmergency: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Department', departmentSchema);
