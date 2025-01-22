import React, { useState } from "react";
import PhoneNumberInput from "../input/PhoneNumberInput";
import DateOfBirthAndGender from "../input/DateOfBirthAndGender";
import AddressFields from "../input/AddressFields";
import RoleSelector from "../input/RoleSelector";
import PatientFields from "./PatientFields";
import DoctorFields from "./DoctorFields";
import PharmacistFields from "./PharmacistFields";

const AdditionalDetails = () => {
  const [role, setRole] = useState("");
  const [showRoleFields, setShowRoleFields] = useState(false);

  const handleRoleChange = (e) => setRole(e.target.value);

  const handleContinue = () => setShowRoleFields(true);

  return (
    <form>
      {!showRoleFields ? (
        <>
          <h3>Additional Details</h3>
          <PhoneNumberInput />
          <DateOfBirthAndGender />
          <AddressFields />
          <RoleSelector role={role} onRoleChange={handleRoleChange} onContinue={handleContinue} />
        </>
      ) : (
        <>
          {role === "patient" && <PatientFields />}
          {role === "doctor" && <DoctorFields />}
          {role === "pharmacist" && <PharmacistFields />}
        </>
      )}
    </form>
  );
};

export default AdditionalDetails;
