import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/diagnostics`;

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : ''
  };
};

// Get all diagnostic requests
export const getDiagnosticRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/requests`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching diagnostic requests:', error);
    throw error;
  }
};

// Create a new diagnostic request
export const createDiagnosticRequest = async (requestData) => {
  try {
    const response = await axios.post(`${API_URL}/requests`, requestData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating diagnostic request:', error);
    throw error;
  }
};

// Get test results
export const getTestResults = async () => {
  try {
    const response = await axios.get(`${API_URL}/results`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw error;
  }
};

// Upload test results
export const uploadTestResult = async (resultData) => {
  try {
    const response = await axios.post(`${API_URL}/results`, resultData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading test results:', error);
    throw error;
  }
};

// Update diagnostic request status
export const updateRequestStatus = async (requestId, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/requests/${requestId}`,
      { status },
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

// Get patient diagnostic requests
export const getPatientDiagnosticRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/patient/requests`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient diagnostic requests:', error);
    throw error;
  }
};

// Get patient test results
export const getPatientTestResults = async () => {
  try {
    const response = await axios.get(`${API_URL}/patient/results`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient test results:', error);
    throw error;
  }
};

// Accept diagnostic request
export const acceptDiagnosticRequest = async (requestId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/patient/requests/${requestId}/accept`,
      {},
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error accepting diagnostic request:', error);
    throw error;
  }
};

// Decline diagnostic request
export const declineDiagnosticRequest = async (requestId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/patient/requests/${requestId}/decline`,
      {},
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error declining diagnostic request:', error);
    throw error;
  }
};