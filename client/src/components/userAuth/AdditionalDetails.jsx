import React, { useState } from 'react';
import PatientFields from './PatientFields';
import DoctorFields from './DoctorFields';
import PharmacistFields from './PharmacistFields';

const AdditionalDetails = ({ previousData }) => {
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState(previousData);
  const [showRoleFields, setShowRoleFields] = useState(false);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleContinue = () => {
    setShowRoleFields(true);  // Show role-specific fields after clicking Continue
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <form className="">
        {!showRoleFields ? (
          <>
          <h3>Additional Details</h3>
          <div className="col mb-3">
        <label htmlFor="phoneNumber" className="form-label">
          Phone Number
        </label>
        <div className="input-group">
          <select
            className="form-select w-auto" // Added w-auto to adjust the width
            id="countryCode"
            style={{ maxWidth: "100px" }} // Inline style to set a custom width
          >
            <option value="+1">+1</option>
            <option value="+91">+91</option>
            <option value="+975">+975</option>
          </select>
          <input
            type="text"
            className="form-control"
            id="phoneNumber"
            placeholder="1234567890"
          />
        </div>
      </div>
      <div className="row">
        <div className="col-6 mb-3">
          <label htmlFor="dob" className="form-label">
            Date of Birth
          </label>
          <input type="date" className="form-control" id="dob" />
        </div>
        <div className="col-6 mb-3">
          <label htmlFor="gender" className="form-label">
            Gender
          </label>
          <select className="form-select" id="gender">
            <option value="" disabled selected>
              Select your gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="streetAddress" className="form-label">
          Street Address
        </label>
        <input
          type="text"
          className="form-control"
          id="streetAddress"
          placeholder="123 Main Street"
        />
      </div>
      <div className="row">
        <div className="col-6 mb-3">
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            type="text"
            className="form-control"
            id="city"
            placeholder="City"
          />
        </div>
        <div className="col-6 mb-3">
          <label htmlFor="state" className="form-label">
            State/Province
          </label>
          <input
            type="text"
            className="form-control"
            id="state"
            placeholder="State/Province"
          />
        </div>
      </div>
      <div className="row">
        <div className="col-6 mb-3">
          <label htmlFor="postalCode" className="form-label">
            Postal Code
          </label>
          <input
            type="text"
            className="form-control"
            id="postalCode"
            placeholder="123456"
          />
        </div>
        <div className="col-6 mb-3">
          <label htmlFor="country" className="form-label">
            Country
          </label>
          <select className="form-select" id="country">
            <option value="" disabled selected>
              Select your country
            </option>
            <option value="USA">USA</option>
            <option value="India">India</option>
            <option value="Bhutan">Bhutan</option>
          </select>
        </div>
      </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">Role</label>
              <select className="form-control" name="role" value={role} onChange={handleRoleChange}>
                <option value="">Select Role</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacist">Pharmacist</option>
              </select>
            </div>
            <div className="d-grid gap-2 m-1">
              <button className="btn btn-primary" type="button" onClick={handleContinue}>Continue</button>
            </div>
          </>
        ) : (
          <>
            {role === 'patient' && <PatientFields />}
            {role === 'doctor' && <DoctorFields />}
            {role === 'pharmacist' && <PharmacistFields />}
          </>
        )}
      </form>
    </div>
  );
};

export default AdditionalDetails;
