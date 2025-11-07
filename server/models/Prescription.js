const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
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
  duration: {
    type: String,
    required: true
  },
  instructions: {
    type: String
  }
});

const prescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  diagnosis: {
    type: String
  },
  medications: [medicationSchema],
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'sent-to-pharmacy', 'dispensed'],
    default: 'active'
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  pharmacyInfo: {
    assignedPharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pharmacyName: String,
    sentToPharmacyDate: Date,
    dispensedDate: Date,
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  refills: {
    authorized: {
      type: Number,
      min: 0,
      default: 0
    },
    remaining: {
      type: Number,
      min: 0,
      default: 0
    }
  }
}, {
  timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;