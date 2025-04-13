import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FaEnvelope, FaMobile, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const VerificationForm = ({ 
  formData, 
  handleChange, 
  handleResendOTP,
  handleVerifyOTP,
  passwordVisible,
  togglePasswordVisibility,
  otpSent,
  otpVerified
}) => {
  return (
    <div className="registration-step">
      <h4 className="mb-3">Contact & Verification</h4>
      
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email Address</Form.Label>
        <InputGroup hasValidation>
          <InputGroup.Text>
            <FaEnvelope />
          </InputGroup.Text>
          <Form.Control
            type="email"
            placeholder="Your email address"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            disabled={otpSent}
          />
          <Form.Control.Feedback type="invalid">
            Please provide a valid email address.
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
      
      <Form.Group className="mb-4" controlId="phoneNumber">
        <Form.Label>Phone Number with Country Code</Form.Label>
        <InputGroup hasValidation>
          <InputGroup.Text>
            <FaMobile />
          </InputGroup.Text>
          <Form.Control
            type="tel"
            placeholder="Phone number with country code (e.g. +1234567890)"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleChange}
            required
            disabled={otpSent}
          />
          <Form.Control.Feedback type="invalid">
            Please provide a valid phone number.
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
      
      <Form.Group className="mb-4" controlId="verificationMethod">
        <Form.Label>Select Verification Method</Form.Label>
        <div className="verification-selector">
          <Form.Check
            type="radio"
            id="verification-email"
            label="Email Verification"
            name="verificationMethod"
            value="email"
            checked={formData.verificationMethod === 'email'}
            onChange={handleChange}
            disabled={otpSent}
            required
          />
          <Form.Check
            type="radio"
            id="verification-sms"
            label="SMS Verification"
            name="verificationMethod"
            value="sms"
            checked={formData.verificationMethod === 'sms'}
            onChange={handleChange}
            disabled={otpSent}
            required
          />
        </div>
        <Form.Control.Feedback type="invalid">
          Please select a verification method.
        </Form.Control.Feedback>
      </Form.Group>
      
      {!otpSent && (
        <div className="text-center mb-4">
          <Button 
            variant="primary" 
            onClick={handleResendOTP}
            disabled={!formData.email || !formData.phoneNumber || !formData.verificationMethod}
          >
            Send Verification Code
          </Button>
        </div>
      )}
      
      {otpSent && (
        <>
          <Form.Group className="mb-4" controlId="otpCode">
            <Form.Label>Verification Code</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="text"
                placeholder="Enter the 6-digit code"
                name="otpCode"
                value={formData.otpCode || ''}
                onChange={handleChange}
                required
                disabled={otpVerified}
                maxLength={6}
              />
              <Button 
                variant="outline-primary"
                onClick={handleVerifyOTP}
                disabled={!formData.otpCode || formData.otpCode.length !== 6 || otpVerified}
              >
                Verify
              </Button>
              <Form.Control.Feedback type="invalid">
                Please enter the verification code.
              </Form.Control.Feedback>
            </InputGroup>
            
            {!otpVerified && (
              <div className="text-end mt-2">
                <Button 
                  variant="link" 
                  className="p-0" 
                  onClick={handleResendOTP}
                >
                  Resend code
                </Button>
              </div>
            )}
          </Form.Group>
        </>
      )}
      
      {otpVerified && (
        <>
          <div className="alert alert-success mb-4">
            <small>Verification successful. Please create a password to complete your registration.</small>
          </div>
          
          <Form.Group className="mb-4" controlId="password">
            <Form.Label>Create Password</Form.Label>
            <InputGroup hasValidation>
              <InputGroup.Text>
                <FaLock />
              </InputGroup.Text>
              <Form.Control
                type={passwordVisible ? "text" : "password"}
                placeholder="Create a strong password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                required
                minLength={8}
              />
              <Button 
                variant="outline-secondary"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </Button>
              <Form.Control.Feedback type="invalid">
                Password must be at least 8 characters long.
              </Form.Control.Feedback>
            </InputGroup>
            <Form.Text className="text-muted">
              Password must be at least 8 characters and include uppercase, lowercase, numbers and special characters.
            </Form.Text>
          </Form.Group>
        </>
      )}
    </div>
  );
};

export default VerificationForm;