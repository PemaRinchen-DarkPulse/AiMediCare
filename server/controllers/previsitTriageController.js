const PrevisitTriage = require('../models/PrevisitTriage');
const Appointment = require('../models/Appointment');
const aiServiceClient = require('../utils/aiServiceClient');

// Generate pre-visit questionnaire for an appointment
exports.generateQuestionnaire = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    
    // Check if user has access
    const hasAccess = userRole === 'admin' || 
                     userRole === 'doctor' && appointment.doctorId.toString() === userId.toString() ||
                     userRole === 'patient' && appointment.patientId.toString() === userId.toString();
    
    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    // Check if questionnaire already exists
    let questionnaire = await PrevisitTriage.findOne({ appointmentId });
    
    if (questionnaire && questionnaire.questions && questionnaire.questions.length > 0) {
      // Return existing questionnaire
      return res.status(200).json({
        status: 'success',
        message: 'Questionnaire already exists',
        data: {
          questionnaire
        }
      });
    }
    
    // Generate new questionnaire using AI service
    const aiResult = await aiServiceClient.generateQuestionnaire(
      appointment.reason, 
      appointment.notes
    );
    
    if (questionnaire) {
      // Update existing record with questionnaire data
      await questionnaire.updateQuestionnaireData(aiResult.questionnaire);
    } else {
      // Create new questionnaire
      questionnaire = new PrevisitTriage({
        appointmentId,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        reasonForVisit: appointment.reason,
        additionalNotes: appointment.notes || '',
        status: 'generated'
      });
      
      await questionnaire.save();
      await questionnaire.updateQuestionnaireData(aiResult.questionnaire);
    }
    
    // Reload questionnaire with populated data
    const updatedQuestionnaire = await PrevisitTriage.findById(questionnaire._id)
      .populate('appointmentId patientId doctorId');
    
    res.status(200).json({
      status: 'success',
      message: 'Questionnaire generated successfully',
      data: {
        questionnaire: updatedQuestionnaire
      }
    });
    
  } catch (error) {
    console.error('Error generating questionnaire:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate questionnaire'
    });
  }
};

// Regenerate questions for an existing questionnaire with empty questions
exports.regenerateQuestionnaire = async (req, res) => {
  try {
    const { triageId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Find the existing questionnaire
    const questionnaire = await PrevisitTriage.findById(triageId)
      .populate('appointmentId', 'reason notes')
      .populate('patientId', 'name')
      .populate('doctorId', 'name');
      
    if (!questionnaire) {
      return res.status(404).json({
        status: 'error',
        message: 'Questionnaire not found'
      });
    }
    
    // Check if user has access
    const hasAccess = userRole === 'admin' || 
                     userRole === 'doctor' && questionnaire.doctorId._id.toString() === userId.toString() ||
                     userRole === 'patient' && questionnaire.patientId._id.toString() === userId.toString();
    
    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    // Use the appointment reason and notes for regeneration
    const reasonForVisit = questionnaire.appointmentId.reason || questionnaire.reasonForVisit;
    const additionalNotes = questionnaire.appointmentId.notes || questionnaire.additionalNotes;
    
    console.log('Regenerating questionnaire for:', reasonForVisit);
    
    // Generate new questionnaire using AI service
    const aiResult = await aiServiceClient.generateQuestionnaire(
      reasonForVisit, 
      additionalNotes
    );
    
    // Update the questionnaire with new questions
    await questionnaire.updateQuestionnaireData(aiResult.questionnaire);
    
    // Reload questionnaire with updated data
    const updatedQuestionnaire = await PrevisitTriage.findById(questionnaire._id)
      .populate('appointmentId patientId doctorId');
    
    res.status(200).json({
      status: 'success',
      message: 'Questionnaire regenerated successfully',
      data: {
        questionnaire: updatedQuestionnaire,
        isAIGenerated: aiResult.isAIGenerated,
        warning: aiResult.warning
      }
    });
    
  } catch (error) {
    console.error('Error regenerating questionnaire:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to regenerate questionnaire'
    });
  }
};

// Submit patient answers to questionnaire
exports.submitQuestionnaireAnswers = async (req, res) => {
  try {
    const { triageId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Find the questionnaire
    const questionnaire = await PrevisitTriage.findById(triageId);
    if (!questionnaire) {
      return res.status(404).json({
        status: 'error',
        message: 'Questionnaire not found'
      });
    }
    
    // Check if user has access (only the patient or admin can submit answers)
    const hasAccess = userRole === 'admin' || 
                     (userRole === 'patient' && questionnaire.patientId.toString() === userId.toString());
    
    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    // Validate and save answers
    const errors = [];
    
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        status: 'error',
        message: 'Answers must be an array'
      });
    }
    
    // Process each answer
    for (const answer of answers) {
      if (!answer.questionId || answer.answer === undefined) {
        errors.push(`Invalid answer format for question ${answer.questionId}`);
        continue;
      }
      
      // Find the question to validate the answer
      const question = questionnaire.questions.find(q => q.id === answer.questionId);
      if (!question) {
        errors.push(`Question ${answer.questionId} not found`);
        continue;
      }
      
      // Validate answer based on question type
      if (question.type === 'multiple_choice' && question.options) {
        if (!question.options.includes(answer.answer)) {
          errors.push(`Invalid option for question ${answer.questionId}`);
          continue;
        }
      }
      
      if (question.type === 'yes_no') {
        if (![true, false, 'yes', 'no', 'Yes', 'No'].includes(answer.answer)) {
          errors.push(`Invalid yes/no answer for question ${answer.questionId}`);
          continue;
        }
      }
      
      if (question.type === 'scale') {
        const numAnswer = Number(answer.answer);
        if (isNaN(numAnswer) || numAnswer < 1 || numAnswer > 10) {
          errors.push(`Scale answer must be between 1-10 for question ${answer.questionId}`);
          continue;
        }
      }
      
      // Save the answer
      await questionnaire.addAnswer(answer.questionId, answer.answer);
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation errors',
        errors
      });
    }
    
    // Update status
    questionnaire.status = 'in_progress';
    if (questionnaire.isCompleted) {
      questionnaire.status = 'completed';
    }
    await questionnaire.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Answers submitted successfully',
      data: {
        questionnaire,
        completionPercentage: questionnaire.completionPercentage,
        isCompleted: questionnaire.isCompleted
      }
    });
    
  } catch (error) {
    console.error('Error submitting questionnaire answers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit answers'
    });
  }
};

// Get completed questionnaires for doctor review
exports.getCompletedQuestionnaires = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    
    // Only doctors and admins can access completed questionnaires
    if (userRole !== 'doctor' && userRole !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    // If doctor, only show their completed questionnaires
    const doctorId = userRole === 'doctor' ? userId : null;
    
    const completedQuestionnaires = await PrevisitTriage.findCompletedQuestionnaires(doctorId);
    
    res.status(200).json({
      status: 'success',
      data: {
        questionnaires: completedQuestionnaires,
        count: completedQuestionnaires.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching completed questionnaires:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch completed questionnaires'
    });
  }
};

// Get triage data for a specific appointment
exports.getTriageByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Find the appointment first to verify access
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    
    // Check if user has access to this appointment
    const hasAccess = userRole === 'admin' || 
                     appointment.patientId.toString() === userId.toString() ||
                     appointment.doctorId.toString() === userId.toString();
    
    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    // Get triage data
    const triage = await PrevisitTriage.findByAppointment(appointmentId);
    
    if (!triage) {
      return res.status(404).json({
        status: 'error',
        message: 'No triage data found for this appointment'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        triage
      }
    });
    
  } catch (error) {
    console.error('Error fetching triage by appointment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch triage data'
    });
  }
};

// Get all triage data for a patient
exports.getPatientTriageData = async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user._id : req.query.patientId;
    
    console.log('🔍 Debug - Request user:', {
      id: req.user._id,
      role: req.user.role,
      email: req.user.email
    });
    console.log('🔍 Debug - Patient ID:', patientId);
    
    if (!patientId) {
      console.log('❌ No patient ID provided');
      return res.status(400).json({
        status: 'error',
        message: 'Patient ID is required'
      });
    }
    
    // Check access permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== patientId.toString()) {
      console.log('❌ Access denied for user:', req.user._id, 'requesting patient:', patientId);
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    console.log('📊 Querying PrevisitTriage collection for patient:', patientId);
    const triageData = await PrevisitTriage.find({ patientId })
      .populate('appointmentId', 'date time type status')
      .populate('doctorId', 'name specialty')
      .sort({ createdAt: -1 });
    
    console.log('🔍 Found triage records:', triageData.length);
    console.log('🔍 Sample data:', triageData.length > 0 ? {
      id: triageData[0]._id,
      title: triageData[0].title,
      isCompleted: triageData[0].isCompleted,
      questionsCount: triageData[0].questions?.length || 0
    } : 'No records');
    
    res.status(200).json({
      status: 'success',
      data: {
        triageData,
        count: triageData.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching patient triage data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch triage data',
      error: error.message
    });
  }
};

// Get all triage data for a doctor
exports.getDoctorTriageData = async (req, res) => {
  try {
    const doctorId = req.user.role === 'doctor' ? req.user._id : req.query.doctorId;
    
    if (!doctorId) {
      return res.status(400).json({
        status: 'error',
        message: 'Doctor ID is required'
      });
    }
    
    // Check access permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== doctorId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    const triageData = await PrevisitTriage.find({ doctorId })
      .populate('appointmentId', 'date time type status')
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        triageData,
        count: triageData.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching doctor triage data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch triage data'
    });
  }
};

// Get urgent triage cases
exports.getUrgentTriageData = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    
    // Only doctors and admins can access urgent cases
    if (userRole !== 'doctor' && userRole !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    // If doctor, only show their urgent cases
    const doctorId = userRole === 'doctor' ? userId : null;
    
    const urgentCases = await PrevisitTriage.findUrgentCases(doctorId);
    
    res.status(200).json({
      status: 'success',
      data: {
        urgentCases,
        count: urgentCases.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching urgent triage data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch urgent triage data'
    });
  }
};

// Manually trigger triage generation for an appointment
exports.generateTriageManually = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    
    // Check if user has access
    const hasAccess = userRole === 'admin' || 
                     userRole === 'doctor' && appointment.doctorId.toString() === userId.toString();
    
    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    // Check if triage already exists
    let triage = await PrevisitTriage.findOne({ appointmentId });
    
    if (triage) {
      // Regenerate triage data
      const aiResult = await aiServiceClient.generateTriageSummary(
        appointment.reason, 
        appointment.notes
      );
      
      if (aiResult.success) {
        await triage.updateTriageData(aiResult.data);
        
        if (aiResult.warning) {
          await triage.addError(aiResult.warning, 'Manual Regeneration Warning');
        }
      } else {
        await triage.addError(aiResult.error || 'AI service failed', 'Manual Regeneration Failed');
      }
      
    } else {
      // Create new triage
      triage = new PrevisitTriage({
        appointmentId,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        reasonForVisit: appointment.reason,
        additionalNotes: appointment.notes || '',
        status: 'pending'
      });
      
      await triage.save();
      
      // Generate AI summary
      const aiResult = await aiServiceClient.generateTriageSummary(
        appointment.reason, 
        appointment.notes
      );
      
      if (aiResult.success) {
        await triage.updateTriageData(aiResult.data);
        
        if (aiResult.warning) {
          await triage.addError(aiResult.warning, 'Manual Generation Warning');
        }
      } else {
        await triage.addError(aiResult.error || 'AI service failed', 'Manual Generation Failed');
      }
    }
    
    // Reload triage with populated data
    const updatedTriage = await PrevisitTriage.findById(triage._id)
      .populate('appointmentId patientId doctorId');
    
    res.status(200).json({
      status: 'success',
      message: 'Triage generated successfully',
      data: {
        triage: updatedTriage
      }
    });
    
  } catch (error) {
    console.error('Error generating triage manually:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate triage'
    });
  }
};

// Update triage data (for manual review/editing)
exports.updateTriage = async (req, res) => {
  try {
    const { triageId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const updates = req.body;
    
    // Find the triage
    const triage = await PrevisitTriage.findById(triageId);
    if (!triage) {
      return res.status(404).json({
        status: 'error',
        message: 'Triage not found'
      });
    }
    
    // Check if user has access (only doctors and admins can update)
    const hasAccess = userRole === 'admin' || 
                     (userRole === 'doctor' && triage.doctorId.toString() === userId.toString());
    
    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    // Update allowed fields
    const allowedUpdates = [
      'medicalCategory', 'urgencyLevel', 'keySymptoms', 'suggestedSpecialty',
      'requiresImmediateAttention', 'preparationNotes', 'patientInstructions',
      'estimatedDuration', 'recommendedTests', 'riskFactors'
    ];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        triage[field] = updates[field];
      }
    });
    
    // Mark as manually updated
    triage.generatedAt = 'Manual';
    triage.version += 1;
    
    await triage.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Triage updated successfully',
      data: {
        triage
      }
    });
    
  } catch (error) {
    console.error('Error updating triage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update triage'
    });
  }
};

// Mark triage as reviewed by doctor
exports.markTriageAsReviewed = async (req, res) => {
  try {
    const { triageId } = req.params;
    const { notes } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Only doctors can mark triage as reviewed
    if (userRole !== 'doctor') {
      return res.status(403).json({
        status: 'error',
        message: 'Only doctors can review triage data'
      });
    }
    
    const triage = await PrevisitTriage.findById(triageId);
    if (!triage) {
      return res.status(404).json({
        status: 'error',
        message: 'Triage not found'
      });
    }
    
    // Check if this is the assigned doctor
    if (triage.doctorId.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }
    
    await triage.markAsReviewed(userId, notes);
    
    res.status(200).json({
      status: 'success',
      message: 'Triage marked as reviewed',
      data: {
        triage
      }
    });
    
  } catch (error) {
    console.error('Error marking triage as reviewed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark triage as reviewed'
    });
  }
};

// Get AI service health status
exports.getAIServiceHealth = async (req, res) => {
  try {
    const healthResult = await aiServiceClient.healthCheck();
    
    res.status(200).json({
      status: 'success',
      data: healthResult
    });
    
  } catch (error) {
    console.error('Error checking AI service health:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check AI service health'
    });
  }
};

// Get triage statistics for dashboard
exports.getTriageStatistics = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    
    let matchQuery = {};
    
    // Filter based on user role
    if (userRole === 'doctor') {
      matchQuery.doctorId = userId;
    } else if (userRole === 'patient') {
      matchQuery.patientId = userId;
    }
    // Admin can see all statistics
    
    const stats = await PrevisitTriage.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalTriage: { $sum: 1 },
          urgentCases: {
            $sum: { $cond: [{ $gte: ['$urgencyLevel', 4] }, 1, 0] }
          },
          aiGenerated: {
            $sum: { $cond: [{ $eq: ['$generatedAt', 'AI-Generated'] }, 1, 0] }
          },
          fallbackGenerated: {
            $sum: { $cond: [{ $eq: ['$generatedAt', 'Fallback-Generated'] }, 1, 0] }
          },
          pendingReview: {
            $sum: { $cond: [{ $eq: ['$status', 'generated'] }, 1, 0] }
          },
          reviewed: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
          },
          averageUrgency: { $avg: '$urgencyLevel' },
          averageConfidence: { $avg: '$aiConfidence' }
        }
      }
    ]);
    
    const result = stats.length > 0 ? stats[0] : {
      totalTriage: 0,
      urgentCases: 0,
      aiGenerated: 0,
      fallbackGenerated: 0,
      pendingReview: 0,
      reviewed: 0,
      averageUrgency: 0,
      averageConfidence: 0
    };
    
    res.status(200).json({
      status: 'success',
      data: result
    });
    
  } catch (error) {
    console.error('Error fetching triage statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics'
    });
  }
};