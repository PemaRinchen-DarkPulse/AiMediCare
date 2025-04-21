import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Button, Badge, FormGroup, Label, Input, Row, Col } from 'reactstrap';

const PrescriptionReminder = ({ prescription, onAdherenceUpdate }) => {
  const [takenToday, setTakenToday] = useState(false);
  const [dosesLogged, setDosesLogged] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { name, dosage, frequency, nextDose, totalDosesPerDay } = prescription;
  
  // Format time from ISO string or time string
  const formatTime = (timeString) => {
    try {
      if (!timeString) return 'Not scheduled';
      
      if (timeString.includes('T')) {
        // ISO date string
        return new Date(timeString).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit'
        });
      } else {
        // Time string (HH:MM format)
        return timeString;
      }
    } catch (err) {
      return timeString;
    }
  };
  
  // Calculate if dose is due soon (within 30 minutes)
  const isDueSoon = () => {
    if (!nextDose) return false;
    
    const now = new Date();
    const doseTime = new Date(nextDose);
    const timeDiff = (doseTime - now) / (1000 * 60); // difference in minutes
    
    return timeDiff >= 0 && timeDiff <= 30;
  };
  
  // Calculate if dose is overdue
  const isOverdue = () => {
    if (!nextDose) return false;
    
    const now = new Date();
    const doseTime = new Date(nextDose);
    
    return now > doseTime;
  };
  
  // Get status badge
  const getReminderStatus = () => {
    if (takenToday) {
      return { label: 'Taken', color: 'success' };
    } else if (isOverdue()) {
      return { label: 'Overdue', color: 'danger' };
    } else if (isDueSoon()) {
      return { label: 'Due Soon', color: 'warning' };
    } else {
      return { label: 'Upcoming', color: 'info' };
    }
  };
  
  const handleLogDose = () => {
    const now = new Date();
    const newDosesLogged = dosesLogged + 1;
    
    setDosesLogged(newDosesLogged);
    
    if (newDosesLogged >= totalDosesPerDay) {
      setTakenToday(true);
    }
    
    // Call parent function to update medication adherence
    onAdherenceUpdate(newDosesLogged, totalDosesPerDay, now.toISOString());
  };
  
  const status = getReminderStatus();
  
  return (
    <Card className="mb-3 shadow-sm">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1">{name}</h6>
            <p className="mb-0 text-muted small">{dosage}, {frequency}</p>
          </div>
          <Badge color={status.color} pill>
            {status.label}
          </Badge>
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="text-muted d-block">
              Next dose: <strong>{formatTime(nextDose)}</strong>
            </small>
            <small className="text-muted d-block">
              Doses taken: <strong>{dosesLogged}/{totalDosesPerDay}</strong>
            </small>
          </div>
          
          <div className="d-flex">
            <Button 
              color="primary" 
              size="sm"
              className="me-2" 
              disabled={takenToday}
              onClick={handleLogDose}
            >
              Log Dose
            </Button>
            <Button 
              color="outline-secondary" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Details'}
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-3 pt-3 border-top">
            <Row className="mb-2">
              <Col xs="6">
                <small className="text-muted d-block">Start date:</small>
                <span>{new Date(prescription.startDate).toLocaleDateString()}</span>
              </Col>
              <Col xs="6">
                <small className="text-muted d-block">End date:</small>
                <span>{prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'Ongoing'}</span>
              </Col>
            </Row>
            
            <Row className="mb-2">
              <Col xs="12">
                <small className="text-muted d-block">Instructions:</small>
                <span>{prescription.instructions || 'No special instructions'}</span>
              </Col>
            </Row>
            
            <FormGroup check className="mt-2">
              <Label check>
                <Input 
                  type="checkbox" 
                  checked={takenToday}
                  onChange={() => {
                    const newStatus = !takenToday;
                    setTakenToday(newStatus);
                    setDosesLogged(newStatus ? totalDosesPerDay : 0);
                    onAdherenceUpdate(
                      newStatus ? totalDosesPerDay : 0, 
                      totalDosesPerDay, 
                      new Date().toISOString()
                    );
                  }}
                />
                Mark all doses as taken today
              </Label>
            </FormGroup>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

PrescriptionReminder.propTypes = {
  prescription: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    dosage: PropTypes.string.isRequired,
    frequency: PropTypes.string.isRequired,
    nextDose: PropTypes.string,
    totalDosesPerDay: PropTypes.number.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string,
    instructions: PropTypes.string
  }).isRequired,
  onAdherenceUpdate: PropTypes.func.isRequired
};

export default PrescriptionReminder;