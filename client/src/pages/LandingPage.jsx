import React, { useState, useEffect, useRef } from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import FAQSection from '../components/landing/FAQSection';
import NavBar from '../components/landing/NavBar';
import '../styles/LandingPage.css';
import LoginSection from '../components/landing/LoginSection';

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const faqRef = useRef(null);
  const loginRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { ref: heroRef, id: 'hero' },
        { ref: featuresRef, id: 'features' },
        { ref: benefitsRef, id: 'benefits' },
        { ref: howItWorksRef, id: 'how-it-works' },
        { ref: faqRef, id: 'faq' },
        { ref: loginRef, id: 'login' },
      ];

      const currentSection = sections.find(section => {
        if (section.ref.current) {
          const top = section.ref.current.offsetTop;
          const height = section.ref.current.offsetHeight;
          return window.scrollY >= (top - height / 3) && window.scrollY < (top + height - height / 3);
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <NavBar activeSection={activeSection} />
      <section ref={heroRef}><HeroSection /></section>
      <section ref={featuresRef}><FeaturesSection /></section>
      <section ref={benefitsRef}><BenefitsSection /></section>
      <section ref={howItWorksRef}><HowItWorksSection /></section>
      <section ref={faqRef}><FAQSection /></section>
    
    </div>
  );
};

export default LandingPage;