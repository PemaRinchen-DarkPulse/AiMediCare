const asyncHandler = require('express-async-handler');
const DiagnosticTest = require('../models/DiagnosticTest');
const Patient = require('../models/Patient');
const User = require('../models/User');

// @desc    Get all diagnostic requests
// @route   GET /api/diagnostics/requests
// @access  Private/Doctor
const getDiagnosticRequests = asyncHandler(async (req, res) => {
  // Filter by doctor if needed
  const filter = {};
  
  if (req.user.role === 'doctor') {
    filter.requestedBy = req.user._id;
  }

  const requests = await DiagnosticTest.find(filter)
    .populate('patient', '_id')
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('requestedBy', 'name')
    .sort({ createdAt: -1 });

  // Format the response
  const formattedRequests = requests.map(request => ({
    id: request._id,
    patientId: request.patient?._id || null,
    patientName: request.patient?.user?.email || 'Unknown Patient',
    testType: request.testType,
    priority: request.priority,
    requestDate: request.requestDate,
    requestedBy: request.requestedBy?.name || 'Unknown Doctor',
    status: request.status,
    notes: request.notes,
    createdAt: request.createdAt
  }));

  res.status(200).json({
    success: true,
    data: formattedRequests
  });
});

// @desc    Create new diagnostic request
// @route   POST /api/diagnostics/requests
// @access  Private/Doctor
const createDiagnosticRequest = asyncHandler(async (req, res) => {
  const { patientId, testType, priority, requestDate, notes } = req.body;

  // Validate patient exists
  const patient = await Patient.findById(patientId);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Create the diagnostic request
  const diagnosticRequest = await DiagnosticTest.create({
    patient: patientId,
    testType,
    priority,
    requestDate: requestDate || Date.now(),
    status: 'pending',
    requestedBy: req.user._id,
    notes
  });

  // Get formatted response
  const formattedRequest = {
    id: diagnosticRequest._id,
    patientId: diagnosticRequest.patient,
    testType: diagnosticRequest.testType,
    priority: diagnosticRequest.priority,
    requestDate: diagnosticRequest.requestDate,
    status: diagnosticRequest.status,
    requestedBy: req.user.name,
    notes: diagnosticRequest.notes,
    createdAt: diagnosticRequest.createdAt
  };

  // Get patient details for response
  const patientUser = await User.findById(patient.user);
  if (patientUser) {
    formattedRequest.patientName = patientUser.email;
  }

  res.status(201).json({
    success: true,
    data: formattedRequest
  });
});

// @desc    Get test results
// @route   GET /api/diagnostics/results
// @access  Private/Doctor
const getTestResults = asyncHandler(async (req, res) => {
  // Filter by doctor if needed
  const filter = { hasResults: true };
  
  if (req.user.role === 'doctor') {
    filter.requestedBy = req.user._id;
  }

  const testsWithResults = await DiagnosticTest.find(filter)
    .populate('patient', '_id')
    .populate({
      path: 'patient',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('requestedBy', 'name')
    .sort({ resultDate: -1 });

  // Format the response
  const formattedResults = testsWithResults.map(test => ({
    id: test._id,
    requestId: test._id,
    patientId: test.patient?._id || null,
    patientName: test.patient?.user?.email || 'Unknown Patient',
    testType: test.testType,
    resultDate: test.resultDate || test.updatedAt,
    findings: test.findings || '',
    interpretation: test.interpretation || '',
    technician: test.technician || '',
    attachmentUrl: test.attachmentUrl || null,
    notes: test.resultNotes || ''
  }));

  res.status(200).json({
    success: true,
    data: formattedResults
  });
});

// @desc    Upload test result
// @route   POST /api/diagnostics/results
// @access  Private/Doctor,Lab
const uploadTestResult = asyncHandler(async (req, res) => {
  const { 
    requestId, 
    resultDate, 
    findings, 
    interpretation, 
    technician, 
    notes 
  } = req.body;

  // Check if request exists
  const diagnosticTest = await DiagnosticTest.findById(requestId);
  if (!diagnosticTest) {
    res.status(404);
    throw new Error('Diagnostic test request not found');
  }

  // Update test with results
  diagnosticTest.hasResults = true;
  diagnosticTest.status = 'completed';
  diagnosticTest.resultDate = resultDate || Date.now();
  diagnosticTest.findings = findings;
  diagnosticTest.interpretation = interpretation;
  diagnosticTest.technician = technician;
  diagnosticTest.resultNotes = notes;

  // Save attachment URL if provided
  if (req.file) {
    diagnosticTest.attachmentUrl = req.file.path;
  }

  await diagnosticTest.save();

  // Format the response
  const formattedResult = {
    id: `${diagnosticTest._id}-result`,
    requestId: diagnosticTest._id,
    resultDate: diagnosticTest.resultDate,
    findings: diagnosticTest.findings,
    interpretation: diagnosticTest.interpretation,
    technician: diagnosticTest.technician,
    attachmentUrl: diagnosticTest.attachmentUrl,
    notes: diagnosticTest.resultNotes
  };

  res.status(200).json({
    success: true,
    data: formattedResult
  });
});

// @desc    Update diagnostic request status
// @route   PATCH /api/diagnostics/requests/:id
// @access  Private/Doctor
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const diagnosticTest = await DiagnosticTest.findById(id);

  if (!diagnosticTest) {
    res.status(404);
    throw new Error('Diagnostic test request not found');
  }

  diagnosticTest.status = status;
  await diagnosticTest.save();

  res.status(200).json({
    success: true,
    data: {
      id: diagnosticTest._id,
      status: diagnosticTest.status
    }
  });
});

// @desc    Get patient's diagnostic requests
// @route   GET /api/diagnostics/patient/requests
// @access  Private/Patient
const getPatientDiagnosticRequests = asyncHandler(async (req, res) => {
  // Find patient ID associated with the logged-in user
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }
  
  // Find all diagnostic tests for this patient
  const requests = await DiagnosticTest.find({ patient: patient._id })
    .populate('requestedBy', 'name')
    .sort({ requestDate: -1 });
    
  // Format the response
  const formattedRequests = requests.map(request => ({
    id: request._id,
    testType: request.testType,
    priority: request.priority,
    requestDate: request.requestDate,
    requestedBy: request.requestedBy?.name || 'Unknown Doctor',
    status: request.status,
    notes: request.notes,
    createdAt: request.createdAt,
    hasResults: request.hasResults || false
  }));
  
  res.status(200).json({
    success: true,
    data: formattedRequests
  });
});

// @desc    Get patient's test results
// @route   GET /api/diagnostics/patient/results
// @access  Private/Patient
const getPatientTestResults = asyncHandler(async (req, res) => {
  // Find patient ID associated with the logged-in user
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }
  
  // Find all completed diagnostic tests with results for this patient
  const testsWithResults = await DiagnosticTest.find({ 
    patient: patient._id,
    hasResults: true
  })
    .populate('requestedBy', 'name')
    .sort({ resultDate: -1 });
    
  // Format the response
  const formattedResults = testsWithResults.map(test => ({
    id: test._id,
    requestId: test._id,
    testType: test.testType,
    resultDate: test.resultDate || test.updatedAt,
    requestDate: test.requestDate,
    requestedBy: test.requestedBy?.name || 'Unknown Doctor',
    findings: test.findings || '',
    interpretation: test.interpretation || '',
    technician: test.technician || '',
    attachmentUrl: test.attachmentUrl || null,
    notes: test.resultNotes || '',
    status: test.status
  }));
  
  res.status(200).json({
    success: true,
    data: formattedResults
  });
});

// @desc    Accept diagnostic request
// @route   PATCH /api/diagnostics/patient/requests/:id/accept
// @access  Private/Patient
const acceptDiagnosticRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find patient ID associated with the logged-in user
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }
  
  // Find the diagnostic test
  const diagnosticTest = await DiagnosticTest.findById(id);
  
  if (!diagnosticTest) {
    res.status(404);
    throw new Error('Diagnostic test request not found');
  }
  
  // Verify this test belongs to the patient
  if (diagnosticTest.patient.toString() !== patient._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to accept this diagnostic test request');
  }
  
  // Update the status
  diagnosticTest.status = 'accepted by patient';
  await diagnosticTest.save();
  
  res.status(200).json({
    success: true,
    data: {
      id: diagnosticTest._id,
      status: diagnosticTest.status
    }
  });
});

// @desc    Decline diagnostic request
// @route   PATCH /api/diagnostics/patient/requests/:id/decline
// @access  Private/Patient
const declineDiagnosticRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find patient ID associated with the logged-in user
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }
  
  // Find the diagnostic test
  const diagnosticTest = await DiagnosticTest.findById(id);
  
  if (!diagnosticTest) {
    res.status(404);
    throw new Error('Diagnostic test request not found');
  }
  
  // Verify this test belongs to the patient
  if (diagnosticTest.patient.toString() !== patient._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to decline this diagnostic test request');
  }
  
  // Update the status
  diagnosticTest.status = 'declined by patient';
  await diagnosticTest.save();
  
  res.status(200).json({
    success: true,
    data: {
      id: diagnosticTest._id,
      status: diagnosticTest.status
    }
  });
});

module.exports = {
  getDiagnosticRequests,
  createDiagnosticRequest,
  getTestResults,
  uploadTestResult,
  updateRequestStatus,
  getPatientDiagnosticRequests,
  getPatientTestResults,
  acceptDiagnosticRequest,
  declineDiagnosticRequest
};