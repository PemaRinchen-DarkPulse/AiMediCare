import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Row, Col, Card, CardBody, CardTitle, Badge, 
  Nav, NavItem, NavLink, TabContent, TabPane, Button,
  Form, FormGroup, Label, Input, FormFeedback,
  Spinner, InputGroup, ListGroup, ListGroupItem, Alert
} from 'reactstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, FaClock, FaVideo, FaPhone, FaClinicMedical, 
  FaFilter, FaStar, FaLanguage, FaUserMd, FaHospital,
  FaCreditCard, FaCheck, FaArrowLeft, FaClipboardList,
  FaHistory, FaSpinner, FaCheckCircle, FaTimes
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../../components/UserAvatar';
import './PatientAppointments.css';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isBooking, setIsBooking] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [applicationTracking, setApplicationTracking] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProviders();
    fetchAppointments();
    fetchApplicationTracking(); // Add this line to fetch tracking data
  }, []);

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDate, selectedProvider]);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/doctors');
      
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      
      const data = await response.json();
      console.log("Fetched doctors data:", data); // Debug logging
      
      if (data.status === 'success') {
        // Process the data to ensure proper format
        const processedDoctors = data.data.doctors.map(doctor => ({
          ...doctor,
          // Ensure the image property exists for compatibility with UserAvatar component
          image: doctor.profileImage || doctor.image || "",
          // Convert availableDates strings to Date objects if they're not already
          availableDates: (doctor.availableDates || []).map(date => 
            date instanceof Date ? date : new Date(date)
          )
        }));
        
        console.log("Processed doctors:", processedDoctors); // Debug logging
        setProviders(processedDoctors);
      } else {
        throw new Error(data.message || 'Failed to fetch providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError(error.message);
      toast.error('Failed to load healthcare providers. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in.');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/appointments/patient', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setUpcomingAppointments(data.data.upcomingAppointments);
        setPastAppointments(data.data.pastAppointments);
      } else {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments. Please try again later.');
      generateMockAppointments();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplicationTracking = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in.');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/appointments/patient', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch application tracking');
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data.trackingAppointments) {
        // Convert tracking appointments to application tracking format
        const trackingAppointments = data.data.trackingAppointments.map(app => ({
          id: app.id,
          providerId: app.providerId,
          providerName: app.providerName,
          providerImage: app.providerImage,
          specialty: app.specialty,
          date: new Date(app.date),
          time: app.time,
          type: app.type,
          reason: app.reason,
          status: app.status,
          submittedOn: new Date(app.createdAt || new Date()),
          currentStep: app.status === 'pending' ? 'Doctor Review' : 
                     app.status === 'doctor_accepted' ? 'Patient Confirmation' :
                     app.status === 'declined' ? 'Declined by Doctor' : 'Pending',
          medicalReviewStatus: app.status === 'pending' ? 'In Progress' : 
                             app.status === 'doctor_accepted' ? 'Approved' : 
                             app.status === 'declined' ? 'Declined' : 'Pending',
          estimatedCompletionTime: app.status === 'doctor_accepted' ? 'Awaiting your confirmation' : 
                                 app.status === 'declined' ? 'N/A' : '24-48 hours'
        }));
        
        console.log("Found tracking appointments:", trackingAppointments);
        setApplicationTracking(trackingAppointments);
      } else {
        throw new Error(data.message || 'Failed to fetch application tracking');
      }
    } catch (error) {
      console.error('Error fetching application tracking:', error);
      toast.error('Failed to load appointment applications. Please try again later.');
      generateMockApplicationTracking(); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    if (selectedDate && selectedProvider) {
      try {
        setIsLoading(true);
        
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        const response = await fetch(`http://localhost:5000/api/doctors/${selectedProvider.id}/availability?date=${formattedDate}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch time slots');
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          const slots = data.data.slots.map(slot => ({
            time: new Date(`${formattedDate}T${slot.startTime}`),
            available: !slot.isBooked,
            formattedTime: new Date(`${formattedDate}T${slot.startTime}`).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
          }));
          
          setAvailableTimeSlots(slots);
        } else {
          throw new Error(data.message || 'Failed to fetch time slots');
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast.error('Failed to load available time slots. Please try again later.');
        generateRandomTimeSlots();
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const generateRandomTimeSlots = () => {
    console.warn('Using mock time slot data');
    
    const slots = [];
    const date = new Date(selectedDate);
    const today = new Date();
    
    if (date.setHours(0,0,0,0) < today.setHours(0,0,0,0)) {
      setAvailableTimeSlots([]);
      return;
    }

    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const isToday = date.toDateString() === new Date().toDateString();
    
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        if (isToday && (hour < currentHour || (hour === currentHour && minute <= currentMinute))) {
          continue;
        }
        
        const time = new Date(date);
        time.setHours(hour, minute);
        const available = Math.random() > 0.4;
        slots.push({
          time: time,
          available: available,
          formattedTime: time.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
        });
      }
    }
    setAvailableTimeSlots(slots);
  };

  const createAppointment = async (appointmentData) => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to book an appointment');
        navigate('/login');
        return { success: false, error: 'Authentication required' };
      }
      
      console.log('Sending appointment data to server:', appointmentData);
      
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });
      
      const data = await response.json();
      console.log('Server response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      if (data.status === 'success' || data.success) {
        console.log('Appointment created successfully:', data);
        return { success: true, data };
      } else {
        throw new Error(data.message || 'Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      const errorMessage = error.message || 'Failed to book appointment. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAppointment = async (appointmentId) => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to confirm your appointment');
        navigate('/login');
        return { success: false };
      }
      
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm appointment');
      }
      
      toast.success('Appointment confirmed successfully! It has been moved to your Upcoming Appointments.');
      
      // Refresh data
      fetchAppointments();
      fetchApplicationTracking();
      
      return { success: true, data };
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error(error.message || 'Failed to confirm appointment');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };



  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      if (isBooking) {
        setIsBooking(false);
      }
    }
  };

  const startBooking = () => {
    setIsBooking(true);
    setSelectedProvider(null);
    setSelectedAppointmentType(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setActiveTab('booking');
  };

  const handleTimeChange = (selectedTime) => {
    const newTimeSlot = {
      time: selectedTime,
      available: true,
      formattedTime: selectedTime.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
    };
    setSelectedTimeSlot(newTimeSlot);
  };

  const renderAppointmentList = (appointments) => {
    if (appointments.length === 0) {
      return (
        <div className="text-center p-5">
          <FaCalendarAlt className="text-muted mb-3" size={40} />
          <h5>No appointments found</h5>
          <p>You don't have any {activeTab === 'upcoming' ? 'upcoming' : 'past'} appointments.</p>
          {activeTab === 'upcoming' && (
            <Button color="primary" onClick={startBooking}>
              Book an Appointment
            </Button>
          )}
        </div>
      );
    }

    return (
      <Row>
        {appointments.map((appointment) => (
          <Col lg={6} md={6} key={appointment.id} className="mb-4">
            <Card className="appointment-card h-100">
              <CardBody>
                <Row className="align-items-center">
                  <Col xs={4} md={3} className="d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      <div className="appointment-date-box mb-2">
                        <div className="appointment-month">
                          {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="appointment-day">
                          {new Date(appointment.date).getDate()}
                        </div>
                      </div>
                      <div className="appointment-time">
                        {appointment.time}
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={8} md={9}>
                    <div className="d-flex align-items-center mb-2">
                      <div className="me-3">
                        <UserAvatar 
                          name={appointment.providerName} 
                          image={appointment.providerImage} 
                          size="sm" 
                        />
                      </div>
                      <div>
                        <h5 className="mb-0">{appointment.providerName}</h5>
                        <div className="text-muted">{appointment.specialty}</div>
                        <div className="text-muted small">
                          <FaPhone size={10} className="me-1" /> {appointment.providerPhone || "(555) 123-4567"}
                        </div>
                        <div className="mt-1 location-badge">
                          {appointment.type === 'Video Call' || appointment.type === 'Phone Call' ? (
                            <Badge color="info" className="location-badge px-2 py-1">
                              <FaVideo size={12} className="me-1" /> 
                              <span>Teleconsultation Link</span>
                            </Badge>
                          ) : (
                            <Badge color="light" className="location-badge px-2 py-1 border">
                              <FaClinicMedical size={12} className="me-1 text-primary" /> 
                              <span>{appointment.location || 'Downtown Medical Center'}, Room {appointment.room || '304'}</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="appointment-actions d-flex mt-3">
                      {activeTab === 'upcoming' ? (
                        <>
                          {appointment.status === 'Confirmed' && appointment.type === 'Video Call' && (
                            <Button color="success" outline className="me-2">
                              <FaVideo className="me-1" /> Join Call
                            </Button>
                          )}
                          <Button color="secondary" outline className="me-2">
                            Reschedule
                          </Button>
                          <Button color="danger" outline>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button color="primary" outline className="me-2">
                            View Details
                          </Button>
                          <Button color="success" outline>
                            Book Follow-up
                          </Button>
                        </>
                      )}
                    </div>
                  </Col>
                  <div className="appointment-details mt-3 mb-3 p-4 bg-light text-dark rounded">
                    <Col>
                      <div className="detail-icon mb-3 d-flex align-items-center">
                        <FaClipboardList size={20} className="text-primary me-3" />
                        <div className="detail-label fw-bold">Purpose:</div>
                      </div>
                      <div className="detail-value fs-5 ps-4 mb-3">{appointment.reason}</div>
                    </Col>
                  </div>
                </Row>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderTrackingApplications = () => {
    if (applicationTracking.length === 0) {
      return (
        <div className="text-center p-5">
          <FaClipboardList className="text-muted mb-3" size={40} />
          <h5>No applications found</h5>
          <p>You don't have any appointment applications to track.</p>
          <Button color="primary" onClick={startBooking}>
            Book an Appointment
          </Button>
        </div>
      );
    }

    return (
      <>
        {selectedApplication ? (
          <div className="application-detail">
            <div className="d-flex align-items-center mb-4">
              <Button color="link" className="p-0 me-3" onClick={() => setSelectedApplication(null)}>
                <FaArrowLeft size={16} />
              </Button>
              <h4 className="mb-0">Application Details</h4>
            </div>
            
            <Card className="mb-4">
              <CardBody>
                <Row>
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3">
                        <UserAvatar 
                          name={selectedApplication.providerName} 
                          image={selectedApplication.providerImage} 
                          size="md" 
                        />
                      </div>
                      <div>
                        <h5 className="mb-0">{selectedApplication.providerName}</h5>
                        <div className="text-muted">{selectedApplication.specialty}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <strong className="d-block">Appointment Type:</strong>
                      <span>{selectedApplication.type}</span>
                    </div>
                    
                    <div className="mb-3">
                      <strong className="d-block">Requested Date & Time:</strong>
                      <span>{selectedApplication.date.toLocaleDateString()} at {selectedApplication.time}</span>
                    </div>
                    
                    <div className="mb-3">
                      <strong className="d-block">Reason:</strong>
                      <span>{selectedApplication.reason}</span>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="application-status-card">
                      <div className="d-flex justify-content-between mb-3">
                        <h5 className="mb-0">Application Status</h5>
                        <Badge 
                          color={
                            selectedApplication.status === 'pending' ? 'warning' : 
                            selectedApplication.status === 'doctor_accepted' ? 'info' : 
                            selectedApplication.status === 'declined' ? 'danger' :
                            selectedApplication.status === 'confirmed' ? 'success' : 'secondary'
                          }
                          pill
                        >
                          {selectedApplication.status === 'pending' ? 'Under Review' : 
                           selectedApplication.status === 'doctor_accepted' ? 'Doctor Approved' : 
                           selectedApplication.status === 'declined' ? 'Declined' :
                           selectedApplication.status === 'confirmed' ? 'Confirmed' : selectedApplication.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <strong className="d-block">Submitted on:</strong>
                        <span>{selectedApplication.submittedOn.toLocaleDateString()} at {selectedApplication.submittedOn.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      
                      <div className="mb-3">
                        <strong className="d-block">Current Processing Step:</strong>
                        <span>{selectedApplication.currentStep}</span>
                      </div>
                      
                      <div className="mb-3">
                        <strong className="d-block">Estimated Time to Completion:</strong>
                        <span>{selectedApplication.estimatedCompletionTime}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
                
                <hr />
                
                <h5 className="mb-3">Progress Timeline</h5>
                <div className="progress-timeline mb-4">
                  <div className="progress-step completed">
                    <div className="progress-icon">
                      <FaCheck />
                    </div>
                    <div className="progress-content">
                      <h6>Application Submitted</h6>
                      <small className="text-muted">{selectedApplication.submittedOn.toLocaleDateString()}</small>
                    </div>
                  </div>
                  <div className={`progress-step ${selectedApplication.status !== 'pending' ? 'completed' : 'in-progress'}`}>
                    <div className="progress-icon">
                      {selectedApplication.status === 'pending' ? <FaSpinner className="fa-spin" /> : 
                       selectedApplication.status === 'declined' ? <FaTimes className="text-danger" /> : <FaCheck />}
                    </div>
                    <div className="progress-content">
                      <h6>Doctor Review</h6>
                      <small className={`text-${
                        selectedApplication.status === 'pending' ? 'warning' : 
                        selectedApplication.status === 'declined' ? 'danger' : 'success'
                      }`}>
                        {selectedApplication.status === 'pending' ? 'In Progress' : 
                         selectedApplication.status === 'declined' ? 'Declined' : 'Approved'}
                      </small>
                    </div>
                  </div>
                  <div className={`progress-step ${selectedApplication.status === 'confirmed' ? 'completed' : 
                                                  selectedApplication.status === 'doctor_accepted' ? 'in-progress' : ''}`}>
                    <div className="progress-icon">
                      {selectedApplication.status === 'confirmed' ? <FaCheck /> : 
                       selectedApplication.status === 'doctor_accepted' ? <FaSpinner className="fa-spin" /> : '-'}
                    </div>
                    <div className="progress-content">
                      <h6>Patient Confirmation</h6>
                      <small className={`text-${
                        selectedApplication.status === 'confirmed' ? 'success' : 
                        selectedApplication.status === 'doctor_accepted' ? 'warning' : 'muted'
                      }`}>
                        {selectedApplication.status === 'confirmed' ? 'Confirmed' : 
                         selectedApplication.status === 'doctor_accepted' ? 'Action Required' : 'Awaiting Doctor Approval'}
                      </small>
                    </div>
                  </div>
                </div>
                
                <Alert color={
                  selectedApplication.status === 'pending' ? 'info' : 
                  selectedApplication.status === 'doctor_accepted' ? 'warning' : 
                  selectedApplication.status === 'declined' ? 'danger' : 'success'
                } timeout={0}>
                  <small>
                    <strong>Note:</strong> {
                      selectedApplication.status === 'pending' ? 
                        'Your appointment request is being reviewed by the doctor. You will receive a notification when there is an update.' :
                      selectedApplication.status === 'doctor_accepted' ?
                        'Your appointment has been approved by the doctor and is ready for your final confirmation.' :
                      selectedApplication.status === 'declined' ?
                        'Your appointment request has been declined by the doctor. Please book a new appointment or contact support for assistance.' :
                      'Your appointment has been confirmed and is now scheduled.'
                    }
                    
                    {selectedApplication.status === 'doctor_accepted' && (
                      <div className="mt-3">
                        <Button color="success" size="sm" onClick={async () => {
                          const result = await confirmAppointment(selectedApplication.id);
                          if (result.success) {
                            setSelectedApplication(null);
                          }
                        }}>
                          <FaCheck className="me-1" /> Confirm Appointment
                        </Button>
                      </div>
                    )}
                  </small>
                </Alert>
              </CardBody>
            </Card>
            
            <div className="d-flex justify-content-between">
              <Button color="outline-secondary" onClick={() => setSelectedApplication(null)}>
                Back to Applications
              </Button>
              {selectedApplication.status === 'doctor_accepted' && (
                <Button 
                  color="success"
                  onClick={async () => {
                    const result = await confirmAppointment(selectedApplication.id);
                    if (result.success) {
                      setSelectedApplication(null);
                    }
                  }}
                >
                  Confirm Appointment
                </Button>
              )}
              {selectedApplication.status !== 'declined' && (
                <Button color="outline-danger">
                  Cancel Application
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Row>
            <Col xs={12} className="mb-3">
              <p>Track the status of your appointment applications below. Click on any application for detailed information.</p>
            </Col>
            {applicationTracking.map((application) => (
              <Col lg={6} md={6} key={application.id} className="mb-4">
                <Card className="application-card h-100">
                  <CardBody>
                    <Row className="align-items-center">
                      <Col xs={12}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="mb-0">
                            Appointment with {application.providerName}
                          </h5>
                          <Badge 
                            color={
                              application.status === 'pending' ? 'secondary' : 
                              application.status === 'doctor_accepted' ? 'info' : 
                              application.status === 'declined' ? 'danger' :
                              'success'
                            }
                            pill
                          >
                            {application.status === 'pending' ? 'pending' : 
                             application.status === 'doctor_accepted' ? 'doctor_accepted' : 
                             application.status === 'declined' ? 'declined' :
                             application.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted mb-1">• {application.type}</p>
                          <p className="text-muted mb-1">
                            <small>
                              {application.date.toLocaleDateString()} at {application.time} • Submitted on {application.submittedOn.toLocaleDateString()}
                            </small>
                          </p>
                          <p className="mb-2">
                            <small>
                              <strong>Current step:</strong> {application.currentStep}
                            </small>
                          </p>
                        </div>
                        <div className="d-flex justify-content-end">
                          <Button 
                            color="primary" 
                            outline
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            Track Details
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </>
    );
  };

  const renderBookingContent = () => {
    const validationSchema = Yup.object().shape({
      provider: Yup.string().required('Please select a healthcare provider'),
      appointmentType: Yup.string().required('Please select an appointment type'),
      date: Yup.date().required('Please select a date').min(new Date(), 'Date must be in the future'),
      time: Yup.string().required('Please select a time'),
      reasonForVisit: Yup.string()
        .required('Please provide a reason for your visit')
        .min(10, 'Please describe your reason in more detail')
        .max(500, 'Description is too long')
    });

    const appointmentTypes = [
      { value: 'Video Call', label: 'Video Call', icon: FaVideo },
      { value: 'Phone Call', label: 'Phone Call', icon: FaPhone },
      { value: 'In-Person Visit', label: 'In-Person Visit', icon: FaClinicMedical }
    ];

    return (
      <Container className="d-flex justify-content-center">
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <Card className="mb-4 shadow-sm border-0">
            <CardBody className="p-4 position-relative">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <Button color="link" className="p-0 me-3" onClick={() => { setIsBooking(false); setActiveTab('upcoming'); }}>
                    <FaArrowLeft size={16} />
                  </Button>
                  <h3 className="mb-0">Book an Appointment</h3>
                </div>
              </div>

              <Formik
                initialValues={{
                  provider: selectedProvider?.id || '',
                  appointmentType: selectedAppointmentType || '',
                  date: selectedDate || '',
                  time: selectedTimeSlot?.formattedTime || '',
                  reasonForVisit: reasonForVisit || '',
                  additionalNotes: additionalNotes || ''
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  try {
                    setSubmitting(true);
                    setIsLoading(true);

                    // Find the selected provider
                    const provider = providers.find(p => p.id === values.provider);
                    
                    const appointmentData = {
                      doctorId: values.provider,
                      date: new Date(values.date),
                      time: values.time,
                      type: values.appointmentType,
                      reason: values.reasonForVisit,
                      additionalNotes: values.additionalNotes
                    };

                    console.log('Submitting appointment data:', appointmentData);
                    const result = await createAppointment(appointmentData);

                    if (result.success) {
                      let appointmentId = result.data?.appointment?._id || result.data?._id || result.data?.id || `temp_${Math.floor(Math.random() * 1000) + 300}`;

                      const newApplication = {
                        id: appointmentId,
                        providerId: provider.id,
                        providerName: provider.name,
                        providerImage: provider.image,
                        specialty: provider.specialty,
                        date: new Date(values.date),
                        time: values.time,
                        type: values.appointmentType,
                        reason: values.reasonForVisit,
                        status: 'pending',
                        submittedOn: new Date(),
                        currentStep: 'Doctor Review',
                        medicalReviewStatus: 'In Progress',
                        estimatedCompletionTime: '24-48 hours'
                      };

                      setApplicationTracking(prev => [...prev, newApplication]);
                      
                      // Show detailed success messages
                      toast.success(`🎉 Appointment request submitted successfully!
                      
📅 Date: ${new Date(values.date).toLocaleDateString()}
🕐 Time: ${values.time}
👨‍⚕️ Provider: ${provider.name}
📋 Type: ${values.appointmentType}`, {
                        position: "top-right",
                        autoClose: 6000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                      });
                      
                      // Additional confirmation messages
                      setTimeout(() => {
                        toast.info('📧 You will receive an email confirmation shortly', {
                          position: "top-right",
                          autoClose: 4000,
                        });
                      }, 1000);
                      
                      setTimeout(() => {
                        toast.info('📋 Track your appointment status in the "Track Applications" tab', {
                          position: "top-right",
                          autoClose: 5000,
                        });
                      }, 2000);

                      // Reset form and navigate back
                      resetForm();
                      setActiveTab('upcoming');
                      setIsBooking(false);
                      setSelectedProvider(null);
                      setSelectedAppointmentType(null);
                      setSelectedDate(null);
                      setSelectedTimeSlot(null);
                      setReasonForVisit('');
                      setAdditionalNotes('');

                      // Refresh data
                      fetchAppointments();
                      fetchApplicationTracking();
                    } else {
                      toast.error(result.error || 'Failed to create appointment');
                    }
                  } catch (error) {
                    console.error('Error booking appointment:', error);
                    toast.error('Something went wrong while booking your appointment. Please try again.');
                  } finally {
                    setSubmitting(false);
                    setIsLoading(false);
                  }
                }}
              >
            {({ values, setFieldValue, isSubmitting, isValid, dirty }) => (
              <Form>
                {isSubmitting && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 1000 }}>
                    <div className="text-center">
                      <Spinner color="primary" size="lg" />
                      <p className="mt-2 mb-0">Submitting your appointment request...</p>
                    </div>
                  </div>
                )}
                
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="provider">Select Healthcare Provider *</Label>
                      <Field
                        as={Input}
                        type="select"
                        name="provider"
                        id="provider"
                        onChange={(e) => {
                          const providerId = e.target.value;
                          const provider = providers.find(p => p.id === providerId);
                          setFieldValue('provider', providerId);
                          setSelectedProvider(provider);
                        }}
                      >
                        <option value="">Choose a provider...</option>
                        {providers.map(provider => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name} - {provider.specialty}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="provider" component="div" className="text-danger" />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="appointmentType">Appointment Type *</Label>
                      <Field
                        as={Input}
                        type="select"
                        name="appointmentType"
                        id="appointmentType"
                        onChange={(e) => {
                          setFieldValue('appointmentType', e.target.value);
                          setSelectedAppointmentType(e.target.value);
                        }}
                      >
                        <option value="">Choose appointment type...</option>
                        {appointmentTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="appointmentType" component="div" className="text-danger" />
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="date">Preferred Date *</Label>
                      <Field
                        as={Input}
                        type="date"
                        name="date"
                        id="date"
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setFieldValue('date', e.target.value);
                          setSelectedDate(new Date(e.target.value));
                        }}
                      />
                      <ErrorMessage name="date" component="div" className="text-danger" />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="time">Preferred Time *</Label>
                      <Field
                        as={Input}
                        type="time"
                        name="time"
                        id="time"
                        onChange={(e) => {
                          setFieldValue('time', e.target.value);
                          setSelectedTimeSlot({ formattedTime: e.target.value });
                        }}
                      />
                      <ErrorMessage name="time" component="div" className="text-danger" />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label for="reasonForVisit">Reason for Visit *</Label>
                  <Field
                    as={Input}
                    type="textarea"
                    name="reasonForVisit"
                    id="reasonForVisit"
                    placeholder="Describe why you're scheduling this appointment"
                    rows="3"
                    onChange={(e) => {
                      setFieldValue('reasonForVisit', e.target.value);
                      setReasonForVisit(e.target.value);
                    }}
                  />
                  <ErrorMessage name="reasonForVisit" component="div" className="text-danger" />
                </FormGroup>

                <FormGroup>
                  <Label for="additionalNotes">Additional Notes (Optional)</Label>
                  <Field
                    as={Input}
                    type="textarea"
                    name="additionalNotes"
                    id="additionalNotes"
                    placeholder="Add any other information you'd like your provider to know"
                    rows="2"
                    onChange={(e) => {
                      setFieldValue('additionalNotes', e.target.value);
                      setAdditionalNotes(e.target.value);
                    }}
                  />
                </FormGroup>

                {/* Confirmation Info */}
                <Alert color="info" className="mb-4" fade={false}>
                  <small>
                    <FaCheck className="me-2" />
                    <strong>What happens next:</strong> Your appointment request will be reviewed by the selected provider. 
                    You'll receive an email confirmation once it's approved (usually within 24-48 hours).
                  </small>
                </Alert>

                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    color="secondary" 
                    onClick={() => { 
                      setIsBooking(false); 
                      setActiveTab('upcoming'); 
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    type="submit"
                    disabled={!isValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Spinner size="sm" className="me-2" /> Submitting...</>
                    ) : (
                      'Submit Appointment Request'
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
        </div>
      </Container>
    );
  };

  return (
    <div className="patient-appointments-page">
      <Container className="py-4">
        <Card className="mb-4 shadow-sm border-0">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">My Appointments</h2>
              {!isBooking && (
                <Button color="primary" onClick={startBooking}>
                  <FaCalendarAlt className="me-2" /> Book New Appointment
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
        
        <Nav tabs className="mb-4 appointment-nav-tabs">
          <NavItem>
            <NavLink
              className={`appointment-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => toggleTab('upcoming')}
            >
              <FaCalendarAlt className="me-2" /> Upcoming Appointments
              {upcomingAppointments.length > 0 && (
                <Badge color="primary" pill className="ms-2">{upcomingAppointments.length}</Badge>
              )}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`appointment-tab ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => toggleTab('past')}
            >
              <FaHistory className="me-2" /> Past Appointments
              {pastAppointments.length > 0 && (
                <Badge color="secondary" pill className="ms-2">{pastAppointments.length}</Badge>
              )}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`appointment-tab ${activeTab === 'tracking' ? 'active' : ''}`}
              onClick={() => toggleTab('tracking')}
            >
              <FaClipboardList className="me-2" /> Track Applications
              {applicationTracking.length > 0 && (
                <Badge color="info" pill className="ms-2">{applicationTracking.length}</Badge>
              )}
            </NavLink>
          </NavItem>
          {isBooking && (
            <NavItem>
              <NavLink className="active">
                Book Appointment
              </NavLink>
            </NavItem>
          )}
        </Nav>
        
        {isBooking ? (
          renderBookingContent()
        ) : (
          <TabContent activeTab={activeTab}>
            <TabPane tabId="upcoming">
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading your appointments...</p>
                </div>
              ) : (
                renderAppointmentList(upcomingAppointments)
              )}
            </TabPane>
            <TabPane tabId="past">
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading your appointments...</p>
                </div>
              ) : (
                renderAppointmentList(pastAppointments)
              )}
            </TabPane>
            <TabPane tabId="tracking">
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading your applications...</p>
                </div>
              ) : (
                renderTrackingApplications()
              )}
            </TabPane>
          </TabContent>
        )}
      </Container>
    </div>
  );
};
export default PatientAppointments;