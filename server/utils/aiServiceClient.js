const axios = require('axios');

class AIServiceClient {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    this.timeout = 30000; // 30 seconds
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Add request/response interceptors for logging
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
    
    this.client.interceptors.response.use(
      (response) => {
        console.log(`AI Service Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('AI Service Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Check if AI service is healthy
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('AI Service health check failed:', error.message);
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  /**
   * Generate triage questions using AI service
   * @param {Object} request - Triage generation request
   * @returns {Promise<Object>} Generated questions response
   */
  async generateTriageQuestions(request) {
    try {
      const response = await this.client.post('/generate-triage', {
        appointment_reason: request.appointmentReason,
        additional_notes: request.additionalNotes,
        patient_id: request.patientId,
        doctor_id: request.doctorId,
        appointment_id: request.appointmentId,
        language: request.language || 'en',
        use_ai: request.useAI !== false, // Default to true
        specialty: request.specialty,
        max_questions: request.maxQuestions || 5
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error generating triage questions:', error.message);
      
      // Return structured error response
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        fallback: true
      };
    }
  }
  
  /**
   * Analyze appointment reason to understand medical context
   * @param {string} reason - Appointment reason
   * @param {string} notes - Additional notes
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeAppointmentReason(reason, notes = '') {
    try {
      const response = await this.client.post('/analyze-reason', {
        reason,
        notes
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error analyzing appointment reason:', error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        fallback: {
          medical_category: 'general',
          urgency_level: 2,
          key_symptoms: [],
          suggested_specialty: null,
          confidence: 0.5,
          requires_immediate_attention: false
        }
      };
    }
  }
  
  /**
   * Translate medical content between languages
   * @param {Object} request - Translation request
   * @returns {Promise<Object>} Translation result
   */
  async translateContent(request) {
    try {
      const response = await this.client.post('/translate', {
        text: request.text,
        source_language: request.sourceLanguage,
        target_language: request.targetLanguage,
        medical_context: request.medicalContext
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error translating content:', error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
  
  /**
   * Get fallback questions for specific categories
   * @param {Object} request - Fallback request
   * @returns {Promise<Object>} Fallback questions
   */
  async getFallbackQuestions(request) {
    try {
      const response = await this.client.post('/fallback-questions', {
        categories: request.categories || ['general'],
        language: request.language || 'en',
        max_questions: request.maxQuestions || 5
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting fallback questions:', error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
  
  /**
   * Get supported languages
   * @returns {Promise<Object>} Supported languages
   */
  async getSupportedLanguages() {
    try {
      const response = await this.client.get('/languages');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting supported languages:', error.message);
      
      return {
        success: false,
        error: error.message,
        fallback: {
          supported_languages: [
            { code: 'en', name: 'English' },
            { code: 'dz', name: 'Dzongkha' }
          ],
          default_language: 'en'
        }
      };
    }
  }
  
  /**
   * Send webhook notification about appointment creation
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Webhook response
   */
  async notifyAppointmentCreated(appointmentData) {
    try {
      const response = await this.client.post('/webhook/appointment-created', {
        appointment_id: appointmentData.appointmentId,
        reason: appointmentData.reason,
        notes: appointmentData.notes,
        patient_id: appointmentData.patientId,
        doctor_id: appointmentData.doctorId
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending appointment webhook:', error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
}

// Create a singleton instance
const aiServiceClient = new AIServiceClient();

module.exports = aiServiceClient;