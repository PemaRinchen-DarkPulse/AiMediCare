import React, { useState } from 'react';
import { Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  FaUserAlt, FaStethoscope, FaPrescriptionBottleAlt,
  FaVideo, FaCalendarAlt, FaClipboardList,
  FaChartLine, FaDatabase, FaNotesMedical, FaBrain, FaHeartbeat,
  FaPills, FaPhoneAlt, FaBell
} from 'react-icons/fa';

const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <Card className="h-100 border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-center">
            <div className="feature-icon bg-primary bg-opacity-10 text-primary rounded-circle mb-4 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px', minWidth: '70px' }}>
              {icon}
            </div>
          </div>
          <Card.Title className="mb-3 text-center">{title}</Card.Title>
          <Card.Text className="text-muted text-center">{description}</Card.Text>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const [key, setKey] = useState('patients');

  const patientFeatures = [
    {
      icon: <FaVideo size={24} />,
      title: "Virtual Consultations",
      description: "Connect with healthcare providers via secure HD video from the comfort of your home.",
      delay: 0.1
    },
    {
      icon: <FaCalendarAlt size={24} />,
      title: "Smart Appointment Scheduling",
      description: "Convenient scheduling that finds the perfect time slot for patients and doctors.",
      delay: 0.2
    },
    {
      icon: <FaClipboardList size={24} />,
      title: "Pre-visit Questionnaires",
      description: "Complete preliminary assessments prior to appointments to maximize consultation time.",
      delay: 0.3
    },
    {
      icon: <FaChartLine size={24} />,
      title: "Health Analytics",
      description: "Track your health insights and trends based on your medical history and current condition.",
      delay: 0.4
    }
  ];

  const doctorFeatures = [
    {
      icon: <FaDatabase size={24} />,
      title: "EHR Integration",
      description: "Seamlessly access and update electronic health records during consultations.",
      delay: 0.1
    },
    {
      icon: <FaNotesMedical size={24} />,
      title: "Clinical Decision Support",
      description: "Get real-time clinical insights and treatment recommendations based on patient data.",
      delay: 0.2
    },
    {
      icon: <FaHeartbeat size={24} />,
      title: "Chronic Disease Management",
      description: "Tools to monitor and manage patients with chronic conditions.",
      delay: 0.3
    }
  ];

  const pharmacistFeatures = [
    {
      icon: <FaPrescriptionBottleAlt size={24} />,
      title: "Prescription Management",
      description: "Prescription validation and medication interaction checks.",
      delay: 0.1
    },
    {
      icon: <FaPhoneAlt size={24} />,
      title: "Telepharmacy Services",
      description: "Provide medication consultations remotely through secure video channels.",
      delay: 0.2
    },
    {
      icon: <FaBell size={24} />,
      title: "Medication Adherence Monitoring",
      description: "Track patient medication adherence and send personalized reminders.",
      delay: 0.3
    },
    {
      icon: <FaPills size={24} />,
      title: "Inventory Optimization",
      description: "AI-driven inventory management that predicts medication demand.",
      delay: 0.4
    }
  ];

  return (
    <div className="features-section py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <h6 className="text-primary fw-bold mb-3">OUR FEATURES</h6>
        <h2 className="display-5 fw-bold mb-4">AI-Powered Healthcare Solutions</h2>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
          Our platform offers specialized features for patients, healthcare providers, 
          and pharmacists to create a seamless healthcare ecosystem.
        </p>
      </motion.div>

      <Tab.Container id="features-tabs" activeKey={key} onSelect={(k) => setKey(k)}>
        <Nav variant="pills" className="flex-column flex-md-row justify-content-center mb-5">
          <Nav.Item>
            <Nav.Link 
              eventKey="patients" 
              className="mx-2 mb-2 mb-md-0 text-center px-4"
            >
              <FaUserAlt className="me-2" /> For Patients
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              eventKey="doctors" 
              className="mx-2 mb-2 mb-md-0 text-center px-4"
            >
              <FaStethoscope className="me-2" /> For Doctors
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              eventKey="pharmacists" 
              className="mx-2 mb-2 mb-md-0 text-center px-4"
            >
              <FaPrescriptionBottleAlt className="me-2" /> For Pharmacists
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          <Tab.Pane eventKey="patients">
            <Row xs={1} md={2} lg={3} className="g-4">
              {patientFeatures.map((feature, index) => (
                <Col key={index}>
                  <FeatureCard {...feature} />
                </Col>
              ))}
            </Row>
          </Tab.Pane>
          
          <Tab.Pane eventKey="doctors">
            <Row xs={1} md={2} lg={4} className="g-4">
              {doctorFeatures.map((feature, index) => (
                <Col key={index}>
                  <FeatureCard {...feature} />
                </Col>
              ))}
            </Row>
          </Tab.Pane>
          
          <Tab.Pane eventKey="pharmacists">
            <Row xs={1} md={2} lg={4} className="g-4">
              {pharmacistFeatures.map((feature, index) => (
                <Col key={index}>
                  <FeatureCard {...feature} />
                </Col>
              ))}
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default FeaturesSection;
