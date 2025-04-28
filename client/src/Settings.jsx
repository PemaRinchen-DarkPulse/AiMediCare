import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUser, FaIdCard, FaShareAlt, FaHistory, 
         FaUserMd, FaBell, FaFileInvoice, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { toast } from 'react-toastify';
import './styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const settingCategories = [
    {
      title: 'Account & Profile Settings',
      items: [
        { name: 'Personal Details', icon: <FaUser />, path: '/personal-details' },
        { name: 'Profile Picture & ID Upload', icon: <FaIdCard />, path: '/profile-picture' }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        { name: 'Data Sharing Preferences', icon: <FaShareAlt />, path: '/data-sharing' },
        { name: 'Session & Login History', icon: <FaHistory />, path: '/login-history' }
      ]
    },
    {
      title: 'Appointment & Consultation',
      items: [
        { name: 'Doctor Preferences', icon: <FaUserMd />, path: '/doctor-preferences' }
      ]
    },
    {
      title: 'Medication & Pharmacy',
      items: [
        { name: 'Medication Reminders', icon: <FaBell />, path: '/medication-reminders' }
      ]
    },
    {
      title: 'Insurance & Billing',
      items: [
        { name: 'Insurance Policy Details', icon: <FaFileInvoice />, path: '/insurance-details' }
      ]
    },
    {
      title: '',
      items: [
        { name: 'All Settings', icon: <FaCog />, path: '/all-settings' },
        { name: 'Logout', icon: <FaSignOutAlt />, path: '/', isLogout: true }
      ]
    }
  ];

  const handleItemClick = async (path, isLogout) => {
    if (isLogout) {
      const result = await logout();
      if (result && result.toast) {
        toast.info(result.toast.message);
      }
      navigate('/');
      return;
    }
    navigate(path);
  };

  return (
    <Container className="settings-container py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7} xl={6}>
          <h2 className="text-center mb-4">Settings</h2>
          <Card className="shadow-sm settings-card">
            <Card.Body>
              {settingCategories.map((category, idx) => (
                <React.Fragment key={idx}>
                  {category.title && (
                    <h5 className="settings-category-title mt-3">{category.title}</h5>
                  )}
                  <div className="settings-items">
                    {category.items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx}
                        className="setting-item d-flex align-items-center"
                        onClick={() => handleItemClick(item.path, item.isLogout)}
                      >
                        <div className="setting-icon">
                          {item.icon}
                        </div>
                        <span className="setting-name">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  {idx < settingCategories.length - 1 && category.title && <hr />}
                </React.Fragment>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;