import React from 'react';
import PropTypes from 'prop-types';
import { Progress } from 'reactstrap';

/**
 * Component to display medication adherence as a progress bar
 */
const AdherenceProgressBar = ({ percentage, label, color = "primary" }) => {
  // Determine color based on adherence percentage
  const getColorByAdherence = (value) => {
    if (color !== "primary") return color;
    
    if (value >= 90) return "success";
    if (value >= 70) return "info";
    if (value >= 50) return "warning";
    return "danger";
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <span className="small">{label}</span>
        <span className={`small text-${getColorByAdherence(percentage)}`}>{percentage}%</span>
      </div>
      <Progress
        value={percentage}
        color={getColorByAdherence(percentage)}
        className="rounded-pill"
        style={{ height: '10px' }}
      />
    </div>
  );
};

AdherenceProgressBar.propTypes = {
  percentage: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.string
};

export default AdherenceProgressBar;