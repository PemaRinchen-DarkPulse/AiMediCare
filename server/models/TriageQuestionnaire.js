const mongoose = require('mongoose');

const triageQuestionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['multiple_choice', 'severity_scale', 'yes_no', 'text']
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: function() {
      return this.type === 'multiple_choice';
    }
  },
  min: {
    type: Number,
    required: function() {
      return this.type === 'severity_scale';
    }
  },
  max: {
    type: Number,
    required: function() {
      return this.type === 'severity_scale';
    }
  },
  minLabel: {
    type: String,
    required: function() {
      return this.type === 'severity_scale';
    }
  },
  maxLabel: {
    type: String,
    required: function() {
      return this.type === 'severity_scale';
    }
  },
  required: {
    type: Boolean,
    default: false
  }
});

const triageAnswerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const triageQuestionnaireSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  questions: [triageQuestionSchema],
  answers: [triageAnswerSchema],
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  generatedFromReason: {
    type: String,
    required: true
  },
  generatedFromNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
triageQuestionnaireSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TriageQuestionnaire = mongoose.model('TriageQuestionnaire', triageQuestionnaireSchema);

module.exports = TriageQuestionnaire;