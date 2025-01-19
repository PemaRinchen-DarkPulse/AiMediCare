import React, { useState } from 'react';
import axios from 'axios';
import OTPVerification from './OTPVerification';

const BasicInfo = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const { name, surname, email, password, confirmPassword } = formData;

    if (!name || !surname) {
      setError('First name and surname are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        name: `${name} ${surname}`,
        email,
        password,
        dob: formData.dob,
      });
      alert(response.data.message);
      setOtpSent(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Error signing up');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/verify-otp', {
        email: `${formData.email}`,
        otp,
      });
      alert(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || 'Error verifying OTP');
    }
  };

  return (
    <form className="shadow m-5 p-3 rounded-3">
      {!otpSent ? (
        <>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="row">
            <div className="col mb-3">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="John"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="col mb-3">
              <label htmlFor="surname" className="form-label">
                Surname
              </label>
              <input
                type="text"
                className="form-control"
                name="surname"
                placeholder="Doe"
                value={formData.surname}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="dob" className="form-label">
              Date of Birth
            </label>
            <input
              type="date"
              className="form-control"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="johndoe@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              className="form-control"
              name="confirmPassword"
              placeholder="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div class="d-grid gap-2 m-1">
  <button class="btn btn-primary" type="button">Sign Up</button>
</div>
        </>
      ) : (
        <OTPVerification/>
      )}
    </form>
  );
};

export default BasicInfo;
