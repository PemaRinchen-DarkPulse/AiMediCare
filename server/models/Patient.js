const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  },
  medicalHistory: [{
    condition: String,
    diagnosisDate: Date,
    notes: String
  }],
  allergies: [{
    allergen: String,
    severity: String,
    reaction: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date
  }],
  preferredPharmacy: {
    name: String,
    address: String,
    phone: String
  },
  bloodType: String,
  height: Number,
  weight: Number
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;