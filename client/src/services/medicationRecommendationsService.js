import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/medicine-recommendations`;

// Helper to get auth header with JWT token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  return { Authorization: `Bearer ${token}` };
};

// Generate AI-powered medication recommendations
export const generateMedicationRecommendations = async (patientId, appointmentId = null) => {
  try {
    console.log('Generating medication recommendations for patient:', patientId);
    
    const response = await axios.post(
      `${API_URL}/generate`,
      {
        patientId,
        appointmentId
      },
      { headers: getAuthHeader() }
    );
    
    console.log('Medication recommendations response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error generating medication recommendations:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Validate a medication recommendation against patient data
export const validateMedicationRecommendation = async (patientId, medication) => {
  try {
    console.log('Validating medication recommendation:', { patientId, medication: medication.medication_name });
    
    const response = await axios.post(
      `${API_URL}/validate`,
      {
        patientId,
        medication
      },
      { headers: getAuthHeader() }
    );
    
    console.log('Medication validation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error validating medication recommendation:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Get patient medication history
export const getPatientMedicationHistory = async (patientId) => {
  try {
    console.log('Fetching medication history for patient:', patientId);
    
    const response = await axios.get(
      `${API_URL}/history/${patientId}`,
      { headers: getAuthHeader() }
    );
    
    console.log('Medication history response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching medication history:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Helper function to format medication recommendation for display
export const formatMedicationRecommendation = (recommendation) => {
  return {
    id: `${recommendation.medication_name}-${Date.now()}`,
    name: recommendation.medication_name,
    brandNames: recommendation.brand_names || [],
    dosage: recommendation.dosage,
    frequency: recommendation.frequency,
    duration: recommendation.duration,
    route: recommendation.route || 'oral',
    indication: recommendation.indication,
    rationale: recommendation.rationale,
    monitoring: recommendation.monitoring,
    sideEffects: recommendation.side_effects || [],
    priority: recommendation.priority || 'primary',
    estimatedCost: recommendation.estimated_cost || 'unknown',
    formatted: `${recommendation.medication_name} ${recommendation.dosage} - ${recommendation.frequency}`
  };
};

// Helper function to format warnings and contraindications
export const formatMedicationWarnings = (warnings) => {
  return warnings.map(warning => ({
    id: `warning-${Date.now()}-${Math.random()}`,
    type: warning.type,
    message: warning.message,
    severity: warning.severity,
    icon: getWarningIcon(warning.type, warning.severity),
    color: getWarningColor(warning.severity)
  }));
};

// Helper function to get warning icon based on type and severity
const getWarningIcon = (type, severity) => {
  if (severity === 'critical' || severity === 'high') {
    return 'fas fa-exclamation-triangle';
  }
  
  switch (type) {
    case 'allergy':
      return 'fas fa-allergies';
    case 'interaction':
      return 'fas fa-pills';
    case 'contraindication':
      return 'fas fa-ban';
    case 'monitoring':
      return 'fas fa-stethoscope';
    default:
      return 'fas fa-info-circle';
  }
};

// Helper function to get warning color based on severity
const getWarningColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'danger';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
      return 'secondary';
    default:
      return 'light';
  }
};

// Helper function to assess recommendation confidence
export const assessRecommendationConfidence = (recommendations) => {
  if (!recommendations || !recommendations.confidence_score) {
    return {
      level: 'unknown',
      color: 'secondary',
      message: 'Confidence assessment unavailable'
    };
  }
  
  const score = recommendations.confidence_score;
  
  if (score >= 0.8) {
    return {
      level: 'high',
      color: 'success',
      message: 'High confidence recommendations'
    };
  } else if (score >= 0.6) {
    return {
      level: 'medium',
      color: 'warning',
      message: 'Medium confidence recommendations'
    };
  } else {
    return {
      level: 'low',
      color: 'danger',
      message: 'Low confidence - manual review recommended'
    };
  }
};

// Helper function to check if patient data is sufficient for AI recommendations
export const checkDataSufficiency = (patientData) => {
  const requiredFields = [
    'age',
    'gender',
    'chief_complaint'
  ];
  
  const recommendedFields = [
    'allergies',
    'medical_history',
    'current_medications',
    'triage_responses'
  ];
  
  const missingRequired = requiredFields.filter(field => 
    !patientData[field] || 
    (Array.isArray(patientData[field]) && patientData[field].length === 0)
  );
  
  const missingRecommended = recommendedFields.filter(field => 
    !patientData[field] || 
    (Array.isArray(patientData[field]) && patientData[field].length === 0)
  );
  
  const completeness = Math.round(
    ((requiredFields.length - missingRequired.length) / requiredFields.length) * 100
  );
  
  return {
    isSufficient: missingRequired.length === 0,
    completeness,
    missingRequired,
    missingRecommended,
    recommendation: missingRequired.length === 0 
      ? 'Data is sufficient for AI recommendations'
      : 'Additional patient data needed for accurate recommendations'
  };
};