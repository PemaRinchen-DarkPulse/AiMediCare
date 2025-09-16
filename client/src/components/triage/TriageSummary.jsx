import React from 'react';
import { Card, CardBody, Badge, Row, Col } from 'reactstrap';
import {
  FaRobot, FaExclamationTriangle, FaCheckCircle, FaClock,
  FaStethoscope, FaEye
} from 'react-icons/fa';
import './TriageDisplay.css';

const TriageSummary = ({ triage, onClick, showPatientInfo = false, showDoctorInfo = false }) => {
  if (!triage) return null;

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

  const handleClick = () => {
    if (onClick) {
      onClick(triage);
    }
  };

  return (
    <Card 
      className={`triage-summary mb-2 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <CardBody className="p-3">
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center mb-2">
              <FaRobot className="text-primary me-2" size={16} />
              <span className="fw-bold me-2">AI Triage</span>
              
              <Badge 
                color={getUrgencyColor(triage.urgencyLevel)} 
                pill 
                className="d-flex align-items-center me-2"
                size="sm"
              >
                {getUrgencyIcon(triage.urgencyLevel)}
                Level {triage.urgencyLevel}
              </Badge>
              
              {triage.requiresImmediateAttention && (
                <Badge color="danger" pill size="sm">
                  <FaExclamationTriangle className="me-1" size={10} />
                  Urgent
                </Badge>
              )}
            </div>

            <div className="mb-1">
              <strong>Reason:</strong> 
              <span className="ms-1">
                {triage.reasonForVisit.length > 80 
                  ? `${triage.reasonForVisit.substring(0, 80)}...` 
                  : triage.reasonForVisit
                }
              </span>
            </div>

            {triage.medicalCategory && (
              <div className="mb-1">
                <Badge color="outline-primary" pill size="sm">
                  <FaStethoscope className="me-1" size={10} />
                  {triage.medicalCategory.charAt(0).toUpperCase() + triage.medicalCategory.slice(1)}
                </Badge>
              </div>
            )}

            {showPatientInfo && triage.patientId && (
              <div className="small text-muted">
                Patient: {triage.patientId.name || 'Unknown'}
              </div>
            )}

            {showDoctorInfo && triage.doctorId && (
              <div className="small text-muted">
                Doctor: {triage.doctorId.name || 'Unknown'}
              </div>
            )}
          </Col>

          <Col md={4} className="text-end">
            <div className="small text-muted mb-1">
              Generated: {new Date(triage.createdAt).toLocaleDateString()}
            </div>
            
            <div className="small text-muted mb-1">
              Method: {triage.generatedAt}
            </div>

            {triage.aiConfidence && (
              <div className="small text-muted mb-1">
                Confidence: {(triage.aiConfidence * 100).toFixed(0)}%
              </div>
            )}

            <div>
              <Badge 
                color={triage.status === 'reviewed' ? 'success' : 'warning'} 
                pill 
                size="sm"
              >
                {triage.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
              </Badge>
            </div>

            {onClick && (
              <div className="mt-2">
                <FaEye className="text-muted" size={14} />
                <small className="text-muted ms-1">Click to view</small>
              </div>
            )}
          </Col>
        </Row>

        {/* Key symptoms preview */}
        {triage.keySymptoms && triage.keySymptoms.length > 0 && (
          <Row className="mt-2">
            <Col>
              <div className="small">
                <strong>Key symptoms:</strong>{' '}
                {triage.keySymptoms.slice(0, 3).join(', ')}
                {triage.keySymptoms.length > 3 && ` (+${triage.keySymptoms.length - 3} more)`}
              </div>
            </Col>
          </Row>
        )}

        {/* Errors if any */}
        {triage.errors && triage.errors.length > 0 && (
          <Row className="mt-2">
            <Col>
              <Badge color="warning" size="sm">
                <FaExclamationTriangle className="me-1" size={10} />
                {triage.errors.length} Warning{triage.errors.length > 1 ? 's' : ''}
              </Badge>
            </Col>
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

export default TriageSummary;