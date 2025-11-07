import React, { useState, useEffect } from 'react';
import { 
  Card, CardBody, Badge, Spinner, Alert, Button, Row, Col,
  Tooltip, UncontrolledTooltip 
} from 'reactstrap';
import { 
  FaMedkit, FaRobot, FaExclamationTriangle, FaInfoCircle, 
  FaPrescriptionBottleAlt, FaSync, FaCheckCircle 
} from 'react-icons/fa';
import { getAIMedicationRecommendations } from '../../services/medicationRecommendationService';

const AIMedicationRecommendations = ({ 
  patientId, 
  clinicalContext, 
  onMedicationSelect,
  className = "" 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiData, setAiData] = useState(null);

  // Fetch AI recommendations when patient or clinical context changes
  useEffect(() => {
    if (patientId && clinicalContext) {
      fetchAIRecommendations();
    }
  }, [patientId, clinicalContext]);

  const fetchAIRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching AI medication recommendations for patient:', patientId);
      console.log('Clinical context:', clinicalContext);
      
      const response = await getAIMedicationRecommendations(patientId, clinicalContext);
      
      if (response.success) {
        setRecommendations(response.data.recommendations || []);
        setAiData(response.data);
        console.log('AI recommendations loaded:', response.data);
      } else {
        throw new Error(response.message || 'Failed to get recommendations');
      }
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      setError(err.message || 'Failed to load medication recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAIRecommendations();
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'danger';
      case 'moderate': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'pain_relief': return 'primary';
      case 'antibiotic': return 'success';
      case 'chronic_condition': return 'info';
      case 'emergency': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Card className={`ai-medication-recommendations ${className}`}>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 d-flex align-items-center">
            <FaRobot className="text-primary me-2" size={20} />
            AI-Powered Medication Recommendations
            {aiData?.aiConfidence && (
              <Badge 
                color={aiData.aiConfidence > 0.8 ? 'success' : 'warning'} 
                pill 
                className="ms-2"
                id="confidence-badge"
              >
                {Math.round(aiData.aiConfidence * 100)}% confidence
              </Badge>
            )}
          </h5>
          <Button 
            color="outline-primary" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading || !patientId}
          >
            <FaSync className={loading ? 'fa-spin' : ''} /> Refresh
          </Button>
        </div>

        {aiData?.aiConfidence && (
          <UncontrolledTooltip target="confidence-badge">
            AI confidence level based on available patient data and medical history
          </UncontrolledTooltip>
        )}

        {/* AI System Status */}
        {aiData && (
          <div className="ai-status mb-3 p-2 bg-light rounded">
            <small className="text-muted d-flex align-items-center">
              <FaInfoCircle className="me-1" />
              {aiData.fallbackMode ? (
                <span className="text-warning">Using rule-based recommendations (AI service unavailable)</span>
              ) : (
                <span className="text-success">AI analysis completed successfully</span>
              )}
              {aiData.reasoning && (
                <span className="ms-2">• {aiData.reasoning}</span>
              )}
            </small>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert color="danger" className="mb-3">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <Spinner color="primary" className="me-2" />
            <span>Analyzing patient profile and generating recommendations...</span>
          </div>
        )}

        {/* Warnings */}
        {aiData && (
          <>
            {aiData.allergyWarnings?.length > 0 && (
              <Alert color="danger" className="mb-3">
                <h6 className="alert-heading">
                  <FaExclamationTriangle className="me-2" />
                  Allergy Warnings
                </h6>
                {aiData.allergyWarnings.map((warning, index) => (
                  <div key={index} className="mb-1">
                    • {warning.message || warning}
                  </div>
                ))}
              </Alert>
            )}

            {aiData.interactionWarnings?.length > 0 && (
              <Alert color="warning" className="mb-3">
                <h6 className="alert-heading">
                  <FaExclamationCircle className="me-2" />
                  Drug Interaction Warnings
                </h6>
                {aiData.interactionWarnings.map((warning, index) => (
                  <div key={index} className="mb-1">
                    • {warning.message || warning}
                  </div>
                ))}
              </Alert>
            )}
          </>
        )}

        {/* Recommendations List */}
        {!loading && !error && (
          <div className="recommendations-list">
            {recommendations.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <FaInfoCircle size={24} className="mb-2" />
                <p className="mb-0">
                  {patientId ? 
                    'No specific recommendations available. Please add clinical notes or symptoms for better analysis.' :
                    'Select a patient to see AI-powered medication recommendations'
                  }
                </p>
              </div>
            ) : (
              <Row>
                {recommendations.map((medication, index) => (
                  <Col md={12} key={index} className="mb-3">
                    <div className="medication-recommendation p-3 border rounded bg-light">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0 d-flex align-items-center">
                          <FaPrescriptionBottleAlt className="me-2 text-primary" />
                          <span>{medication.name}</span>
                        </h6>
                        <div className="d-flex gap-2">
                          {medication.category && (
                            <Badge color={getCategoryColor(medication.category)} pill>
                              {medication.category.replace('_', ' ')}
                            </Badge>
                          )}
                          {medication.priority && (
                            <Badge color={getSeverityColor(medication.priority)} pill>
                              {medication.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {medication.dosage && (
                        <p className="mb-1 small">
                          <strong>Dosage:</strong> {medication.dosage}
                          {medication.frequency && ` ${medication.frequency}`}
                        </p>
                      )}
                      
                      {medication.duration && (
                        <p className="mb-1 small">
                          <strong>Duration:</strong> {medication.duration}
                        </p>
                      )}
                      
                      {medication.notes && (
                        <p className="mb-2 small text-muted">
                          <strong>Notes:</strong> {medication.notes}
                        </p>
                      )}

                      {medication.contraindications && medication.contraindications.length > 0 && (
                        <div className="contraindications mb-2">
                          <small className="text-danger">
                            <strong>Contraindications:</strong> {medication.contraindications.join(', ')}
                          </small>
                        </div>
                      )}

                      {onMedicationSelect && (
                        <Button 
                          color="primary" 
                          size="sm" 
                          onClick={() => onMedicationSelect(medication)}
                        >
                          Add to Prescription
                        </Button>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Footer */}
        {aiData && !loading && (
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted d-flex align-items-center justify-content-between">
              <span>
                <FaCheckCircle className="me-1 text-success" />
                Recommendations based on patient's medical history, allergies, and current symptoms
              </span>
              <span>
                Last updated: {new Date(aiData.lastUpdated).toLocaleTimeString()}
              </span>
            </small>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AIMedicationRecommendations;