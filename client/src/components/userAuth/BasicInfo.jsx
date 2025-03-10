import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles
import InputWithLabel from "../input/InputWithLabel";
import Button from "../button/AuthButton";
import GoogleAuthBtn from "../button/GoogleAuthBtn";

const BasicInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, surname, email, password, confirmPassword, dob, role } = formData;

    if (!name || !surname) {
      toast.error("First name and surname are required.", { style: { background: "red", color: "white" } });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.", { style: { background: "red", color: "white" } });
      return;
    }

    if (!role) {
      toast.error("Please select a user role.", { style: { background: "red", color: "white" } });
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", {
        name: `${name} ${surname}`,
        email,
        password,
        dob,
        role,
      });

      if (response.data.existingUser) {
        toast.error("Email already exists. Please log in or use a different email.", {
          style: { background: "red", color: "white" },
        });
      } else {
        toast.success("User registered successfully!", {
          style: { background: "green", color: "white" },
        });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error signing up", {
        style: { background: "red", color: "white" },
      });
    }
  };

  return (
    <div className="shadow m-5 p-3 rounded-3">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <form onSubmit={handleSubmit}>
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

        <div className="mb-3">
          <label htmlFor="role" className="form-label">Select Your Role</label>
          <select
            className="form-select"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="">-- Select Role --</option>
            <option value="Doctor">Doctor</option>
            <option value="Pharmacist">Pharmacist</option>
            <option value="Patient">Patient</option>
          </select>
        </div>

        <div className="d-grid gap-2">
          <Button text="Sign Up" className="btn btn-primary" type="submit" />
        </div>
      </form>

      <div className="text-center mt-3">
        <p className="text-muted">OR</p>
        <GoogleAuthBtn />
      </div>
      <div><p>Already have an account? <a href="/login">Log In</a></p></div>
    </div>
  );
};

export default BasicInfo;
