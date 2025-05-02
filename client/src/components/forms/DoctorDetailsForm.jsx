import React from 'react';
import { Form, InputGroup, Row, Col } from 'react-bootstrap';
import { FaUserMd, FaHospital, FaCreditCard } from 'react-icons/fa';

const DoctorDetailsForm = ({ formData, handleChange }) => {
  return (
    <div className="registration-step">
      <Form.Group className="mb-3" controlId="licenseInfo">
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="medicalLicenseNumber">
              <Form.Label>Medical License Number</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text>
                  <FaUserMd />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Medical license number"
                  name="medicalLicenseNumber"
                  value={formData.medicalLicenseNumber || ''}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide your medical license number.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group controlId="issuingAuthority">
              <Form.Label>Issuing Authority</Form.Label>
              <Form.Control
                type="text"
                placeholder="Licensing board or authority"
                name="issuingAuthority"
                value={formData.issuingAuthority || ''}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide the issuing authority.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      </Form.Group>
      
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="specialization">
            <Form.Label>Specialization</Form.Label>
            <Form.Select
              name="specialization"
              value={formData.specialization || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select specialization</option>
              <option value="General Practice">General Practice</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Neurology">Neurology</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="Oncology">Oncology</option>
              <option value="Other">Other</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select your specialization.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group controlId="yearsExperience">
            <Form.Label>Years of Experience</Form.Label>
            <Form.Control
              type="number"
              min="0"
              placeholder="Years of professional experience"
              name="yearsExperience"
              value={formData.yearsExperience || ''}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide your years of experience.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className="mb-3" controlId="affiliationInfo">
        
        <Form.Group className="mb-3" controlId="hospitalName">
          <Form.Label>Clinic/Hospital Name</Form.Label>
          <InputGroup hasValidation>
            <InputGroup.Text>
              <FaHospital />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Clinic or hospital name"
              name="hospitalName"
              value={formData.hospitalName || ''}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide your clinic/hospital name.
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="hospitalAddress">
          <Form.Label>Clinic/Hospital Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Full address of your practice"
            name="hospitalAddress"
            value={formData.hospitalAddress || ''}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide the clinic/hospital address.
          </Form.Control.Feedback>
        </Form.Group>
      </Form.Group>
      
      <Form.Group className="mb-4" controlId="bankingDetails">
        <Form.Label>Banking Details</Form.Label>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="accountHolder">
              <Form.Label>Account Holder Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name on bank account"
                name="accountHolder"
                value={formData.accountHolder || ''}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide the account holder name.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group controlId="bankName">
              <Form.Label>Bank Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Bank name"
                name="bankName"
                value={formData.bankName || ''}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide your bank name.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-3" controlId="accountNumber">
          <Form.Label>Account Number</Form.Label>
          <InputGroup hasValidation>
            <InputGroup.Text>
              <FaCreditCard />
            </InputGroup.Text>
            <Form.Control
              type="number"
              placeholder="Bank account number"
              name="accountNumber"
              value={formData.accountNumber || ''}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide your account number.
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
      </Form.Group>
    </div>
  );
};

export default DoctorDetailsForm;