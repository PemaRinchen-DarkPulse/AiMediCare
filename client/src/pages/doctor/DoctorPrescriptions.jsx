import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, CardBody, Button, Alert, Spinner, 
  Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter,
  Table, Badge
} from 'reactstrap';
import { FaPrescriptionBottle, FaSearch, FaPlus, FaEdit, FaSave, FaTrash } from 'react-icons/fa';
import axios from 'axios';

// Base API URL from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

const DoctorPrescriptions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Prescription form state
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  });
  
  // Medicine recommendation state
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  // Get auth header with JWT token
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch prescriptions and patients on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all prescriptions created by the doctor
        const prescriptionsResponse = await axios.get(`${API_URL}/prescriptions/doctor`, {
          headers: getAuthHeader()
        });
        
        // Fetch all patients - using the correct endpoint path
        const patientsResponse = await axios.get(`${API_URL}/doctor/patients`, {
          headers: getAuthHeader()
        });
        
        // Log the complete response for debugging
        console.log('Patients API response:', patientsResponse);
        
        // Ensure we have arrays for both prescriptions and patients
        const prescriptionData = prescriptionsResponse.data.data || prescriptionsResponse.data || [];
        setPrescriptions(Array.isArray(prescriptionData) ? prescriptionData : []);
        
        // Safely extract patients data and ensure it's an array
        let patientsData;
        if (patientsResponse.data && patientsResponse.data.data) {
          patientsData = patientsResponse.data.data;
        } else {
          patientsData = patientsResponse.data;
        }
        
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Toggle prescription modal
  const togglePrescriptionModal = () => {
    setShowPrescriptionModal(!showPrescriptionModal);
    // Reset form when closing modal
    if (showPrescriptionModal) {
      setCurrentPrescription(null);
      setIsEditing(false);
      setPrescriptionForm({
        patientId: '',
        diagnosis: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        notes: ''
      });
      setAiRecommendations([]);
      setShowRecommendations(false);
    }
  };
  
  // Toggle delete confirmation modal
  const toggleDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(!showDeleteConfirmModal);
  };
  
  // Open the modal for creating a new prescription
  const handleNewPrescription = () => {
    setIsEditing(false);
    setCurrentPrescription(null);
    setPrescriptionForm({
      patientId: '',
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: ''
    });
    togglePrescriptionModal();
  };
  
  // Open the modal for editing an existing prescription
  const handleEditPrescription = (prescription) => {
    if (!prescription) return;
    
    setIsEditing(true);
    setCurrentPrescription(prescription);
    
    // Safely access properties with fallbacks
    const patientId = prescription.patientId || {};
    const medications = prescription.medications || [];
    
    // Set form data with the prescription to edit
    setPrescriptionForm({
      patientId: (patientId._id || prescription.patientId) || '',
      diagnosis: prescription.diagnosis || '',
      medications: medications.length > 0 
        ? medications.map(med => ({
            name: med.name || '',
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            duration: med.duration || '',
            instructions: med.instructions || ''
          }))
        : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: prescription.notes || ''
    });
    
    togglePrescriptionModal();
  };
  
  // Open delete confirmation modal
  const handleDeletePrescription = (prescription) => {
    setCurrentPrescription(prescription);
    toggleDeleteConfirmModal();
  };
  
  // Handle form input changes
  const handleFormChange = (e) => {
    setPrescriptionForm({
      ...prescriptionForm,
      [e.target.name]: e.target.value
    });
    
    // If diagnosis changes, fetch medicine recommendations
    if (e.target.name === 'diagnosis' && e.target.value.trim().length > 3) {
      fetchMedicineRecommendations(e.target.value);
    }
  };
  
  // Handle medication input changes
  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...prescriptionForm.medications];
    updatedMedications[index][field] = value;
    
    setPrescriptionForm({
      ...prescriptionForm,
      medications: updatedMedications
    });
  };
  
  // Add a medication field
  const handleAddMedication = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [
        ...prescriptionForm.medications, 
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    });
  };
  
  // Remove a medication field
  const handleRemoveMedication = (index) => {
    const updatedMedications = [...prescriptionForm.medications];
    updatedMedications.splice(index, 1);
    
    setPrescriptionForm({
      ...prescriptionForm,
      medications: updatedMedications
    });
  };
  
  // Fetch medicine recommendations based on diagnosis
  const fetchMedicineRecommendations = async (diagnosis) => {
    try {
      setLoadingRecommendations(true);
      
      // Call the medicine recommendation API
      const response = await axios.get(`${API_URL}/medicine-recommendations?diagnosis=${encodeURIComponent(diagnosis)}`, {
        headers: getAuthHeader()
      });
      
      setAiRecommendations(response.data.recommendations || []);
      setShowRecommendations(true);
    } catch (err) {
      console.error('Error fetching medicine recommendations:', err);
      // Don't show error to user, just hide recommendations
      setShowRecommendations(false);
    } finally {
      setLoadingRecommendations(false);
    }
  };
  
  // Add a recommended medicine to the form
  const handleAddRecommendedMedicine = (recommendation) => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [
        ...prescriptionForm.medications,
        { 
          name: recommendation.name, 
          dosage: recommendation.dosage, 
          frequency: recommendation.frequency,
          duration: recommendation.duration,
          instructions: recommendation.instructions || ''
        }
      ]
    });
  };
  
  // Submit the form to create or update a prescription
  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!prescriptionForm.patientId) {
        setError('Please select a patient');
        return;
      }
      
      if (!prescriptionForm.diagnosis) {
        setError('Please enter a diagnosis');
        return;
      }
      
      if (prescriptionForm.medications.length === 0 || 
          prescriptionForm.medications.some(med => !med.name || !med.dosage || !med.frequency || !med.duration)) {
        setError('Please provide complete information for all medications');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      let response;
      
      if (isEditing && currentPrescription) {
        // Update existing prescription
        response = await axios.put(
          `${API_URL}/prescriptions/${currentPrescription._id}`, 
          prescriptionForm,
          { headers: getAuthHeader() }
        );
      } else {
        // Create new prescription
        response = await axios.post(
          `${API_URL}/prescriptions`, 
          prescriptionForm,
          { headers: getAuthHeader() }
        );
      }
      
      // Update the prescriptions list
      if (isEditing) {
        setPrescriptions(prevPrescriptions => 
          prevPrescriptions.map(p => 
            p._id === currentPrescription._id ? response.data.data : p
          )
        );
      } else {
        setPrescriptions(prevPrescriptions => 
          [...prevPrescriptions, response.data.data]
        );
      }
      
      // Close the modal and reset form
      togglePrescriptionModal();
      
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError('Failed to save prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Confirm delete prescription
  const confirmDeletePrescription = async () => {
    if (!currentPrescription) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`${API_URL}/prescriptions/${currentPrescription._id}`, {
        headers: getAuthHeader()
      });
      
      // Remove the prescription from the list
      setPrescriptions(prevPrescriptions => 
        prevPrescriptions.filter(p => p._id !== currentPrescription._id)
      );
      
      // Close the modal
      toggleDeleteConfirmModal();
      
    } catch (err) {
      console.error('Error deleting prescription:', err);
      setError('Failed to delete prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter prescriptions based on search term, patient, date, and status
  const filteredPrescriptions = prescriptions.filter(prescription => {
    // Safely access nested properties
    const patientId = prescription.patientId || {};
    const patientUser = patientId.user || {};
    
    // Text search (patient name, diagnosis)
    const patientName = patientId.name || patientUser.name || '';
    const diagnosisText = prescription.diagnosis || '';
    const matchesSearch = searchTerm === '' || 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosisText.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Patient filter
    const matchesPatient = patientFilter === '' || 
      (patientId._id && patientId._id === patientFilter);
    
    // Date filter (issued date) - safely handle missing issuedDate
    const matchesDate = dateFilter === '' || 
      (prescription.issuedDate && prescription.issuedDate.substring(0, 10) === dateFilter);
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      prescription.status === statusFilter;
    
    return matchesSearch && matchesPatient && matchesDate && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status badge color based on status value
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'secondary';
      case 'cancelled': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-0">
            <FaPrescriptionBottle className="text-primary me-2" />
            Prescriptions
          </h2>
          <p className="text-muted mb-0">Manage patient prescriptions and medications</p>
        </Col>
        <Col xs="auto">
          <Button color="primary" onClick={handleNewPrescription}>
            <FaPlus className="me-2" /> New Prescription
          </Button>
        </Col>
      </Row>
      
      {error && (
        <Alert color="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Filter and Search Section */}
      <Card className="mb-4 shadow-sm">
        <CardBody>
          <Row className="g-3">
            <Col md={3}>
              <FormGroup>
                <Label for="searchTerm">Search</Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <Input
                    type="text"
                    id="searchTerm"
                    placeholder="Search by name or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </FormGroup>
            </Col>
            
            <Col md={3}>
              <FormGroup>
                <Label for="patientFilter">Patient</Label>
                <Input
                  type="select"
                  id="patientFilter"
                  value={patientFilter}
                  onChange={(e) => setPatientFilter(e.target.value)}
                >
                  <option value="">All Patients</option>
                  {Array.isArray(patients) && patients.length > 0 ? patients.map(patient => (
                    <option key={patient._id || `patient-${Math.random()}`} value={patient._id}>
                      {patient.user ? patient.user.name : patient.name || 'Unknown'}
                    </option>
                  )) : (
                    <option value="" disabled>No patients available</option>
                  )}
                </Input>
              </FormGroup>
            </Col>
            
            <Col md={3}>
              <FormGroup>
                <Label for="dateFilter">Issue Date</Label>
                <Input
                  type="date"
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </FormGroup>
            </Col>
            
            <Col md={3}>
              <FormGroup>
                <Label for="statusFilter">Status</Label>
                <Input
                  type="select"
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>
      
      {/* Prescriptions Table */}
      <Card className="shadow-sm">
        <CardBody>
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="text-muted mt-3">Loading prescriptions...</p>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-5">
              <div className="display-6 text-muted mb-4">No prescriptions found</div>
              <p>
                {searchTerm || patientFilter || dateFilter || statusFilter !== 'all' ? 
                  'Try adjusting your filters' : 
                  'Create a new prescription to get started'
                }
              </p>
              <Button color="primary" onClick={handleNewPrescription}>
                <FaPlus className="me-2" /> New Prescription
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Issue Date</th>
                    <th>Patient</th>
                    <th>Diagnosis</th>
                    <th>Medications</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map(prescription => {
                    // Safely handle missing data
                    const patientId = prescription.patientId || {};
                    const patientUser = patientId.user || {};
                    const patientName = patientId.name || patientUser.name || 'Unknown';
                    const medications = prescription.medications || [];
                    
                    return (
                      <tr key={prescription._id || `prescription-${Math.random()}`}>
                        <td>{formatDate(prescription.issuedDate)}</td>
                        <td>{patientName}</td>
                        <td>{prescription.diagnosis || 'No diagnosis'}</td>
                        <td>
                          {medications.length > 0 ? medications.map((med, idx) => (
                            <div key={idx} className="mb-1">
                              <Badge color="light" className="text-dark me-1">
                                {med.name || 'Unnamed medication'}
                              </Badge>
                              <small className="text-muted">
                                {med.dosage || 'No dosage'}, {med.frequency || 'No frequency'}
                              </small>
                            </div>
                          )) : <span className="text-muted">No medications</span>}
                        </td>
                        <td>
                          <Badge color={getStatusColor(prescription.status)} pill>
                            {prescription.status || 'Unknown'}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            color="secondary" 
                            size="sm" 
                            outline 
                            className="me-2"
                            onClick={() => handleEditPrescription(prescription)}
                          >
                            <FaEdit /> Edit
                          </Button>
                          <Button 
                            color="danger" 
                            size="sm" 
                            outline
                            onClick={() => handleDeletePrescription(prescription)}
                          >
                            <FaTrash /> Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Create/Edit Prescription Modal */}
      <Modal isOpen={showPrescriptionModal} toggle={togglePrescriptionModal} size="lg">
        <ModalHeader toggle={togglePrescriptionModal}>
          {isEditing ? 'Edit Prescription' : 'New Prescription'}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmitPrescription}>
            <FormGroup className="mb-3">
              <Label for="patientId" className="form-label">Patient</Label>
              {isEditing ? (
                // When editing, display patient name as disabled text input
                <Input
                  type="text"
                  id="patientId"
                  name="patientId"
                  value={(() => {
                    // Find the patient by ID to display their name
                    if (Array.isArray(patients)) {
                      const selectedPatient = patients.find(p => p._id === prescriptionForm.patientId);
                      if (selectedPatient) {
                        return selectedPatient.user ? selectedPatient.user.name : selectedPatient.name || 'Unknown';
                      }
                    }
                    
                    // If patient ID is from currentPrescription
                    if (currentPrescription && currentPrescription.patientId) {
                      const patientId = currentPrescription.patientId;
                      if (typeof patientId === 'object') {
                        return patientId.user ? patientId.user.name : patientId.name || 'Unknown';
                      }
                    }
                    
                    return 'Selected Patient';
                  })()}
                  disabled
                  className="bg-light"
                />
              ) : (
                // When creating new prescription, show dropdown selector
                <Input
                  type="select"
                  id="patientId"
                  name="patientId"
                  value={prescriptionForm.patientId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Patient</option>
                  {Array.isArray(patients) && patients.length > 0 ? patients.map(patient => (
                    <option key={patient._id || `patient-${Math.random()}`} value={patient._id}>
                      {patient.user ? patient.user.name : patient.name || 'Unknown'}
                    </option>
                  )) : (
                    <option value="" disabled>No patients available</option>
                  )}
                </Input>
              )}
            </FormGroup>
            
            <FormGroup className="mb-3">
              <Label for="diagnosis" className="form-label">Diagnosis</Label>
              <Input
                type="text"
                id="diagnosis"
                name="diagnosis"
                value={prescriptionForm.diagnosis}
                onChange={handleFormChange}
                placeholder="Enter diagnosis"
                required
              />
            </FormGroup>
            
            {/* Medications Section */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Label className="form-label mb-0">Medications</Label>
                <Button 
                  color="info" 
                  size="sm" 
                  outline
                  onClick={handleAddMedication}
                  type="button"
                >
                  <FaPlus className="me-1" /> Add Medication
                </Button>
              </div>
              
              {prescriptionForm.medications.map((medication, index) => (
                <div key={index} className="p-3 mb-3 border rounded">
                  <Row>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label for={`medication-name-${index}`} className="form-label">Medication Name</Label>
                        <Input
                          type="text"
                          id={`medication-name-${index}`}
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          placeholder="Enter medication name"
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label for={`medication-dosage-${index}`} className="form-label">Dosage</Label>
                        <Input
                          type="text"
                          id={`medication-dosage-${index}`}
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          required
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label for={`medication-frequency-${index}`} className="form-label">Frequency</Label>
                        <Input
                          type="text"
                          id={`medication-frequency-${index}`}
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          placeholder="e.g., Twice daily"
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label for={`medication-duration-${index}`} className="form-label">Duration</Label>
                        <Input
                          type="text"
                          id={`medication-duration-${index}`}
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days"
                          required
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  
                  <FormGroup className="mb-3">
                    <Label for={`medication-instructions-${index}`} className="form-label">Instructions</Label>
                    <Input
                      type="text"
                      id={`medication-instructions-${index}`}
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take with food"
                    />
                  </FormGroup>
                  
                  {prescriptionForm.medications.length > 1 && (
                    <div className="text-end">
                      <Button 
                        color="danger" 
                        size="sm" 
                        outline
                        onClick={() => handleRemoveMedication(index)}
                        type="button"
                      >
                        <FaTrash className="me-1" /> Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <FormGroup className="mb-3">
              <Label for="notes" className="form-label">Notes</Label>
              <Input
                type="textarea"
                id="notes"
                name="notes"
                value={prescriptionForm.notes}
                onChange={handleFormChange}
                placeholder="Additional notes or instructions"
                rows={3}
              />
            </FormGroup>
          </Form>
          
          {/* Medicine Recommendations */}
          {showRecommendations && (
            <div className="medicine-recommendations mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">AI-Based Medication Recommendations</h5>
                <Button 
                  color="link" 
                  size="sm" 
                  onClick={() => setShowRecommendations(false)}
                >
                  Hide
                </Button>
              </div>
              
              {loadingRecommendations ? (
                <div className="text-center py-3">
                  <Spinner color="primary" size="sm" />
                  <p className="text-muted mb-0 mt-2">Getting recommendations...</p>
                </div>
              ) : aiRecommendations.length > 0 ? (
                <div className="table-responsive">
                  <Table size="sm" bordered hover>
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiRecommendations.map((rec, idx) => (
                        <tr key={idx}>
                          <td>{rec.name}</td>
                          <td>{rec.dosage}</td>
                          <td>{rec.frequency}</td>
                          <td>{rec.duration}</td>
                          <td>
                            <Button 
                              color="success" 
                              size="sm" 
                              outline
                              onClick={() => handleAddRecommendedMedicine(rec)}
                            >
                              <FaPlus /> Add
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted">No recommendations available for this diagnosis.</p>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={togglePrescriptionModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSubmitPrescription} disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" /> Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> 
                {isEditing ? 'Update Prescription' : 'Save Prescription'}
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirmModal} toggle={toggleDeleteConfirmModal}>
        <ModalHeader toggle={toggleDeleteConfirmModal}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete this prescription? This action cannot be undone.
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleDeleteConfirmModal}>
            Cancel
          </Button>
          <Button color="danger" onClick={confirmDeletePrescription} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default DoctorPrescriptions;