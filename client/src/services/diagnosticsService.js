import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/diagnostics`;

// Debug: log the API URL
console.log('Diagnostics API URL:', API_URL);

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  const header = {
    Authorization: token ? `Bearer ${token}` : ''
  };
  // Debug: log if token exists
  console.log('Auth token exists:', !!token);
  return header;
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
    // Create a FormData object to properly handle file uploads
    const formData = new FormData();
    
    // Add all text fields to the form data
    Object.keys(resultData).forEach(key => {
      // Skip the file field, we'll handle it separately
      if (key !== 'attachmentFile' || resultData[key] === null) {
        formData.append(key, resultData[key]);
      }
    });
    
    // Add the file if it exists
    if (resultData.attachmentFile) {
      formData.append('attachmentFile', resultData.attachmentFile);
    }
    
    // Send the request with the FormData and proper headers
    // Note: Don't set Content-Type when sending FormData, axios will set it with the proper boundary
    const response = await axios.post(`${API_URL}/results`, formData, {
      headers: {
        ...getAuthHeader(),
        // Let axios set the content type automatically for multipart form data
      }
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
    console.log('Fetching patient diagnostic requests from:', `${API_URL}/patient/requests`);
    const response = await axios.get(`${API_URL}/patient/requests`, {
      headers: getAuthHeader()
    });
    console.log('Patient diagnostic requests response:', response.data);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Diagnostic requests fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching patient diagnostic requests:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || 'Failed to fetch diagnostic requests'
    };
  }
};

// Get patient test results
export const getPatientTestResults = async () => {
  try {
    console.log('Fetching patient test results from:', `${API_URL}/patient/results`);
    const response = await axios.get(`${API_URL}/patient/results`, {
      headers: getAuthHeader()
    });
    console.log('Patient test results response:', response.data);
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Test results fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching patient test results:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || 'Failed to fetch test results'
    };
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
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Diagnostic request accepted successfully'
    };
  } catch (error) {
    console.error('Error accepting diagnostic request:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to accept diagnostic request'
    };
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
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Diagnostic request declined successfully'
    };
  } catch (error) {
    console.error('Error declining diagnostic request:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to decline diagnostic request'
    };
  }
};