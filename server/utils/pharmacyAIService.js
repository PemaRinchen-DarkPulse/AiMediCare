const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class PharmacyAIService {
  // Analyze medication interactions using AI
  static async analyzeMedicationInteractions(medicationData) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/pharmacy/medication-interaction-analysis`, {
        medications: medicationData.medications,
        patient_conditions: medicationData.patientConditions || [],
        patient_allergies: medicationData.patientAllergies || [],
        patient_age: medicationData.patientAge,
        patient_weight: medicationData.patientWeight,
        analysis_date: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('AI medication interaction analysis error:', error.message);
      throw new Error('Failed to analyze medication interactions with AI');
    }
  }

  // Generate medication counseling information
  static async generateMedicationCounseling(medicationData) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/pharmacy/medication-counseling`, {
        medication: medicationData.medication,
        patient_info: medicationData.patientInfo || {},
        indication: medicationData.indication || '',
        generated_date: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('AI medication counseling generation error:', error.message);
      throw new Error('Failed to generate medication counseling with AI');
    }
  }

  // Analyze medication adherence patterns
  static async analyzeAdherence(adherenceData) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/pharmacy/medication-adherence-analysis`, {
        adherence_data: adherenceData.adherenceScores || {},
        barriers: adherenceData.barriers || [],
        medication_history: adherenceData.medicationHistory || [],
        analysis_date: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('AI adherence analysis error:', error.message);
      throw new Error('Failed to analyze medication adherence with AI');
    }
  }

  // Get clinical decision support
  static async getClinicalDecisionSupport(clinicalData) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/pharmacy/clinical-decision-support`, {
        scenario: clinicalData.scenario,
        patient_data: clinicalData.patientData || {},
        question_type: clinicalData.questionType || 'general',
        consultation_date: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('AI clinical decision support error:', error.message);
      throw new Error('Failed to get clinical decision support from AI');
    }
  }

  // Get inventory optimization recommendations
  static async optimizeInventory(inventoryData) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/pharmacy/inventory-optimization`, {
        inventory_data: inventoryData.inventoryItems || [],
        sales_data: inventoryData.salesData || [],
        seasonal_factors: inventoryData.seasonalFactors || {},
        analysis_date: new Date().toISOString()
      });

      return response.data;
    } catch (error) {
      console.error('AI inventory optimization error:', error.message);
      throw new Error('Failed to optimize inventory with AI');
    }
  }

  // Enhanced medication recommendation with pharmacy context
  static async getPharmacyMedicationRecommendations(data) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/medication-recommendations`, {
        symptoms: data.symptoms || [],
        medical_history: data.medicalHistory || [],
        current_medications: data.currentMedications || [],
        allergies: data.allergies || [],
        age: data.age,
        weight: data.weight,
        pharmacy_context: {
          inventory_available: data.inventoryAvailable || [],
          preferred_formulary: data.preferredFormulary || [],
          cost_considerations: data.costConsiderations || false
        }
      });

      return response.data;
    } catch (error) {
      console.error('AI pharmacy medication recommendation error:', error.message);
      throw new Error('Failed to get medication recommendations from AI');
    }
  }
}

module.exports = PharmacyAIService;