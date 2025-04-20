import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Form, Button, 
  Card, InputGroup
} from 'react-bootstrap';
import { 
  FaFacebook, FaEye, FaEyeSlash, FaArrowLeft, FaArrowRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import GoogleAuthBtn from '../components/button/GoogleAuthBtn';
import AuthButton from '../components/button/AuthButton';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import '../styles/MultiStepForm.css';

// Import Step Components
import InitialRegistrationForm from '../components/forms/InitialRegistrationForm';
import PatientDetailsForm from '../components/forms/PatientDetailsForm';
import DoctorDetailsForm from '../components/forms/DoctorDetailsForm';
import PharmacistDetailsForm from '../components/forms/PharmacistDetailsForm';
import VerificationForm from '../components/forms/VerificationForm';

const SignUp = () => {
  // For navigation after successful registration
  const navigate = useNavigate();
  
  // Auth context
  const { register } = useAuth();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const [validated, setValidated] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    streetAddress: '',
    city: '',
    stateProvince: '',
    zipCode: '',
    country: '',
    role: '',
    email: '',
    phoneNumber: '',
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

  // Handle email verification link sending
  const handleSendVerificationLink = async () => {
    // Check if email is provided
    if (formData.email) {
      // Create a base userData object with common fields
      const userData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role.toLowerCase(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        streetAddress: formData.streetAddress,
        city: formData.city,
        stateProvince: formData.stateProvince,
        zipCode: formData.zipCode,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
      };
      
      // Add role-specific fields
      if (formData.role === 'Doctor') {
        Object.assign(userData, {
          medicalLicenseNumber: formData.medicalLicenseNumber,
          licenseExpiryDate: formData.licenseExpiryDate,
          issuingAuthority: formData.issuingAuthority,
          specialization: formData.specialization,
          yearsExperience: formData.yearsExperience,
          hospitalName: formData.hospitalName, // Use hospitalName to match the form field
          hospitalAffiliation: formData.hospitalName, // Keep hospitalAffiliation for backward compatibility
          practiceLocation: formData.practiceLocation,
          consultationFee: formData.consultationFee,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          routingNumber: formData.routingNumber
        });
      } else if (formData.role === 'Patient') {
        Object.assign(userData, {
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelationship: formData.emergencyContactRelationship,
          insuranceProvider: formData.insuranceProvider,
          policyNumber: formData.policyNumber,
          groupNumber: formData.groupNumber
        });
      } else if (formData.role === 'Pharmacist') {
        Object.assign(userData, {
          licenseNumber: formData.licenseNumber,
          issuingAuthority: formData.issuingAuthority,
          yearsExperience: formData.yearsExperience,
          pharmacyName: formData.pharmacyName,
          pharmacyAddress: formData.pharmacyAddress,
          pharmacyPhone: formData.pharmacyPhone,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          routingNumber: formData.routingNumber
        });
      }
      
      const result = await register(userData);
      
      if (result.success) {
        setEmailVerificationSent(true);
        return true;
      }
      
      return false;
    }
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
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    setValidated(true);
    
    if (form.checkValidity()) {
      setIsLoading(true);
      
      try {
        const success = await handleSendVerificationLink();
        if (success) {
          // Redirect user to login page after a short delay to show the success message
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Registration error:', error);
      } finally {
        setIsLoading(false);
      }
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
            handleResendOTP={handleSendVerificationLink}
            passwordVisible={passwordVisible}
            togglePasswordVisibility={togglePasswordVisibility}
            emailVerificationSent={emailVerificationSent}
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
                  
                  <h2 className="fw-bold">Create an Account</h2>
                  
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
                    <div className="form-navigation d-flex justify-content-between align-items-center mt-4">
                      <div className="d-flex align-items-center">
                        {currentStep > 0 ? (
                          <Button 
                            variant="outline-secondary" 
                            onClick={handlePrevStep}
                            className="d-flex align-items-center gap-2"
                          >
                            <FaArrowLeft /> Back
                          </Button>
                        ) : (
                          <div className="text-center">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary fw-medium">Login</Link>
                          </div>
                        )}
                      </div>
                      
                      <div>
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
                            disabled={!formData.password || isLoading}
                          >
                            {isLoading ? 'Registering...' : 'Register Now'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Form>
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
                        e.target.src = "https://placehold.co/400x300?text=Healthcare+Illustration";
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