import React from 'react';
import { Accordion, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';

const FAQSection = () => {
  const faqItems = [
    {
      category: 'General',
      questions: [
        {
          question: 'What is AiMediCare?',
          answer: 'AiMediCare is an AI-powered telehealth platform that connects patients with doctors and pharmacists through virtual consultations. Our platform leverages artificial intelligence to enhance healthcare delivery, making quality healthcare accessible anytime, anywhere.'
        },
        {
          question: 'How does the AI technology work?',
          answer: 'Our AI technology analyzes symptoms, medical history, and the latest clinical research to assist healthcare providers in making more accurate diagnoses. It also powers features like automated scheduling, pre-visit triaging, and personalized health recommendations, all while maintaining strict privacy and security standards.'
        },
        {
          question: 'Is my data secure on the platform?',
          answer: 'Yes, we take security very seriously. AiMediCare implements bank-level encryption, complies with all HIPAA regulations, and follows industry best practices for healthcare data security. Your personal and medical information is never shared without your explicit consent.'
        }
      ]
    },
    {
      category: 'For Patients',
      questions: [
        {
          question: 'How do I schedule a consultation?',
          answer: 'You can schedule a consultation directly through your patient dashboard. Our AI-powered system will match you with appropriate healthcare providers based on your symptoms and preferences, and suggest available time slots that work for both you and the provider.'
        },
        {
          question: 'What conditions can be treated via telehealth?',
          answer: 'Many conditions can be effectively treated through telehealth, including common illnesses (cold, flu, allergies), skin conditions, mental health concerns, chronic disease management, and follow-up consultations. However, emergency conditions requiring immediate physical examination should be treated at an emergency room.'
        },
        {
          question: 'Are prescriptions available through the platform?',
          answer: 'Yes, healthcare providers on AiMediCare can issue digital prescriptions for appropriate medications, which can be sent directly to your preferred pharmacy. However, there are certain medications that cannot legally be prescribed via telehealth due to regulatory restrictions.'
        }
      ]
    },
    {
      category: 'For Healthcare Providers',
      questions: [
        {
          question: 'How do I join as a healthcare provider?',
          answer: 'Healthcare providers can apply through our provider portal. The process includes credential verification, license validation, and background checks to ensure the highest quality of care for our patients. Once approved, providers can set their availability and begin accepting virtual consultations.'
        },
        {
          question: 'What AI tools are available for providers?',
          answer: 'Providers have access to AI-assisted diagnostics, clinical decision support systems, EHR integration tools, and AI-powered documentation assistance. These tools are designed to enhance clinical judgment, not replace it, allowing providers to deliver more accurate and efficient care.'
        },
        {
          question: 'How does billing work for providers?',
          answer: 'Providers can bill through our integrated system, which supports various payment models including insurance billing, direct patient billing, and subscription-based care. Our platform handles the administrative aspects, allowing providers to focus more on patient care.'
        }
      ]
    },
    {
      category: 'For Pharmacists',
      questions: [
        {
          question: 'How do digital prescriptions work?',
          answer: 'Digital prescriptions are securely transmitted from healthcare providers to participating pharmacies through our platform. Pharmacists receive notifications for new prescriptions and can verify them using our AI-powered validation tool that checks for potential drug interactions and contraindications.'
        },
        {
          question: 'Can pharmacists communicate with patients and doctors?',
          answer: 'Yes, our platform facilitates secure communication between pharmacists, patients, and doctors. Pharmacists can conduct telepharmacy consultations to provide medication guidance and answer questions, as well as communicate with prescribers about any concerns or clarifications needed.'
        }
      ]
    },
    {
      category: 'Technical & Support',
      questions: [
        {
          question: 'What devices and browsers are supported?',
          answer: 'AiMediCare works on most modern devices including smartphones, tablets, laptops, and desktop computers. We support the latest versions of Chrome, Firefox, Safari, and Edge browsers. For the best experience, we recommend using a device with a camera and microphone for video consultations.'
        },
        {
          question: 'What if I experience technical issues during a consultation?',
          answer: 'If you experience technical issues during a consultation, our system automatically attempts to reconnect. If problems persist, you can switch to audio-only mode or reschedule your appointment without additional charges. Our technical support team is available 24/7 to assist with any issues.'
        },
        {
          question: 'How can I get support for billing or account issues?',
          answer: 'You can contact our support team via email at support@aimedicare.com, through the in-app chat feature, or by calling our customer service line at 1-800-MEDICARE during business hours. Most billing and account issues can also be resolved through the self-service options in your account dashboard.'
        }
      ]
    }
  ];

  return (
    <div className="faq-section py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center mb-5"
      >
        <h6 className="text-primary fw-bold mb-3">FAQ</h6>
        <h2 className="display-5 fw-bold mb-4">Frequently Asked Questions</h2>
        <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
          Find answers to common questions about our AI-powered telehealth platform.
        </p>
      </motion.div>

      <Row className="g-4">
        {faqItems.map((category, categoryIndex) => (
          <Col md={6} key={categoryIndex}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * categoryIndex }}
              viewport={{ once: true }}
            >
              <h4 className="mb-4">{category.category}</h4>
              <Accordion defaultActiveKey="0" flush className="mb-5">
                {category.questions.map((faq, faqIndex) => (
                  <Accordion.Item key={faqIndex} eventKey={faqIndex.toString()}>
                    <Accordion.Header>
                      <span className="fw-medium">{faq.question}</span>
                    </Accordion.Header>
                    <Accordion.Body className="text-muted">
                      {faq.answer}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </motion.div>
          </Col>
        ))}
      </Row>

      <div className="text-center mt-5">
        <p className="mb-3">Still have questions?</p>
        <a href="#contact" className="btn btn-primary btn-lg px-5">Contact Us</a>
      </div>
    </div>
  );
};

export default FAQSection;
