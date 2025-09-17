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

  // Check if Google Client ID is available
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId || clientId === "your-google-client-id-here") {
    return (
      <div className="p-1">
        <div className="alert alert-warning text-center">
          <small>Google OAuth is not configured. Please add your Google Client ID to the .env file.</small>
        </div>
      </div>
    );
  }

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
