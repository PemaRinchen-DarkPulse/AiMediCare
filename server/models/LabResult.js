const mongoose = require('mongoose');

const labResultSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  normalRange: {
    type: String,
    required: true
  },
  isAbnormal: {
    type: Boolean,
    default: false
  },
  orderedBy: {
    type: String,
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabResult', labResultSchema);