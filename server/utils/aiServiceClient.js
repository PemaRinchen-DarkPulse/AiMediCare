const axios = require('axios');

class AIServiceClient {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    this.timeout = 30000; // 30 seconds timeout
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`AI Service Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('AI Service Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`AI Service Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        console.error('AI Service Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Check if AI service is healthy and operational
   * @returns {Promise<Object>} Health check result
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/api/health');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI Service health check failed:', error.message);
      return {
        success: false,
        error: error.message,
        status: 'unhealthy'
      };
    }
  }
  
  /**
   * Generate pre-visit questionnaire using AI
   * @param {string} reasonForVisit - Patient's reason for visit
   * @param {string} additionalNotes - Additional notes (optional)
   * @returns {Promise<Object>} Questionnaire generation result
   */
  async generateQuestionnaire(reasonForVisit, additionalNotes = '') {
    try {
      if (!reasonForVisit || reasonForVisit.trim() === '') {
        throw new Error('Reason for visit is required');
      }
      
      const requestData = {
        reason_for_visit: reasonForVisit.trim(),
        patient_history: additionalNotes ? additionalNotes.trim() : ''
      };
      
      console.log('Generating questionnaire for:', reasonForVisit);
      
      const response = await this.client.post('/api/triage/generate-questionnaire', requestData);
      
      if (response.data.success) {
        return {
          success: true,
          questionnaire: response.data.questionnaire,
          isAIGenerated: response.data.questionnaire.ai_generated !== false
        };
      } else {
        throw new Error(response.data.error || 'AI service returned unsuccessful response');
      }
      
    } catch (error) {
      console.error('Error generating questionnaire:', error.message);
      
      // Return fallback questionnaire if AI service fails
      return {
        success: true, // Still return success but with fallback
        questionnaire: this._getFallbackQuestionnaire(reasonForVisit),
        isAIGenerated: false,
        error: error.message,
        warning: 'AI service unavailable, using fallback questionnaire'
      };
    }
  }

  /**
   * Generate fallback questionnaire when AI service is unavailable
   * @param {string} reasonForVisit - Patient's reason for visit
   * @returns {Object} Fallback questionnaire data
   * @private
   */
  _getFallbackQuestionnaire(reasonForVisit) {
    return {
      title: `Pre-Visit Questionnaire: ${reasonForVisit}`,
      urgency_level: 'Medium',
      estimated_duration: '5-10 minutes',
      reason_for_visit: reasonForVisit,
      questions: [
        {
          id: 1,
          type: 'text',
          question: `Please describe your ${reasonForVisit.toLowerCase()} in detail, including when it started and any symptoms you've noticed.`,
          required: true
        },
        {
          id: 2,
          type: 'scale',
          question: 'On a scale of 1-10, how would you rate your current discomfort or concern level?',
          required: true
        },
        {
          id: 3,
          type: 'multiple_choice',
          question: 'How long have you been experiencing this issue?',
          required: true,
          options: ['Less than 1 day', '1-3 days', '1 week', '1-4 weeks', 'More than 1 month']
        },
        {
          id: 4,
          type: 'yes_no',
          question: 'Have you taken any medication or treatment for this condition?',
          required: false
        },
        {
          id: 5,
          type: 'text',
          question: 'Are you currently taking any medications? If yes, please list them.',
          required: false
        },
        {
          id: 6,
          type: 'yes_no',
          question: 'Do you have any allergies to medications?',
          required: true
        },
        {
          id: 7,
          type: 'text',
          question: 'Is there anything else you would like the doctor to know before your appointment?',
          required: false
        }
      ],
      preparation_notes: 'Please bring your insurance card, a list of current medications, and any relevant medical records.',
      urgency_notes: 'If you experience severe symptoms such as difficulty breathing, chest pain, or severe bleeding, please seek immediate medical attention.',
      ai_generated: false,
      generated_at: new Date().toISOString(),
      model_used: 'fallback',
      fallback_reason: 'AI service unavailable'
    };
  }
  
  /**
   * Get AI service status
   * @returns {Promise<Object>} Service status
   */
  async getServiceStatus() {
    try {
      const response = await this.client.get('/api/triage/status');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error getting AI service status:', error.message);
      return {
        success: false,
        error: error.message,
        data: {
          ai_service: 'unavailable',
          model: 'unknown',
          version: 'unknown'
        }
      };
    }
  }
  
  /**
   * Generate fallback triage data when AI service is unavailable
   * @param {string} reasonForVisit - Patient's reason for visit
   * @returns {Object} Fallback triage data
   * @private
   */
  _getFallbackTriageData(reasonForVisit) {
    const reason = reasonForVisit.toLowerCase();
    
    // Initialize default values
    let category = 'general';
    let urgency = 2;
    let specialty = null;
    let symptoms = [reasonForVisit];
    let tests = [];
    let riskFactors = [];
    
    // Emergency conditions
    const emergencyKeywords = [
      'chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious',
      'stroke', 'heart attack', 'severe allergic reaction'
    ];
    
    if (emergencyKeywords.some(keyword => reason.includes(keyword))) {
      urgency = 5;
      category = 'emergency';
      specialty = 'emergency medicine';
    }
    
    // Urgent conditions
    else if (reason.includes('severe pain') || reason.includes('high fever') || 
             reason.includes('allergic reaction')) {
      urgency = 4;
      category = 'urgent';
    }
    
    // Specialty classification
    else if (reason.includes('headache') || reason.includes('migraine')) {
      category = 'neurology';
      specialty = 'neurology';
      tests = ['neurological examination'];
    }
    else if (reason.includes('skin') || reason.includes('rash') || reason.includes('eczema')) {
      category = 'dermatology';
      specialty = 'dermatology';
    }
    else if (reason.includes('heart') || reason.includes('cardiac')) {
      category = 'cardiology';
      specialty = 'cardiology';
      tests = ['ECG', 'blood pressure'];
      riskFactors = ['cardiovascular risk factors'];
    }
    else if (reason.includes('diabetes') || reason.includes('blood sugar')) {
      category = 'endocrinology';
      specialty = 'endocrinology';
      tests = ['blood glucose', 'HbA1c'];
    }
    else if (reason.includes('joint') || reason.includes('bone') || reason.includes('fracture')) {
      category = 'orthopedics';
      specialty = 'orthopedics';
      tests = ['X-ray'];
    }
    
    return {
      medical_category: category,
      urgency_level: urgency,
      key_symptoms: symptoms,
      suggested_specialty: specialty,
      requires_immediate_attention: urgency >= 4,
      preparation_notes: `Patient reports: ${reasonForVisit}. Fallback analysis applied due to AI service unavailability.`,
      patient_instructions: urgency >= 4 
        ? 'Please seek immediate medical attention' 
        : 'Please arrive 15 minutes early for check-in',
      estimated_duration: urgency >= 4 ? '30-60 minutes' : '15-30 minutes',
      recommended_tests: tests,
      ai_confidence: 0.5,
      risk_factors: riskFactors,
      generated_at: 'Fallback-Generated',
      model_used: 'fallback'
    };
  }
  
  /**
   * Generate health insights from patient data
   * @param {Object} patientData - Patient's medical data including vitals, medications, conditions
   * @returns {Promise<Object>} AI-generated health insights
   */
  async generateHealthInsights(patientData) {
    try {
      console.log('Requesting health insights from AI service...');
      
      const response = await this.client.post('/api/health-insights', {
        patient_data: patientData,
        analysis_type: 'comprehensive',
        include_trends: true,
        include_recommendations: true
      });

      if (response.data.success) {
        return response.data.insights;
      } else {
        throw new Error('AI service returned unsuccessful response');
      }

    } catch (error) {
      console.error('Health insights generation failed:', error.message);
      
      // Return fallback insights if AI service is unavailable
      return this.generateFallbackHealthInsights(patientData);
    }
  }

  /**
   * Generate fallback health insights when AI service is unavailable
   * @param {Object} patientData - Patient's medical data
   * @returns {Object} Fallback health insights
   */
  generateFallbackHealthInsights(patientData) {
    console.log('Generating fallback health insights...');
    
    const vitalsCount = Object.values(patientData.vitals || {}).reduce((sum, arr) => sum + arr.length, 0);
    const hasConditions = patientData.conditions && patientData.conditions.length > 0;
    const hasMedications = patientData.medications && patientData.medications.length > 0;
    
    // Generate basic trend analysis
    const trendAnalysis = {};
    Object.keys(patientData.vitals || {}).forEach(vitalType => {
      const data = patientData.vitals[vitalType];
      if (data && data.length > 1) {
        trendAnalysis[vitalType] = {
          trend: 'stable',
          confidence: 0.6,
          summary: `Based on ${data.length} readings, your ${vitalType} appears stable.`,
          recommendations: ['Continue monitoring regularly', 'Discuss any concerns with your healthcare provider']
        };
      }
    });

    // Generate basic health tips
    const personalizedTips = [
      {
        category: 'monitoring',
        priority: 'medium',
        title: 'Regular Health Monitoring',
        description: 'Continue tracking your vital signs regularly to maintain good health awareness.',
        actionable: true
      }
    ];

    if (hasMedications) {
      personalizedTips.push({
        category: 'medication',
        priority: 'high',
        title: 'Medication Adherence',
        description: 'Take medications as prescribed and discuss any side effects with your doctor.',
        actionable: true
      });
    }

    if (hasConditions) {
      personalizedTips.push({
        category: 'lifestyle',
        priority: 'medium',
        title: 'Chronic Condition Management',
        description: 'Follow your treatment plan and maintain regular check-ups for optimal condition management.',
        actionable: true
      });
    }

    // Generate basic health score
    let healthScore = 70; // Base score
    if (vitalsCount > 10) healthScore += 10;
    if (hasMedications && patientData.medications.every(med => med.adherence > 80)) healthScore += 10;
    if (!hasConditions || patientData.conditions.every(cond => cond.status === 'Controlled')) healthScore += 10;

    return {
      trendAnalysis,
      personalizedTips,
      healthScore: {
        overall: Math.min(healthScore, 100),
        breakdown: {
          vitals: vitalsCount > 10 ? 85 : 70,
          medications: hasMedications ? 80 : 90,
          lifestyle: 75
        }
      },
      riskFactors: [],
      modelUsed: 'fallback'
    };
  }

  /**
   * Test connection to AI service
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const healthResult = await this.healthCheck();
      return healthResult.success;
    } catch (error) {
      console.error('AI Service connection test failed:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const aiServiceClient = new AIServiceClient();

module.exports = aiServiceClient;