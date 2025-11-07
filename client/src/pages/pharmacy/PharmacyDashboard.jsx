import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Badge, Button, Spinner } from 'react-bootstrap';
import { FaPills, FaExclamationTriangle, FaCalendarAlt, FaDollarSign, FaUsers, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getPharmacyDashboard } from '../../services/pharmacyService';

const PharmacyDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getPharmacyDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <Alert variant="danger" className="text-center">
        <Alert.Heading>Error Loading Dashboard</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchDashboardData}>
          Try Again
        </Button>
      </Alert>
    );
  }

  const { pendingPrescriptions, lowStockMedications, expiringMedications, statistics, alerts } = dashboardData || {};

  const getAlertVariant = (severity) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="pharmacy-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pharmacy Dashboard</h2>
        <Button variant="outline-primary" size="sm" onClick={fetchDashboardData} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Refresh'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-primary text-white rounded p-3">
                  <FaCheck size={24} />
                </div>
              </div>
              <div>
                <div className="text-muted small">Pending Prescriptions</div>
                <div className="h4 mb-0">{statistics?.pendingCount || 0}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-success text-white rounded p-3">
                  <FaDollarSign size={24} />
                </div>
              </div>
              <div>
                <div className="text-muted small">Today's Revenue</div>
                <div className="h4 mb-0">{formatCurrency(statistics?.todayRevenue)}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-info text-white rounded p-3">
                  <FaUsers size={24} />
                </div>
              </div>
              <div>
                <div className="text-muted small">Total Patients</div>
                <div className="h4 mb-0">{statistics?.patientCount || 0}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-warning text-white rounded p-3">
                  <FaPills size={24} />
                </div>
              </div>
              <div>
                <div className="text-muted small">Recent Dispenses (7d)</div>
                <div className="h4 mb-0">{statistics?.recentDispenses || 0}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alerts Row */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-warning text-white">
              <FaExclamationTriangle className="me-2" />
              Low Stock Alerts
            </Card.Header>
            <Card.Body>
              {lowStockMedications?.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {lowStockMedications.slice(0, 10).map((medication, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <div>
                        <div className="fw-bold">{medication.medicationName}</div>
                        <small className="text-muted">{medication.strength}</small>
                      </div>
                      <Badge bg="warning">{medication.currentStock}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  <FaPills size={32} className="mb-2 opacity-25" />
                  <div>No low stock alerts</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-danger text-white">
              <FaCalendarAlt className="me-2" />
              Expiring Soon
            </Card.Header>
            <Card.Body>
              {expiringMedications?.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {expiringMedications.slice(0, 10).map((medication, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <div>
                        <div className="fw-bold">{medication.medicationName}</div>
                        <small className="text-muted">
                          Expires: {new Date(medication.expiryDate).toLocaleDateString()}
                        </small>
                      </div>
                      <Badge bg="danger">
                        {Math.ceil((new Date(medication.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  <FaCalendarAlt size={32} className="mb-2 opacity-25" />
                  <div>No expiring medications</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <FaCheck className="me-2" />
              Pending Prescriptions
            </Card.Header>
            <Card.Body>
              {pendingPrescriptions?.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {pendingPrescriptions.slice(0, 10).map((prescription, index) => (
                    <div key={index} className="py-2 border-bottom">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-bold">{prescription.patientId?.name || 'Unknown Patient'}</div>
                          <small className="text-muted">
                            Dr. {prescription.doctorId?.name || 'Unknown Doctor'}
                          </small>
                        </div>
                        <Badge bg={prescription.status === 'pending' ? 'warning' : 'info'}>
                          {prescription.status}
                        </Badge>
                      </div>
                      <div className="mt-1">
                        <small className="text-muted">
                          {prescription.dispensedMedications?.length || 0} medications
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  <FaCheck size={32} className="mb-2 opacity-25" />
                  <div>No pending prescriptions</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Active Alerts */}
      {alerts && alerts.length > 0 && (
        <Row>
          <Col md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Active Alerts</h5>
              </Card.Header>
              <Card.Body>
                {alerts.map((alert, index) => (
                  <Alert key={index} variant={getAlertVariant(alert._id)} className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{alert._id.toUpperCase()} Priority:</strong> {alert.count} alert(s)
                      </div>
                      <Badge bg={getAlertVariant(alert._id)}>{alert.count}</Badge>
                    </div>
                  </Alert>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default PharmacyDashboard;