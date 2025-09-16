import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Alert, Row, Col } from 'react-bootstrap';
import { previsitTriageService } from '../../services/previsitTriageService';

const QuestionnaireReview = ({ questionnaire, onClose, onMarkReviewed }) => {
  const [marking, setMarking] = useState(false);

  const handleMarkReviewed = async () => {
    try {
      setMarking(true);
      await previsitTriageService.markTriageAsReviewed(questionnaire._id, 'Reviewed by doctor');
      if (onMarkReviewed) {
        onMarkReviewed(questionnaire._id);
      }
      onClose();
    } catch (error) {
      console.error('Error marking as reviewed:', error);
    } finally {
      setMarking(false);
    }
  };

  const getAnswerDisplay = (question, answer) => {
    if (!answer) return <span className="text-muted">Not answered</span>;
    
    switch (question.type) {
      case 'yes_no':
        return (
          <Badge bg={answer === 'yes' ? 'success' : 'secondary'}>
            {answer === 'yes' ? 'Yes' : 'No'}
          </Badge>
        );
      case 'scale':
        return (
          <div className="d-flex align-items-center">
            <Badge bg="primary" className="me-2">{answer}/10</Badge>
            <div className="progress flex-grow-1" style={{ height: '6px' }}>
              <div 
                className="progress-bar" 
                style={{ width: `${(answer / 10) * 100}%` }}
              />
            </div>
          </div>
        );
      case 'multiple_choice':
        return <Badge bg="info">{answer}</Badge>;
      default:
        return <div className="text-break">{answer}</div>;
    }
  };

  const getUrgencyBadgeVariant = (urgencyLevel) => {
    switch (urgencyLevel?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Questionnaire Review</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Row className="mb-4">
          <Col md={8}>
            <h5>{questionnaire.title}</h5>
            <p className="text-muted mb-2">
              Patient: {questionnaire.patientId?.name || 'Unknown'}
            </p>
            <p className="text-muted mb-2">
              Reason for Visit: {questionnaire.reasonForVisit}
            </p>
          </Col>
          <Col md={4} className="text-end">
            <Badge bg={getUrgencyBadgeVariant(questionnaire.urgencyLevel)} className="me-2">
              {questionnaire.urgencyLevel} Priority
            </Badge>
            {questionnaire.isCompleted && (
              <Badge bg="success">Completed</Badge>
            )}
          </Col>
        </Row>

        {questionnaire.urgencyNotes && (
          <Alert variant="warning" className="mb-4">
            <strong>Urgent Notes:</strong> {questionnaire.urgencyNotes}
          </Alert>
        )}

        <div className="mb-4">
          <h6>Patient Responses</h6>
          <div className="table-responsive">
            <Table striped bordered>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Question</th>
                  <th style={{ width: '30%' }}>Answer</th>
                  <th style={{ width: '15%' }}>Type</th>
                  <th style={{ width: '15%' }}>Required</th>
                </tr>
              </thead>
              <tbody>
                {questionnaire.questions?.map(question => {
                  const answer = questionnaire.answers?.find(a => a.questionId === question.id);
                  return (
                    <tr key={question.id}>
                      <td>
                        <div className="fw-medium">{question.question}</div>
                        {question.options && (
                          <div className="small text-muted mt-1">
                            Options: {question.options.join(', ')}
                          </div>
                        )}
                      </td>
                      <td>{getAnswerDisplay(question, answer?.answer)}</td>
                      <td>
                        <Badge bg="secondary" className="small">
                          {question.type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        {question.required ? (
                          <Badge bg="warning">Required</Badge>
                        ) : (
                          <span className="text-muted">Optional</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>

        <Row>
          <Col md={6}>
            <h6>Completion Status</h6>
            <div className="d-flex align-items-center mb-2">
              <div className="progress me-3" style={{ width: '100px', height: '8px' }}>
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: `${questionnaire.completionPercentage || 0}%` }}
                />
              </div>
              <span>{questionnaire.completionPercentage || 0}% complete</span>
            </div>
            <p className="small text-muted">
              Completed: {questionnaire.completedAt ? 
                new Date(questionnaire.completedAt).toLocaleString() : 'Not completed'}
            </p>
          </Col>
          <Col md={6}>
            <h6>AI Generation Info</h6>
            <p className="small text-muted mb-1">
              Generated: {questionnaire.aiGenerated ? 'AI Generated' : 'Fallback'}
            </p>
            <p className="small text-muted mb-1">
              Model: {questionnaire.modelUsed || 'Unknown'}
            </p>
            <p className="small text-muted">
              Duration: {questionnaire.estimatedDuration}
            </p>
          </Col>
        </Row>

        {questionnaire.preparationNotes && (
          <div className="mt-4">
            <h6>Preparation Notes</h6>
            <p className="text-muted">{questionnaire.preparationNotes}</p>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {questionnaire.status !== 'reviewed' && (
          <Button 
            variant="primary" 
            onClick={handleMarkReviewed}
            disabled={marking}
          >
            {marking ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Marking as Reviewed...
              </>
            ) : (
              'Mark as Reviewed'
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

const QuestionnaireList = ({ doctorId, refreshTrigger }) => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);

  useEffect(() => {
    fetchCompletedQuestionnaires();
  }, [doctorId, refreshTrigger]);

  const fetchCompletedQuestionnaires = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await previsitTriageService.getCompletedQuestionnaires();
      setQuestionnaires(response.questionnaires || []);
    } catch (err) {
      console.error('Error fetching completed questionnaires:', err);
      setError('Failed to load questionnaires. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = (questionnaireId) => {
    setQuestionnaires(prev => 
      prev.filter(q => q._id !== questionnaireId)
    );
  };

  const getUrgencyBadgeVariant = (urgencyLevel) => {
    switch (urgencyLevel?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading questionnaires...</span>
          </div>
          <p className="mt-3 mb-0">Loading completed questionnaires...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Completed Questionnaires for Review</h5>
      </Card.Header>
      
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {questionnaires.length === 0 ? (
          <Alert variant="info">
            No completed questionnaires pending review.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Reason for Visit</th>
                  <th>Completed</th>
                  <th>Urgency</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questionnaires.map(questionnaire => (
                  <tr key={questionnaire._id}>
                    <td>
                      <div className="fw-medium">
                        {questionnaire.patientId?.name || 'Unknown Patient'}
                      </div>
                      <div className="small text-muted">
                        {questionnaire.patientId?.email}
                      </div>
                    </td>
                    <td>{questionnaire.reasonForVisit}</td>
                    <td>
                      {questionnaire.completedAt ? (
                        <div className="small">
                          {new Date(questionnaire.completedAt).toLocaleDateString()}
                          <br />
                          {new Date(questionnaire.completedAt).toLocaleTimeString()}
                        </div>
                      ) : (
                        <span className="text-muted">Not completed</span>
                      )}
                    </td>
                    <td>
                      <Badge bg={getUrgencyBadgeVariant(questionnaire.urgencyLevel)}>
                        {questionnaire.urgencyLevel}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress me-2" style={{ width: '60px', height: '6px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            style={{ width: `${questionnaire.completionPercentage || 0}%` }}
                          />
                        </div>
                        <span className="small">{questionnaire.completionPercentage || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => setSelectedQuestionnaire(questionnaire)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {selectedQuestionnaire && (
        <QuestionnaireReview
          questionnaire={selectedQuestionnaire}
          onClose={() => setSelectedQuestionnaire(null)}
          onMarkReviewed={handleMarkReviewed}
        />
      )}
    </Card>
  );
};

export default QuestionnaireList;