import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody, CardTitle, CardText } from 'reactstrap';

/**
 * Reusable card component for displaying medical information
 */
const MedicalInfoCard = ({ title, icon, children, className = '' }) => {
  return (
    <Card className={`shadow-sm mb-4 ${className}`}>
      <CardHeader className="d-flex align-items-center bg-light">
        {icon && <span className="me-2">{icon}</span>}
        <CardTitle tag="h5" className="m-0">{title}</CardTitle>
      </CardHeader>
      <CardBody>
        {children || <CardText className="text-muted">No information available</CardText>}
      </CardBody>
    </Card>
  );
};

MedicalInfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.element,
  children: PropTypes.node,
  className: PropTypes.string
};

export default MedicalInfoCard;