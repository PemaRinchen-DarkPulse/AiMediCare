import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, Nav, NavItem, NavLink, Alert, Spinner } from 'reactstrap';
import { FaUser, FaBell, FaVideo, FaNotesMedical } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import EditablePatientProfileForm from '../../components/forms/EditablePatientProfileForm';
import NotificationToggle from '../../components/forms/NotificationToggle';
import TeleconsultationPreferenceForm from '../../components/forms/TeleconsultationPreferenceForm';
import MedicalInfoForm from '../../components/forms/MedicalInfoForm';

const PatientSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for settings data
  const [profileData, setProfileData] = useState({});
  const [notificationPreferences, setNotificationPreferences] = useState({});
  const [teleconsultationPreferences, setTeleconsultationPreferences] = useState({});
  const [medicalInfo, setMedicalInfo] = useState({});

  // States for form submission loading
  const [profileLoading, setProfileLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [teleconsultationLoading, setTeleconsultationLoading] = useState(false);
  const [medicalInfoLoading, setMedicalInfoLoading] = useState(false);

  useEffect(() => {
    // Load all settings data when component mounts
    loadProfileData();
    loadNotificationPreferences();
    loadTeleconsultationPreferences();
    loadMedicalInfo();
  }, []);

  // Load profile data from API
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/patient/settings/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setProfileData(response.data.data);
      }
    } catch (err) {
      setError('Failed to load profile data. Please try again.');
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load notification preferences from API
  const loadNotificationPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/patient/settings/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setNotificationPreferences(response.data.data);
      }
    } catch (err) {
      console.error('Error loading notification preferences:', err);
    }
  };
  
  // Load teleconsultation preferences from API
  const loadTeleconsultationPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/patient/settings/teleconsultation', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setTeleconsultationPreferences(response.data.data);
      }
    } catch (err) {
      console.error('Error loading teleconsultation preferences:', err);
    }
  };

  // Load medical info from API
  const loadMedicalInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/patient/settings/medicalinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setMedicalInfo(response.data.data);
      }
    } catch (err) {
      console.error('Error loading medical information:', err);
    }
  };

  // Handle form submissions
  const handleProfileSubmit = async (formData) => {
    try {
      setProfileLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        'http://localhost:5000/api/patient/settings/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.success) {
        setSuccess('Profile updated successfully');
        // Update local state with the returned data
        setProfileData(response.data.data);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleNotificationSubmit = async (formData) => {
    try {
      setNotificationsLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        'http://localhost:5000/api/patient/settings/notifications',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.success) {
        setSuccess('Notification preferences updated successfully');
        // Update local state with the returned data
        setNotificationPreferences(response.data.data);
      }
    } catch (err) {
      setError('Failed to update notification preferences. Please try again.');
      console.error('Error updating notification preferences:', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleTeleconsultationSubmit = async (formData) => {
    try {
      setTeleconsultationLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        'http://localhost:5000/api/patient/settings/teleconsultation',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.success) {
        setSuccess('Teleconsultation preferences updated successfully');
        // Update local state with the returned data
        setTeleconsultationPreferences(response.data.data);
      }
    } catch (err) {
      setError('Failed to update teleconsultation preferences. Please try again.');
      console.error('Error updating teleconsultation preferences:', err);
    } finally {
      setTeleconsultationLoading(false);
    }
  };

  const handleMedicalInfoSubmit = async (formData) => {
    try {
      setMedicalInfoLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        'http://localhost:5000/api/patient/settings/medicalinfo',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.success) {
        setSuccess('Medical information updated successfully');
        // Update local state with the returned data
        setMedicalInfo(response.data.data);
      }
    } catch (err) {
      setError('Failed to update medical information. Please try again.');
      console.error('Error updating medical information:', err);
    } finally {
      setMedicalInfoLoading(false);
    }
  };

  // Reset error/success messages when changing tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };

  if (loading && !profileData.name) {
    return (
      <div className="text-center my-5">
        <Spinner color="primary" />
        <p className="mt-3">Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Patient Settings</h2>
      
      {error && (
        <Alert color="danger" className="mb-4" timeout={5000}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert color="success" className="mb-4" timeout={5000}>
          {success}
        </Alert>
      )}
      
      <Row>
        <Col md={3}>
          <Nav pills vertical className="settings-nav mb-4">
            <NavItem>
              <NavLink
                className={activeTab === 'profile' ? 'active' : ''}
                onClick={() => handleTabChange('profile')}
              >
                <FaUser className="me-2" /> Profile & Details
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 'notifications' ? 'active' : ''}
                onClick={() => handleTabChange('notifications')}
              >
                <FaBell className="me-2" /> Notifications
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 'teleconsultation' ? 'active' : ''}
                onClick={() => handleTabChange('teleconsultation')}
              >
                <FaVideo className="me-2" /> Teleconsultation
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 'medicalInfo' ? 'active' : ''}
                onClick={() => handleTabChange('medicalInfo')}
              >
                <FaNotesMedical className="me-2" /> Medical Information
              </NavLink>
            </NavItem>
          </Nav>
        </Col>
        
        <Col md={9}>
          <Card className="shadow-sm">
            <CardHeader className="bg-light">
              {activeTab === 'profile' && <h4 className="mb-0">Profile Settings</h4>}
              {activeTab === 'notifications' && <h4 className="mb-0">Notification Preferences</h4>}
              {activeTab === 'teleconsultation' && <h4 className="mb-0">Teleconsultation Preferences</h4>}
              {activeTab === 'medicalInfo' && <h4 className="mb-0">Medical Information</h4>}
            </CardHeader>
            <CardBody>
              {activeTab === 'profile' && (
                <EditablePatientProfileForm 
                  profileData={profileData} 
                  onSubmit={handleProfileSubmit}
                  loading={profileLoading}
                  error={error}
                  success={success}
                />
              )}
              
              {activeTab === 'notifications' && (
                <NotificationToggle 
                  preferences={notificationPreferences}
                  onSubmit={handleNotificationSubmit}
                  loading={notificationsLoading}
                  error={error}
                  success={success}
                />
              )}
              
              {activeTab === 'teleconsultation' && (
                <TeleconsultationPreferenceForm 
                  preferences={teleconsultationPreferences}
                  onSubmit={handleTeleconsultationSubmit}
                  loading={teleconsultationLoading}
                  error={error}
                  success={success}
                />
              )}
              
              {activeTab === 'medicalInfo' && (
                <MedicalInfoForm 
                  medicalInfo={medicalInfo}
                  onSubmit={handleMedicalInfoSubmit}
                  loading={medicalInfoLoading}
                  error={error}
                  success={success}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PatientSettings;