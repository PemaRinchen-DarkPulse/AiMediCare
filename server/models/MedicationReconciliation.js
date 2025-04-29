const mongoose = require('mongoose');

const medicationReconciliationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedBy: {
    type: String
  },
  performerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastReconciliationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['resolved', 'pending', 'conflict'],
    default: 'pending'
  },
  sources: [{
    name: String,
    lastUpdated: Date,
    medicationCount: Number,
    description: String
  }],
  discrepancies: [{
    medicationName: String,
    description: String,
    status: {
      type: String,
      enum: ['resolved', 'pending', 'conflict'],
      default: 'pending'
    },
    resolution: String,
    resolvedBy: String,
    resolutionDate: Date
  }]
}, { timestamps: true });

const MedicationReconciliation = mongoose.model('MedicationReconciliation', medicationReconciliationSchema);

module.exports = MedicationReconciliation;