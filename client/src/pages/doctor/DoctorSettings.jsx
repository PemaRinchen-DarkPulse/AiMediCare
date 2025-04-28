import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, Form, 
  FormGroup, Label, Input, Button, Alert, Nav, NavItem, NavLink, TabContent, 
  TabPane, Spinner, Badge } from 'reactstrap';
import { FaUser, FaCalendarAlt, FaBell, FaVideo, FaCheck, FaTimes, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const DoctorSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Profile section state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    profileImage: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    specialty: '',
    specialization: '',
    consultationFee: 0,
    practiceLocation: '',
    clinicAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  
  // Function to generate a random color based on name
  const generateAvatarColor = (name) => {
    if (!name) return '#6c757d'; // Default gray if no name
    
    // Generate a "random" color based on the name string
    // This ensures the same name always gets the same color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert the hash to a color
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
  };
  
  // Function to render profile image or avatar with initial
  const renderProfileImage = () => {
    if (profileData.profileImage) {
      return (
        <img
          src={profileData.profileImage}
          alt="Profile"
          className="img-fluid rounded-circle"
          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
        />
      );
    } else {
      // Get first letter of the name
      const initial = profileData.name ? profileData.name.charAt(0).toUpperCase() : '?';
      const bgColor = generateAvatarColor(profileData.name);
      
      return (
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: '150px',
            height: '150px',
            backgroundColor: bgColor,
            color: '#ffffff',
            fontSize: '64px',
            fontWeight: 'bold'
          }}
        >
          {initial}
        </div>
      );
    }
  };
  
  // Availability section state
  const [availabilityData, setAvailabilityData] = useState({
    availability: []
  });
  const [isAvailable, setIsAvailable] = useState(true);
  
  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    appointmentReminders: true,
    newPatientRegistration: true,
    emergencyCases: true
  });
  
  // Teleconsultation settings state
  const [teleconsultationSettings, setTeleconsultationSettings] = useState({
    platform: 'In-App',
    isEnabled: true,
    meetingLink: '',
    consultationFee: 0
  });
  
  useEffect(() => {
    // Load all settings data when component mounts
    loadProfileData();
    loadAvailabilityData();
    loadNotificationPreferences();
    loadTeleconsultationSettings();
  }, []);
  
  // Load profile data from API
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/settings/profile', {
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
  
  // Load availability data from API
  const loadAvailabilityData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/settings/availability', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setAvailabilityData(response.data.data);
        // Check if doctor has any availability set
        setIsAvailable(response.data.data.availability && response.data.data.availability.length > 0);
      }
    } catch (err) {
      console.error('Error loading availability data:', err);
    }
  };
  
  // Load notification preferences from API
  const loadNotificationPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/settings/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setNotificationPreferences(response.data.data);
      }
    } catch (err) {
      console.error('Error loading notification preferences:', err);
    }
  };
  
  // Load teleconsultation settings from API
  const loadTeleconsultationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/settings/teleconsultation', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setTeleconsultationSettings(response.data.data);
      }
    } catch (err) {
      console.error('Error loading teleconsultation settings:', err);
    }
  };
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields (address)
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfileData({
        ...profileData,
        address: {
          ...profileData.address,
          [addressField]: value
        }
      });
    }
    // Handle nested fields (clinic address)
    else if (name.startsWith('clinicAddress.')) {
      const addressField = name.split('.')[1];
      setProfileData({
        ...profileData,
        clinicAddress: {
          ...profileData.clinicAddress,
          [addressField]: value
        }
      });
    }
    // Handle regular fields
    else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
  };
  
  // Handle notification preferences changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPreferences({
      ...notificationPreferences,
      [name]: checked
    });
  };
  
  // Handle teleconsultation settings changes
  const handleTeleconsultationChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setTeleconsultationSettings({
      ...teleconsultationSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Submit profile form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        'http://localhost:5000/api/settings/profile',
        profileData,
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
      setLoading(false);
    }
  };
  
  // Submit notification preferences
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        'http://localhost:5000/api/settings/notifications',
        notificationPreferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.success) {
        setSuccess('Notification preferences updated successfully');
      }
    } catch (err) {
      setError('Failed to update notification preferences. Please try again.');
      console.error('Error updating notification preferences:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Submit teleconsultation settings
  const handleTeleconsultationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        'http://localhost:5000/api/settings/teleconsultation',
        teleconsultationSettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.success) {
        setSuccess('Teleconsultation settings updated successfully');
        // Update local state with the returned data
        setTeleconsultationSettings(response.data.data);
      }
    } catch (err) {
      setError('Failed to update teleconsultation settings. Please try again.');
      console.error('Error updating teleconsultation settings:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle availability scheduling
  const handleAvailabilityToggle = async () => {
    // In a real implementation, this would update the doctor's overall availability status
    setIsAvailable(!isAvailable);
  };
  
  // This is a simplified implementation of the availability scheduler component
  const AvailabilityScheduler = () => {
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // In a real implementation, this would add a time slot to the doctor's availability
    const addTimeSlot = () => {
      // Implementation would add to availabilityData and then save to backend
      alert(`Added time slot for ${selectedDay} from ${startTime} to ${endTime}`);
    };
    
    return (
      <Card className="mb-4">
        <CardBody>
          <h5 className="mb-3">Add Availability Time Slot</h5>
          <Row form>
            <Col md={4}>
              <FormGroup>
                <Label for="daySelect">Day</Label>
                <Input 
                  type="select" 
                  name="daySelect" 
                  id="daySelect" 
                  value={selectedDay}
                  onChange={e => setSelectedDay(e.target.value)}
                >
                  {weekDays.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="startTime">Start Time</Label>
                <Input
                  type="time"
                  name="startTime"
                  id="startTime"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label for="endTime">End Time</Label>
                <Input
                  type="time"
                  name="endTime"
                  id="endTime"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>
          <Button color="primary" onClick={addTimeSlot}>
            Add Time Slot
          </Button>
        </CardBody>
      </Card>
    );
  };
  
  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    // In a real implementation, this would upload the image to a server and get a URL back
    // For this example, we'll simulate a successful upload with a placeholder URL
    
    if (file) {
      // Create a URL for the selected file for preview
      const imageUrl = URL.createObjectURL(file);
      setProfileData({
        ...profileData,
        profileImage: imageUrl
      });
      
      // In a real implementation, you would upload the file to the server here
      // const formData = new FormData();
      // formData.append('image', file);
      // axios.post('/api/settings/profile/upload-image', formData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
    }
  };
  
  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Doctor Settings</h2>
      
      {error && (
        <Alert color="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert color="success" className="mb-4">
          {success}
        </Alert>
      )}
      
      <Row>
        <Col md={3}>
          <Nav pills vertical className="settings-nav mb-4">
            <NavItem>
              <NavLink
                className={activeTab === 'profile' ? 'active' : ''}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser className="me-2" /> Profile & Details
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 'availability' ? 'active' : ''}
                onClick={() => setActiveTab('availability')}
              >
                <FaCalendarAlt className="me-2" /> Availability Settings
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 'notifications' ? 'active' : ''}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell className="me-2" /> Notification Preferences
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 'teleconsultation' ? 'active' : ''}
                onClick={() => setActiveTab('teleconsultation')}
              >
                <FaVideo className="me-2" /> Teleconsultation Settings
              </NavLink>
            </NavItem>
          </Nav>
        </Col>
        
        <Col md={9}>
          <TabContent activeTab={activeTab}>
            {/* Profile & Details Tab */}
            <TabPane tabId="profile">
              <Card className="shadow-sm">
                <CardHeader className="bg-light">
                  <h4 className="mb-0">Profile Information</h4>
                </CardHeader>
                <CardBody>
                  {loading && activeTab === 'profile' ? (
                    <div className="text-center py-4">
                      <Spinner color="primary" />
                      <p className="mt-2">Loading profile data...</p>
                    </div>
                  ) : (
                    <Form onSubmit={handleProfileSubmit}>
                      <Row form>
                        <Col md={3} className="text-center mb-4">
                          <div className="profile-image-container mb-3">
                            {renderProfileImage()}
                          </div>
                          <div className="image-upload">
                            <Label for="profileImage" className="btn btn-outline-primary btn-sm">
                              <FaUpload className="me-1" /> Change Picture
                            </Label>
                            <Input
                              type="file"
                              name="profileImage"
                              id="profileImage"
                              onChange={handleImageUpload}
                              style={{ display: 'none' }}
                              accept="image/*"
                            />
                          </div>
                        </Col>
                        <Col md={9}>
                          <Row form>
                            <Col md={6}>
                              <FormGroup>
                                <Label for="name">Full Name</Label>
                                <Input
                                  type="text"
                                  name="name"
                                  id="name"
                                  value={profileData.name}
                                  onChange={handleProfileChange}
                                  required
                                />
                              </FormGroup>
                            </Col>
                            <Col md={6}>
                              <FormGroup>
                                <Label for="email">Email</Label>
                                <Input
                                  type="email"
                                  name="email"
                                  id="email"
                                  value={profileData.email}
                                  disabled
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row form>
                            <Col md={6}>
                              <FormGroup>
                                <Label for="phoneNumber">Phone Number</Label>
                                <Input
                                  type="tel"
                                  name="phoneNumber"
                                  id="phoneNumber"
                                  value={profileData.phoneNumber || ''}
                                  onChange={handleProfileChange}
                                />
                              </FormGroup>
                            </Col>
                            <Col md={6}>
                              <FormGroup>
                                <Label for="specialty">Specialty</Label>
                                <Input
                                  type="text"
                                  name="specialty"
                                  id="specialty"
                                  value={profileData.specialty || ''}
                                  onChange={handleProfileChange}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      
                      <h5 className="mt-4 mb-3">Professional Details</h5>
                      <Row form>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="specialization">Specialization</Label>
                            <Input
                              type="text"
                              name="specialization"
                              id="specialization"
                              value={profileData.specialization || ''}
                              onChange={handleProfileChange}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="consultationFee">Consultation Fee ($)</Label>
                            <Input
                              type="number"
                              name="consultationFee"
                              id="consultationFee"
                              min="0"
                              step="0.01"
                              value={profileData.consultationFee || 0}
                              onChange={handleProfileChange}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row form>
                        <Col md={12}>
                          <FormGroup>
                            <Label for="practiceLocation">Practice Location</Label>
                            <Input
                              type="text"
                              name="practiceLocation"
                              id="practiceLocation"
                              value={profileData.practiceLocation || ''}
                              onChange={handleProfileChange}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      
                      <h5 className="mt-4 mb-3">Clinic Address</h5>
                      <Row form>
                        <Col md={12}>
                          <FormGroup>
                            <Label for="clinicAddress.street">Street</Label>
                            <Input
                              type="text"
                              name="clinicAddress.street"
                              id="clinicAddressStreet"
                              value={profileData.clinicAddress?.street || ''}
                              onChange={handleProfileChange}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row form>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="clinicAddress.city">City</Label>
                            <Input
                              type="text"
                              name="clinicAddress.city"
                              id="clinicAddressCity"
                              value={profileData.clinicAddress?.city || ''}
                              onChange={handleProfileChange}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="clinicAddress.state">State</Label>
                            <Input
                              type="text"
                              name="clinicAddress.state"
                              id="clinicAddressState"
                              value={profileData.clinicAddress?.state || ''}
                              onChange={handleProfileChange}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row form>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="clinicAddress.zipCode">Zip Code</Label>
                            <Input
                              type="text"
                              name="clinicAddress.zipCode"
                              id="clinicAddressZipCode"
                              value={profileData.clinicAddress?.zipCode || ''}
                              onChange={handleProfileChange}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="clinicAddress.country">Country</Label>
                            <Input
                              type="text"
                              name="clinicAddress.country"
                              id="clinicAddressCountry"
                              value={profileData.clinicAddress?.country || ''}
                              onChange={handleProfileChange}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      
                      <div className="d-flex justify-content-end mt-4">
                        <Button type="submit" color="primary" disabled={loading}>
                          {loading ? <Spinner size="sm" className="me-2" /> : null}
                          Save Profile Changes
                        </Button>
                      </div>
                    </Form>
                  )}
                </CardBody>
              </Card>
            </TabPane>
            
            {/* Availability Settings Tab */}
            <TabPane tabId="availability">
              <Card className="shadow-sm">
                <CardHeader className="bg-light d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Availability Settings</h4>
                  <div className="form-check form-switch">
                    <Input
                      type="switch"
                      id="availabilityToggle"
                      checked={isAvailable}
                      onChange={handleAvailabilityToggle}
                    />
                    <Label for="availabilityToggle" className="form-check-label">
                      <Badge color={isAvailable ? 'success' : 'danger'} pill>
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </Label>
                  </div>
                </CardHeader>
                <CardBody>
                  {loading && activeTab === 'availability' ? (
                    <div className="text-center py-4">
                      <Spinner color="primary" />
                      <p className="mt-2">Loading availability data...</p>
                    </div>
                  ) : (
                    <>
                      <Alert color="info">
                        Set your regular working days and hours. Patients will be able to book appointments during these times.
                      </Alert>
                      
                      {isAvailable ? (
                        <div>
                          <h5 className="mb-3">Current Availability</h5>
                          <div className="availability-schedule mb-4">
                            {availabilityData.availability && availabilityData.availability.length > 0 ? (
                              <table className="table table-bordered">
                                <thead>
                                  <tr>
                                    <th>Day</th>
                                    <th>Hours</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* This would map through actual availability data */}
                                  <tr>
                                    <td>Monday</td>
                                    <td>9:00 AM - 5:00 PM</td>
                                    <td>
                                      <Button color="danger" size="sm">
                                        <FaTimes />
                                      </Button>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Wednesday</td>
                                    <td>10:00 AM - 3:00 PM</td>
                                    <td>
                                      <Button color="danger" size="sm">
                                        <FaTimes />
                                      </Button>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Friday</td>
                                    <td>8:00 AM - 2:00 PM</td>
                                    <td>
                                      <Button color="danger" size="sm">
                                        <FaTimes />
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            ) : (
                              <Alert color="warning">
                                You haven't set up any availability times yet.
                              </Alert>
                            )}
                          </div>
                          
                          <AvailabilityScheduler />
                        </div>
                      ) : (
                        <Alert color="warning">
                          You are currently marked as unavailable. Toggle the switch above to set your availability.
                        </Alert>
                      )}
                      
                      <div className="d-flex justify-content-end mt-4">
                        <Button type="button" color="primary" disabled={!isAvailable}>
                          Save Availability Settings
                        </Button>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </TabPane>
            
            {/* Notification Preferences Tab */}
            <TabPane tabId="notifications">
              <Card className="shadow-sm">
                <CardHeader className="bg-light">
                  <h4 className="mb-0">Notification Preferences</h4>
                </CardHeader>
                <CardBody>
                  {loading && activeTab === 'notifications' ? (
                    <div className="text-center py-4">
                      <Spinner color="primary" />
                      <p className="mt-2">Loading notification preferences...</p>
                    </div>
                  ) : (
                    <Form onSubmit={handleNotificationSubmit}>
                      <Alert color="info">
                        Configure which notifications you want to receive. Notifications can be received via email and in-app alerts.
                      </Alert>
                      
                      <FormGroup check className="mb-3">
                        <Input
                          type="checkbox"
                          name="appointmentReminders"
                          id="appointmentReminders"
                          checked={notificationPreferences.appointmentReminders}
                          onChange={handleNotificationChange}
                        />
                        <Label for="appointmentReminders" check>
                          <strong>Appointment Reminders</strong>
                          <p className="text-muted mb-0 small">
                            Receive notifications about upcoming appointments and schedule changes.
                          </p>
                        </Label>
                      </FormGroup>
                      
                      <FormGroup check className="mb-3">
                        <Input
                          type="checkbox"
                          name="newPatientRegistration"
                          id="newPatientRegistration"
                          checked={notificationPreferences.newPatientRegistration}
                          onChange={handleNotificationChange}
                        />
                        <Label for="newPatientRegistration" check>
                          <strong>New Patient Registration Alerts</strong>
                          <p className="text-muted mb-0 small">
                            Receive notifications when a new patient registers or is assigned to you.
                          </p>
                        </Label>
                      </FormGroup>
                      
                      <FormGroup check className="mb-3">
                        <Input
                          type="checkbox"
                          name="emergencyCases"
                          id="emergencyCases"
                          checked={notificationPreferences.emergencyCases}
                          onChange={handleNotificationChange}
                        />
                        <Label for="emergencyCases" check>
                          <strong>Emergency Case Notifications</strong>
                          <p className="text-muted mb-0 small">
                            Receive high-priority notifications for emergency cases or urgent messages.
                          </p>
                        </Label>
                      </FormGroup>
                      
                      <div className="d-flex justify-content-end mt-4">
                        <Button type="submit" color="primary" disabled={loading}>
                          {loading ? <Spinner size="sm" className="me-2" /> : null}
                          Save Notification Preferences
                        </Button>
                      </div>
                    </Form>
                  )}
                </CardBody>
              </Card>
            </TabPane>
            
            {/* Teleconsultation Settings Tab */}
            <TabPane tabId="teleconsultation">
              <Card className="shadow-sm">
                <CardHeader className="bg-light d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Teleconsultation Settings</h4>
                  <div className="form-check form-switch">
                    <Input
                      type="switch"
                      name="isEnabled"
                      id="teleconsultationToggle"
                      checked={teleconsultationSettings.isEnabled}
                      onChange={handleTeleconsultationChange}
                    />
                    <Label for="teleconsultationToggle" className="form-check-label">
                      <Badge color={teleconsultationSettings.isEnabled ? 'success' : 'danger'} pill>
                        {teleconsultationSettings.isEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </Label>
                  </div>
                </CardHeader>
                <CardBody>
                  {loading && activeTab === 'teleconsultation' ? (
                    <div className="text-center py-4">
                      <Spinner color="primary" />
                      <p className="mt-2">Loading teleconsultation settings...</p>
                    </div>
                  ) : (
                    <Form onSubmit={handleTeleconsultationSubmit}>
                      <Alert color="info">
                        Configure your video consultation preferences. These settings determine how you'll connect with patients remotely.
                      </Alert>
                      
                      <Row form className="mb-4">
                        <Col md={6}>
                          <FormGroup>
                            <Label for="platform">Preferred Platform</Label>
                            <Input
                              type="select"
                              name="platform"
                              id="platform"
                              value={teleconsultationSettings.platform}
                              onChange={handleTeleconsultationChange}
                              disabled={!teleconsultationSettings.isEnabled}
                            >
                              <option value="In-App">In-App Video (Default)</option>
                              <option value="Zoom">Zoom</option>
                              <option value="Google Meet">Google Meet</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <FormGroup>
                            <Label for="consultationFee">Video Consultation Fee ($)</Label>
                            <Input
                              type="number"
                              name="consultationFee"
                              id="teleconsultationFee"
                              min="0"
                              step="0.01"
                              value={teleconsultationSettings.consultationFee}
                              onChange={handleTeleconsultationChange}
                              disabled={!teleconsultationSettings.isEnabled}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      
                      {(teleconsultationSettings.platform === 'Zoom' || teleconsultationSettings.platform === 'Google Meet') && (
                        <FormGroup>
                          <Label for="meetingLink">Meeting Link</Label>
                          <Input
                            type="text"
                            name="meetingLink"
                            id="meetingLink"
                            placeholder="Enter your personal meeting link"
                            value={teleconsultationSettings.meetingLink}
                            onChange={handleTeleconsultationChange}
                            disabled={!teleconsultationSettings.isEnabled}
                          />
                          <small className="form-text text-muted">
                            This link will be shared with patients when they book a teleconsultation.
                          </small>
                        </FormGroup>
                      )}
                      
                      <div className="d-flex justify-content-end mt-4">
                        <Button type="submit" color="primary" disabled={loading}>
                          {loading ? <Spinner size="sm" className="me-2" /> : null}
                          Save Teleconsultation Settings
                        </Button>
                      </div>
                    </Form>
                  )}
                </CardBody>
              </Card>
            </TabPane>
          </TabContent>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorSettings;