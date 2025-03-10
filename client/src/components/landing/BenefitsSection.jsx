import React from 'react';
import { motion } from 'framer-motion';

const BenefitsSection = () => {
  const benefitsData = [
    { id: 1, stat: '70%', description: 'Time Saved on Appointments' },
    { id: 2, stat: '500+', description: 'Provider Network Size' },
    { id: 3, stat: '95%', description: 'Patient Satisfaction' },
  ];

  const testimonials = [
    { id: 1, name: 'Jane Doe', review: 'The AI symptom checker was incredibly helpful and accurate.' },
    { id: 2, name: 'John Smith', review: 'I love the convenience of virtual consultations. It saves me so much time!' },
  ];

  return (
    <section id="benefits" className="benefits-section">
      <h2>Unlock the Benefits of AI Telehealth</h2>
      <div className="stats-container">
        {benefitsData.map(benefit => (
          <motion.div
            key={benefit.id}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: benefit.id * 0.2 }}
          >
            <span className="stat">{benefit.stat}</span>
            <p className="stat-description">{benefit.description}</p>
          </motion.div>
        ))}
      </div>
      <div className="testimonials-carousel">
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className="testimonial">
            <p className="review">{testimonial.review}</p>
            <p className="name">- {testimonial.name}</p>
          </div>
        ))}
      </div>
      <div className="trust-indicators">
        <p><i className="fa fa-shield-alt"></i> HIPAA Compliant</p>
        <p><i className="fa fa-lock"></i> Data Protection Guaranteed</p>
      </div>
    </section>
  );
};

export default BenefitsSection;
