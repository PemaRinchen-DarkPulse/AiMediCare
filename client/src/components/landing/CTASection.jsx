import React from 'react';
import { motion } from 'framer-motion';

const CTASection = () => {
  return (
    <section id="cta" className="cta-section">
      <h2>Ready to Transform Your Healthcare Experience?</h2>
      <p>Sign up now and get access to AI-powered telehealth services.</p>
      <div className="cta-form">
        <input type="email" placeholder="Enter your email" />
        <button className="cta-button">Get Started</button>
      </div>
      <div className="cta-options">
        <p>Or, download our app or schedule a demo.</p>
      </div>
    </section>
  );
};

export default CTASection;
