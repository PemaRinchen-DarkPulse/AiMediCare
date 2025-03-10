import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LoginSection = () => {
  return (
    <section id="login" className="login-section">
      <h2>Already have an account?</h2>
      <p>Login to access your AI-powered telehealth services.</p>
      <motion.div
        className="login-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/login" className="cta-button">
          Login
        </Link>
      </motion.div>
    </section>
  );
};

export default LoginSection;
