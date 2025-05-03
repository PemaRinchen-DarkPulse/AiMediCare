const TriageQuestionnaire = require('../models/TriageQuestionnaire');
const Appointment = require('../models/Appointment');

// Create a new triage questionnaire
exports.createTriageQuestionnaire = async (req, res) => {
  try {
    const { appointmentId, questions, generatedFromReason, generatedFromNotes } = req.body;
    
    // Find the appointment to verify it exists and get patientId and doctorId
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    
    // Create new triage questionnaire
    const newQuestionnaire = new TriageQuestionnaire({
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      questions,
      generatedFromReason,
      generatedFromNotes,
      answers: [] // Initially no answers
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