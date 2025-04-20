import React, { useState, useEffect } from 'react';
import { 
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, 
  Label, Input, Alert, Spinner, Row, Col, Badge, Table,
  InputGroup, InputGroupText
} from 'reactstrap';
import { FaPrescriptionBottleAlt, FaPlus, FaTrash, FaSave, FaExclamationTriangle, FaMedkit } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PrescriptionModal = ({ isOpen, toggle, appointmentId, patientName }) => {
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [medicationSuggestions, setMedicationSuggestions] = useState([
    { name: 'Amoxicillin', common_dosages: ['250mg', '500mg'], common_frequency: 'Every 8 hours' },
    { name: 'Ibuprofen', common_dosages: ['200mg', '400mg', '600mg'], common_frequency: 'Every 6-8 hours as needed' },
    { name: 'Lisinopril', common_dosages: ['5mg', '10mg', '20mg'], common_frequency: 'Once daily' },
    { name: 'Metformin', common_dosages: ['500mg', '850mg', '1000mg'], common_frequency: 'Twice daily with meals' },
    { name: 'Atorvastatin', common_dosages: ['10mg', '20mg', '40mg', '80mg'], common_frequency: 'Once daily at bedtime' }
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeMedicationIndex, setActiveMedicationIndex] = useState(null);

  const handleChange = (e) => {
    setPrescription({
      ...prescription,
      [e.target.name]: e.target.value
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...prescription.medications];
    updatedMedications[index][field] = value;
    setPrescription({
      ...prescription,
      medications: updatedMedications
    });

    if (field === 'name' && value) {
      setShowSuggestions(true);
      setActiveMedicationIndex(index);
    } else if (field === 'name' && !value) {
      setShowSuggestions(false);
    }
  };

  const addMedication = () => {
    setPrescription({
      ...prescription,
      medications: [...prescription.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const removeMedication = (index) => {
    const updatedMedications = [...prescription.medications];
    updatedMedications.splice(index, 1);
    setPrescription({
      ...prescription,
      medications: updatedMedications
    });
  };

  const selectMedication = (medication) => {
    if (activeMedicationIndex === null) return;
    
    const updatedMedications = [...prescription.medications];
    updatedMedications[activeMedicationIndex] = {
      ...updatedMedications[activeMedicationIndex],
      name: medication.name,
      dosage: medication.common_dosages ? medication.common_dosages[0] : '',
      frequency: medication.common_frequency || ''
    };
    
    setPrescription({
      ...prescription,
      medications: updatedMedications
    });
    
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!prescription.diagnosis.trim()) {
      setError('Please enter a diagnosis');
      return;
    }
    
    if (prescription.medications.some(med => !med.name || !med.dosage || !med.frequency || !med.duration)) {
      setError('Please complete all medication fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const prescriptionData = {
        ...prescription,
        appointmentId
      };
      
      const response = await fetch('http://localhost:5000/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create prescription');
      }
      
      toast.success('Prescription created successfully');
      
      // Reset form and close modal
      setPrescription({
        diagnosis: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        notes: ''
      });
      
      toggle();
    } catch (error) {
      console.error('Error creating prescription:', error);
      setError(error.message || 'Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMedications = activeMedicationIndex !== null && prescription.medications[activeMedicationIndex]?.name
    ? medicationSuggestions.filter(med => 
        med.name.toLowerCase().includes(prescription.medications[activeMedicationIndex].name.toLowerCase())
      )
    : [];

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle} className="bg-info text-white">
        <FaPrescriptionBottleAlt className="me-2" />
        Create Prescription for {patientName}
      </ModalHeader>
      <ModalBody>
        {error && (
          <Alert color="danger" className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="diagnosis" className="fw-bold">Diagnosis</Label>
            <Input
              type="text"
              name="diagnosis"
              id="diagnosis"
              placeholder="Enter diagnosis"
              value={prescription.diagnosis}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Label className="fw-bold mb-0">
                <FaMedkit className="me-2 text-info" />
                Medications
              </Label>
              <Button 
                color="info" 
                size="sm" 
                outline
                onClick={addMedication}
                type="button"
              >
                <FaPlus className="me-1" /> Add Medication
              </Button>
            </div>
            
            {prescription.medications.map((medication, index) => (
              <div key={index} className="medication-entry p-3 mb-3 border rounded">
                <Row className="mb-2">
                  <Col md={6}>
                    <FormGroup>
                      <Label for={`medicationName${index}`} className="text-muted small">Medication Name</Label>
                      <div className="position-relative">
                        <Input
                          type="text"
                          id={`medicationName${index}`}
                          placeholder="Enter medication name"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          className="mb-2"
                          required
                        />
                        {showSuggestions && activeMedicationIndex === index && filteredMedications.length > 0 && (
                          <div className="medication-suggestions border rounded p-2 position-absolute w-100 bg-white shadow-sm z-index-dropdown">
                            {filteredMedications.map((med, i) => (
                              <div 
                                key={i} 
                                className="suggestion-item p-2 cursor-pointer hover-bg-light border-bottom"
                                onClick={() => selectMedication(med)}
                              >
                                {med.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for={`medicationDosage${index}`} className="text-muted small">Dosage</Label>
                      <Input
                        type="text"
                        id={`medicationDosage${index}`}
                        placeholder="e.g., 500mg"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="mb-2"
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}>
                    <FormGroup>
                      <Label for={`medicationFrequency${index}`} className="text-muted small">Frequency</Label>
                      <Input
                        type="text"
                        id={`medicationFrequency${index}`}
                        placeholder="e.g., Twice daily"
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="mb-2"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for={`medicationDuration${index}`} className="text-muted small">Duration</Label>
                      <Input
                        type="text"
                        id={`medicationDuration${index}`}
                        placeholder="e.g., 7 days"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        className="mb-2"
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                  <Label for={`medicationInstructions${index}`} className="text-muted small">Instructions</Label>
                  <Input
                    type="text"
                    id={`medicationInstructions${index}`}
                    placeholder="e.g., Take with food"
                    value={medication.instructions}
                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                    className="mb-0"
                  />
                </FormGroup>
                
                {prescription.medications.length > 1 && (
                  <div className="text-end mt-2">
                    <Button
                      color="danger"
                      outline
                      size="sm"
                      onClick={() => removeMedication(index)}
                      type="button"
                    >
                      <FaTrash className="me-1" /> Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </FormGroup>
          
          <FormGroup>
            <Label for="notes" className="fw-bold">Additional Notes</Label>
            <Input
              type="textarea"
              name="notes"
              id="notes"
              placeholder="Enter any additional notes for the pharmacist or patient"
              rows={3}
              value={prescription.notes}
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          color="info" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="me-2" /> Sending...
            </>
          ) : (
            <>
              <FaSave className="me-2" /> Send Prescription
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PrescriptionModal;