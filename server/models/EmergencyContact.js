const mongoose = require('mongoose');

const emergencyContactSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  relationship: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);