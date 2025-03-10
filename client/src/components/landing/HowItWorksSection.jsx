import React from 'react';
import { motion } from 'framer-motion';

const HowItWorksSection = () => {
  const steps = [
    { id: 1, title: 'Sign Up', description: 'Create your account in minutes.' },
    { id: 2, title: 'Describe Symptoms', description: 'Use our AI symptom checker.' },
    { id: 3, title: 'Consult a Doctor', description: 'Connect with a doctor via video, chat, or phone.' },
    { id: 4, title: 'Get Treatment', description: 'Receive personalized treatment and prescriptions.' },
  ];

  return (
    <section id="how-it-works" className="how-it-works-section">
      <h2>How It Works</h2>
      <div className="journey-map">
        {steps.map(step => (
          <motion.div
            key={step.id}
            className="step"
            initial={{ opacity: 0, x: step.id % 2 === 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: step.id * 0.2 }}
          >
            <span className="step-number">{step.id}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
