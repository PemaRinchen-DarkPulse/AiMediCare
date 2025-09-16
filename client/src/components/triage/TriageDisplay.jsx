import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, CardTitle, Badge, Spinner, Alert,
  Row, Col, ListGroup, ListGroupItem, Button, Collapse,
  Progress, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import {
  FaRobot, FaExclamationTriangle, FaCheckCircle, FaClock,
  FaStethoscope, FaClipboardList, FaNotes, FaUserMd,
  FaFlask, FaHeartbeat, FaEye, FaEdit, FaCheck
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getTriageByAppointment, markTriageAsReviewed } from '../../services/previsitTriageService';
import './TriageDisplay.css';

const TriageDisplay = ({ appointmentId, userRole, onTriageUpdate }) => {
  const [triage, setTriage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    symptoms: true,
    preparation: true,
    recommendations: false
  });
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      fetchTriageData();
    }
  }, [appointmentId]);

  const fetchTriageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const triageData = await getTriageByAppointment(appointmentId);
      setTriage(triageData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching triage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 5: return 'danger';
      case 4: return 'warning';
      case 3: return 'info';
      case 2: return 'secondary';
      case 1: return 'light';
      default: return 'secondary';
    }
  };

  const getUrgencyIcon = (level) => {
    if (level >= 4) return <FaExclamationTriangle className="me-1" />;
    if (level >= 3) return <FaClock className="me-1" />;
    return <FaCheckCircle className="me-1" />;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  const handleMarkAsReviewed = async () => {
    try {
      setSubmitting(true);
      await markTriageAsReviewed(triage._id, reviewNotes);
      toast.success('Triage marked as reviewed');
      setReviewModal(false);
      setReviewNotes('');
      await fetchTriageData(); // Refresh data
      if (onTriageUpdate) onTriageUpdate();
    } catch (err) {
      toast.error('Failed to mark triage as reviewed');
      console.error('Error marking triage as reviewed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="triage-display">
        <CardBody className="text-center py-4">
          <Spinner color="primary" />
          <p className="mt-2">Loading triage information...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="triage-display">
        <CardBody>
          <Alert color="warning">
            <h6>Triage Information Not Available</h6>
            <p className="mb-0">{error}</p>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!triage) {
    return (
      <Card className="triage-display">
        <CardBody>
          <Alert color="info">
            <FaRobot className="me-2" />
            <strong>AI Triage Processing</strong>
            <p className="mb-0 mt-2">
              The AI is analyzing the appointment details to generate pre-visit triage information. 
              This usually takes a few moments after booking.
            </p>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="triage-display">
      {/* Header Card */}
      <Card className="mb-3 border-primary">
        <CardBody>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <CardTitle tag="h5" className="d-flex align-items-center mb-2">
                <FaRobot className="text-primary me-2" />
                AI-Generated Pre-Visit Triage
              </CardTitle>
              <div className="d-flex align-items-center gap-3 mb-2">
                <Badge 
                  color={getUrgencyColor(triage.urgencyLevel)} 
                  pill 
                  className="d-flex align-items-center"
                >
                  {getUrgencyIcon(triage.urgencyLevel)}
                  {triage.urgencyDescription || `Level ${triage.urgencyLevel}`}
                </Badge>
                
                {triage.medicalCategory && (
                  <Badge color="outline-primary" pill>
                    <FaStethoscope className="me-1" size={12} />
                    {triage.medicalCategory.charAt(0).toUpperCase() + triage.medicalCategory.slice(1)}
                  </Badge>
                )}
                
                {triage.requiresImmediateAttention && (
                  <Badge color="danger" pill>
                    <FaExclamationTriangle className="me-1" size={12} />
                    Immediate Attention
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-end">
              <small className="text-muted d-block">
                Generated: {new Date(triage.createdAt).toLocaleDateString()}
              </small>
              <small className="text-muted d-block">
                Method: {triage.generatedAt}
              </small>
              {triage.aiConfidence && (
                <div className="mt-2">
                  <small className="text-muted d-block">AI Confidence</small>
                  <Progress 
                    value={triage.aiConfidence * 100} 
                    color={getConfidenceColor(triage.aiConfidence)}
                    size="sm"
                  />
                  <small className="text-muted">{(triage.aiConfidence * 100).toFixed(0)}%</small>
                </div>
              )}
            </div>
          </div>
          
          {userRole === 'doctor' && triage.status !== 'reviewed' && (
            <Button 
              color="primary" 
              size="sm" 
              onClick={() => setReviewModal(true)}
              className="mt-2"
            >
              <FaCheck className="me-1" />
              Mark as Reviewed
            </Button>
          )}
        </CardBody>
      </Card>

      <Row>
        <Col md={6}>
          {/* Key Symptoms */}
          <Card className="mb-3">
            <CardBody>
              <div 
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => toggleSection('symptoms')}
              >
                <h6 className="mb-0">
                  <FaClipboardList className="text-primary me-2" />
                  Key Symptoms & Information
                </h6>
                <FaEye className={`text-muted ${expandedSections.symptoms ? 'rotate-180' : ''}`} />
              </div>
              
              <Collapse isOpen={expandedSections.symptoms}>
                <div className="mt-3">
                  <div className="mb-3">
                    <strong>Reason for Visit:</strong>
                    <p className="mb-2 ps-3">{triage.reasonForVisit}</p>
                  </div>
                  
                  {triage.additionalNotes && (
                    <div className="mb-3">
                      <strong>Additional Notes:</strong>
                      <p className="mb-2 ps-3">{triage.additionalNotes}</p>
                    </div>
                  )}
                  
                  {triage.keySymptoms && triage.keySymptoms.length > 0 && (
                    <div>
                      <strong>Key Symptoms:</strong>
                      <ListGroup flush className="mt-2">
                        {triage.keySymptoms.map((symptom, index) => (
                          <ListGroupItem key={index} className="px-0 py-1">
                            • {symptom}
                          </ListGroupItem>
                        ))}
                      </ListGroup>
                    </div>
                  )}
                </div>
              </Collapse>
            </CardBody>
          </Card>

          {/* Risk Factors */}
          {triage.riskFactors && triage.riskFactors.length > 0 && (
            <Card className="mb-3">
              <CardBody>
                <h6 className="mb-3">
                  <FaExclamationTriangle className="text-warning me-2" />
                  Risk Factors
                </h6>
                <ListGroup flush>
                  {triage.riskFactors.map((factor, index) => (
                    <ListGroupItem key={index} className="px-0 py-1">
                      • {factor}
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          )}
        </Col>

        <Col md={6}>
          {/* Preparation Notes */}
          <Card className="mb-3">
            <CardBody>
              <div 
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => toggleSection('preparation')}
              >
                <h6 className="mb-0">
                  <FaNotes className="text-primary me-2" />
                  Preparation Notes
                </h6>
                <FaEye className={`text-muted ${expandedSections.preparation ? 'rotate-180' : ''}`} />
              </div>
              
              <Collapse isOpen={expandedSections.preparation}>
                <div className="mt-3">
                  <p>{triage.preparationNotes}</p>
                  
                  {triage.patientInstructions && (
                    <div className="mt-3">
                      <Alert color="info" className="small">
                        <strong>Patient Instructions:</strong><br />
                        {triage.patientInstructions}
                      </Alert>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <small className="text-muted">
                      <FaClock className="me-1" />
                      Estimated Duration: {triage.estimatedDuration}
                    </small>
                  </div>
                </div>
              </Collapse>
            </CardBody>
          </Card>

          {/* Recommendations */}
          <Card className="mb-3">
            <CardBody>
              <div 
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => toggleSection('recommendations')}
              >
                <h6 className="mb-0">
                  <FaFlask className="text-primary me-2" />
                  Recommendations
                </h6>
                <FaEye className={`text-muted ${expandedSections.recommendations ? 'rotate-180' : ''}`} />
              </div>
              
              <Collapse isOpen={expandedSections.recommendations}>
                <div className="mt-3">
                  {triage.suggestedSpecialty && (
                    <div className="mb-3">
                      <strong>Suggested Specialty:</strong>
                      <Badge color="outline-info" className="ms-2">
                        <FaUserMd className="me-1" size={12} />
                        {triage.suggestedSpecialty}
                      </Badge>
                    </div>
                  )}
                  
                  {triage.recommendedTests && triage.recommendedTests.length > 0 && (
                    <div>
                      <strong>Recommended Tests:</strong>
                      <ListGroup flush className="mt-2">
                        {triage.recommendedTests.map((test, index) => (
                          <ListGroupItem key={index} className="px-0 py-1">
                            <FaHeartbeat className="text-primary me-2" size={12} />
                            {test}
                          </ListGroupItem>
                        ))}
                      </ListGroup>
                    </div>
                  )}
                </div>
              </Collapse>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Review Status */}
      {triage.status === 'reviewed' && (
        <Card className="border-success">
          <CardBody>
            <div className="d-flex align-items-center text-success">
              <FaCheckCircle className="me-2" />
              <strong>Reviewed by Dr. {triage.reviewedBy?.name || 'Doctor'}</strong>
              <small className="text-muted ms-2">
                on {new Date(triage.reviewedAt).toLocaleDateString()}
              </small>
            </div>
            {triage.reviewNotes && (
              <p className="mt-2 mb-0 ps-4">{triage.reviewNotes}</p>
            )}
          </CardBody>
        </Card>
      )}

      {/* Review Modal */}
      <Modal isOpen={reviewModal} toggle={() => setReviewModal(false)}>
        <ModalHeader toggle={() => setReviewModal(false)}>
          Mark Triage as Reviewed
        </ModalHeader>
        <ModalBody>
          <p>Mark this triage analysis as reviewed. You can add optional notes about your review.</p>
          <div className="mb-3">
            <label className="form-label">Review Notes (Optional)</label>
            <textarea
              className="form-control"
              rows="3"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any notes about your review of this triage analysis..."
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setReviewModal(false)}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onClick={handleMarkAsReviewed}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" className="me-1" /> : <FaCheck className="me-1" />}
            Mark as Reviewed
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TriageDisplay;