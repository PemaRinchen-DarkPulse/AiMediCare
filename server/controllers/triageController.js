const TriageQuestionnaire = require('../models/TriageQuestionnaire');
const Appointment = require('../models/Appointment');
const aiServiceClient = require('../utils/aiServiceClient');

// Create a new triage questionnaire with AI integration
exports.createTriageQuestionnaire = async (req, res) => {
  try {
    const { appointmentId, questions, generatedFromReason, generatedFromNotes, useAI = true } = req.body;
    
    // Find the appointment to verify it exists and get patientId and doctorId
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    
    let finalQuestions = questions;
    let aiMetadata = {};
    
    // If no questions provided, generate them using AI service
    if (!questions || questions.length === 0) {
      console.log('No questions provided, generating using AI service...');
      
      const aiRequest = {
        appointmentReason: generatedFromReason,
        additionalNotes: generatedFromNotes,
        patientId: appointment.patientId.toString(),
        doctorId: appointment.doctorId.toString(),
        appointmentId: appointmentId,
        useAI: useAI,
        maxQuestions: 5
      };
      
      const aiResponse = await aiServiceClient.generateTriageQuestions(aiRequest);
      
      if (aiResponse.success) {
        finalQuestions = aiResponse.data.questions;
        aiMetadata = {
          generation_method: aiResponse.data.generation_method,
          confidence_score: aiResponse.data.confidence_score,
          processing_time: aiResponse.data.processing_time,
          ai_generated: true,
          ...aiResponse.data.metadata
        };
        console.log(`Generated ${finalQuestions.length} questions using ${aiResponse.data.generation_method}`);
      } else {
        console.warn('AI generation failed, using fallback questions');
        // Get fallback questions
        const fallbackResponse = await aiServiceClient.getFallbackQuestions({
          categories: ['general'],
          language: 'en',
          maxQuestions: 5
        });
        
        if (fallbackResponse.success) {
          finalQuestions = fallbackResponse.data.questions;
          aiMetadata = {
            generation_method: 'fallback',
            confidence_score: 0.8,
            ai_generated: false,
            fallback_reason: aiResponse.error
          };
        } else {
          // Emergency fallback - basic questions
          finalQuestions = [
            {
              id: 'emergency_1',
              type: 'text',
              question: 'Please describe your symptoms in detail:',
              required: true
            }
          ];
          aiMetadata = {
            generation_method: 'emergency_fallback',
            confidence_score: 0.6,
            ai_generated: false
          };
        }
      }
    }
    
    // Create new triage questionnaire
    const newQuestionnaire = new TriageQuestionnaire({
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      questions: finalQuestions,
      generatedFromReason,
      generatedFromNotes,
      answers: [], // Initially no answers
      aiMetadata: aiMetadata // Store AI generation metadata
    });
    
    // Save the questionnaire
    await newQuestionnaire.save();
    
    // Update the appointment with reference to the questionnaire
    appointment.triageQuestionnaireId = newQuestionnaire._id;
    await appointment.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        questionnaire: newQuestionnaire
      }
    });
    
  } catch (error) {
    console.error('Error creating triage questionnaire:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create triage questionnaire',
      error: error.message
    });
  }
};

// Get triage questionnaires for a specific appointment
exports.getTriageQuestionnaireByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const questionnaire = await TriageQuestionnaire.findOne({ appointmentId });
    
    if (!questionnaire) {
      return res.status(404).json({
        status: 'error',
        message: 'No triage questionnaire found for this appointment'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        questionnaire
      }
    });
    
  } catch (error) {
    console.error('Error fetching triage questionnaire:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch triage questionnaire',
      error: error.message
    });
  }
};

// Update triage questionnaire answers
exports.updateTriageAnswers = async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    const { answers } = req.body;
    
    const questionnaire = await TriageQuestionnaire.findById(questionnaireId);
    
    if (!questionnaire) {
      return res.status(404).json({
        status: 'error',
        message: 'Triage questionnaire not found'
      });
    }
    
    // Update answers and set status to completed
    questionnaire.answers = answers;
    questionnaire.status = 'completed';
    
    await questionnaire.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        questionnaire
      }
    });
    
  } catch (error) {
    console.error('Error updating triage answers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update triage answers',
      error: error.message
    });
  }
};

// Get all pending triage questionnaires for a patient
exports.getPatientPendingQuestionnaires = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    const questionnaires = await TriageQuestionnaire.find({
      patientId,
      status: 'pending'
    }).populate('appointmentId');
    
    res.status(200).json({
      status: 'success',
      results: questionnaires.length,
      data: {
        questionnaires
      }
    });
    
  } catch (error) {
    console.error('Error fetching patient pending questionnaires:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending questionnaires',
      error: error.message
    });
  }
};

// Get all pending triage questionnaires for the current authenticated patient
exports.getCurrentPatientPendingQuestionnaires = async (req, res) => {
  try {
    // Get the current user ID from the authenticated request
    const patientId = req.user.id;
    
    // Find questionnaires where the patient ID matches the current user and status is pending
    const questionnaires = await TriageQuestionnaire.find({
      patientId,
      status: 'pending'
    }).populate('appointmentId');
    
    res.status(200).json({
      status: 'success',
      results: questionnaires.length,
      data: {
        questionnaires
      }
    });
    
  } catch (error) {
    console.error('Error fetching current patient pending questionnaires:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending questionnaires',
      error: error.message
    });
  }
};

// Generate triage questions using AI service
exports.generateTriageQuestions = async (req, res) => {
  try {
    const { 
      appointmentReason, 
      additionalNotes, 
      language = 'en', 
      useAI = true, 
      maxQuestions = 5,
      specialty 
    } = req.body;
    
    if (!appointmentReason) {
      return res.status(400).json({
        status: 'error',
        message: 'Appointment reason is required'
      });
    }
    
    const aiRequest = {
      appointmentReason,
      additionalNotes,
      language,
      useAI,
      maxQuestions,
      specialty
    };
    
    const aiResponse = await aiServiceClient.generateTriageQuestions(aiRequest);
    
    if (aiResponse.success) {
      res.status(200).json({
        status: 'success',
        data: aiResponse.data
      });
    } else {
      // Try fallback questions
      const fallbackResponse = await aiServiceClient.getFallbackQuestions({
        categories: ['general'],
        language,
        maxQuestions
      });
      
      if (fallbackResponse.success) {
        res.status(200).json({
          status: 'success',
          data: {
            ...fallbackResponse.data,
            generation_method: 'fallback',
            fallback_reason: aiResponse.error
          }
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Failed to generate triage questions',
          error: aiResponse.error
        });
      }
    }
    
  } catch (error) {
    console.error('Error generating triage questions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate triage questions',
      error: error.message
    });
  }
};

// Analyze appointment reason using AI service
exports.analyzeAppointmentReason = async (req, res) => {
  try {
    const { reason, notes = '' } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        status: 'error',
        message: 'Appointment reason is required'
      });
    }
    
    const analysisResponse = await aiServiceClient.analyzeAppointmentReason(reason, notes);
    
    if (analysisResponse.success) {
      res.status(200).json({
        status: 'success',
        data: analysisResponse.data
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: analysisResponse.fallback,
        fallback: true,
        error: analysisResponse.error
      });
    }
    
  } catch (error) {
    console.error('Error analyzing appointment reason:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze appointment reason',
      error: error.message
    });
  }
};

// Get AI service health status
exports.getAIServiceHealth = async (req, res) => {
  try {
    const healthResponse = await aiServiceClient.healthCheck();
    
    res.status(200).json({
      status: 'success',
      data: healthResponse
    });
    
  } catch (error) {
    console.error('Error checking AI service health:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check AI service health',
      error: error.message
    });
  }
};

// Get supported languages from AI service
exports.getSupportedLanguages = async (req, res) => {
  try {
    const languagesResponse = await aiServiceClient.getSupportedLanguages();
    
    if (languagesResponse.success) {
      res.status(200).json({
        status: 'success',
        data: languagesResponse.data
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: languagesResponse.fallback,
        fallback: true
      });
    }
    
  } catch (error) {
    console.error('Error getting supported languages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get supported languages',
      error: error.message
    });
  }
};