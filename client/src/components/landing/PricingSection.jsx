import React, { useState } from 'react';
import { Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';

const PricingSection = () => {
  const [billingInterval, setBillingInterval] = useState('monthly');

  const pricingPlans = [
    {
      title: 'Basic',
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      description: 'Perfect for individuals looking for essential telehealth services',
      features: [
        'Unlimited access to AI symptom checker',
        'Up to 2 virtual consultations per month',
        'Basic health analytics',
        'Secure medical records storage',
        'Email support'
      ],
      recommended: false,
      buttonVariant: 'outline-primary'
    },
    {
      title: 'Premium',
      monthlyPrice: 24.99,
      yearlyPrice: 249.99,
      description: 'Comprehensive healthcare coverage for individuals and families',
      features: [
        'All Basic plan features',
        'Unlimited virtual consultations',
        'Priority scheduling',
        'Advanced AI health analytics',
        'Family members (up to 4)',
        '24/7 phone & email support'
      ],
      recommended: true,
      buttonVariant: 'primary'
    },
    {
      title: 'Enterprise',
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      description: 'Tailored solutions for healthcare providers and organizations',
      features: [
        'All Premium plan features',
        'Custom EHR integration',
        'Advanced AI diagnostic tools',
        'Analytics dashboard',
        'Dedicated account manager',
        'Custom API access',
        'Premium SLA'
      ],
      recommended: false,
      buttonVariant: 'outline-primary'
    }
  ];

  return (
    <div className="pricing-section py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <h6 className="text-primary fw-bold mb-3">PRICING</h6>
        <h2 className="display-5 fw-bold mb-4">Choose Your Plan</h2>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
          Flexible pricing options designed to provide access to AI-powered healthcare for everyone.
          Start with a 14-day free trial - no credit card required.
        </p>
      </motion.div>

      <div className="text-center mb-5">
        <Form>
          <div className="d-inline-flex align-items-center border rounded-pill p-1 bg-light">
            <Form.Check
              type="radio"
              id="monthly"
              name="billingInterval"
              className="invisible position-absolute"
              checked={billingInterval === 'monthly'}
              onChange={() => setBillingInterval('monthly')}
            />
            <label
              htmlFor="monthly"
              className={`px-4 py-2 rounded-pill mb-0 cursor-pointer ${
                billingInterval === 'monthly' ? 'bg-white shadow-sm' : ''
              }`}
              style={{ cursor: 'pointer' }}
            >
              Monthly
            </label>

            <Form.Check
              type="radio"
              id="yearly"
              name="billingInterval"
              className="invisible position-absolute"
              checked={billingInterval === 'yearly'}
              onChange={() => setBillingInterval('yearly')}
            />
            <label
              htmlFor="yearly"
              className={`px-4 py-2 rounded-pill mb-0 cursor-pointer ${
                billingInterval === 'yearly' ? 'bg-white shadow-sm' : ''
              }`}
              style={{ cursor: 'pointer' }}
            >
              Yearly <Badge bg="primary" className="ms-2">Save 15%</Badge>
            </label>
          </div>
        </Form>
      </div>

      <Row xs={1} md={3} className="g-4 justify-content-center">
        {pricingPlans.map((plan, index) => (
          <Col key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="h-100"
            >
              <Card 
                className={`h-100 border-0 shadow-sm ${
                  plan.recommended ? 'border border-primary shadow' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="position-absolute top-0 start-50 translate-middle">
                    <Badge bg="primary" className="py-2 px-3 rounded-pill">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card.Body className="p-4">
                  <div className="text-center mb-4 pb-3 border-bottom">
                    <h3 className="mb-2">{plan.title}</h3>
                    <p className="text-muted mb-3">{plan.description}</p>
                    <div className="d-flex justify-content-center align-items-baseline">
                      <span className="h3 fw-bold">$</span>
                      <span className="display-4 fw-bold">
                        {billingInterval === 'monthly'
                          ? plan.monthlyPrice
                          : plan.yearlyPrice}
                      </span>
                      <span className="text-muted ms-2">
                        / {billingInterval === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                  </div>

                  <ul className="list-unstyled mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="d-flex align-items-center mb-3">
                        <FaCheck className="text-primary me-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-center mt-auto">
                    <Button 
                      variant={plan.buttonVariant} 
                      size="lg" 
                      className="w-100 py-3"
                    >
                      Start Free Trial
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <div className="text-center mt-5 text-muted">
        <p>All plans include a 14-day free trial. No credit card required to try.</p>
        <p>Looking for custom enterprise solutions? <a href="#contact" className="text-decoration-none">Contact our sales team</a>.</p>
      </div>
    </div>
  );
};

export default PricingSection;
