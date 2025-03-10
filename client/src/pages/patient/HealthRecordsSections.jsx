import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Container, Alert } from 'react-bootstrap';
import './HealthRecords.css';

// Sample data for demonstration
const sampleImageStudies = [
  {
    id: 1,
    title: 'Chest X-Ray',
    date: '2023-03-15',
    imageUrl: 'https://www.radiologyinfo.org/gallery-items/images/xray-chest.jpg',
    description: 'Routine chest X-ray showing normal lung fields',
    doctor: 'Dr. James Wilson',
    department: 'Radiology'
  },
  {
    id: 2,
    title: 'Brain MRI',
    date: '2023-01-22',
    imageUrl: 'https://www.radiologyinfo.org/gallery-items/images/brain-mri.jpg',
    description: 'MRI scan of brain with contrast',
    doctor: 'Dr. Lisa Reynolds',
    department: 'Neurology'
  },
  {
    id: 3,
    title: 'Abdominal CT',
    date: '2022-11-10',
    imageUrl: 'https://www.radiologyinfo.org/gallery-items/images/ct-abdomen.jpg',
    description: 'CT scan of abdomen with no significant findings',
    doctor: 'Dr. Sarah Johnson',
    department: 'Gastroenterology'
  }
];

const sampleAllergies = [
  {
    id: 1,
    allergen: 'Penicillin',
    severity: 'severe',
    reactions: ['Rash', 'Difficulty breathing'],
    noted: '2020-05-12',
    doctor: 'Dr. Michael Chen'
  },
  {
    id: 2,
    allergen: 'Peanuts',
    severity: 'moderate',
    reactions: ['Hives', 'Swelling'],
    noted: '2019-11-30',
    doctor: 'Dr. Amanda Rodriguez'
  },
  {
    id: 3,
    allergen: 'Pollen',
    severity: 'mild',
    reactions: ['Sneezing', 'Watery eyes'],
    noted: '2021-03-22',
    doctor: 'Dr. Robert Smith'
  }
];

const sampleImmunizations = [
  {
    id: 1,
    vaccine: 'Influenza',
    date: '2022-10-15',
    status: 'completed',
    brand: 'Fluzone',
    provider: 'Dr. Jessica Williams',
    location: 'City Medical Center'
  },
  {
    id: 2,
    vaccine: 'COVID-19 Booster',
    date: '2022-09-05',
    status: 'completed',
    brand: 'Moderna',
    provider: 'Dr. Thomas Brown',
    location: 'Community Health Clinic'
  },
  {
    id: 3,
    vaccine: 'Tdap (Tetanus, Diphtheria, Pertussis)',
    date: '2023-05-20',
    status: 'upcoming',
    brand: null,
    provider: null,
    location: 'Scheduled at City Medical Center'
  },
  {
    id: 4,
    vaccine: 'Pneumococcal',
    date: '2022-01-11',
    status: 'missed',
    brand: 'Prevnar 13',
    provider: null,
    location: 'Appointment missed'
  }
];

// Image Studies Component
export const ImagingStudies = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openImageViewer = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  return (
    <div className="imaging-studies-section">
      <h4 className="mb-4">Imaging Studies</h4>
      
      <div className="image-gallery">
        {sampleImageStudies.map(image => (
          <div 
            key={image.id} 
            className="gallery-item" 
            onClick={() => openImageViewer(image)}
          >
            <img src={image.imageUrl} alt={image.title} />
            <div className="gallery-item-overlay">
              {image.title} ({new Date(image.date).toLocaleDateString()})
            </div>
          </div>
        ))}
      </div>
      
      <Row className="mt-4">
        {sampleImageStudies.map(image => (
          <Col md={4} key={image.id} className="mb-4">
            <Card className="imaging-card">
              <Card.Img 
                variant="top" 
                src={image.imageUrl} 
                alt={image.title}
                onClick={() => openImageViewer(image)} 
              />
              <Card.Body>
                <Card.Title>{image.title}</Card.Title>
                <div className="imaging-details">
                  <p className="text-muted">
                    <strong>Date:</strong> {new Date(image.date).toLocaleDateString()}
                  </p>
                  <p>{image.description}</p>
                  <p className="mb-1"><strong>Ordered by:</strong> {image.doctor}</p>
                  <p className="text-muted"><small>{image.department}</small></p>
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => openImageViewer(image)}
                  className="mt-2"
                >
                  View Image
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        size="lg" 
        centered
        className="imaging-viewer-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedImage?.title} - {selectedImage && new Date(selectedImage.date).toLocaleDateString()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.title}
              style={{ maxWidth: '100%' }} 
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <p className="me-auto">{selectedImage?.description}</p>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Allergies Component
export const Allergies = () => {
  return (
    <div className="allergies-section">
      <h4 className="mb-4">Allergies & Adverse Reactions</h4>
      
      {sampleAllergies.length === 0 ? (
        <div className="alert alert-info">No known allergies recorded.</div>
      ) : (
        <>
          {sampleAllergies.map(allergy => (
            <div 
              key={allergy.id} 
              className={`allergy-item ${allergy.severity}`}
            >
              <div className={`allergy-severity-indicator severity-${allergy.severity}`}></div>
              <div className="allergy-details">
                <h5>
                  {allergy.allergen}
                  {allergy.severity === 'severe' && 
                    <Badge bg="danger" className="ms-2">SEVERE</Badge>
                  }
                  {allergy.severity === 'moderate' && 
                    <Badge bg="warning" className="ms-2">MODERATE</Badge>
                  }
                </h5>
                <div>
                  <strong>Reactions:</strong>{' '}
                  {allergy.reactions.map((reaction, index) => (
                    <span key={index} className="allergy-reaction-tag">
                      {reaction}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-muted">
                  <small>
                    Noted on {new Date(allergy.noted).toLocaleDateString()} by {allergy.doctor}
                  </small>
                </div>
              </div>
            </div>
          ))}
          
          <div className="alert alert-warning mt-4">
            <strong>Important:</strong> Please inform all healthcare providers about these allergies before treatment.
          </div>
        </>
      )}
    </div>
  );
};

// Immunizations Component
export const Immunizations = () => {
  // Calculate completion status
  const total = sampleImmunizations.length;
  const completed = sampleImmunizations.filter(i => i.status === 'completed').length;
  const percentComplete = Math.round((completed / total) * 100);
  
  let statusClass = 'incomplete';
  if (percentComplete === 100) {
    statusClass = 'complete';
  } else if (percentComplete >= 50) {
    statusClass = 'almost';
  }
  
  return (
    <div className="immunization-container">
      <h4 className="mb-4">Immunizations</h4>
      
      <Row className="mb-4">
        <Col md={4} className="text-center">
          <div className={`status-circle ${statusClass}`}>
            {percentComplete}%
          </div>
          <p className="mt-3">
            <strong>Immunization Status</strong><br/>
            <span className="text-muted">{completed} of {total} completed</span>
          </p>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Immunization Schedule</Card.Title>
              <div className="immunization-timeline">
                {sampleImmunizations.map(immunization => (
                  <div 
                    key={immunization.id} 
                    className={`immunization-event ${immunization.status}`}
                  >
                    <h6>
                      {immunization.vaccine}
                      {immunization.brand && (
                        <span className="vaccine-brand">{immunization.brand}</span>
                      )}
                    </h6>
                    <p className="mb-0">
                      {immunization.status === 'upcoming' ? 'Scheduled for: ' : 'Date: '}
                      {new Date(immunization.date).toLocaleDateString()}
                    </p>
                    <p className="text-muted mb-0">
                      {immunization.status === 'completed' ? (
                        <>Administered by {immunization.provider} at {immunization.location}</>
                      ) : immunization.status === 'upcoming' ? (
                        <>{immunization.location}</>
                      ) : (
                        <>Missed appointment - please reschedule</>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <div className="alert alert-info">
        <strong>Next recommended vaccination:</strong> Annual flu shot in October 2023.
      </div>
    </div>
  );
};

// Main component that combines all sections
const HealthRecordsSections = () => {
  return (
    <Container className="health-records-container p-4">
      <h2 className="mb-4">Health Records</h2>
      
      <Row className="mb-5">
        <Col>
          <ImagingStudies />
        </Col>
      </Row>
      
      <Row className="mb-5">
        <Col>
          <Allergies />
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Immunizations />
        </Col>
      </Row>
    </Container>
  );
};

export default HealthRecordsSections;
