import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PricingSection = () => {
  const [planType, setPlanType] = useState('individual');

  const individualPlans = [
    { id: 1, name: 'Basic', price: 'Free', features: ['AI Symptom Checker', 'Limited Consultations'] },
    { id: 2, name: 'Standard', price: '$19/month', features: ['Basic Features', 'Unlimited Consultations', 'Prescription Management'] },
  ];

  const familyPlans = [
    { id: 1, name: 'Family Basic', price: '$29/month', features: ['All Basic Features', 'Up to 4 Family Members'] },
    { id: 2, name: 'Family Premium', price: '$49/month', features: ['All Standard Features', 'Priority Support', 'Health Analytics'] },
  ];

  const plans = planType === 'individual' ? individualPlans : familyPlans;

  return (
    <section id="pricing" className="pricing-section">
      <h2>Pricing & Plans</h2>
      <div className="plan-toggle">
        <button
          className={`toggle-button ${planType === 'individual' ? 'active' : ''}`}
          onClick={() => setPlanType('individual')}
        >
          Individual
        </button>
        <button
          className={`toggle-button ${planType === 'family' ? 'active' : ''}`}
          onClick={() => setPlanType('family')}
        >
          Family
        </button>
      </div>
      <div className="pricing-table">
        {plans.map(plan => (
          <motion.div
            key={plan.id}
            className="plan-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: plan.id * 0.2 }}
          >
            <h3>{plan.name}</h3>
            <span className="price">{plan.price}</span>
            <ul>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button className="cta-button">Get Started</button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
