import React, { useState } from 'react';
import { Card, Table, Row, Col, Badge, Form, Button, Tabs, Tab, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaInfoCircle, FaExclamationTriangle, FaArrowUp, FaArrowDown, FaChartLine } from 'react-icons/fa';

const LaboratoryResults = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first
  
  // Sample lab result data
  const labResults = [
    {
      id: 1,
      name: "Complete Blood Count (CBC)",
      date: "2025-03-01T09:30:00Z",
      category: "hematology",
      provider: "City Medical Lab",
      orderedBy: "Dr. Sarah Johnson",
      status: "completed",
      panels: [
        {
          name: "White Blood Cell (WBC) Count",
          value: 7.2,
          unit: "x10^9/L",
          referenceRange: "4.5-11.0",
          status: "normal"
        },
        {
          name: "Red Blood Cell (RBC) Count",
          value: 5.1,
          unit: "x10^12/L",
          referenceRange: "4.5-5.9",
          status: "normal"
        },
        {
          name: "Hemoglobin (Hgb)",
          value: 14.8,
          unit: "g/dL",
          referenceRange: "13.5-17.5",
          status: "normal"
        },
        {
          name: "Hematocrit (Hct)",
          value: 43.2,
          unit: "%",
          referenceRange: "41.0-53.0",
          status: "normal"
        },
        {
          name: "Platelet Count",
          value: 250,
          unit: "x10^9/L",
          referenceRange: "150-450",
          status: "normal"
        }
      ]
    },
    {
      id: 2,
      name: "Comprehensive Metabolic Panel (CMP)",
      date: "2025-03-01T09:30:00Z",
      category: "chemistry",
      provider: "City Medical Lab",
      orderedBy: "Dr. Sarah Johnson",
      status: "completed",
      panels: [
        {
          name: "Glucose",
          value: 135,
          unit: "mg/dL",
          referenceRange: "70-99",
          status: "high",
          trending: "down"
        },
        {
          name: "BUN (Blood Urea Nitrogen)",
          value: 15,
          unit: "mg/dL",
          referenceRange: "7-20",
          status: "normal"
        },
        {
          name: "Creatinine",
          value: 0.9,
          unit: "mg/dL",
          referenceRange: "0.7-1.3",
          status: "normal"
        },
        {
          name: "Sodium",
          value: 140,
          unit: "mmol/L",
          referenceRange: "135-145",
          status: "normal"
        },
        {
          name: "Potassium",
          value: 4.5,
          unit: "mmol/L",
          referenceRange: "3.5-5.0",
          status: "normal"
        },
        {
          name: "ALT (Alanine Aminotransferase)",
          value: 30,
          unit: "U/L",
          referenceRange: "7-56",
          status: "normal"
        },
        {
          name: "AST (Aspartate Aminotransferase)",
          value: 25,
          unit: "U/L",
          referenceRange: "8-48",
          status: "normal"
        },
      ]
    },
    {
      id: 3,
      name: "Lipid Panel",
      date: "2025-02-15T10:15:00Z",
      category: "chemistry",
      provider: "City Medical Lab",
      orderedBy: "Dr. Sarah Johnson",
      status: "completed",
      panels: [
        {
          name: "Total Cholesterol",
          value: 195,
          unit: "mg/dL",
          referenceRange: "<200",
          status: "normal",
          trending: "down"
        },
        {
          name: "Triglycerides",
          value: 140,
          unit: "mg/dL",
          referenceRange: "<150",
          status: "normal",
          trending: "down"
        },
        {
          name: "HDL Cholesterol",
          value: 48,
          unit: "mg/dL",
          referenceRange: ">40",
          status: "normal"
        },
        {
          name: "LDL Cholesterol",
          value: 120,
          unit: "mg/dL",
          referenceRange: "<100",
          status: "high",
          trending: "down"
        },
      ]
    },
    {
      id: 4,
      name: "Hemoglobin A1C",
      date: "2025-02-15T10:15:00Z",
      category: "diabetes",
      provider: "City Medical Lab",
      orderedBy: "Dr. Sarah Johnson",
      status: "completed",
      panels: [
        {
          name: "Hemoglobin A1C",
          value: 6.8,
          unit: "%",
          referenceRange: "<5.7",
          status: "high",
          trending: "down",
          history: [
            { date: "2024-08-15", value: 7.2 },
            { date: "2024-11-20", value: 7.0 },
            { date: "2025-02-15", value: 6.8 }
          ]
        }
      ]
    },
    {
      id: 5,
      name: "Thyroid Panel",
      date: "2024-11-10T14:20:00Z",
      category: "endocrine",
      provider: "City Medical Lab",
      orderedBy: "Dr. Sarah Johnson",
      status: "completed",
      panels: [
        {
          name: "TSH",
          value: 2.5,
          unit: "mIU/L",
          referenceRange: "0.4-4.0",
          status: "normal"
        },
        {
          name: "Free T4",
          value: 1.2,
          unit: "ng/dL",
          referenceRange: "0.8-1.8",
          status: "normal"
        }
      ]
    }
  ];
  
  // Categories of lab results
  const categories = [
    { id: "all", name: "All Results" },
    { id: "hematology", name: "Hematology" },
    { id: "chemistry", name: "Chemistry" },
    { id: "diabetes", name: "Diabetes" },
    { id: "endocrine", name: "Endocrine" },
    { id: "urine", name: "Urinalysis" },
    { id: "microbiology", name: "Microbiology" },
    { id: "other", name: "Other" }
  ];
  
  // Filter results based on category and search term
  const filteredResults = labResults.filter(result => {
    const matchesCategory = activeCategory === 'all' || result.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.panels.some(panel => panel.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  
  // Sort results by date
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortOrder === 'desc') {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });
  
  // Helper function to render status indicator
  const renderStatusIndicator = (status, trending) => {
    let badge;
    
    switch(status) {
      case 'high':
        badge = (
          <Badge bg="danger" className="d-flex align-items-center">
            High {trending === 'down' && <FaArrowDown className="ms-1" />}
          </Badge>
        );
        break;
      case 'low':
        badge = (
          <Badge bg="warning" className="d-flex align-items-center">
            Low {trending === 'up' && <FaArrowUp className="ms-1" />}
          </Badge>
        );
        break;
      case 'normal':
      default:
        badge = <Badge bg="success">Normal</Badge>;
    }
    
    return badge;
  };
  
  // Render a lab result detail
  const renderLabDetail = (result) => {
    return (
      <Card key={result.id} className="mb-4 lab-result-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">{result.name}</h5>
            <div className="text-muted">
              <small>
                {new Date(result.date).toLocaleString()} • Ordered by: {result.orderedBy}
              </small>
            </div>
          </div>
          <div>
            <Button variant="outline-primary" size="sm" className="me-2">
              <FaChartLine className="me-1" /> Trend
            </Button>
            <Button variant="outline-secondary" size="sm">
              Download PDF
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Table responsive className="lab-results-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Result</th>
                <th>Reference Range</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {result.panels.map((panel, i) => (
                <tr key={i} className={panel.status !== 'normal' ? 'table-warning' : ''}>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-${result.id}-${i}`}>
                          Click for detailed information about this test
                        </Tooltip>
                      }
                    >
                      <span className="medical-term">{panel.name}</span>
                    </OverlayTrigger>
                  </td>
                  <td>
                    <strong>{panel.value}</strong> {panel.unit}
                    {panel.trending && (
                      <Badge 
                        bg="light" 
                        text="dark" 
                        className="ms-2"
                      >
                        {panel.trending === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                      </Badge>
                    )}
                  </td>
                  <td>{panel.referenceRange}</td>
                  <td>{renderStatusIndicator(panel.status, panel.trending)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {result.panels.some(panel => panel.status === 'high' || panel.status === 'low') && (
            <div className="abnormal-result-explanation mt-3">
              <div className="d-flex align-items-start">
                <FaExclamationTriangle className="me-2 text-warning mt-1" />
                <div>
                  <h6>Abnormal Results Explained:</h6>
                  <p className="mb-0">
                    {result.name === "Comprehensive Metabolic Panel (CMP)" && (
                      <>Your glucose level is above the normal range, which is consistent with your diabetes diagnosis. It has improved from your last reading.</>
                    )}
                    {result.name === "Lipid Panel" && (
                      <>Your LDL cholesterol remains above the target range for someone with diabetes. However, it has improved from previous readings.</>
                    )}
                    {result.name === "Hemoglobin A1C" && (
                      <>Your A1C level indicates your diabetes is reasonably controlled but still above target. The downward trend shows improvement over the last 6 months.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {result.panels.some(panel => panel.history) && (
            <div className="mt-4">
              <h6>Historical Trend</h6>
              {result.panels.filter(panel => panel.history).map((panel, idx) => (
                <div key={idx} className="trend-mini-chart">
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <small>Last 3 readings of {panel.name}</small>
                    <small>Target: {panel.referenceRange}</small>
                  </div>
                  <div className="trend-bars">
                    {panel.history.map((point, i) => (
                      <div key={i} className="trend-bar-container">
                        <div 
                          className={`trend-bar ${point.value > parseFloat(panel.referenceRange.replace('<', '')) ? 'trend-bar-high' : 'trend-bar-normal'}`}
                          style={{ height: `${(point.value / 10) * 100}px` }}
                        >
                          <span className="trend-value">{point.value}</span>
                        </div>
                        <div className="trend-date">{new Date(point.date).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
        <Card.Footer>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Provider: {result.provider}</span>
            {showAIInsights && (
              <Button variant="link" className="p-0">
                <FaInfoCircle className="me-1" /> View AI Analysis
              </Button>
            )}
          </div>
        </Card.Footer>
      </Card>
    );
  };
  
  // State for AI insights toggle
  const [showAIInsights, setShowAIInsights] = useState(true);
  
  return (
    <div className="laboratory-results-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Laboratory Results</h4>
        <Form.Check
          type="switch"
          id="ai-insights-switch"
          label="Show AI Insights"
          checked={showAIInsights}
          onChange={() => setShowAIInsights(!showAIInsights)}
        />
      </div>
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Search Results</Form.Label>
                <Form.Control 
                  type="text"
                  placeholder="Search by test name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Filter by Category</Form.Label>
                <Form.Select 
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Sort Order</Form.Label>
                <Form.Select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {showAIInsights && (
        <Card className="ai-insight mb-4">
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <FaInfoCircle size={20} className="me-2 text-primary" />
              <h5 className="mb-0">AI Analysis of Your Lab Trends</h5>
            </div>
            <p>
              Your lab results show positive progress in your diabetes management. Your A1C has reduced from 7.2% to 6.8% over the past 6 months, indicating improved glycemic control. Your lipid panel shows improvements in total cholesterol and triglycerides, though your LDL remains above the target range for someone with diabetes.
            </p>
            <p className="mb-0">
              <strong>Recommendations:</strong> Continue current diabetes management. Consider discussing with your doctor about strategies to further reduce LDL cholesterol.
            </p>
          </Card.Body>
        </Card>
      )}
      
      {sortedResults.length === 0 ? (
        <Alert variant="info">No laboratory results match your search criteria.</Alert>
      ) : (
        <>
          <div className="results-count mb-3">
            <Badge bg="primary">{sortedResults.length}</Badge> {sortedResults.length === 1 ? 'result' : 'results'} found
          </div>
          {sortedResults.map(result => renderLabDetail(result))}
        </>
      )}
      
      <div className="mt-4 d-flex justify-content-between">
        <Button variant="outline-primary">
          Request New Lab Tests
        </Button>
        <Button variant="outline-secondary">
          Import External Lab Results
        </Button>
      </div>
    </div>
  );
};

export default LaboratoryResults;
