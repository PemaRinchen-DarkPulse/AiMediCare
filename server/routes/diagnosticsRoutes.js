const express = require('express');
const {
  getDiagnosticRequests,
  createDiagnosticRequest,
  getTestResults,
  uploadTestResult,
  updateRequestStatus,
  getPatientDiagnosticRequests,
  getPatientTestResults,
  acceptDiagnosticRequest,
  declineDiagnosticRequest
} = require('../controllers/diagnosticsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Diagnostic request routes
router.route('/requests')
  .get(restrictTo('doctor', 'admin'), getDiagnosticRequests)
  .post(restrictTo('doctor'), createDiagnosticRequest);

router.route('/requests/:id')
  .patch(restrictTo('doctor'), updateRequestStatus);

// Test results routes
router.route('/results')
  .get(restrictTo('doctor', 'admin'), getTestResults)
  .post(restrictTo('doctor', 'admin'), uploadTestResult);

// Patient-specific routes
router.route('/patient/requests')
  .get(restrictTo('patient'), getPatientDiagnosticRequests);

router.route('/patient/results')
  .get(restrictTo('patient'), getPatientTestResults);

router.route('/patient/requests/:id/accept')
  .patch(restrictTo('patient'), acceptDiagnosticRequest);

router.route('/patient/requests/:id/decline')
  .patch(restrictTo('patient'), declineDiagnosticRequest);

module.exports = router;