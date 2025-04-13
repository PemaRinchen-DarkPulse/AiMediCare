import React from 'react';
import { Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaUserAlt, FaCalendar, FaMapMarkerAlt, FaVenusMars, FaUserMd } from 'react-icons/fa';

const InitialRegistrationForm = ({ formData, handleChange, validated }) => {
  return (
    <div className="registration-step">
      <h4 className="mb-3">Personal Information</h4>
      
      <Form.Group className="mb-3" controlId="fullName">
        <Form.Label>Full Name</Form.Label>
        <InputGroup hasValidation>
          <InputGroup.Text>
            <FaUserAlt />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Full Name"
            name="fullName"
            value={formData.fullName || ''}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide your full name.
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="dateOfBirth">
            <Form.Label>Date of Birth</Form.Label>
            <InputGroup hasValidation>
              <InputGroup.Text>
                <FaCalendar />
              </InputGroup.Text>
              <Form.Control
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ''}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide your date of birth.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="gender">
            <Form.Label>Gender</Form.Label>
            <InputGroup hasValidation>
              <InputGroup.Text>
                <FaVenusMars />
              </InputGroup.Text>
              <Form.Select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                required
                isInvalid={validated && !formData.gender}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select your gender.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="role">
        <Form.Label>Registering as</Form.Label>
        <InputGroup hasValidation>
          <InputGroup.Text>
            <FaUserMd />
          </InputGroup.Text>
          <Form.Select
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
            required
            isInvalid={validated && !formData.role}
          >
            <option value="">Select Role</option>
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Pharmacist">Pharmacist</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            Please select your role.
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-4" controlId="address">
        <Form.Label>Address</Form.Label>
        <InputGroup hasValidation>
          <InputGroup.Text>
            <FaMapMarkerAlt />
          </InputGroup.Text>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Your address"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide your address.
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
    </div>
  );
};

export default InitialRegistrationForm;