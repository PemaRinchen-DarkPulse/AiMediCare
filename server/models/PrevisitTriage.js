const mongoose = require('mongoose');

// Schema for individual questionnaire questions
const questionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'multiple_choice', 'yes_no', 'scale']
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    type: String,
    trim: true
  }]
});

// Schema for patient answers
const answerSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed, // Can be string, number, boolean
    required: true
  },
  answeredAt: {
    type: Date,
    default: Date.now
  }
});

const previsitTriageSchema = new mongoose.Schema({
  // Reference to the appointment
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true // Each appointment should have only one questionnaire
  },
  
  // Patient and doctor references
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
  
  // Original input data
  reasonForVisit: {
    type: String,
    required: true,
    trim: true
  },
  
  additionalNotes: {
    type: String,
    trim: true,
    default: ''
  },
  
  // NEW: Questionnaire format fields
  title: {
    type: String,
    trim: true,
    default: function() {
      return `Pre-Visit Questionnaire: ${this.reasonForVisit}`;
    }
  },
  
  questions: [questionSchema],
  
  answers: [answerSchema],
  
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // LEGACY: Original triage fields (maintained for backward compatibility)
  medicalCategory: {
    type: String,
    enum: [
      'general', 'cardiology', 'neurology', 'dermatology', 'orthopedics',
      'gastroenterology', 'pulmonology', 'endocrinology', 'psychiatry',
      'gynecology', 'urology', 'emergency', 'urgent', 'pediatrics'
    ],
    default: 'general'
  },
  
  urgencyLevel: {
    type: mongoose.Schema.Types.Mixed, // Can be Number (1-5) or String (Low/Medium/High/Critical)
    required: true,
    default: 'Medium',
    validate: {
      validator: function(value) {
        // Accept both old numeric format (1-5) and new string format
        if (typeof value === 'number') {
          return Number.isInteger(value) && value >= 1 && value <= 5;
        }
        if (typeof value === 'string') {
          return ['Low', 'Medium', 'High', 'Critical'].includes(value);
        }
        return false;
      },
      message: 'Urgency level must be 1-5 (number) or Low/Medium/High/Critical (string)'
    }
  },
  
  keySymptoms: [{
    type: String,
    trim: true
  }],
  
  suggestedSpecialty: {
    type: String,
    trim: true,
    default: null
  },
  
  requiresImmediateAttention: {
    type: Boolean,
    required: true,
    default: false
  },
  
  preparationNotes: {
    type: String,
    required: true,
    trim: true,
    default: 'Please bring your insurance card, a list of current medications, and any relevant medical records.'
  },
  
  patientInstructions: {
    type: String,
    trim: true,
    default: 'Please arrive 15 minutes early for check-in.'
  },
  
  estimatedDuration: {
    type: String,
    trim: true,
    default: '5-10 minutes'
  },
  
  recommendedTests: [{
    type: String,
    trim: true
  }],
  
  riskFactors: [{
    type: String,
    trim: true
  }],
  
  urgencyNotes: {
    type: String,
    trim: true,
    default: ''
  },
  
  // AI metadata
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  
  aiGenerated: {
    type: Boolean,
    default: true
  },
  
  generatedAt: {
    type: String,
    default: function() {
      return new Date().toISOString();
    }
  },
  
  modelUsed: {
    type: String,
    default: 'google/gemini-2.0-flash-exp:free'
  },
  
  fallbackReason: {
    type: String,
    default: null
  },
  
  // Processing status
  status: {
    type: String,
    enum: ['pending', 'generated', 'in_progress', 'completed', 'reviewed', 'approved'],
    default: 'pending'
  },
  
  // Review information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  reviewedAt: {
    type: Date,
    default: null
  },
  
  reviewNotes: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Error handling
  errors: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    error: {
      type: String,
      required: true
    },
    context: {
      type: String,
      default: ''
    }
  }],
  
  // Version control for updates
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better query performance
previsitTriageSchema.index({ appointmentId: 1 });
previsitTriageSchema.index({ patientId: 1 });
previsitTriageSchema.index({ doctorId: 1 });
previsitTriageSchema.index({ urgencyLevel: 1 });
previsitTriageSchema.index({ status: 1 });
previsitTriageSchema.index({ isCompleted: 1 });
previsitTriageSchema.index({ createdAt: -1 });

// Virtual for urgency description (handles both old and new formats)
previsitTriageSchema.virtual('urgencyDescription').get(function() {
  if (typeof this.urgencyLevel === 'number') {
    const descriptions = {
      1: 'Routine',
      2: 'Non-urgent', 
      3: 'Moderate',
      4: 'Urgent',
      5: 'Emergency'
    };
    return descriptions[this.urgencyLevel] || 'Unknown';
  }
  return this.urgencyLevel; // Already a string description
});

// Virtual for urgency priority (normalizes to numeric value)
previsitTriageSchema.virtual('urgencyPriority').get(function() {
  if (typeof this.urgencyLevel === 'number') {
    return this.urgencyLevel;
  }
  const priorities = {
    'Low': 1,
    'Medium': 2,
    'High': 3,
    'Critical': 4
  };
  return priorities[this.urgencyLevel] || 2;
});

// Virtual for status display
previsitTriageSchema.virtual('statusDisplay').get(function() {
  return this.status.charAt(0).toUpperCase() + this.status.slice(1).replace('_', ' ');
});

// Method to add patient answer
previsitTriageSchema.methods.addAnswer = function(questionId, answer) {
  // Remove existing answer for this question if it exists
  this.answers = this.answers.filter(a => a.questionId !== questionId);
  
  // Add new answer
  this.answers.push({
    questionId: questionId,
    answer: answer
  });
  
  // Update completion percentage
  this.updateCompletionPercentage();
  
  return this.save();
};

// Method to update completion percentage
previsitTriageSchema.methods.updateCompletionPercentage = function() {
  const totalQuestions = this.questions.length;
  const requiredQuestions = this.questions.filter(q => q.required).length;
  const answeredQuestions = this.answers.length;
  const answeredRequiredQuestions = this.answers.filter(a => {
    const question = this.questions.find(q => q.id === a.questionId);
    return question && question.required;
  }).length;
  
  if (totalQuestions === 0) {
    this.completionPercentage = 0;
    return;
  }
  
  // Calculate based on required questions if any exist, otherwise all questions
  if (requiredQuestions > 0) {
    this.completionPercentage = Math.round((answeredRequiredQuestions / requiredQuestions) * 100);
  } else {
    this.completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
  }
  
  // Mark as completed if all required questions are answered
  if (this.completionPercentage >= 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
    this.status = 'completed';
  }
};

// Method to add error
previsitTriageSchema.methods.addError = function(error, context = '') {
  this.errors.push({
    error: error,
    context: context
  });
  return this.save();
};

// Method to mark as reviewed
previsitTriageSchema.methods.markAsReviewed = function(reviewerId, notes = '') {
  this.status = 'reviewed';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

// Method to update questionnaire data from AI response
previsitTriageSchema.methods.updateQuestionnaireData = function(questionnaireData) {
  this.title = questionnaireData.title || this.title;
  this.urgencyLevel = questionnaireData.urgency_level || this.urgencyLevel;
  this.estimatedDuration = questionnaireData.estimated_duration || this.estimatedDuration;
  this.questions = questionnaireData.questions || this.questions;
  this.preparationNotes = questionnaireData.preparation_notes || this.preparationNotes;
  this.urgencyNotes = questionnaireData.urgency_notes || this.urgencyNotes;
  this.aiGenerated = questionnaireData.ai_generated !== undefined ? questionnaireData.ai_generated : this.aiGenerated;
  this.generatedAt = questionnaireData.generated_at || this.generatedAt;
  this.modelUsed = questionnaireData.model_used || this.modelUsed;
  this.fallbackReason = questionnaireData.fallback_reason || this.fallbackReason;
  this.status = 'generated';
  this.version += 1;
  
  return this.save();
};

// LEGACY: Method to update triage data (for backward compatibility)
previsitTriageSchema.methods.updateTriageData = function(triageData) {
  this.medicalCategory = triageData.medical_category || this.medicalCategory;
  this.urgencyLevel = triageData.urgency_level || this.urgencyLevel;
  this.keySymptoms = triageData.key_symptoms || this.keySymptoms;
  this.suggestedSpecialty = triageData.suggested_specialty || this.suggestedSpecialty;
  this.requiresImmediateAttention = triageData.requires_immediate_attention !== undefined 
    ? triageData.requires_immediate_attention 
    : this.requiresImmediateAttention;
  this.preparationNotes = triageData.preparation_notes || this.preparationNotes;
  this.patientInstructions = triageData.patient_instructions || this.patientInstructions;
  this.estimatedDuration = triageData.estimated_duration || this.estimatedDuration;
  this.recommendedTests = triageData.recommended_tests || this.recommendedTests;
  this.riskFactors = triageData.risk_factors || this.riskFactors;
  this.aiConfidence = triageData.ai_confidence !== undefined 
    ? triageData.ai_confidence 
    : this.aiConfidence;
  this.generatedAt = triageData.generated_at || this.generatedAt;
  this.modelUsed = triageData.model_used || this.modelUsed;
  this.status = 'generated';
  this.version += 1;
  
  return this.save();
};

// Static method to find by appointment
previsitTriageSchema.statics.findByAppointment = function(appointmentId) {
  return this.findOne({ appointmentId }).populate('patientId doctorId reviewedBy');
};

// Static method to find urgent cases
previsitTriageSchema.statics.findUrgentCases = function(doctorId = null) {
  const query = { 
    $or: [
      { urgencyLevel: { $gte: 4 } }, // Old numeric format
      { urgencyLevel: { $in: ['High', 'Critical'] } } // New string format
    ],
    status: { $ne: 'reviewed' } 
  };
  if (doctorId) {
    query.doctorId = doctorId;
  }
  return this.find(query).populate('appointmentId patientId');
};

// Static method to find completed questionnaires
previsitTriageSchema.statics.findCompletedQuestionnaires = function(doctorId = null) {
  const query = { 
    isCompleted: true,
    status: { $ne: 'reviewed' }
  };
  if (doctorId) {
    query.doctorId = doctorId;
  }
  return this.find(query).populate('appointmentId patientId');
};

// Pre-save middleware to ensure data consistency
previsitTriageSchema.pre('save', function(next) {
  // Update completion percentage if we have questionnaire data
  if (this.questions && this.questions.length > 0) {
    if (this.isModified('answers') || this.isModified('questions')) {
      this.updateCompletionPercentage();
    }
  }
  
  // Handle urgency level conversion and immediate attention
  const urgencyPriority = this.urgencyPriority;
  if (urgencyPriority >= 4) {
    this.requiresImmediateAttention = true;
  }
  
  // Ensure required fields are not empty
  if (!this.preparationNotes || this.preparationNotes.trim() === '') {
    this.preparationNotes = `Patient appointment for: ${this.reasonForVisit}`;
  }
  
  // Set title if not provided
  if (!this.title || this.title.trim() === '') {
    this.title = `Pre-Visit Questionnaire: ${this.reasonForVisit}`;
  }
  
  next();
});

// Export the model
module.exports = mongoose.model('PrevisitTriage', previsitTriageSchema);