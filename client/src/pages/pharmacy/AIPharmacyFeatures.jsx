import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Modal, Form, 
  Spinner, Alert, Badge, ListGroup, 
  InputGroup, Accordion
} from 'react-bootstrap';
import { 
  FaRobot, FaExclamationTriangle, FaSearch, FaFlask,
  FaPills, FaHeartbeat, FaUserMd, FaChartLine, FaCog
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { 
  checkDrugInteractions,
  verifyAllergies,
  getDosageRecommendations,
  getClinicalDecisionSupport,
  getMedicationAlternatives,
  getAIPharmacyInsights
} from '../../services/pharmacyService';

const AIPharmacyFeatures = () => {
  const [activeFeature, setActiveFeature] = useState('interactions');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [medications, setMedications] = useState(['']);
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    weight: '',
    gender: '',
    allergies: [],
    conditions: [],
    kidneyFunction: '',
    liverFunction: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const addMedication = () => {
    setMedications([...medications, '']);
  };

  const updateMedication = (index, value) => {
    const updated = [...medications];
    updated[index] = value;
    setMedications(updated);
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      const updated = medications.filter((_, i) => i !== index);
      setMedications(updated);
    }
  };

  const checkInteractions = async () => {
    try {
      setLoading(true);
      const validMedications = medications.filter(med => med.trim());
      
      if (validMedications.length < 2) {
        toast.error('Please enter at least 2 medications to check interactions');
        return;
      }

      const response = await checkDrugInteractions({
        medications: validMedications,
        patientData: patientInfo
      });
      
      setResults(response.data);
      setActiveFeature('interactions');
    } catch (error) {
      console.error('Error checking interactions:', error);
      toast.error('Failed to check drug interactions');
    } finally {
      setLoading(false);
    }
  };

  const checkAllergies = async () => {
    try {
      setLoading(true);
      const validMedications = medications.filter(med => med.trim());
      
      if (validMedications.length === 0) {
        toast.error('Please enter medications to check allergies');
        return;
      }

      const response = await verifyAllergies({
        medications: validMedications,
        allergies: patientInfo.allergies
      });
      
      setResults(response.data);
      setActiveFeature('allergies');
    } catch (error) {
      console.error('Error checking allergies:', error);
      toast.error('Failed to check allergies');
    } finally {
      setLoading(false);
    }
  };

  const getDosageRecommendation = async () => {
    try {
      setLoading(true);
      
      if (!searchQuery.trim()) {
        toast.error('Please enter a medication name');
        return;
      }

      const response = await getDosageRecommendations({
        medication: searchQuery,
        patientData: patientInfo
      });
      
      setResults(response.data);
      setActiveFeature('dosage');
    } catch (error) {
      console.error('Error getting dosage recommendations:', error);
      toast.error('Failed to get dosage recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getClinicalSupport = async () => {
    try {
      setLoading(true);
      
      const validMedications = medications.filter(med => med.trim());
      
      const response = await getClinicalDecisionSupport({
        medications: validMedications,
        patientData: patientInfo,
        query: searchQuery
      });
      
      setResults(response.data);
      setActiveFeature('clinical');
    } catch (error) {
      console.error('Error getting clinical support:', error);
      toast.error('Failed to get clinical decision support');
    } finally {
      setLoading(false);
    }
  };

  const getAlternatives = async () => {
    try {
      setLoading(true);
      
      if (!searchQuery.trim()) {
        toast.error('Please enter a medication name');
        return;
      }

      const response = await getMedicationAlternatives({
        medication: searchQuery,
        patientData: patientInfo,
        reason: 'efficacy'
      });
      
      setResults(response.data);
      setActiveFeature('alternatives');
    } catch (error) {
      console.error('Error getting alternatives:', error);
      toast.error('Failed to get medication alternatives');
    } finally {
      setLoading(false);
    }
  };

  const getPharmacyInsights = async () => {
    try {
      setLoading(true);
      
      const response = await getAIPharmacyInsights({
        analysisType: 'comprehensive',
        timeframe: 30
      });
      
      setResults(response.data);
      setActiveFeature('insights');
    } catch (error) {
      console.error('Error getting pharmacy insights:', error);
      toast.error('Failed to get pharmacy insights');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      'minor': 'success',
      'moderate': 'warning',
      'major': 'danger',
      'contraindicated': 'dark'
    };
    return <Badge bg={variants[severity.toLowerCase()] || 'secondary'}>{severity}</Badge>;
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 90) return <Badge bg="success">High Confidence</Badge>;
    if (confidence >= 70) return <Badge bg="info">Medium Confidence</Badge>;
    return <Badge bg="warning">Low Confidence</Badge>;
  };

  const renderInteractionResults = () => {
    if (!results || !results.interactions) return null;

    return (
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Drug Interaction Analysis</h5>
            {getConfidenceBadge(results.confidence)}
          </div>
        </Card.Header>
        <Card.Body>
          {results.interactions.length === 0 ? (
            <Alert variant="success">
              <FaHeartbeat className="me-2" />
              No significant drug interactions detected
            </Alert>
          ) : (
            <div>
              <Alert variant="warning" className="mb-3">
                <FaExclamationTriangle className="me-2" />
                {results.interactions.length} potential interaction(s) detected
              </Alert>
              
              <Accordion>
                {results.interactions.map((interaction, index) => (
                  <Accordion.Item key={index} eventKey={index.toString()}>
                    <Accordion.Header>
                      <div className="d-flex justify-content-between w-100 me-3">
                        <span>
                          <strong>{interaction.drug1}</strong> + <strong>{interaction.drug2}</strong>
                        </span>
                        {getSeverityBadge(interaction.severity)}
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="mb-2">
                        <strong>Description:</strong> {interaction.description}
                      </div>
                      <div className="mb-2">
                        <strong>Clinical Significance:</strong> {interaction.clinical_significance}
                      </div>
                      {interaction.recommendations && (
                        <div className="mb-2">
                          <strong>Recommendations:</strong>
                          <ul className="mt-1">
                            {interaction.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {interaction.monitoring && (
                        <div>
                          <strong>Monitoring Required:</strong> {interaction.monitoring}
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          )}

          {results.ai_analysis && (
            <div className="mt-3">
              <h6>AI Analysis:</h6>
              <div className="bg-light p-3 rounded">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {results.ai_analysis}
                </pre>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderAllergyResults = () => {
    if (!results || !results.allergy_alerts) return null;

    return (
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Allergy Verification</h5>
            {getConfidenceBadge(results.confidence)}
          </div>
        </Card.Header>
        <Card.Body>
          {results.allergy_alerts.length === 0 ? (
            <Alert variant="success">
              <FaHeartbeat className="me-2" />
              No allergy conflicts detected
            </Alert>
          ) : (
            <div>
              <Alert variant="danger" className="mb-3">
                <FaExclamationTriangle className="me-2" />
                {results.allergy_alerts.length} allergy conflict(s) detected
              </Alert>
              
              {results.allergy_alerts.map((alert, index) => (
                <Alert key={index} variant="warning" className="mb-2">
                  <div className="fw-bold">{alert.medication}</div>
                  <div>Conflicts with allergy: <strong>{alert.allergen}</strong></div>
                  <div className="small">{alert.description}</div>
                  {alert.alternatives && (
                    <div className="mt-2">
                      <strong>Alternatives:</strong> {alert.alternatives.join(', ')}
                    </div>
                  )}
                </Alert>
              ))}
            </div>
          )}

          {results.ai_analysis && (
            <div className="mt-3">
              <h6>AI Analysis:</h6>
              <div className="bg-light p-3 rounded">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {results.ai_analysis}
                </pre>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderDosageResults = () => {
    if (!results || !results.dosage_recommendations) return null;

    return (
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Dosage Recommendations</h5>
            {getConfidenceBadge(results.confidence)}
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <h6>Medication: {results.medication}</h6>
          </div>

          {results.dosage_recommendations.map((rec, index) => (
            <Card key={index} className="mb-3 border">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6>{rec.indication}</h6>
                  <Badge bg="primary">{rec.route}</Badge>
                </div>
                
                <Row>
                  <Col md={6}>
                    <div><strong>Starting Dose:</strong> {rec.starting_dose}</div>
                    <div><strong>Maintenance Dose:</strong> {rec.maintenance_dose}</div>
                    <div><strong>Maximum Dose:</strong> {rec.maximum_dose}</div>
                  </Col>
                  <Col md={6}>
                    <div><strong>Frequency:</strong> {rec.frequency}</div>
                    <div><strong>Duration:</strong> {rec.duration}</div>
                    {rec.food_instructions && (
                      <div><strong>Food:</strong> {rec.food_instructions}</div>
                    )}
                  </Col>
                </Row>

                {rec.adjustments && rec.adjustments.length > 0 && (
                  <div className="mt-2">
                    <strong>Dose Adjustments:</strong>
                    <ul className="mt-1 mb-0">
                      {rec.adjustments.map((adj, i) => (
                        <li key={i}>{adj.condition}: {adj.adjustment}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rec.monitoring && (
                  <div className="mt-2">
                    <strong>Monitoring:</strong> {rec.monitoring}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}

          {results.ai_analysis && (
            <div className="mt-3">
              <h6>AI Analysis:</h6>
              <div className="bg-light p-3 rounded">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {results.ai_analysis}
                </pre>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderClinicalResults = () => {
    if (!results) return null;

    return (
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Clinical Decision Support</h5>
            {results.confidence && getConfidenceBadge(results.confidence)}
          </div>
        </Card.Header>
        <Card.Body>
          {results.recommendations && (
            <div className="mb-3">
              <h6>Clinical Recommendations:</h6>
              <ListGroup>
                {results.recommendations.map((rec, index) => (
                  <ListGroup.Item key={index}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold">{rec.category}</div>
                        <div>{rec.recommendation}</div>
                        {rec.evidence_level && (
                          <small className="text-muted">Evidence Level: {rec.evidence_level}</small>
                        )}
                      </div>
                      {rec.priority && (
                        <Badge bg={rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info'}>
                          {rec.priority}
                        </Badge>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {results.clinical_alerts && results.clinical_alerts.length > 0 && (
            <div className="mb-3">
              <h6>Clinical Alerts:</h6>
              {results.clinical_alerts.map((alert, index) => (
                <Alert key={index} variant="warning">
                  <div className="fw-bold">{alert.type}</div>
                  <div>{alert.message}</div>
                  {alert.action_required && (
                    <div className="mt-1"><strong>Action Required:</strong> {alert.action_required}</div>
                  )}
                </Alert>
              ))}
            </div>
          )}

          {results.ai_analysis && (
            <div className="mt-3">
              <h6>AI Analysis:</h6>
              <div className="bg-light p-3 rounded">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {results.ai_analysis}
                </pre>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderAlternativeResults = () => {
    if (!results || !results.alternatives) return null;

    return (
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Medication Alternatives</h5>
            {getConfidenceBadge(results.confidence)}
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <h6>Original Medication: {results.original_medication}</h6>
          </div>

          {results.alternatives.map((alt, index) => (
            <Card key={index} className="mb-3 border">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6>{alt.medication_name}</h6>
                  <div>
                    <Badge bg="success" className="me-1">
                      {alt.similarity_score}% match
                    </Badge>
                    {alt.cost_comparison && (
                      <Badge bg={alt.cost_comparison === 'lower' ? 'success' : alt.cost_comparison === 'higher' ? 'danger' : 'secondary'}>
                        {alt.cost_comparison} cost
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <strong>Therapeutic Class:</strong> {alt.therapeutic_class}
                </div>

                {alt.advantages && (
                  <div className="mb-2">
                    <strong>Advantages:</strong>
                    <ul className="mt-1 mb-0">
                      {alt.advantages.map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {alt.considerations && (
                  <div className="mb-2">
                    <strong>Considerations:</strong>
                    <ul className="mt-1 mb-0">
                      {alt.considerations.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {alt.contraindications && (
                  <div>
                    <strong>Contraindications:</strong> {alt.contraindications.join(', ')}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}

          {results.ai_analysis && (
            <div className="mt-3">
              <h6>AI Analysis:</h6>
              <div className="bg-light p-3 rounded">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {results.ai_analysis}
                </pre>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderInsightResults = () => {
    if (!results) return null;

    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">AI Pharmacy Insights</h5>
        </Card.Header>
        <Card.Body>
          {results.insights && (
            <div className="mb-3">
              <h6>Key Insights:</h6>
              <div className="bg-light p-3 rounded">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {results.insights}
                </pre>
              </div>
            </div>
          )}

          {results.recommendations && (
            <div className="mb-3">
              <h6>AI Recommendations:</h6>
              <div className="bg-light p-3 rounded">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                  {results.recommendations}
                </pre>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="ai-pharmacy-features">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaCog className="me-2" />
          AI Pharmacy Features
        </h2>
      </div>

      <Row>
        {/* Controls Panel */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">AI Tools</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant={activeFeature === 'interactions' ? 'primary' : 'outline-primary'}
                  onClick={checkInteractions}
                  disabled={loading}
                >
                  <FaFlask className="me-2" />
                  Drug Interactions
                </Button>
                
                <Button 
                  variant={activeFeature === 'allergies' ? 'primary' : 'outline-primary'}
                  onClick={checkAllergies}
                  disabled={loading}
                >
                  <FaExclamationTriangle className="me-2" />
                  Allergy Check
                </Button>
                
                <Button 
                  variant={activeFeature === 'dosage' ? 'primary' : 'outline-primary'}
                  onClick={getDosageRecommendation}
                  disabled={loading}
                >
                  <FaPills className="me-2" />
                  Dosage Recommendation
                </Button>
                
                <Button 
                  variant={activeFeature === 'clinical' ? 'primary' : 'outline-primary'}
                  onClick={getClinicalSupport}
                  disabled={loading}
                >
                  <FaUserMd className="me-2" />
                  Clinical Support
                </Button>
                
                <Button 
                  variant={activeFeature === 'alternatives' ? 'primary' : 'outline-primary'}
                  onClick={getAlternatives}
                  disabled={loading}
                >
                  <FaPills className="me-2" />
                  Find Alternatives
                </Button>
                
                <Button 
                  variant={activeFeature === 'insights' ? 'primary' : 'outline-primary'}
                  onClick={getPharmacyInsights}
                  disabled={loading}
                >
                  <FaChartLine className="me-2" />
                  Pharmacy Insights
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Input Panel */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Input Data</h6>
            </Card.Header>
            <Card.Body>
              {/* Medications */}
              <Form.Group className="mb-3">
                <Form.Label>Medications</Form.Label>
                {medications.map((med, index) => (
                  <InputGroup key={index} className="mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Enter medication name"
                      value={med}
                      onChange={(e) => updateMedication(index, e.target.value)}
                    />
                    {medications.length > 1 && (
                      <Button 
                        variant="outline-danger" 
                        onClick={() => removeMedication(index)}
                      >
                        ×
                      </Button>
                    )}
                  </InputGroup>
                ))}
                <Button variant="outline-secondary" size="sm" onClick={addMedication}>
                  + Add Medication
                </Button>
              </Form.Group>

              {/* Search Query */}
              <Form.Group className="mb-3">
                <Form.Label>Search/Query</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter medication or condition"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Form.Group>

              {/* Patient Info */}
              <Form.Group className="mb-3">
                <Form.Label>Patient Information</Form.Label>
                <Row>
                  <Col sm={6}>
                    <Form.Control
                      type="number"
                      placeholder="Age"
                      value={patientInfo.age}
                      onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                      className="mb-2"
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Control
                      type="number"
                      placeholder="Weight (kg)"
                      value={patientInfo.weight}
                      onChange={(e) => setPatientInfo({...patientInfo, weight: e.target.value})}
                      className="mb-2"
                    />
                  </Col>
                </Row>
                
                <Form.Select
                  value={patientInfo.gender}
                  onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                  className="mb-2"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Form.Select>

                <Form.Control
                  type="text"
                  placeholder="Allergies (comma-separated)"
                  onChange={(e) => setPatientInfo({
                    ...patientInfo, 
                    allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                  })}
                  className="mb-2"
                />

                <Form.Control
                  type="text"
                  placeholder="Medical conditions (comma-separated)"
                  onChange={(e) => setPatientInfo({
                    ...patientInfo, 
                    conditions: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                  })}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Results Panel */}
        <Col md={8}>
          {loading ? (
            <Card>
              <Card.Body className="text-center py-5">
                <Spinner animation="border" className="mb-3" />
                <div>AI is analyzing your request...</div>
                <small className="text-muted">This may take a few moments</small>
              </Card.Body>
            </Card>
          ) : results ? (
            <div>
              {activeFeature === 'interactions' && renderInteractionResults()}
              {activeFeature === 'allergies' && renderAllergyResults()}
              {activeFeature === 'dosage' && renderDosageResults()}
              {activeFeature === 'clinical' && renderClinicalResults()}
              {activeFeature === 'alternatives' && renderAlternativeResults()}
              {activeFeature === 'insights' && renderInsightResults()}
            </div>
          ) : (
            <Card>
              <Card.Body className="text-center py-5">
                <FaRobot size={48} className="text-muted mb-3" />
                <h5>AI-Powered Clinical Decision Support</h5>
                <p className="text-muted">
                  Select an AI tool from the left panel to get intelligent recommendations
                  and clinical insights for your pharmacy practice.
                </p>
                <div className="row text-start mt-4">
                  <div className="col-md-6">
                    <h6>Available Features:</h6>
                    <ul className="text-muted">
                      <li>Drug interaction checking</li>
                      <li>Allergy verification</li>
                      <li>Dosage recommendations</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Clinical Support:</h6>
                    <ul className="text-muted">
                      <li>Treatment alternatives</li>
                      <li>Clinical decision support</li>
                      <li>Pharmacy insights & analytics</li>
                    </ul>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AIPharmacyFeatures;