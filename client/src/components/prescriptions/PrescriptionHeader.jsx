import React from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

const PrescriptionHeader = ({ patientName, currentDateTime }) => {
  return (
    <div className="prescription-header bg-primary text-white p-3 mb-4 rounded">
      <Row className="align-items-center">
        <Col>
          <h2 className="mb-0">Prescription Management</h2>
          <p className="mb-0 mt-2">
            Welcome, {patientName}. Today is {currentDateTime}.
          </p>
        </Col>
      </Row>
    </div>
  );
};

PrescriptionHeader.propTypes = {
  patientName: PropTypes.string.isRequired,
  currentDateTime: PropTypes.string.isRequired
};

export default PrescriptionHeader;