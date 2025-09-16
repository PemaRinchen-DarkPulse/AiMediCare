const express = require('express');
const previsitTriageController = require('../controllers/previsitTriageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// NEW: Questionnaire endpoints
router.post('/questionnaire/generate/:appointmentId', protect, previsitTriageController.generateQuestionnaire);
router.post('/questionnaire/:triageId/regenerate', protect, previsitTriageController.regenerateQuestionnaire);
router.post('/questionnaire/:triageId/submit', protect, previsitTriageController.submitQuestionnaireAnswers);
router.get('/questionnaire/completed', protect, previsitTriageController.getCompletedQuestionnaires);

// Get triage data for a specific appointment
router.get('/appointment/:appointmentId', protect, previsitTriageController.getTriageByAppointment);

// Get all triage data for a patient
router.get('/patient', protect, previsitTriageController.getPatientTriageData);

// Get all triage data for a doctor
router.get('/doctor', protect, previsitTriageController.getDoctorTriageData);

// Get urgent triage cases
router.get('/urgent', protect, previsitTriageController.getUrgentTriageData);

// Manually trigger triage generation for an appointment
router.post('/generate/:appointmentId', protect, previsitTriageController.generateTriageManually);

// Update triage data (for manual review/editing)
router.put('/:triageId', protect, previsitTriageController.updateTriage);

// Mark triage as reviewed by doctor
router.post('/:triageId/review', protect, previsitTriageController.markTriageAsReviewed);

// Get AI service health status
router.get('/ai/health', protect, previsitTriageController.getAIServiceHealth);

// Get triage statistics for dashboard
router.get('/stats', protect, previsitTriageController.getTriageStatistics);

module.exports = router;