import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Row, Col, Form, Button, 
  Card, InputGroup, FormCheck 
} from 'react-bootstrap';
import { 
  FaEnvelope, FaLock, FaEye, FaEyeSlash, 
  FaGoogle, FaFacebook 
} from 'react-icons/fa';
import GoogleAuthBtn from '../components/button/GoogleAuthBtn';
import AuthButton from '../components/button/AuthButton';
import '../styles/Auth.css';
import '../styles/MultiStepForm.css';

const Login = () => {
  // State management
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Form submission logic would go here
      console.log('Login form submitted:', formData);
    }
    
    setValidated(true);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Container fluid className="auth-container py-5">
      <Row className="justify-content-center w-100">
        <Col xs={12} md={10} lg={9}>
          <Card className="auth-card overflow-hidden">
            <Row className="g-0 h-100">
              {/* Left Panel - Login Form */}
              <Col className="form-panel pe-0">
                <Card.Body className="p-4 p-lg-4">
                  
                  <h2 className="fw-bold mb-2">Log in to your Account</h2>
                  <p className="text-muted mb-4 text-center">Welcome back!</p>
                  
                  <div className="social-login-buttons mb-3 d-flex justify-content-center">
                    <GoogleAuthBtn setIsGoogleSignup={setIsGoogleSignup} />
                  </div>

                  <div className="divider my-4 d-flex align-items-center justify-content-center">
                    <span className="divider-text">or continue with email</span>
                  </div>
                  
                  <Form noValidate validated={validated} onSubmit={handleSubmit} className="login-form">
                    <div className="form-content">
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email Address</Form.Label>
                        <InputGroup hasValidation>
                          <InputGroup.Text>
                            <FaEnvelope />
                          </InputGroup.Text>
                          <Form.Control
                            type="email"
                            placeholder="Email address"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide a valid email address.
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-4" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <InputGroup hasValidation>
                          <InputGroup.Text>
                            <FaLock />
                          </InputGroup.Text>
                          <Form.Control
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                          <Button 
                            variant="outline-secondary"
                            onClick={togglePasswordVisibility}
                          >
                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            Please enter your password.
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>

                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <Form.Check 
                          type="checkbox"
                          id="remember-me"
                          label="Remember me"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          className="auth-checkbox"
                        />
                        <Link to="/forgot-password" className="forgot-password">
                          Forgot Password?
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="d-grid">
                        <AuthButton 
                          text="Log In"
                          className="btn btn-primary py-2"
                          type="submit"
                        />
                      </div>
                    </div>
                  </Form>

                  <div className="text-center mt-4">
                    <p className="mb-0">
                      Don't have an account?{" "}
                      <Link to="/signup" className="text-primary fw-medium">Create an account</Link>
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

export default Login;