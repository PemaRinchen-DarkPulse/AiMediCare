import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FaEnvelope, FaMobile, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const VerificationForm = ({ 
  formData, 
  handleChange, 
  handleResendOTP,
  passwordVisible,
  togglePasswordVisibility,
  emailVerificationSent
}) => {
  return (
    <div className="registration-step">
      <h4 className="mb-3">Contact & Email Verification</h4>
      
      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email Address <small className="text-primary">(verification link will be sent here)</small></Form.Label>
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
            disabled={emailVerificationSent}
          />
          <Form.Control.Feedback type="invalid">
            Please provide a valid email address.
          </Form.Control.Feedback>
        </InputGroup>
        {emailVerificationSent && (
          <div className="text-end mt-2">
            <Button 
              variant="link" 
              className="p-0" 
              onClick={handleResendOTP}
            >
              Resend verification link
            </Button>
          </div>
        )}
      </Form.Group>
      
      <Form.Group className="mb-4" controlId="phoneNumber">
        <Form.Label>Phone Number with Country Code <small className="text-muted">(Optional)</small></Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <FaMobile />
          </InputGroup.Text>
          <Form.Control
            type="tel"
            placeholder="Phone number with country code (e.g. +1234567890)"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleChange}
          />
        </InputGroup>
      </Form.Group>
      
      {/* Password field is always shown */}
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
    </div>
  );
};

export default VerificationForm;