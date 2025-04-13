import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Row, Col, Form, Button, 
  Card, InputGroup
} from 'react-bootstrap';
import { 
  FaFacebook, FaEye, FaEyeSlash, FaArrowLeft, FaArrowRight
} from 'react-icons/fa';
import GoogleAuthBtn from '../components/button/GoogleAuthBtn';
import AuthButton from '../components/button/AuthButton';
import '../styles/Auth.css';
import '../styles/MultiStepForm.css';

// Import Step Components
import InitialRegistrationForm from '../components/forms/InitialRegistrationForm';
import PatientDetailsForm from '../components/forms/PatientDetailsForm';
import DoctorDetailsForm from '../components/forms/DoctorDetailsForm';
import PharmacistDetailsForm from '../components/forms/PharmacistDetailsForm';
import VerificationForm from '../components/forms/VerificationForm';

const SignUp = () => {
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const [validated, setValidated] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    role: '',
    email: '',
    phoneNumber: '',
    verificationMethod: '',
    otpCode: '',
    password: '',
  });
  
  // Password visibility
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  
  // Step titles for navigator
  const stepTitles = ['Personal Info', 'Role Details', 'Verification'];
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Handle OTP sending (simulated)
  const handleResendOTP = () => {
    // In real implementation, this would call an API to send OTP
    console.log('Sending OTP to:', formData.verificationMethod === 'email' ? formData.email : formData.phoneNumber);
    setOtpSent(true);
  };

  // Handle OTP verification (simulated)
  const handleVerifyOTP = () => {
    // In real implementation, this would call an API to verify OTP
    console.log('Verifying OTP:', formData.otpCode);
    setOtpVerified(true);
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setValidated(false);
  };

  // Navigate to next step with validation
  const handleNextStep = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    setValidated(true);
    
    if (form.checkValidity()) {
      setCurrentStep(currentStep + 1);
      setValidated(false);
      window.scrollTo(0, 0);
    }
  };

  // Handle final form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    setValidated(true);
    
    if (form.checkValidity() && otpVerified) {
      // In real implementation, this would call an API to register the user
      console.log('Registration complete:', formData);
    }
  };

  // Render the appropriate step form based on current step and role
  const renderStepForm = () => {
    switch (currentStep) {
      case 0:
        return (
          <InitialRegistrationForm 
            formData={formData} 
            handleChange={handleChange} 
            validated={validated} 
          />
        );
      case 1:
        // Render role-specific form
        if (formData.role === 'Patient') {
          return <PatientDetailsForm formData={formData} handleChange={handleChange} />;
        } else if (formData.role === 'Doctor') {
          return <DoctorDetailsForm formData={formData} handleChange={handleChange} />;
        } else if (formData.role === 'Pharmacist') {
          return <PharmacistDetailsForm formData={formData} handleChange={handleChange} />;
        }
        return null;
      case 2:
        return (
          <VerificationForm 
            formData={formData} 
            handleChange={handleChange} 
            handleResendOTP={handleResendOTP}
            handleVerifyOTP={handleVerifyOTP}
            passwordVisible={passwordVisible}
            togglePasswordVisibility={togglePasswordVisibility}
            otpSent={otpSent}
            otpVerified={otpVerified}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container fluid className="auth-container py-5">
      <Row className="justify-content-center w-100">
        <Col xs={12} md={10} lg={9}>
          <Card className="auth-card overflow-hidden">
            <Row className="g-0 h-100">
              {/* Left Panel - Registration Form */}
              <Col className="form-panel pe-0">
                <Card.Body className="p-4 p-lg-4">
                  
                  <h2 className="fw-bold mb-2">Create an Account</h2>
                  
                  {/* Social Login Options - Only shown on first step */}
                  {currentStep === 0 && !isGoogleSignup && (
                    <>
                      <div className="social-login-buttons mb-3 d-flex justify-content-center">
                        <GoogleAuthBtn setIsGoogleSignup={setIsGoogleSignup} />
                      </div>

                      <div className="divider my-4 d-flex align-items-center justify-content-center">
                        <span className="divider-text">or continue with email</span>
                      </div>
                    </>
                  )}
                  
                  <Form 
                    noValidate 
                    validated={validated} 
                    onSubmit={currentStep === stepTitles.length - 1 ? handleSubmit : handleNextStep}
                    className="registration-form"
                  >
                    {/* Dynamic Step Content */}
                    {renderStepForm()}
                    
                    {/* Form Navigation */}
                    <div className="form-navigation">
                      {currentStep > 0 ? (
                        <Button 
                          variant="outline-secondary" 
                          onClick={handlePrevStep}
                          className="d-flex align-items-center gap-2"
                        >
                          <FaArrowLeft /> Back
                        </Button>
                      ) : (
                        <div></div>
                      )}
                      
                      {currentStep < stepTitles.length - 1 ? (
                        <Button 
                          variant="primary" 
                          type="submit"
                          className="d-flex align-items-center gap-2"
                          disabled={
                            currentStep === 1 && 
                            !formData.role
                          }
                        >
                          Next <FaArrowRight />
                        </Button>
                      ) : (
                        <Button 
                          variant="primary" 
                          type="submit"
                          disabled={!otpVerified || !formData.password}
                        >
                          Complete Registration
                        </Button>
                      )}
                    </div>
                  </Form>

                  <div className="text-center mt-4">
                    <p className="mb-0">
                      Already have an account?{" "}
                      <Link to="/login" className="text-primary fw-medium">Login</Link>
                    </p>
                  </div>
                </Card.Body>
              </Col>

              {/* Right Panel - Promotional */}
              <Col className="promo-panel d-none d-lg-block ps-0">
                <div className="auth-right-panel text-white p-4 h-100 d-flex flex-column">
                  <div className="mt-5">
                    <h2 className="display-6 fw-bold mb-3">Connect with healthcare professionals</h2>
                    <p className="lead mb-4">Access world-class healthcare from the comfort of your home.</p>
                  </div>
                  
                  <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                    <img 
                      src="/images/healthcare-illustration.svg" 
                      alt="Healthcare connectivity" 
                      className="img-fluid auth-illustration"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Healthcare+Illustration";
                      }}
                    />
                  </div>
                  
                  <div className="pagination-dots mt-auto mb-4 d-flex justify-content-center">
                    <span className="dot active"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUp;


// change the adress to

// Street Address field with placeholder "123 Main St" and a required asterisk (*)
// City field with placeholder "City" and a required asterisk (*)
// State/Province field with placeholder "State/Province" and a required asterisk (*)
// Zip/Postal Code field with placeholder "Zip/Postal Code" and a required asterisk (*)
// Country field with placeholder "Country" and a required asterisk (*)