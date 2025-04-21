import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Badge } from 'reactstrap';

const LabResultItem = ({ testName, date, result, normalRange, unit, isAbnormal }) => {
  return (
    <Row className="py-2 border-bottom align-items-center">
      <Col xs="12" md="4">
        <h6 className="mb-0 fw-bold">{testName}</h6>
        <small className="text-muted">{new Date(date).toLocaleDateString()}</small>
      </Col>
      <Col xs="12" md="4" className="text-center">
        <div className="d-flex align-items-center justify-content-md-center">
          <span className={`fs-6 ${isAbnormal ? 'text-danger fw-bold' : ''}`}>
            {result} {unit}
          </span>
          {isAbnormal && (
            <Badge color="danger" pill className="ms-2">
              Abnormal
            </Badge>
          )}
        </div>
      </Col>
      <Col xs="12" md="4" className="text-md-end">
        <small className="text-muted">Normal range: {normalRange} {unit}</small>
      </Col>
    </Row>
  );
};

LabResultItem.propTypes = {
  testName: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  result: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  normalRange: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  isAbnormal: PropTypes.bool
};

LabResultItem.defaultProps = {
  isAbnormal: false
};

export default LabResultItem;