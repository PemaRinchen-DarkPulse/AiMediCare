import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Form, Button, Nav, 
  Alert, Spinner, Modal, Table 
} from 'react-bootstrap';
import axios from 'axios';
import VitalsChart from '../../components/patient/VitalsChart';
import './HealthRecords.css'; // Reusing existing styles

const VitalsPage = () => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bloodPressure');
  const [vitalsHistory, setVitalsHistory] = useState({
    bloodPressure: [],
    bloodSugar: [],
    heartRate: [],
    weight: [],
    cholesterol: [],
    temperature: [],
    oxygenSaturation: []
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVital, setNewVital] = useState({
    vitalType: 'bloodPressure',
    systolic: '',
    diastolic: '',
    value: '',
    unit: 'mmHg',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Fetch vitals data on component mount
  useEffect(() => {
    fetchVitalsData();
  }, []);

  const fetchVitalsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/patient/vitals-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setVitalsHistory(response.data.data);
      } else {
        throw new Error('Failed to fetch vitals data');
      }
    } catch (err) {
      console.error('Error fetching vitals:', err);
      setError(`Error loading vitals data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change for new vital form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVital(prev => ({ ...prev, [name]: value }));

    // Update unit based on vital type if vitalType changes
    if (name === 'vitalType') {
      let unit = '';
      switch(value) {
        case 'bloodPressure': unit = 'mmHg'; break;
        case 'heartRate': unit = 'bpm'; break;
        case 'bloodSugar': unit = 'mg/dL'; break;
        case 'weight': unit = 'kg'; break;
        case 'cholesterol': unit = 'mg/dL'; break;
        case 'temperature': unit = '°C'; break;
        case 'oxygenSaturation': unit = '%'; break;
        default: unit = '';
      }
      setNewVital(prev => ({ ...prev, unit }));
    }
  };

  // Submit new vital record
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      await axios.post(`${import.meta.env.VITE_API_URL}/api/patient/vitals`, newVital, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh vitals data
      await fetchVitalsData();
      
      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
      
    } catch (err) {
      console.error('Error adding vital record:', err);
      setError(`Failed to save vital record: ${err.message}`);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setNewVital({
      vitalType: 'bloodPressure',
      systolic: '',
      diastolic: '',
      value: '',
      unit: 'mmHg',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get chart data for the active tab
  const getChartData = () => {
    switch(activeTab) {
      case 'bloodPressure':
        return vitalsHistory.bloodPressure || [];
      case 'bloodSugar':
        return vitalsHistory.bloodSugar || [];
      case 'heartRate':
        return vitalsHistory.heartRate || [];
      case 'weight':
        return vitalsHistory.weight || [];
      case 'cholesterol':
        return vitalsHistory.cholesterol || [];
      case 'temperature':
        return vitalsHistory.temperature || [];
      case 'oxygenSaturation':
        return vitalsHistory.oxygenSaturation || [];
      default:
        return [];
    }
  };

  // Get unit for the active tab
  const getChartUnit = () => {
    switch(activeTab) {
      case 'bloodPressure': return 'mmHg';
      case 'bloodSugar': return 'mg/dL';
      case 'heartRate': return 'bpm';
      case 'weight': return 'kg';
      case 'cholesterol': return 'mg/dL';
      case 'temperature': return '°C';
      case 'oxygenSaturation': return '%';
      default: return '';
    }
  };

  // Get chart type for the active tab
  const getChartType = () => {
    switch(activeTab) {
      case 'bloodPressure': return 'blood-pressure';
      case 'heartRate': return 'heart-rate';
      case 'oxygenSaturation': return 'oxygen-saturation';
      case 'temperature': return 'temperature';
      default: return 'other';
    }
  };

  // Loading spinner while fetching data
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading your vital signs data...</p>
      </div>
    );
  }

  return (
    <div className="health-records-container">
      <Row className="mb-4">
        <Col>
          <h2>My Vital Signs</h2>
          <p className="text-muted">Track and monitor your vital signs over time</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus me-2"></i> Add New Reading
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Header>
          <Nav variant="tabs" defaultActiveKey="bloodPressure">
            <Nav.Item>
              <Nav.Link 
                eventKey="bloodPressure"
                active={activeTab === 'bloodPressure'}
                onClick={() => setActiveTab('bloodPressure')}
              >
                Blood Pressure
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="bloodSugar"
                active={activeTab === 'bloodSugar'}
                onClick={() => setActiveTab('bloodSugar')}
              >
                Blood Sugar
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="heartRate"
                active={activeTab === 'heartRate'}
                onClick={() => setActiveTab('heartRate')}
              >
                Heart Rate
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="weight"
                active={activeTab === 'weight'}
                onClick={() => setActiveTab('weight')}
              >
                Weight
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="cholesterol"
                active={activeTab === 'cholesterol'}
                onClick={() => setActiveTab('cholesterol')}
              >
                Cholesterol
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="temperature"
                active={activeTab === 'temperature'}
                onClick={() => setActiveTab('temperature')}
              >
                Temperature
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="oxygenSaturation"
                active={activeTab === 'oxygenSaturation'}
                onClick={() => setActiveTab('oxygenSaturation')}
              >
                O₂ Saturation
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          {getChartData().length > 0 ? (
            <div>
              <VitalsChart
                vitalType={getChartType()}
                data={getChartData()}
                unit={getChartUnit()}
                timeRange="6 Month"
              />
              
              <h5 className="mt-4 mb-3">Recent Readings</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    {activeTab === 'bloodPressure' ? (
                      <>
                        <th>Systolic (mmHg)</th>
                        <th>Diastolic (mmHg)</th>
                      </>
                    ) : (
                      <th>Reading ({getChartUnit()})</th>
                    )}
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {getChartData().slice(0, 10).map((record, index) => (
                    <tr key={index}>
                      <td>{formatDate(record.date)}</td>
                      {activeTab === 'bloodPressure' ? (
                        <>
                          <td>{record.value}</td>
                          <td>{record.secondaryValue}</td>
                        </>
                      ) : (
                        <td>{record.value}</td>
                      )}
                      <td>{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">
              No {activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()} readings found. Click "Add New Reading" to record your first measurement.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Card with health tips based on vital signs */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="fas fa-lightbulb me-2 text-warning"></i>
            Health Tips & Insights
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="ai-insight p-3 mb-3">
            <div className="d-flex align-items-center mb-2">
              <i className="fas fa-heartbeat text-primary me-2"></i>
              <h6 className="mb-0">Blood Pressure Awareness</h6>
            </div>
            <p className="mb-0">
              Normal blood pressure should be below 120/80 mmHg. Regular monitoring helps detect hypertension early.
            </p>
          </div>
          
          <div className="ai-insight p-3 mb-3">
            <div className="d-flex align-items-center mb-2">
              <i className="fas fa-tint text-danger me-2"></i>
              <h6 className="mb-0">Blood Sugar Management</h6>
            </div>
            <p className="mb-0">
              For most people without diabetes, normal blood sugar levels range from 70 to 99 mg/dL when fasting and less than 140 mg/dL two hours after eating.
            </p>
          </div>
          
          <div className="ai-insight p-3">
            <div className="d-flex align-items-center mb-2">
              <i className="fas fa-weight me-2 text-success"></i>
              <h6 className="mb-0">Weight Monitoring</h6>
            </div>
            <p className="mb-0">
              Track your weight at the same time of day, wearing similar clothing for the most accurate trend analysis.
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* Add New Reading Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Vital Sign Reading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Vital Sign Type</Form.Label>
              <Form.Select 
                name="vitalType" 
                value={newVital.vitalType}
                onChange={handleInputChange}
                required
              >
                <option value="bloodPressure">Blood Pressure</option>
                <option value="bloodSugar">Blood Sugar</option>
                <option value="heartRate">Heart Rate</option>
                <option value="weight">Weight</option>
                <option value="cholesterol">Cholesterol</option>
                <option value="temperature">Temperature</option>
                <option value="oxygenSaturation">Oxygen Saturation</option>
              </Form.Select>
            </Form.Group>
            
            {newVital.vitalType === 'bloodPressure' ? (
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Systolic (mmHg)</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="systolic" 
                      value={newVital.systolic}
                      onChange={handleInputChange}
                      placeholder="120"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Diastolic (mmHg)</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="diastolic" 
                      value={newVital.diastolic}
                      onChange={handleInputChange}
                      placeholder="80"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>
                  Reading ({newVital.unit})
                </Form.Label>
                <Form.Control 
                  type="number" 
                  name="value" 
                  value={newVital.value}
                  onChange={handleInputChange}
                  placeholder={
                    newVital.vitalType === 'heartRate' ? "72" :
                    newVital.vitalType === 'bloodSugar' ? "100" :
                    newVital.vitalType === 'weight' ? "70" :
                    newVital.vitalType === 'cholesterol' ? "180" :
                    newVital.vitalType === 'temperature' ? "36.6" :
                    newVital.vitalType === 'oxygenSaturation' ? "98" : ""
                  }
                  required
                />
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Unit</Form.Label>
              <Form.Select
                name="unit"
                value={newVital.unit}
                onChange={handleInputChange}
                required
              >
                {newVital.vitalType === 'bloodPressure' && (
                  <option value="mmHg">mmHg</option>
                )}
                {newVital.vitalType === 'heartRate' && (
                  <option value="bpm">bpm</option>
                )}
                {newVital.vitalType === 'bloodSugar' && (
                  <>
                    <option value="mg/dL">mg/dL</option>
                    <option value="mmol/L">mmol/L</option>
                  </>
                )}
                {newVital.vitalType === 'weight' && (
                  <>
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </>
                )}
                {newVital.vitalType === 'cholesterol' && (
                  <option value="mg/dL">mg/dL</option>
                )}
                {newVital.vitalType === 'temperature' && (
                  <>
                    <option value="°C">°C</option>
                    <option value="°F">°F</option>
                  </>
                )}
                {newVital.vitalType === 'oxygenSaturation' && (
                  <option value="%">%</option>
                )}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control 
                type="date" 
                name="date" 
                value={newVital.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                name="notes" 
                rows={3}
                value={newVital.notes}
                onChange={handleInputChange}
                placeholder="Add any additional information here..."
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Save Reading
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VitalsPage;