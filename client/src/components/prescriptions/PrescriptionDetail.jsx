import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Badge, Card } from 'reactstrap';

const PrescriptionDetail = ({ prescription, onRefillRequest }) => {
  const {
    id,
    name,
    dosage,
    frequency,
    startDate,
    endDate,
    prescribedBy,
    refillsRemaining,
    refillsTotal,
    pharmacy,
    instructions,
    status,
    sideEffects,
    interactions
  } = prescription;

  // Format date
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!endDate) return 'Ongoing';
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `${diffDays} days` : 'Expired';
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'completed': return 'secondary';
      case 'discontinued': return 'danger';
      case 'scheduled': return 'info';
      default: return 'primary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="mb-1">{name}</h4>
          <p className="mb-0 text-muted">{dosage} • {frequency}</p>
        </div>
        <Badge color={getStatusColor(status)} pill className="px-3 py-2">
          {status}
        </Badge>
      </div>

      <Row className="mb-4">
        <Col sm="6" className="mb-3">
          <h6 className="text-muted mb-2">Prescription Details</h6>
          <Card body className="bg-light border-0">
            <p className="mb-2">
              <strong>Start Date:</strong> {formatDate(startDate)}
            </p>
            <p className="mb-2">
              <strong>End Date:</strong> {formatDate(endDate)}
            </p>
            <p className="mb-2">
              <strong>Duration:</strong> {calculateDaysRemaining()}
            </p>
            <p className="mb-2">
              <strong>Prescribed By:</strong> {prescribedBy}
            </p>
            <p className="mb-0">
              <strong>Pharmacy:</strong> {pharmacy}
            </p>
          </Card>
        </Col>
        
        <Col sm="6" className="mb-3">
          <h6 className="text-muted mb-2">Refill Information</h6>
          <Card body className="bg-light border-0">
            <p className="mb-2">
              <strong>Refills Remaining:</strong> {refillsRemaining} of {refillsTotal}
            </p>
            <p className="mb-3">
              <strong>Last Refill:</strong> {prescription.lastRefillDate ? formatDate(prescription.lastRefillDate) : 'None'}
            </p>
            <Button 
              color="primary" 
              size="sm" 
              block
              disabled={refillsRemaining <= 0 || status.toLowerCase() !== 'active'}
              onClick={() => onRefillRequest(id)}
            >
              Request Refill
            </Button>
          </Card>
        </Col>
      </Row>

      <h6 className="text-muted mb-2">Instructions</h6>
      <Card body className="bg-light border-0 mb-4">
        <p className="mb-0">{instructions || 'No specific instructions provided.'}</p>
      </Card>

      <Row className="mb-3">
        <Col sm="6" className="mb-3">
          <h6 className="text-muted mb-2">Possible Side Effects</h6>
          <Card body className="bg-light border-0">
            {sideEffects && sideEffects.length > 0 ? (
              <ul className="mb-0 ps-3">
                {sideEffects.map((effect, index) => (
                  <li key={index}>{effect}</li>
                ))}
              </ul>
            ) : (
              <p className="mb-0">No side effects listed.</p>
            )}
          </Card>
        </Col>
        
        <Col sm="6">
          <h6 className="text-muted mb-2">Drug Interactions</h6>
          <Card body className="bg-light border-0">
            {interactions && interactions.length > 0 ? (
              <ul className="mb-0 ps-3">
                {interactions.map((interaction, index) => (
                  <li key={index}>{interaction}</li>
                ))}
              </ul>
            ) : (
              <p className="mb-0">No known drug interactions.</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

PrescriptionDetail.propTypes = {
  prescription: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    dosage: PropTypes.string.isRequired,
    frequency: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string,
    prescribedBy: PropTypes.string.isRequired,
    refillsRemaining: PropTypes.number.isRequired,
    refillsTotal: PropTypes.number.isRequired,
    pharmacy: PropTypes.string.isRequired,
    instructions: PropTypes.string,
    status: PropTypes.string.isRequired,
    sideEffects: PropTypes.arrayOf(PropTypes.string),
    interactions: PropTypes.arrayOf(PropTypes.string),
    lastRefillDate: PropTypes.string
  }).isRequired,
  onRefillRequest: PropTypes.func.isRequired
};

export default PrescriptionDetail;