const mongoose = require('mongoose');

const medicationReviewSchema = new mongoose.Schema({
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
  doctorName: {
    type: String
  },
  reviewDate: {
    type: Date,
    default: Date.now
  },
  medications: [{
    name: String,
    dosage: String,
    status: {
      type: String,
      enum: ['continue', 'adjust', 'discontinue'],
      default: 'continue'
    },
    notes: String
  }],
  assessment: {
    type: String
  },
  followUpDate: {
    type: Date
  },
  urgent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const MedicationReview = mongoose.model('MedicationReview', medicationReviewSchema);

module.exports = MedicationReview;