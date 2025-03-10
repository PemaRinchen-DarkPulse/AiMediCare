import React from 'react';

const NavBar = ({ activeSection }) => {
  return (
    <nav className="nav-bar">
      <div className="logo">
        <a href="/">AI MediCare</a>
      </div>
      <ul className="nav-links">
        <li><a href="#hero" className={activeSection === 'hero' ? 'active' : ''}>Hero</a></li>
        <li><a href="#features" className={activeSection === 'features' ? 'active' : ''}>Features</a></li>
        <li><a href="#benefits" className={activeSection === 'benefits' ? 'active' : ''}>Benefits</a></li>
        <li><a href="#how-it-works" className={activeSection === 'how-it-works' ? 'active' : ''}>How It Works</a></li>
        <li><a href="#faq" className={activeSection === 'faq' ? 'active' : ''}>FAQ</a></li>
      </ul>
    </nav>
  );
};

export default NavBar;
