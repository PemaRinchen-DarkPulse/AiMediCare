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
  FaCalendarAlt, FaClock, FaUserMd, FaCheck, FaClipboardList
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { previsitTriageService } from '../../services/previsitTriageService';
import QuestionnaireForm from '../../components/questionnaire/QuestionnaireForm';
import './PatientTriage.css';

const PatientTriage = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [triageData, setTriageData] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch patient's triage data from database
  useEffect(() => {
    const fetchTriageData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Current user:', currentUser);
        console.log('🔍 Auth token:', localStorage.getItem('token'));
        
        if (!currentUser || !currentUser._id) {
          console.log('❌ No user or user ID available');
          setError('User information not available. Please log in again.');
          return;
        }

        console.log('📡 Fetching triage data for patient:', currentUser._id);
        
        // Fetch all triage data for the patient
        const data = await previsitTriageService.getPatientTriageData();
        console.log('🔍 Fetched triage data:', data);
        console.log('🔍 Data type:', typeof data);
        console.log('🔍 Is array:', Array.isArray(data));
        setTriageData(Array.isArray(data) ? data : []);
        
      } catch (error) {
        console.error('❌ Error fetching triage data:', error);
        console.error('❌ Error details:', error.message);
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setError('Authentication error. Please log in again.');
        } else if (error.message.includes('403') || error.message.includes('Access denied')) {
          setError('Access denied. You do not have permission to view this data.');
        } else if (error.message.includes('500')) {
          setError('Server error. Please try again later.');
        } else {
          setError('Failed to load pre-visit questionnaires. Please check your connection and try again.');
        }
        
        toast.error('Failed to load pre-visit questionnaires');
        setTriageData([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTriageData();
    } else {
      console.log('⏳ Waiting for user authentication...');
      setLoading(false);
    }
  }, [currentUser, refreshTrigger]);

  // Handle questionnaire completion
  const handleQuestionnaireComplete = (completedQuestionnaire) => {
    toast.success('Questionnaire completed successfully!');
    setSelectedAppointment(null);
    setRefreshTrigger(prev => prev + 1); // Refresh the data
  };

  // Handle questionnaire regeneration
  const handleRegenerateQuestionnaire = async (triageId) => {
    try {
      setLoading(true);
      console.log('🔄 Regenerating questionnaire for triage:', triageId);
      
      const regeneratedQuestionnaire = await previsitTriageService.regenerateQuestionnaire(triageId);
      
      console.log('✅ Questionnaire regenerated:', regeneratedQuestionnaire);
      toast.success('Questions generated successfully!');
      
      // Refresh the data to show the new questions
      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('❌ Error regenerating questionnaire:', error);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get urgency badge variant
  const getUrgencyBadgeVariant = (urgencyLevel) => {
    switch (urgencyLevel?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  // Filter questionnaires that need completion
  const pendingQuestionnaires = triageData.filter(triage => 
    !triage.isCompleted && (triage.status === 'pending' || triage.status === 'generated')
  );

  const completedQuestionnaires = triageData.filter(triage => 
    triage.isCompleted
  );

  // Render list of pending questionnaires
  const renderQuestionnaireList = () => {
    if (pendingQuestionnaires.length === 0) {
      return (
        <div className="text-center p-5">
          <FaClipboardCheck className="text-muted mb-3" size={40} />
          <h5>No pending questionnaires</h5>
          <p>You don't have any pending pre-visit questionnaires to complete.</p>
          
          {completedQuestionnaires.length > 0 && (
            <div className="mt-4">
              <h6>Completed Questionnaires</h6>
              <p className="text-muted">You have {completedQuestionnaires.length} completed questionnaire(s).</p>
            </div>
          )}
          
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
        <Alert color="info" className="mb-4">
          <div className="d-flex">
            <FaClipboardList className="me-2 mt-1" size={18} />
            <div>
              <p className="mb-1"><strong>Complete your pre-visit questionnaires</strong></p>
              <p className="mb-0 small">
                These questionnaires help your healthcare provider prepare for your appointment and may reduce waiting time.
              </p>
            </div>
          </div>
        </Alert>

        <h5 className="mb-3">Pending Questionnaires ({pendingQuestionnaires.length})</h5>
        
        {pendingQuestionnaires.map((triage) => (
          <Card key={triage._id} className="questionnaire-card mb-3 shadow-sm">
            <CardBody>
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="appointment-icon me-3">
                      <FaStethoscope className="text-primary" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1">{triage.title}</h5>
                      <div className="text-muted">
                        <FaUserMd className="me-1" size={12} />
                        <span className="me-3">Dr. {triage.doctorId?.name || 'Provider'}</span>
                        {triage.appointmentId?.date && (
                          <>
                            <FaCalendarAlt className="me-1" size={12} />
                            <span className="me-3">{new Date(triage.appointmentId.date).toLocaleDateString()}</span>
                          </>
                        )}
                        {triage.appointmentId?.time && (
                          <>
                            <FaClock className="me-1" size={12} />
                            <span>{triage.appointmentId.time}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <strong>Reason for visit:</strong> {triage.reasonForVisit}
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <Badge color={getUrgencyBadgeVariant(triage.urgencyLevel)} className="me-2">
                      {triage.urgencyLevel} Priority
                    </Badge>
                    {triage.aiGenerated && (
                      <Badge color="info">AI Generated</Badge>
                    )}
                  </div>
                  
                  <div className="progress-info">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small>Progress: {triage.completionPercentage || 0}%</small>
                      <small>{triage.questions?.length || 0} questions</small>
                    </div>
                    <Progress 
                      value={triage.completionPercentage || 0} 
                      color={triage.completionPercentage === 100 ? 'success' : 'primary'}
                      style={{ height: '4px' }}
                    />
                  </div>
                  
                  {(!triage.questions || triage.questions.length === 0) && (
                    <Alert color="warning" className="mt-2 mb-2">
                      <small>Questions need to be generated for this questionnaire.</small>
                    </Alert>
                  )}
                  
                  <p className="mb-0 mt-2">
                    <small>Estimated duration: {triage.estimatedDuration}</small>
                  </p>
                </Col>
                
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  {(!triage.questions || triage.questions.length === 0) ? (
                    <Button
                      color="success"
                      onClick={() => handleRegenerateQuestionnaire(triage._id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <><Spinner size="sm" className="me-2" />Generating...</>
                      ) : (
                        'Generate Questions'
                      )}
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      onClick={() => setSelectedAppointment(triage.appointmentId?._id || triage.appointmentId)}
                    >
                      {triage.completionPercentage > 0 ? 'Continue' : 'Start'} Questionnaire
                    </Button>
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        ))}

        {completedQuestionnaires.length > 0 && (
          <div className="mt-5">
            <h5 className="mb-3">Completed Questionnaires ({completedQuestionnaires.length})</h5>
            {completedQuestionnaires.map((triage) => (
              <Card key={triage._id} className="mb-2 border-success">
                <CardBody className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small><strong>{triage.title}</strong></small>
                      <br />
                      <small className="text-muted">
                        Completed on {new Date(triage.completedAt).toLocaleDateString()}
                      </small>
                    </div>
                    <Badge color="success">
                      <FaCheck className="me-1" size={12} />
                      Completed
                    </Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </>
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
                <div>
                  <h2 className="mb-0">Pre-visit Questionnaires</h2>
                  <small className="text-muted">Complete questionnaires to help your provider prepare</small>
                </div>
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
            <div className="mt-2">
              <Button 
                color="primary" 
                size="sm" 
                onClick={() => setRefreshTrigger(prev => prev + 1)}
              >
                Try Again
              </Button>
            </div>
          </Alert>
        ) : selectedAppointment ? (
          <div>
            <div className="d-flex align-items-center mb-4">
              <Button 
                color="link" 
                className="p-0 me-3" 
                onClick={() => setSelectedAppointment(null)}
              >
                <FaArrowLeft size={16} />
              </Button>
              <h4 className="mb-0">Complete Questionnaire</h4>
            </div>
            
            <QuestionnaireForm
              appointmentId={selectedAppointment}
              onComplete={handleQuestionnaireComplete}
              userRole="patient"
            />
          </div>
        ) : (
          renderQuestionnaireList()
        )}
      </Container>
    </div>
  );
};

export default PatientTriage;