const mongoose = require('mongoose');

const medicationSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  name: {
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  prescribedBy: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  adherence: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  refillDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medication', medicationSchema);