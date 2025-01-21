import React, { useState } from 'react';
import axios from 'axios';
import OTPVerification from './OTPVerification';
import AdditionalDetails from './AdditionalDetails';

const BasicInfo = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');  // Reset error when the user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, surname, email, password, confirmPassword, dob } = formData;

    // Validation
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
        dob,
      });
      alert(response.data.message);
      setOtpSent(true); // OTP is sent, show OTP verification form
    } catch (error) {
      setError(error.response?.data?.message || 'Error signing up');
    }
  };

  const handleOtpVerified = () => {
    setOtpVerified(true);  // OTP is successfully verified, show the next form
  };
  return (
    <div className='shadow m-5 p-3 rounded-3'>
      {!otpSent && !otpVerified ? (
        <form className="">
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="row">
            <div className="col mb-3">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input type="text" className="form-control" name="name" placeholder="John" value={formData.name} onChange={handleChange} />
            </div>
            <div className="col mb-3">
              <label htmlFor="surname" className="form-label">Surname</label>
              <input type="text" className="form-control" name="surname" placeholder="Doe" value={formData.surname} onChange={handleChange} />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" name="email" placeholder="johndoe@example.com" value={formData.email} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" name="password" placeholder="password" value={formData.password} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input type="password" className="form-control" name="confirmPassword" placeholder="password" value={formData.confirmPassword} onChange={handleChange} />
          </div>
          <div className="d-grid gap-2 m-1">
            <button className="btn btn-primary" type="button" onClick={handleSubmit}>Sign Up</button>
          </div>
        </form>
      ) : otpSent && !otpVerified ? (
        <OTPVerification email={formData.email} onOtpVerified={handleOtpVerified} />
      ) : (
        <AdditionalDetails previousData={formData} />
      )}
    </div>
  );
};

export default BasicInfo;
