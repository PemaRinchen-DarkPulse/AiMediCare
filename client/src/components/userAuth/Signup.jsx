import React from "react";
import BasicInfo from "./BasicInfo";
import OTPVerification from "./OTPVerification";

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
