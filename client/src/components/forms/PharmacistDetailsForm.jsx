import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FaPrescriptionBottleAlt, FaStore, FaClock } from 'react-icons/fa';

const PharmacistDetailsForm = ({ formData, handleChange }) => {
  return (
    <div className="registration-step">
      <Form.Group className="mb-3" controlId="pharmacyLicenseId">
        <Form.Label>Pharmacy License ID</Form.Label>
        <InputGroup hasValidation>
          <InputGroup.Text>
            <FaPrescriptionBottleAlt />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Pharmacy license number"
            name="pharmacyLicenseId"
            value={formData.pharmacyLicenseId || ''}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide your pharmacy license ID.
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
      
      <Form.Group className="mb-4" controlId="affiliatedPharmacy">
        <Form.Label>Affiliated Pharmacy Information</Form.Label>
        
        <Form.Group className="mb-3" controlId="pharmacyName">
          <Form.Label>Pharmacy Name</Form.Label>
          <InputGroup hasValidation>
            <InputGroup.Text>
              <FaStore />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Pharmacy name"
              name="pharmacyName"
              value={formData.pharmacyName || ''}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide your pharmacy name.
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="pharmacyAddress">
          <Form.Label>Pharmacy Location</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Full address of your pharmacy"
            name="pharmacyAddress"
            value={formData.pharmacyAddress || ''}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide the pharmacy address.
          </Form.Control.Feedback>
        </Form.Group>
        
        <Form.Group className="mb-3" controlId="pharmacyPhone">
          <Form.Label>Pharmacy Phone</Form.Label>
          <InputGroup hasValidation>
            <InputGroup.Text>+</InputGroup.Text>
            <Form.Control
              type="tel"
              placeholder="Pharmacy contact number"
              name="pharmacyPhone"
              value={formData.pharmacyPhone || ''}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide the pharmacy phone number.
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
      </Form.Group>
      
      <Form.Group className="mb-4" controlId="operationalHours">
        <Form.Label>Operational Hours</Form.Label>
        <InputGroup hasValidation className="mb-3">
          <InputGroup.Text>
            <FaClock />
          </InputGroup.Text>
          <Form.Control
            as="select"
            name="weekdayHours"
            value={formData.weekdayHours || ''}
            onChange={handleChange}
            required
          >
            <option value="">Weekday hours</option>
            <option value="8AM-5PM">8:00 AM - 5:00 PM</option>
            <option value="9AM-6PM">9:00 AM - 6:00 PM</option>
            <option value="8AM-8PM">8:00 AM - 8:00 PM</option>
            <option value="24hours">24 Hours</option>
            <option value="Custom">Custom Hours</option>
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            Please select your weekday operational hours.
          </Form.Control.Feedback>
        </InputGroup>
        
        <InputGroup hasValidation>
          <InputGroup.Text>
            <FaClock />
          </InputGroup.Text>
          <Form.Control
            as="select"
            name="weekendHours"
            value={formData.weekendHours || ''}
            onChange={handleChange}
            required
          >
            <option value="">Weekend hours</option>
            <option value="Closed">Closed</option>
            <option value="8AM-12PM">8:00 AM - 12:00 PM</option>
            <option value="9AM-5PM">9:00 AM - 5:00 PM</option>
            <option value="8AM-8PM">8:00 AM - 8:00 PM</option>
            <option value="24hours">24 Hours</option>
            <option value="Custom">Custom Hours</option>
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            Please select your weekend operational hours.
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
      
      {(formData.weekdayHours === 'Custom' || formData.weekendHours === 'Custom') && (
        <Form.Group className="mb-3" controlId="customHours">
          <Form.Label>Custom Hours Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Please specify your custom operational hours"
            name="customHours"
            value={formData.customHours || ''}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please describe your custom hours.
          </Form.Control.Feedback>
        </Form.Group>
      )}
    </div>
  );
};

export default PharmacistDetailsForm;