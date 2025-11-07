const PharmacyAIService = require('../utils/pharmacyAIService');
const MedicationInventory = require('../models/MedicationInventory');
const PharmacyPatientProfile = require('../models/PharmacyPatientProfile');
const PrescriptionDispense = require('../models/PrescriptionDispense');

// @desc    Get AI-powered medication interaction analysis
// @route   POST /api/pharmacy/ai/interaction-analysis
// @access  Private (Pharmacist)
const getAIMedicationInteractionAnalysis = async (req, res) => {
  try {
    const { medications, patientId } = req.body;

    if (!medications || medications.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 medications are required for interaction analysis'
      });
    }

    // Get patient information if provided
    let patientInfo = {};
    if (patientId) {
      const patientProfile = await PharmacyPatientProfile.findOne({
        patientId,
        pharmacistId: req.user._id
      }).populate('patientId', 'dateOfBirth gender');

      if (patientProfile) {
        const patient = patientProfile.patientId;
        patientInfo = {
          age: patient.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
          gender: patient.gender,
          conditions: patientProfile.medicalConditions.map(c => c.condition),
          allergies: patientProfile.allergies.map(a => a.allergen)
        };
      }
    }

    // Call AI service for interaction analysis
    const aiAnalysis = await PharmacyAIService.analyzeMedicationInteractions({
      medications,
      patientConditions: patientInfo.conditions || [],
      patientAllergies: patientInfo.allergies || [],
      patientAge: patientInfo.age,
      patientWeight: patientInfo.weight
    });

    res.json({
      success: true,
      data: {
        ...aiAnalysis.data,
        patient_info: patientInfo
      }
    });
  } catch (error) {
    console.error('AI medication interaction analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze medication interactions',
      error: error.message
    });
  }
};

// @desc    Generate AI-powered medication counseling
// @route   POST /api/pharmacy/ai/counseling
// @access  Private (Pharmacist)
const generateAIMedicationCounseling = async (req, res) => {
  try {
    const { medication, patientId, indication } = req.body;

    if (!medication || !medication.name) {
      return res.status(400).json({
        success: false,
        message: 'Medication information is required'
      });
    }

    // Get patient information if provided
    let patientInfo = {};
    if (patientId) {
      const patientProfile = await PharmacyPatientProfile.findOne({
        patientId,
        pharmacistId: req.user._id
      }).populate('patientId', 'dateOfBirth gender');

      if (patientProfile) {
        const patient = patientProfile.patientId;
        patientInfo = {
          age: patient.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
          gender: patient.gender,
          conditions: patientProfile.medicalConditions.map(c => c.condition),
          allergies: patientProfile.allergies.map(a => a.allergen)
        };
      }
    }

    // Call AI service for counseling information
    const aiCounseling = await PharmacyAIService.generateMedicationCounseling({
      medication,
      patientInfo,
      indication
    });

    res.json({
      success: true,
      data: aiCounseling.data
    });
  } catch (error) {
    console.error('AI medication counseling generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate medication counseling',
      error: error.message
    });
  }
};

// @desc    Get AI-powered adherence analysis
// @route   POST /api/pharmacy/ai/adherence-analysis
// @access  Private (Pharmacist)
const getAIAdherenceAnalysis = async (req, res) => {
  try {
    const { patientId, timeframe = 90 } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Get patient profile and medication history
    const patientProfile = await PharmacyPatientProfile.findOne({
      patientId,
      pharmacistId: req.user._id
    });

    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Get recent prescription dispenses
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    const recentDispenses = await PrescriptionDispense.find({
      patientId,
      pharmacistId: req.user._id,
      dispensingDate: { $gte: startDate },
      status: 'completed'
    });

    // Calculate adherence scores
    const adherenceScores = {};
    const barriers = patientProfile.complianceAssessment?.barriers || [];
    
    patientProfile.currentMedications.forEach(med => {
      if (med.status === 'active' && med.adherenceScore !== undefined) {
        adherenceScores[med.medicationName] = med.adherenceScore;
      }
    });

    // Call AI service for adherence analysis
    const aiAnalysis = await PharmacyAIService.analyzeAdherence({
      adherenceScores,
      barriers,
      medicationHistory: recentDispenses
    });

    res.json({
      success: true,
      data: {
        ...aiAnalysis.data,
        patient_profile: {
          current_medications: patientProfile.currentMedications.filter(m => m.status === 'active'),
          compliance_assessment: patientProfile.complianceAssessment
        }
      }
    });
  } catch (error) {
    console.error('AI adherence analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze medication adherence',
      error: error.message
    });
  }
};

// @desc    Get AI-powered clinical decision support
// @route   POST /api/pharmacy/ai/clinical-support
// @access  Private (Pharmacist)
const getAIClinicalDecisionSupport = async (req, res) => {
  try {
    const { scenario, patientId, questionType = 'general' } = req.body;

    if (!scenario) {
      return res.status(400).json({
        success: false,
        message: 'Clinical scenario is required'
      });
    }

    // Get patient information if provided
    let patientData = {};
    if (patientId) {
      const patientProfile = await PharmacyPatientProfile.findOne({
        patientId,
        pharmacistId: req.user._id
      }).populate('patientId', 'dateOfBirth gender');

      if (patientProfile) {
        const patient = patientProfile.patientId;
        patientData = {
          age: patient.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
          gender: patient.gender,
          current_medications: patientProfile.currentMedications
            .filter(m => m.status === 'active')
            .map(m => m.medicationName),
          allergies: patientProfile.allergies.map(a => a.allergen),
          conditions: patientProfile.medicalConditions.map(c => c.condition)
        };
      }
    }

    // Call AI service for clinical decision support
    const aiSupport = await PharmacyAIService.getClinicalDecisionSupport({
      scenario,
      patientData,
      questionType
    });

    res.json({
      success: true,
      data: aiSupport.data
    });
  } catch (error) {
    console.error('AI clinical decision support error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get clinical decision support',
      error: error.message
    });
  }
};

// @desc    Get AI-powered inventory optimization
// @route   POST /api/pharmacy/ai/inventory-optimization
// @access  Private (Pharmacist)
const getAIInventoryOptimization = async (req, res) => {
  try {
    const { timeframe = 30, includeSeasonalFactors = true } = req.body;
    const pharmacistId = req.user._id;

    // Get current inventory
    const inventory = await MedicationInventory.find({
      pharmacistId,
      isActive: true
    });

    // Get sales data (prescription dispenses)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    const salesData = await PrescriptionDispense.aggregate([
      {
        $match: {
          pharmacistId,
          dispensingDate: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $unwind: '$dispensedMedications'
      },
      {
        $group: {
          _id: '$dispensedMedications.medicationName',
          totalQuantity: { $sum: '$dispensedMedications.dispensedQuantity' },
          totalRevenue: { $sum: '$dispensedMedications.totalPrice' },
          dispensingCount: { $sum: 1 }
        }
      }
    ]);

    // Prepare inventory data for AI
    const inventoryData = inventory.map(item => ({
      name: item.medicationName,
      current_stock: item.currentStock,
      minimum_stock: item.minimumStock,
      maximum_stock: item.maximumStock,
      stock_status: item.stockStatus,
      expiry_status: item.expiryStatus,
      expiry_date: item.expiryDate,
      category: item.category,
      unit_price: item.unitPrice,
      cost_price: item.costPrice
    }));

    // Seasonal factors (could be enhanced with more data)
    const seasonalFactors = includeSeasonalFactors ? {
      current_season: getCurrentSeason(),
      flu_season: isfluSeason(),
      allergy_season: isAllergySeason()
    } : {};

    // Call AI service for inventory optimization
    const aiOptimization = await PharmacyAIService.optimizeInventory({
      inventoryItems: inventoryData,
      salesData,
      seasonalFactors
    });

    res.json({
      success: true,
      data: {
        ...aiOptimization.data,
        current_inventory_stats: {
          total_items: inventory.length,
          low_stock_items: inventory.filter(i => i.lowStockAlert).length,
          expiring_items: inventory.filter(i => i.nearExpiryAlert).length,
          total_value: inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0)
        },
        sales_summary: {
          timeframe_days: timeframe,
          unique_medications_sold: salesData.length,
          total_revenue: salesData.reduce((sum, item) => sum + item.totalRevenue, 0)
        }
      }
    });
  } catch (error) {
    console.error('AI inventory optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize inventory',
      error: error.message
    });
  }
};

// @desc    Get AI-powered medication recommendations with pharmacy context
// @route   POST /api/pharmacy/ai/medication-recommendations
// @access  Private (Pharmacist)
const getAIPharmacyMedicationRecommendations = async (req, res) => {
  try {
    const { symptoms, patientId, considerInventory = true, costConsiderations = false } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms are required'
      });
    }

    // Get patient information
    let patientData = {};
    if (patientId) {
      const patientProfile = await PharmacyPatientProfile.findOne({
        patientId,
        pharmacistId: req.user._id
      }).populate('patientId', 'dateOfBirth gender');

      if (patientProfile) {
        const patient = patientProfile.patientId;
        patientData = {
          age: patient.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
          weight: patient.weight,
          medicalHistory: patientProfile.medicalConditions.map(c => c.condition),
          currentMedications: patientProfile.currentMedications
            .filter(m => m.status === 'active')
            .map(m => m.medicationName),
          allergies: patientProfile.allergies.map(a => a.allergen)
        };
      }
    }

    // Get available inventory if considering pharmacy stock
    let inventoryAvailable = [];
    if (considerInventory) {
      const inventory = await MedicationInventory.find({
        pharmacistId: req.user._id,
        isActive: true,
        currentStock: { $gt: 0 }
      });

      inventoryAvailable = inventory.map(item => ({
        name: item.medicationName,
        dosage_form: item.dosageForm,
        strength: item.strength,
        available_quantity: item.currentStock,
        unit_price: item.unitPrice
      }));
    }

    // Call AI service for medication recommendations
    const aiRecommendations = await PharmacyAIService.getPharmacyMedicationRecommendations({
      symptoms,
      ...patientData,
      inventoryAvailable,
      costConsiderations
    });

    res.json({
      success: true,
      data: {
        ...aiRecommendations.data,
        pharmacy_context: {
          inventory_considered: considerInventory,
          cost_optimization: costConsiderations,
          available_alternatives: inventoryAvailable.length
        }
      }
    });
  } catch (error) {
    console.error('AI pharmacy medication recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get medication recommendations',
      error: error.message
    });
  }
};

// Helper functions
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

const isfluSeason = () => {
  const month = new Date().getMonth();
  return month >= 9 || month <= 2; // October to March
};

const isAllergySeason = () => {
  const month = new Date().getMonth();
  return month >= 2 && month <= 5; // March to June
};

module.exports = {
  getAIMedicationInteractionAnalysis,
  generateAIMedicationCounseling,
  getAIAdherenceAnalysis,
  getAIClinicalDecisionSupport,
  getAIInventoryOptimization,
  getAIPharmacyMedicationRecommendations
};