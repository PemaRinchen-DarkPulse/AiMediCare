import React, { useState } from "react";
import axios from "axios";
import OTPVerification from "./OTPVerification";
import AdditionalDetails from "./AdditionalDetails";
import InputWithLabel from "../input/InputWithLabel";
import Button from "../button/AuthButton";
import GoogleAuthBtn from "../button/GoogleAuthBtn";

const BasicInfo = () => {
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
      const response = await axios.post("http://localhost:5000/api/auth/signup", {
        name: `${name} ${surname}`,
        email,
        password,
        dob,
      });
  
      if (response.data.existingUser) {
        setError("Email already exists. Please log in or use a different email.");
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
        <OTPVerification email={formData.email} onOtpVerified={handleOtpVerified} />
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row">
              <InputWithLabel
              className="col mb-3"
                htmlFor="name"
                labelText="First Name"
                type="text"
                name="name"
                placeholder="John"
                value={formData.name}
                onChange={handleChange}
              />
              <InputWithLabel
              className="col mb-3"
                htmlFor="surname"
                labelText="Surname"
                type="text"
                name="surname"
                placeholder="Doe"
                value={formData.surname}
                onChange={handleChange}
              />
            </div>
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
            className="mb-3"
              htmlFor="password"
              labelText="Password"
              type="password"
              name="password"
              placeholder="password"
              value={formData.password}
              onChange={handleChange}
            />
            <InputWithLabel
            className="mb-3"
              htmlFor="confirmPassword"
              labelText="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <div className="d-grid gap-2">
              <Button text="Sign Up" className="btn btn-primary" type="submit" />
            </div>
          </form>
          <div className="text-center mt-3">
            <p className="text-muted">OR</p>
            <GoogleAuthBtn setIsGoogleSignup={setIsGoogleSignup}/>
          </div>
          <div><p>Already Have an Account<a href="/login">Log In</a></p></div>
        </>
      )}
    </div>
  );
};

export default BasicInfo;
