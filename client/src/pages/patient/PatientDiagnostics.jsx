import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, CardHeader, CardBody, 
  Nav, NavItem, NavLink, TabContent, TabPane,
  Table, Badge, Button, Alert, Spinner, Modal, ModalHeader, 
  ModalBody, ModalFooter, Progress
} from 'reactstrap';
import { 
  FaFlask, FaCalendarAlt, FaCheckCircle, FaTimesCircle, 
  FaExclamationTriangle, FaFileMedical, FaFileDownload, 
  FaInfoCircle, FaUserMd, FaBrain, FaRobot, FaSync 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import classnames from 'classnames';
import { 
  getPatientDiagnosticRequests, 
  getPatientTestResults, 
  acceptDiagnosticRequest, 
  declineDiagnosticRequest 
} from '../../services/diagnosticsService';
import {
  getDiagnosticInsights,
  triggerNewAnalysis,
  pollAnalysisCompletion,
  formatInsightsForDisplay,
  getRiskLevelColor,
  getSeverityColor,
  formatProcessingTime,
  formatFileSize
} from '../../services/diagnosticsAIService';

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
  
  // AI Insights states
  const [aiInsights, setAiInsights] = useState(null);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsightsError, setAiInsightsError] = useState(null);
  const [showAiInsights, setShowAiInsights] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDiagnosticData();
  }, []);
  
  // Fetch diagnostic requests and test results
  const fetchDiagnosticData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch requests and results separately for better error tracking
      let requestsData = [];
      let resultsData = [];
      let requestsError = null;
      let resultsError = null;
      
      try {
        const requestsResponse = await getPatientDiagnosticRequests();
        if (requestsResponse && requestsResponse.success && requestsResponse.data) {
          requestsData = requestsResponse.data;
          setDiagnosticRequests(requestsData);
        } else {
          requestsError = requestsResponse?.message || 'Failed to fetch diagnostic requests';
          console.warn('Failed to fetch diagnostic requests:', requestsResponse);
          setDiagnosticRequests([]);
        }
      } catch (err) {
        requestsError = err.message || 'Network error while fetching diagnostic requests';
        console.error('Error fetching diagnostic requests:', err);
        setDiagnosticRequests([]);
      }
      
      try {
        const resultsResponse = await getPatientTestResults();
        if (resultsResponse && resultsResponse.success && resultsResponse.data) {
          resultsData = resultsResponse.data;
          setTestResults(resultsData);
        } else {
          resultsError = resultsResponse?.message || 'Failed to fetch test results';
          console.warn('Failed to fetch test results:', resultsResponse);
          setTestResults([]);
        }
      } catch (err) {
        resultsError = err.message || 'Network error while fetching test results';
        console.error('Error fetching test results:', err);
        setTestResults([]);
      }
      
      // Set error message if both requests failed
      if (requestsError && resultsError) {
        setError(`Failed to load diagnostic data: ${requestsError}. Also failed to load test results: ${resultsError}`);
      } else if (requestsError) {
        setError(`Warning: Could not load diagnostic requests (${requestsError}), but test results loaded successfully.`);
      } else if (resultsError) {
        setError(`Warning: Could not load test results (${resultsError}), but diagnostic requests loaded successfully.`);
      }
      
    } catch (err) {
      console.error('Unexpected error in fetchDiagnosticData:', err);
      setError('An unexpected error occurred while loading diagnostic information. Please try again later.');
      setDiagnosticRequests([]);
      setTestResults([]);
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
    
    // Reset AI insights state
    setAiInsights(null);
    setAiInsightsError(null);
    setShowAiInsights(false);
    
    // Load AI insights if test has results and attachments
    if (test.findings && test.attachmentUrl) {
      loadAiInsights(test.id);
    }
  };
  
  // Load AI insights for a test result
  const loadAiInsights = async (testResultId) => {
    try {
      setAiInsightsLoading(true);
      setAiInsightsError(null);
      
      const response = await getDiagnosticInsights(testResultId);
      
      if (response.success) {
        const formattedInsights = formatInsightsForDisplay(response.data);
        setAiInsights(formattedInsights);
        setShowAiInsights(true);
        
        if (!response.cached) {
          // New analysis was initiated, start polling
          try {
            const completedInsights = await pollAnalysisCompletion(testResultId);
            if (completedInsights.success) {
              const updatedInsights = formatInsightsForDisplay(completedInsights.data);
              setAiInsights(updatedInsights);
              toast.success('AI analysis completed!');
            }
          } catch (error) {
            console.warn('Analysis polling failed:', error);
            setAiInsightsError('Analysis is taking longer than expected. Please refresh to check for updates.');
          }
        }
      } else {
        setAiInsightsError(response.error || 'Failed to load AI insights');
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
      setAiInsightsError('An error occurred while loading AI insights');
    } finally {
      setAiInsightsLoading(false);
    }
  };
  
  // Trigger new AI analysis
  const triggerNewAiAnalysis = async () => {
    if (!selectedTest) return;
    
    try {
      setAiInsightsLoading(true);
      setAiInsightsError(null);
      
      const response = await triggerNewAnalysis(selectedTest.id, {
        attachmentUrl: selectedTest.attachmentUrl,
        testType: selectedTest.testType,
        findings: selectedTest.findings
      });
      
      if (response.success) {
        toast.info('New AI analysis started...');
        
        // Poll for completion
        try {
          const completedInsights = await pollAnalysisCompletion(selectedTest.id);
          if (completedInsights.success) {
            const formattedInsights = formatInsightsForDisplay(completedInsights.data);
            setAiInsights(formattedInsights);
            setShowAiInsights(true);
            toast.success('AI analysis completed!');
          }
        } catch (error) {
          setAiInsightsError('Analysis is taking longer than expected. Please refresh to check for updates.');
        }
      } else {
        setAiInsightsError(response.error || 'Failed to trigger new analysis');
      }
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
      setAiInsightsError('An error occurred while starting AI analysis');
    } finally {
      setAiInsightsLoading(false);
    }
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
                          
                          {/* File Attachment Section - Always shown */}
                          <div className="mt-3">
                            <h6>Attachments</h6>
                            {selectedTest.attachmentUrl ? (
                              <div className="d-flex flex-column">
                                <Button color="info" size="sm" onClick={() => window.open(selectedTest.attachmentUrl, '_blank')} className="mb-2 align-self-start">
                                  <FaFileDownload className="me-2" />
                                  Download Report
                                </Button>
                                <small className="text-muted">File uploaded: {selectedTest.attachmentName || "diagnostic-report.pdf"}</small>
                              </div>
                            ) : (
                              <p className="text-muted">No attachments uploaded for this test result.</p>
                            )}
                          </div>
                        </>
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
              
              {/* AI Insights Section */}
              {selectedTest.findings && selectedTest.attachmentUrl && (
                <>
                  <h5 className="mt-4">
                    <FaBrain className="me-2 text-primary" />
                    AI Insights
                    <Button
                      color="outline-primary"
                      size="sm"
                      className="ms-3"
                      onClick={triggerNewAiAnalysis}
                      disabled={aiInsightsLoading}
                    >
                      <FaSync className={aiInsightsLoading ? 'fa-spin' : ''} />
                      {aiInsightsLoading ? ' Analyzing...' : ' Refresh Analysis'}
                    </Button>
                  </h5>
                  
                  {aiInsightsLoading && !aiInsights && (
                    <Card className="mb-3">
                      <CardBody className="text-center">
                        <Spinner color="primary" />
                        <p className="mt-2 mb-0">Analyzing diagnostic report with AI...</p>
                        <small className="text-muted">This may take a few moments</small>
                      </CardBody>
                    </Card>
                  )}
                  
                  {aiInsightsError && (
                    <Alert color="warning" className="mb-3">
                      <FaExclamationTriangle className="me-2" />
                      {aiInsightsError}
                    </Alert>
                  )}
                  
                  {aiInsights && showAiInsights && (
                    <Card className="mb-3">
                      <CardHeader className="bg-light d-flex justify-content-between align-items-center">
                        <span>
                          <FaRobot className="me-2" />
                          AI Analysis Report
                        </span>
                        <div className="d-flex align-items-center">
                          <Badge color={getRiskLevelColor(aiInsights.riskAssessment.level)} className="me-2">
                            Risk: {aiInsights.riskAssessment.level.toUpperCase()}
                          </Badge>
                          <small className="text-muted">
                            Confidence: {Math.round(aiInsights.confidence * 100)}%
                          </small>
                        </div>
                      </CardHeader>
                      <CardBody>
                        {/* AI Summary */}
                        {aiInsights.summary && (
                          <div className="mb-4">
                            <h6>Summary</h6>
                            <p className="text-muted">{aiInsights.summary}</p>
                          </div>
                        )}
                        
                        {/* Risk Assessment */}
                        {aiInsights.riskAssessment.description && (
                          <div className="mb-4">
                            <h6>Risk Assessment</h6>
                            <Alert color={getRiskLevelColor(aiInsights.riskAssessment.level)} className="mb-0">
                              {aiInsights.riskAssessment.description}
                            </Alert>
                          </div>
                        )}
                        
                        {/* Abnormal Findings */}
                        {aiInsights.abnormalFindings && aiInsights.abnormalFindings.length > 0 && (
                          <div className="mb-4">
                            <h6>Abnormal Findings</h6>
                            {aiInsights.abnormalFindings.map((finding, index) => (
                              <Alert 
                                key={index} 
                                color={getSeverityColor(finding.severity)}
                                className="mb-2"
                              >
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <strong>{finding.parameter}: {finding.value}</strong>
                                    <Badge color={getSeverityColor(finding.severity)} className="ms-2">
                                      {finding.severity}
                                    </Badge>
                                  </div>
                                </div>
                                {finding.description && (
                                  <p className="mb-1 mt-2">{finding.description}</p>
                                )}
                                {finding.recommendation && (
                                  <small className="text-muted">
                                    <strong>Recommendation:</strong> {finding.recommendation}
                                  </small>
                                )}
                              </Alert>
                            ))}
                          </div>
                        )}
                        
                        {/* Test Values Table */}
                        {aiInsights.testValues && aiInsights.testValues.length > 0 && (
                          <div className="mb-4">
                            <h6>Extracted Test Values</h6>
                            <div className="table-responsive">
                              <Table size="sm" striped>
                                <thead>
                                  <tr>
                                    <th>Parameter</th>
                                    <th>Value</th>
                                    <th>Reference Range</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {aiInsights.testValues.map((testValue, index) => (
                                    <tr key={index} className={testValue.isAbnormal ? 'table-warning' : ''}>
                                      <td>{testValue.parameter}</td>
                                      <td>
                                        {testValue.value} {testValue.unit}
                                      </td>
                                      <td>{testValue.referenceRange}</td>
                                      <td>
                                        <Badge color={testValue.isAbnormal ? 'warning' : 'success'}>
                                          {testValue.isAbnormal ? 'Abnormal' : 'Normal'}
                                        </Badge>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        )}
                        
                        {/* Processing Info */}
                        <div className="mt-3 pt-3 border-top">
                          <Row>
                            <Col md={6}>
                              <small className="text-muted">
                                <strong>Processing Time:</strong> {formatProcessingTime(aiInsights.processingTime)}
                              </small>
                            </Col>
                            <Col md={6}>
                              <small className="text-muted">
                                <strong>File:</strong> {aiInsights.fileInfo.name} ({formatFileSize(aiInsights.fileInfo.size)})
                              </small>
                            </Col>
                          </Row>
                        </div>
                      </CardBody>
                    </Card>
                  )}
                  
                  {!aiInsights && !aiInsightsLoading && !aiInsightsError && (
                    <Card className="mb-3">
                      <CardBody className="text-center text-muted">
                        <FaBrain size={24} className="mb-2" />
                        <p className="mb-0">AI analysis not yet performed</p>
                        <Button
                          color="primary"
                          size="sm"
                          className="mt-2"
                          onClick={triggerNewAiAnalysis}
                        >
                          Start AI Analysis
                        </Button>
                      </CardBody>
                    </Card>
                  )}
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