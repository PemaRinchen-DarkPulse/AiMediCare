import React from 'react';

const StepNavigator = ({ currentStep, totalSteps, stepTitles }) => {
  return (
    <div className="step-navigator mb-4">
      <div className="steps-progress">
        <div 
          className="progress-bar" 
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
      
      <div className="step-indicators">
        {stepTitles.map((title, index) => (
          <div 
            key={index} 
            className={`step-indicator ${
              index < currentStep ? 'completed' : 
              index === currentStep ? 'active' : ''
            }`}
          >
            <div className="step-number">
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div className="step-title">{title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepNavigator;