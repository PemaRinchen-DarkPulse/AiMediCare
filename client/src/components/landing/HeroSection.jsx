import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section id="hero" className="hero-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-content"
      >
        <h1>AI-Powered Healthcare at Your Fingertips</h1>
        <p>Healthcare reimagined: Connect with doctors, manage prescriptions, and monitor your health—all in one intelligent platform</p>
        <Link to="/signup" className="cta-button">Get Started</Link>
      </motion.div>
      <div className="hero-image">
        <img 
          src="https://source.unsplash.com/600x400/?medical" 
          alt="AI Medicare Platform Demo"
          loading="lazy"
        />
      </div>
    </section>
  );
};

export default HeroSection;
