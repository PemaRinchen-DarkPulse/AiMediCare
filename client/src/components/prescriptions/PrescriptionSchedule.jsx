import React from 'react';
import { Table, Badge } from 'reactstrap';
import PropTypes from 'prop-types';
import { FaClock, FaPills } from 'react-icons/fa';

const PrescriptionSchedule = ({ dailySchedule }) => {
  const timeBlocks = [
    { id: 'morning', label: 'Morning (6AM - 12PM)' },
    { id: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
    { id: 'evening', label: 'Evening (6PM - 12AM)' },
    { id: 'night', label: 'Night (12AM - 6AM)' }
  ];

  return (
    <div className="prescription-schedule mb-4">
      <h4 className="mb-3">
        <FaClock className="me-2" /> Daily Medication Schedule
      </h4>
      <Table responsive bordered hover>
        <thead>
          <tr>
            <th>Time of Day</th>
            <th>Medications</th>
          </tr>
        </thead>
        <tbody>
          {timeBlocks.map(block => (
            <tr key={block.id}>
              <td className="fw-bold" width="30%">{block.label}</td>
              <td>
                {dailySchedule[block.id] && dailySchedule[block.id].length > 0 ? (
                  dailySchedule[block.id].map(med => (
                    <Badge 
                      key={med.id} 
                      color="primary" 
                      className="me-2 mb-2 p-2"
                    >
                      <FaPills className="me-1" /> {med.name} {med.dosage}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted">No medications scheduled</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

PrescriptionSchedule.propTypes = {
  dailySchedule: PropTypes.shape({
    morning: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      dosage: PropTypes.string.isRequired
    })),
    afternoon: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      dosage: PropTypes.string.isRequired
    })),
    evening: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      dosage: PropTypes.string.isRequired
    })),
    night: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      dosage: PropTypes.string.isRequired
    }))
  }).isRequired
};

export default PrescriptionSchedule;