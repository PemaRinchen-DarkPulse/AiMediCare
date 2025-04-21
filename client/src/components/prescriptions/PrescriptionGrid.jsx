import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Card, CardBody, CardTitle, Badge } from 'reactstrap';

const PrescriptionGrid = ({ prescriptions, onSelect, selectedId }) => {
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
    <Row>
      {prescriptions.map(prescription => (
        <Col key={prescription.id} xs="12" md="6" lg="4" className="mb-4">
          <Card 
            className={`h-100 shadow-sm ${selectedId === prescription.id ? 'border border-primary' : ''}`}
            onClick={() => onSelect(prescription)}
            style={{ cursor: 'pointer' }}
          >
            <CardBody className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <CardTitle tag="h5" className="mb-0">{prescription.name}</CardTitle>
                <Badge color={getStatusColor(prescription.status)} pill>
                  {prescription.status}
                </Badge>
              </div>
              
              <p className="text-muted mb-2">{prescription.dosage}</p>
              <p className="mb-3">{prescription.frequency}</p>
              
              <div className="mt-auto">
                <div className="d-flex justify-content-between align-items-center small text-muted mb-3">
                  <span>
                    <i className="fas fa-calendar-alt me-1"></i>
                    {new Date(prescription.startDate).toLocaleDateString()}
                  </span>
                  {prescription.refillsRemaining !== undefined && (
                    <span>
                      <i className="fas fa-prescription-bottle-alt me-1"></i>
                      Refills: {prescription.refillsRemaining}/{prescription.refillsTotal}
                    </span>
                  )}
                </div>
                
                <Button 
                  color="primary" 
                  outline 
                  size="sm" 
                  block
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(prescription);
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
      
      {prescriptions.length === 0 && (
        <Col xs="12">
          <p className="text-muted text-center">No medications to display.</p>
        </Col>
      )}
    </Row>
  );
};

PrescriptionGrid.propTypes = {
  prescriptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      dosage: PropTypes.string.isRequired,
      frequency: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      refillsRemaining: PropTypes.number,
      refillsTotal: PropTypes.number
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default PrescriptionGrid;