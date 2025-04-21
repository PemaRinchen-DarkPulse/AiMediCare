import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/health-records`;

// Helper to get auth header with JWT token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  return { Authorization: `Bearer ${token}` };
};

// Get patient profile
export const getPatientProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    throw error;
  }
};

// Get emergency contacts
export const getEmergencyContacts = async () => {
  try {
    const response = await axios.get(`${API_URL}/emergency-contacts`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    throw error;
  }
};

// Get medical history
export const getMedicalHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/medical-history`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching medical history:', error);
    throw error;
  }
};

// Get allergies
export const getAllergies = async () => {
  try {
    const response = await axios.get(`${API_URL}/allergies`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching allergies:', error);
    throw error;
  }
};

// Get chronic conditions
export const getChronicConditions = async () => {
  try {
    const response = await axios.get(`${API_URL}/chronic-conditions`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chronic conditions:', error);
    throw error;
  }
};

// Get visit history
export const getVisitHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/visits`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching visit history:', error);
    throw error;
  }
};

// Get lab results
export const getLabResults = async () => {
  try {
    const response = await axios.get(`${API_URL}/lab-results`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching lab results:', error);
    throw error;
  }
};

// Get imaging reports
export const getImagingReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/imaging-reports`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching imaging reports:', error);
    throw error;
  }
};

// Get vitals history
export const getVitalsHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/vitals`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching vitals history:', error);
    throw error;
  }
};

// Get immunization records
export const getImmunizations = async () => {
  try {
    const response = await axios.get(`${API_URL}/immunizations`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching immunizations:', error);
    throw error;
  }
};

// Get treatment plans
export const getTreatmentPlans = async () => {
  try {
    const response = await axios.get(`${API_URL}/treatment-plans`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    throw error;
  }
};