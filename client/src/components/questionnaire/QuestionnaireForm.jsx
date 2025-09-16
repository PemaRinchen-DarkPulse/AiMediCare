import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { previsitTriageService } from '../../services/previsitTriageService';

const QuestionnaireForm = ({ appointmentId, onComplete, userRole = 'patient' }) => {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (appointmentId) {
      fetchQuestionnaire();
    }
  }, [appointmentId]);

  const fetchQuestionnaire = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get existing questionnaire first
      const existingResponse = await previsitTriageService.getTriageByAppointment(appointmentId);
      
      if (existingResponse.data && existingResponse.data.questions && existingResponse.data.questions.length > 0) {
        setQuestionnaire(existingResponse.data);
        
        // Load existing answers
        const existingAnswers = {};
        existingResponse.data.answers?.forEach(answer => {
          existingAnswers[answer.questionId] = answer.answer;
        });
        setAnswers(existingAnswers);
      } else {
        // Generate new questionnaire
        const response = await previsitTriageService.generateQuestionnaire(appointmentId);
        setQuestionnaire(response.questionnaire);
      }
    } catch (err) {
      console.error('Error fetching questionnaire:', err);
      setError('Failed to load questionnaire. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateAnswers = () => {
    const errors = {};
    
    questionnaire.questions.forEach(question => {
      if (question.required && !answers[question.id]) {
        errors[question.id] = 'This question is required';
      }
      
      if (answers[question.id] && question.type === 'scale') {
        const value = Number(answers[question.id]);
        if (isNaN(value) || value < 1 || value > 10) {
          errors[question.id] = 'Please select a value between 1 and 10';
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAnswers()) {
      setError('Please correct the errors below');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Convert answers object to array format
      const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer
      }));
      
      const response = await previsitTriageService.submitAnswers(questionnaire._id, answerArray);
      
      setSuccess('Questionnaire submitted successfully!');
      
      if (onComplete) {
        onComplete(response.data.questionnaire);
      }
      
    } catch (err) {
      console.error('Error submitting questionnaire:', err);
      setError('Failed to submit questionnaire. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const value = answers[question.id] || '';
    const hasError = validationErrors[question.id];
    
    switch (question.type) {
      case 'text':
        return (
          <Form.Group key={question.id} className="mb-3">
            <Form.Label>
              {question.question}
              {question.required && <span className="text-danger"> *</span>}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              isInvalid={hasError}
              placeholder="Please provide your answer..."
            />
            {hasError && (
              <Form.Control.Feedback type="invalid">
                {validationErrors[question.id]}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );
      
      case 'multiple_choice':
        return (
          <Form.Group key={question.id} className="mb-3">
            <Form.Label>
              {question.question}
              {question.required && <span className="text-danger"> *</span>}
            </Form.Label>
            <Form.Select
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              isInvalid={hasError}
            >
              <option value="">Select an option...</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
            {hasError && (
              <Form.Control.Feedback type="invalid">
                {validationErrors[question.id]}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        );
      
      case 'yes_no':
        return (
          <Form.Group key={question.id} className="mb-3">
            <Form.Label>
              {question.question}
              {question.required && <span className="text-danger"> *</span>}
            </Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Yes"
                name={`question_${question.id}`}
                checked={value === 'yes' || value === true}
                onChange={() => handleAnswerChange(question.id, 'yes')}
              />
              <Form.Check
                inline
                type="radio"
                label="No"
                name={`question_${question.id}`}
                checked={value === 'no' || value === false}
                onChange={() => handleAnswerChange(question.id, 'no')}
              />
            </div>
            {hasError && (
              <div className="text-danger small mt-1">
                {validationErrors[question.id]}
              </div>
            )}
          </Form.Group>
        );
      
      case 'scale':
        return (
          <Form.Group key={question.id} className="mb-3">
            <Form.Label>
              {question.question}
              {question.required && <span className="text-danger"> *</span>}
            </Form.Label>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">1</span>
              <Form.Range
                min="1"
                max="10"
                value={value || 5}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="flex-grow-1"
              />
              <span className="small text-muted">10</span>
              <Badge bg="primary" className="ms-2">
                {value || 5}
              </Badge>
            </div>
            {hasError && (
              <div className="text-danger small mt-1">
                {validationErrors[question.id]}
              </div>
            )}
          </Form.Group>
        );
      
      default:
        return null;
    }
  };

  const calculateProgress = () => {
    if (!questionnaire || !questionnaire.questions) return 0;
    
    const requiredQuestions = questionnaire.questions.filter(q => q.required);
    const totalQuestions = requiredQuestions.length > 0 ? requiredQuestions.length : questionnaire.questions.length;
    const answeredQuestions = questionnaire.questions.filter(q => {
      if (requiredQuestions.length > 0) {
        return q.required && answers[q.id];
      }
      return answers[q.id];
    }).length;
    
    return Math.round((answeredQuestions / totalQuestions) * 100);
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
            <span className="visually-hidden">Loading questionnaire...</span>
          </div>
          <p className="mt-3 mb-0">Loading questionnaire...</p>
        </Card.Body>
      </Card>
    );
  }

  if (!questionnaire) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="warning">
            No questionnaire available for this appointment.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  const progress = calculateProgress();
  const isCompleted = questionnaire.isCompleted;
  const isReadOnly = userRole === 'doctor' || isCompleted;

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{questionnaire.title}</h5>
        <div className="d-flex gap-2">
          <Badge bg={getUrgencyBadgeVariant(questionnaire.urgencyLevel)}>
            {questionnaire.urgencyLevel} Priority
          </Badge>
          {questionnaire.aiGenerated && (
            <Badge bg="info">AI Generated</Badge>
          )}
          {isCompleted && (
            <Badge bg="success">Completed</Badge>
          )}
        </div>
      </Card.Header>
      
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {!isCompleted && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-medium">Progress</span>
              <span className="text-muted">{progress}% complete</span>
            </div>
            <ProgressBar now={progress} variant={progress === 100 ? 'success' : 'primary'} />
          </div>
        )}

        <div className="mb-4">
          <p><strong>Estimated Duration:</strong> {questionnaire.estimatedDuration}</p>
          {questionnaire.urgencyNotes && (
            <Alert variant="warning" className="small">
              <strong>Important:</strong> {questionnaire.urgencyNotes}
            </Alert>
          )}
        </div>

        <Form onSubmit={handleSubmit}>
          {questionnaire.questions?.map(question => renderQuestion(question))}
          
          {!isReadOnly && (
            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={fetchQuestionnaire}
                disabled={submitting}
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={submitting || progress === 0}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Questionnaire'
                )}
              </Button>
            </div>
          )}
        </Form>

        {questionnaire.preparationNotes && (
          <div className="mt-4 pt-3 border-top">
            <h6>Preparation Notes</h6>
            <p className="text-muted small">{questionnaire.preparationNotes}</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default QuestionnaireForm;