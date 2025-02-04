import React, { useState } from "react";
import axios from "axios";
import OTPVerification from "./OTPVerification";
import AdditionalDetails from "./AdditionalDetails";
import InputWithLabel from "../input/InputWithLabel";
import Button from "../button/AuthButton";
import GoogleAuthBtn from "../button/GoogleAuthBtn";

const BasicLogin = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isGoogleSignup, setIsGoogleSignup] = useState(false); // Track Google Signup
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, surname, email, password, confirmPassword, dob } = formData;

    if (!name || !surname) {
      setError("First name and surname are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          name: `${name} ${surname}`,
          email,
          password,
          dob,
        }
      );

      if (response.data.existingUser) {
        setError(
          "Email already exists. Please log in or use a different email."
        );
      } else {
        alert(response.data.message);
        setOtpSent(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error signing up");
    }
  };

  const handleOtpVerified = () => {
    setOtpVerified(true);
  };

  return (
    <div className="shadow m-5 p-3 rounded-3">
      {isGoogleSignup || (otpSent && otpVerified) ? (
        <AdditionalDetails previousData={formData} />
      ) : otpSent ? (
        <OTPVerification
          email={formData.email}
          onOtpVerified={handleOtpVerified}
        />
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <InputWithLabel
              className="mb-3"
              htmlFor="email"
              labelText="Email Address"
              type="email"
              name="email"
              placeholder="johndoe@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            <InputWithLabel
              htmlFor="password"
              labelText="Password"
              type="password"
              name="password"
              placeholder="password"
              value={formData.password}
              onChange={handleChange}
            />
            <div className="text-end mb-3">
              <a href="#">Forgot Password?</a>
            </div>
            <div className="d-grid gap-2">
              <Button
                text="Sign In"
                className="btn btn-primary"
                type="submit"
              />
            </div>
          </form>
          <div className="text-center mt-3">
            <p className="text-muted">OR</p>
            <GoogleAuthBtn setIsGoogleSignup={setIsGoogleSignup}/>
          </div>
          <div>
            <p>
              Don't Have an Account<a href="/signup">Sign Up</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default BasicLogin;
