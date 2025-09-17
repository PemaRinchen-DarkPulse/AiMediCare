import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for AI operations
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('AI API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      hasToken: !!token,
      fullURL: `${config.baseURL}${config.url}`
    });
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AI Health Insights API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      errorType: error.code || 'UNKNOWN'
    });

    // Log the actual error response data for debugging
    if (error.response?.data) {
      console.error('Server Error Response:', error.response.data);
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.log('Authentication failed - redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * AI Health Insights Service
 */
class AIHealthInsightsService {
  
  /**
   * Test the AI health insights API connection
   */
  async testConnection() {
    try {
      console.log('Testing AI API connection...');
      const response = await apiClient.get('/ai/test');
      console.log('Test connection successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Test connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get health insights for the authenticated patient
   * @returns {Promise<Object>} Health insights data
   */
  async getHealthInsights() {
    try {
      // First test the connection
      console.log('Testing AI API connection before fetching insights...');
      const testResult = await this.testConnection();
      console.log('Test connection result:', testResult);
      
      if (!testResult.success) {
        throw new Error(`API connection test failed: ${testResult.error}`);
      }

      console.log('Connection test successful, now fetching health insights...');
      const response = await apiClient.get('/ai/health-insights');
      return {
        success: true,
        data: response.data.data,
        fromCache: response.data.fromCache || false
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch health insights');
    }
  }

  /**
   * Force regenerate health insights
   * @returns {Promise<Object>} Newly generated health insights
   */
  async regenerateHealthInsights() {
    try {
      const response = await apiClient.post('/ai/health-insights/regenerate');
      return {
        success: true,
        data: response.data.data,
        regenerated: true
      };
    } catch (error) {
      return this.handleError(error, 'Failed to regenerate health insights');
    }
  }

  /**
   * Get health insights history
   * @param {number} limit - Number of historical insights to fetch
   * @returns {Promise<Object>} Historical insights data
   */
  async getInsightsHistory(limit = 10) {
    try {
      const response = await apiClient.get(`/ai/health-insights/history?limit=${limit}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch insights history');
    }
  }

  /**
   * Get health insights for a specific patient (admin/doctor access)
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Health insights data
   */
  async getPatientHealthInsights(patientId) {
    try {
      const response = await apiClient.get(`/ai/health-insights/${patientId}`);
      return {
        success: true,
        data: response.data.data,
        fromCache: response.data.fromCache || false
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch patient health insights');
    }
  }

  /**
   * Check if AI service is available
   * @returns {Promise<boolean>} Service availability status
   */
  async checkAIServiceStatus() {
    try {
      const response = await apiClient.get('/ai/health-insights/status');
      return response.data.success || false;
    } catch (error) {
      console.warn('AI service status check failed:', error.message);
      return false;
    }
  }

  /**
   * Get trend analysis for specific vital type
   * @param {string} vitalType - Type of vital (blood-pressure, heart-rate, etc.)
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Trend analysis data
   */
  async getVitalTrendAnalysis(vitalType, options = {}) {
    try {
      const params = new URLSearchParams({
        vitalType,
        ...options
      }).toString();
      
      const response = await apiClient.get(`/ai/health-insights/trend-analysis?${params}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get trend analysis');
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @returns {Object} Standardized error response
   */
  handleError(error, defaultMessage) {
    let errorMessage = defaultMessage;
    let errorCode = 'UNKNOWN_ERROR';

    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || error.response.data?.error || defaultMessage;
      errorCode = error.response.data?.code || `HTTP_${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error - please check your connection';
      errorCode = 'NETWORK_ERROR';
    } else {
      // Something else happened
      errorMessage = error.message || defaultMessage;
      errorCode = 'REQUEST_ERROR';
    }

    return {
      success: false,
      error: errorMessage,
      code: errorCode,
      details: error.response?.data?.details || null
    };
  }

  /**
   * Cache management for insights
   */
  cache = {
    /**
     * Get cached insights if available and not expired
     * @param {string} key - Cache key
     * @returns {Object|null} Cached data or null
     */
    get(key) {
      try {
        const cached = localStorage.getItem(`ai_insights_${key}`);
        if (!cached) return null;

        const data = JSON.parse(cached);
        const now = new Date();
        const expiry = new Date(data.expiry);

        if (now > expiry) {
          this.remove(key);
          return null;
        }

        return data.insights;
      } catch (error) {
        console.warn('Cache get error:', error);
        return null;
      }
    },

    /**
     * Set cached insights with expiry
     * @param {string} key - Cache key
     * @param {Object} insights - Insights data
     * @param {number} ttlMinutes - Time to live in minutes
     */
    set(key, insights, ttlMinutes = 30) {
      try {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + ttlMinutes);

        const cacheData = {
          insights,
          expiry: expiry.toISOString(),
          cached_at: new Date().toISOString()
        };

        localStorage.setItem(`ai_insights_${key}`, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Cache set error:', error);
      }
    },

    /**
     * Remove cached insights
     * @param {string} key - Cache key
     */
    remove(key) {
      try {
        localStorage.removeItem(`ai_insights_${key}`);
      } catch (error) {
        console.warn('Cache remove error:', error);
      }
    },

    /**
     * Clear all cached insights
     */
    clear() {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('ai_insights_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Cache clear error:', error);
      }
    }
  };

  /**
   * Utility methods for working with insights data
   */
  utils = {
    /**
     * Calculate insights freshness score
     * @param {Object} insights - Insights object
     * @returns {number} Freshness score (0-100)
     */
    getFreshnessScore(insights) {
      if (!insights || !insights.generatedAt) return 0;

      const generatedAt = new Date(insights.generatedAt);
      const now = new Date();
      const hoursSinceGenerated = (now - generatedAt) / (1000 * 60 * 60);

      // Fresh for 24 hours, then declining
      if (hoursSinceGenerated <= 24) return 100;
      if (hoursSinceGenerated <= 72) return Math.max(0, 100 - (hoursSinceGenerated - 24) * 2);
      return 0;
    },

    /**
     * Check if insights need refresh
     * @param {Object} insights - Insights object
     * @returns {boolean} Whether insights need refresh
     */
    needsRefresh(insights) {
      return this.getFreshnessScore(insights) < 50;
    },

    /**
     * Extract key metrics from insights
     * @param {Object} insights - Insights object
     * @returns {Object} Key metrics summary
     */
    extractKeyMetrics(insights) {
      if (!insights) return null;

      return {
        healthScore: insights.healthScore?.overall || null,
        highPriorityTips: insights.personalizedTips?.filter(tip => tip.priority === 'high').length || 0,
        highRiskFactors: insights.riskFactors?.filter(risk => risk.riskLevel === 'high').length || 0,
        dataQuality: insights.aiMetadata?.dataQuality || 'unknown',
        trendCount: Object.keys(insights.trendAnalysis || {}).length
      };
    }
  };
}

// Create and export service instance
const aiHealthInsightsService = new AIHealthInsightsService();

export default aiHealthInsightsService;