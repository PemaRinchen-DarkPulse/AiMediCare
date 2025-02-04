import React from "react";
import { GoogleLogin } from "@react-oauth/google";
const GoogleAuthBtn = ({ setIsGoogleSignup }) => {
  const handleSuccess = async (response) => {
    try {
      const res = await fetch("http://localhost:5000/auth/google/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: response.credential }),
        credentials: "include", // Important for sessions
      });
      if (res.ok) {
        const data = await res.json();
        if (data.existingUser) {
          window.location.href = "/dashboard"; // Redirect if email exists
        } else {
          setIsGoogleSignup(true); // New signup
        }
      } else {
        console.error("Backend authentication failed");
      }      
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
        logo_alignment="center"
        text="signup_with"
        shape="circle"
      />
    </div>
  );
};

export default GoogleAuthBtn;
