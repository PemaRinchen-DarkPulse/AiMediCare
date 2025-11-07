import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Table, Badge, Button, Modal, Form, 
  Spinner, Alert, InputGroup, Pagination, Nav, Tab,
  ListGroup, ProgressBar, Accordion
} from 'react-bootstrap';
import { 
  FaSearch, FaUser, FaEdit, FaEye, FaPills, FaHistory,
  FaHeartbeat, FaExclamationTriangle, FaCalendarAlt, 
  FaFileAlt, FaChartLine, FaPhone, FaEnvelope
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
  getPharmacyPatients, 
  getPharmacyPatientDetails,
  updatePharmacyPatient,
  getPatientMedicationHistory,
  addPatientConsultationNote,
  getPatientAdherenceMetrics
} from '../../services/pharmacyService';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'note', 'history'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('profile');
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [adherenceMetrics, setAdherenceMetrics] = useState(null);
  const [consultationNote, setConsultationNote] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  // Safety check to ensure patients is always an array
  useEffect(() => {
    if (!Array.isArray(patients)) {
      console.warn('Patients is not an array, resetting to empty array:', patients);
      setPatients([]);
    }
  }, [patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm })
      };

      const response = await getPharmacyPatients(params);
      
      // Handle different possible response structures and ensure we always get an array
      let patientsData = [];
      let totalPagesData = 1;
      
      if (response && response.success && response.data) {
        patientsData = Array.isArray(response.data.patients) ? response.data.patients : [];
        totalPagesData = response.data.pagination?.pages || 1;
      } else if (response && response.data) {
        patientsData = Array.isArray(response.data.patients) ? response.data.patients : 
                      Array.isArray(response.data) ? response.data : [];
        totalPagesData = response.data.pagination?.pages || 1;
      } else if (response) {
        patientsData = Array.isArray(response.patients) ? response.patients : 
                      Array.isArray(response) ? response : [];
        totalPagesData = response.pagination?.pages || 1;
      }
      
      setPatients(patientsData);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
      setTotalPages(1);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPatients();
  };

  const handleViewPatient = async (patient) => {
    try {
      const response = await getPharmacyPatientDetails(patient._id);
      setSelectedPatient(response.data);
      setFormData(response.data);
      setModalType('view');
      setActiveTab('profile');
      setShowModal(true);

      // Load additional data
      await loadPatientMedicationHistory(patient._id);
      await loadPatientAdherenceMetrics(patient._id);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('Failed to load patient details');
    }
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData(patient);
    setModalType('edit');
    setShowModal(true);
  };

  const handleAddNote = (patient) => {
    setSelectedPatient(patient);
    setConsultationNote('');
    setModalType('note');
    setShowModal(true);
  };

  const loadPatientMedicationHistory = async (patientId) => {
    try {
      const response = await getPatientMedicationHistory(patientId);
      setMedicationHistory(response.data.history);
    } catch (error) {
      console.error('Error loading medication history:', error);
    }
  };

  const loadPatientAdherenceMetrics = async (patientId) => {
    try {
      const response = await getPatientAdherenceMetrics(patientId);
      setAdherenceMetrics(response.data);
    } catch (error) {
      console.error('Error loading adherence metrics:', error);
    }
  };

  const submitPatientUpdate = async () => {
    try {
      await updatePharmacyPatient(selectedPatient._id, formData);
      toast.success('Patient information updated successfully');
      setShowModal(false);
      fetchPatients();
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient information');
    }
  };

  const submitConsultationNote = async () => {
    try {
      await addPatientConsultationNote(selectedPatient._id, {
        note: consultationNote,
        type: 'consultation'
      });
      toast.success('Consultation note added successfully');
      setShowModal(false);
      await loadPatientMedicationHistory(selectedPatient._id);
    } catch (error) {
      console.error('Error adding consultation note:', error);
      toast.error('Failed to add consultation note');
    }
  };

  const getAdherenceBadge = (percentage) => {
    if (percentage >= 90) return <Badge bg="success">Excellent</Badge>;
    if (percentage >= 80) return <Badge bg="info">Good</Badge>;
    if (percentage >= 70) return <Badge bg="warning">Fair</Badge>;
    return <Badge bg="danger">Poor</Badge>;
  };

  const getRiskLevelBadge = (level) => {
    const variants = {
      'low': 'success',
      'moderate': 'warning',
      'high': 'danger',
      'critical': 'dark'
    };
    return <Badge bg={variants[level] || 'secondary'}>{level}</Badge>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="patient-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Patient Management</h2>
      </div>

      {/* Search Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={8}>
              <Form.Label>Search Patients</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by name, phone, or patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline-secondary" onClick={handleSearch}>
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <Button variant="primary" onClick={handleSearch} className="w-100">
                Search Patients
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Patients Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading patients...</div>
            </div>
          ) : !patients || patients.length === 0 ? (
            <div className="text-center py-4">
              <FaUser size={48} className="text-muted mb-3" />
              <h5>No patients found</h5>
              <p className="text-muted">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Patient Info</th>
                    <th>Contact</th>
                    <th>Current Medications</th>
                    <th>Adherence</th>
                    <th>Risk Level</th>
                    <th>Last Visit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(patients) && patients.map((patient) => (
                    <tr key={patient._id}>
                      <td>
                        <div>
                          <div className="fw-bold">{patient.firstName} {patient.lastName}</div>
                          <small className="text-muted">
                            Age: {calculateAge(patient.dateOfBirth)} • 
                            ID: {patient.patientId}
                          </small>
                          {patient.allergies && patient.allergies.length > 0 && (
                            <div className="mt-1">
                              <Badge bg="warning" size="sm">
                                <FaExclamationTriangle className="me-1" />
                                Allergies
                              </Badge>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="small">
                            <FaPhone className="me-1" />{patient.phoneNumber}
                          </div>
                          <div className="small">
                            <FaEnvelope className="me-1" />{patient.email}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold">{patient.currentMedications?.length || 0}</div>
                        <small className="text-muted">Active prescriptions</small>
                        {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                          <div className="mt-1">
                            <Badge bg="info" size="sm">
                              {patient.chronicConditions.length} chronic conditions
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{patient.adherenceScore || 'N/A'}%</div>
                          {patient.adherenceScore && getAdherenceBadge(patient.adherenceScore)}
                        </div>
                      </td>
                      <td>
                        {getRiskLevelBadge(patient.riskLevel || 'low')}
                        {patient.clinicalAlerts && patient.clinicalAlerts.length > 0 && (
                          <div className="mt-1">
                            <Badge bg="danger" size="sm">
                              {patient.clinicalAlerts.length} alerts
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          {patient.lastVisit ? formatDate(patient.lastVisit) : 'No visits'}
                        </div>
                        <small className="text-muted">
                          {patient.visitCount || 0} total visits
                        </small>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewPatient(patient)}
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleEditPatient(patient)}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleAddNote(patient)}
                            title="Add Note"
                          >
                            <FaFileAlt />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.Prev 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Patient Details Modal */}
      <Modal show={showModal && modalType === 'view'} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2" />
            {selectedPatient && `${selectedPatient.firstName} ${selectedPatient.lastName}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="profile">Patient Profile</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="medications">Medications</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="history">History</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="adherence">Adherence</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="notes">Notes</Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                {/* Profile Tab */}
                <Tab.Pane eventKey="profile">
                  <Row>
                    <Col md={6}>
                      <Card>
                        <Card.Header>Personal Information</Card.Header>
                        <Card.Body>
                          <ListGroup variant="flush">
                            <ListGroup.Item>
                              <strong>Patient ID:</strong> {selectedPatient.patientId}
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <strong>Date of Birth:</strong> {formatDate(selectedPatient.dateOfBirth)}
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <strong>Age:</strong> {calculateAge(selectedPatient.dateOfBirth)} years
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <strong>Gender:</strong> {selectedPatient.gender}
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <strong>Phone:</strong> {selectedPatient.phoneNumber}
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <strong>Email:</strong> {selectedPatient.email}
                            </ListGroup.Item>
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card>
                        <Card.Header>Health Information</Card.Header>
                        <Card.Body>
                          {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                            <div className="mb-3">
                              <strong>Allergies:</strong>
                              <div className="mt-1">
                                {selectedPatient.allergies.map((allergy, index) => (
                                  <Badge key={index} bg="warning" className="me-1">
                                    {allergy.allergen} ({allergy.severity})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 && (
                            <div className="mb-3">
                              <strong>Chronic Conditions:</strong>
                              <div className="mt-1">
                                {selectedPatient.chronicConditions.map((condition, index) => (
                                  <Badge key={index} bg="info" className="me-1">
                                    {condition.condition}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedPatient.clinicalAlerts && selectedPatient.clinicalAlerts.length > 0 && (
                            <div className="mb-3">
                              <strong>Clinical Alerts:</strong>
                              <div className="mt-1">
                                {selectedPatient.clinicalAlerts.map((alert, index) => (
                                  <Alert key={index} variant="warning" className="py-2">
                                    <small>
                                      <strong>{alert.type}:</strong> {alert.message}
                                    </small>
                                  </Alert>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <strong>Risk Level:</strong> {getRiskLevelBadge(selectedPatient.riskLevel)}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Tab.Pane>

                {/* Medications Tab */}
                <Tab.Pane eventKey="medications">
                  <Card>
                    <Card.Header>Current Medications</Card.Header>
                    <Card.Body>
                      {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 ? (
                        <div className="row">
                          {selectedPatient.currentMedications.map((medication, index) => (
                            <div key={index} className="col-md-6 mb-3">
                              <Card className="border">
                                <Card.Body className="py-2">
                                  <div className="fw-bold">{medication.medicationName}</div>
                                  <div className="small text-muted">
                                    {medication.dosage} • {medication.frequency}
                                  </div>
                                  <div className="small">
                                    Started: {formatDate(medication.startDate)}
                                  </div>
                                  {medication.prescribedBy && (
                                    <div className="small text-muted">
                                      Prescribed by: Dr. {medication.prescribedBy}
                                    </div>
                                  )}
                                </Card.Body>
                              </Card>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No current medications</p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* History Tab */}
                <Tab.Pane eventKey="history">
                  <Card>
                    <Card.Header>Medication History</Card.Header>
                    <Card.Body>
                      {medicationHistory.length > 0 ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          {medicationHistory.map((entry, index) => (
                            <div key={index} className="border-bottom py-2">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <div className="fw-bold">{entry.medicationName}</div>
                                  <div className="small">{entry.action}</div>
                                </div>
                                <div className="text-end">
                                  <div className="small">{formatDateTime(entry.date)}</div>
                                  <Badge bg="secondary" size="sm">{entry.type}</Badge>
                                </div>
                              </div>
                              {entry.notes && (
                                <div className="small text-muted mt-1">{entry.notes}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No medication history available</p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Adherence Tab */}
                <Tab.Pane eventKey="adherence">
                  {adherenceMetrics ? (
                    <Row>
                      <Col md={6}>
                        <Card>
                          <Card.Header>Adherence Overview</Card.Header>
                          <Card.Body>
                            <div className="text-center mb-3">
                              <div className="h2">{adherenceMetrics.overallScore}%</div>
                              <div>Overall Adherence Score</div>
                              {getAdherenceBadge(adherenceMetrics.overallScore)}
                            </div>
                            
                            <ListGroup variant="flush">
                              <ListGroup.Item>
                                <div className="d-flex justify-content-between">
                                  <span>Doses Taken:</span>
                                  <span>{adherenceMetrics.dosesTaken}/{adherenceMetrics.totalDoses}</span>
                                </div>
                              </ListGroup.Item>
                              <ListGroup.Item>
                                <div className="d-flex justify-content-between">
                                  <span>Missed Doses:</span>
                                  <span>{adherenceMetrics.missedDoses}</span>
                                </div>
                              </ListGroup.Item>
                              <ListGroup.Item>
                                <div className="d-flex justify-content-between">
                                  <span>On-Time Rate:</span>
                                  <span>{adherenceMetrics.onTimeRate}%</span>
                                </div>
                              </ListGroup.Item>
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card>
                          <Card.Header>Medication Adherence by Drug</Card.Header>
                          <Card.Body>
                            {adherenceMetrics.medicationBreakdown ? (
                              adherenceMetrics.medicationBreakdown.map((med, index) => (
                                <div key={index} className="mb-3">
                                  <div className="d-flex justify-content-between mb-1">
                                    <span className="small fw-bold">{med.medicationName}</span>
                                    <span className="small">{med.adherenceScore}%</span>
                                  </div>
                                  <ProgressBar 
                                    now={med.adherenceScore} 
                                    variant={
                                      med.adherenceScore >= 90 ? 'success' :
                                      med.adherenceScore >= 80 ? 'info' :
                                      med.adherenceScore >= 70 ? 'warning' : 'danger'
                                    }
                                    size="sm"
                                  />
                                </div>
                              ))
                            ) : (
                              <p className="text-muted">No detailed breakdown available</p>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  ) : (
                    <Card>
                      <Card.Body className="text-center py-4">
                        <Spinner animation="border" className="mb-2" />
                        <div>Loading adherence data...</div>
                      </Card.Body>
                    </Card>
                  )}
                </Tab.Pane>

                {/* Notes Tab */}
                <Tab.Pane eventKey="notes">
                  <Card>
                    <Card.Header>Consultation Notes</Card.Header>
                    <Card.Body>
                      {selectedPatient.consultationNotes && selectedPatient.consultationNotes.length > 0 ? (
                        <Accordion>
                          {selectedPatient.consultationNotes.map((note, index) => (
                            <Accordion.Item key={index} eventKey={index.toString()}>
                              <Accordion.Header>
                                <div className="d-flex justify-content-between w-100 me-3">
                                  <span>{formatDateTime(note.date)}</span>
                                  <Badge bg="secondary">{note.type}</Badge>
                                </div>
                              </Accordion.Header>
                              <Accordion.Body>
                                <div className="mb-2">
                                  <strong>Pharmacist:</strong> {note.pharmacistName}
                                </div>
                                <div>{note.note}</div>
                              </Accordion.Body>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                      ) : (
                        <p className="text-muted">No consultation notes available</p>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal show={showModal && modalType === 'edit'} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Patient Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Emergency Contact</Form.Label>
              <Row>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Contact Name"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      emergencyContact: {...(formData.emergencyContact || {}), name: e.target.value}
                    })}
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Contact Phone"
                    value={formData.emergencyContact?.phone || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      emergencyContact: {...(formData.emergencyContact || {}), phone: e.target.value}
                    })}
                  />
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitPatientUpdate}>
            Update Patient
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Note Modal */}
      <Modal show={showModal && modalType === 'note'} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Consultation Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={consultationNote}
                onChange={(e) => setConsultationNote(e.target.value)}
                placeholder="Enter consultation notes..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitConsultationNote}>
            Add Note
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PatientManagement;