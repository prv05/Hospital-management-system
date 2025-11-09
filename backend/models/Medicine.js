import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  medicineId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  genericName: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops', 'Cream', 'Ointment', 'Inhaler', 'Other'],
    required: true
  },
  description: String,
  strength: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    enum: ['mg', 'ml', 'g', 'mcg', 'IU'],
    default: 'mg'
  },
  packSize: {
    type: Number,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  manufacturingDate: Date,
  stock: {
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    reorderLevel: {
      type: Number,
      default: 50
    },
    maxStockLevel: {
      type: Number,
      default: 1000
    }
  },
  price: {
    mrp: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  prescriptionRequired: {
    type: Boolean,
    default: true
  },
  sideEffects: [String],
  contraindications: [String],
  storageConditions: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastRestocked: Date,
  totalDispensed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Check if medicine is expired
medicineSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

// Check if stock is low
medicineSchema.virtual('isLowStock').get(function() {
  return this.stock.quantity <= this.stock.reorderLevel;
});

// Check if expiring soon (within 3 months)
medicineSchema.virtual('isExpiringSoon').get(function() {
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  return this.expiryDate <= threeMonthsFromNow && this.expiryDate > new Date();
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

// Index for searching
medicineSchema.index({ name: 'text', genericName: 'text' });

export default mongoose.model('Medicine', medicineSchema);
