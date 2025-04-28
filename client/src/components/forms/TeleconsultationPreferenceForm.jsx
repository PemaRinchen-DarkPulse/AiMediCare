import React, { useState } from 'react';
import { Form, FormGroup, Label, Input, Button, Alert, Spinner, Row, Col } from 'reactstrap';

const TeleconsultationPreferenceForm = ({ preferences, onSubmit, loading, error, success }) => {
  const [formData, setFormData] = useState({
    preferredPlatform: preferences?.preferredPlatform || 'In-App',
    isEnabled: preferences?.isEnabled !== undefined ? preferences.isEnabled : true,
    emergencyContact: preferences?.emergencyContact || {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const contactField = name.split('.')[1];
      setFormData({
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact,
          [contactField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}
      
      <FormGroup className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Label for="isEnabled" className="form-label mb-0">Enable Teleconsultations</Label>
          <div className="form-check form-switch">
            <Input
              type="switch"
              id="isEnabled"
              name="isEnabled"
              checked={formData.isEnabled}
              onChange={handleChange}
            />
          </div>
        </div>
        <p className="text-muted small">
          Enable or disable the ability for doctors to schedule video consultations with you.
        </p>
      </FormGroup>
      
      <FormGroup className="mb-3">
        <Label for="preferredPlatform">Preferred Platform</Label>
        <Input
          type="select"
          name="preferredPlatform"
          id="preferredPlatform"
          value={formData.preferredPlatform}
          onChange={handleChange}
          disabled={!formData.isEnabled}
        >
          <option value="In-App">In-App Video (Default)</option>
          <option value="Zoom">Zoom</option>
          <option value="Google Meet">Google Meet</option>
        </Input>
        <small className="text-muted">
          Select your preferred platform for video consultations.
        </small>
      </FormGroup>
      
      <h5 className="mt-4 mb-3">Emergency Contact (Optional)</h5>
      <p className="text-muted small">
        This person may be contacted in case of emergency during a teleconsultation.
      </p>
      
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="emergencyContact.name">Name</Label>
            <Input
              type="text"
              name="emergencyContact.name"
              id="emergencyContactName"
              value={formData.emergencyContact?.name || ''}
              onChange={handleChange}
              disabled={!formData.isEnabled}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="emergencyContact.phone">Phone Number</Label>
            <Input
              type="text"
              name="emergencyContact.phone"
              id="emergencyContactPhone"
              value={formData.emergencyContact?.phone || ''}
              onChange={handleChange}
              disabled={!formData.isEnabled}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <FormGroup>
            <Label for="emergencyContact.relationship">Relationship</Label>
            <Input
              type="select"
              name="emergencyContact.relationship"
              id="emergencyContactRelationship"
              value={formData.emergencyContact?.relationship || ''}
              onChange={handleChange}
              disabled={!formData.isEnabled}
            >
              <option value="">Select Relationship</option>
              <option value="Spouse">Spouse</option>
              <option value="Parent">Parent</option>
              <option value="Child">Child</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Caregiver">Caregiver</option>
              <option value="Other">Other</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>
      
      <div className="d-flex justify-content-end mt-4">
        <Button type="submit" color="primary" disabled={loading}>
          {loading ? <Spinner size="sm" className="me-2" /> : null}
          Save Teleconsultation Preferences
        </Button>
      </div>
    </Form>
  );
};

export default TeleconsultationPreferenceForm;