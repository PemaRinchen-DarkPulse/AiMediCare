const mongoose = require('mongoose');

const medicationInventorySchema = new mongoose.Schema({
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicationName: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  brandName: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  ndc: { // National Drug Code
    type: String,
    required: true,
    unique: true
  },
  dosageForm: {
    type: String,
    enum: ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'patch', 'suppository'],
    required: true
  },
  strength: {
    type: String,
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
  manufacturingDate: {
    type: Date,
    required: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  maximumStock: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  storageConditions: {
    temperature: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    humidity: {
      min: Number,
      max: Number
    },
    lightCondition: {
      type: String,
      enum: ['dark', 'light-protected', 'normal'],
      default: 'normal'
    },
    specialInstructions: String
  },
  category: {
    type: String,
    enum: ['prescription', 'otc', 'controlled', 'refrigerated', 'specialty'],
    required: true
  },
  controlledSubstance: {
    schedule: {
      type: String,
      enum: ['I', 'II', 'III', 'IV', 'V']
    },
    dea_required: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  lowStockAlert: {
    type: Boolean,
    default: false
  },
  nearExpiryAlert: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Indexes for better performance
medicationInventorySchema.index({ pharmacistId: 1, medicationName: 1 });
medicationInventorySchema.index({ ndc: 1 });
medicationInventorySchema.index({ expiryDate: 1 });
medicationInventorySchema.index({ currentStock: 1 });

// Virtual for stock status
medicationInventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) return 'out-of-stock';
  if (this.currentStock <= this.minimumStock) return 'low-stock';
  if (this.currentStock >= this.maximumStock) return 'overstock';
  return 'in-stock';
});

// Virtual for expiry status
medicationInventorySchema.virtual('expiryStatus').get(function() {
  const today = new Date();
  const expiryDate = new Date(this.expiryDate);
  const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) return 'expired';
  if (daysDiff <= 30) return 'expiring-soon';
  if (daysDiff <= 90) return 'expiring-warning';
  return 'valid';
});

// Pre-save middleware to update alerts
medicationInventorySchema.pre('save', function(next) {
  // Update low stock alert
  this.lowStockAlert = this.currentStock <= this.minimumStock;
  
  // Update near expiry alert (30 days)
  const today = new Date();
  const expiryDate = new Date(this.expiryDate);
  const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  this.nearExpiryAlert = daysDiff <= 30 && daysDiff >= 0;
  
  next();
});

const MedicationInventory = mongoose.model('MedicationInventory', medicationInventorySchema);

module.exports = MedicationInventory;