const mongoose = require('mongoose');

const medicationInteractionSchema = new mongoose.Schema({
  medicationA: {
    name: String,
    ndc: String
  },
  medicationB: {
    name: String,
    ndc: String
  },
  interactionType: {
    type: String,
    enum: ['major', 'moderate', 'minor', 'contraindicated'],
    required: true
  },
  description: String,
  clinicalEffect: String,
  mechanism: String,
  management: String,
  severity: {
    type: Number,
    min: 1,
    max: 5
  }
});

const pharmacyPatientProfileSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  primaryPharmacy: {
    type: Boolean,
    default: true
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
    email: String
  },
  medicationHistory: [{
    prescriptionDispenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrescriptionDispense'
    },
    medicationName: String,
    dateDispensed: Date,
    quantity: Number,
    daysSupply: Number,
    refillsRemaining: Number,
    status: {
      type: String,
      enum: ['active', 'completed', 'discontinued', 'on-hold']
    }
  }],
  currentMedications: [{
    medicationName: {
      type: String,
      required: true
    },
    dosage: String,
    frequency: String,
    startDate: Date,
    prescribedBy: String,
    indication: String,
    status: {
      type: String,
      enum: ['active', 'discontinued', 'on-hold'],
      default: 'active'
    },
    adherenceScore: {
      type: Number,
      min: 0,
      max: 100
    },
    lastRefillDate: Date,
    nextRefillDue: Date
  }],
  allergies: [{
    allergen: {
      type: String,
      required: true
    },
    reactionType: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life-threatening'],
      required: true
    },
    symptoms: [String],
    dateReported: {
      type: Date,
      default: Date.now
    },
    reportedBy: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  medicalConditions: [{
    condition: String,
    diagnosisDate: Date,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic']
    },
    medications: [String]
  }],
  drugInteractions: [medicationInteractionSchema],
  counselingHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    counseledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    topicsCovered: [String],
    materials_provided: [String],
    patientUnderstanding: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  complianceAssessment: {
    overallAdherence: {
      type: Number,
      min: 0,
      max: 100
    },
    barriers: [String],
    interventions: [String],
    lastAssessmentDate: Date,
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  insuranceInformation: [{
    provider: String,
    policyNumber: String,
    groupNumber: String,
    subscriberId: String,
    relationship: String,
    effectiveDate: Date,
    expirationDate: Date,
    copayAmounts: {
      generic: Number,
      brand: Number,
      specialty: Number
    },
    deductible: {
      annual: Number,
      remaining: Number
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  preferences: {
    communicationMethod: {
      type: String,
      enum: ['phone', 'email', 'text', 'mail'],
      default: 'phone'
    },
    refillReminders: {
      type: Boolean,
      default: true
    },
    genericSubstitution: {
      type: Boolean,
      default: true
    },
    childResistantCaps: {
      type: Boolean,
      default: true
    },
    languagePreference: {
      type: String,
      default: 'English'
    },
    specialInstructions: String
  },
  alerts: [{
    type: {
      type: String,
      enum: ['allergy', 'interaction', 'duplication', 'contraindication', 'age-related', 'renal-adjustment', 'hepatic-adjustment'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    message: String,
    isActive: {
      type: Boolean,
      default: true
    },
    dateCreated: {
      type: Date,
      default: Date.now
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedDate: Date
  }],
  lastVisit: {
    date: Date,
    purpose: String,
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, { timestamps: true });

// Indexes for better performance
pharmacyPatientProfileSchema.index({ patientId: 1, pharmacistId: 1 });
pharmacyPatientProfileSchema.index({ patientId: 1 });
pharmacyPatientProfileSchema.index({ 'currentMedications.nextRefillDue': 1 });
pharmacyPatientProfileSchema.index({ 'alerts.isActive': 1, 'alerts.severity': 1 });

// Virtual for active medications count
pharmacyPatientProfileSchema.virtual('activeMedicationsCount').get(function() {
  return this.currentMedications.filter(med => med.status === 'active').length;
});

// Virtual for high-priority alerts
pharmacyPatientProfileSchema.virtual('highPriorityAlerts').get(function() {
  return this.alerts.filter(alert => 
    alert.isActive && (alert.severity === 'high' || alert.severity === 'critical')
  ).length;
});

const PharmacyPatientProfile = mongoose.model('PharmacyPatientProfile', pharmacyPatientProfileSchema);

module.exports = PharmacyPatientProfile;