import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FaUserMd, FaHospital, FaCreditCard } from 'react-icons/fa';

const DoctorDetailsForm = ({ formData, handleChange }) => {
  return (
    <div className="registration-step">
      <h4 className="mb-3">Medical Professional Details</h4>
      
      <Form.Group className="mb-4" controlId="licenseInfo">
        <Form.Label>Medical License Information</Form.Label>
        
        <Form.Group className="mb-3" controlId="medicalLicenseNumber">
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
        
        <Form.Group className="mb-3" controlId="issuingAuthority">
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
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="specialization">
        <Form.Label>Specialization</Form.Label>
        <Form.Control
          as="select"
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
        </Form.Control>
        <Form.Control.Feedback type="invalid">
          Please select your specialization.
        </Form.Control.Feedback>
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="yearsExperience">
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
      
      <Form.Group className="mb-4" controlId="affiliationInfo">
        <Form.Label>Clinic/Hospital Affiliation</Form.Label>
        
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
        
        <Form.Group className="mb-3" controlId="accountHolder">
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
        
        <Form.Group className="mb-3" controlId="bankName">
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
        
        <Form.Group className="mb-3" controlId="accountNumber">
          <Form.Label>Account Number</Form.Label>
          <InputGroup hasValidation>
            <InputGroup.Text>
              <FaCreditCard />
            </InputGroup.Text>
            <Form.Control
              type="text"
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