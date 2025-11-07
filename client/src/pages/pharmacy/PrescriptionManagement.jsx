import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Table, Badge, Button, Modal, Form, 
  Spinner, Alert, InputGroup, Pagination 
} from 'react-bootstrap';
import { 
  FaSearch, FaEye, FaCheck, FaTimes, FaPrescriptionBottle,
  FaExclamationTriangle, FaDollarSign, FaUserMd, FaUser
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
  getPrescriptions, 
  verifyPrescription, 
  dispensePrescription,
  checkDrugInteractions 
} from '../../services/pharmacyService';

const PrescriptionManagement = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'verify', 'dispense'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [verificationData, setVerificationData] = useState({});
  const [dispenseData, setDispenseData] = useState({});
  const [interactionResults, setInteractionResults] = useState(null);
  const [checkingInteractions, setCheckingInteractions] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, [currentPage, statusFilter]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await getPrescriptions(params);
      setPrescriptions(response.prescriptions || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPrescriptions();
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setModalType('view');
    setShowModal(true);
  };

  const handleVerifyPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setVerificationData({
      verificationStatus: 'verified',
      verificationNotes: '',
      dispensedMedications: prescription.prescriptionId?.medications?.map(med => ({
        medicationName: med.name,
        prescribedDosage: med.dosage,
        prescribedFrequency: med.frequency,
        prescribedDuration: med.duration,
        dispensedQuantity: 30, // Default
        daysSupply: 30,
        unitPrice: 0,
        totalPrice: 0,
        counselingProvided: false,
        counselingNotes: ''
      })) || []
    });
    setModalType('verify');
    setShowModal(true);
  };

  const handleDispensePrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setDispenseData({
      paymentInfo: {
        method: 'card',
        amountPaid: prescription.totalAmount || 0
      },
      pickupInfo: {
        isPickedUp: false,
        pickupPerson: {
          name: '',
          relationship: 'self',
          idVerified: false,
          idType: '',
          idNumber: ''
        }
      },
      counselingNotes: '',
      qualityChecks: {
        labelAccuracy: false,
        quantityAccuracy: false,
        expiryDateCheck: false,
        finalReview: false
      }
    });
    setModalType('dispense');
    setShowModal(true);
  };

  const analyzeInteractions = async (medications) => {
    try {
      setCheckingInteractions(true);
      const response = await checkDrugInteractions({
        medications: medications.map(med => ({
          name: med.medicationName || med.name,
          dosage: med.prescribedDosage || med.dosage
        })),
        patientId: selectedPrescription?.patientId?._id
      });
      setInteractionResults(response.data);
    } catch (error) {
      console.error('Error checking interactions:', error);
      toast.error('Failed to check drug interactions');
    } finally {
      setCheckingInteractions(false);
    }
  };

  const submitVerification = async () => {
    try {
      await verifyPrescription(selectedPrescription.prescriptionId._id, verificationData);
      toast.success('Prescription verified successfully');
      setShowModal(false);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error verifying prescription:', error);
      toast.error('Failed to verify prescription');
    }
  };

  const submitDispense = async () => {
    try {
      await dispensePrescription(selectedPrescription._id, dispenseData);
      toast.success('Medication dispensed successfully');
      setShowModal(false);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error dispensing medication:', error);
      toast.error('Failed to dispense medication');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      'in-progress': 'info',
      completed: 'success',
      cancelled: 'danger',
      'on-hold': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="prescription-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Prescription Management</h2>
        <Button variant="outline-primary" onClick={fetchPrescriptions} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Refresh'}
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6}>
              <Form.Label>Search Prescriptions</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline-secondary" onClick={handleSearch}>
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="on-hold">On Hold</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="primary" onClick={handleSearch} className="w-100">
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Prescriptions Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading prescriptions...</div>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-4">
              <FaPrescriptionBottle size={48} className="text-muted mb-3" />
              <h5>No prescriptions found</h5>
              <p className="text-muted">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Medications</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription._id}>
                      <td>
                        <div>
                          <div className="fw-bold">
                            <FaUser className="me-1" />
                            {prescription.patientId?.name || 'Unknown Patient'}
                          </div>
                          <small className="text-muted">{prescription.patientId?.email}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <FaUserMd className="me-1" />
                          {prescription.doctorId?.name || 'Unknown Doctor'}
                        </div>
                      </td>
                      <td>
                        <div>
                          {prescription.dispensedMedications?.length || 0} medication(s)
                          {prescription.dispensedMedications?.slice(0, 2).map((med, index) => (
                            <div key={index} className="small text-muted">
                              {med.medicationName}
                            </div>
                          ))}
                          {prescription.dispensedMedications?.length > 2 && (
                            <small className="text-muted">
                              +{prescription.dispensedMedications.length - 2} more
                            </small>
                          )}
                        </div>
                      </td>
                      <td>{getStatusBadge(prescription.status)}</td>
                      <td>
                        <small>{formatDate(prescription.createdAt)}</small>
                      </td>
                      <td>
                        <div className="fw-bold">
                          <FaDollarSign className="me-1" />
                          ${prescription.totalAmount?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleViewPrescription(prescription)}
                          >
                            <FaEye />
                          </Button>
                          {prescription.status === 'pending' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleVerifyPrescription(prescription)}
                            >
                              <FaCheck />
                            </Button>
                          )}
                          {prescription.status === 'in-progress' && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleDispensePrescription(prescription)}
                            >
                              <FaPrescriptionBottle />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.Prev 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={index + 1 === currentPage}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Prescription Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'view' && 'Prescription Details'}
            {modalType === 'verify' && 'Verify Prescription'}
            {modalType === 'dispense' && 'Dispense Medication'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPrescription && (
            <>
              {/* Patient Information */}
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Patient Information</h6>
                  <p><strong>Name:</strong> {selectedPrescription.patientId?.name}</p>
                  <p><strong>Email:</strong> {selectedPrescription.patientId?.email}</p>
                </Col>
                <Col md={6}>
                  <h6>Prescription Information</h6>
                  <p><strong>Doctor:</strong> {selectedPrescription.doctorId?.name}</p>
                  <p><strong>Date:</strong> {formatDate(selectedPrescription.createdAt)}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedPrescription.status)}</p>
                </Col>
              </Row>

              {/* Medications */}
              <h6>Medications</h6>
              {selectedPrescription.prescriptionId?.medications && (
                <Table size="sm" className="mb-3">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.prescriptionId.medications.map((med, index) => (
                      <tr key={index}>
                        <td>{med.name}</td>
                        <td>{med.dosage}</td>
                        <td>{med.frequency}</td>
                        <td>{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {/* Drug Interaction Check */}
              {(modalType === 'verify' || modalType === 'view') && (
                <div className="mb-3">
                  <Button
                    variant="outline-warning"
                    onClick={() => analyzeInteractions(selectedPrescription.prescriptionId?.medications || [])}
                    disabled={checkingInteractions}
                  >
                    {checkingInteractions ? (
                      <><Spinner animation="border" size="sm" className="me-2" />Checking...</>
                    ) : (
                      <><FaExclamationTriangle className="me-2" />Check Drug Interactions</>
                    )}
                  </Button>

                  {interactionResults && (
                    <Alert variant="info" className="mt-2">
                      <strong>AI Analysis:</strong>
                      <pre className="mt-2 small">{JSON.stringify(interactionResults.analysis, null, 2)}</pre>
                    </Alert>
                  )}
                </div>
              )}

              {/* Verification Form */}
              {modalType === 'verify' && (
                <div>
                  <h6>Verification Details</h6>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Verification Status</Form.Label>
                      <Form.Select
                        value={verificationData.verificationStatus}
                        onChange={(e) => setVerificationData({
                          ...verificationData,
                          verificationStatus: e.target.value
                        })}
                      >
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                        <option value="requires-clarification">Requires Clarification</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Verification Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={verificationData.verificationNotes}
                        onChange={(e) => setVerificationData({
                          ...verificationData,
                          verificationNotes: e.target.value
                        })}
                        placeholder="Enter verification notes..."
                      />
                    </Form.Group>
                  </Form>
                </div>
              )}

              {/* Dispensing Form */}
              {modalType === 'dispense' && (
                <div>
                  <h6>Dispensing Information</h6>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Payment Method</Form.Label>
                          <Form.Select
                            value={dispenseData.paymentInfo?.method}
                            onChange={(e) => setDispenseData({
                              ...dispenseData,
                              paymentInfo: { ...dispenseData.paymentInfo, method: e.target.value }
                            })}
                          >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="insurance">Insurance</option>
                            <option value="partial-insurance">Partial Insurance</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Amount Paid</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={dispenseData.paymentInfo?.amountPaid}
                            onChange={(e) => setDispenseData({
                              ...dispenseData,
                              paymentInfo: { ...dispenseData.paymentInfo, amountPaid: parseFloat(e.target.value) }
                            })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <h6>Quality Checks</h6>
                    <Row>
                      {Object.entries(dispenseData.qualityChecks || {}).map(([key, value]) => (
                        <Col md={6} key={key}>
                          <Form.Check
                            type="checkbox"
                            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            checked={value}
                            onChange={(e) => setDispenseData({
                              ...dispenseData,
                              qualityChecks: { ...dispenseData.qualityChecks, [key]: e.target.checked }
                            })}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Form>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {modalType === 'verify' && (
            <Button variant="success" onClick={submitVerification}>
              <FaCheck className="me-2" />
              Submit Verification
            </Button>
          )}
          {modalType === 'dispense' && (
            <Button variant="primary" onClick={submitDispense}>
              <FaPrescriptionBottle className="me-2" />
              Complete Dispensing
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PrescriptionManagement;