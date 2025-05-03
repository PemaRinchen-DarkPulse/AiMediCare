const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');
// We'll need to create these models
const HealthRecord = require('../models/HealthRecord');
// Removed EmergencyContact import as it no longer exists
const Allergy = require('../models/Allergy');
const ChronicCondition = require('../models/ChronicCondition');
const Prescription = require('../models/Prescription'); // Changed from Medication to Prescription
const VitalRecord = require('../models/VitalRecord');
const Immunization = require('../models/Immunization');

// @desc    Get patient profile
// @route   GET /api/patient/profile
// @access  Private
const getPatientProfile = asyncHandler(async (req, res) => {
  // Find patient and populate with user data to get name, email, etc.
  const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email phoneNumber dateOfBirth gender');

  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  // Create a complete profile by combining user and patient data
  const profile = {
    name: req.user.name,
    dateOfBirth: req.user.dateOfBirth || null,
    gender: req.user.gender || '',
    bloodType: patient.bloodType || '',
    height: patient.height || '',
    weight: patient.weight || '',
    contactInfo: {
      email: req.user.email || '',
      phone: req.user.phoneNumber || ''
    }
  };

  res.status(200).json({
    success: true,
    data: profile
  });
});

// @desc    Get emergency contacts
// @route   GET /api/patient/emergency-contacts
// @access  Private
const getEmergencyContacts = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  // Return emergency contact directly from the patient model
  res.status(200).json({
    success: true,
    data: patient.emergencyContact ? [patient.emergencyContact] : []
  });
});

// @desc    Get medical history
// @route   GET /api/patient/medical-history
// @access  Private
const getMedicalHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const medicalHistory = await HealthRecord.find({ 
    patient: patient._id,
    recordType: 'diagnosis'
  }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: medicalHistory
  });
});

// @desc    Get allergies
// @route   GET /api/patient/allergies
// @access  Private
const getAllergies = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const allergies = await Allergy.find({ patient: patient._id });

  res.status(200).json({
    success: true,
    data: allergies
  });
});

// @desc    Get chronic conditions
// @route   GET /api/patient/chronic-conditions
// @access  Private
const getChronicConditions = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const chronicConditions = await ChronicCondition.find({ patient: patient._id });

  res.status(200).json({
    success: true,
    data: chronicConditions
  });
});

// @desc    Get medications
// @route   GET /api/patient/medications
// @access  Private
const getMedications = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  // Get active prescriptions for this patient
  const prescriptions = await Prescription.find({ 
    patientId: req.user._id,
    status: 'active'
  })
  .sort({ issuedDate: -1 })
  .populate('doctorId', 'name');

  // Format medications from prescriptions
  const medications = [];
  
  prescriptions.forEach(prescription => {
    prescription.medications.forEach(med => {
      medications.push({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        instructions: med.instructions,
        duration: med.duration,
        prescribedBy: prescription.doctorId ? prescription.doctorId.name : 'Unknown Doctor',
        prescriptionDate: prescription.issuedDate,
        status: prescription.status
      });
    });
  });

  res.status(200).json({
    success: true,
    data: medications
  });
});


// @desc    Get imaging reports
// @route   GET /api/patient/imaging-report
// @desc    Get vitals history
// @route   GET /api/patient/vitals-history
// @access  Private
const getVitalsHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  // Get all vitals records for this patient
  const vitalsData = await VitalRecord.find({ patient: patient._id }).sort({ date: -1 });

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

// @desc    Get immunizations
// @route   GET /api/patient/immunizations
// @access  Private
const getImmunizations = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  const immunizations = await Immunization.find({ patient: patient._id }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: immunizations
  });
});

// @desc    Add vital record
// @route   POST /api/patient/vitals
// @access  Private
const addVitalRecord = asyncHandler(async (req, res) => {
  const { vitalType, value, systolic, diastolic, unit, notes, date } = req.body;

  // Find patient ID associated with the logged-in user
  const patient = await Patient.findOne({ user: req.user._id });
  
  if (!patient) {
    res.status(404);
    throw new Error('Patient profile not found');
  }

  // Validate inputs based on vital type
  if (vitalType === 'bloodPressure') {
    if (!systolic || !diastolic) {
      res.status(400);
      throw new Error('Systolic and diastolic values are required for blood pressure');
    }
  } else if (!value) {
    res.status(400);
    throw new Error('Value is required for this vital type');
  }

  // Create vital record
  const vitalRecord = await VitalRecord.create({
    patient: patient._id,
    vitalType,
    value: value || null,
    systolic: systolic || null,
    diastolic: diastolic || null,
    unit: unit || '',
    notes: notes || '',
    date: date || new Date(),
    recordedBy: 'Patient'
  });

  res.status(201).json({
    success: true,
    data: vitalRecord
  });
});

module.exports = {
  getPatientProfile,
  getEmergencyContacts,
  getMedicalHistory,
  getAllergies,
  getChronicConditions,
  getMedications,
  getVitalsHistory,
  getImmunizations,
  addVitalRecord
};