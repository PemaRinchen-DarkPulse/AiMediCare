import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, ListGroup, Tab, Nav, ProgressBar, Button, Spinner, Alert } from 'react-bootstrap'
import { FaPills, FaHistory, FaUserMd, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa'
import axios from 'axios'

const Medications = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medications, setMedications] = useState([]);
  const [providerReviews, setProviderReviews] = useState([]);
  const [reconciliationData, setReconciliationData] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Helper to get auth header with JWT token
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current medications
        const medsResponse = await axios.get(`${BASE_URL}/api/prescriptions/patient`, {
          headers: getAuthHeader()
        });
        
        // Fetch medication reviews by providers
        const reviewsResponse = await axios.get(`${BASE_URL}/api/prescriptions/reviews`, {
          headers: getAuthHeader()
        });
        
        // Fetch medication reconciliation data
        const reconciliationResponse = await axios.get(`${BASE_URL}/api/prescriptions/reconciliation`, {
          headers: getAuthHeader()
        });
        
        setMedications(medsResponse.data.data || []);
        setProviderReviews(reviewsResponse.data.data || []);
        setReconciliationData(reconciliationResponse.data.data || null);
        
      } catch (err) {
        console.error("Error fetching medication data:", err);
        setError("Failed to load medication data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status color for reconciliation
  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved': return 'success';
      case 'pending': return 'warning';
      case 'conflict': return 'danger';
      default: return 'primary';
    }
  };

  // Get current date and time
  const getCurrentDateTime = () => {
    return new Date().toLocaleString();
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Medication Management</h1>
          <p>Welcome, Pema-Rinchen. Today is {getCurrentDateTime()}.</p>
        </Col>
      </Row>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your medications...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      ) : (
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
                    {medications.length > 0 ? (
                      medications.filter(med => med.status === 'active').map((medication, index) => (
                        <Col md={4} className="mb-4" key={medication._id || index}>
                          <Card className="h-100">
                            <Card.Body>
                              <Card.Title>{medication.medications[0]?.name || 'Unnamed Medication'}</Card.Title>
                              <Card.Subtitle className="mb-2 text-muted">{medication.medications[0]?.dosage || 'No dosage specified'}</Card.Subtitle>
                              <Card.Text>
                                <strong>Frequency:</strong> {medication.medications[0]?.frequency || 'Not specified'}<br />
                                <strong>Time:</strong> {medication.medications[0]?.instructions?.includes('morning') ? 'Morning' : 
                                                    medication.medications[0]?.instructions?.includes('evening') ? 'Evening' : 'As directed'}
                              </Card.Text>
                              <div>
                                <strong>Adherence:</strong>
                                <ProgressBar now={medication.adherenceRate || 85} label={`${medication.adherenceRate || 85}%`} 
                                             variant={medication.adherenceRate >= 90 ? "success" : "warning"} />
                              </div>
                              <div className="d-flex justify-content-between mt-2">
                                <Button variant="link">VIEW DETAILS</Button>
                                <Button variant="outline-success">REFILL REQUEST</Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))
                    ) : (
                      <Col>
                        <Alert variant="info">You don't have any active medications at this time.</Alert>
                      </Col>
                    )}
                  </Row>
                </Tab.Pane>
                <Tab.Pane eventKey="historicalMedicationRecord">
                  <Card className="mt-4">
                    <Card.Header>Historical Medication Record</Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        {medications.filter(med => med.status === 'completed' || med.status === 'cancelled').map((medication, index) => (
                          <ListGroup.Item key={medication._id || index}>
                            <strong>Medication Name:</strong> {medication.medications[0]?.name || 'Unnamed Medication'}<br />
                            <strong>Dosage:</strong> {medication.medications[0]?.dosage || 'No dosage specified'}<br />
                            <strong>Start Date:</strong> {formatDate(medication.issuedDate)}<br />
                            <strong>End Date:</strong> {formatDate(medication.endDate)}<br />
                            <strong>Reason for Discontinuation:</strong> {medication.discontinuationReason || 'Not specified'}
                          </ListGroup.Item>
                        ))}
                        {medications.filter(med => med.status === 'completed' || med.status === 'cancelled').length === 0 && (
                          <Alert variant="info">No historical medication records found.</Alert>
                        )}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                <Tab.Pane eventKey="providerMedicationReview">
                  <Card>
                    <Card.Header>Provider Medication Review</Card.Header>
                    <Card.Body>
                      {providerReviews.length > 0 ? (
                        <>
                          <h5 className="mb-4">Recent Medication Reviews by Healthcare Providers</h5>
                          {providerReviews.map((review, index) => (
                            <Card className="mb-3 shadow-sm" key={review._id || index}>
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div>
                                    <h6 className="mb-1">Review by Dr. {review.doctorName || 'Unknown'}</h6>
                                    <p className="text-muted small mb-0">
                                      Review Date: {formatDate(review.reviewDate)}
                                    </p>
                                  </div>
                                  <Badge bg={review.urgent ? 'danger' : 'info'} pill>
                                    {review.urgent ? 'Urgent' : 'Standard'}
                                  </Badge>
                                </div>
                                
                                <h6 className="mt-3 mb-2">Medications Reviewed:</h6>
                                <ListGroup variant="flush" className="mb-3">
                                  {review.medications.map((med, i) => (
                                    <ListGroup.Item key={i} className="px-0 py-2 border-bottom">
                                      <div className="d-flex justify-content-between">
                                        <div>
                                          <strong>{med.name}</strong> - {med.dosage}
                                        </div>
                                        <Badge bg={med.status === 'continue' ? 'success' : 
                                                  med.status === 'adjust' ? 'warning' : 
                                                  med.status === 'discontinue' ? 'danger' : 'secondary'}>
                                          {med.status === 'continue' ? 'Continue' : 
                                           med.status === 'adjust' ? 'Adjust' : 
                                           med.status === 'discontinue' ? 'Discontinue' : 'Unknown'}
                                        </Badge>
                                      </div>
                                      {med.notes && (
                                        <p className="mb-0 mt-1 font-italic small text-muted">
                                          "{med.notes}"
                                        </p>
                                      )}
                                    </ListGroup.Item>
                                  ))}
                                </ListGroup>
                                
                                <div className="border-top pt-3">
                                  <h6>Overall Assessment:</h6>
                                  <p className="mb-1">{review.assessment || 'No assessment provided'}</p>
                                  
                                  {review.followUpDate && (
                                    <p className="mb-0 small text-muted">
                                      Follow-up recommended by: {formatDate(review.followUpDate)}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="text-end mt-3">
                                  <Button variant="outline-primary" size="sm">
                                    Schedule Follow-up
                                  </Button>
                                  <Button variant="link" size="sm" className="ms-2">
                                    Message Dr. {review.doctorName || 'Unknown'}
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                          
                          <div className="text-center mt-4">
                            <Button variant="primary">
                              Request New Medication Review
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p>No medication reviews found. Regular medication reviews by your healthcare provider help ensure your treatment is optimized.</p>
                          <Button variant="primary">
                            Request Medication Review
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                <Tab.Pane eventKey="medicationReconciliation">
                  <Card>
                    <Card.Header>Medication Reconciliation</Card.Header>
                    <Card.Body>
                      {reconciliationData ? (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0">Medication List Comparison</h5>
                            <Badge bg={reconciliationData.status === 'resolved' ? 'success' : 
                                     reconciliationData.status === 'pending' ? 'warning' : 'danger'} pill>
                              {reconciliationData.status === 'resolved' ? 'Resolved' : 
                               reconciliationData.status === 'pending' ? 'Pending' : 'Conflicts'}
                            </Badge>
                          </div>
                          
                          <p className="mb-4">
                            Last reconciliation performed on {formatDate(reconciliationData.lastReconciliationDate)} 
                            by Dr. {reconciliationData.performedBy || 'Unknown'}
                          </p>
                          
                          <h6 className="mb-3">Medication Sources:</h6>
                          <Row className="mb-4">
                            {reconciliationData.sources.map((source, index) => (
                              <Col md={6} key={index} className="mb-3">
                                <Card className="h-100 bg-light">
                                  <Card.Body>
                                    <Card.Title className="h6">{source.name}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                      Last Updated: {formatDate(source.lastUpdated)}
                                    </Card.Subtitle>
                                    <Badge bg="info" className="mb-3">
                                      {source.medicationCount} Medications
                                    </Badge>
                                    <Card.Text className="small">
                                      {source.description}
                                    </Card.Text>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                          
                          <h6 className="mb-3">Discrepancies Identified:</h6>
                          {reconciliationData.discrepancies.length > 0 ? (
                            <ListGroup className="mb-4">
                              {reconciliationData.discrepancies.map((discrepancy, index) => (
                                <ListGroup.Item key={index} className={`border-start border-3 border-${getStatusColor(discrepancy.status)}`}>
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <h6 className="mb-1">{discrepancy.medicationName}</h6>
                                      <p className="text-muted mb-2 small">
                                        {discrepancy.description}
                                      </p>
                                    </div>
                                    <Badge bg={getStatusColor(discrepancy.status)}>
                                      {discrepancy.status === 'resolved' ? 'Resolved' : 
                                       discrepancy.status === 'pending' ? 'Pending' : 'Conflict'}
                                    </Badge>
                                  </div>
                                  
                                  {discrepancy.resolution && (
                                    <div className="mt-2 pt-2 border-top">
                                      <p className="mb-0 small">
                                        <strong>Resolution:</strong> {discrepancy.resolution}
                                      </p>
                                      {discrepancy.resolvedBy && (
                                        <p className="mb-0 small text-muted">
                                          Resolved by {discrepancy.resolvedBy} on {formatDate(discrepancy.resolutionDate)}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          ) : (
                            <Alert variant="success" className="mb-4">
                              No discrepancies found between medication lists.
                            </Alert>
                          )}
                          
                          <div className="text-center">
                            <Button variant="primary">
                              Update Medication List
                            </Button>
                            <Button variant="outline-secondary" className="ms-2">
                              Print Reconciliation Report
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p>
                            Medication reconciliation helps identify and resolve discrepancies between 
                            medication lists from different healthcare providers.
                          </p>
                          <p className="mb-4">
                            No recent reconciliation found. We recommend reconciling your medication lists 
                            after hospital visits or when seeing new specialists.
                          </p>
                          <Button variant="primary">
                            Start New Reconciliation
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      )}
    </Container>
  )
}

export default Medications