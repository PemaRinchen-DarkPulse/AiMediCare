import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <div className="hero-section position-relative overflow-hidden bg-light py-5">
      <Container className="py-5">
        <Row className="align-items-center g-5">
          <Col lg={6} className="text-center text-lg-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="display-3 fw-bold mb-3">
                <span className="text-primary">AI-Powered</span> Healthcare at Your Fingertips
              </h1>
              
              <p className="lead mb-4">
                AiMediCare transforms traditional healthcare by connecting patients, 
                doctors, and pharmacists through our intelligent telehealth platform, 
                making quality healthcare accessible anytime, anywhere.
              </p>
              
              <div className="d-grid gap-3 d-md-flex justify-content-md-start mt-5">
                <Link to="/signup">
                  <Button variant="primary" size="lg" className="px-5 py-3">
                    Get Started
                  </Button>
                </Link>
                <Button variant="outline-secondary" size="lg" className="px-5 py-3" href="#how-it-works">
                  How It Works
                </Button>
              </div>
            </motion.div>
          </Col>
          
          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="position-relative"
            >
              <img 
                src="/src/assets/hero-image.png" 
                alt="Doctor consulting with patient via telehealth" 
                className="img-fluid rounded-4 shadow-lg" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x400/4361ee/ffffff?text=AI+Healthcare";
                }}
              />
              
              <div className="position-absolute top-0 start-0 translate-middle">
                <div className="bg-primary text-white rounded-circle p-3 shadow">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.5 8.25L12 15.75L4.5 8.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div className="position-absolute bottom-0 end-0 p-3 bg-white rounded-4 shadow-lg">
                <div className="d-flex align-items-center">
                  <div className="text-primary me-3">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h6 className="mb-0">AI-assisted</h6>
                    <p className="text-muted mb-0">Diagnostics</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>
        
        <Row className="mt-5 pt-4 justify-content-center">
          <Col md={10}>
            <motion.div 
              className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 p-4 bg-white rounded-4 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="text-center">
                <h4 className="fw-bold">10,000+</h4>
                <p className="text-muted mb-0">Satisfied Patients</p>
              </div>
              
              <div className="vr d-none d-md-block" style={{ height: '50px' }}></div>
              
              <div className="text-center">
                <h4 className="fw-bold">1,500+</h4>
                <p className="text-muted mb-0">Medical Professionals</p>
              </div>
              
              <div className="vr d-none d-md-block" style={{ height: '50px' }}></div>
              
              <div className="text-center">
                <h4 className="fw-bold">98%</h4>
                <p className="text-muted mb-0">Satisfaction Rate</p>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
      
      {/* Wave shape divider */}
      <div className="position-absolute bottom-0 left-0 w-100 overflow-hidden" style={{ transform: 'translateY(1px)' }}>
        <svg preserveAspectRatio="none" width="100%" height="50" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                fill="#ffffff"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
