import React from 'react';
import { Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaUserAlt, FaCalendar, FaMapMarkerAlt, FaVenusMars, FaUserMd } from 'react-icons/fa';

const InitialRegistrationForm = ({ formData, handleChange, validated }) => {
  return (
    <div className="registration-step">
      <h4 className="mb-3">Personal Information</h4>
      
      <Form.Group className="mb-3" controlId="fullName">
        <Form.Label>Full Name</Form.Label>
        <InputGroup>
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
            isInvalid={validated && !formData.fullName}
            className="no-validation-icon"
          />
        </InputGroup>
        {validated && !formData.fullName && (
          <div className="text-danger small mt-1">
            Please provide your full name.
          </div>
        )}
      </Form.Group>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="dateOfBirth">
            <Form.Label>Date of Birth</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaCalendar />
              </InputGroup.Text>
              <Form.Control
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ''}
                onChange={handleChange}
                required
                isInvalid={validated && !formData.dateOfBirth}
                className="no-validation-icon"
              />
            </InputGroup>
            {validated && !formData.dateOfBirth && (
              <div className="text-danger small mt-1">
                Please provide your date of birth.
              </div>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="gender">
            <Form.Label>Gender</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaVenusMars />
              </InputGroup.Text>
              <Form.Select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                required
                isInvalid={validated && !formData.gender}
                className="no-validation-icon"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </Form.Select>
            </InputGroup>
            {validated && !formData.gender && (
              <div className="text-danger small mt-1">
                Please select your gender.
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3" controlId="role">
        <Form.Label>Registering as</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <FaUserMd />
          </InputGroup.Text>
          <Form.Select
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
            required
            isInvalid={validated && !formData.role}
            className="no-validation-icon"
          >
            <option value="">Select Role</option>
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Pharmacist">Pharmacist</option>
          </Form.Select>
        </InputGroup>
        {validated && !formData.role && (
          <div className="text-danger small mt-1">
            Please select your role.
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-3" controlId="streetAddress">
        <Form.Label>Street Address <span className="text-danger">*</span></Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <FaMapMarkerAlt />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="123 Main Street,Downtown District,California, 90015, United States"
            name="streetAddress"
            value={formData.streetAddress || ''}
            onChange={handleChange}
            required
            isInvalid={validated && !formData.streetAddress}
            className="no-validation-icon"
          />
        </InputGroup>
        {validated && !formData.streetAddress && (
          <div className="text-danger small mt-1">
            Please provide your street address.
          </div>
        )}
      </Form.Group>
    </div>
  );
};

export default InitialRegistrationForm;