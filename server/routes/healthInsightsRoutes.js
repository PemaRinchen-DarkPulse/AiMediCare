const express = require('express');
const router = express.Router();
const {
  getHealthInsights,
  regenerateHealthInsights,
  getInsightsHistory
} = require('../controllers/healthInsightsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Test route to check if AI endpoints are working
router.get('/test', async (req, res) => {
  try {
    console.log('Test route called by user:', req.user);
    
    let patientInfo = null;
    if (req.user.role === 'patient') {
      const Patient = require('../models/Patient');
      const patient = await Patient.findOne({ user: req.user._id });
      patientInfo = patient ? { id: patient._id, exists: true } : { exists: false };
    }

    res.json({
      success: true,
      message: 'AI Health Insights routes are working',
      authentication: {
        userId: req.user._id,
        userRole: req.user.role,
        userEmail: req.user.email
      },
      patientInfo
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({
      success: false,
      message: 'Test route failed',
      error: error.message
    });
  }
});

// GET /api/ai/health-insights - Get current health insights for authenticated patient
router.get('/health-insights', getHealthInsights);

// POST /api/ai/health-insights/regenerate - Force regenerate insights
router.post('/health-insights/regenerate', regenerateHealthInsights);

// GET /api/ai/health-insights/history - Get insights history
router.get('/health-insights/history', getInsightsHistory);

// Admin routes for managing insights across patients
router.get('/health-insights/:patientId', restrictTo('doctor', 'admin'), getHealthInsights);
router.post('/health-insights/:patientId/regenerate', restrictTo('doctor', 'admin'), regenerateHealthInsights);
router.get('/health-insights/:patientId/history', restrictTo('doctor', 'admin'), getInsightsHistory);

module.exports = router;