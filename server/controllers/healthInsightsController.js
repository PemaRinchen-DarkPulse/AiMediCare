const HealthInsights = require('../models/HealthInsights');
const Patient = require('../models/Patient');
const VitalRecord = require('../models/VitalRecord');
const Prescription = require('../models/Prescription');
const ChronicCondition = require('../models/ChronicCondition');
const Allergy = require('../models/Allergy');
const aiServiceClient = require('../utils/aiServiceClient');

// Generate or retrieve health insights for a patient
const getHealthInsights = async (req, res) => {
  try {
    console.log('Health insights request - req.user:', {
      id: req.user._id,
      role: req.user.role,
      email: req.user.email
    });

    let patientId = req.params.patientId;
    
    // If no patientId in params, find patient by user ID
    if (!patientId) {
      if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ user: req.user._id });
        if (!patient) {
          return res.status(404).json({
            success: false,
            message: 'Patient profile not found for this user'
          });
        }
        patientId = patient._id;
        console.log('Found patient ID for user:', patientId);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required for non-patient users'
        });
      }
    }

    console.log('Using patient ID:', patientId);

    // Check for existing valid insights
    const existingInsights = await HealthInsights.findLatestValidInsights(patientId);
    
    if (existingInsights && !existingInsights.needsRefresh()) {
      return res.json({
        success: true,
        data: existingInsights,
        fromCache: true
      });
    }

    // Generate new insights
    const insights = await generateHealthInsights(patientId);
    
    res.json({
      success: true,
      data: insights,
      fromCache: false
    });

  } catch (error) {
    console.error('Error fetching health insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health insights',
      error: error.message
    });
  }
};

// Force regenerate insights (admin or manual refresh)
const regenerateHealthInsights = async (req, res) => {
  try {
    const patientId = req.user.patientId || req.params.patientId;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    const insights = await generateHealthInsights(patientId, true);
    
    res.json({
      success: true,
      data: insights,
      regenerated: true
    });

  } catch (error) {
    console.error('Error regenerating health insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate health insights',
      error: error.message
    });
  }
};

// Core function to generate health insights
const generateHealthInsights = async (patientId, forceRegenerate = false) => {
  const startTime = Date.now();
  
  try {
    // Gather patient data for analysis
    const [patient, vitals, medications, conditions, allergies] = await Promise.all([
      Patient.findById(patientId),
      VitalRecord.find({ patientId }).sort({ date: -1 }).limit(100),
      Prescription.find({ patientId, status: 'active' }),
      ChronicCondition.find({ patientId }),
      Allergy.find({ patientId })
    ]);

    if (!patient) {
      throw new Error('Patient not found');
    }

    // Prepare data for AI analysis
    const analysisData = {
      patient: {
        age: calculateAge(patient.dateOfBirth),
        gender: patient.gender,
        bloodType: patient.bloodType,
        height: patient.height,
        weight: patient.weight
      },
      vitals: organizeVitalsData(vitals),
      medications: medications.map(med => ({
        name: med.medicationName,
        dosage: med.dosage,
        frequency: med.frequency,
        adherence: med.adherence || 100,
        purpose: med.purpose,
        startDate: med.startDate
      })),
      conditions: conditions.map(cond => ({
        condition: cond.condition,
        status: cond.status,
        diagnosedDate: cond.diagnosedDate
      })),
      allergies: allergies.map(allergy => ({
        allergen: allergy.allergen,
        severity: allergy.severity,
        reaction: allergy.reaction
      }))
    };

    // Call AI service for insights
    const aiInsights = await aiServiceClient.generateHealthInsights(analysisData);
    
    // Create new insights record
    const healthInsights = new HealthInsights({
      patientId,
      trendAnalysis: aiInsights.trendAnalysis,
      personalizedTips: aiInsights.personalizedTips,
      healthScore: aiInsights.healthScore,
      riskFactors: aiInsights.riskFactors,
      aiMetadata: {
        modelUsed: aiInsights.modelUsed || 'gemini-pro',
        processingTime: Date.now() - startTime,
        dataQuality: assessDataQuality(analysisData),
        lastDataPoints: {
          vitalsCount: vitals.length,
          medicationsCount: medications.length,
          conditionsCount: conditions.length,
          timeRangeMonths: getDataTimeRangeMonths(vitals)
        }
      },
      analysisPeriod: {
        startDate: vitals.length > 0 ? vitals[vitals.length - 1].date : new Date(),
        endDate: vitals.length > 0 ? vitals[0].date : new Date(),
        months: getDataTimeRangeMonths(vitals)
      }
    });

    await healthInsights.save();
    
    return healthInsights;

  } catch (error) {
    console.error('Error generating health insights:', error);
    throw error;
  }
};

// Helper functions
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const organizeVitalsData = (vitals) => {
  const organized = {
    bloodPressure: [],
    bloodSugar: [],
    heartRate: [],
    weight: [],
    cholesterol: []
  };

  vitals.forEach(vital => {
    const date = vital.date;
    
    if (vital.bloodPressureSystolic && vital.bloodPressureDiastolic) {
      organized.bloodPressure.push({
        date,
        systolic: vital.bloodPressureSystolic,
        diastolic: vital.bloodPressureDiastolic
      });
    }
    
    if (vital.bloodSugar) {
      organized.bloodSugar.push({
        date,
        value: vital.bloodSugar
      });
    }
    
    if (vital.heartRate) {
      organized.heartRate.push({
        date,
        value: vital.heartRate
      });
    }
    
    if (vital.weight) {
      organized.weight.push({
        date,
        value: vital.weight
      });
    }
    
    if (vital.cholesterol) {
      organized.cholesterol.push({
        date,
        value: vital.cholesterol
      });
    }
  });

  return organized;
};

const assessDataQuality = (data) => {
  let score = 0;
  
  // Vitals data quality
  const vitalsCount = Object.values(data.vitals).reduce((sum, arr) => sum + arr.length, 0);
  if (vitalsCount > 50) score += 25;
  else if (vitalsCount > 20) score += 20;
  else if (vitalsCount > 10) score += 15;
  else if (vitalsCount > 5) score += 10;
  
  // Medications data
  if (data.medications.length > 0) score += 25;
  
  // Conditions data
  if (data.conditions.length > 0) score += 25;
  
  // Patient demographics
  if (data.patient.age && data.patient.gender) score += 25;
  
  if (score >= 75) return 'excellent';
  if (score >= 50) return 'good';
  if (score >= 25) return 'fair';
  return 'poor';
};

const getDataTimeRangeMonths = (vitals) => {
  if (vitals.length < 2) return 0;
  
  const newest = new Date(vitals[0].date);
  const oldest = new Date(vitals[vitals.length - 1].date);
  
  const diffTime = Math.abs(newest - oldest);
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return diffMonths;
};

// Get insights history for a patient
const getInsightsHistory = async (req, res) => {
  try {
    const patientId = req.user.patientId || req.params.patientId;
    const limit = parseInt(req.query.limit) || 10;
    
    const insights = await HealthInsights.find({ patientId })
      .sort({ generatedAt: -1 })
      .limit(limit)
      .select('generatedAt healthScore.overall aiMetadata trendAnalysis');
    
    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Error fetching insights history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch insights history',
      error: error.message
    });
  }
};

module.exports = {
  getHealthInsights,
  regenerateHealthInsights,
  getInsightsHistory
};