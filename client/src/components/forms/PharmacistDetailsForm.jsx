import React, { useState } from 'react';
import { Form, InputGroup, Row, Col, Button, Modal } from 'react-bootstrap';
import { FaPrescriptionBottleAlt, FaStore, FaClock, FaCreditCard } from 'react-icons/fa';

const PharmacistDetailsForm = ({ formData, handleChange }) => {
  const [showWeekdayModal, setShowWeekdayModal] = useState(false);
  const [showWeekendModal, setShowWeekendModal] = useState(false);
  const [customWeekdayStart, setCustomWeekdayStart] = useState('');
  const [customWeekdayEnd, setCustomWeekdayEnd] = useState('');
  const [customWeekendStart, setCustomWeekendStart] = useState('');
  const [customWeekendEnd, setCustomWeekendEnd] = useState('');

  // Format custom hours to display in the form fields
  const formatCustomHours = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    
    // Convert 24h to 12h format
    const formatTime = (time) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Function to handle weekday custom hours save
  const handleWeekdayCustomSave = () => {
    // Format hours for display
    const formattedHours = formatCustomHours(customWeekdayStart, customWeekdayEnd);
    
    // Save raw time values for backend processing
    const rawTimeValue = `${customWeekdayStart} - ${customWeekdayEnd}`;
    
    // Create a custom option in the dropdown with the formatted hours
    const changeEvent = {
      target: {
        name: 'weekdayHours',
        value: formattedHours || rawTimeValue
      }
    };
    
    handleChange(changeEvent);
    setShowWeekdayModal(false);
  };

  // Function to handle weekend custom hours save
  const handleWeekendCustomSave = () => {
    // Format hours for display
    const formattedHours = formatCustomHours(customWeekendStart, customWeekendEnd);
    
    // Save raw time values for backend processing
    const rawTimeValue = `${customWeekendStart} - ${customWeekendEnd}`;
    
    // Create a custom option in the dropdown with the formatted hours
    const changeEvent = {
      target: {
        name: 'weekendHours',
        value: formattedHours || rawTimeValue
      }
    };
    
    handleChange(changeEvent);
    setShowWeekendModal(false);
  };

  // Handle select change with modal logic
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'weekdayHours' && value === 'Custom') {
      setShowWeekdayModal(true);
    } else if (name === 'weekendHours' && value === 'Custom') {
      setShowWeekendModal(true);
    } else {
      handleChange(e);
    }
  };

  return (
    <div className="registration-step">
      <h4 className="mb-3">Pharmacist Details</h4>
      
      <Form.Group className="mb-3" controlId="licenseNumber">
        <Form.Label>Pharmacy License ID</Form.Label>
        <InputGroup hasValidation>
          <InputGroup.Text>
            <FaPrescriptionBottleAlt />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Pharmacy license number"
            name="licenseNumber"
            value={formData.licenseNumber || ''}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide your pharmacy license ID.
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
      
      <Row className="mb-3">
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
      
      <Form.Group className="mb-4" controlId="affiliatedPharmacy">
        <Form.Label>Affiliated Pharmacy Information</Form.Label>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="pharmacyName">
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
          </Col>
          
          <Col md={6}>
            <Form.Group controlId="pharmacyPhone">
              <Form.Label>Pharmacy Phone</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text>+</InputGroup.Text>
                <Form.Control
                  type="tel"
                  pattern="[0-9]*"
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
          </Col>
        </Row>
        
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
      </Form.Group>
      
      <Form.Group className="mb-4" controlId="operationalHours">
        <Form.Label>Operational Hours</Form.Label>
        <Row className="mb-3">
          <Col md={6}>
            <InputGroup hasValidation>
              <InputGroup.Text>
                <FaClock />
              </InputGroup.Text>
              {/* If custom hours are set, display them directly, otherwise show dropdown */}
              {formData.weekdayHours && 
               formData.weekdayHours !== '8AM-5PM' && 
               formData.weekdayHours !== '9AM-6PM' && 
               formData.weekdayHours !== '8AM-8PM' && 
               formData.weekdayHours !== '24hours' &&
               formData.weekdayHours !== 'Custom' ? (
                <Form.Control
                  readOnly
                  value={formData.weekdayHours}
                  onClick={() => setShowWeekdayModal(true)}
                  style={{ cursor: 'pointer', backgroundColor: 'white' }}
                />
              ) : (
                <Form.Control
                  as="select"
                  name="weekdayHours"
                  value={formData.weekdayHours || ''}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">Weekday hours</option>
                  <option value="8AM-5PM">8:00 AM - 5:00 PM</option>
                  <option value="9AM-6PM">9:00 AM - 6:00 PM</option>
                  <option value="8AM-8PM">8:00 AM - 8:00 PM</option>
                  <option value="24hours">24 Hours</option>
                  <option value="Custom">Custom Hours</option>
                </Form.Control>
              )}
              <Form.Control.Feedback type="invalid">
                Please select your weekday operational hours.
              </Form.Control.Feedback>
            </InputGroup>
          </Col>
          
          <Col md={6}>
            <InputGroup hasValidation>
              <InputGroup.Text>
                <FaClock />
              </InputGroup.Text>
              {/* If custom hours are set, display them directly, otherwise show dropdown */}
              {formData.weekendHours && 
               formData.weekendHours !== 'Closed' && 
               formData.weekendHours !== '8AM-12PM' && 
               formData.weekendHours !== '9AM-5PM' && 
               formData.weekendHours !== '8AM-8PM' && 
               formData.weekendHours !== '24hours' &&
               formData.weekendHours !== 'Custom' ? (
                <Form.Control
                  readOnly
                  value={formData.weekendHours}
                  onClick={() => setShowWeekendModal(true)}
                  style={{ cursor: 'pointer', backgroundColor: 'white' }}
                />
              ) : (
                <Form.Control
                  as="select"
                  name="weekendHours"
                  value={formData.weekendHours || ''}
                  onChange={handleSelectChange}
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
              )}
              <Form.Control.Feedback type="invalid">
                Please select your weekend operational hours.
              </Form.Control.Feedback>
            </InputGroup>
          </Col>
        </Row>
      </Form.Group>

      {/* Weekday Custom Hours Modal */}
      <Modal 
        show={showWeekdayModal} 
        onHide={() => setShowWeekdayModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Set Custom Weekday Hours</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="time"
              value={customWeekdayStart}
              onChange={(e) => setCustomWeekdayStart(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="time"
              value={customWeekdayEnd}
              onChange={(e) => setCustomWeekdayEnd(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWeekdayModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleWeekdayCustomSave}
            disabled={!customWeekdayStart || !customWeekdayEnd}
          >
            Save Custom Hours
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Weekend Custom Hours Modal */}
      <Modal 
        show={showWeekendModal} 
        onHide={() => setShowWeekendModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Set Custom Weekend Hours</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="time"
              value={customWeekendStart}
              onChange={(e) => setCustomWeekendStart(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="time"
              value={customWeekendEnd}
              onChange={(e) => setCustomWeekendEnd(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWeekendModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleWeekendCustomSave}
            disabled={!customWeekendStart || !customWeekendEnd}
          >
            Save Custom Hours
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default PharmacistDetailsForm;