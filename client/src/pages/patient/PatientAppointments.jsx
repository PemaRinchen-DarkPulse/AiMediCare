import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Row, Col, Card, CardBody, CardTitle, Badge, 
  Nav, NavItem, NavLink, TabContent, TabPane, Button,
  Progress, Form, FormGroup, Label, Input, FormFeedback,
  Spinner, InputGroup, ListGroup, ListGroupItem, Alert
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
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
import ClockTimePicker from '../../components/forms/ClockTimePicker';
import UserAvatar from '../../components/UserAvatar';
import './PatientAppointments.css';

const SearchableDropdown = ({ options, value, onChange, placeholder, id, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(search.toLowerCase())
  );
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="searchable-dropdown" ref={dropdownRef}>
      <Label for={id}>{label}</Label>
      <div className="dropdown-container">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          id={id}
        />
        
        {isOpen && (
          <div className="dropdown-menu show w-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div 
                  key={option.value} 
                  className={`dropdown-item ${value === option.value ? 'active' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setSearch(option.label);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="dropdown-item disabled">No results found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookingStep, setBookingStep] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [consultationTypeFilter, setConsultationTypeFilter] = useState('all');
  const [specialtySearchQuery, setSpecialtySearchQuery] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [applicationTracking, setApplicationTracking] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [locations, setLocations] = useState([]);
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
        
        const uniqueSpecialties = [...new Set(processedDoctors.map(doctor => doctor.specialty))];
        const uniqueLocations = [...new Set(processedDoctors.map(doctor => doctor.location))];
        
        setSpecialties(uniqueSpecialties);
        setLocations(uniqueLocations);
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

  const generateMockAppointments = () => {
    console.warn('Using mock appointment data');
    
    setUpcomingAppointments([
      {
        id: 101,
        providerId: 1,
        providerName: 'Dr. Sarah Johnson',
        providerImage: 'https://randomuser.me/api/portraits/women/68.jpg',
        specialty: 'Primary Care',
        date: new Date('2025-04-18T10:00:00'),
        time: '10:00 AM',
        type: 'Video Call',
        reason: 'Annual checkup',
        status: 'Confirmed'
      },
      {
        id: 102,
        providerId: 3,
        providerName: 'Dr. Amina Patel',
        providerImage: '',
        specialty: 'Dermatology',
        date: new Date('2025-04-22T14:30:00'),
        time: '2:30 PM',
        type: 'Video Call',
        reason: 'Skin rash consultation',
        status: 'Pending'
      },
      {
        id: 103,
        providerId: 5,
        providerName: 'Dr. Elena Rodriguez',
        providerImage: null,
        specialty: 'Neurology',
        date: new Date('2025-04-25T09:15:00'),
        time: '9:15 AM',
        type: 'In-Person Visit',
        reason: 'Migraine evaluation',
        status: 'Confirmed'
      }
    ]);

    setPastAppointments([
      {
        id: 104,
        providerId: 2,
        providerName: 'Dr. Michael Chen',
        providerImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        specialty: 'Cardiology',
        date: new Date('2025-03-17T11:15:00'),
        time: '11:15 AM',
        type: 'In-Person Visit',
        reason: 'Heart palpitations',
        status: 'Completed',
        notes: 'Follow-up in 3 months. Continue with prescribed medication.'
      },
      {
        id: 105,
        providerId: 4,
        providerName: 'Dr. James Wilson',
        providerImage: '',
        specialty: 'Psychiatry',
        date: new Date('2025-03-02T15:00:00'),
        time: '3:00 PM',
        type: 'Phone Call',
        reason: 'Anxiety management',
        status: 'Completed',
        notes: 'Recommended mindfulness exercises and adjusted medication dosage.'
      }
    ]);
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
        return { success: false };
      }
      
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }
      
      toast.success('Appointment booked successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.message || 'Failed to book appointment');
      return { success: false, error };
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

  const generateMockApplicationTracking = () => {
    console.warn('Using mock application tracking data');
    const now = new Date();
    
    setApplicationTracking([
      {
        id: 201,
        providerId: 2,
        providerName: 'Dr. Michael Chen',
        providerImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        specialty: 'Cardiology',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '2:00 PM',
        type: 'In-Person Visit',
        reason: 'Chest pain evaluation',
        status: 'pending',
        submittedOn: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        currentStep: 'Doctor Review',
        medicalReviewStatus: 'In Progress',
        estimatedCompletionTime: '24-48 hours'
      },
      {
        id: 202,
        providerId: 4,
        providerName: 'Dr. James Wilson',
        providerImage: '',
        specialty: 'Psychiatry',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: '10:30 AM',
        type: 'Video Call',
        reason: 'Follow-up consultation',
        status: 'doctor_accepted',
        submittedOn: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        currentStep: 'Patient Confirmation',
        medicalReviewStatus: 'Approved',
        estimatedCompletionTime: 'Waiting for your confirmation'
      },
      {
        id: 203,
        providerId: 3,
        providerName: 'Dr. Amina Patel',
        providerImage: '',
        specialty: 'Dermatology',
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        time: '1:15 PM',
        type: 'In-Person Visit',
        reason: 'Skin condition follow-up',
        status: 'declined',
        submittedOn: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        currentStep: 'Declined by Doctor',
        medicalReviewStatus: 'Declined',
        estimatedCompletionTime: 'N/A'
      }
    ]);
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
    setBookingStep(0);
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

  const renderBookingStep = () => {
    switch (bookingStep) {
      case 0:
        return renderProviderSelection();
      case 1:
        return renderAppointmentTypeSelection();
      case 2:
        return renderDateTimeSelection();
      case 3:
        return renderReasonInput();
      case 4:
        return renderConfirmation();
      default:
        return null;
    }
  };

  const renderProviderSelection = () => {
    return (
      <div className="provider-selection">
        <h4 className="mb-4">Select a healthcare provider</h4>
        
        <div className="filter-options mb-4">
          <Row>
            <Col md={3}>
              <SearchableDropdown
                options={[
                  { value: 'all', label: 'All Specialties' },
                  ...specialties.map(specialty => ({ value: specialty, label: specialty }))
                ]}
                value={specialtyFilter}
                onChange={setSpecialtyFilter}
                placeholder="Search Specialty"
                id="specialtyFilter"
                label="Filter by Specialty"
              />
            </Col>
            <Col md={3}>
              <SearchableDropdown
                options={[
                  { value: 'all', label: 'All Locations' },
                  ...locations.map(location => ({ value: location, label: location }))
                ]}
                value={locationFilter}
                onChange={setLocationFilter}
                placeholder="Search Location"
                id="locationFilter"
                label="Filter by Location"
              />
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="availabilityFilter">Availability</Label>
                <Input
                  type="date"
                  id="availabilityFilter"
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                </Input>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="consultationTypeFilter">Consultation Type</Label>
                <Input
                  type="select"
                  id="consultationTypeFilter"
                  value={consultationTypeFilter}
                  onChange={(e) => setConsultationTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="In-Person Visit">In-Person Visit</option>
                  <option value="Video Call">Video Call</option>
                  <option value="Phone Call">Phone Call</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">
            <Spinner color="primary" />
            <p className="mt-2">Loading healthcare providers...</p>
          </div>
        ) : (
          <div className="provider-list">
            <Row>
              {providers
                .filter(provider => 
                  (specialtyFilter === 'all' || provider.specialty === specialtyFilter) &&
                  (locationFilter === 'all' || provider.location === locationFilter) &&
                  (availabilityFilter === 'all' || provider.availableDates.some(d => {
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);
                    const nextWeek = new Date(today);
                    nextWeek.setDate(today.getDate() + 7);
                    return (availabilityFilter === 'Today' && d.toDateString() === today.toDateString()) ||
                           (availabilityFilter === 'Tomorrow' && d.toDateString() === tomorrow.toDateString()) ||
                           (availabilityFilter === 'Next Week' && d >= today && d <= nextWeek);
                  })) &&
                  (consultationTypeFilter === 'all' || provider.consultationTypes.includes(consultationTypeFilter)) &&
                  (specialtySearchQuery === '' || provider.specialty.toLowerCase().includes(specialtySearchQuery.toLowerCase())) &&
                  (locationSearchQuery === '' || provider.location.toLowerCase().includes(locationSearchQuery.toLowerCase()))
                )
                .map(provider => (
                  <Col md={6} lg={4} key={provider.id} className="mb-4">
                    <Card 
                      className={`provider-card h-100 ${selectedProvider?.id === provider.id ? 'selected border border-3 border-primary shadow' : ''}`}
                      onClick={() => setSelectedProvider(provider)}
                    >
                      <CardBody>
                        <div className="d-flex align-items-center mb-3">
                          <div className="me-3">
                            <UserAvatar 
                              name={provider.name} 
                              image={provider.profileImage || provider.image} 
                              size="lg" 
                            />
                          </div>
                          <div>
                            <h4 className="mb-1">{provider.name}</h4>
                            <div className="d-flex align-items-center mb-2">
                              <Badge color="info" className="me-2">{provider.specialty}</Badge>
                              <span className="text-muted">
                                <small>{provider.yearsExperience || 0} {provider.yearsExperience === 1 ? 'year' : 'years'} exp.</small>
                              </span>
                            </div>
                            <div className="provider-rating">
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={i < Math.floor(provider.rating || 0) ? "text-warning" : "text-secondary"} 
                                  size={14} 
                                />
                              ))}
                              <span className="ms-2">{provider.rating || 0}/5.0</span>
                              <span className="text-muted ms-1">({provider.totalRatings || 0})</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="provider-details mt-3">
                          <div className="mb-3">
                            <FaHospital className="me-2 text-primary" size={16} />
                            <span>{provider.location || 'No location specified'}</span>
                          </div>
                          <div className="mb-3">
                            <FaCalendarAlt className="me-2 text-primary" size={16} />
                            <span>
                              {provider.availableDates && provider.availableDates.length > 0 
                                ? `Next available: ${provider.availableDates[0].toLocaleDateString()}` 
                                : 'No availability'}
                            </span>
                          </div>
                          {provider.languages && provider.languages.length > 0 && (
                            <div className="mb-3">
                              <FaLanguage className="me-2 text-primary" size={16} />
                              <span>{provider.languages.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        
                        <hr className="my-3" />
                        
                        <div className="bio-section">
                          <h6>About</h6>
                          <p className="provider-bio text-muted small">
                            {provider.bio || 'No bio available.'}
                          </p>
                        </div>
                        
                        {provider.education && provider.education.length > 0 && (
                          <div className="education-section mt-3">
                            <h6>Education</h6>
                            <ul className="list-unstyled small">
                              {provider.education.slice(0, 2).map((edu, idx) => (
                                <li key={idx} className="text-muted">
                                  {edu.degree}, {edu.institution} {edu.year ? `(${edu.year})` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-3 text-center">
                          <Button 
                            color="primary" 
                            size="sm" 
                            outline 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProvider(provider);
                              setBookingStep(1);
                            }}
                            className="w-100"
                          >
                            Book Appointment
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
            </Row>
          </div>
        )}
        
        <div className="booking-actions mt-4 d-flex justify-content-between">
          <Button color="secondary" onClick={() => { setIsBooking(false); setActiveTab('upcoming'); }}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onClick={() => setBookingStep(1)}
            disabled={!selectedProvider}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };
  
  const renderAppointmentTypeSelection = () => {
    const appointmentTypes = [
      {
        type: 'Video Call',
        icon: FaVideo,
        description: 'Virtual appointment via secure video connection',
        benefits: ['No travel required', 'Access from anywhere', 'Same quality of care']
      },
      {
        type: 'Phone Call',
        icon: FaPhone,
        description: 'Talk with your provider over the phone',
        benefits: ['No video required', 'Good for follow-ups', 'Simple and convenient']
      },
      {
        type: 'In-Person Visit',
        icon: FaClinicMedical,
        description: 'Visit the medical facility in person',
        benefits: ['Physical examination', 'Complex health issues', 'Procedures or tests']
      }
    ];
    
    return (
      <div className="appointment-type-selection">
        <h4 className="mb-4">Choose appointment type</h4>
        
        <div className="appointment-types-container">
          <Row>
            {appointmentTypes.map((item) => (
              <Col md={4} key={item.type} className="mb-4">
                <Card 
                  className={`appointment-type-card h-100 ${selectedAppointmentType === item.type ? 'selected border border-3 border-primary shadow' : ''}`}
                  onClick={() => setSelectedAppointmentType(item.type)}
                >
                  <CardBody className="text-center">
                    <div className="appointment-type-icon mb-3">
                      <item.icon size={40} className="text-primary" />
                    </div>
                    <h5>{item.type}</h5>
                    <p className="text-muted">{item.description}</p>
                    
                    <div className="appointment-benefits mt-3">
                      <small>Benefits:</small>
                      <ul className="text-start small">
                        {item.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        
        <div className="booking-actions mt-4 d-flex justify-content-between">
          <Button color="secondary" onClick={() => setBookingStep(0)}>
            Back
          </Button>
          <Button 
            color="primary" 
            onClick={() => setBookingStep(2)}
            disabled={!selectedAppointmentType}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };
  
  const renderDateTimeSelection = () => {
    const isProviderAvailable = (date) => {
      const dateString = date.toDateString();
      return selectedProvider.availableDates.some(d => d.toDateString() === dateString);
    };

    return (
      <div className="date-time-selection">
        <h4 className="mb-4">Select date & time</h4>
        
        <Row>
          <Col md={6} className="mb-4">
            <div className="date-selector">
              <DatePicker
                selected={selectedDate}
                onChange={date => {
                  setSelectedDate(date);
                  setSelectedTimeSlot(null);
                }}
                minDate={new Date()}
                inline
                className="form-control"
                dayClassName={date => 
                  isProviderAvailable(date) ? "provider-available-date" : undefined
                }
                renderDayContents={(day, date) => {
                  return (
                    <div className="day-content">
                      {day}
                      {isProviderAvailable(date) && <div className="available-dot"></div>}
                    </div>
                  );
                }}
              />
            </div>
          </Col>
          
          <Col md={6}>
            <div className="time-selector">
              {selectedDate ? (
                isLoading ? (
                  <div className="text-center py-4">
                    <Spinner size="sm" color="primary" />
                    <p className="mt-2">Loading available times...</p>
                  </div>
                ) : (
                  <div className="clock-time-container">
                    <ClockTimePicker 
                      onChange={handleTimeChange}
                      initialTime={selectedTimeSlot ? selectedTimeSlot.time : null}
                      availableSlots={availableTimeSlots}
                    />
                  </div>
                )
              ) : (
                <Alert color="info">
                  Please select a date first
                </Alert>
              )}
            </div>
          </Col>
        </Row>
        
        <div className="booking-actions mt-4 d-flex justify-content-between">
          <Button color="secondary" onClick={() => setBookingStep(1)}>
            Back
          </Button>
          <Button 
            color="primary" 
            onClick={() => setBookingStep(3)}
            disabled={!selectedDate || !selectedTimeSlot}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };
  
  const renderReasonInput = () => {
    const validationSchema = Yup.object().shape({
      reasonForVisit: Yup.string()
        .required('Please provide a reason for your visit')
        .min(10, 'Please describe your reason in more detail')
        .max(500, 'Description is too long')
    });
    
    return (
      <div className="reason-input">
        <h4 className="mb-4">Tell us about your visit</h4>
        
        <Formik
          initialValues={{
            reasonForVisit: '',
            additionalNotes: ''
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            console.log('Form values:', values);
            setBookingStep(4);
          }}
        >
          {({ isValid, dirty, handleSubmit }) => (
            <Form>
              <FormGroup>
                <Label for="reasonForVisit">Reason for visit</Label>
                <Field
                  as={Input}
                  type="textarea"
                  name="reasonForVisit"
                  id="reasonForVisit"
                  placeholder="Describe why you're scheduling this appointment"
                  rows="3"
                />
                <ErrorMessage name="reasonForVisit" component="div" className="text-danger" />
              </FormGroup>
              
              <FormGroup>
                <Label for="additionalNotes">Additional notes (optional)</Label>
                <Field
                  as={Input}
                  type="textarea"
                  name="additionalNotes"
                  id="additionalNotes"
                  placeholder="Add any other information you'd like your provider to know"
                  rows="2"
                />
              </FormGroup>
              
              <div className="booking-actions mt-4 d-flex justify-content-between">
                <Button color="secondary" onClick={() => setBookingStep(2)}>
                  Back
                </Button>
                <Button 
                  color="primary"
                  onClick={() => {
                    if (isValid && dirty) {
                      handleSubmit();
                    }
                  }}
                  disabled={!isValid || !dirty}
                >
                  Next
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  };
  
  const renderConfirmation = () => {
    return (
      <div className="appointment-confirmation">
        <div className="text-center mb-4">
          <div className="confirmation-icon">
            <FaCheck className="text-success" size={40} />
          </div>
          <h4 className="mt-3">Confirm your appointment</h4>
        </div>
        
        <Card className="mb-4">
          <CardBody>
            <h5>Appointment Details</h5>
            <ListGroup className="mt-3">
              <ListGroupItem>
                <Row>
                  <Col xs={4} className="text-muted">Provider</Col>
                  <Col xs={8}>
                    <div className="d-flex align-items-center">
                      <UserAvatar 
                        name={selectedProvider?.name} 
                        image={selectedProvider?.image} 
                        size="sm"
                        className="me-2"
                      />
                      <div>
                        <div>{selectedProvider?.name}</div>
                        <small className="text-muted">{selectedProvider?.specialty}</small>
                      </div>
                    </div>
                  </Col>
                </Row>
              </ListGroupItem>
              <ListGroupItem>
                <Row>
                  <Col xs={4} className="text-muted">Date & Time</Col>
                  <Col xs={8}>
                    {selectedDate?.toLocaleDateString()} at {selectedTimeSlot?.formattedTime}
                  </Col>
                </Row>
              </ListGroupItem>
              <ListGroupItem>
                <Row>
                  <Col xs={4} className="text-muted">Appointment Type</Col>
                  <Col xs={8}>{selectedAppointmentType}</Col>
                </Row>
              </ListGroupItem>
            </ListGroup>
          </CardBody>
        </Card>
        
        <div className="insurance-section mb-4">
          <h5>Insurance Information</h5>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-bold">Blue Cross Blue Shield</div>
                  <div className="text-muted">Policy #: BCBS12345678</div>
                </div>
                <Button color="link" size="sm">Change</Button>
              </div>
            </CardBody>
          </Card>
        </div>
        
        <div className="cancellation-policy mb-4">
          <h5>Cancellation Policy</h5>
          <Alert color="info">
            <small>
              You may cancel or reschedule your appointment up to 24 hours before your scheduled time without incurring any fees. 
              Late cancellations or no-shows may result in a fee of $25.
            </small>
          </Alert>
        </div>
        
        <div className="booking-actions mt-4 d-flex justify-content-between">
          <Button color="secondary" onClick={() => setBookingStep(3)}>
            Back
          </Button>
          <Button 
            color="success" 
            onClick={async () => {
              // Create data object to send to the server
              const appointmentData = {
                doctorId: selectedProvider.id,
                date: selectedDate,
                time: selectedTimeSlot.formattedTime,
                type: selectedAppointmentType,
                reason: document.querySelector('textarea[name="reasonForVisit"]')?.value || "General consultation"
              };
              
              // Call API to create appointment
              setIsLoading(true);
              const result = await createAppointment(appointmentData);
              setIsLoading(false);
              
              if (result.success) {
                // Create tracking record for this appointment
                const newApplication = {
                  id: result.data.appointment._id || Math.floor(Math.random() * 1000) + 300,
                  providerId: selectedProvider.id,
                  providerName: selectedProvider.name,
                  providerImage: selectedProvider.image,
                  specialty: selectedProvider.specialty,
                  date: selectedDate,
                  time: selectedTimeSlot.formattedTime,
                  type: selectedAppointmentType,
                  reason: appointmentData.reason,
                  status: 'pending',
                  submittedOn: new Date(),
                  currentStep: 'Doctor Review',
                  medicalReviewStatus: 'In Progress',
                  estimatedCompletionTime: '24-48 hours'
                };
                
                // Add the new application to tracking
                setApplicationTracking(prev => [...prev, newApplication]);
                
                // Show success message
                toast.success('Appointment request submitted successfully!');
                
                // Refresh data in the background without awaiting
                fetchAppointments();
                fetchApplicationTracking();
                
                // Force redirect to upcoming tab without waiting
                setActiveTab('upcoming');
                setIsBooking(false);
                
                // Reset booking state 
                setBookingStep(0);
                setSelectedProvider(null);
                setSelectedAppointmentType(null);
                setSelectedDate(null);
                setSelectedTimeSlot(null);
              }
            }}
          >
            {isLoading ? (
              <><Spinner size="sm" className="me-2" /> Processing...</>
            ) : (
              'Submit Appointment Request'
            )}
          </Button>
        </div>
      </div>
    );
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
                }>
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
    return (
      <Card className="mb-4">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <Button color="link" className="p-0 me-3" onClick={() => { setIsBooking(false); setActiveTab('upcoming'); }}>
                <FaArrowLeft size={16} />
              </Button>
              <h3 className="mb-0">Book an Appointment</h3>
            </div>
          </div>
          
          <div className="booking-progress mb-4">
            <Progress value={(bookingStep / 5) * 100} className="mb-2" />
            <div className="booking-steps">
              <div className={`booking-step ${bookingStep >= 0 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-name d-none d-md-block">Provider</div>
              </div>
              <div className={`booking-step ${bookingStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-name d-none d-md-block">Type</div>
              </div>
              <div className={`booking-step ${bookingStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-name d-none d-md-block">Date & Time</div>
              </div>
              <div className={`booking-step ${bookingStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-name d-none d-md-block">Reason</div>
              </div>
              <div className={`booking-step ${bookingStep >= 4 ? 'active' : ''}`}>
                <div className="step-number">5</div>
                <div className="step-name d-none d-md-block">Confirm</div>
              </div>
            </div>
          </div>
          
          {renderBookingStep()}
        </CardBody>
      </Card>
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