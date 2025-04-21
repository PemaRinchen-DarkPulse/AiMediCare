import React from 'react';
import { Card, CardBody, CardTitle, CardSubtitle, CardText, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import AdherenceProgressBar from './AdherenceProgressBar';

const PrescriptionCard = ({ prescriptionData, onViewDetails, onRefillRequest }) => {
  const { id, name, dosage, frequency, timeOfDay, adherence } = prescriptionData;

  return (
    <Card className="h-100 shadow-sm">
      <CardBody>
        <CardTitle tag="h5">{name}</CardTitle>
        <CardSubtitle tag="h6" className="mb-2 text-muted">{dosage}</CardSubtitle>
        
        <CardText>
          <strong>Frequency:</strong> {frequency}<br />
          <strong>Time:</strong> {timeOfDay}
        </CardText>
        
        <AdherenceProgressBar adherencePercentage={adherence} />
        
        <div className="d-flex justify-content-between mt-3">
          <Button color="link" className="px-0" onClick={() => onViewDetails(prescriptionData)}>
            VIEW DETAILS
          </Button>
          <Button outline color="success" onClick={() => onRefillRequest(prescriptionData)}>
            REFILL REQUEST
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

PrescriptionCard.propTypes = {
  prescriptionData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    dosage: PropTypes.string.isRequired,
    frequency: PropTypes.string.isRequired,
    timeOfDay: PropTypes.string.isRequired,
    adherence: PropTypes.number.isRequired
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onRefillRequest: PropTypes.func.isRequired
};

export default PrescriptionCard;