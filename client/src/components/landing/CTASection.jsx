import React, { useState } from 'react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaEnvelope, FaUser, FaPhone, FaComment } from 'react-icons/fa';

const CTASection = () => {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    userType: 'patient'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Here you would typically handle the form submission to your backend
      alert('Form submitted successfully! We will contact you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        userType: 'patient'
      });
    }
    
    setValidated(true);
  };

  return (
    <div className="cta-section">
      <Row className="align-items-center">
        <Col lg={5} className="mb-5 mb-lg-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="display-4 fw-bold mb-4">Ready to Transform Your Healthcare Experience?</h2>
            <p className="lead mb-4">
              Join thousands of patients, doctors, and pharmacists who are already benefiting from our AI-powered telehealth platform. Get started today and experience healthcare like never before.
            </p>
            <ul className="list-unstyled mb-5">
              <li className="mb-3 d-flex align-items-center">
                <div className="bg-white p-2 rounded-circle me-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4361EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>No complicated setup process</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <div className="bg-white p-2 rounded-circle me-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4361EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>14-day free trial, no credit card required</span>
              </li>
              <li className="d-flex align-items-center">
                <div className="bg-white p-2 rounded-circle me-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#4361EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>24/7 technical support and assistance</span>
              </li>
            </ul>
            <div className="d-flex flex-wrap gap-3">
              <a href="#pricing" className="btn btn-primary btn-lg px-5 py-3">
                View Plans
              </a>
              <a href="#how-it-works" className="btn btn-outline-light btn-lg px-5 py-3">
                Learn More
              </a>
            </div>
          </motion.div>
        </Col>
        
        <Col lg={1} className="d-none d-lg-block">
          <div className="vr h-100 mx-auto"></div>
        </Col>
        
        <Col lg={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-white p-4 p-lg-5 rounded-4 shadow">
              <h3 className="mb-4 text-center text-dark">Contact Us</h3>
              <p className="text-muted text-center mb-4">
                Have questions? Fill out the form below and our team will get back to you shortly.
              </p>
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-dark">I am a:</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      id="patient"
                      name="userType"
                      value="patient"
                      label="Patient"
                      checked={formData.userType === 'patient'}
                      onChange={handleChange}
                      className="text-dark"
                    />
                    <Form.Check
                      inline
                      type="radio"
                      id="doctor"
                      name="userType"
                      value="doctor"
                      label="Doctor"
                      checked={formData.userType === 'doctor'}
                      onChange={handleChange}
                      className="text-dark"
                    />
                    <Form.Check
                      inline
                      type="radio"
                      id="pharmacist"
                      name="userType"
                      value="pharmacist"
                      label="Pharmacist"
                      checked={formData.userType === 'pharmacist'}
                      onChange={handleChange}
                      className="text-dark"
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label className="text-dark">Full Name</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>
                      <FaUser />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide your name.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label className="text-dark">Email Address</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>
                      <FaEnvelope />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid email.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label className="text-dark">Phone Number (Optional)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaPhone />
                    </InputGroup.Text>
                    <Form.Control
                      type="tel"
                      placeholder="Enter your phone number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </InputGroup>
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="formMessage">
                  <Form.Label className="text-dark">Message</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>
                      <FaComment />
                    </InputGroup.Text>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="How can we help you?"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter your message.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                
                <div className="text-center">
                  <Button variant="primary" type="submit" className="btn-lg px-5 py-3">
                    Send Message
                  </Button>
                </div>
              </Form>
            </div>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default CTASection;
