import React from "react";

const AddressFields = ({ onStreetChange, onCityChange, onStateChange, onPostalCodeChange, onCountryChange }) => {
  return (
    <>
      <div className="mb-3">
        <label htmlFor="streetAddress" className="form-label">
          Street Address
        </label>
        <input
          type="text"
          className="form-control"
          id="streetAddress"
          placeholder="123 Main Street"
          onChange={onStreetChange}
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
            onChange={onCityChange}
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
            onChange={onStateChange}
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
            onChange={onPostalCodeChange}
          />
        </div>
        <div className="col-6 mb-3">
          <label htmlFor="country" className="form-label">
            Country
          </label>
          <select className="form-select" id="country" onChange={onCountryChange}>
            <option value="" disabled>
              Select your country
            </option>
            <option value="USA">USA</option>
            <option value="India">India</option>
            <option value="Bhutan">Bhutan</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default AddressFields;
