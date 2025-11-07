import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, CardHeader, CardBody, Button, Form, FormGroup, Label, Input,
  Table, Badge, Nav, NavItem, NavLink, TabContent, TabPane, Modal, ModalHeader, ModalBody, 
  ModalFooter, Progress, Alert, Spinner, InputGroup, InputGroupText, Dropdown, DropdownToggle, 
  DropdownMenu, DropdownItem
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStethoscope, faFlask, faVial, faXRay, faNotesMedical, faSearch,
  faFilter, faCog, faSortAmountDown, faPlus, faUpload, faEye,
  faFileMedical, faSync, faCalendarAlt, faExclamationTriangle, faCheck
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import classnames from 'classnames';
import { createDiagnosticRequest, getDiagnosticRequests, getTestResults, uploadTestResult, updateRequestStatus } from '../../services/diagnosticsService';
import { getDiagnosticInsights, triggerNewAnalysis, pollAnalysisCompletion } from '../../services/diagnosticsAIService';
import { getPatients } from '../../services/patientManagementService';

const Diagnostics = () => {
  // State management
  const [activeTab, setActiveTab] = useState('requests');
  const [patients, setPatients] = useState([]);
  const [diagnosticRequests, setDiagnosticRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [testTypeFilter, setTestTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [patientFilter, setPatientFilter] = useState('all');

  // Selected item states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  
  // AI Insights states
  const [aiInsights, setAiInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  
  // Modal states
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isUploadResultsModalOpen, setIsUploadResultsModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  
  // Form states
  const [newRequestForm, setNewRequestForm] = useState({
    patientId: '',
    testType: '',
    priority: 'normal',
    requestDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [newResultForm, setNewResultForm] = useState({
    requestId: '',
    resultDate: new Date().toISOString().split('T')[0],
    findings: '',
    interpretation: '',
    attachmentFile: null,
    technician: '',
    notes: ''
  });
  
  // Dropdown states
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const toggleFilterDropdown = () => setFilterDropdownOpen(!filterDropdownOpen);

  // Load data on component mount
  useEffect(() => {
    fetchPatients();
    fetchDiagnosticRequests();
    fetchTestResults();
  }, []);

  // Filter diagnostic requests when filters or search term changes
  useEffect(() => {
    filterRequests();
  }, [diagnosticRequests, searchTerm, statusFilter, testTypeFilter, dateFilter, patientFilter]);

  // API calls
  const fetchPatients = async () => {
    try {
      console.log('Fetching patients for diagnostics dropdown...');
      const response = await getPatients(1, 1000); // Get all patients for dropdown
      console.log('Raw patients response:', response);
      console.log('Patients data:', response.data);
      console.log('Number of patients:', response.data?.length || 0);
      
      // Transform the patient data for dropdown use
      const formattedPatients = (response.data || []).map(patient => {
        console.log('Formatting patient:', patient);
        return {
          id: patient._id,
          name: patient.user?.name || patient.user?.email || 'Unknown Patient',
          email: patient.user?.email
        };
      });
      
      console.log('Formatted patients for dropdown:', formattedPatients);
      setPatients(formattedPatients);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
      setPatients([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchDiagnosticRequests = async () => {
    try {
      setLoading(true);
      // Call the API to get diagnostic requests using our service
      const response = await getDiagnosticRequests();
      
      if (response.success) {
        setDiagnosticRequests(response.data);
        setFilteredRequests(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch diagnostic requests');
      }
    } catch (err) {
      console.error('Error fetching diagnostic requests:', err);
      setError('Failed to load diagnostic requests. Please try again.');
      
      // Fallback to empty array if API call fails
      setDiagnosticRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      // Call the API to get test results using our service
      const response = await getTestResults();
      
      if (response.success) {
        setTestResults(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch test results');
      }
    } catch (err) {
      console.error('Error fetching test results:', err);
      setError('Failed to load test results. Please try again.');
      
      // Fallback to empty array if API call fails
      setTestResults([]);
    } finally {
      setLoading(false);
    }
  };

  // CRUD operations
  const addDiagnosticRequest = async (requestData) => {
    try {
      // Use our service to create a diagnostic request in the database
      const result = await createDiagnosticRequest(requestData);
      
      if (result.success) {
        // Add the new request to local state to update the UI
        setDiagnosticRequests(prevRequests => [result.data, ...prevRequests]);
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || 'Failed to create diagnostic request');
      }
    } catch (err) {
      console.error('Error adding diagnostic request:', err);
      return { success: false, error: err.message };
    }
  };

  // Renamed from uploadTestResult to uploadTestResult2 to avoid name collision with the imported service function
  const uploadTestResult2 = async (resultData) => {
    try {
      // Use our service to upload test results - call the imported service function
      const result = await uploadTestResult(resultData);
      
      if (result.success) {
        // Update the status of the corresponding request
        setDiagnosticRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === resultData.requestId 
              ? {...req, status: 'completed'} 
              : req
          )
        );
        
        setTestResults(prevResults => [result.data, ...prevResults]);
        return { success: true, data: result.data };
      } else {
        throw new Error(result.message || 'Failed to upload test results');
      }
    } catch (err) {
      console.error('Error uploading test result:', err);
      return { success: false, error: err.message };
    }
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      // Use our service to update the request status
      const result = await updateRequestStatus(requestId, newStatus);
      
      if (result.success) {
        // Update the local state to reflect the change
        setDiagnosticRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === requestId ? {...req, status: newStatus} : req
          )
        );
        return { success: true };
      } else {
        throw new Error(result.message || 'Failed to update request status');
      }
    } catch (err) {
      console.error('Error updating request status:', err);
      return { success: false, error: err.message };
    }
  };

  // Filter functions
  const filterRequests = () => {
    let filtered = [...diagnosticRequests];
    
    // Search term filter
    if (searchTerm) {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        (req.patientName && req.patientName.toLowerCase().includes(lowercaseSearchTerm)) ||
        (req.testType && req.testType.toLowerCase().includes(lowercaseSearchTerm)) ||
        (req.requestedBy && req.requestedBy.toLowerCase().includes(lowercaseSearchTerm))
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    // Test type filter
    if (testTypeFilter !== 'all') {
      filtered = filtered.filter(req => req.testType === testTypeFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch(dateFilter) {
        case 'today':
          filtered = filtered.filter(req => new Date(req.requestDate) >= today);
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(req => new Date(req.requestDate) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filtered = filtered.filter(req => new Date(req.requestDate) >= monthAgo);
          break;
        default:
          break;
      }
    }
    
    // Patient filter
    if (patientFilter !== 'all') {
      filtered = filtered.filter(req => req.patientId === patientFilter);
    }
    
    setFilteredRequests(filtered);
  };

  // Form handlers
  const handleNewRequestChange = (e) => {
    const { name, value } = e.target;
    setNewRequestForm({
      ...newRequestForm,
      [name]: value
    });
  };

  const handleNewResultChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'attachmentFile' && files && files[0]) {
      setNewResultForm({
        ...newResultForm,
        [name]: files[0]
      });
    } else {
      setNewResultForm({
        ...newResultForm,
        [name]: value
      });
    }
  };

  // Form submissions
  const handleNewRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Show loading state
    setLoading(true);
    
    try {
      // Find patient name based on patientId
      const patient = patients.find(p => p.id === newRequestForm.patientId);
      const patientName = patient ? patient.name : 'Unknown Patient';
      
      const result = await addDiagnosticRequest({
        ...newRequestForm,
      });
      
      if (result.success) {
        setIsNewRequestModalOpen(false);
        // Reset form
        setNewRequestForm({
          patientId: '',
          testType: '',
          priority: 'normal',
          requestDate: new Date().toISOString().split('T')[0],
          notes: ''
        });
        
        // Refresh diagnostic requests
        fetchDiagnosticRequests();
      } else {
        setError(result.error || 'Failed to add diagnostic request');
      }
    } catch (error) {
      setError('An error occurred while submitting the request. Please try again.');
      console.error('Error submitting diagnostic request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewResultSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await uploadTestResult2(newResultForm);
      
      if (result.success) {
        setIsUploadResultsModalOpen(false);
        
        // Find the corresponding request
        const request = diagnosticRequests.find(req => req.id === newResultForm.requestId);
        
        // Set the uploaded result and request as selected for AI analysis
        setSelectedResult(result.data);
        setSelectedRequest(request);
        
        // Show a loading notification
        setError(null);
        
        // Reset form
        setNewResultForm({
          requestId: '',
          resultDate: new Date().toISOString().split('T')[0],
          findings: '',
          interpretation: '',
          attachmentFile: null,
          technician: '',
          notes: ''
        });
        // Show success message
        setError(
          <Alert color="success" fade={false}>
            <FontAwesomeIcon icon={faCheck} className="me-2" />
            Test results uploaded successfully. Generating AI recommendations...
          </Alert>
        );
      } else {
        setError(
          <Alert color="danger" fade={false}>
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {result.error || 'Failed to upload test results'}
          </Alert>
        );
      }
    } catch (err) {
      setError(
        <Alert color="danger" fade={false}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {err.message || 'An error occurred while uploading test results'}
        </Alert>
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsViewDetailsModalOpen(true);
    
    // If this request has results, load them and fetch AI insights
    const results = testResults.filter(res => res.requestId === request.id);
    if (results.length > 0) {
      setSelectedResult(results[0]);
      // Fetch AI insights for this test result
      fetchAIInsights(results[0]._id || results[0].id);
    } else {
      setSelectedResult(null);
      setAiInsights(null);
    }
  };

  // AI Insights Functions
  const fetchAIInsights = async (testResultId) => {
    if (!testResultId) return;
    
    setInsightsLoading(true);
    setInsightsError(null);
    
    try {
      const response = await getDiagnosticInsights(testResultId);
      
      if (response.success) {
        if (response.data) {
          setAiInsights(response.data);
          
          // If still processing, start polling using the existing polling function
          if (response.data.processingStatus === 'processing' || response.data.processingStatus === 'pending') {
            pollAnalysisCompletion(testResultId)
              .then((finalInsights) => {
                if (finalInsights.success) {
                  setAiInsights(finalInsights.data);
                } else {
                  setInsightsError('Analysis completed but failed to retrieve results');
                }
              })
              .catch((error) => {
                console.error('Polling failed:', error);
                setInsightsError('Analysis may have failed or timed out');
              });
          }
        } else {
          // No insights exist yet, trigger generation
          await triggerInsightsGeneration(testResultId);
        }
      } else {
        // Insights don't exist, trigger generation
        await triggerInsightsGeneration(testResultId);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setInsightsError('Failed to load AI insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  const triggerInsightsGeneration = async (testResultId) => {
    try {
      setInsightsLoading(true);
      setInsightsError(null);
      
      // Get the selected result for additional data
      const attachmentUrl = selectedResult?.attachmentUrl;
      const testType = selectedRequest?.testType;
      const findings = selectedResult?.findings;
      
      const response = await triggerNewAnalysis(testResultId, {
        attachmentUrl,
        testType,
        findings
      });
      
      if (response.success) {
        setAiInsights(response.data);
        
        // Start polling if processing using the existing polling function
        if (response.data.processingStatus === 'processing' || response.data.processingStatus === 'pending') {
          // Use the existing polling function
          pollAnalysisCompletion(testResultId)
            .then((finalInsights) => {
              if (finalInsights.success) {
                setAiInsights(finalInsights.data);
              } else {
                setInsightsError('Analysis completed but failed to retrieve results');
              }
            })
            .catch((error) => {
              console.error('Polling failed:', error);
              setInsightsError('Analysis may have failed or timed out');
            });
        }
      } else {
        setInsightsError(response.message || 'Failed to generate AI insights');
      }
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
      setInsightsError('Failed to generate AI insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  // Handle modal close with cleanup
  const handleViewDetailsModalClose = () => {
    setIsViewDetailsModalOpen(false);
    setSelectedRequest(null);
    setSelectedResult(null);
    setAiInsights(null);
    setInsightsError(null);
    setInsightsLoading(false);
  };

  // Component for diagnostic request status badge
  const RequestStatusBadge = ({ status }) => {
    let color;
    switch (status) {
      case 'pending':
        color = 'secondary';
        break;
      case 'accepted by patient':
        color = 'primary';
        break;
      case 'completed':
        color = 'success';
        break;
      case 'cancelled':
        color = 'danger';
        break;
      default:
        color = 'secondary';
    }
    
    return <Badge color={color}>{status.replace('-', ' ')}</Badge>;
  };

  // Component for priority indicator
  const PriorityIndicator = ({ priority }) => {
    let color, text;
    switch (priority) {
      case 'low':
        color = 'success';
        text = 'Low';
        break;
      case 'normal':
        color = 'info';
        text = 'Normal';
        break;
      case 'high':
        color = 'warning';
        text = 'High';
        break;
      case 'urgent':
        color = 'danger';
        text = 'Urgent';
        break;
      default:
        color = 'info';
        text = priority;
    }
    
    return <Badge color={color}>{text}</Badge>;
  };

  // Main render
  return (
    <Container fluid className="diagnostics-container p-4">
      <h2 className="mb-4">
        <FontAwesomeIcon icon={faStethoscope} className="me-2" />
        Diagnostics Management
      </h2>

      {/* Navigation Tabs */}
      <Nav tabs className="mb-4">
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === 'requests' })}
            onClick={() => setActiveTab('requests')}
          >
            <FontAwesomeIcon icon={faFileMedical} className="me-2" />
            Test Requests
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === 'upcoming' })}
            onClick={() => setActiveTab('upcoming')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            Upcoming Diagnostics
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === 'results' })}
            onClick={() => setActiveTab('results')}
          >
            <FontAwesomeIcon icon={faFlask} className="me-2" />
            Test Results
          </NavLink>
        </NavItem>
      </Nav>

      {/* Tab content */}
      <TabContent activeTab={activeTab}>
        {/* Test Requests Tab - Only showing pending requests */}
        <TabPane tabId="requests">
          <Card className="mb-4">
            <CardHeader className="d-flex justify-content-between align-items-center bg-light">
              <h5 className="mb-0">Pending Diagnostic Test Requests</h5>
              <Button color="primary" onClick={() => setIsNewRequestModalOpen(true)}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                New Request
              </Button>
            </CardHeader>
            <CardBody>
              {/* Search and Filter Bar */}
              <Row className="mb-4">
                <Col md={5}>
                  <InputGroup>
                    <InputGroupText>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroupText>
                    <Input 
                      placeholder="Search by patient, test type, or doctor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={7} className="d-flex justify-content-end">
                  <Button color="secondary" onClick={() => {
                    setSearchTerm('');
                    setDateFilter('all');
                    setPatientFilter('all');
                    setTestTypeFilter('all');
                  }}>
                    <FontAwesomeIcon icon={faSync} className="me-2" />
                    Reset
                  </Button>
                </Col>
              </Row>

              {/* Requests Table - Only showing pending requests */}
              {loading ? (
                <div className="text-center p-5">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading diagnostic requests...</p>
                </div>
              ) : error ? (
                <Alert color="danger" fade={false}>{error}</Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover bordered>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Test Type</th>
                        <th>Priority</th>
                        <th>Request Date</th>
                        <th>Requested By</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosticRequests
                        .filter(request => request.status === 'pending')
                        .filter(request => 
                          searchTerm ? 
                            (request.patientName && request.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (request.testType && request.testType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (request.requestedBy && request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()))
                          : true
                        )
                        .map(request => (
                          <tr key={request.id}>
                            <td>{request.patientName}</td>
                            <td>{request.testType}</td>
                            <td>
                              <PriorityIndicator priority={request.priority} />
                            </td>
                            <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                            <td>{request.requestedBy}</td>
                            <td>
                              <RequestStatusBadge status={request.status} />
                            </td>
                            <td>
                              <Button 
                                color="info" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleViewDetails(request)}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                  {diagnosticRequests.filter(request => request.status === 'pending').length === 0 && (
                    <Alert color="info" fade={false}>
                      No pending diagnostic requests found.
                    </Alert>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </TabPane>
        
        {/* Upcoming Diagnostics Tab - Showing requests accepted by patients */}
        <TabPane tabId="upcoming">
          <Card className="mb-4">
            <CardHeader className="d-flex justify-content-between align-items-center bg-light">
              <h5 className="mb-0">Upcoming Diagnostic Tests</h5>
            </CardHeader>
            <CardBody>
              {/* Search and Filter Bar */}
              <Row className="mb-4">
                <Col md={5}>
                  <InputGroup>
                    <InputGroupText>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroupText>
                    <Input 
                      placeholder="Search by patient, test type, or doctor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={7} className="d-flex justify-content-end">
                  <Button color="secondary" onClick={() => {
                    setSearchTerm('');
                    setDateFilter('all');
                    setPatientFilter('all');
                    setTestTypeFilter('all');
                  }}>
                    <FontAwesomeIcon icon={faSync} className="me-2" />
                    Reset
                  </Button>
                </Col>
              </Row>

              {/* Upcoming Diagnostics Table - Showing requests accepted by patients */}
              {loading ? (
                <div className="text-center p-5">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading upcoming diagnostics...</p>
                </div>
              ) : error ? (
                <Alert color="danger" fade={false}>{error}</Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover bordered>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Test Type</th>
                        <th>Priority</th>
                        <th>Request Date</th>
                        <th>Requested By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosticRequests
                        .filter(request => request.status === 'accepted by patient')
                        .filter(request => 
                          searchTerm ? 
                            (request.patientName && request.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (request.testType && request.testType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (request.requestedBy && request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()))
                          : true
                        )
                        .map(request => (
                          <tr key={request.id}>
                            <td>{request.patientName}</td>
                            <td>{request.testType}</td>
                            <td>
                              <PriorityIndicator priority={request.priority} />
                            </td>
                            <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                            <td>{request.requestedBy}</td>
                            <td>
                              <Button 
                                color="info" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleViewDetails(request)}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                              <Button 
                                color="success" 
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setNewResultForm({
                                    ...newResultForm,
                                    requestId: request.id
                                  });
                                  setIsUploadResultsModalOpen(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faUpload} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                  {diagnosticRequests.filter(request => request.status === 'accepted by patient').length === 0 && (
                    <Alert color="info" fade={false}>
                      No upcoming diagnostic tests found. Tests will appear here after patients accept the requests.
                    </Alert>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </TabPane>

        {/* Test Results Tab - Showing only completed tests */}
        <TabPane tabId="results">
          <Card>
            <CardHeader className="bg-light">
              <h5 className="mb-0">Completed Diagnostic Test Results</h5>
            </CardHeader>
            <CardBody>
              {/* Search Bar */}
              <Row className="mb-4">
                <Col md={5}>
                  <InputGroup>
                    <InputGroupText>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroupText>
                    <Input 
                      placeholder="Search by patient, test type, or findings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
              
              {/* Results Table - Only showing completed tests */}
              {loading ? (
                <div className="text-center p-5">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading test results...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover bordered>
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Test Type</th>
                        <th>Result Date</th>
                        <th>Finding Summary</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults
                        .filter(result => {
                          // Find the corresponding request to check its status
                          const request = diagnosticRequests.find(req => req.id === result.requestId);
                          return request && request.status === 'completed';
                        })
                        .filter(result => {
                          // Apply search filter
                          if (!searchTerm) return true;
                          
                          const request = diagnosticRequests.find(req => req.id === result.requestId) || {};
                          return (
                            (request.patientName && request.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (request.testType && request.testType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (result.findings && result.findings.toLowerCase().includes(searchTerm.toLowerCase()))
                          );
                        })
                        .map(result => {
                          const request = diagnosticRequests.find(req => req.id === result.requestId) || {};
                          return (
                            <tr key={result.id}>
                              <td>{request.patientName || 'Unknown'}</td>
                              <td>{request.testType || 'Unknown Test'}</td>
                              <td>{new Date(result.resultDate).toLocaleDateString()}</td>
                              <td>{result.findings?.substring(0, 50)}...</td>
                              <td>
                                <Button 
                                  color="info" 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedResult(result);
                                    setSelectedRequest(request);
                                    setIsViewDetailsModalOpen(true);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                  {testResults.filter(result => {
                    const request = diagnosticRequests.find(req => req.id === result.requestId);
                    return request && request.status === 'completed';
                  }).length === 0 && (
                    <Alert color="info" fade={false}>
                      No completed test results found. Results will appear here after tests are completed.
                    </Alert>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>

      {/* New Request Modal */}
      <Modal isOpen={isNewRequestModalOpen} toggle={() => setIsNewRequestModalOpen(!isNewRequestModalOpen)}>
        <ModalHeader toggle={() => setIsNewRequestModalOpen(!isNewRequestModalOpen)}>
          New Diagnostic Test Request
        </ModalHeader>
        <Form onSubmit={handleNewRequestSubmit}>
          <ModalBody>
            <FormGroup>
              <Label for="patientId">Patient</Label>
              <Input
                type="select"
                name="patientId"
                id="patientId"
                value={newRequestForm.patientId}
                onChange={handleNewRequestChange}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="testType">Test Type</Label>
              <Input
                type="select"
                name="testType"
                id="testType"
                value={newRequestForm.testType}
                onChange={handleNewRequestChange}
                required
              >
                <option value="">Select Test Type</option>
                <option value="Blood Glucose Panel">Blood Glucose Panel</option>
                <option value="Lipid Panel">Lipid Panel</option>
                <option value="Liver Function Tests">Liver Function Tests</option>
                <option value="Complete Blood Count">Complete Blood Count</option>
                <option value="Kidney Function Tests">Kidney Function Tests</option>
                <option value="Thyroid Function Tests">Thyroid Function Tests</option>
                <option value="Chest X-Ray">Chest X-Ray</option>
                <option value="MRI">MRI</option>
                <option value="CT Scan">CT Scan</option>
                <option value="Ultrasound">Ultrasound</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="priority">Priority</Label>
              <Input
                type="select"
                name="priority"
                id="priority"
                value={newRequestForm.priority}
                onChange={handleNewRequestChange}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="low">Low</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="requestDate">Request Date</Label>
              <Input
                type="date"
                name="requestDate"
                id="requestDate"
                value={newRequestForm.requestDate}
                onChange={handleNewRequestChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="notes">Notes</Label>
              <Input
                type="textarea"
                name="notes"
                id="notes"
                placeholder="Clinical notes, reason for test, relevant patient history..."
                value={newRequestForm.notes}
                onChange={handleNewRequestChange}
                rows="3"
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setIsNewRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Submit Request
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Upload Results Modal */}
      <Modal isOpen={isUploadResultsModalOpen} toggle={() => setIsUploadResultsModalOpen(!isUploadResultsModalOpen)} size="lg">
        <ModalHeader toggle={() => setIsUploadResultsModalOpen(!isUploadResultsModalOpen)}>
          Upload Test Results
        </ModalHeader>
        <Form onSubmit={handleNewResultSubmit}>
          <ModalBody>
            {/* Warning message if the selected test is not accepted by patient */}
            {selectedRequest && selectedRequest.status !== 'accepted by patient' && (
              <Alert color="warning" className="mb-3" fade={false}>
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                Test results can only be uploaded for tests that have been accepted by the patient.
              </Alert>
            )}
            
            <FormGroup>
              <Label for="requestId">Test Request</Label>
              <Input
                type="select"
                name="requestId"
                id="requestId"
                value={newResultForm.requestId}
                onChange={handleNewResultChange}
                disabled={selectedRequest !== null}
                required
              >
                <option value="">Select Test Request</option>
                {diagnosticRequests
                  .filter(req => req.status === 'accepted by patient')
                  .map(request => (
                    <option key={request.id} value={request.id}>
                      {request.patientName} - {request.testType}
                    </option>
                  ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="resultDate">Result Date</Label>
              <Input
                type="date"
                name="resultDate"
                id="resultDate"
                value={newResultForm.resultDate}
                onChange={handleNewResultChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="findings">Findings</Label>
              <Input
                type="textarea"
                name="findings"
                id="findings"
                placeholder="Test results and findings"
                value={newResultForm.findings}
                onChange={handleNewResultChange}
                rows="3"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label for="interpretation">Interpretation</Label>
              <Input
                type="textarea"
                name="interpretation"
                id="interpretation"
                placeholder="Clinical interpretation of the results"
                value={newResultForm.interpretation}
                onChange={handleNewResultChange}
                rows="4"
              />
              <small className="form-text text-muted">
                You can manually enter your interpretation or use the AI to generate one based on the findings
              </small>
            </FormGroup>
            
            <FormGroup>
              <Label for="technician">Technician / Lab</Label>
              <Input
                type="text"
                name="technician"
                id="technician"
                placeholder="Name of technician or laboratory"
                value={newResultForm.technician}
                onChange={handleNewResultChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="attachmentFile">Attachment</Label>
              <Input
                type="file"
                name="attachmentFile"
                id="attachmentFile"
                onChange={handleNewResultChange}
              />
              <small className="form-text text-muted">
                Upload PDF, images, or data files with the full test results.
              </small>
            </FormGroup>
            <FormGroup>
              <Label for="notes">Additional Notes</Label>
              <Input
                type="textarea"
                name="notes"
                id="notes"
                placeholder="Any additional notes about the test or results"
                value={newResultForm.notes}
                onChange={handleNewResultChange}
                rows="2"
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="d-flex justify-content-end gap-3">
            <Button 
              color="primary" 
              type="submit"
              disabled={
                selectedRequest && selectedRequest.status !== 'accepted by patient' || 
                (!selectedRequest && !newResultForm.requestId)
              }
            >
              Upload Results
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewDetailsModalOpen} toggle={handleViewDetailsModalClose} size="lg">
        <ModalHeader toggle={handleViewDetailsModalClose}>
          Diagnostic Test Details
        </ModalHeader>
        <ModalBody>
          {selectedRequest && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Patient Information</h5>
                  <p><strong>Name:</strong> {selectedRequest.patientName}</p>
                  <p><strong>Test Type:</strong> {selectedRequest.testType}</p>
                  <p><strong>Priority:</strong> <PriorityIndicator priority={selectedRequest.priority} /></p>
                </Col>
                <Col md={6}>
                  <h5>Request Details</h5>
                  <p><strong>Date:</strong> {new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                  <p><strong>Requested By:</strong> {selectedRequest.requestedBy}</p>
                  <p>
                    <strong>Status:</strong> <RequestStatusBadge status={selectedRequest.status} />
                  </p>
                </Col>
              </Row>
              
              <h5>Clinical Notes</h5>
              <Card className="mb-4">
                <CardBody>
                  <p className="mb-0">{selectedRequest.notes || "No clinical notes provided."}</p>
                </CardBody>
              </Card>

              {selectedResult ? (
                <div>
                  <h5 className="mt-4">Test Results</h5>
                  <Card className="mb-3">
                    <CardHeader className="bg-light">
                      <strong>Result Date:</strong> {new Date(selectedResult.resultDate).toLocaleDateString()}
                    </CardHeader>
                    <CardBody>
                      <h6>Findings</h6>
                      <pre className="p-3 bg-light" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedResult.findings}
                      </pre>
                      
                      <h6 className="mt-3">Interpretation</h6>
                      <p>{selectedResult.interpretation || "No interpretation provided."}</p>
                      
                      {/* File Attachment Section - Always shown */}
                      <div className="mt-3">
                        <h6>Attachments</h6>
                        {selectedResult.attachmentUrl ? (
                          <div className="d-flex flex-column">
                            <Button color="info" size="sm" onClick={() => window.open(selectedResult.attachmentUrl, '_blank')} className="mb-2 align-self-start">
                              <FontAwesomeIcon icon={faFileMedical} className="me-2" />
                              View Full Report
                            </Button>
                            <small className="text-muted">File uploaded: {selectedResult.attachmentName || "diagnostic-report.pdf"}</small>
                          </div>
                        ) : (
                          <p className="text-muted">No attachments uploaded for this test result.</p>
                        )}
                      </div>

                      {/* AI Insights Section */}
                      <div className="mt-4">
                        <h6 className="d-flex align-items-center">
                          <FontAwesomeIcon icon={faNotesMedical} className="me-2 text-primary" />
                          AI Insights
                          {insightsLoading && <Spinner size="sm" className="ms-2" />}
                        </h6>
                        
                        {insightsError && (
                          <Alert color="warning" className="mt-2" fade={false}>
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                            {insightsError}
                          </Alert>
                        )}
                        
                        {insightsLoading && !aiInsights && (
                          <div className="text-center py-3">
                            <Spinner color="primary" />
                            <p className="mt-2 text-muted">Analyzing diagnostic report with AI...</p>
                          </div>
                        )}
                        
                        {aiInsights && (
                          <Card className="mt-2">
                            <CardBody>
                              {/* Processing Status */}
                              {aiInsights.processingStatus === 'processing' && (
                                <Alert color="info" className="mb-3" fade={false}>
                                  <FontAwesomeIcon icon={faSync} className="me-2" />
                                  AI analysis in progress... Results will update automatically.
                                </Alert>
                              )}
                              
                              {aiInsights.processingStatus === 'failed' && (
                                <Alert color="danger" className="mb-3" fade={false}>
                                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                  AI analysis failed. Please try again or review manually.
                                </Alert>
                              )}
                              
                              {aiInsights.processingStatus === 'completed' && (
                                <>
                                  {/* AI Summary */}
                                  {aiInsights.aiSummary && (
                                    <div className="mb-3">
                                      <h6 className="text-primary">AI Summary</h6>
                                      <div className="p-3 bg-light rounded">
                                        {aiInsights.aiSummary}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Risk Assessment */}
                                  {aiInsights.riskAssessment && (
                                    <div className="mb-3">
                                      <h6 className="text-primary">Risk Assessment</h6>
                                      <div className="d-flex align-items-center mb-2">
                                        <Badge 
                                          color={
                                            aiInsights.riskAssessment.level === 'critical' ? 'danger' :
                                            aiInsights.riskAssessment.level === 'high' ? 'warning' :
                                            aiInsights.riskAssessment.level === 'moderate' ? 'info' : 'success'
                                          }
                                          className="me-2"
                                        >
                                          {aiInsights.riskAssessment.level.toUpperCase()}
                                        </Badge>
                                        <span>{aiInsights.riskAssessment.description}</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Abnormal Findings */}
                                  {aiInsights.abnormalFindings && aiInsights.abnormalFindings.length > 0 && (
                                    <div className="mb-3">
                                      <h6 className="text-primary">Abnormal Findings</h6>
                                      {aiInsights.abnormalFindings.map((finding, index) => (
                                        <div key={index} className="border rounded p-3 mb-2 bg-light">
                                          <div className="d-flex justify-content-between align-items-start mb-2">
                                            <strong>{finding.parameter}</strong>
                                            <Badge 
                                              color={
                                                finding.severity === 'critical' ? 'danger' :
                                                finding.severity === 'high' ? 'warning' :
                                                finding.severity === 'moderate' ? 'info' : 'secondary'
                                              }
                                            >
                                              {finding.severity}
                                            </Badge>
                                          </div>
                                          <p className="mb-1"><strong>Value:</strong> {finding.value}</p>
                                          <p className="mb-1"><strong>Description:</strong> {finding.description}</p>
                                          {finding.recommendation && (
                                            <p className="mb-0 text-primary"><strong>Recommendation:</strong> {finding.recommendation}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Structured Data Preview */}
                                  {aiInsights.structuredData && aiInsights.structuredData.testValues && aiInsights.structuredData.testValues.length > 0 && (
                                    <div className="mb-3">
                                      <h6 className="text-primary">Extracted Test Values</h6>
                                      <div className="table-responsive">
                                        <table className="table table-sm table-striped">
                                          <thead>
                                            <tr>
                                              <th>Parameter</th>
                                              <th>Value</th>
                                              <th>Unit</th>
                                              <th>Reference Range</th>
                                              <th>Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {aiInsights.structuredData.testValues.map((test, index) => (
                                              <tr key={index}>
                                                <td>{test.parameter}</td>
                                                <td>{test.value}</td>
                                                <td>{test.unit}</td>
                                                <td>{test.referenceRange}</td>
                                                <td>
                                                  <Badge color={test.isAbnormal ? 'warning' : 'success'}>
                                                    {test.isAbnormal ? 'Abnormal' : 'Normal'}
                                                  </Badge>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* AI Metadata */}
                                  <div className="mt-3 pt-3 border-top">
                                    <small className="text-muted">
                                      <FontAwesomeIcon icon={faNotesMedical} className="me-1" />
                                      AI Analysis by {aiInsights.aiModel} • 
                                      Confidence: {(aiInsights.confidence * 100).toFixed(0)}% •
                                      Processed: {new Date(aiInsights.createdAt).toLocaleString()}
                                    </small>
                                  </div>
                                </>
                              )}
                            </CardBody>
                          </Card>
                        )}
                        
                        {!aiInsights && !insightsLoading && !insightsError && selectedResult?.attachmentUrl && (
                          <div className="text-center py-3">
                            <Button 
                              color="primary" 
                              size="sm" 
                              onClick={() => fetchAIInsights(selectedResult._id || selectedResult.id)}
                            >
                              <FontAwesomeIcon icon={faNotesMedical} className="me-2" />
                              Generate AI Insights
                            </Button>
                            <p className="mt-2 text-muted small">
                              Use AI to analyze this diagnostic report for abnormalities and insights
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {selectedResult.technician && (
                        <p className="mt-3 text-muted">
                          <small>{selectedResult.technician}</small>
                        </p>
                      )}
                      
                      {selectedResult.notes && (
                        <div className="mt-3">
                          <h6>Additional Notes</h6>
                          <p>{selectedResult.notes}</p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              ) : selectedRequest.status !== 'completed' ? (
                <div className="text-center p-4 bg-light rounded mt-4">
                  <FontAwesomeIcon icon={faFlask} size="2x" className="mb-3 text-secondary" />
                  <h5>No Results Yet</h5>
                  <p className="mb-3">Test results have not been uploaded for this request.</p>
                  <Button 
                    color="primary" 
                    onClick={() => {
                      setNewResultForm({
                        ...newResultForm,
                        requestId: selectedRequest.id
                      });
                      setIsViewDetailsModalOpen(false);
                      setIsUploadResultsModalOpen(true);
                    }}
                    disabled={selectedRequest.status !== 'accepted by patient'}
                  >
                    <FontAwesomeIcon icon={faUpload} className="me-2" />
                    Upload Results
                  </Button>
                  {selectedRequest.status !== 'accepted by patient' && (
                    <p className="text-muted mt-2 small">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                      Results can only be uploaded after the patient accepts the request
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 bg-light rounded mt-4">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-3 text-warning" />
                  <h5>Results Unavailable</h5>
                  <p>Test results are marked as completed but the data is not available.</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {selectedRequest && selectedRequest.status !== 'completed' && (
            <Button 
              color="danger" 
              onClick={async () => {
                await updateRequestStatus(selectedRequest.id, 'cancelled');
                setIsViewDetailsModalOpen(false);
              }}
              className="me-auto"
            >
              Cancel Test
            </Button>
          )}
          <Button color="secondary" onClick={handleViewDetailsModalClose}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <style>{`
        .diagnostics-container {
          min-height: calc(100vh - 64px);
        }
        pre {
          font-family: monospace;
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
        }
      `}</style>
    </Container>
  );
};

export default Diagnostics;