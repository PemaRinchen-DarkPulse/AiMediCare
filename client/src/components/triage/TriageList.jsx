import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, CardTitle, Spinner, Alert, Row, Col,
  Input, InputGroup, Button, Badge, Modal, ModalHeader, ModalBody
} from 'reactstrap';
import {
  FaSearch, FaFilter, FaExclamationTriangle, FaRobot,
  FaCalendarAlt, FaUserMd, FaUser
} from 'react-icons/fa';
import TriageSummary from './TriageSummary';
import TriageDisplay from './TriageDisplay';
import { 
  getDoctorTriageData, 
  getPatientTriageData, 
  getUrgentTriageData 
} from '../../services/previsitTriageService';

const TriageList = ({ userRole, showUrgentOnly = false, patientId = null, doctorId = null }) => {
  const [triageData, setTriageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [selectedTriage, setSelectedTriage] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  useEffect(() => {
    fetchTriageData();
  }, [userRole, showUrgentOnly, patientId, doctorId]);

  const fetchTriageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (showUrgentOnly) {
        data = await getUrgentTriageData();
      } else if (userRole === 'doctor' || doctorId) {
        data = await getDoctorTriageData();
      } else if (userRole === 'patient' || patientId) {
        data = await getPatientTriageData();
      } else {
        throw new Error('Invalid user role or missing IDs');
      }
      
      setTriageData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching triage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriageClick = (triage) => {
    setSelectedTriage(triage);
    setDetailModal(true);
  };

  const handleTriageUpdate = () => {
    fetchTriageData(); // Refresh the list
  };

  const filteredData = triageData.filter(triage => {
    const matchesSearch = triage.reasonForVisit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         triage.medicalCategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || triage.status === filterStatus;
    
    const matchesUrgency = filterUrgency === 'all' || 
                          (filterUrgency === 'urgent' && triage.urgencyLevel >= 4) ||
                          (filterUrgency === 'normal' && triage.urgencyLevel < 4);
    
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatsData = () => {
    const total = triageData.length;
    const urgent = triageData.filter(t => t.urgencyLevel >= 4).length;
    const pending = triageData.filter(t => t.status !== 'reviewed').length;
    const aiGenerated = triageData.filter(t => t.generatedAt === 'AI-Generated').length;
    
    return { total, urgent, pending, aiGenerated };
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-4">
          <Spinner color="primary" />
          <p className="mt-2">Loading triage data...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert color="danger">
            <h6>Error Loading Triage Data</h6>
            <p className="mb-0">{error}</p>
            <Button color="primary" size="sm" className="mt-2" onClick={fetchTriageData}>
              Retry
            </Button>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  const stats = getStatsData();

  return (
    <div className="triage-list">
      {/* Header and Stats */}
      <Card className="mb-3">
        <CardBody>
          <Row className="align-items-center">
            <Col md={6}>
              <CardTitle tag="h5" className="mb-0">
                <FaRobot className="text-primary me-2" />
                {showUrgentOnly ? 'Urgent Triage Cases' : 'Triage Records'}
              </CardTitle>
              <small className="text-muted">
                AI-powered pre-visit analysis and preparation
              </small>
            </Col>
            <Col md={6}>
              <Row className="text-center">
                <Col xs={3}>
                  <div className="stat-item">
                    <div className="stat-number text-primary">{stats.total}</div>
                    <div className="stat-label small text-muted">Total</div>
                  </div>
                </Col>
                <Col xs={3}>
                  <div className="stat-item">
                    <div className="stat-number text-danger">{stats.urgent}</div>
                    <div className="stat-label small text-muted">Urgent</div>
                  </div>
                </Col>
                <Col xs={3}>
                  <div className="stat-item">
                    <div className="stat-number text-warning">{stats.pending}</div>
                    <div className="stat-label small text-muted">Pending</div>
                  </div>
                </Col>
                <Col xs={3}>
                  <div className="stat-item">
                    <div className="stat-number text-success">{stats.aiGenerated}</div>
                    <div className="stat-label small text-muted">AI Generated</div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Filters */}
      <Card className="mb-3">
        <CardBody className="py-3">
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <Input
                  type="text"
                  placeholder="Search by reason or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button color="outline-secondary">
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Input
                type="select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="generated">Generated</option>
                <option value="reviewed">Reviewed</option>
              </Input>
            </Col>
            <Col md={3}>
              <Input
                type="select"
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
              >
                <option value="all">All Urgency</option>
                <option value="urgent">Urgent (4-5)</option>
                <option value="normal">Normal (1-3)</option>
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Triage List */}
      <div className="triage-records">
        {filteredData.length === 0 ? (
          <Card>
            <CardBody className="text-center py-4">
              <FaRobot className="text-muted mb-3" size={48} />
              <h6>No Triage Records Found</h6>
              <p className="text-muted mb-0">
                {triageData.length === 0 
                  ? 'No triage data available yet.'
                  : 'No records match your current filter criteria.'
                }
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredData.map((triage) => (
            <TriageSummary
              key={triage._id}
              triage={triage}
              onClick={handleTriageClick}
              showPatientInfo={userRole === 'doctor'}
              showDoctorInfo={userRole === 'patient'}
            />
          ))
        )}
      </div>

      {/* Detail Modal */}
      <Modal 
        isOpen={detailModal} 
        toggle={() => setDetailModal(false)}
        size="lg"
        className="triage-detail-modal"
      >
        <ModalHeader toggle={() => setDetailModal(false)}>
          Triage Details
          {selectedTriage && (
            <div className="ms-3">
              <Badge color="outline-primary" size="sm">
                <FaCalendarAlt className="me-1" size={10} />
                {new Date(selectedTriage.createdAt).toLocaleDateString()}
              </Badge>
              {selectedTriage.patientId && userRole === 'doctor' && (
                <Badge color="outline-info" size="sm" className="ms-2">
                  <FaUser className="me-1" size={10} />
                  {selectedTriage.patientId.name}
                </Badge>
              )}
              {selectedTriage.doctorId && userRole === 'patient' && (
                <Badge color="outline-success" size="sm" className="ms-2">
                  <FaUserMd className="me-1" size={10} />
                  {selectedTriage.doctorId.name}
                </Badge>
              )}
            </div>
          )}
        </ModalHeader>
        <ModalBody className="p-0">
          {selectedTriage && (
            <TriageDisplay
              appointmentId={selectedTriage.appointmentId._id || selectedTriage.appointmentId}
              userRole={userRole}
              onTriageUpdate={handleTriageUpdate}
            />
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default TriageList;