// Base API URL
const API_URL = 'http://localhost:5000/api/triage';

/**
 * Creates a new triage questionnaire for an appointment
 * @param {Object} data - Contains appointmentId, questions, generatedFromReason, and generatedFromNotes
 * @returns {Promise} - Promise with the created questionnaire data
 */
export const createTriageQuestionnaire = async (data) => {
  try {
    // Check if the appointmentId is a temporary ID (starts with "temp_")
    if (data.appointmentId && data.appointmentId.toString().startsWith('temp_')) {
      console.log('Detected temporary appointment ID. Storing questionnaire in localStorage instead.');
      // Store the triage data in localStorage for later use when real appointment ID is available
      const tempTriageData = {
        questions: data.questions,
        generatedFromReason: data.generatedFromReason,
        generatedFromNotes: data.generatedFromNotes,
        timestamp: new Date().toISOString()
      };
      
      // Store in localStorage with the temporary ID as key
      localStorage.setItem(`triage_${data.appointmentId}`, JSON.stringify(tempTriageData));
      
      // Return a mock response to simulate success
      return {
        _id: `temp_triage_${Date.now()}`,
        appointmentId: data.appointmentId,
        questions: data.questions,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create triage questionnaire');
    }

    return result.data.questionnaire;
  } catch (error) {
    console.error('Error creating triage questionnaire:', error);
    throw error;
  }
};

/**
 * Gets a triage questionnaire for a specific appointment
 * @param {string} appointmentId - ID of the appointment
 * @returns {Promise} - Promise with the questionnaire data
 */
export const getTriageQuestionnaireByAppointment = async (appointmentId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/appointment/${appointmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No questionnaire found for this appointment, which might be expected
      }
      throw new Error(result.message || 'Failed to fetch triage questionnaire');
    }

    return result.data.questionnaire;
  } catch (error) {
    console.error('Error fetching triage questionnaire:', error);
    throw error;
  }
};

/**
 * Updates the answers for a triage questionnaire
 * @param {string} questionnaireId - ID of the questionnaire to update
 * @param {Array} answers - Array of answer objects
 * @returns {Promise} - Promise with the updated questionnaire data
 */
export const updateTriageAnswers = async (questionnaireId, answers) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/${questionnaireId}/answers`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ answers })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update triage answers');
    }

    return result.data.questionnaire;
  } catch (error) {
    console.error('Error updating triage answers:', error);
    throw error;
  }
};

/**
 * Gets all pending triage questionnaires for the current patient
 * @param {string} patientId - Optional ID of the patient. If not provided, gets questionnaires for the current user
 * @returns {Promise} - Promise with an array of pending questionnaires
 */
export const getPatientPendingQuestionnaires = async (patientId = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // If patientId is provided, use it, otherwise get questionnaires for the current user
    const endpoint = patientId 
      ? `${API_URL}/patient/${patientId}/pending` 
      : `${API_URL}/patient/pending`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch pending questionnaires');
    }

    return result.data.questionnaires;
  } catch (error) {
    console.error('Error fetching pending questionnaires:', error);
    throw error;
  }
};