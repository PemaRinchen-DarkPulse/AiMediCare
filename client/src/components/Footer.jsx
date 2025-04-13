import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export const Footer = () => {
  return (
    <Container>
      <Row className="mb-4">
        <Col md={4} className="mb-4 mb-md-0">
          <h5 className="text-white mb-4">AiMediCare</h5>
          <p className="text-muted">
            Transforming healthcare delivery with AI-powered telehealth solutions
            connecting patients, doctors, and pharmacists in a seamless digital ecosystem.
          </p>
          <div className="d-flex mt-4">
            <a href="#!" className="text-white me-3">
              <FaFacebook size={20} />
            </a>
            <a href="#!" className="text-white me-3">
              <FaTwitter size={20} />
            </a>
            <a href="#!" className="text-white me-3">
              <FaInstagram size={20} />
            </a>
            <a href="#!" className="text-white">
              <FaLinkedin size={20} />
            </a>
          </div>
        </Col>
        
        <Col md={2} className="mb-4 mb-md-0">
          <h5 className="text-white mb-4">Links</h5>
          <ul className="list-unstyled">
            <li className="mb-2"><a href="#hero" className="text-muted text-decoration-none">Home</a></li>
            <li className="mb-2"><a href="#features" className="text-muted text-decoration-none">Features</a></li>
            <li className="mb-2"><a href="#benefits" className="text-muted text-decoration-none">Benefits</a></li>
            <li className="mb-2"><a href="#how-it-works" className="text-muted text-decoration-none">How It Works</a></li>
          </ul>
        </Col>
        
        <Col md={3} className="mb-4 mb-md-0">
          <h5 className="text-white mb-4">Contact Us</h5>
          <div className="d-flex align-items-center mb-3">
            <FaMapMarkerAlt className="text-primary me-3" />
            <span className="text-muted">123 Health Street, MediCity, MC 10001</span>
          </div>
          <div className="d-flex align-items-center mb-3">
            <FaPhone className="text-primary me-3" />
            <span className="text-muted">+1 (800) MEDICARE</span>
          </div>
          <div className="d-flex align-items-center mb-3">
            <FaEnvelope className="text-primary me-3" />
            <span className="text-muted">contact@aimedicare.com</span>
          </div>
        </Col>
        
        <Col md={3}>
          <h5 className="text-white mb-4">Newsletter</h5>
          <p className="text-muted">Subscribe to our newsletter for updates</p>
          <Form className="mt-3">
            <Form.Group className="mb-2">
              <Form.Control type="email" placeholder="Your email" required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Subscribe
            </Button>
          </Form>
        </Col>
      </Row>
      
      <hr className="bg-secondary" />
      
      <Row className="mt-3">
        <Col sm={6} className="text-center text-sm-start">
          <p className="text-muted mb-0">&copy; {new Date().getFullYear()} AiMediCare. All rights reserved.</p>
        </Col>
        <Col sm={6} className="text-center text-sm-end mt-2 mt-sm-0">
          <a href="#!" className="text-muted me-3 text-decoration-none">Privacy Policy</a>
          <a href="#!" className="text-muted me-3 text-decoration-none">Terms of Service</a>
          <a href="#!" className="text-muted text-decoration-none">Cookie Policy</a>
        </Col>
      </Row>
    </Container>
  );
};