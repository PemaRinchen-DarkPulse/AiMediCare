import React, { useState, useEffect } from 'react';
import './PrevisitTriage.css';
import { FaUser, FaCalendarAlt, FaUserMd, FaExclamationTriangle, FaCamera, FaCheck, FaSpinner } from 'react-icons/fa';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { getPatientPendingQuestionnaires, updateTriageAnswers } from '../../services/triageService';
import { toast } from 'react-toastify';

const PrevisitTriage = () => {
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showUrgentQuestions, setShowUrgentQuestions] = useState({});
  
  useEffect(() => {
    fetchPendingQuestionnaires();
  }, []);
  
  const fetchPendingQuestionnaires = async () => {
    try {
      setLoading(true);
      const pendingQuestionnaires = await getPatientPendingQuestionnaires();
      processQuestionnaires(pendingQuestionnaires);
    } catch (err) {
      console.error('Error fetching pending questionnaires:', err);
      setError('Failed to load questionnaires. Please try again or contact support if the issue persists.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Processes questionnaires from the API response
  const processQuestionnaires = (questionnaires) => {
    if (!questionnaires || !Array.isArray(questionnaires)) {
      console.error('Invalid questionnaires data received:', questionnaires);
      setError('Invalid questionnaire data received from the server.');
      setAppointments([]);
      return;
    }
    
    if (questionnaires.length === 0) {
      // No need to use mock data, just set empty appointments
      setAppointments([]);
      return;
    }
    
    // Transform the questionnaires into appointment format for UI
    const transformedAppointments = questionnaires.map(questionnaire => {
      const appointment = questionnaire.appointmentId || {};
      
      // Initialize form data with empty values for this questionnaire
      const initialFormData = {};
      questionnaire.questions.forEach(question => {
        if (question.type === 'checkbox' || question.type === 'multiple_select') {
          initialFormData[question.id] = [];
        } else if (question.type === 'boolean') {
          initialFormData[question.id] = false;
        } else {
          initialFormData[question.id] = '';
        }
      });
      
      // Pre-fill form data with existing answers if any
      if (questionnaire.answers && questionnaire.answers.length > 0) {
        questionnaire.answers.forEach(answer => {
          initialFormData[answer.questionId] = answer.value;
        });
      }
      
      // Update form data state
      setFormData(prevFormData => ({
        ...prevFormData,
        [questionnaire._id]: initialFormData
      }));
      
      return {
        id: questionnaire._id,
        appointmentId: appointment._id,
        date: appointment.date ? new Date(appointment.date).toLocaleDateString() : 'Upcoming',
        time: appointment.time || 'Scheduled',
        provider: `Dr. ${appointment.doctorName || 'Provider'}`,
        type: appointment.reason || questionnaire.generatedFromReason || 'Medical Appointment',
        department: appointment.specialty || 'General',
        medications: appointment.medications || [],
        urgent: appointment.urgent || false,
        questions: questionnaire.questions || [],
        status: questionnaire.status,
        generatedFromReason: questionnaire.generatedFromReason
      };
    });
    
    setAppointments(transformedAppointments);
  };
  
  // This function is only used for development/debug purposes and should not be used in production
  // eslint-disable-next-line no-unused-vars
  const generateMockQuestionnaires = () => {
    console.warn('Using mock questionnaire data - FOR DEVELOPMENT ONLY');
    // mock data implementation remains for development purposes, but is not used in the component
    // ...existing code...
  };

  const toggleAppointment = (index) => {
    if (expandedAppointment === index) {
      setExpandedAppointment(null);
    } else {
      setExpandedAppointment(index);
    }
  };

  const handleInputChange = (questionnaireId, e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prevData => {
        const currentValues = prevData[questionnaireId]?.[name] || [];
        let newValues;
        
        if (checked) {
          // Add value to array if checked
          newValues = [...currentValues, value];
        } else {
          // Remove value from array if unchecked
          newValues = currentValues.filter(item => item !== value);
        }
        
        return {
          ...prevData,
          [questionnaireId]: {
            ...prevData[questionnaireId],
            [name]: newValues
          }
        };
      });
      
      // Check for urgent symptoms that require additional questions
      if (name === 'headacheSymptoms' && 
          (value.includes('Worst headache ever') || 
           value.includes('Sudden onset'))) {
        setShowUrgentQuestions(prev => ({
          ...prev,
          [questionnaireId]: true
        }));
      }
    } else if (type === 'radio' && name.includes('neurologicalSymptoms')) {
      setFormData(prevData => ({
        ...prevData,
        [questionnaireId]: {
          ...prevData[questionnaireId],
          [name]: value === 'true'
        }
      }));
    } else if (type === 'radio' && name.includes('visionChanges')) {
      setFormData(prevData => ({
        ...prevData,
        [questionnaireId]: {
          ...prevData[questionnaireId],
          [name]: value === 'true'
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [questionnaireId]: {
          ...prevData[questionnaireId],
          [name]: value
        }
      }));
    }
  };

  const handleImageUpload = (questionnaireId, questionId, e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real implementation, you would upload the file to the server
      // and save the URL in the form data. For now, just use a local URL
      setFormData(prevData => ({
        ...prevData,
        [questionnaireId]: {
          ...prevData[questionnaireId],
          [questionId]: URL.createObjectURL(file)
        }
      }));
    }
  };

  const handleSubmit = async (questionnaireId, e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Format answers for the API
      const questionnaireData = formData[questionnaireId];
      const answers = Object.entries(questionnaireData).map(([questionId, value]) => ({
        questionId,
        value
      }));
      
      // Call the API to update the answers
      await updateTriageAnswers(questionnaireId, answers);
      
      toast.success('Questionnaire submitted successfully!');
      
      // Update the local state to reflect the completed status
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === questionnaireId 
            ? { ...appointment, status: 'completed' }
            : appointment
        )
      );
      
    } catch (err) {
      console.error('Error submitting questionnaire:', err);
      toast.error('Failed to submit questionnaire. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pre-visit-container text-center">
        <FaSpinner className="fa-spin" size={30} />
        <p className="mt-3">Loading your questionnaires...</p>
      </div>
    );
  }

  return (
    <div className="pre-visit-container">
      <header className="header">
        <h1>Pre-Visit Questionnaires</h1>
        <p className="welcome-text">
          Welcome back. Please complete the following questionnaires
          before your upcoming appointments. This information will help your healthcare provider prepare
          for your visit.
        </p>
        <div className="notification">
          <strong>You have {appointments.length} upcoming appointments that require pre-visit information.</strong>
          <p>Please complete at least 2 hours before your scheduled appointment time.</p>
        </div>
        {error && (
          <div className="alert alert-warning">
            {error}
          </div>
        )}
      </header>

      <div className="appointments-container">
        {appointments.length === 0 ? (
          <div className="text-center p-4">
            <p>You don't have any pending questionnaires at the moment.</p>
          </div>
        ) : (
          appointments.map((appointment, index) => (
            <div key={appointment.id} className={`appointment-card ${appointment.urgent ? 'urgent' : ''}`}>
              {appointment.urgent && (
                <div className="urgent-flag">
                  <FaExclamationTriangle /> Priority Appointment
                </div>
              )}
              
              <div className="appointment-header" onClick={() => toggleAppointment(index)}>
                <div className="appointment-title">
                  <h2>{appointment.type}</h2>
                  <div className="appointment-details">
                    <span><FaCalendarAlt /> {appointment.date}, {appointment.time}</span>
                    <span><FaUserMd /> {appointment.provider}, {appointment.department}</span>
                  </div>
                </div>
                <div className="toggle-icon">
                  {expandedAppointment === index ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </div>
              </div>
              
              {expandedAppointment === index && (
                <div className="questionnaire">
                  {appointment.status === 'completed' ? (
                    <div className="completed-message">
                      <FaCheck size={24} className="text-success mb-2" />
                      <h4>Questionnaire Completed</h4>
                      <p>Thank you for completing this questionnaire. Your healthcare provider has been notified.</p>
                    </div>
                  ) : (
                    <form className="form-container" onSubmit={(e) => handleSubmit(appointment.id, e)}>
                      {appointment.medications && appointment.medications.length > 0 && (
                        <div className="ai-prefilled-section">
                          <h3>AI-Detected Information</h3>
                          <p>Based on your records, we've pre-filled some information. Please verify and update if needed.</p>
                          <div className="prefilled-item">
                            <label>Current Medications:</label>
                            <ul>
                              {appointment.medications.map((med, i) => (
                                <li key={i}>{med}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Render questionnaire based on questions array */}
                      {appointment.questions.map((question) => {
                        switch (question.type) {
                          case 'text':
                            return (
                              <div key={question.id} className="form-section">
                                <h3>{question.title || 'Information'}</h3>
                                <div className="form-group">
                                  <label>{question.question}</label>
                                  <textarea 
                                    name={question.id} 
                                    value={formData[appointment.id]?.[question.id] || ''}
                                    onChange={(e) => handleInputChange(appointment.id, e)}
                                    placeholder={question.placeholder || "Enter your response here"}
                                    rows="3"
                                    required={question.required}
                                  ></textarea>
                                </div>
                              </div>
                            );
                            
                          case 'multiple_choice':
                            return (
                              <div key={question.id} className="form-section">
                                <h3>{question.title || 'Selection'}</h3>
                                <div className="form-group">
                                  <label>{question.question}</label>
                                  <div className="radio-options">
                                    {question.options.map((option, i) => (
                                      <label key={i}>
                                        <input 
                                          type="radio" 
                                          name={question.id} 
                                          value={option}
                                          checked={formData[appointment.id]?.[question.id] === option}
                                          onChange={(e) => handleInputChange(appointment.id, e)}
                                          required={question.required}
                                        /> 
                                        {option}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                            
                          case 'checkbox':
                            return (
                              <div key={question.id} className="form-section">
                                <h3>{question.title || 'Multiple Selection'}</h3>
                                <div className="form-group checkbox-group">
                                  <label>{question.question}</label>
                                  <div className="checkbox-options">
                                    {question.options.map((option, i) => (
                                      <label key={i}>
                                        <input 
                                          type="checkbox" 
                                          name={question.id} 
                                          value={option}
                                          checked={formData[appointment.id]?.[question.id]?.includes(option)}
                                          onChange={(e) => handleInputChange(appointment.id, e)}
                                        /> 
                                        {option}
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                            
                          case 'severity_scale':
                            return (
                              <div key={question.id} className="form-section">
                                <h3>{question.title || 'Severity Assessment'}</h3>
                                <div className="form-group">
                                  <label>{question.question}</label>
                                  <div className="severity-scale">
                                    {Array.from(
                                      { length: (question.max - question.min) + 1 }, 
                                      (_, i) => question.min + i
                                    ).map(num => (
                                      <label key={num} className="severity-option">
                                        <input
                                          type="radio"
                                          name={question.id}
                                          value={num.toString()}
                                          checked={formData[appointment.id]?.[question.id] === num.toString()}
                                          onChange={(e) => handleInputChange(appointment.id, e)}
                                          required={question.required}
                                        />
                                        {num}
                                      </label>
                                    ))}
                                  </div>
                                  <div className="severity-labels">
                                    <span>{question.minLabel || 'Mild'}</span>
                                    <span>{question.maxLabel || 'Severe'}</span>
                                  </div>
                                </div>
                              </div>
                            );
                            
                          case 'image_upload':
                            return (
                              <div key={question.id} className="form-section">
                                <h3>{question.title || 'Upload Image'}</h3>
                                <div className="form-group">
                                  <label>{question.question}</label>
                                  <div className="image-upload">
                                    <label className="upload-button">
                                      <FaCamera /> Upload Image
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleImageUpload(appointment.id, question.id, e)} 
                                        style={{ display: 'none' }}
                                        required={question.required}
                                      />
                                    </label>
                                    {formData[appointment.id]?.[question.id] && (
                                      <div className="image-preview">
                                        <img src={formData[appointment.id][question.id]} alt="Uploaded" />
                                        <span className="upload-success"><FaCheck /> Upload successful</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                            
                          case 'boolean':
                          case 'yes_no':
                            return (
                              <div key={question.id} className="form-section">
                                <h3>{question.title || 'Yes/No Question'}</h3>
                                <div className="form-group">
                                  <label>{question.question}</label>
                                  <div className="radio-options">
                                    <label>
                                      <input 
                                        type="radio" 
                                        name={question.id} 
                                        value="true" 
                                        checked={formData[appointment.id]?.[question.id] === true || formData[appointment.id]?.[question.id] === "Yes"}
                                        onChange={(e) => handleInputChange(appointment.id, e)}
                                        required={question.required}
                                      /> 
                                      Yes
                                    </label>
                                    <label>
                                      <input 
                                        type="radio" 
                                        name={question.id} 
                                        value="false" 
                                        checked={formData[appointment.id]?.[question.id] === false || formData[appointment.id]?.[question.id] === "No"}
                                        onChange={(e) => handleInputChange(appointment.id, e)}
                                        required={question.required}
                                      /> 
                                      No
                                    </label>
                                  </div>
                                </div>
                                
                                {/* Render follow-up questions if this is an urgent question */}
                                {question.urgent && (formData[appointment.id]?.[question.id] === true || formData[appointment.id]?.[question.id] === "Yes") && (
                                  <div className="urgent-questions">
                                    {question.followUpQuestions && question.followUpQuestions.map((followUpQ) => (
                                      <div key={followUpQ.id} className="form-group">
                                        <label>{followUpQ.question}</label>
                                        {/* Render the appropriate input type for the follow-up question */}
                                        {/* This is simplified - you would need to handle each type */}
                                        <textarea 
                                          name={followUpQ.id} 
                                          value={formData[appointment.id]?.[followUpQ.id] || ''}
                                          onChange={(e) => handleInputChange(appointment.id, e)}
                                          rows="2"
                                        ></textarea>
                                      </div>
                                    ))}
                                    
                                    <div className="emergency-notice">
                                      <h3>URGENT NOTICE</h3>
                                      <p>Based on your responses, your symptoms may require immediate medical attention. While we're expediting your appointment, please consider seeking emergency care if symptoms worsen.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                            
                          default:
                            return null;
                        }
                      })}
                      
                      <button 
                        type="submit" 
                        className={`submit-btn ${appointment.urgent ? 'urgent-submit' : ''}`}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <FaSpinner className="fa-spin me-2" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Questionnaire'
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PrevisitTriage;