import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, CardBody, CardHeader, 
  Badge, Button, ListGroup, ListGroupItem, Progress,
  Table, Nav, NavItem, NavLink, Alert
} from 'reactstrap';
import { 
  FaUserMd, FaCalendarCheck, FaChartLine, FaUserInjured, 
  FaBell, FaClipboardList, FaVideo, FaPhoneAlt, FaClinicMedical,
  FaExclamationTriangle, FaNotesMedical, FaPrescription,
  FaArrowRight, FaSearch, FaRegClock, FaStethoscope, FaStar
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './DoctorDashboard.css';

// Mock data - would be replaced with API calls in production
const mockData = {
  doctor: {
    name: "Dr. Samantha Wilson",
    specialty: "Cardiologist",
    rating: 4.8,
    totalPatients: 487,
    todayAppointments: 8,
    pendingRequests: 3
  },
  appointments: [
    {
      id: 1,
      patientName: "John Smith",
      patientAge: 58,
      type: "Video Call",
      time: "09:30 AM",
      status: "confirmed",
      reason: "Follow-up on hypertension medication",
      profileImg: null
    },
    {
      id: 2,
      patientName: "Emma Johnson",
      patientAge: 42,
      type: "In-Person Visit",
      time: "11:00 AM",
      status: "confirmed",
      reason: "Annual physical examination",
      profileImg: null
    },
    {
      id: 3,
      patientName: "Michael Brown",
      patientAge: 65,
      type: "Phone Call",
      time: "02:15 PM",
      status: "confirmed",
      reason: "Discussion of recent lab results",
      profileImg: null
    }
  ],
  patientDistribution: {
    byGender: { male: 45, female: 52, other: 3 },
    byAge: { "0-17": 10, "18-34": 25, "35-50": 28, "51-65": 22, "65+": 15 }
  },
  recentPatients: [
    {
      id: 101,
      name: "Sarah Miller",
      lastVisit: "2023-04-22",
      condition: "Type 2 Diabetes",
      status: "Stable",
      adherence: 85
    },
    {
      id: 102,
      name: "Robert Chen",
      lastVisit: "2023-04-20",
      condition: "Hypertension",
      status: "Improving",
      adherence: 92
    },
    {
      id: 103,
      name: "Jennifer Williams",
      lastVisit: "2023-04-18",
      condition: "Asthma",
      status: "Needs Attention",
      adherence: 68
    }
  ],
  notifications: [
    {
      id: 1,
      type: "lab-results",
      message: "Lab results ready for patient James Wilson",
      time: "20 minutes ago",
      urgent: false
    },
    {
      id: 2,
      type: "medication-alert",
      message: "Potential medication interaction detected for patient Emma Johnson",
      time: "1 hour ago",
      urgent: true
    },
    {
      id: 3,
      type: "appointment-request",
      message: "New urgent appointment request from Maria Garcia",
      time: "2 hours ago",
      urgent: true
    }
  ],
  performanceMetrics: {
    patientSatisfaction: 92,
    diagnosisAccuracy: 96,
    averageWaitTime: "12 mins"
  }
};

const DoctorDashboard = () => {
  // State for data - would be populated from API calls
  const [doctor, setDoctor] = useState(mockData.doctor);
  const [appointments, setAppointments] = useState(mockData.appointments);
  const [patientDistribution, setPatientDistribution] = useState(mockData.patientDistribution);
  const [recentPatients, setRecentPatients] = useState(mockData.recentPatients);
  const [notifications, setNotifications] = useState(mockData.notifications);
  const [performanceMetrics, setPerformanceMetrics] = useState(mockData.performanceMetrics);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // In a real app, you'd fetch this data from your API
  useEffect(() => {
    // Async function to fetch data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // API calls would go here
        // const doctorResponse = await getDoctorProfile(user.id);
        // setDoctor(doctorResponse);
        // etc.

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    // Comment out to use mock data for now
    // fetchDashboardData();
  }, [user]);

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'stable': return 'info';
      case 'improving': return 'success';
      case 'needs attention': return 'warning';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  // Helper function for appointment type icon
  const getAppointmentTypeIcon = (type) => {
    switch (type) {
      case 'Video Call': return <FaVideo className="me-2" />;
      case 'Phone Call': return <FaPhoneAlt className="me-2" />;
      case 'In-Person Visit': return <FaClinicMedical className="me-2" />;
      default: return <FaCalendarCheck className="me-2" />;
    }
  };

  return (
    <Container fluid className="p-4 doctor-dashboard">
      {/* Welcome Section with Quick Stats */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm welcome-card">
            <CardBody>
              <Row className="align-items-center">
                <Col md={8}>
                  <h2 className="mb-1">Welcome back, {doctor.name}</h2>
                  <p className="text-muted mb-0">
                    {doctor.specialty} • <FaStar className="text-warning" /> {doctor.rating}
                  </p>
                  <div className="mt-3 d-flex flex-wrap">
                    <div className="me-4 mb-2">
                      <p className="stat-label mb-0">Total Patients</p>
                      <h3 className="stat-value mb-0">{doctor.totalPatients}</h3>
                    </div>
                    <div className="me-4 mb-2">
                      <p className="stat-label mb-0">Today's Appointments</p>
                      <h3 className="stat-value mb-0">{doctor.todayAppointments}</h3>
                    </div>
                    <div className="mb-2">
                      <p className="stat-label mb-0">Pending Requests</p>
                      <h3 className="stat-value mb-0">
                        {doctor.pendingRequests > 0 ? (
                          <Badge color="danger" pill>{doctor.pendingRequests}</Badge>
                        ) : 0}
                      </h3>
                    </div>
                  </div>
                </Col>
                <Col md={4} className="d-none d-md-block">
                  <div className="quick-actions text-end">
                    <Button color="primary" className="me-2 mb-2">
                      <FaCalendarCheck className="me-1" /> Appointment
                    </Button>
                    <Button outline color="info" className="mb-2">
                      <FaSearch className="me-1" /> Find Patient
                    </Button>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Main Dashboard Content */}
      <Row>
        {/* Left Column - 8 units */}
        <Col lg={8}>
          {/* Today's Appointments */}
          <Card className="mb-4 shadow-sm">
            <CardHeader className="d-flex justify-content-between align-items-center bg-white">
              <h5 className="mb-0">
                <FaCalendarCheck className="me-2 text-primary" />
                Today's Appointments
              </h5>
              <Link to="/doctor/appointments" className="text-decoration-none">
                <small>View All <FaArrowRight size={12} /></small>
              </Link>
            </CardHeader>
            <CardBody>
              {appointments.length === 0 ? (
                <Alert color="info">
                  No appointments scheduled for today.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover borderless className="align-middle">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(appointment => (
                        <tr key={appointment.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle me-2 bg-light text-primary">
                                {appointment.patientName.charAt(0)}
                              </div>
                              <div>
                                <p className="mb-0 fw-bold">{appointment.patientName}</p>
                                <small className="text-muted">{appointment.patientAge} years</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaRegClock className="me-1 text-info" />
                              {appointment.time}
                            </div>
                          </td>
                          <td>
                            <Badge 
                              color={
                                appointment.type === 'Video Call' ? 'primary' : 
                                appointment.type === 'Phone Call' ? 'info' : 
                                'success'
                              } 
                              pill
                            >
                              {getAppointmentTypeIcon(appointment.type)}
                              {appointment.type}
                            </Badge>
                          </td>
                          <td>
                            <Badge 
                              color={appointment.status === 'confirmed' ? 'success' : 'warning'} 
                              pill
                            >
                              {appointment.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex">
                              {appointment.type === 'Video Call' && (
                                <Button color="primary" size="sm" className="me-1">
                                  <FaVideo /> Start
                                </Button>
                              )}
                              <Button outline color="secondary" size="sm">
                                Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Patients Section */}
          <Card className="mb-4 shadow-sm">
            <CardHeader className="d-flex justify-content-between align-items-center bg-white">
              <h5 className="mb-0">
                <FaUserInjured className="me-2 text-primary" />
                Recent Patient Activity
              </h5>
              <Link to="/doctor/patients" className="text-decoration-none">
                <small>View All <FaArrowRight size={12} /></small>
              </Link>
            </CardHeader>
            <CardBody>
              <ListGroup flush>
                {recentPatients.map(patient => (
                  <ListGroupItem key={patient.id} className="px-0 py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{patient.name}</h6>
                        <p className="mb-0 text-muted small">
                          <span className="me-3">
                            <FaStethoscope className="me-1" />
                            {patient.condition}
                          </span>
                          <span>
                            <FaCalendarCheck className="me-1" />
                            Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                      <div className="text-end">
                        <Badge 
                          color={getStatusBadgeColor(patient.status)} 
                          pill
                          className="mb-2 d-block"
                        >
                          {patient.status}
                        </Badge>
                        <small className="text-muted d-block">
                          Adherence: {patient.adherence}%
                        </small>
                        <Progress 
                          value={patient.adherence}
                          color={patient.adherence > 80 ? 'success' : 
                                (patient.adherence > 60 ? 'warning' : 'danger')}
                          className="mt-1"
                          style={{ height: '5px' }}
                        />
                      </div>
                    </div>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </CardBody>
          </Card>
        </Col>

        {/* Right Column - 4 units */}
        <Col lg={4}>
          {/* Performance Metrics */}
          <Card className="mb-4 shadow-sm">
            <CardHeader className="bg-white">
              <h5 className="mb-0">
                <FaChartLine className="me-2 text-primary" />
                Performance Metrics
              </h5>
            </CardHeader>
            <CardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Patient Satisfaction</span>
                  <span className="text-success">{performanceMetrics.patientSatisfaction}%</span>
                </div>
                <Progress 
                  value={performanceMetrics.patientSatisfaction} 
                  color="success"
                  className="mb-2"
                />
                
                <div className="d-flex justify-content-between mb-1">
                  <span>Diagnosis Accuracy</span>
                  <span className="text-info">{performanceMetrics.diagnosisAccuracy}%</span>
                </div>
                <Progress 
                  value={performanceMetrics.diagnosisAccuracy} 
                  color="info"
                  className="mb-2"
                />
                
                <div className="d-flex align-items-center mt-3">
                  <div className="metric-circle bg-light me-3 d-flex align-items-center justify-content-center">
                    <FaRegClock className="text-primary" />
                  </div>
                  <div>
                    <p className="mb-0 small text-muted">Average Wait Time</p>
                    <h5 className="mb-0">{performanceMetrics.averageWaitTime}</h5>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Notifications */}
          <Card className="mb-4 shadow-sm">
            <CardHeader className="bg-white">
              <h5 className="mb-0">
                <FaBell className="me-2 text-primary" />
                Notifications
              </h5>
            </CardHeader>
            <CardBody className="p-0">
              <ListGroup flush>
                {notifications.map(notification => (
                  <ListGroupItem key={notification.id} className="border-0 border-bottom px-3 py-3">
                    <div className="d-flex">
                      <div className={`notification-icon ${notification.urgent ? 'urgent' : ''} me-3`}>
                        {notification.urgent && <FaExclamationTriangle />}
                        {!notification.urgent && (
                          notification.type === 'lab-results' ? <FaClipboardList /> :
                          notification.type === 'medication-alert' ? <FaPrescription /> :
                          <FaBell />
                        )}
                      </div>
                      <div>
                        <p className="mb-1">
                          {notification.urgent && (
                            <Badge color="danger" pill className="me-1">Urgent</Badge>
                          )}
                          {notification.message}
                        </p>
                        <small className="text-muted">{notification.time}</small>
                      </div>
                    </div>
                  </ListGroupItem>
                ))}
              </ListGroup>
              <div className="p-3 text-center">
                <Button color="link" size="sm" className="text-decoration-none">
                  View All Notifications
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Patient Distribution */}
          <Card className="mb-4 shadow-sm">
            <CardHeader className="bg-white">
              <h5 className="mb-0">
                <FaUserMd className="me-2 text-primary" />
                Patient Demographics
              </h5>
            </CardHeader>
            <CardBody>
              <div className="mb-4">
                <h6>By Age Group</h6>
                {Object.entries(patientDistribution.byAge).map(([ageGroup, percentage]) => (
                  <div key={ageGroup} className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <small>{ageGroup}</small>
                      <small>{percentage}%</small>
                    </div>
                    <Progress value={percentage} className="mb-1" style={{ height: '8px' }} />
                  </div>
                ))}
              </div>
              
              <div>
                <h6>By Gender</h6>
                <div className="d-flex justify-content-around text-center mt-3">
                  {Object.entries(patientDistribution.byGender).map(([gender, value]) => (
                    <div key={gender} className="gender-stat">
                      <div className={`gender-icon ${gender.toLowerCase()}`}>
                        {gender.charAt(0).toUpperCase()}
                      </div>
                      <div className="mt-2">
                        <h5 className="mb-0">{value}%</h5>
                        <small className="text-capitalize text-muted">{gender}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorDashboard;