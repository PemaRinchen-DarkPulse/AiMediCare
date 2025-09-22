const mongoose = require('mongoose');

const diagnosticInsightsSchema = new mongoose.Schema({
  testResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiagnosticTest',
    required: true,
    unique: true, // One insight per test result
    index: true
  },
  
  // OCR extracted text
  extractedText: {
    type: String,
    default: ''
  },
  
  // Structured data extracted from the report
  structuredData: {
    testValues: [{
      parameter: String,
      value: String,
      unit: String,
      referenceRange: String,
      isAbnormal: {
        type: Boolean,
        default: false
      }
    }],
    patientInfo: {
      name: String,
      age: String,
      gender: String,
      testDate: Date
    },
    laboratoryInfo: {
      name: String,
      address: String,
      phone: String
    }
  },
  
  // AI-detected abnormal findings
  abnormalFindings: [{
    parameter: String,
    value: String,
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'moderate'
    },
    description: String,
    recommendation: String
  }],
  
  // Natural language summary from AI
  aiSummary: {
    type: String,
    default: ''
  },
  
  // Overall risk assessment
  riskAssessment: {
    level: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'low'
    },
    description: String
  },
  
  // Processing metadata
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  processingError: {
    type: String,
    default: null
  },
  
  // AI service metadata
  aiModel: {
    type: String,
    default: 'gemini-1.5-flash'
  },
  
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  
  // File processing info
  sourceFile: {
    fileName: String,
    fileType: String,
    fileSize: Number,
    processingTime: Number // in milliseconds
  }
}, {
  timestamps: true
});

// Index for efficient querying
diagnosticInsightsSchema.index({ testResultId: 1 });
diagnosticInsightsSchema.index({ processingStatus: 1 });
diagnosticInsightsSchema.index({ createdAt: -1 });

// Virtual for formatted processing time
diagnosticInsightsSchema.virtual('formattedProcessingTime').get(function() {
  if (!this.sourceFile?.processingTime) return 'N/A';
  const seconds = (this.sourceFile.processingTime / 1000).toFixed(2);
  return `${seconds}s`;
});

// Method to check if insights are stale (older than 24 hours)
diagnosticInsightsSchema.methods.isStale = function() {
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return Date.now() - this.updatedAt.getTime() > twentyFourHours;
};

// Static method to find insights by test result ID
diagnosticInsightsSchema.statics.findByTestResultId = function(testResultId) {
  return this.findOne({ testResultId }).populate('testResultId');
};

// Pre-save middleware to validate structured data
diagnosticInsightsSchema.pre('save', function(next) {
  // Ensure abnormal findings match test values
  if (this.structuredData?.testValues && this.abnormalFindings) {
    const testParams = this.structuredData.testValues.map(tv => tv.parameter.toLowerCase());
    this.abnormalFindings = this.abnormalFindings.filter(af => 
      testParams.includes(af.parameter.toLowerCase())
    );
  }
  next();
});

const DiagnosticInsights = mongoose.model('DiagnosticInsights', diagnosticInsightsSchema);

module.exports = DiagnosticInsights;