import React from 'react';
import { Container, Row, Col, Carousel, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      image: 'https://placehold.co/100x100/4361ee/ffffff?text=SJ',
      testimonial: 'AiMediCare has completely transformed how I manage my chronic condition. The AI symptom checker accurately identified warning signs before my scheduled appointment, and my doctor was able to adjust my medication immediately through a virtual consultation. I no longer need to take time off work for routine check-ups!',
      rating: 5
    },
    {
      name: 'Dr. Michael Richards',
      role: 'Cardiologist',
      image: 'https://placehold.co/100x100/4361ee/ffffff?text=MR',
      testimonial: 'As a specialist, I\'ve been impressed with the AI diagnostic support that AiMediCare provides. It helps me make more informed decisions by analyzing patterns in patient data that might otherwise be missed. The platform has streamlined my workflow and allowed me to see more patients while providing better quality care.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Patient',
      image: 'https://placehold.co/100x100/4361ee/ffffff?text=ER',
      testimonial: 'Living in a rural area used to mean traveling hours to see specialists. With AiMediCare, I can connect with top doctors from across the country. The AI health monitoring tools have been invaluable for managing my diabetes, and I appreciate receiving medication reminders directly to my phone.',
      rating: 5
    },
    {
      name: 'Dr. Priya Sharma',
      role: 'Pediatrician',
      image: 'https://placehold.co/100x100/4361ee/ffffff?text=PS',
      testimonial: 'The AiMediCare platform has made it much easier to provide care to my young patients. Parents appreciate the convenience of virtual consultations for minor issues, and the AI pre-screening helps me prepare better for each appointment. The platform is intuitive and reliable, even during peak hours.',
      rating: 4
    },
    {
      name: 'Thomas Wang',
      role: 'Pharmacist',
      image: 'https://placehold.co/100x100/4361ee/ffffff?text=TW',
      testimonial: 'The integration between doctors and pharmacists on this platform is seamless. I receive digital prescriptions instantly and can verify them against potential interactions using the AI tool. Being able to conduct video consultations with patients about their medications has significantly improved adherence rates.',
      rating: 5
    },
    {
      name: 'Maria Gonzalez',
      role: 'Patient',
      image: 'https://placehold.co/100x100/4361ee/ffffff?text=MG',
      testimonial: 'As someone who suffers from anxiety, being able to see my therapist from the comfort of my home has been life-changing. The platform is secure and private, and the AI mood tracking feature helps both me and my doctor monitor my progress between appointments.',
      rating: 5
    }
  ];

  const renderStars = (rating) => {
    return Array(5)
      .fill()
      .map((_, index) => (
        <FaStar 
          key={index} 
          className={index < rating ? 'text-warning' : 'text-muted'}
        />
      ));
  };

  return (
    <div className="testimonials-section py-5 bg-light">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h6 className="text-primary fw-bold mb-3">TESTIMONIALS</h6>
          <h2 className="display-5 fw-bold mb-4">What Our Users Say</h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
            Don't just take our word for it. See what patients, doctors, and pharmacists have to say about their experience with AiMediCare.
          </p>
        </motion.div>

        <Row>
          <Col lg={10} className="mx-auto">
            <Carousel 
              controls={true} 
              indicators={true}
              interval={5000}
              pause="hover"
              className="testimonial-carousel"
            >
              {testimonials.map((testimonial, index) => (
                <Carousel.Item key={index}>
                  <Card className="border-0 shadow-sm mx-4 mx-md-5 mb-5">
                    <Card.Body className="p-4 p-lg-5">
                      <Row className="align-items-center">
                        <Col md={4} className="text-center mb-4 mb-md-0">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name}
                            className="rounded-circle mb-3"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <h5 className="fw-bold mb-1">{testimonial.name}</h5>
                          <p className="text-primary mb-2">{testimonial.role}</p>
                          <div className="d-flex justify-content-center">
                            {renderStars(testimonial.rating)}
                          </div>
                        </Col>
                        <Col md={8}>
                          <div className="position-relative">
                            <FaQuoteLeft 
                              className="text-primary opacity-25" 
                              size={42} 
                              style={{ position: 'absolute', top: -10, left: -10 }}
                            />
                            <p className="fs-5 ms-4 mt-3 text-muted">
                              "{testimonial.testimonial}"
                            </p>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <div className="d-inline-flex align-items-center p-3 rounded-4 bg-white shadow-sm">
            <div className="d-flex">
              <img 
                src="https://placehold.co/35x35/4361ee/ffffff?text=⭐" 
                alt="Rating" 
                className="rounded-circle"
              />
              <img 
                src="https://placehold.co/35x35/4361ee/ffffff?text=⭐" 
                alt="Rating" 
                className="rounded-circle ms-n2"
              />
              <img 
                src="https://placehold.co/35x35/4361ee/ffffff?text=⭐" 
                alt="Rating" 
                className="rounded-circle ms-n2"
              />
            </div>
            <div className="ms-3">
              <span className="text-dark fw-bold">4.9/5 rating</span>
              <span className="text-muted ms-2">based on 2,500+ reviews</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TestimonialsSection;