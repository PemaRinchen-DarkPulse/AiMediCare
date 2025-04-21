import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Spinner, Badge } from 'reactstrap';
import { getPrescriptionHistory } from '../../services/prescriptionService';

const PrescriptionHistory = ({ prescriptionId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, you would filter by prescriptionId on the server
        // For now, we'll get all prescription history and filter client-side
        const allHistory = await getPrescriptionHistory();
        
        // Filter by prescriptionId and sort by date (newest first)
        const filteredHistory = allHistory
          .filter(item => item.prescriptionId === prescriptionId)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setHistory(filteredHistory);
      } catch (err) {
        console.error('Error fetching prescription history:', err);
        setError('Failed to load medication history.');
      } finally {
        setLoading(false);
      }
    };

    if (prescriptionId) {
      fetchHistory();
    }
  }, [prescriptionId]);

  if (loading) {
    return (
      <div className="text-center p-3">
        <Spinner color="primary" size="sm" />
        <p className="mt-2 mb-0 small">Loading medication history...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (history.length === 0) {
    return <p className="text-muted">No history available for this medication.</p>;
  }

  // Get adherence status and color
  const getAdherenceStatus = (takenDoses, scheduledDoses) => {
    const percentage = Math.round((takenDoses / scheduledDoses) * 100);
    
    if (percentage >= 100) {
      return { label: 'Complete', color: 'success' };
    } else if (percentage >= 75) {
      return { label: 'Good', color: 'info' };
    } else if (percentage >= 50) {
      return { label: 'Fair', color: 'warning' };
    } else {
      return { label: 'Poor', color: 'danger' };
    }
  };

  return (
    <ListGroup flush>
      {history.map((record, index) => {
        const adherence = getAdherenceStatus(record.takenDoses, record.scheduledDoses);
        
        return (
          <ListGroupItem key={index} className="px-0 py-2 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-0 small fw-bold">
                  {new Date(record.date).toLocaleDateString()}
                </p>
                <p className="mb-0 small text-muted">
                  Taken: {record.takenDoses} of {record.scheduledDoses} doses
                </p>
              </div>
              <Badge color={adherence.color} pill>
                {adherence.label}
              </Badge>
            </div>
            
            {record.notes && (
              <p className="mb-0 mt-1 small fst-italic">
                "{record.notes}"
              </p>
            )}
          </ListGroupItem>
        );
      })}
    </ListGroup>
  );
};

PrescriptionHistory.propTypes = {
  prescriptionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default PrescriptionHistory;