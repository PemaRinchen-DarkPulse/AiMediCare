import React, { useState } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaPills, FaBox, FaUsers, FaRobot, 
  FaChartLine, FaSignOutAlt, FaCog 
} from 'react-icons/fa';

// Import pharmacy components
import PharmacyDashboard from './PharmacyDashboard';
import PrescriptionManagement from './PrescriptionManagement';
import InventoryManagement from './InventoryManagement';
import PatientManagement from './PatientManagement';
import AIPharmacyFeatures from './AIPharmacyFeatures';
import PharmacyReports from './PharmacyReports';

const PharmacyLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState({
    name: 'Dr. Sarah Johnson',
    role: 'Pharmacist',
    licenseNumber: 'RPH-123456'
  });

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="pharmacy-layout">
      {/* Navigation Header */}
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-0">
        <Container fluid>
          <Navbar.Brand href="#" className="d-flex align-items-center">
            <FaPills className="me-2" />
            AiMediCare Pharmacy
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="pharmacy-navbar" />
          
          <Navbar.Collapse id="pharmacy-navbar">
            <Nav className="me-auto">
              <Nav.Link 
                active={isActive('/pharmacy')}
                onClick={() => handleNavigation('/pharmacy')}
                className="d-flex align-items-center"
              >
                <FaHome className="me-1" />
                Dashboard
              </Nav.Link>
              
              <Nav.Link 
                active={isActive('/pharmacy/prescriptions')}
                onClick={() => handleNavigation('/pharmacy/prescriptions')}
                className="d-flex align-items-center"
              >
                <FaPills className="me-1" />
                Prescriptions
              </Nav.Link>
              
              <Nav.Link 
                active={isActive('/pharmacy/inventory')}
                onClick={() => handleNavigation('/pharmacy/inventory')}
                className="d-flex align-items-center"
              >
                <FaBox className="me-1" />
                Inventory
              </Nav.Link>
              
              <Nav.Link 
                active={isActive('/pharmacy/patients')}
                onClick={() => handleNavigation('/pharmacy/patients')}
                className="d-flex align-items-center"
              >
                <FaUsers className="me-1" />
                Patients
              </Nav.Link>
              
              <Nav.Link 
                active={isActive('/pharmacy/ai-features')}
                onClick={() => handleNavigation('/pharmacy/ai-features')}
                className="d-flex align-items-center"
              >
                <FaRobot className="me-1" />
                AI Tools
              </Nav.Link>
              
              <Nav.Link 
                active={isActive('/pharmacy/reports')}
                onClick={() => handleNavigation('/pharmacy/reports')}
                className="d-flex align-items-center"
              >
                <FaChartLine className="me-1" />
                Reports
              </Nav.Link>
            </Nav>
            
            <Nav>
              <NavDropdown 
                title={
                  <span className="d-flex align-items-center">
                    <FaUsers className="me-1" />
                    {user.name}
                  </span>
                } 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item>
                  <div className="px-2 py-1">
                    <div className="fw-bold">{user.name}</div>
                    <div className="small text-muted">{user.role}</div>
                    <div className="small text-muted">License: {user.licenseNumber}</div>
                  </div>
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => handleNavigation('/pharmacy/settings')}>
                  <FaCog className="me-2" />
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container fluid className="py-4">
        <Routes>
          <Route path="/" element={<PharmacyDashboard />} />
          <Route path="/prescriptions" element={<PrescriptionManagement />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/ai-features" element={<AIPharmacyFeatures />} />
          <Route path="/reports" element={<PharmacyReports />} />
          <Route path="/settings" element={<div className="text-center py-5"><h3>Settings Panel Coming Soon</h3></div>} />
        </Routes>
      </Container>

      {/* Footer */}
      <footer className="bg-light border-top py-3 mt-auto">
        <Container>
          <div className="row align-items-center">
            <div className="col-md-6">
              <small className="text-muted">
                © 2024 AiMediCare Pharmacy Management System
              </small>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-muted">
                Licensed Pharmacy Software | Version 1.0.0
              </small>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default PharmacyLayout;