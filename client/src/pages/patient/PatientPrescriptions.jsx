import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane,
  Card, CardBody, Badge, Button, Alert, Spinner
} from 'reactstrap';
import { FaPills, FaCalendarAlt, FaHistory, FaSearch, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import PrescriptionDetail from '../../components/prescriptions/PrescriptionDetail';
import PrescriptionSearch from '../../components/prescriptions/PrescriptionSearch';

// Base API URL from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PatientPrescriptions = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [prescriptions, setPrescriptions] = useState({
    active: [],
    past: [],
    upcoming: []
  });
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilters, setSearchFilters] = useState(null);

  // Get auth header with JWT token
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch prescriptions on component mount
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all prescriptions for the patient
        const response = await axios.get(`${BASE_URL}/api/prescriptions/patient`, {
          headers: getAuthHeader()
        });

        const allPrescriptions = response.data.data || response.data;

        // Process and categorize prescriptions
        const active = allPrescriptions.filter(p => p.status === 'active');
        const past = allPrescriptions.filter(p => p.status === 'completed' || p.status === 'cancelled');
        const upcoming = []; // For future prescriptions if applicable

        setPrescriptions({ active, past, upcoming });

        // Select the first active prescription by default if available
        if (active.length > 0) {
          setSelectedPrescription(active[0]);
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Handle prescription selection
  const handlePrescriptionSelect = (prescription) => {
    setSelectedPrescription(prescription);
  };

  // Handle refill request
  const handleRefillRequest = async (prescriptionId) => {
    try {
      setLoading(true);
      
      // Make API call to request refill
      await axios.post(`${BASE_URL}/api/prescriptions/${prescriptionId}/refill-request`, {}, {
        headers: getAuthHeader()
      });
      
      // Show success message (in a real app, you'd handle this more elegantly)
      alert('Refill request submitted successfully!');
      
    } catch (err) {
      console.error('Error requesting refill:', err);
      setError('Failed to request refill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (searchData) => {
    setSearchFilters(searchData);
  };

  // Filter prescriptions based on search criteria
  const getFilteredPrescriptions = (prescriptionList) => {
    if (!searchFilters) return prescriptionList;
    
    return prescriptionList.filter(prescription => {
      // Filter by search term
      const matchesTerm = searchFilters.searchTerm === '' || 
        prescription.medications.some(med => 
          med.name.toLowerCase().includes(searchFilters.searchTerm.toLowerCase())
        ) ||
        (prescription.diagnosis && 
          prescription.diagnosis.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()));
      
      // Filter by date range
      let matchesDate = true;
      if (searchFilters.filters.dateRange !== 'all') {
        const now = new Date();
        const prescDate = new Date(prescription.issuedDate);
        const diffDays = Math.round((now - prescDate) / (1000 * 60 * 60 * 24));
        
        switch (searchFilters.filters.dateRange) {
          case 'last30':
            matchesDate = diffDays <= 30;
            break;
          case 'last90':
            matchesDate = diffDays <= 90;
            break;
          case 'last180':
            matchesDate = diffDays <= 180;
            break;
          case 'last365':
            matchesDate = diffDays <= 365;
            break;
        }
      }
      
      // Filter by doctor
      let matchesDoctor = true;
      if (searchFilters.filters.doctor !== 'all') {
        matchesDoctor = prescription.doctorId.name === searchFilters.filters.doctor;
      }
      
      return matchesTerm && matchesDate && matchesDoctor;
    });
  };

  // Format prescription data for display
  const formatPrescriptionForDisplay = (prescription) => {
    if (!prescription || !prescription.medications || prescription.medications.length === 0) {
      return null;
    }

    const mainMedication = prescription.medications[0];
    
    return {
      id: prescription._id,
      name: mainMedication.name,
      dosage: mainMedication.dosage,
      frequency: mainMedication.frequency,
      startDate: prescription.issuedDate,
      endDate: prescription.endDate,
      prescribedBy: prescription.doctorId.name || 'Unknown Doctor',
      refillsRemaining: prescription.refillsRemaining || 0,
      refillsTotal: prescription.refillsTotal || 0,
      pharmacy: prescription.pharmacy || 'Not specified',
      instructions: mainMedication.instructions || '',
      status: prescription.status,
      sideEffects: [],
      interactions: [],
      lastRefillDate: prescription.lastRefillDate
    };
  };

  // Render prescription list item
  const renderPrescriptionCard = (prescription) => {
    const isSelected = selectedPrescription && selectedPrescription._id === prescription._id;
    
    return (
      <Card 
        key={prescription._id} 
        className={`mb-3 shadow-sm ${isSelected ? 'border-primary' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => handlePrescriptionSelect(prescription)}
      >
        <CardBody>
          <div className="d-flex justify-content-between">
            <div>
              <h5 className="mb-1">
                {prescription.medications[0]?.name || 'Unknown Medication'}
              </h5>
              <p className="text-muted mb-1">
                {prescription.medications[0]?.dosage}, {prescription.medications[0]?.frequency}
              </p>
              <small className="text-muted">
                <FaCalendarAlt className="me-1" />
                {new Date(prescription.issuedDate).toLocaleDateString()}
              </small>
            </div>
            <Badge color={prescription.status === 'active' ? 'success' : 'secondary'} pill>
              {prescription.status}
            </Badge>
          </div>
          
          {prescription.diagnosis && (
            <div className="mt-2 pt-2 border-top">
              <small>
                <strong>Diagnosis:</strong> {prescription.diagnosis}
              </small>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <Container fluid className="py-4">
      <h2 className="mb-3">My Prescriptions</h2>
      
      {error && (
        <Alert color="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col lg="4">
          {/* Prescription Search */}
          <PrescriptionSearch onSearch={handleSearch} />
          
          {/* Prescription Tabs */}
          <Nav tabs className="mb-3">
            <NavItem>
              <NavLink
                className={activeTab === 'active' ? 'active' : ''}
                onClick={() => setActiveTab('active')}
                style={{ cursor: 'pointer' }}
              >
                Active ({prescriptions.active.length})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 'past' ? 'active' : ''}
                onClick={() => setActiveTab('past')}
                style={{ cursor: 'pointer' }}
              >
                Past ({prescriptions.past.length})
              </NavLink>
            </NavItem>
            {prescriptions.upcoming.length > 0 && (
              <NavItem>
                <NavLink
                  className={activeTab === 'upcoming' ? 'active' : ''}
                  onClick={() => setActiveTab('upcoming')}
                  style={{ cursor: 'pointer' }}
                >
                  Upcoming ({prescriptions.upcoming.length})
                </NavLink>
              </NavItem>
            )}
          </Nav>
          
          {/* Prescription Lists */}
          <div className="prescription-list">
            <TabContent activeTab={activeTab}>
              {/* Active Prescriptions */}
              <TabPane tabId="active">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="text-muted mt-3">Loading prescriptions...</p>
                  </div>
                ) : getFilteredPrescriptions(prescriptions.active).length > 0 ? (
                  getFilteredPrescriptions(prescriptions.active).map(prescription => 
                    renderPrescriptionCard(prescription)
                  )
                ) : (
                  <Alert color="info">
                    You have no active prescriptions.
                  </Alert>
                )}
              </TabPane>
              
              {/* Past Prescriptions */}
              <TabPane tabId="past">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="text-muted mt-3">Loading prescriptions...</p>
                  </div>
                ) : getFilteredPrescriptions(prescriptions.past).length > 0 ? (
                  getFilteredPrescriptions(prescriptions.past).map(prescription => 
                    renderPrescriptionCard(prescription)
                  )
                ) : (
                  <Alert color="info">
                    You have no past prescriptions.
                  </Alert>
                )}
              </TabPane>
              
              {/* Upcoming Prescriptions */}
              {prescriptions.upcoming.length > 0 && (
                <TabPane tabId="upcoming">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner color="primary" />
                      <p className="text-muted mt-3">Loading prescriptions...</p>
                    </div>
                  ) : getFilteredPrescriptions(prescriptions.upcoming).length > 0 ? (
                    getFilteredPrescriptions(prescriptions.upcoming).map(prescription => 
                      renderPrescriptionCard(prescription)
                    )
                  ) : (
                    <Alert color="info">
                      You have no upcoming prescriptions.
                    </Alert>
                  )}
                </TabPane>
              )}
            </TabContent>
          </div>
        </Col>
        
        {/* Prescription Detail */}
        <Col lg="8">
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="text-muted mt-3">Loading prescription details...</p>
            </div>
          ) : selectedPrescription ? (
            <Card className="shadow">
              <CardBody>
                <div className="d-flex justify-content-between mb-4">
                  <h3 className="mb-0">Prescription Details</h3>
                  <Button color="primary" outline size="sm">
                    <FaDownload className="me-2" /> Download
                  </Button>
                </div>
                
                <PrescriptionDetail 
                  prescription={formatPrescriptionForDisplay(selectedPrescription)}
                  onRefillRequest={handleRefillRequest}
                />
              </CardBody>
            </Card>
          ) : (
            <Card className="shadow text-center py-5">
              <CardBody>
                <FaPills className="mb-3 text-muted" size={48} />
                <h4 className="text-muted">Select a prescription to view details</h4>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PatientPrescriptions;