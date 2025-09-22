import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Get AI insights for a diagnostic test result
 * Returns cached insights if available, otherwise initiates new analysis
 */
export const getDiagnosticInsights = async (testResultId) => {
  try {
    const response = await api.get(`/api/diagnostic-insights/${testResultId}`);
    return {
      success: true,
      data: response.data.data,
      cached: response.data.cached,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error getting diagnostic insights:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: null
    };
  }
};

/**
 * Trigger new AI analysis for a test result
 * Forces a fresh analysis even if cached insights exist
 */
export const triggerNewAnalysis = async (testResultId, testData = {}) => {
  try {
    const response = await api.post(`/api/diagnostic-insights/${testResultId}/analyze`, {
      attachmentUrl: testData.attachmentUrl,
      testType: testData.testType,
      findings: testData.findings
    });
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error triggering new analysis:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: null
    };
  }
};

/**
 * Get the current analysis status for a test result
 */
export const getAnalysisStatus = async (testResultId) => {
  try {
    const response = await api.get(`/api/diagnostic-insights/${testResultId}/status`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error getting analysis status:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      data: null
    };
  }
};

/**
 * Delete AI insights for a test result
 */
export const deleteInsights = async (testResultId) => {
  try {
    const response = await api.delete(`/api/diagnostic-insights/${testResultId}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error deleting insights:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Poll for analysis completion
 * Useful for checking when async analysis is complete
 */
export const pollAnalysisCompletion = async (testResultId, maxAttempts = 30, intervalMs = 2000) => {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        attempts++;
        
        const statusResult = await getAnalysisStatus(testResultId);
        
        if (!statusResult.success) {
          reject(new Error(statusResult.error));
          return;
        }
        
        const status = statusResult.data.status;
        
        if (status === 'completed') {
          // Get the completed insights
          const insightsResult = await getDiagnosticInsights(testResultId);
          resolve(insightsResult);
        } else if (status === 'failed') {
          reject(new Error(statusResult.data.error || 'Analysis failed'));
        } else if (attempts >= maxAttempts) {
          reject(new Error('Analysis timeout - taking longer than expected'));
        } else {
          // Continue polling
          setTimeout(checkStatus, intervalMs);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    checkStatus();
  });
};

/**
 * Utility function to format analysis data for display
 */
export const formatInsightsForDisplay = (insights) => {
  if (!insights) return null;
  
  return {
    // Basic info
    id: insights._id,
    testResultId: insights.testResultId,
    status: insights.processingStatus,
    confidence: insights.confidence || 0,
    
    // Processing metadata
    processingTime: insights.sourceFile?.processingTime || 0,
    fileInfo: {
      name: insights.sourceFile?.fileName || 'Unknown',
      type: insights.sourceFile?.fileType || 'Unknown',
      size: insights.sourceFile?.fileSize || 0
    },
    
    // Extracted content
    extractedText: insights.extractedText || '',
    
    // Structured data
    testValues: insights.structuredData?.testValues || [],
    patientInfo: insights.structuredData?.patientInfo || {},
    
    // AI analysis
    abnormalFindings: insights.abnormalFindings || [],
    summary: insights.aiSummary || '',
    riskAssessment: insights.riskAssessment || { level: 'low', description: '' },
    
    // Timestamps
    createdAt: insights.createdAt,
    updatedAt: insights.updatedAt
  };
};

/**
 * Get color for risk level display
 */
export const getRiskLevelColor = (level) => {
  const colors = {
    low: 'success',
    moderate: 'warning', 
    high: 'danger',
    critical: 'danger'
  };
  return colors[level] || 'secondary';
};

/**
 * Get color for severity display
 */
export const getSeverityColor = (severity) => {
  const colors = {
    low: 'info',
    moderate: 'warning',
    high: 'danger', 
    critical: 'danger'
  };
  return colors[severity] || 'secondary';
};

/**
 * Format processing time for display
 */
export const formatProcessingTime = (timeMs) => {
  if (!timeMs) return 'N/A';
  
  if (timeMs < 1000) {
    return `${Math.round(timeMs)}ms`;
  } else if (timeMs < 60000) {
    return `${(timeMs / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};