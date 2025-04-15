import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/AuthSlider.css';

const AuthSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Connect with every application.",
      description: "Everything you need in an easily customizable dashboard.",
      image: "/images/healthcare-illustration.svg",
      fallbackImage: "https://placehold.co/400x300?text=Healthcare+Connectivity"
    },
    {
      title: "Secure Telehealth Consultations",
      description: "Connect with healthcare professionals from the comfort of your home.",
      image: "/images/telehealth-illustration.svg",
      fallbackImage: "https://placehold.co/400x300?text=Telehealth+Services"
    },
    {
      title: "AI-Powered Health Insights",
      description: "Get personalized health recommendations based on your medical history.",
      image: "/images/ai-health-illustration.svg",
      fallbackImage: "https://placehold.co/400x300?text=AI+Health+Insights"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleImageError = (e) => {
    const index = parseInt(e.target.dataset.index);
    e.target.src = slides[index].fallbackImage;
  };

  return (
    <div className="auth-slider">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="slider-content"
        >
          <h2 className="slider-title">{slides[currentSlide].title}</h2>
          <p className="slider-description">{slides[currentSlide].description}</p>
          
          <div className="slider-image-container">
            <img 
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title}
              className="slider-image"
              data-index={currentSlide}
              onError={handleImageError}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthSlider;