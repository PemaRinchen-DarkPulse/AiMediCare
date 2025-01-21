import React from "react";

const PatientFields = () => {
  return (
    <form className="">
      <h3 className="text-center mb-4">Sign Up</h3>
      <div className="mb-3">
        <h5>Emergency Contact</h5>
        <label htmlFor="emergencyName" className="form-label">
          Name
        </label>
        <input
          type="text"
          className="form-control"
          id="emergencyName"
          placeholder="Emergency Contact Name"
        />
      </div>
      <div className="row mb-3">
        <div className="col-6 mb-3">
          <label htmlFor="emergencyRelationship" className="form-label">
            Relationship
          </label>
          <select className="form-select" id="emergencyRelationship">
            <option value="" disabled selected>
              Select Relationship
            </option>
            <option value="Parent">Parent</option>
            <option value="Sibling">Sibling</option>
            <option value="Spouse">Spouse</option>
            <option value="Friend">Friend</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="col-6 mb-3">
          <label htmlFor="emergencyPhone" className="form-label">
            Phone Number
          </label>
          <input
            type="text"
            className="form-control"
            id="emergencyPhone"
            placeholder="1234567890"
          />
        </div>
      </div>
      <div className="mb-3">
        <h5>Insurance Details (optional)</h5>
        <label htmlFor="insuranceProvider" className="form-label">
          Insurance Provider (optional)
        </label>
        <input
          type="text"
          className="form-control"
          id="insuranceProvider"
          placeholder="Provider Name"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="policyNumber" className="form-label">
          Policy Number (optional)
        </label>
        <input
          type="text"
          className="form-control"
          id="policyNumber"
          placeholder="Policy Number"
        />
      </div>
      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" type="button">
          Back
        </button>
        <button className="btn btn-primary" type="submit">
          Finish Sign Up
        </button>
      </div>
    </form>
  );
};

export default PatientFields;
