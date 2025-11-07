import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Form, Spinner, Table, Badge,
  Nav, Tab, Alert, ProgressBar
} from 'react-bootstrap';
import { 
  FaChartLine, FaDownload, FaCalendarAlt, FaPills, 
  FaDollarSign, FaUsers, FaFileAlt, FaChartBar,
  FaChartPie, FaArrowUp, FaArrowDown, FaMinus,
  FaExclamationTriangle, FaBox, FaCheckCircle, 
  FaClock, FaLock
} from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { toast } from 'react-toastify';
import { 
  getPharmacyReports, 
  getSalesAnalytics,
  getInventoryAnalytics,
  getPrescriptionAnalytics,
  getComplianceReports,
  exportReport
} from '../../services/pharmacyService';

const PharmacyReports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('summary');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  useEffect(() => {
    loadReportData();
  }, [activeTab, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      let response;

      switch (activeTab) {
        case 'sales':
          response = await getSalesAnalytics(dateRange);
          break;
        case 'inventory':
          response = await getInventoryAnalytics(dateRange);
          break;
        case 'prescriptions':
          response = await getPrescriptionAnalytics(dateRange);
          break;
        case 'compliance':
          response = await getComplianceReports(dateRange);
          break;
        default:
          response = await getPharmacyReports({ ...dateRange, reportType });
      }

      setReportData(response.data);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format = 'pdf') => {
    try {
      const response = await exportReport({
        type: activeTab,
        format,
        dateRange,
        data: reportData
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pharmacy-${activeTab}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <FaArrowUp className="text-success" />;
    if (trend < 0) return <FaArrowDown className="text-danger" />;
    return <FaMinus className="text-muted" />;
  };

  const renderSalesReport = () => {
    if (!reportData) return null;

    return (
      <div>
        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-primary">
              <Card.Body className="text-center">
                <FaDollarSign size={32} className="text-primary mb-2" />
                <h4>{formatCurrency(reportData.totalRevenue)}</h4>
                <p className="mb-1">Total Revenue</p>
                <div className="d-flex align-items-center justify-content-center">
                  {getTrendIcon(reportData.revenueTrend)}
                  <small className="ms-1">{Math.abs(reportData.revenueTrend || 0)}%</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-success">
              <Card.Body className="text-center">
                <FaFileAlt size={32} className="text-success mb-2" />
                <h4>{formatNumber(reportData.totalTransactions)}</h4>
                <p className="mb-1">Transactions</p>
                <div className="d-flex align-items-center justify-content-center">
                  {getTrendIcon(reportData.transactionTrend)}
                  <small className="ms-1">{Math.abs(reportData.transactionTrend || 0)}%</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-info">
              <Card.Body className="text-center">
                <FaChartLine size={32} className="text-info mb-2" />
                <h4>{formatCurrency(reportData.averageOrderValue)}</h4>
                <p className="mb-1">Avg. Order Value</p>
                <div className="d-flex align-items-center justify-content-center">
                  {getTrendIcon(reportData.aovTrend)}
                  <small className="ms-1">{Math.abs(reportData.aovTrend || 0)}%</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-warning">
              <Card.Body className="text-center">
                <FaPills size={32} className="text-warning mb-2" />
                <h4>{formatNumber(reportData.totalItems)}</h4>
                <p className="mb-1">Items Sold</p>
                <div className="d-flex align-items-center justify-content-center">
                  {getTrendIcon(reportData.itemsTrend)}
                  <small className="ms-1">{Math.abs(reportData.itemsTrend || 0)}%</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row className="mb-4">
          <Col md={8}>
            <Card>
              <Card.Header>Daily Sales Trend</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.dailySales || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="transactions" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Header>Sales by Category</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.salesByCategory || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(reportData.salesByCategory || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Top Products */}
        <Card>
          <Card.Header>Top Selling Products</Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                  <th>Profit Margin</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {(reportData.topProducts || []).map((product, index) => (
                  <tr key={index}>
                    <td>
                      <div className="fw-bold">{product.name}</div>
                      <small className="text-muted">{product.category}</small>
                    </td>
                    <td>{formatNumber(product.unitsSold)}</td>
                    <td>{formatCurrency(product.revenue)}</td>
                    <td>
                      <ProgressBar 
                        now={product.profitMargin} 
                        label={`${product.profitMargin}%`}
                        variant={product.profitMargin > 30 ? 'success' : product.profitMargin > 15 ? 'info' : 'warning'}
                      />
                    </td>
                    <td>{getTrendIcon(product.trend)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!reportData) return null;

    return (
      <div>
        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-primary">
              <Card.Body className="text-center">
                <FaBox size={32} className="text-primary mb-2" />
                <h4>{formatNumber(reportData.totalItems)}</h4>
                <p className="mb-1">Total Items</p>
                <small className="text-muted">{reportData.uniqueProducts} unique products</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-success">
              <Card.Body className="text-center">
                <FaDollarSign size={32} className="text-success mb-2" />
                <h4>{formatCurrency(reportData.totalValue)}</h4>
                <p className="mb-1">Inventory Value</p>
                <small className="text-muted">At cost price</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-warning">
              <Card.Body className="text-center">
                <FaExclamationTriangle size={32} className="text-warning mb-2" />
                <h4>{formatNumber(reportData.lowStockItems)}</h4>
                <p className="mb-1">Low Stock</p>
                <small className="text-muted">Need reordering</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-danger">
              <Card.Body className="text-center">
                <FaCalendarAlt size={32} className="text-danger mb-2" />
                <h4>{formatNumber(reportData.expiringItems)}</h4>
                <p className="mb-1">Expiring Soon</p>
                <small className="text-muted">Next 90 days</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row className="mb-4">
          <Col md={8}>
            <Card>
              <Card.Header>Inventory Turnover by Category</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.turnoverByCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="turnoverRate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Header>Stock Status Distribution</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.stockDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(reportData.stockDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Critical Items */}
        <Row>
          <Col md={6}>
            <Card>
              <Card.Header>Low Stock Items</Card.Header>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Current Stock</th>
                      <th>Min Level</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.lowStockDetails || []).slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-bold">{item.name}</div>
                          <small className="text-muted">{item.ndc}</small>
                        </td>
                        <td>
                          <Badge bg="warning">{item.currentStock}</Badge>
                        </td>
                        <td>{item.minimumStock}</td>
                        <td>
                          <Badge bg="danger">Reorder</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>Expiring Items</Card.Header>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Expiry Date</th>
                      <th>Stock</th>
                      <th>Days Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.expiringDetails || []).slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-bold">{item.name}</div>
                          <small className="text-muted">Batch: {item.batchNumber}</small>
                        </td>
                        <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                        <td>{item.stock}</td>
                        <td>
                          <Badge bg={item.daysLeft <= 30 ? 'danger' : item.daysLeft <= 90 ? 'warning' : 'info'}>
                            {item.daysLeft} days
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderPrescriptionReport = () => {
    if (!reportData) return null;

    return (
      <div>
        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-primary">
              <Card.Body className="text-center">
                <FaFileAlt size={32} className="text-primary mb-2" />
                <h4>{formatNumber(reportData.totalPrescriptions)}</h4>
                <p className="mb-1">Total Prescriptions</p>
                <div className="d-flex align-items-center justify-content-center">
                  {getTrendIcon(reportData.prescriptionTrend)}
                  <small className="ms-1">{Math.abs(reportData.prescriptionTrend || 0)}%</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-success">
              <Card.Body className="text-center">
                <FaCheckCircle size={32} className="text-success mb-2" />
                <h4>{formatNumber(reportData.dispensedPrescriptions)}</h4>
                <p className="mb-1">Dispensed</p>
                <small className="text-muted">{((reportData.dispensedPrescriptions / reportData.totalPrescriptions) * 100).toFixed(1)}% rate</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-warning">
              <Card.Body className="text-center">
                <FaClock size={32} className="text-warning mb-2" />
                <h4>{reportData.averageWaitTime}</h4>
                <p className="mb-1">Avg. Wait Time</p>
                <small className="text-muted">minutes</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-info">
              <Card.Body className="text-center">
                <FaUsers size={32} className="text-info mb-2" />
                <h4>{formatNumber(reportData.uniquePatients)}</h4>
                <p className="mb-1">Unique Patients</p>
                <small className="text-muted">served</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row className="mb-4">
          <Col md={8}>
            <Card>
              <Card.Header>Daily Prescription Volume</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.dailyPrescriptions || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="received" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="dispensed" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Header>Prescription Types</Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.prescriptionTypes || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(reportData.prescriptionTypes || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Performance Metrics */}
        <Row>
          <Col md={6}>
            <Card>
              <Card.Header>Top Prescribed Medications</Card.Header>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Prescriptions</th>
                      <th>Unique Patients</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.topMedications || []).map((med, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-bold">{med.name}</div>
                          <small className="text-muted">{med.strength}</small>
                        </td>
                        <td>{formatNumber(med.prescriptionCount)}</td>
                        <td>{formatNumber(med.uniquePatients)}</td>
                        <td>{getTrendIcon(med.trend)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>Processing Performance</Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Same Day Dispensing</span>
                    <span>{reportData.sameDayRate}%</span>
                  </div>
                  <ProgressBar now={reportData.sameDayRate} variant="success" />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Next Day Dispensing</span>
                    <span>{reportData.nextDayRate}%</span>
                  </div>
                  <ProgressBar now={reportData.nextDayRate} variant="info" />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Patient Satisfaction</span>
                    <span>{reportData.satisfactionRate}%</span>
                  </div>
                  <ProgressBar now={reportData.satisfactionRate} variant="primary" />
                </div>

                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Error Rate</span>
                    <span>{reportData.errorRate}%</span>
                  </div>
                  <ProgressBar now={reportData.errorRate} variant="danger" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderComplianceReport = () => {
    if (!reportData) return null;

    return (
      <div>
        <Row className="mb-4">
          <Col md={12}>
            <Alert variant="info">
              <h6>Regulatory Compliance Overview</h6>
              <p className="mb-0">
                This report provides an overview of your pharmacy's compliance with regulatory requirements
                including controlled substance tracking, prescription monitoring, and quality assurance.
              </p>
            </Alert>
          </Col>
        </Row>

        {/* Compliance Metrics */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-success">
              <Card.Body className="text-center">
                <FaLock size={32} className="text-success mb-2" />
                <h4>{reportData.complianceScore}%</h4>
                <p className="mb-1">Compliance Score</p>
                <Badge bg="success">Excellent</Badge>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-warning">
              <Card.Body className="text-center">
                <FaExclamationTriangle size={32} className="text-warning mb-2" />
                <h4>{formatNumber(reportData.controlledSubstances)}</h4>
                <p className="mb-1">Controlled Substances</p>
                <small className="text-muted">Tracked items</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-info">
              <Card.Body className="text-center">
                <FaFileAlt size={32} className="text-info mb-2" />
                <h4>{formatNumber(reportData.auditTrails)}</h4>
                <p className="mb-1">Audit Trails</p>
                <small className="text-muted">Complete records</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-primary">
              <Card.Body className="text-center">
                <FaClock size={32} className="text-primary mb-2" />
                <h4>{reportData.reportingDelay}</h4>
                <p className="mb-1">Avg. Reporting</p>
                <small className="text-muted">hours delay</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Detailed Compliance Areas */}
        <Row>
          <Col md={6}>
            <Card>
              <Card.Header>Compliance Areas</Card.Header>
              <Card.Body>
                {(reportData.complianceAreas || []).map((area, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>{area.name}</span>
                      <span>{area.score}%</span>
                    </div>
                    <ProgressBar 
                      now={area.score} 
                      variant={area.score >= 95 ? 'success' : area.score >= 85 ? 'info' : 'warning'}
                    />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>Recent Compliance Issues</Card.Header>
              <Card.Body>
                {reportData.complianceIssues && reportData.complianceIssues.length > 0 ? (
                  reportData.complianceIssues.map((issue, index) => (
                    <Alert key={index} variant={issue.severity === 'high' ? 'danger' : 'warning'}>
                      <div className="fw-bold">{issue.title}</div>
                      <div>{issue.description}</div>
                      <small className="text-muted">{new Date(issue.date).toLocaleDateString()}</small>
                    </Alert>
                  ))
                ) : (
                  <Alert variant="success">No compliance issues detected</Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="pharmacy-reports">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaChartLine className="me-2" />
          Reports & Analytics
        </h2>
        <div>
          <Button 
            variant="outline-success" 
            className="me-2"
            onClick={() => handleExportReport('excel')}
            disabled={loading || !reportData}
          >
            <FaDownload className="me-2" />
            Excel
          </Button>
          <Button 
            variant="outline-primary"
            onClick={() => handleExportReport('pdf')}
            disabled={loading || !reportData}
          >
            <FaDownload className="me-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Date Range Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </Col>
            <Col md={3}>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Report Type</Form.Label>
              <Form.Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="comparative">Comparative</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button variant="primary" onClick={loadReportData} className="w-100">
                <FaChartLine className="me-2" />
                Update Report
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Report Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="sales">
              <FaDollarSign className="me-2" />
              Sales Analytics
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="inventory">
              <FaBox className="me-2" />
              Inventory Analytics
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="prescriptions">
              <FaPills className="me-2" />
              Prescription Analytics
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="compliance">
              <FaLock className="me-2" />
              Compliance Reports
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {loading ? (
            <Card>
              <Card.Body className="text-center py-5">
                <Spinner animation="border" className="mb-3" />
                <div>Loading report data...</div>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Tab.Pane eventKey="sales">{renderSalesReport()}</Tab.Pane>
              <Tab.Pane eventKey="inventory">{renderInventoryReport()}</Tab.Pane>
              <Tab.Pane eventKey="prescriptions">{renderPrescriptionReport()}</Tab.Pane>
              <Tab.Pane eventKey="compliance">{renderComplianceReport()}</Tab.Pane>
            </>
          )}
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default PharmacyReports;