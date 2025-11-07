import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/pharmacy`;

// Helper to get auth header with JWT token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  return { Authorization: `Bearer ${token}` };
};

// Dashboard APIs
export const getPharmacyDashboard = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pharmacy dashboard:', error);
    throw error;
  }
};

// Prescription Management APIs
export const getPrescriptions = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/prescriptions?${queryParams}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pharmacy prescriptions:', error);
    throw error;
  }
};

export const verifyPrescription = async (prescriptionId, verificationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/prescriptions/${prescriptionId}/verify`,
      verificationData,
      { headers: getAuthHeader() }
    );
    return response;
  } catch (error) {
    console.error('Error verifying prescription:', error);
    throw error;
  }
};

export const dispensePrescription = async (dispenseId, dispenseData) => {
  try {
    const response = await axios.post(
      `${API_URL}/prescriptions/${dispenseId}/dispense`,
      dispenseData,
      { headers: getAuthHeader() }
    );
    return response;
  } catch (error) {
    console.error('Error dispensing prescription:', error);
    throw error;
  }
};

// Inventory Management APIs
export const getMedicationInventory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/inventory?${queryParams}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching medication inventory:', error);
    throw error;
  }
};

export const addMedicationToInventory = async (medicationData) => {
  try {
    const response = await axios.post(`${API_URL}/inventory`, medicationData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error adding medication to inventory:', error);
    throw error;
  }
};

export const updateMedicationInventory = async (inventoryId, medicationData) => {
  try {
    const response = await axios.put(`${API_URL}/inventory/${inventoryId}`, medicationData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error updating medication inventory:', error);
    throw error;
  }
};

// Patient Management APIs
export const getPharmacyPatients = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/patients?${queryParams}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pharmacy patients:', error);
    throw error;
  }
};

export const getPharmacyPatientDetails = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}`, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};

export const updatePharmacyPatient = async (patientId, patientData) => {
  try {
    const response = await axios.put(`${API_URL}/patients/${patientId}`, patientData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

export const getPatientMedicationHistory = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/medication-history`, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error fetching medication history:', error);
    throw error;
  }
};

export const addPatientConsultationNote = async (patientId, noteData) => {
  try {
    const response = await axios.post(`${API_URL}/patients/${patientId}/notes`, noteData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error adding consultation note:', error);
    throw error;
  }
};

export const getPatientAdherenceMetrics = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/adherence/${patientId}`, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error fetching adherence metrics:', error);
    throw error;
  }
};

// AI-Powered Features
export const checkDrugInteractions = async (interactionData) => {
  try {
    const response = await axios.post(`${API_URL}/ai/interaction-analysis`, interactionData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error checking drug interactions:', error);
    throw error;
  }
};

export const verifyAllergies = async (allergyData) => {
  try {
    const response = await axios.post(`${API_URL}/ai/allergy-check`, allergyData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error verifying allergies:', error);
    throw error;
  }
};

export const getDosageRecommendations = async (dosageData) => {
  try {
    const response = await axios.post(`${API_URL}/ai/dosage-recommendations`, dosageData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error getting dosage recommendations:', error);
    throw error;
  }
};

export const getClinicalDecisionSupport = async (clinicalData) => {
  try {
    const response = await axios.post(`${API_URL}/ai/clinical-support`, clinicalData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error getting clinical decision support:', error);
    throw error;
  }
};

export const getMedicationAlternatives = async (alternativeData) => {
  try {
    const response = await axios.post(`${API_URL}/ai/medication-recommendations`, alternativeData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error getting medication alternatives:', error);
    throw error;
  }
};

export const getAIPharmacyInsights = async (insightData) => {
  try {
    const response = await axios.post(`${API_URL}/ai/pharmacy-insights`, insightData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error getting AI pharmacy insights:', error);
    throw error;
  }
};

export const getAIInventoryOptimization = async (optimizationData) => {
  try {
    const response = await axios.post(`${API_URL}/ai/inventory-optimization`, optimizationData, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error getting AI inventory optimization:', error);
    throw error;
  }
};

// Reports APIs
export const getPharmacyReports = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/reports?${queryParams}`, {
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error fetching pharmacy reports:', error);
    throw error;
  }
};

export const getSalesAnalytics = async (dateRange) => {
  try {
    const response = await axios.get(`${API_URL}/reports/sales`, {
      params: dateRange,
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    throw error;
  }
};

export const getInventoryAnalytics = async (dateRange) => {
  try {
    const response = await axios.get(`${API_URL}/reports/inventory`, {
      params: dateRange,
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    throw error;
  }
};

export const getPrescriptionAnalytics = async (dateRange) => {
  try {
    const response = await axios.get(`${API_URL}/reports/prescriptions`, {
      params: dateRange,
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error fetching prescription analytics:', error);
    throw error;
  }
};

export const getComplianceReports = async (dateRange) => {
  try {
    const response = await axios.get(`${API_URL}/reports/compliance`, {
      params: dateRange,
      headers: getAuthHeader()
    });
    return response;
  } catch (error) {
    console.error('Error fetching compliance reports:', error);
    throw error;
  }
};

export const exportReport = async (exportData) => {
  try {
    const response = await axios.post(`${API_URL}/reports/export`, exportData, {
      headers: { 
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error('Error exporting report:', error);
    throw error;
  }
};