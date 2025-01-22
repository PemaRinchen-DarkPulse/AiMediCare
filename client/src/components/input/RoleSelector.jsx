import React from "react";

const RoleSelector = ({ role, onRoleChange, onContinue }) => {
  return (
    <div className="mb-3">
      <label htmlFor="role" className="form-label">
        Role
      </label>
      <select className="form-control" name="role" value={role} onChange={onRoleChange}>
        <option value="">Select Role</option>
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="pharmacist">Pharmacist</option>
      </select>
      <div className="d-grid gap-2 m-1">
        <button className="btn btn-primary" type="button" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelector;
