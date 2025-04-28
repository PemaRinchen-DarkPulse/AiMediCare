import React, { useState } from 'react';
import { Form, Button, Alert, Spinner, Row, Col, Card, CardBody, CardHeader, ListGroup, ListGroupItem, Input } from 'reactstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';

const MedicalInfoForm = ({ medicalInfo, onSubmit, loading, error, success }) => {
  const [formData, setFormData] = useState({
    allergies: medicalInfo?.allergies || [],
    medicalConditions: medicalInfo?.medicalConditions || [],
    medications: medicalInfo?.medications || []
  });

  // State for new item inputs
  const [newAllergy, setNewAllergy] = useState({ allergen: '', severity: 'Mild', reaction: '' });
  const [newCondition, setNewCondition] = useState({ condition: '', diagnosisDate: '', notes: '' });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', startDate: '' });

  // Handle adding items
  const addAllergy = () => {
    if (!newAllergy.allergen || !newAllergy.reaction) return;
    
    setFormData({
      ...formData,
      allergies: [...formData.allergies, { ...newAllergy }]
    });
    setNewAllergy({ allergen: '', severity: 'Mild', reaction: '' });
  };

  const addCondition = () => {
    if (!newCondition.condition) return;
    
    setFormData({
      ...formData,
      medicalConditions: [...formData.medicalConditions, { ...newCondition }]
    });
    setNewCondition({ condition: '', diagnosisDate: '', notes: '' });
  };

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage) return;
    
    setFormData({
      ...formData,
      medications: [...formData.medications, { ...newMedication }]
    });
    setNewMedication({ name: '', dosage: '', frequency: '', startDate: '' });
  };

  // Handle removing items
  const removeAllergy = (index) => {
    const updatedAllergies = [...formData.allergies];
    updatedAllergies.splice(index, 1);
    setFormData({ ...formData, allergies: updatedAllergies });
  };

  const removeCondition = (index) => {
    const updatedConditions = [...formData.medicalConditions];
    updatedConditions.splice(index, 1);
    setFormData({ ...formData, medicalConditions: updatedConditions });
  };

  const removeMedication = (index) => {
    const updatedMedications = [...formData.medications];
    updatedMedications.splice(index, 1);
    setFormData({ ...formData, medications: updatedMedications });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}
      
      <p className="text-muted mb-4">
        This information will be available to your healthcare providers during consultations to provide better care.
      </p>
      
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Allergies</h5>
            </CardHeader>
            <CardBody>
              <ListGroup className="mb-3">
                {formData.allergies.length === 0 ? (
                  <ListGroupItem className="text-muted">No allergies added</ListGroupItem>
                ) : (
                  formData.allergies.map((allergy, index) => (
                    <ListGroupItem key={index} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{allergy.allergen}</strong>
                        <div><small>Severity: {allergy.severity}</small></div>
                        <div><small>Reaction: {allergy.reaction}</small></div>
                      </div>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => removeAllergy(index)}
                        title="Remove"
                      >
                        <FaTrash />
                      </Button>
                    </ListGroupItem>
                  ))
                )}
              </ListGroup>
              
              <div className="mb-2">
                <Input
                  type="text"
                  placeholder="Allergen"
                  value={newAllergy.allergen}
                  onChange={(e) => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                  className="mb-2"
                />
                <Input
                  type="select"
                  value={newAllergy.severity}
                  onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })}
                  className="mb-2"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </Input>
                <Input
                  type="text"
                  placeholder="Reaction"
                  value={newAllergy.reaction}
                  onChange={(e) => setNewAllergy({ ...newAllergy, reaction: e.target.value })}
                  className="mb-2"
                />
              </div>
              <Button color="primary" size="sm" onClick={addAllergy} disabled={!newAllergy.allergen || !newAllergy.reaction}>
                <FaPlus className="me-1" /> Add Allergy
              </Button>
            </CardBody>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Medical Conditions</h5>
            </CardHeader>
            <CardBody>
              <ListGroup className="mb-3">
                {formData.medicalConditions.length === 0 ? (
                  <ListGroupItem className="text-muted">No conditions added</ListGroupItem>
                ) : (
                  formData.medicalConditions.map((condition, index) => (
                    <ListGroupItem key={index} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{condition.condition}</strong>
                        {condition.diagnosisDate && (
                          <div><small>Diagnosed: {new Date(condition.diagnosisDate).toLocaleDateString()}</small></div>
                        )}
                        {condition.notes && <div><small>Notes: {condition.notes}</small></div>}
                      </div>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => removeCondition(index)}
                        title="Remove"
                      >
                        <FaTrash />
                      </Button>
                    </ListGroupItem>
                  ))
                )}
              </ListGroup>
              
              <div className="mb-2">
                <Input
                  type="text"
                  placeholder="Condition"
                  value={newCondition.condition}
                  onChange={(e) => setNewCondition({ ...newCondition, condition: e.target.value })}
                  className="mb-2"
                />
                <Input
                  type="date"
                  placeholder="Diagnosis Date"
                  value={newCondition.diagnosisDate}
                  onChange={(e) => setNewCondition({ ...newCondition, diagnosisDate: e.target.value })}
                  className="mb-2"
                />
                <Input
                  type="textarea"
                  placeholder="Notes"
                  value={newCondition.notes}
                  onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                  className="mb-2"
                  rows="2"
                />
              </div>
              <Button color="primary" size="sm" onClick={addCondition} disabled={!newCondition.condition}>
                <FaPlus className="me-1" /> Add Condition
              </Button>
            </CardBody>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Current Medications</h5>
            </CardHeader>
            <CardBody>
              <ListGroup className="mb-3">
                {formData.medications.length === 0 ? (
                  <ListGroupItem className="text-muted">No medications added</ListGroupItem>
                ) : (
                  formData.medications.map((medication, index) => (
                    <ListGroupItem key={index} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{medication.name}</strong>
                        <div><small>Dosage: {medication.dosage}</small></div>
                        {medication.frequency && <div><small>Frequency: {medication.frequency}</small></div>}
                      </div>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        title="Remove"
                      >
                        <FaTrash />
                      </Button>
                    </ListGroupItem>
                  ))
                )}
              </ListGroup>
              
              <div className="mb-2">
                <Input
                  type="text"
                  placeholder="Medication Name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  className="mb-2"
                />
                <Input
                  type="text"
                  placeholder="Dosage (e.g. 10mg)"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  className="mb-2"
                />
                <Input
                  type="text"
                  placeholder="Frequency (e.g. twice daily)"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                  className="mb-2"
                />
              </div>
              <Button color="primary" size="sm" onClick={addMedication} disabled={!newMedication.name || !newMedication.dosage}>
                <FaPlus className="me-1" /> Add Medication
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
      
      <div className="d-flex justify-content-end mt-2">
        <Button type="submit" color="primary" disabled={loading}>
          {loading ? <Spinner size="sm" className="me-2" /> : null}
          Save Medical Information
        </Button>
      </div>
    </Form>
  );
};

export default MedicalInfoForm;