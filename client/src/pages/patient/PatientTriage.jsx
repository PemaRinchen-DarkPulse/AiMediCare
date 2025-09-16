import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Row, Col, Card, CardBody, CardTitle, Button,
  Spinner, ListGroup, ListGroupItem, Badge, Alert, Input,
  FormGroup, Label, Progress, Form
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaClipboardCheck, FaArrowLeft, FaStethoscope,
  FaCalendarAlt, FaClock, FaUserMd, FaCheck, FaRobot
} from 'react-icons/fa';
import UserAvatar from '../../components/UserAvatar';
import AIConfidenceIndicator from '../../components/AIConfidenceIndicator';
import { AuthContext } from '../../context/AuthContext';
import { 
  getPatientPendingQuestionnaires, 
  updateTriageAnswers 
} from '../../services/triageService';
import './PatientTriage.css';

const PatientTriage = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate the percentage of answered questions
  const calculateProgress = () => {
    if (!selectedQuestionnaire) return 0;
    
    const requiredQuestions = selectedQuestionnaire.questions.filter(q => q.required);
    const answeredRequiredQuestions = requiredQuestions.filter(q => answers[q.id]);
    
    if (requiredQuestions.length === 0) return 100; // No required questions
    return Math.floor((answeredRequiredQuestions.length / requiredQuestions.length) * 100);
  };

  // Check if all required questions are answered
  const areAllRequiredQuestionsAnswered = () => {
    if (!selectedQuestionnaire) return false;
    
    const requiredQuestions = selectedQuestionnaire.questions.filter(q => q.required);
    return requiredQuestions.every(q => answers[q.id]);
  };

  // Get pending questionnaires for the patient
  useEffect(() => {
    const fetchPendingQuestionnaires = async () => {
      try {
        setLoading(true);
        if (!currentUser || !currentUser._id) {
          setError('User information not available');
          setLoading(false);
          return;
        }

        const pendingQuestionnaires = await getPatientPendingQuestionnaires(currentUser._id);
        setQuestionnaires(pendingQuestionnaires);
        
      } catch (error) {
        console.error('Error fetching pending questionnaires:', error);
        setError('Failed to load pre-visit questionnaires');
        toast.error('Failed to load pre-visit questionnaires');
        setQuestionnaires([]); // Set empty array in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchPendingQuestionnaires();
  }, [currentUser]);

  // Handle question answer changes
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Submit questionnaire answers
  const handleSubmit = async () => {
    if (!selectedQuestionnaire) return;
    
    try {
      setSubmitLoading(true);
      
      // Format answers for submission
      const formattedAnswers = Object.keys(answers).map(questionId => ({
        questionId,
        answer: answers[questionId]
      }));
      
      // Submit answers to API
      await updateTriageAnswers(selectedQuestionnaire._id, formattedAnswers);
      
      // Show success message
      toast.success('Pre-visit questionnaire submitted successfully!');
      
      // Remove this questionnaire from the list
      setQuestionnaires(prev => prev.filter(q => q._id !== selectedQuestionnaire._id));
      
      // Go back to the list
      setSelectedQuestionnaire(null);
      setAnswers({});
      
    } catch (error) {
      console.error('Error submitting questionnaire answers:', error);
      toast.error('Failed to submit questionnaire answers. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Render list of pending questionnaires
  const renderQuestionnaireList = () => {
    if (questionnaires.length === 0) {
      return (
        <div className="text-center p-5">
          <FaClipboardCheck className="text-muted mb-3" size={40} />
          <h5>No pending questionnaires</h5>
          <p>You don't have any pending pre-visit questionnaires to complete.</p>
          <Link to="/patient/appointments">
            <Button color="primary">
              View Appointments
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <>
        <p className="mb-4">Please complete these pre-visit questionnaires to help your provider prepare for your appointment.</p>
        
        {questionnaires.map((questionnaire) => (
          <Card key={questionnaire._id} className="questionnaire-card mb-3">
            <CardBody>
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="appointment-icon me-3">
                      <FaStethoscope className="text-primary" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1">
                        Appointment with Dr. {questionnaire.appointmentId.doctorName || 'Provider'}
                      </h5>
                      <div className="text-muted">
                        <FaCalendarAlt className="me-1" size={12} />
                        <span className="me-3">{new Date(questionnaire.appointmentId.date).toLocaleDateString()}</span>
                        <FaClock className="me-1" size={12} />
                        <span>{questionnaire.appointmentId.time}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mb-1">
                    <strong>Reason for visit:</strong> {questionnaire.generatedFromReason}
                  </p>
                  <div className="d-flex align-items-center mb-1">
                    <small className="me-2">This questionnaire contains {questionnaire.questions.length} questions about your condition.</small>
                    <AIConfidenceIndicator 
                      metadata={questionnaire.metadata} 
                      size="sm" 
                      showCategory={false}
                    />
                  </div>
                  <p className="mb-0">
                    <small className="text-muted">Your answers will help your provider prepare for your visit.</small>
                  </p>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <Button
                    color="primary"
                    onClick={() => {
                      setSelectedQuestionnaire(questionnaire);
                      setAnswers({}); // Reset answers
                    }}
                  >
                    Complete Questionnaire
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        ))}
      </>
    );
  };

  // Render the selected questionnaire
  const renderQuestionnaire = () => {
    if (!selectedQuestionnaire) return null;

    const progress = calculateProgress();
    const canSubmit = areAllRequiredQuestionsAnswered();

    return (
      <div className="selected-questionnaire">
        <div className="d-flex align-items-center mb-4">
          <Button color="link" className="p-0 me-3" onClick={() => setSelectedQuestionnaire(null)}>
            <FaArrowLeft size={16} />
          </Button>
          <h4 className="mb-0">Pre-visit Questionnaire</h4>
        </div>

        <Card className="appointment-info-card mb-4">
          <CardBody>
            <h5 className="mb-4">Appointment Information</h5>
            <Row>
              <Col md={6}>
                <div className="d-flex align-items-center mb-3">
                  <FaUserMd className="me-3 text-primary" size={18} />
                  <div>
                    <div className="text-muted small">Provider</div>
                    <div className="fw-bold">{selectedQuestionnaire.doctorName || 'Provider'}</div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center mb-3">
                  <FaCalendarAlt className="me-3 text-primary" size={18} />
                  <div>
                    <div className="text-muted small">Date & Time</div>
                    <div className="fw-bold">
                      {new Date(selectedQuestionnaire.appointmentId.date).toLocaleDateString()} at {selectedQuestionnaire.appointmentId.time}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            <div>
              <div className="text-muted small">Reason for Visit</div>
              <div className="reason-text">{selectedQuestionnaire.generatedFromReason}</div>
            </div>
          </CardBody>
        </Card>

        <div className="progress-container mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span>Questionnaire Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>

        <Alert color="info" className="mb-4">
          <div className="d-flex">
            <FaRobot className="me-2 mt-1" size={18} />
            <div>
              <p className="mb-0">
                <strong>Why am I being asked these questions?</strong>
              </p>
              <p className="mb-0 small">
                These questions were generated based on your reason for visit. Your answers will help your provider prepare for your appointment and may reduce the time needed during your visit.
              </p>
              {selectedQuestionnaire.metadata && (
                <div className="mt-2 pt-2 border-top">
                  <div className="d-flex align-items-center text-muted small">
                    <span className="me-2">Question Generation:</span>
                    <AIConfidenceIndicator 
                      metadata={selectedQuestionnaire.metadata} 
                      size="sm" 
                      showCategory={true}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Alert>

        <Form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <h5 className="mb-4">Please answer all questions below</h5>
          
          {selectedQuestionnaire.questions.map((question) => (
            <Card key={question.id} className="question-card mb-3">
              <CardBody>
                <FormGroup>
                  <Label className="fw-bold">
                    {question.question}
                    {question.required && <span className="text-danger ms-1">*</span>}
                  </Label>

                  {question.type === 'multiple_choice' && (
                    <div className="mt-2">
                      {question.options.map((option, idx) => (
                        <div key={idx} className="form-check">
                          <Input
                            type="radio"
                            id={`question-${question.id}-${idx}`}
                            name={`question-${question.id}`}
                            className="form-check-input"
                            checked={answers[question.id] === option}
                            onChange={() => handleAnswerChange(question.id, option)}
                            required={question.required}
                          />
                          <Label className="form-check-label" for={`question-${question.id}-${idx}`}>
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'severity_scale' && (
                    <div className="mt-3">
                      <div className="severity-scale">
                        {Array.from({length: (question.max - question.min) + 1}, (_, i) => question.min + i).map(num => (
                          <Label key={num} className="severity-option">
                            <Input
                              type="radio"
                              name={`question-${question.id}`}
                              className="severity-input"
                              value={num.toString()}
                              checked={answers[question.id] === num.toString()}
                              onChange={() => handleAnswerChange(question.id, num.toString())}
                              required={question.required}
                            />
                            {num}
                          </Label>
                        ))}
                      </div>
                      <div className="severity-labels">
                        <span className="small">{question.minLabel || 'Min'}</span>
                        <span className="small">{question.maxLabel || 'Max'}</span>
                      </div>
                    </div>
                  )}

                  {question.type === 'yes_no' && (
                    <div className="mt-2">
                      <div className="form-check form-check-inline">
                        <Input
                          type="radio"
                          id={`question-${question.id}-yes`}
                          name={`question-${question.id}`}
                          className="form-check-input"
                          value="Yes"
                          checked={answers[question.id] === "Yes"}
                          onChange={() => handleAnswerChange(question.id, "Yes")}
                          required={question.required}
                        />
                        <Label className="form-check-label" for={`question-${question.id}-yes`}>Yes</Label>
                      </div>
                      <div className="form-check form-check-inline">
                        <Input
                          type="radio"
                          id={`question-${question.id}-no`}
                          name={`question-${question.id}`}
                          className="form-check-input"
                          value="No"
                          checked={answers[question.id] === "No"}
                          onChange={() => handleAnswerChange(question.id, "No")}
                          required={question.required}
                        />
                        <Label className="form-check-label" for={`question-${question.id}-no`}>No</Label>
                      </div>
                    </div>
                  )}

                  {question.type === 'text' && (
                    <Input
                      type="textarea"
                      id={`question-${question.id}`}
                      className="mt-2"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Type your answer here..."
                      rows="2"
                      required={question.required}
                    />
                  )}
                </FormGroup>
              </CardBody>
            </Card>
          ))}

          <div className="d-flex justify-content-between mt-4">
            <Button type="button" color="secondary" onClick={() => setSelectedQuestionnaire(null)}>
              Back to List
            </Button>
            <Button
              type="submit"
              color="success"
              disabled={!canSubmit || submitLoading}
            >
              {submitLoading ? (
                <><Spinner size="sm" className="me-2" />Submitting...</>
              ) : (
                <>Submit Answers</>
              )}
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  return (
    <div className="patient-triage-page">
      <Container className="py-4">
        <Card className="mb-4 shadow-sm border-0">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <FaClipboardCheck className="text-primary me-3" size={28} />
                <h2 className="mb-0">Pre-visit Questionnaires</h2>
              </div>
              
              <Link to="/patient/appointments">
                <Button color="outline-primary" size="sm">
                  <FaCalendarAlt className="me-1" /> View Appointments
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2">Loading your questionnaires...</p>
          </div>
        ) : error ? (
          <Alert color="danger">
            {error}
          </Alert>
        ) : selectedQuestionnaire ? (
          renderQuestionnaire()
        ) : (
          renderQuestionnaireList()
        )}
      </Container>
    </div>
  );
};

export default PatientTriage;