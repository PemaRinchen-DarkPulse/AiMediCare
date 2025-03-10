import React, { useEffect } from 'react';
import { Card, Row, Col, Badge, ListGroup, Tab, Nav, Button } from 'react-bootstrap';
import { FaFileAlt, FaCalendarAlt, FaHeartbeat, FaPills, FaNotesMedical } from 'react-icons/fa';

const MedicalHistory = () => {
  useEffect(() => {
    console.log("MedicalHistory component mounted");
  }, []);

  return (
    <Card>
      <Card.Header as="h4">
        <div className="d-flex justify-content-between align-items-center">
          <span>Medical History</span>
          <div>
            <Button variant="outline-primary" size="sm">
              <FaFileAlt className="me-1" /> Print/Export
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <Tab.Container id="medical-history-tabs" defaultActiveKey="conditions">
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="conditions">Chronic Conditions</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="diagnoses">Recent Diagnoses</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="meds">Current Medications</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="procedures">Procedures</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="family-history">Family History</Nav.Link>
            </Nav.Item>
          </Nav>
          
          <Tab.Content>
            <Tab.Pane eventKey="conditions">
              <h5>Chronic Medical Conditions</h5>
              <ListGroup>
                <ListGroup.Item>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6>Type 2 Diabetes Mellitus</h6>
                      <div><FaCalendarAlt className="me-2" />Diagnosed: June 2020</div>
                      <div>Managing with Metformin 1000mg twice daily and lifestyle modifications.</div>
                    </div>
                    <Badge bg="primary">Active</Badge>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6>Essential Hypertension</h6>
                      <div><FaCalendarAlt className="me-2" />Diagnosed: March 2019</div>
                      <div>Managing with Lisinopril 20mg daily and low-sodium diet.</div>
                    </div>
                    <Badge bg="primary">Active</Badge>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6>Hyperlipidemia</h6>
                      <div><FaCalendarAlt className="me-2" />Diagnosed: March 2019</div>
                      <div>Managing with Atorvastatin 20mg daily.</div>
                    </div>
                    <Badge bg="primary">Active</Badge>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Tab.Pane>
            
            <Tab.Pane eventKey="diagnoses">
              <h5>Recent Medical Diagnoses</h5>
              <ListGroup>
                <ListGroup.Item>
                  <Row>
                    <Col md={3}>
                      <div className="fw-bold">March 3, 2024</div>
                      <Badge bg="info">Dr. Robert Wilson</Badge>
                    </Col>
                    <Col md={9}>
                      <h6>Gastroesophageal Reflux Disease (GERD)</h6>
                      <p className="mb-0">Presenting with substernal chest pain, diagnosed following negative cardiac workup. Prescribed omeprazole 20mg daily.</p>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col md={3}>
                      <div className="fw-bold">October 14, 2023</div>
                      <Badge bg="info">Dr. Elizabeth Barnes</Badge>
                    </Col>
                    <Col md={9}>
                      <h6>Diabetic Ketoacidosis</h6>
                      <p className="mb-0">Presented with hyperglycemia, metabolic acidosis and dehydration. Required hospital admission for IV insulin and fluid resuscitation.</p>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col md={3}>
                      <div className="fw-bold">January 10, 2023</div>
                      <Badge bg="info">Dr. Sarah Johnson</Badge>
                    </Col>
                    <Col md={9}>
                      <h6>Seasonal Allergic Rhinitis</h6>
                      <p className="mb-0">Spring pollen allergy with nasal congestion and sneezing. Prescribed loratadine 10mg daily as needed.</p>
                    </Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Tab.Pane>
            
            <Tab.Pane eventKey="meds">
              <h5>Current Medication List</h5>
              <ListGroup>
                <ListGroup.Item>
                  <div className="d-flex">
                    <div className="me-3"><FaPills size={24} className="text-danger" /></div>
                    <div>
                      <h6>Metformin 1000mg</h6>
                      <div>Take 1 tablet twice daily with food</div>
                      <div className="text-muted">For Type 2 Diabetes</div>
                      <div className="text-muted">Prescribed by: Dr. Amelia Rodriguez (Endocrinology)</div>
                    </div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-flex">
                    <div className="me-3"><FaPills size={24} className="text-primary" /></div>
                    <div>
                      <h6>Lisinopril 20mg</h6>
                      <div>Take 1 tablet daily</div>
                      <div className="text-muted">For Hypertension</div>
                      <div className="text-muted">Prescribed by: Dr. Michael Chen (Cardiology)</div>
                    </div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-flex">
                    <div className="me-3"><FaPills size={24} className="text-warning" /></div>
                    <div>
                      <h6>Atorvastatin 20mg</h6>
                      <div>Take 1 tablet daily at bedtime</div>
                      <div className="text-muted">For Hyperlipidemia</div>
                      <div className="text-muted">Prescribed by: Dr. Sarah Johnson (Primary Care)</div>
                    </div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-flex">
                    <div className="me-3"><FaPills size={24} className="text-info" /></div>
                    <div>
                      <h6>Omeprazole 20mg</h6>
                      <div>Take 1 capsule daily before breakfast</div>
                      <div className="text-muted">For GERD</div>
                      <div className="text-muted">Prescribed by: Dr. Sarah Johnson (Primary Care)</div>
                    </div>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Tab.Pane>
            
            <Tab.Pane eventKey="procedures">
              <h5>Medical Procedures</h5>
              <ListGroup>
                <ListGroup.Item>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Colonoscopy</h6>
                    <Badge bg="secondary">June 12, 2022</Badge>
                  </div>
                  <p className="mb-1">Provider: Dr. Maria Gutierrez</p>
                  <p className="mb-1">Facility: Memorial Surgical Center</p>
                  <p>Findings: Two small polyps removed (tubular adenoma and hyperplastic polyp)</p>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Upper Endoscopy (EGD)</h6>
                    <Badge bg="secondary">September 15, 2021</Badge>
                  </div>
                  <p className="mb-1">Provider: Dr. Maria Gutierrez</p>
                  <p className="mb-1">Facility: Memorial Surgical Center</p>
                  <p>Findings: Mild gastritis, small hiatal hernia</p>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Echocardiogram</h6>
                    <Badge bg="secondary">February 28, 2025</Badge>
                  </div>
                  <p className="mb-1">Provider: Dr. Michael Chen</p>
                  <p className="mb-1">Facility: Memorial Cardiology Associates</p>
                  <p>Findings: Mild left ventricular hypertrophy, EF 55-60%</p>
                </ListGroup.Item>
              </ListGroup>
            </Tab.Pane>
            
            <Tab.Pane eventKey="family-history">
              <h5>Family Medical History</h5>
              <ListGroup>
                <ListGroup.Item>
                  <h6><FaHeartbeat className="me-2 text-danger" />Cardiovascular Disease</h6>
                  <ul>
                    <li>Father: Myocardial infarction at age 62</li>
                    <li>Paternal grandfather: Stroke at age 70</li>
                  </ul>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h6><FaNotesMedical className="me-2 text-primary" />Diabetes</h6>
                  <ul>
                    <li>Mother: Type 2 diabetes diagnosed at age 55</li>
                    <li>Maternal aunt: Type 2 diabetes</li>
                  </ul>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h6><FaNotesMedical className="me-2 text-warning" />Cancer</h6>
                  <ul>
                    <li>Maternal grandmother: Breast cancer at age 68</li>
                    <li>Paternal uncle: Colorectal cancer at age 65</li>
                  </ul>
                </ListGroup.Item>
              </ListGroup>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};

export default MedicalHistory;
