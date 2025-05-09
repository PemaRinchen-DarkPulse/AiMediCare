const express = require('express');
const triageController = require('../controllers/triageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new triage questionnaire
router.post('/', protect, triageController.createTriageQuestionnaire);

// Get triage questionnaire by appointment ID
router.get('/appointment/:appointmentId', protect, triageController.getTriageQuestionnaireByAppointment);

// Update triage questionnaire answers
router.put('/:questionnaireId/answers', protect, triageController.updateTriageAnswers);

// Get current user's pending questionnaires
router.get('/patient/pending', protect, triageController.getCurrentPatientPendingQuestionnaires);

// Get patient's pending questionnaires by ID
router.get('/patient/:patientId/pending', protect, triageController.getPatientPendingQuestionnaires);

module.exports = router;