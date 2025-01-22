import React from "react";

const PhoneNumberInput = ({ onCountryCodeChange, onPhoneNumberChange }) => {
  return (
    <div className="col mb-3">
      <label htmlFor="phoneNumber" className="form-label">
        Phone Number
      </label>
      <div className="input-group">
        <select
          className="form-select w-auto"
          id="countryCode"
          style={{ maxWidth: "100px" }}
          onChange={onCountryCodeChange}
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
          onChange={onPhoneNumberChange}
        />
      </div>
    </div>
  );
};

export default PhoneNumberInput;
