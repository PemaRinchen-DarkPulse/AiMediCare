import React, { useState } from 'react';
import { Form, Row, Col, Button, FormGroup, Label, Input, Alert, Spinner } from 'reactstrap';
import { FaUser, FaUpload } from 'react-icons/fa';

const EditablePatientProfileForm = ({ profileData, onSubmit, loading, error, success }) => {
  const [formData, setFormData] = useState({
    name: profileData?.name || '',
    email: profileData?.email || '',
    phoneNumber: profileData?.phoneNumber || '',
    profileImage: profileData?.profileImage || '',
    gender: profileData?.gender || '',
    dateOfBirth: profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
    address: profileData?.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    bloodType: profileData?.bloodType || '',
    height: profileData?.height || '',
    weight: profileData?.weight || ''
  });

  const [previewImage, setPreviewImage] = useState(profileData?.profileImage || '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields (address)
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      // Handle regular fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // In a real app, you would upload the file to your server/cloud storage
      // and get back a URL to store in formData
      // For now, we'll just use the preview URL
      setFormData({
        ...formData,
        profileImage: previewUrl
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderProfileImage = () => {
    if (previewImage) {
      return (
        <div 
          className="profile-image rounded-circle" 
          style={{ 
            width: '150px', 
            height: '150px', 
            backgroundImage: `url(${previewImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            margin: '0 auto'
          }}
        ></div>
      );
    } else {
      return (
        <div 
          className="profile-image rounded-circle bg-light d-flex justify-content-center align-items-center" 
          style={{ width: '150px', height: '150px', margin: '0 auto' }}
        >
          <FaUser size={60} className="text-secondary" />
        </div>
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}

      <Row>
        <Col md={3} className="text-center mb-4">
          <div className="profile-image-container mb-3">
            {renderProfileImage()}
          </div>
          <div className="image-upload">
            <Label for="profileImage" className="btn btn-outline-primary btn-sm">
              <FaUpload className="me-1" /> Change Picture
            </Label>
            <Input
              type="file"
              name="profileImage"
              id="profileImage"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              accept="image/*"
            />
          </div>
        </Col>
        <Col md={9}>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="name">Full Name</Label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  disabled
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="phoneNumber">Phone Number</Label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="dateOfBirth">Date of Birth</Label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="gender">Gender</Label>
                <Input
                  type="select"
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="bloodType">Blood Type</Label>
                <Input
                  type="select"
                  name="bloodType"
                  id="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="height">Height (cm)</Label>
                <Input
                  type="number"
                  name="height"
                  id="height"
                  value={formData.height}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="weight">Weight (kg)</Label>
                <Input
                  type="number"
                  name="weight"
                  id="weight"
                  value={formData.weight}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
          </Row>
        </Col>
      </Row>

      <h5 className="mt-4 mb-3">Address Information</h5>
      <Row>
        <Col md={12}>
          <FormGroup>
            <Label for="address.street">Street Address</Label>
            <Input
              type="text"
              name="address.street"
              id="addressStreet"
              value={formData.address?.street || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="address.city">City</Label>
            <Input
              type="text"
              name="address.city"
              id="addressCity"
              value={formData.address?.city || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="address.state">State</Label>
            <Input
              type="text"
              name="address.state"
              id="addressState"
              value={formData.address?.state || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="address.zipCode">Zip Code</Label>
            <Input
              type="text"
              name="address.zipCode"
              id="addressZipCode"
              value={formData.address?.zipCode || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label for="address.country">Country</Label>
            <Input
              type="text"
              name="address.country"
              id="addressCountry"
              value={formData.address?.country || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-4">
        <Button type="submit" color="primary" disabled={loading}>
          {loading ? <Spinner size="sm" className="me-2" /> : null}
          Save Profile Changes
        </Button>
      </div>
    </Form>
  );
};

export default EditablePatientProfileForm;