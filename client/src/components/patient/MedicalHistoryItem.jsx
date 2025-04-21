import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Badge } from 'reactstrap';

const MedicalHistoryItem = ({ date, diagnosis, provider, status, notes }) => {
  // Determine badge color based on status
  const getBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'danger';
      case 'resolved': return 'success';
      case 'ongoing': return 'warning';
      case 'monitoring': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <ListGroupItem className="d-flex flex-column border-0 px-0 py-3 border-bottom">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1 fw-bold">{diagnosis}</h6>
          <div className="text-muted small">
            <span className="me-2"><i className="fas fa-user-md me-1"></i>{provider}</span>
            <span><i className="fas fa-calendar me-1"></i>{new Date(date).toLocaleDateString()}</span>
          </div>
        </div>
        <Badge color={getBadgeColor(status)} pill>{status}</Badge>
      </div>
      {notes && <p className="mt-2 mb-0 small">{notes}</p>}
    </ListGroupItem>
  );
};

MedicalHistoryItem.propTypes = {
  date: PropTypes.string.isRequired,
  diagnosis: PropTypes.string.isRequired,
  provider: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  notes: PropTypes.string
};

export default MedicalHistoryItem;