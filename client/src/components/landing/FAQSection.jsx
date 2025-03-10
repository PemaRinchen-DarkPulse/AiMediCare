import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FAQSection = () => {
  const faqData = [
    { id: 1, question: 'What is AI Telehealth?', answer: 'AI Telehealth uses artificial intelligence to enhance remote healthcare services.' },
    { id: 2, question: 'How secure is my data?', answer: 'We use industry-leading security measures to protect your data and ensure HIPAA compliance.' },
  ];

  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const toggleQuestion = (id) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  return (
    <section id="faq" className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-accordion">
        {faqData.map(faq => (
          <motion.div
            key={faq.id}
            className="faq-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: faq.id * 0.2 }}
          >
            <div className="faq-question" onClick={() => toggleQuestion(faq.id)}>
              <h3>{faq.question}</h3>
              <span>{expandedQuestion === faq.id ? '-' : '+'}</span>
            </div>
            {expandedQuestion === faq.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="faq-answer"
              >
                <p>{faq.answer}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="faq-search">
        <input type="text" placeholder="Search questions..." />
      </div>
      <div className="faq-contact">
        <p>Still have questions? Contact us via chat or email.</p>
      </div>
    </section>
  );
};

export default FAQSection;
