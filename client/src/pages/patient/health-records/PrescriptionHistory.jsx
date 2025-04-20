import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaDownload, FaFilePrescription, FaCalendarAlt, FaHistory } from 'react-icons/fa';

const PrescriptionHistory = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', or 'past'

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      // Connect to the actual API endpoint
      const response = await fetch('http://localhost:5000/api/prescriptions/patient', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) throw new Error('Failed to load prescriptions');
      
      const data = await response.json();
      setPrescriptions(data);
      setLoading(false);
      
      // Fallback to mock data if in development mode
      if (process.env.NODE_ENV === 'development' && (!data || data.length === 0)) {
        console.log('Using mock prescription data for development');
        setPrescriptions(mockPrescriptions);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError(err.message);
      
      // In development mode, fall back to mock data even on error
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock prescription data after error');
        setPrescriptions(mockPrescriptions);
        setError(null);
      }
      
      setLoading(false);
    }
  };

  // Filter prescriptions based on current status
  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (filter === 'all') return true;
    const isActive = new Date(prescription.expiryDate) > new Date();
    return filter === 'active' ? isActive : !isActive;
  });

  const getStatusBadge = (prescription) => {
    const today = new Date();
    const expiryDate = new Date(prescription.expiryDate);
    
    if (expiryDate < today) {
      return <Badge bg="secondary">Expired</Badge>;
    } else if (prescription.refillsRemaining === 0) {
      return <Badge bg="warning" text="dark">No Refills</Badge>;
    } else {
      return <Badge bg="success">Active</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Header as="h4">Prescription History</Card.Header>
        <Card.Body className="text-center p-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading prescriptions...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Header as="h4">Prescription History</Card.Header>
        <Card.Body>
          <Alert variant="danger">
            <FaHistory className="me-2" /> Failed to load prescriptions
          </Alert>
          <div className="text-center mt-3">
            <Button variant="primary" onClick={fetchPrescriptions}>Try Again</Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header as="h4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <FaFilePrescription className="me-2" /> Prescription History
          </div>
          <div>
            <Button 
              variant={filter === 'all' ? 'primary' : 'outline-primary'} 
              size="sm" 
              className="me-2"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'active' ? 'primary' : 'outline-primary'} 
              size="sm" 
              className="me-2"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button 
              variant={filter === 'past' ? 'primary' : 'outline-primary'} 
              size="sm"
              onClick={() => setFilter('past')}
            >
              Past
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {filteredPrescriptions.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted">No {filter !== 'all' ? filter : ''} prescriptions found</p>
          </div>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Instructions</th>
                <th>Prescribed By</th>
                <th>Prescribed Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>{prescription.medication}</td>
                  <td>{prescription.dosage}</td>
                  <td>{prescription.instructions}</td>
                  <td>Dr. {prescription.prescribedBy}</td>
                  <td>
                    <FaCalendarAlt className="me-1" /> 
                    {new Date(prescription.prescribedDate).toLocaleDateString()}
                  </td>
                  <td>{getStatusBadge(prescription)}</td>
                  <td>
                    <Button variant="outline-secondary" size="sm">
                      <FaDownload className="me-1" /> PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

// Mock data for development
const mockPrescriptions = [
  {
    id: 1,
    medication: 'Metformin',
    dosage: '1000mg',
    instructions: 'Take twice daily with meals',
    prescribedBy: 'Amelia Rodriguez',
    prescribedDate: '2025-02-10',
    expiryDate: '2025-05-10',
    refillsRemaining: 3
  },
  {
    id: 2,
    medication: 'Lisinopril',
    dosage: '20mg',
    instructions: 'Take once daily in the morning',
    prescribedBy: 'Sarah Johnson',
    prescribedDate: '2025-03-01',
    expiryDate: '2025-06-01',
    refillsRemaining: 5
  },
  {
    id: 3,
    medication: 'Atorvastatin',
    dosage: '20mg',
    instructions: 'Take once daily at bedtime',
    prescribedBy: 'Michael Chen',
    prescribedDate: '2025-03-15',
    expiryDate: '2025-06-15',
    refillsRemaining: 2
  },
  {
    id: 4,
    medication: 'Loratadine',
    dosage: '10mg',
    instructions: 'Take once daily as needed for allergies',
    prescribedBy: 'Sarah Johnson',
    prescribedDate: '2024-10-15',
    expiryDate: '2025-01-15',
    refillsRemaining: 0
  },
  {
    id: 5,
    medication: 'Omeprazole',
    dosage: '20mg',
    instructions: 'Take once daily before breakfast',
    prescribedBy: 'Robert Wilson',
    prescribedDate: '2025-03-03',
    expiryDate: '2025-06-03',
    refillsRemaining: 2
  }
];

export default PrescriptionHistory;