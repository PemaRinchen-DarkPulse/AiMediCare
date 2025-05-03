import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './ClockTimePicker.css';

const ClockTimePicker = ({ onChange, initialTime, availableSlots }) => {
  const [mode, setMode] = useState('hour'); // 'hour' or 'minute'
  const [selectedHour, setSelectedHour] = useState(initialTime ? initialTime.getHours() : 9);
  const [selectedMinute, setSelectedMinute] = useState(initialTime ? initialTime.getMinutes() : 0);
  
  // Hours to display on the clock (12h format with AM/PM)
  const clockHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  
  // Minutes to display (in steps of 5)
  const clockMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  
  // Memoize the time change handler to avoid infinite loops
  const handleTimeChange = useCallback(() => {
    const date = new Date();
    date.setHours(selectedHour);
    date.setMinutes(selectedMinute);
    
    if (onChange) {
      onChange(date);
    }
  }, [selectedHour, selectedMinute, onChange]);
  
  useEffect(() => {
    handleTimeChange();
    // Don't include onChange in the dependency array to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHour, selectedMinute]);
  
  const handleHourSelect = (hour) => {
    setSelectedHour(hour);
    setMode('minute'); // Switch to minute selection after hour is picked
  };
  
  const handleMinuteSelect = (minute) => {
    setSelectedMinute(minute);
    // Stay in minute mode to allow fine tuning
  };
  
  const handleNumberClick = (number) => {
    if (mode === 'hour') {
      handleHourSelect(number);
    } else {
      handleMinuteSelect(number);
    }
  };
  
  // Calculate the angle for the clock hand
  const getHandAngle = () => {
    if (mode === 'hour') {
      // Get base angle (30 degrees per hour)
      const hourBase = selectedHour % 12;
      const angle = hourBase * 30;
      
      return angle;
    } else {
      // Minute hand makes a full circle in 60 minutes (or 6 degrees per minute)
      return selectedMinute * 6;
    }
  };

  // Get the coordinates for the markers on the clock face
  const getCoordinates = (index, total, radius) => {
    const angle = (index * (360 / total) - 90) * (Math.PI / 180);
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };
  
  // Check if a time is available - modified to always return true
  const isTimeAvailable = (hour, minute) => {
    // Always return true to ensure nothing is disabled
    return true;
  };
  
  // Quick time selection slots
  const getQuickTimeSlots = () => {
    if (!availableSlots || availableSlots.length === 0) return [];
    
    // Filter available slots and return them sorted by time
    return availableSlots
      .filter(slot => slot.available)
      .sort((a, b) => a.time - b.time)
      .slice(0, 8); // Limit to 8 quick slots
  };
  
  return (
    <div className="clock-time-picker">
      <div className="clock-header">
        <div className="clock-title">Select a Time</div>
      </div>
      <div className="clock-container">
        <div className="clock-face">
          {/* Clock center */}
          <div className="clock-center"></div>
          
          {/* Clock hand */}
          <div 
            className="clock-hand" 
            style={{ transform: `translate(-50%, -100%) rotate(${getHandAngle()}deg)` }}
          ></div>
          
          {/* Clock numbers - only showing outer numbers (1-12) */}
          {mode === 'hour' ? (
            // Only showing outer hours (1-12)
            clockHours.map((hour, index) => {
              const { x, y } = getCoordinates(index, 12, 40);
              // Handle hour mapping - 12hr format only
              const actualHour = selectedHour >= 12 ? 
                (hour === 12 ? 12 : hour + 12) : 
                (hour === 12 ? 0 : hour);
              
              return (
                <div 
                  key={`hour-${hour}`}
                  className={`clock-number ${selectedHour === actualHour ? 'selected' : ''}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => handleNumberClick(actualHour)}
                >
                  {hour}
                </div>
              );
            })
          ) : (
            // Minute markers
            clockMinutes.map((minute, index) => {
              const { x, y } = getCoordinates(index, 12, 40);
              
              return (
                <div 
                  key={`minute-${minute}`}
                  className={`clock-number ${selectedMinute === minute ? 'selected' : ''}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => handleNumberClick(minute)}
                >
                  {minute}
                </div>
              );
            })
          )}
        </div>
        
        <div className="time-display">
          <span 
            className={`time-part hour ${mode === 'hour' ? 'active' : ''}`}
            onClick={() => setMode('hour')}
          >
            {(selectedHour % 12 === 0 ? 12 : selectedHour % 12)}
          </span>
          <span className="time-separator">:</span>
          <span 
            className={`time-part minute ${mode === 'minute' ? 'active' : ''}`}
            onClick={() => setMode('minute')}
          >
            {String(selectedMinute).padStart(2, '0')}
          </span>
          <span 
            className="time-period" 
            onClick={() => setSelectedHour((selectedHour >= 12) ? selectedHour - 12 : selectedHour + 12)}
          >
            {selectedHour >= 12 ? 'PM' : 'AM'}
          </span>
        </div>
      </div>
      
      {/* Quick time selection slots */}
      <div className="quick-time-slots">
        <h6>Recommended times:</h6>
        <div className="quick-slots">
          {getQuickTimeSlots().map((slot, index) => {
            const hour = slot.time.getHours();
            const minute = slot.time.getMinutes();
            const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedMinute = String(minute).padStart(2, '0');
            const timeText = `${formattedHour}:${formattedMinute} ${ampm}`;
            
            return (
              <button 
                key={`quick-${index}`}
                className="quick-slot-btn"
                onClick={() => {
                  setSelectedHour(hour);
                  setSelectedMinute(minute);
                }}
              >
                {timeText}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ClockTimePicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  initialTime: PropTypes.instanceOf(Date),
  availableSlots: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.instanceOf(Date),
      available: PropTypes.bool,
      formattedTime: PropTypes.string
    })
  )
};

export default ClockTimePicker;