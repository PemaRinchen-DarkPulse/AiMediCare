const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const EmergencyContact = require('../models/EmergencyContact');
const Allergy = require('../models/Allergy');
const ChronicCondition = require('../models/ChronicCondition');
const Medication = require('../models/Medication');
const LabResult = require('../models/LabResult');
const ImagingReport = require('../models/ImagingReport');
const VitalRecord = require('../models/VitalRecord');
const Immunization = require('../models/Immunization');
const TreatmentPlan = require('../models/TreatmentPlan');

// @desc    Get all patients (with filters)
// @route   GET /api/doctor/patients
// @access  Private/Doctor
const getPatients = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Create search filter
  const searchFilter = {};
  if (search) {
    // Get user IDs with matching names
    const users = await User.find({
      role: 'patient',
      name: { $regex: search, $options: 'i' }
    }).select('_id');
    
    const userIds = users.map(user => user._id);
    
    // Add to search filter
    searchFilter.$or = [
      { user: { $in: userIds } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get patients
  const patients = await Patient.find(searchFilter)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('user', 'name email phoneNumber profileImage');

  // Get total count for pagination
  const totalPatients = await Patient.countDocuments(searchFilter);

  res.status(200).json({
    success: true,
    data: patients,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(totalPatients / parseInt(limit)),
    totalResults: totalPatients
  });
});

// @desc    Get patient by ID
// @route   GET /api/doctor/patients/:patientId
// @access  Private/Doctor
const getPatientById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  // Get patient with user details
  const patient = await Patient.findById(patientId)
    .populate('user', 'name email phoneNumber profileImage');

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  res.status(200).json({
    success: true,
    data: patient
  });
});

// @desc    Add new patient
// @route   POST /api/doctor/patients
// @access  Private/Doctor
const addPatient = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    bloodType,
    height,
    weight,
    emergencyContact,
    insurance,
    medicalHistory,
    allergies
  } = req.body;

  // First, check if user already exists
  let user = await User.findOne({ email });

  // Create a new user if doesn't exist
  if (!user) {
    const randomPassword = Math.random().toString(36).slice(-8);
    
    user = await User.create({
      name,
      email,
      phoneNumber,
      password: randomPassword, // Would be changed by user later
      role: 'patient'
    });
  } else if (user.role !== 'patient') {
    res.status(400);
    throw new Error('Email already used by a non-patient account');
  }

  // Create patient profile
  const patient = await Patient.create({
    user: user._id,
    bloodType,
    height,
    weight,
    emergencyContact,
    insurance,
    medicalHistory: medicalHistory || [],
    allergies: allergies || []
  });

  res.status(201).json({
    success: true,
    data: patient
  });
});

// @desc    Update patient details
// @route   PUT /api/doctor/patients/:patientId
// @access  Private/Doctor
const updatePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Update patient
  const updatedPatient = await Patient.findByIdAndUpdate(
    patientId,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name email phoneNumber profileImage');

  res.status(200).json({
    success: true,
    data: updatedPatient
  });
});

// @desc    Delete patient
// @route   DELETE /api/doctor/patients/:patientId
// @access  Private/Doctor
const deletePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Delete patient (consider soft delete in production)
  await Patient.findByIdAndDelete(patientId);
  
  // Note: You might want to delete or anonymize the User as well
  // but that's left out for this implementation

  res.status(200).json({
    success: true,
    message: 'Patient deleted successfully'
  });
});

// @desc    Get patient vitals
// @route   GET /api/doctor/patients/:patientId/vitals
// @access  Private/Doctor
const getPatientVitals = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Get all vitals records for this patient
  const vitalsData = await VitalRecord.find({ patient: patientId }).sort({ date: -1 });

  // Organize by vital type
  const bloodPressure = vitalsData
    .filter(record => record.vitalType === 'bloodPressure')
    .map(record => ({
      date: record.date,
      value: record.systolic,
      secondaryValue: record.diastolic
    }));
  
  const bloodSugar = vitalsData
    .filter(record => record.vitalType === 'bloodSugar')
    .map(record => ({
      date: record.date,
      value: record.value
    }));

  const heartRate = vitalsData
    .filter(record => record.vitalType === 'heartRate')
    .map(record => ({
      date: record.date,
      value: record.value
    }));

  const weight = vitalsData
    .filter(record => record.vitalType === 'weight')
    .map(record => ({
      date: record.date,
      value: record.value
    }));
  
  const cholesterol = vitalsData
    .filter(record => record.vitalType === 'cholesterol')
    .map(record => ({
      date: record.date,
      value: record.value
    }));

  res.status(200).json({
    success: true,
    data: {
      bloodPressure,
      bloodSugar,
      heartRate,
      weight,
      cholesterol
    }
  });
});

// @desc    Add patient vital record
// @route   POST /api/doctor/patients/:patientId/vitals
// @access  Private/Doctor
const addPatientVital = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { vitalType, value, systolic, diastolic, notes, date } = req.body;

  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Create vital record
  const vitalRecord = await VitalRecord.create({
    patient: patientId,
    vitalType,
    value,
    systolic,
    diastolic,
    notes,
    date: date || Date.now()
  });

  res.status(201).json({
    success: true,
    data: vitalRecord
  });
});

// @desc    Get patient allergies
// @route   GET /api/doctor/patients/:patientId/allergies
// @access  Private/Doctor
const getPatientAllergies = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Get allergies
  const allergies = await Allergy.find({ patient: patientId });

  res.status(200).json({
    success: true,
    data: allergies
  });
});

// @desc    Add patient allergy
// @route   POST /api/doctor/patients/:patientId/allergies
// @access  Private/Doctor
const addPatientAllergy = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { allergen, reaction, severity, notes } = req.body;

  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Create allergy record
  const allergy = await Allergy.create({
    patient: patientId,
    allergen,
    reaction,
    severity,
    notes
  });

  res.status(201).json({
    success: true,
    data: allergy
  });
});

// @desc    Get patient medical history
// @route   GET /api/doctor/patients/:patientId/medical-history
// @access  Private/Doctor
const getPatientMedicalHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Get medical history
  const medicalHistory = await HealthRecord.find({ 
    patient: patientId,
    recordType: 'diagnosis'
  }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: medicalHistory
  });
});

// @desc    Add patient medical history record
// @route   POST /api/doctor/patients/:patientId/medical-history
// @access  Private/Doctor
const addPatientMedicalHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { diagnosis, provider, status, notes, date } = req.body;

  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Create medical history record
  const medicalRecord = await HealthRecord.create({
    patient: patientId,
    recordType: 'diagnosis',
    diagnosis,
    provider,
    status,
    notes,
    date: date || Date.now()
  });

  res.status(201).json({
    success: true,
    data: medicalRecord
  });
});

// @desc    Get patient chronic conditions
// @route   GET /api/doctor/patients/:patientId/chronic-conditions
// @access  Private/Doctor
const getPatientChronicConditions = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Get chronic conditions
  const chronicConditions = await ChronicCondition.find({ patient: patientId }).sort({ diagnosisDate: -1 });

  res.status(200).json({
    success: true,
    data: chronicConditions
  });
});

// @desc    Add patient chronic condition
// @route   POST /api/doctor/patients/:patientId/chronic-conditions
// @access  Private/Doctor
const addPatientChronicCondition = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { condition, diagnosisDate, severity, notes, managementPlan } = req.body;

  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Create chronic condition record
  const chronicCondition = await ChronicCondition.create({
    patient: patientId,
    condition,
    diagnosisDate: diagnosisDate || Date.now(),
    severity,
    notes,
    managementPlan
  });

  res.status(201).json({
    success: true,
    data: chronicCondition
  });
});

// @desc    Get patient immunizations
// @route   GET /api/doctor/patients/:patientId/immunizations
// @access  Private/Doctor
const getPatientImmunizations = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  
  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Get immunizations
  const immunizations = await Immunization.find({ patient: patientId }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: immunizations
  });
});

// @desc    Add patient immunization
// @route   POST /api/doctor/patients/:patientId/immunizations
// @access  Private/Doctor
const addPatientImmunization = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { vaccine, date, administrator, batchNumber, nextDoseDate, notes } = req.body;

  // Find patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Create immunization record
  const immunization = await Immunization.create({
    patient: patientId,
    vaccine,
    date: date || Date.now(),
    administrator,
    batchNumber,
    nextDoseDate,
    notes
  });

  res.status(201).json({
    success: true,
    data: immunization
  });
});

module.exports = {
  getPatients,
  getPatientById,
  addPatient,
  updatePatient,
  deletePatient,
  getPatientVitals,
  addPatientVital,
  getPatientAllergies,
  addPatientAllergy,
  getPatientMedicalHistory,
  addPatientMedicalHistory,
  getPatientChronicConditions,
  addPatientChronicCondition,
  getPatientImmunizations,
  addPatientImmunization
};