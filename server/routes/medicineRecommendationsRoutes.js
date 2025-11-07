const express = require('express');
const router = express.Router();
const { 
  generateMedicationRecommendations,
  validateMedicationRecommendation,
  getPatientMedicationHistory
} = require('../controllers/medicineRecommendationsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Only doctors can access these routes
router.use(restrictTo('doctor'));

// Generate AI-powered medication recommendations
router.post('/generate', generateMedicationRecommendations);

// Validate a medication recommendation against patient data
router.post('/validate', validateMedicationRecommendation);

// Get patient medication history
router.get('/history/:patientId', getPatientMedicationHistory);

module.exports = router;