import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, CardHeader, CardBody, Table, Button,
  Input, Badge, Spinner, Alert, Modal, ModalHeader, ModalBody,
  Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileMedical, faUserMd, faSearch, faEye, faDownload,
  faCalendarAlt, faStethoscope, faPills, faHeartbeat,
  faSyringe, faExclamationTriangle, faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import { getPatients } from '../../services/patientManagementService';
import './MedicalRecords.css';

const MedicalRecords = () => {
  // State management
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock patient medical records data - in real app this would come from API
  const [patientMedicalData, setPatientMedicalData] = useState({
    medicalHistory: [
      {
        date: '2024-01-15',
        diagnosis: 'Hypertension',
        provider: 'Dr. Sarah Johnson',
        status: 'Active',
        notes: 'Patient diagnosed with stage 1 hypertension. Prescribed medication and lifestyle changes.'
      },
      {
        date: '2023-12-10',
        diagnosis: 'Type 2 Diabetes',
        provider: 'Dr. Michael Chen',
        status: 'Monitoring',
        notes: 'Blood glucose levels improving with medication and diet control.'
      }
    ],
    medications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        prescriber: 'Dr. Sarah Johnson',
        startDate: '2024-01-15',
        status: 'Active'
      },
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        prescriber: 'Dr. Michael Chen',
        startDate: '2023-12-10',
        status: 'Active'
      }
    ],
    vitals: [
      {
        date: '2024-02-01',
        bloodPressure: '135/85',
        heartRate: '72',
        weight: '180 lbs',
        temperature: '98.6°F'
      },
      {
        date: '2024-01-15',
        bloodPressure: '140/90',
        heartRate: '75',
        weight: '182 lbs',
        temperature: '98.4°F'
      }
    ],
    allergies: ['Penicillin', 'Shellfish'],
    immunizations: [
      {
        vaccine: 'COVID-19',
        date: '2023-10-15',
        provider: 'Pharmacy'
      },
      {
        vaccine: 'Flu Shot',
        date: '2023-09-20',
        provider: 'Dr. Sarah Johnson'
      }
    ]
  });

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getPatients(1, 100, searchTerm);
      const patientsData = response.data || [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setError('Failed to load patients. Please try again.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle viewing patient medical records
  const handleViewRecords = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
    setActiveTab('overview');
  };

  // Render patient medical records modal content
  const renderMedicalRecordsContent = () => {
    if (!selectedPatient) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <Row className="mb-4">
              <Col md={6}>
                <Card className="h-100">
                  <CardHeader>
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    Recent Medical History
                  </CardHeader>
                  <CardBody>
                    {patientMedicalData.medicalHistory.slice(0, 3).map((record, index) => (
                      <div key={index} className="mb-3 p-2 border-bottom">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{record.diagnosis}</h6>
                            <small className="text-muted">
                              {record.date} - {record.provider}
                            </small>
                          </div>
                          <Badge color={record.status === 'Active' ? 'danger' : 'warning'}>
                            {record.status}
                          </Badge>
                        </div>
                        <p className="small mt-2 mb-0">{record.notes}</p>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <CardHeader>
                    <FontAwesomeIcon icon={faPills} className="me-2" />
                    Current Medications
                  </CardHeader>
                  <CardBody>
                    {patientMedicalData.medications.filter(med => med.status === 'Active').map((med, index) => (
                      <div key={index} className="mb-3 p-2 border-bottom">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{med.name}</h6>
                            <small className="text-muted">
                              {med.dosage} - {med.frequency}
                            </small>
                          </div>
                          <Badge color="success">Active</Badge>
                        </div>
                        <small className="text-muted">
                          Prescribed by {med.prescriber} on {med.startDate}
                        </small>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Card>
                  <CardHeader>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    Allergies & Warnings
                  </CardHeader>
                  <CardBody>
                    {patientMedicalData.allergies.map((allergy, index) => (
                      <Badge key={index} color="warning" className="me-2 mb-2">
                        {allergy}
                      </Badge>
                    ))}
                  </CardBody>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <CardHeader>
                    <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
                    Latest Vitals
                  </CardHeader>
                  <CardBody>
                    {patientMedicalData.vitals.length > 0 && (
                      <div>
                        <p><strong>Date:</strong> {patientMedicalData.vitals[0].date}</p>
                        <p><strong>BP:</strong> {patientMedicalData.vitals[0].bloodPressure}</p>
                        <p><strong>HR:</strong> {patientMedicalData.vitals[0].heartRate} bpm</p>
                        <p><strong>Weight:</strong> {patientMedicalData.vitals[0].weight}</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        );

      case 'history':
        return (
          <Card>
            <CardHeader>Complete Medical History</CardHeader>
            <CardBody>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Diagnosis</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {patientMedicalData.medicalHistory.map((record, index) => (
                    <tr key={index}>
                      <td>{record.date}</td>
                      <td>{record.diagnosis}</td>
                      <td>{record.provider}</td>
                      <td>
                        <Badge color={record.status === 'Active' ? 'danger' : 'warning'}>
                          {record.status}
                        </Badge>
                      </td>
                      <td>{record.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        );

      case 'medications':
        return (
          <Card>
            <CardHeader>Medication History</CardHeader>
            <CardBody>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Prescriber</th>
                    <th>Start Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientMedicalData.medications.map((med, index) => (
                    <tr key={index}>
                      <td>{med.name}</td>
                      <td>{med.dosage}</td>
                      <td>{med.frequency}</td>
                      <td>{med.prescriber}</td>
                      <td>{med.startDate}</td>
                      <td>
                        <Badge color={med.status === 'Active' ? 'success' : 'secondary'}>
                          {med.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        );

      case 'vitals':
        return (
          <Card>
            <CardHeader>Vital Signs History</CardHeader>
            <CardBody>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Blood Pressure</th>
                    <th>Heart Rate</th>
                    <th>Weight</th>
                    <th>Temperature</th>
                  </tr>
                </thead>
                <tbody>
                  {patientMedicalData.vitals.map((vital, index) => (
                    <tr key={index}>
                      <td>{vital.date}</td>
                      <td>{vital.bloodPressure}</td>
                      <td>{vital.heartRate}</td>
                      <td>{vital.weight}</td>
                      <td>{vital.temperature}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FontAwesomeIcon icon={faFileMedical} className="me-3 text-primary" />
                Medical Records
              </h2>
              <p className="text-muted">Access and review patient medical records</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <div className="position-relative">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" 
            />
            <Input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-5"
            />
          </div>
        </Col>
      </Row>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <FontAwesomeIcon icon={faUserMd} className="me-2" />
          Patient List
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2">Loading patients...</p>
            </div>
          ) : error ? (
            <Alert color="danger" fade={false}>{error}</Alert>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Blood Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(!filteredPatients || filteredPatients.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <FontAwesomeIcon icon={faFileMedical} size="2x" className="text-muted mb-2" />
                        <p className="text-muted mb-0">
                          {searchTerm ? 'No patients match your search criteria' : 'No patients found'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    (filteredPatients || []).map((patient) => (
                      <tr key={patient._id}>
                        <td>{patient.user?.name || 'N/A'}</td>
                        <td>{patient.user?.email || 'N/A'}</td>
                        <td>{patient.user?.phoneNumber || 'N/A'}</td>
                        <td>{patient.bloodType || 'N/A'}</td>
                        <td>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => handleViewRecords(patient)}
                            className="me-2"
                          >
                            <FontAwesomeIcon icon={faEye} className="me-1" />
                            View Records
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Medical Records Modal */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} size="xl">
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          <FontAwesomeIcon icon={faFileMedical} className="me-2" />
          Medical Records - {selectedPatient?.user?.name}
        </ModalHeader>
        <ModalBody>
          {/* Navigation Tabs */}
          <Nav tabs className="mb-4">
            <NavItem>
              <NavLink
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                style={{ cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                Overview
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
                style={{ cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faFileMedical} className="me-2" />
                Medical History
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === 'medications'}
                onClick={() => setActiveTab('medications')}
                style={{ cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faPills} className="me-2" />
                Medications
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === 'vitals'}
                onClick={() => setActiveTab('vitals')}
                style={{ cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faHeartbeat} className="me-2" />
                Vitals
              </NavLink>
            </NavItem>
          </Nav>

          {/* Tab Content */}
          <TabContent activeTab={activeTab}>
            <TabPane tabId={activeTab}>
              {renderMedicalRecordsContent()}
            </TabPane>
          </TabContent>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default MedicalRecords;