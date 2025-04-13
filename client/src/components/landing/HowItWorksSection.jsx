import React, { useState } from 'react';
import { Row, Col, Tab, Nav, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  FaUserAlt, FaStethoscope, FaPrescriptionBottleAlt,
  FaSignInAlt, FaCalendarAlt, FaVideo, FaNotesMedical,
  FaClipboardCheck, FaLaptopMedical, FaFileMedical,
  FaPhoneAlt, FaPills, FaClipboardList
} from 'react-icons/fa';

const StepCard = ({ number, title, description, icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <Card className="border-0 shadow-sm h-100 position-relative">
        <div className="position-absolute top-0 start-0 translate-middle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', zIndex: 1 }}>
          <span>{number}</span>
        </div>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-4">
            <div className="me-3 p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
              {icon}
            </div>
            <h5 className="mb-0">{title}</h5>
          </div>
          <p className="text-muted mb-0">{description}</p>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

const HowItWorksSection = () => {
  const [activeKey, setActiveKey] = useState('patients');

  const patientSteps = [
    {
      number: 1,
      title: "Create an Account",
      description: "Sign up for an AiMediCare account with your basic information and set up your health profile.",
      icon: <FaSignInAlt size={24} />,
      delay: 0.1
    },
    {
      number: 2,
      title: "Book an Appointment",
      description: "Use our AI-powered scheduling system to find the perfect time slot with the right healthcare provider.",
      icon: <FaCalendarAlt size={24} />,
      delay: 0.2
    },
    {
      number: 3,
      title: "Complete Pre-Visit Assessment",
      description: "Fill out the AI-guided symptom checker to help physicians prepare for your consultation.",
      icon: <FaClipboardList size={24} />,
      delay: 0.3
    },
    {
      number: 4,
      title: "Attend Virtual Consultation",
      description: "Connect with your healthcare provider through our secure HD video platform from any device.",
      icon: <FaVideo size={24} />,
      delay: 0.4
    },
    {
      number: 5,
      title: "Receive Treatment Plan",
      description: "Get a personalized treatment plan and digital prescription if needed right in your patient portal.",
      icon: <FaNotesMedical size={24} />,
      delay: 0.5
    }
  ];

  const doctorSteps = [
    {
      number: 1,
      title: "Register as Provider",
      description: "Complete our verification process to join our network of certified healthcare providers.",
      icon: <FaSignInAlt size={24} />,
      delay: 0.1
    },
    {
      number: 2,
      title: "Set Availability",
      description: "Define your working hours and preferences in our intelligent scheduling system.",
      icon: <FaCalendarAlt size={24} />,
      delay: 0.2
    },
    {
      number: 3,
      title: "Review Patient Information",
      description: "Get access to patient pre-visit assessments and medical history before consultations.",
      icon: <FaClipboardCheck size={24} />,
      delay: 0.3
    },
    {
      number: 4,
      title: "Conduct Virtual Consultation",
      description: "Use our advanced telehealth platform with integrated AI diagnostic assistance.",
      icon: <FaLaptopMedical size={24} />,
      delay: 0.4
    },
    {
      number: 5,
      title: "Issue Digital Prescriptions",
      description: "Create and send digital prescriptions directly to patients or their preferred pharmacy.",
      icon: <FaFileMedical size={24} />,
      delay: 0.5
    }
  ];

  const pharmacistSteps = [
    {
      number: 1,
      title: "Join Pharmacy Network",
      description: "Register your pharmacy to receive digital prescriptions from doctors on our platform.",
      icon: <FaSignInAlt size={24} />,
      delay: 0.1
    },
    {
      number: 2,
      title: "Receive Digital Prescriptions",
      description: "Get instant notifications when doctors issue prescriptions to your pharmacy.",
      icon: <FaFileMedical size={24} />,
      delay: 0.2
    },
    {
      number: 3,
      title: "Verify Prescriptions",
      description: "Use our AI-powered validation tool to check for interactions and contraindications.",
      icon: <FaClipboardCheck size={24} />,
      delay: 0.3
    },
    {
      number: 4,
      title: "Provide Telepharmacy Consultation",
      description: "Connect with patients through secure video to explain medication usage and answer questions.",
      icon: <FaPhoneAlt size={24} />,
      delay: 0.4
    },
    {
      number: 5,
      title: "Monitor Medication Adherence",
      description: "Track patient medication usage and send smart reminders to improve adherence.",
      icon: <FaPills size={24} />,
      delay: 0.5
    }
  ];

  return (
    <div className="how-it-works-section py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <h6 className="text-primary fw-bold mb-3">HOW IT WORKS</h6>
        <h2 className="display-5 fw-bold mb-4">Getting Started Is Easy</h2>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
          Our platform is designed to be intuitive and user-friendly, with specialized workflows for patients, doctors, and pharmacists.
        </p>
      </motion.div>

      <Tab.Container activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
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
            <div className="position-relative">
              <div className="progress-line position-absolute" style={{ left: '18px', top: '40px', bottom: '40px', width: '2px', backgroundColor: '#dee2e6', zIndex: 0 }}></div>
              <Row xs={1} md={2} className="g-4 position-relative">
                {patientSteps.map((step, index) => (
                  <Col key={index}>
                    <StepCard {...step} />
                  </Col>
                ))}
              </Row>
            </div>
          </Tab.Pane>
          
          <Tab.Pane eventKey="doctors">
            <div className="position-relative">
              <div className="progress-line position-absolute" style={{ left: '18px', top: '40px', bottom: '40px', width: '2px', backgroundColor: '#dee2e6', zIndex: 0 }}></div>
              <Row xs={1} md={2} className="g-4 position-relative">
                {doctorSteps.map((step, index) => (
                  <Col key={index}>
                    <StepCard {...step} />
                  </Col>
                ))}
              </Row>
            </div>
          </Tab.Pane>
          
          <Tab.Pane eventKey="pharmacists">
            <div className="position-relative">
              <div className="progress-line position-absolute" style={{ left: '18px', top: '40px', bottom: '40px', width: '2px', backgroundColor: '#dee2e6', zIndex: 0 }}></div>
              <Row xs={1} md={2} className="g-4 position-relative">
                {pharmacistSteps.map((step, index) => (
                  <Col key={index}>
                    <StepCard {...step} />
                  </Col>
                ))}
              </Row>
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default HowItWorksSection;
