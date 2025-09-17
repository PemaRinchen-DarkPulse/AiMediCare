const mongoose = require('mongoose');

const healthInsightsSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  
  // AI-generated insights data
  trendAnalysis: {
    bloodPressure: {
      trend: { type: String, enum: ['improving', 'stable', 'declining', 'concerning'] },
      confidence: { type: Number, min: 0, max: 1 },
      summary: String,
      recommendations: [String]
    },
    bloodSugar: {
      trend: { type: String, enum: ['improving', 'stable', 'declining', 'concerning'] },
      confidence: { type: Number, min: 0, max: 1 },
      summary: String,
      recommendations: [String]
    },
    heartRate: {
      trend: { type: String, enum: ['improving', 'stable', 'declining', 'concerning'] },
      confidence: { type: Number, min: 0, max: 1 },
      summary: String,
      recommendations: [String]
    },
    weight: {
      trend: { type: String, enum: ['improving', 'stable', 'declining', 'concerning'] },
      confidence: { type: Number, min: 0, max: 1 },
      summary: String,
      recommendations: [String]
    },
    cholesterol: {
      trend: { type: String, enum: ['improving', 'stable', 'declining', 'concerning'] },
      confidence: { type: Number, min: 0, max: 1 },
      summary: String,
      recommendations: [String]
    }
  },

  // Personalized health tips
  personalizedTips: [{
    category: { 
      type: String, 
      enum: ['medication', 'lifestyle', 'diet', 'exercise', 'monitoring', 'general'] 
    },
    priority: { 
      type: String, 
      enum: ['high', 'medium', 'low'] 
    },
    title: String,
    description: String,
    actionable: Boolean
  }],

  // Overall health score and risk factors
  healthScore: {
    overall: { type: Number, min: 0, max: 100 },
    breakdown: {
      vitals: { type: Number, min: 0, max: 100 },
      medications: { type: Number, min: 0, max: 100 },
      lifestyle: { type: Number, min: 0, max: 100 }
    }
  },

  // Risk assessments
  riskFactors: [{
    condition: String,
    riskLevel: { type: String, enum: ['low', 'moderate', 'high'] },
    factors: [String],
    preventionTips: [String]
  }],

  // AI metadata
  aiMetadata: {
    modelUsed: { type: String, default: 'gemini-pro' },
    processingTime: Number, // in milliseconds
    dataQuality: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
    lastDataPoints: {
      vitalsCount: Number,
      medicationsCount: Number,
      conditionsCount: Number,
      timeRangeMonths: Number
    }
  },

  // Timestamps
  generatedAt: { type: Date, default: Date.now },
  validUntil: { type: Date }, // AI insights expire after some time
  
  // Analysis period
  analysisPeriod: {
    startDate: Date,
    endDate: Date,
    months: Number
  }

}, {
  timestamps: true,
  collection: 'healthinsights'
});

// Indexes for efficient queries
healthInsightsSchema.index({ patientId: 1, generatedAt: -1 });
healthInsightsSchema.index({ validUntil: 1 });

// Virtual for checking if insights are still valid
healthInsightsSchema.virtual('isValid').get(function() {
  return this.validUntil && this.validUntil > new Date();
});

// Method to check if insights need refresh (older than 7 days or expired)
healthInsightsSchema.methods.needsRefresh = function() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return !this.isValid || this.generatedAt < weekAgo;
};

// Static method to find latest valid insights for a patient
healthInsightsSchema.statics.findLatestValidInsights = function(patientId) {
  return this.findOne({
    patientId,
    validUntil: { $gt: new Date() }
  }).sort({ generatedAt: -1 });
};

// Pre-save middleware to set validUntil (30 days from generation)
healthInsightsSchema.pre('save', function(next) {
  if (this.isNew && !this.validUntil) {
    this.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

module.exports = mongoose.model('HealthInsights', healthInsightsSchema);