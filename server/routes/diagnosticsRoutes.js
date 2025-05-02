const express = require('express');
const multer = require('multer');
const path = require('path');
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in the 'uploads/diagnostics' directory
    cb(null, 'uploads/diagnostics');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `diagnostic-${uniqueSuffix}${ext}`);
  }
});

// Initialize the upload middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: function(req, file, cb) {
    // Accept images, PDFs, and documents
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv|txt/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports the following filetypes: ' + filetypes));
  }
});

// Apply authentication middleware to all routes
router.use(protect);

// Diagnostic request routes
router.route('/requests')
  .get(restrictTo('doctor', 'admin'), getDiagnosticRequests)
  .post(restrictTo('doctor'), createDiagnosticRequest);

router.route('/requests/:id')
  .patch(restrictTo('doctor'), updateRequestStatus);

// Test results routes with file upload middleware for POST requests
router.route('/results')
  .get(restrictTo('doctor', 'admin'), getTestResults)
  .post(restrictTo('doctor', 'admin'), upload.single('attachmentFile'), uploadTestResult);

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