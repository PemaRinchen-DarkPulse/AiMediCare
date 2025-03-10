import React from 'react'
import { Container, Row, Col, Card, ListGroup, Tab, Nav, ProgressBar, Button } from 'react-bootstrap'
import { FaPills, FaHistory, FaUserMd, FaClipboardList } from 'react-icons/fa'

const Medications = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>Medication Management</h1>
          <p>Welcome, Pema-Rinchen. Today is 2025-03-10 07:06:45 UTC.</p>
        </Col>
      </Row>
      <Tab.Container defaultActiveKey="activeMedications">
        <Row>
          <Col>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="activeMedications"><FaPills /> Active Medications</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="historicalMedicationRecord"><FaHistory /> Historical Medication Record</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="providerMedicationReview"><FaUserMd /> Provider Medication Review</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="medicationReconciliation"><FaClipboardList /> Medication Reconciliation</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Tab.Content>
              <Tab.Pane eventKey="activeMedications">
                <Row>
                  <Col md={4} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title>Lisinopril</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">10mg</Card.Subtitle>
                        <Card.Text>
                          <strong>Frequency:</strong> Once daily<br />
                          <strong>Time:</strong> Morning
                        </Card.Text>
                        <div>
                          <strong>Adherence:</strong>
                          <ProgressBar now={92} label={`${92}%`} variant="success" />
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          <Button variant="link">VIEW DETAILS</Button>
                          <Button variant="outline-success">REFILL REQUEST</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title>Metformin</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">500mg</Card.Subtitle>
                        <Card.Text>
                          <strong>Frequency:</strong> Twice daily<br />
                          <strong>Time:</strong> Morning/Evening
                        </Card.Text>
                        <div>
                          <strong>Adherence:</strong>
                          <ProgressBar now={85} label={`${85}%`} variant="warning" />
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          <Button variant="link">VIEW DETAILS</Button>
                          <Button variant="outline-success">REFILL REQUEST</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title>Atorvastatin</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">20mg</Card.Subtitle>
                        <Card.Text>
                          <strong>Frequency:</strong> Once daily<br />
                          <strong>Time:</strong> Evening
                        </Card.Text>
                        <div>
                          <strong>Adherence:</strong>
                          <ProgressBar now={90} label={`${90}%`} variant="warning" />
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          <Button variant="link">VIEW DETAILS</Button>
                          <Button variant="outline-success">REFILL REQUEST</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>
              <Tab.Pane eventKey="historicalMedicationRecord">
                <Card className="mt-4">
                  <Card.Header>Historical Medication Record</Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Medication Name:</strong> OldMed<br />
                        <strong>Dosage:</strong> 100mg<br />
                        <strong>Start Date:</strong> 2023-01-01<br />
                        <strong>End Date:</strong> 2023-06-01<br />
                        <strong>Reason for Discontinuation:</strong> Side effects
                      </ListGroup.Item>
                      {/* ...additional historical medications... */}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="medicationSchedule">
                <Card>
                  <Card.Header>Medication Schedule</Card.Header>
                  <Card.Body>
                    <p>Daily/weekly calendar view showing when medications should be taken.</p>
                    {/* Calendar component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="reminderSystem">
                <Card>
                  <Card.Header>Reminder System</Card.Header>
                  <Card.Body>
                    <p>Customizable alert settings for each medication with various notification options.</p>
                    {/* Reminder settings component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="adherenceTracker">
                <Card>
                  <Card.Header>Adherence Tracker</Card.Header>
                  <Card.Body>
                    <p>Visual representation of medication compliance with historical patterns.</p>
                    {/* Adherence tracking component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="refillStatus">
                <Card>
                  <Card.Header>Refill Status</Card.Header>
                  <Card.Body>
                    <p>Indicators showing days remaining for each prescription with automated refill request capabilities.</p>
                    {/* Refill status component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="medicationImages">
                <Card>
                  <Card.Header>Medication Images</Card.Header>
                  <Card.Body>
                    <p>Visual identification of pills/medications to prevent errors.</p>
                    {/* Medication images component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="sideEffectReporter">
                <Card>
                  <Card.Header>Side Effect Reporter</Card.Header>
                  <Card.Body>
                    <p>Tool to document and report experienced side effects.</p>
                    {/* Side effect reporting component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="effectivenessTracker">
                <Card>
                  <Card.Header>Effectiveness Tracker</Card.Header>
                  <Card.Body>
                    <p>Patient-reported outcomes on how well medications are managing symptoms.</p>
                    {/* Effectiveness tracking component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="drugInformation">
                <Card>
                  <Card.Header>Drug Information</Card.Header>
                  <Card.Body>
                    <p>Detailed, patient-friendly information about each medication's purpose, proper use, and potential side effects.</p>
                    {/* Drug information component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="interactionChecker">
                <Card>
                  <Card.Header>Interaction Checker</Card.Header>
                  <Card.Body>
                    <p>AI-powered tool that identifies potential interactions between medications, supplements, and foods.</p>
                    {/* Interaction checker component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="costOptimization">
                <Card>
                  <Card.Header>Cost Optimization</Card.Header>
                  <Card.Body>
                    <p>Suggestions for more affordable medication options or assistance programs.</p>
                    {/* Cost optimization component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="pharmacyIntegration">
                <Card>
                  <Card.Header>Pharmacy Integration</Card.Header>
                  <Card.Body>
                    <p>Connection to preferred pharmacies with inventory and pricing information.</p>
                    {/* Pharmacy integration component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="providerMedicationReview">
                <Card>
                  <Card.Header>Provider Medication Review</Card.Header>
                  <Card.Body>
                    <p>Request feature for healthcare provider review of current medication regimen.</p>
                    {/* Provider medication review component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="caregiverAccess">
                <Card>
                  <Card.Header>Caregiver Access</Card.Header>
                  <Card.Body>
                    <p>Controlled sharing of medication information with family members or caregivers.</p>
                    {/* Caregiver access component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="medicationReconciliation">
                <Card>
                  <Card.Header>Medication Reconciliation</Card.Header>
                  <Card.Body>
                    <p>Tools to compare medication lists from different providers and resolve discrepancies.</p>
                    {/* Medication reconciliation component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
              <Tab.Pane eventKey="travelPlanning">
                <Card>
                  <Card.Header>Travel Planning</Card.Header>
                  <Card.Body>
                    <p>Tools to manage medications across time zones and ensure adequate supply during travel.</p>
                    {/* Travel planning component goes here */}
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  )
}

export default Medications