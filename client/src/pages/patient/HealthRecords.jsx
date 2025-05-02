import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Card, CardBody, Button, Badge, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileMedical, faPills, faHeartbeat, faSyringe, 
  faUserMd, faExclamationTriangle, faDownload, faShare 
} from '@fortawesome/free-solid-svg-icons';
import HealthRecordsNavigation from '../../components/patient/HealthRecordsNavigation';
import MedicalInfoCard from '../../components/patient/MedicalInfoCard';
import MedicalHistoryItem from '../../components/patient/MedicalHistoryItem';
import VitalsChart from '../../components/patient/VitalsChart';
import './HealthRecords.css';

const HealthRecords = () => {
  // State management
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [chronicConditions, setChronicConditions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [imagingReports, setImagingReports] = useState([]);
  const [vitalsHistory, setVitalsHistory] = useState({});
  const [immunizations, setImmunizations] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  // Load mock data function as fallback only (will be used if API fails)
  const loadMockData = () => {
    console.warn("API calls failed - Using mock data as fallback");
    
    // Mock data implementation remains for fallback purposes only
    // ...existing code...
  };

  // Fetch patient data from API endpoints
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`
        };
        
        const API_BASE_URL = 'http://localhost:5000/api/patient';
        
        try {
          // Fetch all data in parallel for better performance
          const [
            profileResponse,
            contactsResponse,
            historyResponse,
            allergiesResponse,
            conditionsResponse,
            medicationsResponse,
            vitalsResponse,
            immunizationsResponse
          ] = await Promise.all([
            fetch(`${API_BASE_URL}/profile`, { headers }),
            fetch(`${API_BASE_URL}/emergency-contacts`, { headers }),
            fetch(`${API_BASE_URL}/medical-history`, { headers }),
            fetch(`${API_BASE_URL}/allergies`, { headers }),
            fetch(`${API_BASE_URL}/chronic-conditions`, { headers }),
            fetch(`${API_BASE_URL}/medications`, { headers }),
            fetch(`${API_BASE_URL}/vitals-history`, { headers }),
            fetch(`${API_BASE_URL}/immunizations`, { headers })
          ]);

          // Process all responses
          if (!profileResponse.ok) {
            throw new Error('Failed to fetch patient profile');
          }

          // Process and set data for each response
          const profileData = await profileResponse.json();
          setPatientProfile(profileData.data);

          if (contactsResponse.ok) {
            const contactsData = await contactsResponse.json();
            setEmergencyContacts(contactsData.data);
          }

          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            setMedicalHistory(historyData.data);
          }

          if (allergiesResponse.ok) {
            const allergiesData = await allergiesResponse.json();
            setAllergies(allergiesData.data);
          }

          if (conditionsResponse.ok) {
            const conditionsData = await conditionsResponse.json();
            setChronicConditions(conditionsData.data);
          }

          if (medicationsResponse.ok) {
            const medicationsData = await medicationsResponse.json();
            setMedications(medicationsData.data);
          }

          // Use mock data for lab results and imaging reports since APIs don't exist
          setLabResults([]);
          setImagingReports([]);

          if (vitalsResponse.ok) {
            const vitalsData = await vitalsResponse.json();
            setVitalsHistory(vitalsData.data);
          }

          if (immunizationsResponse.ok) {
            const immunizationsData = await immunizationsResponse.json();
            setImmunizations(immunizationsData.data);
          }

          setLoading(false);
          
        } catch (err) {
          console.error('Error fetching health records:', err);
          setError(`Error fetching data: ${err.message}`);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in health records data fetch:', err);
        setError(`Something went wrong: ${err.message}`);
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  // Profile information card
  const PatientProfileCard = () => (
    <MedicalInfoCard
      title="Patient Profile"
      icon={<FontAwesomeIcon icon={faUserMd} />}
      className="profile-card"
    >
      {patientProfile && (
        <Row>
          <Col md={6}>
            <p><strong>Name:</strong> {patientProfile.name || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> {patientProfile.dateOfBirth ? new Date(patientProfile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Gender:</strong> {patientProfile.gender || 'N/A'}</p>
            <p><strong>Blood Type:</strong> {patientProfile.bloodType || 'N/A'}</p>
          </Col>
          <Col md={6}>
            <p><strong>Height:</strong> {patientProfile.height || 'N/A'}</p>
            <p><strong>Weight:</strong> {patientProfile.weight || 'N/A'}</p>
            <p><strong>Email:</strong> {patientProfile.contactInfo?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {patientProfile.contactInfo?.phone || 'N/A'}</p>
          </Col>
        </Row>
      )}
      {!patientProfile && (
        <p className="text-muted">Patient profile information not available</p>
      )}
    </MedicalInfoCard>
  );

  // Emergency contacts card
  const EmergencyContactCard = () => (
    <MedicalInfoCard
      title="Emergency Contacts"
      icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
      className="emergency-contacts-card"
    >
      {emergencyContacts.map((contact, index) => (
        <div key={index} className="mb-3">
          <p className="mb-1"><strong>{contact.name}</strong> ({contact.relationship})</p>
          <p className="mb-1">
            <a href={`tel:${contact.phone}`} className="text-decoration-none">
              <i className="fas fa-phone-alt me-2"></i>{contact.phone}
            </a>
          </p>
          {contact.email && (
            <p className="mb-0">
              <a href={`mailto:${contact.email}`} className="text-decoration-none">
                <i className="fas fa-envelope me-2"></i>{contact.email}
              </a>
            </p>
          )}
        </div>
      ))}
    </MedicalInfoCard>
  );

  // Allergies card with severity indicators
  const AllergiesCard = () => (
    <MedicalInfoCard
      title="Allergies"
      icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
      className="allergies-card"
    >
      {allergies.length > 0 ? (
        allergies.map((allergy, index) => (
          <div key={index} className="allergy-item mb-2">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <span 
                  className={`allergy-severity-indicator me-2 ${
                    allergy.severity === 'Severe' ? 'bg-danger' : 
                    allergy.severity === 'Moderate' ? 'bg-warning' : 'bg-info'
                  }`}
                ></span>
                <div>
                  <h6 className="mb-0">{allergy.allergen}</h6>
                  <small className="text-muted">
                    Reaction: {allergy.reaction} • Identified: {new Date(allergy.dateIdentified).toLocaleDateString()}
                  </small>
                </div>
              </div>
              <Badge 
                color={
                  allergy.severity === 'Severe' ? 'danger' : 
                  allergy.severity === 'Moderate' ? 'warning' : 'info'
                }
              >
                {allergy.severity}
              </Badge>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">No allergies recorded</p>
      )}
    </MedicalInfoCard>
  );

  // Chronic conditions card
  const ChronicConditionsCard = () => (
    <MedicalInfoCard
      title="Chronic Conditions"
      icon={<FontAwesomeIcon icon={faFileMedical} />}
      className="conditions-card"
    >
      {chronicConditions.length > 0 ? (
        chronicConditions.map((condition, index) => (
          <div key={index} className="condition-item mb-2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-0">{condition.condition}</h6>
                <small className="text-muted">
                  Since: {new Date(condition.diagnosedDate).toLocaleDateString()} • 
                  Provider: {condition.treatingProvider}
                </small>
              </div>
              <Badge 
                color={
                  condition.status === 'Controlled' ? 'success' : 
                  condition.status === 'Monitoring' ? 'info' : 
                  condition.status === 'Worsening' ? 'danger' : 'warning'
                }
              >
                {condition.status}
              </Badge>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">No chronic conditions recorded</p>
      )}
    </MedicalInfoCard>
  );

  // Medication card with adherence indicators
  const MedicationsCard = () => (
    <MedicalInfoCard
      title="Current Medications"
      icon={<FontAwesomeIcon icon={faPills} />}
      className="medications-card"
    >
      {medications.length > 0 ? (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Schedule</th>
                <th>Purpose</th>
                <th>Adherence</th>
                <th>Refill</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((med, index) => (
                <tr key={index}>
                  <td className="fw-bold">{med.name}</td>
                  <td>{med.dosage}</td>
                  <td>{med.frequency}</td>
                  <td>{med.purpose}</td>
                  <td className="align-middle">
                    <div className="d-flex align-items-center">
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${
                            med.adherence >= 90 ? 'bg-success' : 
                            med.adherence >= 75 ? 'bg-warning' : 'bg-danger'
                          }`}
                          role="progressbar"
                          style={{ width: `${med.adherence}%` }}
                          aria-valuenow={med.adherence} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <span className="ms-2">{med.adherence}%</span>
                    </div>
                  </td>
                  <td>
                    <Badge color={
                      new Date(med.refillDate) < new Date() ? 'danger' :
                      new Date(med.refillDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'warning' : 'success'
                    }>
                      {new Date(med.refillDate).toLocaleDateString()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted">No medications recorded</p>
      )}
    </MedicalInfoCard>
  );

  // Vitals history with charts
  const VitalsSection = () => (
    <div className="vitals-section">
      <h4 className="mb-3">Vitals History</h4>
      
      <Nav tabs className="mb-3">
        <NavItem>
          <NavLink
            className={activeTab === 'bloodPressure' ? 'active' : ''}
            onClick={() => setActiveTab('bloodPressure')}
          >
            Blood Pressure
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === 'bloodSugar' ? 'active' : ''}
            onClick={() => setActiveTab('bloodSugar')}
          >
            Blood Sugar
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === 'heartRate' ? 'active' : ''}
            onClick={() => setActiveTab('heartRate')}
          >
            Heart Rate
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === 'weight' ? 'active' : ''}
            onClick={() => setActiveTab('weight')}
          >
            Weight
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === 'cholesterol' ? 'active' : ''}
            onClick={() => setActiveTab('cholesterol')}
          >
            Cholesterol
          </NavLink>
        </NavItem>
      </Nav>
      
      <TabContent activeTab={activeTab}>
        <TabPane tabId="bloodPressure">
          {vitalsHistory.bloodPressure && (
            <VitalsChart
              vitalType="blood-pressure"
              data={vitalsHistory.bloodPressure}
              unit="mmHg"
              timeRange="6 Month"
            />
          )}
        </TabPane>
        <TabPane tabId="bloodSugar">
          {vitalsHistory.bloodSugar && (
            <VitalsChart
              vitalType="blood-sugar"
              data={vitalsHistory.bloodSugar}
              unit="mg/dL"
              timeRange="6 Month"
            />
          )}
        </TabPane>
        <TabPane tabId="heartRate">
          {vitalsHistory.heartRate && (
            <VitalsChart
              vitalType="heart-rate"
              data={vitalsHistory.heartRate}
              unit="bpm"
              timeRange="6 Month"
            />
          )}
        </TabPane>
        <TabPane tabId="weight">
          {vitalsHistory.weight && (
            <VitalsChart
              vitalType="weight"
              data={vitalsHistory.weight}
              unit="lbs"
              timeRange="6 Month"
            />
          )}
        </TabPane>
        <TabPane tabId="cholesterol">
          {vitalsHistory.cholesterol && (
            <VitalsChart
              vitalType="other"
              data={vitalsHistory.cholesterol}
              unit="mg/dL"
              timeRange="2 Year"
            />
          )}
        </TabPane>
      </TabContent>
    </div>
  );

  // Immunization history section
  const ImmunizationSection = () => (
    <MedicalInfoCard
      title="Immunization History"
      icon={<FontAwesomeIcon icon={faSyringe} />}
    >
      {immunizations.length > 0 ? (
        <div className="immunization-container">
          <div className="status-circle complete">
            {Math.round((immunizations.filter(i => !i.nextDueDate || new Date(i.nextDueDate) > new Date()).length / immunizations.length) * 100)}%
            <div className="status-text">Up to Date</div>
          </div>
          
          <div className="immunization-timeline">
            {immunizations.map((immunization, index) => (
              <div key={index} className={`immunization-event ${!immunization.nextDueDate || new Date(immunization.nextDueDate) > new Date() ? 'completed' : 'upcoming'}`}>
                <h6>{immunization.vaccine}</h6>
                <p className="mb-1">
                  <small>
                    <i className="far fa-calendar me-1"></i>
                    {new Date(immunization.date).toLocaleDateString()}
                  </small>
                </p>
                <p className="mb-1">
                  <small>
                    <i className="fas fa-user-md me-1"></i>
                    {immunization.administrator}
                  </small>
                </p>
                {immunization.nextDueDate && (
                  <p className="mb-0">
                    <small>
                      <i className="fas fa-hourglass-half me-1"></i>
                      Next dose: {new Date(immunization.nextDueDate).toLocaleDateString()}
                    </small>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted">No immunization records available</p>
      )}
    </MedicalInfoCard>
  );

  // Health insights section
  const HealthInsightsSection = () => (
    <MedicalInfoCard
      title="AI Health Insights"
      icon={<span className="fa-layers fa-fw">
        <i className="fas fa-brain"></i>
      </span>}
      className="ai-insights-card"
    >
      <div className="ai-insight p-3 mb-3">
        <div className="d-flex align-items-center mb-2">
          <i className="fas fa-chart-line text-primary me-2"></i>
          <h6 className="mb-0">Diabetes Management</h6>
        </div>
        <p className="mb-0">Your HbA1c has improved from 7.8% to 7.2% over the past 3 months. Continue with your current medication and exercise regimen to reach your target of &lt;7.0%.</p>
      </div>
      
      <div className="ai-insight p-3 mb-3">
        <div className="d-flex align-items-center mb-2">
          <i className="fas fa-heartbeat text-primary me-2"></i>
          <h6 className="mb-0">Blood Pressure Trend</h6>
        </div>
        <p className="mb-0">Your blood pressure readings show consistent improvement over the past 6 months, likely due to medication adherence and reduced sodium intake. Continue monitoring regularly.</p>
      </div>
      
      <div className="ai-insight p-3">
        <div className="d-flex align-items-center mb-2">
          <i className="fas fa-weight text-primary me-2"></i>
          <h6 className="mb-0">Weight Management</h6>
        </div>
        <p className="mb-0">You've achieved your short-term weight loss goal of 10 pounds. This likely contributed to your improved blood sugar levels. Setting a new target of 5 additional pounds may further improve your diabetes management.</p>
      </div>
    </MedicalInfoCard>
  );

  // Access & sharing control panel
  const AccessSharingSection = () => (
    <MedicalInfoCard
      title="Access & Sharing Controls"
      icon={<FontAwesomeIcon icon={faShare} />}
    >
      <div className="mb-4">
        <h6>Export Records</h6>
        <p className="mb-2">Download your medical records in various formats</p>
        <div className="d-flex gap-2">
          <Button color="primary" outline size="sm">
            <i className="far fa-file-pdf me-1"></i> PDF
          </Button>
          <Button color="primary" outline size="sm">
            <i className="far fa-file-excel me-1"></i> CSV
          </Button>
          <Button color="primary" outline size="sm">
            <i className="far fa-file-code me-1"></i> JSON
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <h6>Currently Shared With</h6>
        <ul className="list-group">
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <p className="mb-0 fw-bold">Dr. Sarah Johnson</p>
              <small className="text-muted">All records • Expires: May 30, 2025</small>
            </div>
            <Button color="danger" size="sm" outline>Revoke</Button>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <p className="mb-0 fw-bold">Dr. Michael Chen</p>
              <small className="text-muted">Cardiology records only • Expires: June 15, 2025</small>
            </div>
            <Button color="danger" size="sm" outline>Revoke</Button>
          </li>
        </ul>
      </div>
      
      <div>
        <h6>Share Medical Records</h6>
        <p className="mb-2">Securely share your records with healthcare providers</p>
        <Button color="success">
          <i className="fas fa-share-alt me-1"></i> Share Records
        </Button>
      </div>
    </MedicalInfoCard>
  );

  // Helper function to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <>
            <Row>
              <Col md={6} className="mb-4">
                <PatientProfileCard />
              </Col>
              <Col md={6} className="mb-4">
                <EmergencyContactCard />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-4">
                <AllergiesCard />
              </Col>
              <Col md={6} className="mb-4">
                <ChronicConditionsCard />
              </Col>
            </Row>
            <MedicationsCard />
            <HealthInsightsSection />
          </>
        );
      
      case 'medicalHistory':
        return (
          <MedicalInfoCard
            title="Medical History"
            icon={<FontAwesomeIcon icon={faFileMedical} />}
          >
            {medicalHistory.length > 0 ? (
              <div className="medical-history-list">
                {medicalHistory.map((item, index) => (
                  <MedicalHistoryItem
                    key={index}
                    date={item.date}
                    diagnosis={item.diagnosis}
                    provider={item.provider}
                    status={item.status}
                    notes={item.notes}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted">No medical history records available</p>
            )}
          </MedicalInfoCard>
        );
      
      case 'medications':
        return <MedicationsCard />;
      
      case 'vitals':
        return <VitalsSection />;
      
      case 'immunizations':
        return <ImmunizationSection />;
        
      default:
        return <div>Select a tab to view your health records</div>;
    }
  };

  // Main render
  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading health records...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert color="danger" timeout={5000}>
          <h4 className="alert-heading">Error Loading Health Records</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please refresh the page or contact support if the problem persists.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="health-records-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Health Records</h2>
        <div>
          <Button color="primary" className="me-2">
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Export
          </Button>
          <Button color="outline-primary">
            <FontAwesomeIcon icon={faShare} className="me-2" />
            Share
          </Button>
        </div>
      </div>
      
      {/* Tab navigation */}
      <HealthRecordsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Tab content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </Container>
  );
};

export default HealthRecords;