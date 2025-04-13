import React, { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavBar = ({ activeSection }) => {
  const [expanded, setExpanded] = useState(false);

  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <Navbar 
      expand="lg" 
      fixed="top" 
      bg="white" 
      className="shadow-sm py-3"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand href="/" className="fw-bold fs-4 text-primary">
          AiMediCare
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link 
              href="#hero" 
              className={activeSection === 'hero' ? 'active' : ''}
              onClick={handleNavClick}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              href="#features" 
              className={activeSection === 'features' ? 'active' : ''}
              onClick={handleNavClick}
            >
              Features
            </Nav.Link>
            <Nav.Link 
              href="#benefits" 
              className={activeSection === 'benefits' ? 'active' : ''}
              onClick={handleNavClick}
            >
              Benefits
            </Nav.Link>
            <Nav.Link 
              href="#how-it-works" 
              className={activeSection === 'how-it-works' ? 'active' : ''}
              onClick={handleNavClick}
            >
              How It Works
            </Nav.Link>
            <Nav.Link 
              href="#faq" 
              className={activeSection === 'faq' ? 'active' : ''}
              onClick={handleNavClick}
            >
              FAQ
            </Nav.Link>
          </Nav>
          <motion.div 
            className="d-flex gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/login">
              <Button variant="outline-primary">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Sign Up</Button>
            </Link>
          </motion.div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
