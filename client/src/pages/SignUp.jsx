import React from "react";
import BasicInfo from "../components/userAuth/BasicInfo";
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
