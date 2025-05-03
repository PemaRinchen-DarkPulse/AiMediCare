const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Changed from 'Doctor' to 'User'
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['In-Person Visit', 'Video Call', 'Phone Call'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'doctor_accepted', 'confirmed', 'declined', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  clinicalNotes: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  room: {
    type: String,
    default: ''
  },
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  triageQuestionnaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TriageQuestionnaire'
  }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;