import React, { useState } from 'react';
import { FaVideo, FaCommentMedical, FaPhoneAlt, FaMedkit, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState('video');

  const featuresData = {
    video: {
      icon: <FaVideo />,
      title: 'Virtual Consultation via Video',
      description: 'Connect with doctors face-to-face from the comfort of your home. Get real-time diagnosis and personalized advice.',
      image: 'https://source.unsplash.com/600x400/?telemedicine'
    },
    chat: {
      icon: <FaCommentMedical />,
      title: 'Instant Chat with Specialists',
      description: 'Get quick answers and medical advice through secure chat. Perfect for follow-up questions and minor concerns.',
      image: 'https://source.unsplash.com/600x400/?online,chat'
    },
    phone: {
      icon: <FaPhoneAlt />,
      title: 'Talk to a Doctor Over the Phone',
      description: 'Speak directly with healthcare professionals for immediate assistance and support.',
      image: 'https://source.unsplash.com/600x400/?phone,medical'
    },
    symptomChecker: {
      icon: <FaMedkit />,
      title: 'AI Symptom Checker',
      description: 'Use our intelligent symptom checker to understand your symptoms and find the right care.',
      image: 'https://source.unsplash.com/600x400/?ai,diagnosis'
    },
    analytics: {
      icon: <FaChartLine />,
      title: 'Health Analytics Dashboard',
      description: 'Track your health data and gain insights into your well-being with our comprehensive analytics dashboard.',
      image: 'https://source.unsplash.com/600x400/?health,analytics'
    }
  };

  return (
    <section id="features" className="features-section">
      <h2>Key Features</h2>
      <div className="features-tabs">
        {Object.keys(featuresData).map(key => (
          <button
            key={key}
            className={`feature-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {featuresData[key].icon} {featuresData[key].title}
          </button>
        ))}
      </div>
      <div className="feature-content">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="feature-details"
        >
          <h3>{featuresData[activeTab].title}</h3>
          <p>{featuresData[activeTab].description}</p>
          <img src={featuresData[activeTab].image} alt={featuresData[activeTab].title} loading="lazy" />
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
