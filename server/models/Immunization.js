const mongoose = require('mongoose');

const immunizationSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  vaccine: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  administrator: {
    type: String,
    required: true
  },
  facility: {
    type: String,
    required: true
  },
  lotNumber: {
    type: String
  },
  nextDueDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Immunization', immunizationSchema);