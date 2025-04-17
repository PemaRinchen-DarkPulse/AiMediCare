const mongoose = require('mongoose');

const pharmacistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  licenseExpiryDate: Date,
  issuingAuthority: String,
  yearsExperience: Number,
  pharmacyName: String,
  pharmacyAddress: String,
  pharmacyPhone: String,
  certification: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date
  }],
  specialties: [String],
  education: [{
    degree: String,
    institution: String,
    graduationYear: Number
  }],
  bankName: String,
  accountNumber: String,
  routingNumber: String
}, { timestamps: true });

const Pharmacist = mongoose.model('Pharmacist', pharmacistSchema);

module.exports = Pharmacist;