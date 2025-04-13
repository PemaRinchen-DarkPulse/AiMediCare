import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import '../styles/LandingPage.css';

// Import landing page components
import NavBar from '../components/landing/NavBar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import { Footer } from '../components/Footer';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('hero');

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'features', 'benefits', 'how-it-works', 'testimonials', 'faq'];
      const scrollPosition = window.scrollY + 100;

      // Find the current active section based on scroll position
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <NavBar activeSection={activeSection} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section id="hero">
          <HeroSection />
        </section>

        {/* Features Section */}
        <section id="features" className="py-5">
          <Container>
            <FeaturesSection />
          </Container>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-5 bg-light">
          <Container>
            <BenefitsSection />
          </Container>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-5">
          <Container>
            <HowItWorksSection />
          </Container>
        </section>
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-5">
          <TestimonialsSection />
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-5">
          <Container>
            <FAQSection />
          </Container>
        </section>

        {/* CTA Section */}
        <section id="cta" className="py-5 bg-primary text-white">
          <Container>
            <CTASection />
          </Container>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-light py-5">
        <Container>
          <Footer />
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;