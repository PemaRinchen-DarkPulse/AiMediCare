import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, CardBody, Badge, Spinner,
  Nav, NavItem, NavLink, Button, TabContent, TabPane, 
  Alert, Input, Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, FormFeedback, ListGroup, ListGroupItem, Table
} from 'reactstrap';
import { 
  FaCalendarAlt, FaUserInjured, FaNotesMedical, FaVideo, FaPhoneAlt,
  FaClinicMedical, FaCheck, FaTimes, FaClock, FaFilter, FaSearch,
  FaPrescription, FaFileAlt, FaInfoCircle, FaSyncAlt, FaPen,
  FaExclamationTriangle, FaMicrophone, FaHistory, FaSave, FaPrescriptionBottleAlt, FaMedkit
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import UserAvatar from '../../components/UserAvatar';
import PrescriptionModal from '../../components/doctor/PrescriptionModal';
import './DoctorAppointments.css';

const AppointmentCard = ({ 
  appointment, 
  onViewDetails, 
  onAcceptAppointment, 
  onDeclineAppointment,
  onRescheduleRequest,
  onOpenPrescriptionModal
}) => {
  const statusBadgeColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'doctor_accepted': return 'info';
      case 'declined': return 'danger';
      case 'completed': return 'secondary';
      case 'cancelled': return 'dark';
      default: return 'light';
    }
  };

  const typeBadgeColor = (type) => {
    switch(type) {
      case 'Video Call': return 'primary';
      case 'Phone Call': return 'info';
      case 'In-Person Visit': return 'success';
      default: return 'secondary';
    }
  };

  const typeIcon = (type) => {
    switch(type) {
      case 'Video Call': return <FaVideo className="me-1" />;
      case 'Phone Call': return <FaPhoneAlt className="me-1" />;
      case 'In-Person Visit': return <FaClinicMedical className="me-1" />;
      default: return null;
    }
  };

  const appointmentDate = new Date(appointment.date);
  const month = appointmentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = appointmentDate.getDate();
  
  return (
    <Card className={`appointment-card h-100 border-0 shadow-sm ${appointment.status === 'pending' ? 'border-start border-warning border-4' : ''}`}>
      <CardBody className="p-0">
        {/* Status badge positioned at top right */}
        <div className="position-absolute top-0 end-0 mt-3 me-3">
          <Badge 
            color={statusBadgeColor(appointment.status)} 
            pill
            className={`badge-${appointment.status} px-3 py-2`}
          >
            {appointment.status}
          </Badge>
        </div>

        <div className="p-4">
          <Row className="align-items-center">
            <Col xs={4} md={3} className="d-flex align-items-center justify-content-center">
              <div className="text-center">
                <div className="appointment-date-box mb-2 bg-light rounded-3 p-3">
                  <div className="appointment-month text-primary fw-bold">
                    {month}
                  </div>
                  <div className="appointment-day display-6 fw-bold">
                    {day}
                  </div>
                </div>
                <div className="appointment-time fw-bold text-secondary">
                  {appointment.time}
                </div>
              </div>
            </Col>
            
            <Col xs={8} md={9}>
              <div className="patient-info mb-3 d-flex">
                <div className="me-3">
                  <UserAvatar 
                    name={appointment.patientName}
                    image={appointment.patientImage || ''}
                    size="lg" 
                    className="shadow-sm"
                  />
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">{appointment.patientName}</h5>
                  <div className="d-flex align-items-center mb-2">
                    <Badge 
                      color={typeBadgeColor(appointment.type)} 
                      pill
                      className={`me-2 badge-${appointment.type === 'Video Call' ? 'video' : 
                                            appointment.type === 'Phone Call' ? 'phone' : 'inperson'}`}
                    >
                      {typeIcon(appointment.type)} {appointment.type}
                    </Badge>
                  </div>
                  <div className="mt-1">
                    {appointment.type === 'Video Call' || appointment.type === 'Phone Call' ? (
                      <Badge color="info" className="location-badge px-2 py-1 rounded-pill">
                        <FaVideo size={12} className="me-1" /> 
                        <span>Teleconsultation</span>
                      </Badge>
                    ) : (
                      <Badge color="light" className="location-badge px-2 py-1 border rounded-pill">
                        <FaClinicMedical size={12} className="me-1 text-primary" /> 
                        <span>{appointment.location || 'Medical Center'}, Room {appointment.room || '304'}</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <div className="appointment-details mt-3 mb-3 p-3 bg-light rounded-3">
            <div className="detail-icon mb-2 d-flex align-items-center">
              <FaNotesMedical size={16} className="text-primary me-2" />
              <div className="detail-label fw-bold">Reason for Visit:</div>
            </div>
            <div className="detail-value fs-6 ps-4 pt-1">{appointment.reason}</div>
          </div>
          
          <div className="appointment-actions d-flex mt-4 gap-2">
            {appointment.status === 'pending' && (
              <>
                <Button 
                  color="success" 
                  outline
                  className="rounded-pill px-3"
                  size="sm"
                  onClick={() => onAcceptAppointment(appointment)}
                >
                  <FaCheck className="me-1" /> Accept
                </Button>
                <Button 
                  color="danger" 
                  outline
                  className="rounded-pill px-3"
                  size="sm"
                  onClick={() => onDeclineAppointment(appointment)}
                >
                  <FaTimes className="me-1" /> Decline
                </Button>
                <Button 
                  color="warning" 
                  outline
                  size="sm"
                  className="rounded-pill px-3"
                  onClick={() => onRescheduleRequest(appointment)}
                >
                  <FaClock className="me-1" /> Reschedule
                </Button>
              </>
            )}
            
            {appointment.status === 'confirmed' && (
              <>
                {appointment.type === 'Video Call' && (
                  <Button 
                    color="primary" 
                    className="rounded-pill px-3"
                    size="sm"
                  >
                    <FaVideo className="me-1" /> Join Call
                  </Button>
                )}
                <Button 
                  color="secondary" 
                  outline
                  className="rounded-pill px-3"
                  size="sm"
                  onClick={() => onRescheduleRequest(appointment)}
                >
                  <FaClock className="me-1" /> Reschedule
                </Button>
                <Button 
                  color="info" 
                  outline
                  size="sm"
                  className="rounded-pill px-3"
                  onClick={() => onOpenPrescriptionModal(appointment)}
                >
                  <FaPrescription className="me-1" /> Prescribe
                </Button>
              </>
            )}
            
            {/* Only show Prescribe button for completed appointments */}
            {appointment.status === 'completed' && (
              <Button 
                color="info" 
                outline
                size="sm"
                className="rounded-pill px-3"
                onClick={() => onOpenPrescriptionModal(appointment)}
              >
                <FaPrescription className="me-1" /> Prescribe
              </Button>
            )}

            <Button 
              color="primary" 
              outline 
              size="sm"
              className="ms-auto rounded-pill px-3"
              onClick={() => onViewDetails(appointment)}
            >
              <FaInfoCircle className="me-1" /> View Details
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const AppointmentListTable = ({ 
  appointments, 
  onViewDetails, 
  onAcceptAppointment,
  onDeclineAppointment,
  isLoading,
  filters,
  onFilterChange,
  searchQuery,
  onSearchChange
}) => {
  const statusBadgeColor = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'doctor_accepted': return 'info';
      case 'declined': return 'danger';
      case 'completed': return 'secondary';
      case 'cancelled': return 'dark';
      default: return 'light';
    }
  };

  const typeBadgeColor = (type) => {
    switch(type) {
      case 'Video Call': return 'primary';
      case 'Phone Call': return 'info';
      case 'In-Person Visit': return 'success';
      default: return 'secondary';
    }
  };

  const typeIcon = (type) => {
    switch(type) {
      case 'Video Call': return <FaVideo className="me-1" />;
      case 'Phone Call': return <FaPhoneAlt className="me-1" />;
      case 'In-Person Visit': return <FaClinicMedical className="me-1" />;
      default: return null;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesType = filters.type === 'all' || appointment.type === filters.type;
    const matchesStatus = filters.status === 'all' || appointment.status === filters.status;
    const searchMatches = 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      appointment.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && searchMatches;
  });

  const formatAppointmentTime = (date, time) => {
    if (!date || !time) return '';
    const appointmentDate = new Date(date);
    return `${appointmentDate.toLocaleDateString()} at ${time}`;
  };

  return (
    <Card className="shadow-sm">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Appointments</h5>
          <div className="filters d-flex">
            <Input 
              type="search"
              placeholder="Search patients or reasons..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="me-2"
              style={{ width: '200px' }}
            />
            <Input 
              type="select"
              value={filters.type}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
              className="me-2"
              style={{ width: '150px' }}
            >
              <option value="all">All Types</option>
              <option value="Video Call">Video Call</option>
              <option value="Phone Call">Phone Call</option>
              <option value="In-Person Visit">In-Person Visit</option>
            </Input>
            <Input 
              type="select"
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              style={{ width: '150px' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="doctor_accepted">Accepted</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
              <option value="completed">Completed</option>
            </Input>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-5">
            <FaCalendarAlt size={30} className="text-muted mb-3" />
            <p className="text-muted">No appointments found</p>
            <p className="text-muted small">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="table-responsive appointment-table">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(appointment => (
                  <tr key={appointment.id} className={appointment.status === 'pending' ? 'new-appointment' : ''}>
                    <td>{formatAppointmentTime(appointment.date, appointment.time)}</td>
                    <td>{appointment.patientName}</td>
                    <td>
                      <Badge color={typeBadgeColor(appointment.type)} pill>
                        {typeIcon(appointment.type)} {appointment.type}
                      </Badge>
                    </td>
                    <td>
                      <Badge color={statusBadgeColor(appointment.status)} pill>
                        {appointment.status}
                      </Badge>
                    </td>
                    <td className="reason-cell">{appointment.reason}</td>
                    <td>
                      <div className="d-flex">
                        <Button 
                          color="primary" 
                          size="sm" 
                          outline
                          className="me-1"
                          onClick={() => onViewDetails(appointment)}
                        >
                          <FaInfoCircle />
                        </Button>
                        {appointment.status === 'pending' && (
                          <>
                            <Button 
                              color="success" 
                              size="sm" 
                              outline
                              className="me-1"
                              onClick={() => onAcceptAppointment(appointment)}
                            >
                              <FaCheck />
                            </Button>
                            <Button 
                              color="danger" 
                              size="sm" 
                              outline
                              onClick={() => onDeclineAppointment(appointment)}
                            >
                              <FaTimes />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

const AppointmentDetailView = ({ appointment, onClose, onAddNote, onCompleteAppointment, onAcceptAppointment, onDeclineAppointment }) => {
  const [notes, setNotes] = useState(appointment.notes || '');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointmentPrescriptions, setAppointmentPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState(null);
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setRecognition(new SpeechRecognition());
    }
  }, []);

  useEffect(() => {
    // If appointment has clinicalNotes, use them for display
    if (appointment.clinicalNotes) {
      // Handle both string and object formats for backward compatibility
      if (typeof appointment.clinicalNotes === 'string') {
        setNotes(appointment.clinicalNotes);
      } else if (appointment.clinicalNotes.content) {
        // Legacy format where clinicalNotes was an object with content property
        setNotes(appointment.clinicalNotes.content);
      }
    } else {
      // Fallback to regular notes
      setNotes(appointment.notes || '');
    }
    
    fetchPatientPrescriptions();
    fetchAppointmentPrescriptions();
  }, [appointment.id, appointment.clinicalNotes]);

  const fetchAppointmentPrescriptions = async () => {
    try {
      // Only fetch prescriptions if we have a valid appointment ID
      if (!appointment.id) {
        console.log("No appointment ID available");
        return;
      }
      
      setLoadingPrescriptions(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      console.log(`Fetching prescriptions for appointment ID: ${appointment.id}`);
      
      // Fetch all prescriptions for this specific appointment
      const response = await fetch(`http://localhost:5000/api/prescriptions/appointment/${appointment.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error(`Error fetching appointment prescriptions: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      
      // Handle both response formats
      if (data.status === 'success') {
        setAppointmentPrescriptions(data.data || []);
      } else if (data.success === true) {
        setAppointmentPrescriptions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointment prescriptions:', error);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const fetchPatientPrescriptions = async () => {
    try {
      // Only fetch prescriptions if we have a valid patient ID
      if (!appointment.patientId) {
        console.log("No patient ID available");
        setPrescriptionError('Patient ID not available');
        setLoadingPrescriptions(false);
        return;
      }
      
      setLoadingPrescriptions(true);
      setPrescriptionError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setPrescriptionError('Authentication required');
        setLoadingPrescriptions(false);
        return;
      }
      
      console.log(`Fetching prescriptions for patient ID: ${appointment.patientId}`);
      
      // Fetch all prescriptions for this patient
      const response = await fetch(`http://localhost:5000/api/prescriptions/patient/${appointment.patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error(`Error fetching prescriptions: ${response.status} ${response.statusText}`);
        throw new Error('Failed to fetch prescriptions');
      }
      
      const data = await response.json();
      
      // Handle both response formats
      // The backend uses { status: 'success', data: [...] } format 
      // in getPatientPrescriptionsById and { success: true, data: [...] } in other endpoints
      if (data.status === 'success') {
        setPrescriptions(data.data || []);
      } else if (data.success === true) {
        setPrescriptions(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setPrescriptionError('Failed to load prescriptions');
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsRecording(!isRecording);
  };

  const handleAddAIAssistance = () => {
    // Simulate AI assistance by adding template notes
    let aiAssistance = '';
    
    if (appointment.reason.toLowerCase().includes('diabetes')) {
      aiAssistance = "Patient presents with symptoms consistent with Type 2 diabetes. Recommended HbA1c test and dietary adjustments. Follow-up in 3 months.";
    } else if (appointment.reason.toLowerCase().includes('headache')) {
      aiAssistance = "Patient reports persistent headaches. No signs of neurological issues. Recommended stress management techniques and prescribed mild analgesics. Follow-up if symptoms persist.";
    } else if (appointment.reason.toLowerCase().includes('skin') || appointment.reason.toLowerCase().includes('rash')) {
      aiAssistance = "Patient presents with dermatological condition. Prescribed topical corticosteroid. Advised to avoid potential allergens. Follow-up in 2 weeks.";
    } else {
      aiAssistance = "Patient examination completed. Vital signs normal. No significant abnormalities detected. Recommended routine follow-up.";
    }
    
    setNotes(prevNotes => prevNotes + "\n\nAI Assistance: " + aiAssistance);
  };

  const togglePrescriptionModal = () => {
    setIsPrescriptionModalOpen(!isPrescriptionModalOpen);
  };

  const applyFormat = (formatType) => {
    let formattedNotes = '';
    switch(formatType) {
      case 'standard':
        formattedNotes = `Subjective:\n\nObjective:\n\nAssessment:\n\nPlan:`;
        break;
      case 'followUp':
        formattedNotes = `Follow-up Visit:\n\nReason for Visit:\n\nUpdates since last visit:\n\nAssessment:\n\nPlan:`;
        break;
      case 'consultation':
        formattedNotes = `Specialist Consultation:\n\nReason for Referral:\n\nConsultant's Notes:\n\nRecommendations:`;
        break;
      default:
        break;
    }
    setNotes(formattedNotes);
    setFormatDropdownOpen(false);
  };

  return (
    <div className="appointment-detail-view">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4>Appointment Details</h4>
          <p className="text-muted mb-0">
            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
          </p>
        </div>
        <Button color="secondary" size="sm" onClick={onClose}>Close</Button>
      </div>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <CardBody>
              <h5 className="mb-3">Patient Information</h5>
              <Row className="mb-2">
                <Col xs={4} className="text-muted">Name:</Col>
                <Col xs={8}>{appointment.patientName}</Col>
              </Row>
              {appointment.patientInfo && (
                <>
                  <Row className="mb-2">
                    <Col xs={4} className="text-muted">Age:</Col>
                    <Col xs={8}>{appointment.patientInfo.age}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col xs={4} className="text-muted">Gender:</Col>
                    <Col xs={8}>{appointment.patientInfo.gender}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col xs={4} className="text-muted">Phone:</Col>
                    <Col xs={8}>{appointment.patientInfo.phone}</Col>
                  </Row>
                </>
              )}
              <Row className="mb-2">
                <Col xs={4} className="text-muted">Reason:</Col>
                <Col xs={8}>{appointment.reason}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4} className="text-muted">Type:</Col>
                <Col xs={8}>{appointment.type}</Col>
              </Row>
              <Row className="mb-2">
                <Col xs={4} className="text-muted">Status:</Col>
                <Col xs={8}>
                  <Badge 
                    color={
                      appointment.status === 'pending' ? 'warning' :
                      appointment.status === 'doctor_accepted' ? 'info' :
                      appointment.status === 'confirmed' ? 'success' :
                      appointment.status === 'declined' ? 'danger' :
                      appointment.status === 'completed' ? 'secondary' : 'light'
                    }
                    pill
                  >
                    {appointment.status}
                  </Badge>
                </Col>
              </Row>
              
              {/* Add Prescription Button below patient info */}
              {appointment.status !== 'pending' && appointment.status !== 'declined' && (
                <div className="mt-3">
                  <Button 
                    color="info" 
                    outline
                    className="w-100"
                    onClick={togglePrescriptionModal}
                  >
                    <FaPrescription className="me-1" /> Send Prescription
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Rest of the patient info cards */}
          {appointment.patientMedicalHistory && (
            <Card className="mb-4">
              <CardBody>
                <h5 className="mb-3">Medical History</h5>
                <ListGroup flush>
                  {appointment.patientMedicalHistory.conditions?.map((condition, idx) => (
                    <ListGroupItem key={idx}>
                      <div className="d-flex justify-content-between">
                        <span>{condition.name}</span>
                        <Badge color="info" pill>{condition.diagnosedDate}</Badge>
                      </div>
                    </ListGroupItem>
                  ))}
                  {appointment.patientMedicalHistory.allergies?.map((allergy, idx) => (
                    <ListGroupItem key={idx}>
                      <div className="d-flex justify-content-between">
                        <span>Allergy: {allergy.name}</span>
                        <Badge color="danger" pill>Allergy</Badge>
                      </div>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          )}

          {/* Previous appointments card */}
          {appointment.previousAppointments && appointment.previousAppointments.length > 0 && (
            <Card>
              <CardBody>
                <h5 className="mb-3">Previous Visits</h5>
                <ListGroup flush>
                  {appointment.previousAppointments.map((prevApp, idx) => (
                    <ListGroupItem key={idx}>
                      <div className="d-flex justify-content-between mb-2">
                        <strong>{new Date(prevApp.date).toLocaleDateString()}</strong>
                        <Badge color="secondary">{prevApp.type}</Badge>
                      </div>
                      <p className="mb-1">{prevApp.reason}</p>
                      {prevApp.notes && <p className="text-muted small mb-0">{prevApp.notes}</p>}
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          )}

          {/* Appointment-specific Prescription History Card */}
          <Card className="mt-4 appointment-prescription-history-card border-success border-left">
            <CardBody>
              <h5 className="mb-3 d-flex align-items-center">
                <FaPrescriptionBottleAlt className="text-success me-2" size={20} />
                Appointment Prescriptions
              </h5>
              {loadingPrescriptions ? (
                <div className="text-center py-3">
                  <Spinner size="sm" color="success" />
                  <p className="text-muted mt-2 mb-0">Loading appointment prescriptions...</p>
                </div>
              ) : appointmentPrescriptions.length === 0 ? (
                <div className="text-center py-3">
                  <FaPrescriptionBottleAlt size={24} className="text-muted mb-2" />
                  <p className="text-muted mb-0">No prescriptions found for this appointment</p>
                </div>
              ) : (
                <div className="appointment-prescription-list">
                  {appointmentPrescriptions.map((prescription, idx) => (
                    <div key={idx} className="prescription-item mb-3 p-3 border rounded bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 d-flex align-items-center">
                          <FaPrescriptionBottleAlt className="me-2 text-success" /> 
                          <span className="diagnosis-text">{prescription.diagnosis}</span>
                        </h6>
                        <Badge color="info" pill className="px-3 py-2">
                          {new Date(prescription.issuedDate).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="prescription-medications">
                        <div className="d-flex align-items-center mb-2">
                          <FaMedkit className="text-success me-2" />
                          <strong>Medications:</strong>
                        </div>
                        <Table size="sm" bordered responsive striped className="prescription-table">
                          <thead className="bg-light">
                            <tr>
                              <th>Medication</th>
                              <th>Dosage</th>
                              <th>Frequency</th>
                              <th>Duration</th>
                              <th>Instructions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescription.medications.map((med, medIdx) => (
                              <tr key={medIdx}>
                                <td className="fw-bold">{med.name}</td>
                                <td>{med.dosage}</td>
                                <td>{med.frequency}</td>
                                <td>{med.duration}</td>
                                <td>{med.instructions || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      {prescription.notes && (
                        <div className="mt-2 prescription-notes p-2 border-top">
                          <strong>Doctor's Notes:</strong>
                          <p className="mb-0 text-muted small mt-1">{prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          {/* Recommended Medication Card */}
          <Card className="mb-4 recommended-medication-card border-primary border-left">
            <CardBody>
              <h5 className="mb-3 d-flex align-items-center">
                <FaMedkit className="text-primary me-2" size={20} />
                Recommended Medications
              </h5>
              
              <div className="recommended-medications-list">
                {appointment.reason ? (
                  <>
                    {appointment.reason.toLowerCase().includes('diabetes') && (
                      <div className="medication-recommendation p-3 border rounded mb-3 bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0 d-flex align-items-center">
                            <FaPrescriptionBottleAlt className="me-2 text-primary" /> 
                            <span>Metformin</span>
                          </h6>
                          <Badge color="info" pill className="px-3 py-2">First-line</Badge>
                        </div>
                        <p className="mb-2 small">
                          <strong>Suggested dosage:</strong> 500mg twice daily with meals
                        </p>
                        <p className="mb-0 small text-muted">
                          <strong>Note:</strong> Check kidney function before prescribing. Monitor HbA1c every 3 months.
                        </p>
                      </div>
                    )}
                    
                    {appointment.reason.toLowerCase().includes('headache') && (
                      <>
                        <div className="medication-recommendation p-3 border rounded mb-3 bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 d-flex align-items-center">
                              <FaPrescriptionBottleAlt className="me-2 text-primary" /> 
                              <span>Ibuprofen</span>
                            </h6>
                            <Badge color="success" pill className="px-3 py-2">First-line</Badge>
                          </div>
                          <p className="mb-2 small">
                            <strong>Suggested dosage:</strong> 400mg every 6-8 hours as needed for pain
                          </p>
                          <p className="mb-0 small text-muted">
                            <strong>Note:</strong> Avoid in patients with kidney disease, heart failure, or GI bleeding risk.
                          </p>
                        </div>
                        <div className="medication-recommendation p-3 border rounded mb-3 bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 d-flex align-items-center">
                              <FaPrescriptionBottleAlt className="me-2 text-primary" /> 
                              <span>Sumatriptan</span>
                            </h6>
                            <Badge color="info" pill className="px-3 py-2">For migraine</Badge>
                          </div>
                          <p className="mb-2 small">
                            <strong>Suggested dosage:</strong> 50mg at onset of migraine, may repeat after 2 hours
                          </p>
                          <p className="mb-0 small text-muted">
                            <strong>Note:</strong> Contraindicated in patients with cardiovascular disease.
                          </p>
                        </div>
                      </>
                    )}
                    
                    {appointment.reason.toLowerCase().includes('skin') || appointment.reason.toLowerCase().includes('rash') ? (
                      <>
                        <div className="medication-recommendation p-3 border rounded mb-3 bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 d-flex align-items-center">
                              <FaPrescriptionBottleAlt className="me-2 text-primary" /> 
                              <span>Hydrocortisone cream</span>
                            </h6>
                            <Badge color="success" pill className="px-3 py-2">First-line</Badge>
                          </div>
                          <p className="mb-2 small">
                            <strong>Suggested dosage:</strong> Apply thin layer to affected area 2-3 times daily
                          </p>
                          <p className="mb-0 small text-muted">
                            <strong>Note:</strong> For mild to moderate inflammatory skin conditions. Avoid prolonged use on face.
                          </p>
                        </div>
                        <div className="medication-recommendation p-3 border rounded mb-3 bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 d-flex align-items-center">
                              <FaPrescriptionBottleAlt className="me-2 text-primary" /> 
                              <span>Cetirizine</span>
                            </h6>
                            <Badge color="info" pill className="px-3 py-2">For allergic reactions</Badge>
                          </div>
                          <p className="mb-2 small">
                            <strong>Suggested dosage:</strong> 10mg once daily
                          </p>
                          <p className="mb-0 small text-muted">
                            <strong>Note:</strong> May cause drowsiness. Consider loratadine for patients who need to drive.
                          </p>
                        </div>
                      </>
                    ) : appointment.reason.toLowerCase().includes('heart') || appointment.reason.toLowerCase().includes('palpitations') ? (
                      <>
                        <div className="medication-recommendation p-3 border rounded mb-3 bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 d-flex align-items-center">
                              <FaPrescriptionBottleAlt className="me-2 text-primary" /> 
                              <span>Metoprolol</span>
                            </h6>
                            <Badge color="success" pill className="px-3 py-2">Beta-blocker</Badge>
                          </div>
                          <p className="mb-2 small">
                            <strong>Suggested dosage:</strong> 25mg twice daily, titrate as needed
                          </p>
                          <p className="mb-0 small text-muted">
                            <strong>Note:</strong> Monitor heart rate and blood pressure. Avoid in patients with asthma.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-3">
                        <FaMedkit size={24} className="text-muted mb-2" />
                        <p className="text-muted mb-0">Select a condition from the clinical notes to see medication recommendations</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-3">
                    <FaMedkit size={24} className="text-muted mb-2" />
                    <p className="text-muted mb-0">No reason specified for this appointment</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Clinical Notes Card - Moved below Recommended Medications */}
          <Card className="mb-4">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Clinical Notes</h5>
                <div className="d-flex align-items-center">
                  {recognition && appointment.status !== 'completed' && (
                    <Button 
                      color={isRecording ? "danger" : "secondary"} 
                      size="sm" 
                      onClick={toggleRecording}
                      className="me-2"
                    >
                      <FaMicrophone className="me-1" /> {isRecording ? "Stop" : "Dictate"}
                    </Button>
                  )}
                  {appointment.status !== 'completed' && (
                    <div className="dropdown">
                      <Button
                        color="light"
                        size="sm"
                        id="formatDropdown"
                        className="dropdown-toggle"
                        onClick={() => setFormatDropdownOpen(!formatDropdownOpen)}
                      >
                        <FaFileAlt className="me-1" /> Format
                      </Button>
                      <div className={`dropdown-menu ${formatDropdownOpen ? 'show' : ''}`} aria-labelledby="formatDropdown">
                        <a 
                          className="dropdown-item" 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            applyFormat('standard');
                          }}
                        >
                          Standard SOAP
                        </a>
                        <a 
                          className="dropdown-item" 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            applyFormat('followUp');
                          }}
                        >
                          Follow-up Visit
                        </a>
                        <a 
                          className="dropdown-item" 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            applyFormat('consultation');
                          }}
                        >
                          Specialist Consultation
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {isRecording && (
                <Alert color="info" className="d-flex align-items-center" timeout={0}>
                  <Spinner size="sm" className="me-2" />
                  <span>Recording... Speak clearly.</span>
                </Alert>
              )}
              
              <Input
                type="textarea"
                rows={6}
                className="clinical-notes-input mb-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your clinical notes here..."
                readOnly={appointment.status === 'completed'}
              />
            </CardBody>
          </Card>

          {/* Only show Appointment Actions for non-completed appointments */}
          {appointment.status !== 'completed' && (
            <Card className="mb-4">
              <CardBody>
                <h5 className="mb-3">Appointment Actions</h5>
                <div className="d-grid gap-2">
                  {appointment.type === 'Video Call' && appointment.status === 'confirmed' && (
                    <Button color="success">
                      <FaVideo className="me-1" /> Start Video Consultation
                    </Button>
                  )}
                  {appointment.type === 'Phone Call' && appointment.status === 'confirmed' && (
                    <Button color="info">
                      <FaPhoneAlt className="me-1" /> Start Phone Call
                    </Button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <Button color="primary" onClick={() => onCompleteAppointment(appointment.id)}>
                      <FaCheck className="me-1" /> Mark as Completed
                    </Button>
                  )}
                  {appointment.status === 'pending' && (
                    <div className="d-flex">
                      <Button 
                        color="success" 
                        className="me-2 flex-grow-1"
                        onClick={() => onAcceptAppointment(appointment)}
                      >
                        <FaCheck className="me-1" /> Accept
                      </Button>
                      <Button 
                        color="danger"
                        className="flex-grow-1"
                        onClick={() => onDeclineAppointment(appointment)}
                      >
                        <FaTimes className="me-1" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        toggle={togglePrescriptionModal}
        appointmentId={appointment.id}
        patientName={appointment.patientName}
      />
    </div>
  );
};

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); 
  const [appointments, setAppointments] = useState({
    pendingAppointments: [],
    acceptedAppointments: [],
    confirmedAppointments: [],
    pastAppointments: [],
    declinedAppointments: []
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailView, setDetailView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
  });
  const [responseModal, setResponseModal] = useState({
    isOpen: false,
    appointmentId: null,
    action: null,
    notes: '',
    isSubmitting: false
  });

  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    appointmentId: null,
    currentDate: null,
    currentTime: '',
    newDate: null,
    newTime: '',
    notes: '',
    isSubmitting: false
  });

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [currentPrescriptionAppointment, setCurrentPrescriptionAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/appointments/doctor', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please log in again.');
          return;
        }
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAppointments({
          pendingAppointments: data.data.pendingAppointments || [],
          acceptedAppointments: data.data.acceptedAppointments || [],
          confirmedAppointments: data.data.confirmedAppointments || [],
          pastAppointments: data.data.pastAppointments || [],
          declinedAppointments: data.data.declinedAppointments || []
        });
      } else {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const respondToAppointment = async (appointmentId, action, notes) => {
    try {
      setResponseModal({...responseModal, isSubmitting: true});
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, notes })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} appointment`);
      }
      
      // Show success message
      toast.success(`Appointment ${action === 'accept' ? 'accepted' : 'declined'} successfully`);
      
      // Refresh appointments
      fetchAppointments();
      
      // Close modal
      setResponseModal({
        isOpen: false,
        appointmentId: null,
        action: null,
        notes: '',
        isSubmitting: false
      });
    } catch (error) {
      console.error(`Error ${responseModal.action}ing appointment:`, error);
      toast.error(error.message || `Failed to ${responseModal.action} appointment`);
    } finally {
      setResponseModal({...responseModal, isSubmitting: false});
    }
  };

  const addClinicalNotes = async (appointmentId, notes) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save notes');
      }
      
      toast.success('Clinical notes saved successfully');
      
      // Update the appointment in state to include the new notes
      setSelectedAppointment({...selectedAppointment, notes});
      
      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error saving clinical notes:', error);
      toast.error(error.message || 'Failed to save clinical notes');
    }
  };

  const markAppointmentCompleted = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      // Get the notes from the selected appointment detail view
      // This ensures we're getting the most up-to-date version that the doctor has been editing
      const clinicalNotes = document.querySelector('.clinical-notes-input').value;
      
      console.log('Sending clinical notes to server:', clinicalNotes);
      
      // Use our API endpoint to complete the appointment with notes in a single request
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: clinicalNotes }) // Send the current text area content
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete appointment');
      }
      
      toast.success('Appointment completed and notes saved successfully');
      
      // Close detail view and refresh appointments
      setDetailView(false);
      setSelectedAppointment(null);
      fetchAppointments();
      
      // Switch to history tab
      setActiveTab('past');
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error(error.message || 'Failed to complete appointment');
    }
  };

  const handleAcceptAppointment = (appointment) => {
    setResponseModal({
      isOpen: true,
      appointmentId: appointment.id,
      action: 'accept',
      notes: '',
      isSubmitting: false
    });
  };

  const handleDeclineAppointment = (appointment) => {
    setResponseModal({
      isOpen: true,
      appointmentId: appointment.id,
      action: 'decline',
      notes: '',
      isSubmitting: false
    });
  };

  const handleRescheduleRequest = (appointment) => {
    setRescheduleModal({
      isOpen: true,
      appointmentId: appointment.id,
      currentDate: new Date(appointment.date),
      currentTime: appointment.time,
      newDate: new Date(appointment.date),
      newTime: appointment.time,
      notes: '',
      isSubmitting: false
    });
  };

  const submitReschedule = async () => {
    try {
      setRescheduleModal({...rescheduleModal, isSubmitting: true});
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const rescheduleData = {
        newDate: rescheduleModal.newDate,
        newTime: rescheduleModal.newTime,
        notes: rescheduleModal.notes,
        action: 'reschedule'
      };
      
      const response = await fetch(`http://localhost:5000/api/appointments/${rescheduleModal.appointmentId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(rescheduleData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reschedule appointment');
      }
      
      toast.success('Reschedule request sent to patient');
      
      fetchAppointments();
      
      setRescheduleModal({
        isOpen: false,
        appointmentId: null,
        currentDate: null,
        currentTime: '',
        newDate: null,
        newTime: '',
        notes: '',
        isSubmitting: false
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error(error.message || 'Failed to reschedule appointment');
    } finally {
      setRescheduleModal({...rescheduleModal, isSubmitting: false});
    }
  };

  const handleViewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailView(true);
  };

  const handleCloseDetailView = () => {
    setDetailView(false);
    setSelectedAppointment(null);
  };

  const handleOpenPrescriptionModal = (appointment) => {
    setCurrentPrescriptionAppointment(appointment);
    setIsPrescriptionModalOpen(true);
  };

  const togglePrescriptionModal = () => {
    setIsPrescriptionModalOpen(!isPrescriptionModalOpen);
  };

  const getAppointmentsForTab = (tab) => {
    switch(tab) {
      case 'pending':
        return appointments.pendingAppointments;
      case 'upcoming':
        return [...appointments.acceptedAppointments, ...appointments.confirmedAppointments];
      case 'past':
        return appointments.pastAppointments;
      case 'declined':
        return appointments.declinedAppointments;
      default:
        return [];
    }
  };

  if (error) {
    return (
      <Container className="py-5">
        <Alert color="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="doctor-appointments-page py-4">
      <h2 className="mb-4 fw-bold text-dark">Appointment Management</h2>
      
      {detailView ? (
        <Card className="shadow-sm border-0">
          <CardBody>
            <AppointmentDetailView 
              appointment={selectedAppointment}
              onClose={handleCloseDetailView}
              onAddNote={(notes) => addClinicalNotes(selectedAppointment.id, notes)}
              onCompleteAppointment={markAppointmentCompleted}
              onAcceptAppointment={handleAcceptAppointment}
              onDeclineAppointment={handleDeclineAppointment}
            />
          </CardBody>
        </Card>
      ) : (
        <Card className="shadow-sm border-0 mb-4">
          <CardBody className="p-0">
            <Nav tabs className="appointment-tabs border-0 p-3 bg-light rounded-top">
              <NavItem>
                <NavLink
                  className={`${activeTab === 'upcoming' ? 'active text-primary fw-bold border-bottom border-primary border-3' : 'text-secondary'} border-0 px-4 py-2`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  <FaCalendarAlt className="me-2" /> 
                  Upcoming
                  {(appointments.acceptedAppointments.length + appointments.confirmedAppointments.length) > 0 && (
                    <Badge color="primary" pill className="ms-2">
                      {appointments.acceptedAppointments.length + appointments.confirmedAppointments.length}
                    </Badge>
                  )}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={`${activeTab === 'pending' ? 'active text-primary fw-bold border-bottom border-primary border-3' : 'text-secondary'} border-0 px-4 py-2`}
                  onClick={() => setActiveTab('pending')}
                >
                  <FaExclamationTriangle className="me-2" /> 
                  Pending Requests
                  {appointments.pendingAppointments.length > 0 && (
                    <Badge color="danger" pill className="ms-2">{appointments.pendingAppointments.length}</Badge>
                  )}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={`${activeTab === 'past' ? 'active text-primary fw-bold border-bottom border-primary border-3' : 'text-secondary'} border-0 px-4 py-2`}
                  onClick={() => setActiveTab('past')}
                >
                  <FaHistory className="me-2" /> 
                  History
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={`${activeTab === 'declined' ? 'active text-primary fw-bold border-bottom border-primary border-3' : 'text-secondary'} border-0 px-4 py-2`}
                  onClick={() => setActiveTab('declined')}
                >
                  <FaTimes className="me-2" /> 
                  Declined
                </NavLink>
              </NavItem>
            </Nav>
            
            <div className="p-4">
              <TabContent activeTab={activeTab}>
                <TabPane tabId="pending">
                  <Row>
                    {appointments.pendingAppointments.length === 0 ? (
                      <Col className="text-center py-5">
                        <FaExclamationTriangle size={30} className="text-muted mb-3" />
                        <p className="text-muted">No pending appointment requests</p>
                      </Col>
                    ) : (
                      appointments.pendingAppointments.map(appointment => (
                        <Col lg={6} key={appointment.id} className="mb-4">
                          <AppointmentCard
                            appointment={appointment}
                            onViewDetails={handleViewAppointmentDetails}
                            onAcceptAppointment={handleAcceptAppointment}
                            onDeclineAppointment={handleDeclineAppointment}
                            onRescheduleRequest={handleRescheduleRequest}
                            onOpenPrescriptionModal={handleOpenPrescriptionModal}
                          />
                        </Col>
                      ))
                    )}
                  </Row>
                </TabPane>
                <TabPane tabId="upcoming">
                  <Row>
                    {[...appointments.acceptedAppointments, ...appointments.confirmedAppointments].length === 0 ? (
                      <Col className="text-center py-5">
                        <FaCalendarAlt size={30} className="text-muted mb-3" />
                        <p className="text-muted">No upcoming appointments</p>
                      </Col>
                    ) : (
                      [...appointments.acceptedAppointments, ...appointments.confirmedAppointments].map(appointment => (
                        <Col lg={6} key={appointment.id} className="mb-4">
                          <AppointmentCard
                            appointment={appointment}
                            onViewDetails={handleViewAppointmentDetails}
                            onAcceptAppointment={handleAcceptAppointment}
                            onDeclineAppointment={handleDeclineAppointment}
                            onRescheduleRequest={handleRescheduleRequest}
                            onOpenPrescriptionModal={handleOpenPrescriptionModal}
                          />
                        </Col>
                      ))
                    )}
                  </Row>
                </TabPane>
                <TabPane tabId="past">
                  <Row>
                    {appointments.pastAppointments.length === 0 ? (
                      <Col className="text-center py-5">
                        <FaHistory size={30} className="text-muted mb-3" />
                        <p className="text-muted">No appointment history</p>
                      </Col>
                    ) : (
                      appointments.pastAppointments.map(appointment => (
                        <Col lg={6} key={appointment.id} className="mb-4">
                          <AppointmentCard
                            appointment={appointment}
                            onViewDetails={handleViewAppointmentDetails}
                            onOpenPrescriptionModal={handleOpenPrescriptionModal}
                          />
                        </Col>
                      ))
                    )}
                  </Row>
                </TabPane>
                <TabPane tabId="declined">
                  <Row>
                    {appointments.declinedAppointments.length === 0 ? (
                      <Col className="text-center py-5">
                        <FaTimes size={30} className="text-muted mb-3" />
                        <p className="text-muted">No declined appointments</p>
                      </Col>
                    ) : (
                      appointments.declinedAppointments.map(appointment => (
                        <Col lg={6} key={appointment.id} className="mb-4">
                          <AppointmentCard
                            appointment={appointment}
                            onViewDetails={handleViewAppointmentDetails}
                            onOpenPrescriptionModal={handleOpenPrescriptionModal}
                          />
                        </Col>
                      ))
                    )}
                  </Row>
                </TabPane>
              </TabContent>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Modal components remain unchanged */}
      {currentPrescriptionAppointment && (
        <PrescriptionModal
          isOpen={isPrescriptionModalOpen}
          toggle={togglePrescriptionModal}
          appointmentId={currentPrescriptionAppointment.id}
          patientName={currentPrescriptionAppointment.patientName}
        />
      )}

      {/* Response Modal */}
      <Modal isOpen={responseModal.isOpen} toggle={() => setResponseModal({...responseModal, isOpen: !responseModal.isOpen})}>
        <ModalHeader toggle={() => setResponseModal({...responseModal, isOpen: !responseModal.isOpen})}>
          {responseModal.action === 'accept' ? 'Accept Appointment' : 'Decline Appointment'}
        </ModalHeader>
        <ModalBody>
          <p>
            {responseModal.action === 'accept'
              ? 'Do you want to accept this appointment request?'
              : 'Do you want to decline this appointment request?'
            }
          </p>
          <FormGroup>
            <Label for="responseNotes">Notes (optional)</Label>
            <Input
              type="textarea"
              id="responseNotes"
              rows={4}
              value={responseModal.notes}
              onChange={(e) => setResponseModal({...responseModal, notes: e.target.value})}
              placeholder={responseModal.action === 'accept'
                ? "Any special instructions for the patient..."
                : "Reason for declining the appointment..."
              }
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setResponseModal({...responseModal, isOpen: false})}>
            Cancel
          </Button>
          <Button
            color={responseModal.action === 'accept' ? "success" : "danger"}
            onClick={() => respondToAppointment(responseModal.appointmentId, responseModal.action, responseModal.notes)}
            disabled={responseModal.isSubmitting}
          >
            {responseModal.isSubmitting ? (
              <><Spinner size="sm" className="me-2" /> Processing...</>
            ) : (
              responseModal.action === 'accept' ? 'Accept' : 'Decline'
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reschedule Modal */}
      <Modal isOpen={rescheduleModal.isOpen} toggle={() => setRescheduleModal({...rescheduleModal, isOpen: !rescheduleModal.isOpen})}>
        <ModalHeader toggle={() => setRescheduleModal({...rescheduleModal, isOpen: !rescheduleModal.isOpen})}>
          Reschedule Appointment
        </ModalHeader>
        <ModalBody>
          <p>Current Date and Time: {rescheduleModal.currentDate?.toLocaleDateString()} at {rescheduleModal.currentTime}</p>
          <FormGroup>
            <Label for="newDate">New Date</Label>
            <DatePicker
              selected={rescheduleModal.newDate}
              onChange={(date) => setRescheduleModal({...rescheduleModal, newDate: date})}
              className="form-control"
              id="newDate"
            />
          </FormGroup>
          <FormGroup>
            <Label for="newTime">New Time</Label>
            <Input
              type="time"
              id="newTime"
              value={rescheduleModal.newTime}
              onChange={(e) => setRescheduleModal({...rescheduleModal, newTime: e.target.value})}
            />
          </FormGroup>
          <FormGroup>
            <Label for="rescheduleNotes">Notes (optional)</Label>
            <Input
              type="textarea"
              id="rescheduleNotes"
              rows={4}
              value={rescheduleModal.notes}
              onChange={(e) => setRescheduleModal({...rescheduleModal, notes: e.target.value})}
              placeholder="Reason for rescheduling or any additional notes..."
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setRescheduleModal({...rescheduleModal, isOpen: false})}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={submitReschedule}
            disabled={rescheduleModal.isSubmitting}
          >
            {rescheduleModal.isSubmitting ? (
              <><Spinner size="sm" className="me-2" /> Processing...</>
            ) : (
              'Submit Reschedule'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default DoctorAppointments;