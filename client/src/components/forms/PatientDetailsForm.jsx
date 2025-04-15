import React from 'react';
import { Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaUserFriends, FaIdCard } from 'react-icons/fa';

const PatientDetailsForm = ({ formData, handleChange }) => {
  return (
    <div className="registration-step">
      <h4 className="mb-3">Patient Details</h4>
      
      <Form.Group className="mb-4" controlId="emergencyContact">
        <Form.Label>Emergency Contact Information</Form.Label>
        
        <Form.Group className="mb-3" controlId="emergencyContactName">
          <Form.Label>Contact Name</Form.Label>
          <InputGroup hasValidation>
            <InputGroup.Text>
              <FaUserFriends />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Emergency contact name"
              name="emergencyContactName"
              value={formData.emergencyContactName || ''}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide an emergency contact name.
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="emergencyContactPhone">
              <Form.Label>Contact Phone</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text>+</InputGroup.Text>
                <Form.Control
                  type="tel"
                  placeholder="Emergency contact phone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone || ''}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid emergency contact phone number.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group controlId="emergencyContactRelationship">
              <Form.Label>Relationship</Form.Label>
              <Form.Select
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select the relationship.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      </Form.Group>
      
      <Form.Group className="mb-4" controlId="healthInsurance">
        <Form.Label>Health Insurance Information</Form.Label>
        
        <Form.Group className="mb-3" controlId="insuranceProvider">
          <Form.Label>Insurance Provider</Form.Label>
          <Form.Control
            type="text"
            placeholder="Insurance provider name"
            name="insuranceProvider"
            value={formData.insuranceProvider || ''}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide your insurance provider.
          </Form.Control.Feedback>
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="policyNumber">
          <Form.Label>Policy Number</Form.Label>
          <InputGroup hasValidation>
            <InputGroup.Text>
              <FaIdCard />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Insurance policy number"
              name="policyNumber"
              value={formData.policyNumber || ''}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide your policy number.
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="groupNumber">
          <Form.Label>Group Number (Optional)</Form.Label>
          <Form.Control
            type="text"
            placeholder="Group number if applicable"
            name="groupNumber"
            value={formData.groupNumber || ''}
            onChange={handleChange}
          />
        </Form.Group>
      </Form.Group>
    </div>
  );
};

export default PatientDetailsForm;