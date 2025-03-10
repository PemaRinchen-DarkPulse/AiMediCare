import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { FaFileExport, FaShareAlt } from 'react-icons/fa';

const HospitalRecords = () => {
  return (
    <Card>
      <Card.Header as="h4">
        <div className="d-flex justify-content-between align-items-center">
          <span>Hospital Records</span>
          <div>
            <Button variant="outline-primary" size="sm" className="me-2">
              <FaFileExport className="me-1" /> Export
            </Button>
            <Button variant="outline-primary" size="sm">
              <FaShareAlt className="me-1" /> Share
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <p>View your hospital stays, emergency department visits, and surgical procedures.</p>
        
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Inpatient Hospital Stay</h5>
              <Badge bg="light" text="dark">2023</Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Facility:</strong> Memorial General Hospital</p>
                <p><strong>Admission Date:</strong> October 14, 2023</p>
                <p><strong>Discharge Date:</strong> October 17, 2023</p>
              </Col>
              <Col md={6}>
                <p><strong>Primary Diagnosis:</strong> Diabetic Ketoacidosis</p>
                <p><strong>Attending Physician:</strong> Dr. Elizabeth Barnes</p>
              </Col>
            </Row>
            <Button variant="primary" size="sm">View Complete Record</Button>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="bg-danger text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Emergency Department Visit</h5>
              <Badge bg="light" text="dark">2024</Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Facility:</strong> Memorial General Hospital</p>
                <p><strong>Date of Service:</strong> March 3, 2024</p>
              </Col>
              <Col md={6}>
                <p><strong>Chief Complaint:</strong> Chest Pain</p>
                <p><strong>Final Diagnosis:</strong> GERD</p>
              </Col>
            </Row>
            <Button variant="primary" size="sm">View Complete Record</Button>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
};

export default HospitalRecords;
