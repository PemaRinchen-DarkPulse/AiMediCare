const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicalLicenseNumber: {
    type: String,
    required: true
  },
  licenseExpiryDate: Date,
  issuingAuthority: String,
  specialty: {
    type: String,
    default: ''
  },
  specialization: String,
  yearsExperience: Number,
  experience: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  hospitalName: String, // Added explicit hospitalName field
  clinicAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
  education: [{
    degree: String,
    institution: String,
    graduationYear: Number
  }],
  practiceLocation: String,
  consultationFee: Number,
  accountHolder: String,
  bankName: String,
  accountNumber: String,
  routingNumber: String,
  availableTimeSlots: [{
    day: String,
    startTime: String,
    endTime: String
  }]
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;