import React from "react";

const DateOfBirthAndGender = ({ onDobChange, onGenderChange }) => {
  return (
    <div className="row">
      <div className="col-6 mb-3">
        <label htmlFor="dob" className="form-label">
          Date of Birth
        </label>
        <input type="date" className="form-control" id="dob" onChange={onDobChange} />
      </div>
      <div className="col-6 mb-3">
        <label htmlFor="gender" className="form-label">
          Gender
        </label>
        <select className="form-select" id="gender" onChange={onGenderChange}>
          <option value="" disabled>
            Select your gender
          </option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
};

export default DateOfBirthAndGender;
