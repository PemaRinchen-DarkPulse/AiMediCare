import React from "react";
import BasicLogin from "../components/userAuth/BasicLogin";
const Login = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <BasicLogin/>
      </div>  
    </div>
  );
};
export default Login;
