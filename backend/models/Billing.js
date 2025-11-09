import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  billId: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  billType: {
    type: String,
    enum: ['OPD', 'IPD', 'Emergency', 'Pharmacy', 'Lab'],
    required: true
  },
  billDate: {
    type: Date,
    default: Date.now
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission'
  },
  items: [{
    itemType: {
      type: String,
      enum: ['consultation', 'medicine', 'lab-test', 'room-charge', 'surgery', 'nursing', 'procedure', 'equipment', 'other']
    },
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    reason: String
  },
  tax: {
    cgst: {
      type: Number,
      default: 0
    },
    sgst: {
      type: Number,
      default: 0
    },
    igst: {
      type: Number,
      default: 0
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethods: [{
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'net-banking', 'insurance']
    },
    amount: {
      type: Number,
      min: 0
    },
    transactionId: String,
    transactionDate: {
      type: Date,
      default: Date.now
    }
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    claimAmount: Number,
    claimStatus: {
      type: String,
      enum: ['not-filed', 'filed', 'approved', 'rejected', 'settled']
    },
    claimId: String
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  invoiceFile: String, // PDF file path
  dueDate: Date,
  isPrinted: {
    type: Boolean,
    default: false
  },
  printedAt: Date
}, {
  timestamps: true
});

// Calculate balance amount before saving
billingSchema.pre('save', function(next) {
  this.balanceAmount = this.totalAmount - this.amountPaid;
  
  // Update payment status
  if (this.amountPaid === 0) {
    this.paymentStatus = 'pending';
  } else if (this.amountPaid >= this.totalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }
  
  next();
});

export default mongoose.model('Billing', billingSchema);
