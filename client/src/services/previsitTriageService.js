/**
 * Pre-visit Triage Service for frontend API calls
 */

const API_BASE_URL = 'http://localhost:5000/api/previsit-triage';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Get triage data for a specific appointment
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} Triage data
 */
export const getTriageByAppointment = async (appointmentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointment/${appointmentId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.data.triage;
  } catch (error) {
    console.error('Error fetching triage by appointment:', error);
    throw error;
  }
};

/**
 * Get all triage data for the current patient
 * @returns {Promise<Array>} Patient's triage data
 */
export const getPatientTriageData = async () => {
  try {
    console.log('📡 Making API call to:', `${API_BASE_URL}/patient`);
    console.log('📡 Headers:', getAuthHeaders());
    
    const response = await fetch(`${API_BASE_URL}/patient`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response text:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('🔍 API Response:', data);
    console.log('🔍 Triage Data:', data.data?.triageData);
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'API returned error status');
    }
    
    return data.data?.triageData || [];
  } catch (error) {
    console.error('❌ Service error:', error);
    throw error;
  }
};

/**
 * Get all triage data for the current doctor
 * @returns {Promise<Array>} Doctor's triage data
 */
export const getDoctorTriageData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctor`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.data.triageData;
  } catch (error) {
    console.error('Error fetching doctor triage data:', error);
    throw error;
  }
};

/**
 * Regenerate questions for an existing questionnaire
 * @param {string} triageId - Triage ID
 * @returns {Promise<Object>} Regenerated questionnaire data
 */
export const regenerateQuestionnaire = async (triageId) => {
  try {
    console.log('📡 Regenerating questionnaire for triage:', triageId);
    
    const response = await fetch(`${API_BASE_URL}/questionnaire/${triageId}/regenerate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    console.log('📡 Regenerate response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response text:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('🔍 Regenerate API Response:', data);
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'API returned error status');
    }
    
    return data.data?.questionnaire;
  } catch (error) {
    console.error('❌ Service error:', error);
    throw error;
  }
};

/**
 * Get urgent triage cases
 * @returns {Promise<Array>} Urgent triage cases
 */
export const getUrgentTriageData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/urgent`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.data.urgentCases;
  } catch (error) {
    console.error('Error fetching urgent triage data:', error);
    throw error;
  }
};

/**
 * Manually trigger triage generation for an appointment
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} Generated triage data
 */
export const generateTriageManually = async (appointmentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate/${appointmentId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.data.triage;
  } catch (error) {
    console.error('Error generating triage manually:', error);
    throw error;
  }
};

/**
 * Update triage data
 * @param {string} triageId - Triage ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated triage data
 */
export const updateTriage = async (triageId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${triageId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    
    const data = await handleResponse(response);
    return data.data.triage;
  } catch (error) {
    console.error('Error updating triage:', error);
    throw error;
  }
};

/**
 * Mark triage as reviewed by doctor
 * @param {string} triageId - Triage ID
 * @param {string} notes - Review notes
 * @returns {Promise<Object>} Updated triage data
 */
export const markTriageAsReviewed = async (triageId, notes = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/${triageId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes })
    });
    
    const data = await handleResponse(response);
    return data.data.triage;
  } catch (error) {
    console.error('Error marking triage as reviewed:', error);
    throw error;
  }
};

/**
 * Get AI service health status
 * @returns {Promise<Object>} AI service health data
 */
export const getAIServiceHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/health`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error checking AI service health:', error);
    throw error;
  }
};

/**
 * Generate questionnaire for an appointment
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} Generated questionnaire data
 */
export const generateQuestionnaire = async (appointmentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/generate/${appointmentId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error generating questionnaire:', error);
    throw error;
  }
};

/**
 * Submit questionnaire answers
 * @param {string} triageId - Triage/Questionnaire ID
 * @param {Array} answers - Array of answers in format [{ questionId, answer }]
 * @returns {Promise<Object>} Submission result
 */
export const submitAnswers = async (triageId, answers) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/${triageId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers })
    });
    
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Error submitting questionnaire answers:', error);
    throw error;
  }
};

/**
 * Get completed questionnaires for doctor review
 * @returns {Promise<Array>} Completed questionnaires
 */
export const getCompletedQuestionnaires = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/questionnaire/completed`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error fetching completed questionnaires:', error);
    throw error;
  }
};

/**
 * Get triage statistics
 * @returns {Promise<Object>} Triage statistics
 */
export const getTriageStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error fetching triage statistics:', error);
    throw error;
  }
};

// Default export object for easier importing
export const previsitTriageService = {
  getTriageByAppointment,
  getPatientTriageData,
  getDoctorTriageData,
  getUrgentTriageData,
  generateTriageManually,
  updateTriage,
  markTriageAsReviewed,
  getAIServiceHealth,
  getTriageStatistics,
  generateQuestionnaire,
  regenerateQuestionnaire,
  submitAnswers,
  getCompletedQuestionnaires,
  markTriageAsReviewed
};

export default previsitTriageService;