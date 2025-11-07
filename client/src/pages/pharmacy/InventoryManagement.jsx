import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Table, Badge, Button, Modal, Form, 
  Spinner, Alert, InputGroup, Pagination, ProgressBar 
} from 'react-bootstrap';
import { 
  FaSearch, FaPlus, FaEdit, FaExclamationTriangle, FaPills,
  FaCalendarAlt, FaBox, FaChartLine, FaRobot
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
  getMedicationInventory, 
  addMedicationToInventory, 
  updateMedicationInventory,
  getAIInventoryOptimization 
} from '../../services/pharmacyService';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'ai-optimize'
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({});
  const [aiOptimization, setAiOptimization] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const categories = ['prescription', 'otc', 'controlled', 'refrigerated', 'specialty'];
  const stockStatuses = ['in-stock', 'low-stock', 'out-of-stock', 'overstock'];

  useEffect(() => {
    fetchInventory();
  }, [currentPage, categoryFilter, stockFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(categoryFilter && { category: categoryFilter }),
        ...(stockFilter && { stockStatus: stockFilter }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await getMedicationInventory(params);
      setInventory(response.inventory || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInventory();
  };

  const handleAddMedication = () => {
    setFormData({
      medicationName: '',
      genericName: '',
      brandName: '',
      manufacturer: '',
      ndc: '',
      dosageForm: 'tablet',
      strength: '',
      batchNumber: '',
      expiryDate: '',
      manufacturingDate: '',
      currentStock: 0,
      minimumStock: 10,
      maximumStock: 100,
      unitPrice: 0,
      costPrice: 0,
      category: 'prescription',
      storageConditions: {
        temperature: { min: 15, max: 25, unit: 'celsius' },
        humidity: { min: 30, max: 60 },
        lightCondition: 'normal'
      }
    });
    setModalType('add');
    setSelectedMedication(null);
    setShowModal(true);
  };

  const handleEditMedication = (medication) => {
    setFormData(medication);
    setSelectedMedication(medication);
    setModalType('edit');
    setShowModal(true);
  };

  const handleAIOptimization = async () => {
    try {
      setLoadingAI(true);
      const response = await getAIInventoryOptimization({
        timeframe: 30,
        includeSeasonalFactors: true
      });
      setAiOptimization(response.data);
      setModalType('ai-optimize');
      setShowModal(true);
    } catch (error) {
      console.error('Error getting AI optimization:', error);
      toast.error('Failed to get AI optimization recommendations');
    } finally {
      setLoadingAI(false);
    }
  };

  const submitForm = async () => {
    try {
      if (modalType === 'add') {
        await addMedicationToInventory(formData);
        toast.success('Medication added to inventory successfully');
      } else if (modalType === 'edit') {
        await updateMedicationInventory(selectedMedication._id, formData);
        toast.success('Medication updated successfully');
      }
      setShowModal(false);
      fetchInventory();
    } catch (error) {
      console.error('Error saving medication:', error);
      toast.error('Failed to save medication');
    }
  };

  const getStockBadge = (stockStatus) => {
    const variants = {
      'in-stock': 'success',
      'low-stock': 'warning',
      'out-of-stock': 'danger',
      'overstock': 'info'
    };
    return <Badge bg={variants[stockStatus] || 'secondary'}>{stockStatus}</Badge>;
  };

  const getExpiryBadge = (expiryStatus) => {
    const variants = {
      'valid': 'success',
      'expiring-warning': 'warning',
      'expiring-soon': 'danger',
      'expired': 'dark'
    };
    return <Badge bg={variants[expiryStatus] || 'secondary'}>{expiryStatus}</Badge>;
  };

  const getStockPercentage = (current, max) => {
    return Math.min((current / max) * 100, 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="inventory-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Medication Inventory</h2>
        <div>
          <Button 
            variant="outline-info" 
            className="me-2"
            onClick={handleAIOptimization}
            disabled={loadingAI}
          >
            {loadingAI ? (
              <><Spinner animation="border" size="sm" className="me-2" />Analyzing...</>
            ) : (
              <><FaRobot className="me-2" />AI Optimization</>
            )}
          </Button>
          <Button variant="primary" onClick={handleAddMedication}>
            <FaPlus className="me-2" />Add Medication
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Label>Search Medications</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by name, NDC, or batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline-secondary" onClick={handleSearch}>
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label>Category</Form.Label>
              <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Stock Status</Form.Label>
              <Form.Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                <option value="">All Stock Levels</option>
                {stockStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
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

      {/* Inventory Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading inventory...</div>
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-4">
              <FaPills size={48} className="text-muted mb-3" />
              <h5>No medications found</h5>
              <p className="text-muted">Try adjusting your search criteria or add new medications</p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>NDC</th>
                    <th>Stock Level</th>
                    <th>Stock Status</th>
                    <th>Expiry</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((medication) => (
                    <tr key={medication._id}>
                      <td>
                        <div>
                          <div className="fw-bold">{medication.medicationName}</div>
                          <small className="text-muted">
                            {medication.strength} • {medication.dosageForm}
                          </small>
                          {medication.genericName && (
                            <div className="small text-muted">Generic: {medication.genericName}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <code>{medication.ndc}</code>
                        {medication.batchNumber && (
                          <div className="small text-muted">Batch: {medication.batchNumber}</div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            <div className="fw-bold">{medication.currentStock}</div>
                            <small className="text-muted">
                              Min: {medication.minimumStock} Max: {medication.maximumStock}
                            </small>
                          </div>
                          <div style={{ width: '60px' }}>
                            <ProgressBar
                              now={getStockPercentage(medication.currentStock, medication.maximumStock)}
                              variant={
                                medication.currentStock <= medication.minimumStock ? 'danger' :
                                medication.currentStock >= medication.maximumStock ? 'warning' : 'success'
                              }
                              size="sm"
                            />
                          </div>
                        </div>
                      </td>
                      <td>{getStockBadge(medication.stockStatus)}</td>
                      <td>
                        <div>
                          <div>{formatDate(medication.expiryDate)}</div>
                          <div>{getExpiryBadge(medication.expiryStatus)}</div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="secondary">{medication.category}</Badge>
                        {medication.controlledSubstance?.schedule && (
                          <div className="mt-1">
                            <Badge bg="danger" size="sm">
                              Schedule {medication.controlledSubstance.schedule}
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-bold">{formatCurrency(medication.unitPrice)}</div>
                        <small className="text-muted">
                          Cost: {formatCurrency(medication.costPrice)}
                        </small>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditMedication(medication)}
                        >
                          <FaEdit />
                        </Button>
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

      {/* Add/Edit Medication Modal */}
      <Modal show={showModal && (modalType === 'add' || modalType === 'edit')} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'add' ? 'Add New Medication' : 'Edit Medication'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Medication Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.medicationName || ''}
                    onChange={(e) => setFormData({...formData, medicationName: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Generic Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.genericName || ''}
                    onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.brandName || ''}
                    onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Manufacturer *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.manufacturer || ''}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>NDC *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.ndc || ''}
                    onChange={(e) => setFormData({...formData, ndc: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Dosage Form *</Form.Label>
                  <Form.Select
                    value={formData.dosageForm || 'tablet'}
                    onChange={(e) => setFormData({...formData, dosageForm: e.target.value})}
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="liquid">Liquid</option>
                    <option value="injection">Injection</option>
                    <option value="cream">Cream</option>
                    <option value="ointment">Ointment</option>
                    <option value="drops">Drops</option>
                    <option value="inhaler">Inhaler</option>
                    <option value="patch">Patch</option>
                    <option value="suppository">Suppository</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Strength *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.strength || ''}
                    onChange={(e) => setFormData({...formData, strength: e.target.value})}
                    placeholder="e.g., 500mg"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Batch Number *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.batchNumber || ''}
                    onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={formData.category || 'prescription'}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Manufacturing Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.manufacturingDate ? formData.manufacturingDate.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, manufacturingDate: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.currentStock || 0}
                    onChange={(e) => setFormData({...formData, currentStock: parseInt(e.target.value)})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.minimumStock || 10}
                    onChange={(e) => setFormData({...formData, minimumStock: parseInt(e.target.value)})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Maximum Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.maximumStock || 100}
                    onChange={(e) => setFormData({...formData, maximumStock: parseInt(e.target.value)})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit Price *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitPrice || 0}
                    onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value)})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cost Price *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value)})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitForm}>
            {modalType === 'add' ? 'Add Medication' : 'Update Medication'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* AI Optimization Modal */}
      <Modal show={showModal && modalType === 'ai-optimize'} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaRobot className="me-2" />
            AI Inventory Optimization
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {aiOptimization && (
            <div>
              <Alert variant="info">
                <strong>AI Analysis Complete</strong>
                <p className="mb-0">Based on your inventory data and sales patterns, here are our recommendations:</p>
              </Alert>

              {aiOptimization.current_inventory_stats && (
                <Card className="mb-3">
                  <Card.Header>Current Inventory Overview</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <div className="text-center">
                          <div className="h4">{aiOptimization.current_inventory_stats.total_items}</div>
                          <small className="text-muted">Total Items</small>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center">
                          <div className="h4">{aiOptimization.current_inventory_stats.low_stock_items}</div>
                          <small className="text-muted">Low Stock</small>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center">
                          <div className="h4">{aiOptimization.current_inventory_stats.expiring_items}</div>
                          <small className="text-muted">Expiring Soon</small>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="text-center">
                          <div className="h4">{formatCurrency(aiOptimization.current_inventory_stats.total_value)}</div>
                          <small className="text-muted">Total Value</small>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <div className="mb-3">
                <h6>AI Recommendations:</h6>
                <div className="bg-light p-3 rounded">
                  <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
                    {aiOptimization.optimization_recommendations}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InventoryManagement;