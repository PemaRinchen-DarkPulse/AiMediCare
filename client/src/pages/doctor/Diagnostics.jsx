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
  faFilter, faCog, faSortAmountDown, faPlus, faUpload, faEye, faRobot,
  faFileMedical, faSync, faCalendarAlt, faExclamationTriangle, faCheck
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import classnames from 'classnames';
import { createDiagnosticRequest, getDiagnosticRequests, getTestResults, uploadTestResult, updateRequestStatus } from '../../services/diagnosticsService';

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
  
  // Modal states
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isUploadResultsModalOpen, setIsUploadResultsModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [isAiSuggestionsOpen, setIsAiSuggestionsOpen] = useState(false);
  
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

  // AI suggestion state
  const [aiSuggestions, setAiSuggestions] = useState({
    possibleDiagnoses: [],
    confidenceLevels: [],
    recommendedFollowUp: [],
    interpretation: ''
  });

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
      // Replace with actual API call
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }

      // This should be updated with your actual API endpoint
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/doctor/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Transform the patient data to only show email, removing gender and age
        const formattedPatients = response.data.data.map(patient => ({
          id: patient._id,
          name: patient.user.email // Only using email as identifier
        }));
        setPatients(formattedPatients);
      } else {
        throw new Error(response.data.message || 'Failed to fetch patients');
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
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

  const uploadTestResult = async (resultData) => {
    try {
      // Use our service to upload test results
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
    
    const result = await uploadTestResult(newResultForm);
    
    if (result.success) {
      setIsUploadResultsModalOpen(false);
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
    } else {
      setError(result.error || 'Failed to upload test results');
    }
  };

  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsViewDetailsModalOpen(true);
    
    // If this request has results, load them
    const results = testResults.filter(res => res.requestId === request.id);
    if (results.length > 0) {
      setSelectedResult(results[0]);
    } else {
      setSelectedResult(null);
    }
  };

  // Handle AI suggestions
  const generateAiSuggestions = async () => {
    try {
      // This would be replaced with actual AI API call
      // Mock data for now
      setTimeout(() => {
        setAiSuggestions({
          possibleDiagnoses: [
            'Type 2 Diabetes Mellitus',
            'Impaired Glucose Tolerance',
            'Metabolic Syndrome'
          ],
          confidenceLevels: [82, 65, 48],
          recommendedFollowUp: [
            'HbA1c Test',
            'Lipid Panel',
            'Kidney Function Tests'
          ],
          interpretation: 'Elevated blood glucose levels consistent with Type 2 Diabetes. Recent lab results show a fasting glucose of 142 mg/dL and HbA1c of 7.2%, both above normal reference ranges. Consider starting on oral hypoglycemic medication and lifestyle modification recommendations.'
        });
        
        setIsAiSuggestionsOpen(true);
      }, 1500);
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
      setError('Failed to generate AI diagnostic suggestions');
    }
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
            className={classnames({ active: activeTab === 'results' })}
            onClick={() => setActiveTab('results')}
          >
            <FontAwesomeIcon icon={faFlask} className="me-2" />
            Test Results
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === 'analytics' })}
            onClick={() => setActiveTab('analytics')}
          >
            <FontAwesomeIcon icon={faRobot} className="me-2" />
            AI Diagnostics
          </NavLink>
        </NavItem>
      </Nav>

      {/* Tab content */}
      <TabContent activeTab={activeTab}>
        {/* Test Requests Tab */}
        <TabPane tabId="requests">
          <Card className="mb-4">
            <CardHeader className="d-flex justify-content-between align-items-center bg-light">
              <h5 className="mb-0">Diagnostic Test Requests</h5>
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
                  <Dropdown isOpen={filterDropdownOpen} toggle={toggleFilterDropdown} className="me-2">
                    <DropdownToggle caret color="secondary">
                      <FontAwesomeIcon icon={faFilter} className="me-2" />
                      Filter
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem header>Status</DropdownItem>
                      <DropdownItem onClick={() => setStatusFilter('all')} active={statusFilter === 'all'}>All</DropdownItem>
                      <DropdownItem onClick={() => setStatusFilter('pending')} active={statusFilter === 'pending'}>Pending</DropdownItem>
                      <DropdownItem onClick={() => setStatusFilter('in-progress')} active={statusFilter === 'in-progress'}>In Progress</DropdownItem>
                      <DropdownItem onClick={() => setStatusFilter('scheduled')} active={statusFilter === 'scheduled'}>Scheduled</DropdownItem>
                      <DropdownItem onClick={() => setStatusFilter('completed')} active={statusFilter === 'completed'}>Completed</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem header>Date Range</DropdownItem>
                      <DropdownItem onClick={() => setDateFilter('all')} active={dateFilter === 'all'}>All Time</DropdownItem>
                      <DropdownItem onClick={() => setDateFilter('today')} active={dateFilter === 'today'}>Today</DropdownItem>
                      <DropdownItem onClick={() => setDateFilter('week')} active={dateFilter === 'week'}>This Week</DropdownItem>
                      <DropdownItem onClick={() => setDateFilter('month')} active={dateFilter === 'month'}>This Month</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <Button color="secondary" onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTestTypeFilter('all');
                    setDateFilter('all');
                    setPatientFilter('all');
                  }}>
                    <FontAwesomeIcon icon={faSync} className="me-2" />
                    Reset
                  </Button>
                </Col>
              </Row>

              {/* Requests Table */}
              {loading ? (
                <div className="text-center p-5">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading diagnostic requests...</p>
                </div>
              ) : error ? (
                <Alert color="danger">{error}</Alert>
              ) : filteredRequests.length > 0 ? (
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
                      {filteredRequests.map(request => (
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
                            {request.status !== 'completed' && (
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
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert color="info">
                  No diagnostic requests found with the current filters.
                </Alert>
              )}
            </CardBody>
          </Card>
        </TabPane>

        {/* Test Results Tab */}
        <TabPane tabId="results">
          <Card>
            <CardHeader className="bg-light">
              <h5 className="mb-0">Diagnostic Test Results</h5>
            </CardHeader>
            <CardBody>
              {/* Search and Filter for results could be added here */}
              {testResults.length > 0 ? (
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
                      {testResults.map(result => {
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
                                className="me-2"
                                onClick={() => {
                                  setSelectedResult(result);
                                  setSelectedRequest(request);
                                  setIsViewDetailsModalOpen(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                              <Button 
                                color="primary" 
                                size="sm"
                                onClick={() => {
                                  setSelectedResult(result);
                                  setSelectedRequest(request);
                                  generateAiSuggestions();
                                }}
                              >
                                <FontAwesomeIcon icon={faRobot} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert color="info">
                  No test results found. Upload results for completed diagnostic tests.
                </Alert>
              )}
            </CardBody>
          </Card>
        </TabPane>

        {/* AI Diagnostics Tab */}
        <TabPane tabId="analytics">
          <Row>
            <Col md={12}>
              <Card className="mb-4">
                <CardHeader className="bg-light">
                  <h5 className="mb-0">AI Diagnostic Support</h5>
                </CardHeader>
                <CardBody>
                  <Alert color="info">
                    <FontAwesomeIcon icon={faRobot} className="me-2" />
                    Select a completed test result and click the AI button to receive diagnostic suggestions.
                  </Alert>
                  
                  <p>
                    The AI diagnostic support system analyzes test results and provides:
                  </p>
                  <ul>
                    <li>Potential diagnoses with confidence levels</li>
                    <li>Recommended follow-up tests</li>
                    <li>Treatment suggestions based on clinical guidelines</li>
                    <li>Comparative analysis with historical patient data</li>
                  </ul>
                  
                  <div className="text-center mt-4">
                    <Button 
                      color="primary" 
                      disabled={testResults.length === 0}
                      onClick={() => {
                        if (testResults.length > 0) {
                          setSelectedResult(testResults[0]);
                          setSelectedRequest(diagnosticRequests.find(req => req.id === testResults[0].requestId));
                          generateAiSuggestions();
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faRobot} className="me-2" />
                      Generate Sample AI Analysis
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
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
      <Modal isOpen={isUploadResultsModalOpen} toggle={() => setIsUploadResultsModalOpen(!isUploadResultsModalOpen)}>
        <ModalHeader toggle={() => setIsUploadResultsModalOpen(!isUploadResultsModalOpen)}>
          Upload Test Results
        </ModalHeader>
        <Form onSubmit={handleNewResultSubmit}>
          <ModalBody>
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
                  .filter(req => req.status !== 'completed')
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
                rows="2"
              />
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
          <ModalFooter>
            <Button color="secondary" onClick={() => setIsUploadResultsModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Upload Results
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewDetailsModalOpen} toggle={() => setIsViewDetailsModalOpen(!isViewDetailsModalOpen)} size="lg">
        <ModalHeader toggle={() => setIsViewDetailsModalOpen(!isViewDetailsModalOpen)}>
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
                      
                      {selectedResult.attachmentUrl && (
                        <div className="mt-3">
                          <h6>Attachments</h6>
                          <Button color="info" size="sm" onClick={() => window.open(selectedResult.attachmentUrl, '_blank')}>
                            <FontAwesomeIcon icon={faFileMedical} className="me-2" />
                            View Full Report
                          </Button>
                        </div>
                      )}
                      
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
                  
                  <div className="d-flex justify-content-end">
                    <Button 
                      color="primary" 
                      onClick={generateAiSuggestions}
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faRobot} className="me-2" />
                      Generate AI Suggestions
                    </Button>
                  </div>
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
                  >
                    <FontAwesomeIcon icon={faUpload} className="me-2" />
                    Upload Results
                  </Button>
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
          <Button color="secondary" onClick={() => setIsViewDetailsModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* AI Suggestions Modal */}
      <Modal isOpen={isAiSuggestionsOpen} toggle={() => setIsAiSuggestionsOpen(!isAiSuggestionsOpen)} size="lg">
        <ModalHeader toggle={() => setIsAiSuggestionsOpen(!isAiSuggestionsOpen)} className="bg-primary text-white">
          <FontAwesomeIcon icon={faRobot} className="me-2" />
          AI Diagnostic Suggestions
        </ModalHeader>
        <ModalBody>
          {selectedResult && selectedRequest && (
            <div>
              <Alert color="info" className="mb-4">
                AI analysis for {selectedRequest.patientName}'s {selectedRequest.testType} results from {new Date(selectedResult.resultDate).toLocaleDateString()}
              </Alert>
              
              <h5>Possible Diagnoses</h5>
              <div className="mb-4">
                {aiSuggestions.possibleDiagnoses.map((diagnosis, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>{diagnosis}</span>
                      <Badge color={
                        aiSuggestions.confidenceLevels[index] > 80 ? 'danger' :
                        aiSuggestions.confidenceLevels[index] > 60 ? 'warning' : 'info'
                      }>
                        {aiSuggestions.confidenceLevels[index]}% confidence
                      </Badge>
                    </div>
                    <Progress 
                      value={aiSuggestions.confidenceLevels[index]} 
                      color={
                        aiSuggestions.confidenceLevels[index] > 80 ? 'danger' :
                        aiSuggestions.confidenceLevels[index] > 60 ? 'warning' : 'info'
                      } 
                    />
                  </div>
                ))}
              </div>
              
              <h5>Recommended Follow-up</h5>
              <ul className="mb-4">
                {aiSuggestions.recommendedFollowUp.map((followUp, index) => (
                  <li key={index}>{followUp}</li>
                ))}
              </ul>
              
              <h5>Clinical Interpretation</h5>
              <Card className="bg-light">
                <CardBody>
                  <p className="mb-0">{aiSuggestions.interpretation}</p>
                </CardBody>
              </Card>
              
              <Alert color="warning" className="mt-4">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                <strong>AI Disclaimer:</strong> These suggestions are generated by an AI system and should be used as a supporting tool only. Always rely on your clinical judgment and expertise for final diagnoses and treatment decisions.
              </Alert>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setIsAiSuggestionsOpen(false)}>
            <FontAwesomeIcon icon={faCheck} className="me-2" />
            Acknowledge
          </Button>
        </ModalFooter>
      </Modal>

      <style jsx>{`
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