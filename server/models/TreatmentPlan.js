const mongoose = require('mongoose');

const goalSchema = mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  targetDate: {
    type: String
  }
});

const treatmentPlanSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    required: true
  },
  lastUpdated: {
    type: Date,
    required: true
  },
  goals: [goalSchema],
  medications: [{
    type: String
  }],
  dietaryRecommendations: {
    type: String
  },
  activityRecommendations: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);