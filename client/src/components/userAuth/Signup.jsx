import React from "react";
import BasicInfo from "./BasicInfo";
import OTPVerification from "./OTPVerification";
import AdditionalDetails from "./AdditionalDetails";
import PatientFields from "./PatientFields";
import DoctorFields from "./DoctorFields";
import PharmacistFields from "./PharmacistFields";

const Signup = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <BasicInfo />
      </div>
    </div>
  );
};
export default Signup;
