import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleAuthBtn = () => {
  const handleSuccess = async (response) => {
    try {
      window.location.href = "http://localhost:5000/auth/google";
    } catch (err) {
      console.error("Login Failed:", err);
    }
  };

  const handleFailure = (error) => {
    console.error("Google Login Failed:", error);
  };

  return (
      <div className="p-1">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleFailure}
          useOneTap
          theme="outline"
          size="large"
          width="100%"
          logo_alignment='center'
          text='signup_with'
          shape='circle'
        />
      </div>
  );
};
export default GoogleAuthBtn;
