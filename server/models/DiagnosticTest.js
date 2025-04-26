const mongoose = require('mongoose');

const diagnosticTestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    testType: {
      type: String,
      required: [true, 'Test type is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted by patient', 'completed', 'cancelled'],
      default: 'pending'
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      trim: true
    },
    
    // Results fields
    hasResults: {
      type: Boolean,
      default: false
    },
    resultDate: {
      type: Date
    },
    findings: {
      type: String
    },
    interpretation: {
      type: String
    },
    technician: {
      type: String
    },
    attachmentUrl: {
      type: String
    },
    resultNotes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const DiagnosticTest = mongoose.model('DiagnosticTest', diagnosticTestSchema);

module.exports = DiagnosticTest;