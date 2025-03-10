import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Nav, Tab, Card, Badge, Button, 
  Form, InputGroup, Alert, ProgressBar, Dropdown
} from 'react-bootstrap';
import { 
  FaSearch, FaFileUpload, FaFileExport, FaShareAlt, 
  FaCalendarAlt, FaFlask, FaXRay, FaHeartbeat, FaPills, 
  FaAllergies, FaSyringe, FaUserMd, FaHospital, FaDna, 
  FaTooth, FaEye, FaExclamationTriangle, FaLock, FaUserShield,
  FaBrain, FaChild, FaBaby, FaLungs
} from 'react-icons/fa';

import './HealthRecords.css';
import { ImagingStudies, Allergies, Immunizations } from './HealthRecordsSections';
import MedicalHistory from './health-records/MedicalHistory';
import LaboratoryResults from './health-records/LaboratoryResults';
import HospitalRecords from './health-records/HospitalRecords';

// Mock user data
const userData = {
  name: "Pema-Rinchen",
  dob: "1985-07-22",
  gender: "Male",
  mrn: "MRN2023047812",
  primaryProvider: "Dr. Sarah Johnson",
  lastUpdated: "2025-03-08T14:30:00Z",
  emergencyContact: "Tenzin Wangmo (Spouse) - 555-123-4567"
};

const HealthRecords = () => {
  const [activeTab, setActiveTab] = useState('medical-history');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApplied, setFilterApplied] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const currentDateTime = new Date('2025-03-10T05:08:44Z');
  
  // AI feature state
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(true);
  
  // Privacy settings
  const [privacyLevel, setPrivacyLevel] = useState('standard');
  
  // Record access log
  const accessLog = [
    { user: "Dr. Sarah Johnson (Primary Care)", date: "2025-03-05T09:22:15Z", sections: ["Medical History", "Medications"] },
    { user: "Dr. Michael Chen (Cardiologist)", date: "2025-02-28T14:45:10Z", sections: ["Vital Signs", "Lab Results"] },
    { user: "System AI Analysis", date: "2025-03-10T01:00:05Z", sections: ["All Records"] },
  ];

  useEffect(() => {
    // Simulate AI processing health records
    setAiSummaryLoading(true);
    setTimeout(() => {
      setAiSummaryLoading(false);
    }, 1500);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Would implement actual search functionality here
    setFilterApplied(Boolean(searchTerm));
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ from: '', to: '' });
    setFilterApplied(false);
  };
  
  // Helper for rendering emergency information
  const EmergencyInformation = () => (
    <Alert variant="danger" className="mt-3">
      <div className="d-flex align-items-start">
        <FaExclamationTriangle size={24} className="me-3 mt-1" />
        <div>
          <h5 className="alert-heading">Emergency Information</h5>
          <p className="mb-0">In case of emergency, please be aware of the following critical health information:</p>
          <ul className="mb-0 mt-2">
            <li><strong>Blood Type:</strong> A Positive</li>
            <li><strong>Severe Allergies:</strong> Penicillin (Anaphylaxis)</li>
            <li><strong>Current Medications:</strong> Lisinopril, Metformin</li>
            <li><strong>Medical Conditions:</strong> Type 2 Diabetes, Hypertension</li>
            <li><strong>Emergency Contact:</strong> {userData.emergencyContact}</li>
          </ul>
        </div>
      </div>
    </Alert>
  );
  
  // Render record correction request tool
  const RecordCorrectionTool = () => (
    <Card className="mb-4">
      <Card.Header as="h5">Record Correction Request</Card.Header>
      <Card.Body>
        <Card.Text>
          If you believe there is an error in your medical records, you can submit a correction request.
        </Card.Text>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Record Type</Form.Label>
            <Form.Select>
              <option>Laboratory Result</option>
              <option>Medication</option>
              <option>Diagnosis</option>
              <option>Procedure</option>
              <option>Other</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description of Error</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Please describe the error and the correction needed..." />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Supporting Documentation</Form.Label>
            <Form.Control type="file" />
          </Form.Group>
          <Button variant="primary">Submit Correction Request</Button>
        </Form>
      </Card.Body>
    </Card>
  );

  // Ensure we're logging when tabs are clicked to debug
  const handleTabChange = (tabKey) => {
    console.log("Tab changed to:", tabKey);
    setActiveTab(tabKey);
  };

  return (
    <Container fluid className="health-records-container p-4">
      <Row className="mb-4">
        <Col lg={8}>
          <h2>Health Records</h2>
          <p className="text-muted">
            Complete medical records and health history for {userData.name} • 
            Last updated: {new Date(userData.lastUpdated).toLocaleDateString()}
          </p>
        </Col>
        <Col lg={4} className="d-flex justify-content-end align-items-center">
          <div className="health-records-actions">
            <Dropdown className="d-inline-block me-2">
              <Dropdown.Toggle variant="outline-primary" id="dropdown-export">
                <FaFileExport className="me-2" /> Export
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Export as PDF</Dropdown.Item>
                <Dropdown.Item>Export as CSV</Dropdown.Item>
                <Dropdown.Item>Export as FHIR</Dropdown.Item>
                <Dropdown.Item>Export as CCD</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="outline-primary" className="me-2">
              <FaFileUpload className="me-1" /> Upload Records
            </Button>
            <Button variant="outline-primary">
              <FaShareAlt className="me-1" /> Share Records
            </Button>
          </div>
        </Col>
      </Row>
      
      <EmergencyInformation />
      
      <Row className="mb-4 mt-4">
        <Col>
          <Card className="search-and-filter">
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row>
                  <Col md={6}>
                    <InputGroup className="mb-3">
                      <Form.Control
                        placeholder="Search across all health records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search health records"
                      />
                      <Button variant="primary" type="submit">
                        <FaSearch /> Search
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Use natural language: "my blood pressure readings from last year"
                    </Form.Text>
                  </Col>
                  <Col md={5}>
                    <div className="d-flex">
                      <Form.Control 
                        type="date" 
                        placeholder="From date" 
                        className="me-2"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({...dateRange, from: e.target.value})} 
                      />
                      <Form.Control 
                        type="date" 
                        placeholder="To date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({...dateRange, to: e.target.value})} 
                      />
                    </div>
                  </Col>
                  <Col md={1}>
                    <Button 
                      variant="outline-secondary" 
                      onClick={clearFilters}
                      disabled={!filterApplied && !dateRange.from && !dateRange.to}
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={3} className="records-sidebar mb-4">
          <Card>
            <Card.Header as="h5">Record Categories</Card.Header>
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column" activeKey={activeTab} onSelect={handleTabChange}>
                <Nav.Item>
                  <Nav.Link eventKey="medical-history">
                    <FaCalendarAlt className="me-2" /> Medical History
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="lab-results">
                    <FaFlask className="me-2" /> Laboratory Results
                    <Badge bg="info" pill className="ms-auto">New</Badge>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="imaging">
                    <FaXRay className="me-2" /> Imaging Studies
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="allergies">
                    <FaAllergies className="me-2" /> Allergies
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="immunizations">
                    <FaSyringe className="me-2" /> Immunizations
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="specialist-reports">
                    <FaUserMd className="me-2" /> Specialist Reports
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="hospital-records">
                    <FaHospital className="me-2" /> Hospital Records
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="genetics">
                    <FaDna className="me-2" /> Genetics
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="dental">
                    <FaTooth className="me-2" /> Dental Records
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="vision">
                    <FaEye className="me-2" /> Vision Records
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="mental-health">
                    <FaBrain className="me-2" /> Mental Health
                    <Badge bg="secondary" pill className="ms-auto">Private</Badge>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="privacy">
                    <FaLock className="me-2" /> Privacy Controls
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="access-logs">
                    <FaUserShield className="me-2" /> Access Logs
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
          
          <Card className="mt-4">
            <Card.Header as="h5">Special Views</Card.Header>
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column" activeKey={activeTab} onSelect={handleTabChange}>
                <Nav.Item>
                  <Nav.Link eventKey="chronic-disease">
                    <FaLungs className="me-2" /> Chronic Disease Management
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="pediatric-records">
                    <FaChild className="me-2" /> Pediatric Records
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="pregnancy">
                    <FaBaby className="me-2" /> Pregnancy Records
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={9}>
          <Tab.Content activeKey={activeTab} defaultActiveKey="medical-history">            
            <Tab.Pane eventKey="medical-history" className="fade-in">
              <MedicalHistory />
            </Tab.Pane>
            
            <Tab.Pane eventKey="lab-results" className="fade-in">
              <LaboratoryResults />
            </Tab.Pane>
            
            <Tab.Pane eventKey="imaging" className="fade-in">
              <ImagingStudies />
            </Tab.Pane>
            
            <Tab.Pane eventKey="allergies" className="fade-in">
              <Allergies />
            </Tab.Pane>
            
            <Tab.Pane eventKey="immunizations" className="fade-in">
              <Immunizations />
            </Tab.Pane>
            
            <Tab.Pane eventKey="specialist-reports" className="fade-in">
              <Card>
                <Card.Header as="h4">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Specialist Reports</span>
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
                  <p>View consultation notes and reports from specialists.</p>
                  
                  {/* Cardiology Report */}
                  <Card className="mb-3 report-card">
                    <Card.Header>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Cardiology Consultation</h5>
                        <Badge bg="primary">Cardiology</Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <p><strong>Specialist:</strong> Dr. Michael Chen</p>
                          <p><strong>Date:</strong> February 28, 2025</p>
                          <p><strong>Facility:</strong> Memorial Cardiology Associates</p>
                          <p><strong>Reason for Visit:</strong> Hypertension Management</p>
                        </Col>
                        <Col md={6}>
                          <p><strong>Status:</strong> <Badge bg="success">Completed</Badge></p>
                          <p><strong>Follow-up Required:</strong> Yes, in 6 months</p>
                          <p><strong>Follow-up Date:</strong> August 30, 2025</p>
                        </Col>
                      </Row>
                      <hr />
                      <h6>Summary</h6>
                      <p>
                        Patient presented for routine follow-up of hypertension. Blood pressure well-controlled on current medication regimen (Lisinopril 20mg daily). ECG showed normal sinus rhythm. Echocardiogram showed mild left ventricular hypertrophy consistent with longstanding hypertension, but overall preserved cardiac function with ejection fraction of 55-60%.
                      </p>
                      <h6>Recommendations</h6>
                      <ul>
                        <li>Continue current medication regimen</li>
                        <li>Maintain low-sodium diet</li>
                        <li>Regular aerobic exercise, 30 minutes, 5 times per week</li>
                        <li>Follow-up in 6 months with repeat echocardiogram</li>
                      </ul>
                      <div className="mt-3">
                        <Button variant="primary" size="sm">View Full Report</Button>
                        <Button variant="link" size="sm">Download Report</Button>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  {/* Endocrinology Report */}
                  <Card className="mb-3 report-card">
                    <Card.Header>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Endocrinology Consultation</h5>
                        <Badge bg="info">Endocrinology</Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <p><strong>Specialist:</strong> Dr. Amelia Rodriguez</p>
                          <p><strong>Date:</strong> January 15, 2025</p>
                          <p><strong>Facility:</strong> Diabetes & Endocrine Center</p>
                          <p><strong>Reason for Visit:</strong> Type 2 Diabetes Management</p>
                        </Col>
                        <Col md={6}>
                          <p><strong>Status:</strong> <Badge bg="success">Completed</Badge></p>
                          <p><strong>Follow-up Required:</strong> Yes, in 3 months</p>
                          <p><strong>Follow-up Date:</strong> April 15, 2025</p>
                        </Col>
                      </Row>
                      <hr />
                      <h6>Summary</h6>
                      <p>
                        Patient has well-controlled Type 2 Diabetes on Metformin 1000mg twice daily. HbA1c improved from 7.2% to 6.8%. Fasting blood glucose readings average 120-140 mg/dL. No signs of peripheral neuropathy. Annual comprehensive foot exam performed with normal results.
                      </p>
                      <h6>Recommendations</h6>
                      <ul>
                        <li>Continue Metformin 1000mg twice daily</li>
                        <li>Maintain carbohydrate-restricted diet</li>
                        <li>Regular blood glucose monitoring</li>
                        <li>Schedule annual diabetic eye exam</li>
                        <li>Consider CGM (Continuous Glucose Monitoring) system discussion at next visit</li>
                      </ul>
                      <div className="mt-3">
                        <Button variant="primary" size="sm">View Full Report</Button>
                        <Button variant="link" size="sm">Download Report</Button>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  {/* Ophthalmology Report */}
                  <Card className="mb-3 report-card">
                    <Card.Header>
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Ophthalmology Consultation</h5>
                        <Badge bg="warning" text="dark">Ophthalmology</Badge>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <p><strong>Specialist:</strong> Dr. James Wilson</p>
                          <p><strong>Date:</strong> December 5, 2024</p>
                          <p><strong>Facility:</strong> Clear Vision Eye Center</p>
                          <p><strong>Reason for Visit:</strong> Annual Diabetic Eye Exam</p>
                        </Col>
                        <Col md={6}>
                          <p><strong>Status:</strong> <Badge bg="success">Completed</Badge></p>
                          <p><strong>Follow-up Required:</strong> Yes, annually</p>
                          <p><strong>Follow-up Date:</strong> December 5, 2025</p>
                        </Col>
                      </Row>
                      <hr />
                      <h6>Summary</h6>
                      <p>
                        Comprehensive diabetic retinal exam performed. Visual acuity 20/25 OD, 20/30 OS. Intraocular pressure within normal limits. No evidence of diabetic retinopathy or macular edema. Mild nuclear sclerotic cataracts noted bilaterally, not visually significant at this time.
                      </p>
                      <h6>Recommendations</h6>
                      <ul>
                        <li>Continue good glycemic control</li>
                        <li>Use artificial tears as needed for mild dry eye symptoms</li>
                        <li>Update prescription glasses (provided separately)</li>
                        <li>Return in one year for follow-up diabetic eye exam</li>
                      </ul>
                      <div className="mt-3">
                        <Button variant="primary" size="sm">View Full Report</Button>
                        <Button variant="link" size="sm">Download Retinal Images</Button>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Upcoming Referrals Section */}
                  <h5 className="mt-4">Upcoming Specialist Referrals</h5>
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Specialty</th>
                        <th>Reason</th>
                        <th>Referring Provider</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Nephrology</td>
                        <td>Diabetes kidney function monitoring</td>
                        <td>Dr. Sarah Johnson</td>
                        <td><Badge bg="warning" text="dark">Pending Appointment</Badge></td>
                        <td><Button variant="outline-primary" size="sm">Schedule</Button></td>
                      </tr>
                      <tr>
                        <td>Dermatology</td>
                        <td>Annual skin cancer screening</td>
                        <td>Dr. Sarah Johnson</td>
                        <td><Badge bg="secondary">Referred</Badge></td>
                        <td><Button variant="outline-primary" size="sm">View Details</Button></td>
                      </tr>
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            <Tab.Pane eventKey="hospital-records" className="fade-in">
              <HospitalRecords />
            </Tab.Pane>
            
            <Tab.Pane eventKey="genetics" className="fade-in">
              <Card>
                <Card.Header as="h4">Genetics</Card.Header>
                <Card.Body>
                  <p>Your genetic testing and hereditary risk assessment information will be displayed here.</p>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            <Tab.Pane eventKey="dental" className="fade-in">
              <Card>
                <Card.Header as="h4">Dental Records</Card.Header>
                <Card.Body>
                  <p>Your dental history and treatment records will be displayed here.</p>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            <Tab.Pane eventKey="vision" className="fade-in">
              <Card>
                <Card.Header as="h4">Vision Records</Card.Header>
                <Card.Body>
                  <p>Your vision examination history and prescriptions will be displayed here.</p>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            <Tab.Pane eventKey="mental-health" className="fade-in">
              <Card>
                <Card.Header as="h4">Mental Health Records</Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <strong>Enhanced Privacy Protection:</strong> Your mental health records have additional privacy safeguards.
                  </Alert>
                  <p>Your mental health treatment history and notes will be displayed here.</p>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            <Tab.Pane eventKey="privacy" className="fade-in">
              <Card>
                <Card.Header as="h4">Privacy Controls</Card.Header>
                <Card.Body>
                  <h5>Data Sharing Preferences</h5>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Privacy Level</Form.Label>
                      <Form.Select 
                        value={privacyLevel} 
                        onChange={(e) => setPrivacyLevel(e.target.value)}
                      >
                        <option value="standard">Standard (Share with my care team)</option>
                        <option value="restricted">Restricted (Only my primary doctor)</option>
                        <option value="open">Open (All authorized providers)</option>
                        <option value="research">Research Participation (Anonymous data sharing)</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <h5>Category-Specific Restrictions</h5>
                    <div className="privacy-section mb-4">
                      {['Mental Health Records', 'Genetic Information', 'Sexual Health', 'Substance Use History'].map(category => (
                        <Form.Check 
                          key={category}
                          type="switch"
                          id={`privacy-${category.replace(/\s+/g, '-').toLowerCase()}`}
                          label={`Share ${category}`}
                          defaultChecked={category !== 'Genetic Information' && category !== 'Substance Use History'}
                        />
                      ))}
                    </div>
                    
                    <Button variant="primary" type="submit">Save Privacy Settings</Button>
                  </Form>
                </Card.Body>
              </Card>
              
              <RecordCorrectionTool />
            </Tab.Pane>
            
            <Tab.Pane eventKey="access-logs" className="fade-in">
              <Card>
                <Card.Header as="h4">Access Logs</Card.Header>
                <Card.Body>
                  <p>This section shows who has accessed your medical records.</p>
                  
                  <table className="table">
                    <thead>
                      <tr>
                        <th>User/System</th>
                        <th>Date & Time</th>
                        <th>Records Accessed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessLog.map((log, index) => (
                        <tr key={index}>
                          <td>{log.user}</td>
                          <td>{new Date(log.date).toLocaleString()}</td>
                          <td>{log.sections.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            <Tab.Pane eventKey="chronic-disease" className="fade-in">
              <Card>
                <Card.Header as="h4">Chronic Disease Management</Card.Header>
                <Card.Body>
                  <p>Your chronic condition tracking and management plans will be displayed here.</p>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            <Tab.Pane eventKey="pediatric-records" className="fade-in">
              <Card>
                <Card.Header as="h4">Pediatric Records</Card.Header>
                <Card.Body>
                  <p>Growth charts, developmental milestones, and pediatric history will be displayed here.</p>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            <Tab.Pane eventKey="pregnancy" className="fade-in">
              <Card>
                <Card.Header as="h4">Pregnancy Records</Card.Header>
                <Card.Body>
                  <p>Pregnancy-related medical information will be displayed here.</p>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Container>
  );
};

export default HealthRecords;