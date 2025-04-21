import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/prescriptions`;

// Helper to get auth header with JWT token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  return { Authorization: `Bearer ${token}` };
};

// Get patient prescriptions
export const getPatientPrescriptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/patient`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    throw error;
  }
};

// Get specific prescription details
export const getPrescriptionDetails = async (prescriptionId) => {
  try {
    const response = await axios.get(`${API_URL}/${prescriptionId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching prescription details:', error);
    throw error;
  }
};

// Get prescription history
export const getPrescriptionHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/history`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching prescription history:', error);
    throw error;
  }
};

// Set medication reminders
export const setPrescriptionReminder = async (reminderData) => {
  try {
    const response = await axios.post(`${API_URL}/reminder`, reminderData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error setting prescription reminder:', error);
    throw error;
  }
};

// Update adherence status
export const updateAdherenceStatus = async (prescriptionId, adherenceData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${prescriptionId}/adherence`, 
      adherenceData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating adherence status:', error);
    throw error;
  }
};

// Request prescription refill
export const requestRefill = async (prescriptionId) => {
  try {
    const response = await axios.post(
      `${API_URL}/${prescriptionId}/refill`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error requesting refill:', error);
    throw error;
  }
};