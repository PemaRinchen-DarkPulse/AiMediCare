import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, CardHeader, CardBody, 
  Nav, NavItem, NavLink, TabContent, TabPane,
  Table, Badge, Button, Alert, Spinner, Modal, ModalHeader, 
  ModalBody, ModalFooter
} from 'reactstrap';
import { 
  FaFlask, FaCalendarAlt, FaCheckCircle, FaTimesCircle, 
  FaExclamationTriangle, FaFileMedical, FaFileDownload, 
  FaInfoCircle, FaUserMd 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import classnames from 'classnames';
import { 
  getPatientDiagnosticRequests, 
  getPatientTestResults, 
  acceptDiagnosticRequest, 
  declineDiagnosticRequest 
} from '../../services/diagnosticsService';

const PatientDiagnostics = () => {
  // State variables
  const [activeTab, setActiveTab] = useState('requests');
  const [diagnosticRequests, setDiagnosticRequests] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selected item states
  const [selectedTest, setSelectedTest] = useState(null);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDiagnosticData();
  }, []);
  
  // Fetch diagnostic requests and test results
  const fetchDiagnosticData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requestsResponse, resultsResponse] = await Promise.all([
        getPatientDiagnosticRequests(),
        getPatientTestResults()
      ]);
      
      if (requestsResponse.success) {
        setDiagnosticRequests(requestsResponse.data);
      } else {
        throw new Error('Failed to fetch diagnostic requests');
      }
      
      if (resultsResponse.success) {
        setTestResults(resultsResponse.data);
      } else {
        throw new Error('Failed to fetch test results');
      }
    } catch (err) {
      console.error('Error fetching diagnostic data:', err);
      setError('Failed to load diagnostic information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle accepting a diagnostic request
  const handleAcceptRequest = async (testId) => {
    try {
      setLoading(true);
      const response = await acceptDiagnosticRequest(testId);
      
      if (response.success) {
        // Update the local state to reflect the change
        setDiagnosticRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === testId ? {...req, status: 'accepted by patient'} : req
          )
        );
        
        toast.success('Diagnostic test accepted successfully.');
      } else {
        throw new Error(response.message || 'Failed to accept diagnostic test');
      }
    } catch (err) {
      console.error('Error accepting diagnostic test:', err);
      toast.error('Failed to accept diagnostic test. Please try again.');
    } finally {
      setLoading(false);
      setIsConfirmModalOpen(false);
    }
  };
  
  // Handle declining a diagnostic request
  const handleDeclineRequest = async (testId) => {
    try {
      setLoading(true);
      const response = await declineDiagnosticRequest(testId);
      
      if (response.success) {
        // Update the local state to reflect the change
        setDiagnosticRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === testId ? {...req, status: 'declined by patient'} : req
          )
        );
        
        toast.success('Diagnostic test declined.');
      } else {
        throw new Error(response.message || 'Failed to decline diagnostic test');
      }
    } catch (err) {
      console.error('Error declining diagnostic test:', err);
      toast.error('Failed to decline diagnostic test. Please try again.');
    } finally {
      setLoading(false);
      setIsConfirmModalOpen(false);
    }
  };
  
  // Open confirmation modal for user action
  const openConfirmModal = (test, action) => {
    setSelectedTest(test);
    setActionType(action);
    setIsConfirmModalOpen(true);
  };
  
  // Open view details modal
  const openDetailsModal = (test) => {
    setSelectedTest(test);
    setIsViewDetailsModalOpen(true);
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Helper function to render status badge
  const renderStatusBadge = (status) => {
    let color;
    
    switch(status) {
      case 'pending':
        color = 'warning';
        break;
      case 'accepted by patient':
        color = 'info';
        break;
      case 'completed':
        color = 'success';
        break;
      case 'declined by patient':
        color = 'danger';
        break;
      default:
        color = 'secondary';
    }
    
    return <Badge color={color}>{status}</Badge>;
  };
  
  // Helper function to render priority badge
  const renderPriorityBadge = (priority) => {
    let color;
    
    switch(priority) {
      case 'low':
        color = 'success';
        break;
      case 'normal':
        color = 'info';
        break;
      case 'high':
        color = 'warning';
        break;
      case 'urgent':
        color = 'danger';
        break;
      default:
        color = 'info';
    }
    
    return <Badge color={color}>{priority}</Badge>;
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <FaFileMedical className="me-2" />
        My Diagnostics
      </h2>
      
      {error && (
        <Alert color="danger" className="mb-4" timeout={5000}>
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}
      
      {/* Tab Navigation */}
      <Nav tabs className="mb-4">
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === 'requests' })}
            onClick={() => setActiveTab('requests')}
          >
            <FaFileMedical className="me-2" />
            Diagnostic Requests
            {diagnosticRequests.filter(req => req.status === 'pending').length > 0 && (
              <Badge color="warning" pill className="ms-2">
                {diagnosticRequests.filter(req => req.status === 'pending').length}
              </Badge>
            )}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === 'results' })}
            onClick={() => setActiveTab('results')}
          >
            <FaFlask className="me-2" />
            Test Results
          </NavLink>
        </NavItem>
      </Nav>
      
      {/* Tab Content */}
      <TabContent activeTab={activeTab}>
        {/* Diagnostic Requests Tab */}
        <TabPane tabId="requests">
          <Card>
            <CardHeader className="bg-light">
              <h5 className="mb-0">Diagnostic Test Requests</h5>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="text-center p-5">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading diagnostic requests...</p>
                </div>
              ) : diagnosticRequests.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Test Type</th>
                        <th>Priority</th>
                        <th>Requested By</th>
                        <th>Request Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosticRequests.map(request => (
                        <tr key={request.id}>
                          <td>{request.testType}</td>
                          <td>{renderPriorityBadge(request.priority)}</td>
                          <td>
                            <FaUserMd className="me-1" />
                            {request.requestedBy}
                          </td>
                          <td>
                            <FaCalendarAlt className="me-1" />
                            {formatDate(request.requestDate)}
                          </td>
                          <td>{renderStatusBadge(request.status)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                color="info" 
                                size="sm" 
                                onClick={() => openDetailsModal(request)}
                              >
                                <FaInfoCircle />
                              </Button>
                              
                              {/* Only show accept/decline buttons for pending requests */}
                              {request.status === 'pending' && (
                                <>
                                  <Button 
                                    color="success" 
                                    size="sm"
                                    onClick={() => openConfirmModal(request, 'accept')}
                                  >
                                    <FaCheckCircle />
                                  </Button>
                                  <Button 
                                    color="danger" 
                                    size="sm"
                                    onClick={() => openConfirmModal(request, 'decline')}
                                  >
                                    <FaTimesCircle />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert color="info" timeout={5000}>
                  You don't have any diagnostic test requests at this time.
                </Alert>
              )}
            </CardBody>
          </Card>
        </TabPane>
        
        {/* Test Results Tab */}
        <TabPane tabId="results">
          <Card>
            <CardHeader className="bg-light">
              <h5 className="mb-0">My Test Results</h5>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="text-center p-5">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading test results...</p>
                </div>
              ) : testResults.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Test Type</th>
                        <th>Requested By</th>
                        <th>Result Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map(result => (
                        <tr key={result.id}>
                          <td>{result.testType}</td>
                          <td>
                            <FaUserMd className="me-1" />
                            {result.requestedBy}
                          </td>
                          <td>
                            <FaCalendarAlt className="me-1" />
                            {formatDate(result.resultDate)}
                          </td>
                          <td>{renderStatusBadge(result.status)}</td>
                          <td>
                            <Button 
                              color="info" 
                              size="sm" 
                              onClick={() => openDetailsModal(result)}
                            >
                              <FaInfoCircle />
                            </Button>
                            {result.attachmentUrl && (
                              <Button 
                                color="secondary" 
                                size="sm" 
                                className="ms-2"
                                onClick={() => window.open(result.attachmentUrl, '_blank')}
                              >
                                <FaFileDownload />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert color="info" timeout={5000}>
                  You don't have any completed test results at this time.
                </Alert>
              )}
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>
      
      {/* Detail View Modal */}
      <Modal isOpen={isViewDetailsModalOpen} toggle={() => setIsViewDetailsModalOpen(!isViewDetailsModalOpen)} size="lg">
        <ModalHeader toggle={() => setIsViewDetailsModalOpen(!isViewDetailsModalOpen)}>
          {selectedTest?.testType} Details
        </ModalHeader>
        <ModalBody>
          {selectedTest && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Test Information</h5>
                  <p><strong>Test Type:</strong> {selectedTest.testType}</p>
                  <p>
                    <strong>Priority:</strong> {' '}
                    {selectedTest.priority ? renderPriorityBadge(selectedTest.priority) : 'N/A'}
                  </p>
                  <p><strong>Status:</strong> {renderStatusBadge(selectedTest.status)}</p>
                </Col>
                <Col md={6}>
                  <h5>Request Details</h5>
                  <p><strong>Requested By:</strong> {selectedTest.requestedBy}</p>
                  <p><strong>Date:</strong> {formatDate(selectedTest.requestDate || selectedTest.resultDate)}</p>
                </Col>
              </Row>
              
              {selectedTest.notes && (
                <>
                  <h5>Clinical Notes</h5>
                  <Card className="mb-4">
                    <CardBody>
                      <p className="mb-0">{selectedTest.notes}</p>
                    </CardBody>
                  </Card>
                </>
              )}
              
              {/* Show results info if this has results */}
              {selectedTest.findings && (
                <>
                  <h5 className="mt-4">Test Results</h5>
                  <Card className="mb-3">
                    <CardHeader className="bg-light">
                      <strong>Result Date:</strong> {formatDate(selectedTest.resultDate)}
                    </CardHeader>
                    <CardBody>
                      <h6>Findings</h6>
                      <pre className="p-3 bg-light" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedTest.findings}
                      </pre>
                      
                      {selectedTest.interpretation && (
                        <>
                          <h6 className="mt-3">Interpretation</h6>
                          <p>{selectedTest.interpretation}</p>
                        </>
                      )}
                      
                      {selectedTest.attachmentUrl && (
                        <div className="mt-3">
                          <h6>Attachments</h6>
                          <Button color="info" size="sm" onClick={() => window.open(selectedTest.attachmentUrl, '_blank')}>
                            <FaFileDownload className="me-2" />
                            Download Report
                          </Button>
                        </div>
                      )}
                      
                      {selectedTest.technician && (
                        <p className="mt-3 text-muted">
                          <small>Technician: {selectedTest.technician}</small>
                        </p>
                      )}
                    </CardBody>
                  </Card>
                </>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIsViewDetailsModalOpen(false)}>
            Close
          </Button>
          {selectedTest && selectedTest.status === 'pending' && (
            <>
              <Button 
                color="success" 
                onClick={() => {
                  setIsViewDetailsModalOpen(false);
                  openConfirmModal(selectedTest, 'accept');
                }}
              >
                <FaCheckCircle className="me-1" />
                Accept
              </Button>
              <Button 
                color="danger" 
                onClick={() => {
                  setIsViewDetailsModalOpen(false);
                  openConfirmModal(selectedTest, 'decline');
                }}
              >
                <FaTimesCircle className="me-1" />
                Decline
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>
      
      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmModalOpen} toggle={() => setIsConfirmModalOpen(!isConfirmModalOpen)}>
        <ModalHeader toggle={() => setIsConfirmModalOpen(!isConfirmModalOpen)}>
          {actionType === 'accept' ? 'Accept Diagnostic Test' : 'Decline Diagnostic Test'}
        </ModalHeader>
        <ModalBody>
          {actionType === 'accept' ? (
            <p>
              Are you sure you want to accept the {selectedTest?.testType} diagnostic test 
              requested by {selectedTest?.requestedBy}?
            </p>
          ) : (
            <p>
              Are you sure you want to decline the {selectedTest?.testType} diagnostic test 
              requested by {selectedTest?.requestedBy}? This will notify your healthcare provider.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIsConfirmModalOpen(false)}>
            Cancel
          </Button>
          {actionType === 'accept' ? (
            <Button 
              color="success" 
              onClick={() => handleAcceptRequest(selectedTest?.id)}
              disabled={loading}
            >
              {loading && <Spinner size="sm" className="me-2" />}
              Confirm Accept
            </Button>
          ) : (
            <Button 
              color="danger" 
              onClick={() => handleDeclineRequest(selectedTest?.id)}
              disabled={loading}
            >
              {loading && <Spinner size="sm" className="me-2" />}
              Confirm Decline
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default PatientDiagnostics;