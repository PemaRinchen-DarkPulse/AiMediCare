import React from 'react';
import { Card, Row, Col, Button, ListGroup, Badge, ProgressBar, Spinner } from 'react-bootstrap';
import { 
  FaHeartbeat, FaWeight, FaRulerVertical, FaFlask, FaCalendarCheck, 
  FaExclamationTriangle, FaInfoCircle, FaArrowUp, FaArrowDown
} from 'react-icons/fa';

const HealthSummaryDashboard = ({ 
  userData, 
  isLoading, 
  showAIInsights,
  toggleAIInsights,
  currentDateTime 
}) => {
  // Example health metrics for Pema-Rinchen
  const healthMetrics = {
    height: "175 cm",
    weight: "78 kg",
    bmi: "25.5",
    bloodPressure: "128/82 mmHg",
    heartRate: "72 bpm",
    bloodGlucose: "135 mg/dL",
    cholesterolTotal: "195 mg/dL",
    cholesterolHDL: "48 mg/dL",
    cholesterolLDL: "120 mg/dL",
    a1c: "6.8%"
  };
  
  // AI-identified health concerns
  const healthConcerns = [
    {
      condition: "Type 2 Diabetes",
      status: "Managing",
      lastChecked: "2025-02-15",
      trend: "stable",
      details: "A1C levels stable at 6.8%. Continue current management plan."
    },
    {
      condition: "Hypertension",
      status: "Monitoring",
      lastChecked: "2025-03-01",
      trend: "improving",
      details: "Blood pressure trending down. Continue medication and lifestyle changes."
    },
    {
      condition: "Hypercholesterolemia",
      status: "Managing",
      lastChecked: "2025-01-20",
      trend: "improving",
      details: "Cholesterol levels improving. Current LDL level approaching target range."
    }
  ];
  
  // Upcoming preventive care recommendations
  const preventiveCare = [
    {
      service: "Annual Physical",
      dueDate: "2025-05-10",
      status: "Scheduled",
      recommendedBy: "Primary Care",
    },
    {
      service: "Eye Examination",
      dueDate: "2025-04-15",
      status: "Due Soon",
      recommendedBy: "Preventive Care Guidelines",
    },
    {
      service: "Colonoscopy",
      dueDate: "2025-09-22",
      status: "Planning",
      recommendedBy: "Age-based Screening",
    },
    {
      service: "Influenza Vaccine",
      dueDate: "2025-10-01",
      status: "Future Due Date",
      recommendedBy: "Annual Recommendation",
    }
  ];
  
  // Most recent updates (used to show latest information)
  const recentUpdates = [
    {
      type: "Lab Result",
      date: "2025-03-01",
      description: "Complete Blood Count - Normal",
      provider: "City Medical Lab"
    },
    {
      type: "Medication Change",
      date: "2025-02-28",
      description: "Metformin dose adjusted to 1000mg",
      provider: "Dr. Sarah Johnson"
    },
    {
      type: "Office Visit",
      date: "2025-02-15",
      description: "Follow-up for diabetes management",
      provider: "Dr. Sarah Johnson"
    }
  ];

  // Health score calculation (example of how an AI might evaluate overall health)
  const healthScore = {
    current: 78,
    previous: 72,
    maxScore: 100,
    change: 6,
    factors: [
      { name: "Diabetes Management", score: 75, maxScore: 100 },
      { name: "Blood Pressure Control", score: 80, maxScore: 100 },
      { name: "Physical Activity", score: 65, maxScore: 100 },
      { name: "Nutrition", score: 70, maxScore: 100 },
      { name: "Preventive Care Compliance", score: 90, maxScore: 100 }
    ]
  };
  
  // Calculate days since various health events
  const calculateDaysSince = (dateString) => {
    const eventDate = new Date(dateString);
    const diffTime = currentDateTime - eventDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Render trend indicators
  const renderTrend = (trend) => {
    switch(trend) {
      case "improving":
        return <Badge bg="success"><FaArrowUp /> Improving</Badge>;
      case "worsening":
        return <Badge bg="danger"><FaArrowDown /> Worsening</Badge>;
      case "stable":
      default:
        return <Badge bg="secondary">Stable</Badge>;
    }
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Header as="h4">
          Health Summary Dashboard
          <Button 
            variant={showAIInsights ? "outline-secondary" : "outline-primary"}
            size="sm"
            className="float-end"
            onClick={toggleAIInsights}
          >
            {showAIInsights ? "Hide AI Insights" : "Show AI Insights"}
          </Button>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Analyzing your health records...</p>
            </div>
          ) : (
            <Row>
              <Col md={4}>
                <Card className="health-score-card mb-3">
                  <Card.Body className="text-center">
                    <h5>Your Health Score</h5>
                    <div className="health-score-circle">
                      <div className="score">{healthScore.current}</div>
                      <div className="score-label">out of {healthScore.maxScore}</div>
                    </div>
                    <div className="mt-2">
                      {healthScore.change > 0 ? (
                        <Badge bg="success">+{healthScore.change} since last visit</Badge>
                      ) : healthScore.change < 0 ? (
                        <Badge bg="danger">{healthScore.change} since last visit</Badge>
                      ) : (
                        <Badge bg="secondary">No change since last visit</Badge>
                      )}
                    </div>
                  </Card.Body>
                </Card>
                
                <h6>Health Score Factors</h6>
                {healthScore.factors.map((factor, index) => (
                  <div key={index} className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <small>{factor.name}</small>
                      <small>{factor.score}/{factor.maxScore}</small>
                    </div>
                    <ProgressBar now={(factor.score/factor.maxScore) * 100} />
                  </div>
                ))}
              </Col>
              
              <Col md={8}>
                <h5>Key Health Metrics</h5>
                <Row className="mb-4">
                  <Col xs={6} md={3} className="mb-3">
                    <div className="metric-box text-center p-2">
                      <FaRulerVertical className="metric-icon" />
                      <div className="metric-value">{healthMetrics.height}</div>
                      <div className="metric-label">Height</div>
                    </div>
                  </Col>
                  <Col xs={6} md={3} className="mb-3">
                    <div className="metric-box text-center p-2">
                      <FaWeight className="metric-icon" />
                      <div className="metric-value">{healthMetrics.weight}</div>
                      <div className="metric-label">Weight</div>
                    </div>
                  </Col>
                  <Col xs={6} md={3} className="mb-3">
                    <div className="metric-box text-center p-2">
                      <FaHeartbeat className="metric-icon" />
                      <div className="metric-value">{healthMetrics.bloodPressure}</div>
                      <div className="metric-label">BP</div>
                    </div>
                  </Col>
                  <Col xs={6} md={3} className="mb-3">
                    <div className="metric-box text-center p-2">
                      <FaFlask className="metric-icon" />
                      <div className="metric-value">{healthMetrics.a1c}</div>
                      <div className="metric-label">A1C</div>
                    </div>
                  </Col>
                </Row>
                
                {showAIInsights && (
                  <Card className="ai-insight mb-4">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-2">
                        <FaInfoCircle size={20} className="me-2 text-primary" />
                        <h5 className="mb-0">AI Health Assessment</h5>
                      </div>
                      <p>Based on your recent health records, you're making good progress with your diabetes management. Your A1C level has improved from 7.2% to 6.8% over the past 6 months. Your blood pressure is trending in the right direction but still slightly elevated. Consider discussing with Dr. Johnson about potential adjustments to your current treatment plan during your upcoming appointment.</p>
                    </Card.Body>
                  </Card>
                )}
                
                <h5>Health Concerns</h5>
                <ListGroup className="mb-4">
                  {healthConcerns.map((concern, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="d-flex align-items-center">
                          <FaExclamationTriangle className={`me-2 text-${concern.status === 'Critical' ? 'danger' : 'warning'}`} />
                          <span>{concern.condition}</span>
                        </div>
                        <small className="text-muted d-block">
                          Last checked {calculateDaysSince(concern.lastChecked)} days ago
                        </small>
                      </div>
                      <div className="text-end">
                        <Badge bg={concern.status === 'Managing' ? 'primary' : 'warning'}>
                          {concern.status}
                        </Badge>
                        <div className="mt-1">
                          {renderTrend(concern.trend)}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">
              <FaCalendarCheck className="me-2" />
              Preventive Care Recommendations
            </Card.Header>
            <ListGroup variant="flush">
              {preventiveCare.map((item, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{item.service}</strong>
                      <div><small className="text-muted">Recommended by: {item.recommendedBy}</small></div>
                    </div>
                    <div className="text-end">
                      <Badge 
                        bg={item.status === 'Scheduled' ? 'success' : item.status === 'Due Soon' ? 'warning' : 'info'}
                      >
                        {item.status}
                      </Badge>
                      <div><small>{new Date(item.dueDate).toLocaleDateString()}</small></div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Card.Footer>
              <Button variant="outline-primary" size="sm">View All Preventive Care Recommendations</Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">Recent Updates</Card.Header>
            <ListGroup variant="flush">
              {recentUpdates.map((update, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <Badge 
                        bg={update.type === 'Lab Result' ? 'info' : update.type === 'Medication Change' ? 'warning' : 'primary'} 
                        className="me-2"
                      >
                        {update.type}
                      </Badge>
                      <strong>{update.description}</strong>
                      <div><small className="text-muted">{update.provider}</small></div>
                    </div>
                    <small>{new Date(update.date).toLocaleDateString()}</small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Card.Footer>
              <Button variant="outline-primary" size="sm">View All Recent Updates</Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Card.Header as="h5">AI-Generated Health Recommendations</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <div className="recommendation-item">
                <h6>Lifestyle Recommendation</h6>
                <p>Consider increasing daily physical activity. Your records show an average of 4,500 steps daily - try to reach at least 7,500 steps for improved glycemic control.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="recommendation-item">
                <h6>Dietary Suggestion</h6>
                <p>Your recent lab values suggest benefits from reducing carbohydrate intake. Consider consulting with a nutritionist for a personalized meal plan.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="recommendation-item">
                <h6>Follow-up Recommendation</h6>
                <p>Schedule a follow-up appointment with your endocrinologist within the next 3 months to reassess your diabetes management plan.</p>
              </div>
            </Col>
          </Row>
          <div className="mt-3 text-muted">
            <small><i>These recommendations are generated by AI based on your health records and general medical guidelines. Always consult with your healthcare provider before making significant changes to your health regimen.</i></small>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default HealthSummaryDashboard;
