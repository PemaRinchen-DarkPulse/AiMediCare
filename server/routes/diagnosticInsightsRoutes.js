const express = require('express');
const router = express.Router();
const {
  getDiagnosticInsights,
  triggerNewAnalysis,
  getAnalysisStatus,
  deleteInsights
} = require('../controllers/diagnosticInsightsController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

/**
 * GET /api/diagnostic-insights/:testResultId
 * Get AI insights for a specific test result
 * Returns cached insights if available, otherwise initiates new analysis
 */
router.get('/:testResultId', getDiagnosticInsights);

/**
 * POST /api/diagnostic-insights/:testResultId/analyze
 * Trigger new AI analysis for a test result (force refresh)
 * Body: { attachmentUrl?, testType?, findings? }
 */
router.post('/:testResultId/analyze', triggerNewAnalysis);

/**
 * GET /api/diagnostic-insights/:testResultId/status
 * Get the current analysis status for a test result
 */
router.get('/:testResultId/status', getAnalysisStatus);

/**
 * DELETE /api/diagnostic-insights/:testResultId
 * Delete AI insights for a test result
 */
router.delete('/:testResultId', deleteInsights);

module.exports = router;