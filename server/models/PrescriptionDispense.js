const mongoose = require('mongoose');

const prescriptionDispenseSchema = new mongoose.Schema({
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true
  },
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dispensedMedications: [{
    medicationInventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicationInventory',
      required: true
    },
    medicationName: {
      type: String,
      required: true
    },
    prescribedDosage: String,
    prescribedFrequency: String,
    prescribedDuration: String,
    dispensedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    daysSupply: {
      type: Number,
      required: true,
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
    batchNumber: String,
    expiryDate: Date,
    substitution: {
      isSubstituted: {
        type: Boolean,
        default: false
      },
      originalMedication: String,
      reason: String,
      patientConsent: {
        type: Boolean,
        default: false
      }
    },
    counselingProvided: {
      type: Boolean,
      default: false
    },
    counselingNotes: String
  }],
  dispensingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'partially-filled', 'cancelled', 'on-hold'],
    default: 'pending'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'requires-clarification'],
    default: 'pending'
  },
  verificationNotes: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date,
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    copay: Number,
    deductible: Number,
    coinsurance: Number,
    coverageAmount: Number,
    patientResponsibility: Number
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'partial-insurance', 'voucher'],
      required: true
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0
    },
    changeGiven: Number,
    transactionId: String,
    paymentDate: {
      type: Date,
      default: Date.now
    }
  },
  pickupInfo: {
    isPickedUp: {
      type: Boolean,
      default: false
    },
    pickupDate: Date,
    pickupPerson: {
      name: String,
      relationship: String,
      idVerified: {
        type: Boolean,
        default: false
      },
      idType: String,
      idNumber: String
    }
  },
  complianceTracking: {
    expectedRefillDate: Date,
    adherenceScore: Number,
    missedDoses: Number,
    refillHistory: [{
      date: Date,
      pharmacist: String,
      notes: String
    }]
  },
  clinicalNotes: {
    drugInteractions: [String],
    contraindications: [String],
    allergies: [String],
    warnings: [String],
    monitoringParameters: [String]
  },
  regulatoryInfo: {
    rxNumber: {
      type: String,
      required: true,
      unique: true
    },
    originalDate: Date,
    refillsRemaining: {
      type: Number,
      min: 0,
      default: 0
    },
    maxRefills: {
      type: Number,
      min: 0,
      default: 0
    },
    dea_required: {
      type: Boolean,
      default: false
    },
    controlledSubstanceLog: {
      schedule: String,
      reporting_required: Boolean,
      reported_date: Date
    }
  },
  qualityChecks: {
    labelAccuracy: {
      type: Boolean,
      default: false
    },
    quantityAccuracy: {
      type: Boolean,
      default: false
    },
    expiryDateCheck: {
      type: Boolean,
      default: false
    },
    finalReview: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date
  },
  communicationLog: [{
    type: {
      type: String,
      enum: ['call', 'email', 'text', 'in-person', 'system'],
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    recipient: String,
    subject: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, { timestamps: true });

// Indexes for better performance
prescriptionDispenseSchema.index({ prescriptionId: 1 });
prescriptionDispenseSchema.index({ pharmacistId: 1, dispensingDate: -1 });
prescriptionDispenseSchema.index({ patientId: 1, dispensingDate: -1 });
prescriptionDispenseSchema.index({ 'regulatoryInfo.rxNumber': 1 });
prescriptionDispenseSchema.index({ status: 1 });
prescriptionDispenseSchema.index({ dispensingDate: -1 });

// Pre-save middleware to generate RX number
prescriptionDispenseSchema.pre('save', function(next) {
  if (!this.regulatoryInfo.rxNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.regulatoryInfo.rxNumber = `RX${timestamp}${random}`;
  }
  next();
});

// Virtual for refill eligibility
prescriptionDispenseSchema.virtual('refillEligible').get(function() {
  return this.regulatoryInfo.refillsRemaining > 0;
});

// Virtual for total savings
prescriptionDispenseSchema.virtual('totalSavings').get(function() {
  if (this.insuranceInfo && this.insuranceInfo.coverageAmount) {
    return this.totalAmount - this.insuranceInfo.patientResponsibility;
  }
  return 0;
});

const PrescriptionDispense = mongoose.model('PrescriptionDispense', prescriptionDispenseSchema);

module.exports = PrescriptionDispense;