import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
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
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required']
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: 0
  },
  licenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true
  },
  licenseExpiry: {
    type: Date,
    required: true
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  designation: {
    type: String,
    enum: ['Junior Doctor', 'Senior Doctor', 'Consultant', 'Head of Department', 'Specialist', 'Super Specialist'],
    default: 'Junior Doctor'
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    shifts: [{
      startTime: String,
      endTime: String,
      type: { type: String, enum: ['OPD', 'Surgery', 'ICU', 'Emergency'] }
    }]
  }],
  maxPatientsPerDay: {
    type: Number,
    default: 30
  },
  awards: [{
    title: String,
    year: Number,
    organization: String
  }],
  publications: [{
    title: String,
    journal: String,
    year: Number
  }],
  languages: [String],
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  isAvailableForEmergency: {
    type: Boolean,
    default: false
  },
  isOnLeave: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  totalPatientsSeen: {
    type: Number,
    default: 0
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for searching
doctorSchema.index({ specialization: 1, department: 1 });
doctorSchema.index({ 'user.firstName': 'text', 'user.lastName': 'text' });

export default mongoose.model('Doctor', doctorSchema);
