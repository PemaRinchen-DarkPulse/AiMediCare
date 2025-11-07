import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/doctor/patients`;

// Helper to get auth header with JWT token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  return { Authorization: `Bearer ${token}` };
};

// Get all patients with optional pagination and filters
export const getPatients = async (page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc') => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Making request to:', `${API_URL}?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
    
    const response = await axios.get(
      `${API_URL}?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      { headers: getAuthHeader() }
    );
    
    console.log('Service response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Get single patient by ID
export const getPatientById = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/${patientId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error);
    throw error;
  }
};

// Add new patient
export const addPatient = async (patientData) => {
  try {
    const response = await axios.post(API_URL, patientData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
};

// Update patient
export const updatePatient = async (patientId, patientData) => {
  try {
    const response = await axios.put(`${API_URL}/${patientId}`, patientData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating patient ${patientId}:`, error);
    throw error;
  }
};

// Get patient vitals
export const getPatientVitals = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/${patientId}/vitals`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching vitals for patient ${patientId}:`, error);
    throw error;
  }
};

// Add vital record
export const addVitalRecord = async (patientId, vitalData) => {
  try {
    const response = await axios.post(`${API_URL}/${patientId}/vitals`, vitalData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding vital record for patient ${patientId}:`, error);
    throw error;
  }
};

// Get patient allergies
export const getPatientAllergies = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/${patientId}/allergies`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching allergies for patient ${patientId}:`, error);
    throw error;
  }
};

// Add allergy record
export const addAllergyRecord = async (patientId, allergyData) => {
  try {
    const response = await axios.post(`${API_URL}/${patientId}/allergies`, allergyData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding allergy for patient ${patientId}:`, error);
    throw error;
  }
};

// Get patient medical history
export const getPatientMedicalHistory = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/${patientId}/medical-history`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching medical history for patient ${patientId}:`, error);
    throw error;
  }
};

// Add medical record
export const addMedicalRecord = async (patientId, medicalData) => {
  try {
    const response = await axios.post(`${API_URL}/${patientId}/medical-history`, medicalData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding medical record for patient ${patientId}:`, error);
    throw error;
  }
};

// Get patient chronic conditions
export const getPatientChronicConditions = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/${patientId}/chronic-conditions`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching chronic conditions for patient ${patientId}:`, error);
    throw error;
  }
};

// Add chronic condition
export const addChronicCondition = async (patientId, conditionData) => {
  try {
    const response = await axios.post(`${API_URL}/${patientId}/chronic-conditions`, conditionData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding chronic condition for patient ${patientId}:`, error);
    throw error;
  }
};

// Get patient immunizations
export const getPatientImmunizations = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/${patientId}/immunizations`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching immunizations for patient ${patientId}:`, error);
    throw error;
  }
};

// Add immunization
export const addImmunization = async (patientId, immunizationData) => {
  try {
    const response = await axios.post(`${API_URL}/${patientId}/immunizations`, immunizationData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding immunization for patient ${patientId}:`, error);
    throw error;
  }
};