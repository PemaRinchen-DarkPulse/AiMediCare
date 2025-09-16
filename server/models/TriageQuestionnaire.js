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
  aiMetadata: {
    generation_method: {
      type: String,
      enum: ['ai', 'fallback', 'emergency_fallback', 'manual'],
      default: 'manual'
    },
    confidence_score: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    processing_time: {
      type: Number,
      default: 0
    },
    ai_generated: {
      type: Boolean,
      default: false
    },
    model_used: String,
    analysis: {
      medical_category: String,
      urgency_level: {
        type: Number,
        min: 1,
        max: 5
      },
      key_symptoms: [String],
      suggested_specialty: String,
      requires_immediate_attention: Boolean
    },
    fallback_reason: String,
    language: {
      type: String,
      default: 'en'
    }
  },
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