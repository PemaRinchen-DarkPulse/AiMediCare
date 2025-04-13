import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  FaBullseye, FaClock, FaGlobeAmericas, FaChartLine, 
  FaShieldAlt, FaUserMd 
} from 'react-icons/fa';

const benefitItems = [
  {
    icon: <FaBullseye size={36} className="text-primary" />,
    title: "Improved Accuracy",
    description: "AI-powered diagnostics assist healthcare providers with evidence-based insights, reducing misdiagnosis by up to 40% compared to traditional methods.",
    delay: 0.1
  },
  {
    icon: <FaClock size={36} className="text-primary" />,
    title: "Time Savings",
    description: "Automated processes and AI-driven pre-visit triaging save an average of 15 minutes per consultation, allowing providers to focus more on patient care.",
    delay: 0.2
  },
  {
    icon: <FaGlobeAmericas size={36} className="text-primary" />,
    title: "Enhanced Accessibility",
    description: "Our telehealth platform removes geographical barriers, providing healthcare access to remote communities and mobility-challenged individuals.",
    delay: 0.3
  },
  {
    icon: <FaChartLine size={36} className="text-primary" />,
    title: "Better Outcomes",
    description: "Predictive analytics identify potential health issues before they become serious, leading to improved patient outcomes and reduced hospitalization rates.",
    delay: 0.4
  },
  {
    icon: <FaShieldAlt size={36} className="text-primary" />,
    title: "Data Security",
    description: "Advanced encryption and AI-powered security protocols ensure all patient data and virtual consultations remain private and HIPAA-compliant.",
    delay: 0.5
  },
  {
    icon: <FaUserMd size={36} className="text-primary" />,
    title: "Personalized Care",
    description: "AI algorithms analyze patient history and current symptoms to create individualized treatment plans that adapt over time.",
    delay: 0.6
  }
];

const BenefitsSection = () => {
  return (
    <div className="benefits-section py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <h6 className="text-primary fw-bold mb-3">WHY CHOOSE US</h6>
        <h2 className="display-5 fw-bold mb-4">Benefits of AI-Enhanced Telehealth</h2>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
          Our AI-powered platform revolutionizes healthcare delivery, providing benefits that traditional telehealth solutions cannot match.
        </p>
      </motion.div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {benefitItems.map((benefit, index) => (
          <Col key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: benefit.delay }}
              viewport={{ once: true }}
              className="h-100"
            >
              <div className="benefit-card h-100 p-4 rounded-4 bg-white shadow-sm">
                <div className="benefit-icon mb-4 p-3 rounded-circle bg-primary bg-opacity-10 d-inline-flex">
                  {benefit.icon}
                </div>
                <h4 className="mb-3">{benefit.title}</h4>
                <p className="text-muted mb-0">{benefit.description}</p>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        viewport={{ once: true }}
        className="text-center mt-5 pt-4"
      >
        <div className="p-4 p-md-5 rounded-4 bg-primary text-white">
          <h3 className="mb-4">Experience the Future of Healthcare</h3>
          <p className="lead mb-4">
            Our AI-powered telehealth platform doesn't just connect you to healthcare providers; it transforms how healthcare is delivered.
          </p>
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
            <div className="stat-item p-3">
              <h2 className="display-5 fw-bold">93%</h2>
              <p className="mb-0">Patient Satisfaction</p>
            </div>
            <div className="stat-item p-3">
              <h2 className="display-5 fw-bold">45%</h2>
              <p className="mb-0">Faster Diagnosis</p>
            </div>
            <div className="stat-item p-3">
              <h2 className="display-5 fw-bold">72%</h2>
              <p className="mb-0">Cost Reduction</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BenefitsSection;
